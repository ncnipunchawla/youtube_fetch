var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var VideoSchema = new Schema({
	videoId: {
		type: String,
		unique: true
	},
	channelName: {
		type: String
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	videoDetails: {
		type: Schema.Types.Mixed
	}
});

mongoose.model('Video', VideoSchema);