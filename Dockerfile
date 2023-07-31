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

RUN curl -s -S -L https://raw.githubusercontent.com/AdguardTeam/AdGuardHome/master/scripts/install.sh | sh -s -- -v

WORKDIR /

COPY ./api /var/www/
#RUN mkdir /var/www/tmp

WORKDIR /var/www
RUN npm install

RUN chmod +x /var/www/start.sh

WORKDIR /

RUN mkdir tmp

EXPOSE 27017
EXPOSE 10085
EXPOSE 51820/udp
EXPOSE 51820/tcp

#AdguarHome Ports
EXPOSE 53/tcp
EXPOSE 53/udp
EXPOSE 67/udp
EXPOSE 68/udp
EXPOSE 80/tcp
EXPOSE 443/tcp
EXPOSE 443/udp
EXPOSE 3000/tcp
EXPOSE 853/tcp
EXPOSE 853/udp
EXPOSE 784/udp
EXPOSE 8853/udp
EXPOSE 5443/tcp
EXPOSE 5443/udp
#
COPY supervisord.conf /etc/supervisor/supervisord.conf
ENTRYPOINT bash -c "/usr/bin/supervisord -c /etc/supervisor/supervisord.conf"
