# Onan #

Onan is used to provide item-level seed data to DAALT via SubPub (once known as Prospero)

There are only 2 valid target SubPub environments: `staging` and `prod`.

It is run as a command-line script as follows:

```
$ NODE_ENV=staging node onan.js <dirname>
```
or
```
$ NODE_ENV=prod node onan.js <dirname>
```

It will look for all the files in `<dirname>` that have either an 
`.assignment-item.json` or `.activity.json` suffix and process only those _items_.
It will ignore all other files in the directory.
It will recurse down sub-directories.


Considerably more information about running the `onan.js` script can be found in that
file's comments.

This node application sends item-level seed data to `DAALT` via `SubPub` based on
the [Assessment_Item_Type schema][subpub-item-schema],
with [samples here][subpub-item-samples] (rely on the schema over the samples if there's a discrepency).

More information about SubPub in general can be found here:
<http://pdn.pearson.com/apis/eventing>.
This is more up-to-date than the stuff on neo, I've found.

If you have questions about SubPub, email Pearson API Support (<apisupport@pearson.com>).
They're excellent.

---
This application uses the [Pearson SubPub node module][subpub-node-module] to faciliate the sending of 
messages to SubPub.

To install, I cloned the stash repo locally and then:
```
$ npm install ~/Repos/prospero-node/ --save
```


[subpub-item-schema]: <ttps://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/avro/Assessment_Item_Type.avsc> "SubPub Assessment_Item_Type message schema"
[subpub-item-samples]: <https://devops-tools.pearson.com/stash/projects/DAALT_REF/repos/schemas/browse/subpub/docs/sanvan_10_context_messages> "SubPub Assessment_Item_Type sample messages"
[subpub-general-info]: <http://pdn.pearson.com/apis/eventing> "SubPub general information"
[subpub-node-module]: <https://devops-tools.pearson.com/stash/projects/KRMT/repos/prospero-node/browse> "subpub node module"