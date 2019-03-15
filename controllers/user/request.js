const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const User = require('../../models/User');
const FriendRequest = require('../../models/FriendRequest');
const { sendRequestValidator, cancelRequestValidator, rejectRequestValidator } = require('../../validators/Request');
const socketIO = require('../../socketio/SocketIO');




/**
 * get friends list
 */
module.exports.getFriends = async (req, res) => {

    let user = await User.findOne({ _id: req.auth_user._id })
        .populate('friends', '_id, name, email');

    res.json(createResponse(true, 'requests', 'Requests fetched', { friends: user.friends }))

}




/**
 * accept friend request
 */
module.exports.acceptFriendRequest = async (req, res) => {

    let data = {};

    /** validate user request */
    let errors = await rejectRequestValidator(req, data);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }


    /** change friendRequest status to accepted */
    await FriendRequest.updateOne({ _id: data.friendRequest._id }, { status: FriendRequest.ACCEPTED })
    await User.updateOne({ _id: req.auth_user._id }, { $push: { friends: req.body.userid } });
    await User.updateOne({ _id: req.body.userid }, { $push: { friends: req.auth_user.id } });


    /** send event to other user that new friend request canceled */
    socketIO.sockets.in(`user_${req.body.userid}`).emit('friend_request_accepted', {
        fromUser: req.auth_user
    });


    let response = createResponse(true, 'friend_request_accepted', 'Friend request accepted successfully');
    return res.json(response);

}




/**
 * get friend requests
 */
module.exports.getFriendRequests = async (req, res) => {

    let freindRequests = await FriendRequest
        .find({
            $or: [{ from_user: req.auth_user._id }, { to_user: req.auth_user.id }]
        })
        .populate('from_user', '_id name')
        .populate('to_user', '_id name')
        .sort({ createdAt: -1 });

    res.json(createResponse(true, 'requests', 'Requests fetched', freindRequests))

}





/**
 * reject friend request
 */
module.exports.rejectFriendRequest = async (req, res, next) => {

    let data = {};

    /** validate user request */
    let errors = await rejectRequestValidator(req, data);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }

    /** delete frined request */
    await FriendRequest.deleteOne({ _id: data.friendRequest._id })

    /** send event to other user that new friend request canceled */
    socketIO.sockets.in(`user_${req.body.userid}`).emit('friend_request_rejected', {
        fromUser: req.auth_user,
        friendRequest: data.friendRequest
    });


    let response = createResponse(true, 'friend_request_rejected', 'Friend request rejected successfully', {
        friendRequest: data.friendRequest
    });
    return res.json(response);

}


/**
 * cancel sent friend request
 */
module.exports.cancelFriendRequest = async (req, res, next) => {

    let data = {};

    /** validate user request */
    let errors = await cancelRequestValidator(req, data);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }


    /** delete frined request */
    await FriendRequest.deleteOne({ _id: data.friendRequest._id })


    /** send event to other user that new friend request canceled */
    socketIO.sockets.in(`user_${req.body.userid}`).emit('friend_request_canceled', {
        fromUser: req.auth_user,
        friendRequest: data.friendRequest
    });

    let response = createResponse(true, 'friend_request_canceled', 'Friend request canceled successfully', {
        friendRequest: data.friendRequest
    });
    return res.json(response);

}




/** 
 * send friend request to user
 */
module.exports.sendFriendRequest = async (req, res, next) => {

    let data = {};

    /** validate user request */
    let errors = await sendRequestValidator(req, data);

    if (!errors.isEmpty()) {
        return res.json(createResponse(false, 'v_error', 'Some input fields are not valid', errors.formatWith(formatErrorExpress).mapped()));
    }

    let friendRequest = new FriendRequest({
        from_user: req.auth_user._id,
        to_user: req.body.userid,
        status: FriendRequest.REQUESTED
    })

    friendRequest = await friendRequest.save();

    /** send event to other user that new friend request came */
    socketIO.sockets.in(`user_${req.body.userid}`).emit('new_friend_request', {
        fromUser: req.auth_user,
        friendRequest: friendRequest
    });


    let response = createResponse(true, 'friend_request_sent', 'Friend request sent successfully', {
        toUser: data.user,
        friendRequest: friendRequest
    });
    return res.json(response);

}