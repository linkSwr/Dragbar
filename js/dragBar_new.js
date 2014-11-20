(function(window, document, $, undefined) {

  /*
  * defined static variable
  */
  var ONE_DAY_MILLISECOND = 24 * 3600000,
      HALF_MONTH_MILLISECOND = 15 * ONE_DAY_MILLISECOND;

  var template = {
        wrap: '<div id="rangeWrap" style="display:inline-block;"></div>',
        baseLine: '<div class="baseLine" style="background-color:#8cbecd;height:2px;"></div>',
        scaleWrap: '<div id="scaleWarp"></div>',
        barWrap: '<div class="wrap barWrap"></div>',
        leftHandle: '<div class="handle leftHandle" id="leftHandle">' +
                        '<div class="handle-inner leftHandle-inner">' +
                        '</div>' +
                    '</div>',
        rightHandle:  '<div class="handle rightHandle" id="rightHandle">' +
                        '<div class="handle-inner rightHandle-inner">' +
                        '</div>' +
                      '</div>',
        bar: '<div class="bar" id="bar"><div class="bar-inner"></div></div>',
        labelsWrap: '<div class="label-wrap"></div>',
        leftLabel: '<div class="handle-label leftHandle-label">' +
                      '<div class="label-value leftHandle-label-value"></div>' +
                      '<div class="label-inner leftHandle-label-inner"></div>' +
                      '<div class="label-triangle leftHandle-label-triangle"></div>' +
                   '</div>',
        rightLabel: '<div class="handle-label rightHandle-label">' +
                        '<div class="label-value rightHandle-label-value"></div>' +
                        '<div class="label-inner rightHandle-label-inner"></div>' +
                        '<div class="label-triangle rightHandle-label-triangle"></div>' +
                    '</div>'
  };


  // defined Class
  var DragBar = function(option) {
    this.init(option);
  };


  /**
  * @propertie {jquery dom obj} container
  * @propertie {Date} beginTime
  * @propertie {Date} endTime
  */
  // defined DragBat option
  DragBar.prototype.option = {
    container: $('body'),
    beginTime: '',
    endTime: '',
    barBeginTime: '',
    barwidth: 7
  };


  // Init DarBar
  DragBar.prototype.init = function(option) {
    extend(this.option, option);
    this.width = this.option.container.width();
    this.containerOffsetX = this.option.container.offset().left;

    this.settingDom();

    // build baseLine
    this.option.container.append(this.wrap);
    this.option.container.append(this.scaleWrap);
    this.renderBaseLine();

    // build scale
    this.scaleArr = createScaleData(this.option.beginTime.valueOf(), this.option.endTime.valueOf(), ONE_DAY_MILLISECOND, this.wrap.width());
    this.renderScale();
    this.setScaleBoundary();

    // build bar
    this.barWrap.append(this.leftHandle);
    this.barWrap.append(this.bar);
    this.barWrap.append(this.rightHandle);
    var labelsWrapTem = $(template.labelsWrap);
    labelsWrapTem.append(this.leftLabel);
    labelsWrapTem.append(this.rightLabel);
    this.barWrap.append(labelsWrapTem);
    this.option.container.append(this.barWrap);

    // bind event handler on leftHandle and rightHandle 
    this.leftHandle.bind(handleHandler.call(this, this.leftHandle));
    this.rightHandle.bind(handleHandler.call(this, this.rightHandle));
    this.bar.bind(handleHandler.call(this, this.bar));

    this.renderBar();
  };


  // render Scale
  DragBar.prototype.renderScale = function() {
    var scaleArr = this.scaleArr;
    var sLength = scaleArr.length;
    var sIndex = 0;
    var scaleTemplate = '';
    for (; sIndex < sLength; sIndex++) {
      scaleTemplate += getSectionTem(scaleArr[sIndex].width);
    }
    this.scaleWrap.append(scaleTemplate);
  };


  // render Bar
  DragBar.prototype.renderBar = function() {
    this.barWrap.css({
      left: '0px',
      width: this.scaleArr[this.option.barwidth].location - this.scaleArr[0].location + 'px'
    });
    this.setLeftLabelText(this.scaleArr[0].timeStamp);
    this.setRightLabelText(this.scaleArr[this.scaleArr.length - 1].timeStamp);
  };


  // render base line
  DragBar.prototype.renderBaseLine = function() {
    this.wrap.append(this.baseLine);
  };


  // setting bar's begin time or date
  DragBar.prototype.setLeftLabelText = function(time) {
    var tempDate = new Date(time);
    this.leftLabel.find('.leftHandle-label-value').text(tempDate.getMonth() + '.' + tempDate.getDate());
    this.barBeginDate = time;
  };


  // setting bar's begin time or date
  DragBar.prototype.setRightLabelText = function(time) {
    var tempDate = new Date(time);
    this.rightLabel.find('.rightHandle-label-value').text(tempDate.getMonth() + '.' + tempDate.getDate());
    this.barEndDate = time;
  };


  // setting all dom object
  DragBar.prototype.settingDom = function() {
    this.baseLine = $(template.baseLine);
    this.wrap = $(template.wrap);
    this.scaleWrap = $(template.scaleWrap);
    this.leftHandle = $(template.leftHandle);
    this.rightHandle = $(template.rightHandle);
    this.bar = $(template.bar);
    this.barWrap = $(template.barWrap);
    this.leftLabel = $(template.leftLabel);
    this.rightLabel = $(template.rightLabel);
  }


  // set scale's min location and max location
  DragBar.prototype.setScaleBoundary = function() {
    this.maxScaleLocation = this.containerOffsetX + this.scaleArr[this.scaleArr.length - 1].location + 3;
    this.minScaleLocation = this.containerOffsetX - 5;
  }

  /**
   * @private
   * defined private function 
   */

  // Extend target with all the properties in source
  function extend(target, source) {
    if (!isObject(target) &&
        !isObject(source)
    ) {
      return target;
    }

    var prop;
    for(prop in source) {
      target[prop] = source[prop];
    }
    return target;
  }


  // Return is obj a object
  function isObject(obj) {
    var type = typeof obj,
        instance = obj instanceof Array;
    return type === 'function' || type === 'object' && !!obj && !instance;
  }


  // binary search
  function binary_search() {
  }


  /**
  * @param {time stamp} startTime
  * @param {time stamp} endTime
  * @param {millisecond} timeScale
  * @param {number} wrapWidth
  * @return {Array}
  */
  // base on startTime and endTime create scale Array
  function createScaleData(startTime, endTime, timeScale, wrapWidth) {
    var resultLength = (endTime - startTime) / timeScale,
        sectionWidth = (wrapWidth - 1) / resultLength - 1,
        result = Array(resultLength + 1);

    for (var arrIndex = 0; arrIndex < resultLength; arrIndex++) {
      result[arrIndex] = {
        location: arrIndex * sectionWidth + arrIndex,
        timeStamp: startTime + timeScale * arrIndex,
        width: sectionWidth
      };
    }

    // deal the last item
    result[resultLength] = {
      location: sectionWidth * (resultLength + 1),
      timeStamp: endTime,
      width: 0
    };
    return result;
  }


  // get section template
  function getSectionTem(sectionwidth) {
    return '<div class="block" style="width:'+ 
            sectionwidth +
           'px;border-left:1px solid #8cbecd; height:6px; display:inline-block; position:relative;"></div>';
  }


  // defined leftHandle and rightHandle event
  function handleHandler(target) {
    var _ = this;
    $('body').bind(bodyHandler.call(this));
    return {
      mousedown: function(event) {
        // console.info('handle-mousedown', event);
        _.isMouseDown = true;
        _.controlTarget = target;
        _.downOffsetX = event.clientX;
        // _.downOffsetX = event.offsetX + _.barWrap.offset().left;
      }
      // mouseup: function(event) {
      //   // console.info('handle-mouseup', event);
      //   _.isMouseDown = false;
      // }
    }
  }


  // defined body handler
  function bodyHandler() {
    var _ = this;
    return {
      mousemove: function(event) {
        // console.info('body-mousemove', event);
        if (_.isMouseDown &&
            event.clientX <= _.maxScaleLocation &&
            event.clientX >= _.minScaleLocation
        ) {
          var dif = event.clientX - _.downOffsetX;
          switch (_.controlTarget) {

            // left handle dragged
            case _.leftHandle:

              _.barWrap.css({
                left: dif + _.barWrap.position().left + 'px',
                width: _.barWrap.width() - dif + 'px'
              });
              _.downOffsetX = event.clientX;
              break;

            // right handle dragged
            case _.rightHandle:

              _.barWrap.css({ 
                width: _.barWrap.width() + dif + 'px'
              });
              _.downOffsetX = event.clientX;
              break;

            // bar dragged
            case _.bar:
              var leftBoundary = dif + _.barWrap.offset().left,
                  rightBoundary = dif + _.barWrap.offset().left + _.barWrap.width();
              if (rightBoundary <= _.maxScaleLocation &&
                  leftBoundary >= _.minScaleLocation
              ) {
                _.barWrap.css({ 
                  left: dif + _.barWrap.position().left + 'px'
                });
              }
              _.downOffsetX = event.clientX;
              break;
          }
          // target.controlTarget.css('left', event.clientX - target.containerOffsetX);
        }
      },
      mouseup: function() {
        if (_.isMouseDown) {
          _.isMouseDown = false;
        }
      }
    }
  }

  // set 
  // Control interface
  window.DragBar = function(option) {
    var result = new DragBar(option);
    return {};
  };
})(window, window.document, (jQuery || $));
