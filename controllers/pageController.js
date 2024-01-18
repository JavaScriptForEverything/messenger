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