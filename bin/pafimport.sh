#! /bin/bash

PAFIMPORTER='java -jar brix-tool-pafclient-0.3-jar-with-dependencies.jar'
METHOD=POST
DEV_URL='http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities'
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'
REV_URL='http://repo.paf.staging.pearsoncmg.com/paf-repo/resources/activities'
ACTIVITY_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;body="application/vnd.pearson.sanvan.v1.activity""'
ASSIGNMENT_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;body="application/vnd.pearson.paf.v1.assignment+json""'

URL=$REV_URL

if [[ $1 == 'activity' ]]
then
    HEADER=$ACTIVITY_HDR
    shift
elif [[ $1 == 'assignment' ]] 
then
    HEADER=$ASSIGNMENT_HDR
    shift
else
    echo "The first argument must be either 'activity' or 'assignment'"
    exit 1
fi

date
for jsonfile
do
    echo importing $jsonfile to PAF...
    $PAFIMPORTER -c -m $METHOD -u $URL -h "$HEADER" -d "$jsonfile"
    status=$?
    if [ $status -ne 0 ]
    then
        echo "...importing $jsonfile to PAF returned error status $1"
    else
        echo ...importing $jsonfile to PAF was successful
    fi
	date
done
