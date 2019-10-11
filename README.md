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
- 2019-10-03: Added post 1 record for Postgres.  Post query runs about as fast as select.  Added getOne and post queries for couchDB.  CouchDB queries seem to be running slower, which is surprising.
- 2019-10-05: Initial performance testing using httperf: Both databases easily handle loads up to 200RPS.  I'm running into an error with an httperf (open file limit > FD_SETSIZE).  Spent time trying to debug with no issue.  Looking into other load testers (locustio, jmeter, artillery).
- 2019-10-08: Switched to K6 for load testing.  Achieved 1,000 GET requests per second with reasonable latency.
- 2019-10-10: Refactoring and writing some notes.  Taking screenshots of query timings and preparing for mid-point conversation video.  Refactored postgres post query.


## Optimizations



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
  - \timing command in psql terminal to add timings to query results
  - create index shoe_images_shoe_id on shoe_images(shoe_id);


# Couchdb
- installed with homebrew 'brew install couchdb'
- started with 'couchdb' (started a server, can view on localhost)
  - default port 5984

- using library nano (via npm) 
- critical when selecting to include the setting { include_docs: true }

# Load Testers - Using K6 after experimentation

-  httperf installed with homebrew 'brew instsall httperf' 
  - httperf example command 'httperf --server localhost --port 1121 --uri /api/images/?shoe_id=0 --num-conn 6000 --num-call 1 --timeout 5 --rate 100'
    - 6000 total connections @ 100 per second
  - running into errors with open file limit > FD_SETSIZE when rate > 200

- locustio installed with homebrew 'pip install locustio' 
- created locustfile.py based on example in documentation
- run terminal command to start it (from working directory with locustfile.py) locust --host=http://localhost:1121
- go to localhost:8089 to turn it on
- can't directly set the RPS: having trouble going over 250 RPS with different configuration setups

- K6 installed with 'brew install k6'
- script file k6.js contains the script.  It can also  contain options or they can be run from command line
- k6 environment variables: __ENV.k6_type is in k6.js and defaults to GET
  - __ENV.k6_url defaults to http://localhost:1121
- example command line to run the script ' k6_type=GET k6 run --vus 50 -d 600s --throw --rps 1500 k6.js'
- increase max number of connections run 'sysctl sysctl kern.ipc.somaxconn=2048'
