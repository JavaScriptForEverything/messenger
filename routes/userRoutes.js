const { Router } = require('express')
const userController = require('../controllers/userController')

// /api/users
const router = Router()

	router.route('/friends')
		.get(userController.getAllFriends)

	router.route('/filtered-users')
		.post(userController.getFilteredUsers)

	router.route('/')
		.get(userController.getAllUsers)

	router.route('/:id')
		.get(userController.getUserById)


module.exports = router