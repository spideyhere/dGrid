(function (__) {

    var grid = __;
    grid.dm = grid.dm || {};
    grid.dm.__ = __;

    grid.dm.updateGrid = function(_this, scrollTop, canAppend) {
        var prevScrollTop = parseInt(_this.config.gridBodyWrapper.attr('prevTopPos') || 0),
            maxRange = 0,
            minRange = 0,
            data = [],
            key = '',
            viewPortRowCount = 0,
            wrapper,
            separator = {},
            dataLength = _this.utils.dm.getDataLength() - 1,
            minRowsToDeleteRange = 0,
            maxRowsToDeleteRange = 0;
        if (prevScrollTop != 0 && prevScrollTop < scrollTop && canAppend && (_this.config.rowCount + _this.config.lazyLoad.viewPortBufferSize <= dataLength || (_this.config.rowCount + _this.config.lazyLoad.viewPortBufferSize > dataLength && _this.config.rowCount + 1 <= dataLength))) {
            separator = _this.config.gridBodyWrapper.find('.separator');
            minRange = _this.config.rowCount, maxRange = ((minRange + _this.config.lazyLoad.viewPortBufferSize) <= _this.config.data[_this.config.headerArr[0].key || ''].length ? (minRange + _this.config.lazyLoad.viewPortBufferSize) : _this.config.data[_this.config.headerArr[0].key || ''].length);
            _this.config.appendOrientation = 'bottom';
            minRowsToDeleteRange =  parseInt(_this.config.gridBodyWrapper[0] && _this.config.gridBodyWrapper[0].querySelector('.grid-column div').getAttribute('rowIndex') || 0);
            maxRowsToDeleteRange = minRowsToDeleteRange + ( (maxRange -minRange) < _this.config.lazyLoad.viewPortBufferSize ? (maxRange -minRange) : _this.config.lazyLoad.viewPortBufferSize)
            console.time('update');
            _this.utils.common.iterator(Object.keys(_this.config.headerConfig), function(key, index) {
                obj = _this.config.headerConfig[key];
                updateColumn(key, index);
                _this.config.rowCount = _this.config.startingRowIndex;
            });
            console.timeEnd('update');
            _this.utils.setSeparatorHeight(separator, 0, _this);
            _this.config.gridBodyWrapper.scrollTop(scrollTop - (scrollTop / 3));
            _this.config.startingRowIndex = _this.config.rowCount = maxRange; //- minRange;
        } else if (prevScrollTop != 0 && prevScrollTop > scrollTop && scrollTop <= _this.config.rowHeight_Body * (_this.utils.dm.getDataLength() >= _this.config.lazyLoad.numberOfRowsViewable/5 ? _this.config.lazyLoad.numberOfRowsViewable/5 : _this.utils.dm.getDataLength() )) {
            maxRange = parseInt(_this.config.gridBodyWrapper[0] && _this.config.gridBodyWrapper[0].querySelector('.grid-column div').getAttribute('rowIndex') || 0);
            if (maxRange > 1) {
                var len = _this.utils.dm.getDataLength(),
                    maxRangToDelete = (maxRange + _this.config.lazyLoad.viewPortBufferSize <= len) ? (maxRange + _this.config.lazyLoad.viewPortBufferSize) : len,
                    prependCallBack;
                _this.config.startingRowIndex = minRange = (maxRange - _this.config.lazyLoad.viewPortBufferSize > 0) ? maxRange - _this.config.lazyLoad.viewPortBufferSize : 0;
                _this.config.appendOrientation = 'top';
                console.time('prepend');
                _this.utils.common.iterator(_this.config.headerArr, prependCallBack = function(obj, index) {
                    _this.config.rowCount = _this.config.startingRowIndex;
                    wrapper = (obj.hasOwnProperty('subGroups') && obj.showParentColumn) ? _this.config.gridWrapper.find('.subGroups-wrapper .grid-column.' + obj.key) : _this.config.gridWrapper.find('.' + obj.key + '.grid-column');
                    if(!obj.hasOwnProperty('subGroups') || (obj.hasOwnProperty('subGroups') && obj.showParentColumn)) {
                        for (var i = maxRange; i >= minRange; i--) {
                            var domObj = document.createElement('div');
                            domObj.appendChild(_this.config.cache[obj.key][i]);
                            domObj.querySelector('div').setAttribute('rowindex', i);
                            _this.config.cache[obj.key][i] = domObj.querySelector('div');
                            wrapper.prepend(_this.config.cache[obj.key][i]);
                        };
                    }
                    if(obj.hasOwnProperty('subGroups')) {
                        _this.utils.common.iterator(_this.utils.dm.objectToarray(obj.subGroups), prependCallBack);
                    }
                });
                console.timeEnd('prepend');
                _this.utils.setSeparatorHeight(separator, 0, _this);
                _this.config.gridBodyWrapper.scrollTop(_this.config.rowHeight_Body * 10);
                _this.config.startingRowIndex = _this.config.rowCount = maxRange;// ;= (maxRange <= _this.config.lazyLoad.viewPortBufferSize && maxRange + _this.config.lazyLoad.viewPortBufferSize <= dataLength -1 ? _this.config.lazyLoad.viewPortBufferSize : maxRange);
                
                _this.utils.common.iterator(_this.utils.dm.objectToarray(_this.config.headerConfig), deleteCallBack = function(obj, index) {
                    
                    for (var i = maxRange; i < maxRangToDelete; i++) {
                        _this.config.cache[obj.key][i].remove();
                    };
                    if(obj.hasOwnProperty('subGroups')) {
                        _this.utils.common.iterator(_this.utils.dm.objectToarray(obj.subGroups), deleteCallBack);
                    }
                });
            }
        }
        if (((_this.config.lazyLoad.totalRowCount &&  _this.config.rowCount + _this.config.lazyLoad.viewPortBufferSize  < _this.config.lazyLoad.totalRowCount) || (typeof _this.config.lazyLoad.totalRowCount === "undefined"  || _this.config.lazyLoad.totalRowCount === 0 ? true : false)) && _this.config.rowCount + _this.config.lazyLoad.viewPortBufferSize >= _this.config.data[_this.config.headerArr[0].key].length && _this.config.lazyLoad.canDoLazyLoad && !_this.config.lazyLoad.isLoading) {
            _this.config.proxy.isAsync = true;
            _this.config.proxy.callBack = function(response) {
                _this.config.lazyLoad.isLoading = false;
                _this.config.dataRefreshed = true;
                if (_this.config.dataExtractor.extractData) {
                    response = _this.utils.dm.dataExtractor(response, 'body');
                }                
                if (response.rows && response.rows.length > 0) {
                    if (!_this.config.sorting.isSorted) {
                        _this.utils.dm.concatArray(response.rows, _this.config.JSONData.rows);
                        _this.dm.buildJSON($.extend({}, response));
                        _this.dm.updateGrid(_this, scrollTop);
                    } 
                    else {
                        _this.dm.updateData(response);
                        console.time('lazyLoad_sort');
                        _this.config.JSONData.rows.sort(_this.utils.dm.sortCallBack(_this.config.sortCellType, _this.config.sorting.sortKey, _this.config.sorting.isAsc));
                        console.timeEnd('lazyLoad_sort');
                        _this.dm.resetData();
                    }
                    _this.config.dataRefreshed = false;
                } else if (response.rows.length <= 0 ) {
                    _this.config.lazyLoad.canDoLazyLoad = false;
                }
                _this.config.lazyLoad.callBack(response, _this);
            }
            if (_this.config.lazyLoad.canDoLazyLoad && typeof _this.config.lazyLoad.setProxyParamConfig == 'function') {
                _this.config.lazyLoad.setProxyParamConfig(_this);
            }
            _this.config.lazyLoad.isLoading = true;
            _this.utils.common.ajax(_this.config.proxy);
        }

        function updateColumn(key, columnIndex) {
            _this.core.genrateColCell({
                'data': _this.config.data[key],
                'wrapper': _this.config.gridWrapper.find('.' + key + '.grid-column')[0],
                'cellInfo': _this.config.headerConfig[key],
                'key': key,
                'isHeader': false,
                'hasSubGroup': _this.config.headerConfig[key].hasOwnProperty('subGroups'),
                'columnIndex': columnIndex,
                'minRange': minRange,
                'maxRange': maxRange,
                'isLeft': false,
                'metrics': 'body',
                'update': true
            });
            if (_this.config.headerConfig[key].hasOwnProperty('subGroups')) {
                _this.utils.common.iterator(Object.keys(_this.config.headerConfig[key].subGroups), function(subkey, index) {
                    for (var i = minRowsToDeleteRange; i < maxRowsToDeleteRange; i++) {
                        _this.config.cache[subkey][i].remove();
                    };
                });                
            }
            
            for (var i = minRowsToDeleteRange; i < maxRowsToDeleteRange; i++) {
                _this.config.cache[key][i].remove();
            };
            _this.config.gridBodyWrapper.attr({
                'prevTopPos': scrollTop
            })
        }
    };

    grid.dm.refreshData = function () {
        var _this = this.__,
            _proxy = $.extend({}, _this.config.proxy);
        _proxy.isAsync = true;
        _proxy.callBack = function(response) {
            _this.config.dataRefreshed = true;
            if (_this.config.dataExtractor.extractData) {
                response = $.extend({}, _this.utils.dm.dataExtractor(response, 'body'));
            }
            // _this.updateData(response);
            _this.config.JSONData.header = response.header ? response.header : _this.config.JSONData.header;
            _this.config.gridBodyWrapper.css('height', (_this.config.rowHeight_Body * _this.config.lazyLoad.viewPortBufferSize));
            _this.config.JSONData = response;
            _this.dm.resetData();
            _this.dm.resetGrid();
            _this.events.afterLoad(response); //induced setTimeOut to make afterLoad callback async
            _this.config.dataRefreshed = false;
        }
        _this.config.lazyLoad.startRowIndex = 0;
        _this.config.lazyLoad.endRowIndex = 500;
        _this.utils.common.ajax(_proxy);
    };

    grid.dm.resetData = function () {
        var _this = this.__;
        _this.config.data = {};
        _this.config.subTotal.subTotalIndex = [0];
        _this.config.dataRefreshed = true;
        this.buildJSON($.extend(_this.config.dummyObj, _this.config.JSONData));
        _this.config.dataRefreshed = false;
    };
    grid.dm.resetGrid = function () {
        var minRange = 0,
            _this = this.__;
        _this.config.gridWrapper.find('.grid-column div').remove();
        this.resetConfig();
        _this.utils.common.iterator(_this.config.headerArr, function(obj, index) {
            _this.core.dispatcher(obj.key, index, obj.hasOwnProperty('subGroups'), obj.hasOwnProperty('subGroups') ? obj.key : false, 'body,footer');
            _this.config.rowCount = 0;
          }, true);
        _this.config.gridBodyWrapper.attr({
            'prevTopPos': 0
        });
        _this.config.startingRowIndex = _this.config.rowCount = _this.config.lazyLoad.viewPortBufferSize;
        _this.utils.showNoData();
        _this.utils.genrateFooter();
        _this.utils.gridValidate();
        _this.utils.setSeparator(false);
        _this.events.bindEvents();
        _this.utils.common.widthModerator(true);
        _this.config.leftColumnWrapper.scrollLeft(_this.config.leftColumnWrapper.scrollLeft());
        _this.config.rightColumnWrapper.scrollLeft(_this.config.rightColumnWrapper.scrollLeft());
        return false;
    };
    grid.dm.buildJSON = function(data) {
        var _this = this.__,
            rowLength = (data.rows && data.rows.length) || 0;
        data['header'] = data.header && _this.utils.dm.getObjectLength(data.header) > 0 ? data.header : _this.config.headerConfig;
        if (data.header && _this.utils.dm.getObjectLength(data.header) > 0) {
            _this.utils.common.iterator(Object.keys(data['header']), function(key, index) {
                data['header'][key]['_width'] = data['header'][key]['_width'] ? data['header'][key]['_width'] : data['header'][key].width;
                if (!_this.config.data.hasOwnProperty(key)) {
                    _this.config.data[key] = []
                }
                _this.utils.common.iterator(getColInfo(key, data.header[key]), function(d, i) {
                    _this.config.data[key].push(d);
                    if (index == 0 && (_this.config.subTotal.canCalculateSubTotal || _this.config.subTotal.showSubTotal) && _this.config.dataRefreshed) {
                        if (_this.config.subTotal.canCalculateSubTotal) {
                            var diffObj = _this.utils.dm.compareObj(_this.config.JSONData.rows[i], _this.config.JSONData.rows[i + 1], _this.config.subTotal.groupBy);
                            if (diffObj.imparity.length > 0 || (rowLength - 1) == i) {
                                _this.config.subTotal.subTotalIndex.push(i);
                            }
                        } else if (_this.config.JSONData.rows[i][_this.config.subTotal.hashkeyToCheck] == _this.config.subTotal.Truthy) {
                            _this.config.subTotal.subTotalIndex.push(i);
                        }
                    }
                }, true);
                if (data.header[key].hasOwnProperty("subGroups")) {
                    _this.utils.common.iterator(Object.keys(data.header[key].subGroups), function(_subkey) {
                        data.header[key].subGroups[_subkey]['_width'] = data.header[key].subGroups[_subkey]['_width'] ? data.header[key].subGroups[_subkey]['_width'] : data.header[key].subGroups[_subkey]['width'];
                        if (!_this.config.data.hasOwnProperty(_subkey)) {
                            _this.config.data[_subkey] = [];
                        }
                        _this.utils.common.iterator(getColInfo(_subkey, data.header[key].subGroups[_subkey]), function(d, i) {
                            _this.config.data[_subkey].push(d)
                        }, true);
                    }, true);
                }
                if (data.header[key].hasOwnProperty("subColumns")) {
                    if (!_this.config.data.hasOwnProperty('subColumns')) {
                        _this.config.data.subColumns = {}
                    }
                    _this.utils.common.iterator(Object.keys(data.header[key].subColumns), function(_subkey) {
                        if (!_this.config.data.subColumns.hasOwnProperty(_subkey)) {
                            _this.config.data.subColumns[_subkey] = []
                        }
                        _this.utils.common.iterator(getColInfo(_subkey, data.header[key].subColumns[_subkey]), function(d, i) {
                            _this.config.data.subColumns[_subkey].push(d)
                        }, true);
                    }, true);
                }
            }, true);
            _this.config.headerConfig = Object.keys(data.header).length > 0 ? data.header : _this.config.headerConfig;
            _this.config.headerArr = grid.utils.dm.objectToarray(data.header, false);
        }
        if (data.total) {
            _this.config.JSONData.total = $.extend(_this.config.JSONData.total, data.total);
        }

        function getColInfo(key, obj) {
            return data.rows.map(function(d, i) {
                return {
                    "title": d[key],
                    colInfo: obj
                };
            });
        }
    };
    grid.dm.updateData = function(val) {
        var _this = this.__;
        if(val.header && Object.keys(val.header)) {
            _this.config.JSONData.header = val.header;
        }

        if(val.rows && val.rows.length > 0) {
            _this.utils.dm.concatArray(val.rows, _this.config.JSONData.rows);
        }

        if(val.total && Object.keys(val.total)){
            _this.config.JSONData.total = val.total;
        }
    };
    grid.dm.resetConfig = function() {
        var _this = this.__;
        _this.config.appendOrientation = 'bottom';
        _this.config.rowCount = _this.config.startingRowIndex = 0;
        _this.config.cache = {};
    };
})(dGrid());