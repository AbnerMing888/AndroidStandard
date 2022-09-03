# AndroidStandard

AndroidStandard是一个方便在Android端开发者，针对Android项目进行规范检查的一个工具，纯可视化检查，小白也能搞定，目前处于1.0.0版，包含基本的，类，方法，注释，资源等功能检查，大家也可以根据自己的项目需求，进行源码更改。

## 功能展示
<img src="image/image.jpg" width="600"  alt="功能展示"/>

## 环境搭建

#### 1、安装 Node.js，如果已经安装，可直接第2步：

Node.js中允许使用 JavaScript 开发服务端以及命令行程序，我们可以去官网https://nodejs.org下载最新版本的安装程序，然后一步一步进行安装就可以了。

#### 2、down下项目后，在当前目录下执行以下命令：

```
npm install --save-dev electron 或者安装制定版本 npm install --save-dev electron@^15.0.0
```

#### 3、在当前项目目录下，执行以下命令：

```
npm i -D @electron/remote

```

####  4、启动项目：

```
npm start

```

####  运行后，基础配置页说明

1、点击红色字进行选择路径。

2、下面要检查的日期，是为了方便检查什么时间以后的文件，毕竟有的项目，更新迭代了很多版本，历史的文件堆积的很多，很难做到全部文件的检查。那么就可以利用这个时间，检查最近或者选择时间之后的文件。

3、时间不是代表着检查选择的这天，而是检查选择的日期之后的所有有更改的文件。

4、不选，或者点击清空，是检查项目的所有文件。

#### 指导建议

大家可以下载WebStorm开发工具，导入项目，打开package.json文件，点击start左侧绿色按钮进行运行，后续直接右上角运行就可以了，或快捷键shift+f10，非常方便。

## 欢迎关注作者

微信搜索【Android干货铺】，或扫描下面二维码关注，查阅更多技术文章！

<img src="image/abner.jpg" width="200px" />

## License

```
Copyright (C) AbnerMing, VipTime Open Source Project

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```




