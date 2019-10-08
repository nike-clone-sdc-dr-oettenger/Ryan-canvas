//postgres config
const psqlconfig = require('./login.config.js').psql;
const Pool = require('pg').Pool;


const connectionOptions = {
  user: psqlconfig.user,
  password: psqlconfig.password,
  host: psqlconfig.host,
  database: psqlconfig.database,
  port: psqlconfig.pgport,
  max: 20
}
const pool = new Pool(connectionOptions)

pool.on('error', (e) => {
  console.log('pool error', e)
})

//couchDB config
const nano = require('nano');
const couch = nano('http://127.0.0.1:5984');
const shoe_images = couch.db.use('nike_canvas');


const postgresPost = (x, callback) => {
  const values = [x.shoe_id, x.img1, x.img2, x.img3, x.img4, x.img5, x.img6, x.img7, x.vid1, x.vid2]
  const querystring = 'INSERT INTO shoe_images (shoe_id, img1, img2, img3, img4, img5, img6, img7, vid1, vid2) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);'
  pool.connect()
  .then(client => {
    return client
    .query(querystring, values)
  })
  .then(response => {
    client.release();
    callback(response);
  })
  .catch(err => {
    client.release();
    callback(err);
  })
}
const postgresGetOne = (shoe_id, callback) => {
  const values = [shoe_id]
  pool.query('SELECT shoe_id, img1, img2, img3, img4, img5 FROM shoe_images WHERE shoe_id = $1', values)
  .then(response => {
    callback(response.rows[0]);
  })
  .catch(err => {
    callback(err);
  })
}

const couchDbGetOne = (shoe_id, callback) => {
  let filter = {
    include_docs: true,
    execution_stats: true, //uncomment to show execution time
    selector : {
      shoe_id: {"$eq": shoe_id}
    },
    limit: 1  
  }

  shoe_images.get('_all_docs', filter).then((body) => {
    // console.log(body)
    let response = {
      shoe_id: body.rows[0].doc.shoe_id,
      img1: body.rows[0].doc.img1,
      img2: body.rows[0].doc.img2,
      img3: body.rows[0].doc.img3,
      img4: body.rows[0].doc.img4,
      img5: body.rows[0].doc.img5
    }
    // curl -H 'Content-Type: application/json' -X GET http://127.0.0.1:5984/nike_canvas -d '{"shoe_id":0}'
    
    callback(response);
  }).catch(err => {
    console.log('error selecting from couchDB', err)
    callback(err);
  })

}

const couchDbPost = (x, callback) => {
  shoe_images.insert(x).then((body) => {
    //curl -H 'Content-Type: application/json' -X POST http://127.0.0.1:5984/nike_canvas -d '{"shoe_id":0,"img0":"https://picsum.photos/id/1/400/600","img2":"https://picsum.photos/id/2/400/600","img3":"https://picsum.photos/id/3/400/600","img4":"https://picsum.photos/id/4/400/600","img5":"https://picsum.photos/id/5/400/600","img6":"https://picsum.photos/id/6/400/600","img7":"https://picsum.photos/id/7/400/600","vid1":"https://picsum.photos/id/8/400/600","vid2":"https://picsum.photos/id/9/400/600"}'
  })
  .catch(err => {
    callback(err)
  })
}


module.exports = {
  postgres: {
    post: postgresPost,
    getOne: postgresGetOne,
    connectionOptions: connectionOptions
  },
  couchDB: {
    post: couchDbPost,
    getOne: couchDbGetOne
  }
};