FROM node:18-alpine
WORKDIR /app

# Copy root package.json for resolving "file:.." dependencies
COPY package*.json ./

# Copy auth-service package files
COPY auth-service/package*.json ./auth-service/

# Install dependencies inside auth-service directory
WORKDIR /app/auth-service
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run the service
WORKDIR /app/auth-service
EXPOSE 4001
CMD ["node", "index.js"]
