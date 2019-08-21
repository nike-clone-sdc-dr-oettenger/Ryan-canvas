const express = require('express');
const {Shoe_Images} = require('../database/schemas.js')
const app = express();
const port = 1121;

app.use(express.urlencoded())
app.use(express.json());

app.get('/api/images', (req, res) => {
  let shoe = req.query.shoe_id;

  Shoe_Images.findOne({shoe_id: shoe}).then((shoeImage) => {
    if (!shoeImage) {
      res.send('This shoe does not exist!');
    } else {
      res.json([shoeImage.img1,shoeImage.img2,shoeImage.img3,shoeImage.img4,shoeImage.img5]);
    }
  })
})

app.get('/api/recommendedImage', (req, res) => {
  let shoes = req.query.shoesArr;
  let error;
  let imgArr = [];
  shoes.forEach(shoe => {
    Shoe_Images.findOne({shoe_id: shoe}).then((shoeImage) => {
      if (!shoeImage) {

        error = 'At least one of the shoes does not exist!';
      } else {
        imgArr.push(shoeImage.img1)
      }
    })
  });
  console.log('this is the image arr', imgArr)
  console.log('this is the error', error)
  if (!error){
    res.json(imgArr);
  } else {
    res.send(error);
  }
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}/`);
})