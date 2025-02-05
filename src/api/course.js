import request from '@/utils/request'

export function list(params) {
  return request({
    url: 'api/course',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/course',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/course/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/course',
    method: 'put',
    data
  })
}

// 查询待审核课程列表
export function examine(params) {
  return request({
    url: 'api/courseTitle/queryUnCheckedAll',
    method: 'get',
    params
  })
}

// 审核课程
export function check(data) {
  return request({
    url: 'api/courseTitle/check',
    method: 'put',
    data
  })
}
export default { list, add, edit, del, examine }
