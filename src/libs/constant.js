export const HttpStatus = {
  SUCCESS: 200
}
export const HealthyStatusMap = new Map([
  [-1, '不在线'],
  [0, '健康'],
  [1, '亚健康'],
  [2, '故障']
])

export const HealthyStatusColorMap = new Map([
  [-1, '#c5c8ce'],
  [0, '#19be6b'],
  [1, '#ff9900'],
  [2, '#ff9900']
])

export const HealthyStatusTagMap = new Map([
  [-1, 'default'],
  [0, 'success'],
  [1, 'warning'],
  [2, 'error']
])

export const FaultLevelMap = new Map([
  ['1', '轻微'],
  ['2', '严重']
])

export const DevTypeMap = new Map([
  ['ACSU', 1],
  ['DACU', 2],
  ['PACU', 3],
  ['PECU', 4]
])
