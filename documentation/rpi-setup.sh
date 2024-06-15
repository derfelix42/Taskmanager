#!/bin/bash

# Show welcome message

echo " _____          _                                                ";
echo "/__   \__ _ ___| | ___ __ ___   __ _ _ __   __ _  __ _  ___ _ __ ";
echo "  / /\/ _\` / __| |/ / '_ \` _ \ / _\` | '_ \ / _\` |/ _\` |/ _ \ '__|";
echo " / / | (_| \__ \   <| | | | | | (_| | | | | (_| | (_| |  __/ |   ";
echo " \/   \__,_|___/_|\_\_| |_| |_|\__,_|_| |_|\__,_|\__, |\___|_|   ";
echo "                                                 |___/           ";
echo
echo "Starting install script..."

# Update system
echo "Updating system..."
sudo apt-get update -y && sudo apt-get upgrade -y

# Install dependencies
echo "Installing dependencies..."
# Add any other dependencies you need here
sudo apt-get install -y docker docker-compose git apache2-utils vim

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