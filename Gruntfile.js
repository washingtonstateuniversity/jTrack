module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		clean: {
			root: "<%= pkg.version %>*.js",
			distro: "distro/"
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> (<%= pkg.version %>) <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			min: {
				src: 'build/jtrack.js',
				dest: 'build/jtrack.min.js'
			},
			bootstrap_min: {
				src: 'build/bootstrap/bootstrap.js',
				dest: 'build/bootstrap/bootstrap.min.js'
			}
		},
		concat:{
			bootstrap_scripts: {
				src: [
					"src/bootstrap/src/init.js",
					"src/bootstrap/src/default_events.js",
					"src/bootstrap/src/default_ui-events.js",
					"src/bootstrap/src/bootstrap.js"
				],
				dest: "build/bootstrap/bootstrap.js"
			},
			scripts: {
				src: [
					"src/jtrack.js"
				],
				dest: "build/jtrack.js"
			}
		},
		copy:{
			ready:{
				files: [
					{ src: "build/jtrack.js", dest: "distro/jtrack.js"},
					{ src: "build/jtrack.min.js", dest: "distro/jtrack.min.js"},
					{ src: "build/jtrack.js", dest: "jtrack.js"},
					{ src: "build/jtrack.min.js", dest: "jtrack.min.js"},
				]
			},
			bootstrap_ready:{
				files: [
					{ src: "build/bootstrap/bootstrap.js", dest: "distro/bootstrap/bootstrap.js"},
					{ src: "build/bootstrap/bootstrap.min.js", dest: "distro/bootstrap/bootstrap.min.js"},
					{ src: "build/bootstrap/bootstrap.js", dest: "bootstrap.js"},
					{ src: "build/bootstrap/bootstrap.min.js", dest: "bootstrap.min.js"},
				]
			},
			bootstrap_test_ready:{
				files: [
					{ src: "src/bootstrap/tests/wsu_default.html", dest: "distro/bootstrap/tests/wsu_default.html"}
				]
			}
		},
		jshint: {
			src: ['src/*.js','src/bootstrap/src/*.js'],
			options: {
				smarttabs: true,
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				multistr:true,
				globals: {
					require: true,
					define: true,
					requirejs: true,
					describe: true,
					expect: true,
					it: true,
					_gat: true,
					jQuery: true,
					console: true,
					module: true,
					document: true,
					window:true
				}
			}
		},
		watch: {
			files: '<%= jshint.src %>',
			tasks: ['default']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');

	// Default task(s).
	grunt.registerTask('default', ['jshint','clean','concat','uglify','copy']);

};