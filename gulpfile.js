const gulp = require('gulp');
const plumber = require('gulp-plumber');
const terser = require('gulp-terser');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const rename = require('gulp-rename');

gulp.task('scripts', function () {
    return gulp.src('./js/scripts.js')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err);
                this.emit('end');
            }
        }))
        .pipe(terser({
            format: {
                comments: /^!/
            }
        }))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest('./js'));
});

gulp.task('styles', function () {
    return gulp.src('./scss/styles.scss')
        .pipe(sass({ style: 'compressed' }).on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./css'));
});

// Self-hosted fonts: copy the latin woff2 files the stylesheet uses out of @fontsource
gulp.task('fonts', function () {
    return gulp.src([
        './node_modules/@fontsource/barlow-condensed/files/barlow-condensed-latin-{500,600,700}-normal.woff2',
        './node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-{400,600,700}-normal.woff2',
        './node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-400-italic.woff2',
        './node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2'
    ], { encoding: false })
        .pipe(gulp.dest('./fonts'));
});

gulp.task('build', gulp.parallel('scripts', 'styles', 'fonts'));

gulp.task('watch', function () {
    gulp.watch('./js/scripts.js', gulp.series('scripts'));
    gulp.watch('./scss/styles.scss', gulp.series('styles'));
});
