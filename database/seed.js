//Review this file;
const db = require('./index.js');
const {Shoe_Images} = require('./schemas.js');
const request = require('request');

const unsplash = require('./unsplash.config.js')

const saveToDB = (shoeImagesArr, index) => {
  //recursive function to continuously save unless
    //base case: if index === shoeImages.length;
}

request.get(`https://api.unsplash.com/search/photos/?query=nike+shoe&client_id=${unsplash.API}`, (err, res) => {
  if (err) {alert(err)};
  let images = {};
  let shoeCount = 0;
  let body = JSON.parse(res.body)
  let imgsToSave = [];
  // body.results.some((img,i) => {
  //   let ind = i % 6;
  //   if (!ind && i > 0) {
  //     images.shoe_id = shoeCount;
  //     images.img1 = imagesArr[ind];
  //     images.img2 = imagesArr[ind+1];
  //     images.img3 = imagesArr[ind+2];
  //     images.img4 = imagesArr[ind+3];
  //     images.img5 = imagesArr[ind+4];
  //     images.img6 = imagesArr[ind+5];
  //     shoeCount++;
  //     imgsToSave.push(images);
  //   } else {
  //     imagesArr.push(img.urls.raw);
  //   }
  //   if (shoeCount > 100) {return true};
  // })
  let imagesArr = body.results.map((img, i) => {
    if (i < 700) {
      return img.urls.raw;
    } else {
      break;
    }
  })
  console.log(imagesArr);
})