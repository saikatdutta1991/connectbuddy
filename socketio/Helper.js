const io = require('./SocketIO');


/** 
 * check room is empty
 */
module.exports.isEmptyRoom = (room) => {
    let clients = io.sockets.adapter.rooms[room];
    return !(clients && clients.length);
}