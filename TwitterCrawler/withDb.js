var util = require('util'),
    twitter = require('twitter');
var monk = require('monk');
var db = monk('localhost:27017/nodetest');

var twit = new twitter({
    consumer_key: 'Sf2w36x3LVCcD5T5POEzny6zl',
    consumer_secret: 'ZqGqFO5Hv2onOPkXOdpLqk4bu2CsFAAWXVWALBxAjDX0VZJW80',
    access_token_key: '22407058-heCtmNOiTym1yqADH0Vzg0kbBbBkuThfNsLkpPnBu',
    access_token_secret: 'NgfLW4RAXJCKEU8Jbrf3dutCy458Q0lLI50RxPMgMXHJS'
});

twit.login();
var collection = db.get("testtwitter");
var content;
var callback = function() {
	twit.getUserTimeline({screen_name:'DmitriCyber', count:'1'}, function(data) {
		console.log(data);
		console.log("-----------------");
	});
}
callback();
