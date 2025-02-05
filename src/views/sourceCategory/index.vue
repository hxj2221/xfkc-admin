<template>
  <div class="app-container">
    <div class="">
      <el-button type="primary" class="filter-item" size="mini" icon="el-icon-plus" @click="addFn">新增</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="90" :align="'center'" :index="indexMethod" fixed />
      <el-table-column prop="title" label="课程资源标题" min-width="160" :align="'center'" fixed />
      <el-table-column prop="sourceCategoryName1" label="一级分类" min-width="160" :align="'center'" />
      <el-table-column prop="sourceCategoryName2" label="二级分类" min-width="160" :align="'center'" />
      <el-table-column prop="courseSourceColumnName" label="专题分类" min-width="160" :align="'center'" />
      <el-table-column prop="recommendFlag" label="推荐状态" min-width="140" :align="'center'">
        <template slot-scope="scope">
          {{ scope.row.recommendFlag === 1? '是' : '否' }}
        </template>
      </el-table-column>
      <el-table-column prop="createUser" label="创建人" min-width="140" :align="'center'" />
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
      <el-table-column fixed="right" prop="prop" label="操作" width="180" :align="'center'">
        <template slot-scope="scope">
          <el-button class="filter-item" size="mini" icon="el-icon-edit" type="primary" @click="getEdit(scope.row.id)" />
          <el-button class="filter-item" size="mini" type="danger" :loading="delLoading" @click="delMethod(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination v-if="total > 0" :total="total" :page="currentPage" :limit="pageSize" @pagination="changePage" />
    <el-dialog :title="editForm.id ? '编辑课程资源' : '新增课程资源' " :visible.sync="dialogVisible" width="1000px" @close="dialogClose">
      <el-form ref="form" :model="editForm" :rules="rules">
        <el-form-item label="课程资源标题：" prop="title" label-width="140px">
          <el-input v-model="editForm.title" style="width: 400px" />
        </el-form-item>
        <el-form-item label="一级分类：" prop="sourceCategoryId1" label-width="140px">
          <el-select
            v-model="editForm.sourceCategoryId1"
            style="width: 370px"
            placeholder="请选择"
            @change="getSourceCategory"
          >
            <el-option
              v-for="item in oneCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="二级分类：" prop="sourceCategoryId2" label-width="140px">
          <el-select
            v-model="editForm.sourceCategoryId2"
            style="width: 370px"
            placeholder="请选择"
            re
            :disabled="!editForm.sourceCategoryId1"
            @change="getColumnList"
          >
            <el-option
              v-for="item in twoCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专题分类：" prop="courseSourceColumnId" label-width="140px">
          <el-select
            v-model="editForm.courseSourceColumnId"
            style="width: 370px"
            placeholder="请选择"
            :disabled="!editForm.sourceCategoryId2"
          >
            <el-option
              v-for="item in columnList"
              :key="item.id"
              :label="item.title"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程资源封面：" prop="imgUrl" label-width="140px">
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
            <img v-if="editForm.imgUrl" :src="baseApi + '/file/' + editForm.imgUrl" class="avatar">
            <div v-else class="eladmin-upload">
              <i class="el-icon-upload" /> 添加文件
            </div>
            <span slot="tip" class="el-upload__tip" style="padding-left: 10px; color: #f00;">可上传图片文件，长:800px,宽:600px,且不超过6M</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="是否推荐：" prop="recommendFlag" label-width="140px">
          <el-radio-group v-model="editForm.recommendFlag">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="课程资源内容：" prop="context" label-width="140px">
          <editor-bar :value="editForm.context" @change="change" />
        </el-form-item>
        <el-form-item label="课程资源简介：" prop="remark" label-width="140px">
          <el-input v-model="editForm.remark" type="textarea" :rows="5" style="width: 500px" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button size="mini" @click="dialogClose">取消</el-button>
        <el-button size="mini" type="primary" :loading="editLoading" @click="save">保存</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getToken } from '@/utils/auth'
