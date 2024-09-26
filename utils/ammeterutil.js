/** 帧头 */
const HEAD = 0x68;
/** 帧头长度 */
const HEAD_LENGTH = 8;
/** 帧尾 */
const END = 0x16;
/** 数据域偏移 */
const DATA_OFFSET = 0x33;
/** 参数设置数据标识 */
const PARAM_DATA_IDENTIFIER = {
  /** 第 1 套费率 1 电价 */
  FIRST_BUNDLE_PRICE_1: {
    name: '第 1 套费率 1 电价',
    value: new Uint8Array([0x04, 0x05, 0x01, 0x01]),
  },
  /** 第 1 套费率 2 电价  */
  FIRST_BUNDLE_PRICE_2: {
    name: '第 1 套费率 2 电价',
    value: new Uint8Array([0x04, 0x05, 0x01, 0x02]),
  },
  /** 第 1 套费率 3 电价 */
  FIRST_BUNDLE_PRICE_3: {
    name: '第 1 套费率 3 电价',
    value: new Uint8Array([0x04, 0x05, 0x01, 0x03]),
  },
  /** 第 1 套费率 4 电价 */
  FIRST_BUNDLE_PRICE_4: {
    name: '第 1 套费率 4 电价',
    value: new Uint8Array([0x04, 0x05, 0x01, 0x04]),
  },
  /** 第 1 套费率 1~4 电价 */
  FIRST_BUNDLE_PRICE_ALL: {
    name: '第 1 套费率 1~4 电价',
    value: new Uint8Array([0x04, 0x05, 0x01, 0xFF]),
  },
  /** 第 2 套费率 1 电价 */
  SECOND_BUNDLE_PRICE_1: {
    name: '第 2 套费率 1 电价',
    value: new Uint8Array([0x04, 0x05, 0x02, 0x01]),
  },
  /** 第 2 套费率 2 电价  */
  SECOND_BUNDLE_PRICE_2: {
    name: '第 2 套费率 2 电价',
    value: new Uint8Array([0x04, 0x05, 0x02, 0x02]),
  },
  /** 第 2 套费率 3 电价 */
  SECOND_BUNDLE_PRICE_3: {
    name: '第 2 套费率 3 电价',
    value: new Uint8Array([0x04, 0x05, 0x02, 0x03]),
  },
  /** 第 2 套费率 4 电价 */
  SECOND_BUNDLE_PRICE_4: {
    name: '第 2 套费率 4 电价',
    value: new Uint8Array([0x04, 0x05, 0x02, 0x04]),
  },
  /** 第 2 套费率 1~4 电价 */
  SECOND_BUNDLE_PRICE_ALL: {
    name: '第 2 套费率 1~4 电价',
    value: new Uint8Array([0x04, 0x05, 0x02, 0xFF]),
  },
  /** 2 套费率电价切换时间 */
  BUNDLE_PRICE_SWITCH_TIME: {
    name: '2 套费率电价切换时间',
    value: new Uint8Array([0x04, 0x00, 0x01, 0x08]),
  },
  /** 报警金额 1 */
  ALARM_PRICE_1: {
    name: '报警金额 1',
    value: new Uint8Array([0x04, 0x00, 0x10, 0x01]),
  },
  /** 报警金额 2 */
  ALARM_PRICE_2: {
    name: '报警金额 2',
    value: new Uint8Array([0x04, 0x00, 0x10, 0x02]),
  },
  /** 允许透支金额 */
  OVERDRAFT_LIMIT: {
    name: '允许透支金额',
    value: new Uint8Array([0x04, 0x00, 0x10, 0x03]),
  },
  /** 囤积金额 */
  HOARDING_AMOUNT: {
    name: '囤积金额',
    value: new Uint8Array([0x04, 0x00, 0x10, 0x04]),
  },
  /** 日期星期(0~6)时间 0 是星期天*/
  DATE: {
    name: '日期星期时间',
    value: new Uint8Array([0x04, 0x00, 0x01, 0x0C]),
  }
}
/** 继电器控制字 */
export const RELAY_CONTROL_IDENTIFIER = {
  /** 拉闸 */
  VALVE_CLOSE: {
    name: '拉闸',
    value: 0x1A,
  },
  /** 合闸 */
  VALVE_OPEN: {
    name: '合闸',
    value: 0x1B,
  },
  /** 保电 */
  ENSURE_POWER_SUPPLY: {
    name: '保电',
    value: 0x3A,
  },
  /** 保电解除 */
  CANCEL_ENSURE_POWER_SUPPLY: {
    name: '保电解除',
    value: 0x3B,
  },
}
/** 控制码 */
const CMD = {
  // 读取命令
  READ: {
    code: 0x11,
    id: new Uint8Array([0x0F, 0x00, 0x00, 0x01]),
  },
  // 充值控制
  RECHARGE: {
    code: 0x23,
    id: new Uint8Array([0x07, 0x01, 0x01, 0xFF]),
  },
  // 参数设置
  PARAM: {
    code: 0x24,
    id: PARAM_DATA_IDENTIFIER,
  },
  // 继电器控制
  RELAY: {
    code: 0x2C,
    id: RELAY_CONTROL_IDENTIFIER,
  },
};
/** 控制码列表 */
const CMD_LIST = [{
    type: 'read',
    code: 0x11,
    success: 0x91,
    fail: 0xD1,
  },
  {
    type: 'recharge',
    code: 0x23,
    success: 0xA3,
    fail: 0xE3,
  },
  {
    type: 'param',
    code: 0x24,
    success: 0xA4,
    fail: 0xE4,
  },
  {
    type: 'relay',
    code: 0x2C,
    success: 0xAC,
    fail: 0xEC,
  },
];
/** 命令字的位置 */
const CMD_POSITION = 8;
/** 错误字 */
const ERROR_CODE = [{
    code: 0x80,
    msg: "加密认证错误"
  },
  {
    code: 0x02,
    msg: "重复充值"
  },
  {
    code: 0x04,
    msg: "反充充值金额大于剩余金额"
  },
  {
    code: 0x40,
    msg: "充值金额超囤积"
  }
]
/** CRC表 */
const CrcTab = new Uint16Array([
  0x0000, 0x1021, 0x2042, 0x3063, 0x4084, 0x50a5, 0x60c6, 0x70e7,
  0x8108, 0x9129, 0xa14a, 0xb16b, 0xc18c, 0xd1ad, 0xe1ce, 0xf1ef,
  0x1231, 0x0210, 0x3273, 0x2252, 0x52b5, 0x4294, 0x72f7, 0x62d6,
  0x9339, 0x8318, 0xb37b, 0xa35a, 0xd3bd, 0xc39c, 0xf3ff, 0xe3de,
  0x2462, 0x3443, 0x0420, 0x1401, 0x64e6, 0x74c7, 0x44a4, 0x5485,
  0xa56a, 0xb54b, 0x8528, 0x9509, 0xe5ee, 0xf5cf, 0xc5ac, 0xd58d,
  0x3653, 0x2672, 0x1611, 0x0630, 0x76d7, 0x66f6, 0x5695, 0x46b4,
  0xb75b, 0xa77a, 0x9719, 0x8738, 0xf7df, 0xe7fe, 0xd79d, 0xc7bc,
  0x48c4, 0x58e5, 0x6886, 0x78a7, 0x0840, 0x1861, 0x2802, 0x3823,
  0xc9cc, 0xd9ed, 0xe98e, 0xf9af, 0x8948, 0x9969, 0xa90a, 0xb92b,
  0x5af5, 0x4ad4, 0x7ab7, 0x6a96, 0x1a71, 0x0a50, 0x3a33, 0x2a12,
  0xdbfd, 0xcbdc, 0xfbbf, 0xeb9e, 0x9b79, 0x8b58, 0xbb3b, 0xab1a,
  0x6ca6, 0x7c87, 0x4ce4, 0x5cc5, 0x2c22, 0x3c03, 0x0c60, 0x1c41,
  0xedae, 0xfd8f, 0xcdec, 0xddcd, 0xad2a, 0xbd0b, 0x8d68, 0x9d49,
  0x7e97, 0x6eb6, 0x5ed5, 0x4ef4, 0x3e13, 0x2e32, 0x1e51, 0x0e70,
  0xff9f, 0xefbe, 0xdfdd, 0xcffc, 0xbf1b, 0xaf3a, 0x9f59, 0x8f78,
  0x9188, 0x81a9, 0xb1ca, 0xa1eb, 0xd10c, 0xc12d, 0xf14e, 0xe16f,
  0x1080, 0x00a1, 0x30c2, 0x20e3, 0x5004, 0x4025, 0x7046, 0x6067,
  0x83b9, 0x9398, 0xa3fb, 0xb3da, 0xc33d, 0xd31c, 0xe37f, 0xf35e,
  0x02b1, 0x1290, 0x22f3, 0x32d2, 0x4235, 0x5214, 0x6277, 0x7256,
  0xb5ea, 0xa5cb, 0x95a8, 0x8589, 0xf56e, 0xe54f, 0xd52c, 0xc50d,
  0x34e2, 0x24c3, 0x14a0, 0x0481, 0x7466, 0x6447, 0x5424, 0x4405,
  0xa7db, 0xb7fa, 0x8799, 0x97b8, 0xe75f, 0xf77e, 0xc71d, 0xd73c,
  0x26d3, 0x36f2, 0x0691, 0x16b0, 0x6657, 0x7676, 0x4615, 0x5634,
  0xd94c, 0xc96d, 0xf90e, 0xe92f, 0x99c8, 0x89e9, 0xb98a, 0xa9ab,
  0x5844, 0x4865, 0x7806, 0x6827, 0x18c0, 0x08e1, 0x3882, 0x28a3,
  0xcb7d, 0xdb5c, 0xeb3f, 0xfb1e, 0x8bf9, 0x9bd8, 0xabbb, 0xbb9a,
  0x4a75, 0x5a54, 0x6a37, 0x7a16, 0x0af1, 0x1ad0, 0x2ab3, 0x3a92,
  0xfd2e, 0xed0f, 0xdd6c, 0xcd4d, 0xbdaa, 0xad8b, 0x9de8, 0x8dc9,
  0x7c26, 0x6c07, 0x5c64, 0x4c45, 0x3ca2, 0x2c83, 0x1ce0, 0x0cc1,
  0xef1f, 0xff3e, 0xcf5d, 0xdf7c, 0xaf9b, 0xbfba, 0x8fd9, 0x9ff8,
  0x6e17, 0x7e36, 0x4e55, 0x5e74, 0x2e93, 0x3eb2, 0x0ed1, 0x1ef0
]);

