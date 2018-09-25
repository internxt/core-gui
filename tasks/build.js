"use strict";

var gulp = require("gulp");
var jetpack = require("fs-jetpack");
var projectDir = jetpack;
var destDir = projectDir.cwd("./build");
var sass = require('gulp-sass');
var vueify = require('gulp-vueify');

var paths = {
  copyFromAppDir: ["./**", "!*.vue"]
};

gulp.task("clean", function() {
  return destDir.dirAsync(".", { empty: true });
});

function copyTask() {
  return projectDir.copyAsync("app", destDir.path(), {
    overwrite: true,
    matching: paths.copyFromAppDir
  });
}

gulp.task('sass', function () {
  return gulp.src('app/**/*.scss')
    .pipe(sass.sync().on('error', sass.logError))
    .pipe(gulp.dest(destDir.path()));
});

gulp.task('sass:watch', function () {
  gulp.watch('./css/**/*.scss', ['sass']);
});

gulp.task('vueify', ["copy"], function () {
  return gulp
    .src("app/views/**/*.vue")
    .pipe(vueify())
    .pipe(gulp.dest(destDir.path() + '/views/'));
});

gulp.task("copy", copyTask);
gulp.task("copy-watch", copyTask);

gulp.task("watch", function() {
  gulp.watch(paths.copyFromAppDir, { cwd: "app" }, ["copy-watch"]);
  gulp.watch('app/**/*.scss', ["sass:watch"]);
});

gulp.task("build", ["clean", "sass", "vueify"]);
