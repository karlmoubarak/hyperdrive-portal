(async () => {
    
const SDK = window.datSDK,
    { Hyperdrive, close } = await SDK(),
    { Buffer } = buffer,

    $ = (id) => { return document.getElementById(id) },

    menu = $('menu'),
    flip = $('flip'),
    backSide = $('back'),
    frontSide = $('front'),
    announcement = $('announcement'),
    serverIndex = $('serverIndex'),
    fileTypeIndex = $('fileTypes'),
    peerStatus = $('peers'),
    sizeSlider = $('sizeSlider'),
    timeSlider = $('timeSlider'),
    sizeOutput = $('sizeOutput'),
    timeOutput = $('timeOutput'),
    refreshButton = $('retry'),
    styleElement = document.querySelector('style')

    keys = [ 
        'hyper://6e12aeea634b778e7ba4e1adb49ac70416ccde35e0193767651c429b863fd4ff/', // jeroen
        'hyper://dd5ad0e8d3ae8026dc61ce92c45db39c0d9c1d0a2d5206ead0e352ef122dfc10/', // karl
        'hyper://eed171b9da743ccbf6452722f72a1b14a5b25115594f56c34cc0a848828fe896/', // angeliki
        'hyper://1f2f00ec6ffcc2e7db9d4586b5b80eac73201a6e2c0add4430c4ed13b7ee76c0/', // dianaband
        'hyper://fb30c8a724fb93e9e3f0209055453f8a672ff01720a33f8111d76382dbfda28a/', // cristina
        'hyper://5f2e47e66aad6de752f7510413d5861392282d5b3a40073c0f2e5dcc5553ce5d/', // lark
        'hyper://711d0b2c6eb9c180a44b0655a7cec8f0d4bac1a4bdc78bf270d28ae6f09d61a6/' // Ephemereality Capture
        ],
      
    ignoreExt = ['ds_store', 'ignore', 'private'],
    utf8Ext = ['js', 'json', 'java', 'sh', 'html', 'css', 'py', 'webloc'],
    noPeersMessage = "<p class='end'>No one is seeding these files at the moment. Please try again later.</p>",
    waitMessage = "<p class='end'>wait</p>"
    
let desiredTime = () => { return parseFloat(timeSlider.value) },
    desiredSize = () => { return parseFloat(sizeSlider.value) }, 
    highestZindex = 0,
    fullSize = 0,
    initialTime = Date.now() / 1000,
    
    archives = [],
    mainLog = [],
    fileTypes = []

timeSlider.setAttribute('min', 1593388800)
timeSlider.setAttribute('max', initialTime)
timeSlider.value = initialTime
timeOutput.innerHTML = moment.unix(initialTime).fromNow()
    
timeSlider.addEventListener('input', () => { initialTime = timeTravel() })
    
document.addEventListener('keydown', () => { 
    if (event.keyCode === 86) toggleView()
    else if (event.keyCode === 83) toggleMenu()
    else if (event.keyCode === 40) { 
        timeSlider.value = initialTime - 100000 
        initialTime = timeTravel()
    }
    else if (event.keyCode === 38) {
        timeSlider.value = initialTime + 100000 
        initialTime = timeTravel()
    }
})
flip.addEventListener('click', () => { toggleView() })
refreshButton.addEventListener('click', () => { forceReconnect() })
    
sizeSlider.addEventListener('input', () => { sizeOutput.innerHTML = roundBytes(desiredSize(), 'MB') })
sizeSlider.addEventListener('change', () => { sizeTravel() })
    
announce(`connecting`, 5000)
      
for (key of keys) {
    await sync(key)
}

listenForNetwork()
sizeTravel()
timeTravel()
    
    
    
async function sync(key) {
    const archive = await Hyperdrive(key, { persist: true })
    await archive.ready()
    await reallyReady(archive)
    archives.push(archive)
    const info = JSON.parse(await archive.readFile('index.json', 'utf8'))
    const dir = await archive.readdir('/')
    const feed = makeFeed(key, info)
    indexFeed(info, feed)
    populateFeed(archive, info, feed, '')
    feed.querySelector('.header .reload').addEventListener('click', async () => { 
        populateFeed(archive, info, feed, '') 
    })
    populateFront(archive, info, '')
    if (dir.includes('styles.css')) styleItems(archive, info)
//    archive.watch('styles.css', () => { styleItems(archive, info) })
}
    
async function populateFeed(archive, info, feed, dirpath) {
    const feedBody = feed.querySelector('.body')
    feedBody.innerHTML = waitMessage
    const dir = await archive.readdir(dirpath)
    const parentDirPath = dirpath.substring(0, dirpath.lastIndexOf('/'))
    if (dirpath != parentDirPath) { dir.push(parentDirPath) }
    feedBody.innerHTML = ''
    for (const item of dir) { 
        const path = item === parentDirPath ? parentDirPath : `${dirpath}/${item}`,
              logItem = await makeLogItem(archive, info, path),
              feedItem = makeFeedItem(logItem)
        if (!(ignoreExt.includes(logItem.ext)) && (path != '/PRIVATE')) {
            mainLog.push(logItem)
            indexExt(logItem.ext)
            if (logItem.isDir) { 
                feedItem.classList.add('dir')
                feedItem.addEventListener('click', async () => {
                    await populateFeed(archive, info, feed, logItem.path)
                }) 
                if (logItem.path == parentDirPath) {
                    feedItem.classList.add('parent')
                    feedItem.querySelector('.path').innerHTML = '← back'
                }
                feedBody.insertBefore(feedItem, feedBody.firstChild)
            } else { 
                feedItem.addEventListener('click', () => { expandItem(logItem, feedItem, archive, 0, 0) }, true)
                feedBody.appendChild(feedItem)
            }
        }
    }
}
function indexFeed(info, feed) {
    const indexItem = document.createElement('p')
    const indicator = document.createElement('span')
    indexItem.className = 'indexItem'
    indicator.className = `indicator ${feed.id} item`
    indexItem.innerHTML = info.title
    indicator.innerHTML = '<span class="header title"><a>?</a></span>'
    indexItem.appendChild(indicator)
    serverIndex.appendChild(indexItem)
    indexItem.addEventListener('mousedown', () => {
        backSide.scrollTop = feed.offsetTop, backSide.scrollLeft = feed.offsetLeft
        const logItemstoHide = mainLog.filter(logItem => logItem.author != feed.id)
        logItemstoHide.forEach((logItem) => {
            const elementsToHide = document.getElementsByClassName(logItem.author)
            Array.from(elementsToHide).forEach((element) => { element.classList.add('hidden') })
        })
    })
    indexItem.addEventListener('mouseup', () => {
        const logItemstoShow = mainLog.filter(logItem => logItem.author != feed.id)
        logItemstoShow.forEach((logItem) => {
            const elementsToShow = document.getElementsByClassName(logItem.author)
            Array.from(elementsToShow).forEach((element) => { element.classList.remove('hidden') })
        })
    })
}
function makeFeed(key, info) {
    const feedTemplate = `
        <div class='feed ${info.title.split(' ').join('')}' id=${info.title.split(' ').join('')}>
            <div class='header'>
                <div class='title'><a href="${key}">${info.title}</a></div>
                <a class='reload'>⟳</a>
            </div>
            <div class='body'></div>
        </div>
    `
    const feedDoc = new DOMParser().parseFromString(feedTemplate, 'text/html')
    const feed = feedDoc.body.firstChild
    const feedTitle = feed.querySelector('.header .title')
    const feedTitleLink = feedTitle.querySelector('a')
    feedTitle.addEventListener('mouseover', () => { feedTitleLink.innerHTML = key })
    feedTitle.addEventListener('mouseout', () => { feedTitleLink.innerHTML = info.title })
    backSide.appendChild(feed)
    return feed
}
    
function makeFeedItem(logItem) {
    const cleanpath = logItem.path.substring(logItem.path.lastIndexOf("/") + 1)
    const path = logItem.isDir ? `${cleanpath}/` : cleanpath
    const time = moment.unix(logItem.mtime).fromNow()
    const size = logItem.size < 500000 ? roundBytes(logItem.size, 'KB') : roundBytes(logItem.size, 'MB')
    const feedItemTemplate = `
        <div class='item ${logItem.author} ${logItem.id}'>
            <div class='head'>
                <div class='path'>${path}</div>
                <div class='author'>added by <u>${logItem.author}</u> </div>
                <div class='time'>${time}, </div>
                <div class='size'>${size}</div>
                <div class='close'>X</div>
            </div>
            <div class='body'></div>
        </div>
    `
    const feedItemDoc = new DOMParser().parseFromString(feedItemTemplate, 'text/html')
    const feedItem = feedItemDoc.body.firstChild
    return feedItem
}
async function makeLogItem(archive, info, path) {
  const stat = await archive.stat(path)
  const logItem = {
    'archive' : archives.indexOf(archive),
    'author' : info.title.split(' ').join(''),
    'path' : path,
    'id' : `a-${info.title.split(' ').join('')}i-${path.substring(1).replace(/[\/\(\)\s\.\|\!\?\$]/g, '-')}`,
    'isDir' : false,
    'ext' : `${ path.includes('.') ? path.split('.').pop().toLowerCase() : '' }`,
    'mtime' : (Date.parse(stat[0].mtime))/1000,
    'size' : stat[0].size,
    'data' : ``
  }
  if (logItem.ext == '' && logItem.size == 0) { logItem.isDir = true }
  return logItem
}
    
async function populateFront(archive, info, dirpath, parentX, parentY) {
    const dir = await archive.readdir(dirpath)
    for (const item of dir) {
        const path = `${dirpath}/${item}`,
              logItem = await makeLogItem(archive, info, path),
              feedItem = makeFeedItem(logItem)
        feedItem.addEventListener('mouseenter', () => { bringToFront(feedItem) })
        if (!(ignoreExt.includes(logItem.ext)) && (path != '/PRIVATE')) {
            let [childX, childY] = throwItem(feedItem, frontSide, parentX, parentY)
            if (logItem.isDir) {
                feedItem.classList.add('dir')
                feedItem.addEventListener('click', async () => { 
                    populateFront(archive, info, logItem.path, childX, childY)
                    feedItem.classList.add('hidden')
                })
            } else {
                feedItem.addEventListener('click', () => { expandItem(logItem, feedItem, archive, childX, childY) }, true)
            }
        }
    }
}
function throwItem(feedItem, parent, parentX, parentY) {  
    const maxWidth = parentX ? parentX + 300 : window.innerWidth - 100,
          maxHeight = parentY ? parentY + 300 : window.innerHeight - 50,
          minWidth = parentX ? parentX - 150 : 0,
          minHeight = parentY ? parentY - 150 : 0,
          childX = Math.random() * (maxWidth - minWidth) + minWidth,
          childY = Math.random() * (maxHeight - minHeight) + minHeight
    feedItem.style.left = childX
    feedItem.style.top = childY
    parent.appendChild(feedItem)
    return [childX, childY]
}   
async function expandItem(logItem, feedItem, archive, initialLeft, initialTop) {
    console.log('expanding item')
    feedItemBody = feedItem.querySelector('.body') 
    feedItemPath = feedItem.querySelector('.head .path')
    bringToFront(feedItem)
    feedItem.style.top = 'auto', feedItem.style.left = 'auto'
    feedItem.classList.add('expanded')
    if (!feedItemBody.children.length) {
        feedItemBody.innerHTML = waitMessage
        const data = await archive.readFile(logItem.path, 'base64')
        logItem.data = data
        const bodyContents = renderMedia(logItem.ext, logItem.data)
        feedItemBody.innerHTML = ''
        feedItemBody.appendChild(bodyContents) 
    }
    feedItem.querySelector('.head .close').addEventListener('click', () => { 
        collapseItem(logItem, feedItem, initialTop, initialLeft)
    }, true)
    document.addEventListener('keydown', () => { if (event.keyCode === 27) { 
        collapseItem(logItem, feedItem, initialTop, initialLeft)
    } })
    feedItemPath.addEventListener('click', () => {
        console.log('start download')
        const initialPath = feedItemPath.innerHTML
        feedItemPath.innerHTML = waitMessage
        download(logItem.path, logItem.data)
        feedItemPath.innerHTML = initialPath
    })
    feedItem.querySelector('.head .author u').addEventListener('click', async () => {
        toggleView()
        await announce('', 800)
        const feed = document.getElementById(logItem.author)
        backSide.scrollTop = feed.offsetTop, backSide.scrollLeft = feed.offsetLeft
        const logItemstoHide = mainLog.filter(logItem => logItem.author != feed.id)
        logItemstoHide.forEach(async (logItem) => {
            const elementsToHide = document.getElementsByClassName(logItem.author)
            Array.from(elementsToHide).forEach(async (element) => { 
                element.classList.add('hidden')
                await announce('', 1500)
                element.classList.remove('hidden')
            })
        })
    })
}
async function collapseItem(logItem, feedItem, initialTop, initialLeft) {
    console.log('collapsing item')
    feedItemBody = feedItem.querySelector('.body')
    feedItem.querySelector('.head .path').removeEventListener('click', () => {console.log('event removed')})
    feedItem.classList.remove('expanded')
    await announce('', 800)
    feedItem.style.top = `${initialTop}px`, feedItem.style.left = `${initialLeft}px`
    feedItemBody.firstElementChild.classList.add('hidden')
}
    
async function styleItems(archive, info) {
    console.log(`${info.title} is styling`)
    const data = await archive.readFile('/styles.css', 'utf8'),
          prefix = `.${info.title.split(' ').join('')}`,
          comments = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g, returns = /\r?\n|\r/g, spaces = /\s\s+/g,
          cleandata = data.replace(comments, '').replace(returns, '').replace(spaces, ' '),
          styleDeclarations = cleandata.split(/[}{]/).filter(Boolean),
          selectors = [], styles = []
    for (s = 0; s < styleDeclarations.length; s += 2) { selectors.push(styleDeclarations[s]) }
    for (s = 1; s < styleDeclarations.length; s += 2) { styles.push(styleDeclarations[s]) }
    selectors.forEach((selector) => {
        styleElement.innerHTML += 
            `${prefix}${selector} {
                ${styles[selectors.indexOf(selector)]}
            }`
    })
}  
async function listenForNetwork() {
    const archive = archives[0]
    const peers = await archive.peers
    archive.on('peer-add', async (peer) => { 
        peerStatus.innerHTML = `Peers: ${peers.length}`
        announce('new peer!', 1000)
    })    
    archive.on('peer-remove', async (peer) => { 
        peerStatus.innerHTML = `Peers: ${peers.length}`
        announce('lost peer :(', 1000)
    })
}
async function sizeTravel() {
    if (fullSize < desiredSize()) {
        let sizeOrderedLog = mainLog.sort((a, b) => a.size - b.size)
        sizeOrderedLog.forEach((logItem) => {
            if (fullSize < desiredSize() && !logItem.isDir) {
                announce(`You are seeding ${roundBytes(fullSize, 'MB')}`, '2000')
                Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                    const feedItemHead = feedItem.querySelector('.head')
                    const feedItemBody = feedItem.querySelector('.body')
                    if (!feedItemBody.children.length && logItem.data == '') {
                        fullSize += logItem.size
                        feedItemBody.innerHTML = waitMessage
                        const archive = archives[logItem.archive]
                        archive.readFile(logItem.path, 'base64')
                            .then((data) => {
                            logItem.data = data
                            const bodyContents = renderMedia(logItem.ext, logItem.data) 
                            feedItemBody.innerHTML = ''
                            feedItemBody.appendChild(bodyContents)
                        }) 
                    } else if (feedItemBody.children.length) {
                        feedItemBody.firstElementChild.classList.remove('hidden')
                    }
                })
            }
        })
    } else if (fullSize > desiredSize()) {
        let sizeOrderedLog = mainLog.sort((a, b) => b.size - a.size)
        sizeOrderedLog.forEach((logItem) => {
            if (fullSize >= desiredSize() && !logItem.isDir) {
                announce(`You are seeding ${roundBytes(fullSize, 'MB')}`, '2000')
                Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                    const feedItemHead = feedItem.querySelector('.head')
                    const feedItemBody = feedItem.querySelector('.body')
                    if (logItem.data != '') { 
                        fullSize -= logItem.size
                        logItem.data = ''
                    }
                    if (feedItemBody.children.length) {
                        feedItemBody.firstElementChild.classList.add('hidden')
                    }
                })
            }
        })
    }
}
function timeTravel() {
    timeOutput.innerHTML = moment.unix(desiredTime()).fromNow()
    announce(moment.unix(desiredTime()).fromNow(), 2000)
    if (initialTime < desiredTime()) {
        console.log('moving forward in time')
        let itemsToReappear = mainLog.filter(logItem => logItem.mtime < desiredTime())
        itemsToReappear.forEach((logItem) => {
            Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                feedItem.classList.remove('hidden')
            })
        })
    } else if (initialTime > desiredTime()) {
        console.log('moving backwards in time')
        let itemsToDisappear = mainLog.filter(logItem => logItem.mtime > desiredTime())
        itemsToDisappear.forEach((logItem) => {
            Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                feedItem.classList.add('hidden')
            })
        })
    }
    initialTime = desiredTime()
    return initialTime
}
function indexExt(ext) {
    if (!fileTypes.includes(ext)) {
        fileTypes.push(ext) 
        const indexItem = document.createElement('span')
        indexItem.className = 'extItem checked'
        if (ext == '') {
            indexItem.id = 'none'
            indexItem.innerHTML = 'none'
        } else {
            indexItem.id = ext
            indexItem.innerHTML = ext
        }
        indexItem.addEventListener('click', () => { 
            const filteredLog = mainLog.filter(logItem => logItem.ext == ext)
            if (indexItem.classList.contains('checked')) {
                indexItem.classList.remove('checked') 
                filteredLog.forEach((logItem) => {
                    Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                        feedItem.classList.add('hidden')
                    })
                })
            } else if (!indexItem.classList.contains('checked')) {
                indexItem.classList.add('checked') 
                filteredLog.forEach((logItem) => {
                    Array.from(document.getElementsByClassName(logItem.id)).forEach((feedItem) => {
                        feedItem.classList.remove('hidden')
                    })
                })
            }
        })
        fileTypeIndex.appendChild(indexItem)
    }
}

