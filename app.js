const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
// 这个只能输出一些比较简单的日志，不适合输出复杂日志
const logger = require('koa-logger')

const log4js = require('./utils/log')

require('./config/db');
const users = require('./routes/users')
const router = require('koa-router')()
var jwt = require('jsonwebtoken');

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {

  log4js.info('get parmas', ctx.request.query);
  log4js.info('post params', ctx.request.body);
  await next();

  // log4js.info(ctx.method);

  // 人为制造一个报错
  // console.log(dddd);
  

  // const start = new Date()
  // await next()
  // const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

router.prefix('/api');
router.get('/leave/count', async ctx => {
  const token = ctx.request.headers.authorization.split(' ')[1];
  const payload = jwt.verify(token, 'fang');
  ctx.body = payload;
});

// routes
router.use(users.routes(), users.allowedMethods());
app.use(router.routes(), router.allowedMethods());
// app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  log4js.error(err.stack);
});

module.exports = app
