const Message = require('../models/messageModel')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const messageDto = require('../dtos/messageDto')
const fileService = require('../services/fileService')

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

// POST /api/messages/chats
exports.getAllChatMessages = catchAsync( async (req, res, next) => {
	const { sender='', receiver='' } = req.body
	if(!sender || !receiver) return next(appError('sender ID and receiver ID required'))

	// const messages = await Message.find({
	// 	$or : [
	// 		{ sender, receiver },
	// 		{ sender: receiver, receiver: sender },
	// 	]
	// })

	const filter = {
		$or : [
			{ sender, receiver },
			{ sender: receiver, receiver: sender },
		]
	}
	const messages = await apiFeatures(Message, req.query, filter)


	res.status(200).json({
		status: 'success',
		count: messages.length,
		data: messages.map( message => messageDto.filterMessage(message._doc)) 
	})
})


// POST /api/messages
exports.createMessage = catchAsync( async (req, res, next) => {
	const filteredBody = messageDto.filterBody(req.body) 	// <= [ 'message', 'type', 'sender', 'receiver', ]

	// if image
	if(filteredBody.type === 'image') {
		const { error, url } = await fileService.handleBase64File(filteredBody.message, '/messages', 'image')
		if(error) return next(appError(error, 400, 'FileUploadError'))

		filteredBody.message = url 		// override message base64 dataUrl to image path
	}

	const message = await Message.create(filteredBody)

	res.status(200).json({
		status: 'success',
		data: messageDto.filterMessage(message._doc)
	})
})