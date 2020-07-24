import app from '../../utils/firebase'
import { getTimeNow } from '../../utils/supplement'
import moment from 'moment'

const requestDeviceStatusAndCurrentSubject = async (roomId, date, currentTime) => {
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

const checkStudentAvailable = async (subCode, stuId) => {
	return new Promise(async (resolve) => {
		const subRef = app.firestore().collection('subject').get()
		const subject = (await subRef).docs.find((s) => s.id === subCode)
		console.log(subject)
		const isFound = subject.data().studentList.includes(stuId)
		resolve(isFound)
	})
}

// const checkRoomAvailable = async (roomID) => {
// 	return new Promise(async (resolve) => {
// 		const deviceRef = app.firestore().collection('device').get()
// 		const flag = (await deviceRef).docs.find((d) => d.data()['room'] === roomID)
// 		resolve(flag)
// 	})
// }

const checkAttendance = async (roomId, stuId) => {
	return new Promise(async (resolve) => {
		// const roomFlag = await checkRoomAvailable(roomId)
		// if (!roomFlag) {
		// 	resolve({ result: 'error', message: `Room ID doesn't exist` })
		// }
		await requestDeviceStatusAndCurrentSubject(roomId).then(async ({ currentSubject, code }) => {
			if (currentSubject) {
				const flag = await checkStudentInList(currentSubject, stuId)
				if (flag) {
					await tickAttendance(currentSubject, stuId)
					resolve({
						result: 'success',
						message: `Goto fva.now.sh with ${code} to check`,
						currentSubject: currentSubject
					})
				} else {
					resolve({
						result: 'error',
						message: 'You do not belong to this class',
						currentSubject: currentSubject
					})
				}
			}
			resolve({ result: 'error', message: 'No class is taking place right now!' })
		})
	})
}

const tickAttendance = async (subCode, stuId) => {
	const now = getTimeNow()
	const today = moment(now).format('DD-M-YYYY')
	const repRef = app.firestore().collection('report').doc(today).get()
	const studentList = (await repRef).data()
	studentList[subCode][stuId] = { hasCheck: true, recordedAt: now }
	app.firestore().collection('report').doc(today).set(studentList, { merge: true })
}

export default async (req, res) => {
	const { roomId, stuId } = req.body
	await checkAttendance(roomId, stuId).then(res.json)
}
