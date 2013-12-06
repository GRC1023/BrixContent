import csv     # imports the csv module
import uuid    # imports the uuid module
import sys     # imports the sys module

class PAFActivity(object):
    """
    A PAF activity
    """
    def __init__(self, info):
        """Initializes the PAFActivity"""
        self.uuid = info.pafActivityGuid or uuid.uuid4()
        self.fileName = info.fileName
        self.quizName = info.quizName

    def __str__(self):
        """Friendly string representation of the PAFActivity"""
        fmt = '\tPAFActivity uuid: %(uuid)s filename: %(filename)s\n\t\tquiz: %(quiz)s'

        return fmt % { "uuid": self.uuid,
                       "filename": self.fileName,
                       "quiz": self.quizName }

class PAFAssignment(object):
    """
    A PAF assignment with it's associated activities
    """
    def __init__(self, info):
        """Initializes the PAFAssignment"""
        self.uuid = info.pafAssignmentGuid or uuid.uuid4()
        self.chapter = info.chapter
        self.module = info.module
        self.quizName = info.quizName
        self.activities = [PAFActivity(info)]

    def addActivity(self, activity):
        self.activities.append(activity)

    def __str__(self):
        """Friendly string representation of the PAFAssignment"""
        fmt = 'PAFAssignment uuid: %(uuid)s'\
              '\n\tchapter: %(chapter)s\n\tmodule: %(module)s\n\tquiz: %(quiz)s'\
              '\n\tactivities in assignment: %(activityCount)d'

        return fmt % { "uuid": self.uuid,
                       "chapter": self.chapter,
                       "module": self.module,
                       "quiz": self.quizName,
                       "activityCount": len(self.activities) } + '\n' +\
                '\n'.join(map(str, self.activities))

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
        self.comments = row[4]
        self.pafContentType = 'Brix'
        self.assetName = row[6]
        self.pafAssignmentGuid = row[7]
        self.pafActivityGuid = row[8]
        self.containerId = row[9]

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

def buildPAFAssignments(spreadsheetRows):
    """Build the spreadsheet info into assignments containing the activities"""
    assignments = []
    assignmentByModule = {}
    for info in spreadsheetRows:
        if info.module in assignmentByModule:
            assignmentByModule[info.module].addActivity(PAFActivity(info))
        else:
            assignment = PAFAssignment(info)
            assignmentByModule[assignment.module] = assignment
            assignments.append(assignment)

    return assignments

#
#
#
f = open(sys.argv[1], 'rb') # opens the csv file
try:
    reader = csv.reader(f)  # creates the reader object
    spreadsheetRows = []
    for row in reader:   # iterates the rows of the file in order
        spreadsheetRows.append(MCQSpreadsheetInfoRow(row))
        #print spreadsheetRows[len(spreadsheetRows)-1]

    assignments = buildPAFAssignments(spreadsheetRows)
    print len(assignments)

    for assignment in assignments:
        print assignment
finally:
    f.close()      # closing
