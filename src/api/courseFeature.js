import request from '@/utils/request'

/** 获取特色课程列表 */
export function getList(params) {
  return request({
    url: 'api/courseFeature/query',
    method: 'get',
    params
  })
}
/** 获取特色课程详情 */
export function getDetail(params) {
  return request({
    url: 'api/courseFeature/getById',
    method: 'get',
    params
  })
}
/** 特色课程新增 */
export function add(data) {
  return request({
    url: 'api/courseFeature',
    method: 'post',
    data
  })
}
/** 特色课程编辑 */
export function edit(data) {
  return request({
    url: 'api/courseFeature',
    method: 'put',
    data
  })
}
/** 特色课程编辑 */
export function del(data) {
  return request({
    url: 'api/courseFeature',
    method: 'delete',
    data
  })
}

/** 获取特色课程专题列表 */
export function getColumnList(params) {
  return request({
    url: 'api/courseFeatureColumn/query',
    method: 'get',
    params
  })
}
/** 根据二级分类id获取特色课程专题列表 */
export function getColumnListById(id) {
  return request({
    url: `api/courseFeatureColumn/getByFeatureCategoryId?featureCategoryId=${id}`,
    method: 'get'
  })
}
/** 获取特色课程专题详情 */
export function getColumnDetail(params) {
  return request({
    url: 'api/courseFeatureColumn/detail',
    method: 'get',
    params
  })
}
/** 特色课程专题新增 */
export function addColumn(data) {
  return request({
    url: 'api/courseFeatureColumn',
    method: 'post',
    data
  })
}
/** 特色课程专题编辑 */
export function editColumn(data) {
  return request({
    url: 'api/courseFeatureColumn',
    method: 'put',
    data
  })
}
/** 特色课程专题编辑 */
export function delColumn(ids) {
  return request({
    url: 'api/courseFeatureColumn',
    method: 'delete',
    data: ids
  })
}

/** 获取特色课程分类列表 */
export function getFeatureCategorList(params) {
  return request({
    url: 'api/featureCategory/query',
    method: 'get',
    params
  })
}
/** 根据id获取特色课程分类列表 */
export function getFeatureCategoryListById(id) {
  return request({
    url: `api/featureCategory/getByParentId?id=${id}`,
    method: 'get'
  })
}
/** 获取特色课程分类详情 */
export function getFeatureCategoryDetail(params) {
  return request({
    url: 'api/featureCategory/detail',
    method: 'get',
    params
  })
}
/** 特色课程分类新增 */
export function addFeatureCategory(data) {
  return request({
    url: 'api/featureCategory',
    method: 'post',
    data
  })
}
/** 特色课程分类编辑 */
export function editFeatureCategory(data) {
  return request({
    url: 'api/featureCategory',
    method: 'put',
    data
  })
}
/** 特色课程分类编辑 */
export function delFeatureCategory(ids) {
  return request({
    url: 'api/featureCategory',
    method: 'delete',
    data: ids
  })
}
export default { add, edit, del, addColumn, editColumn, delColumn, addFeatureCategory, editFeatureCategory, delFeatureCategory }
