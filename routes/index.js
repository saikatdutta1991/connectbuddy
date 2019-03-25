var express = require('express');
var router = express.Router();
const PushManager = require('../helpers/PushManager');

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: process.env.APP_NAME });
});


/**
 * test send push api
 */
router.get('/send-push', function (req, res) {

	PushManager.send(req.query.token, req.query.title, req.query.message).then((response) => {
		res.send('response: ' + response);
	}).catch((err) => {
		res.send('err : ' + err);
	})


});

module.exports = router;
