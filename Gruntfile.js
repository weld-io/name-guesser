'use strict';

var request = require('request');

module.exports = function (grunt) {
	// show elapsed time at the end
	require('time-grunt')(grunt);
	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	var reloadPort = 35728, files;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		develop: {
			server: {
				file: 'lib/server.js'
			}
		},
		watch: {
			options: {
				nospawn: true,
				livereload: reloadPort
			},
			server: {
				files: [
					'lib/*.js',
					'app.js',
					'routes/*.js',
					'config/*.json'
				],
				tasks: ['develop', 'delayed-livereload']
			},
			js: {
				files: ['public/js/*.js'],
				options: {
					livereload: reloadPort
				}
			},
			css: {
				files: ['public/css/*.css'],
				options: {
					livereload: reloadPort
				}
			},
			views: {
				files: ['views/*.ejs'],
				options: {
					livereload: reloadPort
				}
			}
		}
	});

	grunt.config.requires('watch.server.files');
	files = grunt.config('watch.server.files');
	files = grunt.file.expand(files);

	grunt.registerTask('delayed-livereload', 'Live reload after the node server has restarted.', function () {
		var done = this.async();
		setTimeout(function () {
			request.get('http://localhost:' + reloadPort + '/changed?files=' + files.join(','),  function (err, res) {
					var reloaded = !err && res.statusCode === 200;
					if (reloaded) {
						grunt.log.ok('Delayed live reload successful.');
					} else {
						grunt.log.error('Unable to make a delayed live reload.');
					}
					done(reloaded);
				});
		}, 500);
	});

	grunt.registerTask('serve', [
		'develop',
		'watch'
	]);

	grunt.registerTask('default', [
		'serve'
	]);

};