FROM node:alpine
COPY ./ ./opt/yowapi/
WORKDIR /opt/yowapi
RUN npm install

CMD ["node", "main.js"]
