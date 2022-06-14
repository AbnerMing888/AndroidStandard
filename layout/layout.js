let require = parent.window.require;
let fs = require('fs');
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

    //点击进行检查
    $(".layout_check span").click(function () {
        //获取选择的Moudle
        let selected = $('.data_file option:selected').val();
        let layoutPath = selectPath + "/" + selected + "/src/main/res/layout";
        if (selected === "app") {
            $(".layout_size").text("app就不检查了");
            $(".layout_end_content").html("");
            $(".layout_file_tag").css("display", "none");
            $(".layout_no").css("display", "none");
            return;
        }
        fs.readdir(layoutPath, function (err, files) {
            if (err) {
                $(".layout_size").text("抱歉，没有找到layout文件夹");
                $(".layout_end_content").html("");
                $(".layout_file_tag").css("display", "none");
                $(".layout_no").css("display", "none");
                return
            }

            var filesTemp = [];
            files.forEach(function (item, position) {
                fs.stat(layoutPath + "/" + item, function (err, stats) {
                    let time = stats.ctime;
                    let select_time = localStorage.getItem("select_time");
                    if (select_time != null) {
                        if (time >= select_time) {
                            //才能进入到解析
                            filesTemp.push(item);
                        }
                    } else {
                        filesTemp.push(item);
                    }
                });
            });

            setTimeout(function () {
                let fileSize = filesTemp.length;//文件数量

                var fileOk = 0;
                $(".layout_no").empty();

                var fileStart = selected;

                //去除module
                if (fileStart.indexOf("module") !== -1) {
                    //包含
                    fileStart = fileStart.replace("module_", "");
                }

                filesTemp.forEach(function (item, position) {
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
                    let content = "<strong>请您按照资源命名规则对以上不符合文件进行整改，资源命名规则如下：</strong>" +
                        "<div style='margin-top: 5px;margin-bottom: 5px;'>Layout命名规则：组件名称_（Fragment的布局fragment，Adapter的布局item，对话框的布局dialog ，Activity的布局activity) _**</div>" +
                        "<div style='margin-bottom: 5px;'><strong>例如:</strong></div>Activity布局：community_activity_search" +
                        "<br/>Fragment布局：community_fragment_search " +
                        "<br/>Dialog布局：community_dialog_search " +
                        "<br/>Adapter布局：community_adapter_search"
                    $(".layout_end_content").html(content);
                } else {
                    //全部规范
                    $(".layout_file_tag").css("display", "none");
                    $(".layout_no").css("display", "none");
                    $(".layout_size").text("全部符合规范，真棒！")
                    $(".layout_end_content").html("");
                }
            }, 500);

        });

    });

    function addNoNode(item) {
        let nodeNo = "<div style='padding: 5px;'>" +
            item +
            "</div>";
        $(".layout_no").append(nodeNo);
    }
});