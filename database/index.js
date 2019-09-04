//Review this file;
const mongoose = require('mongoose');

const db = mongoose.connect('mongodb://db:27017/nike_canvas');

module.exports = db;