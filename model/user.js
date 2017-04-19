const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');

//#region Session
const SessionSchema = mongoose.Schema({
    eventId: String,
    sessionTitle: String,
    sessionLevel: String,
    sessionDescription: String
});
//endregion

//#region Attend Schema
const AttendEventSchema = mongoose.Schema({
    eventId: String,
    userId: String
});
//endregion

//#region Event Schema
const EventSchema = mongoose.Schema({
    userId: String,
    eventName: String,
    eventPoster: String,
    date: String,
    time: String,
    city: String,
    address: String,
    sessions: [SessionSchema],
    attendEvent: [AttendEventSchema]
});
//endregion

//#region User Schema
const UserSchema = mongoose.Schema({

    name: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    event: [EventSchema],
});
//endregion

const User = module.exports = mongoose.model('User', UserSchema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback)
};

module.exports.getUserByUsername = function (username, callback) {
    const query = {username: username};
    User.findOne(query, callback)
};

module.exports.addUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            newUser.save(callback)
        });
    });
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    })
};

module.exports.saveEvent = function (userId, eventObj, callback) {
    User.update({_id: userId},
        {$push: {'event': eventObj}}, {upsert: true}, callback)
};

module.exports.getAllEvents = function (callback) {
    User.find({}).select({"event": 1, "_id": 0}).exec(callback)
};

module.exports.deleteEvent = function (eventId, userId, callback) {
    User.update({_id: userId},
        {$pull: {'event': {'_id': eventId}}}, callback)
};

module.exports.saveSession = function (eventId, sessionObj, callback) {
    User.findOneAndUpdate(
        {"event._id": eventId},
        {"$push": {"event.$.sessions": sessionObj}}, callback
    )
};

module.exports.attendEvent = function (eventId, attendObj, callback) {
    User.findOneAndUpdate(
        {"event._id": eventId},
        {"$push": {"event.$.attendEvent": attendObj}}, callback
    )
};
