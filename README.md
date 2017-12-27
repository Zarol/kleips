# kleips
[![Hexo.io](https://img.shields.io/badge/powered%20by-hexo-blue.svg?style=for-the-badge)](//hexo.io/)
[![www.kleips.com](https://img.shields.io/badge/built%20with-%E2%99%A5-orange.svg?style=for-the-badge)](//www.kleips.com/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D%207.6.0-green.svg?style=for-the-badge)](//nodejs.org/)

This repository contains the source code that's building my blog and personal website.

I started this project to learn more about web infrastructure and become more familiar with the current technologies related to web development. Also, apparently everybody is writing blogs, so here I am.

## Development
```
npm install -g hexo-cli
npm install
npm start
```

## Deployment
Current deployment generates all related files to the `public/` folder and uploads it to my S3 bucket. The AWS creditentials are stored via [AWS environment variables](http://docs.aws.amazon.com/cli/latest/userguide/cli-environment.html). Deployment has also been integrated into CircleCI.

### [Staging](http://staging.kleips.com)
This environment doesn't sit behind CloudFront so updates are immediately visible. CircleCI will also automatically deploy any changes made to the `develop` branch to staging. This probably shouldn't be publicly accessible, but it's just a static site.
```
npm run deploy:staging
```

### [Production](//www.kleips.com/)
This environment sits behind CloudFront. Currently manual invalidation of the CloudFront cache needs to be performed to see the updates. I'd like to automate this by invalidating only files that have changed when uploaded. CircleCI will also automatically deploy any changes made to the `master` branch to production.
```
npm run deploy:production
```

## Want to Use This?
You'll need to change some minor things first.
- `_config.yml`, `themes/theme/_config.yml` Should contain information about your website.
- `build_scripts/*` Will need to be modified to use your S3 bucket name, your domain, etc. The necessary changes are easy to notice. I might make these scripts a bit more generic in the future.
- `source/_posts/*` You'll need to delete the stuff in here since it pertains to my blog posts.
