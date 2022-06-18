JS_FILES := $(wildcard *.txt)
BINS := $(JS_FILES:%.txt=%)

.PHONY: run dbuild drun clean books2bin rmbooks buildbooks reset fixking

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
	make fixking
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 
	ln -sr src/personalities.json dist/personalities.json
	ln -sr node_modules dist/
	ln -sr src/*.js dist/
	ln -sr .env dist/.env

books:
	docker rm bookbuilder
	docker build -t bookbuilder -f build/bookBuilder.docker .
	docker run --name bookbuilder bookbuilder
	touch books
	

run:
	cd dist; \
	node main.js

reset: 
	rm -rf dist
	rm -rf books
	# docker rm bookbuilder
	# docker rmi bookbuilder

# This is a regex sed hack to replace the two bytes of TheKing350.exe we need 
# to replace. For reference those bytes are:
# Hex line CE80 replace 0F 85 with 90 E9
regExFind := /\x24\x10\x0f\x85\x9f\x00\x00\x00
regExReplace := /\x24\x10\x90\xe9\x9f\x00\x00\x00/
fixking:
	rm dist/TheKing350.exe || true
	cp assets/cm/TheKing350.exe dist/TheKing350.exe
	sed -i -e "s$(regExFind)$(regExReplace)" dist/TheKing350.exe
	mv dist/TheKing350.exe dist/TheKing350noOpk.exe


clean:
	rm -rf dist


rmbooks:
	rm -rf books
	rm -rf dist/books

dir:
	echo ${CURDIR}
