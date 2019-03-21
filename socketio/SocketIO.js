const socketio = require('socket.io');
const io = socketio();
const Message = require('../models/Message');
const messageStorage = require('./MessageStorage');
const User = require('../models/User');

io.on('connection', async socket => {

    console.log(`A user connected ${socket.id}`);


    /** after socket connects
     * take type and id from user as query string
     * create and join socket into that room
     * add type and userid to socket object
     */
    socket.type = socket.handshake.query.type;
    socket.userid = socket.handshake.query.id;
    let socketRoom = `${socket.type}_${socket.userid}`;
    socket.join(socketRoom);
    console.log('user joined to room : ' + socketRoom);




    /**
     * when user connects to server, 
     * send all his friends online event
     */
    let friendids = await Helper.getFriendIds(socket.userid);
    Helper.sendEventTousers(friendids, 'friend_online', socket.userid);







    /**
     * after socket connectionn initialized
     * send all previous stored messages
     */
    let oldMessage = messageStorage.pullMessage(socketRoom);
    while (oldMessage != undefined) {
        io.sockets.in(socketRoom).emit(oldMessage.event, oldMessage.data);
        oldMessage = messageStorage.pullMessage(socketRoom);
    }







    /**
     * update user location (latitude and longitude)
     */
    socket.on('update_user_location', async data => {

        /** check latitude & longitude exists */
        if (!data.latitude || !data.longitude) {
            return;
        }

        let updateObject = { location: { coordinates: [parseFloat(data.longitude), parseFloat(data.latitude)] } };
        await User.updateOne({ _id: socket.userid }, updateObject);
        console.log('update_user_location', updateObject);

        /**
         * send upated location to friends
         */
        let friendids = await Helper.getFriendIds(socket.userid);
        data.userid = socket.userid;
        Helper.sendEventTousers(friendids, 'friend_updated_location', data);

    });




    /**
     * send new message to user
     * if user is not connected to server store that message in messagestorage
     * and emit it later when user connets again
     */
    socket.on('send_new_message', async data => {

        /** save message to database */
        let message = new Message({
            from_user: socket.userid,
            to_user: data.to_user,
            message: data.message ? data.message : ''
        });

        try {
            message = await message.save();
        } catch (error) {
            return;
        }


        /** check to_user is connected to server room user_{userid}
         * if room is empty then store the message for later
         * else send message to user
        */
        let userRoom = `user_${data.to_user}`;
        if (Helper.isEmptyRoom(userRoom)) {

            /** store message to other user room */
            messageStorage.pushMessage(userRoom, {
                event: 'new_mesaage_received',
                data: message
            });

        } else {

            /**emit message to intened user */
            io.sockets.in(userRoom).emit('new_mesaage_received', message);
        }

        /** always send message back to user who is sending the message */
        io.sockets.in(socketRoom).emit('new_message_sent', message);

    });







    /**
     * when user disconnect from server
     * remove user from room that joined
     */
    socket.on('disconnect', async () => {
        console.log('user leave room : ' + socketRoom)
        socket.leave(socketRoom);


        /**
         * send all his friends that current user went offline
         */
        let friendids = await Helper.getFriendIds(socket.userid);
        Helper.sendEventTousers(friendids, 'friend_offline', socket.userid);


    })

});


module.exports = io;

//let the socketIO to initi exports
const Helper = require('./Helper');