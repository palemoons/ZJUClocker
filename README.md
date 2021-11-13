# 这是什么？
一个使用TypeScript完成的打卡工具。  
~~答应我，不要学我没事用TS写脚本~~  

# 如何使用？
如果你真的想用这个脚本，而不是隔壁同学写的[python版本](https://github.com/QSCTech-Sange/ZJU-nCov-Hitcarder)——  
1. Clone这个仓库
2. `tsc`编译ts文件
3. 在`config.json`修改你的信息
4. `node --experimental-json-modules clocker.js`运行脚本  

注意，这个脚本并没有定时功能。由于js并没有自带比较阳间的定时器，作者使用了`crontab`定时启动脚本。