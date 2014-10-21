# Add neo4j key into the apt package manager.
sudo wget -O - http://debian.neo4j.org/neotechnology.gpg.key | sudo apt-key add -
# Add Neo4J to the apt sources list.
sudo echo 'deb http://debian.neo4j.org/repo stable/' | sudo tee --append /etc/apt/sources.list.d/neo4j.list
sudo apt-get update
sudo apt-get install neo4j
# verify neo4j is running
service neo4j-service status