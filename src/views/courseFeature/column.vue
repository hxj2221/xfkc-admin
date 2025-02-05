<template>
  <div class="app-container">
    <div class="">
      <el-button type="primary" class="filter-item" size="mini" icon="el-icon-plus" @click="addFn">新增特色课程专题</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="90" :align="'center'" :index="indexMethod" fixed />
      <el-table-column prop="title" label="特色课程专题标题" min-width="160" :align="'center'" fixed />
      <el-table-column prop="featureCategoryName1" label="一级分类" min-width="160" :align="'center'" />
      <el-table-column prop="featureCategoryName2" label="二级分类" min-width="160" :align="'center'" />
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
    <el-dialog :title="editForm.id ? '编辑特色课程专题' : '新增特色课程专题' " :visible.sync="dialogVisible" width="1000px" @close="dialogClose">
      <el-form ref="form" :model="editForm" :rules="rules">
        <el-form-item label="特色课程专题标题：" prop="title" label-width="160px">
          <el-input v-model="editForm.title" style="width: 400px" />
        </el-form-item>
        <el-form-item label="一级分类：" prop="featureCategoryId1" label-width="160px">
          <el-select
            v-model="editForm.featureCategoryId1"
            style="width: 370px"
            placeholder="请选择"
            :disabled="editForm.id?true:false"
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
        <el-form-item label="二级分类：" prop="featureCategoryId2" label-width="160px">
          <el-select
            v-model="editForm.featureCategoryId2"
            style="width: 370px"
            placeholder="请选择"
            :disabled="!editForm.featureCategoryId1?true:false"
          >
            <el-option
              v-for="item in twoCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="特色课程专题封面：" prop="imgUrl" label-width="160px">
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
        <!-- <el-form-item label="特色课程专题内容：" prop="context">
          <editor-bar :value="editForm.context" @change="change" />
        </el-form-item> -->
        <el-form-item label="特色课程专题简介：" prop="remark" label-width="160px">
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
import { getColumnList, getFeatureCategoryListById, getColumnDetail, editColumn, addColumn, delColumn } from '@/api/courseFeature'
import pagination from '@/components/Pagination'
// import EditorBar from './text'
export default {
  name: 'CourseFeatureColumn',
  components: { pagination },
  // components: { pagination, EditorBar },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'courseFeatureColumn:add'],
        edit: ['admin', 'courseFeatureColumn:edit'],
        del: ['admin', 'courseFeatureColumn:del']
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
        featureCategoryId1: null,
        featureCategoryId2: null,
        featureCategoryName1: null,
        featureCategoryName2: null
      },
      dialogVisible: false,
      rules: {
        title: [
          { required: true, message: '请输入特色课程专题标题', trigger: 'blur' }
        ],
        imgUrl: [
          { required: true, message: '请上传特色课程专题封面图', trigger: 'change' }
        ],
        featureCategoryId1: [
          { required: true, message: '请选择一级分类', trigger: 'blur' }
        ],
        featureCategoryId2: [
          { required: true, message: '请选择二级分类', trigger: 'blur' }
        ],
        // context: [
        //   { required: true, message: '请输入特色课程内容', trigger: 'blur' }
        // ],
        remark: [
          { required: true, message: '请输入特色课程专题简介', trigger: 'blur' }
        ]
      },
      acceptList: 'image/jpeg,image/png,image/jpg',
      oneCategoryList: [],
      twoCategoryList: [],
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
      getFeatureCategoryListById(val).then(res => {
        if (val === 0 && res) {
          this.oneCategoryList = res
          this.editForm.featureCategoryId2 = null
          this.editForm.courseSourceColumnId = null
          this.twoCategoryList = []
        } else if (val > 0 && res) {
          this.twoCategoryList = res
          this.editForm.featureCategoryId2 = null
          this.editForm.featureCategoryName2 = null
          this.editForm.featureCategoryName1 = res.filter(item => item.id === val)[0]?.name
          this.editForm.courseSourceColumnId = null
        } else {
          this.editForm.featureCategoryId1 = null
          this.editForm.featureCategoryId2 = null
          this.editForm.featureCategoryName1 = null
          this.editForm.featureCategoryName2 = null
          this.oneCategoryList = []
          this.twoCategoryList = []
        }
      })
    },
    // 获取专题分类
    getTableData() {
      const req = {
        page: this.currentPage - 1,
        size: this.pageSize
      }
      getColumnList(req).then(res => {
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
        featureCategoryId1: null,
        featureCategoryId2: null,
        featureCategoryName1: null,
        featureCategoryName2: null
      }
      this.dialogVisible = true
    },
    getEdit(id) {
      this.editForm.imgUrl = null
      getColumnDetail({ id: id }).then(res => {
        res.featureCategoryId1 > 0 && this.getSourceCategory(res.featureCategoryId1)
        if (res.featureCategoryId1 === 0) {
          res.featureCategoryId1 = null
        }
        this.editForm = res
        this.dialogVisible = true
      })
    },
    delMethod(id) {
      this.delLoading = true
      delColumn({ id: id }).then(() => {
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
          const { title, id,
            context,
            imgUrl,
            remark,
            featureCategoryId1,
            featureCategoryId2 } = this.editForm
          const featureCategoryName1 = this.oneCategoryList.filter(item => item.id === this.editForm.featureCategoryId1)[0]?.name
          const featureCategoryName2 = this.twoCategoryList.filter(item => item.id === this.editForm.featureCategoryId2)[0]?.name
          const req = this.editForm.id ? editColumn : addColumn
          this.editLoading = true
          req({ title, id,
            context,
            imgUrl,
            remark,
            featureCategoryId1,
            featureCategoryId2, featureCategoryName1, featureCategoryName2 }).then(res => {
            this.$refs['form'].resetFields()
            this.$refs['upload'].clearFiles()
            this.editForm.featureCategoryName1 = null
            this.editForm.featureCategoryName2 = null
            this.editLoading = false
            this.dialogVisible = false
            this.currentPage = 1
            this.getTableData()
          }).catch(() => {
            this.$refs['form'].resetFields()
            this.$refs['upload'].clearFiles()
            this.editForm.featureCategoryName1 = null
            this.editForm.featureCategoryName2 = null
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
