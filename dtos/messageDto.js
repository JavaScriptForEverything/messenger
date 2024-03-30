/* DTO = Data Transfer Object */
const { filterObjectByArray } = require('../utils')


exports.filterBody = (body) => {
	const allowedFields = [
		'message',
		'type',
		'chat', 					// chatId
		'sender', 				// userId
		// 'users',
	]

	return filterObjectByArray(body, allowedFields)
}

exports.filterMessage = (message) => {
	const allowedFields = [
		'message',
		'type',
		'chat', 					// chatId
		'sender', 				// userId
		
		'_id',
		'id',
		'createdAt',
	]
	return filterObjectByArray(message, allowedFields)
}

