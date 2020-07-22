import app from '../../utils/firebase'

export default async (req, res) => {
	const reportRef = app.firestore().collection('report').get()
	const availableDates = (await reportRef).docs.map((d) => d.id)
	res.send(availableDates)
}
