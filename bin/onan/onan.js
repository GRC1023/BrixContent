/* **************************************************************************
 * $Workfile:: onan.js                                                      $
 * *********************************************************************/ /**
 *
 * @fileoverview Seeding script for item-level details
 *
 * This script sends item-level seed data to DAALT via SubPub based on
 * the schema:
 * https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/avro/Assessment_Item_Type.avsc
 * With samples here:
 * https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/docs/sanvan_10_context_messages
 *
 * You should be able to pass it a file or a directory, which it will iterate over.  It'll probably
 * even dig into child directories.
 * It's looking for files with a '.assignment-item.json' suffix (see the fileSuffix var below)
 *
 * Eventually this script functionality can be turned into a service or
 * somesuch.
 * 
 *
 * Created on       May 15, 2014
 * @author          Seann Ives
 *
 * @copyright (c) 2014 Pearson, All rights reserved.
 *
 * **************************************************************************/
var _ = require('lodash');
var fs = require('fs');
var SubPub = require('eclg-prospero');

/* @todo

	* add a bunyan logger
	* save these things to a data file or simple database or something so that
		you can tell whether you're doing a 'create' or 'update'.
	* 
*/

/* ************************************************************************** 
 * SubPub Variables
 */

// Issue a GET to these to get the status
// http://prospero.qaprod.ecollege.com/v1/status // old SubPub cluster in staging
// http://stg-subpub.prsn.us/v1/status // new SubPub cluster in staging
var subPubRootUrl = 'http://stg-subpub.prsn.us';
var subPubConfig = {
	rootUrl: subPubRootUrl,
	principal: "BRIX",
	sharedKey: "1Rd9ikrP3rw8w39l",
	prosperoDefaults: {
		//tags: { UserID: "joe" },  // name value pairs --> TAGS
		tags: {},
		client: 'DaaltClient',               // CLIENT
		clientString: 'DaaltClient',         // CLIENT-STRING
		system: 'brix',               // SYSTEM
		subSystem: 'brix',            // SUB-SYSTEM
		realm: 'pearson.brix.*',                // REALM
		payloadContentType: 'application/json',   // PAYLOAD-CONTENT-TYPE
	}
};
var sp = new SubPub(subPubConfig);

/* ************************************************************************** 
 * Other Variables
 */
var fileSuffix = '.assignment-item.json';
var itemFiles = [];


/* ************************************************************************** 
 * Script
 */

// Process command-line args.  You could use commander but that's probably overkill.
var args = process.argv.slice(2);
if (_.isEmpty(args)) {
	console.log("No args.  Exiting");
	process.exit(0);
}

// Iterate over the files/directories specified in args and put appropriate
// files into the itemFiles array
iterateOverFiles(args);



// extract the assessment type and the config

// hand that off to a thing that knows how to construct the daalt message for that assessment type

// send the message through SubPub
var sampleMaster = require('./test/mock/sampleCreate2.json');
var sample1 = _.cloneDeep(sampleMaster);
var now = new Date().toISOString();

sample1.Transaction_Datetime = now;
//console.log(JSON.stringify(sample1));
var action = 'create';
//publish(sample1, action);

// wait for a reply
// log it to the file (see @todo above) 


// Crudely handle errors.
// @todo - make this not terrible
/*var err;
if (err) {
  process.exit(1);
} else {
  process.exit(0);
}*/



/* ************************************************************************** 
 * functions
 */

/**
 * Iterate over an array of files
 * @param  {Array} files  An array of files
 */
function iterateOverFiles(files) {
	// loop over files
	_(files).each(function(filename) {
		var regex = new RegExp(".*" + fileSuffix + "$");
		var stats = fs.statSync(filename);

		// If the file is a directory, grab the path, prepend that to all
		// the files therein, and iterate over those
		if (stats.isDirectory()) {
			var path = fs.realpathSync(filename);
			var files = fs.readdirSync(filename);
			_(files).each(function(part, index, files) {
				files[index] = path + "/" + files[index];
			});
			iterateOverFiles(files);
		} else {
			// if the file is a directory, loop over everything in it
			if ( filename.match(regex) ) {
				itemFiles.push(filename);
			}	
		}
	});
}

/**
 * publish
 * 
 */
function publish(payload, action) {
	console.log("I am going to publish");
	var system = 'brix';
	var domainModel = 'assessment-item-type';
	// action is either what you pass in or 'create'
	// @todo make sure action is create, update, or delete
	action = action ? action : 'create';

	var messageType = system + '.' + domainModel + '.' + action;

	var obj = {
		//tags: { UserID: "joe" },  
		messageType: messageType,
		payloadContentType: 'application/json', // @todo - unnecessary thanks to defaults?
		payload: payload
	};

	

	// SubPub message codes are defined here:
	// http://code.pearson.com/pearson-learningstudio/events/event-concepts/event-integration-guide-producing-messages-rest_x
	Xsp.publish(obj, function(error, result) {
		console.log("I have published");
		if (error) console.log(error);
		console.log("RESULT ----");
		console.log(JSON.stringify(result));
		/*if (result.statusCode === 200)
			var messageId = result.data.message.id;*/
	});
}