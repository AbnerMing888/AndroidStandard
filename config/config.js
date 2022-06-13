const require = parent.window.require;
const dialog = require('@electron/remote').dialog;

$(function () {
    //获取存储的选择路径
    let selectPath = localStorage.getItem("select_path");
    //不为空进行回显
    if (selectPath != "" && selectPath != null) {
        $(".config_file_input").val(selectPath);
    }

    //获取存储的选择时间
    let selectTime = localStorage.getItem("select_day");
    //不为空进行回显
    if (selectTime != "" && selectTime != null) {
        console.log(selectTime);
        $(".select_date").val(selectTime);
    }
    //点击选择项目路径
    $(".select_file").click(function () {
        //选择文件
        dialog.showOpenDialog({
            title: '请选择您的项目文件，尽量是Android项目哦~',
            properties: ['openDirectory']
        }).then(result => {
            const path = result.filePaths;
            if (path != null && path != "") {
                //选择后回显
                $(".config_file_input").val(path);
                //进行保存路径
                localStorage.setItem("select_path", path)
            }

        });
    });

    //监听时间发生了改变
    $(".select_date").bind("input propertychange ", function () {
        let day = $(this).val();
        if (day != null && day != "") {
            let date = new Date(day);
            let time = date.getTime();
            localStorage.setItem("select_day", day)
            localStorage.setItem("select_time", time)
        }
    });

    //点击清空时间
    $(".dateEmpty").click(function () {
        //清空
        localStorage.setItem("select_day", "");
        localStorage.setItem("select_time", "");
        $(".select_date").val("");
    });
});