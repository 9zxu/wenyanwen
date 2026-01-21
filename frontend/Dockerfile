# Use the official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json files first to take advantage of Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# that the Next.js application inside this container intends to listen for traffic on port 3000
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]
