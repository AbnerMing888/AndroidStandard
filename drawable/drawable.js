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
        var layoutPath = selectPath + "/" + selected + "/src/main/res";

        //读取文件信息
        var drawableStart = selected;

        //遍历res下存在的文件
        fs.readdir(layoutPath, function (err, files) {
            if (err) {
                return
            }
            let drawableArr = [];
            files.forEach(function (item, position) {
                if (item === "drawable-hdpi"
                    || item === "drawable-xhdpi"
                    || item === "drawable-xxhdpi"
                    || item === "drawable-xxxhdpi"
                    || item === "mipmap-xhdpi"
                    || item === "mipmap-xxhdpi"
                    || item === "mipmap-xxxhdpi") {
                    //追加
                    drawableArr.push(item);
                }
            });

            //然后遍历
            $(".layout_size").empty();
            var isFileNo = false;

            if (drawableArr.length === 0) {
                $(".layout_end_content").html("<div style='text-align: center;'>没有找到图片资源</div>");
                return;
            }
            drawableArr.forEach(function (item, position) {
                let path = layoutPath + "/" + item;//文件地址

                fs.readdir(path, function (err, filesChild) {
                    let fileSize = filesChild.length;
                    var fileOk = 0;
                    var nodeText = "";
                    filesChild.forEach(function (itemChild, positionChild) {
                        if (itemChild.startsWith(drawableStart)) {
                            //符合
                            fileOk++
                        } else {
                            isFileNo = true;
                            //不符合
                            nodeText = nodeText + itemChild + "\n";
                        }
                    });

                    let sizeFile = "<div>" + item + "目录下，共检查" + fileSize + "个文件，规范" + fileOk + "个，不规范" + (fileSize - fileOk) + "个</div>";
                    $(".layout_size").append(sizeFile);

                    $(".layout_size").append("<div style='margin-top: 5px;'><textarea style='width: 80%;height: 40px;resize: none;'>" + nodeText + "</textarea></div>");

                });

            });


            setTimeout(function () {
                if (isFileNo) {
                    //显示规则
                    let content = "<div><strong>请您按照图片命名规则对以上不符合之处进行整改，命名规则如下</strong>" +
                        "<div style='font-weight: bold;margin-top: 5px;margin-bottom: 5px;'>图片统一放drawable-xxhdpi里命名规则：</div>" +
                        "<div>组件名称_（背景用bg，图片用ic，按钮用btn，分隔线用divider）_**</div>" +
                        "<div style='font-weight: bold;margin-top: 5px;margin-bottom: 5px;'>例如：</div>" +
                        "<div>①、community模块下community_ic_publish</div>" +
                        "<div>②、common模块下 common_bg_publish common_ic_publish</div>" +
                        "</div>"
                    $(".layout_end_content").html(content);
                } else {
                    $(".layout_end_content").html("");
                }
            }, 200);

        });
    });

});