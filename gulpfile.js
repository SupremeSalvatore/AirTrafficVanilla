// Require paths for task runners
const gulp = require("gulp");
const imagemin = require('gulp-imagemin');
// const uglify = require("gulp-uglify");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const browserSync = require("browser-sync").create();



// Copy all HTML Files
gulp.task("copyHtml", function () {
      gulp.src("source/*.html")
            .pipe(gulp.dest("public"))
            .pipe(browserSync.stream());
})

// Copy all my Js files
gulp.task("copyMyJs", function () {
      gulp.src("source/js/*.js")
            .pipe(gulp.dest("public/js"))
            .pipe(browserSync.stream());
})

// MINIFY JS
// gulp.task("uglifyJs", function () {
//       gulp.src("source/js/*.js")
//             .pipe(uglify())
//             .pipe(gulp.dest("../public/js"))
// })

// MINIFY IMAGE
gulp.task("imageMin", function () {
      gulp.src("source/images/*")
            .pipe(imagemin())
            .pipe(gulp.dest("public/images"));
})

// UPDATE SASS
gulp.task("sass", function () {
      gulp.src(["source/scss/*.scss"])
            .pipe(sass())
            .pipe(autoprefixer())
            .pipe(sass().on("error", sass.logError))
            .pipe(gulp.dest("public/css"))
            .pipe(browserSync.stream());

})



gulp.task("server", ["copyHtml", "copyMyJs", "sass", "imageMin"], function () {
      browserSync.init({
            server: "./public"
      });
      gulp.watch("source/images/*", ["imageMin"]);
      gulp.watch("source/scss/*.scss", ["sass"]);
      gulp.watch("source/*.html", ["copyHtml"]);
      gulp.watch("source/js/*.js", ["copyMyJs"]);
      gulp.watch("public/*.html").on("change", browserSync.reload);
      gulp.watch("public/css/*.css").on("change", browserSync.reload);
      gulp.watch("public/js/*.js").on("change", browserSync.reload);
});


// PERFORM ALL TASK RUNNERS USING GULP ON CMD 
// copyHtml, copyAllJs, copyCss, uglifyJs, imageMin, sass, autoprefixer, server, watch, copyIcons

gulp.task("default", ["server"]);