var gulp = require("gulp"),

    autoprefixer = require("gulp-autoprefixer"),
    cache = require("gulp-cache"),
    cssnano = require("gulp-cssnano"),
    imagemin = require("gulp-imagemin"),
    minify = require("gulp-minify"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),

    browserSync = require("browser-sync").create(),
    del = require("del"),
    panini = require("panini");

// Paths

var paths = {
    base: {
        base:     "./",
        node:     "./node_modules"
    },
    dist: {
        base:     "./dist/",
        img:      "./dist/assets/img/",
        css:      "./dist/assets/css/",
        fonts:    "./dist/assets/fonts/",
        js:       "./dist/assets/js/",
        html:     "./dist/html/",
        img:      "./dist/assets/img/",
        pages:    "./dist/",
        vendor:   "./dist/vendor/",
        video:    "./dist/assets/video/",
    },
    src: {
        base:     "./src/",
        css:      "./src/assets/css",
        fonts:    "./src/assets/fonts/**/*.+(eot|woff|ttf|otf)",
        img:      "./src/assets/img/**/*.+(png|jpg|jpeg|gif|svg)",
        js:       "./src/assets/js/default.js",
        pages:    "./src/pages/**/*.html",
        layouts:  "./src/layouts/**/*.html",
        partials: "./src/partials/**/*.html",
        scss:     "./src/assets/scss/default.scss",
        vendor:   "./src/vendor/**/*.*",
        video:    "./src/assets/video/**/*.*"
    }
};

gulp.task("sass", function() {
    return gulp
        .src(paths.src.scss)
        .pipe(sourcemaps.init())
        .pipe(
            sass({
                outputStyle:      "expanded",
                sourceComments:   "map",
                sourceMap:        "sass",
                outputStyle:      "nested"
            }).on("error", sass.logError)
        )
        .pipe(autoprefixer("last 2 versions"))
        .pipe(cssnano())
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(paths.dist.css))
        .pipe(browserSync.stream());
});

gulp.task("compile:html", function() {
    return gulp
        .src(paths.src.pages)
        .pipe(
            panini({
                root:      "src/pages/",
                layouts:   "src/layouts/",
                partials:  "src/partials/",
                helpers:   "src/helpers/",
                data:      "src/data/"
            })
        )
        .pipe(gulp.dest(paths.dist.pages))
        .pipe(browserSync.stream());
});

gulp.task("resetPages", function(done) {
    panini.refresh();
    done();
});

gulp.task("images", function() {
    return gulp
        .src(paths.src.img)
        .pipe(
            cache(
                imagemin([
                    imagemin.gifsicle({ interlaced: true }),
                    imagemin.jpegtran({ progressive: true }),
                    imagemin.optipng({ optimizationLevel: 5 })
                ])
            )
        )
        .pipe(gulp.dest(paths.dist.img))
        .pipe(browserSync.stream());
});

gulp.task("video", function() {
    return gulp
        .src(paths.src.video)
        .pipe(gulp.dest(paths.dist.video))
        .pipe(browserSync.stream());
});

gulp.task("fonts", function() {
    return gulp
        .src(paths.src.fonts)
        .pipe(gulp.dest(paths.dist.fonts))
        .pipe(browserSync.stream());
});

gulp.task("scripts", function() {
    return (
        gulp
            .src(paths.src.js)
            .pipe(sourcemaps.init())
            .pipe(sourcemaps.write("./"))
            .pipe(minify())
            .pipe(gulp.dest(paths.dist.js))
            .pipe(browserSync.stream())
    );
});

gulp.task("clean:dist", function() {
    return del(paths.dist.base);
});

gulp.task("watch", function() {
    browserSync.init({
        server: {
        	baseDir: paths.dist.base,
		    serveStaticOptions: {
		        extensions: ["html"]
		    }
        }
    });

    gulp.watch(
    	["src/assets/js/**/*.js"]).on("all",
    	gulp.series( "scripts", browserSync.reload ) );
    gulp.watch(
    	["src/assets/scss/**/*"]).on("all",
    	gulp.series( "sass", browserSync.reload ) );
    gulp.watch(
    	["src/assets/img/**/*"]).on("all",
    	gulp.series( "images", browserSync.reload ) );
    gulp.watch(
    	["src/assets/video/**/*"]).on("all",
    	gulp.series( "video", browserSync.reload ) );
    gulp.watch(
        ["src/{pages,layouts,partials}/**/*.html"]).on("all",
        gulp.series( "resetPages", "compile:html", browserSync.reload ) );
    gulp.watch(
        ["src/data/**/*.{js,json,yml}"]).on("all",
        gulp.series( "resetPages", "compile:html", browserSync.reload ) );
    gulp.watch(
        ["src/helpers/**/*.html"]).on("all",
        gulp.series( "resetPages", "compile:html", browserSync.reload ) );
    console.log("Watching for changes");
});

gulp.task("default",
	gulp.series(
	    "clean:dist",
        "resetPages",
	    "fonts",
	    "sass",
	    "scripts",
	    "images",
	    "video",
        "compile:html",
        "watch",
	)
);

gulp.task("build",
	gulp.series(
	    "clean:dist",
        "resetPages",
	    "fonts",
	    "sass",
	    "scripts",
	    "images",
	    "video",
        "compile:html"
	)
);