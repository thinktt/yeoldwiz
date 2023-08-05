include .env

.PHONY: run docal getclocks dbuild drun din dodcal clean books2bin \
	rmbooks  reset eep testengine cpbadbooks push dorunbook dorunbinbook \
	dopushdcal calclean

dist: books runbook 
	mkdir dist || true
	docker cp bookbuilder:opt/binbooks/. dist/books/
	node build/personalitiesBuilder.js
	cp runbook dist/
	build/buildKing.sh

books: assets/cm
	docker rm bookbuilder || true
	docker build -t bookbuilder -f build/bookBuilder.docker .
	docker run --name bookbuilder bookbuilder
	touch books

runbook:
	pkg src/runbook.js -o runbook -t node18-alpine-x64


dorunbook: dist
	cd dist; \
	node runbook.js '{"moves": ["d2d4", "c7c5", "c2c4", "c5d4"], "book": "EarlyQueen.bin"}'; \
	echo
	# node runbook.js '{"moves": [], "book": "EarlyQueen.bin"}'

dorunbinbook: dist
	cd dist; \
	./runbook '{"moves": ["d2d4"], "book": "EarlyQueen.bin"}'; \
	echo

rmbooks:
	rm -rf books
	rm -rf dist/books

assets/cm:
	echo ${CM_DIR}
	mkdir assets/cm
	mkdir assets/cm/books
	mkdir assets/cm/personalities
	cp ${CM_DIR}/TheKing350.exe assets/cm/TheKing350.exe
	cp -r ${CM_DIR}/Data/Opening\ Books/* assets/cm/books/
	cp -r ${CM_DIR}/Data/Personalities/* assets/cm/personalities/
	cd assets/cm/personalities; rm -f *#*
	cd assets/cm/personalities; mv "Josh - Age 6.CMP" "Josh6.CMP"
	cd assets/cm/personalities; mv "Josh - Age 7.CMP" "Josh7.CMP"
	cd assets/cm/personalities; mv "Josh - Age 8.CMP" "Josh8.CMP"
	cd assets/cm/personalities; mv "Josh - Age 9.CMP" "Josh9.CMP"
	cd assets/cm/personalities; mv "Josh - Age 12.CMP" "Josh12.CMP"
	rm assets/cm/personalities/Bambi.CMP
	@hash=$$(md5sum assets/cm/personalities/* | awk '{ print $$1 }' | md5sum | head -c 32); \
	echo "personalites folder check"; \
	echo "correct hash: d3ef7f9453b372e094bac18ce262b442"; \
	echo "actual hash : $$hash"

cleandist:
	rm dist/TheKing350noOpk.exe || true
	rm -rf books || true
	rm personalities.json || true
	rm -r assets/cm || true

cleanrunbook:
	rm dist/runbook || true

cleanassets:
	rm -rf assets/cm || true

clean-all:
	make cleanrunbook
	make cleanassets
	make cleandist

# din:
# 	docker run --rm -it -v calibrations:/opt/yeoldwiz/calibrations --name yeoldwiz ace:5000/yeoldwiz /bin/bash

# drun: dbuild
# 	docker run \
# 		-v calibrations:/opt/yeoldwiz/cals/xps \
# 		--env-file envXps.env \
# 		--name yeoldwiz \
# 		--network=yow \
# 		-d ace:5000/yeoldwiz

# dbuild: dist.tar
# 	docker rm yeoldwiz || true
# 	docker image rm ace:5000/yeoldwiz:latest || true
# 	docker build -t ace:5000/yeoldwiz .

# dist.tar: dist
# 	rm ./dist/clockTimes.json || true
# 	cp envAce.env ./dist/.env
# 	# cp envXps.env ./dist/.env
# 	tar -cvhf dist.tar -C dist/ .


# runasprod: dist
# 	make getclocks
# 	cp envAce.env ./dist/.env
# 	cd dist; \
# 	node main.js

# run: dist
# 	make getclocks
# 	cp envXps.env ./dist/.env
# 	bash ./doloop.sh
# 	# cd dist; \
# 	# node main.js

# reset:
# 	rm -rf dist
# 	rm books || true
# 	docker rm bookbuilder || true
# 	docker rmi bookbuilder || true
# 	rm dist.tar || true


# dir:
# 	echo ${CURDIR}


# cpbadbooks:
# 	rm -rf bad || true
# 	mkdir bad
# 	cd assets/cm/books; cp "Bipto.OBK" "CaptureBook.OBK" "DangerDon.OBK" "Depth2.OBK" "Depth4.OBK" "Depth6.OBK" "Drawish.OBK" "EarlyQueen.obk" "FastBook.obk" "FastLose.obk" "Gambit.obk" "KnightMoves.obk" "LowCaptureBook.obk"  "Merlin.obk" "NoBook.obk" "OldBook.obk" "PawnMoves.obk" "SlowBook.OBK" "Strong.OBK" "Trappee.OBK" "Trapper.obk" "Unorthodox.obk" "Weak.obk" ../../../bad/
# 	cp build/normalizeBooks.js bad/
