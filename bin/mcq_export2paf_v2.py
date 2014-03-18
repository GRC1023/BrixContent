import csv      # imports the csv module
import uuid     # imports the uuid module
import os.path  # imports the os and os.path module
import json     # imports the json module
import datetime # imports the datetime module
import re       # imports the regular expression module
import sys      # imports the sys module
import zipfile  # imports the zipfile module
import traceback

#
# Still to do:
# * Invoke the Upload to PAF script (or write a shell script to do it)
#

# A global log file for issues we should report after execution of the script
problemlog = []

def fixupCommentsAndTrailingCommas(lines):
    """Removed trailing comma from lines immediately before a line that starts with a ] or }."""
    commentLine = re.compile(r"^\s*//")
    endOfObjOrArray = re.compile(r"^\s*[}\]]")
    trailingComma = re.compile(r"^(.*),\s*$")

    lineno = 1
    numlines = len(lines)
    while lineno < numlines:
        if commentLine.match(lines[lineno]):
            #print("deleting comment line: " + lines[lineno])
            del lines[lineno]
            numlines -= 1
            continue

        if endOfObjOrArray.match(lines[lineno]):
            m = trailingComma.match(lines[lineno - 1])
            if m:
                #print("replacing ", lines[lineno - 1], "with ", m.group(1))
                lines[lineno - 1] = m.group(1)
        lineno += 1

def replacePlaceholdersInFile(inputFn, outputFn, placeholderValues):
    """
    Write the input file to the output file replacing any placeholders in the
    input file with the values in the given dictionary. Placeholders are
    identified by a prefix of '<*PLACEHOLDER-' and a suffix of '*>'. The
    string in between the prefix and suffix is the key used to retrieve the
    substitution value.

    :inputFn: The input filename
    :outputFn: The output filename
    :placeholderValues: A dictionary of replacement values for placeholders
    :returns: @todo

    """
    placeholder = re.compile(r"<\*PLACEHOLDER-(.*?)\*>")

    with open(inputFn, 'rt') as fi, open(outputFn, 'wt') as fo:
        for line in fi:
            newLine =placeholder.sub(lambda m: placeholderValues[m.group(1)], line)
            fo.write(newLine)

