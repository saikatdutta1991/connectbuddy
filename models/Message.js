const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var messageSchema = new Schema({

    from_user: { type: Schema.Types.ObjectId, ref: 'User' },
    to_user: { type: Schema.Types.ObjectId, ref: 'User' },

    message: {
        type: String,
        default: ''
    }

}, {
        timestamps: { createdAt: true, updatedAt: false }
    });



const Message = mongoose.model('Message', messageSchema);

module.exports = Message;