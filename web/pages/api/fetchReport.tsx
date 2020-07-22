// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiResponse, NextApiRequest } from 'next'
import app from '../../utils/firebase'

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { date } = req.body
	const reportRef = await app.firestore().collection('report').get()
	const choosenDate = (await reportRef).docs.find((d) => d.id === date).data()
	res.send(choosenDate)
}
