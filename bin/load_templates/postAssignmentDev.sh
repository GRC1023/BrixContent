#! /bin/bash
java -jar ./brix-tool-pafclient-0.3-jar-with-dependencies.jar -m POST \
    -h "Content-Type: application/vnd.pearson.paf.v1.envelope+json;body=\"application/vnd.pearson.paf.v1.assignment+json\"\"" \
    -d ./load_templates/mcAssignmentOutput.json \
    -u http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities -c
