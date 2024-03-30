/* DTO = Data Transfer Object */
const { filterObjectByArray } = require('../utils')


exports.filterBody = (body) => {
	const allowedFields = [
		'users', 				// at least 2 users of array
		'name', 				// optional
		'isOpened', 		// optional
		// 'isGroup', 	// readonly  : add this property only users.length >= 3
	]

	return filterObjectByArray(body, allowedFields)
}

exports.filterChat = (chat) => {
	const allowedFields = [
		'name',
		'users', 				// [ userId ]
		'isGroup', 			
		'isOpened', 			
		'latestMessage', 			
		
		'_id',
		'id',
		'createdAt',
		// 'updatedAt',
	]
	return filterObjectByArray(chat, allowedFields)
}