class PAFActivity(object):
    """
    A PAF activity
    """

    # config fixup that needs to be added to multiple choice brix because the 0.9 template
    # given to the production editors didn't have it defined.
    maxAttemptsFixup = \
        {
            "type": "set-property",
            "name": "maxAttempts",
            "value": { "type": "ref", "domain": "info", "refId": "maxAttempts" }
        }

    def __init__(self, info):
        """Initializes the PAFActivity"""
        self.uuid = info.pafActivityGuid or uuid.uuid4()
        # Update the info record just to make sure it has the uuid
        info.pafActivityGuid = self.uuid

        self.fileName = info.fileName
        self.quizName = info.quizName
        self.subject = info.subject
        b, t = os.path.splitext(self.fileName)
        self.jsonFilename = b + ".activity.json"
        self.pxeFilename = b + ".pxe.xhtml"
        self.PAFjson = \
            {
                "@context" : "http://purl.org/pearson/content/v1/ctx/metadata/envelope",
                "@type" : "Envelope",
                "metadata" :
                    {
                        "guid" : str(self.uuid),
                        "title" : self.fileName,
                        "description" : self.fileName,
                        "contentTypeTier1" : "Test and Assessment",
                        "contentTypeTier2" : [ "assessment item" ],
                        "subject" : [ self.subject ],
                        "intendedEndUserRole" : [ "Student" ],
                        "format" : [ "application/vnd.pearson.sanvan.v1.activity" ],
                        "timeRequired" : "PT20S",
                        "created" : datetime.datetime.now().isoformat(), #time.strftime("%Y-%m-%dT%H:%M:%S-04:00"),
                        "owner": "Brix"
                    },
                "body" : {}
            }
        #self.readActivityConfig()

    def __str__(self):
        """Friendly string representation of the PAFActivity"""
        fmt = '\tPAFActivity uuid: %(uuid)s filename: %(filename)s\n\t\tquiz: %(quiz)s\n\t\tjson filename: %(jsonFn)s'

        return fmt % { "uuid": self.uuid,
                       "filename": self.fileName,
                       "quiz": self.quizName,
                       "jsonFn": self.jsonFilename }

    def writeJSON(self):
        """Write the PAF JSON for this activity copying the activity config from the html file"""
        with open(self.jsonFilename, "w") as ofile:
            print("writing ", self.jsonFilename)
            self.readActivityConfig()
            json.dump(self.PAFjson, ofile, indent=2, sort_keys=True)

    def writePXE(self, pxeTemplateFn, placeholderValues):
        """
        Create a new file by copying the given template and substituting
        the assignment and activity UUIDs into the placeholders in that file.

        :pxeTemplateFn: @todo
        :placeholderValues: A dictionary of replacement values for placeholders
        :returns: the name of the file created

        """
        placeholderValues['activityUUID'] = str(self.uuid)
        replacePlaceholdersInFile(pxeTemplateFn, self.pxeFilename, placeholderValues)
        return self.pxeFilename


    def readActivityConfig(self):
        """Write the envelope info and any lines that should be before the activity config"""
        startafter = re.compile(r"^\s*a\.config =\s*$")
        lastline = re.compile(r"^\s*};\s*$")
        activityStrs = []
        activityStr = ""
        started = False
        hasMaxAttemptsFixup = False
        try:
            with open(self.fileName, "rt", encoding="utf-8") as f:
                for line in f:
                    if started:
                        if lastline.match(line):
                            activityStrs.append("}")
                            break
                        activityStrs.append(line)

                    elif startafter.match(line):
                        started = True

            #print(self.activityStrs)
            fixupCommentsAndTrailingCommas(activityStrs)
            activityStr = ''.join(activityStrs)
            self.PAFjson['body'] = json.loads(activityStr)
            for key in ['sequenceNodeKey','maxAttempts','imgBaseUrl']:
                if key in self.PAFjson['body']: del self.PAFjson['body'][key]

            # add the missing mc config maxAttempts fixup, if not already there somewhere in configFixup
            configFixup = self.PAFjson['body']['containerConfig'][0]['brixConfig'][0]['configFixup']
            for fixup in configFixup:
                if fixup['name'] == 'maxAttempts':
                    hasMaxAttemptsFixup = True

            if not hasMaxAttemptsFixup:
                configFixup.append(PAFActivity.maxAttemptsFixup)

        except UnicodeError as e:
            problemlog.append("Problem w/ activity file: " + self.fileName + " UnicodeDecodeException: " + str(e) + "\n" + str(e.object[e.start -10:e.end + 10]))
            print(e, "\nreason: ", e.reason, "\nobject: ", e.object, "\nstart, end", e.start, e.end)
        except Exception as e:
            tb = traceback.format_exc()
            problemlog.append("Problem w/ activity file: " + self.fileName + " Exception: " + "".join(tb) + "\n" + activityStr)
            print(e)



