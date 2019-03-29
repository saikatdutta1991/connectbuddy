var router = require('express').Router();
const { catchAsyncErrors } = require('../helpers/Api');
const AuthenticateUserMiddleware = require('../middlewares/AuthenticateUser');
const AuthController = require('../controllers/user/auth');
const ProfileController = require('../controllers/user/profile');
const RequestController = require('../controllers/user/request');
const MessageController = require('../controllers/user/MessageController');
const FcmController = require('../controllers/user/FcmController');

router.post('/register', catchAsyncErrors(AuthController.doRegister));
router.post('/login', catchAsyncErrors(AuthController.doLogin));


/** send user base64 image as binary image stream */
router.get('/:userid/image', catchAsyncErrors(ProfileController.showUserImage));


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
router.get('/friends/:friendid/messages', catchAsyncErrors(MessageController.getMessages));
router.patch('/fcm/token', catchAsyncErrors(FcmController.addFcmToken));
router.get('/search', catchAsyncErrors(ProfileController.searchUsers)); /** search any users by name or email */

module.exports = router;
