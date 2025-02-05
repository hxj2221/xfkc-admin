import request from '@/utils/request'

/** 获取投票活动主题列表 */
export function getList(params, data) {
  return request({
    url: 'api/activity/query',
    method: 'post',
    params,
    data
  })
}
export function getDetail(params) {
  return request({
    url: 'api/activity/detail',
    method: 'get',
    params
  })
}
export function updateStatus(data) {
  return request({
    url: 'api/activity/updateStatus',
    method: 'post',
    data
  })
}
export function add(data) {
  return request({
    url: 'api/activity',
    method: 'post',
    data
  })
}

export function edit(data) {
  return request({
    url: 'api/activity',
    method: 'put',
    data
  })
}
export default { add, edit }