import { getList, getSourceCategoryListById, getColumnListById, getDetail, edit, add, del } from '@/api/sourceCategory'
import pagination from '@/components/Pagination'
import EditorBar from './text'
export default {
  name: 'SourceCategoryIndex',
  components: { pagination, EditorBar },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'courseSource:add'],
        edit: ['admin', 'courseSource:edit'],
        del: ['admin', 'courseSource:del']
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      tableLoading: false,
      editForm: {
        title: '',
        context: '',
        imgUrl: '',
        remark: '',
        recommendFlag: null,
        sourceCategoryId1: null,
        sourceCategoryId2: null,
        sourceCategoryName1: null,
        sourceCategoryName2: null,
        courseSourceColumnId: null,
        courseSourceColumnName: null
      },
      dialogVisible: false,
      rules: {
        title: [
          { required: true, message: '请输入课程资源标题', trigger: 'blur' }
        ],
        imgUrl: [
          { required: true, message: '请上传课程资源封面图', trigger: 'change' }
        ],
        sourceCategoryId1: [
          { required: true, message: '请选择一级分类', trigger: 'blur' }
        ],
        sourceCategoryId2: [
          { required: true, message: '请选择二级分类', trigger: 'blur' }
        ],
        courseSourceColumnId: [
          { required: true, message: '请选择专题分类', trigger: 'blur' }
        ],
        recommendFlag: [
          { required: true, message: '请选择是否推荐', trigger: 'blur' }
        ],
        context: [
          { required: true, message: '请输入课程资源内容', trigger: 'blur' }
        ],
        remark: [
          { required: true, message: '请输入课程资源简介', trigger: 'blur' }
        ]
      },
      acceptList: 'image/jpeg,image/png,image/jpg',
      oneCategoryList: [],
      twoCategoryList: [],
      columnList: [],
      delLoading: false,
      editLoading: false
    }
  },
  computed: {
    ...mapGetters(['baseApi'])
  },
  created() {
    this.getTableData()
    this.getSourceCategory(0)
  },
  methods: {
    // 获取分类
    getSourceCategory(val) {
      this.editForm.courseSourceColumnId = null
      this.editForm.courseSourceColumnName = null
      this.columnList = []
      getSourceCategoryListById(val).then(res => {
        if (val === 0 && res) {
          this.oneCategoryList = res
          this.editForm.sourceCategoryId2 = null
          this.twoCategoryList = []
        } else if (val > 0 && res) {
          this.twoCategoryList = res
          this.editForm.sourceCategoryName1 = res.filter(item => item.id === val)[0]?.name
          this.editForm.sourceCategoryId2 = null
          this.editForm.sourceCategoryName2 = null
        } else {
          this.editForm.sourceCategoryId1 = null
          this.editForm.sourceCategoryId2 = null
          this.editForm.sourceCategoryName1 = null
          this.editForm.sourceCategoryName2 = null
          this.oneCategoryList = []
          this.twoCategoryList = []
        }
      })
    },
    getColumnList(val) {
      this.editForm.courseSourceColumnId = null
      this.editForm.courseSourceColumnName = null
      this.columnList = []
      getColumnListById(val).then(res => {
        if (res.length < 1) {
          this.$message.error('该分类下暂时还没有专题，请重新选择或添加资源专题！')
        } else {
          this.columnList = res
        }
        this.editForm.sourceCategoryName2 = this.twoCategoryList.filter(item => item.id === val)[0]?.name
      })
    },
    selectColumn(val) {
      this.editForm.courseSourceColumnName = this.columnList.filter(item => item.id === val)[0]?.title
    },
    // 获取专题分类
    getTableData() {
      const req = {
        page: this.currentPage - 1,
        size: this.pageSize
      }
      getList(req).then(res => {
        this.tableData = res.content
        this.total = res.totalElements
      })
    },
    handleSuccess(response) {
      this.editForm.imgUrl = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
    },
    addFn() {
      this.editForm = {
        title: '',
        context: '',
        imgUrl: '',
        remark: '',
        recommendFlag: null,
        sourceCategoryId1: null,
        sourceCategoryId2: null,
        sourceCategoryName1: null,
        sourceCategoryName2: null,
        courseSourceColumnId: null,
        courseSourceColumnName: null
      }
      this.dialogVisible = true
    },
    getEdit(id) {
      this.editForm.imgUrl = null
      getDetail({ id: id }).then(res => {
        if (res.sourceCategoryId1 > 0) {
          getSourceCategoryListById(res.sourceCategoryId1).then(res => {
            this.twoCategoryList = res
          })
        }
        if (res.sourceCategoryId2 > 0) {
          getColumnListById(res.sourceCategoryId2).then(res => {
            this.columnList = res
          })
        }
        this.editForm = res
        this.dialogVisible = true
      })
    },
    delMethod(id) {
      this.delLoading = true
      del({ id: id }).then(() => {
        this.delLoading = false
        this.currentPage = 1
        this.getTableData()
      }).catch(() => {
        this.delLoading = false
      })
    },

    change(val) {
      this.editForm.context = val
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.editForm.context === '') {
            this.$message.error('请输入课程资源内容')
            return false
          }
          const { title, id,
            context,
            imgUrl,
            remark,
            recommendFlag,
            sourceCategoryId1,
            sourceCategoryId2,
            courseSourceColumnId } = this.editForm
          const sourceCategoryName1 = this.oneCategoryList.filter(item => item.id === this.editForm.sourceCategoryId1)[0]?.name
          const sourceCategoryName2 = this.twoCategoryList.filter(item => item.id === this.editForm.sourceCategoryId2)[0]?.name
          const courseSourceColumnName = this.columnList.filter(item => item.id === this.editForm.courseSourceColumnId)[0]?.title
          console.log('bcthis.editForm', this.editForm)
          const req = this.editForm.id ? edit : add
          this.editLoading = true
          req({ title, id,
            context,
            imgUrl,
            remark,
            recommendFlag,
            sourceCategoryId1,
            sourceCategoryId2,
            courseSourceColumnId, sourceCategoryName1, sourceCategoryName2, courseSourceColumnName }).then(res => {
            this.$refs['form'].resetFields()
            this.$refs['upload'].clearFiles()
            this.editForm.sourceCategoryName1 = null
            this.editForm.sourceCategoryName2 = null
            this.editForm.courseSourceColumnName = null
            this.editLoading = false
            this.dialogVisible = false
            this.currentPage = 1
            this.getTableData()
          }).catch(() => {
            this.$refs['form'].resetFields()
            this.$refs['upload'].clearFiles()
            this.editForm.sourceCategoryName1 = null
            this.editForm.sourceCategoryName2 = null
            this.editForm.courseSourceColumnName = null
            this.editLoading = false
            this.dialogVisible = false
          })
        } else {
          return false
        }
      })
    },
    dialogClose() {
      this.$refs['form'].resetFields()
      this.$refs['upload'].clearFiles()
      this.dialogVisible = false
    },
    changePage(val) {
      this.currentPage = val.page
      this.pageSize = val.limit
      this.getTableData()
    },
    indexMethod(index) {
      const page = this.currentPage - 1
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
    height: 300px;
    border-radius: 4px;
  }
</style>
