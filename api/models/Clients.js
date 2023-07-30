const {Schema, model} = require('mongoose')


const schema = new Schema({
    first_name: {type: String, default: null},
    last_name: {type: String, default: null},
    phone: {type: String, default: null},
    email: {type: String, default: null},
    tgUsername: {type: String, default: null},
    tgUserDd: {type: String, default: null},
    regDate: {type: Date, default: Date.now},
})

module.exports = model('Clients',schema)
