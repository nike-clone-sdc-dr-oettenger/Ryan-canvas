import $ from 'jquery';

$.get('http://localhost:3000/api/images', {shoe_id: 0}, (images) => {
  console.log(images);
})

const request = require('request');