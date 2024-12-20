# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Build the project
RUN bun run build

# Expose port
EXPOSE 3000
# Start the application
CMD ["bun", "run", "/app/build/index.js"] 
