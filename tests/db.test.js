const {Shoe_Images} = require('../database/schemas.js');

test('Database should initially be seeded with at least 100 records.', (done) => {
  Shoe_Images.find({}).then((data) => {
    expect(data.length).toBeGreaterThanOrEqual(99);
    done();
  })
})

test('Database should not have duplicate objects with the same shoe id.', (done) => {
  Shoe_Images.find({ shoe_id: 7 }).then((data) => {
    expect(data.length).toBe(1);
    done();
  })
})