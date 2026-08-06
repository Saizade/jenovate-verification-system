FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy app source
COPY . .

# Create directory for SQLite DB and Uploads, and ensure node user has permissions
RUN mkdir -p /app/data /app/uploads && \
    chown -R node:node /app

# Run as non-root user for security
USER node

# Expose backend port
EXPOSE 5001

# Start application
CMD [ "npm", "start" ]
