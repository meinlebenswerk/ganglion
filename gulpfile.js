var gulp = require('gulp');
var ts   = require('gulp-typescript');

var tsProject = ts.createProject('tsconfig.json');
// var tsProject = ts.createProject({
//   declaration: false,
//   noImplicitAny: true
// });

gulp.task('typescript-compile', function() {
  return gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch('src/**/*.ts',gulp.series('typescript-compile'));
});

gulp.task('dev', gulp.series('typescript-compile', 'watch'));
