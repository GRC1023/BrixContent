import csv      # imports the csv module
import uuid     # imports the uuid module
import os.path  # imports the os and os.path module
import json     # imports the json module
import datetime # imports the datetime module
import re       # imports the regular expression module
import sys      # imports the sys module
import zipfile  # imports the zipfile module
import traceback

# Script that takes a list of json files on the command line and updates
# them in place.

# A global log file for issues we should report after execution of the script
problemlog = []

def transformSvgContainer092to100(bricConfig, containerConfig):
    """Convert the 0.92 SvgContainer to 1.0.0 SvgContainer"""
    # find the configFixup for the 'node' property, if it doesn't exist then
    # this isn't the config for a 0.92 SvgContainer.
    nodeFixup = [ f for f in (bricConfig["configFixup"] if "configFixup" in bricConfig else [])
                    if f["type"] == "set-property" and f["name"] == "node" ]

    if len(nodeFixup) == 0:
        return False

    # remove configFixup for the 'node' property saving the d3select dynamic value
    # to be used in the new 'draw' hookup action.
    bricConfig["configFixup"].remove(nodeFixup[0])
    if len(bricConfig["configFixup"]) == 0:
        del bricConfig["configFixup"]

    d3select = nodeFixup[0]["value"]

    # add a hookup action to draw the SvgContainer
    drawContainerAction = \
        {
            "description": "Draw the svg container",
            "type": "method-call",
            "instance": { "type": "ref", "domain": "brix", "refId": bricConfig["bricId"] },
            "methodName": "draw",
            "args": [ d3select ]
        }

    hookupActions = containerConfig["hookupActions"]
    hookupActions.insert(0, drawContainerAction)

    return True


def convertPafActivity(pafActivity):
    """Convert the given brix activity config"""
    converted = False
    for containerConfig in pafActivity["body"]["containerConfig"]:
        for bricConfig in containerConfig["brixConfig"]:
            bricType = bricConfig["bricType"]
            if bricType == "SvgContainer":
                print("found SvgContainer " + bricType)
                converted = transformSvgContainer092to100(bricConfig, containerConfig)

    return converted


def convertFile(filename):
    """Convert the brix activity config json in the given file"""
    try:
        with open(filename, "rt", encoding="utf-8") as f:
            print("reading ", filename)
            pafActivity = json.load(f)

        converted = convertPafActivity(pafActivity)

        if converted:
            with open(filename, "w") as ofile:
                print("writing ", filename)
                json.dump(pafActivity, ofile, indent=2, sort_keys=True)
        else:
            print("not converted")

    except Exception as e:
        tb = traceback.format_exc()
        problemlog.append("Problem w/ activity file: " +fileName + " Exception: " + "".join(tb) + "\n")
        print(e)


#                              #
# SCRIPT EXECUTION STARTS HERE #
#                              #

# All arguments on the command line are names of json files to be converted

filenames = sys.argv[1:]

for filename in filenames:
    convertFile(filename)

