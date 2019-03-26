const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const DeviceToken = require('../../models/DeviceToken');


/**
 * add user fcm token
 */
module.exports.addFcmToken = async (req, res, next) => {

    /** check requested fcm token already exists in our db
     * then delete that record
     * then craete new record with device token
     */
    await DeviceToken.deleteMany({ device_token: req.body.device_token });

    let deviceToken = new DeviceToken({
        user: req.auth_user._id,
        device_type: req.body.device_type,
        device_token: req.body.device_token
    });

    deviceToken = await deviceToken.save()


    res.json(createResponse(true, 'device_token_saved', 'Device token saved', deviceToken));

}