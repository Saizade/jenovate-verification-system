# Use Node.js LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files first for caching
COPY package.json package-lock.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy all backend source code
COPY . .

# Remove development files
RUN rm -rf .env .env.example

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose the port Cloud Run will use
EXPOSE 8080

# Start the server
CMD ["node", "server.js"]
