JS_FILES := $(wildcard *.txt)
BINS := $(JS_FILES:%.txt=%)

.PHONY: run docal getclocks dbuild drun din dodcal clean books2bin \
	rmbooks  reset eep testengine cpbadbooks push dorunbook dorunbinbook \
	dopushdcal calclean kingup

calclean:
	rm -rf dist/calibrations/*


kingup: 
	cd ../deploy; make kingup

dopushdcal:
	# scp dist/docalibrate.js yowking:/home/toby/
	# ssh yowking 'sudo docker cp /home/toby/docalibrate.js cal1:/opt/yeoldwiz/'
	# docker cp dist/docalibrate.js cal23:/opt/yeoldwiz/docalibrate.js
	# docker cp dist/docalibrate.js cal45:/opt/yeoldwiz/docalibrate.js
	# docker cp dist/docalibrate.js cal67:/opt/yeoldwiz/docalibrate.js
	# docker cp dist/docalibrate.js cal89:/opt/yeoldwiz/docalibrate.js
	# docker cp dist/docalibrate.js cal1011:/opt/yeoldwiz/docalibrate.js
	docker cp dist/docalibrate.js yowcal:/opt/yeoldwiz/docalibrate.js

dopushengine:
	scp dist/engine.js 


dorunbook: dist
	cd dist; \
	node runbook.js '{"moves": ["d2d4", "c7c5", "c2c4", "c5d4"], "book": "EarlyQueen.bin"}'; \
	echo
	# node runbook.js '{"moves": [], "book": "EarlyQueen.bin"}'

dorunbinbook: dist
	cd dist; \
	./runbook '{"moves": ["d2d4"], "book": "EarlyQueen.bin"}'; \
	echo

docal: dist
	cd dist; \
	node docalibrate.js

export LOGICAL_PROCESSOR=4,5
export CAL_NAME=cal45#${LOGICAL_PROCESSOR}

dodcal:
	# docker volume rm ${CAL_NAME} || true
	docker rm ${CAL_NAME} || true
	docker run --cpus=1 --cpuset-cpus=${LOGICAL_PROCESSOR} \
		--platform linux/386 \
		-v ${CAL_NAME}:/opt/yeoldwiz/calibrations \
		--name ${CAL_NAME} -it zen:5000/yeoldwiz \
		/bin/sh
		# zen:5000/yeoldwiz ./node docalibrate.js

runbook:
	cd dist; \
	pkg runbook.js -o runbook -t node18-alpine-x64  #node18-linux-x64


push:
	docker push zen:5000/yeoldwiz

din:
	docker run --rm -it -v calibrations:/opt/yeoldwiz/calibrations --name yeoldwiz zen:5000/yeoldwiz /bin/bash

drun: dbuild
	docker run \
		-v calibrations:/opt/yeoldwiz/cals/xps \
		--env-file envAce.env \
		--name yowbot \
		--network=yow \
		--rm -it zen:5000/yeoldwiz /bin/ash
		# zen:5000/yeoldwiz

dbuild: dist.tar
	docker rm yeoldwiz || true
	docker image rm zen:5000/yeoldwiz:latest || true
	docker build -t zen:5000/yeoldwiz .

dist.tar: dist
	rm ./dist/clockTimes.json || true
	cp envAce.env ./dist/.env
	# cp envXps.env ./dist/.env
	tar -cvhf dist.tar -C dist/ .

	# docker cp bookbuilder:opt/binbooks/. dist/books/
	# build/buildKing.sh
	# GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go
	# cp assets/enginewrap.exe dist/enginewrap.exe
	# GOOS=linux go build -o dist/enginewrap  src/main.go


dist:
	mkdir dist
	mkdir dist/calibrations
	mkdir dist/calibrations/logs
	cp -r cals/targets dist/targets
	ln src/testPositions.json dist/
	cp ../yowdeps/dist/personalities.json dist/
	ln -rs node_modules dist/
	ln src/*.js dist/
	ln .env dist/.env
	ln ../deploy/buildKingYaml.mjs dist/


books:
	docker rm bookbuilder || true
	docker build -t bookbuilder -f build/bookBuilder.docker .
	docker run --name bookbuilder bookbuilder
	touch books

runasprod: dist
	make getclocks
	cp envAce.env ./dist/.env
	cd dist; \
	node main.js

run: dist
	make getclocks
	cp envXps.env ./dist/.env
	bash ./doloop.sh
	# cd dist; \
	# node main.js

getclocks: dist
	cp ./cals/xps/run1/clockTimes.json ./dist/calibrations/


reset:
	rm -rf dist
	rm books || true
	docker rm bookbuilder || true
	docker rmi bookbuilder || true
	rm dist.tar || true

clean:
	rm -rf dist
	# rm books
	# rm dist.tar
	# make dist

rmbooks:
	rm -rf books
	rm -rf dist/books

dir:
	echo ${CURDIR}

# local creater function only
eep:
	scp -r dist/*.js eep:~/yowbot/
	scp -r dist/testPositions.json eep:~/yowbot/

gettargets:
	mkdir dist/calibrations/targets || true
	scp -r eep:~/yowbot/calibrations/* dist/calibrations/targets

testengine:
	cd dist; \
	node testengine.js

cpbadbooks:
	rm -rf bad || true
	mkdir bad
	cd assets/cm/books; cp "Bipto.OBK" "CaptureBook.OBK" "DangerDon.OBK" "Depth2.OBK" "Depth4.OBK" "Depth6.OBK" "Drawish.OBK" "EarlyQueen.obk" "FastBook.obk" "FastLose.obk" "Gambit.obk" "KnightMoves.obk" "LowCaptureBook.obk"  "Merlin.obk" "NoBook.obk" "OldBook.obk" "PawnMoves.obk" "SlowBook.OBK" "Strong.OBK" "Trappee.OBK" "Trapper.obk" "Unorthodox.obk" "Weak.obk" ../../../bad/
	cp build/normalizeBooks.js bad/

logworkers: 
	docker compose -f compose-yowking.yaml logs --tail=100 -f
	