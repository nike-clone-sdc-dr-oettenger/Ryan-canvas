const db = require('./index.js');
const {Shoes, Images, JoinTable} = require('./schemas.js');
const request = require('request');

const unsplashAPI = '1ba2afa1a3bdfcd4fd4e054690efddd90037f047ce88f2d9cb56d2b17f4d0351'

let options = {
  url: `https://api.unsplash.com/search/photos/?client_id=${unsplashAPI}`,
  query: 'nike shoe'
}

const populateShoes = () => {
  for (let i = 0; i < 100; i++) {
    let shoe = new Shoes({shoe_id: i});
    shoe.save();
  }
}

populateShoes();

request.get(options, (err, res) => {
  let imagesArr = [];
  res.results.forEach((img,i) => {
    let ind = i % 6;
    if (!ind && i > 0) {
      let images = new Images({
        img1: imagesArr[0],
        img2: imagesArr[1],
        img3: imagesArr[2],
        img4: imagesArr[3],
        img5: imagesArr[4],
        img6: imagesArr[5],
      })
      images.save();
    } else {
      imagesArr[ind] = img.urls.raw;
    }
  })
})