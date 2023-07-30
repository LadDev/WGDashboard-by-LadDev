const {Schema, model} = require('mongoose')


const schema = new Schema({
    interface_name: {type: String, required: true},
    public_key: {type: String, required: true},
    transfers: {type: Array, default: []},
})

module.exports = model('PeersTransfer',schema)
