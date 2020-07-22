import app from '../../utils/firebase'
import { transferDayToRealWeekDay, getTimeNow } from '../../utils/supplement'

const queryListOfHours = (id, dayOfWeek) => {
	return new Promise(async (resolve) => {
		const devRef = app.firestore().collection('device').get()
		const data = (await devRef).docs.find((d) => Number(d.id) === id)
		const toReturn = data.data().timeline[dayOfWeek]
		resolve(toReturn)
	})
}

const createTodaySubjectsReport = (subjectCode, stuList) => {
	const now = getTimeNow()
	const today = moment(now).format('DD-M-YYYY')
	const toInput = {}
	stuList.forEach((stu) => (toInput[stu] = { hasCheck: false, recordedAt: null }))
	app.firestore().collection('report').doc(today).set(
		{
			[subjectCode]: toInput
		},
		{ merge: true }
	)
}

const queryStudentsListBasedOnSubjectCode = (subjectCode) => {
	return new Promise(async (resolve) => {
		const subRef = app.firestore().collection('subject').get()
		const stuList = (await subRef).docs.find((d) => d.id === subjectCode)
		resolve(stuList.data()['studentList'])
	})
}
export default async (req, res) => {
	const { id } = req.body
	const now = getTimeNow()
	const dayOfWeek = moment(now).format('dddd').toLowerCase()
	await queryListOfHours(id, dayOfWeek).then((data) =>
		Object.keys(data).forEach(async (sCode) => {
			await queryStudentsListBasedOnSubjectCode(sCode).then((stuList) =>
				createTodaySubjectsReport(sCode, stuList)
			)
		})
	)
	res.send('Success')
}
