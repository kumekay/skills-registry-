# Stage 1: build skills.json by crawling configured sources
FROM node:20-alpine AS crawler

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY sources.json ./
COPY crawler/ ./crawler/
COPY public/ ./public/

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

RUN node crawler/index.js

# Stage 2: serve the static site with nginx
FROM nginx:alpine

COPY --from=crawler /app/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
