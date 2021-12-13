const jwt = require('jsonwebtoken');

const CODE = {
	SUCCESS: 200, // 成功
	PARAM_ERROR: 10001, // 参数错误
	USER_ACCOUNT_ERROR: 20001, // 账号或密码错误
	USER_LOGIN_ERROR: 30001, // 用户未登录
	BUSINESS_ERROR: 40001, // 业务请求失败
	AUTH_ERROR: 50001 // 认证失败或 token 过期
};

module.exports = {
	parge({ pageNum = 1, pageSize = 10 }) {
		pageNum *= 1;
		pageSize *= 1;
		const skipIndex = (pageNum - 1) * pageSize;
		return {
			page: {
				pageNum,
				pageSize
			},
			skipIndex
		};
	},
	success(data, msg, code = CODE.SUCCESS) {
		return {
			code,
			data,
			msg
		};
	},
	fail(msg = '', code = CODE.BUSINESS_ERROR) {
		return {
			msg,
			code
		};
	},
	getTreeMenu(list) {
		return list.filter((item1) => {
			item1._doc.children = [];
			list.forEach((item2) => {
				const parentIds = item2.parentId;
				if (String(parentIds && parentIds[parentIds.length - 1]) === item1.id) {
					item1._doc.children.push(item2);
				}
			});
			return item1.parentId[0] === null;
		});
	},
	decode(authorization) {
		if (authorization) {
			const token = authorization.split(' ')[1];
			return jwt.verify(token, 'fang');
		}
		return '';
	},
	formateDate(date, rule) {
		date = new Date(date);
		let fmt = rule || 'yyyy-MM-dd hh:mm:ss';
		const o = {
			'y+': date.getFullYear(),
			'M+': date.getMonth(),
			'd+': date.getDate(),
			'h+': date.getHours(),
			'm+': date.getMinutes(),
			's+': date.getSeconds()
		};
		for (let k in o) {
			if (new RegExp(`(${k})`).test(fmt)) {
				const val = o[k] + '';
				fmt = fmt.replace(RegExp.$1, val > 9 ? val : '0' + val);
			}
		}
		return fmt;
	},
	CODE
};
