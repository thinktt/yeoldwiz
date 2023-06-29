FROM i386/alpine

RUN apk update
RUN apk add wine
RUN apk add nodejs
RUN apk add vim
RUN winecfg
RUN apk add xvfb

ENV WINEDEBUG=-all
ENV DISPLAY=:0.0

 # xvfb :0 -screen 0 1024x768x16 &


# RUN wine cmd /c echo Wine is setup || true
ADD dist.tar /opt/yeoldwiz
COPY dist/docalibrate.js /opt/yeoldwiz
WORKDIR /opt/yeoldwiz

ENV ENG_CMD="/usr/bin/wine enginewrap.exe"
CMD ["node", "./main.js"]