const mongoose = require('mongoose');
const { Schema } = mongoose;

const roleSchema = new Schema({
	roleName: String,
	remark: String,
	permissionList: {},
	updateTime: {
		type: Date,
		default: Date.now()
	},
	createTime: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('roles', roleSchema, 'roles');
