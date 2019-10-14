// npm install gulp gulp-pug gulp-less gulp-csso gulp-concat gulp-javascript-obfuscator gulp-rename --save -D
const {
  src,
  dest,
  parallel,
  series
} = require( 'gulp' );
const path = require( 'path' );
const pug = require( 'gulp-pug' );
const less = require( 'gulp-less' );
const minifyCSS = require( 'gulp-csso' );
const concat = require( 'gulp-concat' );

const rename = require( 'gulp-rename' );

const order = require("gulp-order");
const javascriptObfuscator = require( 'gulp-javascript-obfuscator' );
const debug = require('gulp-debug');

const child_process = require( 'child_process' );

const PROJ_HOME = path.join( __dirname );

const PUBLIC_ROOT = path.join( PROJ_HOME, 'docs' );
const PUBLIC_JS = path.join( PUBLIC_ROOT, 'js' );
const PUBLIC_CSS = path.join( PUBLIC_ROOT, 'css' );
const JS_TEMP = path.join( PROJ_HOME, 'temp' );

console.log( 'PROJ_HOME:"' + PROJ_HOME + '"' );


function html() {
  return src( [
    '!src/pug/_*.pug','src/pug/*.pug'
  ] )
    .pipe( pug() )
    .pipe( dest( PUBLIC_ROOT ) );
}

function css(done) {
  child_process.execSync( 'sass src/sass/style.scss:' + PUBLIC_ROOT + '/css/style.css' )
  done();
}

function js() {
  return src( ['src/js/*.js'] )
    .pipe( order( [
      'src/js/_const.js',
      'src/js/_vars.js',
      'src/js/_common.js',
      'src/js/_*.js',
      'src/js/*.js'
    ], { base: './' } ) )
    .pipe( concat( 'app.js' ) )
    .pipe( dest( JS_TEMP, {
      sourcemaps: true
    } ) )
}

function js_compress() {
  return src( path.join( JS_TEMP, 'app.js' ) )
    .pipe( javascriptObfuscator( {
      compact: true
    } ) )
    .pipe( rename( 'app.min.js' ) )
    .pipe( dest( PUBLIC_JS ) )
}

exports.js = js;
exports.css = css;
exports.html = html;
// exports.default = series( css, js, js_compress, html );
exports.default = parallel(
  series( js, js_compress ),
  css,
  html );
