const cron = require('node-cron');
const UtilityBill = require('../models/UtilityBill');
const { getNextMonthFirstDayIST } = require('./utilityBill.service');

const getCurrentISTParts = () => {
  const options = { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'numeric', day: 'numeric' };
  const parts = new Intl.DateTimeFormat('en-US', options).formatToParts(new Date());
  const year = parseInt(parts.find((p) => p.type === 'year').value, 10);
  const month = parseInt(parts.find((p) => p.type === 'month').value, 10);
  const day = parseInt(parts.find((p) => p.type === 'day').value, 10);
  return { year, month, day };
};

const processMonthlyRecurringBills = async () => {
  try {
    const istParts = getCurrentISTParts();

    // Find active root parent bills whose reminderDate is today or earlier and are not paused
    const parentBills = await UtilityBill.find({
      parentBillId: { $ne: null },
      isPaused: false,
      reminderDate: { $lte: new Date() }
    });

    // Deduplicate by parentBillId
    const uniqueParentMap = new Map();
    for (const bill of parentBills) {
      const rootId = (bill.parentBillId || bill._id).toString();
      if (!uniqueParentMap.has(rootId)) {
        uniqueParentMap.set(rootId, bill);
      }
    }

    const istMonthStr = String(istParts.month).padStart(2, '0');

    for (const [rootId, rootBill] of uniqueParentMap.entries()) {
      const cycleKey = `${istParts.year}-${istMonthStr}_${rootId}`;

      const existingCycle = await UtilityBill.findOne({ cycleKey });
      if (existingCycle) {
        continue;
      }

      const nextReminderDate = getNextMonthFirstDayIST(new Date());

      try {
        await UtilityBill.create({
          billName: rootBill.billName,
          billAmount: rootBill.billAmount,
          uploadedBy: rootBill.uploadedBy,
          status: 'Due',
          isPaused: false,
          reminderDate: nextReminderDate,
          parentBillId: rootBill.parentBillId || rootBill._id,
          cycleKey: cycleKey
        });
      } catch (err) {
        // Catch duplicate key race conditions safely for idempotency
        if (err.code === 11000) {
          // Idempotence safeguard: cycle key already exists
          continue;
        }
        console.error('Error generating recurring monthly utility bill:', err.message);
      }
    }
  } catch (error) {
    console.error('Failed to process monthly recurring utility bills:', error.message);
  }
};

const initUtilityBillScheduler = () => {
  // Execute check immediately on server boot
  processMonthlyRecurringBills().catch((err) => {
    console.error('Boot-up recurring utility bill check failed:', err.message);
  });

  // Schedule daily run at midnight IST (Asia/Kolkata)
  cron.schedule(
    '0 0 * * *',
    () => {
      processMonthlyRecurringBills().catch((err) => {
        console.error('Daily cron recurring utility bill check failed:', err.message);
      });
    },
    {
      timezone: 'Asia/Kolkata'
    }
  );
};

module.exports = {
  processMonthlyRecurringBills,
  initUtilityBillScheduler
};
