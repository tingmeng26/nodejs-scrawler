const express = require('express');
const exphbs = require('express-handlebars');
const pug = require('pug');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cacheControl = require('express-cache-controller');

const index = require('./routes/index');
// api
const apis = require('./routes/apis');
// 用以取得可操作 database 的 sequelize 物件
const models = require('./models');

const app = express();

app.use(cacheControl({
  maxAge: 14400,
  public: true
}));

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'pug');

// view handlebars engine setup
app.set('view engine', 'hbs');
app.engine('hbs', exphbs({
  helpers: {
    helper_name: function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  },
  extname: 'hbs',
  defaultLayout: 'layout.hbs',
  layoutsDir: __dirname + '/views'
}));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/api', apis);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error.pug');
});

// 如果是第一次運行的話，需要用 sync 方法建創建 table
// models.sequelize.sync()
//   .then(function () {
//     console.log('create database done.');
//   })
//   .error(function (err) {
//     console.log(err);
//   });

module.exports = app;
