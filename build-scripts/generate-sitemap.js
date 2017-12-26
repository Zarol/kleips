const fs = require('fs');
const path = require('path');
const sitemap = require('sitemap');

function buildUrls(hostname, dir, arr) {
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
      buildUrls(hostname, filePath, arr);
      return;
    }

    // Skip files that aren't html files
    if (file.indexOf('.html') === -1) {
      return;
    }

    let webPath = path.relative('public/', filePath);

    //Pretty Urls
    if (path.basename(webPath) === 'index.html') {
      let d = path.dirname(webPath);
      webPath = d === '.' ? '' : d;
    } else {
      webPath = path.join(
        path.dirname(webPath),
        path.basename(webPath, '.html')
      );
    }

    arr.push(hostname + webPath);
  });
}

function buildSitemapUrls(hostname) {
  let urls = [];
  buildUrls(hostname, 'public/', urls);
  let sitemapUrls = [];

  urls.forEach(function(url) {
    sitemapUrls.push({
      url: url,
      changefreq: 'daily',
      priority: 0.5
    });
  });

  return sitemapUrls;
}

async function main() {
  let hostname;
  switch (process.argv[2]) {
    case 'staging':
      hostname = 'https://staging.kleips.com/';
      break;
    case 'prod':
      hostname = 'https://www.kleips.com/';
      break;
    case 'dev':
    default:
      hostname = 'http://localhost:4000/';
      break;
  }

  let content = await sitemap.createSitemap({
    hostname: hostname,
    cacheTime: 600000,
    urls: buildSitemapUrls(hostname)
  });

  fs.writeFile('public/sitemap.xml', content.toString(), function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The sitemap.xml file was saved!');
  });
}

main();