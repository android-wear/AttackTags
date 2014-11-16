echo Start Crawler.
sudo NODE_ENV=production forever start -w ~/Offline/AttackTags/DataCollection/Runner.js
echo Start Processor.	
sudo NODE_ENV=production forever start -w ~/Offline/AttackTags/DataProcessing/DataImporter.js
echo verify runner has started.
if [ -z "$(ps aux | grep forever | grep Runner)" ]; then
  echo "Crawler runner not started!!!!!"
else
  echo "Crawler runner has started."
fi

if [ -z "$(ps aux | grep forever | grep DataImporter)" ]; then
  echo "Neo4j Data Importer not started!!!!!"
else
  echo "Neo4j Data Importer has started."
fi