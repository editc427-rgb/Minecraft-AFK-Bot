FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN yarn install --production

COPY . .

CMD ["node", "bot.js"]
