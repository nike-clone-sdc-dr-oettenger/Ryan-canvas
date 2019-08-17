const express = require('express');
const {Shoe_Images} = require('../database/schemas.js')
const app = express();
const port = 3000;

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
  let shoe = req.query.shoe_id;

  Shoe_Images.findOne({shoe_id: shoe}).then((shoeImage) => {
    if (!shoeImage) {
      res.send('This shoe does not exist!');
    } else {
      res.json([shoeImage.img1]);
    }
  })
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}/`);
})