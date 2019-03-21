const { createResponse, formatErrorExpress } = require('../../helpers/Api');
const User = require('../../models/User');
const Message = require('../../models/Message');


/**
 * get all messages with a particular friend
 */
module.exports.getMessages = async (req, res, next) => {


    let messages = await Message.find({
        $and: [{
            $or: [{ from_user: req.auth_user._id }, { to_user: req.auth_user.id }],
            $or: [{ to_user: req.params.friendid }, { from_user: req.params.friendid }],
        }]
    }).lean();


    res.json(createResponse(true, 'messages', 'Messages fetched', messages));
}