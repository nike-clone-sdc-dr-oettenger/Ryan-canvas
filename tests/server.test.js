const request = require('request');

test('Requesting shoe images should return error message if shoe does not exist in database.', (done) => {
  request.get('http://localhost:3000/api/images', { qs: { shoe_id: 100 }} , (err, res) => {
    expect(res.body).toBe('This shoe does not exist!');
    done();
  })
})

test('Requesting shoe images should return an array of 5 images.', (done) => {
  request.get('http://localhost:3000/api/images', { qs: { shoe_id: 13 }} , (err, res) => {
    let body = JSON.parse(res.body);
    expect(body.length).toBe(5);
    done();
  })
})

test('Requesting a recommended shoe image should return error message if shoe does not exist in database.', (done) => {
  request.get('http://localhost:3000/api/recommendedImage', { qs: {shoesArr: [1, 3, 100]} } , (err, res) => {
    expect(res.body).toBe('At least one of the shoes does not exist!');
    done();
  })
})

test('Requesting a recommended shoes should return one image for each shoe id requested.', (done) => {
  request.get('http://localhost:3000/api/recommendedImage', { qs: {shoesArr: [3, 2, 77]}} , (err, res) => {
    let body = JSON.parse(res.body)
    expect(body.length).toBe(3);
    done();
  })
})