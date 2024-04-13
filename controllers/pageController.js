const User = require('../models/userModel')
const userDto = require('../dtos/userDto')

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
			title: 'Home Page',
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
		const userId = req.params.id || req.userId 	// comes from authController.protect middleware
		const filter = { _id: userId }
		const logedInUser = await User.findOne( filter )

		const filteredUser = userDto.filterUser(logedInUser._doc)
		const payload = {
			title: `Profile | ${logedInUser.firstName} ${logedInUser.lastName}`,
			logedInUser: filteredUser,
			logedInUserJs: JSON.stringify( filteredUser )
			// profileUser,
			// profileUserJs: JSON.stringify(profileUser),
			// timeSince
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
exports.demo = (req, res, next) => {
	const payload = {
		title: 'Demo Page',
	}

	res.render('page/demo', payload)
}