const fs = require('fs');
const robotstxt = require('generate-robotstxt').default;

async function main() {
  let content;

  switch (process.argv[2]) {
    case 'staging':
      content = await robotstxt({
        policy: [{
          userAgent: '*',
          disallow: '/',
        }]
      });
      break;
    case 'prod':
      content = await robotstxt({
        policy: [{
          userAgent: '*',
          allow: '/',
        }],
        sitemap: 'https://www.kleips.com/sitemap.xml',
        host: 'www.kleips.com'
      });
      break;
    case 'dev':
    default:
      content = await robotstxt({
        policy: [{
          userAgent: '*',
          disallow: '/',
        }],
        sitemap: 'http://localhost:4000/sitemap.xml',
        host: 'localhost:4000'
      });
      break;
  }

  fs.writeFile('public/robots.txt', content, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log('The robots.txt file was saved!');
  });
}

main();