function renderMedia(ext, data) {
    if ((ext == 'txt') || (ext == 'rtf')) {
        const text = document.createTextNode((Buffer(data, 'base64')).toString('utf8'))
        const bodyContents = document.createElement('p')
        bodyContents.appendChild(text)
        return bodyContents
    } else if (utf8Ext.includes(ext) || (ext == '')) {
        const puredata = (Buffer(data, 'base64')).toString('utf8')
        const code = document.createElement('code')
        if (ext === '') code.classList.add('plaintext')
        code.innerHTML = puredata
        const bodyContents = document.createElement('pre')
        bodyContents.appendChild(code)
        hljs.highlightBlock(bodyContents)
        return bodyContents
    } else if (ext === 'md') {
        const md = marked((Buffer(data, 'base64')).toString('utf8'))
        const bodyContents = document.createElement('div')
        bodyContents.classList.add('md')
        bodyContents.innerHTML = md
        Array.from(bodyContents.querySelectorAll('pre code')).forEach((block) => hljs.highlightBlock(block) )
        return bodyContents
    } else if ((ext == 'jpg') || (ext == 'png') || (ext == 'gif') || (ext == 'ico')) {
        const bodyContents = document.createElement('img')
        bodyContents.setAttribute('src', `data:image/png;base64, ${data}`)
        return bodyContents
    } else if ((ext == 'pdf')) {
        const bodyContents = document.createElement('embed')
        bodyContents.setAttribute('src', `data:application/pdf;base64, ${data}`)
        return bodyContents
    } else if ((ext == 'mp4') || (ext == 'mov')) {
        const video = document.createElement('source')
        const bodyContents = document.createElement('video')
        video.setAttribute('src', `data:video/mp4;base64, ${data}`)
        bodyContents.setAttribute('controls', '')
        bodyContents.appendChild(video)
        return bodyContents
    } else if ((ext == 'wav') || (ext == 'mp3')) {
        const audio = document.createElement('source')
        const bodyContents = document.createElement('audio')
        audio.setAttribute('src', `data:audio/wav;base64, ${data}`)
        bodyContents.setAttribute('controls', '')
        bodyContents.appendChild(audio)
        return bodyContents
    } else {
        const text = document.createTextNode(`unknown file type`)
        const bodyContents = document.createElement('span')
        bodyContents.classList.add('error')
        bodyContents.appendChild(text)
        return bodyContents
    }
}
function download(path, data) {
    const file = `data:image/jpeg;base64, ${data}`
    const a = document.createElement('a')
    document.body.appendChild(a)
    a.setAttribute('href', file)
    a.setAttribute('download', path)
    a.display = 'none'
    a.click()
    document.body.removeChild(a)
}
    
