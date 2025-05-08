FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 5000

# Define environment variables (these should be overridden at runtime)
ENV NODE_ENV=production
ENV PORT=5000

# Start the application
CMD ["node", "dist/server/index.js"]