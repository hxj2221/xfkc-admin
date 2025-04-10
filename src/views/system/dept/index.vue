<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <!-- 搜索 -->
        <el-input v-model="query.name" clearable size="small" placeholder="输入学校/班级名称搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <date-range-picker v-model="query.createTime" class="date-item" />
        <el-select v-model="query.enabled" clearable size="small" placeholder="状态" class="filter-item" style="width: 90px" @change="crud.toQuery">
          <el-option v-for="item in enabledTypeOptions" :key="item.key" :label="item.display_name" :value="item.key" />
        </el-select>
        <rrOperation />
      </div>
      <crudOperation
        hidden-add
        hidden-edit
        :permission="permission"
      />
      <!-- <el-button v-if="roleInfo.level === 2" type="primary" >添加年级</el-button> -->
    </div>
    <!--表单组件-->
    <!--    <el-dialog append-to-body :close-on-click-modal="false" :before-close="crud.cancelCU" :visible.sync="crud.status.cu > 0" :title="crud.status.title" width="500px">-->
    <!--      <el-form ref="form" inline :model="form" :rules="rules" size="small" label-width="80px">-->
    <!--        <el-form-item label="学校/班级名称" prop="name">-->
    <!--          <el-input v-model="form.name" style="width: 370px;" />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="学校/班级排序" prop="deptSort">-->
    <!--          <el-input-number-->
    <!--            v-model.number="form.deptSort"-->
    <!--            :min="0"-->
    <!--            :max="999"-->
    <!--            controls-position="right"-->
    <!--            style="width: 370px;"-->
    <!--          />-->
    <!--        </el-form-item>-->
    <!--        <el-form-item label="学校类型" prop="level">-->
    <!--          <el-select-->
    <!--            v-model="form.level"-->
    <!--            style="width: 370px"-->
    <!--            placeholder="请选择"-->
    <!--          >-->
    <!--            <el-option-->
    <!--              v-for="item in levelList"-->
    <!--              :key="item.id"-->
    <!--              :label="item.name"-->
    <!--              :value="item.id"-->
    <!--            />-->
    <!--          </el-select>-->
    <!--        </el-form-item>-->

    <!--        <el-form-item label="状态" prop="enabled">-->
    <!--          <el-radio v-for="item in dict.dept_status" :key="item.id" v-model="form.enabled" :label="item.value">{{ item.label }}</el-radio>-->
    <!--        </el-form-item>-->
    <!--        <el-form-item style="margin-bottom: 0;" label="上级学校/班级" prop="pid">-->
    <!--          <treeselect-->
    <!--            v-model="form.pid"-->
    <!--            :load-options="loadDepts"-->
    <!--            :options="depts"-->
    <!--            style="width: 370px;"-->
    <!--            placeholder="选择上级类目"-->
    <!--            @select="changeSelect"-->
    <!--          />-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <div slot="footer" class="dialog-footer">-->
    <!--        <el-button type="text" @click="crud.cancelCU">取消</el-button>-->
    <!--        <el-button :loading="crud.status.cu === 2" type="primary" @click="crud.submitCU">确认</el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
    <!--表格渲染-->
    <el-dialog
      :title=" (form.id ? '编辑' : '添加') + formDialog.title "
      :visible.sync="formDialog.show"
      width="600px"
      @closed="handleCloseDialog"
    >
      <el-form ref="form" :model="form" label-width="80px">
        <el-form-item v-if="form.deptLevel<2" :label="`${formDialog.title}名称`" prop="">
          <el-input v-model="form.name" :placeholder="addPlaceholder" />
        </el-form-item>
        <!-- <el-form-item v-else-if="form.deptLevel==2" :label="`年级`" prop="">
          <el-select
              :disabled="!!form.id"
              v-model="form.grade"
              clearable
              size="small"
              placeholder="年级"
              class="filter-item"
              style="width: 90px"
            >
              <el-option
                v-for="(v, k) in grades[form.level]"
                :key="k"
                :label="v"
                :value="k"
              />
            </el-select>
        </el-form-item> -->
        <el-form-item v-else-if="form.deptLevel==3" :label="`班级`" prop="">
          <el-input v-model="form.name" :disabled="false" :placeholder="addPlaceholder" />
        </el-form-item>
        <el-form-item v-if="roleInfo.level === 1" label="学校类型" prop="">
          <el-radio-group v-model="form.level">
            <el-radio :label="0">幼儿园</el-radio>
            <el-radio :label="1">小学</el-radio>
            <el-radio :label="2">初中</el-radio>
            <el-radio :label="3">高中</el-radio>
            <el-radio :label="4">九年一贯制学校</el-radio>
            <el-radio :label="5">民办一贯制学校</el-radio>
            <el-radio :label="6">民办随迁子女学校</el-radio>
            <el-radio :label="7">民办初中</el-radio>
            <el-radio :label="8">特殊学校</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排列序号" prop="">
          <el-input-number v-model="form.deptSort" :min="0" :max="999" label="label" controls-position="right" />
        </el-form-item>
        <el-form-item label="启用状态" prop="">
          <el-switch v-model="form.enabled" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="formDialog.show = false">取 消</el-button>
        <el-button type="primary" @click="saveItem">保存</el-button>
      </span>
    </el-dialog>

    <el-table
      ref="table"
      v-loading="crud.loading"
      lazy
      :load="getDeptDatas"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
      :data="crud.data"
      row-key="id"
      @select="crud.selectChange"
      @select-all="crud.selectAllChange"
      @selection-change="crud.selectionChangeHandler"
    >
      <el-table-column :selectable="checkboxT" type="selection" width="55" />
      <el-table-column label="名称" min-width="140" prop="name">
        <template slot-scope="scope">
          <template v-if="scope.row.deptLevel === 1">
            <span v-if="scope.row.level === 0" class="school-tag tag-1">幼儿园</span>
            <span v-if="scope.row.level === 1" class="school-tag tag-2">小学</span>
            <span v-if="scope.row.level === 2" class="school-tag tag-3">初中</span>
            <span v-if="scope.row.level === 3" class="school-tag tag-4">高中</span>
            <span v-if="scope.row.level === 4" class="school-tag tag-4">九年一贯学校</span>
            <span v-if="scope.row.level === 5" class="school-tag tag-5">民办一贯制学校</span>
            <span v-if="scope.row.level === 6" class="school-tag tag-6">民办随迁子女学校</span>
            <span v-if="scope.row.level === 7" class="school-tag tag-7">民办初中</span>
            <span v-if="scope.row.level === 8" class="school-tag tag-8">特殊学校</span>
            {{ scope.row.name }}
          </template>
          <template v-else-if="scope.row.deptLevel === 2">
            <span class="school-tag tag-5">年级</span>
            {{ scope.row.name }}
          </template>
          <template v-else-if="scope.row.deptLevel === 3">
            <span class="school-tag tag-6">班级</span>
            {{ scope.row.name }}
          </template>
          <template v-else>
            <span>{{ scope.row.name }}</span>
          </template>

        </template>
      </el-table-column>
      <el-table-column label="排序" prop="deptSort" />
      <el-table-column label="状态" align="center" prop="enabled">
        <template slot-scope="scope">
          <el-switch
            v-model="scope.row.enabled"
            :disabled="scope.row.id === 1"
            active-color="#409EFF"
            inactive-color="#F56C6C"
            @change="changeEnabled(scope.row, scope.row.enabled,)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建日期">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column v-permission="['admin','dept:edit','dept:del']" label="操作" min-width="180px" align="right" fixed="right">
        <template slot-scope="scope">

          <!-- 区管理员仅能创建学校 -->
          <template v-if="roleInfo.level === 1">
            <el-button v-if="scope.row.deptLevel === 0" icon="el-icon-circle-plus" size="mini" type="success" @click="createItem(scope.row)">添加学校</el-button>
          </template>

          <!-- 校管理员仅能创建年级和班级 -->
          <template v-if="roleInfo.level === 2">
            <!-- <el-button v-if="scope.row.deptLevel === 1" icon="el-icon-circle-plus-outline" size="mini" type="success" @click="createItem(scope.row)">生成年级</el-button> -->
            <el-button v-if="scope.row.deptLevel === 1" class="inportant-btn" :loading="uping" icon="el-icon-circle-plus-outline" size="mini" type="warning" @click="upGrade(scope.row)">升学</el-button>
            <el-button v-if="scope.row.deptLevel === 2" icon="el-icon-plus" size="mini" type="success" @click="createItem(scope.row)">添加班级</el-button>
          </template>

          <udOperation
            v-if="scope.row.deptLevel != 2"
            :data="scope.row"
            :permission="permission"
            :disabled-dle="scope.row.id === 1"
            msg="确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！"
          />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import crudDept from '@/api/system/dept'

