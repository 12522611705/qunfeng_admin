
import { message } from 'antd';
import emitter from '../utils/events';

const responseStatus = {
	'200': 10000, 		// [success] 请求成功 
	'404': 404 , 	// ['not defined'] 请求失败，请求所希望得到的资源未被在服务器上发现
	'503': 503, 	// ['Service Unavailable'] 由于临时的服务器维护或者过载，服务器当前无法处理请求。
	'500': 500 		// ['Internal Server Error'] 服务器遇到了一个未曾预料的状况，导致了它无法完成对请求的处理。
}

export const parseTree = (data)=>{
    let tree = [];
    console.log(data)
    return tree;
}

/**
 * @desc   格式化url？后面的参数为Object格式
 * @date   2019-03-21
 * @author luozhou
 * @param  {String} search 
 */
export const parseSearch = (search)=>{
	
	let obj = {};
	let str = search.split('?')[1] || '';

	str.split('&').forEach((el)=>{
		el && (obj[el.split('=')[0]] = el.split('=')[1])
	})
	return obj;
}

/**
 * @desc   将复杂对象Object转换成fetch请求参数所需格式[跟url带的参数格式一样]
 * @date   2019-03-21
 * @author luozhou
 * @param  [Object]   param      所需要转化的json对象数据
 * @param  [Object]   key      	 内置参数，不用传
 * @param  [Object]   encode     内置参数，不用传
 */
export const formatSearch = (param, key, encode)=>{
	if(param==null) return '';  
	var paramStr = '';  
	var t = typeof (param);  
	if (['string','number','boolean'].indexOf(t)>=0) {  
	    paramStr += '&' + key + '=' + ((encode==null||encode) ? encodeURIComponent(param) : param);  
	} else {  
	    for (var i in param) {  
	      	var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);  
	      	paramStr += param[i] && formatSearch(param[i], k, encode);  
	    }  
	}  
	return paramStr;  
}

/**
 * @desc   POST请求
 * @date   2019-03-21
 * @author luozhou
 * @param  [Object]   options
 * 			@param   options.success   请求成功回掉
 * 			@param   options.error     请求失败回掉
 * 			@param   options.url       请求路径
 * 			@param   options.params    请求参数
 * 			@param   options.complete  返回完整数据
 * 			@param   options.loading   是否打开loading
 * 			@param   options.delay     loading延迟，默认500ms
 */
const post = (options)=>{
	const delay = setTimeout(()=>{
		options.loading && emitter.emit('loading', true);
	},options.delay || 500)
	let params = (options.params && Object.keys(options.params).length) ? options.params : {};
	// let params = new FormData();
	// Object.keys(options.params).forEach((key)=>{
	// 	options.params[key] && params.append(key,options.params[key]);
	// })
	fetch(options.url,{
	    type:'post',
	    method:'post',
	    // body: formatSearch(params),
	    body: 'request=' + JSON.stringify(params).replace(/"/g,"'"),
	    // body: params,
	    headers:{
	        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	        'token': localStorage.getItem('token')
	    }
	}).then((response)=>{
	    if( !response.ok ) console.log('请求失败');
	    return response.json();
	}).then((json)=>{
		// 9997 token过期
		if(json.code == 9997){
			localStorage.setItem('token','');
            window.location.reload();
            return message.error(json.msg)
		}
		// 9999系统异常 9998没有操作权限
		if(json.code == 9999 || json.code == 9998){
			return message.error(json.msg);
		}
		if(options.complete){
			if(json.code == responseStatus['200']){
				options.success && options.success(json);
			}else{
				options.error && options.error(json);
			}		
		}else{
			if(json.code == responseStatus['200']){
				options.success && options.success(json.data);
			}else{
				options.error && options.error(json.data);
			}		
		}
		clearTimeout(delay);
		options.loading && emitter.emit('loading', false);
	}).catch((ex)=>{
		options.error && options.error();
		clearTimeout(delay);
		options.loading && emitter.emit('loading', false);
	})	
}

/**
 * @desc   GET请求
 * @date   2019-03-21
 * @author luozhou
 * @param  [Object]   options
 * 			@param   options.success   请求成功回掉
 * 			@param   options.error     请求失败回掉
 * 			@param   options.url       请求路径
 * 			@param   options.complete  返回完整数据
 * 			@param   options.params    请求的参数
 * 			@param   options.loading   是否打开loading
 * 			@param   options.delay     loading延迟，默认500ms
 */
const get = (options)=>{
	
	const delay = setTimeout(()=>{
		options.loading && emitter.emit('loading', true);
	},options.delay || 500)
	fetch(options.url+'?'+formatSearch(options.params),{
		type:'get',
	    headers:{
	        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
	        'token': localStorage.getItem('token')
	    },
		method:'get'
	}).then((response)=>{
		if( !response.ok ) console.log('请求失败');
		return response.json();
	}).then((json)=>{
		// 9997 token过期
		if(json.code == 9997){
			localStorage.setItem('token','');
            window.location.reload();
            message.error(json.msg)
		}
		// 9999系统异常 9998没有操作权限
		if(json.code == 9999 || json.code == 9998){
			return message.error(json.msg);
		}
		if(options.complete){
			if(json.code == responseStatus['200']){
				options.success && options.success(json);
			}else{
				options.error && options.error(json);
			}		
		}else{
			if(json.code == responseStatus['200']){
				options.success && options.success(json.data);
			}else{
				options.error && options.error(json.data);
			}		
		}
		clearTimeout(delay);
		options.loading && emitter.emit('loading', false);
	}).catch((ex)=>{
		options.error && options.error();
		clearTimeout(delay);
		options.loading && emitter.emit('loading', false);
	})

}
/**
 * @desc   图片上传请求
 * @date   2019-05-10
 * @author luozhou
 * @param  [Object]   options
 * 			@param   options.success   请求成功回掉
 * 			@param   options.error     请求失败回掉
 * 			@param   options.progress  上传进度条发生变化时调用
 * 			@param   options.url       请求路径
 * 			@param   options.params    请求参数
 * 			@param   options.loading   是否打开loading
 * 			@param   options.delay     loading延迟，默认500ms
 */
const img = (options)=>{
	const delay = setTimeout(()=>{
		options.loading && emitter.emit('loading', true);
	},options.delay || 500)

	const serverURL = options.url
    const xhr = new XMLHttpRequest
    const fd = new FormData()

    const fn = ()=>{

    }
  
    xhr.upload.addEventListener("progress", options.progress && fn, false)
    xhr.addEventListener("load", options.success && fn, false)
    xhr.addEventListener("error", options.error && fn, false)
    xhr.addEventListener("abort", options.error && fn, false)
    fd.append('file', options.params.file)
    xhr.open('POST', serverURL, true)
    xhr.send(fd)
}

export const Ajax = {
	post,
	img,
	get
}

