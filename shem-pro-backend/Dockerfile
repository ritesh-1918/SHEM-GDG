FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (only production)
RUN npm ci

# Copy full application
COPY . .

# Expose the correct port (Hugging Face Spaces expects 7860)
ENV PORT=7860
EXPOSE 7860

# Start server
CMD ["node", "server.js"]
