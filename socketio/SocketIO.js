const socketio = require('socket.io');
const io = socketio();

io.on('connection', socket => {

    console.log(`A user connected ${socket.id}`);

    /** join socket to specific room */
    let socketRoom = `${socket.handshake.query.type}_${socket.handshake.query.id}`;
    socket.join(socketRoom);
    console.log('user joined to room : ' + socketRoom);



    socket.on('disconnect', () => {
        console.log('user leave room : ' + socketRoom)
        socket.leave(socketRoom);
    })

});


module.exports = io;