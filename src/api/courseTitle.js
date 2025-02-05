import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/courseTitle',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/courseTitle/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/courseTitle',
    method: 'put',
    data
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
// 课程分类
export function getgrade(val) {
  const params = {
    category: val
  }
  return request({
    url: '/api/courseCategory/findByCategory',
    method: 'get',
    params
  })
}
export default { add, edit, del, check, getgrade }
