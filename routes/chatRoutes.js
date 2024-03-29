const { Router } = require('express')
const chatController = require('../controllers/chatController')

// /api/chats/
const router = Router()

	router
		.get('/:id', chatController.getChatById)

module.exports = router
