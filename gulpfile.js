// grab our gulp packages
var gulp  = require('gulp'),

    gutil = require('gulp-util'),  

    gulpFilter = require('gulp-filter'),
    rename = require('gulp-rename'),
    flatten = require('gulp-flatten'),
    merge = require('gulp-merge'),

    bower = require('gulp-bower'),
    mainBowerFiles = require('main-bower-files'),

    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),

    sass = require('gulp-sass'),
    cssmin = require('gulp-minify-css'),

    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),

    useref = require('gulp-useref'),

    sourcemaps = require('gulp-sourcemaps'),

    connect = require('gulp-connect'),

  	input = {
      'html': 'app/src/*.html',
  		'scss': 'app/src/assets/scss/**/*.scss',
      'js': ['app/src/assets/js/**/*.js','!app/src/assets/js/plugin/**/*.js'],
  		'img': ['app/src/assets/img/**/*']
  	},
  	output = {
      src: {
        'html': 'app/src',
    		'css': 'app/src/assets/css',
        'js': 'app/src/assets/js',
    		'img': 'app/src/assets/img'
      },
      build: {
        'html': 'app/build',
        'css': 'app/build/assets/css',
        'js': 'app/build/assets/js',
        'img': 'app/build/assets/img'
      }
  	},
    plugin = {
      'bowerDir': './bower_components',
      src: {
        'css': 'app/src/assets/css/plugin',
        'js': 'app/src/assets/js/plugin',
        'font': 'app/src/assets/css/fonts'
      },
      build:{
        'css': 'app/build/assets/css/plugin',
        'js': 'app/build/assets/js/plugin',
        'font': 'app/build/assets/css/fonts'
      }
    },
    server = {
      'scr': '',
      'build': '',
    };


var buildcss = function() {
  return gulp.src(input.scss)
    //TODO: .pipe(sourcemaps.init())  // Process the original sources
      .pipe(sass())
      .pipe(gulp.dest(output.src.css))
      .pipe(cssmin())
    //TODO: .pipe(sourcemaps.write()) // Add the map to modified source.

      .pipe(rename({
            suffix: ".min"
      }))
    .pipe(gulp.dest(output.build.css))
    .pipe(connect.reload());
}

var buildjs = function() {
  return gulp.src(input.js)
    //TODO: .pipe(sourcemaps.init())
      .pipe(concat('bundle.js'))
      .pipe(uglify())
    //TODO: .pipe(sourcemaps.write())

      .pipe(rename({
            suffix: ".min"
      }))
    .pipe(gulp.dest(output.build.js))
    .pipe(connect.reload());
}

var buildhtml = function () {
    var assets = useref.assets();

    return gulp.src(input.html)
      .pipe(assets)
      .pipe(assets.restore())
      .pipe(useref())
      .pipe(gulp.dest(output.build.html))
      .pipe(connect.reload());
}

var buildimg = function () {
    return gulp.src(input.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(output.build.img));
}

gulp.task('default', ['connect-src', /*'connect-build',*/ 'watch']);
gulp.task('build', ['jshint', 'build-js', 'build-css', 'build-html']);
gulp.task('init', ['bower', 'plugin']);

gulp.task('bower', function() {
    return bower()
           .pipe(gulp.dest(plugin.bowerDir));
});

// grab libraries files from bower_components, minify and push in /public
gulp.task('plugin', ['bower'], function() {

  var jsFilter = gulpFilter('*.js');
  var jsNonMinFilter = gulpFilter(['*.js','!*.min.js']);
  var jsMinFilter = gulpFilter('*.min.js');
  var cssFilter = gulpFilter('*.css');
  var cssNonMinFilter = gulpFilter(['*.css','!*.min.css']);
  var cssMinFilter = gulpFilter('*.min.css');
  var fontFilter = gulpFilter(['*.eot', '*.woff', '*.svg', '*.ttf']);

  return gulp.src(mainBowerFiles())
  
  // 1.1 js - copy to src
  .pipe(jsFilter)
  .pipe(gulp.dest(plugin.src.js))

  // 1.2 js - copy min to build; no processing
  .pipe(jsMinFilter)
  .pipe(gulp.dest(plugin.build.js))
  .pipe(jsMinFilter.restore())

  // 1.3 js - min non-min :P
  .pipe(jsNonMinFilter)
  .pipe(uglify())
  .pipe(rename({
        suffix: ".min"
    }))

  // 1.4 js - copy to build
  .pipe(gulp.dest(plugin.build.js))
  .pipe(connect.reload())
  .pipe(jsFilter.restore())

  // 2.1 css - to src
  .pipe(cssFilter)
  .pipe(gulp.dest(plugin.src.css))

  // 2.2 css - copy in to build; no processing
  .pipe(cssMinFilter)
  .pipe(gulp.dest(plugin.build.js))
  .pipe(cssMinFilter.restore())

  // 2.2 css - remove min & min non-min :P
  .pipe(cssNonMinFilter)
  .pipe(cssmin())
  .pipe(rename({
        suffix: ".min"
    }))

  // 2.3 css - copy to build
  .pipe(gulp.dest(plugin.build.css))
  .pipe(connect.reload())
  .pipe(cssFilter.restore())

  .pipe(fontFilter)
  .pipe(flatten())
  .pipe(gulp.dest(plugin.src.font))
  .pipe(gulp.dest(plugin.build.font))
  .pipe(connect.reload());
});

// create a default task and just log a message
gulp.task('testlog', function() {
  return gutil.log(mainBowerFiles());
});

gulp.task('jshint', function() {
  return gulp.src(input.js)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('build', ['build-css'], function(){});

gulp.task('build-css', ['build-js'], buildcss);
gulp.task('build-css-only', buildcss);

//gutil.env.type === 'production' ?  : gutil.noop()

gulp.task('build-js', ['jshint','build-html'], buildjs);
gulp.task('build-js-only', buildjs);

gulp.task('build-html', ['build-img'], buildhtml);
gulp.task('build-html-only', buildhtml);

gulp.task('build-img', ['plugin'], buildhtml);
gulp.task('build-img-only', buildimg);

gulp.task('connect-src', function () {
  connect.server({
    root: 'app/src',
    port: 8080,
    livereload: true
  });
});

gulp.task('connect-build', function () {
  connect.server({
    root: 'app/build',
    port: 9090,
    livereload: true
  });
});

gulp.task('watch', ['build'], function() {
  gulp.watch(input.js, ['jshint','build-js-only']);
  gulp.watch(input.scss, ['build-css-only']);
  gulp.watch(input.html, ['build-html-only']);
  gulp.watch(plugin.bowerDir, ['plugin']);
  gulp.watch(input.img, ['build-img-only']);
});
