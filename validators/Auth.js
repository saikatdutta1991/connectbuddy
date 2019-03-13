const UserModel = require('../models/User');



/**
 * validate user profile udpate request
 */
module.exports.userProfileUpdate = async req => {

    /**check for name */
    req.checkBody('name').optional().isLength({ min: 3, max: 100 }).withMessage('Name must between 3-100 characters')

    /** check for new password */
    req.checkBody('new_password').optional().isLength({ min: 6, max: 100 }).withMessage('Password must between 6-100 characters')



    /** check email */
    req.checkBody('email').optional().isEmail().withMessage('Your email is not valid');
    req.checkBody('email', 'Email used by another user').optional().custom(async value => {

        let user = await UserModel.findOne({ 'email': value, _id: { $ne: req.auth_user._id } });

        if (user) {
            return Promise.reject();
        }
    });


    req.checkBody('latitude').optional().exists().not().isEmpty().not().isString().withMessage('Location is invalid');
    req.checkBody('longitude').optional().exists().not().isEmpty().not().isString().withMessage('Location is invalid');



    /** check mobile number errors first */
    var errors = await req.getValidationResult()
    return errors;

}



/**
 * validate user login request
 */
module.exports.userLogin = async function (req, data) {

    /**check for password */
    req.checkBody('password').isLength({ min: 6, max: 100 }).withMessage('Password must between 6-100 characters')

    /** check email */
    req.checkBody('email').isEmail().withMessage('Your email is not valid');
    req.checkBody('email', 'Email does not exist').custom(async value => {

        data.user = await UserModel.findOne({ 'email': value });

        if (!data.user) {
            return Promise.reject();
        }
    })

    /** check mobile number errors first */
    var errors = await req.getValidationResult()
    if (!errors.isEmpty()) {
        return errors;
    }

    /** check password matches */
    req.checkBody('password', 'Wrong password entered').custom(function (value) {
        return data.user.verifyPassword(req.body.password)
    })


    return req.getValidationResult()
}



/** 
 * validate user registration reqeust
 */
module.exports.userRegistration = async function (req) {

    /**check for name */
    req.checkBody('name').isLength({ min: 3, max: 100 }).withMessage('Name must between 3-100 characters')

    /**check for password */
    req.checkBody('password').isLength({ min: 6, max: 100 }).withMessage('Password must between 6-100 characters')

    /** check email */
    req.checkBody('email').isEmail().withMessage('Your email is not valid');
    req.checkBody('email', 'Email already in use').custom(async (value) => {

        let user = await UserModel.findOne({ 'email': value })
        if (user) {
            return Promise.reject();
        }
    })


    return req.getValidationResult()
}
