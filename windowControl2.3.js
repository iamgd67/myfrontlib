/**
 * @author GodSon
 * http://www.btboys.com
 * date 2011-5-12 12:30	version 2.1
 * @How to use
 * var path = 'page/newFile.html';
 *	var confing = {
 *		url : path,
 *		title : "标题",
 *		width : 500,
 *		height : 150,
 *		maximizable : false,
 *		buttons : [{
 *				text : '继续>>',
 *				handler : function() {
 *					fun(GETWIN(this));
 *				}
 *		}]
 *	};
 *	var curDialogId = jQuery.createWin(confing);
 *	销毁
 *  jQuery(GETWIN(curDialogId)).destroy();
 */

/**
 * @param {Object} options
 * return windowId
 */
(function (jQuery) {
    /**
		 * 创建UUID
		 */
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    /**
		 * 生成windowId
		 */
    function CreateIndentityWindowId() {
        return "UUID-" + (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
    }
    /**
		 * 销毁
		 */
    function destroy(target) {
    	$(target).find(".combo-f").each(function () {  
	    	var panel = $(this).data().combo.panel;  
	    	panel.panel("destroy");
    	});  
        jQuery(target).dialog("destroy");
    }
		
    /**
		 * 获取当前操作的window
		 *  @param target 当前窗口的windowId 或者 当前窗口中的元素(element)
		 */
    function getWindow(target) {
        if (typeof target == "string") {
            return document.getElementById(target);
        } else {
            return jQuery(target).closest(".window-body");
        }
    }
		
    //入口方法
    //入口方法
    jQuery.createWin = function (options) {
    	var starttime = new Date();
        if (!options.url && !options.contents) {
            jQuery.messager.alert("提示", "缺少必要参数!(url or content)");
            return false;
        }
			
        var windowId = CreateIndentityWindowId();
			
        if (options.winId) {
            windowId = options.winId;
        }else{
            options.winId = windowId;
        }
			
        //如果存在buttons(请看easyui对buttons的定义)，默认添加关闭按钮
        var defaultBtn = [{
            text : '关闭',
            handler : function () {
            	
                jQuery("#" + windowId).dialog("close");
            }
        }
        ];
        jQuery.merge(options.buttons || [], defaultBtn);
			
        options = jQuery.extend({}, jQuery.createWin.defaults, options || {});
			
        if (options.isMax) {
            options.draggable = false;
            options.closed = true;
        }
			
        var dialog = jQuery('<div />').html('<div class="dialog-content" style="text-align:center;"><img src="'+ContextPath+'/images/loading.gif" /></div>');
		
		//alert (ContextPath+'/images/loading.gif') ;
			
        if (options.target != 'body') {
            options.inline = true;
        }
        dialog.appendTo(jQuery(options.target));
			
        dialog.dialog(jQuery.extend({},options,{
            onClose : function () {
                if (typeof options.onClose == "function") {
                    options.onClose.call(dialog);
                }
                destroy(this);
            },
            onMove : function (left, top) {
				console.log(top);
                if (typeof options.onMove == "function") {
                    options.onMove.call(dialog);
                }
                var o = jQuery.data(this, 'panel').options;
                if (top < 0) {
                    jQuery(this).dialog("move", {
                        "left" : left,
                        "top" : 0
                    });
                } else if (o.maximized) {
                    jQuery(this).dialog("restore");
                    jQuery(this).dialog("move", {
                        "left" : left + 100,
                        "top" : top
                    });
                }
                if (top > (jQuery(o.target).height() - 20) && (jQuery(o.target).height() - 25)>0) {
                    jQuery(this).dialog("move", {
                        "left" : left,
                        "top" : (jQuery(o.target).height() - 25)
                    });
                }
            }	,
			onMaximize:function(){
				//var o = jQuery.data(this, 'panel').options;
				//alert(options.winId);
				$fr=$("iframe[name='"+options.winId+"']");
				$fr.attr("height",$(window).height()-45);
				
				 
			},
			onRestore:function(){
				$fr=$("iframe[name='"+options.winId+"']");
				$fr.attr("height",options.height-45);
			}
        }));
		 
        dialog.attr("id", windowId);
        if (options.align) {
            var w = dialog.closest(".window");
            var h=jQuery(window).height();
            switch (options.align) {
                case "right":
                    dialog.dialog("move", {
                        left : w.parent().width() - w.width() - 10
                    });
                    break;
                case "tright":
                    dialog.dialog("move", {
                        left : w.parent().width() - w.width() - 10,
                        top : 0
                    });
                    break;
                case "bright":
                    dialog.dialog("move", {
                        left : w.parent().width() - w.width() - 10,
                        top : h - w.height() - 10                        
                    });
                    break;
                case "left":
                    dialog.dialog("move", {
                        left : 0
                    });
                    break;
                case "tleft":
                    dialog.dialog("move", {
                        left : 0,
                        top : 0
                    });
                    break;
                case "bleft":
                    dialog.dialog("move", {
                        left : 0,
                        top : h - w.height() - 10
                    });
                    break;
                case "top":
                    dialog.dialog("move", {
                        top : 0
                    });
                    break;
                case "bottom":
                    dialog.dialog("move", {
                        top : h - w.height() - 10
                    });
                    break;
                case "move":
                	dialog.dialog("move", {
                		left : (w.parent().width() - w.width())/2 ,
                        top : (h - w.height())/2
                    });
			//alert((h - w.height())/2);
                    break;
            }
        }
			
        if (options.isMax) {
            dialog.dialog("maximize");
            dialog.dialog("open");
        }
			
        if (options.contents) {
            ajaxSuccess(options.contents);
        } else {
            if (!options.isIframe) {
            	var end1 = new Date();
            	//alert(end.getTime()-starttime.getTime());
                jQuery.ajax({
                    url : options.url,
                    type : "POST",
                    data : options.data == null ? "" : options.data,
                    success : function (date) {
						 
                    	var end2 = new Date();
                        ajaxSuccess(date);
                    	var end3 = new Date();
                    	//alert(end1.getTime()-starttime.getTime());
                    	//alert("server:"+(end2.getTime()-end1.getTime()));
                    	//alert("client:"+(end3.getTime()-end2.getTime()));
                    	//alert("total:"+(end3.getTime()-starttime.getTime()));
                    	//alert("jquery:"+(t10.getTime()-t1.getTime()));
                    },
                    error : function () {
                        jQuery.messager.alert("提示", "加载失败！");
                    }
                });
            } else {
                ajaxSuccess();
            }
        }
        return windowId;
			
        /**
			 * 页面加载成功处理
			 */
        function ajaxSuccess(date) {
            if (options.isIframe && !date) {
                dialog.find("div.dialog-content").html('<iframe width="100%" name="'+options.ifname+'" height="'+(options.height-36)+'" frameborder="0" src="' + options.url + '" ></iframe>');
            } else {

                dialog.find("div.dialog-content").html(date);
            }
            //jQuery.parser.parse(dialog);
            dialog.find("select.easyui-combobox").each(function(){
				jQuery(this).combobox({});
			});
            dialog.find("input[required]").each(function(){
				jQuery(this).validatebox({required:true});
			});
            options.onComplete.call(this, windowId);
        }
    };
		
    //关闭并销毁实体
    jQuery.fn.destroy = function () {
        destroy(this);
    };
		
    window.GETWIN = getWindow;
		
    //默认参数
    jQuery.createWin.defaults = jQuery.extend({}, jQuery.fn.dialog.defaults, {
        url : '', //窗口要加载的html片段地址
        data : '', //可带参数，data类型为jqurey.ajax的data参数类型
        target : 'body', //指定窗口打开的区域,是一个jq的选择器，例如#id
        height : 200,
        width : 400,
        collapsible : false,
        minimizable : false,
        maximizable : false,
        closable : true,
        modal : true,
        shadow : false,
        onComplete : function (windowId) {}
    //创建成功后的回调方法
    });
})(jQuery);
 
