const { Router } = require('express')
const authController = require('../controllers/authController')

// /api/auth/
const router = Router()

	router
		.post('/register', authController.register)
		.post('/login', authController.login)
		.get('/logout', authController.protect, authController.logout)

module.exports = router