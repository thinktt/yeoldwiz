FROM benjymous/docker-wine-headless

RUN curl -fsSL https://deno.land/x/install/install.sh | sh

ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"

# COPY ./ ./opt/yeoldwiz/
RUN mkdir /opt/yeoldwiz
WORKDIR /opt/yeoldwiz

# CMD /bin/bash wine node.exe testengine.js