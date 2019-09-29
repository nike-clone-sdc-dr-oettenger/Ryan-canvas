## canvas
Picture and/or Video demo of product on page



## Journal
- 2019-09-27: Added POST, PUT, DELETE routes
- 2019-09-28: Added tests for new server routes



## Config/Setup Notes

# PostgreSQL
- installed via homebrew 'brew install postgres'
- started with 'brew services start homebrew'
- manually log in from terminal with  'psql -U postgres'
- helpful commands 
    - \q to quit, 
    - \c $database to change active database (once inside can run sql to create tables/databases, etc)
    - \dt to show tables

- configuration in database/queries.js
const Pool = require('pg').Pool
const pool = new Pool({
  user: psqlconfig.user,
  host: psqlconfig.password,
  database: 'nike_canvas',
  port: 5432
})




