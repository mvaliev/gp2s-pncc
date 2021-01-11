#    docker swarm init
#    docker stack deploy -c docker-compose.yml gp2s_stack

#export GP2S_IMAGE=marat/gp2s-dev
export GP2S_IMAGE="marat/gp2s-dev:latest"
docker-compose up --abort-on-container-exit --build
