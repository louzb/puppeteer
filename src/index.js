const Koa = require('koa')
const Router = require('koa-router')
const { ssr } = require('./ssr.js')

const app = new Koa()
const router = new Router()
router.get('/ssr', (ctx) => {
    // 获取url携带参数
    let renderUrl = ctx.request.url;
    renderUrl = getUrlParam('url', renderUrl);
    console.log(renderUrl)
    ctx.body = ssr(renderUrl);  
})
app.use(router.routes(), router.allowedMethods())
app.listen(3005, () => {
    console.log(`server is running on http://localhost:3005`)
})

function getUrlParam(key, search) {
    if (search) {
        let urlParams = search.split('?')
        if (urlParams[1]) {
            search = '?' + urlParams[1]
        }
    } else {
        search = window.location.search
    }

    var reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i')
    var r = search.substr(1).match(reg)
    if (r != null) {
        return unescape(unescape(r[2]))
    }
    return null;
}

// ssr('https://cn.vuejs.org/')
// ssr('https://b.51cto.com')
// ssr('https://edu.51cto.com')