#! /bin/bash
java -jar ./brix-tool-pafclient-0.3-jar-with-dependencies.jar -m POST \
    -h "Content-Type: application/vnd.pearson.paf.v1.envelope+json;body=\"application/vnd.pearson.sanvan.v1.activity\"\"" \
    -d ./load_templates/mcActivityOutput.json \
    -u http://repo.paf.dev.pearsoncmg.com/paf-repo/resources/activities -c
