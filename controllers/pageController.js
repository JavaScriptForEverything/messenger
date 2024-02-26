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

exports.demo = (req, res, next) => {
	const payload = {
		title: 'Demo Page',
	}

	res.render('page/demo', payload)
}