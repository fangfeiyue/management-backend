const Router = require('koa-router');
const utils = require('../utils/utils');
const Role = require('../models/roleSchema');
const router = new Router();

router.prefix('/roles');

// 查询所有角色
router.get('/allList', async (cxt) => {
	try {
		const list = (await Role.find({}, '_id roleName')) || [];
		cxt.body = utils.success(list);
	} catch (err) {
		cxt.body = utils.fail(err.stack);
	}
});

// 获取角色列表
router.get('/list', async (ctx) => {
	const { roleName } = ctx.request.query;
	const { page, skipIndex } = utils.parge(ctx.request.query);
	const params = {};

	if (roleName) params.roleName = roleName;

	try {
		const query = Role.find(params);
		// 进行分页
		const list = await query.skip(skipIndex).limit(page.pageSize);
		// 计算数量
		const total = await Role.countDocuments(params);
		ctx.body = utils.success({
			list,
			page: {
				total,
				...page
			}
		});
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

module.exports = router;
