const {Schema, model} = require('mongoose')


const schema = new Schema({
    name: {type: String, required: true},
    address: {type: String, required: true},
    private: {type: String, required: true},
    port: {type: Number, default: 0},
    runnedClients: {type: Number, default: 0},
    preup: {type: String, default: ""},
    predown: {type: String, default: ""},
    postup: {type: String, default: ""},
    postdown: {type: String, default: ""},
    total_receive: {type: Number, default: 0},
    total_sent: {type: Number, default: 0},
    total_data: {type: Number, default: 0},
    cumu_receive: {type: Number, default: 0},
    cumu_sent: {type: Number, default: 0},
    cumu_data: {type: Number, default: 0},
    time: {type: Date, default: Date.now},
})

module.exports = model('Interfaces',schema)
