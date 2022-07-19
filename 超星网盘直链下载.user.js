// ==UserScript==
// @name         超星网盘直链生成 - Optimized
// @namespace    NEKO_CXNDDL
// @version      1.1.1
// @description  添加更多功能
// @author       NekoRectifier
// @match        https://pan-yz.chaoxing.com/
// @license      MIT
// @require      https://cdn.bootcss.com/clipboard.js/1.5.16/clipboard.min.js
// @require      https://unpkg.com/mdui@1.0.2/dist/js/mdui.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js
// ==/UserScript==

//=============== CUSTOM VARIABLES ================

var aria_url = "http://127.0.0.1:6800/jsonrpc"
var aria_method = "POST"

//=============== CUSTOM VARIABLES ================

var _item_num = 0;
var succeededFilenames;

function log(content) {
    console.log(content);
}

function copyToClipboard(str) {
    document.getElementById("direct_download").setAttribute("data-clipboard-text", str)
    var clipboard = new Clipboard("#direct_download");
    clipboard.on('success', function (e) {
        console.log('复制成功！');
    });

    clipboard.on('error', function (e) {
        console.log('复制失败！');
    });
}

function download_aria(url, name){
    //url is single str now!
    var req = 
    {
        id:'',
        jsonrpc: '2.0',
        method: 'aria2.addUri',
        params: [
            [url],
            {
                out: name,
                header : [
                    'referer: https://i.chaoxing.com'
                ]
            }
        ]
    };

    $.ajax({
        url: aria_url,
        type: aria_method,
        crossDomain: true,
        processData: false,
        data: JSON.stringify(req),
        contentType: 'application/json',
        
        success: function(res) {
            console.log(res);
        },
        error: function(e) {
            console.info(e.status);
            console.info(e.readyState);

            if (e.status == 0) {
                alert('Aria2 服务端未启动');
            } else {
                alert('Aria2 RPC 连接失败，检查 Token 及端口设置');
            }
        }
    })
}

(function () {
    "use strict";
    console.clear();

    $("head").append($(`<link rel="stylesheet" href="https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css" />`));

    var div = document.getElementsByClassName("ypActionBar")[0];
    if (div) {
        var download_btn = document.createElement("button");
        download_btn.innerText = "下载 / 复制";
        download_btn.setAttribute("class", "mdui-btn");
        download_btn.setAttribute("style", "margin-left:8px; background-color: #4CAF50;")
        download_btn.setAttribute("id", "direct_download");
        download_btn.setAttribute("onclick", "res.copy_direct_url();");
        download_btn.setAttribute("data-clipboard-text", "");
        download_btn.setAttribute('data-clipboard-action', 'copy');

        div.append(download_btn);
        
        res.copy_direct_url = function () {

            function createXmlHttpRequest() {
                try {
                    return new XMLHttpRequest();
                } catch (e) {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
            }

            if (res.choosedlen > 0) {
                var failedFilenames = new Array();
                var failedUrlsAmount = 0;
                var succeededUrls = new Array();
                succeededFilenames = new Array();
                var succeededUrlsAmount = 0;

                for (var filenode in res.choosed) {
                    var xmlHttp = createXmlHttpRequest();
                    xmlHttp.open(
                        "get",
                        "https://pan-yz.chaoxing.com/external/m/file/" + filenode,
                        false
                    );
                    xmlHttp.send();
                    
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        var html_source = xmlHttp.responseText;
                        var download_url = html_source.match(/https:\/\/d0.*(?=')/)[0];
                        var filename = res.choosed[filenode]["name"];
                        download_url = download_url.replace(/(?<=fn=).*/, filename);
                        succeededUrls[succeededUrlsAmount] = download_url;
                        succeededFilenames[succeededUrlsAmount] = filename;
                        succeededUrlsAmount++;
                    } else {
                        failedFilenames[failedUrlsAmount] = res.choosed[filenode]["name"];
                        failedUrlsAmount = failedUrlsAmount + 1;
                    }
                }


                if (succeededUrlsAmount > 0) {
                
                    if (succeededUrlsAmount > 1) {
                        //multi file downloads
                        for (var i = 0; i < succeededUrlsAmount; i++) {
                            download_aria(succeededUrls[i], succeededFilenames[i])
                        }
                    } else {
                        //single file
                        download_aria(succeededUrls[0], succeededFilenames[0])
                    }

                    alert('链接已复制；\nAria2 下载已开始');
                    copyToClipboard(succeededUrls);
                }
                if (failedUrlsAmount > 0) {
                    alert(
                        failedFilenames.toString() + " 等文件请求直链失败！（不支持文件夹）"
                    );
                    //TODO more friendiler failed prompt
                }
            } else {
                alert('请选中文件后再点击下载按钮');
            }
        };

        mdui.mutation();

    } else {
        console.log("没有抓取到div");
    }
})();

$(document).ready(function () {

})
