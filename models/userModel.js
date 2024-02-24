const { Schema, models, model } = require('mongoose');

const userSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		required: true,
		minlength: 3,
		maxlength: 20
	},
	lastName: {
		type: String,
		trim: true,
		required: true,
		minlength: 3,
		maxlength: 20
	},

	avatar: {
		type: String,
		default: '/images/users/default.jpg'
	},


}, {
	timestamps: true
})

const User = models.User || model('User', userSchema)
module.exports = User