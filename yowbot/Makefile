JS_FILES := $(wildcard *.txt)
BINS := $(JS_FILES:%.txt=%)

.PHONY: run dbuild drun clean books2bin rmbooks  reset eep testengine cpbadbooks getcalibrations

drun: dbuild
	docker run --name yeoldwiz ace:5000/yeoldwiz 

dbuild: dist.tar
	docker rm yeoldwiz || true
	docker image rm ace:5000/yeoldwiz:latest || true
	docker build -t ace:5000/yeoldwiz .

dist.tar: dist
	tar -cvhf dist.tar -C dist/ .

dist: books
	mkdir dist
	docker cp bookbuilder:opt/binbooks/. dist/books/
	cp assets/node dist/node
	build/buildKing.sh
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 
	node build/personalitiesBuilder.js
	ln -rs node_modules dist/
	ln src/*.js dist/
	ln .env dist/.env
	ln research/testengine.js dist/
	ln research/testPositions.json dist/
	ln research/testgames.json dist/
	mkdir dist/calibrations

books:
	docker rm bookbuilder || true
	docker build -t bookbuilder -f build/bookBuilder.docker .
	docker run --name bookbuilder bookbuilder
	touch books
	
run: dist
	cd dist; \
	node main.js

reset: 
	rm -rf dist
	rm books
	docker rm bookbuilder
	docker rmi bookbuilder
	rm dist.tar || true

clean:
	rm books
	rm -rf dist
	rm dist.tar

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
	mkdir dist/calibrations/targets
	scp -r eep:~/yowbot/calibrations/* dist/calibrations/targets

testengine: 
	cd dist; \
	node testengine.js

cpbadbooks:
	rm -rf bad || true
	mkdir bad
	cd assets/cm/books; cp "Bipto.OBK" "CaptureBook.OBK" "DangerDon.OBK" "Depth2.OBK" "Depth4.OBK" "Depth6.OBK" "Drawish.OBK" "EarlyQueen.obk" "FastBook.obk" "FastLose.obk" "Gambit.obk" "KnightMoves.obk" "LowCaptureBook.obk"  "Merlin.obk" "NoBook.obk" "OldBook.obk" "PawnMoves.obk" "SlowBook.OBK" "Strong.OBK" "Trappee.OBK" "Trapper.obk" "Unorthodox.obk" "Weak.obk" ../../../bad/
	cp build/normalizeBooks.js bad/
