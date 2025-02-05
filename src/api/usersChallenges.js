import request from '@/utils/request'

export function add(data) {
  return request({
    url: 'api/usersChallenges',
    method: 'post',
    data
  })
}

export function del(ids) {
  return request({
    url: 'api/usersChallenges/',
    method: 'delete',
    data: ids
  })
}

export function edit(data) {
  return request({
    url: 'api/usersChallenges',
    method: 'put',
    data
  })
}

export function agree(data) {
  return request({
    url: 'api/usersChallenges/pass',
    method: 'post',
    data
  })
}

export function refuse(data) {
  return request({
    url: 'api/usersChallenges/fail',
    method: 'post',
    data
  })
}

export default { add, edit, del, agree, refuse }
