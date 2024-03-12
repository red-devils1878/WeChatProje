const bleSDKUtils = require("./bleSDKUtils.js");
let logUtils = bleSDKUtils.logUtils;
let genRandomStr = bleSDKUtils.genRandomStr;
let hex2HexStr = bleSDKUtils.hex2HexStr;
let hexStr2Hex = bleSDKUtils.hexStr2Hex;
let CRC16 = bleSDKUtils.CRC16;

module.export = {
	getSendDataPackage,
	getReceiverDataPackage,
}

let jsSimpleName = "<bleDataUtils.js> "
let msgBuffer = [];

export function getSendDataPackage(msg, channel) {
	//如果消息为空退出
	if (null == msg) {
		return;
	}
	let dataFrame = dealWithData(msg, channel);
	let msgFrames = dataSubcontract(dataFrame);

	return msgFrames;

}

function dealWithData(msg, channel) { // 组合指令
	if ((null == msg) || (undefined == msg)) {
		logUtils(jsSimpleName + "dealWithData", "数据为空");
	}
	let pos = 0;
	let dataFrame = [];
	if (channel == 0xFF00) {
		dataFrame[pos++] = 0xFF;
		dataFrame[pos++] = 0x00;
		logUtils(jsSimpleName + "dealWithData-channel-FF00", "0xFF00密文透传通道");
	} else if (channel == 0xFF01) {
		dataFrame[pos++] = 0xFF;
		dataFrame[pos++] = 0x01;
		logUtils(jsSimpleName + "dealWithData-channel-FF00-FF01", "0xFF01明文透传通道");
	} else if (channel == 0xFF02) {
		dataFrame[pos++] = 0xFF;
		dataFrame[pos++] = 0x02;
		logUtils(jsSimpleName + "dealWithData-channel-FF00-FF02", "0xFF02明文鉴权通道");
	} else if (channel == 0xFF03) {
		dataFrame[pos++] = 0xFF;
		dataFrame[pos++] = 0x03;
		logUtils(jsSimpleName + "dealWithData-channel-FF00-FF03", "0xFF03明文OTA通道");
	} else {
		logUtils(jsSimpleName + "dealWithData-channel-FF00", "数据报文头只能是0xFF00、0xFF01、0xFF02、0xFF03");
		return;
	}


	//设定长度
	let length = msg.length + 2;
	let lengthFirst = (length & 0xFFFF);
	let lengthSecond = (~lengthFirst) & 0xFFFF;
	dataFrame[pos++] = ((lengthFirst >>> 8) & 0xFF)
	dataFrame[pos++] = (lengthFirst & 0xFF)
	// dataFrame[pos++] = ((lengthSecond >>> 8) & 0xFF)
	// dataFrame[pos++] = (lengthSecond & 0xFF)
	//设定数据
	for (let i = 0; i < msg.length; i++) {
		dataFrame[pos++] = msg[i];
	}
	let crcValue = CRC16(dataFrame.slice(2, pos));
	dataFrame[pos++] = ((crcValue >>> 8) & 0xFF);
	dataFrame[pos++] = (crcValue & 0xFF);
	logUtils(jsSimpleName + "genCmdDataFrame-crcValue", crcValue);
	logUtils(jsSimpleName + "genCmdDataFrame-dataFrame", hex2HexStr(dataFrame));
	return dataFrame;
}

function dataSubcontract(msg) { // 数据分包
	let frames = [];
	let posStart = 0;
	let posEnd = 0;
	let isLastFrame = false;
	for (let i = 0; posEnd < msg.length; i++, posStart = posEnd) {
		posEnd = posStart + 18;
		isLastFrame = false;
		if (posEnd >= msg.length) {
			posEnd = msg.length;
			isLastFrame = true;
		}
		let payload = msg.slice(posStart, posEnd);
		frames[i] = genCmdOneMsgFrame(isLastFrame, i, payload);
	}
	return frames;
}

function genCmdOneMsgFrame(isLastFrame, msgFrameIndex, payload) { // 组合每一包数据
	let frameBuffer = new ArrayBuffer(payload.length + 2);
	let frameArray = new Uint8Array(frameBuffer);
	frameArray[0] = ((isLastFrame) ? (0x00) : (0x80)) + payload.length + 2;
	frameArray[1] = msgFrameIndex;
	for (let i = 0; i < payload.length; i++) {
		frameArray[i + 2] = payload[i];
	}
	logUtils(jsSimpleName + "payload", hex2HexStr(frameArray));
	return frameArray;
}


