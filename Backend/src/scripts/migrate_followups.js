const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // ignore
}

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { Lead } = require('../models/Lead');
const { LeadFollowUp } = require('../models/LeadFollowUp');
const User = require('../models/User');

/**
 * Migration runner for Phase 4B: Migrating legacy Lead.nextFollowUpAt to LeadFollowUp.
 */
const runMigration = async (options = {}) => {
  console.log('=== META LEADS PHASE 4B: FOLLOW-UP MIGRATION UTILITY ===\n');

  // 1. Verify environment and database connection
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in environment.');
  }

  // 2. Explicit actor validation
  const actorId = options?.actorUserId || process.env.MIGRATION_ACTOR_USER_ID;
  if (!actorId) {
    throw new Error('MIGRATION_ACTOR_USER_ID is required before running migration.');
  }

  if (!mongoose.Types.ObjectId.isValid(actorId)) {
    throw new Error(`Invalid MIGRATION_ACTOR_USER_ID format: "${actorId}"`);
  }

  const didConnect = mongoose.connection.readyState !== 1;
  if (didConnect) {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB Atlas');
  }

  const migrationActor = await User.findById(actorId);
  if (!migrationActor || migrationActor.status !== 'ACTIVE' || migrationActor.isActive === false) {
    throw new Error(`Migration actor user not found or inactive: "${actorId}"`);
  }
  console.log(`✓ Verified Migration Actor: ${migrationActor.name} (${migrationActor.email}) [${migrationActor.role}]`);

  // 3. Scan leads with nextFollowUpAt != null
  const leadsWithFollowUp = await Lead.find({
    nextFollowUpAt: { $ne: null }
  });

  console.log(`\nFound ${leadsWithFollowUp.length} leads with nextFollowUpAt != null.`);

  const summary = {
    scanned: leadsWithFollowUp.length,
    migrated: 0,
    skipped: 0,
    alreadyMigrated: 0,
    invalidRecords: 0,
    failedRecords: 0,
    mismatchedRecords: []
  };

  for (const lead of leadsWithFollowUp) {
    try {
      const dueAt = new Date(lead.nextFollowUpAt);
      if (isNaN(dueAt.getTime())) {
        console.warn(`[Invalid Date] Lead ${lead._id} has invalid nextFollowUpAt:`, lead.nextFollowUpAt);
        summary.invalidRecords++;
        continue;
      }

      // Check if a PENDING follow-up already exists for this lead
      const existingPending = await LeadFollowUp.findOne({
        lead: lead._id,
        status: 'PENDING'
      });

      if (existingPending) {
        if (existingPending.dueAt.getTime() === dueAt.getTime()) {
          // Exactly matching pending follow-up already exists
          summary.alreadyMigrated++;
        } else {
          // Integrity mismatch: Lead.nextFollowUpAt does not match existing pending follow-up dueAt
          console.warn(
            `[Mismatch] Lead ${lead._id} nextFollowUpAt (${dueAt.toISOString()}) !== pending followUp dueAt (${existingPending.dueAt.toISOString()})`
          );
          summary.mismatchedRecords.push({
            leadId: lead._id.toString(),
            leadNextFollowUpAt: dueAt.toISOString(),
            pendingFollowUpId: existingPending._id.toString(),
            pendingDueAt: existingPending.dueAt.toISOString()
          });
        }
        continue;
      }

      // Create new LeadFollowUp document
      await LeadFollowUp.create({
        lead: lead._id,
        dueAt,
        status: 'PENDING',
        notes: 'Migrated from Lead.nextFollowUpAt',
        createdBy: migrationActor._id
      });

      summary.migrated++;
    } catch (err) {
      console.error(`[Error] Failed to migrate lead ${lead._id}:`, err.message);
      summary.failedRecords++;
    }
  }

  console.log('\n=== MIGRATION SUMMARY ===');
  console.log('Total Scanned:         ', summary.scanned);
  console.log('Successfully Migrated: ', summary.migrated);
  console.log('Already Migrated:      ', summary.alreadyMigrated);
  console.log('Invalid Date Records:  ', summary.invalidRecords);
  console.log('Failed Records:        ', summary.failedRecords);
  console.log('Mismatched Records:    ', summary.mismatchedRecords.length);

  if (didConnect && !options?.keepConnection) {
    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB Atlas');
  }

  return summary;
};

// If run directly from CLI
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('✓ Migration execution completed. Exiting 0.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Migration failed:', err.message);
      process.exit(1);
    });
}

module.exports = {
  runMigration
};
