(function (__) {

    var grid = __;
    grid.utils = grid.utils || {};
    grid.utils.common = grid.utils.common || {};
    grid.utils.dm = grid.utils.dm || {};
    grid.utils.dm.__ = __;
    
     grid.utils.dm.objectToarray = function(object, cloneObj) {
        var _this = this.__,
            arr = [];
        _this.utils.common.iterator(Object.keys(object), function(key, index) {
            object[key].key = key;
            object[key].index = object[key].hasOwnProperty('index') ? object[key].index : index;
            if(cloneObj) { /* To avoid unnecessary call to extend function, if condition handled */
                arr[index] = $.extend(true, {}, object[key]);
            }
            else {
                arr[index] = object[key];
            }
        }, true);
        return arr.sort(_this.utils.dm.sortCallBack('number', 'index', true));
    }

     grid.utils.dm.getObjectLength = function(obj) {
        var _this = this.__,
            count = 0;
        _this.utils.common.iterator(Object.keys(obj), function(d, i) {
            if (typeof obj[d] == 'object') {
                count++;
            }
        });
        return count;
    }
    grid.utils.dm.appendArray = function(arrObj) {
        if (arrObj.orientation != "bottom") {
            var i, len = arrObj.oldArray.length,
                newArray = [arrObj.value];
            for (i = 0; i < len; ++i) {
                newArray.push(arrObj.oldArray[i])
            }
            return newArray
        } else {
            arrObj.oldArray.push(arrObj.value);
            return arrObj.oldArray
        }
    }
    
    grid.utils.dm.getDataLength = function() {
        var length = 0,
            _this = this.__;
        _this.utils.common.iterator(Object.keys(_this.config.headerConfig), function(key, index) {
            if (length < _this.config.data[key].length) {
                length = _this.config.data[key].length
            }
        }, true);
        return length;
    }

    grid.utils.dm.hasData = function(JSONObj) {
        var _this=this.__;
        return _this.utils.dm.getDataLength() > 0 ? true : false;
    }

    /*
     * utility function to extract data from ajax response if response has diffrent key binding
     */
    grid.utils.dm.dataExtractor = function(_data, metrics) {
        var _lvlIncrement = 0,
            _this = this.__,            
            dummyObj = $.extend({}, _this.config.dummyObj),
            returnObj = {},
            breakLoop = false;
        recursive($.extend({}, _data));
        if (_this.config.headerLoaded) {
            returnObj.header = _this.config.headerConfig;
        }
        return returnObj;


        function recursive(obj) {
            
            if (typeof obj == 'object' && !breakLoop) {
                _this.utils.common.iterator(Object.keys(obj), function(key, index) {
                    if (typeof obj[key] == 'object' && obj[key] && !breakLoop) {
                        finder(obj[key]);
                        ++_lvlIncrement;
                        if (index + 1 > _this.utils.dm.getObjectLength(obj) && _lvlIncrement > _this.config.dataExtractor.level) {
                            breakLoop = true;
                            returnObj = dummyObj;
                        } else {
                            recursive(obj[key]);
                        }
                    }
                });
            }

            function finder(obj, key) {
                var data = obj.length && obj[0] ? obj[0] : obj;
                if (typeof data == 'object') {
                    _this.utils.common.iterator(Object.keys(data), function(_key, index) {
                        if (_key == _this.config.dataExtractor.header && !_this.config.headerLoaded && metrics == 'header') {
                            dummyObj.header = data[_key];
                        }
                        if (_key == _this.config.dataExtractor.rows && metrics == 'body') {
                            dummyObj.rows = data[_key];
                        } 
                        if (_key == _this.config.dataExtractor.total && _this.config.showTotal && metrics == 'footer') {
                            dummyObj.total = data[_key];
                        }
                    });
                }
            }
        }
    }

    //concat an array of elements into another array
    grid.utils.dm.concatArray = function(srcArray, desArray) {
        Array.prototype.push.apply(desArray, srcArray);
    }

    grid.utils.dm.compareObj = function(currentObj, nextObj, groupByColumns) {
        var _keys = groupByColumns ? groupByColumns : Object.keys(currentObj),
            diffObj = {
                'imparity': [],
                'equality': []
            },
            _this = this.__;
        _this.utils.common.iterator(_keys, function(key, index) {
            if (nextObj && nextObj.hasOwnProperty(key) && currentObj[key] != nextObj[key]) {
                if (!diffObj.hasOwnProperty('imparity')) {
                    diffObj['imparity'] = [];
                }
                diffObj.imparity.push(key);
            } else {
                if (!diffObj.hasOwnProperty('equality')) {
                    diffObj['equality'] = [];
                }
                diffObj.equality.push(key);
            }
        });
        return diffObj;
    }
    grid.utils.dm.setAttributes = function(element, props) {
        for (var prop in props) {
            if (props.hasOwnProperty(prop)) {
                element[prop] = props[prop];
            }
        }
        return element;
    }

    grid.utils.dm.truncateStringFormat = function(str) {
        if (str) {
            return (typeof str != 'number') ? (parseFloat(str.toString().replace(/\$|\,|\%/g, ''))) : str;
        } else {
            return 'N/A';
        }
    }

    grid.utils.dm.stringFormat = function(str, type) {
        var csn = parseFloat(str).toFixed(2).replace(/./g, function(c, i, a) {
            return i && c !== "." && !((a.length - i) % 3) ? ',' + c : c;
        });
        return (type == 'currency') ? ('$' + csn) : csn;
    };
    grid.utils.dm.sortCallBack = function(dataType, hashKey, isAsc) {
        return function(a, b) {
            var _a, _b,
                tempObj = document.createElement('div');
            if (dataType === 'currency') {
                _a = parseFloat(a[hashKey].toString().replace(/\$|\,/g, ''), 10);
                _b = parseFloat(b[hashKey].toString().replace(/\$|\,/g, ''), 10);
            } else if (dataType === 'number' || dataType === 'int') {
                _a = parseInt(a[hashKey], 10);
                _b = parseInt(b[hashKey], 10);
            } else if (dataType === 'float') {
                _a = parseFloat(a[hashKey], 10);
                _b = parseFloat(b[hashKey], 10);
            } else if (dataType === 'string' || dataType === 'char') {
                _a = a[hashKey];
                _b = b[hashKey];
            } else if (dataType === 'csn') {
                _a = parseFloat(a[hashKey].replace(',', ''));
                _b = parseFloat(b[hashKey].replace(',', ''));
            } else if (dataType === 'percentage') {
                _a = parseInt(a[hashKey].replace('%', ''));
                _b = parseInt(b[hashKey].replace('%', ''));
            } else if (dataType === 'xml') {
                tempObj.innerHTML = a[hashKey];
                _a = tempObj.textContent;
                tempObj.innerHTML = b[hashKey];
                _b = tempObj.textContent;
            }  

            if ((!_a || _a === -Infinity) && _a !== 0) {
                return 1;
            } else if ((!_b || _b === -Infinity) && _b !== 0) {
                return -1;
            } else return _a === _b ? 0 : isAsc ? ((_a < _b) ? -1 : 1) : ((_a > _b) ? -1 : 1);
        }
    }
    /*
     * Extend a given object with all the properties in passed-in object(s).
     */
    grid.utils.dm.clone = function(obj, deepCopy, delimiter) {

        var _tempObj = {},
            _this = this;

        if (!this.isObject(obj) || typeof obj === 'function') {
            return obj;
        }
        else {
            _this.__.utils.common.iterator(Object.keys(obj), function(key, index){
                if(deepCopy && delimiter.indexOf(key) < 0) {
                    _tempObj[key] = _this.clone(obj[key], deepCopy, delimiter);
                }
                else {
                    _tempObj[key] = obj[key];
                }
            });
            return _tempObj;
        }
    }

    /*
     * Is a given variable an object?
     */

    grid.utils.dm.isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    // array insert utility function
    Array.prototype.insert = function(index) {
        index = Math.min(index, this.length);
        arguments.length > 1 && this.splice.apply(this, [index, 0].concat([].pop.call(arguments))) && this.insert.apply(this, arguments);
        return this;
    };
    /**
     * Number.prototype.format(n, x)
     *
     * @param integer n: length of decimal
     * @param integer x: length of sections
     */
    Number.prototype.format = function(n, x) {
        var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\.' : '$') + ')';
        return this.toFixed(Math.max(0, ~~n)).replace(new RegExp(re, 'g'), '$&,');
    };
})(dGrid());