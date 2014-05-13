BrixContent
===========

## Repository Contents ##

* content for brix conversion
* scripts to convert the html content to json for import into PAF
* tools to help importing to PAF as well as updating and getting activities and assignments from PAF.

## The Process ##

- Editorial creates a Spreadsheet w/ a page for Multiple Choice Questions (MCQ) and a page for the Other brix.
* The spreadsheet references HTML file names which contain the content for those brix.
* The set of HTML file is sent to Leslie to be imported into this (BrixContent) git repository.
    - they are kept in a subdirectory named after the book they belong to (Neff, Marin, etc).
* The spreadsheet is exported to a csv file and copied into the appropriate subdirectory w/ a somewhat simpler name (e.g. Neff/MC/NeffContent-MC.csv)
* The csv is processed to create .json files for the assignment and activities
    - Processing the csv file is done by running the following command in the subdirectory containing the html files referenced by the csv file:
    
         `python3 ../../bin/mcq_export2paf.py <csv-file-name> [template-file-name] | tee mcq_export2paf.log`
     
    - The activity json files match '*.activity.json' and the assignment files match '*.assignment.json'
* Import the files into PAF.
    - Run the pafimport script passing it the name of the PAF environment to import to and the list of json files to import. The supported PAF environment names are:
        - DEV
        - CERT
        - REV (aka staging)
        - PRE_PROD
        - PROD

Here is an example of running the `pafimport.sh` script once for the activities and then again for the assignments:

    ~/brixcontent/Neff/MC/json $ ../../../bin/pafimport.sh dev *.activity.json | tee pafimport_MC_DEV.log
    ~/brixcontent/Neff/MC/json $ ../../../bin/pafimport.sh dev *.assignment.json | tee -a pafimport_MC_DEV.log

It is worthwhile creating the log file (`pafimport_MC_DEV.log` in the example above) because if you run `pafimport.sh` over a lot of files at once you should have a record you can refer back to in case some file imports had errors. The example commands above create the log file w/ the first command and append to it with the second.
        
## Prerequisites ##

The `pafimport.sh` script in the bin directory requires that the [jq][] tool be installed in order to work. See the [jq download page][jq-download].

### Mac ###
On a mac you will need to have [Homebrew][] installed in order to install the jq utility.


[jq]: <http://stedolan.github.io/jq/> "JSON parser"
[jq-download]: <http://stedolan.github.io/jq/download/>
[Homebrew]: <http://brew.sh/> "Homebrew - The missing package manager for OS X"