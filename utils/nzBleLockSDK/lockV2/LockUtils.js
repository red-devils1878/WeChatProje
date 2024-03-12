// r=read,w=write,c=control,del=delete,resp=response
module.export = {
	c_lock_activate,					// 激活设备							0x10
	c_add_user,						    // 请求添加用户					    0x11
	c_update_user,						// 请求权限变更						0x12
	c_lock_open,						// 蓝牙开锁							0x13
	w_lock_setting,						// 参数设置							0x16
	r_lock_setting,						// 读取参数设置						0x17
	r_lock_record,						// 读取开门记录/告警记录				0x18 
	r_user_permissiions,				// 读取用户权限列表					0x19 
	c_factory_settings,					// 恢复出厂设置						0x1A
	w_add_user,							// 添加用户权限						0x1B
	
	r_ota_msg,							// 获取设备OTA差分信息				0x31
	c_ota_notice_lock_upgade,			// 提示门锁服务器有新固件				0x30
	
	c_check_data_sync,					// 查询上送透传数据					0x33
	c_upload_data_sync,					// 同步透传NB数据						0x34
	
	resp_change_iccard,					// ic卡变更操作						0x51
	resp_lock_open,						// 开锁通知							0x53
	
	resp_ota_upgade_file,				// 发送ota升级文件					0x56
	resp_ota_upgade_finish,				// 完成								0x57
	
	resp_nb_sync,						// 同步记录至平台						0x5d
	
	rndData,							// 用于测试mtu生成随机数据
	
}

import * as lock from './LockAgreement.js'
import * as httpUtil from './httpUtil.js'
import * as sdk from '../bleSdk.js'
import * as bleSDKUtils from '../bleSDKUtils.js'

let jsSimpleName = "<LockUtil.js> "
let lockObj = lock.getLockInstance();
let logUtils = bleSDKUtils.logUtils;

var autoNum = 0x00	// 流水号
var result = {} 	// 接收数据
var callBack = {} 	// 回调数据
var tagData = {} 	// 解析数据对象

var isAuth = false;	// 是否已鉴权

// 通道
const CHANNEL_00 = 0xFF00
const CHANNEL_01 = 0xFF01
const CHANNEL_02 = 0xFF02

// 蓝牙发送指令 主动
const CMD_ACTIVATE = 0x10
const CMD_ADD_USER_C = 0x11
const CMD_UPDATE_USER = 0x12
const CMD_LOCK_OPEN = 0x13
const CMD_PARAM_SET = 0x16
const CMD_PARAM_READ = 0x17
const CMD_LOCK_RECORD = 0x18
const CMD_USER_PERMISSIONS = 0x19
const CMD_FACTORY_SETTINGS = 0x1a
const CMD_ADD_USER_W = 0x1b
const CMD_OTA_NOTICE_LOCK_UPGADE = 0x30
const CMD_OTA_MSG = 0x31
const CMD_CHECK_DATA_SYNC = 0x33
const CMD_UPLOAD_DATA_SYNC = 0x34

// 蓝牙发送指令 被动回复
const CMD_NOTICE_D1 = 0x51
const CMD_NOTICE_D3 = 0x53
const CMD_NOTICE_D6 = 0x56
const CMD_NOTICE_D7 = 0x57
const CMD_NOTICE_DD = 0x5d

// 蓝牙接收指令
const CMD_RESP_AUTH = 0x80
const CMD_RESP_ACTIVATE = 0x90
const CMD_RESP_ADD_USER_C = 0x91
const CMD_RESP_UPDATE_USER = 0x92
const CMD_RESP_LOCK_OPEN = 0x93
const CMD_RESP_PARAM_SET = 0x96
const CMD_RESP_PARAM_READ = 0x97
const CMD_RESP_LOCK_RECORD = 0x98
const CMD_RESP_USER_PERMISSIONS = 0x99
const CMD_RESP_FACTORY_SETINGS = 0x9A
const CMD_RESP_ADD_USER_W = 0x9b
const CMD_RESP_OTA_NOTICE_LOCK_UPGADE = 0xb0
const CMD_RESP_OTA_MSG = 0xb1
const CMD_RESP_CHECK_DATA_SYNC = 0xb3
const CMD_RESP_UPLOAD_DATA_SYNC = 0xb4

// 设备主动调用 被动接收
const CMD_RESP_NOTICE_ADD = 0xd1
const CMD_RESP_NOTICE_OPEN = 0xd3
const CMD_RESP_NOTICE_UPGADE = 0xd6
const CMD_RESP_NOTICE_FINISH = 0xd7
const CMD_RESP_NOTICE_SYNC = 0xdd

// 基本参数TAG
const TAG_FW = 0x00						// 固件版本
const TAG_HW = 0x01						// 硬件版本
const TAG_VOICE = 0x02					// 语音版本
const TAG_IMEI = 0x03					// IMEI
const TAG_ICCID = 0x04					// ICCID
const TAG_SN = 0x05						// 门锁SN
const TAG_MAC = 0x06					// 蓝牙MAC
const TAG_PID = 0x07					// PID
const TAG_MODEL = 0x08					// 门锁型号
const TAG_APPKEY = 0x09					// 应用密钥
const TAG_SESN = 0x0a					// SE_SN
const TAG_CUSTOMER_ID = 0x0b			// 客户ID
const TAG_BATTERY = 0x10				// 电池电量
const TAG_NB_SIGNAL = 0x11				// NB信号
const TAG_MCU_UUID = 0x12				// mcu uuid
const TAG_DATE = 0x1f					// 时间

// 设置参数TAG 
const TAG_HEARTBEAT_TIME = 0x20 		// 心跳时间
const TAG_HEARTBEAT_INTERVAL = 0x21 	// 心跳间隔
const TAG_NB_TIMEOUT = 0x22 			// NB通讯超时时间
const TAG_REPORT_LOW_POWER = 0x23 		// 低电立即上报
const TAG_BLE_SWITCH = 0x24 			// 蓝牙开关
const TAG_REPORT_LOCK_OPEN = 0x25 		// 开锁记录立即上报
const TAG_ANTI_PRYING_SWITCH = 0x26 	// 防撬开关
const TAG_NET_MODE = 0x27 				// 联网模式
const TAG_CARD_TYPE = 0x28 				// 刷卡类型
const TAG_APARTMENT_MANAGEMENT = 0x29 	// 公寓管理
const TAG_MONTH_END_ACTIVATION = 0x2a 	// 月末激活
const TAG_WIFI_SSID = 0x2b 				// WIFI SSID
const TAG_WIFI_KEY = 0x2c 				// WIFI KEY
const TAG_IP_ADDRESS = 0x2d 			// IP地址

// 其他参数TAG
const TAG_TOKEN_TYPE = 0x50				// 开门方式
const TAG_USER_TOKEN = 0x51				// 权限内容
const TAG_FINGERPRINT_ID = 0x52			// 指纹ID
const TAG_VALIDITY_DATE = 0x53			// 有效期
const TAG_USER_LIST = 0x54				// 用户列表
const TAG_USER_CONTROL = 0x55			// 权限控制及ID
const TAG_USER_ID = 0x56				// 用户ID
const TAG_RECORD_OPEN = 0x57			// 开锁记录
const TAG_RECORD_WARN = 0x58			// 告警记录
const TAG_RECORD_OPERATION = 0x59		// 操作记录
const TAG_USER_INDEX_SIZE = 0x5a		// 起始ID及条数
const TAG_LOCK_CHECK = 0x5b				// 自检信息
const TAG_USER_LIST_MSG = 0x63			// 权限信息列表
const TAG_PWD = 0x6a					// 密码
const TAG_ADD_RESULT = 0x70				// 添加结果
const TAG_USER_NAME = 0x71				// 帐户号
const TAG_OPEN_RESULT = 0x72			// 开锁结果
const TAG_RECORD_INDEX_SIZE = 0x73		// 记录号及条数
const TAG_SYNC_DATA_STATE = 0x74		// 平台同步数据结果
const TAG_SYNC_DATA = 0x75				// 平台同步数据
const TAG_OTA_FILE_INFO = 0x89			// 差分升级文件描述信息
const TAG_OTA_DATA_ADDRESS = 0x8a		// 差分升级帧数据包索引
const TAG_OTA_DATA = 0x8b				// 差分升级文件帧内容
const TAG_OTA_UPGADE_FINISH = 0x8c		// 差分升级文件下载完成
const TAG_OTA_ID = 0x8D					// 差分升级OTA项目ID
const TAG_OTA_TOKEN = 0x8F				// 差分升级OTA项目TOKEN

