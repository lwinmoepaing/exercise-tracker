const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const exerciseSchema = new Schema({
	user_id: {
		type: mongoose.Types.ObjectId,
		require: true
	},
	description: {
		type: String,
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	date: {
		type: Date,
		default: Date.now
	}
});
module.exports = model('Exercise', exerciseSchema);
