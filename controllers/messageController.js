const Message = require('../models/messageModel')
const { apiFeatures } = require('../utils')
const { catchAsync } = require('./errorController')
const messageDto = require('../dtos/messageDto')

// GET /api/messages
exports.getAllMessages = catchAsync( async (req, res, next) => {
	const filter = {}
	const messages = await apiFeatures(Message, req.query, filter)

	res.status(200).json({
		status: 'success',
		count: messages.length,
		data: messages.map( message => messageDto.filterMessage(message._doc)) 
	})
})

// POST /api/messages
exports.createMessage = catchAsync( async (req, res, next) => {

	const filteredBody = messageDto.filterBody(req.body)
	const message = await Message.create(filteredBody)

	res.status(200).json({
		status: 'success',
		data: messageDto.filterMessage(message._doc)
	})
})