/**
 * 读取信息
 * @param {String} address 
 */
export function read(address) {
  return encode(address, CMD.READ.code, CMD.READ.id, false, []);
}

/**
 * 充值
 * @param {String} address 
 * @param {String} rechargeValue 
 */
export function recharge(address, rechargeValue) {
  rechargeValue = convertNumToUint8Array(rechargeValue * 100);
  let date = hexStringToUint8Array(formatTime(false));
  return encode(address, CMD.RECHARGE.code, CMD.RECHARGE.id, true, [rechargeValue, date]);
}

/**
 * 费率1~4电价
 * @param {String} address 表地址
 * @param {Number} index 第几套
 * @param {Number} priceArray 电价数组
 */
export function suitPrice(address, index, priceArray) {
  let id = null
  let args = []
  if(index != 1 && index != 2) {
    return
  }
  if(priceArray.length != 4) {
    return
  }
  for(let i = 0; i < priceArray.length; i++) {
    if(!/^\d{1,4}(\.\d{1,4})?$/.test(priceArray[i])) {
        return
    }
    args[i] = hexStringToUint8Array(fillNumberPrefix(priceArray[i] * 10000, 8));
  }
  id = index == 1 ? PARAM_DATA_IDENTIFIER.FIRST_BUNDLE_PRICE_ALL.value : PARAM_DATA_IDENTIFIER.SECOND_BUNDLE_PRICE_ALL.value
  return encode(address, CMD.PARAM.code, id, true, args)
}

