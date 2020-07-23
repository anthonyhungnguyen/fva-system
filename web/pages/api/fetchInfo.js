import app from '../../utils/firebase'
import moment from 'moment'

const processUnixTime = (unixTimeStamp) => {
	const date = new Date(unixTimeStamp * 1000)
	if (process.env.NODE_ENV === 'production') {
		date.setTime(date.getTime() + 7 * 60 * 60 * 1000)
	}
	const formattedTime = moment(date).format('DD-MM-YYYY HH:MM')
	return formattedTime
}

export default async (req, res) => {
	const { stuId, subCode } = req.body
	const stuRef = app.firestore().collection('student').get().docs
	const choosenStu = (await stuRef).docs.find((d) => d.id === stuId)

	const subRef = app.firestore().collection('subject').get()
	const choosenSub = (await subRef).docs.find((d) => d.id === subCode)

	const today = moment(new Date()).format('DD-M-YYYY')
	const repRef = app.firestore().collection('report').get()
	const choosenRep = (await repRef).docs.find((d) => d.id === today)
	let formattedTime = null
	if (choosenRep.data()[subCode][stuId]['recordedAt']) {
		formattedTime = processUnixTime(choosenRep.data()[subCode][stuId]['recordedAt']['seconds'])
	}
	res.json({
		studentName: choosenStu.data().name,
		subjectName: choosenSub.data().name,
		subjectInstructor: choosenSub.data().instructor,
		recordedAt: formattedTime
	})
}
