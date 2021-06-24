<template>
  <div>
    <div class="wrapper-header">
      <div>
        <img src alt="logo" height="20px" />
        <Divider type="vertical" style="background:#525b6f;" />
        <span class="platform-name">PIS系统智能运维平台</span>
      </div>

      <div>
        <Dropdown trigger="click" @on-click="onDropdownClick">
          <div class="dropdown-btn">
            <!-- <span
              class="avatar"
              :style="`background-image:url(${$store.state.avatar})`"
            ></span> -->
            {{ userInfo.name }}
          </div>
          <!-- <DropdownMenu slot="list">
            <DropdownItem name="exit">退出</DropdownItem>
          </DropdownMenu> -->
        </Dropdown>
      </div>
    </div>
    <div class="wrapper-container">
      <Row style="height:100%;">
        <Col style="height:100%;overflow:auto;" class="nav">
          <Menu
            width="auto"
            :active-name="activeName"
            @on-select="onSelect"
            style="height:100%;"
          >
            <MenuItem name="Index"> 首页 </MenuItem>
            <MenuItem name="Monitor">
              列车监控
            </MenuItem>
            <MenuItem name="Statistics">
              故障统计
            </MenuItem>
            <MenuItem name="List"> 故障查询 </MenuItem>
          </Menu>
        </Col>
        <Col class="body">
          <router-view />
        </Col>
      </Row>
    </div>
  </div>
</template>
<script>
import { getOAuth2Code } from '../libs/util'
import { getTokenByCode, getUserInfoByToken } from '../api'
import { HttpStatus } from '../libs/constant'
import { Storage } from '../libs/tools'
export default {
  name: 'Workbench',
  data() {
    return {
      userInfo: {}
    }
  },
  methods: {
    getUserInfo() {
      //TODO: token换取用户信息
      if (!localStorage.getItem('userInfo') && localStorage.getItem('token')) {
        getUserInfoByToken().then((res) => {
          let { data } = res.data || {}
          this.userInfo = data
          localStorage.setItem('userInfo', JSON.stringify(data))
        })
      } else {
        this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
      }
    },
    onDropdownClick(name) {
      if (name === 'exit') {
        localStorage.removeItem('token')
        this.$router.push({
          name: 'Login'
        })
      } else {
        this.$router.push({
          name
        })
      }
    },
    onSelect(name) {
      this.$router.push({
        name,
        params: localStorage.getItem('currentTrainCode')
          ? { trainCode: localStorage.getItem('currentTrainCode') }
          : {}
      })
    }
  },
  computed: {
    activeName() {
      return this.$route.name
    }
  },
  created() {
    let storage = new Storage()
    let token = localStorage.getItem('token')
    const hasToken = !!token
    const urlCode = this.$route.query.code
    const sessionStorageCode = sessionStorage.getItem('code')
    if (!hasToken) {
      if (urlCode) {
        let newQuery = JSON.parse(JSON.stringify(this.$route.query))
        delete newQuery.code
        delete newQuery.state
        sessionStorage.setItem('code', urlCode)
        this.$router.replace({
          name: this.$route.name,
          query: newQuery
        })
      } else if (sessionStorageCode) {
        //TODO：code换取token
        getTokenByCode({
          redirectUri: window.location.href,
          code: sessionStorageCode
        }).then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            let { access_token: token } = res.data || {}
            sessionStorage.removeItem('code')
            localStorage.setItem('token', `Bearer ${token}`)
            this.getUserInfo()
          }
        })
      } else {
        getOAuth2Code()
      }
    } else {
      this.getUserInfo()
    }
  },
  mounted() {}
}
</script>
<style lang="less">
body {
  min-width: 1240px;
}
.tips {
  font-size: 12px;
  color: #bdbdbd;
}
.ivu-breadcrumb {
  margin-top: 10px;
}
table {
  .ivu-btn-small,
  .ivu-poptip {
    margin-right: 5px;
    margin-bottom: 2px;
    &:last-child {
      // margin-right: 0;
    }
  }
}
*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
*::-webkit-scrollbar-button {
  display: none;
}
*::-webkit-scrollbar-track {
  border-radius: 5px;
  background-color: transparent;
}
*::-webkit-scrollbar-thumb {
  border-radius: 0;
  border-style: dashed;
  background-color: #343c50;
  border-color: transparent;
  border-width: 1.5px;
  background-clip: padding-box;
}
*::-webkit-scrollbar-thumb:hover {
  height: 13px !important;
  width: 13px !important;
  background: #525b6f;
}
*::-webkit-scrollbar-corner {
  display: none;
}
*::-webkit-resizer {
  display: none;
}
.image-wrapper {
  background-color: #eee;
}
.ivu-drawer-body {
  padding: 0;
  > form {
    height: calc(100% - 53px);
    overflow: auto;
    padding: 15px;
  }
}
</style>
<style lang="less" scoped>
@headerHeight: 54px;
.ivu-menu-item {
  margin: 10px;
  padding: 7px 10px;
  border-radius: 3px;
  &.ivu-menu-item-active:not(.ivu-menu-submenu):after {
    display: none !important;
  }
  &.ivu-menu-item-selected {
    background: #2e67f6 !important;
    color: #fff !important;
  }
}
.nav {
  background: #191f2e;
  width: 200px !important;
}
.body {
  height: 100%;
  overflow: auto;
  padding: 20px;
  width: calc(~'100% - 200px');
  box-sizing: border-box;
  min-width: 1040px;
  background-color: #171c24;
}
.dropdown-btn {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  > span {
    margin-right: 10px;
  }
  &:hover {
    color: @mainColor;
    > span {
      border-color: @mainColor;
    }
  }
}
.wrapper-header {
  position: fixed;
  height: @headerHeight;
  width: 100%;
  top: 0;
  right: 0;
  z-index: 1000;
  background-color: #05060b;
  display: flex;
  align-items: center;
  padding: 0 20px;
  justify-content: space-between;
  .platform-name {
    color: #fff;
    font-size: 15px;
    font-weight: bold;
    font-style: italic;
  }
  > div:last-child {
  }
  .avatar {
    display: inline-block;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid #fff;
    background-size: cover;
    background-position: center;
  }
}
.wrapper-container {
  height: calc(~'100vh - '+@headerHeight);
  overflow: auto;
  background: #fff;
  margin: @headerHeight auto 0 auto;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.1);
}
.ivu-menu {
  background: transparent;
  color: #b2b5bb;
  &:after {
    display: none;
  }
  i.ivu-icon {
    font-size: 20px;
  }
}
</style>
