import { login, logout, getInfo, loginConfirm, resetPwd } from '@/api/login'
import { getToken, removeToken, setToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 登录
    Login({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password, userInfo.verifycode).then(response => {
          const data = response.data
          setToken(data.obj)
          commit('SET_TOKEN', data.obj)
          setToken(response.data.obj)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 确认登录
    LoginConfirm({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginConfirm(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data.obj)
          commit('SET_TOKEN', data.obj)
          setToken(response.data.obj)
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          const data = response.data
          if (data.roles && data.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', data.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_NAME', data.userName)
          commit('SET_AVATAR', data.avatar)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 重置当前用户密码
    ResetPwd({ commit }, pwdInfo) {
      return new Promise((resolve, reject) => {
        resetPwd(pwdInfo.username, pwdInfo.oldPwd, pwdInfo.newPwd, pwdInfo.confirmNewPwd).then(response => {
          resolve(response.data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
