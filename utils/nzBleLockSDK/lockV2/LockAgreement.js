const bleSDKUtils = require("./../bleSDKUtils.js");
let logUtils = bleSDKUtils.logUtils;
let genRandomStr = bleSDKUtils.genRandomStr;
let hex2HexStr = bleSDKUtils.hex2HexStr;
let hexStr2Hex = bleSDKUtils.hexStr2Hex;
let CRC16 = bleSDKUtils.CRC16;
const lockDataUtils = require("./LockDataUtils.js");
const sha1 = require("./../sha1.js");
const bleSDKSM4Obj = require("./../sm4.js");
let encryptData_ECB = bleSDKSM4Obj.encryptData_ECB;
let decryptData_ECB = bleSDKSM4Obj.decryptData_ECB;

let jsSimpleName = "<LockAgreement.js> "

let _pwdHash = ""; // hash1
let _rnd1 = ""; // 随机数1
let _rnd2 = ""; // 随机数2
let _key = ""; // sessionKey


export function getLockInstance() {
	return new LockAgreement();
}

var LockAgreement = function() {

}

LockAgreement.prototype = {

	authDataPackage: function(pwdType, authPwd) {
		pwdHash(pwdType, authPwd)
		let pos = 0
		let msgArray = [];
		msgArray[pos++] = 0x00// cmd
		msgArray[pos++] = 0x00// 流水号
		msgArray[pos++] = 0x00// class
		msgArray[pos++] = 0x00// rfu
		let len = 36 & 0xFFFF; // 数据长度，鉴权固定28个字节
		msgArray[pos++] = ((len >>> 8) & 0xFF)
		msgArray[pos++] = (len & 0xFF)
		_rnd1 = genRandomStr()
		logUtils(jsSimpleName + "authDataPackage_rnd1", _rnd1)
		msgArray = msgArray.concat(genAuthDataArray(_pwdHash, _rnd1))
		msgArray = msgArray.concat(hexStr2Hex(_rnd1))
		let date = bleSDKUtils.formatTime()
		let dateTime = bleSDKUtils.tlvCmdToArray(0x1f, date.substring(2,date.length))
		msgArray = msgArray.concat(dateTime)
		
		logUtils(jsSimpleName + "authDataPackage_msgArray", hex2HexStr(msgArray))
		msgArray = lockDataUtils.getSendDataPackage(msgArray,0xFF02)
		return msgArray;
	},

	getSendData: function(cmdArray) {
		let msgArray = [];
		msgArray = encryptCmd(cmdArray)
		logUtils(jsSimpleName + "dataPackage====>encryptCmd", hex2HexStr(msgArray))
		msgArray = lockDataUtils.getSendDataPackage(msgArray,0xFF00)
		logUtils(jsSimpleName + "dataPackage====>getSendDataPackage", hex2HexStr(msgArray))
		return msgArray
	},
	
	getReceiverData: function(data){
		let dataStr = lockDataUtils.getReceiverDataPackage(data)
		return dataStr;
	},

	decryptCmd: function(cmd) {
		let result = decryptData_ECB(_key, hex2HexStr(cmd));
		return hexStr2Hex(result);
	},

	genSessionKey: function(hexRnd2) { // 生成加解密密钥
		_rnd2 = hex2HexStr(hexRnd2);
		logUtils(jsSimpleName + "genSessionKey_rnd1", _rnd1)
		logUtils(jsSimpleName + "genSessionKey_rnd2", _rnd2)
		let hash1 = _pwdHash
		logUtils(jsSimpleName + "genSessionKey_pwdHash", hash1)
		let rnd = ""
		rnd = rnd.concat(_rnd1.slice(0, 8))
		rnd = rnd.concat(_rnd2.slice(0, 8))
		rnd = rnd.concat(_rnd1.slice(8, 16))
		rnd = rnd.concat(_rnd2.slice(8, 16))
		logUtils(jsSimpleName + "genSessionKey_rnd", rnd)
		let hash1Key = hash1.slice(0, 32)
		logUtils(jsSimpleName + "genSessionKey_hash1Key", hash1Key)
		let sessionKey = encryptData_ECB(hash1Key, rnd)
		logUtils(jsSimpleName + "genSessionKey_sessionKey", sessionKey)
		_key = sessionKey.slice(0, 32)
		logUtils(jsSimpleName + "genSessionKey_key", _key)
	},
}

function pwdHash(pwdType, authPwd) {
	if (pwdType) {
		if (pwdType == 'PWD') {
			_pwdHash = genHashFromPwd(authPwd)
		} else if (pwdType == 'HASH') {
			_pwdHash = authPwd
		} else if (pwdType == 'ACTIVEKEY') {
			_pwdHash = genHashFromActiveKey(authPwd)
		}
	} else {
		_pwdHash = genHashFromPwd(authPwd)
	}
}

//通过pwd生成hash值
function genHashFromPwd(pwd) { // 鉴权码哈希加密 返回hash1
	let pwdHexStr = hex2HexStr(AuthChangePwdCode(pwd))
	let pwdByteArray = hexStr2Hex(pwdHexStr)
	let hash = sha1(pwdByteArray).toLocaleUpperCase()
	return hash
}

//将字符0123456789的编码转换成数值0-9编码数组
function AuthChangePwdCode(pwd) {
	let pwdCodeArray = [];
	for (let i = 0; i < pwd.length; i++) {
		pwdCodeArray[i] = pwd.charCodeAt(i) - 0x30
	}
	return pwdCodeArray
}

function genHashFromActiveKey(activeKey) { // 鉴权码哈希加密 hash1

	let pwdByteArray = hexStr2Hex(activeKey);
	let hash = sha1(pwdByteArray).toLocaleUpperCase();

	logUtils(jsSimpleName + "-----------activeKey" + activeKey)
	logUtils(jsSimpleName + "-----------pwdByteArray" + pwdByteArray)

	return hash;
}

//以Byte数组形式返回
function genAuthDataArray(hash1, rnd) {
	return hexStr2Hex(genAuthDataHexStr(hash1, rnd));
}

//生成hash2
function genAuthDataHexStr(hash1, rnd) {
	logUtils(jsSimpleName + "genAuthDataHexStr-hash1", hash1)
	logUtils(jsSimpleName + "genAuthDataHexStr-rnd", rnd)
	let hash1rnd = hash1.concat(rnd)
	logUtils(jsSimpleName + "genAuthDataHexStr-hash1rnd", hash1rnd)
	let hash1rndByteArray = hexStr2Hex(hash1rnd)
	let hash2 = sha1(hash1rndByteArray).toLocaleUpperCase()
	logUtils(jsSimpleName + "genAuthDataHexStr-hash2", hash2)
	return hash2
}

function encryptCmd(cmd) {
	logUtils(jsSimpleName + "encryptAndSendCmd-pwd", hex2HexStr(cmd))
	let result = encryptData_ECB(_key, hex2HexStr(cmd))
	let encryptedCmd = hexStr2Hex(result)
	logUtils(jsSimpleName + "encryptAndSendCmd-encryptedCmd", hex2HexStr(encryptedCmd))
	return encryptedCmd
}