// 响应码
const SUCCESS_RESP_CODE = 0x0000
const ERROR_RESP_CODE_80_1 = 0x0001		// 鉴权失败，且门锁已激活，门锁蓝牙立即主动断开连接
const ERROR_RESP_CODE_80_2 = 0x0100		// 鉴权失败，且门锁未激活
const ERROR_RESP_CODE_80_3 = 0x0010		// 鉴权失败，鉴权指令错误
const ERROR_RESP_CODE_80_4 = 0x0011		// 鉴权失败，鉴权数据长度错误

const ERROR_RESP_CODE_90_1 = 0x1001		// 激活失败，门锁已激活，无需再激活
const ERROR_RESP_CODE_90_2 = 0x1010		// 激活数据错误

const ERROR_RESP_CODE_91_1 = 0x1101		// 当前忙，受理失败
const ERROR_RESP_CODE_91_2 = 0x1110		// 数据错误
const ERROR_RESP_CODE_91_3 = 0x1111		// 权限类型已满
const ERROR_RESP_CODE_91_4 = 0x1112		// 权限已满

const ERROR_RESP_CODE_92_1 = 0x1201		// 用户ID不存在
const ERROR_RESP_CODE_92_2 = 0x1202		// 密码已存在
const ERROR_RESP_CODE_92_3 = 0x1203		// 权限类型错误
const ERROR_RESP_CODE_92_4 = 0x1210		// 数据错误

const ERROR_RESP_CODE_93_1 = 0x1301		// 失败

const ERROR_RESP_CODE_96_1 = 0x1601		// 失败
const ERROR_RESP_CODE_96_2 = 0x1602		// 参数不可修改
const ERROR_RESP_CODE_96_3 = 0x1603		// 参数不存在

const ERROR_RESP_CODE_97_1 = 0x1701		// 失败
const ERROR_RESP_CODE_97_2 = 0x1702		// 参数不可读
const ERROR_RESP_CODE_97_3 = 0x1703		// 参数不存在

const ERROR_RESP_CODE_98_1 = 0x1801		// 失败
const ERROR_RESP_CODE_98_2 = 0x1802		// 起始记录号不存在

const ERROR_RESP_CODE_99_1 = 0x1901		// 失败
const ERROR_RESP_CODE_99_2 = 0x1902		// 权限不存在

const ERROR_RESP_CODE_9A_1 = 0x1a01		// 门锁未激活

const ERROR_RESP_CODE_9B_1 = 0x1b01		// 当前忙，受理失败
const ERROR_RESP_CODE_9B_2 = 0x1b02		// 权限类型已满
const ERROR_RESP_CODE_9B_3 = 0x1b03		// 权限已满
const ERROR_RESP_CODE_9B_4 = 0x1b04		// 权限重复
const ERROR_RESP_CODE_9B_5 = 0x1b10		// 数据错误

const ERROR_RESP_CODE_B0_1 = 0x3003		// 固件版本错误
const ERROR_RESP_CODE_B0_2 = 0x3004		// 文件信息错误
const ERROR_RESP_CODE_B0_3 = 0x3005		// 其他错误

const ERROR_RESP_CODE_B1_1 = 0x3101		// 门锁不支持差分OTA

const ERROR_RESP_CODE_B3_1 = 0x3301		// 不支持同步功能

const ERROR_RESP_CODE_B4_1 = 0x3401		// 无上送数据


/**
 * @param {Object} pwd   	密码
 * @param {Object} date  	激活日期 YYMMDDhhmmss
 */
export function c_lock_activate(pwd,date='') {
	
	let tlvArr = []
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_TOKEN_TYPE,'01'))
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_USER_TOKEN,authChangePwdCode(pwd)))
	if(!date){
		date = bleSDKUtils.formatTime()
		date = date.substring(2,date.length)
	}
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_DATE,date))
	return cmdToArray(CMD_ACTIVATE,0x00,tlvArr)
}

/**
 * @param {Object} cls 		操作类型		0x01 永久 	0x02 限时 	0x81 取消
 * @param {Object} type 	开锁类型 	0x00 指纹  	0x01 密码
 * @param {Object} date 	有效期		cls == 0x02有效
 * 										起始时间 	YYMMDDHHMMSS  
 * 										结束时间 	YYMMDDHHMMSS 
 * 										循环周期 	不循环=0，周一=1，周二=2，周三=3，周四=4，
 * 										 			周五=5，周六=6，周日=7；每日=8，工作日=9，
 * 													周末=10，单次有效=11
 * 										永久周期		Byte 0~12：全FF为永久期限
 * @param {Object} circle	循环周期		cls == 0x02有效
 */
export function c_add_user(cls,type,date,circle) {
	
	let tlvArr = []
	if(0x81 != cls){
		type = ('00'.concat(type.toString(16).toLocaleUpperCase())).slice(-2)
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_TOKEN_TYPE,type))
	}
	
	if(0x02 == cls){
		let validityDate = date + ('00'.concat(circle.toString(16).toLocaleUpperCase())).slice(-2)
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_VALIDITY_DATE,validityDate))
	}
	
	return cmdToArray(CMD_ADD_USER_C,cls,tlvArr)
}

/**
 * @param {Object} cls 		操作类型		0x01 删除 	0x02 修改有效期 	0x03 修改密码，仅限密码
 * @param {Object} id		用户id
 * @param {Object} pwd		修改密码		cls == 0x03有效
 * @param {Object} date 	有效期		cls == 0x02有效
 * 										起始时间 	YYMMDDHHMMSS  
 * 										结束时间 	YYMMDDHHMMSS 
 * 										循环周期 	不循环=0，周一=1，周二=2，周三=3，周四=4，
 * 										 			周五=5，周六=6，周日=7；每日=8，工作日=9，
 * 													周末=10，单次有效=11
 * 										永久周期		Byte 0~12：全FF为永久期限
 * @param {Object} circle	循环周期		cls == 0x02有效
 */			
export function c_update_user(cls,id,pwd,date,circle) {
	
	let tlvArr = []
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_USER_ID,bleSDKUtils.nBit2Hex(2,id,false)))
	if(0x02 == cls){
		let validityDate = date + ('00'.concat(circle.toString(16).toLocaleUpperCase())).slice(-2)
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_VALIDITY_DATE,validityDate))
	}else if(0x03 === cls){
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_USER_TOKEN,authChangePwdCode(pwd)))
		
	}
	
	return cmdToArray(CMD_UPDATE_USER,cls,tlvArr)
}		

/**
 * @param {Object} userName		开锁账户号
 */
export function c_lock_open(userName) {
	
	let tlvArr = tlvCmdToArray(TAG_USER_NAME,bleSDKUtils.hex2HexStr(bleSDKUtils.strToAscii(userName)))
	
	return cmdToArray(CMD_LOCK_OPEN,0x00,tlvArr)
}
   
