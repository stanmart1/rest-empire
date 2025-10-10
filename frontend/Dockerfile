FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npm install -g serve

COPY . .
RUN npm run build

EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]