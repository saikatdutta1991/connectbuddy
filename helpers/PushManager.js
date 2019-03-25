const FCM = require('fcm-node');
const fcm = new FCM(process.env.FCM_SERVER_KEY);


module.exports = {

    send: function (token, title, message, data = {}) {

        return new Promise(function (resolve, reject) {

            let payload = {
                to: token,
                notification: {
                    title: title,
                    body: message
                },
                data: data,
                android: {
                    priority: "high"
                }
            };

            fcm.send(payload, function (err, response) {

                if (err) {
                    reject(err);
                    return;
                }

                resolve(response);
            });

        });

    }
}
