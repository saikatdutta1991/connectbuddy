
const { userRegistration, userLogin } = require('../../validators/Auth');
const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const User = require('../../models/User');




/**
 * login user 
 */
exports.doLogin = async (req, res, next) => {

    let data = {};

    /** validate user request params */
    let errors = await userLogin(req, data);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }

    let response = createResponse(true, 'loggedin', 'You have registered successfully', {
        user: data.user,
        authToken: data.user.getJwtToken()
    });

    return res.json(response);
}




/**
 * register user 
 */
exports.doRegister = async (req, res, next) => {

    /** validate user request params */
    let errors = await userRegistration(req);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }


    /** create user and save */
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        password: User.encryptPassword(req.body.password),
        location: {
            coordinates: [req.body.latitude, req.body.longitude]
        }
    });

    user = await user.save()

    let response = createResponse(true, 'registered', 'You have registered successfully', {
        user: user,
        authToken: user.getJwtToken()
    });
    return res.json(response);
}