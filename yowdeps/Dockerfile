FROM alpine

RUN apk update
RUN apk add nodejs
RUN apk add vim

# RUN wine cmd /c echo Wine is setup || true
ADD dist.tar /opt/yeoldwiz
COPY dist/docalibrate.js /opt/yeoldwiz
WORKDIR /opt/yeoldwiz

CMD ["node", "./main.js"]
