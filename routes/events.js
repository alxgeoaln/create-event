const express = require('express');
const router = express.Router();
const User = require('../model/user');
const passport = require('passport');
const _ = require('underscore');

//#region Save Event
router.post('/', passport.authenticate('jwt', {session: false}), function (req, res) {
    const userId = req.user._id;

    const eventObj = {
        userId: userId,
        eventName: req.body.eventName,
        eventPoster: req.body.eventPoster,
        date: req.body.date,
        time: req.body.time,
        city: req.body.city,
        address: req.body.address
    };

    User.saveEvent(userId, eventObj, function (err, event) {
        if (err) {
            res.json({success: false, message: 'Failed to create the event.'})
        } else {
            res.json({success: true, message: 'Your event was created.'})
        }
    })
});
//endregion

//#region Get all events
router.get('/', function (req, res) {
    User.getAllEvents(function (err, events) {
        if (err) {
            res.json({success: false, message: err});
        } else {
            var eventss = events.map(function (event) {
                return event.event
            });
            var merged = [].concat.apply([], eventss);
            res.json(merged);

        }
    });
});
//endregion

//#region Get event
router.get('/event/:id', passport.authenticate('jwt', {session: false}), function (req, res) {

    const eventId = req.params.id;

    User.getAllEvents(function (err, events) {
        if (err) {
            res.json({success: false, message: err});
        } else {
            var event = events.map(function (event) {
                return event.event
            });
            var merged = [].concat.apply([], event);
            var eventDetails = merged.find(function (d) {
                return d.id === eventId;
            });
            res.json(eventDetails);

        }
    });
});
//endregion

//#region Delete Event
router.post('/deleteEvent', function (req, res) {
    eventId = req.body.eventId;
    userId = req.body.userId;

    User.deleteEvent(eventId, userId, function (err, deletedItem) {
        if (err) {
            res.json({success: false, message: err})
        } else {
            res.json({success: true, message: 'Item has been deleted'});
        }
    })
});
//endregion

//#region Save Session
router.post('/saveSession', function (req, res) {
    var eventId = req.body.eventId;
    var sessionObj = {
        eventId: req.body.eventId,
        sessionTitle: req.body.sessionTitle,
        sessionLevel: req.body.sessionLevel,
        sessionDescription: req.body.sessionDescription
    };

    User.saveSession(eventId, sessionObj, function (err, session) {
        if (err) {
            res.json({success: false, message: err})
        } else {
            res.json({success: true, message: 'Your session has been saved.'})
        }
    })
});
//endregion

//#region Search for session
router.get('/findSessions/:session', function (req, res) {
    var sessionTerm = req.params.session;
    var term = sessionTerm.toLocaleLowerCase();
    var results = [];
    if (sessionTerm === "fuckthepolice") {
        User.getAllEvents(function (err, events) {
            if (err) {
                res.json({success: false, message: err});
            } else {
                var event = events.map(function (event) {
                    return event.event
                });
                var merged = [].concat.apply([], event);

                var sessions = merged.map(function (event) {
                    return event.sessions
                });

                var mergedSessions = [].concat.apply([], sessions);
                res.json(mergedSessions);
            }
        });
    }
    else {
        User.getAllEvents(function (err, events) {
            if (err) {
                res.json({success: false, message: err});
            } else {
                var event = events.map(function (event) {
                    return event.event
                });
                var merged = [].concat.apply([], event);

                merged.forEach(function (event) {
                    var matchingSessions = event.sessions.filter(function (session) {
                        return session.sessionTitle.toLocaleLowerCase().indexOf(term) > -1;
                    });
                    matchingSessions = matchingSessions.map(function (session) {
                        session.eventId = event._id;
                        return session;
                    });
                    results = results.concat(matchingSessions)
                });
                res.json(results);
            }
        });
    }
});
//endregion

//#region Attend event
router.post('/attendEvent', passport.authenticate('jwt', {session: false}), function (req, res) {
    const eventId = req.body.eventId;
    const attendObj = {
        eventId: eventId,
        userId: req.user._id
    };

    User.attendEvent(eventId, attendObj, function (err, attend) {
        if (err) {
            res.json({success: false, message: "An error has occurred"})
        } else {
            res.json({success: true, message: "You have successfully attended."});
        }
    })
});
//endregion

//# region User has attended
router.get('/userHasAttended', passport.authenticate('jwt', {session: false}), function (req, res) {
    const userId = req.user._id;

    User.getAllEvents(function (err, events) {
        if (err) {
            res.json({success: false, message: err});
        } else {
            var event = events.map(function (event) {
                return event.event
            });
            var merged = [].concat.apply([], event);

            var attend = merged.map(function (event) {
                return event.attendEvent;
            });

            var mergedAttend = [].concat.apply([], attend);
            var ifAttend = mergedAttend.some(function (attend) {
                return attend.userId = userId;
            });
            res.json(ifAttend);
        }
    });
});
//endregion

//#region !Attend

//endregion

module.exports = router;