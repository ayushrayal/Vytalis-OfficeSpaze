const ImageKit = require('@imagekit/nodejs');

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const uploadAgreement = async (fileBuffer, fileName) => {
  const safeFileName = fileName || `agreement_${Date.now()}`;
  const file = await ImageKit.toFile(fileBuffer, safeFileName);

  const response = await client.files.upload({
    file,
    fileName: safeFileName,
    folder: '/VytalisOfficeSpaze/Virtual-Space/agreements'
  });

  return {
    url: response.url,
    fileId: response.fileId,
    fileName: response.name || safeFileName
  };
};

const deleteAgreement = async (fileId) => {
  if (!fileId) return;
  await client.files.delete(fileId);
};

module.exports = {
  uploadAgreement,
  deleteAgreement
};
