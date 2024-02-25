const { Schema, models, model } = require('mongoose');
const validator = require('validator')
const bcryptjs = require('bcryptjs')

const userSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		required: true,
		lowercase: true,
		minlength: 3,
		maxlength: 20
	},
	lastName: {
		type: String,
		trim: true,
		required: true,
		lowercase: true,
		minlength: 3,
		maxlength: 20,
	},
	email: {
		type: String,
		trim: true,
		required: true,
		unique: true,
		lowercase: true,
		minlength: 6,
		maxlength: 40,
		validate: validator.isEmail
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		maxlength: 40,
		select: false,
	},
	confirmPassword: {
		type: String,
		required: true,
		validate: function(confirmPassword) { return this.password === confirmPassword }
	},

	avatar: {
		type: String,
		default: '/images/users/default.jpg'
	},
	isActive: {
		type: Boolean,
		default: false
	},


}, {
	timestamps: true,
	toJSON: { virtuals: true }
})

userSchema.virtual('fullName').get(function() {
	return `${this.firstName} ${this.lastName}`
})

userSchema.pre('save', async function(next) {
	if( !this.isModified('password') ) return

	this.password = await bcryptjs.hash(this.password, 12)
	this.confirmPassword = undefined
	next()
})

const User = models.User || model('User', userSchema)
module.exports = User