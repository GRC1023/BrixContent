brixContent
=========

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
    - The pafimport.sh script should be edited to confirm that it is configured for the desired target PAF environment.
    - run the pafimport script for the activity and assignment json files that were just created by processing the csv file.

        brixcontent/bin $ ./pafimport.sh activity ../Neff/MC/json/*.activity.json | tee -a pafimport_MC_PROD.log
        brixcontent/bin $ ./pafimport.sh assignment ../Neff/MC/json/*.assignment.json | tee -a pafimport_MC_PROD.log
        

