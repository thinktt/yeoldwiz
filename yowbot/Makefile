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
	node build/personalitiesBuilder.js
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 
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
	rm books
	# docker rm bookbuilder
	# docker rmi bookbuilder

clean:
	rm -rf dist

rmbooks:
	rm -rf books
	rm -rf dist/books

dir:
	echo ${CURDIR}