/**
 * 
 * @param {String} address 
 * @param {String} time 年月日时分
 */
export function suitPriceSwitchTime(address, time) {
  time = hexStringToUint8Array(time)
  return encode(address, CMD.PARAM.code, PARAM_DATA_IDENTIFIER.BUNDLE_PRICE_SWITCH_TIME.value, true, [time])
}

/**
 * 报警金额
 * @param {*} address 
 * @param {*} index 
 * @param {*} amount 
 */
export function alarmAmount(address, index, amount) {
  let id = null
  if(index != 1 && index != 2) {
    return
  }
  id = index == 1 ? PARAM_DATA_IDENTIFIER.ALARM_PRICE_1.value : PARAM_DATA_IDENTIFIER.ALARM_PRICE_2.value
  return paramAmountHelper(address, id, amount);
}

/**
 * 运行透支金额
 * @param {String} address 
 * @param {Number} amount 
 */
export function overdraftLimit(address, amount) {
  return paramAmountHelper(address, PARAM_DATA_IDENTIFIER.OVERDRAFT_LIMIT.value, amount)
}

/**
 * 囤积金额
 * @param {String} address 
 * @param {Number} amount 
 */
export function hoardingAmount(address, amount) {
  return paramAmountHelper(address, PARAM_DATA_IDENTIFIER.HOARDING_AMOUNT.value, amount)
}

