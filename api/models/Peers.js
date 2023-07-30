const {Schema, model} = require('mongoose')


const schema = new Schema({
    interface_name: {type: String, required: true},
    private_key: {type: String, default: null},
    public_key: {type: String, default: null},
    dns: {type: String, default: null},
    endpoint_allowed_ip: {type: String, default: null},
    name: {type: String, default: null},
    total_receive: {type: Number, default: 0},
    total_sent: {type: Number, default: 0},
    total_data: {type: Number, default: 0},
    endpoint: {type: String, default: null},
    status: {type: String, default: null},
    latest_handshake: {type: String, default: 0},
    allowed_ip: {type: String, default: null},
    cumu_receive: {type: Number, default: 0},
    cumu_sent: {type: Number, default: 0},
    cumu_data: {type: Number, default: 0},
    mtu: {type: Number, default: 0},
    keepalive: {type: Number, default: 0},
    remote_endpoint: {type: String, default: ""},
    preshared_key: {type: String, default: ""},
    time: {type: Date, default: Date.now},
    enabled: {type: Boolean, default: true},
    userId: {type: String, default: null},
    last_transfer: {type: Object, default: {total_sent:0,total_receive:0,total_data:0}}
})

module.exports = model('Peers',schema)
