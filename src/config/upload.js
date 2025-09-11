// src/config/upload.js
// Set these flags based on your environment or .env file
const uploadConfig = {
  UPLOAD_DRIVER: 's3', // s3 or 'local'
  S3_IS_PRE_SIGNED: true // true or false
};

export default uploadConfig;
