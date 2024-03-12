module.export = {
	logUtils: logUtils,
	hexStr2Hex: hexStr2Hex,
	hex2HexStr: hex2HexStr,
	genRandomStr: genRandomStr,
	str2ByteArray: str2ByteArray,
	byteArray2Str: byteArray2Str,
	arrayBuffer2Str: arrayBuffer2Str,
	CRC16: CRC16,
	nBit2Hex:nBit2Hex,
	numToHexStr:numToHexStr,
}
//将16进制字符串转成byte数组
//例如"AABBCC"转换成0xAA,0xBB,0xCC
export function hexStr2Hex(hexStr) {
	let pos = 0;
	let length = hexStr.length;
	if (length % 2 != 0) {
		logUtils("hexStr", hexStr);
		logUtils("error", "hexStr length sould be multiple of 2")
		return null;
	}
	let hexArray = new Array();
	let hexArrayExpectLength = length / 2;
	for (let i = 0; i < hexArrayExpectLength; i++) {
		let subStr = hexStr.substr(pos, 2);
		let value = parseInt(subStr, 16);
		hexArray.push(value);
		pos += 2;
	}
	return hexArray;
}

//将byte数组转成16进制字符串
//例如0xAA,0xBB,0xCC转换成"AABBCC"
export function hex2HexStr(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00'.concat(bit.toString(16).toLocaleUpperCase())).slice(-2)
		}
	)
	return hexArr.join('');
}

//打印logUtils信息
export function logUtils(name, msg) {
	if(msg){
		console.log(name + ": " + msg);
	}else{
		console.log(name);
	}
	
}

//生成8字节随机数字符串，例如"0011223344556677"
export function genRandomStr() {
	let min = 0x10000000;
	let max = 0xFFFFFFFF;
	let range = max - min;
	let rndPart1 = min + Math.round(Math.random() * range);
	let rndPart2 = min + Math.round(Math.random() * range);
	let rnd = rndPart1.toString(16).toLocaleUpperCase() + rndPart2.toString(16).toLocaleUpperCase();
	return rnd;
}

//字符转字节数组
export function str2ByteArray(str) {
	let byteArray = new Array();
	for (let i = 0; i < str.length; i++) {
		byteArray.push(str.charCodeAt(i) & 0xFF);
	}
	return byteArray;
}

//字节数组转字符
export function byteArray2Str(byteArray) {
	let str = '';
	for (let i = 0; i < byteArray.length; i++) {
		//遇到字符串结束符中断
		if ((byteArray[i] == 0x00) || (byteArray[i] == 0xFF)) {
			break;
		}
		str += String.fromCharCode(byteArray[i] & 0xFF);
	}
	return str;
}

//Buffer数组转字符
export function arrayBuffer2Str(arrayBuffer) {
	let byteArray = new Uint8Array(arrayBuffer);
	let str = '';
	for (let i = 0; i < byteArray.length; i++) {
		str += String.fromCharCode(byteArray[i] & 0xFF);
	}
	return str;
}

//计算CRC16校验
export function CRC16(buffer) {
	let k = 0;
	let crc = 0;
	for (let i = 0; i < buffer.length; i++) {
		let b = buffer[i];
		for (k = 0x80; k != 0; k = parseInt(k /= 2)) {
			if ((crc & 0x8000) != 0) {
				crc *= 2;
				crc ^= 0x8005;
			} else {
				crc *= 2;
			}
			if ((b & k) != 0) {
				crc ^= 0x8005;
			}
			if (crc > 0x10000) {
				crc -= 0x10000;
			}
		}
	}
	return crc;
}

function serializableShort(buffer, pos, data) {
	buffer[pos++] = (((data & 0xFF00) >> 8) & 0xFF);
	buffer[pos++] = (data & 0xFF);
	return 2;
}

export function ab2hex(buffer) {
	var hexArr = Array.prototype.map.call(
		new Uint8Array(buffer),
		function(bit) {
			return ('00' + bit.toString(16)).slice(-2)
		}
	)
	return hexArr.join('');
}

