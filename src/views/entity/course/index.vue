<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">名称</label>
        <el-input
          v-model="query.name"
          clearable
          placeholder="名称"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">作者名称</label>
        <el-input
          v-model="query.authorName"
          clearable
          placeholder="作者名称"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission">
        <span v-if="user.dept.id === 1" slot="right">
          <el-button
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-plus"
            @click="examine"
          >审核列表</el-button>
        </span>
      </crudOperation>
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <!--   上传文件   -->
          <el-form-item v-if="crud.status.add" label="上传">
            <el-upload
              ref="upload"
              accept=".mp4"
              :limit="1"
              :before-upload="beforeUpload"
              :auto-upload="false"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="fileUploadApi + '?name=' + form.name"
            >
              <div class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传视频格式文件，且不超过500M</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="学校/班级ID">
            <el-input v-model="form.deptId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="作者名称" prop="authorName">
            <el-input v-model="form.authorName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="作者ID" prop="authorId">
            <el-input v-model="form.authorId" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
            v-if="crud.status.add"
            :disabled="!!form.source"
            :loading="loading"
            type="primary"
            @click="upload"
          >上传</el-button>
          <el-button
            :disabled="!form.source"
            :loading="crud.cu === 2"
            type="primary"
            @click="crud.submitCU"
          >确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table
        ref="table"
        v-loading="crud.loading"
        :data="crud.data"
        size="small"
        style="width: 100%;"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="source" label="资源地址" />
        <el-table-column prop="deptId" label="学校/班级ID" />
        <el-table-column prop="authorName" label="作者名称" />
        <el-table-column prop="authorId" label="作者ID" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin','course:edit','course:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation v-if="!scope.row.status" :data="scope.row" :permission="permission" />
            <div v-else>
              <el-button
                class="filter-item"
                size="mini"
                type="success"
                @click="check(1, scope.row.id)"
              >通过</el-button>
              <el-button
                class="filter-item"
                size="mini"
                type="danger"
                @click="check(2, scope.row.id)"
              >驳回</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { crudCourse, check } from '@/api/course'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
const defaultForm = {
  id: null,
  name: null,
  source: null,
  deptId: null,
  authorName: null,
  authorId: null,
  createTime: null,
  updateTime: null
}
export default {
  name: 'Course',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '课程',
      url: 'api/course',
      sort: 'id,desc',
      crudMethod: { ...crudCourse }
    })
  },
  data() {
    return {
      list: [],
      loading: false,
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'course:add'],
        edit: ['admin', 'course:edit'],
        del: ['admin', 'course:del']
      },
      rules: {
        id: [{ required: true, message: 'ID不能为空', trigger: 'blur' }],
        name: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        source: [
          { required: true, message: '资源地址不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '名称' },
        { key: 'authorName', display_name: '作者名称' }
      ]
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'fileUploadApi', 'user'])
  },
  created() {
    console.log(this.user)
  },

  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    // 上传文件
    upload() {
      this.$refs.upload.submit()
    },
    beforeUpload(file) {
      let isLt2M = true
      isLt2M = file.size / 1024 / 1024 < 500
      if (!isLt2M) {
        this.loading = false
        this.$message.error('上传文件大小不能超过 500MB!')
        return false
      }
      if (!this.form.name) {
        this.loading = false
        this.$message.error('请先填写视频名称')
        return false
      }
      return true
    },
    handleSuccess(response, file, fileList) {
      this.crud.notify('上传成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
      this.form.source =
        this.baseApi + '/file/' + response.type + '/' + response.realName
    },
    // 监听上传失败
    handleError(e, file, fileList) {
      const msg = JSON.parse(e.message)
      this.$notify({
        title: msg.message,
        type: 'error',
        duration: 2500
      })
      this.loading = false
    },
    examine() {
      this.crud.setUrl('api/courseTitle/queryUnCheckedAll')
      this.crud.refresh()
    },
    check(val, id) {
      const data = {
        type: val,
        courseTitleId: id
      }
      check(data)
        .then((res) => {
          this.crud.setUrl('api/courseTitle/queryUnCheckedAll')
          this.crud.refresh()
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>
</style>
