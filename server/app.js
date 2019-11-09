//require('newrelic');
const express = require('express');
// const { Shoe_Images } = require('../database/schemas.js');
const app = express();
const port = 1121;
const queries = require('../database/queries.js')
//redis
const redis = require('redis');
const client = redis.createClient();
client.on('error', (err) => {
  console.log("Redis Error " + err)
});

const cluster = require('cluster')
if(cluster.isMaster) {
  var numWorkers = 3;
  console.log('Master cluster setting up ' + numWorkers + ' workers...');

  for(var i = 0; i < numWorkers; i++) {
      cluster.fork().on('listening', (address) => console.log('listening on ', address));
  }

  cluster.on('online', function(worker) {
      console.log('Worker ' + worker.process.pid + ' is online');
  });

  cluster.on('exit', function(worker, code, signal) {
      console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
      console.log('Starting a new worker');
      cluster.fork();
  });
}  else {
  app.use(express.urlencoded());
  app.use(express.json());

  /*CHOOSE A DATABASE*/
  const database = process.env.database || 'postgres' //['mongoDB', 'couchDB', 'postgres']
  /******************/

  // app.use('/', express.static('client/dist'))
  // app.use('/:id', express.static('client/dist'))
  app.use(express.static(__dirname + '/../client/dist'));
  

  app.get('/api/images', (req, res) => {
    let shoe = req.query.shoe_id;
    console.log(`get req to /api/images for shoe_id ${shoe}`)
    res.setHeader('access-control-allow-origin', '*');
    if (database === 'mongoDB') {
      Shoe_Images.findOne({ shoe_id: shoe }).then((shoeImage) => {
        if (!shoeImage) {
          res.status(500);
          res.send('This shoe does not exist!');
        } else {
          res.status(200);
          res.json([shoeImage.img1, shoeImage.img2, shoeImage.img3, shoeImage.img4, shoeImage.img5]);
        }
      })
    } else if (database === 'postgres') {
      //redis implemented for postgres only
      return client.get(`shoe_images:${shoe}`, (err, results) => {
        //if found in Redis Cache
        if (results) {
          //console.log(JSON.parse(results))
          res.status(200);
          res.json({ source: 'cache', data: JSON.parse(results) })
          //otherwise
        } else {
          // console.log('get req to postgres db')
          queries.postgres.getOne(shoe, (shoeImage) => {
            if (!shoeImage) {
              res.status(500);
              res.send('This shoe does not exist!');
            } else {
              // console.log('yay postgres shoes ', shoeImage)
              const resultImages = [shoeImage.img1, shoeImage.img2, shoeImage.img3, shoeImage.img4, shoeImage.img5]

              client.setex(`shoe_images:${shoe}`, 3600, JSON.stringify(resultImages))
              res.status(200);
              res.json({ source: 'database', data: resultImages })
            }
          })
        }
      })
    } else if (database === 'couchDB') {
      queries.couchDB.getOne(shoe, (shoeImage) => {
        // console.log('yay couchDB shoes', shoeImage)
        res.status(200);
        res.json([shoeImage.img1, shoeImage.img2, shoeImage.img3, shoeImage.img4, shoeImage.img5]);
      })
    } else {
      res.status(500);
      res.send('no database chosen on backend');
    }
  })

  app.get('/api/recommendedImage', (req, res) => {
    let shoes = req.query.shoesArr;
    let error;
    let imgArr = [];
    res.setHeader('access-control-allow-origin', '*');
    shoes.forEach((shoe, i) => {
      let id = parseInt(shoe);
      Shoe_Images.findOne({ shoe_id: id }).then((shoeImage) => {
        if (!shoeImage) {
          error = 'At least one of the shoes does not exist!';
        } else {
          imgArr.push(shoeImage.img1)
        }
        if (i === shoes.length - 1) {
          if (!error) {
            res.json(imgArr);
          } else {
            res.send(error);
          }
        }
      })
    });

  })
  /*****************NEW ENDPOINTS********************/
  app.post('/api/images', (req, res) => {
    res.setHeader('access-control-allow-origin', '*');

    //CURL terminal commands
    //curl -d "shoe_id=999&img1=1&img2=2&img3=3&img4=4&img5=5&img6=6&img7=7&vid1=vid1&vid2=vid2" -X POST http://ec2-18-237-87-30.us-west-2.compute.amazonaws.com:1121/api/images
    // DELETE the record created in MongoDB -> db.shoe_images.remove({shoe_id: 999})
    if (database === 'mongoDB') {
      let shoe = new Shoe_Images(req.body);
      shoe.save((err, data) => {
        if (err) {
          console.log('error saving', shoe, err)
          res.status(500);
          res.send('error saving shoe');
        } else {
          console.log(`shoe ${shoe.shoe_id} saved successfully`)
          res.status(201);
          res.send(`shoe ${shoe.shoe_id} saved successfully`);
        }
      })
    } else if (database === 'postgres') {
      //example postgres query
      queries.postgres.post({ shoe_id: req.body.shoe_id }, (data) => {
        // console.log('*****************\n SUCCESS?', data.command, data.rowCount)
        res.status(201);
        res.end();
      })
    } else if (database === 'couchDB') {
      //console.log('not doing couchDB')
      res.status(500);
      res.end();
    } else {
      res.status(500);
      res.end();
    }
  })

  app.delete('/api/images', (req, res) => {
    res.setHeader('access-control-allow-origin', '*');
    if (database === 'mongoDB') {
      //curl -d "shoe_id=999" -X DELETE http://localhost:1121/api/images
      //db.shoe_images.find({shoe_id: 999})
      Shoe_Images.remove({ shoe_id: req.body.shoe_id }, (err) => {
        if (err) {
          console.log('erorr deleting shoe', shoe.shoe_id, err)
          res.status(500);
        } else {
          res.status(200);
          res.send(`shoe ${req.body.shoe_id} deleted successfully`)
        }
      })
    }

  })

  app.put('/api/images', (req, res) => {
    res.setHeader('access-control-allow-origin', '*');
    //curl -d "shoe_id=999&img1=newimg1" -X PUT http://localhost:1121/api/images
    Shoe_Images.update({ shoe_id: req.body.shoe_id },
      {
        img1: req.body.img1,
        img2: req.body.img2,
        img3: req.body.img3,
        img4: req.body.img4,
        img5: req.body.img5,
        img6: req.body.img6,
        img7: req.body.img7,
        vid1: req.body.vid1,
        vid2: req.body.vid2
      }, (err) => {
        if (err) {
          console.log('error updating', req.body.shoe_id)
          res.status(500);
          res.end();
        } else {
          res.status(200);
          res.send('successfully updated');
        }
      })
  })

  app.listen(port, () => {
    console.log(`Image server is running on http://localhost:${port}/`);
  })

  cluster.on('exit', (worker) => {
    console.log('worker ', worker.id, 'is dead, restarting');
    cluster.fork();
  })
}


