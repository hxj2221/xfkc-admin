<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <el-form-item label="挑战说明" prop="introduction">
            <el-input v-model="form.introduction" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战目标" prop="goals">
            <el-input v-model="form.goals" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战成功后可获得的积分" prop="rewardPoints">
            <el-input v-model="form.rewardPoints" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战图片" prop="picUrl">
            <el-input v-model="form.picUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战成功后可获得的成就">
            <el-input v-model="form.achievement" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战名称" prop="challengeName">
            <el-input v-model="form.challengeName" style="width: 370px;" />
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
        <el-table-column prop="id" label="ID" />
        <el-table-column prop="introduction" label="挑战说明" />
        <el-table-column prop="goals" label="挑战目标" />
        <el-table-column prop="rewardPoints" label="挑战成功后可获得的积分" />
        <el-table-column prop="picUrl" label="挑战图片" />
        <el-table-column prop="achievement" label="挑战成功后可获得的成就" />
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
        <el-table-column prop="challengeName" label="挑战名称" />
        <el-table-column v-permission="['admin','challenge:edit','challenge:del']" label="操作" width="150px" align="center">
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
import crudChallenge from '@/api/challenge'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, challengeDeptId: null, introduction: null, goals: null, rewardPoints: null, picUrl: null, achievement: null, status: null, createBy: null, updateBy: null, createTime: null, updateTime: null, authorId: null, authorName: null, challengeName: null }
export default {
  name: 'Challenge',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '挑战', url: 'api/challenge', sort: 'id,desc', crudMethod: { ...crudChallenge }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'challenge:add'],
        edit: ['admin', 'challenge:edit'],
        del: ['admin', 'challenge:del']
      },
      rules: {
        id: [
          { required: true, message: 'ID不能为空', trigger: 'blur' }
        ],
        introduction: [
          { required: true, message: '挑战说明不能为空', trigger: 'blur' }
        ],
        goals: [
          { required: true, message: '挑战目标不能为空', trigger: 'blur' }
        ],
        rewardPoints: [
          { required: true, message: '挑战成功后可获得的积分不能为空', trigger: 'blur' }
        ],
        picUrl: [
          { required: true, message: '挑战图片不能为空', trigger: 'blur' }
        ],
        challengeName: [
          { required: true, message: '挑战名称不能为空', trigger: 'blur' }
        ]
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
