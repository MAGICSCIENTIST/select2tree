(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define('select2tree', ['jquery'], factory);
	} else if (typeof module !== 'undefined' && module.exports) {
		//node commonJs
		module.exports = factory(require('jquery'))
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {
	$.fn.select2tree = function (options) {
		var defaults = {
			language: "zh-CN",
			// theme: "bootstrap"
			// matcher: treeMatch
		};
		var opts = $.extend(defaults, options);
		opts.templateResult = function (data, container) {
			if (data.element) {
				//insert span element and add 'parent' property
				var $wrapper = $("<span></span><span>" + data.text + "</span>");
				var $element = $(data.element);
				$(container).attr("val", $element.val())
				if ($element.attr("parent")) {
					$(container).attr("parent", $element.attr("parent"));
					data.parent = $element.attr("parent");
				}
				return $wrapper;
			} else {
				return data.text;
			}
		};

		return $(this).select2(opts)
			.on("select2:open", open)
			.on("query", function () { moveOption() })
	};

	function treeMatch(params, data) {
		// If there are no search terms, return all of the data
		if ($.trim(params.term) === '') {
			return data;
		}


		//test
		if (params.term.indexOf('林') != -1) {
			debugger
		}
		// Skip if there is no 'children' property
		//   if (typeof data.children === 'undefined') {
		// 	return null;
		//   }

		// `data.children` contains the actual options that we are matching against
		if (data.children) {
			var filteredChildren = [];
			$.each(data.children, function (idx, child) {
				if (child.text.toUpperCase().indexOf(params.term.toUpperCase()) == 0) {
					filteredChildren.push(child);
				}
			});
		}

		// If we matched any of the timezone group's children, then set the matched children on the group
		// and return the group object
		if (filteredChildren.length) {
			var modifiedData = $.extend({}, data, true);
			modifiedData.children = filteredChildren;

			// You can return modified objects from here
			// This includes matching the `children` how you want in nested data sets
			return modifiedData;
		}

		// Return `null` if the term should not be displayed
		return null;
	}

	function moveOption(id) {
		if (id) {
			$(".select2-results__options li[parent=" + id + "]").insertAfter(".select2-results__options li[val=" + id + "]");
			$(".select2-results__options li[parent=" + id + "]").each(function () {
				moveOption($(this).attr("val"));
			});
		} else {
			$(".select2-results__options li:not([parent]):not(.loading-results)").appendTo(".select2-results__options ul");
			$(".select2-results__options li:not([parent]):not(.loading-results)").each(function () {
				moveOption($(this).attr("val"));
			});
		}
	}

	//deal switch action
	function switchAction(id, open) {
		$(".select2-results__options li[parent='" + id + "']").each(function () {
			switchAction($(this).attr("val"), open);
		});
		if (open) {
			$(".select2-results__options li[val=" + id + "] span[class]:eq(0)").removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-down");
			$(".select2-results__options li[parent='" + id + "']").slideDown("fast");
		} else {
			$(".select2-results__options li[val=" + id + "] span[class]:eq(0)").addClass("glyphicon-chevron-right").removeClass("glyphicon-chevron-down");
			$(".select2-results__options li[parent='" + id + "']").slideUp("fast");
		}
	}

	//get the level of li
	function getLevel(id) {
		var level = 0;
		while ($(".select2-results__options li[parent][val='" + id + "']").length > 0) {
			id = $(".select2-results__options li[val='" + id + "']").attr("parent");
			level++;
		}
		return level;
	}

	function open() {
		setTimeout(function () {
			moveOption();

			$(".select2-results__options li:not(.loading-results)").each(function () {
				var $this = $(this);
				//loop li add some classes and properties
				if ($this.attr("parent")) {
					$(this).siblings("li[val=" + $this.attr("parent") + "]").find("span:eq(0)").addClass("glyphicon glyphicon-chevron-down switch").css({
						"padding": "0 10px",
						"cursor": "default"
					});
					$(this).siblings("li[val=" + $this.attr("parent") + "]").find("span:eq(1)").css("font-weight", "bold");
				}
				//add gap for children
				if (!$this.attr("style")) {
					var paddingLeft = getLevel($this.attr("val")) * 2;
					$("li[parent='" + $this.attr("parent") + "']").css("padding-left", paddingLeft + "em");
				}
			});

			//override mousedown for collapse/expand 
			$(".switch").mousedown(function () {
				switchAction($(this).parent().attr("val"), $(this).hasClass("glyphicon-chevron-right"));
				event.stopPropagation();
			});

			//override mouseup to nothing
			$(".switch").mouseup(function () {
				return false;
			});
		}, 0);
	}

}))