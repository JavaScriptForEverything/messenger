const { Schema, models, model } = require('mongoose');

/* 	- In UI when user select any user (in user list) it create a chat 
		- Else allow user to create a chat isGroup=true
				- every message must bellong to a chat (single or group)
*/
const chatSchema = new Schema({
	name: {
		type: String,
		trim: true,
		lowercase: true,
		minlength: 3,
		maxlength: 20,
		default: 'new chat'
	},
	users: [{  												// users who participants for chats between, at least 2 users
		type: Schema.Types.ObjectId, 
		ref: 'User',
		required: true, 
	}], 	

	isGroup: {  											// private | groupChat
		type: Boolean, 
		default: false 
	},
	isOpened: { 
		type: Boolean, 
		default: false 
	},
	latestMessage: { 
		type: Schema.Types.ObjectId, 
		ref: 'Message' 
	}, 	



}, {
	timestamps: true,
	toJSON: { virtuals: true }
})


const Chat = models.Chat || model('Chat', chatSchema)
module.exports = Chat
