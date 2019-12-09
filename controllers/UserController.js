const User = require('../models/User');
module.exports = { CREATE_USER };

async function CREATE_USER(req, res) {
	const { username } = req.body;
	if (!username) return res.status(400).json({ error: 'Username is Required' });
	try {
		let newUser = new User({
			username,
			exercises: []
		});
		await newUser.save();
		res.status(200).json({ _id: newUser._id, username });
	} catch (e) {
		if (e.code === 11000) return res.status(400).json({ error: 'Username is Already Registered' });
		res.status(500).json({ error: e.message });
	}
}
