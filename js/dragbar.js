var dragbar = function(param) {

      //常用静态变量
  var ONE_DAY_MILLISECOND = 24 * 3600000,
      HALF_MONTH_MILLISECOND = 15 * ONE_DAY_MILLISECOND,
      //初始化的必要参数
      container = param.parent || $('body'),
      selectionChange = param.selectionChange || function(){},
      barChange = param.barChange || function(){},
      selectionStartDate = param.selectionStartDate || new Date(),
      selectionEndDate = param.selectionEndDate || new Date(),
      barBeginLength = parseInt(today.valueOf() - (new Date(today.getFullYear(),0,1)).valueOf())  / HALF_MONTH_MILLISECOND) - 1 || param.barBeginLength || 6,

      _dateArr = [],
      today = new Date(),
      
      leftDateIndex = 0,
      rightDateIndex = barBeginLength, 
      selectionDataArr = [],
      dateSelection = '',
      selectionExample = '',
      isDragingScroll =  false,
      
      beginTime = '',
      endTime = '',
      rightLabelValue = '',
      leftLabelValue = '',
      isMouseDown = false;


  var _createButton = function(container){
    var container = container ? container : $('body');
    container.append('<div id="rangeSlider-arrow" class="rangeSlider-arrow"></div>');
    var arrowBox = $("#rangeSlider-arrow"),
        leftArrowStr = '<div class="arrow leftArrow"></div>',
        rightArrowStr = '<div class="arrow rightArrow"></div>';
    arrowBox.append(rightArrowStr + leftArrowStr);  
  }

  var _createSelection = function(container,selectionData){

    var container = container ? container : $('body'),
        today = new Date();
        thisYear = today.getFullYear(),
        thisMonth = today.getMonth(),
        thisDate = today.getDate();

    container.append('<div id="selectionWrap" class="wrap"></div>');
    $('#selectionWrap').append('<select id="dateSelection" style="display:none;"></select>');

    dateSelection = $('#dateSelection');

    if( selectionData && selectionData.length){

      var arrLength = selectionData.length;
      for(var index = 0 ; index < arrLength ; index++){

        if( thisMonth == 0 && 
            thisDate == 1 && 
            selectionData[index].text == thisYear - 1){
          dateSelection.append('<option value="'+ selectionData[index].value +'" data-index="' + index + '" selected>'+ optionData[index].text + '</option>');
        } else if( thisMonth == 0 && 
                   thisDate == 2 && 
                   thisYear == optionData[index].text){

          dateSelection.append('<option value="'+ selectionData[index].value +'" data-index="' + index + '" selected>'+ optionData[index].text + '</option>');
        } else if(thisYear == optionData[index].text){

          dateSelection.append('<option value="'+ selectionData[index].value +'" data-index="' + index + '" selected>'+ optionData[index].text + '</option>');
        } else {

          dateSelection.append('<option value="'+ selectionData[index].value +'" data-index="' + index + '">'+ optionData[index].text + '</option>');
        }
      }
    }
  }
  
  var _renderBaseLine = function( container , height){

    container.append('<div id="rangeWrap" style=" display:inline-block;width:'+ 
                      (container.width() - 179) +'px;"></div>');
    $('#rangeWrap').append('<div class="baseLine" style="height:'+ 
                            height +'px; background-color:#8cbecd;"></div>');
    return;
  }
 
  //渲染Dragbar的刻度
  //后面更新应该独立把这个分离出来，用border来做刻度有很大的局限性，改为用一个div来代替，
  //并且提供回调接口提供刻度的个性化
  var _renderRuler = function( start , end , container , model){

    var containerLength = container.width() - 179,
        sundayArr = _getSundays(start,end),
        dateArr = [],
        dateNum = '';

    if( !model || model != 'year'){

      dateNum = (end.valueOf() - start.valueOf()) / ONE_DAY_MILLISECOND;
    } else {

      dateNum = 24;
    }

    var eachBlockWidth = ( containerLength - dateNum - 1)/ dateNum,
        enabledBlockStr = '<div class="block" style="width:'+ eachBlockWidth +'px;border-left:1px solid #8cbecd; height:6px; display:inline-block; position:relative;"></div>',
        
        circlePoint = '<div class="block sundayNode" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; margin-left:1px;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        lastOneNoCirclePoint = '<div class="block lastBlock" style="width:'+ eachBlockWidth +'px;border-left:1px solid #8cbecd;border-right:1px solid #8cbecd; height:6px; display:inline-block; position:relative;"></div>',
        lastOneRightCirclePoint = '<div class="block sundayNode lastBlock lastSunday" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; border-left: 1px solid #8cbecd;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        lastOneLeftCirclePoint = '<div class="block sundayNode lastBlock" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; margin-left:1px; border-right:1px solid #8cbecd;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        blockStr = '';

    //处理标尺的多次重新渲染
    if( $("#scaleWarp").length != 0){
      $("#scaleWarp").empty();
    }

    if( !$("#scaleWarp").length ){
      container.append('<div id="scaleWarp"></div>');
    }

    //在月模式下进行渲染
    if( !model || model != 'year'){

        for( var i = start.valueOf(), sunDayIndex = 0, index = 0; i < end.valueOf() - ONE_DAY_MILLISECOND; i += ONE_DAY_MILLISECOND, index++){

          if(  sunDayIndex < sundayArr.length && 
                i == sundayArr[sunDayIndex].valueOf()){
            blockStr += circlePoint;
            sunDayIndex++;
          } else {
            blockStr += enabledBlockStr;
          }
          dateArr.push(
            {
              location:{
                x: eachBlockWidth * index + index + 1
              },
              date: i,
              width: eachBlockWidth
            }
          );
        }

        //处理最后一个区间的数据
        dateArr.push(
          {
            location:{
              x: eachBlockWidth * dateArr.length + dateArr.length + 1
            },
            date: dateArr[dateArr.length - 1].date + ONE_DAY_MILLISECOND,
            width: eachBlockWidth
          }
        );
        dateArr.push(
          {
            location:{
              x: eachBlockWidth * dateArr.length + dateArr.length + 1
            },
            date: dateArr[dateArr.length - 1].date + ONE_DAY_MILLISECOND,
            width: eachBlockWidth
          }
        );

        
        $("#scaleWarp").append(blockStr);

        //最后一个日期的节点特别处理
        if(_isSunday(end)){
          $("#scaleWarp").append(lastOneRightCirclePoint);
        } else if(_isSunday(new Date(end.valueOf() - ONE_DAY_MILLISECOND))){
          $("#scaleWarp").append(lastOneLeftCirclePoint);
        }
        else{
          $("#scaleWarp").append(lastOneNoCirclePoint);
        }

        //处理每个圆点下面的日期
        var sundayTagArr = $(".sundayTag"),
            sundayTagNum = sundayTagArr.length;
            
        if(sundayTagArr.length !== 0){
          for(var index = 0 ; index < sundayTagNum ; index++){
            var tempObj = $(sundayTagArr[index]);
            tempObj.html(sundayArr[index].getMonth() + 1 + '.' + sundayArr[index].getDate());
            tempObj.css('left' , -tempObj.width() / 2);
          }
        }

    } else {
      //在年模式下对刻度进行渲染
      for( var index = 0 , i = 0; index < 12 ; index++,i += 2){
        if( index != 11){
          blockStr += circlePoint + enabledBlockStr;
        } else {
          blockStr += circlePoint + lastOneRightCirclePoint;
        }

        dateArr.push(
          {
            location:{
              x: eachBlockWidth * i + i + 1
            },
            date: (new Date(start.getFullYear(),start.getMonth() + index , 1)).valueOf(),
            width: eachBlockWidth
          }
        );
        dateArr.push(
          {
            location:{
              x: eachBlockWidth * (i + 1) + i + 1
            },
            date: (new Date(start.getFullYear(),start.getMonth() + index , new Date(start.getFullYear(),start.getMonth() + 1 , 0).getDate() / 2)).valueOf(),
            width: eachBlockWidth
          }
        );
      }

      //处理最后一个日期
      dateArr.push(
        {
          location:{
            x: eachBlockWidth * 24 + 24
          },
          date: (new Date(start.getFullYear(),11 , new Date(start.getFullYear() + 1, 1 ,0).getDate())).valueOf(),
          width: eachBlockWidth
        }
      );

      $("#scaleWarp").append(blockStr);
      //处理每个圆点下面的日期
      var sundayTagArr = $(".sundayTag"),
          sundayTagNum = sundayTagArr.length;

      for(var index = 0 , i  = 0 ; index < dateArr.length ; index +=2, i++){
        var tempObj = $(sundayTagArr[i]);
        tempObj.html((new Date(dateArr[index].date)).getMonth() + 1 + '.' + (new Date(dateArr[index].date)).getDate());
        tempObj.css('left' , -tempObj.width() / 2);
      }
      
    }
    return dateArr;
  }

  //渲染选区
  //布局在外层加多一层div可以简化很多渲染操作
  var _renderBar = function(start , end , container){

      var barWrapStr = '<div class="wrap barWrap"></div>',
          leftHandleStr = '<div class="handle leftHandle" id="leftHandle">' +
                              '<div class="handle-label leftHandle-label">' +
                                  '<div class="label-value leftHandle-label-value"></div>' +
                                  '<div class="label-inner leftHandle-label-inner"></div>' +
                                  '<div class="label-triangle leftHandle-label-triangle"></div>' +
                              '</div>' +
                              '<div class="handle-inner leftHandle-inner">' +
                              '</div>' +
                          '</div>',
          rightHandleStr = '<div class="handle rightHandle" id="rightHandle">' +
                              '<div class="handle-label rightHandle-label">' +
                                  '<div class="label-value rightHandle-label-value"></div>' +
                                  '<div class="label-inner rightHandle-label-inner"></div>' +
                                  '<div class="label-triangle rightHandle-label-triangle"></div>' +
                              '</div>' +
                              '<div class="handle-inner rightHandle-inner">' +
                              '</div>' +
                            '</div>',
          barStr = '<div class="bar" id="bar"><div class="bar-inner"></div></div>',
          container = container ? container : $('body'),
          barWrap = $(barWrapStr);

      if($(".barWrap").length === 0){
        barWrap.append(leftHandleStr + barStr + rightHandleStr);
        container.append(barWrap);
      }
      var leftHandle = $(".barWrap #leftHandle"),
          rightHandle = $(".barWrap #rightHandle"),
          bar = $(".barWrap #bar");

      leftHandle.css('left',start - 6 + 'px');
      rightHandle.css('left',end - 6 + 'px');
      bar.css({ left:start + 'px',width: (end - start) + 'px'});
      
  } 

  //判断当前时间是否为星期天
  var _isSunday = function( date ){
    return !(date.getDay());
  }

  //获取某段时间之内的所有星期天
  var _getSundays = function( begin , end ){
   
    var beginDay = begin.getDay(),
        beginDate =begin.getDate(),
        beginMilliSecond = begin.valueOf(),
        endMilliSecond = end.valueOf(),
        sundayArr = new Array();
      
    for(var i = beginMilliSecond + (( beginDay != 0 ? (6 - beginDay + 1) : 0) * ONE_DAY_MILLISECOND); i <= endMilliSecond ; i += 7 * ONE_DAY_MILLISECOND){
      sundayArr.push(new Date(i));
    }
    return sundayArr;
  }

  //获取当前月份的最大天数
  var _getMaxDay = function ( date ){
    var thisDate = date ? date : new Date();
    return new Date( thisDate.getFullYear(),thisDate.getMonth(),0 );
  }

  //为selection、左右按钮、bar绑定事件
  var _bindEvent = function(){

   var  mainHandle = null,
        handleId = null,
        mouseLastLocation = 0,
        bardiff = 0,
        dateArrLength = _dateArr.length,
        leftRightDistance = 0,
        leftTimeOut = '',
        rightTimeOut = '',

        bar = $("#bar"),
        leftHandle = $("#leftHandle"),
        rightHandle = $("#rightHandle"),
        rightLabel = $(".rightHandle-label"),
        leftLabel = $(".leftHandle-label");


    rightLabelValue =$(".rightHandle-label-value");
    leftLabelValue =$(".leftHandle-label-value");
    $('html').bind({
      mousemove: function(event){

        if(isMouseDown){
          
          if( handleId == 'leftHandle'){
            if( Math.abs(event.clientX - (container.offset().left + _dateArr[leftDateIndex].location.x)) < _dateArr[leftDateIndex].width / 2){
              return;
            }
            if( event.clientX < container.offset().left + _dateArr[leftDateIndex].location.x && _dateArr[leftDateIndex].location.x > 0){
              if(_dateArr[leftDateIndex].date - selectionStartDate < ONE_DAY_MILLISECOND || leftDateIndex == 0){
                return;
              }
              leftDateIndex--;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            } else{
              if(_dateArr[leftDateIndex + 1].date > (new Date()).valueOf() || leftDateIndex + 1 >= rightDateIndex){
                return;
              }
              leftDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            leftLabelValue.html(_dateFormat(new Date(_dateArr[leftDateIndex].date)));
            // leftLabel.fadeIn('fast');
            // clearTimeout(leftTimeOut);
            // leftTimeOut = setTimeout(function(){

            //   leftLabel.fadeOut('normal');
            // },1000);
            //注释了流畅滑动
            // bar.css({
            //   left: event.clientX + 'px',
            //   width: bar.width() + bar.offset().left - event.clientX - 8 + "px"
            // });
            // leftHandle.css('left',event.clientX - 6 + 'px');

          } else if( handleId == 'rightHandle'){

            if( Math.abs(event.clientX - (container.offset().left + _dateArr[rightDateIndex].location.x)) < _dateArr[rightDateIndex].width / 2 || rightDateIndex == leftDateIndex){
              return;
            }
            if( event.clientX < (container.offset().left + _dateArr[rightDateIndex].location.x) && rightDateIndex - 1 > 0 && _dateArr[rightDateIndex - 1].location.x > _dateArr[leftDateIndex].location.x){
              rightDateIndex--;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            } else if( _dateArr[rightDateIndex].location.x < _dateArr[dateArrLength - 1].location.x && event.clientX > (container.offset().left + _dateArr[rightDateIndex].location.x)){
              if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < ONE_DAY_MILLISECOND){
                return;
              }
              rightDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            rightLabelValue.html(_dateFormat(new Date(_dateArr[rightDateIndex].date)));
            // rightLabel.fadeIn('fast');
            // clearTimeout(rightTimeOut);
            // rightTimeOut = setTimeout(function(){

            //   rightLabel.fadeOut('normal');
            // },1000);
            //注释了流畅滑动
            // bar.css('width',bar.width() + event.clientX - rightHandle.offset().left + "px");
            // rightHandle.css('left',event.clientX - 8 + 'px');

          } else if( handleId == 'bar'){

            if( Math.abs(event.clientX - (container.offset().left + bar.offset().left + bardiff) + 6) < (_dateArr[leftDateIndex].width / 2) ){
              return;
            }
            if(event.clientX < (container.offset().left + bar.offset().left + bardiff) &&  _dateArr[leftDateIndex].location.x > 0){

              if(leftDateIndex - 1  != -1){
                rightDateIndex--;
                leftDateIndex--;
                _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
                
              }

            } else if(_dateArr[rightDateIndex].location.x < _dateArr[dateArrLength - 1].location.x){
              if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < ONE_DAY_MILLISECOND){
                return;
              }
              rightDateIndex++;
              leftDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            leftLabelValue.html(_dateFormat(new Date(_dateArr[leftDateIndex].date)));
            rightLabelValue.html(_dateFormat(new Date(_dateArr[rightDateIndex].date)));
            rightLabel.fadeIn('fast');
            leftLabel.fadeIn('fast');
            clearTimeout(leftTimeOut);
            clearTimeout(rightTimeOut);
            rightTimeOut = setTimeout(function(){
              rightLabel.fadeOut('normal');
            },1000);
            leftTimeOut = setTimeout(function(){
              leftLabel.fadeOut('normal');
            },1000);

            // isDragingBar = true;
            // bar.css('left' , event.clientX - bardiff + 6);
            // var tempBarLeft = bar.offset().left;
            // leftHandle.css('left' , event.clientX - bardiff + "px");
            // rightHandle.css('left' , event.clientX - bardiff + bar.width() + "px");
            // nowTime = (new Date()).valueOf();

            mouseLastLocation = event.clientX;
            
          }
          
        }

      },
      mouseup: function(event){
        if(isMouseDown){

          //触发选区发生变化时的回调函数
          barChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
          isMouseDown = false;
        }
        $('.arrowIsHovering').removeClass('arrowIsHovering');
        leftLabel.fadeOut(900);
        rightLabel.fadeOut(900);
      }
    });
    
    var handlerObj = {
      mousedown: function(event) {
        event.stopPropagation();
        event.preventDefault();
        isMouseDown = true;

        handleId = $(event.target).attr('id');
        if($(event.target).hasClass('bar-inner')){
          handleId = 'bar';
        } else if($(event.target).hasClass('leftHandle-inner')){
          $(event.target).addClass("arrowIsHovering");
          handleId = 'leftHandle';
        } else if($(event.target).hasClass('rightHandle-inner')){
          $(event.target).addClass("arrowIsHovering");
          handleId = 'rightHandle';
        }

        mouseLastLocation = event.clientX;
        bardiff = mouseLastLocation - (container.offset().left + bar.offset().left);
        
      },
      mouseup: function(event) {
        if(isMouseDown){
          //触发选区发生变化时的回调函数
          barChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
          isMouseDown = false;
          leftLabel.fadeOut(900);
          rightLabel.fadeOut(900);
        }
      }

    }

    $("#bar ,.bar-inner,.rightHandle-inner,.leftHandle-inner").bind(handlerObj);
    $(".rightHandle-inner,.leftHandle-inner").bind(
      {
        mousemove: function(event){
          if($(this).hasClass('leftHandle-inner')){
            leftLabel.fadeIn(0);
          } else {
            rightLabel.fadeIn(0);
          }
        },
        mouseleave:function(event){
          if($(this).hasClass('leftHandle-inner') && isMouseDown == false){
            leftLabel.fadeOut(0);
          } else if(isMouseDown == false){
            rightLabel.fadeOut(0);
          }
        }
      }
    );

    //绑定seletion事件
    var selectionHandler = function(event){ 

      var selectValue = event.target.value,
          year = 0,
          month = 0,
          isYearModel = false;

      if( selectValue.length > 4 ){
        year = parseInt(selectValue.split('.')[0]);
        month = parseInt(selectValue.split('.')[1]);
      } else {
        year = parseInt(selectValue);
        isYearModel = true;
      }

      if(isYearModel){
        _dateArr = _renderRuler( new Date(year,0,1) , _getMaxDay(new Date(year,11,1)) , container ,'year');
      } else {
        _dateArr = _renderRuler( new Date(year,month - 1,1) , _getMaxDay(new Date(year,month,1)) , container );
      }
      
      dateArrLength = _dateArr.length;
      if(leftDateIndex == rightDateIndex){
        barBeginLength = _dateArr.length - 1;
      }
      leftDateIndex = 0;
      rightDateIndex = _dateArr.length - 1;
      _renderBar(0 , _dateArr[_dateArr.length - 1].location.x, container);
      selectionExample.setSelectedIndex(this.selectedIndex);

      //触发选区发生变化时的回调函数
      barChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
    }

    dateSelection.bind('change',selectionHandler);

    var bindButtonEvent = function(event){
      event.stopPropagation();
      event.preventDefault();
      leftRightDistance = rightDateIndex - leftDateIndex;
      if($(this).attr('class').indexOf('rightArrow') !== -1){
        
        //处理左边界左移
        if( leftDateIndex < leftRightDistance && $('#dateSelection').val().indexOf('.') === -1){

          leftDateIndex = 0;
          rightDateIndex = leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

        } else if( leftDateIndex < leftRightDistance){

          if(_dateArr[leftDateIndex].date - ONE_DAY_MILLISECOND * leftRightDistance < selectionStartDate.valueOf() ){
            _dateArr = _renderRuler( new Date(selectionStartDate.valueOf()), new Date(_dateArr[dateArrLength - 1].date - ONE_DAY_MILLISECOND * ((_dateArr[leftDateIndex].date - selectionStartDate.valueOf()) / ONE_DAY_MILLISECOND - leftDateIndex)) , container);
          } else{
            _dateArr = _renderRuler( new Date(_dateArr[leftDateIndex].date - ONE_DAY_MILLISECOND * leftRightDistance), new Date(_dateArr[dateArrLength - 1].date - ONE_DAY_MILLISECOND * (leftRightDistance - leftDateIndex)) , container);
          }
          dateArrLength = _dateArr.length;
          leftDateIndex = 0;
          rightDateIndex = leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

          //处理selection
          var tempValue  = $("#dateSelection").val().split(".");
          if(tempValue[1] > 1 && ((new Date(_dateArr[dateArrLength - 1].date)).getMonth() + 1) < tempValue[1] && $("#dateSelection")[0].selectedIndex + 1 < $("#dateSelection option").length){
            $("#dateSelection")[0].selectedIndex++;
          } else if(tempValue[1] == 1 && (new Date(_dateArr[dateArrLength - 1].date)).getFullYear() < tempValue[0] && $("#dateSelection")[0].selectedIndex + 2 < $("#dateSelection option").length){
            $("#dateSelection")[0].selectedIndex += 2;
          }
          
          selectionExample.setSelectedIndex(dateSelection[0].selectedIndex);
        } else {

          rightDateIndex = rightDateIndex == leftDateIndex && leftDateIndex - 1 >= 0 ? leftDateIndex - 1 : leftDateIndex;
          if(leftDateIndex - leftRightDistance >=0 && leftRightDistance !=0){
            leftDateIndex -=  leftRightDistance;
          } else if(leftDateIndex - 1 >=0){
            leftDateIndex -= 1
          } else {
            return;
          }
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

        }

      } else {

       //处理右边界右移移动

       //年模式下的超出右边界的情况处理
        if(rightDateIndex + leftRightDistance > dateArrLength - 1 && $('#dateSelection').val().indexOf('.') === -1 && _dateArr[dateArrLength - 1].date <= (new Date()).valueOf()){
          rightDateIndex = dateArrLength - 1;
          leftDateIndex = rightDateIndex - leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

        } else if( rightDateIndex + leftRightDistance > dateArrLength - 1 && $('#dateSelection').val().indexOf('.') != -1){

          //月模式下的超出右边界的情况处理
          if(selectionEndDate.valueOf() < _dateArr[rightDateIndex ].date + ONE_DAY_MILLISECOND * leftRightDistance && selectionEndDate.valueOf() - _dateArr[rightDateIndex].date > ONE_DAY_MILLISECOND)
          {
            _dateArr = _renderRuler( new Date(_dateArr[0].date + selectionEndDate.valueOf() - _dateArr[dateArrLength - 1].date), new Date(_dateArr[dateArrLength - 1].date + ONE_DAY_MILLISECOND * (selectionEndDate.valueOf() - _dateArr[dateArrLength - 1].date)/ONE_DAY_MILLISECOND) , container );
          } else if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date > ONE_DAY_MILLISECOND){
            _dateArr = _renderRuler( new Date(_dateArr[leftRightDistance].date), new Date(_dateArr[dateArrLength - 1].date + ONE_DAY_MILLISECOND * leftRightDistance) , container );
          } else {
            return;
          }
          dateArrLength = _dateArr.length;
          rightDateIndex = dateArrLength - 1;
          leftDateIndex = rightDateIndex - leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

          //处理selection
          var tempValue  = $("#dateSelection").val().split(".");
          if(tempValue[1] < 12 && (new Date(_dateArr[0].date)).getMonth() + 1 > tempValue[1] && $("#dateSelection")[0].selectedIndex > 0){
            $("#dateSelection")[0].selectedIndex-- ;
          } else if(tempValue[1] == 12 && (new Date(_dateArr[0].date)).getFullYear() > tempValue[0] && $("#dateSelection")[0].selectedIndex > 1){
            $("#dateSelection")[0].selectedIndex -= 2;
          }

          selectionExample.setSelectedIndex(dateSelection[0].selectedIndex);

        } else if((selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < (ONE_DAY_MILLISECOND * leftRightDistance) && $('#dateSelection').val().indexOf('.') != -1) || 
                    (selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < (ONE_DAY_MILLISECOND * leftRightDistance * 15) && $('#dateSelection').val().indexOf('.') == -1)){

          if($('#dateSelection').val().indexOf('.') != -1){
            rightDateIndex += parseInt((selectionEndDate.valueOf() - _dateArr[rightDateIndex].date) / (ONE_DAY_MILLISECOND));
          } else {
            rightDateIndex += parseInt((selectionEndDate.valueOf() - _dateArr[rightDateIndex].date) / HALF_MONTH_MILLISECOND);
          }
          leftDateIndex = rightDateIndex - leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
        }else{

          leftDateIndex = rightDateIndex;
          rightDateIndex += leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
        }

      }
      leftLabelValue.html(_dateFormat(new Date(_dateArr[leftDateIndex].date)));
      rightLabelValue.html(_dateFormat(new Date(_dateArr[rightDateIndex].date)));
      buttonClickTime = (new Date()).valueOf();
      rightLabel.css('display','block');
      leftLabel.css('display','block');
      // clearTimeout(leftTimeOut);
      clearTimeout(rightTimeOut);
      rightTimeOut = setTimeout(function(){
        rightLabel.fadeOut('fast');
        leftLabel.fadeOut('fast');
      },1000);
      // leftTimeOut = setTimeout(function(){
      //   leftLabel.css('display','none');
      // },1000);

      //触发选区发生变化时的回调函数
      barChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
      return false;
    }

    $('.rightArrow ,.leftArrow').bind({
      'click' : bindButtonEvent,
      'mouseup': function(event){
        return false;
      }
    });
  }

  //格式化日期
  var _dateFormat = function(date){
    if(date.getMonth() + 1 < 10 ){
      return '0' + (date.getMonth() + 1) + "." + date.getDate(); 
    }
    return (date.getMonth() + 1) + "." + date.getDate();
  }

  //创建selection数据
  var _createSelectionData = function(start,end){
    var startYear = start.getFullYear(),
        startMonth = start.getMonth(),
        endYear = end.getFullYear(),
        endMonth = end.getMonth(),
        dateList = [];

    for(var month = endMonth,year = endYear; year > startYear || (year == startYear && month >= startMonth);month--){
      if(month == 0){
        dateList.push({
          value: year + '.' + (month + 1),
          text: year + '.' + (month + 1)
        });
        dateList.push({
          value: year,
          text: year
        });
        year--;
        month = 11;
      }
      if(year >= startYear){
        dateList.push({
          value: year + '.' + (month + 1),
          text: year + '.' + (month + 1)
        });
      }
    }

    return dateList;
  }
 
  //用于初始化Dragbar的函数，方便DragBar于select组件的结合使用
  var _init = function(){
    if(today.getMonth() == 0 && today.getDate() == 1)
    {
      _dateArr = _renderRuler( new Date((new Date()).getFullYear() - 1,0,1) , new Date((new Date()).getFullYear() - 1,11,1) , container,'year' );
      barBeginLength = _dateArr.length;
      _renderBar(1 , _dateArr[_dateArr.length - 1].location.x + 1, container);
      leftDateIndex = 0;
      rightDateIndex = _dateArr.length - 1;
    } else{
      _dateArr = _renderRuler( new Date((new Date()).getFullYear(),0,1) , new Date((new Date()).getFullYear(),11,1) , container,'year' );
      _renderBar(1 , _dateArr[barBeginLength + 1].location.x, container);
      leftDateIndex = 0;
      rightDateIndex = barBeginLength + 1;
    }
   
    _renderBaseLine( container , 3);
    _createButton( container );
    selectionDataArr = _createSelectionData(selectionStartDate,selectionEndDate);
    
    _createSelection( container ,selectionDataArr);

    _bindEvent();

    selectionExample = new buildSelection({
      container: $('#selectionWrap'),
      valueChangeed: function(index,data){
        dateSelection[0].selectedIndex = index;
        dateSelection.trigger('change');
        leftLabelValue.html(_dateFormat(new Date(_dateArr[leftDateIndex].date)));
        rightLabelValue.html(_dateFormat(new Date(_dateArr[rightDateIndex].date)));
      },
      dataList: selectionDataArr
    });
    selectionExample.setSelectedIndex(dateSelection[0].selectedIndex);
    
    leftLabelValue.html(_dateFormat(new Date(_dateArr[leftDateIndex].date)));
    rightLabelValue.html(_dateFormat(new Date(_dateArr[rightDateIndex].date)));

    return {
      'beginTime': _dateArr[leftDateIndex].date,
      'endTime': _dateArr[rightDateIndex].date
    };
  }

  return _init();

};


