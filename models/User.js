const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = new Schema(
	{
		username: {
			type: String,
			unique: true,
			index: true,
			required: true
		}
	},
	{
		timestamps: true
	}
);

module.exports = model('User', userSchema);
