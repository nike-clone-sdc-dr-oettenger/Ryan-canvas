//Review this file;
const db = require('./index.js');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

const shoeImagesSchema = new mongoose.Schema({
  shoe_id: {type: Number, default: 0},
  img1: String,
  img2: String,
  img3: String,
  img4: String,
  img5: String,
  img6: String,
  img7: String,
  vid1: String,
  vid2: String
})

// const imageSchema = new mongoose.Schema({
//   img1: String,
//   img2: String,
//   img3: String,
//   img4: String,
//   img5: String,
//   img6: String,
//   img7: String,
//   vid1: String,
//   vid2: String
// })

// const shoeImagesSchema = new mongoose.Schema({
//   shoe: {type: Schema.Types.ObjectId, ref: 'Shoes'},
//   images: {type: Schema.Types.ObjectId, ref: 'Images'}
// })

const Shoe_Images = mongoose.model('Shoe_Images', shoeImagesSchema);
// const Images = mongoose.model('Images', imageSchema);
// const JoinShoeImage = mongoose.model('JoinShoeImage', shoeImagesSchema);

module.exports.Shoe_Images = Shoe_Images;
// module.exports.Images = Images;
// module.exports.JoinTable = JoinShoeImage;