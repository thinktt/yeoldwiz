FROM benjymous/docker-wine-headless

# COPY ./ ./opt/yeoldwiz/
RUN mkdir /opt/yeoldwiz
WORKDIR /opt/yeoldwiz
RUN wine cmd /c echo Wine is setup || true

# CMD /bin/bash wine node.exe testengine.js