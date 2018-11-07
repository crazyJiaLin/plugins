
//将此构造方法直接挂在到window对象上
window.Cascade = (function($,window){
	//三段式
	//第一段，构造函数
	function Obj(options){
		//接受传进来的参数
		this.setParams(options);
		this.init();
	}
	//第二段，给构造对象原型链上挂在属性方法
	Obj.prototype = {
		constructor : Obj,
		setParams : function(option){
			this.$cascadeWrapper = option.$cascadeWrapper;
			this.cascades =	option.cascades;
			this.imgWrapperClass = option.imgWrapperClass || '';
			this.imgClass = option.imgClass || '';
			this.hasTitle = option.hasTitle || false;
			this.titleClass = option.titleClass || '';
			//组件内部变量	
			this.status = 'ready';
		},
		init : function(){
			//绑定滚动事件
			this._bindScroll();
		},
		
		_bindScroll : function(){
			var _this = this;
			$(window).on('scroll',function(ev){
				if(_this._watchBottom()){	//说明到达底部		
					if(_this.status == 'ready'){	//如果已经准备好了，就开始发请求，
						_this.status = 'stop';		//改变状态变量为stop,开始一心一意做DOM操作
							_this._requireData();
					}else{							//没有准备好的情况下不发请求
						return;
					}
				}
			});
		},
		_requireData : function(){
			var _this = this;
			$.ajax({
				type : 'GET',
				url : './server/data.json',
				dataType : 'json'
			}).done(function(data){
				if(data.errCode == 1){	
					//拿到数据，开始进行DOM操作
					_this._insertDOM(data.dataList,0);
				}else{
					console.log(data.errMsg);
				}
			}).fail(function(err){
				console.log('请求失败');
				console.error(err);
			});
		},
		/*	插入DOM节点函数，递归算法
		 * 	参数1，数据，数组
		 * 	参数2，开始操作数据的索引
		 * */
		_insertDOM : function(data,index){
			var _this = this;
			//当索引值大于等于数据的长度时，停止递归，将状态变量改为ready
			if(index >= data.length-1){	
				_this.status = 'ready';
				return;
			}
			
			//找到最小高度的盒子
			var insertBox = _this._findMinHeightBox();		
			
			//根据用户传参创建DOM节点
			var wrapper = document.createElement('div');
			wrapper.className = _this.imgWrapperClass;
			if(_this.hasTitle){			//判断传进的参数是否带有title，如果有，创建span标签
				wrapper.innerHTML =	'<img class="'+_this.imgClass+'" src="'+data[index].imgSrc+'" alt="数据图片" /><span class="'+_this.titleClass+'">'+data[index].title+'</span>';
			}else{
				wrapper.innerHTML = '<img class="'+_this.imgClass+'" src="'+data[index].imgSrc+'" alt="数据图片" />';
			}
			//将创建出来的节点插入到最小高度的盒子中
			insertBox.appendChild(wrapper);
			
			//递归
			_this._insertDOM(data, ++index);
		},
		
		//以下是工具方法
		_watchBottom : function(){		//工具方法，检测是否到达底部，是否应该发请求
			//获取浏览器可视窗口高度
			var windowHeight = $(window).height();
			//获取文档总高度
			var documentHeight = $(document).height();
			//获取文档卷过去的距离
			var scrollHeight = $(document).scrollTop();
			
			return (documentHeight - (windowHeight+scrollHeight) <= 0) ? true : false;
		},
		_findMinHeightBox:function(){		//工具方法，判断哪个盒子的高度最小,返回高度最小的盒子
			var _this = this;
			//先定义一个变量，然后通过循环来寻找最小高度的盒子，改变他的属性
			var minHeightBoxObj = {
				minHeightBox : _this.cascades[0],	//一开始不能设置为null,否则当第一个最小的时候，这个null不能被改变，之后就获取不到了
				minHeight : $(_this.cascades[0]).outerHeight()
			};
			for(var i=0;i<_this.cascades.length;i++){
				if($(_this.cascades[i]).outerHeight() < minHeightBoxObj.minHeight){
					minHeightBoxObj = {
						minHeightBox : _this.cascades[i],
						minHeight : $(_this.cascades[i]).outerHeight()
					};
				}
			}
			return minHeightBoxObj.minHeightBox;
		}
	};
	//第三段，将构造函数返回到挂在到window对象上的对象
	return Obj;
})(jQuery,window);


//实例化例子

//遵行的DOM结构，可以没有span
//		<div class="img-wrapper">
//			<img src="images/0.jpg" alt="" />
//			<span class="show-title"></span>
//		</div>
//var Cascade = new Cascade({
//	$cascadeWrapper : $('.wrapper'),				//必传
//	cascades :  $('.wrapper').children('.cascade'),	//必传
//	imgWrapperClass : 'img-wrapper',				//选传
//	imgClass : '',									//选传
//	hasTitle : true,								//选传
//	titleClass : 'show-title'						//选传
//});
