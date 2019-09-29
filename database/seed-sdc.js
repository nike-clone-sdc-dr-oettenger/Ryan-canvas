
const psqlconfig = require('./login.config.js').psql;
const queries = require('./queries.js');
/*********Seeding Script and connections****************/
const pgp = require('pg-promise')({
  capSQL: true
})

let options = queries.postgres.connectionOptions;
options.poolSize = 20;
const db = pgp(options);

let start = new Date();

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


let targetInsertions = 10000000;
let totalInserted = 0;
let batchSize = 100000;
let batchcount = 0;
let successcount = 0;
var batch = [];
const createRecords = (records, batchSize) => {

  let width = '400';
  let height = '600';
 for (let i = 0; i < records; i++) {
   let rnd = Math.floor(1000 * Math.random())
    let img1 = 'https://picsum.photos/id/' + (rnd + 0).toString() + '/' + width + '/' + height
    let img2 = 'https://picsum.photos/id/' + (rnd + 1).toString() + '/' + width + '/' + height
    let img3 = 'https://picsum.photos/id/' + (rnd + 2).toString() + '/' + width + '/' + height 
    let img4 = 'https://picsum.photos/id/' + (rnd + 3).toString() + '/' + width + '/' + height 
    let img5 = 'https://picsum.photos/id/' + (rnd + 4).toString() + '/' + width + '/' + height
    let img6 = 'https://picsum.photos/id/' + (rnd + 5).toString() + '/' + width + '/' + height
    let img7 = 'https://picsum.photos/id/' + (rnd + 6).toString() + '/' + width + '/' + height
    let vid1 = 'https://picsum.photos/id/' + (rnd + 7).toString() + '/' + width + '/' + height
    let vid2 = 'https://picsum.photos/id/' + (rnd + 8).toString() + '/' + width + '/' + height
    let item = new template(i, img1, img2, img3, img4, img5, img6, img7, vid1, vid2)
    //hard coded for testing //let item = new template(i, 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600')
    batch.push(item)
    
    if (i % batchSize === 0 && i > 0) {
      console.log('sending batch of ', batch.length)
      batchInsert(batch, records, i);
      batchcount += 1;
      batch = [];
    }
  }
    batchInsert(batch, batch.length, batchSize)
      
}


// const fs = require('fs')
// const txt = 'test.txt'
// var wstream = fs.createWriteStream(txt);
// const writeToStream = (i) => {
//   for (; i < 10000; i++) {
//     let item = new template(i, 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600', 'https://picsum.photos/id/1/400/600')
//     if (!wstream.write(JSON.stringify(item) + '\n')) {
//       // Wait for it to drain then start writing data from where we left off
//       wstream.once('drain', function() {
//         writeToStream(i + 1);
//       });
//       return;
//     }
//   }
//   console.log('seconds to finish writing:', (new Date() - start )/ 1000)
//   //batchInsert(batch, batch.length, batchSize)
//   wstream.end();
// }
// const streamRead = pgp.spex.stream.read
// const rs = fs.createReadStream(txt)
// const receiver = (_, data) => {
  
//   const source = (index) => {
//     if (index < data.length) {
//       return data[index];
//     }
//   }
//   const dest = (index, data) => {
//     console.log('what is data to post', data)
//     return db.none('INSERT INTO shoe_images (shoe_id) VALUES($1)', data);
// }

// return db.sequence(source, dest);
// }
// db.tx(t => {
//     return streamRead.call(t, rs, receiver);
// })
//     .then(data => {
//         console.log('DATA:', data);
//     })
//     .catch(error => {
//         console.log('ERROR:', error);
//     });

















const batchInsert = (insertRows, totalRecords, batchSize) => {
  const getNextData = (t, oldIndex) => {
    return new Promise((resolve, reject) => {
      if (oldIndex + batchSize <= totalRecords) {
        data = batch.slice(oldIndex, oldIndex+batchSize)
        resolve(data)
      } else {
        resolve(null)
      }
    })
  }

  
  const cs = new pgp.helpers.ColumnSet(['shoe_id', 'img1', 'img2', 'img3', 'img4', 'img5', 'img6', 'img7', 'vid1', 'vid2'], { table: 'shoe_images' });


  db.tx('massive-insert', t => {
    return t.sequence(index => {
      return getNextData(t, index * batchSize)
        .then(data => {   
          if(data) {
            const insert = pgp.helpers.insert(data, cs);
            return t.none(insert)
          }
        })
    })
  }).then(success => { 
    let end = new Date();
    let duration = (end - start) / 1000
    totalInserted += batchSize
    console.log(`inserted ${totalInserted} in ${duration} seconds and current heapUsed at ${process.memoryUsage().heapUsed}`)
    if (totalInserted < targetInsertions) {
      batch = [];
      successcount += 1
      createRecords(batchSize, batchSize);
    }
  }).catch(err => {
    console.log('omg error', err)
  })
}

/********************************************************/





createRecords(batchSize, batchSize);
//writeToStream(0);