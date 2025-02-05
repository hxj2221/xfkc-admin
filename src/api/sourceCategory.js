import request from '@/utils/request'

/** 获取课程资源列表 */
export function getList(params) {
  return request({
    url: 'api/courseSource/query',
    method: 'get',
    params
  })
}
/** 获取课程资源详情 */
export function getDetail(params) {
  return request({
    url: 'api/courseSource/getById',
    method: 'get',
    params
  })
}
/** 课程资源新增 */
export function add(data) {
  return request({
    url: 'api/courseSource',
    method: 'post',
    data
  })
}
/** 课程资源编辑 */
export function edit(data) {
  return request({
    url: 'api/courseSource',
    method: 'put',
    data
  })
}
/** 课程资源编辑 */
export function del(data) {
  return request({
    url: 'api/courseSource',
    method: 'delete',
    data
  })
}

/** 获取课程资源专题列表 */
export function getColumnList(params) {
  return request({
    url: 'api/courseSourceColumn/query',
    method: 'get',
    params
  })
}
/** 根据二级分类id获取课程资源专题列表 */
export function getColumnListById(id) {
  return request({
    url: `api/courseSourceColumn/getBySourceCategoryId?sourceCategoryId=${id}`,
    method: 'get'
  })
}
/** 获取课程资源专题详情 */
export function getColumnDetail(params) {
  return request({
    url: 'api/courseSourceColumn/detail',
    method: 'get',
    params
  })
}
/** 课程资源专题新增 */
export function addColumn(data) {
  return request({
    url: 'api/courseSourceColumn',
    method: 'post',
    data
  })
}
/** 课程资源专题编辑 */
export function editColumn(data) {
  return request({
    url: 'api/courseSourceColumn',
    method: 'put',
    data
  })
}
/** 课程资源专题编辑 */
export function delColumn(ids) {
  return request({
    url: 'api/courseSourceColumn',
    method: 'delete',
    data: ids
  })
}
/** 获取课程资源分类列表 */
export function getSourceCategorList(params) {
  return request({
    url: 'api/sourceCategory/query',
    method: 'get',
    params
  })
}
/** 根据id获取课程资源分类列表 */
export function getSourceCategoryListById(id) {
  return request({
    url: `api/sourceCategory/getByParentId?id=${id}`,
    method: 'get'
  })
}
/** 获取课程资源分类详情 */
export function getSourceCategoryDetail(params) {
  return request({
    url: 'api/sourceCategory/detail',
    method: 'get',
    params
  })
}
/** 课程资源分类新增 */
export function addSourceCategory(data) {
  return request({
    url: 'api/sourceCategory',
    method: 'post',
    data
  })
}
/** 课程资源分类编辑 */
export function editSourceCategory(data) {
  return request({
    url: 'api/sourceCategory',
    method: 'put',
    data
  })
}
/** 课程资源分类编辑 */
export function delSourceCategory(ids) {
  return request({
    url: 'api/sourceCategory',
    method: 'delete',
    data: ids
  })
}
export default { add, edit, del, addColumn, editColumn, delColumn, addSourceCategory, editSourceCategory, delSourceCategory }
