<template>
  <div class="index">
    <div class="title">首页</div>
    <SectionCard title="列车运行信息">
      <Table
        :columns="columns"
        :data="tableData"
        :loading="tableLoading"
      ></Table>
      <br />
      <Page
        :page-size="PAGE_SIZE"
        :total="pageTotal"
        show-elevator
        @on-change="onPageChage"
      />
    </SectionCard>
    <Row style="margin-top:20px;">
      <Col span="12">
        <SectionCard title="本日故障数" style="margin-right:10px;">
          <v-chart
            v-if="barChartData.length"
            :forceFit="true"
            :height="height"
            :data="barChartData"
            :padding="[20, 30, 50, 30]"
            :scale="{
              dataKey: 'faultNum',
              tickInterval: 1
            }"
          >
            <v-tooltip />
            <v-axis />
            <v-bar position="trainCode*faultNum" />
          </v-chart>
          <span v-else>暂无数据</span>
        </SectionCard>
      </Col>
      <Col span="12">
        <SectionCard title="故障类型分布" style="margin-left:10px;">
          <v-chart
            v-if="pieChartData.length"
            :forceFit="true"
            :height="height"
            :data="pieChartData"
            :padding="[20, 30, 50, 30]"
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
import { getTrainPage, getTodayFault, getTodayFaultSortByType } from '../api'
import {
  HttpStatus,
  HealthyStatusMap,
  HealthyStatusColorMap,
  HealthyStatusTagMap
} from '../libs/constant'

const PAGE_SIZE = 5
export default {
  name: 'Index',
  data() {
    return {
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
          title: '列车号',
          key: 'trainCode',
          align: 'center',
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
  methods: {
    onPageChage(pageNum) {
      this.getTableData(pageNum)
    },
    getTableData(pageNum = 1) {
      this.tableLoading = true
      getTrainPage({
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
      getTodayFault().then((res) => {
        if (res.code === HttpStatus.SUCCESS) {
          this.barChartData = res.data
        }
      })
    },
    getTodayFaultSortByType() {
      getTodayFaultSortByType().then((res) => {
        if (res.code === HttpStatus.SUCCESS) {
          const DataSet = require('@antv/data-set')
          const dv = new DataSet.View().source(res.data)
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
    }
  },
  mounted() {
    this.getTableData()
    this.getTodayFault()
    this.getTodayFaultSortByType()
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
