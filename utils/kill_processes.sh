echo "Current running processes:"
ps aux | grep -E 'DataImporter|hashtagProcessor|tweetProcessor|Runner' | grep forever | awk '{print $2,$13;}'
for i in `ps aux | grep -E 'DataImporter|hashtagProcessor|tweetProcessor|Runner' | grep forever | awk '{print $2;}'`; 
do
	
	echo "Killng process " $i
	sudo kill $i
done
echo "Check if processes are killed (output nothing upon success)."
ps aux | grep -E 'DataImporter|hashtagProcessor|tweetProcessor|Runner' | grep forever | awk '{print $2,$13;}'
