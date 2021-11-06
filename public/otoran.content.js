// @ts-check

(() => {
    // bodyの中にもう一個bodyを作っていつものコンテンツを全部そっちに入れる
    const body = document.body
    if (body.dataset.inlinePlayerEnabled) return
    body.dataset.inlinePlayerEnabled = "true"
    const newBody = document.createElement("body")
    newBody.style.contain = "strict"
    newBody.style.flex = "1"
    newBody.style.margin = "0"
    newBody.style.padding = "8px"
    newBody.style.overflow = "auto"
    body.style.margin = "0"
    body.style.display = "flex"
    body.style.height = "100vh"
    newBody.append(...body.childNodes)
    body.appendChild(newBody)

    const sidebar = document.createElement("div")
    sidebar.style.display = "flex"
    sidebar.style.flexDirection = "column"
    sidebar.style.minWidth = "320px"
    sidebar.style.width = "40vw"
    sidebar.style.maxWidth = "640px"
    sidebar.style.border = "0"
    sidebar.style.borderLeft = "1px solid #ddd"
    body.appendChild(sidebar)

    // iframeを作る
    const iframe = document.createElement("iframe")
    iframe.src = `data:text/html;charset=UTF-8,` + encodeURIComponent(`<body style="margin:0;display:flex;justify-content:center;color:#aaa;height:100vh;align-items:center;"><div>左から動画を選択するとここで再生されます</div></body>`)
    iframe.style.aspectRatio = "16 / 9"
    iframe.style.border = "0"

    // 詳細表示div
    const info = document.createElement("div")
    info.style.flex = "1"
    info.style.padding = "1em"
    info.style.overflowY = "auto"
    const infoLikeButton = document.createElement("button")
    infoLikeButton.style.background = "white"
    infoLikeButton.style.border = "1px solid #ddd"
    infoLikeButton.style.lineHeight = "1.5em"
    infoLikeButton.style.borderRadius = "0.75em"
    infoLikeButton.style.float = "right"
    infoLikeButton.style.fontSize = "1em"
    infoLikeButton.style.padding = "0.25em 1em"
    const infoTitle = document.createElement("h1")
    infoTitle.style.marginBlockStart = "0"
    infoTitle.style.fontSize = "1.5em"
    const infoTitleLink = document.createElement("a")
    infoTitleLink.style.color = "inherit"
    infoTitleLink.style.textDecoration = "none"
    infoTitle.append(infoTitleLink)
    const infoDescription = document.createElement("div")
    info.append(infoLikeButton, infoTitle, infoDescription)

    sidebar.append(iframe, info)

    // リンクを踏んだらiframeで開いてwww版を踏んだことにする
    newBody.addEventListener("click", e => {
        const elem_ = e.target
        if (!(elem_ instanceof Element)) return
        let elem = elem_
        while (!(elem instanceof HTMLAnchorElement)) {
            const e = elem.parentElement
            if (e == null) return
            elem = e
        }
        if (!(elem instanceof HTMLAnchorElement)) return
        const match = /^https:\/\/www\.nicovideo\.jp\/watch\/(([a-z]{2}?)[0-9]+)$/.exec(elem.href)
        if (match == null) return
        e.preventDefault()
        const id = match[1]
        iframe.src = `https://embed.nicovideo.jp/watch/${id}?jsapi=1#_otoran_inline_player_&`
        browser.runtime.sendMessage({watch: `https://www.nicovideo.jp/watch/${id}`})
    })
    
    const likeIDs = new Set()
    window.addEventListener("message", e => {
        if (e.origin !== "https://embed.nicovideo.jp") return
        const { data } = e
        if (data.otoranInlinePlayer) {
            // from otoran
            console.log("message from embed", data)
            if (data.watch) {
                const watchData = data.watch.data
                infoTitleLink.href = `https://www.nicovideo.jp/watch/${watchData.video.id}`
                infoTitleLink.textContent = watchData.video.title
                infoDescription.innerHTML = watchData.video.description
                const videoViewer = watchData.video.viewer
                if (videoViewer != null) {
                    infoLikeButton.style.display = undefined
                    infoLikeButton.textContent = `${videoViewer.like.isLiked ? "♥" : "♡"} いいね`
                    infoLikeButton.onclick = e => {
                        if (!e.isTrusted) return
                        e.preventDefault()
                        likeIDs.add(watchData.video.id)
                        browser.runtime.sendMessage({like: watchData.video.id}).then(r => {
                            if (r.likeResult) {
                                infoLikeButton.textContent = `${"♥"} いいね`
                            }
                            alert(r.likeResultText)
                        })
                    }
                } else {
                    infoLikeButton.style.display = "none"
                }
            }
        } else {
            // from niconico
            if (data.eventName == "loadComplete") {
                iframe.contentWindow.postMessage({
                    sourceConnectorType: 1,
                    eventName: "play",
                }, "https://embed.nicovideo.jp")
            }
        }
    })
})()