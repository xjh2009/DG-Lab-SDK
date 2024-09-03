const { dglcreate , dglsend_strength , dglsend_wave  } = require('./dgl');

dglcreate('C:\/Users\/xjh37\/Desktop\/dgl.png'); 

setInterval(() => {
      const randomStrength = Math.floor(Math.random() * (160 - 15 + 1)) + 20;
      console.log("随机强度："+randomStrength);
      dglsend_strength(1, randomStrength, 1);
}, 1500);
