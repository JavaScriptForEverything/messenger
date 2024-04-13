const { Schema, models, model } = require('mongoose');
const slug = require('slug')

const demoSchema = new Schema({
	firstName: {
		type: String,
		trim: true,
		unique: true,
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
	slug: { 											// set username: default is fullName + unique
		type: String,
		trim: true,
		unique: true,
		lowercase: true,
		maxlength: 40,
		get: function(value) { return slug(`${this.firstName} ${this.lastName}`, '-') }
	},
	username: { 											// set username: default is fullName + unique
		type: String,
		trim: true,
		unique: true,
		lowercase: true,
		maxlength: 40,
	},

}, {
	timestamps: true,
	toJSON: { 
		getters: true, 
		virtuals: true 
	}
})


const Demo = models.Demo || model('Demo', demoSchema)
module.exports = Demo
