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

exports.home = (req, res, next) => {
	const payload = {
		title: 'Home Page',
	}

	res.render('page/home', payload)
}

exports.demo = (req, res, next) => {
	const payload = {
		title: 'Demo Page',
	}

	res.render('page/demo', payload)
}