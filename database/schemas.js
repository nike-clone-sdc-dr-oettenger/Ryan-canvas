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

const Shoe_Images = mongoose.model('Shoe_Images', shoeImagesSchema);

module.exports.Shoe_Images = Shoe_Images;


//SQL command to create the table in psql terminal
//CREATE DATABASE nike_canvas;
//CREATE TABLE Shoe_Images (ID SERIAL PRIMARY KEY, shoe_id int, img1 VARCHAR(255), img2 VARCHAR(255), img3 VARCHAR(255), img4 VARCHAR(255), img5 VARCHAR(255), img6 VARCHAR(255), img7 VARCHAR(255), vid1 VARCHAR(255), vid2 VARCHAR(255));