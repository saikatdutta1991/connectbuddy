const router = require('express').Router();
const { catchAsyncErrors } = require('../helpers/Api');
const AuthenticateUserMiddleware = require('../middlewares/AuthenticateUser');
const AuthController = require('../controllers/user/auth');
const ProfileController = require('../controllers/user/profile');
const RequestController = require('../controllers/user/request');

router.post('/register', catchAsyncErrors(AuthController.doRegister));
router.post('/login', catchAsyncErrors(AuthController.doLogin));


/** authenticated routes */
router.use('/', AuthenticateUserMiddleware);
router.get('/profile', catchAsyncErrors(ProfileController.getProfile));
router.patch('/profile', catchAsyncErrors(ProfileController.editProfile));
router.get('/nearby', catchAsyncErrors(ProfileController.getNearbyUsers));
router.post('/requests/send', catchAsyncErrors(RequestController.sendFriendRequest));
router.get('/requests', catchAsyncErrors(RequestController.getFriendRequests));
router.post('/requests/cancel', catchAsyncErrors(RequestController.cancelFriendRequest));
router.post('/requests/reject', catchAsyncErrors(RequestController.rejectFriendRequest));
router.post('/requests/accept', catchAsyncErrors(RequestController.acceptFriendRequest));
router.get('/friends', catchAsyncErrors(RequestController.getFriends));

module.exports = router;
