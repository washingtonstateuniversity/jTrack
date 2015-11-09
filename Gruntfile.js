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
				src: 'src/<%= pkg.name %>.js',
				dest: 'distro/<%= pkg.name %>.min.js'
			},
			bootstrap_min: {
				src: 'src/bootstrap/bootstrap.<%= pkg.bootstrap_version %>.js',
				dest: 'distro/bootstrap/bootstrap.<%= pkg.bootstrap_version %>.min.js'
			}
		},
		concat:{
			scripts: {
				src: [
					"src/bootstrap/src/init.js",
					"src/bootstrap/src/default_events.js",
					"src/bootstrap/src/default_ui-events.js",
					"src/bootstrap/src/bootstrap.js"
				],
				dest: "src/bootstrap/bootstrap.<%= pkg.bootstrap_version %>.js"
			}
		},
		copy:{
			ready:{
				files: [
					{ src: "src/<%= pkg.name %>.js", dest: "distro/<%= pkg.name %>.js"},
					{ flatten: true, expand: true, src: ["src/tracking/*"], dest: "distro/tracking/"},
					{ flatten: true, expand: true, src: ["distro/<%= pkg.name %>.min.js"], dest: ""},
					{ flatten: true, expand: true, src: ["distro/<%= pkg.name %>.js"], dest: ""}
				]
			},
			ready:{
				files: [
					{ src: "src/bootstrap.js", dest: "distro/bootstrap.<%= pkg.bootstrap_version %>.js"},
					{ flatten: true, expand: true, src: ["distro/bootstrap/bootstrap.<%= pkg.bootstrap_version %>.min.js"], dest: ""},
					{ flatten: true, expand: true, src: ["distro/bootstrap/bootstrap.<%= pkg.bootstrap_version %>.js"], dest: ""}
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