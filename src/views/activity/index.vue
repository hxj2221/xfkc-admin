<template>
  <div class="app-container">
    <div class="">
      <el-button type="primary" class="filter-item" size="mini" icon="el-icon-plus" @click="dialogVisible = true">新增</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="90" :align="'center'" :index="indexMethod" fixed />
      <el-table-column prop="title" label="标题" min-width="160" :align="'center'" fixed />
      <el-table-column prop="status" label="状态" min-width="100" :align="'center'" fixed>
        <template slot-scope="scope">
          {{ scope.row.status === 1 ? '未开始' : scope.row.status === 2 ? '进行中' : '已结束' }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.startTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="endTime" label="结束时间" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.endTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="createName" label="创建人" min-width="140" :align="'center'" />
      <el-table-column prop="createTime" label="创建时间" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.createTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="updateUser" label="修改人" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ scope.row.updateUser || '——' }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ scope.row.updateTime ? $comm.dateFormat(scope.row.updateTime,'YYYY-MM-DD HH:mm:ss') : '——' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="prop" label="操作" width="350" :align="'center'">
        <template slot-scope="scope">
          <el-button class="filter-item" size="mini" icon="el-icon-edit" type="primary" @click="getEdit(scope.row.id)" />
          <el-button class="filter-item" size="mini" type="success" :disabled="scope.row.status !== 1" @click="status(scope.row, 2)">提前开始 </el-button>
          <el-button class="filter-item" size="mini" type="danger" :disabled="scope.row.status === 3" @click="status(scope.row, 3)">提前结束</el-button>
          <el-button class="filter-item" size="mini" type="primary" @click="toWorks(scope.row)">投票作品</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-if="total > 0" :total="total" :page="currentPage" :limit="pageSize" @pagination="changePage" />
    <el-dialog :title="editForm.id ? '编辑活动' : '新增活动' " :visible.sync="dialogVisible" width="1000px" @close="dialogClose">
      <el-form ref="form" :model="editForm" :rules="rules">
        <el-form-item label="标题：" prop="title" label-width="100px">
          <el-input v-model="editForm.title" style="width: 400px" />
        </el-form-item>
        <el-form-item label="活动时间：" label-width="100px">
          <el-date-picker v-model="activityDate" type="datetimerange" unlink-panels :disabled="editForm.id && editForm.status !== 1" value-format="timestamp" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" />
        </el-form-item>
        <el-form-item label="投票数量：" prop="voteNum" label-width="100px">
          <el-input v-model="editForm.voteNum" oninput="value=value.replace(/[^\d]/g,'')" style="width: 400px" />
          <span style="padding-left: 10px; font-size: 12px; color: #f00;">限每人每天最多投票数量</span>
        </el-form-item>
        <el-form-item label="活动封面：" prop="url" label-width="100px">
          <el-upload
            ref="upload"
            :limit="1"
            :auto-upload="true"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :accept="acceptList"
            :action="baseApi + '/api/localStorage/upload'"
          >
            <img v-if="editForm.url" :src="baseApi + '/file/' + editForm.url" class="avatar">
            <div v-else class="eladmin-upload">
              <i class="el-icon-upload" /> 添加文件
            </div>
            <span slot="tip" class="el-upload__tip" style="padding-left: 10px; color: #f00;">可上传图片文件，长:1200px,宽:300px,且不超过6M</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="活动内容：" prop="info">
          <editor-bar :value="editForm.info" @change="change" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogClose">取消</el-button>
        <el-button size="mini" type="primary" @click="save">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { getList, getDetail, edit, add, updateStatus } from '@/api/activity'
import pagination from '@/components/Pagination'
import EditorBar from './text'
export default {
  name: 'Activity',
  components: { pagination, EditorBar },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'activity:add'],
        edit: ['admin', 'activity:edit'],
        updateStatus: ['admin', 'activity:updateStatus']
      },
      currentPage: 0,
      pageSize: 20,
      total: 0,
      tableData: [],
      tableLoading: false,
      editForm: {
        title: '',
        info: '',
        url: '',
        startTime: '',
        endTime: '',
        voteNum: null
      },
      dialogVisible: false,
      rules: {
        title: [
          { required: true, message: '请输入活动主题', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请上传活动主题封面图', trigger: 'change' }
        ],
        voteNum: [
          { required: true, message: '请输入每人每次投票数', trigger: 'blur' }
        ],
        info: [
          { required: true, message: '请输入活动内容', trigger: 'blur' }
        ]
      },
      activityDate: '',
      pickerOptions: {
        disabledDate: (time) => {
          const nowDate = new Date().getTime() // - 3600 * 1000 * 24
          return time.getTime() < new Date(nowDate).getTime()
        }
      },
      acceptList: 'image/jpeg,image/png,image/jpg'
    }
  },
  computed: {
    ...mapGetters(['baseApi'])
  },
  created() {
    this.getTableData()
  },
  methods: {
    getTableData() {
      const req = {
        page: this.currentPage,
        size: this.pageSize
      }
      const data = {
        // 'statusList': [1]
      }
      getList(req, data).then(res => {
        console.log('res', res)
        this.tableData = res.content
        this.total = res.totalElements
      })
    },
    handleSuccess(response) {
      this.editForm.url = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    },
    getEdit(id) {
      this.editForm.url = null
      getDetail({ id: id }).then(res => {
        this.activityDate = [new Date(res.startTime), new Date(res.endTime)]
        this.editForm = res
        this.dialogVisible = true
      })
    },
    status(item, status) {
      if (item.status === 2 && status === 3) {
        this.$confirm('当前活动进行中确定要结束该活动吗？', {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          updateStatus({ id: item.id, status: status }).then(res => {
            this.$message({
              message: '操作成功',
              type: 'success'
            })
            this.getTableData()
          })
        })
      } else {
        updateStatus({ id: item.id, status: status }).then(res => {
          this.$message({
            message: '操作成功',
            type: 'success'
          })
          this.getTableData()
        })
      }
    },

    change(val) {
      this.editForm.info = val
    },
    save() {
      if (this.activityDate === '') {
        this.$message.error('请选择活动开始结束时间')
        return false
      }
      const req = this.editForm.id ? edit : add
      this.editForm.startTime = this.activityDate[0]
      this.editForm.endTime = this.activityDate[1]
      req(this.editForm).then(res => {
        this.$refs['form'].resetFields()
        this.$refs['upload'].clearFiles()
        this.activityDate = ''
        this.dialogVisible = false
        this.getTableData()
      }).catch(() => {
        this.$refs['form'].resetFields()
        this.$refs['upload'].clearFiles()
        this.activityDate = ''
        this.dialogVisible = false
      })
    },
    dialogClose() {
      this.$refs['form'].resetFields()
      this.$refs['upload'].clearFiles()
      this.activityDate = ''
      this.dialogVisible = false
    },
    toWorks(item) {
      this.$router.push({ path: '/activity/works', query: { activityId: item.id, activityTitle: encodeURIComponent(item.title) }})
    },
    changePage(val) {
      this.currentPage = val.page - 1
      this.pageSize = val.limit
      this.getTableData()
    },
    indexMethod(index) {
      const page = this.currentPage
      const limitPage = this.pageSize
      return page > 0 ? (index + 1) + page * limitPage : (index + 1)
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-form-item__label{
    text-align: left;
  }
  .avatar {
    width: 400px;
    height: 100px;
    border-radius: 4px;
  }
</style>
