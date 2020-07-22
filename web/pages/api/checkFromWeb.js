import app from '../../utils/firebase'
import { getTimeNow } from '../../utils/supplement'
import moment from 'moment'

const requestDeviceStatusAndCurrentSubject = async (roomId) => {
	return new Promise(async (resolve) => {
		const now = getTimeNow()
		const currentTime = moment(now).format('hh:mm')
		const date = moment(now).format('dddd').toLowerCase()
		const devRef = app.firestore().collection('device').get()
		const data = await devRef.then((data) => data.docs.find((d) => d.data().room === roomId))
		const renderedListOfSubjectWithTime = data.data().timeline[date]
		let foundSubjectInTime = Object.keys(renderedListOfSubjectWithTime).find((d) => {
			const startTime = moment(renderedListOfSubjectWithTime[d][0], 'hh:mm')
			const endTime = moment(renderedListOfSubjectWithTime[d][1], 'hh:mm')
			const currenTime_N = moment(currentTime, 'hh:mm')
			return currenTime_N >= startTime && currenTime_N <= endTime
		})

		resolve({
			currentSubject: foundSubjectInTime,
			code: data.data().code
		})
	})
}

const checkStudentInList = async (subCode, stuId) => {
	return new Promise(async (resolve) => {
		const subRef = app.firestore().collection('subject').get()
		const subject = (await subRef).docs.find((s) => s.id === subCode)
		const isFound = subject.data().studentList.includes(stuId)
		resolve(isFound)
	})
}

const checkAttendance = async (roomId, password, stuId) => {
	return new Promise(async (resolve) => {
		const { currentSubject, code } = await requestDeviceStatusAndCurrentSubject(roomId)
		if (currentSubject) {
			if (password !== code) {
				resolve({ result: 'error', message: `Wrong password, please re-do agan'` })
			}
			const flag = await checkStudentInList(currentSubject, stuId)
			if (flag) {
				resolve({
					result: 'success',
					message: `Success`,
					subCode: currentSubject
				})
			} else {
				resolve({ result: 'error', message: 'You do not belong to this class' })
			}
		}
		resolve({
			result: 'error',
			message: 'No class is taking place right now!'
		})
	})
}

export default async (req, res) => {
	const { roomId, password, stuId } = req.body
	await checkAttendance(roomId, password, stuId).then(res.json)
}
