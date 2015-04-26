var gulp = require('gulp');
var del = require('del');
var bower = require('bower');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
var gif = require('gulp-if');
var yargs = require('yargs');

console.log('setting up '+(yargs.argv.production?'production':'developer')+' build...');
var use_sourcemaps = true;
var use_uglify = yargs.argv.production;
var browserify_transforms = ['brfs'];
var browserify_node_modules = ['ractive-isomorphic'];

var cleaned = false;
gulp.task('clean', function (done) {
	if (cleaned){
		done();
	} else {
		cleaned = true;
		del(['client/build'], done);
	}
});

gulp.task('bower', function(){
	return new Promise(function(resolve, reject){
		bower.commands.install()
			.on('error', reject)
			.on('end', function(){
				console.log('end', arguments);
				resolve();
			});
	});
});

gulp.task('scripts:bower_components', ['clean', 'bower'], function(){
	return gulp.src(mainBowerFiles({filter: function(str){return str.slice(-3)=='.js';}}))
		.pipe(gif(use_sourcemaps, sourcemaps.init()))
		.pipe(concat('bower_components.js'))
		.pipe(gif(use_uglify, uglify()))
		.pipe(gif(use_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'));
});

gulp.task('scripts:node_modules', ['clean'], function () {
	var b = browserify({debug: use_sourcemaps});
	browserify_node_modules.forEach(function(module_name){
		b.require(module_name);
	});
	return b.bundle()
		.pipe(source('node_modules.js'))
		.pipe(buffer())
		.pipe(gif(use_sourcemaps, sourcemaps.init({loadMaps: true})))
		.pipe(gif(use_uglify, uglify()))
		.pipe(gif(use_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'))
});

gulp.task('scripts:index', ['clean'], function () {
	var b = browserify('./client/src/scripts/index.js', {debug: true})
		.external(browserify_node_modules)
		.transform(browserify_transforms);
	return b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(gif(use_sourcemaps, sourcemaps.init({loadMaps: true})))
		.pipe(gif(use_uglify, uglify()))
		.pipe(gif(use_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'));
});

gulp.task('scripts', ['scripts:bower_components', 'scripts:node_modules', 'scripts:index']);

gulp.task('styles:bower_components', ['clean', 'bower'], function(){
	return gulp.src(mainBowerFiles({filter: function(str){return str.slice(-4)=='.css';}}))
		.pipe(gif(use_sourcemaps, sourcemaps.init()))
		.pipe(concat('bower_components.css'))
		// minify here
		.pipe(gif(use_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/styles'));
});

gulp.task('styles', ['styles:bower_components']);

gulp.task('assets', ['clean'], function(){
	return gulp.src('./client/src/assets/**')
		.pipe(gulp.dest('./client/build'));
});

gulp.task('build', ['scripts', 'styles', 'assets']);

gulp.task('watch', ['build'], function() {
	gulp.watch(['./shared/**', './client/src/scripts/**'], ['scripts:index']);
	gulp.watch(['./client/src/assets/**'], ['assets']);
});

gulp.task('dev', ['watch'], function(cb){
	nodemon({
		script: 'server/index.js',
		ext: 'js html',
		ignore: ['client/**', 'gulpfile.js']
	});
});

gulp.task('default', ['dev']);