import { mapGetters } from 'vuex'
// import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { LOAD_CHILDREN_OPTIONS } from '@riophae/vue-treeselect'
import CRUD, { presenter, header, form, crud } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import udOperation from '@crud/UD.operation'
import DateRangePicker from '@/components/DateRangePicker'

const defaultForm = {
  id: null,
  name: '',
  label: '',
  pid: null,
  level: 0, // 这个是学校类型！！！  0:幼儿园, 1:小学, 2:初中, 3:高中
  deptLevel: 0, // 这个是部门级别   0:总区, 1:学校, 2:班级, 3:年级
  grade: null, // 年级
  deptSort: 999,
  subCount: 0,
  enabled: true
}
export default {
  name: 'Dept',
  components: {
    // Treeselect,
    crudOperation, rrOperation, udOperation, DateRangePicker },
  cruds() {
    return CRUD({ title: '学校/班级', url: 'api/dept', crudMethod: { ...crudDept }})
  },
  mixins: [presenter(), header(), form(defaultForm), crud()],
  // 设置数据字典
  dicts: ['dept_status'],
  data() {
    return {
      levelList: [
        { id: 0, name: '幼儿园' },
        { id: 1, name: '小学' },
        { id: 2, name: '初中' },
        { id: 3, name: '高中' },
        { id: 4, name: '九年一贯学校' },
        { id: 5, name: '民办一贯制学校' },
        { id: 6, name: '民办随迁子女学校' },
        { id: 7, name: '民办初中' },
        { id: 8, name: '特殊学校' }
      ],
      depts: [],
      rules: {
        name: [
          { required: true, message: '请输入名称', trigger: 'blur' }
        ],
        deptSort: [
          { required: true, message: '请输入序号', trigger: 'blur', type: 'number' }
        ]
      },
      permission: {
        add: ['admin', 'dept:add'],
        edit: ['admin', 'dept:edit'],
        del: ['admin', 'dept:del']
      },
      enabledTypeOptions: [
        { key: 'true', display_name: '正常' },
        { key: 'false', display_name: '禁用' }
      ],

      formDialog: {
        show: false,
        title: '学校',
        saving: false,
        currentItem: {}
      },
      uping: false
    }
  },
  computed: {
    ...mapGetters({
      'user': 'user'
    }),
    roleInfo() {
      let roleInfo = {}
      if (this.user.roles.length > 0) {
        roleInfo = this.user.roles[0]
      }

      return roleInfo
    },
    addPlaceholder() {
      let str = ''

      switch (this.formDialog.title) {
        case '学校':
          str = '请填写学校名称'
          break
        case '年级':
          str = '请填写年级名称，如：一年级、二年级'
          break
        case '班级':
          str = '请填写年级名称，如：1班、2班'
          break

        default:
          break
      }

      return str
    }
  },
  methods: {
    getDeptDatas(tree, treeNode, resolve) {
      const params = { pid: tree.id }
      setTimeout(() => {
        crudDept.getDepts(params).then(res => {
          resolve(res.content)
        })
      }, 100)
    },
    // 新增与编辑前做的操作
    [CRUD.HOOK.afterToCU](crud, form, sourceData) {
      // form.enabled = `${form.enabled}`
      // if (form.id != null) {
      //   this.getSupDepts(form)
      // } else {
      //   this.getDepts()
      // }

      // 寄存当前行的数据对象
      this.formDialog.currentItem = sourceData

      const { id, name, pid, subCount, deptLevel, label, level, deptSort, enabled } = form
      this.getSupDepts({ id, name, pid, subCount, deptLevel, label, level, deptSort, enabled })
    },
    getSupDepts(form) {
      // crudDept.getDeptSuperior(id).then(res => {
      //   const date = res.content
      //   this.buildDepts(date)
      //   this.depts = date
      // })
      switch (form.level) {
        case 0:
          this.formDialog.title = '总区'
          break
        case 1:
          this.formDialog.title = '学校'
          break
        case 2:
          this.formDialog.title = '年级'
          break
        case 3:
          this.formDialog.title = '班级'
          break
      }
      this.form = form
      this.formDialog.show = true
    },
    buildDepts(depts) {
      depts.forEach(data => {
        if (data.children) {
          this.buildDepts(data.children)
        }
        if (data.hasChildren && !data.children) {
          data.children = null
        }
      })
    },
    getDepts() {
      crudDept.getDepts({ enabled: true }).then(res => {
        this.depts = res.content.map(function(obj) {
          if (obj.hasChildren) {
            obj.children = null
          }
          return obj
        })
      })
    },
    // 获取弹窗内学校/班级数据
    loadDepts({ action, parentNode, callback }) {
      if (action === LOAD_CHILDREN_OPTIONS) {
        crudDept.getDepts({ enabled: true, pid: parentNode.id }).then(res => {
          parentNode.children = res.content.map(function(obj) {
            if (obj.hasChildren) {
              obj.children = null
            }
            return obj
          })
          setTimeout(() => {
            callback()
          }, 100)
        })
      }
    },
    // 提交前的验证
    [CRUD.HOOK.afterValidateCU]() {
      if (this.form.pid !== null && this.form.pid === this.form.id) {
        this.$message({
          message: '上级学校/班级不能为空',
          type: 'warning'
        })
        return false
      }
      return true
    },
    // 改变状态
    changeEnabled(data, val) {
      this.$confirm('此操作将 "' + this.dict.label.dept_status[val] + '" ' + data.name + '学校/班级, 是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        crudDept.edit(data).then(res => {
          this.crud.notify(this.dict.label.dept_status[val] + '成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
        }).catch(err => {
          data.enabled = !data.enabled
          console.log(err.response.data.message)
        })
      }).catch(() => {
        data.enabled = !data.enabled
      })
    },
    checkboxT(row, rowIndex) {
      return row.id !== 1 && row.deptLevel !== 2
    },

    createItem(obj) {
      switch (obj.deptLevel) {
        case 0:
          this.formDialog.title = '学校'
          break
        case 1:
          this.formDialog.title = '年级'
          break
        case 2:
          this.formDialog.title = '班级'
          break
      }

      this.form.pid = obj.id
      this.form.level = obj.level
      this.form.deptLevel = obj.deptLevel + 1
      this.formDialog.show = true
    },

    handleCloseDialog() {
      this.form = Object.assign({}, defaultForm)
      this.crud.status.edit = 0
    },

    upGrade(row) {
      this.$confirm('此操作将不可恢复, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.uping = true
        crudDept.upGrade(row.id).then(res => {
          this.uping = false
          this.crud.refresh()
        }).catch(_ => {
          this.uping = false
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },

    // 添加/编辑保存表单
    saveItem() {
      this.form.label = this.form.name
      const saveForm = this.form.id ? crudDept.edit(this.form) : crudDept.add(this.form)
      this.formDialog.saving = true
      saveForm.then(res => {
        this.formDialog.saving = false
        if (this.form.id) {
          this.formDialog.currentItem.name = this.form.name
          this.formDialog.currentItem.label = this.form.label
          this.formDialog.currentItem.deptSort = this.form.deptSort
          this.formDialog.currentItem.enabled = this.form.enabled
        } else {
          this.crud.refresh()
        }

        this.formDialog.show = false
      }).catch(_ => {
        this.formDialog.saving = false
      })
    }

  }
}
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
 ::v-deep .vue-treeselect__control,::v-deep .vue-treeselect__placeholder,::v-deep .vue-treeselect__single-value {
    height: 30px;
    line-height: 30px;
  }
  ::v-deep .el-input-number .el-input__inner {
    text-align: left;
  }

  .school-tag{
    box-sizing: border-box;
    display: inline-block;
    width: 50px;
    line-height: 20px;
    padding: 0 5px;
    color: #fff;
    text-align: center;
    border-radius: 4px;
    background: #3baeff;
    margin-right: 5px;

    &.tag-1{
      background: #fb28cd;
    }

    &.tag-2{
      background: #fb6b28;
    }

    &.tag-3{
      background: #00c731;
    }

    &.tag-4{
      background: #0089ff;
    }

    &.tag-5{
      background: #31800d;
    }

    &.tag-6{
      background: #661b09;
    }
  }

  .inportant-btn{
    margin-right: 25px;
    color: red;
    font-weight: bold;
    background-color: #fff989;
  }
</style>

