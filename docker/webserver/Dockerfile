# Stage 1: Build with Vite
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY ./webApp/package.json ./
RUN pnpm install
COPY webApp/ .
RUN pnpm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/webserver/nginx.conf /etc/nginx/nginx.conf
COPY docker/webserver/html/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
