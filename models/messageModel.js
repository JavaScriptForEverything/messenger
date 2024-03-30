const { Schema, model, models } = require('mongoose')

/* 	- In UI when user select any user (in user list) it create a chat 
		- Else allow user to create a chat isGroup=true
				- every message must bellong to a chat (single or group)
*/

const messageSchema = new Schema({
	message: { 												// => content: text or 'empty'
		type: String, 
		trim: true,
		required: true, 
	}, 
	type: { 													// => content type: show ui different style based on type
		type: String, 
		enum: ['text', 'image', 'audio'],
		default: 'text', 
	}, 
	chat: { 													// message must will bellong to a particualar chat
		type: Schema.Types.ObjectId, 
		ref: 'Chat',
		required: true, 
	}, 		
	sender: {  												// this message bellong to which user
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true, 
	},
	// users: [{  												// users who participants for chats between, at least 2 users
	// 	type: Schema.Types.ObjectId, 
	// 	ref: 'User',
	// 	required: true, 
	// }], 	

}, { timestamps: true })

// messageSchema.pre(/^find/, function(next) {
// 	this.populate('chat sender')
// 	next()
// })

const Message = models.Message || model('Message', messageSchema)
module.exports = Message