/** 列表 + 详情 demo 的工单数据。窄屏详情页与宽屏右侧详情共用。 */

export type ListDetailStatus = 'open' | 'doing' | 'done'

export interface ListDetailLog {
  time: string
  text: string
}

export interface ListDetailTicket {
  id: string
  title: string
  customer: string
  status: ListDetailStatus
  priority: '高' | '中' | '低'
  assignee: string
  createdAt: string
  updatedAt: string
  address: string
  description: string
  logs: ListDetailLog[]
}

export const LIST_DETAIL_STATUS_TEXT: Record<ListDetailStatus, string> = {
  open: '待处理',
  doing: '处理中',
  done: '已完成',
}

const featuredTickets: ListDetailTicket[] = [
  {
    id: 'T-20261110-01',
    title: '收银台网络间歇性断开',
    customer: '西湖门店',
    status: 'doing',
    priority: '高',
    assignee: '陈默',
    createdAt: '2026-11-10 09:12',
    updatedAt: '2026-11-10 10:05',
    address: '杭州市西湖区文三路 88 号',
    description:
      '早高峰时段收银台每隔十分钟左右断网一次，支付失败后需要重新登录。已检查交换机指示灯正常，怀疑是网线水晶头接触不良或路由器端口老化。',
    logs: [
      { time: '11-10 10:05', text: '已更换路由器端口，观察中' },
      { time: '11-10 09:40', text: '远程排查交换机，端口无丢包' },
      { time: '11-10 09:12', text: '门店提交工单' },
    ],
  },
  {
    id: 'T-20261110-02',
    title: '新员工账号无法登录',
    customer: '滨江门店',
    status: 'open',
    priority: '高',
    assignee: '林悦',
    createdAt: '2026-11-10 08:47',
    updatedAt: '2026-11-10 08:47',
    address: '杭州市滨江区江南大道 168 号',
    description:
      '三名新入职员工使用初始密码登录时提示「账号未激活」，重发激活短信也收不到。需要确认员工档案是否已同步到账号系统。',
    logs: [{ time: '11-10 08:47', text: '门店提交工单' }],
  },
  {
    id: 'T-20261109-03',
    title: '打印机无法出小票',
    customer: '城西门店',
    status: 'open',
    priority: '中',
    assignee: '陈默',
    createdAt: '2026-11-09 18:22',
    updatedAt: '2026-11-09 18:22',
    address: '杭州市西湖区古墩路 66 号',
    description:
      '收银完成后打印机没有反应，重启打印机和收银机均无效。打印自检页正常，怀疑是收银软件里的打印机配置被改动。',
    logs: [{ time: '11-09 18:22', text: '门店提交工单' }],
  },
  {
    id: 'T-20261109-04',
    title: '会员余额同步延迟',
    customer: '西湖门店',
    status: 'doing',
    priority: '中',
    assignee: '周航',
    createdAt: '2026-11-09 14:10',
    updatedAt: '2026-11-09 16:38',
    address: '杭州市西湖区文三路 88 号',
    description:
      '顾客充值后小程序显示的余额十分钟内不变，重新进入页面才更新。初步判断是会员服务的缓存刷新周期过长。',
    logs: [
      { time: '11-09 16:38', text: '已缩短缓存时间，等待验证' },
      { time: '11-09 14:32', text: '定位到会员缓存配置' },
      { time: '11-09 14:10', text: '门店提交工单' },
    ],
  },
  {
    id: 'T-20261108-05',
    title: '团购券核销失败',
    customer: '拱墅门店',
    status: 'done',
    priority: '高',
    assignee: '林悦',
    createdAt: '2026-11-08 11:05',
    updatedAt: '2026-11-09 09:20',
    address: '杭州市拱墅区湖墅南路 210 号',
    description:
      '顾客出示的团购券在收银台提示「券码已使用」，但顾客手机仍显示未核销。复核后发现是团购平台回调延迟导致状态不一致。',
    logs: [
      { time: '11-09 09:20', text: '与团购平台对账完成，补偿顾客' },
      { time: '11-08 15:46', text: '联系平台确认回调延迟' },
      { time: '11-08 11:05', text: '门店提交工单' },
    ],
  },
  {
    id: 'T-20261108-06',
    title: '后厨显示屏黑屏',
    customer: '滨江门店',
    status: 'open',
    priority: '低',
    assignee: '周航',
    createdAt: '2026-11-08 09:15',
    updatedAt: '2026-11-08 09:15',
    address: '杭州市滨江区江南大道 168 号',
    description:
      '后厨第二块显示屏下班后关机，第二天开店时无法点亮。电源适配器指示灯不亮，需要安排上门检查。',
    logs: [{ time: '11-08 09:15', text: '门店提交工单' }],
  },
  {
    id: 'T-20261107-07',
    title: '扫码枪识别率下降',
    customer: '城西门店',
    status: 'done',
    priority: '中',
    assignee: '陈默',
    createdAt: '2026-11-07 16:40',
    updatedAt: '2026-11-08 10:12',
    address: '杭州市西湖区古墩路 66 号',
    description:
      '扫码枪需要贴近条码才能识别，部分商品需要扫三四次。清洁扫描窗口并更换数据线后恢复正常。',
    logs: [
      { time: '11-08 10:12', text: '现场清洁并更换数据线，已恢复' },
      { time: '11-07 16:40', text: '门店提交工单' },
    ],
  },
  {
    id: 'T-20261107-08',
    title: '对账单金额不一致',
    customer: '总部财务',
    status: 'doing',
    priority: '高',
    assignee: '周航',
    createdAt: '2026-11-07 10:28',
    updatedAt: '2026-11-08 17:05',
    address: '杭州市余杭区文一西路 969 号',
    description:
      '十一月的门店对账单里，西湖门店 11 月 5 日的退款金额没有计入当日汇总。需要核对退款流水与对账任务的处理顺序。',
    logs: [
      { time: '11-08 17:05', text: '复现退款早于对账任务的情况' },
      { time: '11-07 15:20', text: '导出流水开始核对' },
      { time: '11-07 10:28', text: '财务提交工单' },
    ],
  },
]