function paramAmountHelper(address, id, amount) {
  if(!/^\d{1,6}(\.\d{1,2})?$/.test(amount)) {
    return
  }
  amount = hexStringToUint8Array(fillNumberPrefix(amount * 100, 8))
  return encode(address, CMD.PARAM.code, id, true, [amount])
}

/**
 * 继电器控制(拉闸、合闸、保电、保电解除)
 * @param {String} address 
 * @param {Number} value 
 */
export function relayControl(address, value) {
  switch (value) {
    case '1A':
      value = RELAY_CONTROL_IDENTIFIER.VALVE_CLOSE.value
      break;
    case '1B':
      value = RELAY_CONTROL_IDENTIFIER.VALVE_OPEN.value
      break;
    case '3A':
      value = RELAY_CONTROL_IDENTIFIER.ENSURE_POWER_SUPPLY.value
      break;
    case '3B':
      value = RELAY_CONTROL_IDENTIFIER.CANCEL_ENSURE_POWER_SUPPLY.value
      break;
    default:
      break;
  }
  value = new Uint8Array([value]);
  let date = hexStringToUint8Array(formatTime(false));
  return encode(address, CMD.RELAY.code, value, true, [date])
}

/**
 * 构建数据
 * @param {String} address 表地址
 * @param {Number} code 参数设置命令
 * @param {Uint8Array} id 数据标识 
 * @param {Boolean} needCrc 是否需要CRC校验
 * @param {Array} args 数据域参数数组
 */
function encode(address, code, id, needCrc, args) {
  // 整个数据帧的长度
  let length = getLength(needCrc, id, args);
  let data = new Uint8Array(length);
  // 构建帧头
  buildHead(address, data);
  // 数据下标
  let index = HEAD_LENGTH;
  data[index] = code;
  index++;
  data[index] = length - 12;
  index++;
  data.set(littleEndian(id), index);
  let dataDomainIndex = index;
  index += id.length;
  // 放置数据域
  for (let item of args) {
    data.set(littleEndian(item), index);
    index += item.length;
  }
  // 需要CRC校验
  if (needCrc) {
    index = useCrc(data, index);
  }
  // 数据域偏移
  for (let i = dataDomainIndex; i < length - 2; i++) {
    data[i] += DATA_OFFSET;
  }
  // 处理校验和与帧尾
  let cs = checkSum(data);
  data[index] = cs;
  index++;
  data[index] = END;
  return data;
}

