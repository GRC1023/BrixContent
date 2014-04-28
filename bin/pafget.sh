#! /bin/bash
# usage:
# get an activity: ./pafget.sh activity PUT_THE_GUID_HERE
# get an assignment: ./pafget.sh assignment PUT_THE_GUID_HERE

PAFIMPORTER='java -jar brix-tool-pafclient-0.3-jar-with-dependencies.jar'
METHOD=GET
DEV_URL='http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities'
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
REV_URL='http://repo.paf.staging.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'
ACTIVITY_HDR='Accept:application/vnd.pearson.sanvan.v1.activity'
ASSIGNMENT_HDR='Accept:application/vnd.pearson.paf.v1.assignment+json'
TYPE=$1
GUID=$2

URL=$REV_URL

if [[ $TYPE == 'activity' ]]
then
    HEADER=$ACTIVITY_HDR
elif [[ $TYPE == 'assignment' ]] 
then
    HEADER=$ASSIGNMENT_HDR
else
    echo "The first argument must be either 'activity' or 'assignment'"
    echo ''
    echo 'usage:'
    echo 'get an activity:   ./pafget.sh activity PUT_THE_GUID_HERE'
    echo 'get an assignment: ./pafget.sh assignment PUT_THE_GUID_HERE'
    echo ''
    exit 1
fi

date
echo getting $TYPE $GUID from PAF $URL...
$PAFIMPORTER -c -m $METHOD -h "$HEADER" -u $URL/$GUID
echo ...done getting $TYPE $GUID from PAF $URL
date
