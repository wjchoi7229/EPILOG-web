function CommonUtils(){

	this.html2canvasOpt;
}

CommonUtils.sampleDetailPage = function(sampleId) {
	if(sampleId != null){
		window.open("/clinical/sample/sampleSummary?pt_id="+ sampleId, '_samplePop');
	}
}

CommonUtils.cloneTest = function(clone){
	var nowTabNm = $('[role=presentation].active').find('a').attr('aria-controls');
	var divId = CommonUtils.html2canvasOpt.divId;
	var divObj = $(clone).find('#'+divId);

	if (nowTabNm == 'oncoprint'){
//		var ctx = $(divObj).find('canvas').eq(1).get(0).getContext('2d');
//
//		ctx.fillStyle = "rgb(200,0,0)";
//		ctx.fillRect(40,60,300,900);

//		ctx.fillStyle = 'blue';
//		ctx.globalAlpha = '0.0';
//		ctx.fillRect(0,0,300, 300);

		$('#tmpOncoprint2').attr('src', $(divObj).find('canvas').eq(1).get(0).toDataURL());
	} else if (nowTabNm == 'CNV'){

		$(divObj).height($(divObj).find('#mainSvg').height());
	}

	return clone;
}

CommonUtils.downloadImg = function(divId, fileNm) {
	var options = {
		    onclone:CommonUtils.cloneTest,
		    divId : divId
			};

	this.html2canvasOpt = options;

	html2canvas($('#'+divId).get(0),options).then(function(canvas){
		$('#'+divId).block($BLOCK_UI_CREATING);
            canvas.toBlob(function(blob) {
                saveAs(blob, fileNm+'.png');
                $('#'+divId).unblock($BLOCK_UI_CREATING);
            });
	});
}

CommonUtils.downloadText = function(textData, fileNm, ext) {

	ext = ext ? ext : 'txt';

	var txtBlob = new Blob([textData], {
	    type: 'text/plain;charset=utf-8'
	  });

	saveAs(txtBlob, fileNm+'.'+ext);
}

CommonUtils.downloadBlob = function(blob, fileNm, ext) {
	ext = ext ? ext : 'txt';
	saveAs(blob, fileNm+'.'+ext);
}

CommonUtils.randomNum = function(min, max){
	return Math.random() * (max - min) + min;
}

CommonUtils.randomInt = function(min, max){
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

CommonUtils.ajaxJsonDef = function(url, param, method){
	var dfObj = $.Deferred();

	try {
		paramData = $.param(param, true);

		$.ajax({
	        type:method,
	        url:url,
	        data:paramData,
	        dataType:'json',
	        success:function(data){
        		dfObj.resolve(data);
	        },
	        error:function(request,status,error) {
	        	dfObj.reject(error);
	        }
	    });

	} catch(e) {
		dfObj,reject('Unknown Error');
	}
	return dfObj;
}

CommonUtils.deepCopy = function(obj) {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	let copy = {};
	for (let key in obj) {
		copy[key] = CommonUtils.deepCopy(obj[key]);
	}
	return copy;
}

CommonUtils.makeCmltPos = function(chr, pos) {
	let arrChrSize = [249250621.0,243199373.0,198022430.0,191154276.0,180915260.0,171115067.0,159138663.0,146364022.0,141213431.0,135534747.0,135006516.0,133851895.0,115169878.0,107349540.0,102531392.0,90354753.0,81195210.0,78077248.0,59128983.0,63025520.0,48129895.0,51304566.0,155270560.0,59373566.0,16571.0];
	let chrNum = chr.replace('chr','');
	let sumPos = 0;

	if (chrNum == 'X') chrNum = 22
	else if (chrNum == 'Y') chrNumY = 23;
	else if (chrNum == 'M') chrNumY = 24;
	else chrNum = Number(chrNum);

	for(var i=0;i<chrNum-1;i++){
		sumPos += arrChrSize[i];
	}

	sumPos += Number(pos);

	return Number(sumPos);
}

CommonUtils.makeChrPos = function(pos) {
	let arrChrSize = [249250621.0,243199373.0,198022430.0,191154276.0,180915260.0,171115067.0,159138663.0,146364022.0,141213431.0,135534747.0,135006516.0,133851895.0,115169878.0,107349540.0,102531392.0,90354753.0,81195210.0,78077248.0,59128983.0,63025520.0,48129895.0,51304566.0,155270560.0,59373566.0,16571.0];

	let tmpPos = 0;
	let chrNum = 0;
	let chrStr = "chr";

	for (var i=0; i<arrChrSize.length;i++) {

		tmpPos += arrChrSize[i];

		if (pos > tmpPos) {
			++chrNum;
		} else {
			tmpPos -= arrChrSize[i];
			tmpPos = Number(pos) - tmpPos;
			break;
		}
	}

	if (chrNum == 22) {
		chrStr = 'chrX';
	} else if (chrNum == 23) {
		chrStr = 'chrY';
	} else if (chrNum == 24) {
		chrStr = 'chrM';
	} else {
		chrStr = 'chr' + (chrNum+1);
	}

	return {
		chr : chrStr,
		pos : Number(tmpPos)
	};
}

function setCookie(name, value, expiredays) {
	var todayDate = new Date();
	todayDate.setTime(todayDate.getTime() + 0);
	if(todayDate > expiredays){
		document.cookie = name + "=" + escape(value) + "; path=/; expires=" + expiredays + ";";
	}else if(todayDate < expiredays){
		todayDate.setDate(todayDate.getDate() + expiredays);
		document.cookie = name + "=" + escape(value) + "; path=/; expires=" + todayDate.toGMTString() + ";";
	}

	console.log(document.cookie);
}

function getCookie(Name) {
	var search = Name + "=";

	if (document.cookie.length > 0) {
		offset = document.cookie.indexOf(search);

		if (offset != -1) {
			offset += search.length;
			// set index of beginning of value
			end = document.cookie.indexOf(";", offset);

			if (end == -1)
				end = document.cookie.length;

			return unescape(document.cookie.substring(offset, end));
		}
	}
	return "";
}