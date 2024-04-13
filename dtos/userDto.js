const { filterObjectByArray } = require('../utils')

/* DTO = Data Transfer Object
	- To modify or alter any property of an object before send to client.

		- like do don't need all the property to send back to user, just need
				cupple of then so we need only send those only.

		- if we need to modify or alter any property name before send to client
				not modify in database level than can be done in DTO.

				doc = {
					_id,
					createdAt,
					updatedAt,
					_v,
					id
					...
				}

				dto = {
					_id,
					createdAt,
					id
					...
				}

*/


exports.filterBody = (body) => {
	const allowedFields = [
		'firstName',
		'lastName',
		'email',
		'username',
		'password',
		'confirmPassword',
		'avatar',
	]

	return filterObjectByArray(body, allowedFields)
}

exports.filterUser = (user) => {
	const allowedFields = [
		'firstName',
		'lastName',
		'fullName',
		'email',
		'username',
		// 'password',
		// 'confirmPassword',
		'latestMessage',
		'avatar',
		'coverPhoto',
		'isActive',

		'id',
		'_id',
		'createdAt',
	]
	return filterObjectByArray(user, allowedFields)
}

