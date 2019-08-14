const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://localhost/nike_canvas');

module.exports = db;