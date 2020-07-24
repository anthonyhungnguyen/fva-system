import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Head from 'next/head'
import moment from 'moment'

const Admin = () => {
	const [ availableDates, setAvailableDates ] = useState([])
	const [ tables, setTables ] = useState(null)

	useEffect(() => {
		const getAvailableDates = async () => {
			const response = await axios.get('/api/fetchAvailableDates')
			const data = response.data.sort((a, b) => moment(b, 'DD-M-YYYY') - moment(a, 'DD-M-YYYY'))
			setAvailableDates(data)
		}
		getAvailableDates()
	}, [])

	const generateReport = async (choosenDate) => {
		const haveDate = availableDates.includes(choosenDate)
		if (haveDate) {
			const response = await axios.post('/api/fetchReport', { date: choosenDate })
			const data = response.data
			const tables = generateTable(data)
			setTables(tables)
		}
	}

	const generateTable = (data) => {
		const everyTR = Object.keys(data).map((i, v) => {
			const course = i
			const studentIDs = Object.keys(data[i])
			const hasChecked = Object.values(data[i]).map((e) => e['hasCheck'])
			const recordedAt = Object.values(data[i]).map((e) => {
				if (e['recordedAt']) {
					const date = new Date(e['recordedAt']['seconds'] * 1000)
					const formatDate = moment(date).format('DD-M-YYYY')
					return formatDate
				}
				return null
			})
			return (
				<tr key={v}>
					<td className='border-4 px-4 py-2'>{course}</td>
					<td className='border-4 px-4 py-2'>
						<ul>
							{studentIDs.map((s, k) => (
								<li key={k} className='px-4 py-2'>
									{s}
								</li>
							))}
						</ul>
					</td>
					<td className='border-4 px-4 py-2'>
						<ul>
							{hasChecked.map((s, k) => (
								<li key={k} className='px-4 py-2'>
									{s ? 'YES' : 'Not Yet'}
								</li>
							))}
						</ul>
					</td>
					<td className='border-4 px-4 py-2'>
						<ul>
							{recordedAt.map((s, k) => (
								<li key={k} className='px-4 py-2'>
									{s ? s : 'Not Yet'}
								</li>
							))}
						</ul>
					</td>
				</tr>
			)
		})
		return (
			<table className='table-auto text-center text-lg bg-white'>
				<thead>
					<tr>
						<th className='border-4 px-4 py-2'>Course ID</th>
						<th className='border-4 px-4 py-2'>ID</th>
						<th className='border-4 px-4 py-2'>Has Checked</th>
						<th className='border-4 px-4 py-2'>Recorded At</th>
					</tr>
				</thead>
				<tbody>{everyTR}</tbody>
			</table>
		)
	}
	return (
		<div>
			<Head>
				<title>FVA - Report</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='bg-blue-300'>
				<div className='flex flex-col h-screen'>
					<div className='flex justify-around mt-2'>
						<select
							onChange={async (e) => {
								await generateReport(e.target.value)
							}}
							className='p-3'
						>
							{availableDates.map((a, k) => (
								<option value={a} key={k}>
									{a}
								</option>
							))}
						</select>
					</div>
					<div className='flex justify-center items-center h-screen'>{tables}</div>
				</div>
			</div>
		</div>
	)
}

export default Admin
