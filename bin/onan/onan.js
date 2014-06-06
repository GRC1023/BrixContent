/* **************************************************************************
 * $Workfile:: onan.js                                                      $
 * *********************************************************************/ /**
 *
 * @fileoverview Seeding script for item-level details
 *
 *
 * Onan is used to provide item-level seed data to DAALT via SubPub
 *
 * It is run as a command-line script from the brixContent/bin/onan directory as follows...
 * 
 * $ NODE_ENV=staging node onan.js <dirname>
 * or
 * $ NODE_ENV=prod node onan.js <dirname>
 *
 * It will look for all the files in <dirname> that have either a 
 * .assignment-item.js or .activity.json suffix and process only those 'items'.  
 * It will ignore all other files in the directory.
 * It will recurse down sub-directories.
 * If you give it just a file it will process that or a wildcard file it will
 * process just those but they still have to have the proper suffix.
 *
 * It may tell you it's done before it finishes outputting to the screen; such is
 * the magic of asynchronousness...asynchronicity...something.
 *
 * If you need to add another suffix, add it to the pipe delimited 'fileSuffix' string in the
 * brixConfig/bin/onan/config/default.json file.  This string goes into a regex, just fyi.
 * 
 * You should specify NODE_ENV as either staging or prod, which corresponds to the SubPub
 * environment to which you want to send your message, if you want your messages to go anywhere.
 * If you do NOT specify NODE_ENV the script will do everything except publish, logging to the 'dev'
 * database (so don't worry about sullying staging/prod data), and writing the SubPub message
 * payload to the screen. 
 *
 * EXAMPLES:
 *
 * Post all the ciccerelli items to Production:
 *  NODE_ENV=prod node onan.js ../../Ciccerelli/
 *
 * Post all the ciccerelli items to Production:
 *  NODE_ENV=prod node onan.js ../../Ciccerelli/json/
 *
 * Post all the ciccerelli items to Production:
 *  NODE_ENV=prod node onan.js ../../Ciccerelli/json/*.item.json
 *
 * 
 *
 * 
 *
 * This script sends item-level seed data to DAALT via SubPub based on
 * the schema:
 * https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/avro/Assessment_Item_Type.avsc
 * With samples here:
 * https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/docs/sanvan_10_context_messages
 *
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
var ItemSeeder = require('./lib/itemSeeder').ItemSeeder;

// Give a warning if NODE_ENV isn't set in command-line argument.
if (!process.env.NODE_ENV) {
	console.log("\nWARNING: NODE_ENV is not defined.  Defaulting to dev env.\n");
	console.log("Run script as $ NODE_ENV=staging node onan.js dir");
	console.log("or            $ NODE_ENV=prod node onan.js dir\n");
}


/* @todo

	* add a bunyan logger
	* save these things to a data file or simple database or something so that
		you can tell whether you're doing a 'create' or 'update'.
	* 
*/

// Process command-line args.  You could use commander but that's probably overkill.
var args = process.argv.slice(2);
if (_.isEmpty(args)) {
	console.log("No args.  Exiting");
	process.exit(0);
}

itemSeeder = new ItemSeeder();
itemSeeder.processFiles(args);

// This is just a little function that sends sample files in test/mock off to 
// SubPub for testing.

//console.log("JUST DOING testSubPubMessage");
//itemSeeder.testSubPubMessage();

// Crudely handle errors.
// @todo - make this not terrible
/*var err;
if (err) {
  process.exit(1);
} else {
  process.exit(0);
}*/