/**
 * @param {Object} params=[]	数组对象{tag：0xff,value:"ff"} tag参照<设置参数TAG>  value为设置值   						  
 */																		
export function w_lock_setting(params) {		
	let tlvArr = []
	
	if(params.length>0){
		params.forEach(param => {
			if(TAG_APARTMENT_MANAGEMENT == param.tag){
				
				if(param.value.length != 6){
					console.log("方法w_lock_setting设置 TAG="+param.tag+" ,参数错误,请检查参数设置是否正确")
					throw "方法w_lock_setting设置 TAG="+param.tag+" ,参数错误,请检查参数设置是否正确"
				}
				
			}else if(TAG_WIFI_SSID == param.tag || TAG_WIFI_KEY == param.tag){
				
				param.value = bleSDKUtils.hex2HexStr(bleSDKUtils.strToAscii(param.value))
				
			}else if(TAG_IP_ADDRESS == param.tag){
				
				if(param.value.length != 12){
					console.log("方法w_lock_setting设置 TAG="+param.tag+" ,参数错误,请检查参数设置是否正确")
					throw "方法w_lock_setting设置 TAG="+param.tag+" ,参数错误,请检查参数设置是否正确"
				}
				
			}else{
				param.value = parseInt(param.value)
				param.value = ('00'.concat(param.value.toString(16).toLocaleUpperCase())).slice(-2)
				
			}
			tlvArr = tlvArr.concat(tlvCmdToArray(param.tag,param.value))
		})
	}
	
	return cmdToArray(CMD_PARAM_SET,0x00,tlvArr)
}		

/**
 * @param {Object} cls-->tag	读取相应参数TAG 		参照<设置参数TAG>	0xff 读取所有参数
 * @param {Object} rfu			cls=0xff			批量读取参数时		rfu  0x00 读取全部基本参数 	0x01 读取全部设置参数
 */	
export function r_lock_setting(cls,rfu) {
	
	if(0xff == cls){
		return cmdToArray(CMD_PARAM_READ,cls,[],rfu)
	}
	
	return cmdToArray(CMD_PARAM_READ,cls)
}	

/**
 * @param {Object} cls 			0x01 开门记录  	0x02 告警记录	0x03 操作记录
 * @param {Object} startIndex 	起始记录号 
 * @param {Object} pageSize	    条数
 */
export function r_lock_record(cls,startIndex,pageSize) {
	let index = bleSDKUtils.numToHexStr(startIndex,4,false)
	let size = bleSDKUtils.nBit2Hex(2,pageSize,false)
	let tlvArr = tlvCmdToArray(TAG_RECORD_INDEX_SIZE,index+size)
	return cmdToArray(CMD_LOCK_RECORD,cls,tlvArr)
}	

/** 
 * @param {Object} cls 			0x00 无权限内容 		0x01 有权限内容
 * @param {Object} startNum 	起始权限号
 * @param {Object} count     	条数
 */ 
export function r_user_permissiions(cls,startIndex,pageSize) {
	let index = bleSDKUtils.nBit2Hex(2,startIndex,false)
	let size = bleSDKUtils.nBit2Hex(2,pageSize,false)
	let tlvArr = tlvCmdToArray(TAG_USER_INDEX_SIZE,index+size)
	return cmdToArray(CMD_USER_PERMISSIONS,cls,tlvArr)
}		

/**
 * 恢复出厂设置
 */
export function c_factory_settings() {
	return cmdToArray(CMD_FACTORY_SETTINGS,0x00)
}	

/**
 * @param {Object} cls   	权限类型		0x01 永久  	0x02 限时  	0x03 单次  	4 循环  
 * @param {Object} type  	开门方式		0x01 密码 	0x09 卡片
 * @param {Object} token  	权限内容
 * @param {Object} date 	有效期		起始时间 	YYMMDDHHMMSS
 * 										结束时间 	YYMMDDHHMMSS 
 * 										循环周期 	不循环=0，周一=1，周二=2，周三=3，周四=4，
 * 										 			周五=5，周六=6，周日=7；每日=8，工作日=9，
 * 													周末=10，单次有效=11
 * 										永久周期		Byte 0~12：全FF为永久期限
 */
export function w_add_user(cls,type,token,date,circle) {
	
	let tlvArr = [];
	
	type = ('00'.concat(type.toString(16).toLocaleUpperCase())).slice(-2)
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_TOKEN_TYPE,type))
	
	if(0x01 == type){
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_USER_TOKEN,authChangePwdCode(token)))
	}else if(0x09 == type){
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_USER_TOKEN,token))
	}else{
		console.log("方法w_add_user执行type="+type+" ,参数错误,请参数是否正确")
		return 
	}
	
	if(0x01 != cls){
		let validityDate = date + ('00'.concat(circle.toString(16).toLocaleUpperCase())).slice(-2)
		tlvArr = tlvArr.concat(tlvCmdToArray(TAG_VALIDITY_DATE,validityDate))
	}
	
	return cmdToArray(CMD_ADD_USER_W,cls,tlvArr)
}

export function c_check_data_sync() {
	return cmdToArray(CMD_CHECK_DATA_SYNC,0x00)
}

export function c_upload_data_sync(syncData) {
	let tlvArr = tlvCmdToArray(TAG_SYNC_DATA,syncData)
	return cmdToArray(CMD_UPLOAD_DATA_SYNC,0x00,tlvArr)
}	

/**
 *	获取ota信息
 */
export function r_ota_msg() {
	return cmdToArray(CMD_OTA_MSG,0x00)
}

// 提示门锁ota升级
export function c_ota_notice_lock_upgade(otaObj) {
	let tlvArr = []
	console.log(JSON.stringify(otaObj))
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_FW,bleSDKUtils.hex2HexStr(bleSDKUtils.strToAscii(otaObj.otaVersion))))
	let fileInfo = bleSDKUtils.numToHexStr(otaObj.otaTaskNo,4,false)  + otaObj.otaType + bleSDKUtils.numToHexStr(otaObj.otaFileSize,4,false) + bleSDKUtils.nBit2Hex(2,otaObj.crc,false)
	console.log(fileInfo)
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_OTA_FILE_INFO,fileInfo))
	return cmdToArray(CMD_OTA_NOTICE_LOCK_UPGADE,0x00,tlvArr);
}
			
export function resp_change_iccard(code,num){
	return noticeCmdToArray(CMD_NOTICE_D1,code,num)
}
	
export function resp_lock_open(code,num){
	return noticeCmdToArray(CMD_NOTICE_D3,code,num)
}

/**
 * @param {Object} num 			流水号
 * @param {Object} otaObj 		数据索引
 * @param {Object} fileData		文件数据
 */
export function resp_ota_upgade_file(num,otaObj,fileData) {// 0x00,0x00为状态码
	let tlvArr = []
	let fileInfo = bleSDKUtils.numToHexStr(otaObj.id,4,false) + bleSDKUtils.numToHexStr(otaObj.startAddress,4,false) + bleSDKUtils.numToHexStr(otaObj.dataSize,4,false)
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_OTA_DATA_ADDRESS,fileInfo))
	tlvArr = tlvArr.concat(tlvCmdToArray(TAG_OTA_DATA,bleSDKUtils.hex2HexStr(fileData)))
	return noticeCmdToArray(CMD_NOTICE_D6,0x00,num,tlvArr)
}

export function resp_ota_upgade_finish(code,num) {
	return noticeCmdToArray(CMD_NOTICE_D7,code,num)// 0x00,0x00为状态码
}

