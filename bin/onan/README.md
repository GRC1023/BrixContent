Onan
====

Onan is used to provide item-level seed data to DAALT via SubPub (once known as Prospero)

It is run as a command-line script as follows...

$ NODE_ENV=staging node onan.js dirname
or
$ NODE_ENV=prod node onan.js dirname

Considerably more information the running of the onan.js script can be found in that
file's comments.


This node application sends item-level seed data to DAALT via SubPub based on
the schema:
https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/avro/Assessment_Item_Type.avsc
With samples here (rely on the schema over the samples if there's a discrepency):
https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/docs/sanvan_10_context_messages

More information about SubPub in general can be found here:
http://pdn.pearson.com/apis/eventing
This is more up-to-date than the stuff on neo, I've found.

If you have questions about SubPub, email Pearson API Support apisupport@pearson.com
They're excellent.

===
This application uses the Pearson SubPub node module to faciliate the sending of 
messages to SubPub:

 https://devops-tools.pearson.com/stash/projects/KRMT/repos/prospero-node/browse

To install, I cloned the stash repo locally and then:
$ npm install ~/Repos/prospero-node/ --save

