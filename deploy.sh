#!/bin/bash
git reset --hard origin/master
git pull origin master

yarn set version stable
yarn install
yarn build

sudo rm -rf /var/www/venusai/html/* && sudo cp -R dist/* /var/www/venusai/html/