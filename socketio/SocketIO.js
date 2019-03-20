const socketio = require('socket.io');
const io = socketio();
const User = require('../models/User');
const messageStorage = require('./MessageStorage');

io.on('connection', socket => {

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
    })






    /**
     * when user disconnect from server
     * remove user from room that joined
     */
    socket.on('disconnect', () => {
        console.log('user leave room : ' + socketRoom)
        socket.leave(socketRoom);
    })

});


module.exports = io;

//let the socketIO to initi exports
const Helper = require('./Helper');