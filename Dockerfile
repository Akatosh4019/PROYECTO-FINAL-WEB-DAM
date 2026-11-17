FROM node:24-alpine AS build
WORKDIR /app
COPY frontendIndumotos/package*.json ./
RUN npm ci
COPY frontendIndumotos/ ./
RUN npm run build
FROM nginx:alpine
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist/frontendIndumotos/browser /usr/share/nginx/html
EXPOSE 80
