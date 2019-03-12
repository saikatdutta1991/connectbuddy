const router = require('express').Router();
const AuthController = require('../controllers/user/auth');
const { catchAsyncErrors } = require('../helpers/Api');

router.post('/register', catchAsyncErrors(AuthController.doRegister));
router.post('/login', catchAsyncErrors(AuthController.doLogin));

module.exports = router;
