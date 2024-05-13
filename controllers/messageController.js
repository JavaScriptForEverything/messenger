const { promisify } = require('node:util')
const { isValidObjectId } = require('mongoose')
const { apiFeatures } = require('../utils')
const { catchAsync, appError } = require('./errorController')
const messageDto = require('../dtos/messageDto')
const fileService = require('../services/fileService')
const User = require('../models/userModel')
const Message = require('../models/messageModel')
const Notification = require('../models/notificationModel')

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

// GET /api/messages/chats
exports.getAllChatMessages = catchAsync( async (req, res, next) => {
	const { sender='', receiver='' } = req.query
	if(!sender || !receiver) return next(appError('sender ID and receiver ID required'))

	const filter = {
		$or : [
			{ sender, receiver },
			{ sender: receiver, receiver: sender },
		]
	}
	const messages = await apiFeatures(Message, req.query, filter)

	// setTimeout(() => {
		
	res.status(200).json({
		status: 'success',
		count: messages.length,
		data: messages.map( message => messageDto.filterMessage(message._doc)) 
	})

	// }, 1000);
})


// POST /api/messages 
exports.createMessage = catchAsync( async (req, res, next) => {
	const filteredBody = messageDto.filterBody(req.body) 	// <= [ 'message', 'type', 'sender', 'receiver', ]

	// if message = image
	if(filteredBody.type === 'image') {
		const { error, url } = await fileService.handleBase64File(filteredBody.message, '/messages/images', 'image')
		if(error) return next(appError(error, 400, 'FileUploadError'))

		filteredBody.message = url 		// override message base64 dataUrl to image path
	}

	// if message = audio
	if(filteredBody.type === 'audio') {
		const { error, url } = await fileService.handleBase64File(filteredBody.message, '/messages/audios', 'audio')
		if(error) return next(appError(error, 400, 'FileUploadError'))

		filteredBody.message = url 		// override message base64 dataUrl to image path
	}

	try {
		// if(true) throw new Error('creating message failed') 
		const message = await Message.create(filteredBody)
		if(!message) throw new Error('creating message failed') 

		// await User.populate(message, 'sender', 'avatar') 	// filter not working
		await User.populate(message, { 												// => Object notation works
			path: 'sender',
			select: 'avatar'
		}) 	

		
		// Add User.latestMessage to receiver: which will be viewd in friendsList as soon as he got message
		const receiver = filteredBody.receiver 		// no need to check, because if .create() failed then Schema handle error
		const updatedUser = await User.findByIdAndUpdate(receiver, { latestMessage: message.id }, { new: true })
		if(!updatedUser) throw new Error('receiver user latestMessage update failed') 


		// const notification = await Notification.createNotification({
		// 	entryId: message._id, 									// Who which message this notification belongs to
		// 	userFrom: filteredBody.sender, 					// Who liked it ?
		// 	userTo: filteredBody.receiver, 					// which user create this tweet ?
		// 	type: 'new-message', 										// ['new-message', 'follow', 'call']
		// })


		res.status(200).json({
			status: 'success',
			data: {
				message: messageDto.filterMessage(message._doc),
				notification: {}
			}
		})

	} catch (err) {

		// jimp (image cropper) take some time to crop, so delay a for 1s
		setTimeout(() => {
			fileService.removeFile(filteredBody.message)
		}, 1000)

		next(appError(err.message)) 
	}
})

// DELETE /api/messages/:id
exports.deleteMessageById = catchAsync( async (req, res, next) => {
	const messageId = req.params.id
	if( !isValidObjectId(messageId) ) return next(appError('Not valid ObjectId'))

	/* if delete-for-me 					=> then don't delete just hide from that user
			if delete-for-every-one 	=> then delete

			and must be logedInUser to delete for everyone
	*/ 

	try {
		// const message = await Message.findById(messageId)
		const message = await Message.findByIdAndDelete(messageId)
		if(!message) throw new Error('no message found') 

		if(message.type === 'image' || message.type === 'audio') {
			const url = message.message 	// => /upload/messages/audios/1c26df24-fda8-483d-9531-414c50f7f4b2.ogg

			// fileService.removeFile(url) 						// => non-promise version
			promisify(fileService.removeFile)(url) 		// => convert to promise
		}

		res.status(200).json({
			status: 'success',
			// data: message
		})

	} catch (err) {
		next(appError(err.message)) 
	}
})

