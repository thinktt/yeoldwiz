JS_FILES := $(wildcard *.txt)
BINS := $(JS_FILES:%.txt=%)

.PHONY: run dbuild drun clean

drun: dbuild
	docker run --name yeoldwiz ace:5000/yeoldwiz 

dbuild: dist.tar
	docker rm yeoldwiz || true
	docker image rm ace:5000/yeoldwiz:latest || true
	docker build -t ace:5000/yeoldwiz .

dist.tar: dist
	tar -cvhf dist.tar -C dist/ .

dist:
	mkdir dist
	ln -sr node_modules dist/
	ln -sr assets/books dist/books
	ln -sr assets/node dist/node
	ln -sr assets/cm/TheKing350noOpk.exe dist/TheKing350noOpk.exe
	ln -sr src/*.js dist/
	ln -sr src/personalities.json dist/personalities.json
	ln -sr .env dist/.env
	GOOS=windows GOARCH=386 go build -o dist/enginewrap.exe  src/main.go 
	GOOS=linux go build -o dist/enginewrap  src/main.go 

run: dist
	cd dist; \
	node main.js

clean:
	rm -rf dist
	rm dist.tar