/**
 * 执行CRC操作
 * @param {*} data 
 */
function useCrc(data, index) {
  // 生成随机数
  let randomArr = new Uint8Array(4);
  for (let i = 0; i < 4; i++) {
    let random = Math.floor(Math.random() * 256);
    randomArr[i] = random;
  }
  // 对随机数进行处理
  let newRandomArr = new Uint8Array(randomArr);
  seqEnc(newRandomArr, 4);
  // 处理后的随机值赋值给原数据
  for (let i = 0; i < 4; i++) {
    data[index + i] = newRandomArr[i];
  }
  let crc = doCrc(data, index + 4);
  // 原随机值赋值给原数据
  for (let i = 0; i < 4; i++) {
    data[index] = randomArr[i];
    index++;
  }
  data[index] = crc & 0xFF;
  index++;
  data[index] = (crc >>> 8) & 0xFF;
  index++;
  return index;
}
/**
 * 计算整个数据帧需要的长度
 * @param {Boolean} needCrc 需要CRC校验
 * @param  {...ArrayBuffer} args 数据域参数
 */
function getLength(needCrc, id, args) {
  // 数据域长度
  let dataDomainLength = 0;
  // 计算数据长度
  for (let item of args) {
    dataDomainLength += item.length;
  }
  // 需要CRC校验
  if (needCrc) {
    dataDomainLength += 6;
  }
  // 帧头 + 1字节命令字 + 1字节数据长度 + 数据ID +  n个数据域字节数 + 1字节CS + 1字节帧尾
  return HEAD_LENGTH + dataDomainLength + id.length + 4;
}
/**
 * 构建帧头
 * @param {String} address 表地址
 * @param {Uint8Array} data 帧数据
 */
function buildHead(address, data) {
  let index = 0;
  data[index] = HEAD;
  index++;
  let addressArray = littleEndian(hexStringToUint8Array(address));
  for (let i = 0; i < addressArray.length; i++) {
    data[index] = addressArray[i];
    index++;
  }
  data[index] = HEAD;
}

/**
 * 解帧
 * @param {ArrayBuffer} data 
 */
export function decode(data) {
  let unit8Array = new Uint8Array(data);
  // 是否是FE开头
  let isFEHead = true;
  // 只要有一个不是就为false
  for (let i = 0; i < 4; i++) {
    if (unit8Array[i] !== 0xFE) {
      isFEHead = false;
    };
  }
  // 去掉FE开头
  if (isFEHead) {
    unit8Array = unit8Array.subarray(4);
  }
  // 校验不通过
  if (!validate(unit8Array)) {
    return {};
  }
  // 成功帧
  if (isSuccess(unit8Array)) {
    return handleSuccess(unit8Array);
  } else {
    return handleFail(unit8Array);
  }
}

/**
 * 是否是正确帧
 * @param {Uint8Array} data 
 */
function isSuccess(data) {
  let cmd = data[CMD_POSITION];
  for (let item of CMD_LIST) {
    if (cmd === item.success) {
      return true;
    }
  }
  return false;
}

/**
 * 处理正确帧
 * 
 * @param {Uint8Array} data 
 */
function handleSuccess(data) {
  let cmd = data[CMD_POSITION] & 0x7F;
  let res = {};
  res.success = true;
  data = unpack(data);
  switch (cmd) {
    case CMD.READ.code:
      res = decodeRead(data);
      res.method = "读取";
      break;
    case CMD.RECHARGE.code:
      res.method = "充值";
      break;
    case CMD.PARAM.code:
      res.method = "参数设置"
      break;
    case CMD.RELAY.code:
      res.method = "继电器控制";
      break;
    default:
      break;
  }
  return res;
}

