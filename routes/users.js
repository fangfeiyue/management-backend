const router = require('koa-router')();
const User = require('./../models/userSchema');
const Util = require('../utils/utils');
router.prefix('/users');

router.post('/login', async (ctx) => {
	try {
		const { userName, password } = ctx.request.body;
    console.log(userName, password)
		const res = await User.findOne({
			userName,
			userPwd: password
		});
    console.log('resss',res)
		if (res) {
			ctx.body = Util.success(res);
		} else {
			ctx.body = Util.fail('账号或密码不正确');
		}
	} catch (err) {
		ctx.body = Util.fail(err);
	}
});

module.exports = router;
