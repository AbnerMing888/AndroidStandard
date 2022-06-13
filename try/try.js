let require = parent.window.require;
let fs = require('fs');
const {dialog} = require("@electron/remote");
var numAndroid = 0;//是否是Android项目
var isEmptyDir = false;//选择的是否是空的目录
//获取存储的项目路径，配置文件选择的
let selectPath = localStorage.getItem("select_path");
$(function () {
    //获取存储的路径
    getSavePath();

    function getSavePath() {
        if (selectPath !== "" && selectPath !== null) {
            //遍历文件
            fs.readdir(selectPath, function (err, files) {
                if (err) {
                    return
                }
                //length 为0 证明，选择的文件路径下是空的,隐藏选择目录选项
                if (files.length === 0) {
                    isEmptyDir = true;
                    $(".data_select_file").css("display", "none");
                    return;
                }
                //不为空，就遍历当前路径下的所有的文件目录
                var isDir = false;
                files.forEach(function (item, position) {
                    let path = selectPath + "/" + item;
                    fs.stat(path, function (err, stats) {
                        if (err) {
                            return false;
                        }
                        if (stats.isDirectory()) {
                            isDir = true;
                        }
                        //最后一个判断
                        if (position === files.length - 1) {
                            //没有一个文件夹，隐藏
                            if (!isDir) {
                                isEmptyDir = true;
                                $(".data_select_file").css("display", "none");
                            }
                        }
                        //检测选择的是否是一个Android项目，通过是否包含app，gradle，settings.gradle，当然也可以判断其他
                        if (item === "app" || item === "gradle" || item === "settings.gradle") {
                            numAndroid++;
                        }
                        //判断是文件夹
                        if (stats.isDirectory()
                            && item != "build" && item != "gradle"
                            && item.indexOf(".") != 0) {
                            let nodeDiv = "<option value='" + item + "'>" + item + "</option>"
                            $(".data_file").append(nodeDiv);
                        }
                    });
                });
            });
        }
    }

    function eachDir(path) {
        var endPath = path;
        fs.readdir(endPath, function (err, files) {
            //遍历文件夹
            if (err) {
                return
            }
            if (files.length === 1) {
                //只有一个包
                endPath = endPath + "/" + files[0];
                eachDir(endPath);
            } else {
                //针对endPath包下的文件夹进行遍历
                eachChildFile(endPath);
            }

        });
    }

    function eachChildFile(endPath) {
        fs.readdir(endPath, function (err, files) {
            files.forEach(function (item, position) {

                fs.stat(endPath + "/" + item, function (err, stats) {
                    //判断是文件还是文件夹
                    if (stats.isDirectory()) {
                        //就继续循环
                        eachChildFile(endPath + "/" + item);
                    } else {
                        //是文件，就进行判断文件名
                        //然后进行读取文件内容
                        //判断时间
                        let time = stats.ctime;
                        let select_time = localStorage.getItem("select_time");
                        if (select_time != null) {
                            if (time >= select_time) {
                                //才能进入到解析
                                readFile(endPath + "/" + item, item);
                            }
                        } else {
                            readFile(endPath + "/" + item, item);
                        }

                    }
                });
            });

        });
    }

    var fileSize = 0;
    var fileOk = 0;
    var methodSize = 0;
    var methodSizeOk = 0;

    function readFile(path, file) {

        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                return;
            }

            //遍历所有的方法，判断是kt还是java
            var kj;
            if (file.indexOf("kt") !== -1 && data.indexOf("fun") !== -1) {
                //kotlin
                kj = data.split("fun");
            } else if (data.indexOf("void") !== -1) {
                //java
                kj = data.split("void");
            } else {
                kj = [];
            }
            //遍历方法
            var eachOk = 0;
            var eachNo = 0;
            kj.forEach(function (item, position) {
                if (position !== 0) {
                    if (item.indexOf("try") !== -1 && item.indexOf("catch") !== -1) {
                        //符合的方法
                        methodSizeOk++;
                        eachOk++;
                    } else {
                        //不符合的方法
                        methodSize++;
                        eachNo++;
                    }
                }
            });

            if (eachNo === 0) {
                //符合
                fileOk++;
            } else {
                //不符合
                fileSize++;
                addNoNode(file, eachOk, eachNo);
            }

            let error = "共检查" + fileSize + "个文件,一共" + (methodSize + methodSizeOk)
                + "个方法，有try catch的方法一共" + methodSizeOk + "个，没有的一共" + methodSize + "个";

            $(".layout_size").text(error);

        });
    }

    //点击进行检查
    $(".layout_check span").click(function () {
        fileSize = 0;
        fileOk = 0;
        methodSize = 0;
        methodSizeOk = 0;
        $(".layout_no").empty();
        //获取选择的Moudle
        let selected = $('.data_file option:selected').val();
        let layoutPath = selectPath + "/" + selected + "/src/main/java";
        eachDir(layoutPath);

        setTimeout(function () {
            if (fileSize === 0) {
                //全部符合
                $(".layout_file_tag").css("display", "none");
                $(".layout_no").css("display", "none");
                $(".layout_size").text("共检查" + fileSize + "个文件，全部符合规范，真棒！")
                $(".layout_end_content").html("");
            } else {
                $(".layout_file_tag").css("display", "block");
                $(".layout_no").css("display", "block");
                let content = "<div style='margin-bottom: 5px;'><strong>方法逻辑比较多，不确定是否有问题，不妨try一下呗~：</strong></div>" +
                    "<pre style='color: #d43c3c;'>" +
                    "try {\n" +
                    "\n" +
                    "    } catch (e: Exception) {\n" +
                    "      e.printStackTrace()\n" +
                    " }" +
                    "</pre>";
                $(".layout_end_content").html(content);
            }
        }, 500);
    });

    function addNoNode(item, methodSizeOk, methodSize) {
        let nodeNo = "<div style='padding: 5px;'>" +
            item + "<span style='color: #d43c3c;margin-left: 10px;font-size: 12px;'>" +
            "(共有：" + (methodSizeOk + methodSize) + "个方法，" +
            "未添加try catch的方法有" + methodSize + "个)</span>" +
            "</div>";
        $(".layout_no").append(nodeNo);
    }
});