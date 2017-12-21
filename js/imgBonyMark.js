
$(function(){
	// if ( !$("#path").val() ){
	// 	disabled ="enabled"
	// }
	var record = "";
	var count = 0;


	var fileName = "";
	var oX, oY;
	var rectangle;
	var listCount ;
	var scale ;
	var isStart = true
	var canvasW,
			canvasH,
			startX,
			startY,
			moveX,
			moveY,
			endX,
			endY,
			distanceX,
			distanceY,
			lastX,
			lastY;

	var canvasDate = {};
	var recordIn = '';
	var isResize = false;
	var cat = '';

	var output = '';

	var nameArr,
			resultArr = [];
			resultArrWrap = [];
	// $("#store").animate({scrollTop:$("#store")[0].scrollHeight - $("#store").height()},1000) ;
	var tool = 'brush'
  var mode = 'bony'
  var dotMove = false

  var rightList = ['隐藏','可见','被遮挡']
  var currMaskIndex = 0;
  var dotNameArr = ['point1', 'point2', 'point3', 'point4', 'point5', 'point6', 'point7', 'point8', 'point9', 'point10', 'point11', 'point12', 'point13', 'point14', 'point15', 'point16', 'point17', 'point18', 'point19', 'point20', 'point21']
  let dotNameArrLeft = [];
  let dotNameArrRight = [];
  dotNameArr.forEach(item => {
	  dotNameArrLeft.push(item+'left');
	  dotNameArrRight.push(item+'right');
  })
  console.log(dotNameArrLeft);
  var dotNameArrShort = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21']

  $(':input').labelauty();
  $('#submit').removeClass("disabled");

  $('#toolsBar').attr("disabled",false);

  $('#bony').attr('disabled',false)


  $('#adjust').on('input propertychange',function(){
        $('.markDot').css('width',$('#adjust').val() + 'px');
        $('.markDot').css('height',$('#adjust').val() + 'px');

  })

  $('#clearResult').click(function(){
    var msg = "这样做会清除所有结果,不可恢复\n\n请确认！";
    if (confirm(msg)==true){
      $('#resultArea').val('')
      resultArrWrap = []
	  resultArr = []
      window.localStorage.SEGRESULT = ''
    } else{
      return false;
    }

  })
  $('#bonySave').click(function(){
    $('#seg').attr('disabled',false)
	let currentResult = resultArr[resultArr.length-1];
    if (typeof currentResult === 'object'){
		console.log(currentResult);
		enabledEvents('#addNewDotsLeft');
		enabledEvents('#addNewDotsRight');
		$("#dotBox").empty();
		$(".bonyBear").remove();

    } else {
      alert('未知错误')
      return
    }
	let boxCenter = genBoxCenter(currentResult.hand_pts);
	currentResult.hand_box_center = boxCenter;
	currentResult.is_left = isleft

    outputToTA()
    $("#resultArea").animate({scrollTop:$("#resultArea")[0].scrollHeight - $("#resultArea").height()},1000) ;
  })

var isleft = 1;

function disabledEvents(selector) {
	$(selector).css("pointer-events","none");
	$(selector).css("background","grey");

}

function enabledEvents(selector) {
	$(selector).css("pointer-events","");
	$(selector).css("background","#fbd91f");

}
  function addNewDots(hand){
	  disabledEvents('#addNewDotsLeft');
	  disabledEvents('#addNewDotsRight');
	  isleft = hand === 'left_hand' ? 1 : 0;
  	firstDragger = [];
    for (var i = 0; i < 21; i++) {
  	firstDragger.push(true);
    }
    let obj = {}
    obj.image_name = fileName

    resultArr.push(obj)

    if (typeof resultArr[resultArr.length-1] === 'object'){
  	$(this).addClass('disabled')
  	resultArr[resultArr.length-1].hand_pts = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
    } else {
  	alert('请先进行语义分割并保存')
  	return
    }

    for (var i = 0; i < dotNameArr.length; i++) {
  	let newDot = $('<div class="markDot ' + hand + '_'+dotNameArr[i] + '" name="mask'+currMaskIndex +'_' + dotNameArr[i] +'" ><div class="innerText">'+dotNameArrShort[i]+'</div></div>')
  	$("#dotBox").prepend(newDot)
    }


    let bonyBear = $('<img class="bonyBear" src="images/'+hand+'.png"/>')

    $("body").prepend(bonyBear)
    if(showBear) {
  	$('.bonyBear').css('z-index',1)
    } else {
  	$('.bonyBear').css('z-index',-99)
    }
  }

  $('#addNewDotsLeft').click(() => addNewDots('left_hand'));
  $('#addNewDotsRight').click(() => addNewDots('right_hand'));

  $('body').on("click",".rightMenu li",function(e){
    if($(this).index()==0) return
    console.log('rightMenu click')
    rightList = ['隐藏','可见','被遮挡']

    if (typeof resultArr[resultArr.length-1] === 'object'){
      resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][2] = $(this).index()-1

      if($(this).index()-1 === 0){   //选择隐藏
        currentDot.css('backgroundColor','#ff5e5e')
        resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][0] = 0
        resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][1] = 0
      } else if($(this).index()-1 === 2){  // 选择遮挡
        currentDot.css('backgroundColor','#eef31f')
      } else if($(this).index()-1 === 1){  //   可见
        currentDot.css('backgroundColor','#41ea2f')
      }
    } else {
      alert('未知错误')
    }

  })

  $('body').on("click",function(){
    $('.rightMenu').remove()
  })
  var showBear = true;
  var allMove = false;
  $('#showBear').click(function(){

    if(showBear){
      $('.bonyBear').css('z-index',-10)
    } else {
      $('.bonyBear').css('z-index',1)
    }
      showBear = !showBear
  })

  $('#allMove').click(function(){
      allMove = !allMove
  })

  $('.dowebok').on("click","input",function(){
    let model = $(this)[0].value

    if(model === 'bony'){   //切换至关节点
      $('.markDot').remove()
      $('#submit').addClass("disabled");
      $('#clearCanvas').addClass("disabled");
      $('.bonybt').removeClass("disabled");
      $('#toolsBar').attr("disabled",true);
      mode = 'bony'

      $('#previewMask').css('z-index',10)  //开启遮罩层, 避免选中问题
      $('#myCanvas').css('opacity',0)   //隐藏canvas 层
      $('.markDot').css('opacity',1)    //开启关节点
      $('.markDot').css('z-index',998)
      $('#bonySave').removeClass("disabled");
      $('#seg').attr('disabled',true)
    } else if(model === 'seg'){
      tool = 'brush'
      console.log('in seg');
      // $("#toolsBar option:checked").remove()
      $('#toolsBar option')[0].selected = true
      $('#toolsBar option')[1].selected = false

      $('#submit').removeClass("disabled");
      $('#clearCanvas').removeClass("disabled");
      $('.bonybt').addClass("disabled");
      $('#toolsBar').attr("disabled",false);
      mode = 'seg'

      $('#previewMask').css('z-index',-1)
      $('#myCanvas').css('opacity',1)
      $('.markDot').css('opacity',0)
      $('.markDot').css('z-index',-1)
      $('#bonySave').addClass("disabled");
      $('.bonyBear').remove()
      $('#bony').attr('disabled',true)
    }
  })
  isInnerText = false;
  $('body').on("mousedown",'.innerText',function(e){
    isInnerText = true
    console.log('inner click')
  })

  var firstDragger = []
  for (var i = 0; i < 21; i++) {
  	firstDragger.push(true);
  }
  $('body').on("mousedown",'.markDot',function(e){
    // $(this).css("left",e.pageX-5)
    // $(this).css("top",e.pageY-5)
    // moveY = e.pageY
    // moveX = e.pageX
    if(isInnerText){
      isInnerText = false
      return
    }
    currentDot = $(this)
    if (e.button==0){

      dotMove = true
      console.log('left click')
      if (firstDragger[dotNameArr.indexOf(GetDotName(currentDot))]){
        resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][2] = 1;
        currentDot.css('backgroundColor','#41ea2f')
        firstDragger[dotNameArr.indexOf(GetDotName(currentDot))] = false
      }

    } else if (e.button==2){      // 调出右键菜单
      $('.rightMenu').remove()
      // console.log($(this))
      // debugger
      rightList = ['隐藏','可见','被遮挡']

      if (typeof resultArr[resultArr.length-1] === 'object'){

        rightList[resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][2]]  +='✔️'
      } else {
        alert('未知错误')
      }

      let rightMenu =$("<ul class='rightMenu'><li class='dotName'>"+GetDotName($(this))+"</li><li>"+rightList[0]+"</li><li>"+rightList[1]+"</li><li>"+rightList[2]+"</li></ul>")
      rightMenu.css("top",e.pageY-16)
      rightMenu.css("left",e.pageX+1)
      $('body').append(rightMenu)
    }

  })

  $('body').on('contextmenu',function(){
    return false
  })

  $('body').on("mousemove",function(e){
    if(dotMove){
      let dotOffset = parseInt($('.markDot')[0].style.width)/2 || 5
      // console.log(dotOffset)
      if(allMove){
        $('#dotBox').css("left",e.pageX-currentDot[0].offsetLeft-dotOffset)
        $('#dotBox').css("top",e.pageY-currentDot[0].offsetTop-dotOffset)
      } else {
        currentDot.css("left",e.pageX-dotOffset-$('#dotBox')[0].offsetLeft)
        currentDot.css("top",e.pageY-dotOffset-$('#dotBox')[0].offsetTop)
      }
    }
  })

  $('body').on("mouseup",'.markDot',function(e){

    console.log('mouse Up')

    if (e.button==0){
      currentDot = $(this)
      dotMove = false
      if (typeof resultArr[resultArr.length-1] === 'object'){
        resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][0] = e.pageX - 200
        resultArr[resultArr.length-1].hand_pts[dotNameArr.indexOf(GetDotName(currentDot))][1] = e.pageY - 140
      } else {
        alert('未知错误')
      }
      console.log( resultArr)
    }
  })

	$('#toolsBar').on("click","option",function(){
		tool = $(this).val()
	})
  $('#clearCanvas').click(function(){
    oGC.clearRect(1,1,oriWidth-2,oriHeight-2);
    tool = 'brush'
    // $("#toolsBar option:checked").remove()
    $('#toolsBar option')[1].selected = false
    $('#toolsBar option')[0].selected = true
  })

  $('#bony').attr('disabled',true)

  $('#submit').click(function(){
		var targetColor;
		$('#mask2').show()

	})


	$("#genFileList").click(function(){
		if ($("#fileListInput").val() ){
			var fileArr = $("#fileListInput").val().split("\n");
			var selectDom = $("<select multiple></select>");

			$("#fileListInput").slideUp(1000);
			for (var i = 0; i < fileArr.length; i++) {
				if(fileArr[i]){
					var newOption =  $("<option>"+fileArr[i] +"</option>");
					newOption.appendTo(selectDom);
					if (!canvasDate[fileArr[i]]) {
						canvasDate[fileArr[i]] = []
					}
					// recordIn[fileArr[i]] = []
				}

			}
			$("#fileList").append(selectDom);
			$("#fileList select").slideDown(1000,function(){



				$("#fileList").trigger("change");
				$("#fileList option:eq(0)").click();
				$("#fileList option:eq(0)")[0].selected = "selected";
				// fileName =  $("#fileList option:eq(0)").val();
				// recordIn = fileName + " " + 0

				// $("#mark").val(recordIn);
				// count = 0;
				// $("#preview").attr("src","data/"+ fileName);
			});
			$(this).slideUp(1000);
			$("#nextImg").attr("disabled",false);
			$("#preImg").attr("disabled",false);
		}
		else {
			alert("请先将文件列表复制到这里")
		}

	});


	$("#nextImg").click(function(){
		var currOption,
			slecetScrollTop;

		currOption = $("#fileList option:selected");

		if(currOption.val() == $("#fileList option:last").val()){

		}
		else{
			currOption.next().click();
			currOption[0].selected = "";
			currOption.next()[0].selected = "selected";
		}
		if (listCount == 8)
		{
			slecetScrollTop = $("#fileList select").scrollTop() + 40;
			$("#fileList select").animate({scrollTop:slecetScrollTop},200);
		}
		else{
			listCount ++ ;
		}
		 // currOption.val()
	});

	$("#preImg").click(function(){
		var currOption;
		currOption = $("#fileList option:selected");

		if(currOption.val() == $("#fileList option:first").val()){

		}
		else{
			currOption.prev().click();
			currOption[0].selected = "";
			currOption.prev()[0].selected = "selected";
		}

		if (listCount == 1)
		{
			slecetScrollTop = $("#fileList select").scrollTop() - 40;
			$("#fileList select").animate({scrollTop:slecetScrollTop},200);
		}
		else{
			listCount --;
		}

	});


	$('#mask').hide()
	$('#mask2').hide()
	var canvasDom=$("#myCanvas");
	var oGC=canvasDom[0].getContext("2d");
	oGC.lineWidth = 3;
	var oriWidth,
			oriHeight;
  // oGC.strokeStyle = 'rgba(14,255,7,1)';

	$("#preview").on('load', function() {
		oriWidth = getNaturalWidth(this)
		oriHeight = getNaturalHeight(this)
		canvasDom[0].width = oriWidth
		canvasDom[0].height = oriHeight
				oGC.lineWidth = 3;
    currMaskIndex = 0
    $("#previewMask").css("width",oriWidth)
    $("#previewMask").css("height",oriHeight)

	 $('#mask').css({width:oriWidth,height:oriHeight})
	 //  debugger
	 //  $('#mask').show()
	 $('#mask2').css({width:oriWidth,height:oriHeight})
		// $('#mask')[0].height = oriHeight
		rect(oGC,1,1,oriWidth-2,oriHeight-2);
    oGC.clearRect(1,1,oriWidth-2,oriHeight-2);
		let screenWidth = document.body.clientWidth
		let screenHeight = document.body.clientHeight

		let adaptW = screenWidth - 200
		let adaptH = screenHeight - 140
		let tmpH = oriHeight * adaptW / oriWidth
		let tmpW = oriWidth * adaptH / oriHeight
		if (tmpH < adaptH ){
			adaptH = tmpH
			adaptW = adaptW
		}
		else {
			adaptW = tmpW
			adaptH = adaptH
		}
		scale = adaptW / oriWidth
		console.log('img load')

    $('#previewMask').css('z-index',-1)
    $('#myCanvas').css('opacity',1)
    $('.markDot').css('opacity',0)
    $('.markDot').css('z-index',-1)

    $('#addNewDotsLeft').removeClass("disabled");
    $('.bonyBear').remove()
    $('#bony').attr('disabled',true)

    // $('#seg').click()

    $('#bony').click()


		// this.style = 'width:' + adaptW + 'px; height:' + adaptH + 'px;'
		// canvasDom[0].width = adaptW
  	// 	canvasDom[0].height = adaptH

		// oGC.strokeStyle = 'rgba(14,255,7,1)';
		// for(let i = 0; i < canvasDate[fileName].length; i++ ){
		// 	canvasDate[fileName][i][7] = scale
		// }

		// oGC.clearRect(2,2, 3000,2500)

		//这里给 canvas 设置宽高会导致图形拉伸
		// [0].style = 'width:' + canvasW + 'px; height:' + canvasH + 'px;'

	})

	function saveFile(data, fileName) {
	    var saveLink = document.createElement( 'a');
	    saveLink.href = data;
	    saveLink.download = fileName;
	    saveLink.click();
			$('#mask2').hide()
	}

	canvasDom.mousemove(function(e){
		moveY = e.pageY
	  moveX = e.pageX
		// var markX = ((+(e.pageX ) - 200) ).toFixed(0)
		// var markY = ((+(e.pageY ) - 140) ).toFixed(0)
		$('.mousePosition').html("X Position:" + (moveX -200) + "<br>   Y Position:" + (moveY-140));

    if (mode === 'seg'){
      switch (tool) {
        case 'brush':
          if(!isStart){
            line(oGC, lastX, lastY, moveX, moveY)
            lastX = moveX
            lastY = moveY
          }
          break;
        case 'ellipse':
          if(!isStart){
            // oGC.clearRect(3,3, 796,796)

            distanceX = moveX - startX
            distanceY = moveY - startY
            EllipseOne(oGC, startX + distanceX / 2 - 200 , startY + distanceY / 2 - 140, Math.abs(distanceX / 2), Math.abs(distanceY / 2));
          }
          break;
        case 'rect':
          if(!isStart){
            // oGC.clearRect(3,3, 796,796)
            for (let i in canvasDate) {
              // console.log('draw' + canvasDate[i])
              rect(oGC, canvasDate[i][0] - 200, canvasDate[i][1]- 140, canvasDate[i][2], canvasDate[i][3]);
            }
            distanceX = moveX - startX
            distanceY = moveY - startY
            rect(oGC, startX - 200 , startY - 140, distanceX,distanceY);

          }
          break;
      }

    }

		// $('.mousePosition').html($("fileList").height());
		}).click(function(e){
      if (mode === 'seg'){
  			switch (tool) {
  		    case 'paintPot':
  		        $('#status').hide()
  						if(!$(".category option:checked")[0]) {
  							alert('请先添加颜色的样式')
  							return
  						}
  						let painColorArr = $(".category option:checked")[0].style.backgroundColor.slice(4,-1).split(',')
  						for (var i = 0; i < painColorArr.length; i++) {
  							painColorArr[i] = +painColorArr[i].trim()
  						}
  						painColorArr.push(255)
  						$('#mask').show()
  		        window.setTimeout(function(){
  		          if(painColorArr){
  		            scanLine(e.pageX,e.pageY,painColorArr,[0,0,0,255])
  		          }
  		          else{
  		            $('#status').show()
  		            alert('请不要用黑色填充')
  		          }
  		        },100)

  		      break;
  		    case 'brush':
  		      if(isStart){
  		        startX = e.pageX
  		        startY = e.pageY
  		        // oGC.clearRect(3,3, 796,796)
  		        isStart = false
  		        lastX = startX
  		        lastY = startY
  		        console.log(startX,startY)
  		      }
  		      else {
  		        console.log(startX,startY)
  		        line(oGC, lastX, lastY, startX, startY)
  		        isStart = true
  		      }
  		      break;
  		    case 'ellipse':
  		      if(isStart){
  		        startX = e.pageX
  		        startY = e.pageY
  		        isStart = false
  		      }
  		      else{
  		        // console.log('end x position:'+ e.pageX)
  		        // console.log('end y position:'+ e.pageY)

  		        isStart = true
  		     }
  		      break;
  		    case 'rect':
  		      if(isStart){
  		        startX = e.pageX
  		        startY = e.pageY
  		        isStart = false

  		      }
  		      else{
  		        // console.log('end x position:'+ e.pageX)
  		        // console.log('end y position:'+ e.pageY)

  		        isStart = true
  		        canvasDate.push([startX, startY, distanceX, distanceY])
  		      }
  		      break;
  		    default:

  		  }
      }
	});

	$("#category").on("click","option",function(){
		tool = 'paintPot'
		// $("#toolsBar option:checked").remove()
		$('#toolsBar option')[0].selected = false
		$('#toolsBar option')[1].selected = true
	})

	$("#fileList").on("click","option",function(){
		console.log('onchange')
			record = '';
			recordIn = '';
			resultArr = [];
			enabledEvents('#addNewDotsLeft');
			enabledEvents('#addNewDotsRight');
			resultArrWrap.push([]);
			if($('#auto').prop('checked'))
				{
					start = true;
				}
			else{
					start = false;
			}
			if (!listCount){
				listCount = $("#fileList option").index($(this));
			}

			fileName =  $(this).val();
			// //初始化列表框

			count = 0;
			$("#preview").attr("src","data/"+ fileName);

	});

	$('#upload').change(function(){
		if($('#auto').prop('checked'))
			{
				start = true;
			}
		else{
				start = false;
		}
		fileName = $('#upload')[0].files[0].name + "  ";

		count = 0;

		$("#preview").attr("src","data/"+ fileName);
	});

	// fortest
	// $("#fileListInput").val('BG2.jpg\nBG1.jpg');

	// $("#genFileList").click();
	// $('#addNewDots').click();

	$("#file").on("change", function () {
		// console.log(files)
		var files = $(this)[0].files
		if (files.length) {
			var file = files[0];
			var reader = new FileReader();
			if (/text\/\w+/.test(file.type)) {
					reader.onload = function() {
						var regExName = /\w+\.\w+/gm
						nameArr = this.result.match(regExName)



						$("#fileListInput").val(nameArr.join('\n'));

						$("#genFileList").click();
					}
					reader.readAsText(file);
			} else if(/image\/\w+/.test(file.type)) {
					reader.onload = function() {
							$('<img src="' + this.result + '"/>').appendTo('body');
					}
					reader.readAsDataURL(file);
			}
		}
	})

 // $("#fileListInput").val('desktop.jpg')
 // $("#genFileList").click();

	$("#color").val('#' + Math.floor(Math.random()*16777215).toString(16))

	$("#addCate").click(function(){
		var newCate = $(".newCateInput").val()
		var color =  $("#color").val()
		if(color === '#000000') {
			alert('不能选择黑色作为填充色')
			return
		}

		if (newCate) {
			categoryArr.push([newCate,color]);
			window.localStorage["data"] = JSON.stringify(categoryArr)
			var newCateDom = $('<option value="'+ newCate +'">'+ newCate +'</option>')
			// newCateDom.selected = 'true'
			newCateDom.css('background-color',color)
			$(".category").append(newCateDom);
			if($(".category option:selected")[0]){
				$(".category option:selected")[0].selected = ''
			}
			$(".category :last-child").attr('selected','selected').siblings().attr('selected',false)
			$(".newCateInput").val('')

			var newColor = '#' + Math.floor(Math.random()*16777215).toString(16)

			if (newColor==='#ffffff'){
				var newColor = '#' + Math.floor(Math.random()*16777215).toString(16)
			}
			$("#color").val(newColor)
		}


	})

	$("#delCate").click(function(){
		let delVal = $(".category option:checked").val()
		categoryArr.remove(delVal)
		var preCurrChecked = $(".category option:checked").next().length ? $(".category option:checked").next() : $(".category option:checked").prev()

		$(".category option:checked").remove()
		if(preCurrChecked.length){
			preCurrChecked[0].selected = 'selected'

		}
		window.localStorage["data"] = JSON.stringify(categoryArr)

	})


	//从 localstorage 初始化 categoryw

	var categoryArr = [];
  if (window.localStorage.data){
		categoryArr = JSON.parse(window.localStorage.data)
	}

	if(categoryArr.length){
		for (var i = 0; i < categoryArr.length; i++) {
			var newCateDom = $('<option value="'+ categoryArr[i][0] +'">'+ categoryArr[i][0] +'</option>')
			newCateDom.css('background-color',categoryArr[i][1])
			$(".category").append(newCateDom);
			$(".category :last-child").attr('selected','selected').siblings().attr('selected',false)
		}
	}


	Array.prototype.indexOf = function(val) {
				 for (var i = 0; i < this.length; i++) {
						 if (this[i] == val) return i;
				 }
				 return -1;
		 };
	Array.prototype.remove = function(val) {
		var temp = []
		for (var i = 0; i < this.length; i++) {
			temp.push(this[i][0])
		}
		 var index = temp.indexOf(val);
		 if (index > -1) {
				 this.splice(index, 1);
		 }
	};

	function line(context, x1, y1, x2, y2) {
	  context.beginPath();
	  context.lineWidth = 3;
	  context.moveTo(x1 - 200,y1 - 140);
	  context.lineTo(x2 - 200,y2 - 140);
	  context.closePath();
	  context.stroke();
	}


	function circle(context, x, y, a) { // x,y是坐标;a是半径
	    var r = 0.09; // ①注意：此处r可以写死，不过不同情况下写死的值不同
	    context.beginPath();
	    context.moveTo(x + a, y);
	    for(var i = 0; i < 2 * Math.PI; i += r) {
	        context.lineTo(x + a * Math.cos(i), y + a * Math.sin(i));
	    }
	    context.closePath();
	    context.stroke();
	}

	function rect(context, x, y,x2,y2) { // x,y是坐标;a是半径
	    context.beginPath();
	    context.rect(x,y,x2,y2)
	    context.closePath();
	    context.stroke();
	}
	function EllipseOne(context, x, y, a, b) {
	    var step = (a > b) ? 1 / a : 1 / b;
	    context.beginPath();
	    context.moveTo(x + a, y);
	    for(var i = 0; i < 2 * Math.PI; i += step) {
	        context.lineTo(x + a * Math.cos(i), y + b * Math.sin(i));
	    }
	    context.closePath();
	    context.stroke();
	}

	function getNaturalWidth(img) {
		var image = new Image()
		image.src = img.src
		var naturalWidth = image.width
		return naturalWidth
	}

	function getNaturalHeight(img) {
		var image = new Image()
		image.src = img.src
		var naturalHeight = image.height
		return naturalHeight
	}

	function getRGB(hex){
		var rgb=[0,0,0];
		if(/#(..)(..)(..)/g.test(hex)){
				rgb=[parseInt(RegExp.$1,16),parseInt(RegExp.$2,16),parseInt(RegExp.$3,16),255];
		};
		return rgb;
	}

	function scanLine(x,y,rgba,compareColor) {
	  seedStack.push([x-200,y-140])

	  //step 2
	  var currenSeed;
	  var xLeft,
	      xRight;

	  while (seedStack.length) {
	    if (seedStack.length > 10000) return
	    currenSeed = seedStack.pop()
	    var targetColor = oGC.getImageData(currenSeed[0], currenSeed[1],1,1).data
	    // if (rgba[0]==targetColor[0]) {
	    //   $('#status').show()
	    //   return
	    // }
	    if(currenSeed[0]!=currenSeed[0]){
	      xLeft = currenSeed[0]
	      xRight = currenSeed[0] - 1
	    }
	    else {
	      // isFill = false

	      xLeft = currenSeed[0]
	      xRight = currenSeed[0]
	    }
	    //find xleft
	    i = 1
	    targetColor = oGC.getImageData(currenSeed[0]-i, currenSeed[1],1,1).data
	    while(targetColor[3] < 10){
	      fillColor(currenSeed[0]-i,currenSeed[1],rgba)
	      xLeft = currenSeed[0]-i
	      i++
	      targetColor = oGC.getImageData(currenSeed[0]-i, currenSeed[1],1,1).data
	    }

	    //find xRight
	    i = 0
	    targetColor = oGC.getImageData(currenSeed[0]+i, currenSeed[1],1,1).data
	    while(targetColor[3] < 10){
	      fillColor(currenSeed[0]+i,currenSeed[1],rgba)
	      xRight = currenSeed[0]+i
	      i++
	      targetColor = oGC.getImageData(currenSeed[0]+i, currenSeed[1],1,1).data
	    }
	    // console.log(xLeft,xRight)


	    //find y+1's seed
	    candidateSeed = 0
	    for (var i = xLeft; i <= xRight; i++) {
	      targetColor = oGC.getImageData(i, currenSeed[1]+1,1,1).data
	      if(targetColor[3] < 10 && (rgba[0]!=targetColor[0] || rgba[1]!=targetColor[1] || rgba[2]!=targetColor[2] ) ){
	        candidateSeed = i
	      }
	      else {
	        targetColor = oGC.getImageData(i - 1, currenSeed[1]+1,1,1).data
	        if(targetColor[3] < 10 && (rgba[0]!=targetColor[0] || rgba[1]!=targetColor[1] || rgba[2]!=targetColor[2] )){
	          // fillColor(candidateSeed+100,currenSeed[1]+1,[0,255,255,255])
	          seedStack.push([i - 1,currenSeed[1]+1])
	        }
	      }
	    }
	    if(candidateSeed){
	      // fillColor(candidateSeed+100,currenSeed[1]+1,[0,255,0,255])
	      seedStack.push([candidateSeed,currenSeed[1]+1])
	      // console.log(candidateSeed,currenSeed[1]+1)
	    }

	    //find y-1's seed
	    candidateSeed = 0
	    for (var i = xLeft; i <= xRight; i++) {
	      targetColor = oGC.getImageData(i, currenSeed[1]-1,1,1).data
	      if(targetColor[3] < 10 && (rgba[0]!=targetColor[0] || rgba[1]!=targetColor[1] || rgba[2]!=targetColor[2] )){
	        candidateSeed = i
	      }
	      else {
	        targetColor = oGC.getImageData(i - 1, currenSeed[1]-1,1,1).data
	        if(targetColor[3] < 10 && (rgba[0]!=targetColor[0] || rgba[1]!=targetColor[1] || rgba[2]!=targetColor[2] ) ){
	          // fillColor(candidateSeed+100,currenSeed[1]-1,[0,255,255,255])
	          seedStack.push([i - 1,currenSeed[1]-1])
	          // console.log(i - 1,currenSeed[1]-1)
	        }
	      }
	    }
	    if(candidateSeed){
	      // fillColor(candidateSeed+100,currenSeed[1]-1,[0,255,0,255])
	      seedStack.push([candidateSeed,currenSeed[1]-1])
	      // console.log(candidateSeed,currenSeed[1]-1)
	    }


	  }

	  $('#mask').hide()
	}

	function fillColor(x, y, rgba){
	  var imgData=oGC.createImageData(1,1);
	  imgData.data[0]=rgba[0];
	  imgData.data[1]=rgba[1];
	  imgData.data[2]=rgba[2];
	  imgData.data[3]=rgba[3];
	  oGC.putImageData(imgData,x, y);

	}

  function GetDotName( obj ){
    let str = obj.attr('name')
    return str.substr(str.indexOf('_')+1)
  }
  function outputToTA ( ) {
    var newCombineArr = []
	console.log('------', resultArr)
	let resultArrWrapLen = resultArrWrap.length - 1 < 0 ? 0 : resultArrWrap.length - 1
	let _resultArr = resultArr.slice(0);
	resultArrWrap[resultArrWrapLen] = _resultArr;
    var resultArrTemp = JSON.parse(JSON.stringify(resultArrWrap))

    window.localStorage.SEGRESULT = JSON.stringify(resultArrTemp)
    $('#resultDiv textarea').val(window.localStorage.SEGRESULT)

  }

  function average(arr) {
	  if (!arr.length) return 0;
	 var sum=0;
	for(var i = 0; i < arr.length; i++){
	    sum += arr[i];
	}
	return mean = parseFloat((sum / arr.length).toFixed(4));
  }
  function genBoxCenter(poinArr) {
	  let xArr = [];
	  let yArr = [];
	  poinArr.forEach(point => {
		  point[0] && xArr.push(point[0]);
		  point[1] && yArr.push(point[1]);
	  });
	  return [average(xArr), average(yArr)];
  }

  if (window.localStorage.SEGRESULT) {
    $('#resultDiv textarea').val(window.localStorage.SEGRESULT)
    $("#resultArea").animate({scrollTop:$("#resultArea")[0].scrollHeight - $("#resultArea").height()},1000)

    resultArrWrap = JSON.parse(window.localStorage.SEGRESULT)
  }


	var seedStack = []

});
