var restify = require('restify'),
	cluster = require('cluster'),
	numCPUs = require('os').cpus().length,
	request = require('request'),
	requestIp = require('request-ip'),
	config = require('./config.json'),
	async = require('async'),
	API_KEY = 'AIzaSyDAlDuJ_aGKZbN1zRGGjg0Zc6ZqWmqJYrY';

var mongoose = require('mongoose');
mongoose.connect(config.mongoUrl);
require('./models/channel');
require('./models/video');

var Channel = mongoose.model('Channel');
var Video = mongoose.model('Video');

if (cluster.isMaster) {
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
	cluster.on('exit', function(worker, code, signal) {
		console.log('worker ' + worker.process.pid + ' died');
		// forkCluster();
		cluster.fork();
		console.log('re forking worker')
	});
} 
else {
	var server = restify.createServer({
		name: 'youtube_videos',
		version: '1.0.0'
	});

	// Necessary configuration for restify server
	server.use(restify.acceptParser(server.acceptable));
	server.use(restify.queryParser());
	server.use(restify.bodyParser());
	server.use(requestIp.mw());

	server.use(
	  function crossOrigin(req,res,next){
	    res.header("Access-Control-Allow-Origin", "*");
	    res.header("Access-Control-Allow-Headers", "X-Requested-With");
	    return next();
	  }
	);

    //************************ MOBILE SIDE APIs *************************//

	server.post('/saveChannels', function(req, res, next) {
		console.log('here====>', req.body.channelNames.length);
		async.each(
			req.body.channelNames,
			function(channelName, callback) {

				request({
		            url: 'https://www.googleapis.com/youtube/v3/channels?part=snippet&forUsername=' + channelName + '&key=' + API_KEY,
		            method: 'GET',
		            headers: {
		                'Content-Type': 'application/json'
		            },
		            json: true
		        }, function (err, res, body) {
		            if (err) {
		                console.log('ERROR occured while fetching channel id from Youtube. DETAILED err:=> ', err);
		                callback(err);
		            } else {
		            	if (res.body.items.length > 0) {
		            		var insertObject = {
								channelName: channelName,
								channelId: res.body.items[0].id,
								channelDetails: res.body
							};
							var channel = new Channel(insertObject);
							channel.save(function(err, res) {
								if (err) {
									console.log('ERR IN SAVING CHANNEL=======>');
									callback();
								} else {
									callback();
								}
							})
		            	} else {
		            		callback();
		            	}
		            }
		        });

			}, function(err, resp) {
				if (err) {
					console.log('ERROR===>');
					res.send(400, 'ERROR');
				} else {
					console.log('SAVED========>');
					res.send(200, 'SAVED');
				}
			})
	});

	server.get('/getVideos', function(req, res, next) {
		var payload = req.query;
		console.log('payload===========>', payload);
		if (payload && payload.channelName && payload.channelName != '') {
			Video.find({channelName: payload.channelName}).exec(function(err, videos) {
				if (err) {
					res.send(400);
				} else {
					res.send(200, {videos: videos, totalCount: videos.length});
				}
			})
		} else {
			Video.find({}).exec(function(err, videos) {
				if (err) {
					res.send(400);
				} else {
					res.send(200, {videos: videos, totalCount: videos.length});
				}
			});
		}
	})

	server.listen(7070, function () {
		console.log('request' ,'%s listening at %s', server.name, server.url);
	});
}