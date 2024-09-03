# DG-Lab-SDK
之前朋友（是个xyn）做直播 播cs2就给他做了读cs2的日志文件的版本顺手写了个sdk<br>
可惜刚发给他 本来还想听他直播叫来着 第二天就因为工资问题跑路了<br>
属于一个简单版本的SDK了<br>

### 使用方法

*默认走的是官方ws服务器*

一. 安装

   ```shell
   npm install 
   ```

二. 使用方法：
1. 引入
  ```node
  const { dglcreate , dglsend_strength , dglsend_wave  } = require('./dgl');
  ```
2.生成二维码
  ```node
  dglcreate('图片位置'); 
  ```
3.强度与波形
  波形设置：
  ```node
  //channel频道 A/B string
  //wave波长 1-3 int
  //time 时间 int
  dglsend_wave(channel, wave, time)
  ```
  强度设置：
  ```node
  //channel频道 A=1 B=2 int
  //strength强度 0-100 int
  //type 设置1 计算2 int
  dglsend_strength(channel, strength, type)
  ```
### 示例文件
  1.配合CS2
  库里我有保存关于读的cs2示例(抓的日志可能不准) 实时日志需要在steam加入额外参数<br>
  文件名csgo.js
  ```
  -condebug
  ```
  2.随机强度
  文件名rands.js
