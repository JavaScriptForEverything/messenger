const { Router } = require('express')
const authController = require('../controllers/authController')

// /api/auth/register
const router = Router()

	router.route('/register')
		.post(authController.register)

module.exports = router