function reallyReady(archive, cb) {
    const meta = archive.metadata
    const promise = new Promise((resolve, reject) => {
        function onupdate(err, result) {
          (err && err.message !== 'No update available from peers') ? reject(err) : resolve()
        }
        meta.ready(() => {
            if (meta.writable) resolve()
            if (meta.peers.length) {
                meta.update({ ifAvailable: true }, onupdate)
            } else {
                meta.once('peer-add', () => { meta.update({ ifAvailable: true }, onupdate) })
            }
        })
    })
    if (cb) { promise.then(() => setTimeout(cb, 0), (e) => setTimeout(() => cb(e), 0)) }
    return promise
}
async function forceReconnect() {
    if (archives[0]) archives.forEach( async(archive) => await archive.close() )
    localStorage.clear()
    window.location.reload(true)
}
    
async function announce(message, duration) {
    const t = duration ? duration : 500 
    announcement.innerHTML = message 
    return new Promise(resolve => { setTimeout(()=> {
        resolve(announcement.innerHTML = '')
    }, t)})
}
function bringToFront(item) {
    item.style.zIndex = highestZindex
    highestZindex += 1
}
function toggleMenu() {
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden')
        window.localStorage['sidebar'] = 1
    } else {
        menu.classList.add('hidden')
        window.localStorage['sidebar'] = 0
    }
}
function toggleView() {
    if (frontSide.classList.contains('visible')) {
        frontSide.classList.remove('visible')
        backSide.classList.add('visible')
        flip.innerHTML = 'Scattered View'
        window.localStorage['view'] = 'back'
    } else {
        frontSide.classList.add('visible')
        backSide.classList.remove('visible')
        flip.innerHTML = 'Grid View'
        window.localStorage['view'] = 'front'
    }
}
function roundBytes(value, unit) {
    if (unit == 'KB') { return Math.round((0.001*value)*100)/100 + ' KB' }
    else if (unit == 'MB') { return Math.round((0.000001*value)*100)/100 + ' MB'}
}
    
//    console.log('could not connect to peers') 
//    const info = {"title": key }
//    const feed = makeFeed(key, info)
//    feed.querySelector('.body').innerHTML = noPeersMessage
//    feed.querySelector('.header .reload').addEventListener('click', async () => { 
//    backSide.removeChild(feed)
//    await sync(key) 
    
})()