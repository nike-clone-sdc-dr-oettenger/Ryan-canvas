//Review this file;
const mongoose = require('mongoose');


const db = mongoose.connect('mongodb://localhost:27017/nike_canvas');





module.exports = db;