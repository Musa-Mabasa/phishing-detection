# Use the official Node.js image to build the React app
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port Nginx will serve on
EXPOSE 5173

# Start Nginx
CMD ["npm", "run", "dev"]