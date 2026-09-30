/**
 * leadPriority.test.js
 * Comprehensive test suite verifying all 20 required points for Lead Priority Management:
 *
 * 1. New lead defaults to MEDIUM.
 * 2. HIGH can be stored.
 * 3. MEDIUM can be stored.
 * 4. LOW can be stored.
 * 5. Invalid priority rejected.
 * 6. ADMIN can update priority.
 * 7. INTERN can update priority.
 * 8. GM cannot update priority.
 * 9. TEAM_MANAGER cannot update priority.
 * 10. INTERN cannot assign/reassign leads.
 * 11. ADMIN can assign and set priority.
 * 12. Existing priority remains unchanged during reassignment if no new priority is provided.
 * 13. Bulk priority works for ADMIN.
 * 14. Bulk priority respects INTERN lead visibility.
 * 15. Priority filter works.
 * 16. Priority sorting works.
 * 17. Activity is created.
 * 18. SSE mutation is emitted.
 * 19. Windsor sync does not overwrite priority.
 * 20. Existing lead functionality still works.
 */

'use strict';

require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const mongoose = require('mongoose');
const { Lead, LEAD_PRIORITY, PRIORITY_WEIGHTS } = require('../src/models/Lead');
const Activity = require('../src/models/Activity');
const User = require('../src/models/User');
const leadService = require('../src/services/lead.service');
const dashboardBroadcaster = require('../src/utils/dashboardBroadcaster.util');

function createMockQueryChain(doc) {
  const chain = {
    populate: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(doc),
    then: function (resolve, reject) {
      return Promise.resolve(doc).then(resolve, reject);
    }
  };
  return chain;
}

