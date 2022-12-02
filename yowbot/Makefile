JS_FILES := $(wildcard *.txt)
BINS := $(JS_FILES:%.txt=%)

.PHONY: run docal getclocks dbuild drun din dcal clean books2bin \
	rmbooks  reset eep testengine cpbadbooks push

push:
	docker push ace:5000/yeoldwiz

din:
	docker run --rm -it -v calibrations:/opt/yeoldwiz/calibrations --name yeoldwiz ace:5000/yeoldwiz /bin/bash 

drun: dbuild
	docker run -v calibrations:/opt/yeoldwiz/calibrations --name yeoldwiz ace:5000/yeoldwiz 

dbuild: dist.tar
	docker rm yeoldwiz || true
	docker image rm ace:5000/yeoldwiz:latest || true
	docker build -t ace:5000/yeoldwiz .

dcal: dbuild
	docker rm calibrator || true
	docker run -v calibrations:/opt/yeoldwiz/calibrations --name calibrator ace:5000/yeoldwiz ./node calibrate.js

dist.tar: dist
	rm ./dist/clockTimes.json || true
	cp envAce.env ./dist/.env
	tar -cvhf dist.tar -C dist/ .

dist: books
	mkdir dist
	mkdir dist/calibrations
	mkdir dist/calibrations/logs
	cp -r cals/targets dist/targets
	docker cp bookbuilder:opt/binbooks/. dist/books/
	build/buildKing.sh
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 
	node build/personalitiesBuilder.js
	ln -rs node_modules dist/
	ln src/*.js dist/
	ln .env dist/.env
	ln src/testPositions.json dist/

books:
	docker rm bookbuilder || true
	docker build -t bookbuilder -f build/bookBuilder.docker .
	docker run --name bookbuilder bookbuilder
	touch books
	
run: dist
	make getclocks
	# cp envXps.env ./dist/.env
	cp envAce.env ./dist/.env
	cd dist; \
	node main.js

docal: dist
	cd dist; \
	./node docalibrate.js

getclocks: dist
	cp ./cals/xps/run1/clockTimes.json ./dist/calibrations/


reset: 
	rm -rf dist
	rm books
	docker rm bookbuilder
	docker rmi bookbuilder
	rm dist.tar || true

clean:
	# rm books
	# rm dist.tar
	rm -rf dist
	make dist

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
