echo Start Crawler
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

# Check process
echo "Current running processes:"
ps aux | grep -E 'Runner|DataImporter|hashtagProcessor|tweetProcessor' | grep forever | awk '{print $2, $13;}'
