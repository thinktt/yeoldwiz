FROM node

RUN mkdir /opt/proxy
COPY ./ ./opt/proxy
WORKDIR /opt/proxy
RUN npm i express
RUN npm i node-fetch

CMD ["node", "proxy.js"]