all: build

SRC=$(shell find src)
CITY=richmond

test:
	npm run test

bootstrap:
	npm install

devserver:
	npm run dev

server:
	@echo "warn: no server component; just statically hosted via apache"

build: $(SRC)
	gulp --city $(CITY)

clean:
	rm -rf dist

clobber: clean
	rm -rf node_modules
