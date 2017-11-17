module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        aws: grunt.file.readJSON('credentials.json'),
        shell: {
            clean: {
                command: 'hexo clean'
            },
            generate: {
                command: 'hexo generate'
            },
            server: {
                command: 'hexo server'
            }
        },
        robotstxt: {
            dev: {
                dest: 'public/',
                policy: [
                {
                    ua : '*',
                    disallow: '/'
                },
                {
                    sitemap: ['http://localhost:4000/sitemap.xml']
                },
                {
                    host: 'localhost:4000'
                }
                ]
            },
            staging: {
                dest: 'public/',
                policy: [
                {
                    ua : '*',
                    disallow: '/'
                },
                ]
            },
            production: {
                dest: 'public/',
                policy: [
                {
                    ua : '*',
                    allow: '/'
                },
                {
                    sitemap: ['http://kleips.com/sitemap.xml']
                },
                {
                    host: 'kleips.com'
                },
                ]
            }
        },
        sitemap: {
            dev: {
                siteRoot: 'public/',
                homepage: 'http://localhost:4000'
            },
            staging: {
                siteRoot: 'public/',
                homepage: 'http://staging.kleips.com'
            },
            production: {
                siteRoot: 'public/',
                homepage: 'http://kleips.com'
            }
        },
        aws_s3: {
			options: {
				accessKeyId: '<%= aws.accessKeyId %>',
                secretAccessKey: '<%= aws.secretAccessKey %>',
				access: 'public-read',
				region: 'us-west-1',
                params: {
                    // Two Year Cache Policy
                    'CacheControl': 'max-age=630720000, public',
                    'Expires': new Date(Date.now() + 63072000000)
                },
				differential: true,
				displayChangesOnly: true,
				uploadConcurrency: 5
			},
            staging: {
                options: {
                    bucket: '<%= aws.staging.bucket %>',
                },
                files: [
					{
						action: 'upload',
						expand: true,
						cwd: 'public/',
						src: ['**'],
						dest: '/'
					}
                ]
            },
            production: {
                options: {
                    bucket: '<%= aws.production.bucket %>',
                },
                files: [
					{
						action: 'upload',
						expand: true,
						cwd: 'public/',
						src: ['**'],
						dest: '/'
					}
                ]
            }
        }
    });
    //Load NPM tasks
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-robots-txt')
    grunt.loadNpmTasks('grunt-sitemap');
    grunt.loadNpmTasks('grunt-aws-s3');

    //Grunt tasks
    grunt.registerTask('default', ['shell:clean', 'shell:generate','sitemap:dev','robotstxt:dev', 'shell:server']);
    grunt.registerTask('staging', ['shell:clean','shell:generate','sitemap:staging', 'robotstxt:staging', 'aws_s3:staging']);
    grunt.registerTask('production', ['shell:clean','shell:generate','sitemap:production', 'robotstxt:production', 'aws_s3:production']);
};