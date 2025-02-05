<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
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
        width="600px"
      >
        <el-form
          ref="form"
          :model="form"
          :rules="rules"
          size="small"
          label-width="120px"
        >
          <!-- <el-form-item label="id" prop="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="课程总标题名称">
            <el-input v-model="form.name" style="width: 370px" />
          </el-form-item>
          <el-form-item label="课程简介">
            <el-input v-model="form.briefIntroduction" style="width: 370px" />
          </el-form-item>
          <!-- <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="添加时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="课程总评分">
            <el-input v-model="form.totalPoints" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="作者id">
            <el-input v-model="form.authorId" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="作者姓名">
            <el-input v-model="form.authorName" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="课程所属部门">
            <el-input v-model="form.deptId" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="参与评分的总人数">
            <el-input v-model="form.scorePersonNumber" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="课程状态">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="课程图片">
            <!-- <el-input v-model="form.coverImage" style="width: 370px" /> -->
            <el-upload
              ref="upload"
              accept=".jpg, .jpeg, .png"
              :limit="1"
              :auto-upload="true"
              :headers="headers"
              :on-success="handleSuccess"
              :on-error="handleError"
              :action="baseApi + '/api/localStorage/upload'"
            >
              <img v-if="form.badgeUrl" :src="baseApi + '/file/' + form.badgeUrl" class="avatar">
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传图片文件，且不超过6M</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="能否下载">
            <!-- <el-input v-model="form.download" style="width: 370px;" /> -->
            <el-select
              v-model="form.download"
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
          <el-form-item label="课程版块">
            <!-- <el-input v-model="form.courseCategory" style="width: 370px;" /> -->
            <el-select
              v-model="form.courseCategoryId2"
              style="width: 370px"
              placeholder="请选择"
              @change="selectCategory2"
            >
              <el-option
                v-for="item in lessonList"
                :key="item.id"
                :label="item.detail"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="课程类目">
            <!-- <el-input v-model="form.courseCategory" style="width: 370px;" /> -->
            <el-select
              v-model="form.courseCategoryId3"
              style="width: 370px"
              placeholder="请选择"
              @change="selectCategory3"
            >
              <el-option
                v-for="item in courseCategoryList3"
                :key="item.id"
                :label="item.detail"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="年级">
            <el-select
              v-model="form.courseCategoryId1"
              style="width: 370px"
              placeholder="请选择"
              @change="selectCategory1"
            >
              <el-option
                v-for="item in gradeList"
                :key="item.id"
                :label="item.detail"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="schoolName">
            <el-input v-model="form.schoolName" style="width: 370px;" />
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
        <el-table-column prop="id" label="id" />
        <el-table-column prop="name" label="课程总标题名称" />
        <el-table-column prop="briefIntroduction" label="课程简介" />
        <el-table-column prop="createBy" label="创建者" />
        <!-- <el-table-column prop="updateBy" label="更新者" /> -->
        <el-table-column prop="createTime" label="添加时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="totalPoints" label="课程总评分" />
        <!-- <el-table-column prop="authorId" label="作者id" /> -->
        <el-table-column prop="authorName" label="作者姓名" />
        <!-- <el-table-column prop="deptId" label="课程所属部门" /> -->
        <el-table-column prop="scorePersonNumber" label="参与评分的总人数" />
        <el-table-column prop="status" label="课程状态">
          <template slot-scope="scope">
            <span v-if="scope.row.status === 0">已保存</span>
            <span v-if="scope.row.status === 1">已发布</span>
            <span v-if="scope.row.status === 2">申精中。。。</span>
            <span v-if="scope.row.status === 3">精品课</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="coverImage" label="coverImage" /> -->
        <el-table-column prop="download" label="是否下载">
          <template slot-scope="scope">
            <span v-if="scope.row.download === 0">不可下载</span>
            <span v-if="scope.row.download === 1">可下载</span>
          </template>
        </el-table-column>
        <el-table-column prop="courseCategory" label="课程名" />
        <el-table-column prop="grade" label="年级" />
        <el-table-column prop="schoolName" label="学校名" />
        <el-table-column
          v-permission="['admin', 'courseTitle:edit', 'courseTitle:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <udOperation
              v-if="scope.row.status !== 2"
              :data="scope.row"
              :permission="permission"
            />
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
import crudCourseTitle from '@/api/courseTitle'
import { Notification } from 'element-ui'
import { getToken } from '@/utils/auth'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  name: null,
  briefIntroduction: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null,
  totalPoints: null,
  authorId: null,
  authorName: null,
  deptId: null,
  pageView: null,
  scorePersonNumber: null,
  status: null,
  coverImage: null,
  uploadTime: null,
  download: null,
  courseCategory: null,
  grade: null,
  courseCategoryId1: null,
  courseCategoryId2: null,
  courseCategoryId3: null,
  courseCategoryName3: null,
  schoolName: null
}
export default {
  name: 'CourseTitle',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '课程总标题',
      url: 'api/courseTitle',
      sort: 'id,desc',
      crudMethod: { ...crudCourseTitle }
    })
  },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: [''],
        edit: ['admin', 'courseTitle:edit', 'dept:edit'],
        del: ['admin', 'courseTitle:del', 'dept:del']
      },
      download: [
        { label: '是', id: 1 },
        { label: '否', id: 0 }
      ],
      lessonList: [],
      rules: {
        id: [{ required: true, message: '不能为空', trigger: 'blur' }]
      },
      courseCategoryList3: [],
      gradeList: []
    }
  },
  computed: {
    ...mapGetters(['user', 'baseApi'])
  },
  created() {
    crudCourseTitle
      .getgrade(1)
      .then((res) => {
        this.gradeList = res
      })
      .catch((error) => {
        console.log(error)
      })
    crudCourseTitle
      .getgrade(2)
      .then((res) => {
        this.lessonList = res
      })
      .catch((error) => {
        console.log(error)
      })
    crudCourseTitle
      .getgrade(3)
      .then((res) => {
        this.courseCategoryList3 = res
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
    selectCategory1(val) {
      this.form.grade = this.gradeList.filter(item => item.id === val)[0].detail
    },
    selectCategory2(val) {
      this.form.courseCategory = this.lessonList.filter(item => item.id === val)[0].detail
    },
    selectCategory3(val) {
      this.form.courseCategoryName3 = this.courseCategoryList3.filter(item => item.id === val)[0].detail
    },
    handleSuccess(response) {
      console.log(response)
      this.form.badgeUrl = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
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
      crudCourseTitle
        .check(data)
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
.avatar {
  width: 100px;
  height: 100px;
}
</style>
