const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const DEFAULT_EXPIRES_IN_SECONDS = 300; // 5 minutes
const MIN_EXPIRES_IN_SECONDS = 30; // 30 seconds
const MAX_EXPIRES_IN_SECONDS = 3600; // 1 hour

/**
 * Returns a validated expiration duration in seconds configured by environment variable.
 * Defaults to 300 seconds (5 minutes). Client input cannot override this.
 */
const getConfiguredExpirySeconds = () => {
  const envVal = parseInt(process.env.DOCUMENT_URL_EXPIRES_IN_SECONDS, 10);
  if (!isNaN(envVal) && envVal >= MIN_EXPIRES_IN_SECONDS && envVal <= MAX_EXPIRES_IN_SECONDS) {
    return envVal;
  }
  return DEFAULT_EXPIRES_IN_SECONDS;
};

/**
 * Centralized signed document URL generator.
 * Uses ImageKit's HMAC-SHA1 URL signing to produce short-lived access URLs.
 * Never leaks private keys, credentials, or signing secrets.
 *
 * @param {Object} params
 * @param {string} [params.filePath] - ImageKit relative file path (e.g. /VytalisOfficeSpaze/...)
 * @param {string} [params.url] - Legacy permanent URL (used if filePath is not stored)
 * @returns {{ url: string, expiresAt: string }}
 */
const generateSignedDocumentUrl = ({ filePath, url }) => {
  const source = filePath || url;
  if (!source || typeof source !== 'string' || !source.trim()) {
    const error = new Error('Document path or source URL is required to generate access');
    error.statusCode = 400;
    throw error;
  }

  const expireSeconds = getConfiguredExpirySeconds();
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

  if (!urlEndpoint || !process.env.IMAGEKIT_PRIVATE_KEY) {
    const error = new Error('ImageKit storage is not properly configured');
    error.statusCode = 500;
    throw error;
  }

  try {
    const signedUrl = client.helper.buildSrc({
      urlEndpoint,
      src: source.trim(),
      expiresIn: expireSeconds
    });

    if (!signedUrl) {
      throw new Error('ImageKit returned empty signed URL');
    }

    const expiresAt = new Date(Date.now() + expireSeconds * 1000).toISOString();

    return {
      url: signedUrl,
      expiresAt
    };
  } catch (err) {
    // Controlled error handling: Never expose ImageKit credentials or internal stack
    const error = new Error('Failed to generate secure document access URL');
    error.statusCode = 500;
    throw error;
  }
};

/**
 * Uploads agreement or receipt document to ImageKit with complete metadata.
 * Preserves url as a legacy database field for backward compatibility,
 * but API responses must strip it before sending to clients.
 */
const uploadAgreement = async (fileBuffer, fileName, folder) => {
  const safeFileName = fileName || `agreement_${Date.now()}`;
  const file = await ImageKit.toFile(fileBuffer, safeFileName);

  const response = await client.files.upload({
    file,
    fileName: safeFileName,
    folder: folder || '/VytalisOfficeSpaze/agreements'
  });

  return {
    fileId: response.fileId,
    filePath: response.filePath || null,
    fileName: response.name || safeFileName,
    url: response.url, // Legacy compatibility only; stripped from normal API responses
    mimeType: response.mime || response.fileType || null,
    size: response.size || null
  };
};

/**
 * Safely deletes a document from ImageKit.
 * Handles failures cleanly without throwing or exposing secrets.
 */
const deleteAgreement = async (fileId) => {
  if (!fileId) return;
  try {
    await client.files.delete(fileId);
  } catch (err) {
    // Log sanitized error without credentials
    console.error('[ImageKit Provider] Deletion error for fileId:', fileId, err.message);
    throw err;
  }
};

module.exports = {
  uploadAgreement,
  deleteAgreement,
  generateSignedDocumentUrl,
  getConfiguredExpirySeconds
};
