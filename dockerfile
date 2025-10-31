# Use Node 20 LTS
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]