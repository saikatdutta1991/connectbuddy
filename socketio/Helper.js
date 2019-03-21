const io = require('./SocketIO');
const User = require('../models/User');
const messageStorage = require('./MessageStorage');

/** this module reference */
var _this = this;

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



/** send event to users */
module.exports.sendEventTousers = (userids, event, data) => {

    userids.forEach(userid => {

        /** check userid is online
         * if online send online event
         * else store online event message for later use
         */
        let userRoom = `user_${userid}`;
        if (_this.isEmptyRoom(userRoom)) {

            /** store message to userroom */
            messageStorage.pushMessage(userRoom, {
                event: event,
                data: data
            });

        } else {

            /**emit message to user that  */
            io.sockets.in(userRoom).emit(event, data);
        }

    });
}