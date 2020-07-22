export const getTimeNow = () => {
	const now = new Date()
	if (process.env.NODE_ENV === 'production') {
		now.setTime(now.getTime() + 7 * 60 * 60 * 1000)
		return now
	} else {
		return now
	}
}
