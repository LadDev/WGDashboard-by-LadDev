FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt upgrade -y

# Создание каталога для сокета PHP-FPM
RUN mkdir -p /run/php
RUN mkdir -p /data/db

# Установка необходимых пакетов
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip

# Добавление репозитория ondrej/php
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:ondrej/php

RUN apt update && apt upgrade -y

RUN apt-get update && apt-get install -y supervisor apt-utils iputils-ping traceroute dnsutils

RUN apt-get install -y mongodb

RUN apt install wireguard python3 pip git nano net-tools iproute2 iptables -y

RUN echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
RUN sysctl -p

COPY mongodb.conf /etc/mongodb.conf

# Установка Node.js
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get install -y nodejs

RUN echo "Настройка аутентификации MongoDB..."
# Создание пользователя MongoDB
RUN mongod --fork --logpath /var/log/mongodb.log \
    && mongo admin --eval "db.createUser({ user: 'root', pwd: 'fs3tVAWo', roles: ['root'] })" \
    && mongod --shutdown

RUN npm install -g pm2

COPY ./api /var/www/

WORKDIR /var/www
RUN npm install

#RUN chmod +x change_private.sh
#RUN ./change_private.sh
#
#RUN rm setup.sh
#
#WORKDIR /wgdashboard/src
#
#RUN chmod +x wgd.sh
#RUN chmod +x /wgdashboard/src/wgd.sh
#
#RUN ./wgd.sh install
#
WORKDIR /
#
#RUN chmod -R 755 /etc/wireguard

EXPOSE 27017
EXPOSE 10085
EXPOSE 51820/udp
#
COPY supervisord.conf /etc/supervisor/supervisord.conf
ENTRYPOINT bash -c "/usr/bin/supervisord -c /etc/supervisor/supervisord.conf"
