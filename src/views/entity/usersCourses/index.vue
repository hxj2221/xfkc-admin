<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户id">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="课程id">
            <el-input v-model="form.courseId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户给课程的评分">
            <el-input v-model="form.score" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="用户观看时长">
            <el-input v-model="form.watchTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="课程是否看完，0：未看完，1：已看完">
            <el-input v-model="form.isfinished" style="width: 370px;" />
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
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="text" @click="crud.cancelCU">取消</el-button>
          <el-button :loading="crud.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>
        </div>
      </el-dialog>
      <!--表格渲染-->
      <el-table ref="table" v-loading="crud.loading" :data="crud.data" size="small" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="id" />
        <el-table-column prop="userId" label="用户id" />
        <el-table-column prop="courseId" label="课程id" />
        <el-table-column prop="score" label="用户给课程的评分" />
        <el-table-column prop="watchTime" label="用户观看时长" />
        <el-table-column prop="isfinished" label="课程是否看完，0：未看完，1：已看完" />
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
        <el-table-column v-permission="['admin','usersCourses:edit','usersCourses:del']" label="操作" width="150px" align="center">
          <template slot-scope="scope">
            <udOperation
              :data="scope.row"
              :permission="permission"
            />
          </template>
        </el-table-column>
      </el-table>
      <!--分页组件-->
      <pagination />
    </div>
  </div>
</template>

<script>
import crudUsersCourses from '@/api/usersCourses'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, userId: null, courseId: null, score: null, watchTime: null, isfinished: null, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'UsersCourses',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '用户和课程绑定', url: 'api/usersCourses', sort: 'id,desc', crudMethod: { ...crudUsersCourses }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'usersCourses:add'],
        edit: ['admin', 'usersCourses:edit'],
        del: ['admin', 'usersCourses:del']
      },
      rules: {
      }}
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    }
  }
}
</script>

<style scoped>

</style>
