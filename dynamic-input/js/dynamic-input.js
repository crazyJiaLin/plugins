/**
 * 动态input,支持动态添加删除input标签，输入懒加载提示
 * Author ： chenjialin
 * Date : 2018/9/2
 * 
*/
window.DynamicInput = (function($,window){
    //创建构造函数，接收传入的参数
    function Obj(options){
        this.setParms(options); //设置默认参数
        this.init();    //在函数体内执行初始化方法
    }

    //给构造函数绑定原型方法
    Obj.prototype = {
        constructor : Obj,  //将原型默认的构造器指向构造函数
        setParms : function(options){   //设置默认参数
            this.$domWrapper = options.$domWrapper; //实例容器  必传
            this.initData = options.initData || [];   //初始化数据，用来初始化input   选传
            this.onChange = options.onChange || null;   //改变的回调函数，   选传
            this.curResultIndex = -1;    //查询结果显示的初始索引值
            this.ajaxResults = [];  //ajax查询出来的数据
        },
        init : function(){      //初始化方法
            this._initDOM();
            this._bindClickAddItemEvent();
            this._bindKeyboardEvent();
            this._bindInputBlurEvent();
            this._bindDeleteItemEvent();
        },
        _initDOM : function(){  //根据初始数据初始化dom结构
            var domArr = [];
            for(var i=0; i<this.initData.length; i++){ 
                var itmeStr = `
                    <div class="dynamic-item" title="${this.initData[i].erp}">
                        ${this.initData[i].name} 
                        <span class="delete-item-btn" erp="${this.initData[i].erp}">
                            <i class="fa fa-close"></i>
                        </span>
                    </div>
                `;
                domArr.push(itmeStr.toString());
            }
            //添加按钮
            var addItemDOM = `
                <div class="add-item-wrapper">
                    <div class="add-item-btn">
                        <i class="fa fa-plus"></i> 添加
                    </div>
                    <div class="search-input-wrapper">
                        <input type="text" class="search-input outline">
                        <ul class="search-result-wrapper"></ul>
                    </div>
                </div>
            `;
            domArr.push(addItemDOM);
            this.$domWrapper.html(domArr.join(''));
        },
        _bindClickAddItemEvent : function(){     //绑定添加按钮事件
            var that = this;
            that.$domWrapper.on('click','.add-item-btn',function(){  
                $(this).hide().siblings('.search-input-wrapper').show().find('.search-input').focus();
            });
        },
        _bindKeyboardEvent : function(){   //绑定input回车事件
            var that = this;
            this.$domWrapper.on('keyup','.search-input',function(ev){
                ev = ev || window.event;
                ev.preventDefault();
                if(ev.keyCode == 13){   //回车
                   that._addItem(); //添加item
                }else if(ev.keyCode == 40){ //向下箭头,选中当前数据索引
                   that._moveFocusDown();
                }else if(ev.keyCode == 38){ //向上箭头
                    that._moveFocusUp();
                }else{
                    that._queryData();  //查询数据
                }
            });
        },
        _addItem :function(){
            var that = this;
            if(that.curResultIndex < 0){
                return;
            }
            var insertDomStr = `
                <div class="dynamic-item" title="${that.ajaxResults[that.curResultIndex].erp}">
                    ${that.ajaxResults[that.curResultIndex].name} 
                    <span class="delete-item-btn" erp="${that.ajaxResults[that.curResultIndex].erp}"><i class="fa fa-close"></i></span>
                </div>
            `;
            $('.add-item-wrapper').before(insertDomStr);    //将结果添加到显示图层中
            //清空input和result-wrapper并隐藏搜索框
            $('.search-input').val('');
            $('.search-result-wrapper').hide().html('');
            $('.search-input').parents('.search-input-wrapper').hide().siblings('.add-item-btn').show();
            that.initData.push(that.ajaxResults[that.curResultIndex]);
            that.onChange && that.onChange(initData,that.ajaxResults[that.curResultIndex]);
        },
        _queryData : function(){
            var that = this;
            //在这里进行ajax请求
            var timer = setTimeout(function(){
                var item = {
                    name : '陈佳霖'+that.curResultIndex,
                    erp : 'chenjialin'+that.curResultIndex
                }
                that.ajaxResults.push(item);
            },0);
            //发完请求后，将当前索引置为-1
            that.curResultIndex = -1;
            //显示result-wrapper
            that.ajaxResults.length > 0 ? $('.search-result-wrapper').show() : $('.search-result-wrapper').hide();
            //根据数据给result-wrapper中添加dom
            var resultDomArr = [];
            for(var i=0; i<that.ajaxResults.length; i++){
                var itemStr = `
                    <li class="result-item"> ${that.ajaxResults[i].name}（${that.ajaxResults[i].erp}）</li>
                `;
                resultDomArr.push(itemStr.toString());
            }
            $('.search-result-wrapper').html(resultDomArr.join(''));
        },
        _moveFocusDown : function(){
            var that = this;
            that.curResultIndex++;
            if(that.curResultIndex >= $('.search-result-wrapper').find('.result-item').length){
                that.curResultIndex = 0;
            }
            $('.search-result-wrapper').find('.result-item').eq(that.curResultIndex).addClass('active').siblings('li').removeClass('active');
            $('.search-input').val(that.ajaxResults[that.curResultIndex].name);
        },
        _moveFocusUp : function(){
            var that = this;
            that.curResultIndex--;
            if(that.curResultIndex < 0){
                that.curResultIndex = $('.search-result-wrapper').find('.result-item').length -1;
            }
            $('.search-result-wrapper').find('.result-item').eq(that.curResultIndex).addClass('active').siblings('li').removeClass('active');
            $('.search-input').val(that.ajaxResults[that.curResultIndex].name);
        },
        _bindInputBlurEvent : function(){   //input是去焦点隐藏
            var that = this;
            that.$domWrapper.on('blur','.search-input',function(){
                //清空input和result-wrapper并隐藏搜索框
                $(this).val('');
                $('.search-result-wrapper').hide().html('');
                $(this).parents('.search-input-wrapper').hide().siblings('.add-item-btn').show();
            });
        },
        _bindDeleteItemEvent : function(){
            var that = this;
            that.$domWrapper.on('click','.delete-item-btn',function(){
                var deleteErp = $(this).attr('erp');
                console.log(deleteErp);
                $(this).parents('.dynamic-item').remove();
                that._deleteObjFromArr(that.initData,'erp',deleteErp);
                that.onChange && that.onChange(that.initData,{});   //将当前数据传输给
            });
        },
        _deleteObjFromArr : function(listArr,key,value){
            for(var i=0; i<listArr.length; i++){
                if(listArr[i][key] == value){
                    listArr.splice(i,1);
                    return listArr;
                }
            }
        }
    }
    
    //将构造函数返回给匿名函数自执行的返回值中，即挂载到window对象下的DynamicInput对象
    return Obj;

})($,window);