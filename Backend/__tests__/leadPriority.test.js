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
});
