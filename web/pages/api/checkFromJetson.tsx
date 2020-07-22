// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from 'next'
import app from '../../utils/firebase'
import { transferDayToRealWeekDay, getTimeNow } from '../../utils/supplement'

interface deviceStat {
	currentSubject: string[]
	code: string
}

const requestDeviceStatusAndCurrentSubject = async (
	roonId: number,
	date: string,
	currentTime: string
): Promise<deviceStat> => {
	return new Promise(async (resolve) => {
		let currentSubject = undefined
		const devRef = app.firestore().collection('device').get()
		const data = await devRef.then((data) => data.docs.find((d) => d.data().room === roonId))
		const renderedListOfSubjectWithTime = data.data().timeline[date]
		const foundSubjectInTime = Object.keys(renderedListOfSubjectWithTime).find((d) => {
			const currentHM = currentTime
			const currentHMSplit = currentHM.split(':')
			const currentSeconds = +currentHMSplit[0] * 60 * 60 + +currentHMSplit[1] * 60
			const checkHMStart = renderedListOfSubjectWithTime[d][0]
			const checkHMSplitStart = checkHMStart.split(':')
			const checkSecondsStart = +checkHMSplitStart[0] * 60 * 60 + +checkHMSplitStart[1] * 60

			const checkHMEnd = renderedListOfSubjectWithTime[d][1]
			const checkHMSplitEnd = checkHMEnd.split(':')
			const checkSecondsEnd = +checkHMSplitEnd[0] * 60 * 60 + +checkHMSplitEnd[1] * 60
			return checkSecondsStart <= currentSeconds && currentSeconds <= checkSecondsEnd
		})
		if (foundSubjectInTime) {
			currentSubject = [
				foundSubjectInTime,
				`${renderedListOfSubjectWithTime[foundSubjectInTime][0]}-${renderedListOfSubjectWithTime[
					foundSubjectInTime
				][1]}`
			]
		}

		resolve({
			currentSubject: currentSubject,
			code: data.data().code
		})
	})
}

const checkStudentInList = async (subCode: string, stuId: string) => {
	return new Promise(async (resolve) => {
		const subRef = app.firestore().collection('subject').get()
		const subject = (await subRef).docs.find((s) => s.id === subCode)
		const isFound = subject.data().studentList.includes(stuId)
		resolve(isFound)
	})
}

const checkAttendance = async (roomId: number, stuId: string) => {
	return new Promise(async (resolve) => {
		const now = getTimeNow()
		let renderedTodayHHMM = ''
		if (now.getMinutes() < 10) {
			renderedTodayHHMM = `${now.getHours()}:0${now.getMinutes()}`
		} else {
			renderedTodayHHMM = `${now.getHours()}:${now.getMinutes()}`
		}
		const renderedDate = transferDayToRealWeekDay(now.getDay())
		await requestDeviceStatusAndCurrentSubject(
			roomId,
			renderedDate,
			renderedTodayHHMM
		).then(async ({ currentSubject, code }) => {
			if (currentSubject) {
				const firstFlag = await checkStudentInList(currentSubject[0], stuId)
				if (firstFlag) {
					await tickAttendance(currentSubject[0], stuId)
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
			resolve({ result: 'error', message: 'No class is taking place right now!', renderedTodayHHMM })
		})
	})
}

const tickAttendance = async (subCode: string, stuId: string) => {
	const now = getTimeNow()
	const today = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`
	const repRef = app.firestore().collection('report').doc(today).get()
	const studentList = (await repRef).data()
	studentList[subCode][stuId] = { hasCheck: true, recordedAt: now }
	app.firestore().collection('report').doc(today).set(studentList, { merge: true })
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { roomId, stuId } = req.body
	await checkAttendance(roomId, stuId).then(res.json)
}
