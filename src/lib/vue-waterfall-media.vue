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
import debounce from './utils/debounce.js';
var columnHeights = []; /* 每列列表的高度 */
export default {
    name: 'VueWaterfallMedia',
    props: {
        /* 数据列表 */
        list: {
            type: Array,
            required: true,
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
        return {
            columnWidth: 0 /* 列宽 */,
            containerHeight: 0 /* 容器高度 */,
        };
    },
    watch: {
        list() {
            this.calcPosition();
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
            await this.$nextTick();

            /* 数据为空 重置容器高度 */
            if (this.list.length === 0) {
                this.containerHeight = '0px';
                return;
            }

            /* 容器元素 */
            const containerEle = this.$refs.waterfallContainer;
            /* 容器宽度 */
            const containerWidth = containerEle.clientWidth;
            /* 获取列宽和列间距 */
            const { column, gutter } = this.getColumnGutter(containerWidth);
            /* 列宽 */
            let columnWidth = Math.floor((containerWidth - (column - 1) * gutter) / column);
            this.columnWidth = columnWidth;

            /* 初始化每列列高 */
            if (columnHeights.length === 0) {
                for (let i = 0; i < column; i++) {
                    columnHeights.push(0);
                }
            }

            /* 获取所有未加载过的列表项元素 */
            const waterfallItemEles = containerEle.querySelectorAll('.waterfall-item:not([loaded])');

            for (const itemEle of waterfallItemEles) {
                const imageEles = itemEle.getElementsByTagName('img');

                /* 没有图片的情况 */
                if (imageEles.length === 0) {
                    this.calcItemHeight(itemEle, columnHeights);
                    continue;
                }

                /* 列表项内的图片全部加载完成 */
                this.handleImagesLoaded(imageEles).then(() => {
                    const minColumnHeight = this.getMinColumnHeight();
                    const columnIndex = columnHeights.indexOf(minColumnHeight);

                    itemEle.style.left = `${(columnWidth + gutter) * columnIndex}px`;
                    itemEle.style.top = `${minColumnHeight}px`;
                    itemEle.style.visibility = 'visible';
                    itemEle.setAttribute('loaded', true);

                    columnHeights[columnIndex] += itemEle.offsetHeight;

                    const maxColumnHeight = this.getMaxColumnHeight();
                    this.containerHeight = `${maxColumnHeight}px`;
                });
            }
        },
        /* 获取实际列数和列间距 */
        getColumnGutter(containerWidth) {
            let column = this.defalutColumn; /* 列数 */
            let gutter = this.defaultGutter; /* 列间距 */
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
            return { column, gutter };
        },
        /* 处理图片列表加载 */
        handleImagesLoaded(imageEles) {
            const imagePromises = [];
            for (let imageEle of imageEles) {
                imagePromises.push(
                    new Promise(resolve => {
                        if (imageEle.complete) {
                            resolve();
                        }
                        imageEle.onload = () => {
                            resolve();
                        };
                        imageEle.onerror = () => {
                            imageEle.style.display = 'none';
                            resolve();
                        };
                    }),
                );
            }
            return Promise.all(imagePromises);
        },
        /* 获取最大列高度 */
        getMaxColumnHeight() {
            return columnHeights
                .slice(0)
                .sort((a, b) => a - b)
                .pop();
        },
        /* 获取最小列高度 */
        getMinColumnHeight() {
            return columnHeights
                .slice(0)
                .sort((a, b) => a - b)
                .shift();
        },
        /* 触底事件 */
        reachBottom() {
            const clientHeight = document.documentElement.clientHeight;
            const scrollHeight = document.body.scrollHeight;
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            if (scrollHeight - clientHeight - scrollTop <= this.toupperThreshold) {
                this.$emit('scrolltoupper');
            }
        },
        /* 触底事件防抖 */
        debounceReachBottom() {
            debounce(this.reachBottom, this.toupperInterval);
        },
        /* 窗口重置防抖 */
        debounceWindowResize() {
            debounce(this.calcPosition, this.resizeInterval);
        },
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
    top: 100%;
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
