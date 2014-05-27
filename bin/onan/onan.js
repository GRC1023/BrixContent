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


