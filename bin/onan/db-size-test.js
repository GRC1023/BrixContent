/* **************************************************************************
 * $Workfile:: db-size-test.js                                              $
 * *********************************************************************/ /**
 *
 * @fileoverview Let's see how big and nasty this db can get.
 * This writes to ./tingodb/dev/ in the sizeTest collection.
 *
 * 
 *
 * Created on       June 16, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/


var _ = require('lodash');
var argv = require('yargs')
	.alias('c', 'count')
	.alias('f', 'find')
    .alias('w', 'write')
    .argv;

process.env.NODE_ENV = argv.env;

var Engine = require('tingodb')();

var dbPath = './tingodb/dev/';

console.log("Working with tingodb: " + dbPath + "\n");
var db = new Engine.Db(dbPath, {});


 // Open a db connection
db.open(function(err,db) {
	db.collection("sizeTest", function (err, sizeTest) {

		if (argv.count) {
			console.log("counting");
			sizeTest.count(function(err, cnt) {
				console.log("Total sizeTest: " + cnt);
			});
		} else if (argv.find) {
			console.log("finding");
			if (_.isString(argv.find)) {
				sizeTest.findOne({guidish:argv.find}, function (err, item) {
					console.log(item);
				});
			} else {
				console.log("Specify a guid with find, like: node db-size-test.js -f 0ac21015-5506-4969-9125-aeb74b98b03d");
			}
		} else if (argv.write) {
			var numberToWrite = _.isNumber(argv.write) ? argv.write : 10;
			console.log('writing ' + numberToWrite);

			var timestamp = new Date().toJSON();

			var i = 0;
			for (i; i < numberToWrite; i++) {
				var guidish = i + '_' + timestamp;
				var payload = { timestamp: timestamp, iterator: i, guidish: guidish };
				sizeTest.insert( payload );
			}

		} else {
			console.log("No action specified.  Use '--count' or '--find [guid]'.");

		}

	});
});

function writeDB(writeArg, sizeTest) {
	
}