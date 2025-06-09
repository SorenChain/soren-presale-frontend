FROM node:18-alpine
WORKDIR /app
RUN npm i -g pm2
COPY . .
RUN npm i
RUN npm run build
EXPOSE 3000
CMD  [ "pm2-runtime", "npm", "--", "run", "start" ]