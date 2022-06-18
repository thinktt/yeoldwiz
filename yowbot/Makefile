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
	build/buildKing.sh
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 
	node build/personalitiesBuilder.js
	ln -rs node_modules dist/
	ln src/*.js dist/
	ln .env dist/.env

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
	rm -rf dist

rmbooks:
	rm -rf books
	rm -rf dist/books

dir:
	echo ${CURDIR}
