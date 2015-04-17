module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		mochaTest: {
			options: {
				timeout: 3000,
				reporter: 'spec',
				ignoreLeaks: false
			},
			unit: {
				src: ['test/**/*_test.js']
			},
		},
		appcJs: {
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		kahvesi: { src: 'test/**/*_test.js' },
		appc_coverage: {
			default_options: {
				src: 'coverage/lcov.info',
				force: true
			}
		},
		bump: {
			options: {
				files: ['package.json'],
				commitFiles: ['package.json'],
				pushTo: 'appcelerator'
			}
		}
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-appc-js');
	grunt.loadNpmTasks('grunt-kahvesi');
	grunt.loadNpmTasks('grunt-appc-coverage');

	// compose our various coverage reports into one html report
	grunt.registerTask('report', function() {
		var done = this.async();
		exec('./node_modules/grunt-kahvesi/node_modules/.bin/istanbul report html', function(err) {
			if (err) { grunt.fail.fatal(err); }
			grunt.log.ok('composite test coverage report generated at ./coverage/index.html');
			return done();
		});
	});

	// register tasks
	grunt.registerTask('default', ['appcJs','mochaTest:unit','kahvesi','appc_coverage']);
};