/* ---------- 批量样本：让列表有足够长度验证滚动 / 筛选 ---------- */

const EXTRA_CUSTOMERS: { name: string; address: string }[] = [
  { name: '西湖门店', address: '杭州市西湖区文三路 88 号' },
  { name: '滨江门店', address: '杭州市滨江区江南大道 168 号' },
  { name: '城西门店', address: '杭州市西湖区古墩路 66 号' },
  { name: '拱墅门店', address: '杭州市拱墅区湖墅南路 210 号' },
  { name: '总部财务', address: '杭州市余杭区文一西路 969 号' },
]

const EXTRA_ASSIGNEES = ['陈默', '林悦', '周航', '沈宁']
const EXTRA_STATUSES: ListDetailStatus[] = ['open', 'doing', 'done']
const EXTRA_PRIORITIES: ListDetailTicket['priority'][] = ['高', '中', '低']

const EXTRA_ISSUES: { title: string; description: string }[] = [
  { title: '扫码框无法识别会员码', description: '收银台扫码框对准会员码没有反应，手动输入卡号可以正常识别。' },
  { title: '收银台键盘无法输入', description: '收银台外接键盘突然失灵，切换到屏幕键盘后可以输入。' },
  { title: '小票抬头信息错误', description: '小票上的门店地址还是旧地址，需要同步最新的门店资料。' },
  { title: '会员积分未累计', description: '顾客消费后积分没有到账，会员中心显示的还是消费前的分数。' },
  { title: '储值卡余额不同步', description: '顾客在门店充值后小程序余额没有变化，重新进入才更新。' },
  { title: '外卖订单未打印', description: '外卖平台有新订单，后厨和前台都没有打印小票。' },
  { title: '团购平台订单缺失', description: '团购平台显示订单已支付，收银台查不到对应的核销记录。' },
  { title: '库存预警未提醒', description: '商品库存已经低于预警值，后台没有收到任何提醒。' },
  { title: '称重商品条码冲突', description: '两个称重商品使用了同一个条码，称重后价格串了。' },
  { title: '支付成功未出小票', description: '顾客支付成功，收银台没有自动打印小票，需要手动补打。' },
  { title: '交接班现金不平', description: '交接班对账时现金比系统少了 120 元，需要核对当班流水。' },
  { title: '自助点餐机卡顿', description: '点餐机切换分类时有明显卡顿，偶尔需要等待五六秒。' },
  { title: '后厨打印队列堵塞', description: '后厨打印机积压了十几张单据，重启后仍然不打印。' },
  { title: '优惠券无法叠加', description: '两个活动优惠券不能同时使用，提示「不满足使用条件」。' },
  { title: '退款进度不更新', description: '退款申请已经通过，小程序里的进度一直停在审核中。' },
  { title: '对账单缺少退款单', description: '对账单只统计了收款，退款单没有计入当天的汇总。' },
  { title: '商品价格批量改错', description: '批量修改价格后，部分商品的价格被改成了原价的一半。' },
  { title: '收银员账号频繁掉线', description: '收银员账号每隔几分钟提示登录失效，需要重新扫码登录。' },
  { title: '网络打印机离线', description: '打印机指示灯正常，但收银软件一直显示离线。' },
  { title: '会员等级未更新', description: '会员消费金额已经达到升级条件，等级仍然是原来的。' },
  { title: '积分兑换失败', description: '会员用积分兑换商品时提示库存不足，实际库存充足。' },
  { title: '订单重复推送后厨', description: '同一笔订单连续推送了三次到后厨，造成重复制作。' },
  { title: '排队叫号屏不刷新', description: '取号后叫号屏没有更新，顾客需要到前台询问。' },
  { title: '外卖对账金额差异', description: '外卖平台的对账金额比系统少了配送费，需要核对结算规则。' },
  { title: '门店营业数据未上报', description: '门店昨日的营业数据没有上报到总部报表。' },
  { title: '扫码支付提示超时', description: '顾客扫码支付时提示网络超时，实际扣款成功。' },
  { title: '会员短信收不到', description: '会员注册后收不到验证码短信，其他短信正常。' },
  { title: '商品图片加载失败', description: '商品列表的图片大部分加载失败，重新进入仍然如此。' },
  { title: '库存盘点数量异常', description: '盘点后库存数量变成负数，需要核对盘点单。' },
  { title: '报表导出乱码', description: '导出的 Excel 报表中文全部是乱码。' },
]

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

