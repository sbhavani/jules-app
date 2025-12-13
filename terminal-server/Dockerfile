ARG BASE_IMAGE=nvcr.io/nvidia/pytorch:25.11-py3
FROM ${BASE_IMAGE}

# Install Node.js 20 and common tools
# The base image is Ubuntu-based, so we use apt-get
RUN apt-get update && apt-get install -y curl build-essential \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get install -y \
    bash \
    git \
    vim \
    nano \
    emacs-nox \
    && rm -rf /var/lib/apt/lists/*

# Install gemini-cli globally using npm
RUN npm install -g @google/gemini-cli

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create workspace directory
RUN mkdir -p /workspace

# Set default shell to bash
ENV SHELL=/bin/bash

# Expose WebSocket port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start server
CMD ["node", "server.js"]
