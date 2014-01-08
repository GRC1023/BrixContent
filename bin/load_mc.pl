#!/usr/bin/perl
#
# Edit the template files in load_templates/mc*Template.json for content changes.
# Run this script.
# It'll copy the template into an output file, put in real guids, and post to to PAF
#
use File::Slurp;

# PAF environment - uncomment the one you want.  only dev and cert are supported at this time.
#my $pafEnv = 'Dev';
my $pafEnv = 'Cert';

# read in the templates
my $activityText = read_file('load_templates/mcActivityTemplate.json');
my $assignmentText = read_file('load_templates/mcAssignmentTemplate.json');

# outputfiles
my $activityOutput = 'load_templates/mcActivityOutput.json';
my $assignmentOutput = 'load_templates/mcAssignmentOutput.json';

# make new guids
my $activityguid = `uuidgen`;
my $assignmentguid = `uuidgen`;

# remove the trailing \n
chop($activityguid, $assignmentguid);

# edit the templates
$activityText =~ s/ACTIVITYGUID/$activityguid/g;
$assignmentText =~ s/ACTIVITYGUID/$activityguid/g;
$assignmentText =~ s/ASSIGNMENTGUID/$assignmentguid/g;

# write the output (this overwrites the output files)
write_file( $activityOutput, $activityText );
write_file( $assignmentOutput, $assignmentText );

# post to paf
my $activityScript = "./load_templates/postActivity" . $pafEnv . ".sh";
print $activityScript . "\n";
system($activityScript);
system("./load_templates/postAssignment" . $pafEnv . ".sh");

print "\n------------\n";
print "assignment guid: " . $assignmentguid . "\n";
print "activity guid: " . $activityguid . "\n";

