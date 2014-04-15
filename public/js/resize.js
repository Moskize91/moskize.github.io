var CenterPageMaxWidth = 820;
var ShowTitleWidth = 695;
var ShowRightPagaeWidth = 820;
var ShowLeftPageWidth = 1158;
var ShowIndexWidth = 990;
var LeftMaxWidth = 120;
var RightMaxWidth = 320;

$(function() {
    onPageResize();
    $(window).resize(onPageResize);
});

function onPageResize() {
    var leftPage = $('#left-page');
    var rightPage = $('#right-page');
    var centerPage = $('#center-page');
    var buttons = $('#title .button');
    var index = $('#index');
    
    var width = $(window).width();
    var height = $(window).height();
    
    var leftPageWidth;
    
    if(width > ShowTitleWidth) {
        buttons.show();
    } else {
        buttons.hide();
    }
    if(width > ShowLeftPageWidth) {
        leftPageWidth = width - ShowLeftPageWidth;
        leftPageWidth = leftPageWidth > LeftMaxWidth ? LeftMaxWidth : leftPageWidth;
        
        leftPage.show();
        leftPage.css('width', leftPageWidth);
        leftPage.css('height', height);
    } else {
        leftPage.hide();
        leftPageWidth = 0;
    }
    if(width > ShowRightPagaeWidth) {
        var rightPageWidth = width - CenterPageMaxWidth;
        rightPageWidth = rightPageWidth > RightMaxWidth ? RightMaxWidth : rightPageWidth;
        rightPage.show();
        rightPage.css('width', rightPageWidth);
        rightPage.css('margin-left', leftPageWidth + CenterPageMaxWidth);
        rightPage.css('height', height);
    } else {
        rightPage.hide();
    }
    if(width > ShowIndexWidth) {
        index.show();
    } else {
        index.hide();
    }
    centerPage.css('margin-left', leftPageWidth);
};