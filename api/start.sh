#!/bin/bash

# Установка глобальных зависимостей
#npm install -g pm2

cd /var/www

# Запуск приложения с помощью pm2
pm2-runtime start pm2.config.js
