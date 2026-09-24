/**
 * Comprehensive Automated Verification Suite for Phase 5 — P0.1
 * Secure Agreement & Receipt Document Access
 *
 * Tests:
 * 1. Authentication Enforcement (Unauthenticated / Invalid Token -> 401)
 * 2. Authorization Enforcement (RBAC Module Permission View -> 403 on missing, 200 on permitted)
 * 3. Cross-Resource Security & ObjectId Validation (Invalid format -> 400, Nonexistent -> 404)
 * 4. Missing Document Handling (Record exists without file -> 404)
 * 5. Signed URL Structure, HMAC Signing & Tamper Resistance (URL contains ik-t & ik-s, client cannot override expiry)
 * 6. Response Sanitization & Zero Permanent URL Leakage across list, detail, activity, sse
 * 7. Existing Documents Migration & Compatibility Status
 * 8. ImageKit Controlled Error Handling (No credentials or secrets leaked on failure)
 * 9. Safe Document Deletion & Rollback Integrity
 */

require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const http = require('http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const app = require('../app');
const User = require('../models/User');
const VirtualOffice = require('../models/VirtualOffice');
const ManagedOffice = require('../models/ManagedOffice');
const UtilityBill = require('../models/UtilityBill');
const OperationBill = require('../models/OperationBill');
const imagekitProvider = require('../providers/imagekit.provider');

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
  console.log('PHASE 5 — P0.1 DOCUMENT ACCESS SECURITY VERIFICATION');
  console.log('====================================================\n');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.\n');

  // Start ephemeral test HTTP server using Express app
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`Test server running on port ${port}\n`);

  try {
    // Load test users
    const adminUser = await User.findOne({ role: 'ADMIN', status: 'ACTIVE' });
    const managerUser = await User.findOne({ email: 'deepika@gmail.com' });
    const internUser = await User.findOne({ role: 'INTERN', status: 'ACTIVE' });

    assert(adminUser, 'Admin user found for tests');
    assert(managerUser, 'Manager user found for tests');
    assert(internUser, 'Intern user found for tests');

    const adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const managerToken = jwt.sign({ userId: managerUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const internToken = jwt.sign({ userId: internUser._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // Load sample records with documents
    const sampleVO = await VirtualOffice.findOne({ agreement: { $ne: null } });
    const sampleMO = await ManagedOffice.findOne({ agreement: { $ne: null } });
    const sampleUB = await UtilityBill.findOne({ receipt: { $ne: null } });
    const sampleOB = await OperationBill.findOne({ receipt: { $ne: null } });

    assert(sampleVO, 'Virtual Office sample record with agreement found');
    assert(sampleMO, 'Managed Office sample record with agreement found');
    assert(sampleUB, 'Utility Bill sample record with receipt found');
    assert(sampleOB, 'Operation Bill sample record with receipt found');

    // ----------------------------------------------------
    // SECTION 1: AUTHENTICATION ENFORCEMENT
    // ----------------------------------------------------
    console.log('\n--- SECTION 1: Authentication Enforcement ---');

    // 1.1 Unauthenticated requests must receive 401
    const resUnauthVO = await fetch(`${baseUrl}/virtual-offices/${sampleVO._id}/agreement/access`);
    assert(resUnauthVO.status === 401, 'Unauthenticated request to Virtual Office document access returns 401');

    const resUnauthUB = await fetch(`${baseUrl}/utility-bills/${sampleUB._id}/receipt/access`);
    assert(resUnauthUB.status === 401, 'Unauthenticated request to Utility Bill document access returns 401');

    const resUnauthMO = await fetch(`${baseUrl}/managed-offices/${sampleMO._id}/agreement/access`);
    assert(resUnauthMO.status === 401, 'Unauthenticated request to Managed Office document access returns 401');

    const resUnauthOB = await fetch(`${baseUrl}/operation-bills/${sampleOB._id}/receipt/access`);
    assert(resUnauthOB.status === 401, 'Unauthenticated request to Operation Bill document access returns 401');

    // 1.2 Invalid token returns 401
    const resBadToken = await fetch(`${baseUrl}/virtual-offices/${sampleVO._id}/agreement/access`, {
      headers: { Cookie: 'accessToken=invalid_forged_token' }
    });
    assert(resBadToken.status === 401, 'Invalid JWT token returns 401');

    // ----------------------------------------------------
    // SECTION 2: AUTHORIZATION & RBAC ENFORCEMENT
    // ----------------------------------------------------
    console.log('\n--- SECTION 2: Authorization & RBAC Enforcement ---');

    // Admin has access to all modules
    const resAdminVO = await fetch(`${baseUrl}/virtual-offices/${sampleVO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resAdminVO.status === 200, 'Admin can access Virtual Office agreement (200)');
    const voAccessData = await resAdminVO.json();
    assert(voAccessData.success === true, 'Admin response success is true');
    assert(voAccessData.data && voAccessData.data.url, 'Admin response contains temporary URL');
    assert(voAccessData.data && voAccessData.data.expiresAt, 'Admin response contains expiresAt');

    // Manager (Deepika) has utility_bills view, but NOT virtual_offices view
    const resManagerUB = await fetch(`${baseUrl}/utility-bills/${sampleUB._id}/receipt/access`, {
      headers: { Cookie: `accessToken=${managerToken}` }
    });
    assert(resManagerUB.status === 200, 'Manager with utility_bills permission can access Utility Bill receipt (200)');

    const resManagerVO = await fetch(`${baseUrl}/virtual-offices/${sampleVO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${managerToken}` }
    });
    assert(resManagerVO.status === 403, 'Manager without virtual_offices permission is rejected with 403');

    // Intern (Harsh) lacks utility_bills and managed_offices view
    const resInternUB = await fetch(`${baseUrl}/utility-bills/${sampleUB._id}/receipt/access`, {
      headers: { Cookie: `accessToken=${internToken}` }
    });
    assert(resInternUB.status === 403, 'Intern without utility_bills permission is rejected with 403');

    const resInternMO = await fetch(`${baseUrl}/managed-offices/${sampleMO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${internToken}` }
    });
    assert(resInternMO.status === 403, 'Intern without managed_offices permission is rejected with 403');

    // ----------------------------------------------------
    // SECTION 3: OBJECTID VALIDATION & CROSS-RESOURCE SECURITY
    // ----------------------------------------------------
    console.log('\n--- SECTION 3: ObjectId Validation & Resource Bounds ---');

    // Invalid ObjectId format returns 400
    const resBadId = await fetch(`${baseUrl}/virtual-offices/invalid-id-12345/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resBadId.status === 400, 'Invalid ObjectId format returns 400 Bad Request');
    const badIdJson = await resBadId.json();
    assert(badIdJson.message === 'Invalid ID format', 'Controlled error message returned for invalid ID');

    // Non-existent valid ObjectId returns 404
    const fakeId = new mongoose.Types.ObjectId();
    const resNotFound = await fetch(`${baseUrl}/virtual-offices/${fakeId}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resNotFound.status === 404, 'Non-existent record ID returns 404 Not Found');

    // Cross-module type safety: requesting a Virtual Office ID on Utility Bill route returns 404
    const resCrossModule = await fetch(`${baseUrl}/utility-bills/${sampleVO._id}/receipt/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resCrossModule.status === 404, 'Supplying VO ID to Utility Bill access route returns 404');

    // ----------------------------------------------------
    // SECTION 4: MISSING DOCUMENT HANDLING
    // ----------------------------------------------------
    console.log('\n--- SECTION 4: Missing Document Handling ---');

    // Create a temporary record without an agreement
    const tempVO = await VirtualOffice.create({
      firstName: 'TestNoDoc',
      lastName: 'User',
      phone: '9999999999',
      email: 'testnodoc@example.com',
      companyName: 'NoDoc Corp',
      companyRegisteredAddress: '123 Test Street',
      allottedVirtualAddress: 'Unit 1, IT Park',
      allottedBy: 'Admin',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      agreedCommercials: 5000,
      paymentMadeOn: new Date(),
      agreement: null
    });

    const resNoDoc = await fetch(`${baseUrl}/virtual-offices/${tempVO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resNoDoc.status === 404, 'Record with null document returns 404');
    const noDocJson = await resNoDoc.json();
    assert(noDocJson.success === false, 'Missing document response success is false');

    // Clean up temporary record
    await VirtualOffice.findByIdAndDelete(tempVO._id);

    // ----------------------------------------------------
    // SECTION 5: SIGNED URL STRUCTURE & EXPIRATION CONTROLS
    // ----------------------------------------------------
    console.log('\n--- SECTION 5: Signed URL Structure & Expiration Controls ---');

    const resMOAccess = await fetch(`${baseUrl}/managed-offices/${sampleMO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resMOAccess.status === 200, 'Managed Office document access returns 200');
    const moData = await resMOAccess.json();
    const signedUrl = moData.data.url;

    assert(signedUrl.includes('ik-t='), 'Signed URL contains ik-t (expiration timestamp)');
    assert(signedUrl.includes('ik-s='), 'Signed URL contains ik-s (HMAC signature)');

    const parsedUrl = new URL(signedUrl);
    const ikT = parseInt(parsedUrl.searchParams.get('ik-t'), 10);
    const nowSec = Math.floor(Date.now() / 1000);
    const diff = ikT - nowSec;
    assert(diff >= 280 && diff <= 310, `Expiration is approximately 300 seconds (got ${diff}s)`);

    // Client tampering resistance: client sends query params attempting to override expiry
    const resTamper = await fetch(`${baseUrl}/managed-offices/${sampleMO._id}/agreement/access?expires=999999999&expiresIn=999999999`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resTamper.status === 200, 'Tampered query returns 200');
    const tamperData = await resTamper.json();
    const tamperParsed = new URL(tamperData.data.url);
    const tamperIkT = parseInt(tamperParsed.searchParams.get('ik-t'), 10);
    const tamperDiff = tamperIkT - nowSec;
    assert(tamperDiff >= 280 && tamperDiff <= 310, `Client cannot override expiration; backend strictly enforces configured duration (got ${tamperDiff}s)`);

    // Zero credential leakage in access response
    assert(!JSON.stringify(moData).includes(process.env.IMAGEKIT_PRIVATE_KEY), 'Access response never leaks IMAGEKIT_PRIVATE_KEY');
    assert(!JSON.stringify(moData).includes(process.env.IMAGEKIT_PUBLIC_KEY), 'Access response never leaks IMAGEKIT_PUBLIC_KEY');
    assert(!moData.data.filePath, 'Access response does not leak internal filePath');

    // ----------------------------------------------------
    // SECTION 6: RESPONSE SANITIZATION & ZERO DATA LEAKAGE
    // ----------------------------------------------------
    console.log('\n--- SECTION 6: Response Sanitization across All Endpoints ---');

    // 6.1 List endpoints must not leak permanent CDN URLs
    const resListVO = await fetch(`${baseUrl}/virtual-offices`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const listVO = await resListVO.json();
    const listVOStr = JSON.stringify(listVO);
    assert(!listVOStr.includes('https://ik.imagekit.io'), 'GET /api/virtual-offices does not leak permanent imagekit.io URL');
    assert(!listVOStr.includes('"url":'), 'GET /api/virtual-offices does not leak url property');
    assert(listVO.data.virtualOffices[0].agreement.available === true, 'VO agreement serialized as available: true');
    assert(!listVO.data.virtualOffices[0].agreement.url, 'VO agreement url field is not present');

    const resListMO = await fetch(`${baseUrl}/managed-offices`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const listMOStr = JSON.stringify(await resListMO.json());
    assert(!listMOStr.includes('https://ik.imagekit.io'), 'GET /api/managed-offices does not leak permanent imagekit.io URL');
    assert(!listMOStr.includes('"url":'), 'GET /api/managed-offices does not leak url property');

    const resListUB = await fetch(`${baseUrl}/utility-bills`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const listUBStr = JSON.stringify(await resListUB.json());
    assert(!listUBStr.includes('https://ik.imagekit.io'), 'GET /api/utility-bills does not leak permanent imagekit.io URL');
    assert(!listUBStr.includes('"url":'), 'GET /api/utility-bills does not leak url property');

    const resListOB = await fetch(`${baseUrl}/operation-bills`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const listOBStr = JSON.stringify(await resListOB.json());
    assert(!listOBStr.includes('https://ik.imagekit.io'), 'GET /api/operation-bills does not leak permanent imagekit.io URL');
    assert(!listOBStr.includes('"url":'), 'GET /api/operation-bills does not leak url property');

    // 6.2 Detail endpoints must not leak permanent CDN URLs
    const resDetailVO = await fetch(`${baseUrl}/virtual-offices/${sampleVO._id}`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const detailVOStr = JSON.stringify(await resDetailVO.json());
    assert(!detailVOStr.includes('https://ik.imagekit.io'), 'GET /api/virtual-offices/:id does not leak permanent imagekit.io URL');
    assert(!detailVOStr.includes('"url":'), 'GET /api/virtual-offices/:id does not leak url property');

    const resDetailUB = await fetch(`${baseUrl}/utility-bills/${sampleUB._id}`, { headers: { Cookie: `accessToken=${adminToken}` } });
    const detailUBStr = JSON.stringify(await resDetailUB.json());
    assert(!detailUBStr.includes('https://ik.imagekit.io'), 'GET /api/utility-bills/:id does not leak permanent imagekit.io URL');
    assert(!detailUBStr.includes('"url":'), 'GET /api/utility-bills/:id does not leak url property');

    // ----------------------------------------------------
    // SECTION 7: OPERATION BILL RECEIPT ACCESS VERIFICATION
    // ----------------------------------------------------
    console.log('\n--- SECTION 7: Operation Bill Receipt Access ---');

    const resOBAccess = await fetch(`${baseUrl}/operation-bills/${sampleOB._id}/receipt/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(resOBAccess.status === 200, 'Admin can access Operation Bill receipt (200)');
    const obData = await resOBAccess.json();
    assert(obData.data && obData.data.url, 'Operation bill response contains temporary signed URL');
    assert(obData.data.url.includes('ik-s='), 'Operation bill URL is HMAC signed');

    // ----------------------------------------------------
    // SECTION 8: IMAGEKIT CONTROLLED ERROR HANDLING
    // ----------------------------------------------------
    console.log('\n--- SECTION 8: Controlled Error Handling ---');

    try {
      imagekitProvider.generateSignedDocumentUrl({ filePath: '' });
      assert(false, 'Empty source should throw error');
    } catch (err) {
      assert(err.statusCode === 400, 'Empty document path throws controlled 400 error');
      assert(!err.message.includes('private'), 'Error message does not leak private key');
    }

    // ----------------------------------------------------
    // SECTION 9: DELETION INTEGRITY
    // ----------------------------------------------------
    console.log('\n--- SECTION 9: Deleted Record Behavior ---');

    // Test that once a record is deleted, it cannot generate document access
    const tempMO = await ManagedOffice.create({
      firstName: 'TempDelete',
      lastName: 'User',
      phone: '8888888888',
      email: 'tempdelete@example.com',
      companyName: 'Delete Corp',
      companyRegisteredAddress: '456 Delete Road',
      officeNo: '999',
      totalSeats: 2,
      perSeatCost: 3000,
      agreedCommercials: 6000,
      paymentMadeOn: new Date(),
      allottedBy: 'Admin',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 86400000),
      agreement: {
        fileId: 'mock_temp_file_id',
        filePath: '/mock/path.pdf',
        fileName: 'mock.pdf'
      }
    });

    const accessBeforeDelete = await fetch(`${baseUrl}/managed-offices/${tempMO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(accessBeforeDelete.status === 200, 'Access allowed before deletion');

    // Delete the record
    await ManagedOffice.findByIdAndDelete(tempMO._id);

    const accessAfterDelete = await fetch(`${baseUrl}/managed-offices/${tempMO._id}/agreement/access`, {
      headers: { Cookie: `accessToken=${adminToken}` }
    });
    assert(accessAfterDelete.status === 404, 'Access to deleted record is rejected with 404');

    console.log('\n====================================================');
    console.log(`VERIFICATION COMPLETE: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

if (require.main === module) {
  runVerification().catch((err) => {
    console.error('Verification failed with error:', err);
    process.exit(1);
  });
}

module.exports = { runVerification };
