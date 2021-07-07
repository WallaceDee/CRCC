<template>
  <div class="index">
    <!-- <div class="title">首页</div> -->
    <SectionCard title="列车运行信息">
      <div style="margin-bottom:10px">
        <Button
          icon="md-bus"
          style="margin-right:5px;"
          size="small"
          :type="activeIndex === index ? 'primary' : 'default'"
          v-for="(item, index) in lineList"
          :key="item"
          @click="onLineChange(index)"
          >{{ item }}</Button
        >
      </div>
      <Table
        disabled-hover
        size="small"
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
      ></Table>
      <!-- <br />
      <Page
        show-total
        :page-size="PAGE_SIZE"
        :total="pageTotal"
        show-elevator
        @on-change="onPageChage"
      /> -->
    </SectionCard>
    <Row style="margin-top:20px;">
      <Col span="12">
        <SectionCard title="历史故障数" style="margin-right:10px;">
          <v-chart
            v-if="barChartData.length"
            :forceFit="true"
            :height="height"
            :data="barChartData"
            :padding="[20, 30, 50, 30]"
            :scale="{
              dataKey: '故障数',
              minTickInterval: 1
            }"
          >
            <v-tooltip />
            <v-axis />
            <v-bar position="trainCode*故障数" />
          </v-chart>
          <span v-else>暂无数据</span>
        </SectionCard>
      </Col>
      <Col span="12">
        <SectionCard title="故障类型分布" style="margin-left:10px;height:100%;">
          <v-chart
            v-if="pieChartData.length"
            :forceFit="true"
            :height="height"
            :data="pieChartData"
            :padding="[20, 30, 80, 30]"
            :scale="{
              dataKey: 'percent',
              min: 0,
              formatter: '.0%'
            }"
          >
            <v-tooltip :showTitle="false" data-key="faultCode*percent" />
            <v-axis />
            <v-legend data-key="faultCode" />
            <v-pie
              position="percent"
              color="faultCode"
              :v-style="pieStyle"
              :label="labelConfig"
            />
            <v-coord type="theta" />
          </v-chart>
          <span v-else>暂无数据</span>
        </SectionCard>
      </Col>
    </Row>
  </div>
</template>
<script>
import {
  getTrainPage,
  getTodayFault,
  getTodayFaultSortByType,
  getTrainLineList
} from '../api'
import {
  HttpStatus,
  HealthyStatusMap,
  HealthyStatusColorMap,
  HealthyStatusTagMap
} from '../libs/constant'
const DEFAULT_PIE_DATA = [
  {
    faultNum: 0,
    faultCode: 'ACSU'
  },
  {
    faultNum: 0,
    faultCode: 'DACU'
  },
  {
    faultNum: 0,
    faultCode: 'PACU'
  },
  {
    faultNum: 0,
    faultCode: 'PECU'
  }
]
const PAGE_SIZE = 9999
export default {
  name: 'Index',
  data() {
    return {
      activeIndex: 0,
      lineList: [],
      barChartData: [],
      pieChartData: [],
      height: 300,
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      labelConfig: [
        'percent',
        {
          formatter: (val, item) => {
            return item.point.faultCode + ': ' + val
          }
        }
      ],
      pageTotal: 0,
      PAGE_SIZE,
      tableLoading: false,
      columns: [
        {
          type: 'index',
          width: 60,
          align: 'center'
        },
        {
          width: 150,
          title: '列车号',
          key: 'trainCode',
          render: (h, { row: { trainCode, healthyStatus } }) => {
            return h(
              'router-link',
              {
                props: {
                  to: {
                    name: 'Monitor',
                    params: {
                      trainCode
                    }
                  }
                },
                class: 'train-code'
              },
              [
                h('Icon', {
                  props: {
                    type: 'md-bus',
                    size: 30,
                    color: HealthyStatusColorMap.get(healthyStatus)
                  }
                }),
                h('span', trainCode)
              ]
            )
          }
        },
        {
          title: '更新时间',
          key: 'lastHearTime',
          align: 'center'
        },
        {
          title: '故障数',
          key: 'faultNum',
          align: 'center'
        },
        {
          title: '处理情况',
          key: 'treatmentNum',
          align: 'center',
          render: (h, { row: { treatmentNum } }) => {
            return h('strong', `已确认:${treatmentNum}`)
          }
        },
        {
          title: '健康状态',
          key: 'healthyStatus',
          align: 'center',
          render: (h, { row: { healthyStatus } }) => {
            return h(
              'Tag',
              {
                props: {
                  color: HealthyStatusTagMap.get(healthyStatus)
                }
              },
              HealthyStatusMap.get(healthyStatus)
            )
          }
        }
      ],
      tableData: []
    }
  },
  computed: {
    lineCode() {
      return this.lineList[this.activeIndex]
    }
  },
  watch: {
    activeIndex(val) {
      this.getTableData()
      this.getTodayFault()
      this.getTodayFaultSortByType()
    }
  },
  methods: {
    onPageChage(pageNum) {
      this.getTableData(pageNum)
    },
    getTableData(pageNum = 1) {
      this.tableLoading = true
      getTrainPage({
        lineCode: this.lineCode,
        pageNum,
        pageSize: PAGE_SIZE
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.tableData = res.data.records
            this.pageTotal = res.data.total
            if (
              this.tableData &&
              this.tableData.length &&
              !localStorage.getItem('currentTrainCode')
            ) {
              localStorage.setItem(
                'currentTrainCode',
                this.tableData[0].trainCode
              )
            }
          }
          this.tableLoading = false
        })
        .catch((err) => {
          this.tableLoading = false
          console.error(err)
        })
    },
    getTodayFault() {
      getTodayFault({
        lineCode: this.lineCode
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            res.data.map((item) => {
              item['故障数'] = item.faultNum
              return item
            })
            console.log(res.data)
            this.barChartData = res.data
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    getTodayFaultSortByType() {
      getTodayFaultSortByType({
        lineCode: this.lineCode
      })
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            const DataSet = require('@antv/data-set')
            const dv = new DataSet.View().source(res.data || DEFAULT_PIE_DATA)
            dv.transform({
              type: 'percent',
              field: 'faultNum',
              dimension: 'faultCode',
              as: 'percent'
            })
            this.pieChartData = dv.rows
            console.log(this.pieChartData)
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    getTrainLineList() {
      return getTrainLineList()
        .then((res) => {
          if (res.code === HttpStatus.SUCCESS) {
            this.lineList = res.data
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    onLineChange(index) {
      console.log(index)
      this.activeIndex = index
    }
  },
  mounted() {
    this.getTrainLineList().then(() => {
      this.getTableData()
      this.getTodayFault()
      this.getTodayFaultSortByType()
    })
  }
}
</script>
<style lang="less" scoped>
.title {
  color: #fff;
  font-size: 16px;
  padding-bottom: 10px;
}
</style>
<style lang="less">
.index {
  .train-code {
    display: flex;
    align-items: center;
  }
}
</style>
