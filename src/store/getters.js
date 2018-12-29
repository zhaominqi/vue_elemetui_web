const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  errorLogs: state => state.errorLog.logs,
  language: state => state.app.language,
  size: state => state.app.size
}
export default getters
