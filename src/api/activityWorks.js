import request from '@/utils/request'
/** 获取投票活动主题全部列表 */
// export function getAllList(params) {
//   return request({
//     url: 'api/activity/queryAll',
//     method: 'get',
//     params
//   })
// }
/** 获取投票作品列表 */
export function getList(params, data) {
  return request({
    url: 'api/activityWorks/query',
    method: 'post',
    params,
    data
  })
}
export function getDetail(params) {
  return request({
    url: 'api/activityWorks/detail',
    method: 'get',
    params
  })
}
export function add(data) {
  return request({
    url: 'api/activityWorks',
    method: 'post',
    data
  })
}

export function del(params, data) {
  return request({
    url: 'api/activityWorks',
    method: 'delete',
    params,
    data
  })
}

export function edit(data) {
  return request({
    url: 'api/activityWorks',
    method: 'put',
    data
  })
}

export default { add, edit, del }
