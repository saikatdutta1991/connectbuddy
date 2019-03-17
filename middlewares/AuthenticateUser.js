/**
 * verify user auth token
 * if verified then fetch user and add to request as auth_user
 */

const JWT = require('../helpers/JWT');
const { createResponse } = require('../helpers/Api');
const User = require('../models/User');
const ApplicationError = require('../helpers/ApplicationError');

module.exports = async (req, res, next) => {

    let decoded, user, error;

    /** decode token & fetch user */

    try {
        decoded = await JWT.verify(req.headers.authorization, process.env.JWT_SECRET);
        user = await User.findOne({ _id: decoded.data._id });
    } catch (err) {
        error = err;
    }

    if (!user) {
        return res.send(createResponse(false, 'session_expired', 'Session expired'));
    }

    /** add user to request auth_user property */
    req.auth_user = user;

    next();

}