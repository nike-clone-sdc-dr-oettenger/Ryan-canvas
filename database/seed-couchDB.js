const nano = require('nano');
const couch = nano('http://127.0.0.1:5984');

let batchSize = 10000;
let targetInsertions = 10000000;

couch.db.create('nike_canvas', function(err) {  
  if (err && err.statusCode === 412) {
    console.log('db already exists, starting over');
    couch.db.destroy('nike_canvas').then((body) => {
      console.log('destroying old version to re-seed')
      couch.db.create('nike_canvas').then((success) => {
        console.log('database recreated, starting seed')
        createBatch(batchSize)
      })
    })
  }
  else if (err) {
    console.error('oh no, new error', err);
  } else {
    console.log('new database created, starting seed');
    createBatch(batchSize)
  }
});

function template(shoe_id, img1, img2, img3, img4, img5, img6, img7, vid1, vid2) {
  this.shoe_id = shoe_id
  this.img1 = img1
  this.img2 = img2
  this.img3 = img3
  this.img4 = img4
  this.img5 = img5
  this.img6 = img6
  this.img7 = img7
  this.vid1 = vid1
  this.vid2 = vid2
}

let start = new Date();
const shoe_images = couch.db.use('nike_canvas');


let batch = [];
let successCount = 0;
let totalInserts = 0;
let width = '400';
let height = '600';

const createBatch = (size) => {
  for (let i = 0; i < size; i++) {
    let rnd = Math.floor(1000 * Math.random());
    let shoeid = (i + 1 + (successCount * size));
    let img1 = 'https://picsum.photos/id/' + (rnd + 0).toString() + '/' + width + '/' + height;
    let img2 = 'https://picsum.photos/id/' + (rnd + 1).toString() + '/' + width + '/' + height;
    let img3 = 'https://picsum.photos/id/' + (rnd + 2).toString() + '/' + width + '/' + height;
    let img4 = 'https://picsum.photos/id/' + (rnd + 3).toString() + '/' + width + '/' + height;
    let img5 = 'https://picsum.photos/id/' + (rnd + 4).toString() + '/' + width + '/' + height;
    let img6 = 'https://picsum.photos/id/' + (rnd + 5).toString() + '/' + width + '/' + height;
    let img7 = 'https://picsum.photos/id/' + (rnd + 6).toString() + '/' + width + '/' + height;
    let vid1 = 'https://picsum.photos/id/' + (rnd + 7).toString() + '/' + width + '/' + height;
    let vid2 = 'https://picsum.photos/id/' + (rnd + 8).toString() + '/' + width + '/' + height;
    let item = new template(shoeid, img1, img2, img3, img4, img5, img6, img7, vid1, vid2);
    batch.push(item);
  }
  batchInsert(batch, batch.length);
}

const batchInsert = (records, size) => {
  shoe_images.bulk({docs: records}).then((data) => {
    totalInserts += size;
    successCount += 1;
    let end = new Date();
    let duration = (end - start) / 1000;
    batch = [];
    console.log(`successfully inserted ${totalInserts} in ${duration} seconds and current memory is ${process.memoryUsage().heapUsed}`);
    if (totalInserts < targetInsertions) {
      createBatch(batchSize);
    }
  })
}

