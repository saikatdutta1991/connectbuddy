const socketio = require('socket.io');
const io = socketio();
const Message = require('../models/Message');
const messageStorage = require('./MessageStorage');
const User = require('../models/User');

const timeout = 10; //timeout sec for connecting user

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
    socket.room = socketRoom;
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

        /** fetch from user and to user */
        let fromUser = await User.findOne({ _id: socket.userid }).lean().exec();


        /** save message to database */
        let message = new Message({
            from_user: fromUser._id,
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


            /** send push notification to to_user */
            User.sendPushNotification(data.to_user, 'new_mesaage_received', fromUser.name, 'New message', data.message, message);

        } else {

            /**emit message to intened user */
            message = message.toObject();
            message.from_user_name = fromUser.name;
            io.sockets.in(userRoom).emit('new_mesaage_received', message);
        }

        /** always send message back to user who is sending the message */
        io.sockets.in(socketRoom).emit('new_message_sent', message);

    });






    /**
     * main code flow of video chat
     */
    socket.on('connect_for_vc', async ({ calleeType, calleeId }) => {

        /** find callee/user by id */
        let callee = await User.findOne({ _id: calleeId }).lean().exec();
        let caller = await User.findOne({ _id: socket.userid }).lean().exec();


        //send push message to callee to launch app
        User.sendPushNotification(callee._id, 'new_video_call', `${caller.name}`, 'New Call', `${caller.name} is calling you. Receive or reject the call.`);


        /** check for sometime that user connects to socket or not */
        let timeTick = 0;
        let calleeRoom = `${calleeType}_${calleeId}`;
        let waitForCalleeInterval = setInterval(() => {

            //check for timeout
            if (timeTick++ == timeout) {
                io.sockets.in(socket.room).emit('is_connected_vc', { isConnected: false });
                return clearInterval(waitForCalleeInterval);
            }


            /** check if user is connected to socket means online
             * then send caller than user is connected_for_vc
             */
            if (!Helper.isEmptyRoom(calleeRoom)) { //room is not empty

                console.log('user connected for video call');

                //send socket event back to caller
                io.sockets.in(socket.room).emit('is_connected_vc', { isConnected: true });
                return clearInterval(waitForCalleeInterval);
            }

            console.log('trying to connect user for video call : timetick: ' + timeTick);


        }, 1000)


    });

    socket.on('send_vc', async (data) => {
        let calleeRoom = `${data.calleeType}_${data.calleeId}`;
        io.sockets.in(calleeRoom).emit('incoming_call', data);
    });

    socket.on('accept_vc', async (data) => {
        let callerRoom = `${data.callerType}_${data.callerId}`;
        io.sockets.in(callerRoom).emit('vc_accepted', data);
    });

    socket.on('reject_vc', async (data) => {
        let callerRoom = `${data.callerType}_${data.callerId}`;
        io.sockets.in(callerRoom).emit('vc_rejected', data);
    });

    socket.on('vc_exchange', async (data) => {
        let room = `${usertype}_${userid}`;
        io.sockets.in(room).emit(data.mtype, data);
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
