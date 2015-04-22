#!/bin/bash
neo4j_status=`service neo4j-service status | awk '{print $4;}'`
if [ "$neo4j_status" == "running" ]
then
{ 
	# Runing fine, do nothing
	echo `date` " Neo4j is running fine."
}
else
{
	echo `date` " Neo4j is NOT running, restarting." 
	sudo service neo4j-service start
}
fi
