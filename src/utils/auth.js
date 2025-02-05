export function getToken() {
  return sessionStorage.getItem('token')
}

export function setToken(token, rememberMe) {
  sessionStorage.setItem('token', token)
}

export function removeToken() {
  sessionStorage.removeItem('token')
}
