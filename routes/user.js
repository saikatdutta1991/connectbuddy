const router = require('express').Router();
const { catchAsyncErrors } = require('../helpers/Api');
const AuthenticateUserMiddleware = require('../middlewares/AuthenticateUser');
const AuthController = require('../controllers/user/auth');
const ProfileController = require('../controllers/user/profile');

router.post('/register', catchAsyncErrors(AuthController.doRegister));
router.post('/login', catchAsyncErrors(AuthController.doLogin));


/** authenticated routes */
router.use('/', catchAsyncErrors(AuthenticateUserMiddleware));
router.get('/profile', catchAsyncErrors(ProfileController.getProfile));

module.exports = router;
