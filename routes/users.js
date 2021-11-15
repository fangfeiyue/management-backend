const router = require('koa-router')();
const User = require('./../models/userSchema');
const Menu = require('./../models/menuSchema');
const Role = require('./../models/roleSchema');
const Counter = require('./../models/couterSchema');
const Util = require('../utils/utils');
var jwt = require('jsonwebtoken');
const utils = require('../utils/utils');
const md5 = require('md5');
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

		console.log('res', res);

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
		ctx.body = Util.fail(err.stack);
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
		const query = User.find(params, { _id: 0, userPwd: 0 });
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

router.post('/operate', async (ctx) => {
	try {
		const { userId, userName, userEmail, mobile, job, action, state, roleList, deptId } = ctx.request.body;

		if (action == 'add' && (!userName || !userEmail || !deptId)) {
			ctx.body = utils.fail('参数错误', utils.CODE.PARAM_ERROR);
			return;
		}

		if (action == 'add') {
			const res = await User.findOne({ $or: [ { userName }, { userEmail } ] }, '_id userName userEmail');

			if (res) {
				let tip = '';
				if (res.userName === userName) {
					tip = '用户名已存在，请修改用户名';
				} else if (res.userEmail === userEmail) {
					tip = '邮箱已经被使用，请修改邮箱';
				}
				ctx.body = utils.fail(tip);
				return;
			}

			const doc = await Counter.findOneAndUpdate(
				{ _id: 'userId' },
				{
					$inc: { sequence_value: 1 }
				},
				// 设置为 true 表示返回一个新的文档
				{ new: true }
			);

			// 新增用户方法一
			const user = await User.create({
				userId: doc.sequence_value,
				job,
				state,
				deptId,
				mobile,
				role: 1,
				userName,
				roleList,
				userEmail,
				// 这里暂时写死
				// userPwd: md5('123456')
				userPwd: '123456'
			});

			// 新增用户方法二
			// const user = new User({
			// 	userId: doc.sequence_value,
			// 	job,
			// 	state,
			// 	deptId,
			// 	mobile,
			// 	role: 1,
			// 	userName,
			// 	roleList,
			// 	userEmail,
			// 	// 这里暂时写死
			// 	userPwd: md5('123456')
			// });

			// user.save();

			ctx.body = utils.success(user, '用户创建成功');
			return;
		}

		if (!deptId) {
			ctx.body = utils.fail('部门不能为空', utils.CODE.PARAM_ERROR);
			return;
		}

		const res = await User.findOneAndUpdate({ userId }, { mobile, job, state, roleList, deptId });

		if (res) {
			ctx.body = utils.success({}, '更新成功');
			return;
		}

		ctx.body = utils.fail('更新失败，没有找到对应的用户');
	} catch (err) {
		ctx.body = utils.fail(`编辑失败 ~ ${err.stack}`);
	}
});

// 获取所有的用户列表
router.get('/all/list', async (ctx) => {
	try {
		const list = await User.find({}, 'userId userName userEmail');
		ctx.body = utils.success(list);
	} catch (err) {
		ctx.body = utils.fail(err.stack);
	}
});

// 根据用户权限获取菜单列表
router.get('/getPermissionList', async (ctx) => {
	const authorization = ctx.headers.authorization;
	const { data: { role, roleList } } = utils.decode(authorization);
	const list = await getMenuList(role, roleList);
	ctx.body = utils.success(list);
});

async function getMenuList(role, roleList) {
	let list = [];
	if (role == 0) {
		list = (await Menu.find({})) || [];
	} else {
		roleList = await Role.find({ _id: { $in: roleList } });
		let permissionList = [];
		roleList.forEach((role) => {
			const { checkedKeys, halfCheckedKeys } = role.permissionList;
			permissionList = [ ...permissionList, ...checkedKeys, ...halfCheckedKeys ];
		});
		permissionList = [ ...new Set(permissionList) ];
		list = await Menu.find({ _id: { $in: permissionList } });
	}
	return getTreeMenu(list, null, []);
}

function getTreeMenu(list) {
	return list.filter((item1) => {
		item1._doc.children = [];
		list.forEach((item2) => {
			const parentIds = item2.parentId || [];
			if (parentIds[parentIds.length - 1] == String(item1._id)) {
				item1._doc.children.push(item2);
			}
		});
		return item1.parentId[0] === null;
	});
}

module.exports = router;
