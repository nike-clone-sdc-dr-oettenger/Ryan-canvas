## canvas
Picture and/or Video demo of product on page





### Optimizations

## Initial Performance
|Database |	Route	| RPS	| Latency	| Throughput    | Error Rate | Note |
|-------- | ----- | --- | ------- | ------------- | ---------- | ---- | 
|Postgres | GET | 1 | 74ms | 60 RPM | 0% | |
|Postgres | GET | 10 | 74ms | 600 RPM | 0% | |
|Postgres | GET | 100 | 73ms | 6,000 RPM | 0% | |
|Postgres | GET | 1,000 | 73ms | 59,388 RPM | 0% | |
|Postgres | GET | 2,000 | 144ms | 119,863 RPM | 0% | |
|Postgres | GET | 2,500 | 577ms | 81,344 RPM | 45.7% | |
|Postgres | GET | 10,000 | 1691MS | - | 53% | Test ended after 10 seconds (50% failures)|
|Postgres | POST | 1 | 80ms | 60 RPM | 0% | |
|Postgres | POST | 10 | 76 ms | 600 RPM | 0% | |
|Postgres | POST | 100 | 74 ms | 5,926 RPM | 0% | |
|Postgres | POST | 1,000 | 76 ms | 59,358 RPM | 0% | |
|Postgres | POST | 10,000 | 941 MS | - | 83% | Test ended after 3 seconds (50% failures)|

