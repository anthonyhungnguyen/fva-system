import app from '../../utils/firebase'

export default async (req, res) => {
	const { date } = req.body
	const reportRef = await app.firestore().collection('report').get()
	const choosenDate = reportRef.docs.find((d) => d.id === date).data()
	res.send(choosenDate)
}
