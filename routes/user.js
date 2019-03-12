const router = require('express').Router();
const AuthController = require('../controllers/user/auth');
const { catchAsyncErrors } = require('../helpers/Api');

router.post('/register', catchAsyncErrors(AuthController.doRegister));

module.exports = router;
