const {Schema, model} = require('mongoose')


const schema = new Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    theme: {type: String, default: "light"},
    lang: {type: String, default: "en"},
    listType: {type: String, default: "grid"},
    intervalTime: {type: Number, default: 10000},
    time: {type: Date, default: Date.now},
})

module.exports = model('Admins',schema)
