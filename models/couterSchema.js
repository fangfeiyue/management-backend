const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
	_id: String,
	sequence_value: Number
});

module.exports = mongoose.model('counter', userSchema, 'counter');
