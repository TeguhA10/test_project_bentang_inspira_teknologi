FROM node:18-alpine
WORKDIR /app

# Copy root package.json for resolving "file:.." dependencies
COPY package*.json ./

# Copy frontend package files
COPY frontend/package*.json ./frontend/

# Install dependencies inside frontend directory
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the application files
WORKDIR /app
COPY . .

# Run Vite dev server (host: true is already configured in vite.config.ts)
WORKDIR /app/frontend
EXPOSE 5173
CMD ["npm", "run", "dev"]
