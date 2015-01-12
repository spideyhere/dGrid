(function() {

    /*jshint scripturl:true*/

    /**
     * grid: controller which can be extended
     * Dependency: jQuery (TODO: has to remove the dependency to make it scallable and robust)
     */

    var grid = {};

    grid.core = grid.core || {};
    grid.core.__ = grid.core.__ || grid;    

    /**
     * intitiate function for Grid Controller
     * @param {_config} config setting which has xhr proxy details, ajax callback function and wrapper class
     */
    grid.init = function(_config) {

        var _this = this,
            scrollObj = {};
        /**
         * check if configuration object is initiated from Application layer, if not initiate by calling a helper function 'setDefaultConfig'.
         */
        if (!_this.config) {
            _this.utils.setDefaultConfig();
        }

        /**
         * A callback function to pre - process before load, For Example
         * if there is a need to changed in confuguration object before Grid is loaded this 'beforeLoad'
         * callBack can be utilized.
         */
        _this.events.beforeLoad();

        /**
         * _config.wrapper - wrapper Class.
         * _this.gridOuterWrapper caches Grid wrapper which could be used for future handling.
         */
        _this.config.gridOuterWrapper = $(_config.wrapper);

        /**
         * Append the Template String to the Grid Wrapper.
         * From Grid Performance perspective Templating Engine is not used.
         */
        _this.config.gridOuterWrapper.html(_this.config.gridTpl);

        /**
         * Utility function to check whether alway scroll on property is set on MAC OS.
         * if set then corresponding width has to be reduced from wrapper in order to avoid component break up
         */
        
        _this.config.allwaysScroll = $.extend({}, _this.utils.common.checkScrollAlwaysOn(_this.config.gridOuterWrapper.find('.grid-header')));
        _this.config.proxy.url = _config.url ? _config.url : '';
        _this.config.proxy.param = _config.param ? _config.param : _this.config.proxy.param;
        _this.config.proxy.isAsync = _config.hasOwnProperty('isAsync') ? _config.isAsync : '';
        _this.config.proxy.dataType = _config.dataType ? _config.dataType : '';

        /**
         * callback function for ajax success
         */
        _this.config.proxy.callBack = function(response) {
            _this.config.dataRefreshed = true;
            /**
             * In case of subTotal, data has to sorted to insert a new row by comparing both current and next obj.
             * so a check is made whether the data is sorted or not.
             * if it is not sorted, Component rendering abourted.
             */
            if (!_this.config.subTotal.isSorted) {
                return false;
            }

            /**
             * dataExtractor is an utility function which will search data in a given result set .
             * response is an source result set
             * 'body' is an string const which impily required data for Grid body need to searched in the given result set.
             */
            if (_this.config.dataExtractor.extractData) {
                response = $.extend(_this.config.dummyObj, _this.utils.dm.dataExtractor(response, 'body'));
            }

            /**
             * if header is already loaded, then it mean that template is created
             * and only pending task is to render data in the grid.
             */
            if (_this.config.headerLoaded) {

                /**
                 * if header is loaded append the result set to the data cache.
                 */
                _this.utils.dm.concatArray(response.rows, _this.config.JSONData.rows);

                /**
                 * parse and rebuild data in required format
                 */
                _this.dm.buildJSON($.extend({}, response));

                /**
                 * reset Grid is an utility function which will re-render the component with new set of data
                 * which is present in the data cache.
                 */
                _this.dm.resetGrid();
            } else {

                /**
                 * append HTML Template into the Component Wrapper. the resaon it is kept as a sting is to
                 * avoid any template engine dependency and also for improved performance
                 */
                _this.config.gridOuterWrapper.html(_this.config.gridTpl);

                /**
                 * cache the result set.
                 */
                _this.config.JSONData = response;

                /**
                 * renerGrid: initiate rendering functionality for Grid Component
                 */
                 console.time('t1');
                _this.core.renderGrid(response);
                console.timeEnd('t1');
            }
            // perform Garbage Collection 
            response = null;
            // dataRefreshed flag is used to update cached resultset "JSONData"
            _this.config.dataRefreshed = false;

            // call afterLoad Callback function for post processing
            _this.events.afterLoad(response);
        };
        /**
         * if _this.config.showHeaderOnLoad is set to true then table
         * header is shown on load even before the data is fetched.
         * _this.config.headerConfig Map will used for the same.
         */
        if (_this.config.showHeaderOnLoad && _this.config.headerConfig) {
            var dummyObj = {
                "screenName": "",
                "header": _this.config.headerConfig,
                "rows": [],
                "total": {}
            };            
            // dummyObj will have the column Config needed to render the Grid Header 
            _this.config.JSONData = dummyObj;
            // initiate the process
            console.time('t1');
            _this.core.renderGrid(dummyObj);
            console.timeEnd('t1');

            // A flag is set to indicate header is loaded 
            _this.config.headerLoaded = true;

            $(window).off('resize', _this.events.resizeHandler);
            $(window).on('resize', {
                _this: _this
            }, _this.events.resizeHandler);
        }
        /**
         *  check whether Grid Component has to handle ajax request and it has
         *  to fetch data on load
         */
        if (_this.config.canHandelDataLoad && _this.config.initalDataLoad) {
            // initiate Ajax Call
            _this.utils.common.ajax(_this.config.proxy);
        }
        /**
         * if the result set is already provoided initalDataLoad is set to
         * true, call proxy.callback.
         */
        else if (_this.config.initalDataLoad) {
            _this.config.headerLoaded = false;
            _this.config.proxy.callBack(_this.config.data);
        }
        
        _this.config.dataRefreshed = false;    
    };

    /**
     * intitiate function for grid component
     * @param {dataObj} JSON which is used to render GRID
     */
    grid.core.renderGrid = function(dataObj) {
        var _this=this.__;
        
        /**
         *  Cache Grid Body, Header, Footer, left and right panel
         */

        _this.config.gridWrapper = _this.config.gridOuterWrapper.find('section.grid-wrapper');
        _this.config.gridBodyWrapper = _this.config.gridWrapper.find('section.grid-body');
        _this.config.gridHeaderWrapper = _this.config.gridWrapper.find('section.grid-header');
        _this.config.gridFooterWrapper = _this.config.gridWrapper.find('section.grid-footer');
        _this.config.leftColumnWrapper = _this.config.gridWrapper.find('.leftColumns-wrapper');
        _this.config.rightColumnWrapper = _this.config.gridWrapper.find('.rightColumns-wrapper');
        // set view port size 
        _this.config.rowRange_max = _this.config.lazyLoad.viewPortBufferSize;
        // parse JSON
        _this.dm.buildJSON($.extend({}, dataObj));
        // call onLoad Callback
        _this.events.onLoad();
        // create required template to render columns
        _this.core.createDraft(); 
        // this.fixWidth(true);
        // shown no data message if the result set is empty
        _this.utils.showNoData();
        // set an vertical line between left and right panel which enables the user to resize component
        _this.utils.setSeparator(true);
        // check if there is need to show footer
        if (_this.config.footer.showFooter) {
            // render Footer
            _this.utils.genrateFooter();
        }
        /**
         * check if scroll always on in mac os. if it's on then do significant adjustments in Component width to avoid break down
         */
        if (_this.config.allwaysScroll.isAlways) {
            _this.utils.common.scrollAlwaysFix(_this.config.allwaysScroll.diff);
            _this.config.gridOuterWrapper.addClass('horizontalScrollFixForAlwaysScroll');
        }
        else {
            _this.config.gridOuterWrapper.removeClass('horizontalScrollFixForAlwaysScroll');
        }

        if (_this.config.initalDataLoad) {
            // bind event handler to performe user interaction 
            _this.events.bindEvents();
        }        
        _this.utils.common.widthModerator(true);
        // _this.events.bindEvents();
    };

    /*
     *  Dispatcher to create outer wrapper for every column 
    */
    grid.core.createDraft = function() {

        var _this = this.__,
            isLeft,
            wConfig = _this.utils.getGridWidthConfig(),
            tempColInfo = {
                "classNames": "",
                "label": "Group",
                "style": "",
                "width": 100
            };

        if(_this.config.fixedColumns <= 0) {
            _this.config.leftColumnWrapper.addClass('hide');
            _this.config.columnSeparator.showSeparator = false;
        }
        _this.utils.headerConfig();
        _this.utils.common.iterator(_this.config.headerArr, function(obj, index) {
            _this.config.rowCount = _this.config.startingRowIndex;
            _this.core.dispatcher(obj.key, index, obj.hasOwnProperty('subGroups'), obj.hasOwnProperty('subGroups') ? obj.key : false, 'header,body');
        }, true);
        _this.utils.common.widthModerator(true, wConfig);
        _this.config.startingRowIndex = _this.utils.dm.getDataLength() > _this.config.lazyLoad.viewPortBufferSize ? _this.config.lazyLoad.viewPortBufferSize : _this.utils.dm.getDataLength();

    };

    grid.core.dispatcher = function(key, columnIndex, isSubGroup, parentKey, metrics) {

        var _this = this.__,
            option = {},
            isLeft = parseInt(_this.config.fixedColumns) > 0 && columnIndex < parseInt(_this.config.fixedColumns),
            _className = (isLeft ? 'leftColumns-wrapper' : 'rightColumns-wrapper'),
            _wrapper;
        option.parentKey = parentKey;
        option.key = key;
        option.cellInfo = _this.utils.dm.clone(_this.config.headerConfig[key]);
        option.isSubGroup = isSubGroup;
        option.columnIndex = columnIndex;
        option.minRange = 0;
        option.isLeft = isLeft;
        option.update = false;
        if(metrics.indexOf('header') >=0 && _this.config.headerArr && _this.config.headerArr.length > 0) {
            _wrapper = _this.config.gridHeaderWrapper.find('.grid-header.' + option.cellInfo.key );
            option.metrics = 'header';
            option.data = [option.cellInfo];
            option.maxRange = option.data.length > _this.config.lazyLoad.viewPortBufferSize ? _this.config.lazyLoad.viewPortBufferSize : option.data.length;
            option.wrapper = _wrapper.length > 0 ? _wrapper[0] : document.createElement('div');
            option.wrapper.className = (' ' + (isSubGroup ? (key + '-subGroups grid-header  grid-subGroups ') : 'grid-header ') + (option.cellInfo.isHidden ? ' hide ' : ''));
            _this.core.setEleInfo(option.wrapper, option.cellInfo, 'col' + key);
            _this.core.genrateColCell(_this.utils.dm.clone(option));
            _this.config.gridHeaderWrapper[0].querySelector('.' + _className + ' .scrollable').appendChild(option.wrapper);
            
        }   

        if(metrics.indexOf('body') >=0 && _this.utils.dm.getDataLength() > 0) {
            _wrapper = _this.config.gridBodyWrapper.find('.grid-column.' + option.cellInfo.key );
            option.metrics = 'body';
            option.data = _this.config.data[key];
            option.maxRange = option.data.length > _this.config.lazyLoad.viewPortBufferSize ? _this.config.lazyLoad.viewPortBufferSize : option.data.length;
            option.wrapper = _wrapper.length > 0 ? _wrapper[0] : document.createElement('div');
            option.wrapper.className = (' ' + (isSubGroup ? (key + '-subGroups grid-subGroups grid-column ') : ' grid-column ') + (option.cellInfo.isHidden ? ' hide ' : ''));
            _this.core.setEleInfo(option.wrapper, option.cellInfo, 'col' + key);
            _this.core.genrateColCell(_this.utils.dm.clone(option));
            _this.config.gridBodyWrapper[0].querySelector('.' + _className + ' .scrollable').appendChild(option.wrapper);
            
        
        }

        if(metrics.indexOf('footer') >=0 && _this.config.footer && _this.config.footer.showFooter && _this.config.JSONData.total && Object.keys(_this.config.JSONData.total).length > 0) {
            _wrapper = _this.config.gridFooterWrapper.find('.grid-header.' + option.cellInfo.key );
            option.metrics = 'footer';            
            option.cellInfo.title = typeof _this.config.JSONData.total[key]  != "undefined" ? _this.config.JSONData.total[key] : '';
            option.data = [option.cellInfo];
            option.maxRange = option.data.length > _this.config.lazyLoad.viewPortBufferSize ? _this.config.lazyLoad.viewPortBufferSize : option.data.length;
            option.wrapper = _wrapper.length > 0 ? _wrapper[0] : document.createElement('div');
            option.wrapper.className = (' ' + key + '-grid-footer grid-footer grid-subGroups ') + (option.cellInfo.isHidden ? ' hide ' : '');
            _this.core.setEleInfo(option.wrapper, option.cellInfo, 'col' + key);
            _this.core.genrateColCell(_this.utils.dm.clone(option));
            _this.config.gridFooterWrapper[0].querySelector('.' + _className + ' .scrollable').appendChild(option.wrapper);
            

        }
        
        if(_this.utils.dm.getDataLength() == 0) {
            _this.utils.showNoData();
        }
    }
    
    grid.core.genrateColCell = function(option) {
        var _this = this.__,
            tempCellInfo = {
                "classNames": "region",
                "label": "Group",
                "style": "",
                "width": 100
            },            
            domFragment = document.createDocumentFragment(),
            subGroupsContainer = document.createElement('div'),
            isHeader = option.metrics.indexOf('header') >=0,
            isBody = option.metrics.indexOf('body') >=0,
            isFooter = option.metrics.indexOf('footer') >=0,
            subHeaderHeight = isHeader && option.isSubGroup && option.cellInfo.showSubGroupTitle ? (_this.config.rowHeight_Header - ((_this.config.rowHeight_Header / 100) * 35) - 2)  : (isBody || isFooter ? _this.config.rowHeight_Body : _this.config.rowHeight_Header); //-2 for border
            eligibleToCalculateSubTotal = ((option.cellInfo.dataType == 'number' || option.cellInfo.dataType == 'currency' || option.cellInfo.dataType == 'csn' || option.cellInfo.dataType == 'percentage' || option.cellInfo.dataType == 'float') && (!isHeader && !isFooter)) ? true : false,
            height = (!option.isSubGroup ? (isHeader ? (_this.config.rowHeight_Header) : (_this.config.rowHeight_Body)) : subHeaderHeight) + 'px';
        
        option.wrapper.setAttribute('hashKey', option.key);
        if(!option.update && option.cellInfo.hasOwnProperty('subGroups')) {
            subGroupsContainer = document.createElement('div');
            subGroupsContainer.className = 'subGroups-wrapper';
            subGroupsContainer.style.height = subHeaderHeight + 'px';
        }
        else if(option.cellInfo.hasOwnProperty('subGroups')) {
            subGroupsContainer = option.wrapper.querySelector('.subGroups-wrapper');
        }

        if (!_this.config.cache.hasOwnProperty(option.key)) {
            _this.config.cache[option.key] = [];
        }


        for (var iteratorIndex = option.minRange; iteratorIndex < option.maxRange && option.data.length > 0; iteratorIndex++) {
            var d = option.data[iteratorIndex] || {},
                cellPackage = document.createElement('div'),
                cellcontent = document.createElement('span'),
                diffObj,
                isSubTotal = iteratorIndex > 0 && _this.config.subTotal.subTotalIndex.indexOf(iteratorIndex) >= 0;
            cellPackage.className = 'grid-cellDirective ' + (isSubTotal ? _this.config.clazz.subTotalClass : '') + ' ' + option.cellInfo.classNames;
            cellPackage.setAttribute('style', 'height: ' + height);
            cellPackage.setAttribute('rowIndex', _this.config.rowCount); //todo setProperties not working
            cellPackage.setAttribute('hashKey', option.key);
            cellPackage.setAttribute('data-desc',d.desc ? d.desc : '');
            cellcontent.innerHTML = typeof d.title != "undefined" ? d.title : '';
            cellcontent.className = ' cellcontent ';
            cellPackage.appendChild(cellcontent);

            if(option.parentKey) {
                cellPackage.setAttribute('parentHashKey', option.parentKey);
            }
                    
            if (!_this.config.subTotal.subTotalValue.hasOwnProperty(option.key)) {
                _this.config.subTotal.subTotalValue[option.key] = 0;
            }
            if (_this.config.subTotal.canCalculateSubTotal && eligibleToCalculateSubTotal && !d[_this.config.subTotal.hashkeyToCheck] && _this.config.subTotal.showSubTotal) {
                if (option.cellInfo.dataType != 'number' || option.cellInfo.dataType != 'float') {
                    _this.config.subTotal.subTotalValue[option.key] += _this.truncateStringFormat(d.title);
                } else {
                    _this.config.subTotal.subTotalValue[option.key] += parseFloat(d.title);
                }
            }
            if (isHeader) {
                var cellcontent = document.createElement('span'),
                    sortSpan = document.createElement('span'),
                    delPlaceHolder = document.createElement('a');
                sortSpan.className = 'inlineSort';
                sortSpan.setAttribute('hashKey', option.key);
                cellPackage.appendChild(sortSpan);
                delPlaceHolder.className = 'hide ' + (_this.config.clazz.hasOwnProperty('columnDelete') ? _this.config.clazz.columnDelete : '');
                delPlaceHolder.setAttribute('key', option.key);
                delPlaceHolder.setAttribute('parentHashKey', option.parentKey ? option.parentKey : "");
                if(option.cellInfo.hasOwnProperty('subGroups')) {
                    var titleWrapper = document.createElement('div'),
                        expandBtn = _this.utils.dm.setAttributes(document.createElement('a'), {
                        'key': option.key,
                        'href': 'javascript:void(0)'
                        });
                    if(option.cellInfo.showSubGroupTitle) {
                        var titleTxt = document.createElement('p');
                        titleTxt.innerHTML = option.cellInfo.subGroupTitle;
                        titleWrapper.appendChild(titleTxt);                        
                    }

                    
                    if (_this.config.clazz.expandButton == '' || _this.config.clazz.expandButton == null) {
                        expandBtn.textContent = '+';
                        expandBtn.className += ' exBtn defExpandBtnClass expand-subGroups';
                    } else {
                        expandBtn.className += (_this.config.clazz.expandButton + ' exBtn expand-subGroups');
                    }
                    expandBtn.setAttribute('hashKey', option.key);

                    if(!option.cellInfo.showParentColumn && option.cellInfo.canExpandCollapse) {
                        titleWrapper.appendChild(expandBtn);
                    }
                    else if(option.cellInfo.showParentColumn && option.cellInfo.canExpandCollapse) {
                        cellPackage.appendChild(expandBtn);
                    }
                    titleWrapper.className = 'subGroups-title-wrapper';
                    titleWrapper.style.height = ((_this.config.rowHeight_Header / 100) * 35) + 'px';
                    titleWrapper.className += (option.cellInfo.showSubGroupTitle || option.cellInfo.canDelete) ? '' : ' hide ';
                }
                
                if (option.cellInfo.canDelete) {
                    cellPackage.appendChild(delPlaceHolder);
                }
            }
            else if(isBody) {
                if(_this.config.rowHighlight.doHighlight && _this.config.rowHighlight.hashkeyToCheck.length > 0 && _this.config.JSONData.rows[iteratorIndex].hasOwnProperty(_this.config.rowHighlight.hashkeyToCheck) && _this.config.JSONData.rows[iteratorIndex][_this.config.rowHighlight.hashkeyToCheck] === _this.config.rowHighlight.Truthy) {
                    cellPackage.className +=  ' ' + _this.config.rowHighlight.clazz;
                }
                cellPackage.className += ' ' + d.dataType + ' ';  
                cellPackage.appendChild(cellcontent);
                _this.config.cache[option.key][iteratorIndex] = cellPackage;
            }
            domFragment.appendChild(cellPackage);

            if (!isHeader && !isFooter && iteratorIndex > 0 && _this.config.subTotal.subTotalIndex.indexOf(iteratorIndex) >= 0 && _this.config.subTotal.canCalculateSubTotal) {
                var tempObj = d,
                    currentSubTotalIndex = _this.config.subTotal.subTotalIndex.indexOf(iteratorIndex);
                d.isSubTotal = true;
                d.title = (eligibleToCalculateSubTotal) ? ((option.cellInfo.dataType == 'currency' || option.cellInfo.dataType == 'csn') ? _this.utils.dm.stringFormat(_this.config.subTotal.subTotalValue[option.key], option.cellInfo.dataType) : _this.config.subTotal.subTotalValue[option.key]) : '-';
                option.data.insert(iteratorIndex + 1, tempObj);
                _this.config.subTotal.subTotalValue[option.key] = 0;
                option.maxRange++;
                if (option.columnIndex == 0) {
                    for (var i = currentSubTotalIndex + 1; i < _this.config.subTotal.subTotalIndex.length; i++) {
                        _this.config.subTotal.subTotalIndex[i] += 1;
                    };
                }
            }
            if (!isHeader && iteratorIndex + 1 < option.maxRange) {
                ++_this.config.rowCount;
            }
        }
        if(option.cellInfo.hasOwnProperty('subGroups')) {
            var cummulativeWidth = 0, 
            	_className = (isHeader ? " grid-header " : ( isBody ?  " grid-column " : " grid-footer " ));
            if(option.cellInfo.showParentColumn) {
                var _tempWrapper = option.update ? option.wrapper.querySelector('.subGroups-wrapper .' + option.key) : document.createElement('div'),
                    columnWidth = _this.utils.getColumnWidth(option.cellInfo.key);
                _tempWrapper.className = (' ' + (option.cellInfo.hasOwnProperty('subGroups') ? (option.key + '-subGroups ' + _className ) : _className ) + (option.cellInfo.isHidden ? ' hide ' : ''));
                _tempWrapper.setAttribute('hashkey', option.cellInfo.key);
                _this.config.headerConfig[option.cellInfo.key].width = option.cellInfo.width = columnWidth.parentWidth;
                _this.core.setEleInfo(_tempWrapper, option.cellInfo, 'col' + option.cellInfo.key);
                _tempWrapper.appendChild(domFragment);
                if(!option.update) {
                    subGroupsContainer.appendChild(_tempWrapper);
                }
            }
            _this.utils.common.iterator(_this.utils.dm.objectToarray(option.cellInfo.subGroups, false), function(obj, _index) {
                var _option = {},
                    _wrapper = isBody ? _this.config.gridBodyWrapper.find('.grid-subGroups .grid-column.' + obj.key ) : ( isHeader ? _this.config.gridHeaderWrapper.find('.grid-subGroups .grid-header.' + obj.key ) : _this.config.gridFooterWrapper.find('.grid-subGroups .grid-header.' + obj.key ));

                _option.parentKey = option.key;
                _option.columnIndex = option.columnIndex;
                _option.minRange = option.minRange;
                _option.isLeft = option.isLeft;
                _option.update = option.update;
                _option.metrics = option.metrics;
                _option.isSubGroup = true;

                if(_wrapper.length <= 0) {
                    _option.wrapper = document.createElement('div');
                    _option.wrapper.className = (' ' + (_option.isSubGroup ? (obj.key + '-subGroups ' + _className + ' ') : '') + (obj.isHidden ? ' hide ' : ''));
                }
                else {
                    _option.wrapper = _wrapper[0];
                }
                 
                if(isHeader) {
                    _option.data = [obj];
                }
                else if(isBody) {
                    _option.data = _this.config.data[obj.key];
                }
                else if(isFooter) {
                    var _tempObj = $.extend(true, {}, obj);
                    _tempObj.title = (_this.config.JSONData.total[obj.key] != null && _this.config.JSONData.total[obj.key] != undefined) ? _this.config.JSONData.total[obj.key] : '';
                    _option.data = [_tempObj];
                }
                obj.showSubGroupTitle = option.cellInfo.showSubGroupTitle;
                _option.maxRange = isBody && _option.minRange + _this.config.lazyLoad.viewPortBufferSize <= _option.data.length ? _option.minRange + _this.config.lazyLoad.viewPortBufferSize : _option.data.length;
                _option.cellInfo = obj;
                _option.key = obj.key;
                _this.core.setEleInfo(_option.wrapper, _option.cellInfo, 'col' + key);
                _this.config.rowCount = _this.config.startingRowIndex;
                _this.core.genrateColCell(_option);
                if(!option.update) {
                    subGroupsContainer.appendChild(_option.wrapper);
                }
                cummulativeWidth +=  obj.isHidden ? 0 : parseFloat(obj.width);
                delete _option;
            }, true);
            if(isHeader && !option.cellInfo.showParentColumn) {
                option.wrapper.appendChild(titleWrapper);    
            }
            
            cummulativeWidth += !option.cellInfo.isHidden && option.cellInfo.showParentColumn ? parseFloat(option.cellInfo.width) : 0
            // option.wrapper.style.minWidth = cummulativeWidth + 'px';
            option.wrapper.style.width = cummulativeWidth + 'px';
            if(!option.update) { 
                option.wrapper.appendChild(subGroupsContainer);
            }
        }
        else {
            option.wrapper.appendChild(domFragment);
        }
    };

    grid.core.setEleInfo = function(ele, _colInfo, key) {
        if (ele.addClass) {
            if (_colInfo.hasOwnProperty('classNames')) {
                ele.addClass(_colInfo.classNames);
                ele.addClass(key)
            }

            if (_colInfo.hasOwnProperty('label')) {
                ele.attr('lbl', _colInfo.label);
            }
            if (_colInfo.hasOwnProperty('style')) {
                ele.attr('style', _colInfo.style);
            }
            if (_colInfo.hasOwnProperty('width')) {
                ele.css({
                    // 'min-width': (_colInfo.hasOwnProperty('_width') ? _colInfo._width : _colInfo.width),
                    'width': _colInfo.width
                });
            }
        } else {
            if (_colInfo.hasOwnProperty('classNames')) {
                ele.className += _colInfo.classNames + ' ' + key;
            }

            if (_colInfo.hasOwnProperty('label')) {
                ele.setAttribute('lbl', _colInfo.label);
            }
            if (_colInfo.hasOwnProperty('style')) {
                ele.setAttribute('style', _colInfo.style);
            }
            if (_colInfo.hasOwnProperty('width')) {
                // ele.style.minWidth = (_colInfo.hasOwnProperty('_width') ? _colInfo._width : _colInfo.width) + 'px';
                ele.style.width = _colInfo.width + 'px';
            }
        }
    };

    /** 
     * Save Grid in window Object for Globle accces
     */
    window.dGrid = function(clone) {
        if(clone) {
            grid.utils.setDefaultConfig();
            return grid.utils.dm.clone(grid, true, ['__']);
        }
        else {
            return grid;
        }
    }
})();