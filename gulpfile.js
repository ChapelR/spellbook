// require

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    minify = require('gulp-minify-css'),
    replace = require('gulp-replace'),
    jshint = require('gulp-jshint');

// vendor

var vendorJs = 'vendor/**/*.js',
    vendorJsDest = 'project/js',
    vendorCss = 'vendor/**/*.css',
    vendorCssDest = 'project/css';

function vendorScripts () {
    return gulp.src(vendorJs)
        .pipe(concat('dep.min.js'))
        .pipe(gulp.dest(vendorJsDest))
        .pipe(rename('dep.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(vendorJsDest));
}
function vendorStyles () {
    return gulp.src(vendorCss)
        .pipe(concat('vendor.min.css'))
        .pipe(gulp.dest(vendorCssDest))
        .pipe(rename('vendor.min.css'))
        .pipe(minify())
        .pipe(gulp.dest(vendorCssDest));
}

// project

var jsFiles = 'src/js/**/*.js',
    jsDest = 'project/js',
    cssFiles = 'src/css/**/*.css',
    cssDest = 'project/css';

function projectScripts () {
    return gulp.src(jsFiles)
        .pipe(concat('project.min.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('project.min.js'))
        .pipe(uglify().on('error', function(e){
            console.log(e);
         }))
        .pipe(gulp.dest(jsDest));
}
function projectStyles () {
    return gulp.src(cssFiles)
        .pipe(concat('project.min.css'))
        .pipe(gulp.dest(cssDest))
        .pipe(rename('project.min.css'))
        .pipe(minify())
        .pipe(gulp.dest(cssDest));
}

// build task

function build () {
    vendorScripts();
    vendorStyles();
    projectScripts();
    projectStyles();
}

// linter

function lint () {
    return gulp.src('src/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default', { beep : true }));
}

// tasks

gulp.task('build', build);
gulp.task('lint', lint);