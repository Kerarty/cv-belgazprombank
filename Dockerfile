# Сборка статики и отдача через nginx.
# Запуск: docker build -t cv-bpb . && docker run --rm -p 8080:80 cv-bpb
# (или docker compose up --build)

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
