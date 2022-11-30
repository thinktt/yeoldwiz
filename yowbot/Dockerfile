FROM benjymous/docker-wine-headless

RUN wine cmd /c echo Wine is setup || true
ADD dist.tar /opt/yeoldwiz
WORKDIR /opt/yeoldwiz

COPY --from=node:16-buster-slim /usr/local/bin/node .

ENV ENG_CMD="/usr/bin/wine enginewrap.exe"
CMD ["./node", "./main.js"]