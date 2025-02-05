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
          <el-form-item label="预约人id">
            <el-input v-model="form.userId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="要预约的实践资源id">
            <el-input v-model="form.hardwareId" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="要预约的实践资源名字">
            <el-input v-model="form.hardwareName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="预约状态 0：已预约待审核，1：通过，2：不通过">
            <el-input v-model="form.status" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="预约人名字">
            <el-input v-model="form.userName" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="预约人联系方式">
            <el-input v-model="form.mobile" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="参观开始时间">
            <el-input v-model="form.startTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="参观结束时间">
            <el-input v-model="form.endTime" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="参观人次">
            <el-input v-model="form.numberOfPeople" style="width: 370px;" />
          </el-form-item>
          <el-form-item label="学校名称">
            <el-input v-model="form.schoolName" style="width: 370px;" />
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
        <!-- <el-table-column prop="userId" label="预约人id" /> -->
        <!-- <el-table-column prop="hardwareId" label="要预约的硬件id" /> -->
        <el-table-column prop="hardwareName" label="要预约的实践资源名字" />
        <!-- <el-table-column prop="status" label="预约状态 0：已预约待审核，1：通过，2：不通过" /> -->
        <el-table-column prop="userName" label="预约人名字" />
        <el-table-column prop="mobile" label="预约人联系方式" />
        <!-- <el-table-column prop="startTime" label="参观开始时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.startTime) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="endTime" label="参观结束时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.endTime) }}</span>
          </template>
        </el-table-column> -->
        <!-- <el-table-column prop="numberOfPeople" label="参观人次" /> -->
        <el-table-column prop="schoolName" label="学校名称" />
        <el-table-column prop="createBy" label="创建者" />
        <el-table-column prop="updateBy" label="更新者" />
        <el-table-column prop="createTime" label="创建时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column prop="updateTime" label="更新时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column> -->
        <el-table-column
          v-permission="['admin','hardwareReserve:edit','hardwareReserve:del']"
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
              @click="agree(1,scope.row.id)"
            >通过</el-button>
            <el-button
              class="filter-item"
              type="danger"
              size="mini"
              @click="agree(2,scope.row.id)"
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
import crudHardwareReserve from '@/api/hardwareReserve'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
// import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
// import udOperation from '@crud/UD.operation'
import pagination from '@crud/Pagination'

const defaultForm = {
  id: null,
  userId: null,
  hardwareId: null,
  hardwareName: null,
  status: null,
  userName: null,
  mobile: null,
  startTime: null,
  endTime: null,
  numberOfPeople: null,
  schoolName: null,
  createBy: null,
  updateBy: null,
  createTime: null,
  updateTime: null
}
export default {
  name: 'HardwareReserve',
  components: { pagination, crudOperation },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  cruds() {
    return CRUD({
      title: '实践资源表',
      url: 'api/hardwareReserve',
      sort: 'id,desc',
      crudMethod: { ...crudHardwareReserve }
    })
  },
  data() {
    return {
      permission: {
        add: [''],
        edit: [''],
        del: ['']
      },
      rules: {}
    }
  },
  methods: {
    // 钩子：在获取表格数据之前执行，false 则代表不获取数据
    [CRUD.HOOK.beforeRefresh]() {
      return true
    },
    agree(type, id) {
      const data = {
        type: type,
        hardwareReserveId: id
      }
      crudHardwareReserve
        .agree(data)
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
