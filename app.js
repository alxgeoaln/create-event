const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mongoose = require('mongoose');
const config = require('./config/database');


//Connct to Database
mongoose.connect(config.database);

mongoose.connection.on('connected', function () {
    console.log('Connected to database', config.database)
});

mongoose.connection.on('error', function (err) {
    console.log('Database error', err)
});

const app = express();

const users = require('./routes/users');
const events = require('./routes/events');

const port = process.env.PORT || 8080;
app.use(cors());


//Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

//Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

app.use('/users', users);
app.use('/events', events);

//Index Route
app.get('/', function (req, res) {
    res.send('Invalid Endpoint')
});


app.listen(port, function () {
    console.log('Server started on port', port);
})