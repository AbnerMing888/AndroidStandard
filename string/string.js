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

    //点击进行检查
    $(".layout_check span").click(function () {
        //获取选择的Moudle
        let selected = $('.data_file option:selected').val();
        let layoutPath = selectPath + "/" + selected + "/src/main/res/values/strings.xml";
        if (selected === "app") {
            $(".layout_size").text("app就不检查了");
            $(".layout_end_content").html("");
            $(".layout_file_tag").css("display", "none");
            $(".layout_no").css("display", "none");
            return;
        }
        //读取文件信息
        var stringStart = selected;

        //去除module
        if (stringStart.indexOf("module") !== -1) {
            //包含
            stringStart = stringStart.replace("module_", "");
        }

        fs.readFile(layoutPath, 'utf-8', function (err, data) {
            if (err) {
                $(".layout_size").text("抱歉，没有找到string文件夹");
                $(".layout_end_content").html("");
                $(".layout_file_tag").css("display", "none");
                $(".layout_no").css("display", "none");
                return
            }
            //判断文件的时间
            fs.stat(layoutPath, function (err, stats) {
                let time = stats.ctime;
                let select_time = localStorage.getItem("select_time");
                if (select_time != null) {
                    if (time >= select_time) {
                        //才能进入到解析
                        eachIsDir(data, stringStart);
                    } else {
                        $(".layout_size").text("没有符合当前时间内的文件");
                    }

                } else {
                    eachIsDir(data, stringStart);
                }

            });

        });

    });

    function eachIsDir(data, stringStart) {
        let name = data.split("name=\"");
        let fileSize = name.length - 1;//数量
        var fileOk = 0;
        $(".layout_no").empty();
        name.forEach(function (item, position) {
            let i = item.indexOf("\"");
            let endString = item.substring(0, i);

            console.log(item)

            if (item.startsWith(stringStart)) {
                //符合
                fileOk++;
            } else {
                //不符合
                let nodeNo = "<div style='padding: 5px;'>" +
                    endString +
                    "</div>";
                $(".layout_no").append(nodeNo);
            }
        });

        if (fileOk !== fileSize) {
            $(".layout_file_tag").css("display", "block");
            $(".layout_size").text("共检查" + fileSize + "处，命名规范" + fileOk + "处,不规范" + (fileSize - fileOk) + "处");
            $(".layout_no").css("display", "block");
            let content = "<div><strong>请您按照string命名规则对以上不符合之处进行整改，资源命名规则如下</strong><br/><br/>String命名规则：  模块名称_** 例如：common_submit  ，mine_submit</div>"
            $(".layout_end_content").html(content);
        } else {
            $(".layout_file_tag").css("display", "none");
            $(".layout_no").css("display", "none");
            $(".layout_size").text("共检查" + fileSize + "处，全部符合规范，真棒！")
            $(".layout_end_content").html("");
        }
    }
});