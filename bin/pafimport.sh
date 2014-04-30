#! /bin/bash
# usage:
# get an activity: ./pafget.sh activity PUT_THE_GUID_HERE
# get an assignment: ./pafget.sh assignment PUT_THE_GUID_HERE

function getfullpath() {
  DIR=$(echo "${1%/*}")
  (cd "$DIR" && echo "$(pwd -P)")
}

# jq is required, this tries to see if it's available and aborts if not.
if [ -z `which jq` ]
then
    echo "This script will not run without jq available. Get it from: http://stedolan.github.io/jq/download/"
fi
exit

# get the requested PAF environment which must be one of the supported environments: DEV, CERT, REV (aka staging), PROD
TARGET_PAF_ENV=$1
shift

# Get the path to this script file which is where the paf tool jar file lives.
SCRIPT_PATH="`getfullpath $0`"
echo script path=$SCRIPT_PATH

PAFTOOL="java -jar $SCRIPT_PATH/brix-tool-pafclient-0.3-jar-with-dependencies.jar"

# URLs to the supported environments
DEV_URL='http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities'
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
REV_URL='http://repo.paf.staging.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'

#GET headers (not required, and it's easier not to use them)
#ACTIVITY_HDR='Accept:application/vnd.pearson.sanvan.v1.activity'
#ASSIGNMENT_HDR='Accept:application/vnd.pearson.paf.v1.assignment+json'

#PUT and POST headers
ACTIVITY_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;charset=UTF-8;body="application/vnd.pearson.sanvan.v1.activity""'
ASSIGNMENT_HDR='Content-Type: application/vnd.pearson.paf.v1.envelope+json;charset=UTF-8;body="application/vnd.pearson.paf.v1.assignment+json""'

# get the url for the target PAF environment
eval "URL=\$${TARGET_PAF_ENV^^}_URL"

if [ -z "$URL" ]
then
	echo "The specified PAF environment \"$TARGET_PAF_ENV\" is not supported by this script"
	echo "This script supports the following PAF enviornments:"
	echo "DEV, CERT, REV (aka staging), PROD"
    echo ''
    echo 'usage:'
    echo "\$ $0 <PAF-env> json-files..."
    echo ''
	exit 1
fi

# loop over all of the arguments left on the command line (which should be json files)
for jsonfile
do
	# determine if the file contains an assignment or an activity
	ISASSIGNMENT=`jq '.body | has("assignmentContents")' "$jsonfile"`
	if [ "$ISASSIGNMENT" = "true" ]
	then
		TYPE="assignment"
		HEADER=$ASSIGNMENT_HDR
	else
		TYPE="activity"
		HEADER=$ACTIVITY_HDR
	fi		

	# jq gets the guid from the paf json file w/ a leading and trailing double quote
	# which have to be stripped off.
	GUID=`jq .metadata.guid "$jsonfile"`
	GUID="${GUID%\"}"
	GUID="${GUID#\"}"

	# if we didn't get a guid from the file, abort!
	if [ -z "$GUID" -o "$GUID" = "null" ]
	then
		echo "FAILED: could not find GUID in ${jsonfile}...aborting!"
		exit 1
	fi

	date
    echo checking PAF $TARGET_PAF_ENV for the existence of an $TYPE with guid=$GUID ...
	$PAFTOOL -c -m GET -u $URL/$GUID
	status=$?
	if [ $status -ne 0 ]
	then
		echo "...an $TYPE with guid=$GUID was not found in PAF $TARGET_PAF_ENV (status=$status)"

		date
		echo adding new $TYPE in $jsonfile to PAF ${TARGET_PAF_ENV}...
		$PAFTOOL -c -m POST -u $URL -h "$HEADER" -d "$jsonfile"
		status=$?
		if [ $status -ne 0 ]
		then
			echo "...FAILED: adding new $TYPE from $jsonfile to PAF $TARGET_PAF_ENV (status=$status)"
		else
			echo "...SUCCEEDED: adding new $TYPE from $jsonfile to PAF $TARGET_PAF_ENV"
		fi
	else
		echo "...an $TYPE with guid=$GUID was found in PAF $TARGET_PAF_ENV"

		date
		echo updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from ${jsonfile}...
		$PAFTOOL -c -m PUT -u $URL/$GUID -h "$HEADER" -d "$jsonfile"
		status=$?
		if [ $status -ne 0 ]
		then
			echo "...FAILED: updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from $jsonfile (status=$status)"
		else
			echo "...SUCCEEDED: updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from $jsonfile"
		fi
	fi
done

date
