# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Injected at build time by CI (GitHub secret REACT_APP_API_URL)
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run injects PORT; Nginx must listen on it
ENV PORT=8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
