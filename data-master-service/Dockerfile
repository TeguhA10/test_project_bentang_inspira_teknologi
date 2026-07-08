FROM node:18-alpine
WORKDIR /app

# Copy root package.json for resolving "file:.." dependencies
COPY package*.json ./

# Copy data-master-service package files
COPY data-master-service/package*.json ./data-master-service/

# Install dependencies inside data-master-service directory
WORKDIR /app/data-master-service
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run the service
WORKDIR /app/data-master-service
EXPOSE 4003
CMD ["node", "index.js"]
