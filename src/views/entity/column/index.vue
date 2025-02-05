<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog
        :close-on-click-modal="false"
        :before-close="crud.cancelCU"
        :visible.sync="crud.status.cu > 0"
        :title="crud.status.title"
        width="1000px"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          size="small"
          label-width="80px"
        >
          <el-form-item label="专栏名称" prop="title">
            <el-input v-model="form.title" style="width: 370px" />
          </el-form-item>
          <el-form-item label="介绍" prop="introduce">
            <el-input v-model="form.introduce" type="textarea" :autosize="{ minRows: 3, maxRows: 3 }" maxlength="300" style="width: 370px" />
          </el-form-item>
          <!-- <el-form-item label="专栏图片">
            <el-upload
              ref="upload"
              :limit="1"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <img
                v-if="form.pic"
                :src="$comm.url(form.pic)"
                class="avatar"
              >
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">
                可上传图片文件，且不超过6M
              </div>
            </el-upload>
          </el-form-item> -->
          <!-- <el-form-item label="内容">
            <el-input v-model="form.content" :rows="3" type="textarea" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="富文本">
            <editor-bar v-if="crud.status.cu > 0" v-model="form.content" @change="change" />
          </el-form-item> -->

          <!-- <el-form-item label="类型" prop="typesOf">
            未设置字典，请手动设置 Select
          </el-form-item> -->
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button
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
        style="width: 100%"
        @selection-change="crud.selectionChangeHandler"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="title" label="专栏">
          <template slot-scope="scope">
            <div class="introduce">{{ scope.row.title }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="introduce" label="介绍">
          <template slot-scope="scope">
            <div class="introduce">{{ scope.row.introduce }}</div>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="typesOf" label="类型" /> -->
        <el-table-column prop="addTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          v-permission="['admin', 'news:edit', 'news:del']"
          label="操作"
          width="240px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation :data="scope.row" :permission="permission" />
            <el-button
              v-if="scope.$index > 0"
              type="primary"
              @click="move(scope.row.id, 'up')"
            >
              上移
            </el-button>
            <el-button
              v-if="scope.$index < crud.data.length - 1"
              type="primary"
              @click="move(scope.row.id, 'down')"
            >
              下移
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination v-if="false" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import crudNews, { move } from '@/api/column'
import { Notification } from 'element-ui'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'
const defaultForm = {
  id: null,
  title: null,
  content: null,
  summary: '',
  pic: '',
  addTime: null,
  updateTime: null
}
export default {
  name: 'Column',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '专栏',
      url: 'api/specialColumn/querySpecialColumnList',
      method: 'post',
      crudMethod: { ...crudNews },
      optShow: {
        add: true,
        edit: true,
        del: true,
        reset: true
      }
    })
  },

  data() {
    return {
      detail: '',
      isClear: false,
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'news:add', 'dept:add'],
        edit: ['admin', 'news:edit', 'dept:edit'],
        del: ['admin', 'news:del', 'dept:del']
      },
      rules: {
        title: [{ required: true, message: '标题不能为空', trigger: 'blur' }]
        // typesOf: [
        //   { required: true, message: '类型不能为空', trigger: 'blur' }
        // ]
      }
    }
  },
  computed: {
    ...mapGetters(['user', 'baseApi'])
  },
  created() {},
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    [CRUD.HOOK.beforeToEdit]() {
      this.$nextTick(() => {
        this.$refs.upload.uploadFiles = []
      })
    },
    [CRUD.HOOK.beforeToAdd]() {
      this.$nextTick(() => {
        this.$refs.upload.uploadFiles = []
      })
    },
    handleSuccess(response) {
      console.log(response)
      this.form.pic = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    },
    change(val) {
      console.log(val)
    },
    move(id, type) {
      move(id, type).then(() => {
        this.crud.refresh()
      })
    }
  }
}
</script>

<style >
.avatar {
  width: 300px;
  height: 150px;
}
.el-table__row td {
  height: 50px !important;
}

.introduce {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
