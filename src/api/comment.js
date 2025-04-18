import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/comment',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/comment/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/comment',
    method: 'put',
    data
  })
}

export function pass(data) {
  return request({
    url: 'api/comment/check',
    method: 'put',
    data
  })
}
export default { add, edit, del, pass }
