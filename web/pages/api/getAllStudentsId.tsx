import { NextApiResponse, NextApiRequest } from 'next'
import app from '../../utils/firebase'

const requestStudents = async (): Promise<string[]> => {
	return new Promise(async (resolve) => {
		const stuRef = app.firestore().collection('student').get()
		const data = await stuRef.then((data) => data.docs.map((d) => d.id))
		resolve(data)
	})
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
	await requestStudents().then(res.json)
}
