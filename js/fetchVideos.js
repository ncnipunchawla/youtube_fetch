var _ = require('lodash'),
    async = require('async'),
    request = require('request'),
    API_KEY = 'AIzaSyDAlDuJ_aGKZbN1zRGGjg0Zc6ZqWmqJYrY';

var fetchVideosFromYoutube = function (channelName, callback) {
    console.log('In fetchVideos: ' + channelName);
    async.waterfall([
        function (next) {
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
                    next(err);
                } else {
                    console.log('Channel Id ->', res.body.items[0].id);
                    next(null, res.body.items[0].id);
                }
            });
        },

        function (channelId, next) {
            console.log('Url is: ' + 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=' + channelId + '&maxResults=50&key=' + API_KEY);
            request({
                url: 'https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=' + channelId + '&maxResults=50&key=' + API_KEY,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                json: true
            }, function (err, res, body) {
                if (err) {
                    console.log('ERROR occured while fetching channel id from Youtube. DETAILED err:=> ', err);
                    next(err);
                } else {
                    console.log('Video Id ->', res.body);
                    var videoIds = [];
                    for (var i = 0; i < res.body.items.length; i++) {
                        videoIds.push(res.body.items[i].id.videoId)
                    }
                    next(null, videoIds);
                }
            });
        }
    ], function (error, response) {
        if (error) {
            console.log('ERROR occured in fetchVideos. DETAILED err:=> ', error);
            callback(error);
        } else {
            console.log('response ->', response);
            callback(null, response);
        }
    })
}

module.exports.fetchVideosFromYoutube = fetchVideosFromYoutube;