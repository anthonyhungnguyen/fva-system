// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from 'next'
import app from '../../utils/firebase'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const reportRef = app.firestore().collection('report').get()
	const availableDates = (await reportRef).docs.map((d) => d.id)
	res.send(availableDates)
}
