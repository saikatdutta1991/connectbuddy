const router = require('express').Router();
const AuthController = require('../controllers/user/auth');

router.post('/register', AuthController.doRegister);

module.exports = router;
