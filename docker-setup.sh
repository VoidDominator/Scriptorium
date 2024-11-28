echo "Pulling Docker images for supported languages. This may take a while..."

# Pull Docker images
docker pull python:3.10
docker pull node:20
docker pull openjdk:21
docker pull gcc:latest
docker pull ruby:3.2
docker pull golang:1.20
docker pull php:8.2-cli
docker pull swift:5.7
docker pull rust:1.70
docker pull perl:5.36

echo "Docker images pulled successfully."

echo "Adding current user to docker group..."
# You have to be in the docker group to run the server without sudo
sudo usermod -aG docker $USER
sudo systemctl restart docker

echo "Setup complete. You might need to restart your shell or system if docker still doesn't work."