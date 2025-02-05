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
          <el-form-item label="挑战成功后可获得的积分">
            <el-input v-model="form.rewardPoints" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战图片" prop="picUrl">
            <el-input v-model="form.picUrl" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="挑战图片">
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
              <img v-if="form.picUrl" :src="baseApi + '/file/' + form.picUrl" class="avatar">
              <div v-else class="eladmin-upload">
                <i class="el-icon-upload" /> 添加文件
              </div>
              <div slot="tip" class="el-upload__tip">可上传图片文件，且不超过6M</div>
            </el-upload>
          </el-form-item>
          <!-- <el-form-item label="创建者">
            <el-input v-model="form.createBy" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新者">
            <el-input v-model="form.updateBy" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="创建时间">
            <el-input v-model="form.createTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="更新时间">
            <el-input v-model="form.updateTime" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="挑战名称" prop="challengeName">
            <el-input v-model="form.challengeName" style="width: 370px;" />
          </el-form-item>
          <!-- <el-form-item label="截止时间">
            <el-input v-model="form.endTime" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="挑战成功后可获得的成就id">
            <el-input v-model="form.achievementId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="完成条件" prop="completedCondition">
            <el-input v-model="form.completedCondition" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="该挑战指定的审核人，0：自己，1：学生家长">
            <el-input v-model="form.checkPerson" style="width: 370px;" />
          </el-form-item>
          <!-- <el-form-item label="挑战开始时间">
            <el-input v-model="form.startTime" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="已获得人数">
            <el-input v-model="form.numberOfPeople" style="width: 370px;" />
          </el-form-item> -->
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
        <el-table-column prop="rewardPoints" label="挑战成功后可获得的积分" />
        <!-- <el-table-column prop="picUrl" label="挑战图片" /> -->
        <!-- <el-table-column prop="createBy" label="创建者" /> -->
        <!-- <el-table-column prop="updateBy" label="更新者" /> -->
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
        <el-table-column prop="endTime" label="截止时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="achievementId" label="挑战成功后可获得的成就id" /> -->
        <el-table-column prop="completedCondition" label="完成条件" />
        <el-table-column prop="checkPerson" label="该挑战指定的审核人，0：自己，1：学生家长" />
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
import { mapGetters } from 'vuex'
import crudChallenge from '@/api/challenge'
import { getToken } from '@/utils/auth'
import { Notification } from 'element-ui'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, introduction: null, rewardPoints: null, picUrl: null, status: null, createBy: null, updateBy: null, createTime: null, updateTime: null, authorId: null, authorName: null, challengeName: null, endTime: null, achievementId: null, completedCondition: null, checkPerson: null, startTime: null, numberOfPeople: null }
export default {
  name: 'Challenge',
  components: { pagination, crudOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '挑战', url: 'api/challenge', sort: 'id,desc', crudMethod: { ...crudChallenge }})
  },
  data() {
    return {
      headers: { Authorization: getToken() },
      permission: {
        add: [''],
        edit: ['admin', 'usersChallenges:edit', 'dept:edit'],
        del: ['admin', 'usersChallenges:del', 'dept:del']
      },
      rules: {
        id: [
          { required: true, message: 'ID不能为空', trigger: 'blur' }
        ],
        introduction: [
          { required: true, message: '挑战说明不能为空', trigger: 'blur' }
        ],
        picUrl: [
          { required: true, message: '挑战图片不能为空', trigger: 'blur' }
        ],
        challengeName: [
          { required: true, message: '挑战名称不能为空', trigger: 'blur' }
        ],
        completedCondition: [
          { required: true, message: '完成条件不能为空', trigger: 'blur' }
        ]
      }}
  },
  computed: {
    ...mapGetters(['user', 'baseApi'])
  },

  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccess(response) {
      console.log(response)
      this.form.picUrl = response.path
    },
    handleError(response) {
      if (response.status === 400) {
        Notification.error({
          title: '图片大小不能超过6MB'
        })
      }
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