export function resp_nb_sync(code,num,replyData) {
	let tlvArr = tlvCmdToArray(TAG_SYNC_DATA,replyData)
	return noticeCmdToArray(CMD_NOTICE_DD,code,num,tlvArr)// 0x00,0x00为状态码
}

export function rndData(cmd,num){
    var rnd=[];
    for(var i=0;i<num;i++){
        rnd[i] = Math.floor(Math.random()*10)*Math.floor(Math.random()*10);
	}
	console.log(bleSDKUtils.hex2HexStr(rnd))
    return cmdToArray(cmd,0x00,rnd);
}


export function authChangePwdCode(pwd) {
	let pwdCodeArray = []
	for (let i = 0; i < pwd.length; i++) {
		pwdCodeArray[i] = pwd.charCodeAt(i) - 0x30
	}
	return bleSDKUtils.hex2HexStr(pwdCodeArray)
}

/** 数据组装tlv结构
 * @param {Object} t   
 * @param {Object} v
 */
function tlvCmdToArray(t, v) {
	return bleSDKUtils.tlvCmdToArray(t, v, false)
}

function tlvLen2BitArray(t, v) {
	let pos = 0;
	let cmdArray = [];
	cmdArray[pos++] = t;
	if (v) {
		let hexV = bleSDKUtils.hexStr2Hex(v)
		let len = hexV.length
		cmdArray[pos++] = len & 0xFF
		// let buffer = new ArrayBuffer(2);
		// let view = new DataView(buffer);
		// let value = Number(len); // C8045705480D
		// view.setUint16(0, value, true); // true 为小端法，false大端法
		// cmdArray = cmdArray.concat(bleSDKUtils.hexStr2Hex(bleSDKUtils.hex2HexStr(buffer)));
		cmdArray = cmdArray.concat(hexV);
	} else {
		cmdArray[pos++] = 0x00;
	}
	logUtils("cmd===" ,bleSDKUtils.hex2HexStr(cmdArray))
	return cmdArray;
}


function getAutoNum(){
	autoNum = autoNum + 1;
	return autoNum;
}

/** 组合发送指令包
 * @param {Object} cmd 指令
 * @param {Object} num 流水号
 * @param {Object} cls class
 * @param {Object} dataArr   数据
 */
function cmdToArray(cmd,cls,dataArr,rfu=0x00) {
	let pos = 0;
	let cmdArray = [];
	cmdArray[pos++] = cmd;//指令
	cmdArray[pos++] = getAutoNum();// 流水号
	cmdArray[pos++] = cls;// class
	cmdArray[pos++] = rfu;// rfu
	if (dataArr) {
		let len = dataArr.length & 0xFFFF;
		cmdArray[pos++] = ((len >>> 8) & 0xFF)
		cmdArray[pos++] = (len & 0xFF)
		
		for (let i = 0; i < dataArr.length; i++) {
			cmdArray[pos++] = dataArr[i];
		}
		
	} else {
		cmdArray[pos++] = 0x00;
		cmdArray[pos++] = 0x00;
	}
	logUtils("cmd===" ,bleSDKUtils.hex2HexStr(cmdArray))
	return cmdArray;
}

/** 组合回复指令包
 * @param {Object} cmd 	指令
 * @param {Object} code 响应码
 * @param {Object} num  流水号（锁端提供）
 * @param {Object} dataArr 数据
 */
function noticeCmdToArray(cmd,code,num,dataArr) {
	let pos = 0;
	let cmdArray = [];
	cmdArray[pos++] = cmd;//指令
	let code_ = code & 0xFFFF;
	cmdArray[pos++] = ((code_ >>> 8) & 0xFF)
	cmdArray[pos++] = (code_ & 0xFF)
	cmdArray[pos++] = num;// 流水号
	if (dataArr) {
		let len = dataArr.length & 0xFFFF;
		cmdArray[pos++] = ((len >>> 8) & 0xFF)
		cmdArray[pos++] = (len & 0xFF)
		
		for (let i = 0; i < dataArr.length; i++) {
			cmdArray[pos++] = dataArr[i];
		}
		
	} else {
		cmdArray[pos++] = 0x00;
		cmdArray[pos++] = 0x00;
	}
	logUtils("cmd===" ,bleSDKUtils.hex2HexStr(cmdArray))
	return cmdArray;
}

export async function executeCmd(reqObj) {
	await operateWM(reqObj);
}


function operateWM(reqObj) {
	if(!reqObj){
		return;
	}
	
	console.log("reqObj==>" + JSON.stringify(reqObj));
	console.log("reqObj==>" + bleSDKUtils.hex2HexStr(reqObj.deviceSn));
	console.log("reqObj.deviceId==>" + reqObj.deviceId);
	result = {};
	
	sdk.options.isKeepConnect = true;      	// 保持连接
	sdk.options.isSearchDeviceList = false;	// 单设备搜索
	sdk.options.searchTime = 10;           	// 搜索时间10秒
	if(reqObj.mtu){						   	// 是否设置mtu
		sdk.options.isSetMTU = true;		// 设置mtu
		sdk.options.mtuLen = 240;			// 门锁协议最大字节数240
	}else{
		sdk.options.isSetMTU = false;
		sdk.options.mtuLen = 18; 
	}
	let deviceId = reqObj.deviceId;			// 通常通过搜索列表后，指定连接某一设备
	if(reqObj.deviceSn){					// 指定设备序列号
		sdk.options.searchSn = reqObj.deviceSn;
		if(reqObj.isAuthConnect){			// 自动直连设备
			deviceId = wx.getStorageSync("deviceId_"+reqObj.deviceSn);
		}
	}
	console.log("----------执行指令-----------------"+new Date().getTime())
	sdk.bleCommand({
		deviceId: deviceId,
		success: function(res) {
			logUtils( jsSimpleName + "success:" + JSON.stringify(res));
			if(0 == res.code){
				receiverCmdMsgFrame(res.data,reqObj)	
			}else if(1000 == res.code){
				isAuth = false
				console.log("----------鉴权指令开始-----------------"+new Date().getTime())
				authBle(reqObj.deviceSn)
			}else if(1001 == res.code){
				console.log("----------数据发送开始-----------------"+new Date().getTime())
				if(isAuth){// 是否已鉴权
				console.log("----------数据发送-----------------" + reqObj.data)
					sendCmd(reqObj.data)// 发送指令
				}
				console.log("----------数据发送完成-----------------"+new Date().getTime())
			}
		},
		fail: function(res) {
			logUtils( jsSimpleName + "fail:" + JSON.stringify(res));
			reqObj.fail(res)

		},
	})
}

/**
 * @param {Object} activeKey 鉴权
 */
function authBle(deviceSn) {
	let activeKey = wx.getStorageSync("device_key_"+deviceSn)
	if(!activeKey){
		let noActivateKey = wx.getStorageSync("device_key_activate_"+deviceSn)
		activeKey = noActivateKey?noActivateKey:"FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF";//默认鉴权密钥
	}
	
	let data = lockObj.authDataPackage("ACTIVEKEY", activeKey)
	sdk.sendCmd(data);
}

/**
 * @param {Object} data 发送数据
 */
function sendCmd(data) {
	if(data){
		data = lockObj.getSendData(data)
		sdk.sendCmd(data);
	}
}

/**
 * @param {Object} receiveData
 * @param {Object} obj	回调对象success，fail
 */
