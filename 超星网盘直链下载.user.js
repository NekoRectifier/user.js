// ==UserScript==
// @name         超星网盘直链下载
// @namespace    NEKO_CXNDDL
// @version      1.0.1
// @description  多选下载应该是它最大的功能了
// @author       NekoRectifier
// @match        https://pan-yz.chaoxing.com/
// @grant        GM_download
// @connect      d0.ananas.chaoxing.com
// @license      MIT
// @require      https://unpkg.com/mdui@1.0.2/dist/js/mdui.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.0/jquery.js
// ==/UserScript==

var _item_num = 0;
var succeededFilenames;

function log(content) {
    console.log(content);
}

function download_finish(pos) {
    var name = succeededFilenames[pos - 1];
    var dl_snack = mdui.snackbar({
        message: name + "下载完成", 
        position: 'right-bottom',
        buttonText: '知道了',
        closeOnButtonClick: 'true',
        onButtonClick: function() {
            dl_snack.close();
        }
    });
}

function download(pos, url, name) {
    GM_download({
        url: url,
        name: name,
        confirm: true,
        headers:
        {
            referer: "https://i.chaoxing.com"
        },
        onerror: function (e) {
            log('下载出错' + e);

            var err_snack = mdui.snackbar({
                message: "下载出错，请检查网络",
                position: 'right-bottom',
                buttonText: '好',
                closeOnOutsideClick: false,
                closeOnButtonClick: true,
                onButtonClick: function() {
                    err_snack.close();
                }
            });
        },
        onload: function () {
            download_finish(pos);
        },
        onprogress: function (xhr) {
            var percent = (xhr.loaded / xhr.total) * 100.0;
            list_operator(2, pos, percent.toFixed(2));
        }
    })
}

function createFloatBox() {
    var base = `<div id="base" style="border: 1px solid rgb(21, 21, 21); width: 400px; position: fixed; top: 0%; right: 0%; z-index: 99999; background-color: rgba(55, 71, 79, 1); overflow-x: auto;">
                    <h2 style="text-align: center; color: white; font-size: 20px">超星网盘直链下载</h2>
                    <div id="download_list" style="height:150px; background-color: rgb(38, 45, 48); overflow:auto;">
                        <p id="place_holder" style="text-align: center; color: white; font-size: 20px; line-height:150px"> 当前没有下载任务 </p>
                    </div>
                </div>`;
    $(base).appendTo('body');
}

function list_operator(operation, arg1, arg2) {

    switch (operation) {
        case 0: //add
            _item_num++;
            var new_item = 
                `<div id="item_` + _item_num + `" style="margin:8px; border-radius: 10px; width:384px; height: 40px; background-color: rgb(38, 50, 56); max-width:400px">
                    <span id="item_name_` + _item_num + `" style="display:block; max-width:290px; float:left; color: white; font-size: 14px; padding-left:16px; line-height:40px; overflow:hidden; text-overflow:ellipsis;white-space:nowrap">` + arg1 + `</span>
                    <span id="item_status_` + _item_num + `" style="color: white; font-size: 16px; float:right; padding-right:16px; line-height:40px">100.00%</span>
                </div>` 
            $(new_item).appendTo('#download_list');
            break;
        case 1: //del
            $("#item_" + arg1).remove();
            break;
        case 2: //update
            $("#item_status_" + arg1).text(arg2 + "%");
            break;
        default:
            break;
    }
}

(function () {
    "use strict";
    console.clear();

    $("head").append($(`<link rel="stylesheet" href="https://unpkg.com/mdui@1.0.2/dist/css/mdui.min.css" />`));

    var div = document.getElementsByClassName("ypActionBar")[0];
    if (div) {
        var download_btn = document.createElement("button");
        download_btn.innerText = "下载";
        download_btn.setAttribute("class", "fl mdui-btn");
        download_btn.setAttribute("style", "margin-left:8px; background-color: #4CAF50;")
        download_btn.setAttribute("id", "direct_download");
        download_btn.setAttribute("onclick", "res.copy_direct_url();");

        div.append(download_btn);

        $(document).keydown(function (e) {
            if (e.keyCode == 75) {
                let show = $('#base').css('display');
                $('#base').css('display', show == 'block' ? 'none' : 'block');
            }
        })

        var start_snack = mdui.snackbar({
            message: "按 K 隐藏悬浮框",
            buttonText: 'OK',
            onButtonClick: function() {
                start_snack.close();
                log('fuck');
            }
        });
        
        
        
        res.copy_direct_url = function () { //TODO 名称修改

            function createXmlHttpRequest() {
                try {
                    return new XMLHttpRequest();
                } catch (e) {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                }
            }

            function log(content) {
                console.log(content);
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
                    $("#place_holder").hide(); //starts download!
                
                    if (succeededUrlsAmount > 1) {
                        //multi file downloads
                        for (var i = 0; i < succeededUrlsAmount; i++) {
                            list_operator(0, succeededFilenames[i]);
                            download(_item_num, succeededUrls[i], succeededFilenames[i]);
                        }
                    } else {
                        //single file
                        list_operator(0, succeededFilenames[0]);
                        download(_item_num, succeededUrls[0], succeededFilenames[0]);
                    }
                }
                if (failedUrlsAmount > 0) {
                    mudi.alert(
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
    createFloatBox();
    mdui.mutation();
})
