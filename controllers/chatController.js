const Chat = require('../models/chatModel')
const { catchAsync } = require('./errorController')
const chatDto = require('../dtos/chatDto')
const { apiFeatures } = require('../utils')

// GET /api/chats
exports.getAllChats = catchAsync( async (req, res, next) => {
	const filter = {}
	const chats = await apiFeatures(Chat, req.query, filter)
		// .populate('users')
		.populate({
			path: 'users',
			select: 'avatar fullName isActive',
		})

	res.status(200).json({
		status: 'success',
		count: chats.length,
		data: chats.map( chat => chatDto.filterChat(chat._doc)) 
	})
})

// POST /api/chats
exports.createChat = catchAsync( async (req, res, next) => {

	// Step-1: only allow some fields, Don't allow to modify every fields
	const filteredBody = chatDto.filterBody(req.body)

	filteredBody.isGroup = filteredBody.users.length >= 3

	// Step-2: if a chats has same name and same number of users, then don't create another chat, instead modify it

	let chat = await Chat.findOne({ 
		name: filteredBody.name,
		users: {
			$size: filteredBody.users.length,
			$in: filteredBody.users
		}
	})

	if(!chat) chat = await Chat.create(filteredBody)


	res.status(200).json({
		status: 'success',
		data: chatDto.filterChat(chat._doc)
	})
})

exports.getChatById = (req, res, next) => {
	const chatId = req.params.id

	res.status(200).json({
		status: 'success',
		data: {}
	})
}