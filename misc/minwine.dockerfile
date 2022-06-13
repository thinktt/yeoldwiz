# FROM benjymous/docker-wine-headless
FROM ubuntu:20.04

# ARG NODE_VERSION=v12.19.1
# RUN curl -O https://nodejs.org/download/release/${NODE_VERSION}/node-${NODE_VERSION}-linux-x64.tar.gz
# RUN tar xzf node-${NODE_VERSION}-linux-x64.tar.gz
# ENV PATH=/node-${NODE_VERSION}-linux-x64/bin:${PATH}

ENV WINE_MONO_VERSION 0.0.8

# Install some tools required for creating the image
# RUN apt-get update \
# 	&& apt-get install -y --no-install-recommends \
# 		curl \
# 		unzip \
# 		ca-certificates \
# 		xvfb

# Install wine and related packages
RUN dpkg --add-architecture i386 \
  && apt-get update -qq \ 
  && apt-get install -y -qq \ 
    wine-stable -y \
  && rm -rf /var/lib/apt/lists/*
# RUN apt-get install wine32  -y
# RUN apt-get install winetricks  -y
# RUN apt-get install libgl1-mesa-glx:i386  -y
# RUN rm -rf /var/lib/apt/lists/*


COPY ./ ./opt/yeoldwiz/
WORKDIR /opt/yeoldwiz

CMD wine node.exe testengine.js


