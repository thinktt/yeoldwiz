FROM benjymous/docker-wine-headless

ARG NODE_VERSION=v12.19.1
RUN curl -O https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz
RUN tar xzf node-${NODE_VERSION}-linux-x64.tar.gz
ENV PATH=/node-${NODE_VERSION}-linux-x64/bin:${PATH}

WORKDIR /opt
COPY ./ ./yeoldwiz/

WORKDIR /opt/yeoldwiz
# ENV ENG_CMD="wine /opt/yeoldwiz/TheKing350noOpk.exe"
# ENV ENG_CMD="wine /opt/yeoldwiz/stdioTester.exe"
