(function (__) {

    var grid = __;
    grid.events = grid.events || {};
    grid.events.__ = __;

    grid.events.bindEvents = function() {
        var _this = this.__;
        _this.config.gridWrapper.off('click', '.expand-subGroups', this.expandSubGroupClick);
        _this.config.gridWrapper.on('click', '.expand-subGroups', {
            _this: this.__
        }, this.expandSubGroupClick);
        _this.config.gridWrapper.find('').off('click', '.collapse-subGroups', this.collapseSubGroupClick);
        _this.config.gridWrapper.on('click', '.collapse-subGroups', {
            _this: this.__
        }, this.collapseSubGroupClick);
        _this.config.gridWrapper.find('.scrollableWrapper').off('scroll', this.horizontalScrollHandler);
        _this.config.gridWrapper.find('.scrollableWrapper').on('scroll', {
            _this: this.__
        }, this.horizontalScrollHandler);
        // bind events to shuffle  columns
        if (_this.config.isDraggable) {
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').off("dragstart", this.gridDragStart);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').on("dragstart", {
                '_this': this.__
            }, this.gridDragStart);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').off("dragover", this.gridDragOver);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').on("dragover", this.gridDragOver);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').off("dragleave", this.gridDragLeave);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').on("dragleave", {
                '_this': this.__
            }, this.gridDragLeave);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').off("drop", this.gridDropHandler);
            _this.config.gridWrapper.find('.grid-header .scrollable .grid-header').on("drop", {
                '_this': this.__
            }, this.gridDropHandler);
        }

        _this.config.gridWrapper.find('.grid-body').off('scroll', this.verticalScrollHandler);
        _this.config.gridWrapper.find('.grid-body').on('scroll', {
            _this: this.__
        }, this.verticalScrollHandler);

        _this.config.gridWrapper.find('.grid-header .grid-cellDirective:not(.subColumns-header-wrapper) span.cellcontent, .grid-header .subGroups-wrapper .grid-cellDirective  span.cellcontent, .grid-header .grid-cellDirective .inlineSort').off('click', this.sortClick);
        _this.config.gridWrapper.find('.grid-header .grid-cellDirective:not(.subColumns-header-wrapper) span.cellcontent, .grid-header .subGroups-wrapper .grid-cellDirective  span.cellcontent, .grid-header .grid-cellDirective .inlineSort').on('click', {
            _this: this.__
        }, this.sortClick);
        _this.config.gridWrapper.find('.delColumn').addClass('hide');
        // bind events to delete columns. 
        if (_this.config.columnDelete.canColumnDelete) {
            _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective, .grid-header .scrollableWrapper .grid-header .grid-subGroups').off('mouseover', this.showColumnDeleteBtn);
            _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective, .grid-header .scrollableWrapper .grid-header .grid-subGroups').on('mouseover', {
                _this: this.__
            }, this.showColumnDeleteBtn);
            _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective, .grid-header .scrollableWrapper .grid-header .grid-subGroups').off('mouseleave', this.hideColumnDeleteBtn);
            _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective, .grid-header .scrollableWrapper .grid-header .grid-subGroups').on('mouseleave', {
                _this: this.__
            }, this.hideColumnDeleteBtn);
            _this.config.gridWrapper.find('.grid-header .delColumn').off('click', this.columnDeleteBtnClick);
            _this.config.gridWrapper.find('.grid-header .delColumn').on('click', {
                _this: this.__
            }, this.columnDeleteBtnClick);
        }

        _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective').off('mouseover', this.showInlineSortIcon);
        _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective').on('mouseover', {
            _this: this.__
        }, this.showInlineSortIcon);

        _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective').off('mouseleave', this.hideInlineSortIcon);
        _this.config.gridWrapper.find('.grid-header .scrollableWrapper .grid-header .grid-cellDirective').on('mouseleave', {
            _this: this.__
        }, this.hideInlineSortIcon);


        // bind events to separator to perfom resize
        if (_this.config.fixedColumns > 0) {
            _this.config.gridWrapper.off('mousedown', '.separator', this.separatorMouseDown);
            _this.config.gridWrapper.on('mousedown', '.separator', {
                _this: this.__
            }, this.separatorMouseDown);

            $('body').off('mouseup', this.separatorMouseUp);
            $('body').on('mouseup', {
                _this: this.__
            }, this.separatorMouseUp);

            _this.config.gridWrapper.find('.grid-innerWrapper').off('mousemove', this.separatorMouseMove);
            _this.config.gridWrapper.find('.grid-innerWrapper').on('mousemove', {
                _this: this.__
            }, this.separatorMouseMove);
        }

        _this.config.gridWrapper.find('.grid-body').off('mouseover', this.rowHighlighter);
        _this.config.gridWrapper.find('.grid-body').on('mouseover', {
            _this: this.__
        }, this.rowHighlighter);

        _this.config.gridWrapper.find('.grid-body').off('click', this.rowSelector);
        _this.config.gridWrapper.find('.grid-body').on('click', {
            _this: this.__
        }, this.rowSelector);

        $(window).off('resize', this.resizeHandler);
        $(window).on('resize', {
            _this: this.__
        }, this.resizeHandler);
    };

    grid.events.expandSubGroupClick = function (e) {
        var key = $(this).attr('hashKey'),
	        newColumnWidth = 0,
	        _this = e.data._this,
	        columnWrapper = _this.config.gridWrapper.find('.grid-subGroups.col' + key),
	        parentColumnConfig = {};
	    parentColumnConfig[key] = $.extend(true, {}, _this.config.headerConfig[key]);
	    $(this).removeClass('expand-subGroups').addClass('collapse-subGroups');
	    //$(this).removeClass('expandBtn').addClass('collapseBtn');
	    $('.subGroups-header' + key).toggle(); // check
	    _this.utils.common.iterator(Object.keys(parentColumnConfig[key].subGroups), function(d, index) {
	        parentColumnConfig[key].subGroups[d].isHidden = false;
	    }, true);
	    
	    _this.utils.showColumns([key], parentColumnConfig);
	    // _this.utils.common.widthModerator(true);
        _this.utils.common.overrideResize();
	    if (_this.config.callBack.subGroupExpandCollapse && typeof _this.config.callBack.subGroupExpandCollapse === 'function') {
	        _this.config.callBack.subGroupExpandCollapse(_this);
	    }
	    return false;
    };
    grid.events.collapseSubGroupClick = function (e) {
        var key = $(this).attr('hashKey'),
	        _this = e.data._this
	        columnWrapper = _this.config.gridWrapper.find('.grid-subGroups.col' + key),
	        adjustableWidth = 0,
	        parentColumnConfig = {};
	    parentColumnConfig[key] = $.extend(true, {}, _this.config.headerConfig[key]);
	    $(this).removeClass('collapse-subGroups').addClass('expand-subGroups');
	    //$(this).removeClass('collapseBtn').addClass('expandBtn');
	    _this.utils.common.iterator(Object.keys(parentColumnConfig[key].subGroups), function(d, index) {
	        parentColumnConfig[key].subGroups[d].isHidden = true;
	    }, true);
	    
	    _this.utils.hideColumns([key], parentColumnConfig);
	    // _this.utils.common.widthModerator(true);
        _this.utils.common.overrideResize();
	    if (_this.config.callBack.subGroupExpandCollapse && typeof _this.config.callBack.subGroupExpandCollapse === 'function') {
	        _this.config.callBack.subGroupExpandCollapse(_this);
	    }
	    return false;
    };
    grid.events.horizontalScrollHandler = function (e) {
        // var parentClassName = $(this).parent().attr('class'),
        //     _this = e.data._this;
        // scrollLeft = this.scrollLeft;
        // $.each(_this.config.gridWrapper.find('.' + $(this).attr('class').split(' ')[0]), function(index, ele) {
        //     if ($(ele).parent().attr('class') != parentClassName) {
        //         ele.scrollLeft = scrollLeft;
        //     }
        // });

        // if(typeof _this.config.callBack.horizontalScrollCallback == 'function') {
        //     _this.config.callBack.horizontalScrollCallback(this, _this);
        // }

        var parentClassName = $(this).parent().attr('class'),
            _this = e.data._this,
            ele = this;
        window.requestAnimationFrame(scroller);

        scroller();

        function scroller() {
            var scrollLeft = ele.scrollLeft;
            $.each(_this.config.gridWrapper.find('.' + $(ele).attr('class').split(' ')[0]), function(index, _ele) {
                if ($(_ele).parent().attr('class') != parentClassName) {
                    _ele.scrollLeft = scrollLeft;
                }
            });
            if(typeof _this.config.callBack.horizontalScrollCallback == 'function') {
                _this.config.callBack.horizontalScrollCallback(ele, _this, e);
            }            
        }
    };
    grid.events.gridDragStart = function (e) {
        var currEl = e.target.tagName === "DIV" ? e.target : $(e.target).parents('div'),
            //gridElIndex = $('.grid-header .scrollable .grid-header').index(currEl),
                //oldIndex = gridElIndex,
        //clonecurrEl = (currEl.attr ? currEl.attr('hashkey') : currEl.getAttribute('hashkey'));
                //clonecurrEl = $('.grid-cellDirective', currEl).attr('hashkey'),
            gridDraggedElem;
        if (e.target.tagName) {
            //e.data._this.
            gridDraggedElem = currEl;
        } else {
            return false;
        }
    };

    grid.events.gridDragOver = function (e) {
        e.preventDefault();
        var dragOverEle = e.target.tagName === "DIV" ? e.target : $(e.target).parents('div');
        $(dragOverEle).addClass('column-glow');
        return false;
    };

    grid.events.gridDragLeave = function () {
        $(".column-glow").removeClass("column-glow");
    };

    grid.events.gridDropHandler = function (e) {
        var targetEle = e.target.tagName === "DIV" ? e.target : $(e.target).parents('div.grid-cellDirective'),
            hashKey = (targetEle.attr ? targetEle.attr('hashkey') : targetEle.getAttribute('hashkey')),
            gridDraggedElem = this.__.gridDraggedElem,
            newIndex = e.data._this.config.headerArr.filter(function (d, i) {
                if (d.key == hashKey) {
                    d.index = i;
                    return d;
                }
            }),
            _this = e.data._this;
        newIndex = newIndex[0] ? newIndex[0].index : -1;

        if (newIndex != -1 && $(targetEle).parent().index() !== $(gridDraggedElem).parent().index()) {

            _this.utils.moveColumn(clonecurrEl, newIndex, oldIndex);
        }
        $(".column-glow").removeClass("column-glow");
        e.stopPropagation();
    };

    grid.events.verticalScrollHandler = function (e) {
        var scrollTop = $(this).scrollTop(),
            scrollLeft = $(this).scrollLeft(),
            _this = e.data._this,
            containerHeight = containerHeight = typeof($(this).find('.scrollableWrapper')[0]) != 'undefined' ? $(this).find('.scrollableWrapper')[0].offsetHeight : $(this).find('.scrollableWrapper')[1].offsetHeight,
            scrollDiff = Math.abs(containerHeight - scrollTop);
        _this.dm.updateGrid(_this, scrollTop, (scrollTop + $(this).height()) / containerHeight * 100 >= 99);
        _this.config.gridBodyWrapper.attr('prevTopPos', scrollTop);
    };
    grid.events.separatorMouseDown = function (e) {
        e.data._this.config.resize = e.pageX;
    };
    grid.events.separatorMouseUp = function (e) {
        e.data._this.config.resize = false;
    };
    grid.events.separatorMouseMove = function (e) {
        var _this = e.data._this,
            currentWidth = _this.config.leftColumnWrapper[0].offsetWidth;
        if (_this.config.resize) {
            if (_this.config.resize > e.pageX) {
                var adjustableWidth = currentWidth - Math.abs(_this.config.resize - e.pageX),
                    rightColumnsWidth = _this.config.rightColumnWrapper[0].offsetWidth + Math.abs(_this.config.resize - e.pageX);
                if (adjustableWidth >= _this.config.leftColumnsMinWidth && rightColumnsWidth <= _this.utils.getTotalColumnWidth('right') && adjustableWidth + rightColumnsWidth <= _this.config.rightColumnWrapper[0].offsetWidth + _this.config.leftColumnWrapper[0].offsetWidth) {
                    _this.config.leftColumnWrapper.css({
                        // 'max-width': adjustableWidth,
                        'width': adjustableWidth
                    });
                    _this.config.rightColumnWrapper.css({
                        // 'max-width': rightColumnsWidth,
                        'width': rightColumnsWidth
                    })
                }
            } else if (_this.config.resize < e.pageX) {
                var adjustableWidth = currentWidth + Math.abs(_this.config.resize - e.pageX),
                    rightColumnsWidth = _this.config.rightColumnWrapper[0].offsetWidth - Math.abs(_this.config.resize - e.pageX);
                if (rightColumnsWidth > _this.config.rightColumnMinWidth && adjustableWidth <= _this.utils.getTotalColumnWidth('left')) {
                    _this.config.leftColumnWrapper.css({
                        // 'max-width': adjustableWidth,
                        'width': adjustableWidth
                    });
                    _this.config.rightColumnWrapper.css({
                        // 'max-width': rightColumnsWidth,
                        'width': rightColumnsWidth
                    })
                }
            }
            _this.config.resize = e.pageX;
        }
    };
    grid.events.sortClick = function (e) {
        var _this = e.data._this,
            $this = $(this),
            isSubColumn = $this.hasClass('subColumns-headerTxt'),
            ascClass = _this.config.clazz.hasOwnProperty('sortAscending') && _this.config.clazz.sortAscending.length > 0 ? _this.config.clazz.sortAscending : 'n/a', // n/a is added in order to avoid the check for removing class
            descClass = _this.config.clazz.hasOwnProperty('sortDescending') && _this.config.clazz.sortDescending.length > 0 ? _this.config.clazz.sortDescending : 'n/a'; // n/a is added in order to avoid the check for removing class
        _this.config.sorting.isSorted = true;
        _this.config.sorting.sortKey = $this.parents('.grid-cellDirective').attr('hashkey');
        _this.config.sorting.subGroupsParentHashKey = _this.utils.getParentKey(_this.config.sorting.sortKey, 'subGroups');
        //_this.config.sorting.subColumnsParentHashKey = _this.utils.getParentKey(_this.config.sorting.sortKey, 'subColumns');
        _this.config.sorting.isAsc = $this.attr('sort') == 'ASC' || false;
        _this.config.sortCellType = _this.config.sorting.subGroupsParentHashKey ? _this.config.headerConfig[_this.config.sorting.subGroupsParentHashKey].subGroups[_this.config.sorting.sortKey].dataType : _this.config.headerConfig[_this.config.sorting.sortKey].dataType;
        if (_this.config.subTotal.showSubTotal) {
            var sortedArray = [],
                tempArr = [];
            _this.utils.common.iterator(_this.config.subTotal.subTotalIndex, function(d, i) {
                if (d < _this.config.JSONData.rows.length - 1) {
                    tempArr = _this.config.JSONData.rows.slice((d > 0 ? d + 1 : d), (_this.config.subTotal.subTotalIndex[i + 1] ? _this.config.subTotal.subTotalIndex[i + 1] : _this.config.JSONData.rows.length));
                    tempArr.sort(_this.utils.dm.sortCallBack(_this.config.sortCellType, _this.config.sorting.sortKey, _this.config.sorting.isAsc));
                    tempArr.push(_this.config.JSONData.rows[(_this.config.subTotal.subTotalIndex[i + 1] ? _this.config.subTotal.subTotalIndex[i + 1] : _this.config.JSONData.rows.length - 1)]);
                    _this.utils.dm.concatArray(tempArr, sortedArray);
                }
            }, true);
            _this.config.JSONData.rows = sortedArray;
        } else {
            _this.config.JSONData.rows.sort(_this.utils.dm.sortCallBack(_this.config.sortCellType, _this.config.sorting.sortKey, _this.config.sorting.isAsc));
        }
        _this.dm.resetData();
        _this.dm.resetGrid();
        _this.config.gridHeaderWrapper.find(".grid-cellDirective span.inlineSort").removeClass('arrow-down arrow-up');
        $(this).siblings('.inlineSort').removeClass('sortIndicator animated fadeIn');
        $(this).removeClass('sortIndicator animated fadeIn');
        if($(this.parentElement).hasClass('subGroups')) {
        	 if (_this.config.sorting.isAsc) {
                 $(".inlineSort", this).removeClass("arrow-down").addClass("arrow-up");
                 $(".inlineSort", this).show();
             } else {
                 $(".inlineSort", this).removeClass("arrow-up").addClass("arrow-down");
                 $(".inlineSort", this).show();
             }
        }
        else {
	        if (_this.config.sorting.isAsc) {
	            $(".inlineSort", this.parentNode).removeClass("arrow-down").addClass("arrow-up");
	            $(".inlineSort", this.parentNode).show();
	        } else {
	            $(".inlineSort", this.parentNode).removeClass("arrow-up").addClass("arrow-down");
	            $(".inlineSort", this.parentNode).show();
	        }
        }
        $this.attr('sort', !_this.config.sorting.isAsc ? 'ASC' : 'DES');
        if (ascClass.length > 0) {
            _this.config.gridWrapper.find('.' + ascClass).removeClass(ascClass);
        } else if (descClass.length > 0) {
            _this.config.gridWrapper.find('.' + descClass).removeClass(descClass);
        }
        if (ascClass.length > 0 || descClass.length > 0) {
            $this.parents('.grid-header').addClass(_this.config.sorting.isAsc ? ascClass : descClass);
        }

        if(typeof _this.config.sorting.sortCallBack == 'function') {
                _this.config.sorting.sortCallBack($this, _this, e);
            }  

        return false;
    };
    grid.events.rowHighlighter = function (e) {
        var _this = e.data._this,
            currentRowIndex = e.target.hasAttribute('rowIndex') ? parseInt(e.target.getAttribute('rowIndex')) : (e.target.parentNode.hasAttribute('rowIndex') ? parseInt(e.target.parentNode.getAttribute('rowIndex')) : (e.target.parentNode.parentNode.hasAttribute('rowIndex') ? parseInt(e.target.parentNode.parentNode.getAttribute('rowIndex')) : 0 ) ),
            rowHighlighterCallback;
        if (!isNaN(currentRowIndex) && _this.utils.dm.getDataLength() > 0) {
            _this.config.currentRowIndex = currentRowIndex;
            _this.config.gridBodyWrapper.find('.rowHighlighter').removeClass('rowHighlighter');
            _this.utils.common.iterator(_this.utils.dm.objectToarray(_this.config.headerConfig), rowHighlighterCallback = function(obj) {
                var key = obj.key;
                _this.config.cache[key][currentRowIndex].className += ' rowHighlighter';
                if (obj.hasOwnProperty('subGroups')) {
                    _this.utils.common.iterator(_this.utils.dm.objectToarray(obj.subGroups), rowHighlighterCallback, false);
                }
            }, false);
        }
    };
    grid.events.rowSelector = function (e) {
        var _this = e.data._this,
            rowSelectorCallback;
        _this.config.gridBodyWrapper.find('.rowSelected').removeClass('rowSelected');
        if(typeof(_this.config.currentRowIndex) != "undefined" && _this.config.currentRowIndex >= 0) {
            _this.utils.common.iterator(_this.utils.dm.objectToarray(_this.config.headerConfig), rowSelectorCallback = function(obj) {
                //var key = obj;
                if(_this.config.currentRowIndex >= 0){
                	_this.config.cache[obj.key][_this.config.currentRowIndex].className += ' rowSelected';
                }	
                
                if (_this.config.headerConfig[obj.key] && _this.config.headerConfig[obj.key].subGroups) {
                    _this.utils.common.iterator(_this.utils.dm.objectToarray(obj.subGroups), rowSelectorCallback, false);
                }
            }, false);
        }
    };
    grid.events.showColumnDeleteBtn = function (e) {
        var _this = e.data._this,
            $this = $(this);

        _this.config.gridWrapper.find('.delColumn').addClass('hide');
        if (_this.config.minVisibleColumns < _this.utils.getVisibleColumns($(this).parents('.leftColumns-wrapper').length > 0).length) {
            $this.find('.delColumn').removeClass('hide').addClass('animated fadeIn');
        }
        return false;
    };
    grid.events.columnDeleteBtnClick = function (e) {
        var _this = e.data._this,
            orientation = $(this).parents('.leftColumns-wrapper').length > 0 ? 'left' : 'right';
       if (_this.config.minVisibleColumns < _this.utils.getVisibleColumns(orientation).length) {
           var $this = $(this),
               _key = $this.attr('key'),
               parentKey = $this.attr('parentHashKey'),
               isChildColumnDelete = (parentKey && _key !== parentKey) ? true : false,
               configChanges = $.extend(true, {}, _this.config.headerConfig);
           configChanges[isChildColumnDelete ? parentKey : _key].isHidden = !isChildColumnDelete;
           if(parentKey) {
        	   // configChanges[parentKey].subGroups = {};
        	   if(_key !== parentKey) {
        	   	configChanges[parentKey].subGroups[_key].isHidden = true;
        	   } else {
        		   _this.utils.common.iterator(Object.keys(_this.config.headerConfig[parentKey].subGroups), function(_subKey, index){
            	   		configChanges[parentKey].subGroups[_subKey].isHidden = true;        			   
        		   });
        	   }
           }
           _this.utils.hideColumns([isChildColumnDelete ? parentKey : _key], configChanges);
           // _this.utils.common.widthModerator(true);
           _this.utils.common.overrideResize();
           if (typeof _this.config.callBack.deleteColumn == 'function') {
               _this.config.callBack.deleteColumn();
           }
       }
       delete configChanges;
        return false;
    };
    grid.events.hideColumnDeleteBtn = function () {
        $(this).find('.delColumn').addClass('hide');
    };

    grid.events.showInlineSortIcon = function (e) {
        var _this = e.data._this,
            $this = $(this);

        //_this.config.gridWrapper.find('.inlineSort').addClass('hide');
        if(!($this.find('.inlineSort').hasClass('arrow-up')) && !($this.find('.inlineSort').hasClass('arrow-down')))
        {
            $this.find('.inlineSort').addClass('sortIndicator animated fadeIn');
            $this.find('.inlineSort').show();
        }
        return false;
    };

    grid.events.hideInlineSortIcon = function () {
        $(this).find('.inlineSort').removeClass('sortIndicator animated fadeIn');
        if(!($(this).find('.inlineSort').hasClass('arrow-up')) && !($(this).find('.inlineSort').hasClass('arrow-down')))
        {
            $(this).find('.inlineSort').hide();
        }
    };

    /** 
     * onLoad will act like document.ready function in the context of grid.
     * it will called after the template is appended into the wrapper and before the grid initate.
     **/
    grid.events.onLoad = function () {
        var _this = this.__;
        if (_this.config.callBack.onLoad) {
            _this.config.callBack.onLoad(_this);
        }
        _this.utils.gridValidate();
        console.log('onLoad');
    };
    /** 
     * afterLoad is an post processing callback function which will be called after grid is rendered
     **/
    grid.events.afterLoad = function () {
        var _this = this.__;
        if (_this.config.callBack.afterLoad) {
            _this.config.callBack.afterLoad(__);
        }
        _this.utils.setSeparator(true);
    };
    /** 
     * beforeLoad is an pre processing callback function which will be called before grid is initiated
     **/
    grid.events.beforeLoad = function () {
        var _this = this.__;
        if (_this.config.callBack.beforeLoad) {
            _this.config.callBack.beforeLoad(_this);
        }
        console.log('before')
    };
    grid.events.resizeHandler = function(e) {
        var _this = e.data._this,
            currGridOuterWrapperWidth = _this.config.gridOuterWrapper.outerWidth();
        _this.config.resizeConfig.cTimeStamp = e.timeStamp;
        if( _this.config.resizeConfig.snapDiff <= Math.abs(_this.config.resizeConfig.pTimeStamp - e.timeStamp)) {
            _this.config.resizeConfig.pTimeStamp = e.timeStamp;
            console.time('time');
            if(!_this.config.resizeConfig.gridOuterWrapperWidth && _this.config.resizeConfig.gridOuterWrapperWidth != currGridOuterWrapperWidth) {
                _this.config.resizeConfig['gridOuterWrapperWidth'] = currGridOuterWrapperWidth;
            }
            else {
                setTimeout(_this.utils.common.dynamicWidth((_this.config.resizeConfig.gridOuterWrapperWidth <= currGridOuterWrapperWidth)), 1);
                _this.utils.common.widthModerator(true);
                _this.config.resizeConfig.gridOuterWrapperWidth = currGridOuterWrapperWidth;
                _this.utils.headerConfig();
            }
            console.timeEnd('time');
        }
    };
})(dGrid());