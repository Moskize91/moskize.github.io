YUI().use("node", "overlay", "anim", function(Y){
    
    var window = Y.one('window');
    var articleNodes = [];
    
    var getWindowCenter = function() {
        return window.get('scrollTop') + window.get('winHeight')/2;
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
    
    var initScrollEvents = function() {
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
            var cursor = window.get('scrollTop');
            if(cursor < top) {
                cursor = top;
            } else if(cursor > bottom) {
                cursor = bottom;
            }
            overlay.move(offsetLeft, cursor);
            onCursorMove(getWindowCenter());
        };
        Y.on('scroll', scrollHandle);
        Y.on('mousewheel', scrollHandle);
    };
    
    var lastChoosedIndex = 0;
    
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
        Y.one('#index-'+lastChoosedIndex).one('.before').hide();
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
    
    var addClickEvent = function(i) {
        var a = Y.one("#index-"+i+" a");
        var top = articleNodes[i].top;
        var center = articleNodes[i].top + (articleNodes[i].bottom - articleNodes[i].top) / 2;
        var targetPoint = top + 160;
        if(targetPoint > center) {
            targetPoint = center;
        }
        a.on('click', function(evt){
            var anim = new Y.Anim({
                duration: 0.5,
                node: 'win',
                easing: 'easeBoth',
                to: {
                    scroll: [0, targetPoint - window.get('winHeight')/2]
                }
            });
            anim.run();
            evt.preventDefault();
            Y.log([top, center, targetPoint]);
        });
    };
    
    var parseArticle = function() {
        spliteChildrenByHead();
        parseChildren();
    };
    
    parseArticle();
    initScrollEvents();
});