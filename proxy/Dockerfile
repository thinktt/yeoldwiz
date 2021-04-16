FROM node

RUN mkdir /opt/proxy
COPY ./ ./opt/proxy
WORKDIR /opt/proxy
RUN npm i express
RUN npm i node-fetch
RUN npm i request

CMD ["node", "proxy.js"]