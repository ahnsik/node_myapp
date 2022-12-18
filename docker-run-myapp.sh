####
## RUNNING myDiary docker
####

docker stop nodemyapp
docker rm nodemyapp

docker run -p 8088:3000 -d --log-opt max-size=5m --name nodemyapp nodemyapp -v /home/ahnsik/workspace/html/node_myapp:/usr/src/app 