/**
 * 解去帧格式
 * @param {Uint8Array} data 
 */
function unpack(data) {
  let domainLength = data[9]
  if (domainLength === 0 || domainLength === 1) {
    return data
  }
  // 对于携带数据的只需要中间的数据域
  data = data.slice(10, data.length - 2)
  data = data.map(item => {
    return item - 0x33
  });
  return data
}
/**
 * 解析读数据
 * @param {*} data 
 */
function decodeRead(data) {
  let res = {
    /** 购电次数 */
    pruchaseCount: null,
    /** 剩余金额 */
    remainAmount: null,
    /** 透支金额 */
    overdraftAmount: null,
    /** 当前电价 */
    currentPrice: null,
    /** 有功总电量 */
    totalConsumption: null,
    /** 有功尖电量 */
    sharpConsumption: null,
    /** 有功峰电量 */
    peekConsumption: null,
    /** 有功平电量 */
    shoulderConsumption: null,
    /** 有功谷电量 */
    offPeakConsumption: null,
    /** 电表运行状态字 */
    status: null
  };
  if (data.length !== 0x28) {
    return res;
  }
  let uint8Array = new Uint8Array(data);
  let dataView = new DataView(uint8Array.buffer);
  let index = 4;
  res.pruchaseCount = dataView.getUint16(index, true);
  index += 2;
  res.remainAmount = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.overdraftAmount = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.currentPrice = dataView.getUint32(index, true).toString(16) / 10000;
  index += 4;
  res.totalConsumption = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.sharpConsumption = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.peekConsumption = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.shoulderConsumption = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.offPeakConsumption = dataView.getUint32(index, true).toString(16) / 100;
  index += 4;
  res.status = dataView.getUint16(index, true).toString(16);
  return res;
}
/**
 * 解析参数数据
 * @param {Uint8Array} data 
 */
function decodeParam(data) {
  let res = {};
  if (data.lenght < 4) {
    return res
  }
  let id = littleEndian(data.subarray(0, 4)).toString();
  for (let item in PARAM_DATA_IDENTIFIER) {
    if (id === PARAM_DATA_IDENTIFIER[item].value.toString()) {
      res.method = PARAM_DATA_IDENTIFIER[item].name;
      return res
    }
  }
  return res;
}
/**
 * 解析中继器数据
 * @param {*} data 
 */
function decodeRelay(data) {
  let res = {};
  let id = littleEndian(data.subarray(0, 4)).toString()
  for (let item in RELAY_CONTROL_IDENTIFIER) {
    if (id === RELAY_CONTROL_IDENTIFIER[item].value.toString()) {
      res.method = RELAY_CONTROL_IDENTIFIER[item].name
      return res
    }
  }
  return res
}
/**
 * 处理失败
 * @param {Uint8Array} data 
 */
function handleFail(data) {
  let cmd = data[CMD_POSITION] & 0x3F
  let res = {}
  res.success = false
  let errorCode = data[data.length - 3]
  if (cmd === CMD.RECHARGE.code) {
    for (let item in ERROR_CODE) {
      if ((errorCode - 0x33) === ERROR_CODE[item].code) {
        res.msg = ERROR_CODE[item].msg
      }
    }
  }
  return res;
}

/**
 * 获取当前格式化的日期
 * @param {Boolean} needDayofWeek 是否需要星期
 */
function formatTime(needDayofWeek) {
  let date = new Date();
  let year = date.getFullYear().toString().slice(-2); // 获取年份后两位
  let month = ('0' + (date.getMonth() + 1)).slice(-2); // 获取月份，补零
  let day = ('0' + date.getDate()).slice(-2); // 获取日期，补零
  let hours = ('0' + date.getHours()).slice(-2); // 获取小时，补零
  let minutes = ('0' + date.getMinutes()).slice(-2); // 获取分钟，补零
  let seconds = ('0' + date.getSeconds()).slice(-2); // 获取秒钟，补零
  let dayOfWeek = '';
  let tmp = year + month + day;
  if (needDayofWeek) {
    dayOfWeek = ('0' + date.getDay()).toString();
    tmp += dayOfWeek
  }
  return tmp + hours + minutes + seconds;
}