function receiverCmdMsgFrame(receiveData,obj){
	let payloadData = lockObj.getReceiverData(receiveData)
	if(!payloadData){
		logUtils( jsSimpleName + "receiverCmdMsgFrame==>", "数据未接收完成");
		return;
	}
	console.log("----------接收数据完成-----------------"+new Date().getTime())
	let dataHeader = (payloadData[0] << 8) + payloadData[1];
	let resultData = payloadData.slice(4, payloadData.length - 2);
	
	if (dataHeader == CHANNEL_00) {// 密文
		let decryptedArr = lockObj.decryptCmd(resultData); // 数据解密
		console.log("----------解密数据完成-----------------"+new Date().getTime())
		parseData(decryptedArr,obj)
	} else if (dataHeader == CHANNEL_01) {// 明文
		// resultCallback(resultData);
	} else if (dataHeader == CHANNEL_02) {
		parseData(resultData,obj)
	}	
}


export function parseData(msgArray,obj) {
	logUtils(jsSimpleName + "parseData_msgArray", bleSDKUtils.hex2HexStr(msgArray))
	let len = msgArray.length
	if (msgArray.length <= 0) {
		return
	}
	
	let cmd = msgArray[0]
	callBack = obj
	tagData = {}
	logUtils(jsSimpleName + "parseData_cmd", ('00'.concat(cmd.toString(16).toLocaleUpperCase())).slice(-2))
	
	result.hexData = bleSDKUtils.hex2HexStr(msgArray);

	switch(cmd){
		case CMD_RESP_AUTH:{
			return parseMsg_80(msgArray)
		}
		case CMD_RESP_ACTIVATE:{
			return parseMsg_90(msgArray)
		}
		case CMD_RESP_ADD_USER_C:{
			return parseMsg_91(msgArray)
		}
		case CMD_RESP_UPDATE_USER:{
			return parseMsg_92(msgArray)
		}
		case CMD_RESP_LOCK_OPEN:{
			return parseMsg_93(msgArray)
		}
		case CMD_RESP_PARAM_SET:{
			return parseMsg_96(msgArray);
		}
		case CMD_RESP_PARAM_READ:{
			return parseMsg_97(msgArray);
		}
		case CMD_RESP_LOCK_RECORD:{
			return parseMsg_98(msgArray);
		}
		case CMD_RESP_USER_PERMISSIONS:{
			return parseMsg_99(msgArray)
		}
		case CMD_RESP_FACTORY_SETINGS:{
			return parseMsg_9A(msgArray)
		}
		case CMD_RESP_ADD_USER_W:{
			return parseMsg_9B(msgArray)
		}
		case CMD_RESP_OTA_NOTICE_LOCK_UPGADE:{
			return parseMsg_b0(msgArray)
		}
		case CMD_RESP_OTA_MSG:{
			return parseMsg_b1(msgArray)
		}
		case CMD_RESP_CHECK_DATA_SYNC:{
			return parseMsg_b3(msgArray)
		}
		case CMD_RESP_UPLOAD_DATA_SYNC:{
			return parseMsg_b4(msgArray)
		}
		case CMD_RESP_NOTICE_ADD:
		case CMD_RESP_NOTICE_OPEN:
		case CMD_RESP_NOTICE_UPGADE:
		case CMD_RESP_NOTICE_FINISH:
		case CMD_RESP_NOTICE_SYNC:{
			return parseMsg_xx(msgArray)// 处理门锁主动请求指令
		}
		default:{
			let res = {
				code:0,
				hexData:result.hexData
			}
			resultCallback(res)
		}
	}
}

// 鉴权
function parseMsg_80(msgArray){
	logUtils(jsSimpleName + "parseMsg_80", bleSDKUtils.hex2HexStr(msgArray))
	let pos = 0
	
	let cmd = msgArray[pos++]
	
	let code = (msgArray[pos++]<< 8) + msgArray[pos++] ;
	logUtils(jsSimpleName + "parseMsg_head_code_"+cmd, code)
	
	let num = msgArray[pos++]
	if(num != 0x00){
		logUtils(jsSimpleName + "parseMsg_head_num_"+cmd, "当前流水号不一致")
		return false;
	}
	
	result.cmd = cmd
	result.code = code
	result.num = num
	
	switch(result.code){
		case SUCCESS_RESP_CODE:
			let len = (msgArray[pos++] << 8) + msgArray[pos++];
			lockObj.genSessionKey(msgArray.slice(pos++, pos + len));
			result.msg = "鉴权成功"
			isAuth = true
		break;
		case ERROR_RESP_CODE_80_1:
		case ERROR_RESP_CODE_80_3:
		case ERROR_RESP_CODE_80_4:
			wx.setStorageSync("device_key_"+callBack.deviceSn,"");
			result.msg = "鉴权失败"
			break
		case ERROR_RESP_CODE_80_2:
			// wx.setStorageSync("device_key_"+callBack.deviceSn,"");
			result.msg = "当前门锁未激活"
			break
		break
	}
	
	if (callBack.data && result.code == 0x00) { // 如果数据不为空则发送数据指令
		result = {}
		sendCmd(callBack.data)
	} else {
		resultCallback(result)
	}
}

// 激活门锁
function parseMsg_90(msgArray){
	logUtils(jsSimpleName + "parseMsg_90", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "激活成功"
			break
		case ERROR_RESP_CODE_90_1:
				result.msg = "门锁已激活，无需再激活"
			break
		case ERROR_RESP_CODE_90_2:
				result.msg = "激活失败"
			break
	}
	resultCallback(result);
}

// 请求添加IC卡
function parseMsg_91(msgArray){
	logUtils(jsSimpleName + "parseMsg_91", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "添加成功"
			break
		case ERROR_RESP_CODE_91_1:
				result.msg = "添加失败"
			break
		case ERROR_RESP_CODE_91_2:
				result.msg ="数据错误"
			break
		case ERROR_RESP_CODE_91_3:
				result.msg ="权限类型已满"
			break
		case ERROR_RESP_CODE_91_4:
				result.msg ="权限已满"
			break
			break
	}
	resultCallback(result);
}

// 请求权限卡变更
function parseMsg_92(msgArray){
	logUtils(jsSimpleName + "parseMsg_92", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_92_1:
				result.msg ="指纹卡号或密码不存在"
			break
		case ERROR_RESP_CODE_92_2:
				result.msg = "新密码已存在"
			break
		case ERROR_RESP_CODE_92_3:
				result.msg = "权限类型错误"
			break
		case ERROR_RESP_CODE_92_4:
				result.msg = "数据错误"
			break
	}
	resultCallback(result)
}

// 蓝牙开锁
function parseMsg_93(msgArray){
	logUtils(jsSimpleName + "parseMsg_93", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				tagData.hexList = []
				tagData.list = []
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_93_1:
				result.msg = "操作失败"
			break
	}
	resultCallback(result)
}

// 参数设置
function parseMsg_96(msgArray){
	logUtils(jsSimpleName + "parseMsg_96", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_96_1:
				result.msg = "操作失败"
			break
		case ERROR_RESP_CODE_96_2:
				result.msg = "参数不可修改"
			break
		case ERROR_RESP_CODE_96_3:
				result.msg = "参数不存在"
			break
	}
	resultCallback(result)
}

// 读取参数
function parseMsg_97(msgArray){
	logUtils(jsSimpleName + "parseMsg_97", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "读取成功"
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				console.log("parseMsg_97"+len)
				let tagArr = msgArray.slice(pos,pos+len)
				parseTag(tagArr)
				result.data = tagData
			break
		case ERROR_RESP_CODE_97_1:
				result.msg = "读取失败"
			break
		case ERROR_RESP_CODE_97_2:
				result.msg = "参数不可读"
			break
		case ERROR_RESP_CODE_97_3:
				result.msg = "参数不存在"
			break
	}
	resultCallback(result)
}

