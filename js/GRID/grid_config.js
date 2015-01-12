(function(__) {

    var grid = __;
    
    grid.utils = grid.utils || {};    

    grid.utils.setDefaultConfig = function() {
        
        this.__.config =  $.extend(grid.config || {}, {
            // Component template
            "gridTpl": '<section class="grid-wrapper" ><section class="gridOverflow-Wrapper"><section class=grid-innerWrapper><section class="grid-header"><div class="leftColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div><div class="rightColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div></section><section class="grid-body"><div class="leftColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div><div class="rightColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div></section><section class="grid-footer hide"><div class="leftColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div><div class="rightColumns-wrapper scrollableWrapper"><div class="scrollable"></div></div></section></section></section></section>',
            "canHandelDataLoad": true,
            "initalDataLoad": false, // if true, look for data or else it will just show the header if available and the no data text 
            "dataRefreshed": true,
            "JSONData": {},
            "minHeight": 400, // min value should be > 0
            "rowHeight_Header": 70, // min value should be > 0
            "rowHeight_Body": 30, // min value should be > 0
            "subColumnsTitle": 9, // sub column title width 
            "rowsToLoad": 100, // min value should be > 0
            "rowCount": 0,
            "startingRowIndex": 0,
            "scrollThreshold": 92,
            "columnsCount": 0,
            "data": {},
            "fixedColumns": 0,
            "minVisibleColumns": 0,
            "columnPadding": 50, // left and right padding to be added while calculating width dynamically.
            "leftColumnsMinWidth": 100, // min value should be > 0
            "rightColumnMinWidth": 200, // min value should be > 0
            "fixedColumnsOrientation": 'left',
            "noDataTxt": 'No records to show', // length > 0 if 0 then insert this txt
            "appendOrientation": 'bottom',
            "proxy": {}, // check with canhandeldataload
            "resize": false,                   
            "cache": {},
            "initialLoad": true,
            "headerLoaded": false,
            "showHeaderOnLoad": false, // true headerConfig should not be empty
            "showLoader": true,
            "totalRowCountVal": 0, // if true  columnDelete should be set
            "allwaysScroll": {},
            "columnSeparator": {
                "separatorWidth": 0,
                "showSeparator": true
            },
            "footer": {
                "showFooter": true,
                "validate": []
            },
            "lazyLoad": {
                "callBack": new Function,
                "isLoading": false,
                "numberOfRowsViewable": 30, //count which specifies number of record's viwable without scrolling will be used to validate against min-height for grid
                "viewPortBufferSize": 100,
                "canDoLazyLoad": true,
                "lazyLoadBufferSize": 500,
                "startRowIndex": 0,
                "endRowIndex": 500, // should be equal or greater than the lazyLoadBufferSize on initial load
                "setProxyParamConfig": {},
                "totalRowCount": 0
            },
            "columnDelete": {
                "canColumnDelete": true
            },
            "isDraggable": false,
            "clazz": {
                "columnDelete": 'delColumn', // by default it should be null 
                "sortAscending": 'null', // by default it should be null 
                "sortDescending": 'null', // by default it should be null 
                "subTotalClass": 'subTotal',
                "loader": 'loader',
                "expandButton": 'expandBtn',
                "collapseButton": 'collapseBtn'
            },
            "sorting": {
                "isSorted": false,
                "sortKey": '',
                "isAsc": '',
                "sortCellType": "string",
                "sortCallBack": {}
            },
            "hiddenColumns": [],
            "headerArr": [], // > 0
            "headerConfig": {},
            "callBack": {
                "deleteColumn": {},
                "horizontalScrollCallback": {},
                "ajaxSuccessCallBack": {},
                "subGroupExpandCollapse": {}
            },
            "subTotal": {
                "showSubTotal": true,
                "hashkeyToCheck": 'SUB_TOTAL',
                "Truthy": "YES",
                "subTotalValue": {},
                "isSorted": true, // true - when canCalculateSubTotal true
                "canCalculateSubTotal": false,
                "cache": {},
                "groupBy": ['SalesOrg', 'lob'], //length > 0 when canCalculateSubTotal is true
                "subTotalIndex": [0] // add '0' by default as the starting index. if not added may cause problem with subGroups sorting
            },
            "lengthValidate": {
                "Validate": ['minHeight', 'rowHeight_Header', 'rowHeight_Body', 'rowsToLoad', 'leftColumnsMinWidth', 'rightColumnMinWidth']
            },
            "dataExtractor": {
                "extractData": true,
                "level": 0, // TODO level not working properly 
                "header": '',
                "rows": '#result-set-1',
                "total": '#result-set-1'
            },
            "dummyObj": {
                "header": {},
                "rows": [],
                "total": {}
            },
            "rowHighlight": {
                "hashkeyToCheck": '',
                "Truthy": "Y",
                "clazz": '',
                "doHighlight":false
            },
            "validate": {
                "height": new Function
            },
            "resizeConfig": {
                "snapDiff": 10,
                "pTimeStamp": 0,
                "cTimeStamp": 0,
                "lookForResize": false
            }
        });

        this.__.config.validate.height = function(_this) {
            var len = _this.utils.dm.getDataLength();
            if(_this.config.minHeight >= _this.config.rowHeight_Body * (len < _this.config.lazyLoad.numberOfRowsViewable ? len : _this.config.lazyLoad.numberOfRowsViewable)) {
                _this.config.gridBodyWrapper.css('height', _this.config.rowHeight_Body * len);
            }
            else if(len === 0) {
                this.config.gridBodyWrapper.css('height', this.config.rowHeight_Body * 2);
            }
            else {
                _this.config.gridBodyWrapper.css('height', _this.config.minHeight);   
            }
        };

        this.__.config.__ = __;
    };

})(dGrid());