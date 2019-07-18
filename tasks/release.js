'use strict';

var gulp = require('gulp');
var utils = require('./utils');

var releaseForOs = {
  osx: require('./release_osx'),
  linux: require('./release_linux'),
  windows: require('./release_windows_old'),
};

gulp.task('release', gulp.series('build', function () {
  console.log('Return release for OS %s', utils.os())
  return releaseForOs[utils.os()]();
}));
