// 获取依赖
var gulp = require('gulp'),
    childProcess = require('child_process'),
    gutil = require('gulp-util'),
    packagejson = require('./package.json')
electron = require('electron-prebuilt');
var concat = require('gulp-concat');
// 创建 gulp 任务
// gulp.task('run', function () {
//     childProcess.spawn(electron, ['.'], {stdio:'inherit'});
// });

let ts = require('gulp-typescript');
let uglify = require('gulp-uglify-es').default;
let tsProject = ts.createProject('tsconfig.json', { typescript: require('typescript') });
var install = require("gulp-install");
let sass = require('gulp-sass');
let rename = require('gulp-rename');

gulp.task('default', ['watch']);
let isWindows = (process.platform === 'win32');
let isMac = (process.platform === 'darwin');
let os = require('os');

gulp.task('watch',['install'], function () {
    // gulp.watch('./src/angular/**/*.ts', ['reTs']);
    // gulp.watch('./src/angular/**/*.html', ['html']);
    // gulp.watch('./src/angular/**/*.scss', ['css']);
    if (packagejson.BuildCode == 1 && isWindows)
       gulp.watch(['./src/angular/**/*.ts', './src/angular/**/*.html', './src/angular/**/*.scss'], ['html']);
});

gulp.task('install', ['js'], function () {
    return gulp.src(['./package.json'])
        .pipe(install({ noOptional: true }));
});

gulp.task('js', ['database'], function () {
    if (packagejson.BuildCode == 0 || packagejson.BuildCode == 2)
        return gulp.src(['./src/angular/assets/js/**/*']).pipe(gulp.dest('./App/js'));
});

gulp.task('database', ['other'], function () {
    // return gulp.src(['./src/backend/database/**/*']).pipe(gulp.dest('App/data'));
    let path;
    if (isWindows)
        path = process.env.APPDATA + `\\${packagejson.project.projectname}\\data`;
    else
        path = os.homedir + `/${packagejson.project.projectname}/data`;
    return gulp.src(['./src/backend/database/**/*']).pipe(gulp.dest(path));
});
gulp.task('other', ['database2'], function () {
    // return gulp.src(['./src/backend/database/**/*']).pipe(gulp.dest('App/data'));
    let path;
    if (isWindows)
        path = process.env.APPDATA + `\\${packagejson.project.projectname}\\other`;
    else
        path = os.homedir + `/${packagejson.project.projectname}/other`;
    return gulp.src(['./src/image/other/**/*']).pipe(gulp.dest(path));
});
gulp.task('database2', ['img'], function () {
    return gulp.src(['./src/backend/database/**/*']).pipe(gulp.dest(`${packagejson.project.projectsetupname}/AppDataFiles/data`));
});

gulp.task('img', ['backend'], function () {
    return gulp.src(['./src/image/**/*']).pipe(gulp.dest('App/image'));
});

gulp.task('backend', ['node'], function () {
    // if (packagejson.BuildCode == 0 || packagejson.BuildCode == 2)
    //     return gulp.src(['./src/backend/**/*', '!./src/backend/database/**/*', '!./src/backend/protocol/nodeDriver/**/*']).pipe(uglify().on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()) })).pipe(gulp.dest('./App/backend'));
    // else if (packagejson.BuildCode == 1)
        return gulp.src(['./src/backend/**/*', '!./src/backend/database/**/*', '!./src/backend/protocol/nodeDriver/**/*']).pipe(gulp.dest('./App/backend'));
});


gulp.task('node', ['html'], function () {
    if (packagejson.BuildCode == 0 || packagejson.BuildCode == 2)
        return gulp.src(['./src/backend/protocol/nodeDriver/**/*']).pipe(gulp.dest('App/backend/protocol/nodeDriver/'));
});


gulp.task('html', ['css'], function () {
    return gulp.src('./src/angular/**/*.html').pipe(gulp.dest('./App'));
});

gulp.task('css', ['scss'], function () {
    return gulp.src(['./src/angular/**/*.css']).pipe(gulp.dest('./App'));
});

gulp.task('scss', ['i18n'], function () {
    return gulp.src('./src/angular/assets/scss/**/*.scss').pipe(rename({ dirname: '' })).pipe(sass().on('error', sass.logError)).pipe(gulp.dest('./App/css'));
});

gulp.task('i18n', ['sass'], function () {
    return gulp.src('./src/angular/assets/i18n/**/*').pipe(gulp.dest('./App/i18n'));
});

gulp.task('sass', ['reSystem'], function () {
    return gulp.src(['./src/angular/**/*.scss', '!./src/angular/assets/scss/**/*.scss']).pipe(sass().on('error', sass.logError)).pipe(gulp.dest('./App'));
});

gulp.task('reSystem', ['reTs'], function () {
    let src = ['index.html', 'package.json', 'electron.js', 'windows.js', 'systemjs.config.js', 'MyriadPro-Regular.ttf']
    return gulp.src(src).pipe(gulp.dest('./App'));
});

gulp.task('reTs', function () {
    let tsResult = tsProject.src().pipe(tsProject());
    if (packagejson.BuildCode == 0 || packagejson.BuildCode == 2)
        return tsResult.js.pipe(uglify()).pipe(gulp.dest('./App/'));
    else if (packagejson.BuildCode == 1)
        return tsResult.js.pipe(gulp.dest('./App/'));
});