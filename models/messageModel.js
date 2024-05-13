const { Schema, model, models } = require('mongoose')

/* 	
	if access meassess via user list, then user must have 2 IDs:
		1. senderId 		: To identify who created the message
		2. receiver 		: To which user the message sened to. 

	If access messages via chat list, then every measses must have chatId to point to that chat
		. chat id required for Group chat
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
	duration: { 											// => if type === 'audio' 	then audio.duration
		type: Number, 
		default: 30, 
	}, 
	// chat: { 													// message must will bellong to a particualar chat for Group
	// 	type: Schema.Types.ObjectId, 
	// 	ref: 'Chat',
	// 	required: true, 
	// }, 		
	sender: {  												// this message bellong to which user
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true, 
	},
	receiver: {  												// message will be sent to which user
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true, 
	},
	// users: [{  												// users who participants for chats between, at least 2 users
	// 	type: Schema.Types.ObjectId, 
	// 	ref: 'User',
	// 	required: true, 
	// }], 	

}, { 
	timestamps: true,
})

messageSchema.pre(/^find/, function(next) {
	this.populate('sender receiver')
	next()
})

const Message = models.Message || model('Message', messageSchema)
module.exports = Message