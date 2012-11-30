# DoutekiDNS
DoutekiDNS is an incredibly simple, and cheap Dynamic DNS service API built on AWS Route 53, Heroku, and MongoHQ. Designed to be started with one line, to run within heroku and MongoHQ's free tier, and to cost only a couple dollars a month with amazon's Route53 service. It utilizes a super simple REST interface, and outputs JSON for easy consumption across a bunch of platforms and languages. We are in the beginning still, pull requests are more than welcome! Enjoy :)

## Examples
+ register domain: /api/v1/register/:username/:password
+ attempt ip update: /api/v1/update/:username/:password
+ get ip: /api/v1/checkip


## Requirements & Running Instructions
####Package Dependencies
+ Express
+ Mongoose
+ AWSSUM

####Platform Dependencies
+ Heroku (free tier or better)
+ MongoHQ (or equivalant that works with heroku)
+ AWS account

####Running directions (simple)
+ You must have the heroku toolbelt installed. 
```
./install.sh "AWS Access Key" "AWS Secret Key" "AWS Host" "Toplevel domain ex: example.com"
```

## Author(s)
**Eric Lewis**

+ http://twitter.com/ericlewis
+ http://github.com/ericlewis