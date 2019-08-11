import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Upload, LocaleProvider,
    Divider, Tag, DatePicker, Modal, message } from 'antd';

import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

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
            queryList:[],
            // 表格数据
            indexTable:{
                selectedRowKeys:[],
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.indexTable.pagination.current = page;
                        _this.initIndex();
                    }
                },
                head:[
                    { title: 'ID', dataIndex: 'id', key: 'id'}, 
                    { title: '用户名', dataIndex: 'userName', key: 'userName'}, 
                    { title: '卡号', dataIndex: 'ickNo', key: 'ickNo'}, 
                    { title: '总重量', dataIndex: 'weight', key: 'weight'}, 
                    { title: '当前环保金', dataIndex: 'integral', key: 'integral'}, 
                    { title: '总环保金', dataIndex: 'sum', key: 'sum'}, 
                    { title: '总绿色贡献值', dataIndex: 'lvs', key: 'lvs'}, 
                    { title: '回收时间', dataIndex: 'createTime', key: 'createTime'}, 
                    { title: '查看详情', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        !_this.state.permission.details?
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                Modal.info({
                                    title: '更多信息',
                                    width:800,
                                    content: (
                                      <div>
                                        <Table rowKey={record=>record.id} dataSource={record.garbageLogDetailss} columns={[
                                            // { title: '时间', dataIndex: 'createTime', key: 'createTime'},
                                            { title: '用户名', dataIndex: 'userName', key: 'userName'},
                                            { title: '回收类型', dataIndex: 'className', key: 'className'},
                                            { title: '重量kg', dataIndex: 'weightDetails', key: 'weightDetails'},
                                            { title: '环保金', dataIndex: 'price', key: 'price'},
                                            { title: '绿色贡献值', dataIndex: 'integralDetails', key: 'integralDetails'},
                                        ]} />
                                      </div>
                                    ),
                                });
                            }}>点击查看</a>
                        </span>:''
                    )},
                    { title: '设备类型', dataIndex: 'type', key: 'type', render:(text,record)=>(
                        ['','办公室','移动称'][text]
                    )}, 
                    { title: '设备编号', dataIndex: 'number', key: 'number'}, 
                    { title: '权属单位', dataIndex: 'company', key: 'company'}, 
                    { title: '操作人员', dataIndex: 'adminRole', key: 'adminRole'}, 
                    { title: '操作人员ID', dataIndex: 'createAdminId', key: 'createAdminId'}, 
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
        this.initQueryList()
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
                    _this.state.permission[config.GarbageLog.permission[el.url]] = true;
                })
                _this.setState({});
            }
        })
    }
    // 初始化回收种类列表
    initQueryList(){
        const _this = this;
        Ajax.get({
            url:config.GarbageLog.urls.queryList,
            params:{},
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    queryList:{$set:data} 
                }))
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
                url:config.GarbageLog.urls.list,
                params:{
                    page:_this.state.indexTable.pagination.current||1,
                    pageSize:_this.state.indexTable.pagination.pageSize||10,
                    ...params,
                    startTime:new Date(params.startTime).getTime()||'',//开始时间
                    endTime:new Date(params.endTime).getTime()||'',//结束时间
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
                    <Breadcrumb.Item>垃圾分类设备管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">回收记录列表</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    设备类型：<Select value={state.toolbarParams.type} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                type:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="1">办公室回收箱</Select.Option>
                        <Select.Option value="2">移动称</Select.Option>
                    </Select>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                number:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.number} 
                    placeholder="请输入设备编号"
                    addonBefore={<span>设备编号</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
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
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
                    回收类型：<Select value={state.toolbarParams.category} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                category:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        {
                            state.queryList.map((el,index)=>(
                                <Select.Option key={index} value={el}>{el}</Select.Option>
                            ))
                        }
                    </Select>
                </div>
                
                <div className="main-toolbar">
                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                userName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.userName} 
                    placeholder="请输入用户名"
                    addonBefore={<span>用户名</span>} 
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
                    addonBefore={<span>电话号码</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                ickNo:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.ickNo} 
                    placeholder="请输入IC卡号码"
                    addonBefore={<span>IC卡号码</span>} 
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
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                section:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.section} 
                    placeholder="请输入辖区管理部门"
                    addonBefore={<span>辖区管理部门</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                company:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.company} 
                    placeholder="请输入权属单位"
                    addonBefore={<span>权属单位</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                    回收时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startTime ? [moment(state.toolbarParams.startTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endTime, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                            // state.toolbarParams.startTime = dateString[0];
                            // state.toolbarParams.endTime = dateString[1];
                            update('set',addons(state,{
                                toolbarParams:{
                                    startTime:{
                                        $set:dateString[0]
                                    },
                                    endTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                            // _this.initIndex();
                        }} />
                    </LocaleProvider>
                </div>
                <div className="main-toolbar">
                    

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.urls.exportGarbageLogExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                    
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
                   
                    <Form.Item {...formItemLayout} label="详细地址" >
                        <Input placeholder="请输入详细地址" onChange={(e)=>{
                            _this.updateNewRecord('address',e.target.value);
                        }} value={state.newRecord.address}/>
                    </Form.Item>
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
                    <Form.Item {...formItemLayout} label="垃圾重量" >
                        <Input placeholder="请输入垃圾重量" onChange={(e)=>{
                            _this.updateNewRecord('weight',e.target.value);
                        }} value={state.newRecord.weight}/>
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
                    <Form.Item {...formItemLayout} label="是否在工作中" > 
                        <Select placeholder="请选择是否在工作中" value={state.newRecord.isWord} style={{ width: '100%' }} onChange={(value)=>{
                            _this.updateNewRecord('isWord',value);
                        }}>
                          <Select.Option value="1">是</Select.Option>
                          <Select.Option value="2">否</Select.Option>
                        </Select>
                    </Form.Item>
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
