<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" auto-complete="on" label-position="left">
      <el-row>
        <h3 class="title">demo-template</h3>
      </el-row>
      <el-row>
        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input v-model="loginForm.username" name="username" type="text" auto-complete="on" placeholder="username" />
        </el-form-item>
      </el-row>
      <el-row>
        <el-form-item prop="password">
          <span class="svg-container">
            <svg-icon icon-class="password" />
          </span>
          <el-input
            :type="pwdType"
            v-model="loginForm.password"
            name="password"
            auto-complete="on"
            placeholder="password"/>
          <span class="show-pwd" @click="showPwd">
            <svg-icon icon-class="eye" />
          </span>
        </el-form-item>
      </el-row>
      <el-row :gutter="20">
        <el-col :span = "16">
          <el-form-item prop="verifycode">
            <!-- 注意：prop与input绑定的值一定要一致，否则验证规则中的value会报undefined，因为value即为绑定的input输入值 -->
            <el-input v-model="loginForm.verifycode" placeholder="Please input the verifyCode" class="identifyinput"/>
          </el-form-item>
        </el-col>
        <el-col :span = "6">
          <div @click="changeCode">
            <img :src="loginForm.code">
          </div>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item>
          <el-button :loading="loading" type="primary" style="width:100%;" @click.native.prevent="handleLogin">
            Sign in
          </el-button>
        </el-form-item>
      </el-row>
      <div class="tips">
        <span style="margin-right:20px;">username: admin</span>
        <span> password: admin</span>
      </div>
      <el-dialog
        :visible.sync="dialogVisible"
        :modal-append-to-body="false"
        title="密码已过期，请重新设置密码"
        width="20%">
        <span>
          <el-form ref="pwdForm" :model="pwdForm" :rules="pwdRules" class="pwd-form" auto-complete="on" label-position="left">
            <el-form-item prop="userId">
              <el-input v-model="pwdForm.username" readonly name="username" class="identifyinput"/>
            </el-form-item>
            <el-form-item prop="oldPwd">
              <el-input :type="pwdType" v-model="pwdForm.oldPwd" name="oldPwd" placeholder="Please input the old password" class="identifyinput"/>
            </el-form-item>
            <el-form-item prop="newPwd">
              <el-input :type="pwdType" v-model="pwdForm.newPwd" name="newPwd" placeholder="Please input the new password" class="identifyinput"/>
            </el-form-item>
            <el-form-item prop="confirmNewPwd">
              <el-input :type="pwdType" v-model="pwdForm.confirmNewPwd" name="confirmNewPwd" placeholder="Please confirm the new password" class="identifyinput"/>
            </el-form-item>
          </el-form >
        </span>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click.native.prevent="handleResetPwd">确 定</el-button>
        </span>
      </el-dialog>
    </el-form>
  </div>
</template>

<script>
import { isvalidUsername } from '@/utils/validate'
import { MessageBox } from 'element-ui'

