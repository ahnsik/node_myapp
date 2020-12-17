####
## RUNNING myDiary docker
####

docker stop nodemyapp
docker rm nodemyapp

docker run -p 8088:3000 -d --name nodemyapp nodemyapp

