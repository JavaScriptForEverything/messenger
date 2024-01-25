exports.getAllUsers = (req, res, next) => {

	const users = [
		{
			id: 1,
			name: 'riajul'
		}
	]



	setTimeout(() => {
		
	res.status(200).json({
		status: 'success',
		users 	
	})
	}, 3000);
}