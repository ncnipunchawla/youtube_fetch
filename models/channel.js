var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChannelSchema = new Schema({
	channelName: {
		type: String,
		unique: true
	},
	channelId: {
		type: String,
		unique: true
	},
	created_at: {
		type: Date,
		default: Date.now
	},
	channelDetails: {
		type: Schema.Types.Mixed
	},
	channel_lastSyncTime: {
		type: Date
	}
});

mongoose.model('Channel', ChannelSchema);