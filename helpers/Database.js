let mongoose = require('mongoose')

class Database {

    constructor() {
        this._connect()
    }


    _getConnectionString() {

        let password = encodeURIComponent(process.env.MONGO_PASSWORD);


        /** srv enabled or not */
        if (process.env.MONGOSRV == 'true') {
            return `mongodb+srv://${process.env.MONGO_USER}:${password}@${process.env.MONGO_HOST}/${process.env.MONGODB}?retryWrites=true`;
        } else {

            let userandpass = process.env.MONGO_USER == "" ? '' : `${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}`;
            return `mongodb://${userandpass}${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGODB}`
        }

    }



    /** private method */
    _connect() {

        console.log('Connecting to database..');

        mongoose.connect(this._getConnectionString(), { useNewUrlParser: true }).then(() => {
            console.log('Database connected')
        }).catch(err => {
            console.error(`Database conntection failed. Reason: ${err.message}`)
        })
    }
}

module.exports = new Database()