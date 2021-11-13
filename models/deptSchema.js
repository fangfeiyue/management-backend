const mongoose = require('mongoose');
const deptSchema = mongoose.Schema({
	deptName: String,
	userId: String,
	userName: String,
	userEmail: String,
	parentId: [],
	updateTime: {
		type: Date,
		default: Date.now()
	},
	createTime: {
		type: Date,
		default: Date.now()
	}
});

module.exports = mongoose.model('depts', deptSchema, 'depts');
