// @ts-check

(() => {
    console.log("otoran-inline-player: start")
    if (!document.referrer.startsWith("https://otoran.vercel.app/")) return console.log("otoran-inline-player: skip")

    function userland() {
        console.log("otoran-inline-player: userland script running")
        const origFetch = window.fetch
        let watchRequestComing = false
        window.fetch = (...args) => {
            if (typeof args[0] !== "string") return origFetch(...args)
            const url = args[0]
            if (url.includes("https://www.nicovideo.jp/api/watch/v3_guest/") && !watchRequestComing) {
                console.log(url)
                return origFetch(...args).then(async r => {
                    window.parent.postMessage({otoranInlinePlayer: true, watch: await r.clone().json()}, "https://otoran.vercel.app")
                    return r
                })
            }
            return origFetch(...args)
        }
        console.log("otoran-inline-player: userland script done")
    }
    const script = document.createElement("script")
    script.innerHTML = `(${userland.toString()})()`
    document.body.appendChild(script)
    console.log("otoran-inline-player: end")
    const style = document.createElement("style")
    style.innerText = `
    #rootElementId > .f1umlkj8 {
        height: calc(100% - 52px) !important;
        overflow: visible !important;
    }
    #rootElementId > .f1umlkj8 > .f121cq02 {
        height: calc(100% + 52px) !important;
    }
    #rootElementId > .f1umlkj8 > .f121cq02 > .f1uocas {
        opacity: 1 !important;
        visibility: visible !important;
    }
    `
    document.body.appendChild(style)
})()