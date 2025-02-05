import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/hardware',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/hardware/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/hardware',
    method: 'put',
    data
  })
}

export default { add, edit, del }
