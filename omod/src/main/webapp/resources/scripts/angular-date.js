(function(window, angular) {
    'use strict';

    var inputDateFormat = 'yyyy-MM-dd';

    /**
     * Converts string representation of date to a Date object.
     *
     * @param dateString
     * @returns {Date|null}
     */
    function parseDateString(dateString) {
    	console.log('i m here');
    	console.log(dateString);
    	
        if ('undefined' === typeof dateString || '' === dateString) {
            return null;
        }

        var parts = dateString.split('-');
        if (3 !== parts.length) {
            return null;
        }
        var year = parseInt(parts[0], 10);
        var month = parseInt(parts[1], 10);
        var day = parseInt(parts[2], 10);

        if (month < 1 || year < 1 || day < 1) {
            return null;
        }

        return new Date(year, (month - 1), day);
    }

    /**
     * Converts DateTime object to Date object.
     *
     * I.e. truncates time part.
     * @param dateTime
     * @constructor
     */
    function ExtractDate(dateTime) {
    	console.log('i m here dateTime');
    	console.log(dateTime);
    	
        return new Date(
            dateTime.getUTCFullYear(),
            dateTime.getUTCMonth(),
            dateTime.getUTCDate()
        );
    }

    angular.module('ngInputDate', ['ng'])
        .factory('inputDate', function() {
            return {
                ExtractDate: ExtractDate
            };
        })
        .directive('input', ['dateFilter', function(dateFilter) {
        	console.log('i m here dateFilter');
        	console.log(dateFilter);
        	
            return {
                restrict: 'E',
                require: '?ngModel',
                link: function(scope, element, attrs, ngModel) {
                    if (
                           'undefined' !== typeof attrs.type
                        && 'date' === attrs.type
                        && ngModel
                    ) {
                        ngModel.$formatters.push(function(modelValue) {
                        	console.log('i m here modelValue');
                        	console.log(modelValue);
                        	
                        	var mv;
                        	
                        	if(modelValue && modelValue.length > 10){
                        		modelValue = modelValue.substr(0, 10);
                        		console.log(modelValue);
                        		mv = new Date(modelValue);
                        		console.log(mv);
                        	}
                        	else {
                        		mv = new Date(modelValue);
                        		console.log('mv');
                        		console.log(mv);
                        	}
                        	
                            return dateFilter(mv, inputDateFormat);
                        });

                        ngModel.$parsers.push(function(viewValue) {
                        	console.log('i m here viewValue');
                        	console.log(viewValue);
                        	
                            return parseDateString(viewValue);
                        });
                    }
                }
            }
        }])
    ;

})(window, angular);