var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minify = require('gulp-minify-css');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var less = require('gulp-less');

gulp.task('js', function(){
   gulp.src('scripts/*.js')
   .pipe(concat('script.js'))
   .pipe(uglify())
   .pipe(gulp.dest('build/scripts/'));
});


//sass
gulp.task('sass', function () {
    gulp.src(['styles/*.scss', 'styles/**/*.scss'])
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest('styles/'));
});

gulp.task('less', function () {
    gulp.src('styles/*.less')
        .pipe(plumber())
        .pipe(less())
        .pipe(gulp.dest('styles/'))
});


gulp.task('css', function(){
   gulp.src('styles/*.css')
   .pipe(concat('styles.css'))
   .pipe(minify())
   .pipe(gulp.dest('build/styles/'));
});

gulp.task('default',['js','less','css'],function(){
});