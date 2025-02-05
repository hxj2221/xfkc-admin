import request from '@/utils/request'
import qs from 'qs'

export function initData(url, params, method) {
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method
  })
}

export function download(url, params) {
  return request({
    url: url + '?' + qs.stringify(params, { indices: false }),
    method: 'get',
    responseType: 'blob'
  })
}
