const fs = require('fs');
const path = require('path');
const util = require('util');
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const flatCache = require('flat-cache');
const hasha = require('hasha');
const cache = flatCache.load('public', path.resolve('cache/'));
var bucket = '';

function uploadDir(dir) {
  let folderPath = path.join('./', dir);
  let folder = fs.readdirSync(folderPath);

  // Base case
  if (!folder || folder.length === 0) {
    return;
  }

  // Iterate through every path in the folder
  folder.forEach(function(file) {
    let filePath = path.join(folderPath, file);

    // Recursively call directories
    if (fs.lstatSync(filePath).isDirectory()) {
      uploadDir(filePath);
      return;
    }

    content = fs.readFileSync(filePath);

    // The key is the full file path, since this is the S3 key
    let key = path.relative('public/', filePath);

    // Generate hash
    let fileHash = hasha.fromFileSync(filePath, { algorithm: 'sha1' });

    // File is in the cache, no need to upload
    if (cache.getKey(key) === fileHash) {
      console.log('Skipping unmodified file: ' + key);
      return;
    }

    // Set new hash
    cache.setKey(key, fileHash);

    // Upload to S3
    s3.putObject({
      Bucket: 'www.kleips.com',
      Key: key,
      Body: content,
      CacheControl: 'max-age=630720000, public',
      Expires: new Date(Date.now() + 63072000000)
    }, (res) => {
      console.log('Successfully uploaded: ' + key);
    });
  });
}

function main() {
  switch (process.argv[2]) {
    case 'staging':
      bucket = 'staging.kleips.com';
      break;
    case 'prod':
      bucket = 'www.kleips.com';
      break;
    default:
      console.log('Invalid environment.');
      return;
  }
  uploadDir("public/");
  cache.save();
}

main();