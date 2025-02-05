import moment from 'moment'

const baseUrl = process.env.VUE_APP_BASE_API

const func = {
  url: (filename, dir = 'file') => {
    return `${baseUrl}/${dir}/${filename}`
  },
  dateFormat: (time, format) => {
    return moment(time).format(format)
  }
}

export default func
