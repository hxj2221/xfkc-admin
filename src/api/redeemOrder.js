import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/redeemOrder',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/redeemOrder/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/redeemOrder',
    method: 'put',
    data
  })
}

export function agree(params) {
  return request({
    url: 'api/redeemOrder/confirm',
    method: 'put',
    params
  })
}

export function reject(params) {
  return request({
    url: '/api/redeemOrder/reject',
    method: 'put',
    params
  })
}

export default { add, edit, del, agree }
