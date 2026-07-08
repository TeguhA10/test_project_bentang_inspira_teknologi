FROM node:18-alpine
WORKDIR /app

# Copy api-gateway package files
COPY api-gateway/package*.json ./api-gateway/

# Install dependencies inside api-gateway directory
WORKDIR /app/api-gateway
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run the service
WORKDIR /app/api-gateway
EXPOSE 4000
CMD ["node", "index.js"]
