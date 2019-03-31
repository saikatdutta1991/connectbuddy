const FCM = require('fcm-node');
const fcm = new FCM(process.env.FCM_SERVER_KEY);


module.exports = {

    send: function (token, notification = {}, data = {}) {

        return new Promise(function (resolve, reject) {

            /** create payload */
            let payload = {
                to: token,
                android: {
                    priority: "high"
                },
                priority: "high"
            };

            if (Object.keys(notification).length) {
                payload.notification = notification;
            }

            if (Object.keys(data).length) {
                payload.data = data;
            }

            fcm.send(payload, function (err, response) {

                console.log('fcm send ', err, response)

                if (err) {
                    reject(err);
                    return;
                }

                resolve(response);
            });

        });

    }
}
