import csv      # imports the csv module
import uuid     # imports the uuid module
import os.path  # imports the os and os.path module
import json     # imports the json module
import datetime #imports the datetime module
import re       # imports the regular expression module
import sys      # imports the sys module
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

class PAFActivity(object):
    """
    A PAF activity
    """
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
            json.dump(self.PAFjson, ofile, indent=2)

    def readActivityConfig(self):
        """Write the envelope info and any lines that should be before the activity config"""
        startafter = re.compile(r"^\s*a\.config =\s*$")
        lastline = re.compile(r"^\s*};\s*$")
        activityStrs = []
        activityStr = ""
        started = False
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
            json.dump(self.PAFjson, ofile, indent=2)

        for activity in self.activities:
            activity.writeJSON()



class MCQSpreadsheetInfoRow(object):
    """
    Simple struct that parses a row from a csv file into its properties
    """
    def __init__(self, row):
        """Initializes the MCQSpreadsheetInfoRow"""
        self.chapter = row[0]
        self.module = row[1]
        self.quizName = row[2]
        self.fileName = row[3]
        self.status = row[4]
        self.comments = row[5]
        self.subject =  row[6]
        self.pafContentType = 'Brix' #row[7]
        self.assetName = row[8]
        self.pafAssignmentGuid = row[9] if not row[9] else uuid.UUID(row[9])
        self.pafActivityGuid = row[10] if not row[10] else uuid.UUID(row[10])
        self.containerId = "target1" #row[11]

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

#
#
#

# opens the csv file
csvfn = sys.argv[1]
headerRow = []
spreadsheetRows = []
with open(csvfn, 'rt') as f:
    reader = csv.reader(f)  # creates the reader object
    headerRow = next(reader)
    for row in reader:   # iterates the rows of the file in order
        spreadsheetRows.append(MCQSpreadsheetInfoRow(row))
        #print(spreadsheetRows[len(spreadsheetRows)-1])

assignments = buildPAFAssignments(spreadsheetRows)

for assignment in assignments:
    print(assignment)

with open(csvfn + ".updated", "wt") as f:
    writer = csv.writer(f)
    writer.writerow(headerRow)
    for info in spreadsheetRows:
        writer.writerow(info.getRowTuple())

# Test writing assignment and activity json w/ the 1st assignment
#assignments[0].writeJSON()
for assignment in assignments:
    assignment.writeJSON()

with open("mcq_export2paf.log", "wt") as f:
    f.write("\n".join(problemlog) + "\n")