/**
 * 填充数字前缀值，并去掉小数点
 * 如：数字:12.12,期望长度:8 => 00001212
 * @param {Number} number 数字
 * @param {Number} targetLength 期望填充后的长度
 */
function fillNumberPrefix(number, targetLength) {
  // 将数字转换为字符串
  let numberString = String(number);
  // 去掉小数点
  numberString = numberString.replace(".", "");
  // 计算需要填充的零的个数
  let zeroCount = targetLength - numberString.length;
  // 填充零
  let prefix = "0".repeat(zeroCount);
  // 返回填充后的字符串
  return prefix + numberString;
}

/**
 * 转化数据为小端存储
 * @param {Uint8Array} data 需要转为小端的数据
 */
function littleEndian(data) {
  let uintArray = new Uint8Array(data);
  let littleEndianArray = new Uint8Array(uintArray.length);
  for (var i = 0; i < uintArray.length; i++) {
    littleEndianArray[i] = uintArray[uintArray.length - i - 1];
  }
  return littleEndianArray;
}

/**
 * 十六进制字符串转为Uint8Array
 * @param {String} hexString 
 */
function hexStringToUint8Array(hexString) {
  let bytes = [];
  hexString = hexString.split(/[\t\r\f\n\s\.]*/g).join('');
  for (var i = 0; i < hexString.length; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }
  return new Uint8Array(bytes);
}

// 将数字转换为长度为4的Uint8Array
function convertNumToUint8Array(num) {
  var uint8Array = new Uint8Array(4);
  uint8Array[0] = (num >> 24) & 0xFF;
  uint8Array[1] = (num >> 16) & 0xFF;
  uint8Array[2] = (num >> 8) & 0xFF;
  uint8Array[3] = num & 0xFF;

  return uint8Array;
}

/**
 * 计算校验和
 * @param {Uint8Array} data 
 */
function checkSum(data) {
  let uint8Array = new Uint8Array(data);
  let cs = 0x00;
  for (let i = 0; i < uint8Array.length - 2; i++) {
    cs += uint8Array[i];
  }
  return cs & 0xFF;
}
/**
 * 校验数据帧格式
 * @param {Uint8Array} data 
 */
function validate(data) {
  let uint8Array = new Uint8Array(data);
  // 校验头
  if (uint8Array[0] !== 0x68) {
    return false;
  }
  if (uint8Array[7] !== 0x68) {
    return false;
  }
  // 校验长度
  if (uint8Array[9] + 12 !== uint8Array.length) {
    return false;
  }
  // 校验CS
  if (uint8Array[uint8Array.length - 2] !== checkSum(uint8Array)) {
    return false;
  }
  // 校验帧尾
  if (uint8Array[uint8Array.length - 1] !== 0x16) {
    return false;
  }
  return true;
}

// ArrayBuffer转16进度字符串示例
export function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
/** 文档内的辅助方法 */
function seqEnc(dataAddr, length) {
  if (length === 0) {
    return;
  }
  for (let i = 0; i < 2; i++) {
    dataAddr[0] += 0x45;
    for (let j = 1; j < length; j++) {
      dataAddr[j] = (dataAddr[j - 1] + dataAddr[j]) ^ 0x5A;
    }
    dataAddr[length - 1] += 0x4D;
    for (let j = length - 1; j > 0; j--) {
      dataAddr[j - 1] = (dataAddr[j] + dataAddr[j - 1]) ^ 0x4E;
    }
  }
}

function doCrc(str, len) {
  let crc = 0x5555;
  for (let i = 0; i < len; i++) {
    let ucData = (crc >>> 8) & 0xFF;
    crc = (crc << 8) ^ CrcTab[ucData ^ str[i]];
  }
  return crc;
}