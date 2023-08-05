SHELL := /bin/bash

export CPU1=10
export CPU2=11
export LOGICAL_PROCESSOR=${CPU1},${CPU2}
export NAME=yowkingdp${CPU1}${CPU2}
export VOL_NAME=cal45
export CPU_START=2
export CPU_END=11

.PHONY: calclean up down kingup kingdown

calclean:
	rm -rf dist/calibrations/*

up:
	docker compose -f compose.yaml -f compose-yowking.yaml up -d

down:
	docker compose -f compose.yaml -f compose-yowking.yaml down

kingup:
	docker compose -f compose-yowking.yaml up -d

kingdown:
	docker compose -f compose-yowking.yaml down

compose-yowking.yaml:
	node buildKingYaml.mjs