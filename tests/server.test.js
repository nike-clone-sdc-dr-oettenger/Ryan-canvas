const request = require('request');
const rp = require('request-promise')
const {Shoe_Images} = require('../database/schemas.js');

const testShoe = {
  shoe_id: 999,
  img1: 'img1',
  img2: 'img2',
  img3: 'img3',
  img4: 'img4',
  img5: 'img5',
  img6: 'img6',
  img7: 'img7',
  vid1: 'vid1',
  vid2: 'vid2'
}

afterAll(() => {
  Shoe_Images.deleteMany({shoe_id: testShoe.shoe_id}, (err, res) => {
    if (err) {
      console.log('error cleaning up test images', err)
    }
  })
})

test('Requesting shoe images should return error message if shoe does not exist in database.', (done) => {
  request.get('http://localhost:1121/api/images', { qs: { shoe_id: 100 }} , (err, res) => {
    expect(res.body).toBe('This shoe does not exist!');
    done();
  })
})

test('Requesting shoe images should return an array of 5 images.', (done) => {
  request.get('http://localhost:1121/api/images', { qs: { shoe_id: 13 }} , (err, res) => {
    let body = JSON.parse(res.body);
    expect(body.length).toBe(5);
    done();
  })
})

test('Requesting a recommended shoe image should return error message if shoe does not exist in database.', (done) => {
  request.get('http://localhost:1121/api/recommendedImage', { qs: {shoesArr: [1, 3, 100]} } , (err, res) => {
    expect(res.body).toBe('At least one of the shoes does not exist!');
    done();
  })
})

test('Requesting a recommended shoes should return one image for each shoe id requested.', (done) => {
  request.get('http://localhost:1121/api/recommendedImage', { qs: {shoesArr: [3, 2, 77]}} , (err, res) => {
    let body = JSON.parse(res.body)
    expect(body.length).toBe(3);
    done();
  })
})

/**********TESTS FOR NEW ROUTES*******************/
test('Post should return successful save message', (done) => {
  const options = {
    method: 'post',
    uri: 'http://localhost:1121/api/images',
    body: testShoe,
    json: true
  }
  rp(options)
  .then((response) => {
    expect(response).toBe(`shoe ${testShoe.shoe_id} saved successfully`);
    done();
  })
  .catch((err) => {
    console.log(err)
    expect(1).toBe(2)
    done();
  })
})

test('Put should update an existing shoe', (done) => {
  let body = testShoe
  body.img1 = 'newimg1'
  const options = {
    method: 'put',
    uri: 'http://localhost:1121/api/images',
    body: body,
    json: true
  }
  rp(options)
  .then((response) => {
    Shoe_Images.find({
      shoe_id: 999
    }, (err, docs) => {
      expect(docs[0].img1).toBe('newimg1')
      done()
    })
  })
  .catch((err) => {
    console.log(err);
    expect(1).toBe(2);
    done();
  })
})

test('Should successfully delete an existing shoe', (done) => {
  const options = {
    method: 'delete',
    uri: 'http://localhost:1121/api/images',
    body: {shoe_id: testShoe.shoe_id},
    json: true
  }
  rp(options).then((response) => {
    Shoe_Images.find({shoe_id: testShoe.shoe_id}, (err, data) => {
      expect(data.length).toBe(0);
      expect(response).toBe('shoe 999 deleted successfully');
      done();
    })

  })
  .catch((err) => {
    console.log('error deleting in test', err);
    expect(1).toBe(2);
  })
})