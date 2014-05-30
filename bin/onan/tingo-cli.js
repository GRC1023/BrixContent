/* **************************************************************************
 * $Workfile:: tingo-cli.js                                                 $
 * *********************************************************************/ /**
 *
 * @fileoverview A cheap cli for the tingodb
 *
 * 
 *
 * Created on       May 30, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/


var _ = require('lodash');
var argv = require('yargs')
	.usage("Specify an environment if you'd like and an action of\n 'count'.\nUsage: $0")
    .default('e', 'dev')
    .alias('e', 'env')
    .alias('c', 'count')
    .alias('f', 'find')
    .argv;

process.env.NODE_ENV = argv.env;
var config = require('config');

var Engine = require('tingodb')();

console.log("Working with tingodb: " + config.dbPath + "\n");
var db = new Engine.Db(config.dbPath, {});


 // Open a db connection
db.open(function(err,db) {
	db.collection("items", function (err, items) {

		if (argv.count) {
			items.count(function(err, cnt) {
				console.log("Total items: " + cnt);
			});
		} else if (argv.find) {
			if (_.isString(argv.find)) {
				items.findOne({activityGuid:argv.find}, function (err, item) {
					console.log(item);
				});
			} else {
				console.log("Specify a guid with find, like: node tingo-cli.js -f 0ac21015-5506-4969-9125-aeb74b98b03d");
			}
		} else {
			console.log("No action specified.  Use 'count' or 'find [guid]'.");

		}

	});
});