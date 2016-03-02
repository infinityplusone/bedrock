#!/bin/sh

# Formatting variables
blackBG='\033[1;40m'
cyan='\033[1;36m'$blackBG
gray='\033[1;30m'$blackBG
green='\033[1;32m'$blackBG
red='\033[0;31m'$blackBG
yellow='\033[1;33m'$blackBG
nc='\033[0m'$blackBG

echo "\n${cyan}Installing npm modules...${nc}"
npm install

echo "\n${cyan}Removing and reinstalling bower components...${nc}"
bower install -f

echo "\n${cyan}Collecting assets & compiling LESS...${nc}"
grunt collect

echo "\n${green}Done!\n${nc}"
