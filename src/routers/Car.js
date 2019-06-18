import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, message } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, formatSearch } from '../utils/global';
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
            // 表格数据
            indexTable:{
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
                    { title: 'imei号', dataIndex: 'imei', key: 'imei'}, 
                    { title: '环卫车类型', dataIndex: 'type', key: 'type'}, 
                    { title: '是否在工作中', dataIndex: 'isWord', key: 'isWord', render:(text)=>(
                        ['','是','否'][text]
                    )},
                    { title: '是否行驶中', dataIndex: 'isAuto', key: 'isAuto', render:(text)=>(
                        ['','是','否'][text]
                    )},
                    { title: 'GPS是否在线', dataIndex: 'gps', key: 'gps', render:(text)=>(
                        ['','是','否'][text]
                    )},
                    { title: '环卫车状态', dataIndex: 'morestatus', key: 'morestatus', render:(text,record)=>(
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
                                    map.centerAndZoom(point, 12);  // 初始化地图,设置中心点坐标和地图级别
                                    let gc = new BMap.Geocoder();

                                    let marker = new BMap.Marker(point);  // 创建标注
                                    map.addOverlay(marker);

                                    
                                    gc.getLocation(point, function (rs) {
                                        var addComp = rs.addressComponents;
                                        
                                        let label = new BMap.Label(`
                                            <div>
                                                <p>车牌号：${data.carNumber}</p>
                                                <p>车类型：${data.type||''}</p>
                                                <p>所属单位：${data.companyName}</p>
                                                <p>今日收集垃圾量：${data.sumWeight||''}</p>
                                                <p>实时位置：${addComp.street}</p>
                                                <p>实时速度：${data.speed}</p>
                                                <p>时间：：${data.time}</p>
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
                        }}>点击查看</a>
                    )},
                    { title: '更多信息', dataIndex: 'more', key: 'more', render:(text,record)=>(
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
                                    <Form.Item {...formItemLayout} label='所属单位'>
                                        {record.companyName||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='车辆管理员'>
                                        {record.adminRole||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='联系电话'>
                                        {record.tel||'--'}
                                    </Form.Item>
                                  </div>
                                ),
                            });
                        }}>点击查看</a>
                    ) }, 
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                this.update('set',addons(this.state,{
                                    Modal:{
                                        visRecord:{
                                            $set:true
                                        }
                                    },
                                    recordType:{
                                        $set:'update'
                                    },
                                    record:{
                                        $set:record
                                    },
                                    newRecord:{
                                        adminRole:{
                                            $set:record.adminRole
                                        },
                                        tel:{
                                            $set:record.tel
                                        },
                                        carName:{
                                            $set:record.carName
                                        },
                                        // driverName:{
                                        //     $set:record.driverName
                                        // },
                                        carNumber:{
                                            $set:record.carNumber
                                        },
                                        imei:{
                                            $set:record.imei
                                        },
                                        type:{
                                            $set:record.type
                                        },
                                        pro:{
                                            $set:record.pro
                                        },
                                        city:{
                                            $set:record.city
                                        },
                                        area:{
                                            $set:record.area
                                        },
                                        isWord:{
                                            $set:String(record.isWord)
                                        },
                                    }
                                }))
                            }}>修改</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{
                                Modal.confirm({
                                    title:'提示',
                                    content:'你确定要删除吗？',
                                    okText:'确定',
                                    cancelText:'取消',
                                    onOk(){
                                        Ajax.post({
                                            url:config.SanitationCarAdmin.urls.delete,
                                            params:{
                                                carId:record.id
                                            },
                                            success:(data)=>{
                                                _this.initIndex();
                                            }
                                        })
                                    }
                                })
                               
                            }}>删除</a>
                        </span>
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
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
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
                    <Button type="primary" onClick={()=>{
                        update('set',addons(state,{
                            Modal:{
                                visRecord:{
                                    $set:true
                                }
                            },
                            recordType:{
                                $set:'add'
                            },
                            newRecord:{
                                carName:{
                                    $set:''
                                },
                                // driverName:{
                                //     $set:''
                                // },
                                carNumber:{
                                    $set:''
                                },
                                imei:{
                                    $set:''
                                },
                                type:{
                                    $set:''
                                },
                                pro:{
                                    $set:''
                                },
                                city:{
                                    $set:''
                                },
                                area:{
                                    $set:''
                                },
                                isWord:{
                                    $set:''
                                },
                            }
                        }))
                    }}>添加环卫车</Button>
                </div>
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
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="0">普通用户</Select.Option>
                        <Select.Option value="1">保洁员</Select.Option>
                        <Select.Option value="2">物业公司工作人员</Select.Option>
                        <Select.Option value="3">街道人员</Select.Option>
                        <Select.Option value="4">城管局</Select.Option>
                        <Select.Option value="5">司机</Select.Option>
                        <Select.Option value="6">公司人员</Select.Option>
                    </Select>
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

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>

                    <Button type="primary" onClick={()=>{
                        window.open(config.SanitationCarAdmin.urls.sanitationCarExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
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
                                number:0,
                                maxWeight:1,
                                carName:state.newRecord.carName,
                                // driverName:{
                                //     $set:record.driverName
                                // },
                                carNumber:state.newRecord.carNumber,
                                imei:state.newRecord.imei,
                                adminRole:state.newRecord.adminRole,
                                tel:state.newRecord.tel,
                                type:state.newRecord.type,
                                pro:state.newRecord.pro,
                                city:state.newRecord.city,
                                area:state.newRecord.area,
                                street:state.newRecord.street,
                                isWord:state.newRecord.isWord,
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
                    <Form.Item {...formItemLayout} label="车名" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            _this.updateNewRecord('carName',e.target.value);
                        }} value={state.newRecord.carName}/>
                    </Form.Item>
                    {/*
                    <Form.Item {...formItemLayout} label="司机名" >
                        <Input placeholder="请输入司机名" onChange={(e)=>{
                            _this.updateNewRecord('driverName',e.target.value);
                        }} value={state.newRecord.driverName}/>
                    </Form.Item>*/}
                    <Form.Item {...formItemLayout} label="车牌号" >
                        <Input placeholder="请输入车牌号" onChange={(e)=>{
                            _this.updateNewRecord('carNumber',e.target.value);
                        }} value={state.newRecord.carNumber}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="imei" >
                        <Input placeholder="请输入emei" onChange={(e)=>{
                            _this.updateNewRecord('imei',e.target.value);
                        }} value={state.newRecord.imei}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="车辆管理员" >
                        <Input placeholder="请输入车辆管理员姓名" onChange={(e)=>{
                            _this.updateNewRecord('adminRole',e.target.value);
                        }} value={state.newRecord.adminRole}/>
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
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination} 
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
