YUI().use("node", "overlay", "anim", function(Y){
    
    var win = Y.one('window');
    var articleNodes = [];
    
    var getWindowCenter = function() {
        return win.get('scrollTop') + win.get('winHeight')/2;
    };
    
    var isHead = function(tagName) {
        for(var i=1; i<=6; i++) {
            if(tagName==("h"+i) || tagName==("H"+i)) {
                return true;
            }
        }
        return false;
    };
    
    var spliteChildrenByHead = function() {
        var nextId = 0;
        var article = Y.one('#article').one('.content');
        var currNode = {
            head : null,
            content : [],
        };
        article.get('children').each(function(child){
            var tagName = child.get('tagName');
            if(isHead(tagName)) {
                if(currNode.content.length > 0) {
                    articleNodes.push(currNode);
                    currNode.content[0].set('id', 'article-head-'+nextId);
                    nextId++;
                }
                currNode = {
                    head : child,
                    content : [],
                };
            }
            currNode.content.push(child);
        });
        if(currNode.content.length > 0) {
            articleNodes.push(currNode);
        }
    };
    
    var onFixDiv = function(index, overlay, cursor) {
        index.addClass("fix-y");
        overlay.move(index.get('offsetLeft'), 0);
    };
    
    var onUnfixDiv = function(index, overlay, cursor) {
        var article = Y.one('#article');
        
        index.removeClass("fix-y");
        overlay.move(article.get('offsetLeft') + article.get('offsetWidth'), cursor);
    };
    
    var initScrollEvents = function() {
        var fixDiv = false;
        
        var article = Y.one('#article');
        var index = Y.one('#article-index');
        var title = Y.one('#article-index h4');
        
        var top = index.get('offsetTop');
        var bottom = article.get('offsetTop') + article.get('offsetHeight') - index.get('offsetHeight');
        
        if(bottom < top) {
            bottom = top;
        }
        var offsetLeft = index.get('offsetLeft');
        var overlay = new Y.Overlay({
            srcNode : index,
        });
        overlay.render();
        overlay.move(offsetLeft, top);
        
        var scrollHandle = function(){
            var cursor = win.get('scrollTop');
            var needFix = false;
            if(cursor < top) {
                cursor = top;
            } else if(cursor > bottom) {
                cursor = bottom;
            } else {
                needFix = true;
            }
            if(needFix && !fixDiv) {
                fixDiv = true;
                onFixDiv(index, overlay, cursor);
                
            } else if(!needFix && fixDiv) {
                fixDiv = false;
                onUnfixDiv(index, overlay, cursor);
            }
            onCursorMove(getWindowCenter());
        };
        Y.on('resize', scrollHandle);
        Y.on('scroll', scrollHandle);
        
        onCursorMove(0);
    };
    
    var lastChoosedIndex = -1;
    
    var onCursorMove = function(cursor) {
        if(articleNodes.length<=0){
            return;
        }
        var index = 0;
        for(var i=0; i<articleNodes.length; ++i) {
            var node = articleNodes[i];
            if(node.top > cursor) {
                break;
            }
            index = i;
        };
        if(index==lastChoosedIndex) {
            return;
        }
        Y.one('#index-'+index).one('.before').show();
        if(lastChoosedIndex >= 0) {
            Y.one('#index-'+lastChoosedIndex).one('.before').hide();
        }
        lastChoosedIndex = index;
    };
    
    var parseChildren = function() {
        var index = Y.one("#article-index");
        for(var i=0; i<articleNodes.length; ++i) {
            var node = articleNodes[i];
            var firstOne = node.content[0];
            var lastOne = node.content[node.content.length - 1];
            node.top = firstOne.get('offsetTop');
            node.bottom = lastOne.get('offsetTop') + lastOne.get('offsetHeight');
            var title;
            if(node.head) {
                title = node.head.get('innerHTML');
            } else {
                title = "内容";
            }
            var indexNode = Y.Node.create('<div id="index-'+i+'"class="index"><div class="before" style="display:none"></div><a href="#">'+title+'</a></div>');
            index.append(indexNode);
            
            addClickEvent(i);
        }
    };
    
    var getTargetPoint = function(node) {
        var top = node.top;
        var center = node.top + (node.bottom - node.top) / 2;
        var targetPoint = top + 160;
        if(targetPoint > center) {
            targetPoint = center;
        }
        return targetPoint;
    };
    
    var addClickEvent = function(i) {
        var a = Y.one("#index-"+i+" a");
        var node = articleNodes[i];
        a.on('click', function(evt){
            var anim = new Y.Anim({
                duration: 0.5,
                node: 'win',
                easing: 'easeBoth',
                to: {
                    scroll: [0, getTargetPoint(node) - win.get('winHeight')/2]
                }
            });
            anim.run();
            evt.preventDefault();
        });
    };
    
    var parseArticle = function() {
        spliteChildrenByHead();
        parseChildren();
    };
    
    parseArticle();
    initScrollEvents();
});