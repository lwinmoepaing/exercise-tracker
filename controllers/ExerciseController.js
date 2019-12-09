const Exercise = require('../models/Exercise');
const User = require('../models/User');
const mongoose = require('mongoose');
const moment = require('moment');

module.exports = {
	CREATE_EXERCISE,
	EXPORT_LOG
};

async function EXPORT_LOG(req, res) {
	const { userId, limit, from, to } = req.query;
	if (!userId) return res.status(400).json({ error: 'Unknown UserId' });

	if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ error: 'Unknown UserId' });

	try {
		let user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: 'User Not Found' });
		const { username, _id } = user;

		const f = isDate(from) && from ? from : null;
		const t = isDate(to) && to ? to : null;

		let searchObj =
			f && t
				? { $gte: new Date(f), $lt: new Date(t) }
				: f ? { $gte: new Date(f) } : t ? { $lt: new Date(t) } : { $gte: new Date(1900, 1, 1, 0, 0, 0) };

		let exerciseLogs = await Exercise.find({
			user_id: userId,
			date: searchObj
		})
			.limit(+limit || 100)
			.sort('-_id')
			.select('description duration date -_id');

		exerciseLogs = exerciseLogs.map(({ description, duration, date }) => ({
			description,
			duration,
			date: moment(date, 'YYYY-MM-DD').format('ddd MMM DD YYYY')
		}));

		let returnObj = {
			_id,
			username
		};
		if (isDate(from)) returnObj.from = from;
		if (isDate(to)) returnObj.to = to;
		returnObj = {
			...returnObj,
			count: exerciseLogs.length,
			log: exerciseLogs
		};

		res.json(returnObj);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
}

async function CREATE_EXERCISE(req, res) {
	const { valid, errors } = inputValidate(req.body);
	if (!valid) return res.status(400).json({ error: errors });

	try {
		const { userId, description, duration, date } = req.body;
		const user = await User.findById(userId);
		if (!user) return res.status(400).json({ error: 'User Not Found' });
		const { username, _id } = user;
		let fmt = moment(date, 'YYYY-MM-DD').format('ddd MMM DD YYYY');

		let newExercise = new Exercise({
			user_id: userId,
			description,
			duration: +duration,
			date: new Date(date)
		});
		await newExercise.save();

		res.json({
			username,
			description,
			duration: +duration,
			_id,
			date: fmt
		});
	} catch (e) {
		console.log(e);
		res.status(500).json({ error: e.message });
	}
}

/**
|--------------------------------------------------
| All Validation For ExerciseInputForm
|--------------------------------------------------
*/

function isDate(date) {
	let d = new Date(date);
	if (!Object.prototype.toString.call(d) === '[object Date]') return false;
	if (isNaN(d.getTime())) return false;
	else return true;
}

function inputValidate({ userId, description, duration, date }) {
	let valid = false;
	let errors = [];
	if (!userId.trim()) errors = [ ...errors, 'User Id is Required' ];
	if (!mongoose.Types.ObjectId.isValid(userId)) errors = [ ...errors, 'User Id is not valid' ];
	if (isNaN(duration) || !duration) errors = [ ...errors, 'Duration is not number' ];
	if (!description.trim()) errors = [ ...errors, 'Description is Required' ];
	if (duration <= 0) errors = [ ...errors, 'Duration is too short' ];
	if (!isValidDate(date)) errors = [ ...errors, 'Date is not Valid (Must be yyyy-mm-dd)' ];

	return userId && description && duration && date && errors.length === 0
		? {
				valid: true,
				errors
			}
		: { valid, errors };
}

function isValidDate(dateString) {
	const regEx = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateString.match(regEx)) return false;
	const d = new Date(dateString);
	const dNum = d.getTime();
	if (!dNum && dNum !== 0) return false;
	return d.toISOString().slice(0, 10) === dateString;
}