function buildExtraTickets(): ListDetailTicket[] {
  return EXTRA_ISSUES.map((issue, index) => {
    const day = 1 + Math.floor(index / 3)
    const hour = 9 + ((index * 2) % 10)
    const minute = (index * 13) % 60
    const date = `2026-11-${pad2(day)}`
    const customer = EXTRA_CUSTOMERS[index % EXTRA_CUSTOMERS.length]
    const updateHour = Math.min(23, hour + 1)
    return {
      id: `T-202611${pad2(day)}-${pad2(20 + index)}`,
      title: issue.title,
      customer: customer.name,
      status: EXTRA_STATUSES[index % EXTRA_STATUSES.length],
      priority: EXTRA_PRIORITIES[index % EXTRA_PRIORITIES.length],
      assignee: EXTRA_ASSIGNEES[index % EXTRA_ASSIGNEES.length],
      createdAt: `${date} ${pad2(hour)}:${pad2(minute)}`,
      updatedAt: `${date} ${pad2(updateHour)}:${pad2(minute)}`,
      address: customer.address,
      description: issue.description,
      logs: [
        { time: `11-${pad2(day)} ${pad2(updateHour)}:${pad2(minute)}`, text: '已同步门店，继续跟进处理' },
        { time: `11-${pad2(day)} ${pad2(hour)}:${pad2(minute)}`, text: '门店提交工单' },
      ],
    }
  })
}

export const listDetailTickets: ListDetailTicket[] = [
  ...featuredTickets,
  ...buildExtraTickets(),
].sort((a, b) => {
  if (a.updatedAt === b.updatedAt) return b.id.localeCompare(a.id)
  return a.updatedAt < b.updatedAt ? 1 : -1
})

export function findListDetailTicket(id: string): ListDetailTicket | null {
  const key = String(id || '')
  if (!key) return null
  return listDetailTickets.find((ticket) => ticket.id === key) || null
}
