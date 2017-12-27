const fs = require('fs');
const path = require('path');
const crypto = require('crypto')
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const mime = require('mime');
const chalk = require('chalk');

function uploadFile(bucket, key, content) {
  s3.putObject({
    Bucket: bucket,
    Key: key,
    Body: content,
    ContentType: mime.getType(key),
    CacheControl: 'max-age=630720000, public',
    Expires: new Date(Date.now() + 63072000000)
  }, (res) => {
    console.log(chalk.green('INFO  ') + 'Uploaded: ' + chalk.magenta(key));
  });
}

function mapDiff(local, remote) {
  let filesToUpload = [];

  for (let key in local) {
    // Local file does not exist remotely (new file)
    if (remote[key] === undefined) {
      filesToUpload.push(key);
      continue;
    }
    // Local file exists remotely, different Etag (changed file)
    if (remote[key] !== null && remote[key] !== local[key]) {
      filesToUpload.push(key);
      continue;
    }
    // Local file exists remotely, same Etag (same file)
    console.log(chalk.green('INFO  ') + 'Unchanged: ' + chalk.yellow(key));
  }
  return filesToUpload;
}

function walkDir(dir, map) {
  let folder = fs.readdirSync(dir);

  // Base case
  if (!folder || folder.length === 0) {
    return;
  }

  // Iterate through every path in the folder
  folder.forEach(function(file) {
    let filePath = path.join(dir, file);

    // Recursively call directories
    if (fs.lstatSync(filePath).isDirectory()) {
      walkDir(filePath, map);
      return;
    }

    // The key is the full file path, since this is the S3 key
    let key = path.relative('public/', filePath);

    // Generate hash - ETag uses MD5
    let hash = crypto.createHash('md5');
    hash.update(fs.readFileSync(filePath), 'utf8');
    map[key] = `"${hash.digest('hex')}"`;
  });
}

function main() {
  let bucket = '';
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
  // Build map of local files
  let localFiles = {};
  walkDir("public/", localFiles);

  // This works up to 1000 objects, will need to maybe fix this
  s3.listObjectsV2({
    Bucket: bucket
  }, function(err, data) {
    if (err) {
      return console.log(err);
    }
    // Build map of remote files
    let remoteFiles = data.Contents.reduce(function(map, obj) {
      map[obj.Key] = obj.ETag;
      return map;
    }, {});

    let filesToUpload = mapDiff(localFiles, remoteFiles);

    filesToUpload.forEach(function(file) {
      uploadFile(bucket, file,
        fs.readFileSync(path.join('public/', file)));
    });
  });
}

main();