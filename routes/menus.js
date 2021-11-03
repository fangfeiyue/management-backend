const router = require('koa-router')();
const util = require('../utils/utils');
const Menu = require('../models/menuSchema');

router.prefix('/menu');

router.get('/list', async (ctx) => {
	try {
		const { menuName, menuState } = ctx.request.query;
		const params = {};

		if (menuName) params.menuName = menuName;
		if (menuState) params.menuState = menuState;

		const list = (await Menu.find(params)) || [];

		ctx.body = util.success(getTreeMenu(list));
	} catch (err) {
		ctx.body = util.fail(err.stack);
	}
});

function getTreeMenu(list) {
	return list.filter((item1) => {
		item1._doc.children = [];
		list.forEach((item2) => {
			const parentIds = item2.parentId;
			if (String(parentIds && parentIds[parentIds.length - 1]) === item1.id) {
				item1._doc.children.push(item2);
			}
		});

		if (item1._doc.children[0] && item1._doc.children[0].menuType == 2) {
			// 快速判断按钮和菜单，用于后期做菜单按钮权限控制
			item1._doc.action = item1._doc.children;
		}

		return item1.parentId[0] === null;
	});
}

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
		if (!res) {
			ctx.body = util.fail('操作失败');
		} else {
			ctx.body = util.success(res, info[action] || '操作成功');
		}
	} catch (err) {
		ctx.body = util.fail(err.stack);
	}
});

module.exports = router;
