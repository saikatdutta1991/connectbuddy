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



/**
 * fetch last messagae 
 */
messageSchema.statics.getLastMessage = async (userid, friendid) => {

    let lastmessage = await Message.findOne({
        $and: [
            { $or: [{ from_user: userid }, { to_user: userid }] },
            { $or: [{ from_user: friendid }, { to_user: friendid }] }
        ]
    })
        .lean()
        .sort({ createdAt: -1 });

    return lastmessage;
}



const Message = mongoose.model('Message', messageSchema);

module.exports = Message;