;(function(){
const draw = document.getElementById("battery")
      
var specifiedDistance = 200,  // 需要玩家在规定时间间隔移动鼠标的距离
    resetMin = 30,            // ./level = 变动specifiedDistance的最小时间间隔
    resetMax = 80,             // ./level = 变动specifiedDistance的最大时间间隔
    electric = 0,             // 电量
    curposX = 0,              // 鼠标当前位置
    curposY = 0,               
    dampingTimes = 0,         // 连续掉电的次数
    electricReward = 0,       // 一次鼠标移动增加的电量奖励值
    rewardAdjust = 10,        // 调整奖励值的参数，越大增加的奖励越少
    hard = 0.9,               // 难度系数
    step = 0.1,               // 每次升级系数增加的梯度
    spanTime = 1,             // 鼠标位置检测间隔
    spanRange = 20,           // 随机生成的时间间隔最大值
    dampingSpan = 1000,       // 掉电检测的基础间隔时间，随着游戏难度提升减小
    dampingSpanStep = 80,     // 每次等级提升后掉电检测间隔的下降系数
    level = 3,               // 当前等级
    precision = 300,          // 玩家移动鼠标距离microDis与规定距离specifiedDistance的差值构成误差，误差值在precision/level之内判定成功充电
    microDis,                 // 鼠标在spanTime内移动的距离
    context,                  // canvas上下文
    gameStart,gameEnd,        // 游戏的起止时间，用于统计一局游戏花费时间
    lostColor,                // 掉电时的颜色 
    winColor,                 // 充电时的颜色
    dampingIntervel,          // 掉电检测周期函数 
    resetIntervel             // 重设specifiedDistance周期函数

var intervalId = null
function throttle(fn,context,interval,e){
    if(!intervalId){
        intervalId = setTimeout(function(){
            fn.call(context,e)
            intervalId = null
        },interval)
    }
}

window.onload = function(event){
    if(draw.getContext){
        initCanvas()
        levelInit()
        document.body.onmousemove = function(e){
            throttle(mousemove,this,spanTime,e)
        }
    }else{
        this.alert("canvas not supported")
    }

    let flag = null
    if(!flag){
        flag = setInterval(function(){
            if(electricReward<=0){
                dampingCalc()
                flag = null
            }
        },dampingSpan)
    }
}

function dampingCalc(){
    electric -= ((level+10) / 10 * dampingTimes++)
    electric = electric <= 0? 0:electric
    changeFillStyle(lostColor)
    damping(electric)
}

function initCanvas(){
    var electricGradient

    context = draw.getContext("2d")

    electricGradient = context.createLinearGradient(15,15,105,15)
    electricGradient.addColorStop(0, "#BFFEFF");
    electricGradient.addColorStop(0.33, "#E0D061");
    electricGradient.addColorStop(0.66, "#ffe53b");
    electricGradient.addColorStop(1, "#FF2525");

    context.strokeStyle = "#000"
    context.lineWidth = 10
    context.lineCap = "round"
    context.lineJoin = "round"
    
    context.strokeRect(10,10,100,50)
    context.clearRect(105,25,10,20)
    context.fillRect(105,25,15,20)
    // context.fillStyle = electricGradient
}

function mousemove(e){
    if(curposX || curposY){
        microDis = Math.hypot(e.clientX-curposX,e.clientY-curposY)
        electricReward = precision / level - Math.abs(microDis-specifiedDistance)
        electricReward = electricReward / rewardAdjust  * (1 / (electric*hard+1))
        if(electricReward > 0){
            changeFillStyle(winColor)
            electric += electricReward
            dampingTimes = 0
        }
        electric = electric > 90? 90:electric
        if(electric == 90){
            victory()
        }
    }
    curposX = e.screenX
    curposY = e.screenY
    drawing(electric)
}

function getSpanTime(){
    return Math.ceil(Math.random() * spanRange)
}

function victory(){
    showVictoryUI()
    levelInit()
}

function showVictoryUI(){
    let score
    gameEnd = new Date().getTime()
    score = gameEnd - gameStart
}

function mousemoveUI(){
    
}

function setSpecifiedDistance(){
    let maxH = document.body.clientHeight,
        maxW = document.body.clientWidth,
        maxD = Math.floor(Math.sqrt(Math.pow(maxH,2)+Math.pow(maxW,2)))
        minD = Math.min(maxH,maxW)
    return Math.floor(Math.random()*(maxD-minD) / 4+100)
}

function levelInit(){
    if(level == 11){
        oooooh()
        return
    }
    if(level == 10){
        hard += 5*step
    }

    context.clearRect(15,15,0,90)
    spanTime = getSpanTime()
    lostColor = colorChange("cold")
    winColor = colorChange("warm")

    level += 1
    electric = 0
    hard += step
    dampingSpan -= level * dampingSpanStep
    
    if(level<5){
        specifiedDistance = setSpecifiedDistance()
    }else{
        let span = Math.random()*(resetMax / level - resetMin / level+1)+resetMin / level
        resetIntervel = setInterval(function(){
            specifiedDistance = setSpecifiedDistance()
        },span)
    }

    gameStart = new Date().getTime()
}

function drawing(width){
    context.clearRect(15,15,90,40)
    context.fillRect(15,15,width,40)
}

function damping(width){
    context.clearRect(15,15,90,40)
    context.fillRect(15,15,width,40)
}

function changeFillStyle(style){
    context.fillStyle = style
}

function randomColorUnit(min,max){
    min = Math.round(min)
    max = Math.round(max)
    if(max > 255 || min < 0){
        throw new Error("seed in 0~255")
    }
    return Math.floor(Math.random()*(max-min+1)+min).toString(16)
}

function colorRandomGeneration(type,opacity){
    let color = ""
    switch(type){
        case "normal":
            color = `#${randomColorUnit(0,255)}${randomColorUnit(0,255)}${randomColorUnit(0,255)}`
            break
        case "cold":
            color = `#${randomColorUnit(0,175)}${randomColorUnit(50,255)}${randomColorUnit(100,255)}`
            break
        case "warm":
            color = `#${randomColorUnit(100,255)}${randomColorUnit(50,255)}${randomColorUnit(0,175)}`
            break
        default:
            throw new Error("type not supported:normal opacity cold warm")
    }
    if(typeof opacity == "number" && opacity>=0 && opacity<1){
        return color+randomColorUnit(0,255)
    }else{
        return color
    }
}

function colorChange(type){
    return colorRandomGeneration(type)
}

function oooooh(){

}



})()