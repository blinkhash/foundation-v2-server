# Use an official Node.js runtime as the base image
FROM node:14

# Install the necessary dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libsodium-dev \
    libboost-system-dev

# Create a working directory
WORKDIR /app

# Copy the entire repository
COPY . .

# Install npm dependencies
RUN npm install

# Copy the config.js file
COPY configs/main/config.js configs/main/config.js

# Install foundation-v2-bitcoin
RUN npm install --save foundation-v2-bitcoin

# Copy the bitcoin.js file
COPY configs/pools/bitcoin.js configs/pools/bitcoin.js

# Expose the ports for the API and the pool
EXPOSE 3001 3002

# Start the mining pool
CMD /usr/local/bin/node index.js
