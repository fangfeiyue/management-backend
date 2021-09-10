const router = require('koa-router')();
const User = require('./../models/userSchema');
const Util = require('../utils/utils');
var jwt = require('jsonwebtoken');
router.prefix('/users');

router.post('/login', async (ctx) => {
	try {
		const { userName, password } = ctx.request.body;
    console.log(userName, password)
		const res = await User.findOne({
			userName,
			userPwd: password
		});

    const data = res._doc;
    const token = jwt.sign({
      data: data
    }, 'fang', { expiresIn: 20 });

		if (res) {
      data.token = token;
			ctx.body = Util.success(data);
		} else {
			ctx.body = Util.fail('账号或密码不正确');
		}
	} catch (err) {
		ctx.body = Util.fail(err);
	}
});

module.exports = router;
