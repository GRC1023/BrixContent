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
var Q = require('q');
var fs = require('fs');
var SubPub = require('eclg-prospero');
var template = require('./resources/assessment_item_type_template.json');

// assessmentType Handlers
var assessmentHandlers = {
    'multiplechoice': require('./lib/types/multiplechoice'),
    'journal': require('./lib/types/journal')
};

// Test variable to do everything except publish to SubPub.  SubPub object
// is written to console.  (if true).  false to publish.
var noPublish = true;

/* @todo

	* add a bunyan logger
	* save these things to a data file or simple database or something so that
		you can tell whether you're doing a 'create' or 'update'.
	* 
*/

/* ************************************************************************** 
 * SubPub Variables
 ****************************************************************************/

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
 ****************************************************************************/
var fileSuffix = '.assignment-item.json';
var itemFiles = [];


/* **************************************************************************
 * assessmentTypesHash                                                 */ /**
 *
 * This is the map of bricType to assessmentType, used to map to 
 * DAALT's "Assessment_Item_Type" message.
 *
 * This should be similar StatsAssessment.presenterTypesHash in the 
 * brixClient code.
 * 
 * Note: At this point we have a straightforward relationship between
 * bricType and assessmentType but that may not always be the case.
 * 
 * @const
 * @type {Object}
 *
 ****************************************************************************/
var assessmentTypesHash = {
    "MultipleChoiceQuestion": "multiplechoice",
    "Journal":                "journal"
};


/* ************************************************************************** 
 * Script
 ****************************************************************************/

// Process command-line args.  You could use commander but that's probably overkill.
var args = process.argv.slice(2);
if (_.isEmpty(args)) {
	console.log("No args.  Exiting");
	process.exit(0);
}
//processFiles(args);

// This is just a little function that sends sample files in test/mock off to 
// SubPub for testing.
testSubPubMessage();

// Crudely handle errors.
// @todo - make this not terrible
/*var err;
if (err) {
  process.exit(1);
} else {
  process.exit(0);
}*/



/* **************************************************************************
 * processFiles                                                        */ /**
 * 
 * Process the files specified in command line args, iterating through dirs if
 * required, then process each file to determine which handler is required,
 * and pass the file to the handler for processing and submission.
 * @param  {Array} args The command line arguments.
 ****************************************************************************/
function processFiles(args) {
	// Iterate over the files/directories specified in args and put appropriate
	// files into the itemFiles array.
	// This is a largely synchronous operation.
	// @todo - change this to async and use promises
	getItemFiles(args);

	// Iterate over the itemFiles array, figure out what kind of assessment type
	// you've got and hand the config off to the appropriate assessment type 
	// handler.
	// @todo - change these callbacks to promises
	_(itemFiles).each(function(filename) {
		fs.readFile(filename, 'utf8', function (err, fileData) {
			if (err) throw err;
			var jsonFileData = JSON.parse(fileData);
			var assessmentInfo = getAssessmentInfo(jsonFileData);

			// If we've found a proper assessment type, let's process it
			if (assessmentInfo.assessmentType) {
				// @todo - figure out if we're a Create or Update
				var action = 'Create';

				// Fire up the assessment handler
				var handler = assessmentHandlers[assessmentInfo.assessmentType].createAssessmentHandler();
				
				// Fill out the base payload
				var payload = processConfig(assessmentInfo.assessmentConfig, action, jsonFileData.metadata.guid);
				// Add the assessment-specific data
				payload = handler.addAssessmentSpecificConfig(payload, assessmentInfo.assessmentConfig);

				//console.log(JSON.stringify(payload));
				publish(payload, action.toLowerCase());
			}

		});
	});


	console.log("I'm done.  I've processed " + itemFiles.length + " files.");
}

/* **************************************************************************
 * getItemFiles                                                        */ /**
 * 
 * Iterate over an array of files and collect the proper assessment-item
 * files (those that match fileSuffix).
 * @param  {Array} files  An array of files
 ****************************************************************************/
