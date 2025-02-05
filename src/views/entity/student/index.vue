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
          <el-form-item label="用户id" prop="userId">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学号" prop="studentNumber">
            <el-input v-model="form.studentNumber" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="头像地址">
            <el-input v-model="form.avatarName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="校积分">
            <el-input v-model="form.schoolPoints" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="区积分">
            <el-input v-model="form.districtPoints" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生完成区挑战的数量">
            <el-input v-model="form.completedDistrictChallenge" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生完成校挑战的数量">
            <el-input v-model="form.completedSchoolChallenge" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生获得区成就的数量">
            <el-input v-model="form.completedDistrictAchievement" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生获得校成就的数量">
            <el-input v-model="form.completedSchoolAchievement" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学生看完的精品课的数量">
            <el-input v-model="form.completedQualityCourse" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新着">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="创建日期">
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
        <el-table-column prop="name" label="姓名" />
        <el-table-column prop="studentNumber" label="学号" />
        <el-table-column prop="avatarName" label="头像地址" />
        <el-table-column prop="schoolPoints" label="校积分" />
        <el-table-column prop="districtPoints" label="区积分" />
        <el-table-column prop="completedDistrictChallenge" label="学生完成区挑战的数量" />
        <el-table-column prop="completedSchoolChallenge" label="学生完成校挑战的数量" />
        <el-table-column prop="completedDistrictAchievement" label="学生获得区成就的数量" />
        <el-table-column prop="completedSchoolAchievement" label="学生获得校成就的数量" />
        <el-table-column prop="completedQualityCourse" label="学生看完的精品课的数量" />
        <el-table-column prop="createBy" label="创建者" />
        <el-table-column prop="updateBy" label="更新着" />
        <el-table-column prop="createTime" label="创建日期">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column v-permission="['admin','student:edit','student:del']" label="操作" width="150px" align="center">
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
import crudStudent from '@/api/student'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, userId: null, name: null, studentNumber: null, avatarName: null, schoolPoints: null, districtPoints: null, completedDistrictChallenge: null, completedSchoolChallenge: null, completedDistrictAchievement: null, completedSchoolAchievement: null, completedQualityCourse: null, createBy: null, updateBy: null, createTime: null, updateTime: null }
export default {
  name: 'Student',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '学生', url: 'api/student', sort: 'id,desc', crudMethod: { ...crudStudent }})
  },
  data() {
    return {
      permission: {
        add: ['admin', 'student:add'],
        edit: ['admin', 'student:edit'],
        del: ['admin', 'student:del']
      },
      rules: {
        userId: [
          { required: true, message: '用户id不能为空', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '姓名不能为空', trigger: 'blur' }
        ],
        studentNumber: [
          { required: true, message: '学号不能为空', trigger: 'blur' }
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
