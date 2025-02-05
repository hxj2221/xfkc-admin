import request from '@/utils/request'

export function getCategoryList(params) {
  return request({
    url: 'api/courseCategory',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/courseCategory',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/courseCategory/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/courseCategory',
    method: 'put',
    data
  })
}

export default { add, edit, del }
