FROM leafney/alpine-mongo-tools

WORKDIR /root

COPY ./bin/ /usr/local/bin/
COPY ./bin/backup /etc/periodic/daily
COPY ./bin/backup /etc/periodic/monthly

# change the montly backup to poin to the monthly folder
RUN sed -ie '/#!\/bin\/sh/a export GDRIVE_SHARE_DIR_OBJ=$GDRIVE_MONTHLY_FOLDER_ID' \
 /etc/periodic/monthly/backup

RUN apk add --no-cache ca-certificates && update-ca-certificates
RUN wget https://github.com/prasmussen/gdrive/releases/download/2.1.1/gdrive_2.1.1_linux_amd64.tar.gz
RUN tar xvf gdrive_2.1.1_linux_amd64.tar.gz -C /usr/local/bin/
RUN rm gdrive_2.1.1_linux_amd64.tar.gz

# ENV HOME=/opt/dbbackup
# RUN touch "0 2 * * * run-parts /etc/periodic/daily"


ENTRYPOINT ["setenv"]
CMD ["startcron"]