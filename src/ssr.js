const puppeteer = require('puppeteer')
const Cacheman = require('cacheman')
const md5 = require('md5-node')

const FilecCache = new Cacheman('htmls', {
    // 缓存3个小时
    ttl: 3*60*60,
    engine: 'file',
});
// 单次启动浏览器
let browserPoint = null

async function ssr(url) {
    // 是否命中缓存
    let urlMd5 = md5(url);
    let hitByCache = await FilecCache.get(urlMd5)
    if (hitByCache) {
        console.log(hitByCache.html)
        return hitByCache;
    }

    const startTime = Date.now()
    console.log('开始爬取页面', startTime)
    let browser = null
    if (browserPoint) {
        try {
            browser = await puppeteer.connect({browserPoint})
        } catch(e) {
            // 可能失败
            browserPoint = null
            browser = null
        }
    }
    if (!browserPoint) {
        browser = await puppeteer.launch({ 
            headless: true,
            ignoreHTTPSErrors: true,
            args: [
                // Required for Docker version of Puppeteer
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        })
        browserPoint = await browser.wsEndpoint()
    }
    const launchTime = Date.now()
    console.log('启动puppeteer浏览器', launchTime - startTime)
    const page = await browser.newPage()
    const pageTime = Date.now()
    console.log('打开新页面', pageTime - launchTime)

    // 等待直到500ms内没有请求了
    const gotoUrlTime = Date.now()
    await page.goto(url, {
        waitUntil: 'networkidle0'
    })
    console.log('gotoUrl', gotoUrlTime - pageTime)

    // 获取html
    const getContentTime = Date.now()
    const html = await page.content()
    console.log('getContent', getContentTime - gotoUrlTime)
    await browser.close()
    const time = Date.now() - startTime
    // console.log(html)
    console.log('爬取页面结束', time)
    // 写入缓存
    await FilecCache.set(urlMd5, {
        html
    })
    return { html }
}

module.exports = { ssr }