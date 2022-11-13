// ==UserScript==
// @name         超星图床
// @namespace    NEKO_CXTC
// @version      0.1
// @description  图床！(此插件与超星作业小助手存在冲突！！！)
// @author       NekoRectifier
// @match        https://pan-yz.chaoxing.com/pcuserpan/index
// @license      MIT
// @run-at       document-start  
// @grant        GM_log
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.1/jquery.min.js
// ==/UserScript==

const target_node = $(".breadcrumb")[0];
const config = { attributes: true, childList: true, subtree: true };

const callback = function(mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for(let mutation of mutationsList) {
        if (mutation.type === 'childList') {
            console.log('A child node has been added or removed.');
            run();
        }
        else if (mutation.type === 'attributes') {
            console.log('The ' + mutation.attributeName + ' attribute was modified.');
        }
    }
};

const observer = new MutationObserver(callback);

function imageExtCheck(filename) {
    var length = filename.length
    if (length - filename.lastIndexOf(".jpg") == 4 || length - filename.lastIndexOf(".png") == 4) {
        return true;
    }
    return false;
}

function run() {
    var file_list = $(".dataCon").find(".dataBody").children();

    console.log("file_list is: ",file_list);

    for (var i = 0; i < file_list.length; i++) {
        var thumb_img = $($(file_list[i]).children()[1]).children();
        var file_name = $($(file_list[i]).children()[2]).find("span").text();
        var thumb_img_src = thumb_img.attr("src");

        console.log(file_name);

        if (thumb_img_src.indexOf("static/pc") == -1 && imageExtCheck(file_name)) {
            console.log("got!")
        }
    }
}


//main entry
(function () {
    'use strict';

    console.log("wtf?");
    observer.observe(target_node, config);
    run();
    

})();