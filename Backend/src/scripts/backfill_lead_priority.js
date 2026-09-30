const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Lead } = require('../models/Lead');

/**
 * Idempotent migration script to safely ensure all leads have a valid priority and priorityWeight.
 * Defaults missing values to 'MEDIUM' (weight: 2).
 * Does NOT touch status, assignment, follow-up, notes, conversion, or archive states.
 */
const runBackfill = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined.');
    }

    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
      console.log('[Backfill] Connected to MongoDB');
    }

    const result = await Lead.updateMany(
      {
        $or: [
          { priority: { $exists: false } },
          { priority: null },
          { priority: '' },
          { priorityWeight: { $exists: false } },
          { priorityWeight: null }
        ]
      },
      {
        $set: {
          priority: 'MEDIUM',
          priorityWeight: 2
        }
      }
    );

    console.log(`[Backfill] Successfully backfilled priority for ${result.modifiedCount} lead records.`);
    return result;
  } catch (error) {
    console.error('[Backfill] Error running priority backfill:', error);
    throw error;
  } finally {
    if (require.main === module && mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('[Backfill] Disconnected from MongoDB');
    }
  }
};

if (require.main === module) {
  runBackfill()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { runBackfill };
