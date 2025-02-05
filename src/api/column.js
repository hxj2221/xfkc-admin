import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/specialColumn/save',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/specialColumn/delete',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/specialColumn/update',
    method: 'post',
    data
  })
}

/** 获取专栏下拉列表 */
export function getList() {
  return request({
    url: 'api/specialColumn/querySpecialColumnDropDown',
    method: 'post'
  })
}

/** 移动专栏位置 */
export function move(id, type) {
  return request({
    url: `api/specialColumn/move?id=${id}&moveType=${type === 'up' ? 1 : 2}`,
    method: 'put'
  })
}
export default { add, edit, del }
