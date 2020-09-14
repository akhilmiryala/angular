#!/bin/bash

# Function for upsert of design & other configuration docs
upsert_doc() {
  DB=$1
  DOC_NAME=$2
  DOC_LOC=$3
  # Default method is PUT, fourth argument overrides
  METHOD=${4:-"PUT"}
  DOC=$(curl $COUCHURL/$DB/$DOC_NAME $PROXYHEADER)
  # If DOC includes a rev then it exists so we need to update
  # Otherwise we simply insert
  if [[ $DOC == *rev* ]]; then
    DOC_REV=$(echo $DOC | jq -r '. | ._rev')
    curl -H 'Content-Type: application/json' -X $METHOD $COUCHURL/$DB/$DOC_NAME?rev=$DOC_REV -d $DOC_LOC $PROXYHEADER
  else
    curl -H 'Content-Type: application/json' -X $METHOD $COUCHURL/$DB/$DOC_NAME -d $DOC_LOC $PROXYHEADER
  fi
}

# Function for insert mock data docs
insert_docs() {
  DB=$1
  DOC_LOC=$2
  curl -H 'Content-Type: application/json' -X POST $COUCHURL/$DB/_bulk_docs -d @$DOC_LOC $PROXYHEADER
}

# Function to add databases
insert_dbs() {
  DBS=$1
  for DB in "${DBS[@]}"
  do
    curl -X PUT $COUCHURL/$DB $PROXYHEADER
  done
}

# Options are -u for username -w for passWord and -p for port number
while getopts "u:w:p:h:ix" option; do
  case $option in
    u) COUCHUSER=${OPTARG};;
    w) COUCHPASSWORD=${OPTARG};;
    p) PORT=${OPTARG};;
    h) HOST=${OPTARG};;
    i) INSTALLFLAG=1;;
    x) PROXYHEADER="-H X-Auth-CouchDB-Roles:_admin -H X-Auth-CouchDB-UserName:username";;
  esac
done

ISINSTALL=${INSTALLFLAG:-0}
echo $ISINSTALL
if [ -z "$HOST" ]
then
  HOST=127.0.0.1
fi

# Default port for CouchDB accessed from host machine is 2200
PORT=${PORT:-2200}
if [ -z "$COUCHUSER" ]
then
  COUCHURL=http://$HOST:$PORT
else
  COUCHURL=http://$COUCHUSER:$COUCHPASSWORD@$HOST:$PORT
fi

# Adding attachments to database documents
# To add attachment added two file (resources-mock.json and resources-attachment-mockup.json)
# Ids must match between two files
insert_attachments() {
  DB=$1
  DOC_LOC=$2
  # Use echo $(<$DOC_LOC) to be able to run in Windows
  INPUTS=$(echo $(<$DOC_LOC) | jq -c '.[]')
  for i in $INPUTS
  do
    ID=$(echo $i | jq -r '.doc_id' )
    FILE_NAME=$(echo $i | jq -r '.file_name')
    FILE_LOCATION=$(echo $i | jq -r '.file_location')
    FILE_TYPE=$(echo $i | jq -r '.file_type')
    REV=$(curl $COUCHURL/$DB/$ID | jq -r '._rev' $PROXYHEADER)
    curl -X PUT $COUCHURL/$DB/$ID/$FILE_NAME?rev=$REV --data-binary @$FILE_LOCATION -H Content-Type:$FILE_TYPE $PROXYHEADER
  done
}

# Reads one JSON file to update multiple databases
# JSON file needs a 'dbName' field with a string and
# a 'json' field with the JSON to be updated
multi_db_update() {
  DOC_LOC=$1
  DOC_NAME=$2
  INPUTS=$(echo $DOC_LOC | jq -c '.[]')
  for i in $INPUTS
  do
    JSON=$(echo $i | jq -c '. | .json' )
    DB_NAME=$(echo $i | jq -r '. | .dbName')
    upsert_doc $DB_NAME $DOC_NAME $JSON
  done
}

DBS=(
  # CouchDB standard databases
  "_users"
  "_replicator"
  "_global_changes"
  # Planetlearning databases
  "messages"
)

insert_dbs $DBS

# Increase session timeout
upsert_doc _node/nonode@nohost/_config couch_httpd_auth/timeout '"2400"'
# Increse http request size for large attachments
upsert_doc _node/nonode@nohost/_config httpd/max_http_request_size '"1073741824"'
# Increse replication timeout
upsert_doc _node/nonode@nohost/_config replicator/connection_timeout '"300000"'

# Make user database public
upsert_doc _node/nonode@nohost/_config couch_httpd_auth/users_db_public '"true"'
# Specify user public fields (note: adding spaces to string breaks upsert_doc)
upsert_doc _node/nonode@nohost/_config couch_httpd_auth/public_fields '"name"'

# Only insert dummy data and update security on install
# _users security is set in app and auto accept will be overwritten if set here
if (($ISINSTALL))
then
  # Insert dummy data docs
  upsert_doc _node/nonode@nohost/_config admins/user '"password"'
fi
