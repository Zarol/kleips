const fs = require('fs');
const path = require('path');
const sitemap = require('sitemap');
const walk = require('walkdir');

function buildUrls(hostname) {
  let urls = [];
  walk.sync('public/', function(file) {
    //Skip files that aren't html files
    if (file.indexOf('.html') === -1) {
      return;
    }

    let filepath = path.relative('public/', file);

    //Pretty Urls
    if (path.basename(filepath) === 'index.html') {
      let dir = path.dirname(filepath);
      filepath = dir === '.' ? '' : dir;
    } else {
      filepath = path.join(
        path.dirname(filepath),
        path.basename(filepath, '.html')
      );
    }

    urls.push(hostname + filepath);
  });

  return urls;
}

function buildSitemapUrls(hostname) {
  let urls = buildUrls(hostname);
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