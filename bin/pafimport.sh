#! /bin/bash

PAFIMPORTER='java -jar brix-tool-pafclient-0.2-jar-with-dependencies.jar'
METHOD=POST
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'
ACTIVITY_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;body="application/vnd.pearson.sanvan.v1.activity""'
ASSIGNMENT_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;body="application/vnd.pearson.paf.v1.assignment+json""'

URL=$CERT_URL

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
    echo ...done importing $jsonfile to PAF
	date
done
