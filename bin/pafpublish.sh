#! /bin/bash
#
# This script will import the assignment or activity JSON in a list of files into
# a specified PAF environment. It will add the assignment or activity if it is
# not already there, and it will update the assignment or activity if it is already
# there.
#
# usage:
#     pafpublish.sh <PAF-env> json-files...

function echosyntax() {
    echo ''
    echo 'usage:'
    echo "\$ pafpublish.sh <PAF-env> json-files..."
    echo ''
}

function getfullpath() {
  DIR=$(echo "${1%/*}")
  (cd "$DIR" && echo "$(pwd -P)")
}

# Get the path to this script file which is where the paf tool jar file lives.
SCRIPT_PATH="`getfullpath $0`"

source $SCRIPT_PATH/setpafenv.sh $1 PUT

# jq is required, this tries to see if it's available and aborts if not.
if [ ! -v JQ_AVAILABLE ]
then
    echo "This script will not run without jq available. Get it from: http://stedolan.github.io/jq/download/"
	exit 1
fi

# shift the paf env off the command parameters so only the json files are left
shift

LOGFILE=pafpublish.out
rm -f $LOGFILE

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
		echo "FAILED: could not find GUID in ${jsonfile}...aborting!" | tee -a $LOGFILE
		exit 1
	fi

	date | tee -a $LOGFILE
    echo "checking PAF $TARGET_PAF_ENV for the existence of an $TYPE with guid=$GUID ..." | tee -a $LOGFILE
	$PAFTOOL -c -m GET -u $URL/$GUID >> $LOGFILE
	status=$?
	if [ $status -ne 0 ]
	then
		echo "...an $TYPE with guid=$GUID was not found in PAF $TARGET_PAF_ENV (status=$status)" | tee -a $LOGFILE

		date | tee -a $LOGFILE
		echo adding new $TYPE in $jsonfile to PAF ${TARGET_PAF_ENV}... | tee -a $LOGFILE
		$PAFTOOL -c -m POST -u $URL -h "$HEADER" -d "$jsonfile" >> $LOGFILE
		status=$?
		if [ $status -ne 0 ]
		then
			echo "...FAILED: adding new $TYPE from $jsonfile to PAF $TARGET_PAF_ENV (status=$status)" | tee -a $LOGFILE
		else
			echo "...SUCCEEDED: adding new $TYPE from $jsonfile to PAF $TARGET_PAF_ENV" | tee -a $LOGFILE
		fi
	else
		echo "...an $TYPE with guid=$GUID was found in PAF $TARGET_PAF_ENV" | tee -a $LOGFILE

		date | tee -a $LOGFILE
		echo updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from ${jsonfile}... | tee -a $LOGFILE
		$PAFTOOL -c -m PUT -u $URL/$GUID -h "$HEADER" -d "$jsonfile" >> $LOGFILE
		status=$?
		if [ $status -ne 0 ]
		then
			echo "...FAILED: updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from $jsonfile (status=$status)" | tee -a $LOGFILE
		else
			echo "...SUCCEEDED: updating existing $TYPE with guid=$GUID in PAF $TARGET_PAF_ENV from $jsonfile" | tee -a $LOGFILE
		fi
	fi
	echo '' | tee -a $LOGFILE
done

date | tee -a $LOGFILE
