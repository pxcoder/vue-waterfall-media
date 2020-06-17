<template>
    <div class="waterfall-container" ref="waterfallContainer">
        <slot name="header"></slot>
        <ul class="waterfall-wrapper" :style="{ height: containerHeight }">
            <li
                class="waterfall-item waterfall-animation"
                v-for="(item, i) in list"
                :key="i"
                :style="{ width: `${columnWidth}px` }"
            >
                <slot :data="{ ...item, index: i }"></slot>
            </li>
        </ul>
        <slot name="footer"></slot>
    </div>
</template>
<script>
import debounce from './utils/debounce';
export default {
    name: 'VueWaterfallMedia',
    props: {
        /* 数据列表 */
        list: {
            type: Array,
            required: true,
        },
        /* 图片类名 */
        imageClass: {
            type: String,
            default: 'cover-image',
        },
        /* 超出媒体查询时显示的列数 */
        defalutColumn: {
            type: Number,
            default: 5,
        },
        /* 超出媒体查询范围时显示的列间距 */
        defaultGutter: {
            type: Number,
            default: 20,
        },
        /* 距离底部多远时，触发上拉加载 */
        toupperThreshold: {
            type: Number,
            default: 50,
        },
        /* 重置窗口防抖时间间隔 毫秒*/
        resizeInterval: {
            type: Number,
            default: 200,
        },
        /* 上拉加载防抖时间间隔 毫秒*/
        toupperInterval: {
            type: Number,
            default: 500,
        },
        /* 媒体查询 */
        media: {
            type: Object,
            default: () => ({
                1200: {
                    column: 5,
                    gutter: 20,
                },
                992: {
                    column: 4,
                    gutter: 20,
                },
                768: {
                    column: 3,
                    gutter: 20,
                },
                500: {
                    column: 2,
                    gutter: 20,
                },
            }),
        },
    },
    data() {
        var self = this;
        return {
            /* 列宽 */
            columnWidth: 0,
            /* 列数 */
            column: 0,
            /* 列宽 */
            gutter: 0,
            /* 上拉加载计时器对象 */
            scrolltoupperTimer: null,
            /* 窗口重置计时器对象 */
            windowResizeTimer: null,
            /* 容器高度 */
            containerHeight: 0,
        };
    },
    watch: {
        list() {
            this.$nextTick(() => {
                this.calcPosition();
            });
        },
    },
    mounted() {
        window.addEventListener('resize', this.debounceWindowResize, false);
        /* 父组件绑定 scrolltoupper 事件，才监听触底事件 */
        this.$listeners.scrolltoupper && window.addEventListener('scroll', this.debounceReachBottom, false);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.debounceWindowResize, false);
        this.$listeners.scrolltoupper && window.removeEventListener('scroll', this.debounceReachBottom, false);
    },
    methods: {
        async calcPosition() {
        	/* 数据为空 重置容器高度 */
        	if(this.list.length === 0 ){
        		 this.containerHeight = '0px';
        		 return;
        	}        	
            /* 容器元素 */
            const containerEle = this.$refs.waterfallContainer;
            /* 容器宽度 */
            const containerWidth = containerEle.clientWidth;

            /* 列数 */
            let column = this.defalutColumn;
            /* 列间距 */
            let gutter = this.defaultGutter;

            const sizeArr = Object.keys(this.media)
                .map(size => Number(size))
                .sort((a, b) => a - b);

            /* 根据 media 从小→大 进行匹配 */
            for (const size of sizeArr) {
                if (containerWidth <= size) {
                    column = this.media[size].column;
                    gutter = this.media[size].gutter;
                    break;
                }
            }

            /* 列宽 */
            let columnWidth = Math.floor((containerWidth - (column - 1) * gutter) / column);

            this.column = column;
            this.gutter = gutter;
            this.columnWidth = columnWidth;

            /* 列高度 */
            let columnHeightArr = [];
            for (let i = 0; i < column; i++) {
                columnHeightArr.push(0);
            }

            const coverImageEles = containerEle.getElementsByClassName(this.imageClass);

            let promiseList = [];

            for (const item of coverImageEles) {
                if (!item.complete) {
                    promiseList.push(
                        new Promise(resolve => {
                            item.onload = item.onerror = () => {
                                resolve(item);
                            };
                        }),
                    );
                }
            }

            await Promise.all(promiseList);

            const waterfallItemEles = containerEle.getElementsByClassName('waterfall-item');

            for (const item of waterfallItemEles) {
                const minColumnHeight = columnHeightArr
                    .slice(0)
                    .sort((a, b) => a - b)
                    .shift();

                const index = columnHeightArr.indexOf(minColumnHeight);

                item.style.left = `${(columnWidth + gutter) * index}px`;
                item.style.top = `${minColumnHeight}px`;
                item.style.visibility = 'visible';

                columnHeightArr[index] += item.offsetHeight;

                const maxColumnHeight = columnHeightArr
                    .slice(0)
                    .sort((a, b) => a - b)
                    .pop();
                this.containerHeight = `${maxColumnHeight}px`;
            }
        },
        /* 触底事件 */
        reachBottom() {
            const clientHeight = document.documentElement.clientHeight;
            const scrollHeight = document.body.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;

            if (scrollHeight - clientHeight - scrollTop <= this.toupperThreshold) {
                this.$emit('scrolltoupper');
            }
        },
        /* 触底事件防抖 */
        debounceReachBottom: debounce(function() {
            this.reachBottom();
        }, self.toupperInterval),
        /* 窗口重置防抖 */
        debounceWindowResize: debounce(function() {
            this.calcPosition();
        }, self.resizeInterval),
    },
};
</script>
<style>
.waterfall-wrapper {
    position: relative;
}
.waterfall-item {
    position: absolute;
    left: 50%;
    top: 50%;
    visibility: hidden;
}
.waterfall-load-more {
    text-align: center;
    margin: 20px 0;
}
.waterfall-load-more span {
    cursor: pointer;
    font-size: 20px;
    color: #e43a3a;
}
.waterfall-animation {
    transition: left 0.3s, top 0.5s;
}
</style>