We can see above that the initial performance of the GET route started to degrade at 2,000 RPS and was completely failing by 2,500 RPS.  This will be the initial target for performance improvements.
# Initial performance chart from loader.io GET route at 2,5000 RPS
![Image of Initial Bottleneck](https://hackreactor-sdc-project.s3.us-west-2.amazonaws.com/deployment%20screenshots/Service%202500RPS%20-%20initial%20with%20chart?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEJL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMSJIMEYCIQD%2BLn1DO5dvlxr3Hf6V%2FsoM%2F3rqYgWh%2BIZTF6bK2hEvgQIhANYi9XTdnK%2Fq5iWL9tXl6HQKE9CrPOJdFtbCyS8ZZLXGKrkBCJv%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMDY1NTMwODI5MjYyIgyEsC7DugIChulnhvgqjQExcsEJH3odfunee1qjWxwTVFg0F6vr2PuPUYEpVAAE931urWB%2FDQtEggZDozDIlyfPG4nllxDDqziaJAgzFRpTfiIS9FdfgKsZ6monM7lbq49%2BQE0AssT%2BPtdi7A7hgj4%2FxCwCCDbMqkM6s9miB0wS5WiL7dJGPC5MXR9uUJm62mX3WN2dwpYfz%2BaoBxQw3pXe7QU6oAK9E5gzRpCEu7axykaoT2EwVIdsGlg7Ro9rKxaL%2BYJYJ5W6HCP3Lcs3ZEci5j8VlhL9Q4qN5f2gtTwzI%2FPRiQC%2BPhy6HkkfC%2BDxbilkc65S565r%2BbYm6J%2FZOJxrdr883iXWt4v9iRkuJhBb3mOabypWRcenRsvm1rGrvWaqHTtvCMRHHo95k04IL3EvwMXUpPtq77uEJX4lXcCryQDbX8knWkLVY5YK2UuL5DET9PCaFIyHw75Szv3qE4RVH%2Fee5TIP5Y8KY2T3AYM0MEkzIX%2F1%2Fxt3nCFj5R97phDjYqmQtNEdkDERDYiqIcQzLsRnr6HGxTPVd4HStgtu14WprGSJFld6FnsSTiDPIu5GdbPf%2B66Sf3cwh36mr7P3d29Mri0%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20191029T013507Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ6QPRDHHFLCVLH76%2F20191029%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=62bdfc96919f730be7ecc29cbc95a86d30a5f67f5e8a441ec1791601c26e2fdc)

## Optimization 1 Redis Cache

# 2,5000 RPS using Redis cache
![Image of Initial Bottleneck](https://hackreactor-sdc-project.s3.us-west-2.amazonaws.com/deployment%20screenshots/Service%202500RPS%20-%20Redis%20Cache%20with%20chart?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLXdlc3QtMSJIMEYCIQCTp0oGV%2FvkjUHco0rGoFcrCg5kc076A6qotSIIxNSqrwIhAOc015iNH%2FccLzXLluWPJcrmGjDF8pzDxxjWL7tJev0VKrkBCLT%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMMDY1NTMwODI5MjYyIgy%2F2Nh5rGBSb4M2Ll0qjQHPuB1%2BnHMwZ4O6lkpoktRkBwWo1Qcal%2BUqVJo8Ew4M5jvOJplaerhbqNRqJH2foe%2FjXfdCAbKrYTL4cIsJxF1OgW01FaxIvJ66yPoyux%2Bz1uEdaYBtuM6pMV6tHbJLcS%2F8BthAbnQnTur%2B2JENeKHnlLvcIu6YU%2FTTjKC4GsY9%2FMRedkJ5iL6LTNZyMGIwi9nj7QU6oAJRZbNSiFhC2p9gLleyce8kbTdbxXeD0xHK2sXa9wt2wNGd0o5yax%2Fdjt4WDTlsBVMWcBEP1EF41ARbEff%2FAc9C90k2oUDs%2FP5Cfuda7J0w6AxknYvs509Rd2xPHCJZOrh%2FfQo%2FaydHTE3fc3LiHa7RfdWPokM7ZwqHa%2Fc7m6dkAb8tQ69lJTucm7jaV3f3D83SfgMJDdolmfW%2BNAQKpO7%2BpE7J6%2FvLRgUddm2nHPGgi%2BURVWo0o9bO%2BdndIZvEDWanfEOC%2Bv%2B%2FBlsRGbRFPJlfzPnu1gEh10gvHhm9BcBfNcavF%2BhM5dbEWUsLxC8Ox27Pbr04m13lxkziilmnT9w42WqKmEuj%2FBWtx7AyfbaIE2Nd0DMko0I5JACitTJSqvo%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20191030T032314Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAQ6QPRDHHEHN4IWPA%2F20191030%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Signature=df30fd95026b57c5b5ea58d060922c762cd008b76224c5c107d1be330a57d0c1)

|Database |	Route	| RPS	| Latency	| Throughput    | Error Rate | Note |
|-------- | ----- | --- | ------- | ------------- | ---------- | ---- | 
|Postgres | GET | 2500 | 74ms | 149,826 RPM | 0% | |
|Postgres | GET | 3500 | 1807ms | - RPM | 53% |Test ended after 12 seconds (too many open files)|
|Postgres | GET | 3500 | 2293 ms | 106,541 RPM | 2% |after increasing open file limit, new bottleneck|

Using Redis cache successfully broke through the initial bottle neck of ~2,500 RPS.  Attempting 3,500 RPS initially ran into an open file limit issue.  After addressing the open file limit with ulimit -n XX,XXX I was able to successfully run the test at 3,500 RPS.  The failure rate

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

- changed max_connections as part of load balance optimization.  Edited config file with this command:
  - sudo vim /var/lib/pgsql/data/postgresql.conf

# Deploying Service Instance
# final start script: redis-server --daemonize yes; cd Ryan-canvas; npm run server:start
- follow this to install node: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
- sudo yum install git
- clone repo into the instance
- install redis on the instance: https://medium.com/@ss.shawnshi/how-to-install-redis-on-ec2-server-for-fast-in-memory-database-f30c3ef8c35e
- ssh into the instance and start the server
- increase open file limit if necessary ulimit -n 50000

# Loaderio
- download the loaderio key (will be a .txt file) and save in /client/dist folder
- verify ec2 instance and start setting up tests

# Redis
- install with brew install redis (mac)
  - brew services start redis
- npm install --save redis
- inside deployed ec2 instance follow this guide: https://medium.com/@ss.shawnshi/how-to-install-redis-on-ec2-server-for-fast-in-memory-database-f30c3ef8c35e
- make sure to ssh into instance and redis-start
  - run in background with redis-server --daemonize yes

# NGINX
- ssh into the instance
- install using : sudo amazon-linux-extras install nginx1
- install prebuilt centos package
  - create file with: sudo vi /etc/yum.repos.d/nginx.repo
  - in the newly created file file add: 
    [nginx]
    name=nginx repo
    baseurl=https://nginx.org/packages/mainline/centos/7/$basearch/
    gpgcheck=0
    enabled=1
- start using: sudo nginx
- test it's running with curl -I 127.0.0.1

- Configuring to work as a load balancer:
  - cd /etc/nginx
  - sudo vim nginx.conf

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
- 2019-10-27: Researched load balancing and Redis as a cache.
- 2019-10-29: Implemented Redis caching.  Noticed significant improvement, able to successfully hit 2,500 RPS on service.  Noticed significant performance different with/without New Relic required on the server.  Further investgation about the issue.
- 2019-10-31: Looked into different types of caching.  Kept using Redis default LRU cache.
- 2019-11-02: Deployed new instance to install NGINX as a load balancer.
- 2019-11-05: Worked with NGINX settings and file limits.
- 2019-11-07: Continued to work on configuring nginx to handle > 3,500 connections.  Increased postgres max_connections to 500.