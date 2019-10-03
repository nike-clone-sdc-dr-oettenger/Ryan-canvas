## canvas
Picture and/or Video demo of product on page



## Journal
- 2019-09-27: Added POST, PUT, DELETE routes
- 2019-09-28: Added tests for new server routes
- 2019-09-28: 5am Postgres instal/config issues finally finished.  Successful mass insert scrips using pg-promise library.  Fought for hours with memory issues, finally got seed script for postgres working.
  - inserted 10,000,000 in 650.409 seconds using batch size of 100,000
  - inserted 10,000,000 in 469.616 seconds using batch size of 10,000
- 2019-09-30: tried out Cassandra, Riak, CouchDB installation/configurations.  Using CouchDB as second database
- 2019-10-01: Using library Nano for CouchDB.  Successfully seeded 10M records.
  - inserted 10,000,000 in 1277,83 seconds using batch size of 10,000
- 2019-10-02: Added select 1 query for Postgres.  Initial query times were 17-18seconds to select the last row in the table.  Adding an index reduced to a few miliseconds





## Config/Setup Notes

# PostgreSQL
- installed via homebrew 'brew install postgres'
- started with 'brew services start homebrew'
- manually log in from terminal with  'psql -U postgres'
- helpful commands 
    - \q to quit, 
    - \c $database to change active database (once inside can run sql to create tables/databases, etc)
    - \dt to show tables
- used helper library pg-promise (upgraded node to long term stable version)

- configuration in database/queries.js
const connectionOptions = {
  user: psqlconfig.user,
  password: psqlconfig.password,
  host: psqlconfig.host,
  database: psqlconfig.database,
  port: psqlconfig.pgport
}

- OPTIMIZATION:
  - create index shoe_images_shoe_id on shoe_images(shoe_id);



# Couchdb
- installed with homebrew 'brew install couchdb'
- started with 'couchdb' (started a server, can view on localhost)
  - default port 5984
