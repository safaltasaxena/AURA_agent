# Stage 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
# VITE_API_URL can be omitted or passed as a build arg if deploying to a different domain.
# Since we are serving from the same origin, relative paths or omitting it falls back correctly.
RUN npm run build

# Stage 2: Set up the Node.js Express backend
FROM node:18-alpine
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./

# Copy built frontend assets from Stage 1 into the location the backend expects
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port for Cloud Run
EXPOSE 8080

# Set production environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Start the Express server
CMD ["npm", "start"]
