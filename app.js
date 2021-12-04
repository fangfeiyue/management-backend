const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const onerror = require('koa-onerror');
const bodyparser = require('koa-bodyparser');
// 这个只能输出一些比较简单的日志，不适合输出复杂日志
const logger = require('koa-logger');

const log4js = require('./utils/log');

require('./config/db');
const users = require('./routes/users');
const menus = require('./routes/menus');
const roles = require('./routes/roles');
const depts = require('./routes/depts');
const leavs = require('./routes/leave');
const router = require('koa-router')();
var jwt = require('jsonwebtoken');
const koaJWT = require('koa-jwt');

const utils = require('./utils/utils');
// app.use(koaJWT({ secret: 'fang' }));

// error handler
onerror(app);

// middlewares
app.use(
	bodyparser({
		enableTypes: [ 'json', 'form', 'text' ]
	})
);
app.use(json());
app.use(logger());
app.use(require('koa-static')(__dirname + '/public'));

app.use(
	views(__dirname + '/views', {
		extension: 'pug'
	})
);

// logger
app.use(async function(ctx, next) {
	await next().catch((err) => {
		if (err.status == 401) {
			ctx.staus = 200;
			ctx.body = utils.fail('token 验证失败', utils.CODE.AUTH_ERROR);
		} else {
			throw err;
		}
	});
});

// unless 排除一些不需要校验的接口
app.use(
	koaJWT({ secret: 'fang' }).unless({
		path: [ /^\/api\/users\/login/ ]
	})
);

router.prefix('/api');
router.get('/leave/count', async (ctx) => {
	const token = ctx.request.headers.authorization.split(' ')[1];
	const payload = jwt.verify(token, 'fang');
	ctx.body = payload;
});

// routes
router.use(users.routes(), users.allowedMethods());
router.use(menus.routes(), menus.allowedMethods());
router.use(roles.routes(), roles.allowedMethods());
router.use(depts.routes(), depts.allowedMethods());
router.use(leavs.routes(), depts.allowedMethods());
app.use(router.routes(), router.allowedMethods());
// app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
	// log4js.error(err.stack);
});

module.exports = app;