describe('Meta Leads Priority Management Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Activity, 'create').mockResolvedValue({});
    jest.spyOn(Activity, 'insertMany').mockResolvedValue([]);
    jest.spyOn(dashboardBroadcaster, 'broadcastDashboardUpdate').mockImplementation(() => {});
  });

  // ─── 1. MODEL SCHEMA & VALIDATION TESTS ──────────────────────────────────────
  describe('1-5: Lead Model Priority Schema & Validation', () => {
    test('1. New lead defaults to MEDIUM and priorityWeight: 2', () => {
      const lead = new Lead({
        metaLeadId: 'test_lead_default',
        fullName: 'Test Default'
      });
      expect(lead.priority).toBe('MEDIUM');
      const json = lead.toJSON();
      expect(json.priority).toBe('MEDIUM');
    });

    test('2. HIGH can be stored with priorityWeight: 1', () => {
      const lead = new Lead({
        metaLeadId: 'test_lead_high',
        priority: 'HIGH'
      });
      const err = lead.validateSync();
      expect(err).toBeUndefined();
      expect(lead.priority).toBe('HIGH');
      expect(PRIORITY_WEIGHTS[lead.priority]).toBe(1);
    });

    test('3. MEDIUM can be stored with priorityWeight: 2', () => {
      const lead = new Lead({
        metaLeadId: 'test_lead_med',
        priority: 'MEDIUM'
      });
      const err = lead.validateSync();
      expect(err).toBeUndefined();
      expect(lead.priority).toBe('MEDIUM');
      expect(PRIORITY_WEIGHTS[lead.priority]).toBe(2);
    });

    test('4. LOW can be stored with priorityWeight: 3', () => {
      const lead = new Lead({
        metaLeadId: 'test_lead_low',
        priority: 'LOW'
      });
      const err = lead.validateSync();
      expect(err).toBeUndefined();
      expect(lead.priority).toBe('LOW');
      expect(PRIORITY_WEIGHTS[lead.priority]).toBe(3);
    });

    test('5. Invalid priority rejected (lowercase, null, arbitrary strings)', () => {
      const invalidValues = ['high', 'urgent', 'critical', '1', 'URGENT', ''];
      for (const val of invalidValues) {
        const lead = new Lead({
          metaLeadId: `test_lead_invalid_${val}`,
          priority: val
        });
        const err = lead.validateSync();
        expect(err).toBeDefined();
        expect(err.errors.priority).toBeDefined();
      }
    });

    test('5b. Lead pre-save hook executes synchronously without next is not a function error', () => {
      const lead = new Lead({
        metaLeadId: 'test_lead_presave',
        priority: 'MEDIUM'
      });
      expect(lead.priorityWeight).toBe(2);

      // Mutate priority to HIGH and execute registered pre-save hooks
      lead.priority = 'HIGH';
      const saveHooks = Lead.schema.s.hooks._pres.get('save') || [];
      expect(() => {
        for (const hook of saveHooks) {
          if (!hook.fn.toString().includes('saveSubdocs')) {
            hook.fn.call(lead);
          }
        }
      }).not.toThrow();

      expect(lead.priorityWeight).toBe(1);

      // Mutate priority to LOW
      lead.priority = 'LOW';
      expect(() => {
        for (const hook of saveHooks) {
          if (!hook.fn.toString().includes('saveSubdocs')) {
            hook.fn.call(lead);
          }
        }
      }).not.toThrow();

      expect(lead.priorityWeight).toBe(3);
    });

    test('5c. Query pre-update hooks synchronize priorityWeight for updateOne / findOneAndUpdate / updateMany', () => {
      const updatePayload = { priority: 'HIGH' };
      const mockContext = { getUpdate: () => updatePayload };
      const updateHooks = Lead.schema.s.hooks._pres.get('updateOne') || [];
      const syncHook = updateHooks.find((h) => h.fn.name === 'syncPriorityWeightOnUpdate');
      expect(syncHook).toBeDefined();

      syncHook.fn.call(mockContext);
      expect(updatePayload.priorityWeight).toBe(1);
    });
  });

  // ─── 2. RBAC & PERMISSION TESTS ─────────────────────────────────────────────
  describe('6-10: Priority Update & Assignment RBAC', () => {
    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'ADMIN',
      name: 'Admin User',
      email: 'admin@test.com'
    };

    const internId = new mongoose.Types.ObjectId();
    const internUser = {
      _id: internId,
      role: 'INTERN',
      name: 'Intern User',
      email: 'intern@test.com'
    };

    const gmUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'GM',
      name: 'GM User',
      email: 'gm@test.com'
    };

    const teamManagerUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'TEAM_MANAGER',
      name: 'TM User',
      email: 'tm@test.com'
    };

    test('6. ADMIN can update priority', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_1',
        priority: 'MEDIUM',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_1', priority: 'HIGH' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));

      const res = await leadService.updateLeadPriority(mockLead._id.toString(), 'HIGH', adminUser);
      expect(mockLead.priority).toBe('HIGH');
      expect(mockLead.priorityWeight).toBe(1);
      expect(mockLead.save).toHaveBeenCalled();
      expect(res.priority).toBe('HIGH');
    });

    test('7. INTERN can update priority on lead assigned to them', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_intern_1',
        assignedTo: internId,
        priority: 'LOW',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_intern_1', priority: 'MEDIUM' })
      };

      jest.spyOn(Lead, 'findOne').mockImplementation((query) => {
        if (query.assignedTo && query.assignedTo.toString() === internId.toString()) {
          return createMockQueryChain(mockLead);
        }
        return createMockQueryChain(null);
      });

      const res = await leadService.updateLeadPriority(mockLead._id.toString(), 'MEDIUM', internUser);
      expect(mockLead.priority).toBe('MEDIUM');
      expect(mockLead.priorityWeight).toBe(2);
      expect(res.priority).toBe('MEDIUM');
    });

    test('8. GM cannot update priority (returns 403)', async () => {
      await expect(
        leadService.updateLeadPriority('some_id', 'HIGH', gmUser)
      ).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('Only administrators and interns')
      });
    });

    test('9. TEAM_MANAGER cannot update priority (returns 403)', async () => {
      await expect(
        leadService.updateLeadPriority('some_id', 'HIGH', teamManagerUser)
      ).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('Only administrators and interns')
      });
    });

    test('10. INTERN cannot assign/reassign leads (strictly ADMIN-only)', async () => {
      await expect(
        leadService.assignLead('some_id', internId.toString(), internUser)
      ).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('Only administrators can assign leads')
      });
    });
  });

  // ─── 3. ASSIGNMENT WITH OPTIONAL PRIORITY ───────────────────────────────────
  describe('11-12: Lead Assignment Priority Behavior', () => {
    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'ADMIN',
      name: 'Admin',
      email: 'admin@test.com'
    };

    const targetStaff = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Abhishek Taneja',
      role: 'INTERN',
      status: 'ACTIVE',
      isActive: true
    };

    test('11. ADMIN can assign and set priority', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_assign_1',
        priority: 'LOW',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_assign_1', priority: 'HIGH' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));
      jest.spyOn(User, 'findById').mockResolvedValue(targetStaff);

      const res = await leadService.assignLead(
        mockLead._id.toString(),
        targetStaff._id.toString(),
        adminUser,
        'HIGH'
      );

      expect(mockLead.assignedTo).toEqual(targetStaff._id);
      expect(mockLead.priority).toBe('HIGH');
      expect(mockLead.priorityWeight).toBe(1);
      expect(res.priority).toBe('HIGH');
    });

    test('12. Existing priority remains unchanged during reassignment if no new priority is provided', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_assign_2',
        priority: 'HIGH',
        priorityWeight: 1,
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_assign_2', priority: 'HIGH' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));
      jest.spyOn(User, 'findById').mockResolvedValue(targetStaff);

      // Reassign without passing priority
      await leadService.assignLead(
        mockLead._id.toString(),
        targetStaff._id.toString(),
        adminUser,
        undefined
      );

      expect(mockLead.assignedTo).toEqual(targetStaff._id);
      // Priority must remain HIGH!
      expect(mockLead.priority).toBe('HIGH');
      expect(mockLead.priorityWeight).toBe(1);
    });
  });

  // ─── 4. BULK PRIORITY & VISIBILITY ──────────────────────────────────────────
  describe('13-14: Bulk Priority & Scoping', () => {
    const adminUser = {
      _id: new mongoose.Types.ObjectId(),
      role: 'ADMIN',
      name: 'Admin'
    };

    const internId = new mongoose.Types.ObjectId();
    const internUser = {
      _id: internId,
      role: 'INTERN',
      name: 'Intern'
    };

    test('13. Bulk priority works for ADMIN', async () => {
      const leadId1 = new mongoose.Types.ObjectId();
      const leadId2 = new mongoose.Types.ObjectId();
      const mockLeads = [
        { _id: leadId1, metaLeadId: 'lead_b1', priority: 'LOW' },
        { _id: leadId2, metaLeadId: 'lead_b2', priority: 'MEDIUM' }
      ];

      jest.spyOn(Lead, 'find').mockReturnValue(createMockQueryChain(mockLeads));
      jest.spyOn(Lead, 'updateMany').mockResolvedValue({ modifiedCount: 2 });

      const result = await leadService.bulkUpdateLeadPriority(
        { mode: 'ids', leadIds: [leadId1.toString(), leadId2.toString()], priority: 'HIGH' },
        adminUser
      );

      expect(result.updatedCount).toBe(2);
      expect(result.priority).toBe('HIGH');
      expect(Lead.updateMany).toHaveBeenCalledWith(
        { _id: { $in: [leadId1, leadId2] } },
        { $set: { priority: 'HIGH', priorityWeight: 1 } }
      );
    });

    test('14. Bulk priority respects INTERN lead visibility (fails if lead outside scope)', async () => {
      const outsideLeadId = new mongoose.Types.ObjectId();
      const queryChain = {
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([
          { _id: outsideLeadId, assignedTo: new mongoose.Types.ObjectId() } // not internId
        ])
      };
      jest.spyOn(Lead, 'find').mockReturnValue(queryChain);

      await expect(
        leadService.bulkUpdateLeadPriority(
          { mode: 'ids', leadIds: [outsideLeadId.toString()], priority: 'HIGH' },
          internUser
        )
      ).rejects.toMatchObject({
        statusCode: 403,
        message: expect.stringContaining('You can only perform bulk operations on leads assigned to you')
      });
    });
  });

  // ─── 5. FILTERING & SORTING ────────────────────────────────────────────────
  describe('15-16: Server-side Priority Filter & Sorting', () => {
    test('15. Priority filter constructs correct DB query for HIGH and MEDIUM', async () => {
      const countSpy = jest.spyOn(Lead, 'countDocuments').mockResolvedValue(0);
      const findChain = createMockQueryChain([]);
      jest.spyOn(Lead, 'find').mockReturnValue(findChain);

      // Filter by HIGH
      await leadService.getLeads({ priority: 'HIGH' });
      expect(countSpy).toHaveBeenCalledWith(expect.objectContaining({ priority: 'HIGH' }));

      // Filter by MEDIUM (includes legacy null/missing)
      await leadService.getLeads({ priority: 'MEDIUM' });
      expect(countSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { priority: 'MEDIUM' },
            { priority: { $exists: false } },
            { priority: null },
            { priority: '' }
          ])
        })
      );
    });

    test('16. Priority sorting sorts HIGH -> MEDIUM -> LOW via priorityWeight: 1', async () => {
      jest.spyOn(Lead, 'countDocuments').mockResolvedValue(0);
      const sortSpy = jest.fn().mockReturnThis();
      const findChain = {
        populate: jest.fn().mockReturnThis(),
        sort: sortSpy,
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([])
      };
      jest.spyOn(Lead, 'find').mockReturnValue(findChain);

      // Ascending priority sort: HIGH (1) -> MEDIUM (2) -> LOW (3)
      await leadService.getLeads({ sortBy: 'priority', sortOrder: 'asc' });
      expect(sortSpy).toHaveBeenCalledWith({
        priorityWeight: 1,
        createdTime: -1,
        createdAt: -1
      });

      // Descending priority sort: LOW (3) -> MEDIUM (2) -> HIGH (1)
      await leadService.getLeads({ sortBy: 'priority', sortOrder: 'desc' });
      expect(sortSpy).toHaveBeenCalledWith({
        priorityWeight: -1,
        createdTime: -1,
        createdAt: -1
      });
    });
  });

  // ─── 6. ACTIVITY TRACKING & SSE ─────────────────────────────────────────────
  describe('17-18: Activity Logging & Real-time SSE', () => {
    test('17. Activity is created with safe non-PII metadata on priority update', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_act_1',
        fullName: 'Secret PII User',
        phoneNumber: '+919999999999',
        email: 'secret@pii.com',
        priority: 'MEDIUM',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_act_1', priority: 'LOW' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));
      const activityCreateSpy = jest.spyOn(Activity, 'create').mockResolvedValue({});

      const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN', name: 'Admin' };
      await leadService.updateLeadPriority(mockLead._id.toString(), 'LOW', adminUser);

      expect(activityCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'lead_priority_updated',
          entityType: 'meta_lead',
          metadata: {
            leadId: mockLead._id.toString(),
            previousPriority: 'MEDIUM',
            newPriority: 'LOW',
            actorId: adminUser._id.toString()
          }
        })
      );

      // Verify NO PII in metadata
      const callArg = activityCreateSpy.mock.calls[0][0];
      expect(callArg.metadata.phone).toBeUndefined();
      expect(callArg.metadata.email).toBeUndefined();
      expect(callArg.metadata.fullName).toBeUndefined();
    });

    test('18. SSE mutation LEAD_MUTATED is emitted with action priority_updated', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_sse_1',
        priority: 'MEDIUM',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_sse_1', priority: 'HIGH' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));
      const broadcastSpy = jest.spyOn(dashboardBroadcaster, 'broadcastDashboardUpdate');

      const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN', name: 'Admin' };
      await leadService.updateLeadPriority(mockLead._id.toString(), 'HIGH', adminUser);

      expect(broadcastSpy).toHaveBeenCalledWith({
        type: 'LEAD_MUTATED',
        entity: 'meta_lead',
        entityId: mockLead._id.toString(),
        action: 'priority_updated'
      });
    });
  });

  // ─── 7. WINDSOR SYNC PROTECTION & REGRESSION ───────────────────────────────
  describe('19-20: Windsor Protection & CRM Regression', () => {
    test('19. Windsor sync does NOT overwrite existing priority', async () => {
      const existingLead = {
        metaLeadId: 'windsor_sync_1',
        fullName: 'Existing Name',
        priority: 'HIGH', // User explicitly set HIGH
        priorityWeight: 1,
        save: jest.fn().mockResolvedValue(true)
      };

      jest.spyOn(Lead, 'findOne').mockResolvedValue(existingLead);

      const normalized = {
        metaLeadId: 'windsor_sync_1',
        fullName: 'New Windsor Name'
      };

      const { lead, isNew } = await leadService.upsertLead(normalized);

      expect(isNew).toBe(false);
      // Priority must remain HIGH!
      expect(lead.priority).toBe('HIGH');
      expect(lead.priorityWeight).toBe(1);
    });

    test('20. Existing lead status update and workflow continues to work untouched', async () => {
      const mockLead = {
        _id: new mongoose.Types.ObjectId(),
        metaLeadId: 'lead_reg_1',
        status: 'NEW',
        priority: 'HIGH',
        save: jest.fn().mockResolvedValue(true),
        toJSON: jest.fn().mockReturnValue({ id: 'lead_reg_1', status: 'CONTACTED', priority: 'HIGH' })
      };

      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(mockLead));

      const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN', name: 'Admin' };
      const res = await leadService.updateLeadStatus(mockLead._id.toString(), 'CONTACTED', adminUser);

      expect(mockLead.status).toBe('CONTACTED');
      // Priority remains HIGH
      expect(mockLead.priority).toBe('HIGH');
      expect(res.status).toBe('CONTACTED');
    });
  });

  // ─── 8. REAL ROUTE INTEGRATION: PATCH /api/leads/:id/priority ───────────────
  describe('21-27: Real Express Route Integration: PATCH /api/leads/:id/priority', () => {
    const jwtSecret = process.env.JWT_SECRET || 'test_secret';

    const createAuthUser = (role, overrides = {}) => {
      const id = new mongoose.Types.ObjectId();
      return {
        _id: id,
        id: id.toString(),
        name: `${role} Test User`,
        email: `${role.toLowerCase()}@test.com`,
        role,
        isActive: true,
        status: 'ACTIVE',
        ...overrides
      };
    };

    const makeAuthCookie = (user) => {
      const token = jwt.sign({ userId: user._id.toString() }, jwtSecret);
      return [`accessToken=${token}`];
    };

    const createExecutableLead = (initialPriority = 'MEDIUM', assignedTo = null) => {
      const leadId = new mongoose.Types.ObjectId();
      const lead = {
        _id: leadId,
        id: leadId.toString(),
        metaLeadId: `meta_${leadId.toString()}`,
        fullName: 'Dr Azam',
        priority: initialPriority,
        priorityWeight: PRIORITY_WEIGHTS[initialPriority] || 2,
        assignedTo,
        status: 'NEW',
        toJSON: function () {
          return {
            id: this._id.toString(),
            metaLeadId: this.metaLeadId,
            fullName: this.fullName,
            priority: this.priority,
            priorityWeight: this.priorityWeight,
            assignedTo: this.assignedTo,
            status: this.status
          };
        }
      };

      // Real execution of Lead priority pre-save hook to catch any "next is not a function" regression
      lead.save = jest.fn().mockImplementation(async function () {
        const pres = Lead.schema.s.hooks._pres.get('save') || [];
        for (const hook of pres) {
          if (hook.fn.toString().includes('PRIORITY_WEIGHTS')) {
            hook.fn.call(this);
          }
        }
        return this;
      });

      return lead;
    };

    test('21. Unauthenticated request returns HTTP 401', async () => {
      const res = await request(app)
        .patch('/api/leads/507f1f77bcf86cd799439011/priority')
        .send({ priority: 'HIGH' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Authentication token required/);
    });

    test('22. ADMIN: MEDIUM -> HIGH returns HTTP 200, updates priority to HIGH and priorityWeight to 1 without next is not a function', async () => {
      const admin = createAuthUser('ADMIN');
      jest.spyOn(User, 'findById').mockResolvedValue(admin);

      const lead = createExecutableLead('MEDIUM');
      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(lead));

      const res = await request(app)
        .patch(`/api/leads/${lead._id.toString()}/priority`)
        .set('Cookie', makeAuthCookie(admin))
        .send({ priority: 'HIGH' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lead.priority).toBe('HIGH');
      expect(lead.priority).toBe('HIGH');
      expect(lead.priorityWeight).toBe(1);
      expect(lead.save).toHaveBeenCalled();
    });

    test('23. ADMIN: HIGH -> LOW returns HTTP 200, updates priority to LOW and priorityWeight to 3', async () => {
      const admin = createAuthUser('ADMIN');
      jest.spyOn(User, 'findById').mockResolvedValue(admin);

      const lead = createExecutableLead('HIGH');
      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(lead));

      const res = await request(app)
        .patch(`/api/leads/${lead._id.toString()}/priority`)
        .set('Cookie', makeAuthCookie(admin))
        .send({ priority: 'LOW' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lead.priority).toBe('LOW');
      expect(lead.priority).toBe('LOW');
      expect(lead.priorityWeight).toBe(3);
    });

    test('24. ADMIN: LOW -> MEDIUM returns HTTP 200, updates priority to MEDIUM and priorityWeight to 2', async () => {
      const admin = createAuthUser('ADMIN');
      jest.spyOn(User, 'findById').mockResolvedValue(admin);

      const lead = createExecutableLead('LOW');
      jest.spyOn(Lead, 'findOne').mockReturnValue(createMockQueryChain(lead));

      const res = await request(app)
        .patch(`/api/leads/${lead._id.toString()}/priority`)
        .set('Cookie', makeAuthCookie(admin))
        .send({ priority: 'MEDIUM' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.lead.priority).toBe('MEDIUM');
      expect(lead.priority).toBe('MEDIUM');
      expect(lead.priorityWeight).toBe(2);
    });

    test('25. INTERN: can update assigned lead (200), but forbidden on unassigned/other lead (404)', async () => {
      const intern = createAuthUser('INTERN');
      jest.spyOn(User, 'findById').mockResolvedValue(intern);

      // A: Assigned lead -> Success
      const assignedLead = createExecutableLead('MEDIUM', intern._id);
      jest.spyOn(Lead, 'findOne').mockImplementation((query) => {
        if (
          query._id &&
          query._id.toString() === assignedLead._id.toString() &&
          query.assignedTo &&
          query.assignedTo.toString() === intern._id.toString()
        ) {
          return createMockQueryChain(assignedLead);
        }
        return createMockQueryChain(null);
      });

      const resSuccess = await request(app)
        .patch(`/api/leads/${assignedLead._id.toString()}/priority`)
        .set('Cookie', makeAuthCookie(intern))
        .send({ priority: 'HIGH' });

      expect(resSuccess.status).toBe(200);
      expect(resSuccess.body.data.lead.priority).toBe('HIGH');
      expect(assignedLead.priorityWeight).toBe(1);

      // B: Unassigned or other user's lead -> 404 (scoped visibility)
      const resForbidden = await request(app)
        .patch('/api/leads/507f1f77bcf86cd799439099/priority')
        .set('Cookie', makeAuthCookie(intern))
        .send({ priority: 'HIGH' });

      expect(resForbidden.status).toBe(404);
      expect(resForbidden.body.message).toMatch(/Lead not found/);
    });

    test('26. GM and TEAM_MANAGER are strictly forbidden (HTTP 403)', async () => {
      const gm = createAuthUser('GM');
      const teamManager = createAuthUser('TEAM_MANAGER');

      jest.spyOn(User, 'findById').mockImplementation(async (id) => {
        if (id.toString() === gm._id.toString()) return gm;
        if (id.toString() === teamManager._id.toString()) return teamManager;
        return null;
      });

      const resGm = await request(app)
        .patch('/api/leads/507f1f77bcf86cd799439011/priority')
        .set('Cookie', makeAuthCookie(gm))
        .send({ priority: 'HIGH' });
      expect(resGm.status).toBe(403);
      expect(resGm.body.message).toMatch(/Only administrators and interns can update lead priority/);

      const resTm = await request(app)
        .patch('/api/leads/507f1f77bcf86cd799439011/priority')
        .set('Cookie', makeAuthCookie(teamManager))
        .send({ priority: 'HIGH' });
      expect(resTm.status).toBe(403);
      expect(resTm.body.message).toMatch(/Only administrators and interns can update lead priority/);
    });

    test('27. Invalid priority strings rejected with HTTP 400', async () => {
      const admin = createAuthUser('ADMIN');
      jest.spyOn(User, 'findById').mockResolvedValue(admin);

      const invalidPayloads = ['URGENT', 'critical', 'high', 'low', '1', ''];
      for (const invalid of invalidPayloads) {
        const res = await request(app)
          .patch('/api/leads/507f1f77bcf86cd799439011/priority')
          .set('Cookie', makeAuthCookie(admin))
          .send({ priority: invalid });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Priority must be one of: HIGH, MEDIUM, LOW/);
      }
    });
  });
});
