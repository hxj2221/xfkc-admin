<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <label class="el-form-item-label">成就名称</label>
        <el-input v-model="query.name" clearable placeholder="成就名称" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <!-- <label class="el-form-item-label">成就级别，分为每个学校自己设计的成就和区级设计的成就</label> -->
        <!-- <el-input v-model="query.deptId" clearable placeholder="成就级别，分为每个学校自己设计的成就和区级设计的成就" style="width: 185px;" class="filter-item" @keyup.enter.native="crud.toQuery" /> -->
        <rrOperation :crud="crud" />
      </div>
      <!--如果想在工具栏加入更多按钮，可以使用插槽方式， slot = 'left' or 'right'-->
      <crudOperation :permission="permission" />
      <!--表单组件-->
      <el-dialog :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">
        <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
          <!-- <el-form-item label="id">
            <el-input v-model="form.id" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="成就名称" prop="name">
            <el-input v-model="form.name" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="成就类型" prop="type">
            <el-select
              v-model="form.type"
              style="width: 370px"
              placeholder="请选择"
            >
              <el-option
                v-for="item in typeList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="成就级别，分为每个学校自己设计的成就和区级设计的成就" prop="deptId">
            <el-input v-model="form.deptId" style="width: 370px;" />
          </el-form-item> -->
          <el-form-item label="成就徽章">
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
          <el-form-item label="成就简介" prop="introduction">
            <el-input v-model="form.introduction" style="width: 370px;" />
          </el-form-item>
          <!-- <el-form-item label="创建者">
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
          </el-form-item> -->
          <!-- <el-form-item label="已获得人数">
            <el-input v-model="form.numberOfPeople" style="width: 370px;" />
          </el-form-item> -->
          <!-- <el-form-item label="挑战完成条件" prop="completedCondition">
            <el-input v-model="form.completedCondition" style="width: 370px;" />
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
        <el-table-column prop="id" label="id" />
        <el-table-column prop="name" label="成就名称" />
        <!-- <el-table-column prop="deptId" label="成就级别，分为每个学校自己设计的成就和区级设计的成就" /> -->
        <!-- <el-table-column prop="badgeUrl" label="成就徽章" /> -->
        <el-table-column prop="introduction" label="成就简介" />
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
        <!-- <el-table-column prop="numberOfPeople" label="已获得人数" /> -->
        <!-- <el-table-column prop="completedCondition" label="挑战完成条件" /> -->
        <el-table-column v-permission="['admin','achievement:edit','achievement:del']" label="操作" width="150px" align="center">
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
import crudAchievement from '@/api/achievement'
import { Notification } from 'element-ui'
import { getToken } from '@/utils/auth'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = { id: null, name: null, deptId: null, badgeUrl: null, introduction: null, createBy: null, updateBy: null, createTime: null, updateTime: null, numberOfPeople: null, completedCondition: null }
export default {
  name: 'Achievement',
  components: { pagination, crudOperation, rrOperation, udOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({ title: '成就', url: 'api/achievement', sort: 'id,desc', crudMethod: { ...crudAchievement }})
  },
  data() {
    return {
      typeList: [
        {
          id: 0,
          name: '普通成就'
        },
        {
          id: 1,
          name: '游戏成就'
        }
      ],
      headers: { Authorization: getToken() },
      permission: {
        add: ['admin', 'achievement:add', 'dept:add'],
        edit: ['admin', 'achievement:edit', 'dept:edit'],
        del: ['admin', 'achievement:del', 'dept:del']
      },
      rules: {
        name: [
          { required: true, message: '成就名称不能为空', trigger: 'blur' }
        ],
        deptId: [
          { required: true, message: '成就级别，分为每个学校自己设计的成就和区级设计的成就不能为空', trigger: 'blur' }
        ],
        badgeUrl: [
          { required: true, message: '成就徽章不能为空', trigger: 'blur' }
        ],
        introduction: [
          { required: true, message: '成就简介不能为空', trigger: 'blur' }
        ]
        // completedCondition: [
        //   { required: true, message: '挑战完成条件不能为空', trigger: 'blur' }
        // ]
      },
      queryTypeOptions: [
        { key: 'name', display_name: '成就名称' },
        { key: 'deptId', display_name: '成就级别，分为每个学校自己设计的成就和区级设计的成就' }
      ]
    }
  },
  computed: {
    ...mapGetters(['baseApi', 'fileUploadApi', 'user'])
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    handleSuccess(response) {
      this.form.badgeUrl = response.path
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
  width:100px;
  height: 100px;
}
</style>
