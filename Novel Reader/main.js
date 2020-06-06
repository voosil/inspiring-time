{
    let fileList = document.getElementsByName('novel')[0],
        setting = document.forms['setting'],
        sp = document.getElementsByName('split')[0],
        novel = document.getElementById('content'),
        title = document.getElementById('title'),
        night = document.getElementsByClassName('night')[0],
        day = document.getElementsByClassName('day')[0],
        body = document.body,
        originMask = document.getElementsByClassName('crossWrapper')[0],
        origin = document.getElementById('origin'),
        mod = document.getElementById('nd'),
        reset = document.getElementById('reset'),
        progress = document.getElementById('progress'),
        chapterList = document.getElementsByClassName('chapterWrapper')[0],
        listToggler = document.getElementById('list'),
        bookName = document.getElementById('bookName'),
        contentWrapper = document.getElementsByClassName('wrapper')[0],
        chapterItems = null

    const USER_URL = 'user.json'

    let reader = new FileReader(),
        content = '',
        chapters = [],
        book = ''

    let cut= /\-{12}/,
        currentChapter = 1,
        defaultFontSize = 16,
        fileName='default.txt'
    
    const classStyle = {
        visible:'visible',
        unvisible:'unvisible',
        nightMod:{
            bgc:'pageNight',
            shadow:'nightShadow'
        },
        dayMod:{
            bgc:'pageDay',
            shadow:'dayShadow'
        },
        chapterItem:{
            highLight:'highLight',
            move:'chapterAni'
        },
    }
    
    let operation = {
        viewChanger(){
            operation.scrollToChapter(currentChapter)
            refreshContent()
            contentWrapper.scrollIntoView()
        },
        next(){
            if(++currentChapter<chapters.length){
                operation.removeHighLight(currentChapter-1)
                operation.addHighLight(currentChapter)
                this.viewChanger()
            }
        },
        prev(){
            if(--currentChapter>=0){
                operation.removeHighLight(currentChapter+1)
                operation.addHighLight(currentChapter)
                this.viewChanger()
            }
        },
        toggle(es,s,t){
            es = es instanceof Array? [...es]:[es]
            es.forEach(e => {
                console.log(e)
                let eClass = e.className.baseVal || e.className
                eClass = eClass.indexOf(s)>-1? eClass.replace(s,t):eClass.replace(t,s)
                e.setAttribute('class',eClass)
            });
        },
        addStyle(e,style){
            e.setAttribute('class',e.className +' '+ style)
        },
        removeStyle(e,style){
            e.setAttribute('class',e.className.replace(style,'').trim())
        },
        toggleMod(){
            this.toggle([night,day],classStyle.unvisible,classStyle.visible)
            this.toggle(body,classStyle.nightMod.bgc,classStyle.dayMod.bgc)
            this.toggle([contentWrapper,chapterList],classStyle.nightMod.shadow,classStyle.dayMod.shadow)
        },
        toggleOrigin(){
            this.toggle(originMask,classStyle.unvisible,classStyle.visible)
        },
        bigger(){
            novel.style.fontSize = ++defaultFontSize+'px'
        },
        smaller(){
            novel.style.fontSize = --defaultFontSize+'px'
        },
        hideMenu(){
            this.removeStyle(chapterList,classStyle.chapterItem.move)
        },
        showMenu(){
            this.addStyle(chapterList,classStyle.chapterItem.move)
        },
        addHighLight(index){
            this.addStyle(chapterItems[index],classStyle.chapterItem.highLight)
        },
        removeHighLight(index){
            this.removeStyle(chapterItems[index],classStyle.chapterItem.highLight)
        },
        scrollToChapter(index){
            chapterList.scrollTop = chapterItems[index].offsetTop - window.innerHeight/2
        },
    }

    let article = {
        titlePatterns:/(\d+\s+\S+)|(第?\S+章\s+\S+)/,
        getTitle(index){
            let t = chapters[index].match(this.titlePatterns)
            return t? t[0]:null
        },
        getFormattedTitle(index){
            let title = this.getTitle(index)
            if(title){
                return title
                        .replace(/^0*/,'')      // 去除007 的0
                        .replace(/（\S*）/,'')   // 去除括号里面的内容，一般是求月票之类的
            }else{
                return `第${index}章`
            }
            
        },
        getContent(index){
            let content = chapters[index]
                    .replace(this.titlePatterns,'')
                    .replace(/\n{2,}/g,'\n')
                    .trim()
            return content.split('\n').map(e=>e!=''||null? `<p>${e.trim()}<p>`:null).join('')
        },
    }

    fileList.addEventListener('change',function(e){
        let files = this.files
        if(files.length !== 1){
            alert('Only one file allowed')
        }

        if(/txt|text/.test(files[0].type)){
            book = files[0].name.replace(/\.\w*/,'')
            reader.readAsText(files[0])
        }else{
            alert('Only txt allowed')
        }
    })

    reader.onerror = function(){
        output.innerHTML = 'Could not read file, error code is ' +
        reader.error.code;
    };

    // reader.onprogress = function(event){
    //     if (event.lengthComputable){
    //     progress.innerHTML = event.loaded + '/' + event.total;
    //     }
    // };

    reader.onload = function(){
        content = reader.result
        chapters = content.split(cut)
        refreshContent()
        refreshChapter()
    }


    document.addEventListener('keydown',function(e){
        let keycode = e.keyCode
        if(chapters.length){
            switch(keycode){
                case 39:
                    operation.next()
                    break
                case 37:
                    operation.prev()
                    break
                case 38:
                    operation.bigger()
                    break
                case 40:
                    operation.smaller()
                    break
                default:
                    break
            }
        }
    })

    window.onload = (e) =>{
        novel.style.fontSize = defaultFontSize+'px'

        // getUserJson(USER_URL)
    }

    window.onunload = (e) =>{
        setUserJson(USER_URL)
    }

    mod.onclick = ()=>{operation.toggleMod()}
    origin.onclick = ()=>{operation.toggleOrigin()}
    reset.onclick = (e)=>{
        operation.toggleOrigin()
        if(sp.value !== cut && sp.value){
            chapters = content.split(new RegExp(sp.value))
            refreshContent()
            refreshChapter()
        }
    }
    listToggler.onclick = ()=>{
        operation.showMenu()
    }
    chapterList.onmouseleave = () =>{
        operation.hideMenu()
    }


    function refreshChapter(){
        let titles = chapters.map((e,i)=>{
            let t = article.getFormattedTitle(i)
            return `<li data-value=${i}><span>${t}</span></li>`
        })

        document.getElementById('chapters').innerHTML = titles.join('')
        bookName.textContent = book

        chapterItems = document.querySelectorAll('#chapters li')

        for(let i=0;i<chapterItems.length;i++){
            chapterItems[i].addEventListener('click',function(){
                operation.removeHighLight(currentChapter)
                currentChapter = Number(this.getAttribute('data-value'))
                refreshContent()
                contentWrapper.scrollIntoView()
                operation.hideMenu()
                operation.addHighLight(currentChapter)
            })
        }
    }

    function refreshContent(){
        title.textContent = article.getFormattedTitle(currentChapter)        
        novel.innerHTML = article.getContent(currentChapter)
    }

    // function getUserJson(url){
    //     var userInfo,
    //         xhr = new XMLHttpRequest()

    //     xhr.open('get',url)
    //     xhr.send()
    //     xhr.onload = function(response){
    //         if(xhr.status == 200){
    //             userInfo = JSON.parse(response.target.responseText)
    //             initUserInfo(userInfo)
    //         }else{
    //             alert('Get User Info Err...'+xhr.status)
    //         }
    //     }
    //     xhr.onerror = function(){
    //         alert('User Json Unaccessible...')
    //     }
    // }

    // function setUserJson(url){
    //     let data = {
    //         cut,
    //         currentChapter,
    //         defaultFontSize,
    //         fileName:book
    //     }
    //     var content = JSON.stringify(data);
    //     var blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
    //     saveAs(blob, url);
    // }

    // function initUserInfo(userInfo){
    //     cut = userInfo.cut || cut
    //     currentChapter = userInfo.currentChapter || currentChapter
    //     defaultFontSize = userInfo.defaultFontSize || defaultFontSize
    //     book = fileName || book
    // }
}