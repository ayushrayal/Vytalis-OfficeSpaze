/**
 * Migration & Audit Script for Phase 5 — P0.1 Document Access Hardening
 *
 * Scans all VirtualOffice, ManagedOffice, UtilityBill, and OperationBill records in MongoDB.
 * Derives and populates `filePath` from legacy ImageKit URLs if `filePath` is missing,
 * making existing records fully compatible with signed URL access without breaking legacy records.
 *
 * Produces a comprehensive status report.
 */

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const VirtualOffice = require('../models/VirtualOffice');
const ManagedOffice = require('../models/ManagedOffice');
const UtilityBill = require('../models/UtilityBill');
const OperationBill = require('../models/OperationBill');
const { generateSignedDocumentUrl } = require('../providers/imagekit.provider');

const extractFilePathFromUrl = (url, urlEndpoint) => {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    if (urlEndpoint) {
      const endpointParsed = new URL(urlEndpoint);
      if (parsed.hostname === endpointParsed.hostname) {
        // Strip endpoint pathname prefix if present
        let pathname = parsed.pathname;
        if (endpointParsed.pathname && endpointParsed.pathname !== '/' && pathname.startsWith(endpointParsed.pathname)) {
          pathname = pathname.slice(endpointParsed.pathname.length);
        }
        return pathname.startsWith('/') ? pathname : `/${pathname}`;
      }
    }
    // Generic fallback for any ImageKit CDN URL
    if (parsed.hostname.includes('imagekit.io')) {
      // Remove endpoint ID prefix (/xx3p5hpxg/path -> /path)
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length > 1) {
        return '/' + segments.slice(1).join('/');
      }
      return parsed.pathname;
    }
    return parsed.pathname;
  } catch (err) {
    return null;
  }
};

const runMigration = async () => {
  console.log('====================================================');
  console.log('PHASE 5 — P0.1 DOCUMENT PATH MIGRATION & AUDIT');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;
  console.log('ImageKit Endpoint:', urlEndpoint);

  const report = {
    totalAudited: 0,
    totalWithDocuments: 0,
    alreadyCompatible: 0,
    successfullyMigrated: 0,
    requiresManualRemediation: 0,
    modules: {}
  };

  const collections = [
    { name: 'VirtualOffice', model: VirtualOffice, docField: 'agreement' },
    { name: 'ManagedOffice', model: ManagedOffice, docField: 'agreement' },
    { name: 'UtilityBill', model: UtilityBill, docField: 'receipt' },
    { name: 'OperationBill', model: OperationBill, docField: 'receipt' }
  ];

  for (const { name, model, docField } of collections) {
    const docs = await model.find();
    report.totalAudited += docs.length;

    report.modules[name] = {
      total: docs.length,
      withDocument: 0,
      alreadyCompatible: 0,
      migrated: 0,
      failed: 0,
      details: []
    };

    for (const doc of docs) {
      const docData = doc[docField];
      if (!docData) continue;

      report.totalWithDocuments++;
      report.modules[name].withDocument++;

      const hasFilePath = Boolean(docData.filePath);
      const hasUrl = Boolean(docData.url);

      if (hasFilePath) {
        // Test signing
        try {
          generateSignedDocumentUrl({ filePath: docData.filePath });
          report.alreadyCompatible++;
          report.modules[name].alreadyCompatible++;
          report.modules[name].details.push({
            id: doc._id.toString(),
            status: 'COMPATIBLE_EXISTING',
            filePath: docData.filePath
          });
        } catch (signErr) {
          report.requiresManualRemediation++;
          report.modules[name].failed++;
          report.modules[name].details.push({
            id: doc._id.toString(),
            status: 'SIGNING_FAILED',
            error: signErr.message
          });
        }
      } else if (hasUrl) {
        const derivedPath = extractFilePathFromUrl(docData.url, urlEndpoint);
        if (derivedPath) {
          try {
            // Test that signing works with derived path
            generateSignedDocumentUrl({ filePath: derivedPath, url: docData.url });

            // Persist the derived filePath to MongoDB
            docData.filePath = derivedPath;
            doc.markModified(docField);
            await doc.save();

            report.successfullyMigrated++;
            report.modules[name].migrated++;
            report.modules[name].details.push({
              id: doc._id.toString(),
              status: 'MIGRATED',
              derivedFilePath: derivedPath,
              originalUrl: docData.url
            });
          } catch (err) {
            report.requiresManualRemediation++;
            report.modules[name].failed++;
            report.modules[name].details.push({
              id: doc._id.toString(),
              status: 'MIGRATION_SIGN_FAILED',
              url: docData.url,
              error: err.message
            });
          }
        } else {
          report.requiresManualRemediation++;
          report.modules[name].failed++;
          report.modules[name].details.push({
            id: doc._id.toString(),
            status: 'CANNOT_DERIVE_PATH',
            url: docData.url
          });
        }
      } else {
        report.requiresManualRemediation++;
        report.modules[name].failed++;
        report.modules[name].details.push({
          id: doc._id.toString(),
          status: 'NO_PATH_OR_URL',
          fileId: docData.fileId
        });
      }
    }
  }

  console.log('\n--- MIGRATION REPORT SUMMARY ---');
  console.log(`Total Records Audited:              ${report.totalAudited}`);
  console.log(`Records with Documents:             ${report.totalWithDocuments}`);
  console.log(`Already Compatible:                 ${report.alreadyCompatible}`);
  console.log(`Successfully Migrated:              ${report.successfullyMigrated}`);
  console.log(`Requiring Manual Remediation:       ${report.requiresManualRemediation}`);
  console.log('\nPer Module Breakdown:');
  for (const [mod, data] of Object.entries(report.modules)) {
    console.log(`  ${mod.padEnd(16)}: Total=${data.total}, Docs=${data.withDocument}, Compatible=${data.alreadyCompatible}, Migrated=${data.migrated}, Failed=${data.failed}`);
  }

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB. Migration completed successfully.');
  return report;
};

if (require.main === module) {
  runMigration().catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
}

module.exports = { runMigration, extractFilePathFromUrl };