// 读取开锁记录/告警记录
function parseMsg_98(msgArray){
	logUtils(jsSimpleName + "parseMsg_98", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4;
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				tagData.hexList = []
				tagData.list = []
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "读取成功"
			break
		case ERROR_RESP_CODE_98_1:
				result.msg = "读取失败"
			break
		case ERROR_RESP_CODE_98_2:
				result.msg = "起始记录号不存在"
			break
	}
	resultCallback(result)
}

// 读取权限列表
function parseMsg_99(msgArray){
	logUtils(jsSimpleName + "parseMsg_99", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				tagData.hexList = []
				tagData.list = []
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "读取成功"
			break
		case ERROR_RESP_CODE_99_1:
				result.msg = "读取失败"
			break
		case ERROR_RESP_CODE_99_2:
				result.msg = "权限不存在"
			break
	}
	resultCallback(result)
}

// 恢复出厂设置
function parseMsg_9A(msgArray){
	logUtils(jsSimpleName + "parseMsg_9A", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_9A_1:
				result.msg = "门锁未激活"
			break
	}
	resultCallback(result)
}

// 添加/修改用户权限
function parseMsg_9B(msgArray){
	logUtils(jsSimpleName + "parseMsg_9B", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_9B_1:
				result.msg = "操作失败"
			break
		case ERROR_RESP_CODE_9B_2:
				result.msg = "权限类型已满"
			break
		case ERROR_RESP_CODE_9B_3:
				result.msg = "权限已满"
			break
    case ERROR_RESP_CODE_9B_4:
				result.msg = "权限重复"
			break
		case ERROR_RESP_CODE_9B_5:
				result.msg = "数据错误"
			break
	}
	resultCallback(result)
}


