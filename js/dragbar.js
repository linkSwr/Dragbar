var dragbar = function( param ) {

  var dragbarContainer = param.dragbarContainer || $('body'),
      barBeginLength = param.barBeginLength || 6,
      onSelectionChange = param.onSelectionChange || function(){},
      onBarChange = param.onBarChange || function(){},
      selectionStartDate = param.selectionStartDate || new Date(),
      selectionEndDate = param.selectionEndDate || new Date(),

      _dateArr = [],
      today = new Date(),
      leftDateIndex = 0,
      rightDateIndex = barBeginLength,
      selectionDataArr = [],
      dateSelection = '',
      selectionExample = '',
      isMouseDown = false,

      ONEDAY_MILLISECOND = 86400000;


  var _createButton = function(wrapper){

    var wrapper = wrapper || $('body');
    wrapper.append('<div id="rangeSlider-arrow" class="rangeSlider-arrow"></div>');

    var arrowBox = $("#rangeSlider-arrow"),
        leftArrowStr = '<div class="arrow leftArrow"></div>',
        rightArrowStr = '<div class="arrow rightArrow"></div>';
    arrowBox.append(rightArrowStr + leftArrowStr);  
  }

  var _createSelection = function(wrapper,optionData){

    var wrapper = wrapper || $('body');

    wrapper.append('<div id="selectionWrap" class="wrap"></div>');
    $('#selectionWrap').append('<select id="dateSelection" style="display:none;"></select>');

    dateSelection = $('#dateSelection');

    if( optionData && optionData.length){
      // console.log(optionData);
      var arrLength = optionData.length;
      for(var index = 0 ; index < arrLength ; index++){
        dateSelection.append('<option value="'+ optionData[index].value +'" data-index="' + index + '">'+ optionData[index].text + '</option>');
      }
    }
  }
  
  var _renderBaseLine = function( wrapper , height){

    wrapper.append('<div id="rangeWrap" style=" display:inline-block;width:'+ (wrapper.width() - 179) +'px;"></div>');
    $('#rangeWrap').append('<div class="baseLine" style="height:'+ height +'px; background-color: #8cbecd;"></div>');
    return;
  }
 
  var _renderRuler = function( start , end , wrapper , model){

    var parentLength = wrapper.width() - 179,
        sundayArr = getSundays(start,end),
        // startDate = start,
        // endDate = end,
        dateArr = [],
        dateNum = '';

    if( !model || model != 'year'){
      dateNum = (end.valueOf() - start.valueOf()) / ONEDAY_MILLISECOND;
    } else {
      dateNum = 24;
    }

    var eachBlockWidth = ( parentLength - dateNum - 1)/ dateNum,
        enabledBlockStr = '<div class="block" style="width:'+ eachBlockWidth +'px;border-left:1px solid #8cbecd; height:6px; display:inline-block; position:relative;"></div>',
        // disabledBlockStr = '<div class="block" style="width:'+ eachBlockWidth +'px;margin-left:1px;height:6px; display:inline-block; position:relative;"></div>',
        sundayPot = '<div class="block sundayNode" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; margin-left:1px;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        noSundayLastBlock = '<div class="block lastBlock" style="width:'+ eachBlockWidth +'px;border-left:1px solid #8cbecd;border-right:1px solid #8cbecd; height:6px; display:inline-block; position:relative;"></div>',
        rightSundayLastBlock = '<div class="block sundayNode lastBlock lastSunday" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; border-left: 1px solid #8cbecd;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        leftSundayLastBlock = '<div class="block sundayNode lastBlock" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; margin-left:1px; border-right:1px solid #8cbecd;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        rightSundayLastBlockNoLeftBorder = '<div class="block sundayNode lastBlock lastSunday" style="width:'+ 
          eachBlockWidth +'px;height:6px; display:inline-block; position:relative; margin-left:1px;">'+
          '<div class="sundayCircleBox">'+
          '<div class="sundayCircle"></div>'+
          '<div class="sundayTag"></div>'+
          '</div></div>',
        blockStr = '';

    if( $("#scaleWarp").length != 0){
      $("#scaleWarp").empty();
    }

    if( !$("#scaleWarp").length ){
      wrapper.append('<div id="scaleWarp"></div>');
    }

    if( !model || model != 'year'){

        for( var i = start.valueOf(), sunDayIndex = 0, index = 0; i < end.valueOf() - ONEDAY_MILLISECOND; i += ONEDAY_MILLISECOND, index++){

          if(  sunDayIndex < sundayArr.length && i == sundayArr[sunDayIndex].valueOf()){
            blockStr += sundayPot;
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
            date: dateArr[dateArr.length - 1].date + ONEDAY_MILLISECOND,
            width: eachBlockWidth
          }
        );
        dateArr.push(
          {
            location:{
              x: eachBlockWidth * dateArr.length + dateArr.length + 1
            },
            date: dateArr[dateArr.length - 1].date + ONEDAY_MILLISECOND,
            width: eachBlockWidth
          }
        );

        // $("#scaleWarp").append("<div class="">")
        $("#scaleWarp").append(blockStr);
        //最后一个日期特别处理
        if(isSunday(end)){
          $("#scaleWarp").append(rightSundayLastBlock);
        } else if(isSunday(new Date(end.valueOf() - ONEDAY_MILLISECOND))){
          $("#scaleWarp").append(leftSundayLastBlock);
        }
        else{
          $("#scaleWarp").append(noSundayLastBlock);
        }

        //处理每个圆点下面的日期
        var sundayTagArr = $(".sundayTag"),
            sundayTagNum = sundayTagArr.length;
            //console.log(sundayTagArr[0].text());
    
        if(sundayTagArr.length !== 0){
          for(var index = 0 ; index < sundayTagNum ; index++){
            var tempObj = $(sundayTagArr[index]);
            tempObj.html(sundayArr[index].getMonth() + 1 + '.' + sundayArr[index].getDate());
            tempObj.css('left' , -tempObj.width() / 2);
          }
        }

    } else {

      for( var index = 0 , i = 0; index < 12 ; index++,i += 2){
        if( index != 11){
          blockStr += sundayPot + enabledBlockStr;
        } else {
          blockStr += sundayPot + rightSundayLastBlock;
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

      // console.log(sundayTagArr);
      for(var index = 0 , i  = 0 ; index < dateArr.length ; index +=2, i++){
        var tempObj = $(sundayTagArr[i]);
        tempObj.html((new Date(dateArr[index].date)).getMonth() + 1 + '.' + (new Date(dateArr[index].date)).getDate());
        tempObj.css('left' , -tempObj.width() / 2);
      }
      
    }
    return dateArr;
  }

  var _renderBar = function(start , end , wrapper){

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
          wrapper = wrapper ||  $('body'),
          barWrap = $(barWrapStr);

      if($(".barWrap").length === 0){
        barWrap.append(leftHandleStr + barStr + rightHandleStr);
        wrapper.append(barWrap);
      }
      var leftHandle = $(".barWrap #leftHandle"),
          rightHandle = $(".barWrap #rightHandle"),
          bar = $(".barWrap #bar");

      leftHandle.css('left',start - 6 + 'px');
      rightHandle.css('left',end - 6 + 'px');
      bar.css({ left:start + 'px',width: (end - start) + 'px'});
      // barChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
  } 

  var isSunday = function( date ){
    return !(date.getDay());
  }

  var getSundays = function( begin , end ){
    // var firstDay = (new Date( year , month - 1 )).getDay(),
    var beginDay = begin.getDay(),
        beginDate =begin.getDate(),
        beginMilliSecond = begin.valueOf(),
        endMilliSecond = end.valueOf(),
        // endDay = begin.getDay(),
        sundayArr = new Array();
        // monthDays = (new Date( year , month - 1 , 0)).getDate();
    for(var i = beginMilliSecond + (( beginDay != 0 ? (6 - beginDay + 1) : 0) * ONEDAY_MILLISECOND); i <= endMilliSecond ; i += 7 * ONEDAY_MILLISECOND){
      sundayArr.push(new Date(i));
    }
    return sundayArr;
  }

  var getMaxDay = function ( date ){
    var thisDate = date || today;
    return new Date( thisDate.getFullYear(),thisDate.getMonth(),0 );
  }

  var bindEvent = function(dateArr){

   var  mainHandle = null,
        handleId = null,
        mouseLastLocation = 0,
        bardiff = 0,
        // _dateArr = dateArr,
        dateArrLength = _dateArr.length,
        // anotherHandle = handleId == 'rightHandle' ? $('#leftHandle') : $('#rightHandle'),
        bar = $("#bar"),
        leftHandle = $("#leftHandle"),
        rightHandle = $("#rightHandle"),
        // leftDateIndex = 0,
        // rightDateIndex = barBeginLength,
        leftRightDistance = 0,
        rightLabelValue =$(".rightHandle-label-value"),
        leftLabelValue =$(".leftHandle-label-value"),
        rightLabel = $(".rightHandle-label"),
        leftLabel = $(".leftHandle-label"),
        leftTimeOut = '',
        rightTimeOut = '';

    $('html').bind({
      mousemove: function(event){

        if(isMouseDown){
          
          if( handleId == 'leftHandle'){
            if( Math.abs(event.clientX - (dragbarContainer.offset().left + _dateArr[leftDateIndex].location.x)) < _dateArr[leftDateIndex].width / 2){
              return;
            }
            if( event.clientX < dragbarContainer.offset().left + _dateArr[leftDateIndex].location.x && _dateArr[leftDateIndex].location.x > 0){
              if(_dateArr[leftDateIndex].date - selectionStartDate < ONEDAY_MILLISECOND || leftDateIndex == 0){
                return;
              }
              leftDateIndex--;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              

            } else if(_dateArr[leftDateIndex + 1].location.x < _dateArr[rightDateIndex].location.x){
              leftDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            leftLabelValue.html(dateFormat(new Date(_dateArr[leftDateIndex].date)));
            leftLabel.fadeIn('fast');
            clearTimeout(leftTimeOut);
            leftTimeOut = setTimeout(function(){

              leftLabel.fadeOut('normal');
            },1000);
            //注释了流畅滑动
            // bar.css({
            //   left: event.clientX + 'px',
            //   width: bar.width() + bar.offset().left - event.clientX - 8 + "px"
            // });
            // leftHandle.css('left',event.clientX - 6 + 'px');

          } else if( handleId == 'rightHandle'){

            if( Math.abs(event.clientX - (dragbarContainer.offset().left + _dateArr[rightDateIndex].location.x)) < _dateArr[rightDateIndex].width / 2){
              return;
            }
            if( event.clientX < (dragbarContainer.offset().left + _dateArr[rightDateIndex].location.x) && _dateArr[rightDateIndex - 1].location.x > _dateArr[leftDateIndex].location.x){
              rightDateIndex--;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            } else if( _dateArr[rightDateIndex].location.x < _dateArr[dateArrLength - 1].location.x && event.clientX > (dragbarContainer.offset().left + _dateArr[rightDateIndex].location.x)){
              if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < ONEDAY_MILLISECOND){
                return;
              }
              rightDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            rightLabelValue.html(dateFormat(new Date(_dateArr[rightDateIndex].date)));
            rightLabel.fadeIn('fast');
            clearTimeout(rightTimeOut);
            rightTimeOut = setTimeout(function(){

              rightLabel.fadeOut('normal');
            },1000);
            //注释了流畅滑动
            // bar.css('width',bar.width() + event.clientX - rightHandle.offset().left + "px");
            // rightHandle.css('left',event.clientX - 8 + 'px');

          } else if( handleId == 'bar'){

            if( Math.abs(event.clientX - (dragbarContainer.offset().left + bar.offset().left + bardiff) + 6) < (_dateArr[leftDateIndex].width / 2) ){
              return;
            }
            if(event.clientX < (dragbarContainer.offset().left + bar.offset().left + bardiff) &&  _dateArr[leftDateIndex].location.x > 0){

              if(leftDateIndex - 1  != -1){
                rightDateIndex--;
                leftDateIndex--;
                _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
                
              }

            } else if(_dateArr[rightDateIndex].location.x < _dateArr[dateArrLength - 1].location.x){
              if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < ONEDAY_MILLISECOND){
                return;
              }
              rightDateIndex++;
              leftDateIndex++;
              _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
              
            }

            leftLabelValue.html(dateFormat(new Date(_dateArr[leftDateIndex].date)));
            rightLabelValue.html(dateFormat(new Date(_dateArr[rightDateIndex].date)));
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
          onBarChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
          isMouseDown = false;
        }
        $('.arrowIsHovering').removeClass('arrowIsHovering');

      }
    });
    
    var handlerObj = {
      mousedown: function(event) {
        event.stopPropagation();
        event.preventDefault();
        isMouseDown = true;
        // if( !mainHandle ){
        //   mainHandle = $(event.target);
        //   handleId = mainHandle.attr('id');
        // }
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
        bardiff = mouseLastLocation - (dragbarContainer.offset().left + bar.offset().left);
        
      },
      mouseup: function(event) {
        if(isMouseDown){
          //触发选区发生变化时的回调函数
          onBarChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
          isMouseDown = false;
        }
      }

    }

    // $("#rightHandle , #leftHandle ,#bar ,.bar-inner,.rightHandle-inner").bind(handlerObj);
    $("#bar ,.bar-inner,.rightHandle-inner,.leftHandle-inner").bind(handlerObj);

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
        _dateArr = _renderRuler( new Date(year,0,1) , getMaxDay(new Date(year,11,1)) , dragbarContainer ,'year');
      } else {
        _dateArr = _renderRuler( new Date(year,month - 1,1) , getMaxDay(new Date(year,month,1)) , dragbarContainer );
      }
      
      dateArrLength = _dateArr.length;
      leftDateIndex = 0;
      rightDateIndex = barBeginLength;
      _renderBar(0 , _dateArr[barBeginLength].location.x, dragbarContainer);
      selectionExample.setSelectedIndex(this.selectedIndex);

      //触发选区发生变化时的回调函数
      onBarChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);
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

          if(_dateArr[leftDateIndex].date - ONEDAY_MILLISECOND * leftRightDistance < selectionStartDate.valueOf() ){
            _dateArr = _renderRuler( new Date(selectionStartDate.valueOf()), new Date(_dateArr[dateArrLength - 1].date - ONEDAY_MILLISECOND * ((_dateArr[leftDateIndex].date - selectionStartDate.valueOf()) / ONEDAY_MILLISECOND - leftDateIndex)) , dragbarContainer);
          } else{
            _dateArr = _renderRuler( new Date(_dateArr[leftDateIndex].date - ONEDAY_MILLISECOND * leftRightDistance), new Date(_dateArr[dateArrLength - 1].date - ONEDAY_MILLISECOND * (leftRightDistance - leftDateIndex)) , dragbarContainer);
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

          rightDateIndex = leftDateIndex;
          leftDateIndex -= leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

        }

      } else {

        //处理右边界右移移动
        if(rightDateIndex + leftRightDistance > dateArrLength - 1 && $('#dateSelection').val().indexOf('.') === -1){

          rightDateIndex = dateArrLength - 1;
          leftDateIndex = rightDateIndex - leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );

        } else if( rightDateIndex + leftRightDistance > dateArrLength - 1){
          if(selectionEndDate.valueOf() < _dateArr[rightDateIndex ].date + ONEDAY_MILLISECOND * leftRightDistance && selectionEndDate.valueOf() - _dateArr[rightDateIndex].date > ONEDAY_MILLISECOND)
          {
            _dateArr = _renderRuler( new Date(_dateArr[0].date + selectionEndDate.valueOf() - _dateArr[dateArrLength - 1].date), new Date(_dateArr[dateArrLength - 1].date + ONEDAY_MILLISECOND * (selectionEndDate.valueOf() - _dateArr[dateArrLength - 1].date) / ONEDAY_MILLISECOND) , dragbarContainer );
          } else if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date > ONEDAY_MILLISECOND){
            _dateArr = _renderRuler( new Date(_dateArr[leftRightDistance].date), new Date(_dateArr[dateArrLength - 1].date + ONEDAY_MILLISECOND * leftRightDistance) , dragbarContainer );
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

        } else if(selectionEndDate.valueOf() - _dateArr[rightDateIndex].date < (ONEDAY_MILLISECOND * leftRightDistance)){

          rightDateIndex += parseInt((selectionEndDate.valueOf() - _dateArr[rightDateIndex].date) / ONEDAY_MILLISECOND);
          leftDateIndex = rightDateIndex - leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
        }else{

          leftDateIndex = rightDateIndex;
          rightDateIndex += leftRightDistance;
          _renderBar( _dateArr[leftDateIndex].location.x , _dateArr[rightDateIndex].location.x );
        }

      }

      leftLabelValue.html(dateFormat(new Date(_dateArr[leftDateIndex].date)));
      rightLabelValue.html(dateFormat(new Date(_dateArr[rightDateIndex].date)));
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

      //触发选区发生变化时的回调函数
      onBarChange(_dateArr[leftDateIndex].date,_dateArr[rightDateIndex].date);

    }

    $('.rightArrow ,.leftArrow').bind('click' , bindButtonEvent);
  }

  var dateFormat = function(date){
    if(date.getMonth() + 1 < 10 ){
      return '0' + (date.getMonth() + 1) + "." + date.getDate(); 
    }
    return (date.getMonth() + 1) + "." + date.getDate();
  }

  var createSelectionData = function(start,end){
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
  // renderScale( new Date(2014,5,6) , new Date(2014,6,7) , $("#slider") );

  // dateArr = _renderRuler( new Date((new Date()).getFullYear(),0,1) , new Date((new Date()).getFullYear(),11,1) , parent,'year' );
  _dateArr = _renderRuler(new Date(today.getFullYear(),today.getMonth(),1),new Date(today.getFullYear(),today.getMonth() + 1,0) , dragbarContainer);
  _renderBaseLine( dragbarContainer , 3);
  _createButton( dragbarContainer );
  selectionDataArr = createSelectionData(selectionStartDate,selectionEndDate);
  // createSelection( parent ,createSelectionData(selectionStartDate,selectionEndDate));
  _createSelection( dragbarContainer ,selectionDataArr);
  _renderBar(1 , _dateArr[barBeginLength + 1].location.x - 1, dragbarContainer);
  bindEvent();
  selectionExample = new buildSelection({
        container: $('#selectionWrap'),
        valueChangeed: function(index,data){
          dateSelection[0].selectedIndex = index;
          dateSelection.trigger('change');
        },
        dataList: selectionDataArr
       });

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

  var createDom = function(container){
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

  var adddate = function(_dataArr){
    var _dataArrLength = _dataArr.length,
        nodeStr = '';
    for(var index = 0; index < _dataArrLength ; index++){
      dataArr.push(_dataArr[index]);
      nodeStr += '<div class="selection-list-item" data-value="'+ _dataArr[index].value +'">'+ _dataArr[index].text +'</div>';
    }
    dataArrLength = dataArr.length;
    selectionList.append(nodeStr);
  }

  var renderList = function(){
    var nodeStr = '';
    for(var index = 0; index < dataArrLength; index++){
      nodeStr += '<div class="selection-list-item" data-value="'+ dataArr[index].value +'" data-index="'+ index +'">'+ dataArr[index].text +'</div>';
    }
    selectionList.append(nodeStr);
  }

  var emptyList = function(){
    selectionList.empty()
  }

  var renderScroll = function(){
    scrollHeight = (listItemShowNum / dataArrLength) * listItemHeight * listItemShowNum;
    scrollInner.css("height",scrollHeight + 'px');
  }

  var resetScroll = function(difference){
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

  var buttonLabelHandler = function(){
    return {
      click : function(event){
        selectionListWrap.fadeToggle('fast');
      }
    };
  }

  var listItemHandler = function(){
    // var mousewheel = (document.all || document.mozHidden) ? "DOMMouseScroll" : "mousewheel"; 
    return {
      click: function(event){
        selectionValue = $(this).html();
        selectionLabel.html(selectionValue);
        selectedIndex = $(this).attr('data-index');
        selectedData = dataArr[selectedIndex];
        selectionListWrap.fadeOut('fast');

        valueChangeedCallBack(selectedIndex,selectedData);
      },
      mousewheel: function(event){
        resetScroll((-event.originalEvent.wheelDelta) / 40);
        return false;
      },
      DOMMouseScroll:function(event){
        resetScroll(event.originalEvent.detail);
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

  var scrollHandler = function(){
    return {
      mousedown: function(event){
        if($(this).attr('class') == 'selection-list-scroll-inner'){
          mousedownClientY = event.clientY;
          isMouseDown = true;
        }
      },
      mousemove: function(event){
        if(isMouseDown){
          resetScroll(event.clientY - mousedownClientY);
        }
        mousedownClientY = event.clientY;

      },
      mouseup: function(event){
        isMouseDown = false;
      }
    };
  }

  var bindAllevent = function(){

    selectionButton.bind(buttonLabelHandler());
    selectionList.delegate('.selection-list-item',listItemHandler());
    scrollInner.bind(scrollHandler());
    $('html').bind(scrollHandler());
    // if (typeof(selectionList[0].onselectstart) != "undefined") {        
    //     // IE下禁止元素被选取        
    //     selectionList[0].onselectstart = new Function("return false");        
    // }
    // window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty(); 
  }
  createDom(container);
  renderScroll();
  renderList();
  bindAllevent();

  return {
    'setSelectedIndex': setSelectedIndex
  }

}