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
		jshint: {
			options: {
				jshintrc: true
			},
			src: ['lib/**/*.js', 'test/**/*.js']
		},
		kahvesi: { src: 'test/**/*_test.js' },
		coveralls: {
		    options: {
		      // LCOV coverage file relevant to every target
		      src: 'coverage/lcov.info',

		      // When true, grunt-coveralls will only print a warning rather than
		      // an error, to prevent CI builds from failing unnecessarily (e.g. if
		      // coveralls.io is down). Optional, defaults to false.
		      force: false
		    },
		    grunt_coveralls: {
		      // Target-specific LCOV coverage file
		      src: 'coverage/lcov.info'
		    },
		  },
	});

	// Load grunt plugins for modules
	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-kahvesi');
	grunt.loadNpmTasks('grunt-coveralls');

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
	grunt.registerTask('default', ['jshint','mochaTest:unit','kahvesi','coveralls']);
};
