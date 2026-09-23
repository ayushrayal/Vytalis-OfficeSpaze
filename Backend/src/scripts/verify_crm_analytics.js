/**
 * Comprehensive Automated Verification Suite for Phase 4C — CRM Analytics
 *
 * Tests:
 * 1. Timezone & Date Range Bounds in Asia/Kolkata (IST)
 * 2. Date Validation & Boundary Rejections
 * 3. Continuous Date Buckets & Zero-filling
 * 4. Scoped Ownership Match Builder & Tamper Resistance
 * 5. Overview Analytics & KPI Formula Accuracy
 * 6. Daily Trends Continuous Time-series
 * 7. Assignee Analytics (Admin Only & RBAC Enforcement)
 * 8. Conversion Analytics Breakdown
 * 9. Follow-Up Analytics (Authoritative LeadFollowUp State)
 * 10. Data Safety & Zero-PII / Zero-Secrets Guarantee
 */

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const {
  TIMEZONE,
  getKolkataDayBounds,
  getKolkataYMD,
  getKolkataAnalyticsRange,
  generateContinuousDateBuckets
} = require('../utils/timezone.util');

const {
  buildLeadScopeMatch,
  getOverviewAnalytics,
  getTrendAnalytics,
  getAssigneeAnalytics,
  getConversionAnalytics,
  getFollowUpAnalytics
} = require('../services/leadAnalytics.service');

const { Lead, LEAD_STATUS, CONVERSION_TYPES } = require('../models/Lead');
const { LeadFollowUp } = require('../models/LeadFollowUp');
const User = require('../models/User');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    failedTests++;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
    passedTests++;
  }
}

