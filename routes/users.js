const router = require('koa-router')();
const User = require('./../models/userSchema');
const Util = require('../utils/utils');
var jwt = require('jsonwebtoken');
const utils = require('../utils/utils');
router.prefix('/users');

router.post('/login', async (ctx) => {
	try {
		const { userName, password } = ctx.request.body;
		console.log(userName, password);
		/* 
    从数据库中返回指定的字段有三种方式：
    1. 'userId userName userEmail state role deptId roleList'
    2.  {userName:1,_id:0} 这样可以 {userName:1,userPwd:0} 这样会报错  为什么？
    3. .select('userName userPwd')
    */
		const res = await User.findOne({
			userName,
			userPwd: password
			// 指定 mongoDB 返回哪些字段
			// }, 'userId userName userEmail state role deptId roleList');
			// }
			// { userName: 1, userPwd: 0 }
			// );
		}).select('userId userName userEmail state role deptId roleList');

		const data = res._doc;
		console.log(data);
		const token = jwt.sign(
			{
				data
				// 20 代表 20s
			},
			'fang',
			{ expiresIn: '20h' }
		);

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

router.get('/list', async (ctx) => {
	const { userId, userName, state } = ctx.request.query;
	const { page, skipIndex } = utils.parge(ctx.request.query);
	const params = {};

	if (userId) params.userId = userId;
	if (userName) params.userName = userName;
	if (state && state !== '0') params.state = state;

	try {
		const query = User.find(params);
		const list = await query.skip(skipIndex).limit(page.pageSize);
		const total = await User.countDocuments(params);
		ctx.body = utils.success({
			list,
			page: {
				total,
				...page
			}
		});
	} catch (err) {
		ctx.body = utils.fail(`查询异常 ~ ${err.stack}`);
	}
});

// 这里的删除指代的是软删除，实际是更新，以防后续数据有用
router.post('/delete', async (ctx) => {
	const { userIds } = ctx.request.body;
	try {
		// 删除指定条目
		// const res = await User.updateMany({ userId: 10002 }, { state: 2 });

		// 通过 或 删除多条
		// const res = await User.updateMany({ $or: [ { userId: 10002 }, { userId: 100002 } ] }, { state: 2 });

		// 通过 与 删除多条
		const res = await User.updateMany({ userId: { $in: userIds } }, { state: 2 });
		console.log(res);
		if (res.modifiedCount) {
			ctx.body = utils.success(
				{
					nModified: res.modifiedCount
				},
				`共删除${res.modifiedCount}条数据`
			);
			return;
		}
		ctx.body = utils.fail('删除失败');
	} catch (err) {
		ctx.body = utils.fail(`删除异常 ~ ${err.stack}`);
	}
});

module.exports = router;
