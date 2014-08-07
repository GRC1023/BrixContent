#! /bin/bash
#
# This script is a supporting script intended to be sourced by other scripts.
#
# It requires the following variables be set:
# - SCRIPT_PATH : The path to this script file (which is expected to be the path to the PAFTOOL)
#
# It sets the following variables:
# - URL : The URL of the speicifed PAF environment
# - PAFTOOL : The command to execute the PAFTOOL (using the existing SCRIPT_PATH variable as the location of the jar)
# - ACTIVITY_HDR : The appropriate activity header for the GET or PUT operation
# - ASSIGNMENT_HDR : The appropriate assignment header for the GET or PUT operation
# - TARGET_PAF_ENV : The PAF environment passed on command line
# - UC_TARGET_PAF_ENV : The PAF environment all uppercase
# - JQ_AVAILABLE : Is set only if jq is available, otherwise it is not set.
# 
# usage:
#     source setpafenv.sh <PAF-env> [GET | PUT]

# get the requested PAF environment which must be one of the supported environments: DEV, CERT, REV (aka staging), PRE_PROD, PROD
TARGET_PAF_ENV=$1

# uppercase the user specified PAF environment name
# This works w/ bash ver >= 4.0.0, but the Mac has version 3.2.48 
#UC_TARGET_PAF_ENV=${TARGET_PAF_ENV^^}
# therefore this is the work-around
UC_TARGET_PAF_ENV=$(tr '[:lower:]' '[:upper:]' <<< "$TARGET_PAF_ENV")

PAFTOOL="java -jar $SCRIPT_PATH/brix-tool-pafclient-0.3-jar-with-dependencies.jar"

# URLs to the supported environments
DEV_URL='http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities'
CERT_URL='http://repo.paf.cert.pearsoncmg.com/paf-repo/resources/activities'
REV_URL='http://repo.paf.staging.pearsoncmg.com/paf-repo/resources/activities'
PRE_PROD_URL='http://repo.paf.ppe.pearsoncmg.com/paf-repo/resources/activities'
PROD_URL='http://repo.paf.pearsoncmg.com/paf-repo/resources/activities'

# GET headers
ACTIVITY_HDR_GET='Accept:application/vnd.pearson.sanvan.v1.activity'
ASSIGNMENT_HDR_GET='Accept:application/vnd.pearson.paf.v1.assignment+json'

# PUT and POST headers
ACTIVITY_HDR_PUT='Content-Type: application/vnd.pearson.paf.v1.envelope+json;charset=UTF-8;body="application/vnd.pearson.sanvan.v1.activity""'
ASSIGNMENT_HDR_PUT='Content-Type: application/vnd.pearson.paf.v1.envelope+json;charset=UTF-8;body="application/vnd.pearson.paf.v1.assignment+json""'

# requested headers
eval "ACTIVITY_HDR=\$ACTIVITY_HDR_$2"
eval "ASSIGNMENT_HDR=\$ASSIGNMENT_HDR_$2"

# get the url for the target PAF environment
eval "URL=\$${UC_TARGET_PAF_ENV}_URL"

if [ -z "$URL" ]
then
	echo "The specified PAF environment \"$TARGET_PAF_ENV\" is not supported by this script"
	echo "This script supports the following PAF enviornments:"
	echo "DEV, CERT, REV (aka staging), PRE_PROD, PROD"
    echo ''
	exit 1
fi

# jq is required, this tries to see if it's available and aborts if not.
JQ_AVAILABLE=true
if [ -z `which jq` ]
then
	unset JQ_AVAILABLE
fi

