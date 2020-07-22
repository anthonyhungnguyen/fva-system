import { AppProps } from 'next/app'
import '../assets/styles/index.css'
import 'react-calendar/dist/Calendar.css'

function MyApp({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}

export default MyApp
