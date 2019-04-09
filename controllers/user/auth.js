
const { userRegistration, userLogin } = require('../../validators/Auth');
const { createResponse, formatErrorExpress, imageUrlToBase64 } = require('../../helpers/Api');
const User = require('../../models/User');
const { OAuth2Client } = require('google-auth-library');



/**
 * login user by google auth
 * if user does not exists hen create new user
 */
exports.doGoogleAuth = async (req, res, next) => {

    /** verify google id_token and get payload */
    const GoogleClient = new OAuth2Client(process.env.GOOGLE_USER_ANDROID_CLIENT_ID);
    let ticket, payload;
    try {

        ticket = await GoogleClient.verifyIdToken({ idToken: req.body.id_token });
        payload = ticket.getPayload();

    } catch (error) {
        return res.json(createResponse(false, 'invalid_idtoken', error.message));
    }



    /** 
     * find user by google account id, or email
     * if user not exists, then create new account or login in 
     */
    let user = await User.findOne({
        $or: [{ google_account_id: payload.sub }, { email: payload.email }]
    });


    /** user does not exists, so cerate new user */
    if (!user) {
        user = new User({
            name: payload.name,
            email: payload.email
        });
    }


    /** update user google account id */
    user.google_account_id = payload.sub;

    /** update user image if not */
    if (!user.image_base64) {
        user.image_base64 = await imageUrlToBase64(payload.picture + '?sz=500');
    }


    /** save user object */
    user = await user.save()

    let response = createResponse(true, 'registered', 'You have registered successfully', {
        user: user,
        authToken: user.getJwtToken()
    });
    return res.json(response);


}






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
        password: User.encryptPassword(req.body.password)
    });

    user = await user.save()

    let response = createResponse(true, 'registered', 'You have registered successfully', {
        user: user,
        authToken: user.getJwtToken()
    });
    return res.json(response);
}