FROM node:12
WORKDIR /usr/SkuldDashGateway

COPY package.json package-lock.json /usr/src/app/
COPY . .

RUN npm install

CMD ["node", "src/index.js"]
