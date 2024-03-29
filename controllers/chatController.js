exports.getAllChat = (req, res, next) => {

	res.status(200).json({
		status: 'success',
		data: {}
	})
}

exports.getChatById = (req, res, next) => {
	const chatId = req.params.id

	res.status(200).json({
		status: 'success',
		data: {}
	})
}