function getItemFiles(files) {
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
			getItemFiles(files);
		} else {
			// if the file is a directory, loop over everything in it
			if ( filename.match(regex) ) {
				itemFiles.push(filename);
			}	
		}
	});
}

/* **************************************************************************
 * testSubPubMessage                                                   */ /**
 * 
 * This is just a simple function that sends a hardcoded sample message
 * to SubPub through the publish function.  Whatever timestamp happens to
 * be in the json file is replaced with the current datetime.
 ****************************************************************************/
function testSubPubMessage() {
	console.log("testSubPubMessage Test Run:");
	// send the message through SubPub
	var sampleMaster = require('./test/mock/sampleUpdate4.json');
	var sample1 = _.cloneDeep(sampleMaster);
	var now = new Date().toISOString();

	sample1.Transaction_Datetime = now;
	//console.log(JSON.stringify(sample1));
	var action = 'update';
	publish(sample1, action);
}

/* **************************************************************************
 * publish                                                             */ /**
 * 
 * publish the payload to SubPub
 *
 * @param  {Object} payload [description]
 * @param  {string} action  create, update, or delete (lowercase first letter)
 ****************************************************************************/
function publish(payload, action) {
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
	
	if (noPublish) {
		console.log("NOT PUBLISHING object:");
		console.log(JSON.stringify(obj));
	} else {

		sp.publish(obj, function(error, result) {
			console.log("I have published");
			if (error) console.log(error);
			console.log("RESULT ----");
			console.log(JSON.stringify(result));
			/*if (result.statusCode === 200)
				var messageId = result.data.message.id;*/
		});
	}
}

/* **************************************************************************
 * getAssessmentInfo                                                   */ /**
 *
 * Dig through a json file, determine which assessment type you've got,
 * and grab the brixConfig for it. 
 * , determine which presenter
 * we should use, and grab the brixConfig.
 * @private
 *
 * @param {Object}  jsonFileData
 *     The container config of the original activity.
 *
 * @returns {Object} assessmentInfo
 *     This contains the presenterType and assessmentConfig.
 *
 * @throws {Error} If the presenterType isn't found.
 *
 ****************************************************************************/
function getAssessmentInfo(jsonFileData){
	var assessmentInfo = {};
    _(jsonFileData.body.containerConfig).some(function(cont) {
		return _(cont.brixConfig).some(function(bconfig) {
			if (assessmentTypesHash[bconfig.bricType]) {
				assessmentInfo.assessmentType = assessmentTypesHash[bconfig.bricType];
				assessmentInfo.assessmentConfig = bconfig;
				return true;
			}
			return false;
		});
    });

    if (assessmentInfo.assessmentType === undefined)
    {
        var msg = 'No bricType found that matches assessmentTypesHash in jsonFileData';
        console.log(msg);
        // @todo - pass filename into here too so we can console.log the filename
        // then ask the user if they want to throw an error/abort or keep going
        
        //this.logger_.severe(msg);
        //throw new Error(msg);
    }
    return assessmentInfo;
}

/* **************************************************************************
 * processConfig                                                       */ /**
 * 
 * Fill out the basic template information
 * 
 * @param  {Object} assessmentConfig brixConfig for this assessment
 * @param  {string} action           Create, Update, Delete (uppercase first)
 * @param  {string} guid             Activity GUID (sans URL)
 * @return {Object}                  The payload to be sent to SubPub
 */
function processConfig(assessmentConfig, action, guid) {
	// Start with the template
	var payload = _.cloneDeep(template);

	// Add Transaction_Type_Code
	payload.Transaction_Type_Code = action;

	// Add Transaction_Datetime
	var now = new Date().toISOString();
	payload.Transaction_Datetime = now;

	// Assessment_Items array will only ever have one value as we're only 
	// going to send one item at a time because Transaction_Type_Code
	// is a top-level property.
	// @todo - we could refactor this later so it sends all Creates in 
	// one message and all Updates in another.

	payload.Assessment_Items[0].Assessment_Item_Source_System_Record_Id = guid;

	return payload;
}
