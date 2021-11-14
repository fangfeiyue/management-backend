const router = require('koa-router')();
const Dept = require('../models/deptSchema');
const utils = require('../utils/utils');

router.prefix('/dept');

router.get('/list', async (ctx) => {
	const { deptName } = ctx.request.query;
	const params = {};
	if (deptName) params.deptName = deptName;
	try {
		let list = await Dept.find(params);
		if (!deptName) {
			list = getDeptTree(list);
		}
		ctx.body = utils.success(list);
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

function getDeptTree(list) {
	return list.filter((item1) => {
		item1._doc.children = [];
		list.forEach((item2) => {
			const parentIds = item2.parentId || [];
			if (parentIds[parentIds.length - 1] === String(item1._id)) {
				item1._doc.children.push(item2);
			}
		});
		return item1.parentId[0] === null;
	});
}

router.post('/operate', async (ctx) => {
	const info = {
		create: '创建成功',
		edit: '编辑成功',
		delete: '删除成功'
	};
	const { _id, action, ...params } = ctx.request.body;
	try {
		if (action === 'create') {
			await Dept.create(params);
		} else if (action !== 'create' && !_id) {
			ctx.body = utils.fail('参数中请传入_id');
		} else if (action === 'edit') {
			params.udpateTime = new Date();
			await Dept.findByIdAndUpdate(_id, params);
		} else if (action === 'delete') {
			await Dept.findByIdAndRemove(_id);
			await Dept.deleteMany({ parentId: { $all: [ _id ] } });
		}

		ctx.body = utils.success('', info[action]);
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

module.exports = router;