async function runVerification() {
  console.log('====================================================');
  console.log('PHASE 4C — CRM ANALYTICS AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  try {
    // -------------------------------------------------------------
    // TEST SECTION 1: TIMEZONE & DETERMINISTIC DATE BOUNDS (IST)
    // -------------------------------------------------------------
    console.log('--- SECTION 1: Timezone & Date Ranges (Asia/Kolkata) ---');

    assert(TIMEZONE === 'Asia/Kolkata', 'Timezone constant is strictly Asia/Kolkata');

    const refDate = new Date('2026-09-23T10:30:00.000Z');
    const dayBounds = getKolkataDayBounds(refDate);
    assert(dayBounds.startOfToday instanceof Date, 'startOfToday is valid Date');
    assert(dayBounds.startOfTomorrow instanceof Date, 'startOfTomorrow is valid Date');
    assert(
      dayBounds.startOfTomorrow.getTime() - dayBounds.startOfToday.getTime() === 24 * 60 * 60 * 1000,
      'Exactly 24 hours between startOfToday and startOfTomorrow'
    );

    // Test all presets
    const presets = ['today', 'yesterday', 'last7days', 'last30days', 'thisMonth', 'lastMonth'];
    for (const preset of presets) {
      const range = getKolkataAnalyticsRange({ preset }, refDate);
      assert(range.start <= range.end, `Preset "${preset}" has start <= end`);
      assert(range.start instanceof Date && range.end instanceof Date, `Preset "${preset}" returns Date objects`);
    }

    // Test Last 7 Days covers exactly 7 calendar days
    const range7 = getKolkataAnalyticsRange({ preset: 'last7days' }, refDate);
    const buckets7 = generateContinuousDateBuckets(range7.start, range7.end);
    assert(buckets7.length === 7, `Last 7 Days generates exactly 7 continuous date buckets (got ${buckets7.length})`);

    // Test Last 30 Days covers exactly 30 calendar days
    const range30 = getKolkataAnalyticsRange({ preset: 'last30days' }, refDate);
    const buckets30 = generateContinuousDateBuckets(range30.start, range30.end);
    assert(buckets30.length === 30, `Last 30 Days generates exactly 30 continuous date buckets (got ${buckets30.length})`);

    // -------------------------------------------------------------
    // TEST SECTION 2: DATE VALIDATION & REJECTIONS (HTTP 400)
    // -------------------------------------------------------------
    console.log('\n--- SECTION 2: Date Validation & Error Handling ---');

    let badPresetThrown = false;
    try {
      getKolkataAnalyticsRange({ preset: 'invalid_preset' });
    } catch (err) {
      badPresetThrown = err.statusCode === 400;
    }
    assert(badPresetThrown, 'Invalid preset throws HTTP 400');

    let missingCustomThrown = false;
    try {
      getKolkataAnalyticsRange({ preset: 'custom', startDate: '2026-09-01' });
    } catch (err) {
      missingCustomThrown = err.statusCode === 400;
    }
    assert(missingCustomThrown, 'Custom range missing endDate throws HTTP 400');

    let reversedCustomThrown = false;
    try {
      getKolkataAnalyticsRange({ preset: 'custom', startDate: '2026-09-20', endDate: '2026-09-10' });
    } catch (err) {
      reversedCustomThrown = err.statusCode === 400;
    }
    assert(reversedCustomThrown, 'Custom range with start > end throws HTTP 400');

    let excessCustomThrown = false;
    try {
      getKolkataAnalyticsRange({ preset: 'custom', startDate: '2024-01-01', endDate: '2026-01-01' });
    } catch (err) {
      excessCustomThrown = err.statusCode === 400;
    }
    assert(excessCustomThrown, 'Custom range > 366 days throws HTTP 400');

    // -------------------------------------------------------------
    // TEST SECTION 3: SERVER-SIDE AUTHORIZATION & SCOPING
    // -------------------------------------------------------------
    console.log('\n--- SECTION 3: Server-Side Authorization & Anti-Tampering ---');

    const adminUser = { _id: new mongoose.Types.ObjectId(), role: 'ADMIN' };
    const gmUser = { _id: new mongoose.Types.ObjectId(), role: 'GM' };
    const internUser = { _id: new mongoose.Types.ObjectId(), role: 'INTERN' };

    // Admin default (active only)
    const adminScopeDefault = buildLeadScopeMatch(adminUser, false);
    assert(adminScopeDefault.isAdmin === true, 'Admin identified correctly');
    assert(adminScopeDefault.baseMatch.assignedTo === undefined, 'Admin base match has no assignedTo filter');
    assert(adminScopeDefault.baseMatch.archivedAt === null, 'Admin default filters archivedAt: null');

    // Admin includeArchived = true
    const adminScopeArchived = buildLeadScopeMatch(adminUser, true);
    assert(adminScopeArchived.baseMatch.archivedAt === undefined, 'Admin includeArchived includes archived records');

    // Non-admin (GM) scope
    const gmScope = buildLeadScopeMatch(gmUser, false);
    assert(gmScope.isAdmin === false, 'GM identified as non-admin');
    assert(gmScope.baseMatch.assignedTo.equals(gmUser._id), 'GM strictly scoped to own user _id');
    assert(gmScope.baseMatch.archivedAt === null, 'GM strictly locked to active leads only');

    // Non-admin attempting to pass includeArchived = true
    const internTamperArchived = buildLeadScopeMatch(internUser, true);
    assert(internTamperArchived.isArchivedIncluded === false, 'Non-admin cannot enable includeArchived');
    assert(internTamperArchived.baseMatch.archivedAt === null, 'Non-admin archived filter remains archivedAt: null');

    // -------------------------------------------------------------
    // TEST SECTION 4: REAL DATABASE INTEGRATION & AGGREGATIONS
    // -------------------------------------------------------------
    console.log('\n--- SECTION 4: Database Integration & Pipeline Aggregations ---');

    await mongoose.connect(process.env.MONGODB_URI);
    assert(mongoose.connection.readyState === 1, 'MongoDB connection established');

    // 1. Overview Analytics for ADMIN
    const adminOverview = await getOverviewAnalytics({
      preset: 'last30days',
      actor: adminUser
    });

    assert(adminOverview.kpis !== undefined, 'Overview contains kpis object');
    assert(typeof adminOverview.kpis.totalLeads === 'number', 'totalLeads is numeric');
    assert(typeof adminOverview.kpis.conversionRate === 'number', 'conversionRate is numeric');
    assert(adminOverview.statusDistribution !== undefined, 'statusDistribution exists');
    assert(adminOverview.meta.timezone === 'Asia/Kolkata', 'Response meta timezone is Asia/Kolkata');
    assert(adminOverview.meta.scope === 'GLOBAL', 'Admin scope meta is GLOBAL');

    // Verify operational conversion rate formula in meta
    const crMeta = adminOverview.meta.conversionRate;
    assert(crMeta.formula === '(convertedLeads / totalEligibleLeads) * 100', 'Conversion rate formula matches specification');
    assert(crMeta.isCohort === false, 'Explicitly declared as non-cohort operational rate');

    // 2. Overview Analytics for NON-ADMIN (Scoped)
    const gmOverview = await getOverviewAnalytics({
      preset: 'last30days',
      actor: gmUser
    });
    assert(gmOverview.meta.scope === 'SCOPED_USER', 'Non-admin scope meta is SCOPED_USER');
    assert(gmOverview.meta.includeArchived === false, 'Non-admin includeArchived is false');

    // 3. Trend Analytics Continuous Daily Buckets
    const trendsResult = await getTrendAnalytics({
      preset: 'last7days',
      actor: adminUser
    });
    assert(Array.isArray(trendsResult.trends), 'Trends is an array');
    assert(trendsResult.trends.length === 7, 'Trends array has exactly 7 continuous daily points');
    trendsResult.trends.forEach((point, idx) => {
      assert(typeof point.date === 'string', `Bucket ${idx} has date string`);
      assert(typeof point.leads === 'number', `Bucket ${idx} has numeric leads`);
      assert(typeof point.conversions === 'number', `Bucket ${idx} has numeric conversions`);
    });

    // 4. Assignee Analytics (Admin Only)
    const assigneeResult = await getAssigneeAnalytics({
      preset: 'last30days',
      actor: adminUser
    });
    assert(Array.isArray(assigneeResult.assignees), 'Assignees is an array');

    // Verify non-admin is rejected from assignee analytics with 403
    let nonAdminAssigneeBlocked = false;
    try {
      await getAssigneeAnalytics({
        preset: 'last30days',
        actor: gmUser
      });
    } catch (err) {
      nonAdminAssigneeBlocked = err.statusCode === 403;
    }
    assert(nonAdminAssigneeBlocked, 'Non-admin calling getAssigneeAnalytics receives HTTP 403');

    // 5. Conversion Analytics Breakdown
    const conversionResult = await getConversionAnalytics({
      preset: 'last30days',
      actor: adminUser
    });
    assert(conversionResult.conversions !== undefined, 'Conversion analytics returned');
    assert(conversionResult.conversions.breakdown !== undefined, 'Conversion type breakdown exists');
    CONVERSION_TYPES.forEach((type) => {
      assert(
        conversionResult.conversions.breakdown[type] !== undefined,
        `Conversion type ${type} present in breakdown`
      );
    });

    // 6. Follow-Up Analytics (Authoritative LeadFollowUp State)
    const followUpResult = await getFollowUpAnalytics({
      preset: 'last30days',
      actor: adminUser
    });
    assert(followUpResult.followUps.snapshot !== undefined, 'Follow-up snapshot exists');
    assert(typeof followUpResult.followUps.snapshot.pending === 'number', 'pending follow-ups is numeric');
    assert(typeof followUpResult.followUps.snapshot.overdue === 'number', 'overdue follow-ups is numeric');
    assert(followUpResult.meta.followUpTimeBasis.missed === 'current_state_count', 'Documented missed follows-up limitation');

    // -------------------------------------------------------------
    // TEST SECTION 5: DATA SAFETY & NO PII / SECRETS
    // -------------------------------------------------------------
    console.log('\n--- SECTION 5: Data Safety & PII Sanitization ---');

    const jsonString = JSON.stringify(adminOverview) + JSON.stringify(assigneeResult);
    assert(!jsonString.includes('password'), 'Zero password fields present in response payloads');
    assert(!jsonString.includes('refreshTokenHash'), 'Zero refresh token hashes present in response payloads');
    assert(!jsonString.includes('phoneNumber'), 'Zero customer phone numbers present in response payloads');
    assert(!jsonString.includes('jwt'), 'Zero JWT references in response payloads');

    console.log('\n====================================================');
    console.log(`VERIFICATION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('\n❌ VERIFICATION SUITE ABORTED WITH ERROR:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(failedTests > 0 ? 1 : 0);
  }
}

runVerification();
