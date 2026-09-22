# Build stage
FROM node:22-alpine AS build-stage

ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage (Using Nginx for high-performance static file serving + Zero CORS Reverse Proxy)
FROM nginx:alpine AS production-stage

WORKDIR /usr/share/nginx/html

# Clear default static assets
RUN rm -rf ./*

# Copy built SPA dist from build stage
COPY --from=build-stage /app/dist .

# Copy Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
