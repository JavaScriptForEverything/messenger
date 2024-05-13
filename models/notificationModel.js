const { Schema, models, model } = require('mongoose')

/* Show notification when user:

		. send message
		. Try to call 	(need message type call to set in messageModel)
		. follow user
*/


/*
{
	userFrom: logedInUserId, 			// CallerUserId,
	userTo: activeUserId, 				// calleeUserId
	type: 'new-message', 					// ['new-message', 'follow', 'call']
	isOpened: false

	entityId: 'message-1-id', 		// belongs to which particular message, calls or follow request
//	kind: 'tweet', 								// ['user', 'tweet', 'message' ]
}

*/


const notificationSchema = new Schema({
	entryId: {  																	// To identify which user or which message is this notification
		type: Schema.Types.ObjectId, 								// messageId, userId
		required: true
	}, 		
	userFrom: { 
		type: Schema.Types.ObjectId, 								// sender | callerUserId
		ref: 'User',
		required: true
	}, 		
	userTo: { 
		type: Schema.Types.ObjectId, 								// receiver | calleeUserId
		ref: 'User',
		required: true
	}, 			
	
	type: { 																			// for which task this notification this
		type: String,
		enum: ['new-message', 'follow', 'call'],
		required: true,
	},

	isOpened: {  																	// To check it notification clicked: seen or unseen
		type: Boolean, 
		default: false 
	},

	// kind: { 																			// what kind of notification is this
	// 	type: String,
	// 	enum: ['user', 'tweet', 'message' ],
	// 	required: true,
	// },

}, { 
	timestamps: true, 
	// toJSON: { virtuals: true }
})


/*
// GET /api/tweets/:id/retweet
	...
	if(!deletedTweet) {
		await Notification.createNotification({
			entryId: messageId, 										// Who which message this notification belongs to
			userFrom: logedInUserId, 								// Who liked it ?
			userTo: activeUserId, 									// which user create this tweet ?
			type: 'new-message', 										// ['new-message', 'follow', 'call']
		})
	}
*/ 
notificationSchema.statics.createNotification = async function ( payload ) {
	await this.deleteOne(payload) 	// if same notification already exist, then delete that before create new one
	return this.create(payload)
}

notificationSchema.pre(/^find/, function(next) {
	this.populate('userFrom userTo')

	next()
})
const Notification = models.Notification || model('Notification', notificationSchema)
module.exports = Notification