const router = require('koa-router')();
const util = require('../utils/utils');
const Menu = require('../models/menuSchema');

router.prefix('/menu');

router.post('/operate', async (ctx) => {
	const { action, _id, ...params } = ctx.request.body;
	const info = {
		add: '添加成功',
		edit: '编辑成功',
		delete: '删除成功'
	};
	let res = null;
	try {
		if (action === 'add') {
			// 创建的另外一种方法，使用new，如 const menu = new Menu({...}); menu.save;
			res = await Menu.create(params);
		} else if (action === 'edit') {
			params.updateTime = new Date();
			res = await Menu.findByIdAndUpdate(_id, params);
		} else if (action === 'delete') {
			res = await Menu.findByIdAndRemove(_id);
			res = await Menu.deleteMany({ parentId: { $all: [ _id ] } });
		}

		if (!res || res.deletedCount === 0) {
			ctx.body = util.fail('操作失败');
		} else {
			ctx.body = util.success(res, info[action] || '操作成功');
		}
	} catch (err) {
		ctx.body = util.fail(err.stack);
	}
});

module.exports = router;
