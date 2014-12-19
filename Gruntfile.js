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
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			min: {
				src: 'src/<%= pkg.name %>.js',
				dest: 'distro/<%= pkg.name %>.<%= pkg.version %>.min.js'
			}
		},
		copy:{
			ready:{
				files: [
					{ flatten: true, expand: true, src: ["src/<%= pkg.name %>.js"], dest: "distro/<%= pkg.name %>.<%= pkg.version %>.js"},
					{ flatten: true, expand: true, src: ["src/tracking/*"], dest: "distro/tracking/"},
					{ flatten: true, expand: true, src: ["src/<%= pkg.name %>.js"], dest: ""},
					{ flatten: true, expand: true, src: ["distro/<%= pkg.name %>.<%= pkg.version %>.min.js"], dest: ""}
					{ flatten: true, expand: true, src: ["distro/<%= pkg.name %>.<%= pkg.version %>.js"], dest: ""}
				]
			}
		},
		jshint: {
			src: ['src/*.js'],
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

	// Default task(s).
	grunt.registerTask('default', ['jshint','clean','uglify','copy']);

};