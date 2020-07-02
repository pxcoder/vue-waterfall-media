# Vue 响应式瀑布流组件

## 简介

只需简单配置，即可实现响应式瀑布流，并且无需设置高度。



## 安装

```shell
npm i vue-waterfall-media -S
```

## 使用

```vue
<template>
    <div class="home">
        <yorkbbs-waterfall :list="goodsList">
            <template slot-scope="scope">
                <div class="list-item">
                    <a class="cover" href="javascript:;">
                        <img :src="scope.data.image" class="cover-image" />
                    </a>
                    <div class="desc">
                        <div class="title"><a href="javascript:;">加拿大现货原单定制衣服鞋子，箱包，新款来袭！</a></div>
                        <div class="price">502</div>
                        <div class="others">
                            <div class="user"><img /><span>shir-yu</span></div>
                            <div class="view"><img /><i class="el-icon-view"></i><span>2359</span></div>
                        </div>
                    </div>
                </div>
            </template>
        </yorkbbs-waterfall>
    </div>
</template>
<script>
import YorkbbsWaterfall from 'vue-waterfall-media';
export default {
    name: 'Home',
    components: { YorkbbsWaterfall },
    data() {
        return {
            goodsList: [],
        };
    },
    created() {
        this.getGoodsList();
    },
    methods: {
        /* 获取商品列表 */
        async getGoodsList() {
            const { code, msg, data } = await this.$axios.get(
                'http://mock.pxcoder.club/mock/5e78d66db055fc150ff90735/api/goods',
            );
            this.goodsList.push(...data.list);
        },
    },
};
</script>
<style lang="scss" scoped>
.list-item {
    background-color: #fff;
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.1), 2px 2px 10px 0px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    margin-bottom: 20px;
    .cover {
        display: block;
        img {
            width: 100%;
            border-radius: 4px 4px 0 0;
        }
    }
    .desc {
        padding: 10px;
    }
    .title {
        font-size: 16px;
        color: #111111;
    }
    .price {
        color: #ff5555;
        font-size: 18px;
        font-weight: bold;
        line-height: 35px;
        &::before {
            content: '$';
            font-size: 12px;
            margin-right: 4px;
            vertical-align: 0.2ex;
        }
    }
    .others {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .user {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #666666;
        img {
            width: 24px;
            height: 24px;
            margin-right: 5px;
        }
    }
    .view {
        font-size: 12px;
        color: #666666;
        display: flex;
        align-items: center;
        .el-icon-view {
            font-size: 14px;
            margin-right: 2px;
        }
    }
}
</style>
```

## 属性 props

| 参数             | 类型   | 说明                                      |
| ---------------- | ------ | ----------------------------------------- |
| list             | Array  | 数据列表，必填                            |
| media            | Object | 媒体查询，默认值见下方                    |
| defalutColumn    | Number | 超出媒体查询范围时的列数，默认值 5 列     |
| defaultGutter    | Number | 超出媒体查询范围时的列间隙，默认值 20px   |
| toupperThreshold | Number | 触发上拉加载时距离底部的距离，默认值 50px |
| resizeInterval   | Number | 重置窗口防抖时间间隔，默认值 300ms        |
| toupperInterval  | Number | 上拉加载防抖时间间隔，默认值 500ms        |

### media 属性默认值

```js
{
    /* 0px < 容器宽度 ≤ 500px 显示 2 列，列间距 20px */
    500: { column: 2, gutter: 20 },
    /* 500px < 容器宽度 ≤ 768px 显示 3 列，列间距 20px */
    768: { column: 3, gutter: 20 },
    /* 768px < 容器宽度 ≤ 992px 显示 4 列，列间距 20px */
    992: { column: 4, gutter: 20 },
    /* 992px < 容器宽度 ≤ 1200px 显示 5 列，列间距 20px */
    1200: { column: 5, gutter: 20 },
}
```

## 事件 events

| 方法名        | 说明                                                |
| ------------- | --------------------------------------------------- |
| scrolltoupper | 只有 scrolltoupper 回调函数定义时，才会触发上拉加载 |

## 插槽 slot

| 插槽名  | 说明                                                                                                      |
| ------- | --------------------------------------------------------------------------------------------------------- |
| default | 默认插槽，插槽内的元素将会被遍历渲染，参数为 { data }, data 为当前列表项数据，data.index 为当前列表项索引 |
| header  | 头部插槽                                                                                                  |
| footer  | 尾部插槽                                                                                                  |

