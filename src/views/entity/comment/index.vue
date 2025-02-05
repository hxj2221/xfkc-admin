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
        width="500px"
      >
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="添加时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="头像地址">
            <el-input v-model="form.avatarName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="课程id">
            <el-input v-model="form.courseTitleId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="评论内容">
            <el-input v-model="form.content" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="评论审核状态：0：待审核，1：审核通过，2：审核不通过">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="replyUserId">
            <el-input v-model="form.replyUserId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="pid" prop="pid">
            <el-input v-model="form.pid" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="replyUserName">
            <el-input v-model="form.replyUserName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="userName">
            <el-input v-model="form.userName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="所属学校id">
            <el-input v-model="form.deptId" style="width: 370px;" />
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
        <el-table-column label="添加时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="avatarName" label="头像地址" /> -->
        <el-table-column prop="createBy" label="创建者" />
        <!-- <el-table-column prop="updateBy" label="更新者" /> -->
        <el-table-column prop="courseTitleId" label="课程id" />
        <el-table-column prop="content" label="评论内容" />
        <el-table-column prop="status" label="评论审核状态：0：待审核，1：审核通过，2：审核不通过" />
        <!-- <el-table-column prop="replyUserId" label="replyUserId" /> -->
        <!-- <el-table-column prop="userId" label="userId" /> -->
        <!-- <el-table-column prop="pid" label="pid" /> -->
        <!-- <el-table-column prop="replyUserName" label="replyUserName" /> -->
        <el-table-column prop="userName" label="评论人" />
        <!-- <el-table-column prop="deptId" label="所属学校id" /> -->
        <el-table-column
          v-permission="['admin','comment:edit','comment:del']"
          label="操作"
          width="150px"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              class="filter-item"
              size="mini"
              type="success"
              @click="pass(scope.row.id,1)"
            >通过</el-button>
            <el-button
              class="filter-item"
              type="danger"
              size="mini"
              @click="pass(scope.row.id,2)"
            >驳回</el-button>
            <!-- <udOperation
              :data="scope.row"
              :permission="permission"
            />-->
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudComment from '@/api/comment'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
// import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  createTime: null,
  updateTime: null,
  avatarName: null,
  createBy: null,
  updateBy: null,
  courseTitleId: null,
  content: null,
  status: null,
  replyUserId: null,
  userId: null,
  pid: null,
  replyUserName: null,
  userName: null,
  deptId: null
}
export default {
  name: 'Comment',
  components: { pagination, crudOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '评论评价',
      url: 'api/comment',
      sort: 'id,desc',
      crudMethod: { ...crudComment }
    })
  },
  data() {
    return {
      permission: {
        add: [''],
        edit: ['admin', 'comment:edit'],
        del: ['admin', 'comment:del']
      },
      rules: {
        pid: [{ required: true, message: '不能为空', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    console.log(this.crud)
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    pass(id, type) {
      const data = {
        type: type,
        id: Number(id)
      }
      crudComment.pass(data)
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
