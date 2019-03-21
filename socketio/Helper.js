const io = require('./SocketIO');
const User = require('../models/User');


/** 
 * check room is empty
 */
module.exports.isEmptyRoom = (room) => {
    let clients = io.sockets.adapter.rooms[room];
    return !(clients && clients.length);
}


/**
 * get friend ids
 */
module.exports.getFriendIds = async (userid) => {

    let user = await User.findOne({ _id: userid });
    return user.friends;
}