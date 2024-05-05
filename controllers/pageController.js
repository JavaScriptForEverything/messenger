const User = require('../models/userModel')
const userDto = require('../dtos/userDto')
const { isValidObjectId } = require('mongoose')

exports.register = (req, res, next) => {
	const payload = {
		title: 'Register Page',
	}

	res.render('page/register', payload)
}
exports.login = (req, res, next) => {
	const payload = {
		title: 'Login Page',
	}

	res.render('page/login', payload)
}

exports.home = async (req, res, next) => {
	try {
		const userId = req.userId
		const logedInUser = await User.findById( userId )
		// Problem: virtual property 'fullName' not populated

		const filteredUser = userDto.filterUser(logedInUser._doc)

		const payload = {
			// title: 'Home Page | updated',
			// title: logedInUser._id.toString().slice(8),
			title: `Home | ${logedInUser.firstName} ${logedInUser.lastName}`,
			userId,
			logedInUser: filteredUser,
			logedInUserJs: JSON.stringify( filteredUser )
		}

		res.render('page/home', payload)

	} catch (error) {
		console.log(error)
		res.redirect('/login')
	}
}



// GET /user 				: self-profile 
// GET /user/:id   	: Other users profile
exports.profile = async (req, res, next) => {
	try {
		const logedInUserId = req.userId 	
		let logedInUserFilter = isValidObjectId(logedInUserId) ? { _id: logedInUserId } : { username: logedInUserId }
		const logedInUser = await User.findOne( logedInUserFilter )
		if(!logedInUser) return new Error(`logedInUser not found`)

		const profileUserId = req.params.id || req.userId 	// comes from authController.protect middleware
		let profileUserFilter = isValidObjectId(profileUserId) ? { _id: profileUserId } : { username: profileUserId }
		const profileUser = await User.findOne( profileUserFilter )
		if(!profileUser) return new Error(`profileUser not found`)


		// const userId = req.params.id || req.userId 	// comes from authController.protect middleware
		// let filter = isValidObjectId(userId) ? { _id: userId } : { username: userId }
		// const logedInUser = await User.findOne( filter )

		// const filteredLogedInUser = userDto.filterUser(logedInUser._doc)
		// const filteredProfileUser = userDto.filterUser(profileUser._doc)

		const payload = {
			title: `Profile | ${profileUser.firstName} ${profileUser.lastName}`,
			logedInUser,
			logedInUserJs: JSON.stringify( logedInUser ),
			profileUser,
			profileUserJs: JSON.stringify( profileUser ),

			// logedInUser: filteredLogedInUser,
			// logedInUserJs: JSON.stringify( filteredLogedInUser ),
			// profileUser: filteredProfileUser,
			// profileUserJs: JSON.stringify( filteredProfileUser ),
		}

		res.render('./page/profile', payload)
		
	} catch (err) {
		console.log(err)
		res.render('./page/notFound')	
	}
}




// Demo page: for testing to show audio-player
exports.customAudioPlayer = (req, res, next) => {
	const payload = {
		title: 'Custom Audio Player Page',
	}

	res.render('page/custom-audio-player', payload)
}

// Demo page: for testing drag-and-drop files
exports.dragAndDrop = (req, res, next) => {
	const payload = {
		title: 'Drag and Drop file handler',
	}

	res.render('page/drag-and-drop', payload)
}
exports.demo = (req, res, next) => {
	const payload = {
		title: 'Demo Page',
	}

	res.render('page/demo', payload)
}