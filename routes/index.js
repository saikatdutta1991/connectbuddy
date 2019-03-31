var express = require('express');
var router = express.Router();
var User = require('../models/User');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: process.env.APP_NAME });
});


/** GET aobut us page */
router.get('/about-us', function (req, res, next) {
	res.render('about-us', { title: process.env.APP_NAME });
});


router.get('/send-push/:userid', function (req, res) {

	User.sendPushNotification(req.params.userid, 'new_call', 'New Call', 'New incoming call');
	res.send('sent')

});


module.exports = router;
