import React, { useState } from 'react'
import Head from 'next/head'

export default function Home() {
	const [flag, setFlag] = useState(false)
	const [hasError, setHasError] = useState(false)
	const [hasChecked, setHasChecked] = useState(false)
	return (
		<div className='container'>
			<Head>
				<title>Face Voice Attendance</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='w-screen h-screen bg-blue-400 flex justify-center items-center'>
				{flag ? (
					<form className='relative p-2 mt-2 w-1/4'>
						{hasError ? (
							<p className='text-xl text-red-500 text-center border-4 border-red-500 my-3 p-3 font-bold rounded-lg'>
								Please recheck all fields again!
							</p>
						) : null}
						<input
							type='text'
							className='w-full text-2xl py-1 bg-transparent border-b-2 border-white outline-none text-white placeholder-white'
							placeholder='enter your room'
							id='room'
						></input>
						<input
							type='password'
							className='w-full text-2xl py-1 bg-transparent border-b-2 border-white outline-none placeholder-white mt-5  text-white'
							placeholder='password'
							id='password'
						></input>
						<input
							className='w-full text-2xl py-1 bg-transparent border-b-2 border-white outline-none placeholder-white mt-5 text-white'
							placeholder='student ID'
							id='student ID'
						></input>
						<button className='float-right py-2 px-5 border-2 border-white mt-4 uppercase font-bold text-white text-center'>
							Next
						</button>
					</form>
				) : hasChecked ? (
					<div className='w-1/4 bg-white border-2 border-white shawdow-2xl p-2 text-center rounded-md'>
						<span className='text-2xl font-bold my-3'>Successfully</span>
						<p className='text-xl my-3'>Nguyễn Phúc Hưng</p>
						<div className='flex flex-col'>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2 text-center'>Course</p>
								<p className='inline w-1/2'>Practice on SE</p>
							</div>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2 text-center'>Instructor</p>
								<p className='inline w-1/2'>Dr. Quan Thanh Tho</p>
							</div>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2'>Timeline</p>
								<p className='inline w-1/2'>4:30 March, 21st, 2020</p>
							</div>
						</div>
					</div>
				) : (
					<div className='w-1/4 bg-white border-2 border-white shawdow-2xl p-2 text-center rounded-md'>
						<span className='text-2xl font-bold my-3'>Failed</span>
						<p className='text-xl my-3'>Nguyễn Phúc Hưng</p>
						<div className='flex flex-col'>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2 text-center'>Course</p>
								<p className='inline w-1/2'>Practice on SE</p>
							</div>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2 text-center'>Instructor</p>
								<p className='inline w-1/2'>Dr. Quan Thanh Tho</p>
							</div>
							<div className='flex w-full my-3'>
								<p className='inline font-bold w-1/2'>Timeline</p>
								<p className='inline w-1/2'>Not yet</p>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}
