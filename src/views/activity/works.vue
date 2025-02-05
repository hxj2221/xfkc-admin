<template>
  <div class="app-container">
    <div class="">
      <el-button type="primary" class="filter-item" size="mini" icon="el-icon-plus" @click="dialogVisible = true">新增</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%" @sort-change="changeSort">
      <el-table-column type="index" label="序号" width="90" :align="'center'" :index="indexMethod" fixed />
      <el-table-column prop="name" label="名称" min-width="160" :align="'center'" fixed />
      <el-table-column prop="author" label="作者" min-width="100" :align="'center'" fixed />
      <el-table-column prop="voteNumber" label="投票数量" min-width="100" :align="'center'" sortable />
      <el-table-column prop="createUser" label="创建人" min-width="140" :align="'center'" />
      <el-table-column prop="createTime" label="创建时间" min-width="140" :align="'center'" sortable>
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.createTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column prop="updateUser" label="修改人" min-width="140" :align="'center'">
        <template slot-scope="scope"> {{ scope.row.updateUser || '——' }} </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ scope.row.updateTime ? $comm.dateFormat(scope.row.updateTime,'YYYY-MM-DD HH:mm:ss') : '——' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" prop="prop" label="操作" width="180" :align="'center'">
        <template slot-scope="scope">
          <el-button class="filter-item" size="mini" icon="el-icon-edit" type="primary" @click="getEdit(scope.row.id)" />
          <el-button class="filter-item" size="mini" icon="el-icon-delete" type="danger" :disabled="scope.row.isDelete === 1" @click="del(scope.row)" />
        </template>
      </el-table-column>
    </el-table>
    <pagination v-if="total > 0" :total="total" :page="currentPage" :limit="pageSize" @pagination="changePage" />
    <el-dialog :title="editForm.id ? '编辑作品' : '新增作品' " :visible.sync="dialogVisible" width="1000px" @close="dialogClose">
      <el-form ref="form" :model="editForm" :rules="rules">
        <el-form-item label="作品名称：" prop="name" label-width="100px">
          <el-input v-model="editForm.name" style="width: 350px" />
        </el-form-item>
        <el-form-item label="作者：" prop="author" label-width="100px">
          <el-input v-model="editForm.author" style="width: 350px" />
        </el-form-item>
        <el-form-item label="活动主题：" prop="activityTitle" label-width="100px">
          <el-input v-model="editForm.activityTitle" disabled style="width: 350px" />
        </el-form-item>
        <el-form-item v-if="editForm.id" label="投票数量：" prop="voteNumber" label-width="100px">
          <el-input v-model="editForm.voteNumber" disabled readonly style="width: 350px" />
        </el-form-item>
        <el-form-item label="作品图片：" prop="url">
          <el-upload
            ref="upload"
            :limit="1"
            :auto-upload="true"
            :headers="headers"
            :on-success="handleSuccess"
            :on-error="handleError"
            :accept="acceptList"
            :action="baseApi + '/api/localStorage/upload'"
            :on-change="handleChange"
          >
            <img v-if="editForm.url" :src="baseApi + '/file/' + editForm.url" class="avatar">
            <div v-else class="eladmin-upload">
              <i class="el-icon-upload" /> 添加文件
            </div>
            <span slot="tip" class="el-upload__tip" style="padding-left: 10px; color: #f00;">可上传图片文件，长为：480px，宽：320px，且不超过6M</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="作品详情：" prop="info">
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
import { getList, getDetail, edit, add, del } from '@/api/activityWorks'
import EditorBar from './text'
import pagination from '@/components/Pagination'
export default {
  name: 'Works',
  components: { pagination, EditorBar },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'activityWorks:add'],
        edit: ['admin', 'activityWorks:edit'],
        del: ['admin', 'activityWorks:del']
      },
      currentPage: 0,
      pageSize: 20,
      total: 0,
      tableData: [],
      tableLoading: false,
      editForm: {
        name: '',
        author: '',
        url: '',
        info: '',
        activityId: this.$route.query.activityId,
        activityTitle: decodeURIComponent(this.$route.query.activityTitle),
        voteNum: null
      },
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入投票作品名称', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入投票作品所属作者', trigger: 'blur' }
        ],
        activityTitle: [
          { required: true, message: '请选择要参赛的活动主题', trigger: 'blur' }
        ],
        url: [
          { required: true, message: '请输入投票作品', trigger: 'blur' }
        ],
        info: [
          { required: true, message: '请输入投票作品详情内容', trigger: 'blur' }
        ],
        voteNum: [
          { required: true, message: '请输入每人每次投票数', trigger: 'blur' }
        ]
      },
      sort: 1,
      activityId: this.$route.query.activityId
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
      this.tableLoading = true
      const req = {
        page: this.currentPage,
        size: this.pageSize
      }
      const data = {
        sort: this.sort,
        activityId: parseInt(this.activityId)
      }
      getList(req, data).then(res => {
        this.tableData = res.content
        this.total = res.totalElements
        this.tableLoading = false
      }).catch(() => {
        this.tableLoading = false
      })
    },
    changeSort(column) {
      this.sort = column.prop === 'createTime' && column.order === 'descending' ? 1 : column.prop === 'createTime' && column.order === 'ascending' ? 2 : column.prop === 'voteNumber' && column.order === 'descending' ? 3 : column.prop === 'voteNumber' && column.order === 'ascending' ? 4 : 1
      this.getTableData()
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
      getDetail({ id: id }).then(res => {
        this.editForm = res
        this.dialogVisible = true
      })
    },
    del(item) {
      this.$confirm('确定删除本条数据吗？', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        const data = { sort: this.sort, activityId: item.activityId }
        del({ id: item.id }, data).then(res => {
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.getTableData()
        })
      })
    },
    change(val) {
      this.editForm.info = val
    },
    save() {
      const req = this.editForm.id ? edit : add
      req(this.editForm).then(res => {
        this.$refs['form'].resetFields()
        this.$refs['upload'].clearFiles()
        this.dialogVisible = false
        this.editForm.activityId = this.$route.query.activityId
        this.editForm.activityTitle = decodeURIComponent(this.$route.query.activityTitle)
        this.getTableData()
      }).catch(() => {
        this.$refs['form'].resetFields()
        this.$refs['upload'].clearFiles()
        this.editForm.activityId = this.$route.query.activityId
        this.editForm.activityTitle = decodeURIComponent(this.$route.query.activityTitle)
        this.dialogVisible = false
      })
    },
    dialogClose() {
      this.$refs['form'].resetFields()
      this.$refs['upload'].clearFiles()
      this.editForm.activityId = this.$route.query.activityId
      this.editForm.activityTitle = decodeURIComponent(this.$route.query.activityTitle)
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .el-form-item__label{
    text-align: left;
  }
  .avatar {
    width: 300px;
    height: 200px;
    border-radius: 4px;
  }
</style>
