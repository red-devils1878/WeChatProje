module.export = {
	syncLockData,
}
/*=====================================*/

let BASE_URL = "https://";

export function syncLockData(data) {
	let dic = {
		payload:data
	}
	return syncPost('/nations-aep-lock/ble/push', dic, false);
}

export function syncPost(url, obj) {
	
	let ip = wx.getStorageSync("lock_sync_ip");
	if(ip){
		BASE_URL = "http://" + ip;
	}
	
	console.log("url=>" + BASE_URL + url + "  参数=>" + JSON.stringify(obj))
	
	var promise = new Promise((suc, fail) => {
		
		wx.request({
			url: BASE_URL + url,
			method: 'POST',
			header: {
				'content-type': 'application/json',
			},
			data: obj,
			success: (res) => {
				if (res.data.code == 0) {
					suc(res.data.data)
				} else {
					let errMsg = res.data.message ? res.data.message : '服务器异常';
					fail(errMsg);
				}
			},
			fail: (res) => {
				let errMsg = res.data.message ? res.data.message : '服务器异常';
				fail(errMsg)
			},
			complete: (res) => {
				console.log(url + ':' + ' ' + JSON.stringify(res.data))
			}
		})
	})
	return promise;
}