//下面定义selection 组件
var buildSelection = function(param){
  var container = typeof(param.container) == "object" ? param.container : $('body'),
      dataArr = param.dataList || '',
      valueChangeedCallBack = param.valueChangeed || function(){},
      listItemShowNum = param.listItemShowNum || 6,

      scrollOffset = 0,
      selectionList = '',
      selectionListWrap = '',
      scrollInner = '',
      scrollbody = '',      
      dataArrLength = dataArr.length,    
      selectionValue = '时间',
      selectionLabel = '',
      position = '',
      selectionButton = '',
      listItemHeight = 24,  
      scrollHeight = (listItemShowNum / dataArrLength) * listItemHeight * listItemShowNum,
      mousedownClientY = 0,
      selectedIndex = 0,
      selectedData = {},
      isMouseDown = false;

  var _createDom = function(container){
    var selectionStr =  '<div class="selectionWrap">' +
                            '<div class="selectButton">' +
                              '<div class="selectLabel">' +
                                '<div class="selectLabel-value"></div>' +
                              '</div>' +
                              '<div class="selectLabel-arr-wrap">' +
                                '<div class="selectLabel-arr-inner"></div>' +
                              '</div>' +
                            '</div>' +
                            '<div class="selection-list-wrap">' +
                              '<div class="selection-list">' +
                                '<div class="selection-list-inner">' +
                                '</div>' +
                              '</div>' +
                              '<div class="selection-list-scroll">' +
                                '<div class="selection-list-scroll-inner">' +
                                  '<div class="selection-list-scroll-body"></div>' +
                                '</div>' +
                              '</div>' +
                            '</div>' +
                        '</div>';
        if( container.append ){
          var tempNode = $(selectionStr);
          scrollInner = tempNode.find('.selection-list-scroll-inner');
          scrollBody = tempNode.find('.selection-list-scroll-body');
          selectionLabel = tempNode.find('.selectLabel-value');
          selectionList = tempNode.find('.selection-list-inner');
          selectionListWrap =tempNode.find('.selection-list-wrap');
          selectionButton = tempNode.find('.selectButton');
          scrollInner = tempNode.find('.selection-list-scroll-inner');
          scrollbody = tempNode.find('.selection-list-scroll-body')
          // selectionListWrap.css("height",(listItemHeight * listItemShowNum) + "px");
          selectionListWrap.css(
            {
              'height': (listItemHeight * listItemShowNum) + "px",
              'top': (-listItemHeight * listItemShowNum) + "px"
            }
          );
          // tempNode = null;
          selectionLabel.html(selectionValue);

          container.append(tempNode);
        } else {
          console.warm("CreateDom False!");
        }
  
  }

  var _adddate = function(_dataArr){
    var _dataArrLength = _dataArr.length,
        nodeStr = '';
    for(var index = 0; index < _dataArrLength ; index++){
      dataArr.push(_dataArr[index]);
      nodeStr += '<div class="selection-list-item" data-value="'+ _dataArr[index].value +'">'+ _dataArr[index].text +'</div>';
    }
    dataArrLength = dataArr.length;
    selectionList.append(nodeStr);
  }

  var _renderList = function(){
    var nodeStr = '';
    for(var index = 0; index < dataArrLength; index++){
      nodeStr += '<div class="selection-list-item" data-value="'+ dataArr[index].value +'" data-index="'+ index +'">'+ dataArr[index].text +'</div>';
    }
    selectionList.append(nodeStr);
  }

  var _emptyList = function(){
    selectionList.empty()
  }

  var _renderScroll = function(){
    scrollHeight = (listItemShowNum / dataArrLength) * listItemHeight * listItemShowNum;
    scrollInner.css("height",scrollHeight + 'px');
  }

  var _resetScroll = function(difference){
      var showHeight = listItemHeight * listItemShowNum
      if((scrollInner.position().top <= 0 && difference < 0) || 
          (scrollInner.position().top >= (showHeight - scrollHeight) && 
          difference > 0) || selectionList.position().top > 1 || selectionList.position().top < (dataArrLength - listItemShowNum) * -listItemHeight - 5){
        return;
      }
      scrollInner.css("top", scrollInner.position().top + difference + "px");
      if(selectionList.position().top - difference * ( showHeight / scrollHeight ) > 0){
        selectionList.css('top', 0 + 'px');
      } else if(selectionList.position().top - difference * ( showHeight / scrollHeight ) < (dataArrLength - listItemShowNum) * -listItemHeight){
        selectionList.css('top', (dataArrLength - listItemShowNum) * (-listItemHeight) + 'px');
      } else {
        selectionList.css('top', selectionList.position().top - difference * ( showHeight / scrollHeight ) + 'px');
      }

  }

  var setSelectedIndex = function(index){
    selectionLabel.html(dataArr[index].text);
    selectedIndex = index;
    selectedData = dataArr[index];
  }

  var _buttonLabelHandler = function(){
    return {
      click : function(event){
        selectionListWrap.fadeToggle('fast');
        return false;
      }
    };
  }

  var _listItemHandler = function(){
    // var mousewheel = (document.all || document.mozHidden) ? "DOMMouseScroll" : "mousewheel"; 
    return {
      mouseup: function(event){
        selectionValue = $(this).html();
        selectionLabel.html(selectionValue);
        selectedIndex = $(this).attr('data-index');
        selectedData = dataArr[selectedIndex];
        selectionListWrap.fadeOut('fast');

        valueChangeedCallBack(selectedIndex,selectedData);

        return false;
      },
      mousedown: function(event){
        return false;
      },
      mousewheel: function(event){
        _resetScroll((-event.originalEvent.wheelDelta) / 40);
        // console.log(event.originalEvent.wheelDelta);
        return false;
      },
      DOMMouseScroll:function(event){
        _resetScroll(event.originalEvent.detail);
        // console.log(event);
        return false;
      },
      mouseenter:function(event){
        $(this).addClass("selection-list-item-active");
      },
      mouseout:function(){
        $(this).removeClass("selection-list-item-active");
      }
    };
  }

  var _scrollHandler = function(){
    return {
      mousedown: function(event){
        event.stopPropagation();
        if($(this).attr('class') == 'selection-list-scroll-inner' || $(this).attr('class') == 'selection-list-scroll-body'){
          mousedownClientY = event.clientY;
          isMouseDown = true;
        }

        return false;
      },
      mousemove: function(event){
        event.stopPropagation();
        if(isMouseDown){
          _resetScroll(event.clientY - mousedownClientY);
        }
        mousedownClientY = event.clientY;

      },
      mouseup: function(event){
        event.stopPropagation();
        isMouseDown = false;
        return false;
      }
    };
  }

  var _bindAllevent = function(){

    selectionButton.bind(_buttonLabelHandler());
    selectionList.delegate('.selection-list-item',_listItemHandler());
    scrollInner.bind(_scrollHandler());
    $('html').bind({
      mousedown: function(event){
        selectionListWrap.fadeOut('fast');
      },
      mousemove: function(event){
        event.stopPropagation();
        if(isMouseDown){
          _resetScroll(event.clientY - mousedownClientY);
        }
        mousedownClientY = event.clientY;
      },
      mouseup: function(event){
        isMouseDown = false;
        return false;
      }
    });
   
  }
  _createDom(container);
  _renderScroll();
  _renderList();
  _bindAllevent();

  return {
    'setSelectedIndex': setSelectedIndex
  }

}