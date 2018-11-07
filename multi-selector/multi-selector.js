
/**
 * 下拉框多选
 * 
*/
window.MultiSelector = (function($,window){
    //定义构造函数
    function Obj(options){
        this.setParms(options); //设置默认参数
        this.init();    //在函数体内执行初始化方法
    }

    //构造函数挂载原型方法
    Obj.prototype = {
        constructor : Obj,  //将原型默认的构造器指向构造函数
        setParms : function(options){   //设置默认参数
            this.$domWrapper = options.$domWrapper; //实例容器  必传
            this.initData = options.initData || [];   //初始化数据，用来初始化input   选传
            this.onChange = options.onChange || null;   //改变的回调函数，   选传
        },
        init : function(){      //初始化方法
            this._initDOM(); //初始化dom结构
            this._bindInputClickEvent(); //绑定input focus事件
            this._bindDocumentClickEvent(); //点击其他地方隐藏下拉列表
            this._changeItem();            //添加
        },
        //公有方法
        reset : function(resetData){    //外界传入data重新设置组件
            this.initData = resetData;
            this._initDOM();
        },
        //私有方法
        _initDOM : function(){
            var domHTML = `
                <div class="multi-selector-input-wrapper">
                    <div class="mulit-selector-input"></div>
                    <i class="fa fa-caret-down"></i>
                </div>
                <ul class="multi-selector-list"></ul>
            `;
            this.$domWrapper.html(domHTML);
            var itemArr = [];
            
            for(var key in this.initData){
                var itemDOM = `
                    <li class="multi-selector-item ${this.initData[key].select ? 'active' : ''}" ptnrid="${key}" partnerid="${this.initData[key].partner_id}">
                        <span class="multi-selector-item-html">${this.initData[key].ptnr_name}</span> 
                        <i class="fa fa-check"></i>
                    </li>
                `;
                itemArr.push(itemDOM);
            }
            this.$domWrapper.find('.multi-selector-list').html(itemArr.join(''));
            this._resetInputValue();    //input添加内容
        },
        _bindInputClickEvent : function(){  
            var that = this;
            that.$domWrapper.on('click','.multi-selector-input-wrapper',function(ev){
                ev = ev || window.event;
                ev.stopPropagation();
                ev.preventDefault();
                $(this).addClass('active');
                that.$domWrapper.find('.multi-selector-list').toggleClass('active');
            });
        },
        _changeItem : function(){  //点击节点
            var that = this;
            that.$domWrapper.on('click','.multi-selector-item',function(ev){
                ev = ev || window.event;
                ev.stopPropagation();
                ev.preventDefault();    
                $(this).toggleClass('active');
                var ptnr_id = $(this).attr('ptnrid');
                var partner_id = $(this).attr('partnerid');
                var ptnr_name = $(this).find('.multi-selector-item-html').html().trim();
                if($(this).hasClass('active')){
                    that.initData[ptnr_id] = {
                        partner_id : partner_id,
                        ptnr_name : ptnr_name,
                        select : true
                    }
                }else{
                    that.initData[ptnr_id] = {
                        partner_id : partner_id,
                        ptnr_name : ptnr_name,
                    }
                }
                that._resetInputValue();
                that.onChange && that.onChange(that.initData,that.initData[ptnr_id]);
            });
        },
        _bindDocumentClickEvent(){
            var that = this;
            $(document).on('click',function(){
                that.$domWrapper.find('.multi-selector-input-wrapper').removeClass('active');
                that.$domWrapper.find('.multi-selector-list').removeClass('active');
            });
        },
        _resetInputValue : function(){
            var inputValueArr = [];
            for(var key in this.initData){
                if(this.initData[key].select){
                    inputValueArr.push(this.initData[key].ptnr_name);
                }
            }
            if(inputValueArr.length>0){
                this.$domWrapper.find('.mulit-selector-input').html(inputValueArr.join(', ')).attr('title',inputValueArr.join(', '));
            }else{
                this.$domWrapper.find('.mulit-selector-input').html(`<span class="multi-selector-placeholder">多选</span>`);
            }
            
        }
    };

    //将构造函数返回给对MultiSelector对象
    return Obj;
})($,window)