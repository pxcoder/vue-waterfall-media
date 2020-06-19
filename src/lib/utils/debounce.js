export default (function () {
    let timeout = null;
    return function (func, wait) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, arguments);
        }, wait);
    };
})();