// 提示升级回复
function parseMsg_b0(msgArray){
	logUtils(jsSimpleName + "parseMsg_b0", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	switch(result.code){
		case SUCCESS_RESP_CODE:
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_B0_1:
				result.msg = "固件版本错误"
			break
		case ERROR_RESP_CODE_B0_2:
				result.msg = "文件信息错误"
			break
		case ERROR_RESP_CODE_B0_3:
				result.msg = "其他错误"
			break
	}
	resultCallback(result) 
}

// 获取设备ota差分信息
function parseMsg_b1(msgArray){
	logUtils(jsSimpleName + "parseMsg_b1", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_B1_1:
				result.msg = "门锁不支持差分OTA"
			break
	}
	resultCallback(result)
}

// 同步透传NB数据
function parseMsg_b3(msgArray){
	logUtils(jsSimpleName + "parseMsg_b3", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_B3_1:
				result.msg = "不支持同步功能"
			break
	}
	resultCallback(result)
}

// 同步透传NB数据
function parseMsg_b4(msgArray){
	logUtils(jsSimpleName + "parseMsg_b4", bleSDKUtils.hex2HexStr(msgArray))
	
	if(!parseMsg_head(msgArray)){
		return
	}
	
	let pos = 4
	switch(result.code){
		case SUCCESS_RESP_CODE:
				let len = (msgArray[pos++] << 8) + msgArray[pos++]
				parseTag(msgArray.slice(pos, pos + len))
				result.data = tagData
				result.msg = "操作成功"
			break
		case ERROR_RESP_CODE_B4_1:
				result.msg = "无上送数据"
			break
	}
	resultCallback(result)
}

function parseMsg_head(msgArray){
	let pos = 0
	
	let cmd = msgArray[pos++]
	
	let code = (msgArray[pos++]<< 8) + msgArray[pos++] ;
	logUtils(jsSimpleName + "parseMsg_head_code_"+cmd, ('0000'.concat(code.toString(16).toLocaleUpperCase())).slice(-4))
	
	let num = msgArray[pos++]
	if(num != autoNum){
		logUtils(jsSimpleName + "parseMsg_head_num_"+cmd, "当前流水号不一致_")
		return false
	}
	
	result.cmd = cmd
	result.code = code
	result.num = num
	return true
}

// 门锁主动发起
function parseMsg_xx(msgArray){
	logUtils(jsSimpleName + "parseMsg_xx", bleSDKUtils.hex2HexStr(msgArray));
	let pos = 0;
	
	let cmd = msgArray[pos++];
	
	let num = msgArray[pos++];
	logUtils(jsSimpleName + "parseMsg_xx_"+num, "获取门锁主动调用流水号");
	
	let cls = msgArray[pos++];
	let rfu = msgArray[pos++];
	
	let len = (msgArray[pos++] << 8) + msgArray[pos++];
	
	let data =  msgArray.slice(pos, pos + len)
	
	result.cmd = cmd;
	result.code = 0;
	result.num = num;
	result.cls = cls;
	result.rfu = rfu;
	parseTag(data);
	result.data = tagData;
	
	if(CMD_RESP_NOTICE_SYNC == result.cmd){
		syncData(result.data.syncData,result.num)
		return
	}
	
	resultCallback(result);
}

var tagData = {};

function parseTag(tagArr){
	logUtils(jsSimpleName + "parseTag", bleSDKUtils.hex2HexStr(tagArr))
	
	if(tagArr.length <= 0){// 数组<=0时返回解析数据
		return 
	}
	let pos = 0
	let tag = tagArr[pos++]
	
	// if(0x00 == tag){ // 标签为0x00时返回解析数据
	// 	return
	// }
	
	let tagLen = tagArr[pos++]
	if(0x00 == tagLen){// 标签数据长度为0x00时解析下一个tag
		tagArr =  tagArr.slice(pos, tagArr.length)
		parseTag(tagArr)
		return
	}else if(tagLen & 0x80){
		tagLen = ((tagLen & 0x7F) << 8) + tagArr[pos++]
	}

	switch(tag){
		case TAG_FW:		// 固件版本
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.firmwareVersion = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;	
			}
		case TAG_HW:		// 硬件版本
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.hardwareVersion = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;	
			}
		case TAG_VOICE:		// 语音版本
			{
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				tagData.voiceVersion = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_IMEI:		// imei
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.imei = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_ICCID:		// iccid
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.iccid = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_SN:		// 门锁sn
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.sn = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_MAC:		// 蓝牙MAC
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				let mac =  bleSDKUtils.hex2HexStr(hexArr)
				let regex = new RegExp("[0-9a-fA-F]{12}")
				if (regex.test(mac)) {
					let sb = '';
					for (let i = 0; i < 12; i++) {
						let c = mac.charAt(i);
						sb = sb + c;
						if ((i & 1) == 1 && i <= 9) {
							sb = sb + ':';
						}
					}
					tagData.mac = sb
				}else{
					console.log(jsSimpleName + "mac format is error")
					tagData.mac = "mac format is error"
				}
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_PID:		// PID
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.pid = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_MODEL:		// 门锁型号
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.model = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_APPKEY:	// 应用密码
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.appPWD = bleSDKUtils.hex2HexStr(hexArr) 
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_SESN:		// sesn
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.sesn = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}	
		case TAG_CUSTOMER_ID:// 客户ID
			{
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				tagData.customerID = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_BATTERY:	// 电池电量
			{
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				tagData.battery = parseBattery((hexArr[0]<< 8) + hexArr[1])
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_NB_SIGNAL:	// NB信号
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				
				let dbm = hexArr[0]
				let snr = hexArr[1]
				let earfcn =(hexArr[2] << 8) +  hexArr[3]
				let pci = (hexArr[4] << 8) + hexArr[5] 
				
				let nbInfo = {
					dbm:-dbm,
					snr:snr,
					earfcn:earfcn,
					pci:pci
				}
				
				tagData.nbInfo = nbInfo
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_MCU_UUID: 		// mcu uuid
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.mcuId = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_DATE: 		// 时间
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.date = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_HEARTBEAT_TIME:
			{
				tagData.heartbeatTime = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}	
		case TAG_HEARTBEAT_INTERVAL:
			{
				tagData.heartbeatInterval = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_NB_TIMEOUT:
			{
				tagData.nbTimeOut = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}		
		case TAG_REPORT_LOW_POWER:
			{
				tagData.reportLowPower = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}	
		case TAG_BLE_SWITCH:
			{
				tagData.bleSwitch = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}		
		case TAG_REPORT_LOCK_OPEN:
			{
				tagData.reportLockOpen = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}	
		case TAG_ANTI_PRYING_SWITCH:
			{
				tagData.antiPryingSwitch = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_NET_MODE:
			{
				tagData.netMode = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}			
		case TAG_CARD_TYPE:
			{
				tagData.cardType = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}			
		case TAG_APARTMENT_MANAGEMENT:
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.apartmentMangement = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_MONTH_END_ACTIVATION:
			{
				tagData.monthEndActivation = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_WIFI_SSID:
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.wifiSSID = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}			
		case TAG_WIFI_KEY:
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.wifiKEY = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}			
		case TAG_IP_ADDRESS:
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				if(hexArr.length == 6){
					tagData.ip = hexArr[0] + "." +  hexArr[1] + "." + hexArr[2] + "." + hexArr[3] + ":" + ( (hexArr[4] << 8) + hexArr[5])
				}else{
					tagData.ip = "mac format is error"
				}
				wx.setStorageSync("lock_sync_ip",tagData.ip)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_TOKEN_TYPE:// 开锁方式
			{	
				tagData.openType = tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_USER_TOKEN:// 权限内容
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.userToken = bleSDKUtils.hex2HexStr(hexArr)
				// if(0x01 == tagData.openType){
				// 	tagData.userToken = bleSDKUtils.asciiToStr(hexArr)
				// }else{
				// 	tagData.userToken = bleSDKUtils.hex2HexStr(hexArr)
				// }
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_FINGERPRINT_ID:// 指纹id
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.fingerprintID = bigHex2Int(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break;
			}
		case TAG_VALIDITY_DATE:// 有效期
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				
				let tagPos = 0
				let startArr = hexArr.slice(tagPos,tagPos+6)
				
				tagPos += 6
				let endArr = hexArr.slice(tagPos,tagPos+6)
				
				tagPos += 6
				let validityDate = {
					startTime:bleSDKUtils.hex2HexStr(startArr),
					endTine:bleSDKUtils.hex2HexStr(endArr),
					cycle:hexArr[tagPos],
				}
				
				tagData.validityDate = validityDate
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_USER_LIST:// 用户列表
			{	
				let tokenArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				// let record = {};
				// let tagPos = 0;
				// let idArr = openRecordArr.slice(tagPos,tagPos+4);
				// tagPos += 4;
				// record.id = bleSDKUtils.hex2HexStr(idArr);
				// let dateArr = openRecordArr.slice(tagPos,tagPos+6);
				// tagPos += 6;
				// record.date = bleSDKUtils.hex2HexStr(dateArr);
				// record.recordType = openRecordArr[tagPos++];
				// record.powerType = openRecordArr[tagPos++];
				// let powerDataLen = openRecordArr[tagPos++];
				// let powerDataArr = openRecordArr.slice(tagPos,tagPos+powerDataLen);
				// if(record.powerType == 0x02){
				// 	record.powerData = bleSDKUtils.bytes2Str(powerDataArr);
				// }else{
				// 	record.powerData = bleSDKUtils.hex2HexStr(powerDataArr);
				// }
				
				// tagData.hexList.push(bleSDKUtils.hex2HexStr(hexArr));
				if(tagData.list != null){
					tagData.list.push(bleSDKUtils.hex2HexStr(tagArr.slice(0, 2 + tagLen)));
				}
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_USER_CONTROL:// 权限控制及id
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				
				let tagPos = 0
				let status = hexArr[tagPos++]
				let id = (hexArr[tagPos++] << 8) + hexArr[tagPos++]
				
				let userControl = {
					status:status,
					id:id,
				}
				
				tagData.userControl = userControl
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_USER_ID:// 用户id
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.userID = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_RECORD_OPEN:// 开锁记录
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen) // 截取对应tag数据
				
				let record = {}
				let tagPos = 0
				let idArr = hexArr.slice(tagPos,tagPos+4)
				record.id =  smallHex2Int(idArr)
				
				tagPos += 4
				let dateArr = hexArr.slice(tagPos,tagPos+6)
				record.date = bleSDKUtils.hex2HexStr(dateArr)
				
				tagPos += 6
				record.openType = hexArr[tagPos++]
				record.tokenId = (hexArr[tagPos++] << 8) + hexArr[tagPos++]
				record.openTwiceType = hexArr[tagPos++]
				record.tokenTwiceId = (hexArr[tagPos++] << 8) + hexArr[tagPos++]
				record.battery = parseBattery((hexArr[0]<< 8) + hexArr[1])
				
				let userNameLen = hexArr[tagPos++]
				if(userNameLen > 0){
					record.account = bleSDKUtils.hex2HexStr(tagArr.slice(tagPos, tagPos + userNameLen))
				}else{
					record.account = ''
				}
				
				tagData.list.push(record)
				tagData.hexList.push(bleSDKUtils.hex2HexStr(hexArr))
				toNextParseTag(pos+tagLen,tagArr)
				
				break
			}
		case TAG_RECORD_WARN:// 告警记录
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				
				let record = {}
				let tagPos = 0
				let idArr = hexArr.slice(tagPos,tagPos+4)
				record.id =  smallHex2Int(idArr)
				
				tagPos += 4
				let dateArr = hexArr.slice(tagPos,tagPos+6)
				record.date = bleSDKUtils.hex2HexStr(dateArr)
				
				tagPos += 6
				tagData.battery = parseBattery((hexArr[1]<< 8) + hexArr[0])
				record.warnType = hexArr[tagPos++]
				record.warnLen = hexArr[tagPos++]
				record.warnContent = bleSDKUtils.hex2HexStr(tagArr.slice(tagPos, hexArr.length))
				
				tagData.list.push(record);
				tagData.hexList.push(bleSDKUtils.hex2HexStr(hexArr))
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_RECORD_OPERATION:// 操作记录
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				
				let record = {}
				let tagPos = 0
				let idArr = hexArr.slice(tagPos,tagPos+4)
				record.id =  smallHex2Int(idArr)
				
				tagPos += 4
				let dateArr = hexArr.slice(tagPos,tagPos+6)
				record.date = bleSDKUtils.hex2HexStr(dateArr)
				
				tagPos += 6
				record.operationType = hexArr[tagPos++]
				record.adminId = (hexArr[tagPos++] << 8) + hexArr[tagPos++]
				record.adminType = hexArr[tagPos++]
				record.tokenId = (hexArr[tagPos++] << 8) + hexArr[tagPos++]
				record.openType = hexArr[tagPos++]
				record.tokenType = hexArr[tagPos++]
				record.battery = parseBattery((hexArr[1]<< 8) + hexArr[0])
				
				tagData.list.push(record);
				tagData.hexList.push(bleSDKUtils.hex2HexStr(hexArr))
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_USER_INDEX_SIZE:// 起始id
			{	
				break
			}
		case TAG_LOCK_CHECK:// 自检信息
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				
				let byte0 = hexArr[0]
				let byte1 = hexArr[1]
				let byte2 = hexArr[2] 
				let byte3 = hexArr[3]
				
				let checkInfo = {
					byte0:byte0,
					byte1:byte1,
					byte2:byte2,
					byte3:byte3,
				}
				
				tagData.checkInfo = checkInfo
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_USER_LIST_MSG:{
				let hexArr = tagArr.slice(pos, pos + tagLen);// 截取对应tag数据
				// let record = {};
				// let tagPos = 0;
				// let idArr = openRecordArr.slice(tagPos,tagPos+4);
				// tagPos += 4;
				// record.id = bleSDKUtils.hex2HexStr(idArr);
				// let dateArr = openRecordArr.slice(tagPos,tagPos+6);
				// tagPos += 6;
				// record.date = bleSDKUtils.hex2HexStr(dateArr);
				// record.recordType = openRecordArr[tagPos++];
				// record.powerType = openRecordArr[tagPos++];
				// let powerDataLen = openRecordArr[tagPos++];
				// let powerDataArr = openRecordArr.slice(tagPos,tagPos+powerDataLen);
				// if(record.powerType == 0x02){
				// 	record.powerData = bleSDKUtils.bytes2Str(powerDataArr);
				// }else{
				// 	record.powerData = bleSDKUtils.hex2HexStr(powerDataArr);
				// }
				// tagData.list.push(bleSDKUtils.hex2HexStr(hexArr));
				tagData.hexList.push(bleSDKUtils.hex2HexStr(hexArr));
				toNextParseTag(pos+tagLen,tagArr)
				break
			
			}	
		case TAG_PWD:// 密码
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.pwd = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_ADD_RESULT:// 添加结果
			{
				tagData.state =  tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
			
		case TAG_USER_NAME:// 账户号
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.account = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_OPEN_RESULT:// 开锁结果
			{
				tagData.state =  tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_RECORD_INDEX_SIZE:// 记录号及条数
			{	
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				let tagPos = 0;
				
				let indexArr = hexArr.slice(tagPos,tagPos+4)
				let startRecordIndex = smallHex2Int(indexArr)
				
				tagPos += 4
				
				let sizeArr = hexArr.slice(tagPos,tagPos+4)
				let recordSize = smallHex2Int(sizeArr)
				
				let recordInfo = {
					startRecordIndex:startRecordIndex,
					recordSize:recordSize,
				}
				
				tagData.recordInfo = recordInfo
				toNextParseTag(pos+tagLen,tagArr)
				break
			}				
		case TAG_SYNC_DATA_STATE:// 平台同步数据结果
			{
				tagData.state =  tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_SYNC_DATA:		 // 平台同步数据
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.syncData = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_OTA_FILE_INFO:// 差分升级文件描述信息
			{
				let fileArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				
				let tagPos = 0
				
				let idArr = fileArr.slice(tagPos,tagPos+4)
				let id = bleSDKUtils.hex2HexStr(idArr)
				
				tagPos += 4
				
				let upgradeType = fileArr[tagPos++]
				
				let sizeArr = fileArr.slice(tagPos,tagPos+4)
				let size = bigHex2Int(sizeArr)
				
				tagPos += 4;
				
				let crcArr = fileArr.slice(tagPos,tagPos+2)
				let crc = bleSDKUtils.hex2HexStr(crcArr)
				
				let upgradeFileInfo = {
					id:id,
					upgradeType:upgradeType,
					size:size,
					crc:crc,
				};
				
				tagData.upgradeFileInfo = upgradeFileInfo
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_OTA_DATA_ADDRESS:// 差分升级帧数据包索引
			{
				let fileArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				let tagPos = 0;
				
				let idArr = fileArr.slice(tagPos,tagPos+4)
				let id = smallHex2Int(idArr)
				
				tagPos += 4
				
				let posArr = fileArr.slice(tagPos,tagPos+4)
				let startAddress = smallHex2Int(posArr)
				
				tagPos += 4;
				
				let sizeArr = fileArr.slice(tagPos,tagPos+4)
				let dataSize = smallHex2Int(sizeArr)
				
				let upgradeDataInfo = {
					id:id,
					startAddress:startAddress,
					dataSize:dataSize,
				}
				
				tagData.upgradeDataInfo = upgradeDataInfo
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		// case TAG_OTA_DATA:// 差分升级文件帧内容
		// 	{
		// 		break;
		// 	}
		case TAG_OTA_UPGADE_FINISH:// 差分升级文件下载完成
			{
				tagData.downloadStatus =  tagArr[pos]
				toNextParseTag(pos+tagLen,tagArr)
				break
			}
		case TAG_OTA_ID:// 差分升级OTA项目ID
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.otaId = bleSDKUtils.hex2HexStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}	
		case TAG_OTA_TOKEN:// 差分升级OTA项目TOKEN
			{
				let hexArr = tagArr.slice(pos, pos + tagLen)// 截取对应tag数据
				tagData.otaToken = bleSDKUtils.asciiToStr(hexArr)
				toNextParseTag(pos+tagLen,tagArr)
				break
			}	
		default:
			{
				console.log("default", "结束解析")
				return tagData
			}			
	}
}

/**
 * @param {Object} pos 截取位置
 * @param {Object} tagArr
 */
function toNextParseTag(pos, tagArr) {
	tagArr = tagArr.slice(pos, tagArr.length);
	logUtils(jsSimpleName + "toNextParseTag", bleSDKUtils.hex2HexStr(tagArr));
	parseTag(tagArr)
}

//调用外界回调
function resultCallback(param) {
	if(null == callBack){
		logUtils(jsSimpleName + "resultCallback-callBack", "callback为空");
		return;
	}
	
	//调用回调函数
	if (null != param) {
	  logUtils(jsSimpleName + "resultCallback-result", JSON.stringify(param));
		if (param.code == 0) {
			callBack.success(param);
		} else {
			// if(param.code == 0x0100){
			// 	wx.showModal({
			// 		confirmText:"去激活",
			// 		content:param.msg,
			// 		success: function(res) {
			// 			if(res.confirm){
			// 				vm.$Router.push({
			// 					path: '/pages/owner/home/lock/add/index'
			// 				})
			// 			}
			// 		}
			// 	})
			// }
			callBack.fail(param);
		}
	}
}

function syncData(syncData,num){
	httpUtil.syncLockData(syncData).then(res => {
		logUtils(jsSimpleName + "syncData success", syncData);
		let replyData = resp_nb_sync(0x00, num, res.payload);
		sendCmd(replyData);
	}).catch(err => {
		logUtils(jsSimpleName + "syncData fail", err);
	})
}

/**
 * @param {Object} value 电量计算
 */
function parseBattery(value)
{
    let b  = 0;
    let t = 0;

    if (value < 4800)
    {
        return 0;
    }
    else if (value > 5800)
    {
        return 100;
    }
    else
    {
        t = value - 4800;  // 获取当前ADC采样值与leve0的差值
        b = 5800 - 4800; // 获取量程
        b = 100 / b;     // 获取每一个单位在100分的占比
        b *= t;          // 与差值相乘获取百分比
        return Math.round(b);        // 只取整数
    }
}

/**
 * @param {Object} arr
 * 小端
 */
function smallHex2Int(arr) {
	return bleSDKUtils.hex2int(bleSDKUtils.hex2HexStr(arr));
}

/**
 * @param {Object} arr
 * 大端
 */
function bigHex2Int(arr) {
	let bigArr = [];
	if (arr && arr.length > 0) {
		for (let i = 0; i < arr.length; i++) {
			bigArr[arr.length - 1 - i] = arr[i]
		}
	}
	return bleSDKUtils.hex2int(bleSDKUtils.hex2HexStr(bigArr));
}


export function showLogArr(arr){
	return bleSDKUtils.hex2HexStr(arr)
}

