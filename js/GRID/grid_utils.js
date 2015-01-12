(function (__) {

    var grid = __;
    grid.utils = grid.utils || {};
    grid.utils.__ = __

    /*
     *  validate on configuration settings in order to avoid unreliable outcome
    */
    grid.utils.gridValidate = function () {
        var _this = this.__,
            eMsg, flag = 0,
            configArrLength = _this.config['lengthValidate'].Validate.length,
            len = _this.utils.dm.getDataLength();

        function errorMsg(eMsg, errEle) {
            if (eMsg == 'LenError')
                console.log('Length Error' + ' : ' + errEle);
            else if (eMsg == 'booleanError')
                console.log('Boolean Value Error' + ' : ' + errEle);
            else if (eMsg == 'ObjectErr')
                console.log('Object is empty' + ' : ' + errEle);
            else if (eMsg == 'ProxyURL')
                console.log('Proxy URL is not set' + ' : ' + errEle);
        }
        for (var i = 0; i < configArrLength; i++) {
            if (_this.config[_this.config['lengthValidate'].Validate[i]] > 0)
                flag = 1;
            else
                errorMsg('LenError', _this.config['lengthValidate'].Validate[i]);
        }
        for (var key in _this.config) {

            switch (key) {
                case 'columnDelete':
                    if (_this.config['columnDelete']['canColumnDelete'] == true) {
                        if (_this.config['clazz']['columnDelete'] == 'delColumn')
                            flag = 1;
                        else
                            errorMsg('booleanError', key);
                    }
                    break;
                case 'headerArr':
                    if (_this.config['headerArr'].length > 0)
                        flag = 1;
                    else
                        errorMsg('Header Array is null');
                    break;
                case 'showHeaderOnLoad':
                    if (_this.config['showHeaderOnLoad'] == true) {
                        if (_this.config.headerConfig != null || _this.config.headerConfig.key > 0)
                            flag = 1;
                        else
                            errorMsg('ObjectErr', key);
                    }
                    break;
                case 'canHandelDataLoad':
                    if (_this.config['canHandelDataLoad'] == true) {
                        if (_this.config.proxy.url == null) {
                            errorMsg('ProxyURL', key);
                            return false;
                        } else if (_this.config.proxy.param == null) {
                            _this.config.proxy.param = '';
                        } else if (_this.config.proxy.isAsync != true) {
                            _this.config.proxy.isAsync = true;
                        } else if (_this.config.proxy.dataType == '') {
                            _this.config.proxy.dataType = 'application/json';
                        }
                    }
                case 'rowHeight_Body':
                    // if (this.config.minHeight >= this.config.rowHeight_Body * len && len != 0) {
                    //     this.config.gridBodyWrapper.css('height', (this.config.rowHeight_Body * len));
                    // }
                    if(_this.config.minHeight >= _this.config.rowHeight_Body * (len < _this.config.lazyLoad.numberOfRowsViewable ? len : _this.config.lazyLoad.numberOfRowsViewable) && len !== 0) {
                        _this.config.gridBodyWrapper.css('height', _this.config.rowHeight_Body * len);
                    }
                    else if(len === 0) {
                        _this.config.gridBodyWrapper.css('height', _this.config.rowHeight_Body);
                    }
                    else {
                        _this.config.gridBodyWrapper.css('height',  _this.config.minHeight);
                    }
                    // else if (len == 0) {
                    //     this.config.gridBodyWrapper.css('height', 50 + 'px'); // To Be checked in AfterLoad //ToDO
                    // }
            }
        }
    };

    grid.utils.genrateFooter = function () {
        var _this = this.__;
        _this.config.columnsCount = 0;
        if (_this.config.footer.showFooter && _this.utils.dm.getDataLength() > 0) {
            // extract data from response
            if (_this.config.dataExtractor.extractData) {
                _this.config.JSONData = $.extend(_this.config.JSONData, _this.utils.dm.dataExtractor(_this.config.JSONData.total, 'footer'));
                _this.config.JSONData.total = _this.config.JSONData.total.length && _this.config.JSONData.total.length > 0 ? _this.config.JSONData.total[0] : _this.config.JSONData.total;
            }

            if (Object.keys(_this.config.JSONData.total).length > 0) {
                _this.config.gridFooterWrapper.removeClass('hide');
                $('.grid-footer .scrollable').empty();
                _this.utils.common.iterator(_this.config.headerArr, function(obj, i) {                    
                    _this.core.dispatcher(obj.key, i, obj.hasOwnProperty('subGroups'), obj.hasOwnProperty('subGroups') ? obj.key : false, 'footer');
                }, true);
                if (_this.config.initalDataLoad) {
                    _this.events.bindEvents();
                }
                    
                _this.config.gridWrapper.find('.scrollableWrapper').off('scroll', _this.events.horizontalScrollHandler);
                _this.config.gridWrapper.find('.scrollableWrapper').on('scroll', {
                    _this: _this
                }, _this.events.horizontalScrollHandler);

                this.setSeparator(true);
                _this.utils.common.widthModerator(true);
            }
        }
        else if(_this.config.footer.showFooter) {
            if (_this.config.dataExtractor.extractData) {
                _this.config.JSONData = $.extend(_this.config.JSONData, _this.utils.dm.dataExtractor(_this.config.JSONData.total, 'footer'));
                _this.config.JSONData.total = _this.config.JSONData.total.length && _this.config.JSONData.total.length > 0 ? _this.config.JSONData.total[0] : _this.config.JSONData.total;
            }
        }
    };


    grid.utils.getParentKey = function (hash, metrics) {
        var _this = this.__,
            flag = false,
            keyToReturn;
        _this.utils.common.iterator(Object.keys(_this.config.headerConfig), function(key, index) {
            if (_this.config.headerConfig[key].hasOwnProperty(metrics)) {
                if (_this.config.headerConfig[key][metrics].hasOwnProperty(hash)) {
                    flag = true;
                    keyToReturn = key;
                    return false
                }
            }
        }, false);
        return flag ? keyToReturn : false
    };

    grid.utils.setSeparator = function (update) {
        var _this = this.__,
            separatorWrapper = _this.config.gridWrapper.find('.separator'),
            canAdjustWidth = separatorWrapper.length <= 0,
            separatorWidth = 0;
        if (_this.config.fixedColumns > 0) {
            if ((canAdjustWidth || update) && _this.config.columnSeparator.showSeparator) {
                var _separator = $(document.createElement('div')).addClass('separator').css({
                    'width': _this.config.columnSeparator.separatorWidth
                });
                separatorWrapper.remove();
                $(_separator).insertAfter(_this.config.leftColumnWrapper);
                separatorWidth = _separator.outerWidth();
            }
            _this.utils.common.iterator(_this.config.gridWrapper.find('.separator'), this.setSeparatorHeight, false);
            if (canAdjustWidth) {
                _this.config.leftColumnWrapper.css({
                    'width': _this.config.leftColumnWrapper.outerWidth() - separatorWidth 
                });
            }
        }
    };

    grid.utils.setSeparatorHeight = function (ele, index, _this) {
        if ($(ele).parent().hasClass('grid-header')) {
            $(ele).css({
                'height': _this.config.rowHeight_Header
            });
        } else if ($(ele).parent().hasClass('grid-body')) {
            if (_this.utils.dm.getDataLength()) {
                $(ele).css({
                    'height': _this.config.gridBodyWrapper.find('.rightColumns-wrapper').outerHeight() - 4
                });
            }
        } else if ($(ele).parent().hasClass('grid-footer')) {
            $(ele).css({
                'height': _this.config.rowHeight_Body
            });
        }
    };

    grid.utils.getTotalColumnWidth = function (side, calMinWidth) {
        var total = 0,
            _this = this.__;
        if (side == 'left') {
            _this.utils.common.iterator(_this.config.headerArr, function(obj, i) {
                if (i < _this.config.fixedColumns && !obj.isHidden) {
                    total += parseFloat(calMinWidth ? (obj._width || obj.width) : obj.width);
                    if (obj.hasOwnProperty('subGroups')) {
                        var metrics = 'subGroups';
                        addSubColumns(obj[metrics], obj.key, metrics);
                    }
                }
            });
        } else if (side == 'right') {
            _this.utils.common.iterator(_this.config.headerArr, function(obj, i) {
                if (i >= _this.config.fixedColumns && !obj.isHidden) {
                    total += parseFloat(calMinWidth ? (obj._width || obj.width) : obj.width);
                    if (obj.hasOwnProperty('subGroups')) {
                        var metrics = 'subGroups';
                        addSubColumns(obj[metrics], obj.key, metrics);
                    }
                }
            });
        }

        function addSubColumns(subColumns, parentKey, metrics) {
            _this.utils.common.iterator(Object.keys(subColumns), function(key, i) {
                if (!_this.config.headerConfig[parentKey][metrics][key].isHidden) {
                    total += parseFloat(calMinWidth ? (_this.config.headerConfig[parentKey][metrics][key]._width || _this.config.headerConfig[parentKey][metrics][key].width ) : _this.config.headerConfig[parentKey][metrics][key].width);
                }
            })
        }

        return total;
    };

    grid.utils.hideColumns = function (columns, config) {
        var _this = this.__,
        	_config = config ? config : _this.config.headerConfig;    	
        if (columns.length > 0) {
            _this.utils.common.iterator(columns, function(key, index) {
                if (_this.config.minVisibleColumns < _this.utils.getVisibleColumns(config[key].index < _this.config.fixedColumns).length) {
                    if(_config[key].isHidden) {
                    	_this.utils.hide(key);
                    	_this.config.headerConfig[key].isHidden = _config[key].isHidden;
                    }
                    if(_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
                    	_this.utils.manageSubColumnsVisibility(key, _config);
                    }
                }
                var _width = _this.utils.getColumnWidth(key);
                // _this.config.headerConfig[key].width = _width.parentWidth + _width.childWidth;
                // if(_config[key].width !== _this.config.headerConfig[key].width) {
                // _this.config.headerConfig[key].width = _config[key].width;
                _this.config.gridOuterWrapper.find('.grid-subGroups.' + key).css({ "width": _width.parentWidth + _width.childWidth});
                // _this.config.gridHeaderWrapper.find('.' + key + '.grid-subGroups.grid-header').css({"min-width": _config[key].width, "width": _config[key].width});
                // _this.config.gridBodyWrapper.find('.' + key + '.grid-subGroups.grid-column').css({"min-width": _config[key].width, "width": _config[key].width});
                // _this.config.gridFooterWrapper.find('.' + key + '.grid-subGroups.grid-footer').css({"min-width": _config[key].width, "width": _config[key].width});
                // }
            }, true);
            // _this.utils.common.widthModerator(true);
        }
    };
    
    grid.utils.hide = function(_key) {
    	var _this = this.__;
        _this.config.gridHeaderWrapper.find('.' + _key + '.grid-header').addClass('hide');
        _this.config.gridBodyWrapper.find('.' + _key + '.grid-column').addClass('hide');
        _this.config.gridFooterWrapper.find('.' + _key + '.grid-footer').addClass('hide');
    }

    grid.utils.showColumns = function (columns, config) {
        var _this = this.__,
        	_config = config ? config : _this.config.headerConfig;    	
        if (columns.length > 0) {
            _this.utils.common.iterator(columns, function(key, index) {
                //var header = _this.config.gridHeaderWrapper.find('.' + key + '.grid-header');
            	if(!_config[key].isHidden) {
            		_this.utils.show(key);
                	_this.config.headerConfig[key].isHidden = _config[key].isHidden;
            	}
                if(_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
                	_this.utils.manageSubColumnsVisibility(key, _config);
                }
                var _width = _this.utils.getColumnWidth(key);
                // _this.config.headerConfig[key].width = _width.parentWidth + _width.childWidth;
                // if(_config[key].width !== _this.config.headerConfig[key].width) {
                // _this.config.headerConfig[key].width = _config[key].width;
                _this.config.gridOuterWrapper.find('.grid-subGroups.' + key).css({ "width": _width.parentWidth + _width.childWidth});
                // _this.config.gridHeaderWrapper.find('.' + key + '.grid-subGroups.grid-header').css({"min-width": _config[key].width, "width": _config[key].width});
                // _this.config.gridBodyWrapper.find('.' + key + '.grid-subGroups.grid-column').css({"min-width": _config[key].width, "width": _config[key].width});
                // _this.config.gridFooterWrapper.find('.' + key + '.grid-subGroups.grid-footer').css({"min-width": _config[key].width, "width": _config[key].width});
                // }
            }, true);
            // _this.utils.common.widthModerator(true);
        }
    };

    grid.utils.show = function(_key) {   
    	var _this = this.__;
        _this.config.gridHeaderWrapper.find('.' + _key + '.grid-header').removeClass('hide');
        _this.config.gridBodyWrapper.find('.' + _key + '.grid-column').removeClass('hide');
        _this.config.gridFooterWrapper.find('.' + _key + '.grid-footer').removeClass('hide');
    }
    
    grid.utils.manageSubColumnsVisibility = function(key, _config) {
    	if (key) {
    		var _this = this.__, isHidden,
    			isCollapsed = true;
            if(_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
            	// _config[key].width = (_this.config.headerConfig[key].actualWidth || _this.config.headerConfig[key].width);
                _this.utils.common.iterator(Object.keys(_this.config.headerConfig[key].subGroups), function(_subkey, i) {
                	if(_config[key].subGroups[_subkey]) {
	                	isHidden = _config[key].isHidden || _config[key].subGroups[_subkey].isHidden;
	                	if(_this.config.headerConfig[key].subGroups[_subkey].isHidden != isHidden) {
		                	if(isHidden) {
		                		_this.utils.hide(_subkey);
		                		// _config[key].width -= _this.config.headerConfig[key].subGroups[_subkey].width; 
		                	}
		                	else {
		                		_this.utils.show(_subkey);
		                		// _config[key].width += _this.config.headerConfig[key].subGroups[_subkey].width;
		                	}
		                    _this.config.headerConfig[key].subGroups[_subkey].isHidden = isHidden;
	                	}
                	}
                	
                	isCollapsed = (isCollapsed && _this.config.headerConfig[key].subGroups[_subkey].isHidden);
                });
                
                if(_this.config.headerConfig[key].showParentColumn) {
                	_this.config.gridHeaderWrapper.find('.grid-subGroups .' + key + '.grid-header .grid-cellDirective .exBtn').removeClass(isCollapsed? 'collapseBtn collapse-subGroups':'expandBtn expand-subGroups').addClass(isCollapsed? 'expandBtn expand-subGroups':'collapseBtn collapse-subGroups');
                } else if(isCollapsed) {
                	_this.utils.hide(key);
                	_this.config.headerConfig[key].isHidden = true;
                }               
            }    		
    	}       
    };
    
    grid.utils.getColumnWidth = function (key) {
        var _this = this.__,
            cummulativeWidth = 0,
            parentWidth = _this.config.headerConfig[key].width;
        if(_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
            _this.utils.common.iterator(Object.keys(_this.config.headerConfig[key].subGroups), function(k, i) {
                if(!_this.config.headerConfig[key].subGroups[k].isHidden) {
                    cummulativeWidth += parseFloat(_this.config.headerConfig[key].subGroups[k].width);
                }
                parentWidth = _this.config.headerConfig[key].showParentColumn ? parentWidth : 0;
            });
        }
        return {'parentWidth' : parentWidth, 'childWidth' : cummulativeWidth};
    };  

    grid.utils.toggleLoader = function (flag) {
        var _this = this.__;
       _this.config.gridWrapper.find('.grid-wrapper').css({
            'visibility': 'visible'
        });
        
        _this.config.gridWrapper.find('.loaderWrapper').remove();
        if (flag) {
            var loaderWrapper = $(document.createElement('div')).addClass('loaderWrapper'),
                loader = $(document.createElement('div')).addClass(_this.config.clazz.loader).addClass('loaderBg'),
                loaderHeight = (_this.config.gridWrapper.outerHeight()) ? _this.config.gridWrapper.outerHeight() : "80px";

            _this.config.loaderWrapper = loaderWrapper;
            loaderWrapper.css('height', loaderHeight);
            _this.config.gridWrapper.append(loaderWrapper.append( loader ));
        }
    };

    /* utility function to select / return css selector for sub-group of a particular column*/
    grid.utils.getSubGroupSelector = function (key, is$Obj) {
        var _this = this.__,
            strSelector = '';
        _this.utils.common.iterator(Object.keys(_this.config.headerConfig[key].subGroups), function(d, index) {
            strSelector += '.' + d + '-subGroups, ';
        }, false);
        strSelector = strSelector.substr(0, strSelector.trim().length - 1);
        return is$Obj ? $(strSelector) : strSelector;
    };

    grid.utils.headerConfig = function () {
        var _this = this.__;
        if (arguments.length > 0) {
            if(_this.config.headerConfig && Object.keys(_this.config.headerConfig).length > 0) {
                this.updateHeaderConfig(arguments[0]);
            }
            else {
                _this.config.headerConfig = arguments[0];
            }
        } else {
            return $.extend(true, {}, _this.config.headerConfig);
        }
        _this.config.headerArr = _this.utils.dm.objectToarray(_this.config.headerConfig, false);
    };
    grid.utils.updateHeaderConfig = function(_config) {
        var _this = this.__,
            showColumns = [],
            hideColumns = [],
            isNeedToReorderColumn;
        _this.utils.common.iterator(Object.keys(_this.config.headerConfig), function(key, index){
        	isNeedToReorderColumn = false;
            if((_this.config.headerConfig[key].hasOwnProperty('index') && _config.hasOwnProperty(key) && _config[key].hasOwnProperty('index')) && (_this.config.headerConfig[key].index !== _config[key].index)) {
            	isNeedToReorderColumn = true;
            }
            if((_this.config.headerConfig[key].hasOwnProperty('isHidden') && _config.hasOwnProperty(key) && _config[key].hasOwnProperty('isHidden')) && (_this.config.headerConfig[key].isHidden !== _config[key].isHidden )) {
                if(_config.hasOwnProperty(key) && _config[key].isHidden) {
                    hideColumns.push(key);
                }
                else {
                    showColumns.push(key);
                }
            }

            if(_config[key] && _config[key].hasOwnProperty('subGroups') && _this.config.headerConfig[key].hasOwnProperty('subGroups')) {
                _this.utils.common.iterator(Object.keys(_config[key].subGroups), function(k, i){
                	if(_config[key].subGroups[k].index !== _this.config.headerConfig[key].subGroups[k].index) {
                		isNeedToReorderColumn = true;
                	}
                    if(_config[key].subGroups[k].isHidden !== _this.config.headerConfig[key].subGroups[k].isHidden) {
                        if(_config[key].subGroups[k].isHidden && hideColumns.indexOf(key) < 0) {
                            hideColumns.push(key);
                        }
                        else if(showColumns.indexOf(key) < 0){
                            showColumns.push(key);
                        }
                    }
                });
            }
            
            if(isNeedToReorderColumn) {
            	//To reorder the Grid parent and child column based on the index.
            	_this.utils.moveColumn(_this.config.headerConfig[key], _config[key].index, _this.config.headerConfig[key].index, _config);
            }
        }, false);
        this.showColumns(showColumns, _config);
        this.hideColumns(hideColumns, _config);
        if(showColumns.length > 0 || hideColumns.length > 0) {
            _this.utils.common.overrideResize();
        }
    };
    grid.utils.getVisibleColumns = function (isLeft) {
        var _this = this.__;
        return _this.utils.dm.objectToarray(_this.config.headerConfig).filter(function (d, i) {
            if (!d.isHidden && isLeft && i < _this.config.fixedColumns) {
                return d;
            } else if (!d.isHidden && !isLeft && i >= _this.config.fixedColumns) {
                return d;
            }
        });
    };
    grid.utils.getVisibleSubColumns = function(key, metrics) {
        var _this = this.__;
        if(_this.config.headerConfig[key][metrics]) {
            return _this.utils.dm.objectToarray(_this.config.headerConfig[key][metrics]).filter(function (d, i) {
                if (!d.isHidden) {
                    return d;
                }
            });
        }
        else {
            return false;
        }

    };    
    grid.utils.columnReArrange = function (newVal) {
        var _this = this.__,
            newKeyArr = newVal.map(function (d) {
                return d.key;
            });
        _this.utils.common.iterator(Object.keys(_this.config.headerConfig), function (o, i) {
            if (i !== newKeyArr.indexOf(o.key)) {
                _this.utils.moveColumn(o, newKeyArr.indexOf(o.key), i);
            }
        }, true);
    };
    grid.utils.moveColumn = function (obj, moveTo, currentIndex, _config, parentKey) {
        var _this = this.__,
        	hasChildColumns = obj.hasOwnProperty('subGroups'),
            header = _this.config.gridHeaderWrapper.find('.' + obj.key + '.grid-header' + (hasChildColumns ? ".grid-subGroups" : "")),
            headerEle = $(header),
            body = _this.config.gridBodyWrapper.find('.' + obj.key + '.grid-column' + (hasChildColumns ? ".grid-subGroups" : "")),
            bodyEle = $(body),
            footer = _this.config.gridFooterWrapper.find('.' + obj.key + '.grid-footer' + (hasChildColumns ? ".grid-subGroups" : "")),
            footerEle = $(footer),
            wrapperClass = headerEle.parent(),
            moveToLocation = parentKey ? (moveTo + 1)  : ((_this.config.fixedColumns - 1 < moveTo) ? (moveTo - _this.config.fixedColumns + 1) : (moveTo + 1)),
            adjustableWidth = header.outerWidth();
        
        moveToLocation += ((parentKey && _this.config.headerConfig[parentKey].showParentColumn) ? 1 : 0);
            
		if (moveTo < currentIndex){
			headerEle.insertBefore($(' > .grid-header:nth-child(' + (moveToLocation) + ')', wrapperClass));
			bodyEle.insertBefore($(' > .grid-column:nth-child(' + (moveToLocation) + ')', bodyEle.parent()));
			footerEle.insertBefore($(' > .grid-footer:nth-child(' + (moveToLocation) + ')', footerEle.parent()));
        }
        else if (moveTo > currentIndex){
        	headerEle.insertAfter($(' > .grid-header:nth-child(' + (moveToLocation) + ')', wrapperClass));
        	bodyEle.insertAfter($(' > .grid-column:nth-child(' + (moveToLocation) + ')', bodyEle.parent()));
            footerEle.insertAfter($(' > .grid-footer:nth-child(' + (moveToLocation) + ')', footerEle.parent()));
        }        

        if (obj && obj.hasOwnProperty('subGroups')) {
            _this.utils.common.iterator(Object.keys(obj.subGroups), function(o, i) {
                obj.subGroups[o].key = o;
                if(obj.subGroups[o].index !== _config[obj.key].subGroups[o].index)
                	_this.utils.moveColumn(obj.subGroups[o], _config[obj.key].subGroups[o].index, obj.subGroups[o].index, _config, obj.key); 
            }, true);
        }
        if (header.is('.hide') && !obj.isHidden) {
            header.removeClass('hide');
            body.removeClass('hide');
            footer.removeClass('hide');
        }
        if(moveTo != currentIndex) {
        	_this.utils.updateColumnIndex(wrapperClass, parentKey);
        }
        
        _this.utils.common.widthModerator(false);
    };

    grid.utils.fixHeight = function () {
        var _this = this.__,
            len = _this.utils.dm.getDataLength();
        if (_this.config.minHeight >= _this.config.rowHeight_Body * len && len != 0) {
            _this.config.gridBodyWrapper.css('height', (_this.config.rowHeight_Body * len));
        } else if (len === 0) {
            _this.config.gridBodyWrapper.css('height', 50);
        }
    };

    grid.utils.showNoData = function() {
        var _this = this.__;
        if (!_this.utils.dm.hasData(_this.config.data)) {
            var noDataEle = $(document.createElement('p')).text(_this.config.noDataTxt).addClass('grid-noData');
            _this.config.gridBodyWrapper.find('.grid-noData').remove();
            _this.config.gridFooterWrapper.addClass('hide');
            _this.config.gridBodyWrapper.append(noDataEle);
            _this.config.gridBodyWrapper.css({
                'height': (_this.config.rowHeight_Body)
            });
        } else {
            _this.config.gridBodyWrapper.find('.grid-noData').remove();
            _this.config.validate.height(_this);
        }
    }

    grid.utils.getGridWidthConfig = function() {
        var obj = {},
            _this = this.__;
        obj.separatorWrapper = _this.config.gridOuterWrapper.find('.separator');
        obj.separatorWidth = obj.separatorWrapper.outerWidth();
        obj.leftColumnWrapper = _this.config.leftColumnWrapper;
        obj.leftColumnWrapperWidth = obj.leftColumnWrapper.outerWidth();
        obj.rightColumnWrapper = _this.config.rightColumnWrapper;
        obj.rightColumnWrapperWidth = obj.rightColumnWrapper.outerWidth();
        obj.gridBodyWrapper = _this.config.gridBodyWrapper;
        obj.gridBodyWrapperWidth = obj.gridBodyWrapper.outerWidth();
        obj.gridOuterWrapper = _this.config.gridOuterWrapper;
        obj.gridOuterWrapperWidth = obj.gridOuterWrapper.outerWidth();
        obj.rightScrollableWrapper = obj.rightColumnWrapper.find('.scrollable');
        obj.leftScrollableWrapper = obj.leftColumnWrapper.find('.scrollable');
        obj.rightScrollableWrapperWidth = obj.rightScrollableWrapper.outerWidth();
        obj.leftScrollableWrapperWidth = obj.leftScrollableWrapper.outerWidth();
        return $.extend({}, obj);
    }

    grid.utils.updateColumnIndex = function(domEle, parentKey) {
        var _this = this.__,
            counter = 0,
            parentColumnObj;
        _this.utils.common.iterator($(' > .grid-header', domEle), function(el, index){
            var key = $(el).attr('hashKey');
            parentColumnObj = parentKey ? _this.config.headerConfig[parentKey]['subGroups'] : _this.config.headerConfig;
            if(key && parentColumnObj[key] && key !== parentKey) {
            	parentColumnObj[key].index = (counter + ((!parentKey && parentColumnObj[key].index >= _this.config.fixedColumns) ? _this.config.fixedColumns : 0));
            	++counter;
            }
        }, true);
    }

})(dGrid());