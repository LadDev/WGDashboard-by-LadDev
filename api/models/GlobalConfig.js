const {Schema, model} = require('mongoose')


const schema = new Schema({
    ip: {type: String, required: true},
    dns: {type: String, default: "1.1.1.1, 8.8.4.4"},
    endpoint: {type: String, default: "0.0.0.0/0"},
    mtu: {type: Number, default: 1420},
    keepalive: {type: Number, default: 21},
    path: {type: String, default: "/etc/wireguard"},
})

module.exports = model('GlobalConfig',schema)
