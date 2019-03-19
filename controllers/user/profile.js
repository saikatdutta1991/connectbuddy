const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const { userProfileUpdate } = require('../../validators/Auth');
const User = require('../../models/User');


/**
 * get nearby users by latitude and longitude
 */
module.exports.getNearbyUsers = async (req, res, next) => {

    let users = await User.aggregate([
        {
            $geoNear: {
                near: { type: "Point", coordinates: [parseFloat(req.query.longitude), parseFloat(req.query.latitude)] },
                distanceField: "calculated_distance_km",
                distanceMultiplier: 0.001,
                maxDistance: parseFloat(req.query.distance),
                spherical: true
            }
        }
    ]).match({ _id: { $ne: req.auth_user._id } });

    users = users.map(user => {
        user['image_url'] = User.getImageurl(user);
        return user;
    })

    res.json(createResponse(true, 'nearby_users', 'Nearby users', users))
}





/**
 * update profile
 */
module.exports.editProfile = async (req, res, next) => {

    /** validate user request params */
    let errors = await userProfileUpdate(req);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }

    /** store fields that are requied to update */
    let updateObject = {};

    if (req.body.name) {
        updateObject.name = req.body.name
    }

    if (req.body.email) {
        updateObject.email = req.body.email;
    }

    if (req.body.new_password) {
        updateObject.password = User.encryptPassword(req.body.new_password)
    }

    if (req.body.latitude && req.body.longitude) {
        updateObject.location = {
            coordinates: [req.body.longitude, req.body.latitude]
        }
    }


    let file = await User.uploadImage(req, res).catch(err => { })
    if (file) {
        updateObject.image_path = file.path;
    }

    /** update user data */
    await User.updateOne({ _id: req.auth_user._id }, updateObject);
    let updatedUser = await User.findOne({ _id: req.auth_user._id });




    res.json(createResponse(true, 'profile', 'You profile updated', {
        user: updatedUser
    }));


}



/**
 * get user profile
 */
module.exports.getProfile = async (req, res, next) => {

    let response = createResponse(true, 'profile', 'You profile fetched', {
        user: req.auth_user
    });

    return res.json(response);
}   