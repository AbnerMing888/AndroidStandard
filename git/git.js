let require = parent.window.require;
const exec = require('child_process').exec;
var iconv = require('iconv-lite');
let fs = require('fs');
$(function () {
    let selectPath = localStorage.getItem("select_path");
    //let cmdStr = "git log | grep '^Author: ' | awk '{print $2}' | sort | uniq -c | sort -k1,1nr";// -1 一个分支两次提交
    let cmdStr = "git log --format='%aN'";
    getAllUser();

    function getAllUser() {
        cmdExec(cmdStr, 0);
    }


    $(".getNowCommit span").click(function () {
        //检索
        let number = $(".git_number").val();
        if (number === "" || number.indexOf(".") !== -1) {
            number = 1;
        }
        let option = $("#git_select option:selected").val();

        var cmd = "git log -p -" + number;
        if (option.indexOf("all") === -1) {
            cmd = "git log  -p -" + number + " --author=\"" + option + "\"";
        }
        cmdExec(cmd, 1);
    });

    function cmdExec(cmdStr, type) {
        exec(cmdStr, {
            cwd: selectPath,
            encoding: "binary"
        }, function (err, stdout, stderr) {
            iconv.skipDecodeWarning = true;
            let userString = iconv.decode(stdout, 'UTF-8');
            if (type === 0) {
                let userArray = userString.split("'");
                const resultArray = Array.from(new Set(userArray))
                $("#git_select").empty();
                $("#git_select").append("<option value='all'>全部用户</option>");
                for (var i = 0; i < resultArray.length; i++) {
                    let user = resultArray[i];
                    if (user !== "" && user !== "\n") {
                        $("#git_select").append("<option value='" + user + "'>" + user + "</option>")
                    }
                }
            } else {
                //执行的命令
                // console.log(userString);
                let bFiles = userString.split("+++ b");//遍历出文件
                if (bFiles.length > 0) {
                    $(".git_list").empty();
                    $(".git_list_rect").css("display", "block");
                    var clickPosition = 0;
                    for (var c = 0; c < bFiles.length; c++) {
                        let file = bFiles[c].trim();
                        if (file.substring(0, 1) === "/") {
                            let index = file.indexOf("@@");
                            let f = file.substring(0, index).trim();
                            let last = f.lastIndexOf("/");
                            let endFile = f.substring(last + 1, f.length);
                            let nodeDiv = "<div class='git_list_item'>" +
                                "<div>" + endFile + "</div>" +
                                "</div>";
                            $(".git_list").append(nodeDiv);

                            $(".git_list_item").click(function () {
                                if (clickPosition === 0) {
                                    clickPosition++;
                                    resultGit(f, endFile);
                                    setTimeout(function () {
                                        clickPosition = 0;
                                    }, 500);
                                }

                            });
                        }


                    }
                }

            }

        });
    }

    function resultGit(f, endFile) {
        $(".git_result").empty();
        let selectPath = localStorage.getItem("select_path");
        let filePath = selectPath + f;

        $(".git_class_result").css("display", "none");

        if (endFile.indexOf("string") !== -1) {
            //string文件
            if (endFile.indexOf("app")
                || endFile.indexOf("libBase")) {
                $(".git_result").append("<div style='margin-top: 20px;color: #d43c3c;'>app和libBase暂时不检查</div>");
                return;
            }
            var stringStart = endFile;
            //去除module
            if (stringStart.indexOf("module") !== -1) {
                //包含
                stringStart = stringStart.replace("module_", "");
            }
            fs.readFile(filePath, 'utf-8', function (err, data) {
                console.log(data)
                let name = data.split("name=\"");
                let fileSize = name.length - 1;//数量
                var fileOk = 0;
                var noString = "";
                name.forEach(function (item, position) {
                    let i = item.indexOf("\"");
                    let endString = item.substring(0, i);
                    if (item.startsWith(stringStart)) {
                        //符合
                        fileOk++;
                    } else {
                        //不符合
                        let nodeNo = "<div style='padding: 5px;'>" +
                            endString +
                            "</div>";
                        noString = noString + nodeNo;
                    }
                });
                appendTop(endFile);
                $(".git_result").append("<div style='height: 240px;overflow-y: auto;" +
                    "text-align: left;border: 1px solid #e8e8e8;margin-top: 10px;'>" + noString + "</div>");
            });
        } else if (endFile.indexOf("java") !== -1 || endFile.indexOf("kt") !== -1) {
            //java文件 要判断 "类名检查","类注释", "方法注释", "方法命名", "变量检查", "try catch检测"
            appendTop(endFile);
            let nodeTop = "<div style='margin-top: 10px;font-size: 12px;'>" +
                "<span class='gitSpan gitJavaClass'>类名检查</span>" +
                "<span class='gitSpan gitJavaClassNotes'>类注释</span>" +
                "<span class='gitSpan gitJavaMethodNotes'>方法注释</span>" +
                "<span class='gitSpan gitJavaMethod'>方法命名</span>" +
                "<span class='gitSpan gitJavaVarqiable'>变量检查</span>" +
                "<span class='gitSpan gitJavatry'>try catch检测</span>" +
                "</div>";
            $(".git_result").append(nodeTop);
            var java = 0;
            if (endFile.indexOf("kt") !== -1) {
                java = 1;
            }
            gitJavaKotlin(filePath, endFile, java);
            classCheckName($(".gitJavaClass"), endFile);
        } else if (f.indexOf("layout") !== -1 && endFile.indexOf("xml") !== -1) {

            appendTop(endFile);
            let endF = f.substring(1, f.length);
            let position = endF.indexOf("/");
            let moduleName = endF.substring(0, position);
            var fileStart = moduleName;
            //去除module
            if (fileStart.indexOf("module_") !== -1) {
                //包含
                fileStart = fileStart.replace("module_", "");
            }

            if (endFile.indexOf("activity") !== -1
                || endFile.indexOf("fragment") !== -1
                || endFile.indexOf("dialog") !== -1
                || endFile.indexOf("adapter") !== -1) {

                if (endFile.startsWith(fileStart + "_activity")
                    || endFile.startsWith(fileStart + "_fragment")
                    || endFile.startsWith(fileStart + "_dialog")
                    || endFile.startsWith(fileStart + "_adapter")) {
                    $(".git_result").append("<div style='margin-top: 10px;color: #d43c3c;'>符合规范，真棒!!!</div>");
                } else {
                    $(".git_result").append("<div style='margin-top: 10px;color: #d43c3c;'>不符合规范，请赶紧整改!!!</div>");
                }
            } else {
                if (endFile.startsWith(fileStart)) {
                    $(".git_result").append("<div style='margin-top: 10px;color: #d43c3c;'>符合规范，真棒!!!</div>");
                } else {
                    $(".git_result").append("<div style='margin-top: 10px;color: #d43c3c;'>不符合规范，请赶紧整改!!!</div>");

                }
            }

        }
    }

    function appendTop(endFile) {
        $(".git_result").append("<div style='color: #d43c3c;font-weight: bold;font-size: 13px;'>当前查看文件：" + endFile + "" +
            "    不规范如下：" +
            "</div>");
    }

    function gitJavaKotlin(filePath, endFile, java) {
        $(".gitJavaClass").click(function () {
            //类名
            classCheckName($(this), endFile);
        });
        $(".gitJavaClassNotes").click(function () {
            //类注释
            setTopStyle($(this));
            //类注释
            fs.readFile(filePath, 'utf-8', function (err, data) {
                if (err) {
                    return;
                }
                if (data.indexOf("{") !== -1) {
                    let dd = data.split("{")[0];
                    if (dd.indexOf("author") === -1
                        || dd.indexOf("date") === -1
                        || dd.indexOf("desc") === -1) {
                        //不符合
                        $(".git_class_result").append("<div style='color: #d43c3c;font-weight: bold;'>没有类注释!!!，请尽快添加!!!</div>");
                    } else {
                        //符合
                        $(".git_class_result").append("<div>有类注释</div>");
                    }
                }
            });
        });
        $(".gitJavaMethodNotes").click(function () {
            setTopStyle($(this));
            //方法注释
            readMethodFile(filePath, java);
        });
        $(".gitJavaMethod").click(function () {
            setTopStyle($(this));
            //方法命名
            readMethodName(filePath, java, endFile);
        });
        $(".gitJavaVarqiable").click(function () {
            setTopStyle($(this));
            //变量检查
            readVariableFile(filePath, java);
        });
        $(".gitJavatry").click(function () {
            setTopStyle($(this));
            //try cacth检查
            readTryFile(filePath, java);
        });
    }

    function setTopStyle(node) {
        $(".gitJavaClass").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".gitJavaMethodNotes").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".gitJavaClassNotes").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".gitJavaMethod").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".gitJavaVarqiable").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".gitJavatry").css({"color": "#d43c3c", "background-color": "#ffffff"});
        $(".git_class_result").css("display", "block");
        $(".git_class_result").empty();
        $(node).css({"color": "#ffffff", "background-color": "#d43c3c"});
    }

    function checkCase(ch) {
        if (ch === ch.toUpperCase()) {
            return true;
        } else {
            return false;
        }

    }

    function classCheckName(node, endFile) {
        setTopStyle(node);
        //检查类名
        if (!checkCase(endFile) && endFile.indexOf("_") === -1) {
            //符合
            $(".git_class_result").append("<div>类名符合</div>");
        } else {
            //不符合
            $(".git_class_result").append("<div style='color: #d43c3c;font-weight: bold;'>类名不符合!!!,请按照规范整改!!!</div>");
        }
    }

    function readMethodFile(path, file) {
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                return;
            }
            //遍历方法
            var eachOk = 0;
            var eachNo = 0;
            var caseNode = [];//不符合的方法

            //遍历所有的方法，判断是kt还是java
            if (file === 1) {
                //kotlin
                let kotlin = data.split("fun");
                kotlin.forEach(function (item, position) {
                    let endItem = item.trim();
                    let override = endItem.substring(endItem.length - 20, endItem.length);
                    //判断是否包含
                    if (position !== kotlin.length - 1) {
                        if (override.indexOf("override") === -1) {
                            let endM = kotlin[position + 1];
                            //有注释的也要另行添加
                            let kE = endItem.lastIndexOf("}");
                            let endK = endItem.substring(kE, endItem.length);
                            if (endK.indexOf("//") !== -1 || endK.indexOf("*/") !== -1) {
                                //带有注释
                                eachOk++;
                            } else {
                                //没有注释
                                //不符合的方法
                                let tr = endM;
                                if (tr != null) {
                                    let positionCase = tr.indexOf("(");
                                    let endCase = tr.substring(0, positionCase);
                                    //去掉构造函数
                                    if (endCase.length < 30 && file.indexOf(endCase) === -1) {
                                        eachNo++;
                                        caseNode.push(endCase);
                                    }
                                }
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

                        //判断是否包含}
                        if (item.indexOf("}") !== -1) {
                            let lastDesc = item.lastIndexOf("}");
                            let endDesc = item.substring(lastDesc, item.length);
                            if (endDesc.indexOf("Override") === -1) {
                                if (endDesc.indexOf("//") !== -1 || endDesc.indexOf("/*") !== -1) {
                                    //包含
                                    eachOk++;
                                } else {
                                    if (item.indexOf("while") === -1
                                        && item.indexOf("if") === -1
                                        && item.indexOf("for") === -1) {

                                        //添加方法
                                        let lastK = item.lastIndexOf("(");
                                        let lasetContent = item.substring(0, lastK);
                                        let endContent = lasetContent.split(" ");//取最后一个

                                        let javaMethod = endContent[endContent.length - 1];
                                        if (file.indexOf(javaMethod) === -1) {
                                            //不符合的方法
                                            eachNo++;
                                            caseNode.push(javaMethod);
                                        }

                                    }

                                }


                            }
                        } else {

                            let lastPrivate = item.lastIndexOf("private");
                            let lastPublic = item.lastIndexOf("public");
                            let lastProtected = item.lastIndexOf("protected");
                            var endLast = lastPrivate;
                            if (lastPublic > endLast) {
                                endLast = lastPublic;
                            }
                            if (lastProtected > endLast) {
                                endLast = lastPublic;//获取最后一个
                            }

                            let endString = item.substring(endLast - 50, endLast);
                            if (endString.indexOf("Override") === -1) {
                                if (endString.indexOf("//") !== -1 || endString.indexOf("*/") !== -1) {
                                    //包含
                                    eachOk++;
                                } else {
                                    //添加方法
                                    let lastK = item.lastIndexOf("(");
                                    let lasetContent = item.substring(0, lastK);
                                    let endContent = lasetContent.split(" ");//取最后一个
                                    let javaMethod = endContent[endContent.length - 1];
                                    if (file.indexOf(javaMethod) === -1) {
                                        //不符合的方法
                                        eachNo++;
                                        caseNode.push(javaMethod);
                                    }
                                }

                            }

                        }

                    }
                });

            }

            if (eachNo === 0) {
                //全部符合
                $(".git_class_result").append("<div>未检测到不符合之处，真棒!!!</div>");
            } else {
                //判断
                var nodeDiv = "<div style='text-align: left;'>未添加注释方法如下：</div>" +
                    "<div style='height: 190px;margin-top:10px;overflow-y: auto;text-align: left;'>";
                caseNode.forEach(function (item, position) {
                    nodeDiv = nodeDiv + "<div>" + item + "</div>";
                });
                $(".git_class_result").append(nodeDiv + "</div>");
            }


        });
    }

    //方法命名
    function readMethodName(path, java, endFile) {
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                return;
            }
            //遍历方法
            var eachOk = 0;
            var eachNo = 0;
            var caseNode = [];//不符合的方法

            //遍历所有的方法，判断是kt还是java
            if (java === 1) {
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
                            && endCase !== "" && endFile.indexOf(endCase) === -1) {
                            if ((checkCase(indexCase)
                                || endCase.indexOf("_") !== -1)) {
                                //不符合
                                eachNo++;
                                //添加方法
                                caseNode.push(endCase);
                            } else {
                                //符合
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
                            endFile.indexOf(endMethod) === -1
                            && endMethod.indexOf("(") === -1) {
                            if (checkCase(endMethod.substring(0, 1)) || endMethod.indexOf("_") !== -1) {
                                //不符合
                                eachNo++;
                                //添加方法
                                caseNode.push(endMethod);
                            } else {
                                //符合
                                eachOk++;
                            }
                        }

                    }

                });
            }

            if (eachNo === 0) {
                //全部符合
                $(".git_class_result").append("<div>未检测到不符合之处，真棒!!!</div>");
            } else {
                //判断
                var nodeDiv = "<div style='text-align: left;'>方法命名不规范如下：</div>" +
                    "<div style='height: 190px;margin-top:10px;overflow-y: auto;text-align: left;'>";
                caseNode.forEach(function (item, position) {
                    nodeDiv = nodeDiv + "<div>" + item + "</div>";
                });
                $(".git_class_result").append(nodeDiv + "</div>");
            }

        });
    }

    function readVariableFile(path, java) {
        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                return;
            }

            var eachOk = 0;
            var eachNo = 0;
            var caseNode = [];//不符合的方法


            //遍历所有的方法，判断是kt还是java
            if (java === -1) {
                //以等号分割
                let spD = data.split("=");
                spD.forEach(function (item, position) {
                    //然后判断val 和 var
                    let lastVal = item.lastIndexOf("val");
                    let lastVar = item.lastIndexOf("var");
                    var endLast = lastVal;
                    if (lastVar > lastVal) {
                        endLast = lastVar;
                    }
                    let lastContent = item.substring(endLast, item.length);

                    if (lastContent.indexOf("val") !== -1
                        || lastContent.indexOf("var") !== -1) {
                        if (lastContent.indexOf("fun") === -1) {
                            let endK = lastContent.split(" ")[1];
                            //判断变量是否符合要求
                            if (endK.indexOf("R") === -1
                                && endK.indexOf("!") === -1
                                && endK.indexOf(")") === -1
                                && endK.indexOf("{") === -1
                                && endK.indexOf("}") === -1) {
                                if (endK.indexOf("<") === -1 && endK !== "") {
                                    if ((checkCase(endK)
                                        || endK.indexOf("_") !== -1)) {
                                        const p = /^[A-Z_]*$/g;
                                        if (p.test(endK)) {
                                            //符合
                                            eachOk++;
                                        } else {
                                            //不符合
                                            eachNo++;
                                            //添加方法
                                            caseNode.push(endK);
                                        }
                                    } else {
                                        //符合
                                        eachOk++;
                                    }
                                }

                            }

                        }
                    }

                });

            } else {
                //java
                //判断

                let spF = data.split(";");
                spF.forEach(function (item, position) {
                    let lastPrivate = item.lastIndexOf("private");
                    let lastPublic = item.lastIndexOf("public");
                    let lastProtected = item.lastIndexOf("protected");
                    var endLast = lastPrivate;
                    if (lastPublic > endLast) {
                        endLast = lastPublic;
                    }
                    if (lastProtected > endLast) {
                        endLast = lastPublic;//获取最后一个
                    }

                    let lastContent = item.substring(endLast, item.length);

                    if (lastContent.indexOf("public") !== -1
                        || lastContent.indexOf("protected") !== -1
                        || lastContent.indexOf("private") !== -1) {

                        //是否包含等号
                        if (lastContent.indexOf("=") !== -1) {
                            let a = lastContent.trim().split("=");
                            let b = a[0].trim().split(" ");
                            let endC = b[b.length - 1];

                            if (endC.indexOf("R") === -1
                                && endC.indexOf("!") === -1
                                && endC.indexOf(")") === -1
                                && endC.indexOf("{") === -1
                                && endC.indexOf("}") === -1) {
                                //判断变量是否符合要求
                                if (endC.indexOf("<") === -1 && endC !== "") {
                                    if ((checkCase(endC)
                                        || endC.indexOf("_") !== -1)) {
                                        const p = /^[A-Z_]*$/g;
                                        if (p.test(endC)) {
                                            //符合
                                            eachOk++;
                                        } else {
                                            //不符合
                                            eachNo++;
                                            //添加方法
                                            caseNode.push(endC);
                                        }
                                    } else {
                                        //符合
                                        eachOk++;
                                    }
                                }
                            }

                        } else {
                            //普通的成员变量
                            let endItem = lastContent.trim().split(" ");
                            let endContent = endItem[endItem.length - 1];//最后的内容

                            if (endContent.indexOf("R") === -1
                                && endContent.indexOf("!") === -1
                                && endContent.indexOf(")") === -1
                                && endContent.indexOf("{") === -1
                                && endContent.indexOf("}") === -1) {
                                //判断变量是否符合要求
                                if (endContent.indexOf("<") === -1 && endContent !== "") {
                                    if ((checkCase(endContent)
                                        || endContent.indexOf("_") !== -1)) {
                                        const p = /^[A-Z_]*$/g;
                                        if (p.test(endContent)) {
                                            //符合
                                            eachOk++;
                                        } else {
                                            //不符合
                                            eachNo++;
                                            //添加方法
                                            caseNode.push(endContent);
                                        }
                                    } else {
                                        //符合
                                        eachOk++;
                                    }
                                }
                            }


                        }
                    }


                });

            }

            if (eachNo === 0) {
                //全部符合
                $(".git_class_result").append("<div>未检测到不符合之处，真棒!!!</div>");
            } else {
                //判断
                var nodeDiv = "<div style='text-align: left;'>变量命名不规范如下：</div>" +
                    "<div style='height: 190px;margin-top:10px;overflow-y: auto;text-align: left;'>";
                caseNode.forEach(function (item, position) {
                    nodeDiv = nodeDiv + "<div>" + item + "</div>";
                });
                $(".git_class_result").append(nodeDiv + "</div>");
            }

        });
    }


    function readTryFile(path, java) {

        fs.readFile(path, 'utf-8', function (err, data) {
            if (err) {
                return;
            }

            //遍历所有的方法，判断是kt还是java
            var kj;
            if (java === 1) {
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
                        eachOk++;
                    } else {
                        //不符合的方法
                        eachNo++;
                    }
                }
            });

            if (eachNo === 0) {
                //全部符合
                $(".git_class_result").append("<div>未检测到不符合之处，真棒!!!</div>");
            } else {
                $(".git_class_result").append("<div>未添加try catch的方法共有" + eachNo + "个</div>");
            }

        });
    }
});