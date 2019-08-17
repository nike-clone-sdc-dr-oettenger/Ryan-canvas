//Review this file;
const db = require('./index.js');
const {Shoe_Images} = require('./schemas.js');
const request = require('request');

const unsplash = require('./unsplash.config.js');

//TODO: refactor to be function that can dynamically import random number of images instead (current state: reusing code and is inefficient)
request.get(`https://api.unsplash.com/search/photos/?query=nike&per_page=500&client_id=${unsplash.API}`, (err, res) => {
  if (err) {alert(err)};
  let body = JSON.parse(res.body)
  let imgsToSave = [];
  for (let shoeCount = 0; shoeCount < 50; shoeCount++) {
    let images = {};
    images.shoe_id = shoeCount;
    images.img1 = body.results[(5 * shoeCount)].urls.raw;
    images.img2 = body.results[(5 * shoeCount) + 1].urls.raw;
    images.img3 = body.results[(5 * shoeCount) + 2].urls.raw;
    images.img4 = body.results[(5 * shoeCount) + 3].urls.raw;
    images.img5 = body.results[(5 * shoeCount) + 4].urls.raw;
    imgsToSave.push(images);
  }
  Shoe_Images.insertMany(imgsToSave).then(request.get(`https://api.unsplash.com/search/photos/?query=nike+shoe&per_page=500&client_id=${unsplash.API}`, (err, res) => {
    if (err) {alert(err)};
    let body = JSON.parse(res.body)
    let imgsToSave = [];
    for (let shoeCount = 0; shoeCount < 50; shoeCount++) {
      let images = {};
      images.shoe_id = shoeCount + 50;
      images.img1 = body.results[(5 * shoeCount)].urls.raw;
      images.img2 = body.results[(5 * shoeCount) + 1].urls.raw;
      images.img3 = body.results[(5 * shoeCount) + 2].urls.raw;
      images.img4 = body.results[(5 * shoeCount) + 3].urls.raw;
      images.img5 = body.results[(5 * shoeCount) + 4].urls.raw;
      imgsToSave.push(images);
    }

    Shoe_Images.insertMany(imgsToSave);
  }))
})