echo Start Crawler.
cd ~/Offline/DataCollection
sudo NODE_ENV=production forever start -w Runner.js

echo Start Processor.
cd ~/Offline/DataProcessing
sudo NODE_ENV=production forever start -w DataImporter.js

echo Start hashtag trend processor.
cd ~/Offline/HashtagTrendProcessor
sudo NODE_ENV=production forever start -w hashtagProcessor.js

echo Start tweets processor.
cd ~/Offline/TweetsProcessor
sudo NODE_ENV=production forever start -w tweetProcessor.js

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

if [ -z "$(ps aux | grep forever | grep hashtagProcessor)" ]; then
  echo "Neo4j hashtagProcessor not started!!!!!"
else
  echo "Neo4j hashtagProcessor has started."
fi
