const router = require('koa-router')();
const Utils = require('../utils/utils');
const LeaveSchema = require('../models/leavSchema');
const utils = require('../utils/utils');
const { configure } = require('log4js');

router.prefix('/leave');

router.get('/list', async (ctx) => {
	try {
		const { applyState } = ctx.request.query;
		const { skipIndex, page } = utils.parge(ctx.request.query);
		const authorization = ctx.request.headers.authorization;
		const { data } = utils.decode(authorization);
		const params = {
			'applyUser.userId': data.userId
		};

		if (applyState) params.applyState = applyState;

		const query = LeaveSchema.find(params);
		const list = await query.skip(skipIndex).limit(page.pageSize);
		const total = await LeaveSchema.countDocuments(params);
		ctx.body = utils.success({
			page: {
				...page,
				total
			},
			list
		});
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

module.exports = router;
