exports.getAllUsers = (req, res, next) => {

	const users = [
		{
			id: 1,
			name: 'riajul'
		}
	]

	res.status(200).json({
		status: 'success',
		users 	
	})
}