#! /bin/bash
# usage:
# get an activity: ./pafget.sh activity PUT_THE_GUID_HERE
# get an assignment: ./pafget.sh assignment PUT_THE_GUID_HERE

PAFIMPORTER='java -jar brix-tool-pafclient-0.2-jar-with-dependencies.jar'
METHOD=POST
URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
ACTIVITY_HDR='Accept:application/vnd.pearson.sanvan.v1.activity'
ASSIGNMENT_HDR='Accept:application/vnd.pearson.paf.v1.assignment+json'
TYPE=$1
GUID=$2

if [[ $TYPE == 'activity' ]]
then
    HEADER=$ACTIVITY_HDR
    shift
elif [[ $TYPE == 'assignment' ]] 
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
    echo getting $TYPE $GUID from PAF cert...
    $PAFIMPORTER -c -m GET -h "$HEADER" -u $URL/$GUID
    echo ...done getting $TYPE $GUID from PAF cert
	date
done
