<template>
  <div class="app-container">
    <el-row :gutter="20">
      <!--侧边学校/班级数据-->
      <el-col :xs="9" :sm="6" :md="5" :lg="4" :xl="4" class="area-list">
        <div class="head-container">
          <el-input
            v-model="deptName"
            clearable
            size="small"
            placeholder="请输入学校名称"
            prefix-icon="el-icon-search"
            class="filter-item"
            @input="getDeptDatas"
          />
        </div>
        <el-tree
          ref="schoolTree"
          node-key="id"
          highlight-current
          :data="deptDatas"
          :load="getDeptDatas"
          :props="defaultProps"
          :expand-on-click-node="false"
          lazy
          @node-click="handleNodeClick"
        />
      </el-col>
      <!--用户数据-->
      <el-col :xs="15" :sm="18" :md="19" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <div v-if="crud.props.searchToggle">
            <!-- 搜索 -->
            <el-input
              v-model="query.blurry"
              clearable
              size="small"
              placeholder="输入昵称/真实姓名搜索"
              style="width: 200px;"
              class="filter-item"
              @keyup.enter.native="crud.toQuery"
            />
            <date-range-picker v-model="query.createTime" class="date-item" />
            <el-select
              v-model="query.enabled"
              clearable
              size="small"
              placeholder="状态"
              class="filter-item"
              style="width: 90px"
              @change="crud.toQuery"
            >
              <el-option
                v-for="item in enabledTypeOptions"
                :key="item.key"
                :label="item.display_name"
                :value="item.key"
              />
            </el-select>
            <rrOperation />
          </div>
          <crudOperation show :permission="permission">
            <span slot="right" v-permission="['admin','user:edit','user:del']">
              <el-button
                class="filter-item"
                size="mini"
                type="primary"
                @click="dialogVisible = true"
              >一键生成</el-button>
              <el-button
                class="filter-item"
                size="mini"
                type="primary"
                @click="handleExport"
              >导出用户数据</el-button>
            </span>
          </crudOperation>

          <el-dialog
            :visible.sync="dialogVisible"
            title="一键注册"
            width="500px"
            :before-close="toClose"
          >
            <el-form
              :inline="true"
              :model="touch"
              size="small"
              label-width="100px"
            >
              <el-form-item label="所属部门" prop="deptId">
                <treeselect
                  v-model="touch.deptId"
                  :options="depts"
                  :load-options="loadDepts"
                  style="width: 178px"
                  placeholder="选择学校/班级"
                />
                <!-- 提示说明 -->
                <div v-if="$store.getters.userRole.level === 1" class="describe el-icon-warning-outline">选择某校，为其创建校管理员</div>
                <div v-if="$store.getters.userRole.level === 2" class="describe el-icon-warning-outline">选择班级，为其创建老师或学生</div>

              </el-form-item>
              <el-form-item label="角色" prop="roleIds">
                <el-select
                  v-model="touch.roleIds"
                  class="element-input"
                  style="width: 200px;"
                  placeholder="请选择"
                  @change="changeSelectRole"
                >
                  <el-option
                    v-for="item in roles"
                    :key="item.name"
                    :disabled="(level == 2 && item.level <= level) || item.level == 5"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>

              <!-- 学生独有的表单项 -->
              <template v-if="touch.roleIds === 2">
                <el-form-item label="创建方式">
                  <el-radio-group v-model="touch.createdType">
                    <el-radio :label="1">独立添加</el-radio>
                    <el-radio :label="2">文件导入</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item v-if="touch.createdType === 1" label="学生姓名">
                  <el-input v-model="touch.realName" placeholder="请填写学生姓名" />
                </el-form-item>

                <el-form-item v-if="touch.createdType === 1" label="学生学号">
                  <el-input v-model="touch.studentID" placeholder="请填写学生学号" />
                </el-form-item>

                <el-form-item v-if="touch.createdType === 2" label="文件上传">
                  <el-upload
                    class="upload-demo"
                    name="multipartFile"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    :action="`${baseApi}/api/users/importExcel`"
                    :headers="{Authorization: getToken()}"
                    :file-list="fileList"
                    :on-success="uploadSuccess"
                    :on-error="handleRemove"
                  >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件</div>
                  </el-upload>
                </el-form-item>
              </template>
              <!-- <el-form-item label="所在校部门id" prop="schoolDeptId">
                <el-input v-model.number="touch.schoolDeptId" oninput="value=value.replace(/[^\d]/g,'')" />
              </el-form-item> -->
              <!-- <el-form-item v-if="level == 2" label="确定所属年级" prop="grade">
                <el-select
                  v-model="touch.grade"
                  style="width: 178px"
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in grade"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item> -->
              <!-- <el-form-item v-if="touch.roleIds == 2" label="入学年份" prop="session">
                <el-input v-model="touch.session" />
              </el-form-item>
              <el-form-item v-if="level == 2" label="班级" prop="classDeptId">
                <el-input v-model="touch.classDeptId" oninput="value=value.replace(/[^\d]/g,'')" />
              </el-form-item> -->

              <el-form-item v-if="level == 2 && touch.roleIds !== 2" label="生成数量" prop="totalNumber">
                <!-- <el-input v-model="touch.totalNumber" oninput="value=value.replace(/[^\d]/g,'')" /> -->
                <el-input-number v-model="touch.totalNumber" controls-position="right" :min="1" />
              </el-form-item>

              <!-- <el-form-item label="注意事项">
                <div>三年级及以下，查看幼少版；</div>
                <div>四年级及以上，查看青少版。</div>
              </el-form-item> -->
            </el-form>
            <span slot="footer" class="dialog-footer">
              <el-button @click="toClose">取 消</el-button>
              <el-button v-if="loading" type="primary">
                <span>确 定...</span>
              </el-button>
              <el-button v-else type="primary" @click="sent">
                <span>确 定</span>
              </el-button>
            </span>
          </el-dialog>
        </div>
        <!--表单渲染-->
        <el-dialog
          append-to-body
          :close-on-click-modal="false"
          :before-close="crud.cancelCU"
          :visible.sync="crud.status.cu > 0"
          :title="crud.status.title"
          width="670px"
        >
          <el-form
            ref="form"
            :inline="true"
            :model="form"
            :rules="rules"
            size="small"
            label-width="100px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" />
            </el-form-item>
            <el-form-item label="电话" prop="phone">
              <el-input v-model.number="form.phone" />
            </el-form-item>
            <el-form-item label="昵称" prop="nickName">
              <el-input v-model="form.nickName" />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="form.realName" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="学校/班级" prop="dept.id">
              <treeselect
                v-model="form.dept.id"
                :options="depts"
                :load-options="loadDepts"
                style="width: 178px"
                placeholder="选择学校/班级"
              />
            </el-form-item>
            <!-- <el-form-item label="岗位" prop="jobs">
              <el-select
                v-model="form.jobs"
                style="width: 178px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteTag"
                @change="changeJob"
              >
                <el-option
                  v-for="item in jobs"
                  :key="item.name"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item> -->
            <el-form-item label="密码">
              <el-button type="danger" @click="replacePass(form.id)">重置密码</el-button>
            </el-form-item>
            <el-form-item label="数据范围" prop="dataScope" style="width: 478px">
              <el-select v-model="form.dataScope" placeholder="请选择数据范围" @change="changeScope">
                <el-option v-for="item in dateScopes" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
            <el-form-item v-if="form.dataScope === '自定义'" label="数据权限" prop="depts">
              <treeselect
                v-model="form.depts"
                :load-options="loadDepts"
                :options="depts"
                multiple
                style="width: 380px"
                placeholder="请选择"
              />
            </el-form-item>
            <el-form-item label="性别">
              <el-radio-group v-model="form.gender" style="width: 178px">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="状态">
              <el-radio-group v-model="form.enabled" :disabled="form.id === user.id">
                <el-radio
                  v-for="item in dict.user_status"
                  :key="item.id"
                  :label="item.value"
                >{{ item.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item style="margin-bottom: 0;" label="角色" prop="roles">
              <el-select
                v-model="form.roles"
                style="width: 437px"
                multiple
                placeholder="请选择"
                @remove-tag="deleteTag"
                @change="changeRole"
              >
                <el-option
                  v-for="item in roles"
                  :key="item.name"
                  :disabled="level !== 1 && item.level <= level"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="text" @click="crud.cancelCU">取消</el-button>
            <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
          </div>
        </el-dialog>

        <div class="school-zone">
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item v-for="(item ,index) in currentMaps" :key="index">{{ item.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <!--表格渲染-->
        <el-table
          ref="table"
          v-loading="crud.loading"
          :data="crud.data"
          style="width: 100%;"
          @selection-change="crud.selectionChangeHandler"
        >
          <el-table-column :selectable="checkboxT" type="selection" width="55" />
          <el-table-column prop="username" min-width="120" label="用户名" />
          <el-table-column min-width="120" prop="" label="角色">
            <template slot-scope="scope">
              <template v-if="scope.row.roles.length > 0">
                <div v-for="(item, index) in scope.row.roles" :key="index" :roleInfo="roleInfo = setRoleTag(item.level)">
                  <happy-tag :icon="roleInfo.icon" :color="roleInfo.color">{{ item.name }}</happy-tag>
                </div>

              </template>
            </template>
          </el-table-column>
          <el-table-column prop="nickName" min-width="120" label="昵称" />
          <el-table-column :show-overflow-tooltip="true" prop="realName" label="真实姓名" />
          <el-table-column prop="gender" label="性别" />
          <el-table-column :show-overflow-tooltip="true" prop="phone" width="100" label="电话" />
          <el-table-column :show-overflow-tooltip="true" prop="dept" label="学校/班级">
            <template slot-scope="scope">
              <div>{{ scope.row.dept.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="enabled">
            <template slot-scope="scope">
              <el-switch
                v-model="scope.row.enabled"
                :disabled="user.id === scope.row.id"
                active-color="#409EFF"
                inactive-color="#F56C6C"
                @change="changeEnabled(scope.row, scope.row.enabled)"
              />
            </template>
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="createTime" width="135" label="创建日期">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            v-permission="['admin','user:edit','user:del']"
            label="操作"
            width="115"
            align="center"
            fixed="right"
          >
            <template slot-scope="scope">
              <udOperation
                :data="scope.row"
                :permission="permission"
                :disabled-dle="scope.row.id === user.id"
              />
            </template>
          </el-table-column>
        </el-table>
        <!--分页组件-->
        <pagination />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import crudUser from '@/api/system/user'
import { isvalidPhone } from '@/utils/validate'
import { getDepts, getDeptSuperior } from '@/api/system/dept'
import { getAll, getLevel } from '@/api/system/role'
import { getAllJob } from '@/api/system/job'
import { getToken } from '@/utils/auth'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
import DateRangePicker from '@/components/DateRangePicker'
import HappyTag from '@/components/custom/happyTag'
import Treeselect from '@riophae/vue-treeselect'
import { mapGetters } from 'vuex'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'

let userRoles = []
let userJobs = []
const defaultForm = {
  id: null,
  username: null,
  nickName: null,
  gender: '男',
  email: null,
  enabled: 'false',
  realName: null,
  roles: [],
  jobs: [],
  dept: { id: null },
  phone: null,
  dataScope: '本级',
  depts: [],
  totalNumber: null,
  roleIds: null,
  grade: null,
  deptId: null
}
export default {
  name: 'User',
  components: {
    Treeselect,
    crudOperation,
    rrOperation,
    udOperation,
    pagination,
    DateRangePicker,
    HappyTag
  },
  cruds() {
    return CRUD({
      title: '用户',
      url: 'api/users',
      crudMethod: { ...crudUser }
    })
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 数据字典
  dicts: ['user_status'],
  data() {
    // 自定义验证
    const validPhone = (rule, value, callback) => {
      if (value && !isvalidPhone(value)) {
        callback(new Error('请输入正确的11位手机号码'))
      } else {
        callback()
      }
    }
    return {
      loading: false,
      dialogVisible: false,
      grade: [
        { id: -3, name: '小班' },
        { id: -2, name: '中班' },
        { id: -1, name: '大班' },
        { id: 1, name: '一年级' },
        { id: 2, name: '二年级' },
        { id: 3, name: '三年级' },
        { id: 4, name: '四年级' },
        { id: 5, name: '五年级' },
        { id: 6, name: '六年级' },
        { id: 7, name: '七年级' },
        { id: 8, name: '八年级' },
        { id: 9, name: '九年级' },
        { id: 10, name: '高一' },
        { id: 11, name: '高二' },
        { id: 12, name: '高三' }
      ],
      touch: {
        deptId: null,
        roleIds: '',
        schoolDeptId: '',
        grade: '',
        session: '',
        classDeptId: '',
        totalNumber: '',
        realName: '',
        studentID: null,
        excelList: [], // 文件返回的数据集合
        createdType: 1 // 1.添加单个用户 2.文件导入
      },
      fileList: [],
      dateScopes: ['全部', '本级', '自定义'],
      height: document.documentElement.clientHeight - 180 + 'px;',
      deptName: '',
      depts: [],
      deptDatas: [],
      initdeptLoad: false,
      initdeptList: [], // 首次加载的学校列表
      currentTreeID: 1, // 当前数据列表的校区id
      currentMaps: [], // 当前校区的父级节点信息
      jobs: [],
      level: 3,
      roles: [],
      defaultProps: { children: 'children', label: 'name', isLeaf: 'leaf' },
      permission: {
        add: ['user:add'],
        edit: ['admin', 'user:edit'],
        del: ['admin', 'user:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '激活' },
        { key: 'false', display_name: '锁定' }
      ],
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur'
          }
        ],
        nickName: [
          { required: true, message: '请输入用户昵称', trigger: 'blur' },
          {
            min: 2,
            max: 20,
            message: '长度在 2 到 20 个字符',
            trigger: 'blur'
          }
        ],
        email: [
          { required: false, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        phone: [{ required: true, trigger: 'blur', validator: validPhone }]
      }
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'user'])
  },
  created() {
    this.crud.msg.add = '新增成功，默认密码：123456'
    this.getDepts()
    this.getRoles()
    this.getRoleLevel()
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    getToken,
    // 重制密码
    replacePass(val) {
      crudUser.repairePass(val)
        .then((res) => {
          if (res.id) {
            alert('修改成功')
          } else {
            alert('修改失败')
          }
        })
        .catch((error) => {
          console.log(error)
        })
    },
    handleExport() {
      this.crud.doExport('/downloadUserStatistics')
    },
    toClose() {
      this.loading = false
      this.dialogVisible = false
      this.touch = {
        deptId: null,
        roleIds: '',
        schoolDeptId: '',
        grade: '',
        session: '',
        classDeptId: '',
        totalNumber: '',
        realName: '',
        studentID: null,
        excelList: [], // 文件返回的数据集合
        createdType: 1 // 1.添加单个用户 2.文件导入
      }
    },
    // 一键注册（一键生成）
    sent() {
      this.loading = true
      const params = {
        deptId: this.touch.deptId,
        roleIds: this.touch.roleIds
      }

      if (!params.deptId) {
        this.$message.error('请选择“所属部门”')
        return
      }

      if (!params.roleIds) {
        this.$message.error('请选择“角色”')
        return
      }

      // 校管理员权限的提交参数
      if (this.level === 2) {
        if (params.roleIds === 2) { // 学生
          if (this.touch.createdType === 1) {
            params.realName = this.touch.realName
            params.studentID = this.touch.studentID

            if (!params.realName) {
              this.$message.error('请填写“学生姓名”')
              return
            }

            if (!params.studentID) {
              this.$message.error('请填写“学生学号”')
              return
            }
          } else {
            params.excelList = this.touch.excelList
          }
        } else { // 老师
          params.totalNumber = this.touch.totalNumber
        }

        params.grade = this.touch.grade

        // if (!params.grade) {
        //   this.$message.error('请选择“年级”')
        //   return
        // }
      }

      console.log('预提交参数：', params)

      params.roleIds = [params.roleIds]

      crudUser.sent(params)
        .then((res) => {
          this.toClose()
          this.crud.refresh()
          this.dialogVisible = false
          this.loading = false
        })
        .catch((error) => {
          console.log(error)
        })
    },
    changeRole(value) {
      userRoles = []
      value.forEach(function(data, index) {
        const role = { id: data }
        userRoles.push(role)
      })
    },

    // 单选
    changeSelectRole(value) {
      console.log(value)
    },
    changeJob(value) {
      userJobs = []
      value.forEach(function(data, index) {
        const job = { id: data }
        userJobs.push(job)
      })
    },
    [CRUD.HOOK.afterAddError](crud) {
      this.afterErrorMethod(crud)
    },
    [CRUD.HOOK.afterEditError](crud) {
      this.afterErrorMethod(crud)
    },
    afterErrorMethod(crud) {
      // 恢复select
      const initRoles = []
      const initJobs = []
      userRoles.forEach(function(role, index) {
        initRoles.push(role.id)
      })
      userJobs.forEach(function(job, index) {
        initJobs.push(job.id)
      })
      crud.form.roles = initRoles
      crud.form.jobs = initJobs
    },
    deleteTag(value) {
      userRoles.forEach(function(data, index) {
        if (data.id === value) {
          userRoles.splice(index, value)
        }
      })
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form) {
      this.getRoles()
      if (form.id == null) {
        this.getDepts()
      } else {
        this.getSupDept(form.dept.id)
      }
      this.getRoleLevel()
      this.getJobs()
      form.enabled = form.enabled.toString()
    },
    // 打开编辑弹窗前做的操作
    [CRUD.HOOK.beforeToEdit](crud, form) {
      this.getJobs(this.form.dept.id)
      userRoles = []
      userJobs = []
      const roles = []
      const jobs = []
      form.roles.forEach(function(role, index) {
        roles.push(role.id)
        // 初始化编辑时候的角色
        const rol = { id: role.id }
        userRoles.push(rol)
      })
      form.jobs.forEach(function(job, index) {
        jobs.push(job.id)
        // 初始化编辑时候的岗位
        const data = { id: job.id }
        userJobs.push(data)
      })
      form.roles = roles
      form.jobs = jobs
      if (form.dataScope === '自定义') {
        if (form.id == null) {
          this.getDepts()
        } else {
          this.getSupDepts(form.depts)
        }
      }
      const depts = []
      form.depts.forEach(function(dept) {
        depts.push(dept.id)
      })
      form.depts = depts
    },
    // 提交前做的操作
    [CRUD.HOOK.afterValidateCU](crud) {
      if (!crud.form.dept.id) {
        this.$message({
          message: '学校/班级不能为空',
          type: 'warning'
        })
        return false
      } else if (crud.form.roles.length === 0) {
        this.$message({
          message: '角色不能为空',
          type: 'warning'
        })
        return false
      }
      if (crud.form.dataScope === '自定义' && crud.form.depts.length === 0) {
        this.$message({
          message: '自定义数据权限不能为空',
          type: 'warning'
        })
        return false
      } else if (crud.form.dataScope === '自定义') {
        const depts = []
        crud.form.depts.forEach(function(data) {
          const dept = { id: data }
          depts.push(dept)
        })
        crud.form.depts = depts
      } else {
        crud.form.depts = []
      }
      crud.form.roles = userRoles
      crud.form.jobs = userJobs
      return true
    },
    // 获取左侧学校/班级数据
    getDeptDatas(node, resolve) {
      // 是否携带node节点
      const isNode = typeof node === 'object'

      // 组装参数
      const params = {
        sort: 'id,desc',
        pid: (isNode && node.level !== 0) ? node.data.id : undefined,
        name: (!isNode && node) ? node : undefined
      }

      // 模拟点击展开“总区”
      const simulatedClick = () => {
        this.$refs.schoolTree.$nextTick(_ => {
          const expandElement = this.$refs.schoolTree.$children[0].$el.children[0].children[0]
          expandElement.click()
        })
      }

      // 数据获取
      getDepts(params).then((res) => {
        const nodeData = res.content.map(item => {
          return {
            ...item,
            children: []
          }
        })

        // 通过检索创建根节点
        if (typeof node !== 'object') {
          this.deptDatas = nodeData
          if (node === '') {
            simulatedClick()
          }
          this.$refs.schoolTree.setCurrentKey(this.currentTreeID)
          return
        }

        // 默认创建根节点
        if (node.level === 0) {
          this.deptDatas = nodeData
          simulatedClick()
        } else {
          node.data.children = nodeData
          resolve(node.data.children)
        }
        this.$refs.schoolTree.setCurrentKey(this.currentTreeID)
      })
    },

    getDepts() {
      getDepts({ enabled: true }).then((res) => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    getSupDept(deptId) {
      getDeptSuperior(deptId).then((res) => {
        const date = res.content
        this.buildDepts(date)
        this.depts = date
      })
    },
    getSupDepts(depts) {
      const ids = []
      depts.forEach((dept) => {
        ids.push(dept.id)
      })
      getDeptSuperior(ids).then((res) => {
        const date = res.content
        this.buildDepts(date)
        this.depts = date
      })
    },
    buildDepts(depts) {
      depts.forEach((data) => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    // 获取弹窗内学校/班级数据
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        getDepts({ enabled: true, pid: parentNode.id }).then((res) => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 200)
        })
      }
    },
    // 切换学校/班级
    handleNodeClick(data) {
      if (data.pid === 0) {
        this.query.deptId = null
        this.currentTreeID = 1
      } else {
        this.query.deptId = data.id
        this.currentTreeID = data.id
      }
      this.crud.toQuery()
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm(
        '此操作将 "' +
          this.dict.label.user_status[val] +
          '" ' +
          data.username +
          ', 是否继续？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          crudUser
            .edit(data)
            .then((res) => {
              this.crud.notify(
                this.dict.label.user_status[val] + '成功',
                CRUD.NOTIFICATION_TYPE.SUCCESS
              )
            })
            .catch(() => {
              data.enabled = !data.enabled
            })
        })
        .catch(() => {
          data.enabled = !data.enabled
        })
    },
    // 获取弹窗内角色数据
    getRoles() {
      getAll()
        .then((res) => {
          this.roles = res
        })
        .catch(() => {})
    },
    // 获取弹窗内岗位数据
    getJobs() {
      getAllJob()
        .then((res) => {
          this.jobs = res.content
        })
        .catch(() => {})
    },
    // 获取权限级别
    getRoleLevel() {
      getLevel()
        .then((res) => {
          this.level = res.level
        })
        .catch(() => {})
    },
    checkboxT(row, rowIndex) {
      return row.id !== this.user.id
    },
    changeScope() {
      if (this.form.dataScope === '自定义') {
        this.getDepts()
      }
    },

    uploadSuccess(res) {
      this.touch.excelList = res
    },

    handleRemove(res) {
      this.$message({
        message: JSON.parse(res.message).message,
        type: 'error'
      })
    },

    setRoleTag(roleLevel) {
      const info = {
        color: '',
        icon: ''
      }
      switch (roleLevel) {
        // 校管理员
        case 2:
          info.color = '#896eca'
          info.icon = 'el-icon-s-custom'
          break

        // 老师
        case 3:
          info.color = '#ff8d00'
          info.icon = 'el-icon-s-custom'
          break

        // 学生
        case 4:
          info.color = '#26c713'
          info.icon = 'el-icon-user-solid'
          break

        // 家长
        case 5:
          info.color = '#44c7d4'
          info.icon = 'el-icon-s-custom'
          break

        // 游客
        case 6:
          info.color = '#a2a2a2'
          info.icon = 'el-icon-user'
          break
        default:
          info.color = '#f00'
          info.icon = 'el-icon-user-solid'
          break
      }

      return info
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
  >>> .el-form-item__content{
    width: 200px;
  }
.element-input {
  width: 200px;
}

.area-list{

  $main_bg: #ecf0f7;
  $active_bg: #d2e0ec;

  background: $main_bg;
  padding: 10px 0;
  min-height: 640px;

  >>> .el-tree{
    background: $main_bg;

    .el-tree-node:focus > .el-tree-node__content {
      background-color: $main_bg;
    }
  }

  >>> .el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content {
    background-color: $active_bg;
  }

  >>> .el-tree-node__content:hover{
    background: $active_bg;
  }

}

.school-zone{
  padding-bottom: 10px;
  border-bottom: 1px solid #ecf0f7;
}

::v-deep .vue-treeselect__control,
::v-deep .vue-treeselect__placeholder,
::v-deep .vue-treeselect__single-value {
  height: 30px;
  line-height: 30px;
}

.describe{
  font-size: 12px;
  color: #eb9800;
}
</style>
