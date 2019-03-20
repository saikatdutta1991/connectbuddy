const User = require('../models/User');
const FriendRequest = require('../models/FriendRequest');

/**
 * check friend request sent or not
 */
module.exports.rejectRequestValidator = async (req, data) => {

    /** check request user id is valid */
    req.checkBody('userid', 'Invalid user id').custom(async userid => {
        data.user = await User.findOne({ _id: userid })
        if (!data.user) {
            return Promise.reject();
        }
    });

    /** check friend request exists or not */
    req.checkBody('userid', 'You are not allowed to reject the request').custom(async userid => {

        data.friendRequest = await FriendRequest.findOne({
            from_user: userid,
            to_user: req.auth_user._id,
            status: FriendRequest.REQUESTED
        })
        if (!data.friendRequest) {
            return Promise.reject();
        }
    });

    return req.getValidationResult();

}



/** cancel request validator */
module.exports.cancelRequestValidator = async (req, data) => {

    /** checking request exists or not */
    req.checkBody('userid', 'Request does not exist').custom(async userid => {
        data.friendRequest = await FriendRequest.findOne({ from_user: req.auth_user._id, to_user: userid, status: FriendRequest.REQUESTED });
        if (!data.friendRequest) {
            return Promise.reject();
        }
    })

    return req.getValidationResult();

}



module.exports.sendRequestValidator = async (req, data) => {

    /** check request user id is valid */
    req.checkBody('userid', 'Invalid user id').custom(async userid => {
        data.user = await User.findOne({ _id: userid })
        if (!data.user) {
            return Promise.reject();
        }
    });


    /** check request already send to user or not */
    req.checkBody('userid', 'Friend request already sent').custom(async userid => {
        let friendRequest = await FriendRequest.findOne({ from_user: req.auth_user._id, to_user: userid });
        if (friendRequest) {
            return Promise.reject();
        }
    })
    
    /** check request has been sent by the other user or not */
    req.checkBody('userid', 'You have been requested already').custom(async userid => {
        let friendRequest = await FriendRequest.findOne({ from_user: userid, to_user: req.auth_user._id });
        if (friendRequest) {
            return Promise.reject();
        }
    })
    

    return req.getValidationResult();

}
