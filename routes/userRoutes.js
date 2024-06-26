const { Router } = require('express')
const userController = require('../controllers/userController')
const authController = require('../controllers/authController')

// /api/users
const router = Router()

	router.route('/friends')
		.get(authController.protect, userController.getAllFriends)


	router.route('/filtered-users')
		.post( authController.protect, userController.getFilteredUsers)

	router.route('/')
		.get(userController.getAllUsers)

	router.route('/:id')
		.get(userController.getUserById)
		.patch(userController.updateUserById)

	router.route('/:id/photos')
		.patch(authController.protect, userController.updateUserPhotos)

	router.route('/:id/follow-unfollow')
		.patch(authController.protect, userController.toggleFollow)

	router.route('/:id/followers-followings')
		.get(authController.protect, userController.getFollowFollowing)

module.exports = router