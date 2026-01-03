FROM node:24-alpine AS backend
WORKDIR /app
COPY backend/package.json /app/package.json
RUN npm i
COPY backend .
CMD ["node", "."]

FROM nginx:1.29.4-alpine AS frontend
WORKDIR /usr/share/nginx/html
COPY frontend .
COPY nginx.conf /etc/nginx/conf.d/default.conf