export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!isvalidUsername(value)) {
        callback(new Error('请输入正确的用户名'))
      } else {
        callback()
      }
    }
    const validatePass = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('密码不能小于5位'))
      } else {
        callback()
      }
    }
    const validateCode = (rule, value, callback) => {
      if (value.length < 5) {
        callback(new Error('请输入验证码'))
      } else {
        callback()
      }
    }
    const validateConfirmPwd = (rule, value, callback) => {
      if (value !== this.pwdForm.newPwd) {
        callback(new Error('请确保两次输入的密码一致'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: 'admin',
        password: 'a1111111',
        verifycode: '',
        code: process.env.BASE_API + '/system/patchca'
      },
      pwdForm: {
        username: '',
        oldPwd: '',
        newPwd: '',
        confirmNewPwd: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePass }],
        verifycode: [{ required: true, trigger: 'blur', validator: validateCode }]
      },
      pwdRules: {
        oldPwd: [{ required: true, trigger: 'blur', validator: validatePass }],
        newPwd: [{ required: true, trigger: 'blur', validator: validatePass }],
        confirmNewPwd: [{ required: true, trigger: 'blur', validator: validateConfirmPwd }]
      },
      loading: false,
      pwdType: 'password',
      redirect: undefined,
      dialogVisible: false
    }
  },
  watch: {
    $route: {
      handler: function(route) {
        this.redirect = route.query && route.query.redirect
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
      } else {
        this.pwdType = 'password'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('Login', this.loginForm).then(data => {
            this.loading = false
            if (data.success === true) {
              this.loading = false
              this.$router.push({ path: this.redirect || '/' })
            } else {
              // 上次未正常登出
              if (data.obj === 'logout') {
                MessageBox.confirm(
                  data.msg,
                  '提示',
                  {
                    confirmButtonText: '继续登录',
                    cancelButtonText: '取消',
                    type: 'warning',
                    dangerouslyUseHTMLString: true
                  }
                ).then(() => {
                  // 确认登录
                  this.$store.dispatch('LoginConfirm', this.loginForm).then(() => {
                    this.loading = false
                    this.$router.push({ path: this.redirect || '/' })
                  }).catch(() => {
                    this.loading = false
                  })
                })
              } else if (data.obj === 'password') {
                // 需要重置密码
                this.pwdForm.username = this.loginForm.username
                this.dialogVisible = true
              } else if (data.obj === 'session') {
                // session 超时
                MessageBox.alert(
                  data.msg,
                  '错误',
                  {
                    confirmButtonText: '确定',
                    type: 'error'
                  }
                ).then(() => {
                  location.reload()
                })
              } else {
                // 其它错误
                this.$message({
                  showClose: true,
                  message: data.msg,
                  type: 'error'
                })
                this.changeCode()
                this.loginForm.password = ''
              }
              this.loading = false
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    changeCode() {
      this.loginForm.code = process.env.BASE_API + '/system/patchca?r=' + Math.random()
    },
    handleResetPwd() {
      this.$refs.pwdForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('ResetPwd', this.pwdForm).then(data => {
            this.loading = false
            if (data.success === true) {
              this.dialogVisible = false
              this.$message({
                showClose: true,
                message: data.msg,
                type: 'success'
              })
            } else {
              this.dialogVisible = false
              this.$message({
                showClose: true,
                message: data.msg,
                type: 'error'
              })
            }
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
$bg:#2d3a4b;
$light_gray:#eee;

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;
    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      &:-webkit-autofill {
        -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: #fff !important;
      }
    }
  }
  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
    white-space: nowrap;
  }
  .identifybox{
    display: flex;
    justify-content: space-between;
    margin-top:7px;
  }
  .el-dialog{
    .el-input {
      display: inline-block;
      height: 47px;
      width: 85%;
      input {
        background: transparent;
        border: 0px;
        -webkit-appearance: none;
        border-radius: 0px;
        padding: 12px 5px 12px 15px;
        color: $bg;
        height: 47px;
        &:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px $bg inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      }
    }
    .el-form-item {
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(0, 0, 0, 0.1);
      border-radius: 5px;
      color: #889aa4;
      white-space: nowrap;
    }
    .identifybox{
      display: flex;
      justify-content: space-between;
      margin-top:7px;
    }
  }
}

</style>

<style rel="stylesheet/scss" lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;
.login-container {
  position: fixed;
  height: 100%;
  width: 100%;
  background-color: $bg;
  .dialog
    .pwd-form {
      position: absolute;
      left: 0;
      right: 0;
      width: 520px;
      max-width: 100%;
      padding: 35px 35px 15px 35px;
      margin: 120px auto;
    }
  .login-form {
    position: absolute;
    left: 0;
    right: 0;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 15px 35px;
    margin: 120px auto;
  }
  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;
    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }
  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }
  .title {
    font-size: 26px;
    font-weight: 400;
    color: $light_gray;
    margin: 0px auto 40px auto;
    text-align: center;
    font-weight: bold;
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
}
</style>
