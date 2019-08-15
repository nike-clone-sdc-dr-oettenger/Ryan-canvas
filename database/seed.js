//Review this file;
const db = require('./index.js');
const {Shoe_Images} = require('./schemas.js');
const request = require('request');

const unsplashAPI = '1ba2afa1a3bdfcd4fd4e054690efddd90037f047ce88f2d9cb56d2b17f4d0351'

// let options = {
//   query: 'nike shoe',
//   url: `https://api.unsplash.com/search/photos/?client_id=${unsplashAPI}`
// }

// const populateShoes = () => {
//   for (let i = 0; i < 100; i++) {
//     let shoe = new Shoe_Images({shoe_id: i});
//     Shoe_Images.save();
//   }
// }

// populateShoes();

request.get(`https://api.unsplash.com/search/photos/?query=nike+shoe&client_id=${unsplashAPI}`, (err, res) => {
  if (err) {alert(err)};
  let imagesArr = [];
  let shoeCount = 0;
  let body = JSON.parse(res.body)
  console.log(typeof body)
  body.results.some((img,i) => {
    let ind = i % 6;
    if (!ind && i > 0) {
      let images = new Shoe_Images({
        shoe_id: shoeCount,
        img1: imagesArr[0],
        img2: imagesArr[1],
        img3: imagesArr[2],
        img4: imagesArr[3],
        img5: imagesArr[4],
        img6: imagesArr[5],
      });
      shoeCount++;
      images.save();
    } else {
      imagesArr[ind] = img.urls.raw;
    }
    if (shoeCount > 100) {return true};
  })
})