export const getFilteredUsers = async (users) => {
	

	console.log('http', users)
	
	
	// fetch(`/api/users/filtered-users`)
	const res = await fetch(`/api/users/`)
	return await res.json()

}

export const logout = async () => {
	try {
		const res = await fetch(`/api/auth/logout`)
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}
}