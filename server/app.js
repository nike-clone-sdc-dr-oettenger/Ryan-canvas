const express = require('express');
const Shoe_Images = require('../database/schemas.js')
const app = express();
const bodyParser = require('body-parser');
const port = 3000;

app.use(bodyParser.urlencoded())
app.use(bodyParser.json());

app.get('/api/images', (req, res) => {
  let shoeId = req.body.shoe_id;

  Shoe_Images.findOne({shoe_id: shoeId}).then((shoeImages) => {
    res.json([shoeImages.img1,shoeImages.img2,shoeImages.img3,shoeImages.img4,shoeImages.img5,shoeImages.img6]);
  })
})

app.listen(port, () => {
  console.log(`App is running on http://localhost:${port}/`);
})