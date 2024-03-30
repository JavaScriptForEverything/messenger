const tempUserIds = [
  "6603b309c39dffe6f5a3aba6",
  "6606b8c47844a6763050de3c",
	"6606f381e629d675c08c85b8",
	"6606f3a6e629d675c08c85ba"
]
export const getFilteredUsers = async (userIds) => {
	userIds = tempUserIds
	try {
		const res = await fetch(`/api/users/filtered-users`, {
			method: 'POST',
			body: JSON.stringify({ userIds }),
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			}
		})
		if( !res.ok ) throw await res.json()

		return await res.json()

	} catch (error) {
		return error
	}

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