export function inArray(arr, key, val) {
	for (let i = 0; i < arr.length; i++) {
		if (arr[i][key] === val) {
			return i;
		}
	}
	return -1;
}

export function formatTime() {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	if (month < 10) {
		var months = '0' + month;
	} else {
		var months = month;
	}
	const day = date.getDate();
	if (day < 10) {
		var days = '0' + day;
	} else {
		var days = day;
	}
	const hour = date.getHours();
	if (hour < 10) {
		var hours = '0' + hour;
	} else {
		var hours = hour;
	}
	const minute = date.getMinutes();
	if (minute < 10) {
		var minutes = '0' + minute;
	} else {
		var minutes = minute;
	}
	const second = date.getSeconds();
	if (second < 10) {
		var seconds = '0' + second;
	} else {
		var seconds = second;
	}
	return year + '' + months + '' + days + '' + hours + '' + minutes + '' + seconds
}

export function strToAscii(str) {
	var len = str.length;
	let hexArray = new Array();
	for (let i = 0; i < len; i++) {
		//获取对应的ascii   
		var codeValue = str.charCodeAt(i);
		// logUtils(codeValue)
		//将对应的编码值转为字符    
		// var charValue = String.fromCharCode(codeValue);
		// logUtils(charValue);
		hexArray.push(codeValue)
	}
	return hexArray;
}

export function asciiToStr(hexArray) {
	let hexStr = '';
	let len = hexArray.length;
	for (let i = 0; i < len; i++) {
		//获取对应的ascii   
		// var codeValue = str.charCodeAt(i);
		//logUtils(codeValue)
		// hexArray.push(codeValue)
		//将对应的编码值转为字符
		var charValue = String.fromCharCode(hexArray[i]);
		// logUtils(charValue);
		hexStr += charValue
	}
	return hexStr
}

export function tlvCmdToArray(t, v,type=true) {
	let pos = 0;
	let cmdArray = [];
	cmdArray[pos++] = t;
	if (v) {
		let hexV = hexStr2Hex(v);
		let len = hexV.length
		if(len & 0x80){
			let lArr = hexStr2Hex(nBit2Hex(2,len,type))
			if(type){
				cmdArray[pos++] = lArr[0]
			}else{
				cmdArray[pos++] = lArr[0]|0x80
			}
			
			cmdArray[pos++] = lArr[1]
		}else{
			cmdArray[pos++] = len & 0xFF
		}
		for (let i = 0; i < len; i++) {
			cmdArray[pos++] = hexV[i];
		}
	} else {
		cmdArray[pos++] = 0x00;
	}
	logUtils("tlv===" ,hex2HexStr(cmdArray))
	return cmdArray;
}

export function nBit2Hex(n,data,type=true){
	let buffer = new ArrayBuffer(n);
	let view = new DataView(buffer);
	let value = Number(data); // C8045705480D
	view.setUint16(0, value, type); // true 为小端法，false大端法
	return hex2HexStr(buffer);
}


export function hex2int(hex) {
	var len = hex.length,
		a = new Array(len),
		code;
	for (var i = 0; i < len; i++) {
		code = hex.charCodeAt(i);
		if (48 <= code && code < 58) {
			code -= 48;
		} else {
			code = (code & 0xdf) - 65 + 10;
		}
		a[i] = code;
	}

	return a.reduce(function(acc, c) {
		acc = 16 * acc + c;
		return acc;
	}, 0);
}

/**
 * @param {Object} data 数据
 * @param {Object} byte 字节数
 * @param {Object} type true 为小端法，false大端法
 */
export function numToHexStr(data,byte,type){
	let buffer = new ArrayBuffer(4);
	let view = new DataView(buffer);
	let value = Number(data);
	view.setUint32(0, value, type); 
	console.log(hex2HexStr(buffer))
	
	return hex2HexStr(buffer)
}
