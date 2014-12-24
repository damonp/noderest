// app/models/server.js

var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ServerSchema   = new Schema({
    name: String,
    os: String,
    ip: String,
    tags: [String],
    last_update: Date
});

module.exports = mongoose.model('Server', ServerSchema);
