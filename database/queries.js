//postgres config
const psqlconfig = require('./login.config.js').psql
const Pool = require('pg').Pool

const connectionOptions = {
  user: psqlconfig.user,
  password: psqlconfig.password,
  host: psqlconfig.host,
  database: psqlconfig.database,
  port: psqlconfig.pgport
}


const pool = new Pool(connectionOptions)



const postgresPost = (x, callback) => {
  const values = [x.shoe_id, x.img1, x.img2, x.img3, x.img4, x.img5, x.img6, x.img7, x.vid1, x.vid2]
  const querystring = 'INSERT INTO shoe_images (shoe_id, img1, img2, img3, img4, img5, img6, img7, vid1, vid2) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);'
  pool.query(querystring, values)
  .then(response => {
    callback(response);
  })
  .catch(err => {
    callback(err);
  })
}



module.exports = {
  postgres: {
    post: postgresPost,
    connectionOptions: connectionOptions
  }
};