<template>
  <div class="app-container">
    <div class="">
      <el-button type="primary" class="filter-item" size="mini" icon="el-icon-plus" @click="addFn">新增分类</el-button>
    </div>
    <!-- 表格数据 -->
    <el-table v-loading="tableLoading" :data="tableData" style="width: 100%">
      <el-table-column type="index" label="序号" width="90" :align="'center'" :index="indexMethod" fixed />
      <el-table-column prop="name" label="分类标题" min-width="160" :align="'center'" fixed />
      <el-table-column prop="level" label="分类级别" min-width="160" :align="'center'">
        <template slot-scope="scope">
          {{ scope.row.level === 1 ? '一级分类':'二级分类' }}
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
    <el-dialog :title="editForm.id ? '编辑特色课程分类' : '新增特色课程分类' " :visible.sync="dialogVisible" width="600px" @close="dialogClose">
      <el-form ref="form" :model="editForm" :rules="rules">
        <el-form-item label="分类标题：" prop="name" label-width="160px">
          <el-input v-model="editForm.name" style="width: 400px" />
        </el-form-item>
        <el-form-item label="分类级别：" prop="level" label-width="160px">
          <el-select
            v-model="editForm.level"
            style="width: 400px"
            placeholder="请选择"
            :disabled="editForm.id? true: false"
            @change="changeLevel"
          >
            <el-option
              v-for="item in levelList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.level > 1" label="所属一级分类标题：" prop="parentId" label-width="160px">
          <el-select
            v-model="editForm.parentId"
            style="width: 400px"
            placeholder="请选择一级分类"
          >
            <el-option
              v-for="item in oneCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>

        </el-form-item>
        <el-form-item v-if="editForm.id && editForm.level === 1 && twoCategoryList.length > 0" label="包含的二级分类有：" label-width="160px">
          <div class="twobox">
            <div v-for="(item, index) in twoCategoryList" :key="item.id"><span>{{ index + 1 }}</span>{{ item.name }}</div>
          </div>
        </el-form-item>
        <el-form-item v-if="editForm.level === 1" label="分类图标：" prop="imgUrl" label-width="160px">
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
            <span slot="tip" class="el-upload__tip" style="padding-left: 10px; color: #f00;">可上传图片文件，长:80px,宽:80px,且不超过6M</span>
          </el-upload>
        </el-form-item>
        <el-form-item label="分类简介：" label-width="160px">
          <el-input v-model="editForm.remark" type="textarea" :rows="5" style="width: 370px" />
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
import { getFeatureCategorList, getFeatureCategoryListById, getFeatureCategoryDetail, editFeatureCategory, addFeatureCategory, delFeatureCategory } from '@/api/courseFeature'
import pagination from '@/components/Pagination'
export default {
  name: 'CourseFeatureCategory',
  components: { pagination },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'featureCategor:add'],
        edit: ['admin', 'featureCategor:edit'],
        del: ['admin', 'featureCategor:del']
      },
      currentPage: 1,
      pageSize: 20,
      total: 0,
      tableData: [],
      tableLoading: false,
      editForm: {
        name: '',
        level: null,
        imgUrl: '',
        parentId: null,
        remark: ''
      },
      levelList: [
        {
          id: 1,
          name: '一级分类'
        },
        {
          id: 2,
          name: '二级分类'
        }
      ],
      dialogVisible: false,
      rules: {
        name: [
          { required: true, message: '请输入特色课程标题', trigger: 'blur' }
        ],
        level: [
          { required: true, message: '请选择特色课程分类级别', trigger: 'blur' }
        ],
        imgUrl: [
          { required: true, message: '请上传特色课程封面图', trigger: 'change' }
        ],
        parentId: [
          { required: true, message: '请选择一级分类', trigger: 'blur' }
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
  },
  methods: {
    // 获取分类
    getSourceCategory(id) {
      getFeatureCategoryListById(id).then(res => {
        if (res) {
          if (id < 1) {
            this.oneCategoryList = res
          } else {
            this.twoCategoryList = res
          }
        } else {
          if (id < 1) {
            this.oneCategoryList = []
          } else {
            this.twoCategoryList = []
          }
        }
      })
    },
    // 获取专题分类
    getTableData() {
      const req = {
        page: this.currentPage - 1,
        size: this.pageSize
      }
      getFeatureCategorList(req).then(res => {
        this.tableData = res.content
        this.total = res.totalElements
      })
    },
    changeLevel(val) {
      if (val > 1) {
        this.getSourceCategory(0)
      } else {
        this.editForm.parentId = null
      }
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
        name: '',
        level: null,
        imgUrl: '',
        parentId: null,
        remark: ''
      }
      this.twoCategoryList = []
      this.dialogVisible = true
    },
    getEdit(id) {
      this.editForm.imgUrl = null
      getFeatureCategoryDetail({ id: id }).then(res => {
        if (res.level === 1) {
          this.getSourceCategory(res.id)
        } else {
          this.getSourceCategory(0)
        }
        this.editForm = res
        this.dialogVisible = true
      })
    },
    delMethod(id) {
      this.delLoading = true
      delFeatureCategory({ id: id }).then(() => {
        this.delLoading = false
        this.currentPage = 1
        this.getTableData()
      }).catch(() => {
        this.delLoading = false
      })
    },
    save() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const req = this.editForm.id ? editFeatureCategory : addFeatureCategory
          this.editLoading = true
          req({ ...this.editForm, parentId: this.editForm.level > 1 ? this.editForm.parentId : 0 }).then(res => {
            if (this.editForm.level === 1) {
              this.$refs['upload'].clearFiles()
            }
            this.$refs['form'].resetFields()
            this.editLoading = false
            this.dialogVisible = false
            this.currentPage = 1
            this.getTableData()
          }).catch(() => {
            this.$refs['form'].resetFields()
            if (this.editForm.level === 1) {
              this.$refs['upload'].clearFiles()
            }
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
      if (this.editForm.level === 1) {
        this.$refs['upload'].clearFiles()
      }
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
    text-align: right;
  }
  .avatar {
    width: 100px;
    height: 100px;
    border-radius: 4px;
  }
  .twobox{
    border: 1px solid #eee;
    overflow: hidden;
    div {
      float: left;
      width: 50%;
      padding: 10px;
      line-height: 24px;
      span{
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        text-align: center;
        background: #eee;
        margin-right: 8px;
      }
    }
  }
</style>
