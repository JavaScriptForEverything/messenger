const { Schema, models, model } = require('mongoose');

const chatSchema = new Schema({
	name: {
		type: String,
		trim: true,
		lowercase: true,
		minlength: 3,
		maxlength: 20,
		default: 'new chat'
	},
	users: [{ 
		type: Schema.Types.ObjectId, 
		ref: 'User' ,
		required: true
	}],

	isGroup: { 
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
