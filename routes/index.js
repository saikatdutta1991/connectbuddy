var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: process.env.APP_NAME });
});


/** GET aobut us page */
router.get('/about-us', function (req, res, next) {
	res.render('about-us', { title: process.env.APP_NAME });
});


module.exports = router;
