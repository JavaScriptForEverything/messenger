const { Schema, models, model } = require('mongoose');
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const slug = require('slug')

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
	// slug: { 											
	// 	type: String,
	// 	trim: true,
	// 	unique: true,
	// 	lowercase: true,
	// 	get: function(value) { return slug(`${this.firstName} ${this.lastName} ${this.id}`, '-') }
	// },
	username: { 											// set username: default is fullName + unique
		type: String,
		trim: true,
		unique: true,
		lowercase: true,
		maxlength: 40,
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
	coverPhoto: {
		type: String,
		default: '/images/users/coverPhoto.png'
	},

	isActive: {
		type: Boolean,
		default: false
	},

	title: { 																// short intro
		type: String,
		default: 'senior developer'
	},

	followers: [{ 													// all the users following this user
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
	followings: [{ 													// this user are following other users
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],

	latestMessage: { 
		type: Schema.Types.ObjectId, 
		ref: 'Message' 
	}, 	

}, {
	timestamps: true,
	toJSON: { virtuals: true }
})

// virtual properties work from api end point but dosen't working on pageRouter, but why ?
userSchema.virtual('fullName').get(function() {
	return `${this.firstName} ${this.lastName}`
})

// this middleware only work on 'save' = .create() but not working for 'findOneAndUpdate' == .findByIdAndUpdate()
userSchema.pre(/save|findOneAndUpdate/, function(next) {
	if(this.username) {
		this.username = slug(this.username, '-')
	}

	next()
})

userSchema.pre('save', async function(next) {
	if( !this.isModified('password') ) return

	this.password = await bcryptjs.hash(this.password, 12)
	this.confirmPassword = undefined
	next()
})

userSchema.methods.comparePassword = function(password, hashedPassword) {
	return bcryptjs.compare(password, hashedPassword)
}

// userSchema.virtual('notifications', {
// 	ref: 'Notification',
// 	foreignField: 'userFrom', 						// Notification.userFrom === User._id
// 	localField: '_id'
// })

const User = models.User || model('User', userSchema)
module.exports = User