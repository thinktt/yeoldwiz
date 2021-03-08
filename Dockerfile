FROM benjymous/docker-wine-headless

# RUN mkdir /opt/yeoldwiz
COPY ./ ./opt/yeoldwiz/
WORKDIR /opt/yeoldwiz
RUN wine cmd /c echo Wine is setup || true

ENV ENG_CMD="/usr/bin/wine enginewrap.exe"
CMD ./node main.js