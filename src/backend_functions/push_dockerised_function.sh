#!/bin/bash

if [ "$#" -ne 2 ]
then
  echo "Usage: $0 <docker_image> <dockerfile>"
  exit 1
fi

# login to ECR repo
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 726018912366.dkr.ecr.eu-west-1.amazonaws.com

docker build --no-cache -t $1 . -f $2

docker tag $1:latest 726018912366.dkr.ecr.eu-west-1.amazonaws.com/$1:latest

docker push 726018912366.dkr.ecr.eu-west-1.amazonaws.com/$1:latest
