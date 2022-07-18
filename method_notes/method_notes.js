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
                    console.log(err);
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

            //遍历方法
            var eachOk = 0;
            var eachNo = 0;
            var caseNode = [];//不符合的方法

            //遍历所有的方法，判断是kt还是java
            if (file.indexOf("kt") !== -1 && data.indexOf("fun") !== -1) {
                //kotlin
                let kotlin = data.split("fun");
                kotlin.forEach(function (item, position) {
                    if (position !== 0) {
                        //判断开头是大写还是小写
                        let tr = item.trim();
                        let indexCase = tr.substring(0, 1);
                        let positionCase = tr.indexOf("(");
                        let endCase = tr.substring(0, positionCase);
                        if (endCase.indexOf("<") === -1
                            && endCase !== "" && file.indexOf(endCase) === -1) {
                            if ((checkCase(indexCase)
                                || endCase.indexOf("_") !== -1)) {
                                //不符合
                                methodSize++;
                                eachNo++;
                                //添加方法
                                caseNode.push(endCase);
                            } else {
                                //符合
                                methodSizeOk++;
                                eachOk++;
                            }
                        }
                    }

                });

            } else {
                //java
                //遍历方法
                let java = data.split(") {");
                java.forEach(function (item, position) {
                    if (item.indexOf("public") !== -1
                        || item.indexOf("protected") !== -1
                        || item.indexOf("private") !== -1) {

                        //获取最后一个括号
                        let lastK = item.lastIndexOf("(");
                        let lasetContent = item.substring(0, lastK);
                        let endContent = lasetContent.split(" ");//取最后一个
                        let endMethod = endContent[endContent.length - 1];

                        if (endMethod.indexOf("<") === -1
                            && endMethod !== "" &&
                            file.indexOf(endMethod) === -1
                            && endMethod.indexOf("(") === -1) {
                            if (checkCase(endMethod.substring(0, 1)) || endMethod.indexOf("_") !== -1) {
                                //不符合
                                methodSize++;
                                eachNo++;
                                //添加方法
                                caseNode.push(endMethod);
                            } else {
                                //符合
                                methodSizeOk++;
                                eachOk++;
                            }
                        }

                    }

                });
            }


            if (eachNo === 0) {
                //符合
                fileOk++;
            } else {
                //不符合
                fileSize++;
                addNoNode(file, eachOk, eachNo, caseNode);
            }

            let error = "共检索出" + (methodSize + methodSizeOk)
                + "个方法，规范的方法一共" + methodSizeOk + "个，不规范的一共" + methodSize + "个";

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
                $(".layout_size").text("全部符合规范，真棒！")
                $(".layout_end_content").html("");
            } else {
                $(".layout_file_tag").css("display", "block");
                $(".layout_no").css("display", "block");
                let content = "<div style='margin-bottom: 5px;'><strong>方法命名小驼峰哦，如：getData()~：</strong></div>";
                $(".layout_end_content").html(content);
            }

        }, 500);
    });

    var mIndexPosition = 0;

    function addNoNode(item, methodSizeOk, methodSize, caseNode) {
        let nodeNo = "<div style='padding: 5px;'>" +
            item + "<span style='color: #d43c3c;margin-left: 10px;font-size: 12px;'>" +
            "(共有：" + (methodSizeOk + methodSize) + "个方法，" +
            "不规范的方法命名有" + methodSize + "个)</span>" +
            "<span class='nodeSee'>点击查看</span>" +
            "</div>";
        $(".layout_no").append(nodeNo);

        $(".nodeSee").click(function () {
            if (mIndexPosition === 0) {
                mIndexPosition++;
                //点击
                $(".dialog_div").css("display", "block");
                $(".dialog_content").empty();
                console.log(caseNode)
                caseNode.forEach(function (item, position) {
                    let node = "<div style='margin-top: 5px;color: #222222;font-weight: bold;'>" + item + "</div>";
                    $(".dialog_content").append(node);
                });
                setTimeout(function () {
                    mIndexPosition = 0;
                }, 500);
            }

        });
    }

    function checkCase(ch) {
        if (ch === ch.toUpperCase()) {
            return true;
        } else {
            return false;
        }

    }

    $(".dialog_close").click(function () {
        $(".dialog_div").css("display", "none");
    });
});