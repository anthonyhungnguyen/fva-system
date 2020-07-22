import moment from 'moment'
export const getTimeNow = () => {
	return moment().local()
}
