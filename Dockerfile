FROM node:10

WORKDIR /app

COPY . /app

RUN npm install

COPY . .

EXPOSE 1121

CMD ["npm", "start"]