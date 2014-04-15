$(function() {
    var content = $('#article').find('.content');
    var index = $('#index').find('.list');
    var id = 0;
    content.find('h1, h2, h3, h4, h5, h6, h7, h8').each(function(){
        var head = $(this);
        head.attr('id', 'article-index-'+id);
        id++;
        index.append('<div><a href="#'+ head.attr('id')+'">'+head.html()+'</a></div>');
    });
    content.find('a').each(function(){
        $(this).attr('target', '_blank').attr('ref', 'nofollow');
    });
});