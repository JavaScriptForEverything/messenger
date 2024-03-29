const { Schema, models, model } = require('mongoose');

const tokenSchema = new Schema({
	refreshToken: { 						
		type: String,
		required: true
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true,
	},

}, { 
	timestamps: true
})

const Token = models.Token || model('Token', tokenSchema)
module.exports = Token