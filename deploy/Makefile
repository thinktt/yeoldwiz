SHELL := /bin/bash

# export CPU1=10
# export CPU2=11
# export LOGICAL_PROCESSOR=${CPU1},${CPU2}
# export NAME=yowking${CPU1}${CPU2}
# export VOL_NAME=cal45
# export CPU_START=2
# export CPU_END=11

.PHONY: calclean up down kingup kingdown botdown resources

calex:
	docker exec -it yowcal /bin/ash

botdown:
	docker compose down yowbot

calclean:
	rm -rf dist/calibrations/*

resources:
	docker network create yow
	docker volume create cal45

up:
	docker compose -f compose.yaml -f compose-yowking.yaml up -d

down:
	docker compose -f compose.yaml -f compose-yowking.yaml down

kingup:
	docker compose -f compose-yowking.yaml up -d

kingdown:
	docker compose -f compose-yowking.yaml down

# this command requires you add CPU_START=<num> CPU_END=<num> at th end
compose-yowking.yaml:
	node buildKingYaml.mjs
	# docker exec -e CPU_START=$(CPU_START) -e CPU_END=$(CPU_END) yowcal node buildKingYaml.mjs
	# docker cp yowcal:/opt/yeoldwiz/compose-yowking.yaml .
	# docker cp yowcal:/opt/yeoldwiz/compose-yowking.yaml .

