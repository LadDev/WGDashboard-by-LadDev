const {Schema, model} = require('mongoose')


const schema = new Schema({
    peerID: {type: String, default: null},
    ips: {type: Array, default: []},
})

module.exports = model('IPLogs',schema)
