var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	res.render('index', { title: process.env.APP_NAME });
});


router.get("/image/:image_string", function (req, res) {

	let base64string = req.params.image_string;
	let type = base64string.substring("data:image/".length, base64string.indexOf(";base64"))
	var imagedata = base64string.split(",")[1];

	var img = new Buffer(imagedata, 'base64');

	res.writeHead(200, {
		'Content-Type': `image/${type}`,
		'Content-Length': img.length
	});

	res.end(img);
});

module.exports = router;
