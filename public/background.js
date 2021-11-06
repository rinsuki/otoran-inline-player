// @ts-check

browser.runtime.onMessage.addListener(async message => {
    if ("watch" in message && message.watch.startsWith("https://www.nicovideo.jp/watch/")) {
        console.log("add history", message.watch)
        browser.history.addUrl({ url: message.watch }).catch(console.error)
    }
    if ("like" in message) {
        const r = await fetch(`https://nvapi.nicovideo.jp/v1/users/me/likes/items?videoId=${message.like}`, {
            method: "POST",
            credentials: "include",
            "headers": {
                "Origin": "https://www.nicovideo.jp",
                "X-Request-With": "https://www.nicovideo.jp",
                "X-Frontend-Id": "6",
                "X-Frontend-Version": "0",
            },
        })
        const data = await r.json()
        return {
            likeResult: data.meta.status < 400,
            likeResultText: data.meta.status < 400 ? `いいねしました。 (いいねメッセージ: ${data.data.thanksMessage ?? "なし"})` : `いいねできませんでした。\n${JSON.stringify(data, null, 4)}`
        }
    }
})

const myOrigin = new URL(browser.runtime.getURL("")).origin

browser.webRequest.onBeforeSendHeaders.addListener(req => {
    return {
        requestHeaders: req.requestHeaders?.map(h => {
            if (h.name.toLowerCase() === "origin") {
                console.log(h.value, myOrigin)
                if (h.value === myOrigin) return { name: h.name, value: "https://www.nicovideo.jp" }
            }
            return h
        })
    }
}, { urls: ["https://nvapi.nicovideo.jp/v1/users/me/likes/items?*"] }, ["blocking", "requestHeaders"])