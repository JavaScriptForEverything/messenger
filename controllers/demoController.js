const { catchAsync, appError } = require('./errorController')
const Demo = require('../models/demoModel')
const slug = require('slug')

// GET /api/demos
exports.getAll = catchAsync(async (req, res, next) => {
	const demos = await Demo.find({}, { createdAt: 0, updatedAt: 0, __v: 0 }).sort('-createdAt')

	res.status(200).json({
		status: 'success',
		count: demos.length,
		data: demos
	})
})

// POST /api/demos
exports.create = catchAsync(async (req, res, next) => {

	const isUsernameExists = await Demo.findOne({ username: req.body.username })
	if(isUsernameExists) return next(appError('this username already taken by someone'))

	const body = req.body
	// body.username = `${body.username}.${crypto.randomUUID()}`
	// body.username = `${body.username}.${new Schema.ObjectId()}`
	body.username = slug(body.username, '-')

	const demo = await Demo.create(body)

	res.status(200).json({
		status: 'success',
		data: demo
	})
})