const WebSocket = require('ws');
const QRCode = require('qrcode');
const fs = require('fs');

// 全局变量
let connectionId = ""; // 从接口获取的连接标识符
let targetWSId = ""; // 发送目标
let wsConn = null; // 全局ws链接
let currentStrengthA = 0;
let currentStrengthB = 0;
let maxStrengthA = 0;
let maxStrengthB = 0;
//波形数据
const waveData = {
    "1": `["0A0A0A0A00000000","0A0A0A0A0A0A0A0A","0A0A0A0A14141414","0A0A0A0A1E1E1E1E","0A0A0A0A28282828","0A0A0A0A32323232","0A0A0A0A3C3C3C3C","0A0A0A0A46464646","0A0A0A0A50505050","0A0A0A0A5A5A5A5A","0A0A0A0A64646464"]`,
    "2": `["0A0A0A0A00000000","0D0D0D0D0F0F0F0F","101010101E1E1E1E","1313131332323232","1616161641414141","1A1A1A1A50505050","1D1D1D1D64646464","202020205A5A5A5A","2323232350505050","262626264B4B4B4B","2A2A2A2A41414141"]`,
    "3": `["4A4A4A4A64646464","4545454564646464","4040404064646464","3B3B3B3B64646464","3636363664646464","3232323264646464","2D2D2D2D64646464","2828282864646464","2323232364646464","1E1E1E1E64646464","1A1A1A1A64646464"]`
};

// 连接WebSocket
function connectWs(qrPath) {
    wsConn = new WebSocket("wss://ws.dungeon-lab.cn/");
    
    wsConn.onopen = function (event) {
        console.log("WebSocket连接已建立");
    };

    wsConn.onmessage = function (event) {
        var message = null;
        try {
            message = JSON.parse(event.data);
            //console.log("收到消息: ", message);
        } catch (e) {
            console.log("非JSON格式消息: ", event.data);
            return;
        }

        switch (message.type) {
            case 'bind':
                handleBindMessage(message, qrPath);
                break;
            case 'break':
                handleBreakMessage(message);
                break;
            case 'error':
                handleError(message);
                break;
            case 'msg':
                handleStrength(message.message)
                break;
            case 'heartbeat':
                console.log("收到心跳 状态码："+message.message+" targetId:"+message.targetId);
                break;
            default:
                console.log("收到其他消息：" + JSON.stringify(message));
                break;
        }
    };

    wsConn.onerror = function (event) {
        console.error("WebSocket连接发生错误", event);
    };

    wsConn.onclose = function (event) {
        console.log("连接已断开", event);
    };
}
//接收UUID
function handleBindMessage(message, qrPath) {
    if (!message.targetId) {
        connectionId = message.clientId;
        console.log("收到clientId：" + message.clientId);
        QRCode.toFile(qrPath, `https://www.dungeon-lab.com/app-download.php#DGLAB-SOCKET#wss://ws.dungeon-lab.cn/${connectionId}`, function (err) {
            if (err) throw err;
            console.log('二维码已生成到 ' + qrPath);
        });
    } else {
        if (message.clientId != connectionId) {
            console.error('收到不正确的target消息' + message.message);
            return;
        }
        targetWSId = message.targetId;
        console.log("收到targetId: " + message.targetId + " msg: " + message.message);
    }
}
//断开
function handleBreakMessage(message) {
    if (message.targetId != targetWSId) return;
    console.log("对方已断开，code:" + message.message);
}
//报错
function handleError(message) {
    if (message.targetId != targetWSId) return;
    console.error("错误消息: ", message);
}
// 接口方法
function dglcreate(qrPath) {
    connectWs(qrPath);
}

//发送
function dglsend_wave(channel, wave, time) {
    //channel频道 A/B string
    //wave波长 1-3 int
    //time 时间 int
    const message = {
            type: "clientMsg",
            message: `${channel}:${waveData[wave]}`,
            time: time,
            channel: channel,
            clientId: connectionId,
            targetId: targetWSId
        };
    //console.log("发送"+JSON.stringify(message));
    wsConn.send(JSON.stringify(message));
}
function dglsend_strength(channel, strength, type) {
    //channel频道 A=1 B=2 int
    //strength强度 0-100 int
    //type 设置1 计算2 int
    if(type === 1){
    value = strength;
    }else if(type === 2){
        if (channel === 1) {
            currentStrengthA += strength;
            value = currentStrengthA;
        } else if (channel === 2) {
            currentStrengthB += strength;
            value = currentStrengthB;
        }
    }

    const message = {
            type: type,
            strength: strength,
            message: `set channel`,
            channel: channel,
            clientId: connectionId,
            targetId: targetWSId
        };
    //console.log("发送"+JSON.stringify(message));
    wsConn.send(JSON.stringify(message));
}

function handleStrength(message){
    const parts = message.split('-');
    const strengthValues = parts[1].split('+').map(Number);
    if (strengthValues.length !== 4) {
        console.error("输入格式不正确，期望格式为 'strength-1+1+200+200'");
        return;
    }
    currentStrengthA = strengthValues[0];
    currentStrengthB = strengthValues[1];
    maxStrengthA = strengthValues[2];
    maxStrengthB = strengthValues[3];
    console.log(`当前A强度: ${currentStrengthA}, 当前B强度: ${currentStrengthB}, 最高A强度: ${maxStrengthA}, 最高B强度: ${maxStrengthB}`);
}

function dglclose() {
    if (wsConn) {
        console.log("关闭连接");
        wsConn.close();
    }
}

module.exports = { dglcreate, dglsend_strength , dglsend_wave , dglclose };
