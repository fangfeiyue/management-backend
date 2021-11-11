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

router.post('/operate', async (ctx) => {
	const info = {
		create: '创建成功',
		edit: '编辑成功',
		delete: '删除成功'
	};
	const { _id, action, roleName, remark } = ctx.request.body;
	try {
		if (action === 'create') {
			await Role.create({ roleName, remark });
		}
		if (!_id) {
			ctx.body = utils.fail('缺少参数：_id');
		} else if (action === 'edit') {
			await Role.findByIdAndUpdate(_id, { roleName, remark, updateTime: new Date() });
		} else if (action === 'delete') {
			await Role.findByIdAndRemove(_id);
		}
		ctx.body = utils.success(info[action]);
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

router.post('/update/permission', async (ctx) => {
	const { _id, permissionList } = ctx.request.body;
	try {
		const res = await Role.findByIdAndUpdate(_id, { permissionList, updateTime: new Date() });
		ctx.body = utils.success('', '权限更新成功');
	} catch (err) {
		console.log('lllldd');
		ctx.body = utils.fail(err.stack);
	}
});

module.exports = router;
