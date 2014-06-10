clean:
	npm cache clean && rm -rf node_modules/* coverage lib-test

install:
	make clean && npm install

update:
	make clean && rm -rf npm-shrinkwrap.json && npm install . && npm shrinkwrap

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter tap --timeout 3000 test/unit
	 
test-spec:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter spec --timeout 3000 test/unit

# "Watch" mode runs your tests each time it seems a file change under the base directory.
# The 'tap' reporter seems to play nicest with this and also shows the most complete error messages.
test-w:
	@NODE_ENV=test ./node_modules/.bin/mocha --watch --recursive --reporter tap --timeout 3000 test/unit
	 
test-xunit:
	@NODE_ENV=test ./node_modules/.bin/mocha --recursive --reporter xunit --timeout 3000 test/unit > test-reports.log.xml
	 
test-xunit-build:
	@HOST=build ./node_modules/.bin/mocha --recursive --reporter xunit --timeout 3000 test/unit > test-reports.log.xml

.PHONY: test