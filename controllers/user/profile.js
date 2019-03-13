const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const User = require('../../models/User');

/**
 * get user profile
 */
module.exports.getProfile = async (req, res, next) => {

    let response = createResponse(true, 'profile', 'You profile fetched', {
        user: req.auth_user
    });

    return res.json(response);
}   