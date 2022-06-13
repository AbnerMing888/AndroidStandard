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
                console.log(item);
                fs.stat(endPath + "/" + item, function (err, stats) {
                    //判断是文件还是文件夹
                    if (stats.isDirectory()) {
                        //就继续循环
                        eachChildFile(endPath + "/" + item);

                    } else {
                        //是文件，就进行判断文件名
                    }
                });
            });

        });
    }

    //点击进行检查
    $(".layout_check span").click(function () {
        eachNumber = 1;
        //获取选择的Moudle
        let selected = $('.data_file option:selected').val();
        let layoutPath = selectPath + "/" + selected + "/src/main/java";
        eachDir(layoutPath);
        /*
        fs.readdir(layoutPath, function (err, files) {
            if (err) {
                console.log(err);
                $(".layout_size").text("抱歉，没有找到layout文件夹");
                $(".layout_end_content").html("");
                $(".layout_file_tag").css("display", "none");
                $(".layout_no").css("display", "none");
                return
            }
            let fileSize = files.length;//文件数量

            var fileOk = 0;
            $(".layout_no").empty();

            var fileStart = selected;
            if (selected.startsWith("module_")) {
                fileStart = selected.replace("module_", "");
            }
            files.forEach(function (item, position) {
                //不仅仅开头包含包名，如果是Activity或者Fragment
                if (item.indexOf("activity") !== -1
                    || item.indexOf("fragment") !== -1
                    || item.indexOf("dialog") !== -1
                    || item.indexOf("adapter") !== -1) {

                    if (item.startsWith(fileStart + "_activity")
                        || item.startsWith(fileStart + "_fragment")
                        || item.startsWith(fileStart + "_dialog")
                        || item.startsWith(fileStart + "_adapter")) {
                        fileOk++;
                    } else {
                        addNoNode(item);
                    }
                } else {
                    if (item.startsWith(fileStart)) {
                        fileOk++;
                    } else {
                        addNoNode(item);
                    }
                }

            });


            if (fileOk !== fileSize) {
                //有不规范
                $(".layout_file_tag").css("display", "block");
                $(".layout_size").text("共检查" + fileSize + "个文件，命名规范" + fileOk + "个,不规范" + (fileSize - fileOk) + "个");
                $(".layout_no").css("display", "block");
                let content = "<div style='margin-bottom: 5px;'><strong>请您按照类命名规则对以上不符合文件进行整改，命名规则如下：</strong></div>" +
                    "类的命名规则： Activity、Fragment、Dialog、Adapter等给业务逻辑相关的类不用带组件名称，在common公共组件下的类为了区分哪个业务组件的类可以带业务模块名称" +
                    "<div style='font-weight: bold;margin-top: 5px;margin-bottom: 5px;'>例如： </div>" +
                    "<div>①、community组件下 SearchActivity SearchFragment SearchDialog SearchAdapter</div>" +
                    "②、common组件下为了区分业务，前面可加组件名，其他情况不用加组件名  MineConstant  CommunityConstant "
                $(".layout_end_content").html(content);
            } else {
                //全部规范
                $(".layout_file_tag").css("display", "none");
                $(".layout_no").css("display", "none");
                $(".layout_size").text("共检查" + fileSize + "个文件，全部符合规范，真棒！")
                $(".layout_end_content").html("");
            }


        });
*/
    });

    function addNoNode(item) {
        let nodeNo = "<div style='padding: 5px;'>" +
            item +
            "</div>";
        $(".layout_no").append(nodeNo);
    }
});