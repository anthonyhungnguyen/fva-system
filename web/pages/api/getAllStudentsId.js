import app from '../../utils/firebase'

const requestStudents = async () => {
	return new Promise(async (resolve) => {
		const stuRef = app.firestore().collection('student').get()
		const data = await stuRef.then((data) => data.docs.map((d) => d.id))
		resolve(data)
	})
}

export default async (req, res) => {
	await requestStudents().then(res.json)
}
