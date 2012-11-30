#!/bin/bash

git init
git add .
git commit -m 'initial commit'
heroku create
heroku addons:add mongohq:sandbox
heroku config:add AWS_ACCESSKEY=$1
heroku config:add AWS_SECRETKEY=$2
heroku config:add AWS_HOSTZONEID=$3
heroku config:add AWS_HOSTDOMAIN=$4
git push heroku master