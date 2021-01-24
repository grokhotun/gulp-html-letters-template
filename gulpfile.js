const gulp = require("gulp"),
    del = require("del"),
    sass = require("gulp-sass"),
    browserSync = require("browser-sync").create(),
    autoprefixer = require("gulp-autoprefixer"),
    rename = require("gulp-rename"),
    fileinclude = require("gulp-file-include"),
    plumber = require("gulp-plumber"),
    inlineCss = require("gulp-inline-css"),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    htmlbeautify = require('gulp-html-beautify');
    reload = browserSync.reload;

const fs = require("fs");
const source_folder = "src";

const path = {
    build: {
        //Тут мы укажем куда складывать готовые после сборки файлы
        html: "build/",
        css: "build/css/",
        img: "build/img/",
    },
    src: {
        //Пути откуда брать исходники
        html: "src/#html/*.html", //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        style: "src/style/main.scss",
        img: "src/img/**/*.*", //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    },
    watch: {
        //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: "src/**/*.html",
        style: "src/style/**/*.scss",
        img: "src/img/**/*.*",
    },
    clean: "./build",
};

const autoprefixBrowsers = [
    "> 1%",
    "last 2 versions",
    "firefox >= 4",
    "safari 7",
    "safari 8",
    "IE 8",
    "IE 9",
    "IE 10",
    "IE 11",
];

gulp.task("browser-sync", function () {
    browserSync.init({
        server: "./build",
        port: 5080,
        notify: false,
    });
});

gulp.task("html:build", function (done) {
    return gulp
        .src(path.src.html) //Выберем файлы по нужному пути
        .pipe(plumber())
        .pipe(
            fileinclude({
                prefix: "@@",
                basepath: "./src/#html",
            })
        )
        .pipe(htmlbeautify())
        .pipe(gulp.dest(path.build.html)) //Выплюнем их в папку build
        .pipe(reload({ stream: true })); //И перезагрузим наш сервер для обновлений
});

gulp.task("style:build", function (done) {
    return gulp
        .src(path.src.style) //Выберем наш main.scss
        .pipe(plumber())
        .pipe(sass()) //Скомпилируем
        .pipe(
            autoprefixer({
                browsers: autoprefixBrowsers,
                cascade: false,
            })
        ) //Добавим вендорные префиксы
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({ stream: true }));
});

gulp.task("image:build", function (done) {
    return gulp
        .src(path.src.img) //Выберем наши картинки
        .pipe(
            imagemin({
                //Сожмем их
                progressive: true,
                svgoPlugins: [{ removeViewBox: false }],
                use: [pngquant()],
                interlaced: true,
            })
        )
        .pipe(gulp.dest(path.build.img)) //И бросим в build
        .pipe(reload({ stream: true }));
});

gulp.task("inlineCss", function () {
    return gulp
        .src(`${path.build.html}/*.html`)
        .pipe(
            inlineCss({
                applyLinkTags: true,
                applyTableAttributes: true,
                removeLinkTags: true,
                removeHtmlSelectors: true,
                applyStyleTags: false,
                preserveMediaQueries: true,
                removeStyleTags: false
            })
        )
        .pipe(htmlbeautify())
        .pipe(gulp.dest(path.build.html));
});

gulp.task("clean", function () {
    return del(path.clean);
});

gulp.task("build", gulp.parallel("html:build", "style:build", "image:build"));

gulp.task("watch", function () {
    gulp.watch([path.watch.html], gulp.series("html:build"));
    gulp.watch([path.watch.style], gulp.series("style:build"));
});

gulp.task("default", gulp.parallel("build", "browser-sync", "watch"));
gulp.task("online", gulp.parallel("browser-sync", "watch"));
