####
## RUNNING myDiary docker
####

docker stop nodemyapp
docker rm nodemyapp

docker run --restart always -p 8088:3000 -d --log-opt max-size=5m --name nodemyapp nodemyapp

