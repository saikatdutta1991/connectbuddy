const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const { userProfileUpdate } = require('../../validators/Auth');
const User = require('../../models/User');
const SocketIoHelper = require('../../socketio/Helper');
const fs = require('fs');
const path = require('path');



/** 
 * search any users by name email
 */
module.exports.searchUsers = async function (req, res) {

    let queryString = req.query.q ? req.query.q : '';

    let users = await User.find({
        _id: { $ne: req.auth_user._id },
        $text: { $search: queryString }
    }, { score: { $meta: "textScore" } })
        .sort({ score: { $meta: "textScore" } })
        .select('name email image_base64')
        .limit(50)
        .exec();

    res.json(createResponse(true, 'users', 'users', users))
}






/**
 * render user base64 image as image
 */
module.exports.showUserImage = async (req, res, next) => {

    let user = await User.findOne({ _id: req.params.userid }).select('image_base64').lean();
    let base64string = user.image_base64;

    if (!base64string) {

        var img = fs.readFileSync(path.join(__dirname, '/../../public/images/default_face.gif'));
        res.writeHead(200, { 'Content-Type': 'image/gif' });
        res.end(img, 'binary');
        return;
    }


    let type = base64string.substring("data:image/".length, base64string.indexOf(";base64"));
    var imagedata = base64string.split(",")[1];

    var img = new Buffer(imagedata, 'base64');

    res.writeHead(200, {
        'Content-Type': `image/${type}`,
        'Content-Length': img.length
    });

    res.end(img);

}





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

    if (req.body.image_base64) {
        updateObject.image_base64 = req.body.image_base64;
    }


    /*
    now only using base63 image for profile picture
    let file = await User.uploadImage(req, res).catch(err => { })
    if (file) {
        updateObject.image_path = file.path;
    }*/

    /** update user data */
    await User.updateOne({ _id: req.auth_user._id }, updateObject);
    let updatedUser = await User.findOne({ _id: req.auth_user._id });


    if (req.body.latitude && req.body.longitude) {
        /** send updated location to friends */
        SocketIoHelper.sendEventTousers(updatedUser.friends, 'friend_updated_location', {
            latitude: req.body.longitude,
            longitude: req.body.longitude,
            userid: updatedUser._id
        });
    }



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