<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">学校名称</label>
        <el-input
          v-model="query.schoolName"
          clearable
          placeholder="学校名称"
          style="width: 185px"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form
          ref="form"
          :model="form"
          size="small"
          label-width="80px"
        >
          <!-- <el-form-item label="学校名称">
            <el-input v-model="form.schoolName" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="学校名称">
            <!-- <el-input v-model="form.download" style="width: 370px;" /> -->
            <el-select
              v-model="form.deptId"
              style="width: 370px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in download"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!--
          {{ form.schoolSpecialIdList[0] }} -->
          <el-form-item label="学校类型">
            <el-cascader
              v-model="form.schoolSpecialIdList"
              style="width: 370px"
              :props="props"
              :placeholder="(!form.schoolSpecialList || form.schoolSpecialList.length === 0) ? '请选择' : label"
            />
          </el-form-item>
          <!-- :placeholder="(!form.schoolSpecialList || form.schoolSpecialList.length === 0) ? '请选择' : label" -->
          <el-form-item label="学校网址">
            <el-input v-model="form.linkUrl" style="width: 370px" placeholder="请输入完整的学习网址！" />
            <span style="color: #f00; padding-top: 6px;">如：https://xxx.xxx.xx</span>
          </el-form-item>
          <!-- <el-form-item label="学校地址">
            <el-input v-model="form.schoolAddress" style="width: 370px" />
          </el-form-item>
          <el-form-item label="联系电话">
            <el-input v-model="form.phone" onkeyup="value=value.replace(/[^\d]/g,'')" maxlength="11" style="width: 370px" />
          </el-form-item> -->
          <!-- <el-form-item label="学校图片"> -->
          <!-- <el-input v-model="form.school_pic" style="width: 370px;" /> -->
          <!-- <el-upload
              ref="upload"
              accept=".jpg, .jpeg, .png"
              :limit="1"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <img
                v-if="form.schoolPic"
                :src="baseApi + '/file/' + form.schoolPic"
                class="avatar"
              >
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">
                可上传图片文件，且不超过6M
              </div>
            </el-upload>
          </el-form-item>
          <el-form-item label="学校简介">
            <el-input
              v-model="form.schoolProfile"
              :rows="5"
              type="textarea"
              style="width: 370px"
              maxlength="500"
              show-word-limit
            />
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            :loading="crud.cu === 2"
            type="primary"
            @click="toSubmit()"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="schoolName" label="学校名称" />
        <el-table-column prop="linkUrl" label="学校地址" />
        <!-- <el-table-column prop="schoolAddress" label="学校地址" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="schoolProfile" label="学校简介" /> -->
        <!-- <el-table-column prop="schoolAchievement" label="学校成就" /> -->
        <el-table-column prop="createTime" label="创建日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin', 'school:edit', 'school:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import { getToken } from '@/utils/auth'
import { mapGetters } from 'vuex'
import { Notification } from 'element-ui'
import crudSchool from '@/api/school'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  schoolName: null,
  // schoolAddress: null,
  // phone: null,
  // deptId: null,
  // schoolProfile: null,
  // schoolAchievement: null,
  schoolSpecialIdList: null,
  linkUrl: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  typesOf: null,
  updateTime: null
}
export default {
  name: 'School',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '优秀学校',
      url: 'api/school',
      sort: 'id,desc',
      crudMethod: { ...crudSchool }
    })
  },
  data() {
    return {
      headers: { Authorization: getToken() },
      download: [],
      permission: {
        add: ['admin', 'school:add'],
        edit: ['admin', 'school:edit'],
        del: ['admin', 'school:del']
      },
      queryTypeOptions: [{ key: 'schoolName', display_name: '学校名称' }],
      goodSchoolList: [],
      props: {
        lazy: true,
        lazyLoad(node, resolve) {
          const { value, level } = node
          crudSchool.getCategory(value || 0).then(res => {
            resolve(res.map(item => {
              return {
                value: item.id,
                label: item.name,
                leaf: level === 1
              }
            }))
          })
        }
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'baseApi']),
    label() {
      let label = ''
      if (this.form.schoolSpecialList.length) {
        label += this.form.schoolSpecialList[0].name
        if (this.form.schoolSpecialList[0].schoolSpecial) {
          label += '/' + this.form.schoolSpecialList[0].schoolSpecial.name
          if (this.form.schoolSpecialList[0].schoolSpecial.schoolSpecial) {
            label += '/' + this.form.schoolSpecialList[0].schoolSpecial.schoolSpecial.name
          }
        }
      }
      return label
    }
  },
  created() {
    crudSchool
      .getList()
      .then((res) => {
        this.download = res
        console.log(this.download)
      })
      .catch((error) => {
        console.log(error)
      })
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccess(response) {
      this.form.schoolPic = response.path
    },
    toSubmit() {
      const regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
      console.log('this.form.schoolSpecialList', this.form.schoolSpecialIdList)
      if (!this.form.deptId) {
        this.$message.error('请选择学校名称!')
      } else if (!this.form.schoolSpecialIdList) {
        this.$message.error('请选择类型!')
      } else if (!regex.test(this.form.linkUrl)) {
        this.$message.error('请输入正确的学校网页地址!')
      } else {
        this.crud.submitCU()
      }
      // if (this.form.schoolProfile.length <= 500) {
      //   this.crud.submitCU()
      // } else {
      //   this.$message.error('学校简介内容不能超过500个字符!')
      // }
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    }
  }
}
</script>

<style scoped>
.avatar {
  width:100px;
  height: 100px;
}
.suggest {
  font-weight: bolder;
}
</style>
