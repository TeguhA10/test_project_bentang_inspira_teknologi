FROM node:18-alpine
WORKDIR /app

# Copy transaksi-service package files
COPY transaksi-service/package*.json ./transaksi-service/

# Install dependencies inside transaksi-service directory
WORKDIR /app/transaksi-service
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run the service
WORKDIR /app/transaksi-service
EXPOSE 4004
CMD ["node", "index.js"]
