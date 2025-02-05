import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/school',
    method: 'post',
    data: { ...data, schoolSpecialIdList: [data.schoolSpecialIdList[1]] }
  })
}

export function del(ids) {
  return request({
    url: 'api/school/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/school',
    method: 'put',
    data: {
      ...data,
      schoolSpecialIdList: data.schoolSpecialIdList.length > 1 ? [data.schoolSpecialIdList[1]] : [data.schoolSpecialIdList[0]]
    }
  })
}

export function getList() {
  return request({
    url: '/api/dept/findSchoolList',
    method: 'get'
  })
}

export function getCategory(id) {
  return request({
    url: `/api/schoolSpecial/getSchoolSpecialByParentId?id=${id}`,
    method: 'get'
  })
}

export default { add, edit, del, getList, getCategory }
