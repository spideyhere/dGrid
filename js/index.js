$(document).ready(function() {
	
	var grid = {},
		utils = {};

	utils.ajax = function (_this, url, param, sync, dataType, callback, beforeSend, errCallback) {
    	var beforeSend = (beforeSend) ? beforeSend : function (){},
    		errCallback = (errCallback) ? errCallback : function (){},
    		sync = sync || true;
    		
        return $.ajax({
            url: url,
            type: 'POST',
            beforeSend: beforeSend,
            data: JSON.stringify(param || {}),
            async: sync,
            contentType: "application/json",
            dataType: dataType || 'text'
        }).done(function() {
        	if(callback) {
        		callback(arguments[0], _this);
        	}
        }).fail(function() {
        	if(errCallback) {
        		errCallback();
        	}
        });
    }

    grid.init = function() {
    	this.report = new dGrid();
    	utils.ajax(this, 'js/data/config.json', {}, false, 'JSON', this.getHeaderConfigCallBack);
    }

    grid.getHeaderConfigCallBack = function(response, _this) {
    	_this.report.utils.setDefaultConfig();
    	_this.report.utils.headerConfig(response);         
        _this.report.config.showHeaderOnLoad = true;
        _this.report.config.showTotal = false;
        _this.report.config.canHandelDataLoad = true;
        _this.report.config.initalDataLoad = true;
        _this.report.config.minHeight = 600;
        _this.report.config.subTotal.canCalculateSubTotal = false;
        _this.report.config.lazyLoad.canDoLazyLoad = false;
        _this.report.config.dataExtractor.extractData = true;
        _this.report.config.fixedColumns = 15;
        _this.report.init({
                    'url': 'js/data/data_type1.json',
                    'param': {},
                    'isAsync': true,
                    'dataType': 'json',
                    'wrapper': '.tableView-wrapper-type2'
                });              
    }

    grid.init();

});
