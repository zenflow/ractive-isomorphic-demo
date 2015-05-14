var gulp = require('gulp');
var del = require('del');
var bower = require('bower');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var nodemon = require('gulp-nodemon');
var nodemon_json = require('./nodemon');
var uglify = require('gulp-uglify');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
var gif = require('gulp-if');
var yargs = require('yargs');
var less = require('gulp-less');
var minifyCss = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var Promise = require('ractive-isomorphic').Promise;

console.log('setting up '+(yargs.argv.production?'production':'developer')+' build...');
var config = function(key, value){
	console.log('config', key, typeof value, value);
	eval(key + ' = ' + JSON.stringify(value) + '; ');
};
config('do_sourcemaps', true);
config('do_bower_scripts', false);
config('do_minimize', yargs.argv.production?true:yargs.argv.do_minimize);
config('custom_semantic_build', yargs.argv.production?true:yargs.argv.custom_semantic_build);
config('browserify_transforms', ['brfs']);
config('browserify_node_modules', ['ractive-isomorphic', 'httpinvoke', 'ramjet', 'moment']);

gulp.task('clean', function (done) {
	del(['client/build'], done);
});

gulp.task('bower', function(){
	return new Promise(function(resolve, reject){
		bower.commands.install()
			.on('error', reject)
			.on('end', resolve);
	});
});

gulp.task('scripts:bower_components', ['bower'], function(){
	return gulp.src(mainBowerFiles({filter: function(str){return str.slice(-3)=='.js';}}))
		.pipe(gif(do_sourcemaps, sourcemaps.init()))
		.pipe(concat('bower_components.js'))
		.pipe(gif(do_minimize, uglify()))
		.pipe(gif(do_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'));
});
gulp.task('scripts:node_modules', function () {
	var b = browserify({debug: do_sourcemaps});
	browserify_node_modules.forEach(function(module_name){
		b.require(module_name);
	});
	return b.bundle()
		.pipe(source('node_modules.js'))
		.pipe(buffer())
		.pipe(gif(do_sourcemaps, sourcemaps.init({loadMaps: true})))
		.pipe(gif(do_minimize, uglify()))
		.pipe(gif(do_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'))
});
gulp.task('scripts:index', function () {
	var b = browserify('./client/src/scripts/index.js', {debug: do_sourcemaps})
		.external(browserify_node_modules)
		.transform(browserify_transforms);
	return b.bundle()
		.pipe(source('index.js'))
		.pipe(buffer())
		.pipe(gif(do_sourcemaps, sourcemaps.init({loadMaps: true})))
		.pipe(gif(do_minimize, uglify()))
		.pipe(gif(do_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/scripts'));
});
gulp.task('scripts', (do_bower_scripts?['scripts:bower_components']:[]).concat(['scripts:node_modules', 'scripts:index']));

var autoprefixer_options = {
	browsers: [ 'last 2 version', '> 1%', 'opera 12.1', 'safari 6', 'ie 9', 'bb 10', 'android 4']
};
var minifyCss_options = {
	processImport: false,
	restructuring: false,
	keepSpecialComments: 0
};
gulp.task('styles:semantic', ['bower'], function () {
	if (custom_semantic_build){
		return new Promise(function(resolve, reject){
			var custom_src_stream = gulp.src('./client/src/styles/**')
				.pipe(gulp.dest('./bower_components/semantic-ui/src'));
			custom_src_stream.once('error', reject);
			custom_src_stream.once('end', function(){
				var stream = gulp.src('./bower_components/semantic-ui/src/semantic.less')
					.pipe(gif(do_sourcemaps, sourcemaps.init()))
					.pipe(less())
					.pipe(autoprefixer(autoprefixer_options))
					.pipe(gif(do_minimize, minifyCss(minifyCss_options)))
					.pipe(gif(do_sourcemaps, sourcemaps.write('./')))
					.pipe(gulp.dest('./client/build/styles'));
				stream.once('error', reject);
				stream.once('end', resolve);
			});
		});
	} else {
		return gulp.src('./bower_components/semantic-ui/dist/semantic.css')
			.pipe(gulp.dest('./client/build/styles'));
	}
});
gulp.task('styles:css', function(){
	return gulp.src('./client/src/styles/css/**')
		.pipe(gif(do_sourcemaps, sourcemaps.init()))
		.pipe(concat('css.css'))
		.pipe(gif(do_minimize, minifyCss(minifyCss_options)))
		.pipe(gif(do_sourcemaps, sourcemaps.write('./')))
		.pipe(gulp.dest('./client/build/styles'))
});
gulp.task('styles', ['styles:semantic', 'styles:css']);

gulp.task('assets:bower_components', ['bower'], function(){
	return gulp.src('./bower_components/semantic-ui/src/**/assets/**')
		.pipe(gulp.dest('./client/build'+(custom_semantic_build?'':'/styles')));
});
gulp.task('assets:index', function(){
	return gulp.src('./client/src/assets/**')
		.pipe(gulp.dest('./client/build'));
});
gulp.task('assets', ['assets:bower_components', 'assets:index']);

gulp.task('build', ['scripts', 'styles', 'assets']);

gulp.task('watch', ['build'], function() {
	// scripts
	gulp.watch(['./shared/**', './client/src/scripts/**'], ['scripts:index']);
	// styles
	if (custom_semantic_build){
		gulp.watch(['./client/src/styles/semantic/**'], ['styles:semantic']);
	}
	gulp.watch(['./client/src/styles/css/**'], ['styles:css']);
	// assets
	gulp.watch(['./client/src/assets/**/**'], ['assets:index']);
});

gulp.task('dev', ['watch'], function(cb){
	nodemon(nodemon_json);
});

gulp.task('default', ['dev']);
