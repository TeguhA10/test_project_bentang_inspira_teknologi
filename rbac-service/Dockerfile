FROM node:18-alpine
WORKDIR /app

# Copy rbac-service package files
COPY rbac-service/package*.json ./rbac-service/

# Install dependencies inside rbac-service directory
WORKDIR /app/rbac-service
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run the service
WORKDIR /app/rbac-service
EXPOSE 4002
CMD ["node", "index.js"]
