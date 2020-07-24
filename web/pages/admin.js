import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Head from 'next/head'
import moment from 'moment'

const Admin = () => {
	const [ availableDates, setAvailableDates ] = useState([])
	const [ tables, setTables ] = useState(null)
	const [ isScheduleCreated, setIsScheduleCreated ] = useState(false)

	useEffect(
		() => {
			const getAvailableDates = async () => {
				const response = await axios.get('/api/fetchAvailableDates')
				setAvailableDates(response.data)
			}
			const checkNeedCreatingSchedule = () => {
				const isCreated = availableDates.includes(moment().format('DD-M-YYYY'))
				setIsScheduleCreated(isCreated)
			}
			if (availableDates.length === 0) {
				getAvailableDates()
			} else {
				checkNeedCreatingSchedule()
			}
		},
		[ availableDates ]
	)

	const createSchedule = async () => {
		await axios.post('/api/create', {
			id: 0
		})
	}

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
				<title>FVA - Admin</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<div className='bg-blue-300'>
				<div className='flex flex-col h-screen'>
					<div className='flex justify-around mt-2'>
						<button
							onClick={() => createSchedule()}
							className={
								isScheduleCreated ? (
									'p-4 bg-gray-600 text-lg font-bold text-gray-500 w-1/3'
								) : (
									'p-4 bg-white text-lg font-bold'
								)
							}
							disabled={isScheduleCreated}
						>
							Create today schedule
						</button>

						<select
							onChange={async (e) => {
								await generateReport(e.target.value)
							}}
							className='p-3 w-1/3'
						>
							{availableDates.map((a) => <option value={a}>{a}</option>)}
						</select>
					</div>
					<div className='flex justify-center items-center h-screen'>{tables}</div>
				</div>
			</div>
		</div>
	)
}

export default Admin