class PAFAssignment(object):
    """
    A PAF assignment with its associated activities
    """
    # Count of the number of instances of PAFAssignment, used to create the instance jsonFilename
    instanceCount = 0

    def __init__(self, info):
        """Initializes the PAFAssignment"""
        self.__class__.instanceCount += 1
        self.uuid = info.pafAssignmentGuid or uuid.uuid4()
        # Update the info record just to make sure it has the uuid
        info.pafAssignmentGuid = self.uuid

        self.chapter = info.chapter
        self.module = info.module
        self.quizName = info.quizName
        self.subject = info.subject
        self.activities = []
        self.jsonFilename = "Quiz_" + str(self.__class__.instanceCount) + ".assignment.json"
        self.PAFjson = \
            {
                "@context" : "http://purl.org/pearson/content/v1/ctx/metadata/envelope",
                "@type" : "Envelope",
                "metadata" :
                    {
                        "guid" : str(self.uuid),
                        "title" : self.quizName,
                        "description" : self.quizName,
                        "contentTypeTier1" : "Test and Assessment",
                        "contentTypeTier2" : [ "quiz" ],
                        "subject" : [ self.subject ],
                        "intendedEndUserRole" : [ "Student" ],
                        "timeRequired" : "PT20S",
                        "owner": "Brix"
                    },
               "body" :
                {
                    "@context" : "http://purl.org/pearson/paf/v1/ctx/core/StructuredAssignment",
                    "@type" : "StructuredAssignment",
                    "title" : self.quizName,
                    "guid" : str(self.uuid),
                    "assignmentContents" :
                        {
                            "@contentType":"application/vnd.pearson.paf.v1.container+json",
                            "binding" : []
                        }
                }
            }
        self.addActivity(PAFActivity(info))

    def __str__(self):
        """Friendly string representation of the PAFAssignment"""
        fmt = 'PAFAssignment uuid: %(uuid)s'\
              '\n\tchapter: %(chapter)s\n\tmodule: %(module)s\n\tquiz: %(quiz)s'\
              '\n\tactivities in assignment: %(activityCount)d'\
              '\n\tjson filename: %(jsonFn)s'

        return fmt % { "uuid": self.uuid,
                       "chapter": self.chapter,
                       "module": self.module,
                       "quiz": self.quizName,
                       "jsonFn": self.jsonFilename,
                       "activityCount": len(self.activities) } + '\n' +\
                '\n'.join(map(str, self.activities))

    def addActivity(self, activity):
        self.activities.append(activity)
        activityUuid = str(activity.uuid)
        bindings = self.PAFjson['body']['assignmentContents']['binding']
        binding = \
            {
                "bindingIndex" : len(self.activities),
                "boundActivity"  : "{SERVER}/paf-repo/resources/activities/" + activityUuid,
                "activityFormat" : "application/vnd.pearson.sanvan.v1.activity",
                "activityTitle" : "Stages of sensory coding",
                "credit" : "ForCredit",
                "guid" : activityUuid
            }
        bindings.append(binding)

    def writeJSON(self):
        """Write the PAF JSON for this assignment and all of its activities"""
        with open(self.jsonFilename, "w") as ofile:
            print("writing ", self.jsonFilename)
            json.dump(self.PAFjson, ofile, indent=2, sort_keys=True)

        for activity in self.activities:
            activity.writeJSON()

    def writePXE(self, pxeTemplateFn):
        """
        Create a new pxe file for each activity in this assignment using the
        given template and substituting the assignment and activity UUIDs
        into the placeholders in that file.

        :pxeTemplateFn: @todo
        :returns: a lsit of the names of the pxe files created

        """
        placeholderValues = {'assignmentUUID': str(self.uuid)}

        return [activity.writePXE(pxeTemplateFn, placeholderValues) for activity in self.activities]


class MCQSpreadsheetInfoRow(object):
    """
    Simple struct that parses a row from a csv file into its properties
    """
    def __init__(self, row):
        """Initializes the MCQSpreadsheetInfoRow"""
        self.chapter = row[3]
        self.module = row[4]
        self.quizName = row[5]
        self.fileName = row[6]
        self.status = row[12]
        self.comments = row[12]
        self.subject =  row[0]
        self.pafContentType = 'Brix' #row[8]
        self.assetName = row[7]
        self.pafAssignmentGuid = row[10] if not row[10] else uuid.UUID(row[10])
        self.pafActivityGuid = row[11] if not row[11] else uuid.UUID(row[11])
        self.containerId = "target1" #row[12]

        # this needs to come from the csv, but isn't there yet

    def __str__(self):
        """Friendly string representation of the MCQSpreadsheetInfoRow"""
        fmt = 'filename: %(filename)s'\
              '\n\tchapter: %(chapter)s\n\tmodule: %(module)s\n\tquiz: %(quiz)s'\
              '\n\tPAF-assignment: %(assignment)s\n\tPAF-activity: %(activity)s\n\tcontainerId: %(containerId)s'

        return fmt % { "filename": self.fileName,
                       "chapter": self.chapter,
                       "module": self.module,
                       "quiz": self.quizName,
                       "assignment": self.pafAssignmentGuid,
                       "activity": self.pafActivityGuid,
                       "containerId": self.containerId }

    def getRowTuple(self):
        """Return a tuple of the info properties in column order"""
        return (self.chapter,
                self.module,
                self.quizName,
                self.fileName,
                self.status,
                self.comments,
                self.subject,
                self.pafContentType,
                self.assetName,
                self.pafAssignmentGuid,
                self.pafActivityGuid,
                self.containerId)

