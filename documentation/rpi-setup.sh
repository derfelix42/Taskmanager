#!/bin/bash

# Show welcome message
echo "Welcome to the Auto Install Script for My Software Repository"

# Update system
echo "Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y

# Install dependencies
echo "Installing dependencies..."
# Add any other dependencies you need here
sudo apt-get install -y docker docker-compose git

# Clone git repo and switch to a special branch
echo "Cloning repository..."
git clone https://github.com/derfelix42/Taskmanager.git
cd Taskmanager
git checkout 5-docker-deploy

# create .env file
cp .env.sample .env

# Run docker compose up
echo "Starting up the software..."
sudo docker-compose up -d --build

echo "Installation complete! Visit this Pi in the browser on port 80 on the correct IP address"
ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p'