const router = require('koa-router')();
const Utils = require('../utils/utils');
const Leave = require('../models/leavSchema');
const Dept = require('../models/deptSchema');
const utils = require('../utils/utils');
const leavSchema = require('../models/leavSchema');

router.prefix('/leave');

router.get('/list', async (ctx) => {
	try {
		const { applyState, type } = ctx.request.query;
		const { skipIndex, page } = utils.parge(ctx.request.query);
		const authorization = ctx.request.headers.authorization;
		const { data } = utils.decode(authorization);
		let params = {};
		// 审批列表
		if (type == 'approve') {
			// 审批状态是待审批或审批中
			if (applyState == 1 || applyState == 2) {
				params.curAuditUserName = data.userName;
				params.$or = [ { applyState: 1 }, { applyState: 2 } ];
			} else {
				console.log('走到这个', data.userId);
				// 其他审批状态，只要包含当前登录人即可
				params = { 'auditFlows.userId': data.userId };
			}
		} else {
			//申请休假列表 只显示当前用户的申请
			params = {
				'applyUser.userId': data.userId
			};
		}

		if (applyState) params.applyState = applyState;

		const query = Leave.find(params);
		const list = await query.skip(skipIndex).limit(page.pageSize);
		const total = await Leave.countDocuments(params);
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

router.post('/operate', async (ctx) => {
	try {
		const { _id, action, ...params } = ctx.request.body;
		const { authorization } = ctx.request.headers;
		const { data } = utils.decode(authorization);

		console.log(data);

		if (action == 'create') {
			let orderNo = 'XJ';
			orderNo += utils.formateDate(new Date(), 'yyMMdd');
			const count = await Leave.countDocuments();
			params.orderNo = orderNo + count;

			const id = data.deptId.pop();
			const dept = await Dept.findById(id);
			console.log('dept', dept);
			const userList = await Dept.find({ deptName: { $in: [ '人事部门', '财务部门' ] } });
			let auditUsers = dept.userName;
			const auditFlows = [ { userId: dept.userId, userName: dept.userName, userEmail: dept.userEmail } ];
			userList.forEach((item) => {
				auditFlows.push({
					userId: item.userId,
					userName: item.userName,
					userEmail: item.userEmail
				});
				auditUsers += ',' + item.userName;
			});

			params.auditUsers = auditUsers;
			params.curAuditUserName = dept.userName;
			params.auditFlows = auditFlows;
			params.auditLogs = [];
			params.applyUser = {
				userId: data.userId,
				userName: data.userName,
				userEmail: data.userEmail
			};
			await Leave.create(params);
			ctx.body = utils.success('', '创建成功');
		} else {
			await Leave.findByIdAndUpdate(_id, { applyState: 5 });
			ctx.body = utils.success('', '操作成功');
		}
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

module.exports = router;
