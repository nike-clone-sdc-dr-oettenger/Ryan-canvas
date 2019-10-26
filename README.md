## canvas
Picture and/or Video demo of product on page





## Optimizations

# Initial Performance
|Database |	Route	| RPS	| LATENCY	| THROUGHPUT | ERROR RATE | Note |
|-------- | ----- | --- | ------- | ---------- | ---------- | ---- | 
|Postgres | GET | 1 | 74ms | 60 RPM | 0% | |
|Postgres | GET | 10 | 74ms | 600 RPM | 0% | |
|Postgres | GET | 100 | 73ms | 6,000 RPM | 0% | |
|Postgres | GET | 1,000 | 73ms | 59,388 RPM | 0% | |
|Postgres | GET | 10,000 | 1691MS | - | 53% | Error threshold after 10 seconds|
|Postgres | POST | 1 | 80ms | 60 RPM | 0% | |
|Postgres | POST | 10 | 76 ms | 600 RPM | 0% | |
|Postgres | POST | 100 | 74 ms | 5,926 RPM | 0% | |
|Postgres | POST | 1,000 | 76 ms | 59,358 RPM | 0% | |
|Postgres | GET | 10,000 | 941 MS | - | 3% | Error threshold after 3 seconds|






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
  - ## create index shoe_images_shoe_id on shoe_images(shoe_id);
  - index reduced query time for select 1 from ~18 seconds to a few miliseconds


# Couchdb
- installed with homebrew 'brew install couchdb'
- started with 'couchdb' (started a server, can view on localhost)
  - default port 5984

- using library nano (via npm) 
- critical when selecting to include the setting { include_docs: true }

# Load Testers - Used K6 for local testing after experimentation

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
- Example command line to run the script ' k6_type=GET k6 run --vus 50 -d 600s --throw --rps 1000 k6.js'
- increase max number of connections run 'sysctl sysctl kern.ipc.somaxconn=2048'


## Deployment Config / Setup (without Docker)

# Deploying Database instance
- launch EC2 instance and enter ssh command into terminal (make sure in ssh folder: cd ~/.ssh )
 - install postgres: sudo yum install postgresql postgresql-server postgresql-devel postgresql-contrib postgresql-docs
 - edit this config file: sudo vim /var/lib/pgsql/data/pg_hba.conf
  - add these IPv4 connections:
    - host  all  power_user  0.0.0.0/0  md5

 - also edit this config to allow users to connect remotely: sudo vim /var/lib/pgsql/data/postgresql.conf
  - uncomment the following: 
    - listen addresses = '*' 
    - port=5432
- I can now start server with: sudo service postgresql start
- log in with these 2 commands
  - sudo su - postgres
  - psql -U postgres
- set up the power_user
  - in psql terminal: CREATE USER power_user SUPERUSER; ALTER USER power_user WITH PASSWORD '$poweruserpassword';
- Set up the database:
- CREATE DATABASE nike_canvas;
- CREATE TABLE Shoe_Images (ID SERIAL PRIMARY KEY, shoe_id int, img1 VARCHAR(255), img2 VARCHAR(255), img3 VARCHAR(255), img4 VARCHAR(255), img5 VARCHAR(255), img6 VARCHAR(255), img7 VARCHAR(255), vid1 VARCHAR(255), vid2 VARCHAR(255));

# Deploying Service Instance
- follow this to install node: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
- sudo yum install git
- ssh into the instance and start the server

# Loaderio
- download the loaderio key (will be a .txt file) and save in /client/dist folder
- verify ec2 instance and start setting up tests



## Journal
- 2019-09-27: Added POST, PUT, DELETE routes
- 2019-09-28: Added tests for new server routes
- 2019-09-28: 5am Postgres instal/config issues finally finished.  Successful mass insert scrips using pg-promise library.  Fought for hours with memory issues, finally got seed script for postgres working.
  - inserted 10,000,000 in 650.409 seconds using batch size of 100,000
  - inserted 10,000,000 in 469.616 seconds using batch size of 10,000
- 2019-09-30: tried out Cassandra, Riak, CouchDB installation/configurations.  Using CouchDB as second database
- 2019-10-01: Using library Nano for CouchDB.  Successfully seeded 10M records.
  - inserted 10,000,000 in 1,277 seconds using batch size of 10,000
- 2019-10-02: Added select 1 query for Postgres.  Initial query times were 17-18seconds to select the last row in the table.  Adding an index reduced to a few miliseconds
- 2019-10-03: Added post 1 record for Postgres.  Post query runs about as fast as select.  Added getOne and post queries for couchDB.  CouchDB queries seem to be running slower, which is surprising.
- 2019-10-05: Initial performance testing using httperf: Both databases easily handle loads up to 200RPS.  I'm running into an error with an httperf (open file limit > FD_SETSIZE).  Spent time trying to debug with no issue.  Looking into other load testers (locustio, jmeter, artillery).
- 2019-10-08: Switched to K6 for load testing.  Achieved 1,000 GET requests per second with reasonable latency.  POST requests also run stable, but the latency is slower
- 2019-10-10: Refactoring and writing some notes.  Taking screenshots of query timings and preparing for mid-point conversation video.  Refactored postgres post query.
- 2019-10-12: Video recording for mid-point conversation.  Begin MVP break week.
- 2019-10-19: Finish MVP break.  Start researching deployment without docker.
- 2019-10-21: Deployed postgres to AWS.
- 2019-10-23: Connected service to deployed database.  Deployed service to AWS.
- 2019-10-25: Take initial speed notes.