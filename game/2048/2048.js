window.addEventListener('load',function(e) {

    var Q = window.Q = Quintus()
                     .include('Sprites, Input')
                     .setup('quintus',{ maximize: true });
                     
    Q.input.keyboardControls();
    
    var background, scorePanel, scoreNumber = 0;
    
    
    var assets = {
        tableNum : 4,
        actionCostsTime: 0.105,
        
        randomPowers : [0, 1],
        
        tableX : undefined,
        tableY : undefined,
        tableWidth : undefined,
        
        tableHeightRate : 0.7,
        voxelWidthRate : 0.85,
        cellLineWidthRate : 0.068,
        cellLineColor : 'rgb(215,215,215)',
        
        scoreAwards: [1, 1, 1, 1, 1, 1, 1.3, 1.3, 1.3, 1.7, 1.7, 2, 2, 3],
        
        radiusRate : 0.3,
        textRate : 0.83,
        configNum : 10,
        voxelBackgroundColor : ['rgb(220,191,131)', 'rgb(112,146,190)', 'rgb(0,234,234)', 'rgb(238,238,43)', 'rgb(250,163,44)', 'rgb(219,28,176)', 'rgb(179,12,235)', 'rgb(238,238,43)', 'rgb(0,234,234)', 'rgb(36,189,255)','rgb(220,191,131)'],
        voxelTextColor : ['rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(47,47,47)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(47,47,47)', 'rgb(47,47,47)', 'rgb(47,47,47)', 'rgb(47,47,47)'],
    };
    
    var table = [];
    
    var actions = {
        isPlaying : false,
        actionsArray : [],
        finishedArray: [],
        removeVoxels : [],
        time : 0.0,
        remainTime : 0.0,
        callBack : null,
    };
    
    var RandomInteger = function(start, end) {
        return Math.floor(Math.random() * (end - start + 1)) + start;
    };
    
    var PrintTable = function() {
        console.log('table:');
        for(var j=0; j<table.length; ++j) {
            var str = "("+j+")\t";
            for(var i=0; i<assets.tableNum; ++i) {
                var voxel = table[i][j];
                str += voxel ? voxel.power : '.';
                str += '\t'
            }
            console.log(str);
        }
    };
    var EachVisiableVoxels = function(callback) {
        
        callback(background);
        callback(scorePanel);
        
        for(i=0; i<actions.removeVoxels.length; ++i) {
            var voxel = actions.removeVoxels[i];
            if(voxel){
                callback(voxel);
            }
        }
        for(var i=0; i<table.length; ++i) {
            for(var j=0; j<table[i].length; ++j) {
                var voxel = table[i][j];
                if(voxel){
                    callback(voxel);
                }
            }
        }
    };
    
    var AddAction = function(action, finished) {
        actions.actionsArray.push(action);
        actions.finishedArray.push(finished ? finished : function(){});
    };
    
    var Play = function(time, callBack) {
        actions.isPlaying = true;
        actions.time = time;
        actions.remainTime = time;
        actions.callBack = callBack;
    }
    
    var DrawRoundedRectangle = function(ctx, x, y, width, height, radius, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }        
    }
    
    var GetLocation = function(x, y) {
        var fill = assets.tableWidth / assets.tableNum * (1.0 - assets.voxelWidthRate)/2 ,
            _x = assets.tableX + x * assets.tableWidth / assets.tableNum + fill,
            _y = assets.tableY + y * assets.tableWidth / assets.tableNum + fill;
        
        return {x:_x, y:_y};
    };
    
    var InsertVoxel = function(power, x, y) {
        
        var voxel = new Q.Voxel({
            width : assets.tableWidth /assets.tableNum * assets.voxelWidthRate,
            power : power,
            scaling : 1.0,
        });
        
        voxel.x = x;
        voxel.y = y;
        
        var location = GetLocation(x, y);
        voxel.p.x = location.x;
        voxel.p.y = location.y;
        
        AddAction(function(schedule) {
            schedule *= schedule;
            voxel.scaling = schedule > 0.3 ? schedule : 0.3;
        
        }, function() {
            voxel.scaling = 1.0;
        });
        return voxel;
    };
    
    var HideVoxel = function(voxel) {
        AddAction(function(schedule) {
            schedule *= schedule;
            if(schedule > 0.7 ) {
                voxel.hide = true;
            } else {
                voxel.scaling = 1.0 - schedule;
            }
        });
    };
    
    var MoveVoxel = function(voxel, x, y) {
        var sourceLocation = GetLocation(voxel.x, voxel.y),
            targetLocation = GetLocation(x, y);
        
        voxel.x = x;
        voxel.y = y;
        
        AddAction(function(schedule) {
            
            schedule *= schedule;
            
            voxel.p.x = sourceLocation.x + (targetLocation.x - sourceLocation.x) * schedule;
            voxel.p.y = sourceLocation.y + (targetLocation.y - sourceLocation.y) * schedule;
        
        }, function() {
        
            voxel.p.x = targetLocation.x;
            voxel.p.y = targetLocation.y;
        });
    }
    
    var IsGameOver = function() {
        for(var i=0; i<assets.tableNum; ++i) {
            for(var j=0; j<assets.tableNum; ++j) {
                var self = table[i][j];
                
                if(!self) {
                    return false;
                }
                var right = i < assets.tableNum - 1 ? table[i+1][j] : null,
                    down = j < assets.tableNum - 1 ? table[i][j+1] : null;
                    
                if(!(down && right)) {
                    continue;
                }
                if(self.power == down.power || self.power == right.power) {
                    return false;
                }
            }
        }
        return true;
    };
    
    var CountNumberByPower = function(power) {
        var num = 2;
        for(var i=0; i<power; ++i) {
            num *= 2;
        }
        return num;
    };
    
    var CountTextLengthByPower = function(num) {
        var length = 1;
        while((num = (num / 10) | 0) > 0) {
            length++;
        }
        return length;
    };
    
    Q.MovingSprite.extend('Background', {
        
        init: function(props) {
            this._super(props);
            this.width = props.width;
            this.x = props.x;
            this.y = props.y;
        },
        
        _drawCell: function(ctx, x0, y0, cellWidth, lineWidth) {
            var x = this.x + x0 * cellWidth,
                y = this.y + y0 * cellWidth;
            
            ctx.fillRect(x + lineWidth, y + lineWidth, cellWidth - lineWidth*2, cellWidth - lineWidth*2);
        },
        
        draw: function(ctx) {
            
            var cellWidth = this.width / assets.tableNum * 2,
                lineWidth = cellWidth * assets.cellLineWidthRate / 2;
            
            ctx.fillStyle = assets.cellLineColor;
            
            for(var i=0; i<assets.tableNum; ++i) {
                for(var j=0; j<assets.tableNum; ++j) {
                    this._drawCell(ctx, i, j, cellWidth, lineWidth);
                }
            }
        },
    });
    
    Q.MovingSprite.extend('ScorePanel', {
    
        init: function(props) {
            this._super(props);
            this.width = props.width;
            this.height = props.height;
            this.x = props.x;
            this.y = props.y;
        },
        
        _getText: function() {
            return scoreNumber;
        },
        
        draw: function(ctx) {
            ctx.font = '36px Helvetica';
            ctx.fillStyle  = 'rgb(0,0,0)';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(this._getText(), this.x + this.width/2 ,this.y + this.height/2);
        },
    });
    
    Q.MovingSprite.extend('Voxel', {
        
        init: function(props) {
            this._super(props);
            this.scaling = props.scaling;
            this.width = props.width * 2;
            this.power = props.power;
            this.hide = false;
        },
        
        draw: function(ctx) {
            
            if(this.hide) {return;}
            
            var idx = this.power > assets.configNum ? assets.configNum : this.power;
            
            var width = this.width * this.scaling,
                dx = this.p.x + ( this.width / 2 ) * ( 1 - this.scaling),
                dy = this.p.y + ( this.width / 2 ) * ( 1 - this.scaling);
            
            
            ctx.fillStyle  = assets.voxelBackgroundColor[idx];
            DrawRoundedRectangle(ctx, dx, dy, width, width, assets.radiusRate * width, true);
            
            var number = CountNumberByPower(this.power);
            var rate = 1 - 1 / CountTextLengthByPower(number);
            
            ctx.font = ''+(width * ( 1- rate * rate) * assets.textRate)+'px Helvetica';
            ctx.fillStyle  = assets.voxelTextColor[idx];
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(String(number), dx + width/2, dy + width/2);
        },
        
    });
    
    var ScoreAdd = function(power) {
        power++;
        var count = 2,
            scoreAwards = assets.scoreAwards;
            
        for(var i=0; i<power; ++i) {
            count *= 2;
        }
        var award = power >= scoreAwards.length ? scoreAwards[scoreAwards.length - 1] : scoreAwards[power];
        scoreNumber += Math.floor(count * award);
    };
    
    var PushLine = function(line, canInsertLocations) {
        
        var hasTouched = false;
        var hasMoved = false;
        
        for(var i=line.length - 1; i>=0; --i) {
            var x0 = line[i].x,
                y0 = line[i].y,
                voxel = table[x0][y0];
            
            if(!voxel) {
                continue;
            }
            var sx = voxel.x,
                sy = voxel.y,
                moveToLocation = null;
            
            searchTouch:for(var j=i+1; j<line.length; ++j) {
                var tx = line[j].x,
                    ty = line[j].y;
                
                var targetVoxel = table[tx][ty];
                
                if(targetVoxel) {
                    
                    if(targetVoxel.power == voxel.power && !hasTouched) {
                        actions.removeVoxels.push(voxel);
                        actions.removeVoxels.push(targetVoxel);
                        table[sx][sy] = null;
                        
                        table[tx][ty] = InsertVoxel(voxel.power + 1, tx, ty);
                        ScoreAdd(voxel.power);
                        
                        HideVoxel(voxel);
                        targetVoxel.hide = true;
                        
                        hasTouched = true;
                        hasMoved = true;
                        
                        moveToLocation = {
                            x : tx, y : ty
                        };
                    }
                    break searchTouch;
                    
                } else {
                    table[sx][sy] = null;
                    table[tx][ty] = voxel;
                    
                    sx = tx;
                    sy = ty;
                }
                moveToLocation = {
                    x : tx, y : ty
                };
                hasMoved = true;
            }
            
            if(moveToLocation) {
                MoveVoxel(voxel, moveToLocation.x, moveToLocation.y);
            }
        }
        var hx = line[0].x,
            hy = line[0].y;
        
        if(!table[hx][hy]) {
            canInsertLocations.push({
                x:hx, y:hy
            });
        }
        return hasMoved;
    };
    
    var NewVoxel = function(canInsertLocations) {
        if(canInsertLocations.length <=0 ) {return;}
        
        var idx = RandomInteger(0, canInsertLocations.length - 1);
        var l = canInsertLocations[idx];
        table[l.x][l.y] = InsertVoxel(assets.randomPowers[RandomInteger(0, assets.randomPowers.length - 1)], l.x, l.y);
        
    };
    
    var IteratorMatrix = function(isRow, isReversed, callback) {
        var i, j;
        
        for(i=0; i<assets.tableNum; ++i) {
            var array = [];
            
            if(isReversed) {
                for(j=assets.tableNum -1; j>=0; --j) {
                    array.push(
                        isRow ? { x:j, y:i} : { x:i, y:j}
                    );
                };
            } else {
                for(j=0; j<assets.tableNum; ++j) {
                    array.push(
                        isRow ? { x:j, y:i} : { x:i, y:j}
                    );
                }
            }
            callback(array);
        };
    };
    
    var PressKey = function(isRow, isReversed) {
        
        if(actions.isPlaying) {return;}
        
        var canInsertLocations = [];
        var hasMoved = false;
        
        IteratorMatrix(isRow, isReversed, function(line) {
            hasMoved |= PushLine(line, canInsertLocations);
        });
        if(hasMoved) {
            NewVoxel(canInsertLocations);
        }
        Play(assets.actionCostsTime, function(){
            if(IsGameOver()) {
                alert('游戏结束，最后得分 - '+scoreNumber);
            }
        });
    }
    
    var PressLeft = function() {
        PressKey(true, true);
    };
    
    var PressRight = function() {
        PressKey(true, false);
    };
    
    var PressUp = function() {
        PressKey(false, true);
    };
    
    var PressDown = function() {
        PressKey(false, false);
    };
    
    Q.input.on('leftUp', PressLeft);
    Q.input.on('rightUp', PressRight);
    Q.input.on('upUp', PressUp);
    Q.input.on('downUp', PressDown);
    
    var InsertFirstVoxel = function() {
        
        var startX = RandomInteger(0, assets.tableNum - 1),
            startY = RandomInteger(0, assets.tableNum - 1);
        
        table[startX][startY] = InsertVoxel(0, startX, startY);
        
        Play(assets.actionCostsTime);
    };
    
    (function(){
        for(var i=0; i<assets.tableNum; ++i) {
            table[i] = [];
            for(var j=0; j<assets.tableNum; ++j) {
                table[i][j] = null;
            }
        }
        var windowWidth = Math.min(window.innerWidth, window.innerHeight)/2;
        assets.tableX = window.innerWidth/4 - windowWidth/2;
        assets.tableY = 0;
        assets.tableWidth = assets.tableHeightRate * windowWidth;;
        
        background = new Q.Background({
            width : assets.tableWidth,
            x : assets.tableX,
            y : assets.tableY,
        });
        scorePanel = new Q.ScorePanel({
            width : windowWidth,
            height : windowWidth - assets.tableWidth,
            x : assets.tableX,
            y : assets.tableY + assets.tableWidth,
        });
        
        InsertFirstVoxel();
    })();
    
    Q.gameLoop(function(dt) {
        if(actions.isPlaying) {
            schedule = 1.0 - actions.remainTime / actions.time;
            schedule = schedule > 1.0 ? 1.0 : schedule;
            for(var i=0; i<actions.actionsArray.length; ++i) {
                actions.actionsArray[i](schedule);
            }
            actions.remainTime -= dt;
            if(actions.remainTime <=0 ){
                for(i=0; i<actions.finishedArray.length; ++i) {
                    actions.finishedArray[i]();
                }
                actions.isPlaying = false;
                actions.actionsArray = [];
                actions.finishedArray = [];
                actions.removeVoxels = [];
                if(actions.callBack){
                    actions.callBack();
                }
            }
        };
        Q.clear();
        
        var count = 0;
        
        EachVisiableVoxels(function(voxel){
            count++;
            voxel.update(dt);
            voxel.render(Q.ctx);
        });
    });
});