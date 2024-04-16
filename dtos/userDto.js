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


// POST : to create user
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

// GET : return user._doc
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


// PATCH : to update user._doc
exports.filterBodyForUpdate = (body) => {
	const allowedFields = [
		'firstName',
		'lastName',
		'username',
		'avatar',
		'coverPhoto',

		// 'email', 								// update seperate route to verify email
		// 'isActive', 							// only update when user need lock/delete account
		// 'password', 							// need seperately because: delete/update tokens, hash password, force user to relogin 
		// 'updatedAt', 						// 

		// 'id', 										// never allow to modify
		// '_id',
		// 'createdAt',
	]
	return filterObjectByArray(body, allowedFields)
}

