## canvas
Picture and/or Video demo of product on page







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

I was surprised that the post request was able to handle all of the requests, so I did a quick check of the database
![Post Request Verification](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Verification+of+POST+requests+hitting+DB)

# Initial performance chart from loader.io GET route at 2,5000 RPS
![Image of Initial Bottleneck](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Service+2500RPS+-+initial+with+chart)

## Optimization Redis Cache
Using Redis cache successfully broke through the initial bottle neck of ~2,500 RPS.  Attempting 3,500 RPS initially ran into an open file limit issue.  After addressing the open file limit I was able to successfully run the test at 3,500 RPS.  The failure rate was execessive around 3,500 RPS.

# 2,5000 RPS using Redis cache
![Image of Redis 2500](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Service+2500RPS+-+Redis+Cache+with+chart)

|Database |	Route	| RPS	| Latency	| Throughput    | Error Rate | Note |
|-------- | ----- | --- | ------- | ------------- | ---------- | ---- | 
|Postgres | GET | 2500 | 74ms | 149,826 RPM | 0% | |
|Postgres | GET | 3500 | 1807ms | - RPM | 53% |Test ended after 12 seconds (too many open files)|
|Postgres | GET | 3500 | 2293 ms | 106,541 RPM | 2% |after increasing open file limit, new bottleneck|

# 3,500 RPS using Redis
![Image of Redis 3500 Fail](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Service+3500RPS+-+Redis+Cache+with+chart+-+new+bottleneck)

## Nginx Load Balancing
My approach was that since 1 instance could handle 2,500 RPS that it would take at least 4 load balanced instances to reach the goal of 10,000 RPS.  However, to reach that level on a single stance required nearly 100% CPU.  I didn't want each service continually under that much load, so I realistically thought the number of instances needed would be 6-7 to keep the load reasonable for the micro instance.

Unfortunately, after reading the Nginx load balancing getting started guide I had some...less than stellar results
![Image of failed load balancer 3,500 RPS](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Service+-+3500+RPS+load+balanced+-+not+stable)

I spent a few days troubleshooting various errors, but wasn't initially able to make the load balancer increase my performance.

##  Sanity Check - Out of Bounds AWS Elastic Load Balancing
When I was working to configure Nginx on the micro instance I kept running into errors that google results kept suggesting were the result of my service(s) being the bottleneck.  However, when I would monitor the CPU/RAM of the services it appeared their hardware were not maxed out, and they were not even successfully receiving the requests from NGINX.  I had deployed 10x micro instances, so 10,000 RPS should only have been 1,000 each which should not have been a trouble for the instance.

I decided to deploy an AWS elastic load balancer to test this theory.  We can see the latency isn't amazing, but the requests aren't failing.

# AWS Elastic Load Balancer - 10k with 6 micro services
![Images of AWS Elastic Load Balancer with 6 instances](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Sanity+Check+-+AWS+Elastic+Load+Balances+10%2C000+RPS+6x+micro+instances)

## Back to Nginx
# Personal Micro Services Limits
After successfully load blalancing using the AWS elastic load balancer, I was fully convinced that either the Nginx instance or configuration setup were the issues.

I did more research and realized I had some of my settings in the incorrect location of the configuration file.  I tuned many of the following configuration file settings. The important settings were related to:
  - Upstream connection limits
  - Upstream connection strategy (least_conn)
  - Keepalive request limits and timeouts
  - Handling "failed" upstream servers (timeout, max_fails)
  - Worker connections
  - Worker file limits
# Micro Nginx instance 6,000 RPS - 8x upstream microservices
![Nginx Micro 6k RPS Stable](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Service+-+6000+RPS+load+balanced+-+stable)

# Final Configuration - Load Balanced + Some Vertical Scaling
I tweaked the configuration file for a few days trying to improve performance.  The best results I had were a few "successful" runs at 7,000 RPS.  However, these runs appeared to be inconsistencies/luck based, because upon repeated attempts they would surpass the error threshold of 1%.  

I ended up scaling the Nginx load balanced instance to a t3.medium instance so that I would have an additional Nginx worker to help manage the connections.  Using the 1 t3.medium load balanced instance and 8 t2.micro instances running my microservice with their own Redis cache I was able to hit the goal of 10,000 RPS.
![Final Run](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Final+Run+-+10%2C000+RPS+t2.medium+load+balancer+8x+micro+instances)

![Google Page Speed](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Google+Page+Speeds)

## Alternative - Vertical Scaling/Pay2Win
Vertically scalling the service (with Redis cache) was also tested.  The server was set up to run Node.js in cluser mode with 1 worker per core.  I tested a t3.medium instance (2 cores) and a t3.xL instance (4 cores).  The medium (not pictured) easily handled 3,500 RPS but failed at 10,000.  The xL easily handled the 10,000 RPS.  These larger instances also have the added benefit of more powerful CPUs and additional RAM, so the benefits are not only attributable to the clustering.

