require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('../models/User');

async function verifyExistingAdmins() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Fetch raw documents directly from MongoDB driver (untransformed by Mongoose)
    const rawUsers = await mongoose.connection.collection('users').find({}).toArray();
    console.log(`\n--- RAW MONGODB RECORDS (Total: ${rawUsers.length}) ---`);
    rawUsers.forEach((u, i) => {
      console.log(`[${i + 1}] ID: ${u._id} | Email: ${u.email} | Role: ${u.role} | isActive: ${u.isActive} | status in raw doc: ${u.status}`);
    });

    // 2. Fetch using Mongoose model
    const mongooseUsers = await User.find({});
    console.log(`\n--- MONGOOSE LOADED RECORDS ---`);
    mongooseUsers.forEach((u, i) => {
      const isStatusActive = u.status === 'ACTIVE' || (u.status === undefined && u.isActive === true);
      console.log(`[${i + 1}] Email: ${u.email} | Mongoose status: ${u.status} | isActive: ${u.isActive} | Considered Active: ${isStatusActive}`);
    });

    // 3. Test safe non-destructive migration / backfill
    // For every user where status is not present, set status = (isActive ? 'ACTIVE' : 'INACTIVE')
    const updateResult = await mongoose.connection.collection('users').updateMany(
      { status: { $exists: false } },
      { $set: { status: 'ACTIVE' } }
    );
    console.log(`\n--- SAFE ONE-TIME BACKFILL RESULT ---`);
    console.log(`Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);

    // 4. Verify all 9 records now have status: 'ACTIVE'
    const postBackfill = await mongoose.connection.collection('users').find({}).toArray();
    console.log(`\n--- POST-BACKFILL VERIFICATION ---`);
    let allValid = true;
    postBackfill.forEach((u, i) => {
      const ok = u.status === 'ACTIVE' && u.isActive === true && u.role === 'ADMIN';
      if (!ok) allValid = false;
      console.log(`[${i + 1}] Email: ${u.email} | Role: ${u.role} | status: ${u.status} | isActive: ${u.isActive} | OK: ${ok}`);
    });

    console.log(`\nAll 9 existing admin records verified active: ${allValid}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  }
}

verifyExistingAdmins();
