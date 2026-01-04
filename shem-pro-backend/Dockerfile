FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (only production)
RUN npm ci

# Copy full application
COPY . .

# Expose the correct port (Render standard port)
ENV PORT=10000
EXPOSE 10000

# Start server
CMD ["node", "server.js"]
