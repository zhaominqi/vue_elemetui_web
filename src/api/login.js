import request from '@/utils/request'

export function login(username, password, verifycode) {
  return request({
    url: '/system/loginUser?patchca=' + verifycode,
    method: 'post',
    data: {
      userId: username,
      password
    }
  })
}

export function loginConfirm(username, password) {
  return request({
    url: '/system/loginConfirm',
    method: 'post',
    data: {
      userId: username,
      password
    }
  })
}

export function getInfo(token) {
  return request({
    url: '/sysUser/userRole',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/system/logoutUser',
    method: 'put'
  })
}

export function resetPwd(username, oldPwd, newPwd, confirmNewPwd) {
  return request({
    url: '/system/editCurrentUserPwd',
    method: 'put',
    data: {
      userId: username,
      oldPassword: oldPwd,
      newPassword: newPwd,
      confirmPassword: confirmNewPwd
    }
  })
}

