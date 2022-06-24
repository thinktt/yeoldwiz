FROM i386/alpine

RUN apk update
RUN apk add wine
RUN apk add node
# RUN wine cmd /c echo Wine is setup || true
ADD dist.tar /opt/yeoldwiz
WORKDIR /opt/yeoldwiz

ENV ENG_CMD="/usr/bin/wine enginewrap.exe"
CMD ["node", "./main.js"]