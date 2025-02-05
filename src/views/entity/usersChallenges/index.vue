<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">用户名</label>
        <el-input
          v-model="query.userName"
          clearable
          placeholder="用户名"
          style="width: 185px;"
          class="filter-item"
          @keyup.enter.native="crud.toQuery"
        />
        <label class="el-form-item-label">挑战名称</label>
        <el-input
          v-model="query.challengeName"
          clearable
          placeholder="挑战名称 "
          style="width: 185px;"
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
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id" prop="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户表主键" prop="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战表主键" prop="challengeId">
            <el-input v-model="form.challengeId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户参加挑战状态">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户报名时间">
            <el-input v-model="form.startTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户上传挑战成果时间">
            <el-input v-model="form.uploadTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.userName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战名称 ">
            <el-input v-model="form.challengeName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生表id">
            <el-input v-model="form.studentId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生姓名">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input v-model="form.username" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生头像">
            <el-input v-model="form.avatarName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="上传文件的路径">
            <el-input v-model="form.filePath" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户上传的视频的文字说明">
            <el-input v-model="form.fileIntroduction" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="该挑战指定审核人Id">
            <el-input v-model="form.checkPersonId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战截止时间">
            <el-input v-model="form.endTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="isDistrict">
            <el-input v-model="form.isDistrict" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户挑战通过时间">
            <el-input v-model="form.passTime" style="width: 370px;" />
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
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
        <el-table-column prop="id" label="id" />
        <el-table-column prop="userId" label="用户表主键" />
        <el-table-column prop="challengeId" label="挑战表主键" />
        <el-table-column prop="status" label="用户参加挑战状态" />
        <el-table-column prop="startTime" label="用户报名时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="用户上传挑战成果时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.uploadTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createBy" label="创建者" />
        <el-table-column prop="updateBy" label="更新者" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="challengeName" label="挑战名称 " />
        <el-table-column prop="studentId" label="学生表id" />
        <el-table-column prop="name" label="学生姓名" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="avatarName" label="学生头像" />
        <el-table-column prop="filePath" label="上传文件的路径" />
        <el-table-column prop="fileIntroduction" label="用户上传的视频的文字说明" />
        <el-table-column prop="checkPersonId" label="该挑战指定审核人Id" />
        <el-table-column prop="passTime" label="用户挑战通过时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.passTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="挑战截止时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="isDistrict" label="isDistrict" />
        <!-- <el-table-column prop="passTime" label="用户挑战通过时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.passTime) }}</span>
          </template>
        </el-table-column>-->
        <el-table-column
          v-permission="['admin','usersChallenges:edit','usersChallenges:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <!-- <udOperation
              :data="scope.row"
              :permission="permission"
            />-->
            <el-button
              class="filter-item"
              size="mini"
              type="success"
              @click="agree(scope.row.id)"
            >通过</el-button>
            <el-button
              class="filter-item"
              type="danger"
              size="mini"
              @click="refuse(scope.row.id)"
            >驳回</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudUsersChallenges from '@/api/usersChallenges'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
// import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  userId: null,
  challengeId: null,
  status: null,
  startTime: null,
  uploadTime: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null,
  userName: null,
  challengeName: null,
  studentId: null,
  name: null,
  username: null,
  avatarName: null,
  filePath: null,
  fileIntroduction: null,
  checkPersonId: null,
  passTime: null,
  endTime: null,
  isDistrict: null
}
export default {
  name: 'UsersChallenges',
  components: { pagination, crudOperation, rrOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '用户和挑战绑定',
      url: 'api/usersChallenges',
      sort: 'id,desc',
      crudMethod: { ...crudUsersChallenges }
    })
  },
  data() {
    return {
      permission: {
        add: ['admin', 'usersChallenges:add'],
        edit: ['admin', 'usersChallenges:edit'],
        del: ['admin', 'usersChallenges:del']
      },
      rules: {
        id: [{ required: true, message: '不能为空', trigger: 'blur' }],
        userId: [
          { required: true, message: '用户表主键不能为空', trigger: 'blur' }
        ],
        challengeId: [
          { required: true, message: '挑战表主键不能为空', trigger: 'blur' }
        ]
      },
      queryTypeOptions: [
        { key: 'userName', display_name: '用户名' },
        { key: 'challengeName', display_name: '挑战名称 ' }
      ]
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    agree(id) {
      const data = {
        id: id
      }
      crudUsersChallenges
        .agree(data)
        .then((res) => {
          this.crud.refresh()
        })
        .catch((error) => {
          console.log(error)
        })
    },
    refuse(id) {
      const data = {
        id: id
      }
      crudUsersChallenges
        .refuse(data)
        .then((res) => {
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
