const UserModel = require('../models/User');

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


    /** check coordinates */
    req.checkBody('latitude').exists().not().isEmpty().not().isString().withMessage('Location is missing');
    req.checkBody('longitude').exists().not().isEmpty().not().isString().withMessage('Location is missing');


    return req.getValidationResult()
}
