const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config();

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);
const db = mongoose.connection;
db.on('open', _ => console.log(`Connect To MongodB`));

const UserController = require('./controllers/UserController');
const ExerciseController = require('./controllers/ExerciseController');

// Url Encoded and BodyParser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', function(req, res) {
	res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/exercise/new-user', UserController.CREATE_USER);
app.post('/api/exercise/add', ExerciseController.CREATE_EXERCISE);
app.get('/api/exercise/log', ExerciseController.EXPORT_LOG);
app.get('*', (req, res) =>
	res.json({ success: true, description: 'This is Another Page.', uri: `${req.baseUrl}/timestamp/:date_string` })
);
app.listen(port, _ => console.log(`Server's running @ ${port}`));
