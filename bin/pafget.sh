#! /bin/bash
# usage:
# get an activity: pafget.sh <PAF-env> activity <activity-GUID>
# get an assignment: pafget.sh <PAF-env> assignment <assignment-GUID>

function echosyntax() {
    echo ''
    echo 'usage:'
    echo 'get an activity:   pafget.sh <PAF-env> activity <activity-GUID>'
    echo 'get an assignment: pafget.sh <PAF-env> assignment <assignment-GUID>'
    echo ''
    echo -n 'output is saved in the files: '
    echo pafget{,.nohdr}.out{,.json}
    echo 'the output files overwrite any pre-existing files'
}

function getfullpath() {
  DIR=$(echo "${1%/*}")
  (cd "$DIR" && echo "$(pwd -P)")
}

if [ $# -ne 3 ]
then
    echo 'Wrong number of arguments'
    echosyntax
    exit 1
fi

PAFENV=$1
TYPE=$2
GUID=$3

# Get the path to this script file which is where the paf tool jar file lives.
SCRIPT_PATH="`getfullpath $0`"

source $SCRIPT_PATH/setpafenv.sh $PAFENV GET

if [[ $TYPE == 'activity' ]]
then
    HEADER=$ACTIVITY_HDR
elif [[ $TYPE == 'assignment' ]] 
then
    HEADER=$ASSIGNMENT_HDR
else
    echo "The second argument must be either 'activity' or 'assignment'"
    echosyntax
    exit 1
fi

date
echo getting $TYPE $GUID from PAF $UC_TARGET_PAF_ENV \($URL\)...
$PAFTOOL -c -m GET -h "$HEADER" -u $URL/$GUID > pafget.out
status=$?
if [ $status -ne 0 ]
then
    cat pafget.out
else
    $PAFTOOL -c -m GET -u $URL/$GUID > pafget.nohdr.out

    if [ ! -v JQ_AVAILABLE ]
    then
        cat pafget.out
    else
        # pretty print the activity or assignment body into the pafget.out.json file
        sed '1,/^\[OUT\]/ d' pafget.out | jq . > pafget.out.json
        cat pafget.out.json

        # pretty print the activity or assignment envelope into the pafget.nohdr.out.json file
        sed '1,/^\[OUT\]/ d' pafget.nohdr.out | jq . > pafget.nohdr.out.json

        echo ''
        echo -n "output saved in: "
        echo pafget{,.nohdr}.out{,.json}
        echo ''
    fi
fi

echo ...done getting $TYPE $GUID from PAF $UC_TARGET_PAF_ENV \($URL\)
date