# t3.xL instance - Node.js cluster mode with 4 workers
![Image of t3.xL instance cluster](https://hackreactor-sdc-project.s3-us-west-2.amazonaws.com/deployment+screenshots/Pay2Win+10k+RPS+-+xL+instance+in+4x+cluster+mode)


### The following sections are personal notes I kept around how I installed certain programs and my daily progress journal.

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

- Distributed mode:
  - Starting master: locust --master --host=$host
  - Starting slaves: locust --slave --master-host=$host &
    -- & runs in background mode, spawn 1 per CPU

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
# final start script: sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"; sudo sysctl net.core.somaxconn=100000;sudo sysctl net.ipv4.tcp_max_syn_backlog=100000;sudo sysctl -p;redis-server --daemonize yes; cd Ryan-canvas; npm run server:start
- follow this to install node: https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-up-node-on-ec2-instance.html
- sudo yum install git
- clone repo into the instance
- install redis on the instance: https://medium.com/@ss.shawnshi/how-to-install-redis-on-ec2-server-for-fast-in-memory-database-f30c3ef8c35e
- ssh into the instance and start the server
- increase open file limit if necessary ulimit -n 50000
- increased several network/connection limits
sudo sysctl net.core.somaxconn=10000;sudo sysctl net.ipv4.tcp_max_syn_backlog=10000;sudo sysctl -p;
  - sudo sysctl -w net.ipv4.ip_local_port_range="1024 65535"
  - sudo sysctl net.core.somaxconn=100000
  - sudo sysctl net.ipv4.tcp_max_syn_backlog=100000
  - sudo sysctl net.ipv4.tcp_fin_timeout=1

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

- install locally: prebuilt centos package
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
  - sudo vim /etc/nginx/nginx.conf

- View error / access logs (can specify additional or different file paths)
  - sudo tail -n 1000 /var/log/nginx/error.log
  - sudo tail -n 1000 /var/log/nginx/access.log

- helpful commands:
  - Identify processid: ps auxw | grep nginx

## Journal
- 2019-09-27: Added POST, PUT, DELETE routes
- 2019-09-28: Added tests for new server routes
- 2019-09-28: Postgres instal/config issues finally finished.  Successful mass insert scrips using pg-promise library.  Fought for hours with memory issues, but finally got seed script for postgres working.
  - inserted 10,000,000 in 650.409 seconds using batch size of 100,000
  - inserted 10,000,000 in 469.616 seconds using batch size of 10,000
- 2019-09-30: tried out Cassandra, Riak, CouchDB installation/configurations.  Using CouchDB as second database due to easy of steup and documentation.
- 2019-10-01: Using library Nano for CouchDB.  Successfully seeded 10M records.
  - inserted 10,000,000 in 1,277 seconds using batch size of 10,000
- 2019-10-02: Added select 1 query for Postgres.  Initial query times were 17-18seconds to select the last row in the table.  Adding an index reduced to a few miliseconds
- 2019-10-03: Added post 1 record for Postgres.  Post query runs about as fast as select.  Added getOne and post queries for couchDB.  CouchDB queries seem to be running slower, which is surprising.
- 2019-10-05: Initial performance testing using httperf: Both databases easily handle loads up to 200RPS.  I'm running into an error with an httperf (open file limit > FD_SETSIZE).  Spent time trying to debug with no issue.  Looking into other load testers (locustio, jmeter, artillery).
- 2019-10-08: Switched to K6 for load testing.  Achieved 1,000 GET requests per second with reasonable latency.  POST requests also run stable, but the latency is slower.
- 2019-10-10: Refactoring and writing some notes.  Taking screenshots of query timings and preparing for mid-point conversation video.  Refactored postgres post query.  Chose Postgres database due to the documentation being easier to read and having more specific examples and optimization tips.  Postgres being more popular also made troubleshooting errors and initial optimizations easier than CouchDB, and I expect this to be helpful in the deployed optimization part of the project.
- 2019-10-12: Video recording for mid-point conversation.  Deployed postgres to AWS.  Begin MVP break week.
- 2019-10-19: Finish MVP break.  Start researching deployment without docker.
- 2019-10-21: Deployed service to AWS.
- 2019-10-23: Connected service to deployed database.  
- 2019-10-25: Take initial speed notes.
- 2019-10-27: Researched load balancing and Redis as a cache.
- 2019-10-29: Implemented Redis caching.  Noticed significant improvement, able to successfully hit 2,500 RPS on service.  Noticed significant performance different with/without New Relic required on the server.  Further investgation about the issue.
- 2019-10-31: Looked into different types of caching.  Kept using Redis default LRU cache.
- 2019-11-02: Deployed new instance to install NGINX as a load balancer.
- 2019-11-05: Worked with NGINX settings and file limits.
- 2019-11-07: Continued to work on configuring nginx to handle > 3,500 connections.  Increased postgres max_connections to 500.
- 2019-11-09: increased ip port range and connection limits on nginx instance machine.
- 2019-11-11: Attempted to scale vertically, by increasing ec2 instance size/power while also using node cluster mode with 1 worker per core.  3,500 RPS achieved on medium instance in cluster mode with 2 workers.  10,000 RPS achieved using an xL instance with 4 workers.
- 2019-11-13: Tweaked a number of NGINX settings Achieved 6,000 RPS with micro load nginx instance and between 4-10 micro services.  Attempted to scale to 7,000 with unstable results.
- 2019-11-15: 