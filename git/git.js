let require = parent.window.require;
const exec = require('child_process').exec;
let fs = require('fs');
$(function () {
    let selectPath = localStorage.getItem("select_path");
    //let cmdStr = "git log | grep '^Author: ' | awk '{print $2}' | sort | uniq -c | sort -k1,1nr";// -1 一个分支两次提交
    let cmdStr = "git log  -p -2 --author='gongyaju' >>commit.diff";
    $(".getNowCommit").click(function () {
        //执行命令
        runExec();
    });

    function runExec() {
        // 执行命令行，如果命令不需要路径，或就是项目根目录，则不需要cwd参数：
        let workerProcess = exec(cmdStr, {
            cwd: selectPath}
        );
        // 不受child_process默认的缓冲区大小的使用方法，没参数也要写上{}：workerProcess = exec(cmdStr, {})
        // 打印正常的后台可执行程序输出
        workerProcess.stdout.on('data', function (data) {
            writeFile(data);
        });
        // 打印错误的后台可执行程序输出
        workerProcess.stderr.on('data', function (data) {
            writeFile("错误：" + data);
        });
        // 退出之后的输出
        workerProcess.on('close', function (code) {

        })
    }

    function writeFile(content) {
        fs.writeFile("git/git.txt", content, function (err) {
            if (err) {
                console.log("An error occurred creating the file " + err.message)
            } else {
                console.log("The file has been successfully saved")
            }

        })
    }
});