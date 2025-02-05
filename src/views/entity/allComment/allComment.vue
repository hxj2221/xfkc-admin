<template>
  <div class="all-comment-manage">
    <el-tabs v-model="commentType" @tab-click="handleTabClick">
      <el-tab-pane label="课程评论" name="course" />
      <el-tab-pane label="挑战回复留言" name="challeng" />
      <el-tab-pane label="实践资源留言" name="hard" />
    </el-tabs>

    <!-- 表格数据 -->
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      style="width: 100%"
    >
      <el-table-column
        prop="id"
        label="ID"
        width="80"
      />
      <el-table-column
        prop="nickname"
        label="创建者"
        width="140"
      />
      <el-table-column
        prop="replyNickname"
        label="回复对象"
        width="140"
      />
      <el-table-column
        prop="content"
        label="留言内容"
        min-width="140"
      />

      <el-table-column
        prop="associationId"
        :label="IDName"
        min-width="140"
      />

      <el-table-column
        prop="createTime"
        label="创建时间"
        min-width="140"
      >
        <template slot-scope="scope">
          {{ $comm.dateFormat(scope.row.createTime,'YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column
        prop="prop"
        label="操作"
        width="180"
      >
        <template slot-scope="scope">
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            @click="pass(scope.row.id,1)"
          >
            通过
          </el-button>
          <el-button
            class="filter-item"
            type="danger"
            size="mini"
            @click="pass(scope.row.id,2)"
          >
            驳回
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页器 -->
    <el-pagination
      class="pagination"
      :current-page="pagination.currentPage"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

  </div>
</template>

<script>
import request from '@/utils/request'
import crudComment from '@/api/comment'

const typeMap = {
  course: 'COURSE',
  challeng: 'CHALLENGE',
  hard: 'HARD_WARE'
}

export default {
  name: 'AllComment',
  data() {
    return {
      commentType: 'course',
      tableData: [],
      tableLoading: false,
      pagination: {
        currentPage: 1,
        size: 20,
        total: 0
      }
    }
  },
  computed: {
    IDName() {
      const typeMap = {
        course: '课程ID',
        challeng: '用户的挑战资料ID',
        hard: '实践资源ID'
      }

      return typeMap[this.commentType]
    }
  },
  created() {
    this.getTableData()
  },
  methods: {

    getTableData() {
      this.tableLoading = true
      const params = {
        page: this.pagination.currentPage - 1,
        size: this.pagination.size,
        type: typeMap[ this.commentType],
        sort: 'id,desc'
      }
      request({
        url: 'api/comment',
        method: 'get',
        params
      }).then(res => {
        this.tableLoading = false
        this.tableData = res.content
        this.pagination.total = res.totalElements
      }).catch(() => {
        this.tableLoading = false
      })
    },

    pass(id, type) {
      const data = {
        type: type,
        id: Number(id)
      }
      crudComment.pass(data)
        .then((res) => {
          this.$message({
            message: type === 1 ? '审核通过成功' : '审核驳回成功',
            type: 'success'
          })
          this.getTableData()
        })
        .catch((error) => {
          console.log(error)
        })
    },

    handleTabClick() {
      this.getTableData()
    },

    handleSizeChange(size) {
      this.pagination.size = size
      this.pagination.currentPage = 1
      this.getTableData()
    },

    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.getTableData()
    }
  }
}
</script>

<style lang="scss" scoped>

.all-comment-manage{
  padding: 20px;

  .pagination{
    padding: 10px 0;
  }
}
</style>
