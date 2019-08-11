import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Upload, 
    Divider, Tag, DatePicker, Modal, message } from 'antd';

import moment from 'moment';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, formatSearch, parseSearch } from '../utils/global';
import { config } from '../utils/config';

// 组件
import Cascader from '../components/Cascader';

// import { createForm } from 'rc-form';
import BMap  from 'BMap';
const BMAP_NORMAL_MAP =window.BMAP_NORMAL_MAP;
const BMAP_HYBRID_MAP = window.BMAP_HYBRID_MAP;

const { RangePicker } = DatePicker;

class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        const formItemLayout = {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 7 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 15 },
          },
        };
        this.update = update.bind(this);
        this.state = {
            permission:{
                delete:false,
                add:false,
                update:false,
                list:false,
                details:false
            },
            // 表格数据
            indexTable:{
                selectedRowKeys:[],
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        this.state.indexTable.pagination.current = page;
                        this.initIndex();
                    }
                },
                head:[
                    { title: 'ID', dataIndex: 'id', key: 'id'}, 
                    { title: '车牌号', dataIndex: 'carNumber', key: 'carNumber'}, 
                    { title: '辖区管理部门', dataIndex: 'department', key: 'department'}, 
                    { title: '权属单位', dataIndex: 'companyName', key: 'companyName'}, 
                    { title: '环卫车类型', dataIndex: 'type', key: 'type', render:(text,record)=>(
                        ['','可回收物','有害垃圾','其它垃圾','餐厨垃圾'][text]
                    )}, 
                    { title: '车辆管理员', dataIndex: 'adminName', key: 'adminName'}, 
                    { title: 'GPS实时状态', dataIndex: 'gps', key: 'gps', render:(text,record)=>(
                        <span>
                            {_this.state.permission.details?
                            <a href="javascript:;" onClick={()=>{
                                Ajax.get({
                                    url:config.SanitationCarAdmin.urls.details,
                                    params:{
                                        id:record.id
                                    },
                                    success:(data)=>{
                                        this.update('set',addons(this.state,{
                                            Modal:{
                                                visBmap:{
                                                    $set:true
                                                }
                                            },
                                        }));
                                        let map = new BMap.Map("allmap");
                                        let point = new BMap.Point(data.lon, data.lat);
                                        map.centerAndZoom(point, 30);  // 初始化地图,设置中心点坐标和地图级别
                                        let gc = new BMap.Geocoder();

                                        let marker = new BMap.Marker(point);  // 创建标注
                                        map.addOverlay(marker);

                                        
                                        gc.getLocation(point, function (rs) {
                                            var addComp = rs.addressComponents;
                                            
                                            let label = new BMap.Label(`
                                                <div>
                                                    <p>车牌号：${data.carNumber}</p>
                                                    <p>车类型：${data.type||''}</p>
                                                    <p>辖区管理部：${data.companyName}</p>
                                                    <p>今日收集垃圾量：${data.sumWeight||''}</p>
                                                    <p>实时位置：${addComp.street}</p>
                                                </div>
                                            `,{offset:new BMap.Size(20,-10)});
                                            label.setStyle({
                                                padding:'10px 5px',
                                                marginTop:'-130px',
                                                backgroundColor: 'rgba(0,255,60,0.7)',
                                            })
                                            marker.setLabel(label);
                                        });
                                        

                                        //添加地图类型控件
                                        // map.addControl(new BMap.MapTypeControl({
                                        //     mapTypes:[
                                        //         BMAP_HYBRID_MAP,//混合地图
                                        //         BMAP_NORMAL_MAP//地图
                                        //     ]
                                        // }));

                                        //map.setCurrentCity("北京");           设置地图显示的城市 此项是必须设置的
                                        //map.enableScrollWheelZoom(true);     开启鼠标滚轮缩放
                                    }
                                })
                            }}>点击查看</a>:'--'}
                        </span>
                    )},
                    { title: '更多信息', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        _this.state.permission.details?
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                Modal.info({
                                    title: '更多信息',
                                    content: (
                                      <div>
                                        <Form.Item {...formItemLayout} label='省'>
                                            {record.pro||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='市'>
                                            {record.city||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='区'>
                                            {record.area||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='街道'>
                                            {record.street||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='社区'>
                                            {record.community||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='详细地址'>
                                            {record.address||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='电话'>
                                            {record.tel||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='IMEI号'>
                                            {record.imei||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='工作参数'>
                                            {record.isWord||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='车辆上户时间'>
                                            {record.bindingTime||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='车辆品牌'>
                                            {record.brand||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='燃油类型'>
                                            {['','汽油','柴油','电动'][record.fuelType]||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='备注'>
                                            {record.remark||'--'}
                                        </Form.Item>
                                      </div>
                                    ),
                                });
                            }}>查看更多</a>
                        </span>:''
                    )},
                ],
                data:[]
            },
            toolbarParams:{
                carName:'',
                // driverName:'',
                carNumber:'',
                imei:'',
                pro:'',
                city:'',
                area:'',
                street:'',
                type:'',
                adminRole:'',
                tel:''
            },
            Modal:{
                visRecord:false,
                visBmap:false
            },
            recordType:'add',
            record:{},
            newRecord:{
                carName:'',
                // driverName:'',
                carNumber:'',
                imei:'',
                type:'',
                pro:'',
                city:'',
                area:'',
                street:'',
                isWord:''
            }
        }
    }
    componentDidMount(){
        this.initIndex()
        this.initPermission()
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
    }
    // 初始化权限管理
    initPermission(){
        const _this = this;
        let search = parseSearch(_this.props.location.search);
        Ajax.get({
            url:config.JurisdictionAdmin.urls.list,
            params:{
                type:3,
                fatherMenuId:search.id
            },
            success:(data)=>{
                data.forEach((el)=>{
                    _this.state.permission[config.SanitationCarAdmin.permission[el.url]] = true;
                })
                _this.setState({});
            }
        })
    }
    /*
     *  初始化页面数据
     */
    initIndex(updateParams){
        const _this = this;
        const params = _this.state.toolbarParams;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.SanitationCarAdmin.urls.list,
                params:{
                    page:_this.state.indexTable.pagination.current||1,
                    pageSize:_this.state.indexTable.pagination.pageSize||10,
                    carName:params.carName||'',
                    // driverName:params.driverName||'',
                    carNumber:params.carNumber||'',
                    imei:params.imei||'',
                    pro:params.pro||'',
                    city:params.city||'',
                    area:params.area||'',
                    street:params.street||'',
                    tel:params.tel||'',
                    companyName:params.companyName||'',
                    department:params.department||'',
                    adminRole:params.adminRole||'',
                    type:params.type||'',
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        indexTable:{
                            data:{
                                $set:data.data||[]
                            },
                            pagination:{
                                total:{
                                    $set:data.count
                                },
                                pageSize:{
                                    $set:data.pageSize
                                },
                                current:{
                                    $set:_this.state.indexTable.pagination.current
                                }
                            }
                        },
                        ...updateParams
                    }))
                    resolve();
                }
            })
        })
    }
    /**
     * @desc   修改密码
     * @date   2019-04-08
     * @author luozhou
     * @param  {String} key   需要修改的信息的key
     * @param  {String} value 对应key的值
     */
    updateNewRecord(key,value){
        this.update('set',addons(this.state,{
            newRecord:{
                [key]:{
                    $set:value
                }
            }
        }))
    }
    isVehicleNumber(vehicleNumber){
        var xreg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
        var creg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
        if(vehicleNumber.length == 7){
            return creg.test(vehicleNumber);
        } else if(vehicleNumber.length == 8){
            return xreg.test(vehicleNumber);
        } else{
            return false;
        }
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
        const formItemLayout = {
          labelCol: {
            xs: { span: 24 },
            sm: { span: 6 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 16 },
          },
        };
        return (
            <div className="content">
                
                <Breadcrumb>
                    <Breadcrumb.Item>环卫车管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">环卫车列表</a></Breadcrumb.Item>
                </Breadcrumb>
                
                <div className="main-toolbar">
                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                carNumber:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.carNumber} 
                    placeholder="请输入车牌号"
                    addonBefore={<span>车牌号</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                imei:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.imei} 
                    placeholder="请输入IMEI号"
                    addonBefore={<span>IMEI号</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                    环卫车类型：<Select value={state.toolbarParams.type} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                type:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="4">餐厨垃圾</Select.Option>
                        <Select.Option value="1">可回收物</Select.Option>
                        <Select.Option value="2">有害垃圾</Select.Option>
                        <Select.Option value="3">其它垃圾</Select.Option>
                    </Select>
                </div>

                <div className="main-toolbar">
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                department:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.department} 
                    placeholder="请输入辖区管理部门"
                    addonBefore={<span>辖区管理部门</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                companyName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.companyName} 
                    placeholder="请输入权属单位"
                    addonBefore={<span>权属单位</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />
                </div>
                <div className="main-toolbar">
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminRole:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.adminRole} 
                    placeholder="请输入车辆管理员姓名"
                    addonBefore={<span>车辆管理员</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                tel:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.tel} 
                    placeholder="请输入电话号码"
                    addonBefore={<span>联系电话</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />
                </div>
                <div className="main-toolbar">
                    详细地址：
                    <Cascader data={state.toolbarParams} onChange={(data)=>{
                        console.log(data)
                        update('set',addons(state,{
                            toolbarParams:{
                                pro:{$set:data.pro},
                                city:{$set:data.city},
                                area:{$set:data.area},
                                street:{$set:data.street}
                            }
                        }))
                    }}/>
                </div>
                
                <div className="main-toolbar">
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams = {
                            page:1,
                            pageSize:10,
                            carName:'',
                            // driverName:params.driverName||'',
                            carNumber:'',
                            imei:'',
                            companyName:'',//权属单位
                            department:'',//辖区管理部门
                            pro:'',
                            city:'',
                            area:'',
                            street:'',
                            type:'',
                            adminRole:'',
                            tel:''
                        }
                        _this.initIndex({
                            toolbarParams:{
                                page:{$set:1},//用户名
                                pageSize:{$set:10},//手机号码
                                carName:{$set:''},//查询字段
                                carNumber:{$set:''},//性别
                                imei:{$set:''},//用户ick号
                                companyName:{$set:''},//权属单位
                                department:{$set:''},//辖区管理部门
                                pro:{$set:''},//省
                                city:{$set:''},//市
                                area:{$set:''},//市
                                street:{$set:''},//市
                                type:{$set:''},//环卫车类型
                                adminRole:{$set:''},//环卫车类型
                                tel:{$set:''},//环卫车类型
                            }
                        })
                    }}>重置</Button>
                    {
                        state.permission.add ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            _this.state.Modal.visRecord = true;
                            _this.state.recordType = 'add';
                            _this.state.newRecord = {
                                address:'',
                                adminName:'',
                                area:'',
                                bindingTime:'',
                                brand:'',
                                carNumber:'',
                                city:'',
                                community:'',
                                companyName:'',
                                department:'',
                                fuelType:'',
                                imei:'',
                                lat:'',
                                lon:'',
                                pro:'',
                                remark:'',
                                street:'',
                                tel:'',
                                type:'',
                                weight:''
                            }
                            _this.setState({});
                        }}>增加</Button>:''
                    }
                    {
                        _this.state.permission.update ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.state.Modal.visRecord = true;
                            _this.state.recordType = 'update';
                            _this.state.record = record;
                            _this.state.newRecord = {
                                address:record.address,
                                adminName:record.adminName,
                                area:record.area,
                                bindingTime:record.bindingTime,
                                brand:record.brand,
                                carNumber:record.carNumber,
                                city:record.city,
                                community:record.community,
                                companyName:record.companyName,
                                department:record.department,
                                fuelType:record.fuelType,
                                imei:record.imei,
                                lat:record.lat,
                                lon:record.lon,
                                pro:record.pro,
                                remark:record.remark,
                                street:record.street,
                                tel:record.tel,
                                type:record.type,
                                weight:record.weight
                            }
                            _this.setState({});
                        }}>修改</Button>:''
                    }
                    

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    {
                        _this.state.permission.delete ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行删除');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行删除');
                            Modal.confirm({
                                title:'提示',
                                content:'你确定要删除吗？',
                                okText:'确定',
                                cancelText:'取消',
                                onOk(){
                                    Ajax.post({
                                        url:config.SanitationCarAdmin.urls.delete,
                                        params:{
                                            carId:_this.state.indexTable.selectedRowKeys
                                        },
                                        success:(data)=>{
                                            _this.initIndex();
                                        }
                                    })
                                }
                            })
                        }}>删除</Button>:''    
                    }
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.SanitationCarAdmin.urls.sanitationCarExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                    <Upload name="file" 
                        style={{display:'inline'}}
                        className="myupdate"
                        headers={{ 
                            token:localStorage.getItem('token')
                        }}
                        action="http://118.190.145.65:8888/flockpeak-shop//admin/sanitationCarAdmin/importExcelSation" 
                        onChange={(info)=>{
                            if(info.file.response && info.file.response.code) {
                                message.info(info.file.response.msg);
                            }
                            _this.initIndex();
                        }}>
                        <Button style={{marginRight:10}} type="primary">数据导入</Button>
                    </Upload>
                </div>
                <Modal title={state.recordType=='add'?'添加环卫车':'修改环卫车记录'}
                   onOk={()=>{
                        let url = '';
                        if(state.recordType=='add'){
                            url  = config.SanitationCarAdmin.urls.add
                        }else if(state.recordType=='update'){
                            url  = config.SanitationCarAdmin.urls.update
                        }
                        if(!_this.isVehicleNumber(state.newRecord.carNumber.replace(/\s+/g,""))) return message.info('请输入的车牌号无效');
                        if(state.newRecord.imei.length!=15) return message.info('请输入IMEI前15位数字');
                        Ajax.post({
                            url,
                            params:{
                                ...state.newRecord,
                                bindingTime:new Date(state.newRecord.bindingTime).getTime(),
                                id:state.recordType=='update'?state.record.id:''
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visRecord:{$set:false}}})
                            }
                        })
                   }}
                   onCancel={()=>{
                    update('set',addons(state,{Modal:{visRecord:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visRecord}>
                   
                    <Form.Item {...formItemLayout} label="车辆管理员" >
                        <Input placeholder="请输入车辆管理员" onChange={(e)=>{
                            _this.updateNewRecord('adminName',e.target.value);
                        }} value={state.newRecord.adminName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="上户时间" >
                        <DatePicker value={state.newRecord.bindingTime ? moment(state.newRecord.bindingTime, 'YYYY/MM/DD') : null} 
                            onChange={(date, dateString)=>{
                                console.log(dateString)
                            _this.updateNewRecord('bindingTime',dateString);
                        }} />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="车辆品牌" >
                        <Input placeholder="请输入车辆品牌" onChange={(e)=>{
                            _this.updateNewRecord('brand',e.target.value);
                        }} value={state.newRecord.brand}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="车牌号" >
                        <Input placeholder="请输入车牌号" onChange={(e)=>{
                            _this.updateNewRecord('carNumber',e.target.value);
                        }} value={state.newRecord.carNumber}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="权属单位" >
                        <Input placeholder="请输入权属单位" onChange={(e)=>{
                            _this.updateNewRecord('companyName',e.target.value);
                        }} value={state.newRecord.companyName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="辖区管理部门" >
                        <Input placeholder="请输入辖区管理部门" onChange={(e)=>{
                            _this.updateNewRecord('department',e.target.value);
                        }} value={state.newRecord.department}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="燃油类型" >
                        <Select value={String(state.newRecord.fuelType)} onChange={(value)=>{
                             _this.updateNewRecord('fuelType',value);
                        }} style={{ width: 120, marginRight:10 }}>
                            <Select.Option value="1">汽油</Select.Option>
                            <Select.Option value="2">柴油</Select.Option>
                            <Select.Option value="3">电动</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="imei号" >
                        <Input placeholder="请输入imei号" onChange={(e)=>{
                            _this.updateNewRecord('imei',e.target.value);
                        }} value={state.newRecord.imei}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="经度" >
                        <Input placeholder="请输入经度" onChange={(e)=>{
                            _this.updateNewRecord('lat',e.target.value);
                        }} value={state.newRecord.lat}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="纬度" >
                        <Input placeholder="请输入纬度" onChange={(e)=>{
                            _this.updateNewRecord('lon',e.target.value);
                        }} value={state.newRecord.lon}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="备注" >
                        <Input placeholder="请输入备注" onChange={(e)=>{
                            _this.updateNewRecord('remark',e.target.value);
                        }} value={state.newRecord.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="环卫车类型" >
                       <Select value={state.newRecord.type} onChange={(value)=>{
                             _this.updateNewRecord('type',value);
                        }} style={{ width: 120, marginRight:10 }}>
                            <Select.Option value="4">餐厨垃圾</Select.Option>
                            <Select.Option value="1">可回收物</Select.Option>
                            <Select.Option value="2">有害垃圾</Select.Option>
                            <Select.Option value="3">其它垃圾</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="联系电话" >
                        <Input placeholder="请输入联系电话" onChange={(e)=>{
                            _this.updateNewRecord('tel',e.target.value);
                        }} value={state.newRecord.tel}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="地址" >
                        {
                            state.Modal.visRecord ?
                            <Cascader data={state.newRecord} onChange={(data)=>{
                                console.log(data)
                                update('set',addons(state,{
                                    newRecord:{
                                        pro:{$set:data.pro},
                                        city:{$set:data.city},
                                        area:{$set:data.area},
                                        street:{$set:data.street}
                                    }
                                }))
                            }}/>:''    
                        }
                        
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="详细地址" >
                        <Input placeholder="请输入详细地址" onChange={(e)=>{
                            _this.updateNewRecord('address',e.target.value);
                        }} value={state.newRecord.address}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="是否在工作中" > 
                        <Select placeholder="请选择是否在工作中" value={state.newRecord.isWord} style={{ width: '100%' }} onChange={(value)=>{
                            _this.updateNewRecord('isWord',value);
                        }}>
                          <Select.Option value="1">是</Select.Option>
                          <Select.Option value="2">否</Select.Option>
                        </Select>
                    </Form.Item>
                </Modal>
                <Modal title="环卫车状态"
                   onOk={()=>{
                        
                   }}
                   width={600}
                   onCancel={()=>{
                    update('set',addons(state,{Modal:{visBmap:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visBmap}>
                    <div style={{height:"400px"}} id={"allmap"}></div>
                </Modal>
                <Table 
                    rowSelection={{
                        selectedRowKeys:state.indexTable.selectedRowKeys,
                        onChange:(selectedRowKeys)=>{
                            state.indexTable.selectedRowKeys = selectedRowKeys;
                            _this.setState({});
                        }
                    }}
                    rowKey={record=>record.id} pagination={state.indexTable.pagination} 
                    columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
