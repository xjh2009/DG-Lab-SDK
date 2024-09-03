const fs = require('fs');
const chokidar = require('chokidar');
const { dglcreate , dglsend_strength , dglsend_wave  } = require('./dgl');

// 日志文件路径
const logFilePath = `D:\/SteamLibrary\/steamapps\/common\/Counter-Strike Global Offensive\/game\/csgo\/console.log`;

// 创建一个监视器来监控日志文件
const watcher = chokidar.watch(logFilePath, {
  persistent: true,
  usePolling: true,
  interval: 100
});

// 读取文件最后一行的函数
function readLastLine(filePath, callback) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    const lines = data.trim().split('\n');
    const lastLine = lines[lines.length - 1];
    callback(null, lastLine);
  });
}

// 监听文件的变化
watcher.on('change', (path) => {
  readLastLine(path, (err, lastLine) => {
    if (err) {
      console.error('读取日志文件时出错:', err);
      return;
    }
    //1.channel频道 A=1 B=2 int
    //2.strength强度 0-100 int
    //3.type 设置1 计算2 int
    if (/OnControllerChanged/.test(lastLine)) {
      console.log(`触发死亡`);
      dglsend_strength(1, 15, 2);
      dglsend_strength(2, 15, 2);
    }
    if (/OnDamageListUpdate/.test(lastLine)) {
      console.log(`触发复活或杀人`);
      dglsend_strength(1, -8, 2);
      dglsend_strength(2, -8, 2);
    }
  });
});

//二维码生成位置
dglcreate('C:\/Users\/xxxxxx\/Desktop\/dgl.png'); 
