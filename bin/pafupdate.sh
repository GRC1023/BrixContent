#! /bin/bash

# todo: This script would be greatly enhanced if it could read the guid from the jsonfile -mjl

# Call this as:
# pafupdate {activity | assignment} guid jsonfile

PAFTOOL='java -jar brix-tool-pafclient-0.3-jar-with-dependencies.jar'
METHOD=PUT
DEV_URL='http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities'
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
REV_URL='http://repo.paf.staging.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'
ACTIVITY_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;charset=UTF-8;body="application/vnd.pearson.sanvan.v1.activity""'
ASSIGNMENT_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;;charset=UTF-8;body="application/vnd.pearson.paf.v1.assignment+json""'

URL=$REV_URL

PAF_RECTYPE=$1
REC_GUID=$2
JSONFILE=$3

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

echo updating $PAF_RECTYPE $REC_GUID from $JSONFILE to PAF...
$PAFTOOL -c -m $METHOD -u $URL/$REC_GUID -h "$HEADER" -d "$JSONFILE"
status=$?
if [ $status -ne 0 ]
then
    echo "...updating $PAF_RECTYPE $REC_GUID from $JSONFILE to PAF returned error status $1"
else
    echo ...updating $PAF_RECTYPE $REC_GUID from $JSONFILE to PAF was successful
fi

date
