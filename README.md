# DoutekiDNS Introduction
DoutekiDNS is an incredibly simple, and cheap Dynamic DNS service API built on AWS Route 53, Heroku, and MongoHQ. Designed to be started with one line, to run within heroku and MongoHQ's free tier, and to cost about 6$ a year only, with amazon's Route53 service. It utilizes a super simple REST interface, and outputs JSON for easy consumption across a bunch of platforms and languages. We are in the beginning still, pull requests are more than welcome! I give a great amount of thanks to my Grandfather, Steve Detro, who encouraged this idea seven years ago- I hope you really enjoy it, and I look forward to seeing what will happen.  
  
Thank you,  
Eric Lewis

## API / Server Examples
+ Basic, registration screen: GET http://api.example.com/register
+ Basic, subdomain management: GET http://api.example.com/domains
+ Get client ip: GET http://api.example.com/api/v1/checkip
+ Register account & subdomain: POST {username: "john", password: "doe"} http://api.example.com/api/v1/register
+ Attempt update: GET http://username:password@api.example.com/api/v1/update/:domain?
+ Add subdomain: POST {domain} http://username:password@api.example.com/api/v1/domains
+ Delete subdomain: GET http://username:password@api.example.com/api/v1/domains/delete/:id


## Requirements & Running Instructions
####Package Dependencies (Thank the developers of these!)
+ Express
+ Mongoose
+ AWSSUM
+ express-http-auth

####Platform Dependencies
+ Heroku (free tier or better)
+ MongoHQ (or equivalant that works with mongoose, any should do)
+ AWS account, with a Route53 hosted zone setup.

####Running directions (simple)
+ You must have the heroku toolbelt installed. 
```
./install.sh "AWS Access Key" "AWS Secret Key" "AWS Host" "Toplevel domain ex: example.com"
```

## Author(s)
**Eric Lewis**
+ http://twitter.com/ericlewis