def buildPAFAssignments(spreadsheetRows):
    """Build the spreadsheet info into assignments containing the activities"""
    assignments = []
    assignmentByQuiz = {}
    for info in spreadsheetRows:
        if info.quizName in assignmentByQuiz:
            assignmentByQuiz[info.quizName].addActivity(PAFActivity(info))
            # Update the info record just to make sure it has the right assignment uuid for the activity
            info.pafAssignmentGuid = assignmentByQuiz[info.quizName].uuid
        else:
            assignment = PAFAssignment(info)
            assignmentByQuiz[assignment.quizName] = assignment
            assignments.append(assignment)

    return assignments

#                              #
# SCRIPT EXECUTION STARTS HERE #
#                              #

# Read the csv file given on the command line into the spreadsheetRows list
# of MCQSpreadsheetInfoRow instances.
csvfn = sys.argv[1]
pxeTemplateFn = sys.argv[2] if len(sys.argv) == 3 else None

print("Using csv file='" + csvfn +
	  ('\nNo pxe files will be generated\n' if pxeTemplateFn is None else "'\nUsing pxe tempate file='" + pxeTemplateFn + "'\n"))

headerRow = []
spreadsheetRows = []
with open(csvfn, 'rt') as f:
    reader = csv.reader(f)  # creates the reader object
    headerRow = next(reader)
    for row in reader:   # iterates the rows of the file in order
        spreadsheetRows.append(MCQSpreadsheetInfoRow(row))
        #print(spreadsheetRows[len(spreadsheetRows)-1])

# build a list of PAFAssignments containing activities by processing all of
# the spreadsheetRows.
assignments = buildPAFAssignments(spreadsheetRows)

# write the assignments created to stdout
for assignment in assignments:
    print(assignment)

# write a new csv file using the original name w/ ".updated" appended
# containing any updated information such as activity and assignment uuids
with open(csvfn + ".updated", "wt") as f:
    writer = csv.writer(f)
    writer.writerow(headerRow)
    for info in spreadsheetRows:
        writer.writerow(info.getRowTuple())

# Write the assignment JSON files (which will also write all the
# activity JSON files of the activities belonging to the written
# assignments).
for assignment in assignments:
    assignment.writeJSON()

if pxeTemplateFn is not None:
	# Write the assignment PXE files which is actually just the PXE files for
	# all of the activities in the assignment.
	chapterFiles = {}
	for assignment in assignments:
		pxeFiles = assignment.writePXE(pxeTemplateFn)
		# add this assignments pxeFiles to the other pxeFiles for the assignment's chapter
		if assignment.chapter not in chapterFiles:
			chapterFiles[assignment.chapter] = []
		chapterFiles[assignment.chapter].extend(pxeFiles)

	# Move the pxeFiles into the zipfile for the chapter they're associated with
	for chapter, files in chapterFiles.items():
		print("'" + chapter + "' has " + str(len(files)) + ' files')
		
		with zipfile.ZipFile(chapter + '.zip', 'w', zipfile.ZIP_DEFLATED) as myzip:
			for pxeFile in files:
				myzip.write(pxeFile)

		# after the files are safely in the closed zipfile, delete them
		print('removing the ' + str(len(files)) + ' files now stored in the ' + chapter + ' zip')
		i = 0
		for pxeFile in files:
			i = i + 1
			print(i, ')removing ' + pxeFile)
			try:
				os.unlink(pxeFile)
			except FileNotFoundError as e:
				problemlog.append('could not delete file ' + pxeFile + '. This implies it was already deleted which means 2 or more activities had the same filename!')
				print(e)

# Write out the error log
with open("mcq_export2paf_error.log", "wt") as f:
    f.write("\n".join(problemlog) + "\n")
