import VueWaterfallMedia from './vue-waterfall-media.vue';

export default {
    install(Vue) {
        if (typeof window !== 'undefined' && window.Vue) {
            window.Vue.component(VueWaterfallMedia.name, VueWaterfallMedia);
        } else {
            Vue.component(VueWaterfallMedia.name, VueWaterfallMedia);
        }
    },
};
