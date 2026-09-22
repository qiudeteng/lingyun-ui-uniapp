<template>
  <lingyun-app-page title="Indexed List" :body-scroll="false" :page-scroll="false">
    <view class="page">
      <lingyun-indexed-list :options="options" @click="onClick" />
    </view>
  </lingyun-app-page>
</template>

<script setup lang="ts">
  const options = [
    { letter: 'A', data: ['阿坝', '阿拉善', '阿里', '安康', '安庆', '鞍山', '安顺', '安阳'] },
    { letter: 'B', data: ['白银', '保定', '宝鸡', '包头', '北海', '北京', '蚌埠', '本溪'] },
    { letter: 'C', data: ['沧州', '长春', '长沙', '长治', '常德', '常州', '潮州', '承德'] },
    { letter: 'D', data: ['大理', '大连', '大庆', '大同', '丹东', '德阳', '德州', '东莞'] },
    { letter: 'F', data: ['防城港', '佛山', '福州', '抚顺', '抚州', '阜新', '阜阳'] },
    { letter: 'G', data: ['赣州', '固原', '广元', '广州', '贵阳', '桂林'] },
    { letter: 'H', data: ['哈尔滨', '海口', '邯郸', '杭州', '合肥', '呼和浩特', '惠州'] },
    { letter: 'J', data: ['济南', '济宁', '嘉兴', '江门', '焦作', '揭阳', '金华'] },
    { letter: 'L', data: ['兰州', '廊坊', '乐山', '丽江', '连云港', '聊城', '临沂', '柳州'] },
    { letter: 'N', data: ['南昌', '南京', '南宁', '南通', '宁波'] },
    { letter: 'Q', data: ['青岛', '清远', '秦皇岛', '齐齐哈尔', '泉州'] },
    { letter: 'S', data: ['三亚', '上海', '深圳', '沈阳', '石家庄', '苏州'] },
    { letter: 'T', data: ['太原', '泰安', '泰州', '唐山', '天津', '天水'] },
    { letter: 'W', data: ['威海', '潍坊', '温州', '乌鲁木齐', '无锡', '武汉'] },
    { letter: 'X', data: ['厦门', '西安', '西宁', '徐州', '许昌'] },
    { letter: 'Y', data: ['烟台', '延安', '扬州', '银川', '营口'] },
    { letter: 'Z', data: ['枣庄', '张家界', '漳州', '郑州', '中山', '珠海', '遵义'] },
  ]

  function onClick(payload: { item?: { name?: string } }): void {
    uni.showToast({ title: payload.item?.name || '已选', icon: 'none' })
  }
</script>

<style lang="scss">
  .page {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100vh;
  }
</style>
