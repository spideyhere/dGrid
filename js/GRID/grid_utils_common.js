(function (__) {

    var grid = __;
    grid.utils = grid.utils || {};
    grid.utils.common = grid.utils.common || {};
    grid.utils.common.__ = __;
    
    grid.utils.common.getRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    grid.utils.common.ajax = function (proxy) {
        var _this = this.__;
        if(_this.config.gridBodyWrapper) {
            _this.utils.toggleLoader(true);
        }
        $.ajax({
            url: proxy.url,
            type: 'POST',
            data: JSON.stringify(proxy.param || {}),
            async: proxy.hasOwnProperty('isAsync') ? proxy.isAsync : true,
            contentType: "application/json",
            success: function(response) {
                response = response;
                if (_this.config.callBack.ajaxSuccessCallBack && typeof _this.config.callBack.ajaxSuccessCallBack === 'function') {
                    _this.config.callBack.ajaxSuccessCallBack(_this, response);
                }
                proxy.callBack(response);
                if(_this.config.gridBodyWrapper) {
                    _this.utils.toggleLoader(false);
                }
            }
        });
    };

    grid.utils.common.iterator = function (arr, callBack, fromTop) {
        var len = 0;
        if (!fromTop) {
            len = arr.length;
            while (len--) {
                callBack(arr[len], len, this.__);
            }
        } else {
            len = 0;
            while (len < arr.length) {
                callBack(arr[len], len, this.__);
                len++;
            }
        }
    };

    grid.utils.common.checkScrollAlwaysOn = function (wrapper) {
        var tempDIV = $(document.createElement('div')).addClass('tempDIV'),
            wrapperWidth = wrapper[0].offsetWidth,
            tempDIVWidth = 0;
        $(wrapper).append(tempDIV);
        tempDIVWidth = $(wrapper).find('.tempDIV')[0].offsetWidth;
        return {
            'isAlways': wrapperWidth > tempDIVWidth,
            'diff': wrapperWidth - tempDIVWidth
        };
    };
    grid.utils.common.scrollAlwaysFix = function (adjustableWidth) {
        var width = this.__.config.rightColumnWrapper.outerWidth();
        this.__.config.rightColumnWrapper.css({
            'width': width - adjustableWidth - 2
        });
    };
    grid.utils.common.getParentWidth = function (key) {
        var _this = this.__,
            cumulativeWidth = 0,
            width = parseFloat(_this.config.headerConfig[key].width);
        if(_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
            this.iterator(Object.keys(_this.config.headerConfig[key].subGroups), function(k, i){
                cumulativeWidth += parseFloat(_this.config.headerConfig[key].subGroups[k].width);
            });

            if(width && cumulativeWidth < width) {
                width -= cumulativeWidth;
            }
            return width;
        }
    };
    grid.utils.common.widthModerator = function(canAdjustScrollable, _wConfig) {
        var _this = this.__,
            wConfig = _wConfig ? _wConfig : _this.utils.getGridWidthConfig(),
            leftVisibleWidth = _this.utils.getTotalColumnWidth('left'),
            rightVisibleWidth = _this.utils.getTotalColumnWidth('right'),
            tempWidth = 0;
        // _this.utils.headerConfig();
            
        if(canAdjustScrollable) {
            wConfig.leftScrollableWrapper.css({
                'width': leftVisibleWidth
            });
            wConfig.rightScrollableWrapper.css({
                'width': rightVisibleWidth
            });
        }

        _this.config.gridWrapper.css({
            'width': wConfig.gridOuterWrapperWidth
        });

        _this.config.resizeConfig.gridOuterWrapperWidth = wConfig.gridBodyWrapperWidth = wConfig.gridOuterWrapperWidth;
        
        if(leftVisibleWidth > 0 && rightVisibleWidth > 0) {
            if(leftVisibleWidth >= rightVisibleWidth) {
                if(leftVisibleWidth >= (wConfig.gridBodyWrapperWidth/2) - wConfig.separatorWidth) {
                    tempWidth = wConfig.gridBodyWrapperWidth - rightVisibleWidth;
                    wConfig.leftColumnWrapper.css({
                        'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? (leftVisibleWidth <= tempWidth ? leftVisibleWidth : tempWidth) : (wConfig.gridBodyWrapperWidth / 2)) - wConfig.separatorWidth
                    });

                    wConfig.rightColumnWrapper.css({
                        'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? rightVisibleWidth : (wConfig.gridBodyWrapperWidth / 2))
                    });
                }
                else {
                    tempWidth = wConfig.gridBodyWrapperWidth - leftVisibleWidth;
                    wConfig.leftColumnWrapper.css({
                        'width': (leftVisibleWidth < (wConfig.gridBodyWrapperWidth / 2) ? leftVisibleWidth : (wConfig.gridBodyWrapperWidth / 2)) - wConfig.separatorWidth
                    });

                    wConfig.rightColumnWrapper.css({
                        'width': ((leftVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? (rightVisibleWidth <= tempWidth ? rightVisibleWidth : tempWidth) : (wConfig.gridBodyWrapperWidth / 2))
                    });
                }
            }
            else if(leftVisibleWidth < rightVisibleWidth){
                if(rightVisibleWidth >= wConfig.gridBodyWrapperWidth/2) {
                    tempWidth = wConfig.gridBodyWrapperWidth - leftVisibleWidth;
                    wConfig.rightColumnWrapper.css({
                        'width': ((leftVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? (rightVisibleWidth <= tempWidth ? rightVisibleWidth : tempWidth) : (wConfig.gridBodyWrapperWidth / 2)) 
                    });

                    wConfig.leftColumnWrapper.css({
                        'width': (leftVisibleWidth < (wConfig.gridBodyWrapperWidth / 2) ? leftVisibleWidth : (wConfig.gridBodyWrapperWidth / 2)) - wConfig.separatorWidth
                    });
                }
                else {
                    tempWidth = wConfig.gridBodyWrapperWidth - rightVisibleWidth;
                    wConfig.rightColumnWrapper.css({
                        'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? rightVisibleWidth : (wConfig.gridBodyWrapperWidth / 2))
                    });

                    wConfig.leftColumnWrapper.css({
                        'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? (leftVisibleWidth <= tempWidth ? leftVisibleWidth : tempWidth) : (wConfig.gridBodyWrapperWidth / 2)) - wConfig.separatorWidth
                    });
                }
            }
            if(!_this.config.columnSeparator.showSeparator) {
                _this.config.columnSeparator.showSeparator = true;
                _this.utils.setSeparator(true);
                wConfig.separatorWidth = wConfig.gridBodyWrapper.find('.separator').outerWidth();
            }
            
            if(leftVisibleWidth + rightVisibleWidth < wConfig.gridOuterWrapperWidth) {
                var totalAdjustableWidth = wConfig.gridOuterWrapperWidth - (leftVisibleWidth + rightVisibleWidth) - wConfig.separatorWidth;
                this.dynamicWidth(true, totalAdjustableWidth);
                leftVisibleWidth = _this.utils.getTotalColumnWidth('left');
                rightVisibleWidth = _this.utils.getTotalColumnWidth('right');
                wConfig.leftColumnWrapper.css({
                    'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? (leftVisibleWidth <= (wConfig.gridBodyWrapperWidth - rightVisibleWidth) ? leftVisibleWidth : (wConfig.gridBodyWrapperWidth - rightVisibleWidth)) : (wConfig.gridBodyWrapperWidth / 2)) - wConfig.separatorWidth
                });
                wConfig.leftScrollableWrapper.css({
                    'width': leftVisibleWidth
                });
                wConfig.rightColumnWrapper.css({
                    'width': ((rightVisibleWidth < (wConfig.gridBodyWrapperWidth / 2)) ? rightVisibleWidth : (wConfig.gridBodyWrapperWidth / 2))
                });
                wConfig.rightScrollableWrapper.css({
                    'width': rightVisibleWidth
                });
                // this.widthModerator(true);
            }            
        }
        else {
            if(leftVisibleWidth > 0 && rightVisibleWidth === 0) {
                var totalAdjustableWidth = leftVisibleWidth < wConfig.gridOuterWrapperWidth ? wConfig.gridOuterWrapperWidth - leftVisibleWidth : 0;
                this.dynamicWidth(true, totalAdjustableWidth - wConfig.separatorWidth);
                wConfig.leftColumnWrapper.css({
                    'width': wConfig.gridOuterWrapperWidth
                });
                wConfig.leftScrollableWrapper.css({
                    'width': leftVisibleWidth >= wConfig.gridOuterWrapperWidth ? leftVisibleWidth : leftVisibleWidth + totalAdjustableWidth
                });
            }
            else if(rightVisibleWidth > 0 && leftVisibleWidth === 0) {
                wConfig.rightColumnWrapper.css({
                    'width': wConfig.gridOuterWrapperWidth
                });
                wConfig.rightScrollableWrapper.css({
                    'width': rightVisibleWidth
                });
            }

            if(_this.config.columnSeparator.showSeparator) {
                wConfig.separatorWrapper.addClass('hide');
                _this.config.columnSeparator.showSeparator = false;
            }
        }

        if(_this.config.allwaysScroll.isAlways) {
            _this.utils.common.scrollAlwaysFix(_this.config.allwaysScroll.diff);
        }
    };
    grid.utils.common.dynamicWidth = function(flag, _totalAdjustableWidth, reset) {
        var _this = this.__,
            wConfig = _this.utils.getGridWidthConfig(),
            adjustableWidth,
            totalAdjustableWidth = _totalAdjustableWidth ? _totalAdjustableWidth :  Math.abs(wConfig.gridOuterWrapperWidth - _this.config.resizeConfig.gridOuterWrapperWidth),
            avgWidth = parseFloat(totalAdjustableWidth / (_this.utils.getVisibleColumns(true).length + _this.utils.getVisibleColumns(false).length));
            
        maven(_this.config.headerArr , flag, avgWidth, reset);

        function adjustSubGroups(width, obj, flag, index, reset) {
            var _adjustableWidth, cumulativeWidth = obj.width,
                subGroups = obj['subGroups'];
            cumulativeWidth = maven(_this.utils.dm.objectToarray(subGroups), flag, parseFloat(width / ((_this.utils.getVisibleSubColumns(obj.key, 'subGroups').length + (obj.showParentColumn ? 1 : 0)) || 1)), reset, true);
            return cumulativeWidth;
        }
        function maven(objArr, _flag, avgWidth, reset, isSubGroups) {
            var cumulativeWidth = 0,
                isParent = false,
                _avgWidth = 0;
            _this.utils.common.iterator(objArr  , function(obj, index) {
                if(!obj.isHidden) {
                    obj.width = parseFloat(obj.width);
                    isParent = obj.hasOwnProperty('subGroups');
                    if(!obj.hasOwnProperty('_width')) {
                        obj['_width'] = obj.width;
                    }
                    if(isParent) {
                        adjustableWidth = adjustSubGroups(avgWidth, obj, flag, index, reset);
                    }
                    _avgWidth = (isParent && obj.showParentColumn) ? parseFloat(avgWidth / (_this.utils.getVisibleSubColumns(obj.key, 'subGroups').length + 1)) : avgWidth;
                    if(_flag) {
                        adjustableWidth = (isParent  ? adjustableWidth : 0) +  (isParent && !obj.showParentColumn ? 0 : (!reset ? (_avgWidth + obj.width) : (obj._width || obj.width)));
                        if(!isSubGroups && (!obj.isHidden && _this.config.fixedColumns > 0 && index < _this.config.fixedColumns)) {
                            wConfig.leftScrollableWrapper.find((isParent ? '.grid-subGroups.' : '>.') + obj.key).css('width', adjustableWidth);
                        }
                        else if(!isSubGroups) {
                            wConfig.rightScrollableWrapper.find((isParent ? '.grid-subGroups.' : '>.') + obj.key).css('width', adjustableWidth);
                        }
                    }
                    else {
                        adjustableWidth = (isParent ? adjustableWidth : 0) +  (isParent && !obj.showParentColumn ? 0 : (!reset ? ((obj._width && obj._width <= obj.width - _avgWidth - 5) ? (obj.width - _avgWidth) : obj._width) : (obj._width || obj.width)));
                        if(!isSubGroups && (!obj.isHidden && _this.config.fixedColumns > 0 && index < _this.config.fixedColumns)) {
                            wConfig.leftScrollableWrapper.find((isParent ? '.grid-subGroups.' : '>.') + obj.key).css('width', adjustableWidth);
                        }
                        else if(!isSubGroups) {
                            wConfig.rightScrollableWrapper.find((isParent ? '.grid-subGroups.' : '>.') + obj.key).css('width', adjustableWidth);
                        }
                    }

                    
                    if((!isSubGroups && obj.showParentColumn) || (isSubGroups && !isParent)) {
                        // avgWidth = (isParent && obj.showParentColumn) ? parseInt(avgWidth / Object.keys(obj.subGroups).length + 1) : avgWidth;
                        var _parentKey = (isParent && obj.showParentColumn) ? obj.key : _this.utils.getParentKey (obj.key, 'subGroups');
                            adjustableWidth = reset ? (obj._width || obj.width) : (_flag ? (_avgWidth + obj.width) : ((obj._width && obj._width <= obj.width - _avgWidth ) ? (obj.width - _avgWidth) : obj._width) );
                        wConfig.gridOuterWrapper.find('.grid-subGroups.' + _parentKey + ' .subGroups-wrapper > .' + obj.key).css('width', adjustableWidth);
                        obj.width = adjustableWidth;
                    }
                    

                    obj.width = (isParent && obj.hasOwnProperty('showParentColumn') && !obj.showParentColumn) ? 0 : adjustableWidth;
                    cumulativeWidth += adjustableWidth;
                }
            }, true);
            return cumulativeWidth;
        }
    };
    grid.utils.common.resetColumnWidth = function(_config) {
        var _this = this.__;
        this.iterator(Object.keys(_config), function(key, index){            
            _config[key].width = typeof _config[key]._width !== 'undefined' ? _config[key]._width : _config[key].title.length + (_this.config.columnPadding * 2);
            if(_config[key].hasOwnProperty('subGroups')) {
                _this.utils.common.resetColumnWidth(_config[key].subGroups);
            }
        });
    };
    grid.utils.common.findSmallestColumn = function() {
        var width = 0,
            returnObj = {},
            _this = this.__;
        this.iterator(Object.keys(_this.config.headerConfig), function(key, i){
            if(width > _this.config.headerConfig[key].width && !_this.config.headerConfig[key].isHidden) {
                width = _this.config.headerConfig[key].width;
                returnObj['key'] = key;
                returnObj['width'] = width;
                returnObj['columnConfig'] = _this.config.headerConfig[key];
            }
            else if(width == 0) {
                width = _this.config.headerConfig[key].width;
            }
        });
        return $.extend({}, returnObj);
    };
    grid.utils.common.overrideResize = function() {
        
        var _this = this.__,
           	wConfig = _this.utils.getGridWidthConfig(),
	        leftVisibleWidth = 0,
	        rightVisibleWidth = 0;
        this.resetColumnWidth(_this.config.headerConfig);
        leftVisibleWidth = _this.utils.getTotalColumnWidth('left'),
        rightVisibleWidth = _this.utils.getTotalColumnWidth('right');
       this.dynamicWidth((leftVisibleWidth + rightVisibleWidth < wConfig.gridOuterWrapperWidth), Math.abs(parseInt(leftVisibleWidth + rightVisibleWidth) - wConfig.gridOuterWrapperWidth - wConfig.separatorWidth), false); // totalAdjustableWidth
       this.widthModerator(true);
    };    
})(dGrid());