export function getReceiverDataPackage(msgFrame) {
	logUtils(jsSimpleName + "msgFrameReceiver-msgFrame", hex2HexStr(msgFrame));
	msgFrame = hexStr2Hex(hex2HexStr(msgFrame));
	do {
		//如果对象为空则返回
		if ((null == msgFrame) || (undefined == msgFrame)) {
			logUtils(jsSimpleName + "msgFrameReceiver", "收到的通信帧数据为空");
			break;
		}
		//获取消息帧头
		let fHeader = msgFrame[0];
		logUtils(jsSimpleName + "msgFrameReceiver-Header", fHeader);
		//消息索引
		let msgIndex = getMsgIndex(fHeader);
		logUtils(jsSimpleName + "msgFrameReceiver-msgIndex", msgIndex);
		//通信帧序号,暂不需要
		let msgFrameIndex = msgFrame[1];
		logUtils(jsSimpleName + "msgFrameReceiver-msgFrameIndex", msgFrameIndex);
		//通信帧数据长度
		let msgFrameLength = getFrameDataLen(fHeader);
		logUtils(jsSimpleName + "msgFrameReceiver-msgFrameLength", msgFrameLength);
		//数据的有效长度不能低于3
		if (msgFrameLength < 3) {
			logUtils(jsSimpleName + "msgFrameReceiver-error", "通信帧长度不能小于3");
			break;
		}

		//获取有效数据
		let payloadData = msgFrame.slice(2, msgFrameLength);
		logUtils(jsSimpleName + "msgFrameReceiver-payloadData", hex2HexStr(payloadData));
		pushPayload(msgIndex, payloadData);

		//是否有后续数据
		let hasNextFrameFlag = hasNextFrame(fHeader);
		logUtils(jsSimpleName + "msgFrameReceiver-hasNextFrameFlag", hasNextFrameFlag);
		if (!hasNextFrame(fHeader)) {
			return unpackageAndCallback(popPayload(msgIndex));
		}
	} while (false);
}

function unpackageAndCallback(payloadData) {
	do {
		if ((null == payloadData) || (undefined == payloadData)) {
			logUtils(jsSimpleName + "unpackageAndCallback-payloadData", "报文数据为空");
			break;
		}
		if (payloadData.length < 8) {
			logUtils(jsSimpleName + "unpackageAndCallback-payloadData.length", "报文数据长度不应低于8个字节");
			break;
		}
		//检测数据帧头
		let dataHeader = (payloadData[0] << 8) + payloadData[1];
		if (dataHeader == 0xFF00) {
			logUtils(jsSimpleName + "unpackageAndCallback-dataHeader-FF00", "0xFF00密文透传通道");
		} else if (dataHeader == 0xFF01) {
			logUtils(jsSimpleName + "unpackageAndCallback-dataHeader-FF01", "0xFF01明文透传通道");
		} else if (dataHeader == 0xFF02) {
			logUtils(jsSimpleName + "unpackageAndCallback-dataHeader-FF02", "0xFF02明文鉴权通道");
		} else if (dataHeader == 0xFF03) {
			logUtils(jsSimpleName + "unpackageAndCallback-dataHeader-FF03", "0xFF03明文OTA通道");
		} else {
			logUtils(jsSimpleName + "unpackageAndCallback-dataHeader", "数据报文头只能是0xFF00、0xFF01、0xFF02、0xFF03");
			break;
		}
		//监测数据帧长度
		let dataLength = (payloadData[2] << 8) + payloadData[3];
		let dataLengthInvert = (payloadData[4] << 8) + payloadData[5];
		// if ((~dataLength & 0xFFFF) != dataLengthInvert) {
		// 	logUtils(jsSimpleName + "unpackageAndCallback-dataLength", "数据长度校验有误");
		// 	break;
		// }
		if (dataLength != (payloadData.length - 4)) {
			logUtils(jsSimpleName + "unpackageAndCallback-dataLength", "数据长度有误" + "期望长度" + dataLength + "实际长度" + (payloadData.length -
				4));
			break;
		}
		let crcValue = (payloadData[payloadData.length - 2] << 8) + payloadData[payloadData.length - 1];
		let crcData = payloadData.slice(2, payloadData.length - 2);
		let crcValueTmp = CRC16(crcData);
		if (crcValue != crcValueTmp) {
			logUtils(jsSimpleName + "unpackageAndCallback-crc", "CRC16校验码有误");
			break;
		}

		return payloadData;

	} while (false);
}

function getFrameDataLen(fHeader) {
	let frameDataLen = fHeader & 0x1F;
	return frameDataLen;
}

function getMsgIndex(fHeader) {
	let msgIndx = (fHeader & 0x60) >> 5;
	return msgIndx;
}

function hasNextFrame(fHeader) {
	let endFlag = fHeader & 0x80;
	return (endFlag == 0x80) ? (true) : (false);
}

function pushPayload(msgIndex, data) {
	//如果负载数据为空退出
	if (null == data) {
		return;
	}
	//如果缓存未定义则定义空数组
	if (null == msgBuffer[msgIndex]) {
		msgBuffer[msgIndex] = [];
	}
	let pos = msgBuffer[msgIndex].length;
	for (let i = 0; i < data.length; i++) {
		msgBuffer[msgIndex][i + pos] = data[i];
	}
	logUtils(jsSimpleName + "pushPayload-msgIndex", msgIndex);
	logUtils(jsSimpleName + "pushPayload-data", hex2HexStr(data));
	logUtils(jsSimpleName + "pushPayload-msgBuffer", hex2HexStr(msgBuffer[msgIndex]));
}

function popPayload(msgIndex) {
	let payload = msgBuffer[msgIndex];
	msgBuffer[msgIndex] = [];
	return payload;
}
