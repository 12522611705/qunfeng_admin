import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, message, Upload,
        Divider, Tag, DatePicker, LocaleProvider, Modal, Tree } from 'antd';
import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

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
            Modal:{
               visBmap:false,
            },
            record:{},
            // 工具条查询参数
            toolbarParams:{
                driverName:'',//用户名
                plotName:'',//手机号码
                carNumber:'',//收运费车牌号
                userId:'',//操作人ID
                search:'',//查询字段
                startTime:'',//开始时间
                endTime:'',//结束时间
                pro:'',//省
                city:'',//市
                area:'',//区
                source:'',//用户来源
                pageSize:'',//每页长度
                page:'',//当前页
                type:'',//环卫车类型查询
                companyName:'',//物业公司
                userName:'',//操作人名字
            },
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
                    { title: '车牌号码', dataIndex: 'carNumber', key: 'carNumber'}, 
                    { title: '小区单位/名称', dataIndex: 'plotName', key: 'plotName'}, 
                    { title: '小区桶数', dataIndex: 'barrelage', key: 'barrelage'}, 
                    { title: '垃圾类别', dataIndex: 'rubbishType', key: 'rubbishType', render:(text)=>(
                        ['','可回收垃圾','有害垃圾','其它垃圾','餐厨垃圾'][text]
                    )}, 
                    { title: '当前重量（kg）', dataIndex: 'weight', key: 'weight'}, 
                    { title: '总重量', dataIndex: 'laterWeight', key: 'laterWeight'}, 
                    { title: '时间', dataIndex: 'creationTime', key: 'creationTime'}, 
                    { title: '更多信息', dataIndex: 'more', key: 'more',render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            Modal.info({
                                title: '更多信息',
                                content: (
                                  <div>
                                    <Form.Item {...formItemLayout} label='市'>
                                        {record.city||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='区/县'>
                                        {record.area||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='街道'>
                                        {record.street||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='社区'>
                                        {record.community||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='物业公司'>
                                        {record.companyName||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='清运单位'>
                                        {record.department||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='卡号'>
                                        {record.imei||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='详细地址'>
                                        {record.address||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='环卫车状态'>
                                        <a href="javascript:;" onClick={()=>{
                                            Ajax.get({
                                                url:config.SanitationCarAdmin.urls.details,
                                                params:{
                                                    id:record.id
                                                },
                                                success:(data)=>{
                                                    _this.update('set',addons(_this.state,{
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
                                                                <p>市辖区管理部：${data.companyName}</p>
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
                                        }}>点击查看</a>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='电话'>
                                        {record.tel||'--'}
                                    </Form.Item>
                                  </div>
                                ),
                            });
                        }}>点击查看</a>
                    )}, 
                ],
                data:[]
            },
        }
    }
    componentDidMount(){
        this.initIndex();
        this.initPermission();
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
                    // _this.state.permission[config.Card.permission[el.url]] = true;
                })
                console.log(_this.state.permission)
                _this.setState({});
            }
        })
    }
    /*
     *  初始化页面数据
     */
    initIndex(){
        const _this = this;
        const params = _this.state.toolbarParams;
        Ajax.get({
            url:config.CollectorLog.urls.list,
            params:{
                ...params,
                page:_this.state.indexTable.pagination.current,
                startTime:new Date(params.startTime).getTime() || '',//开始时间
                endTime:new Date(params.endTime).getTime() || '',//结束时间
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
                    }
                }))
            }
        })
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
       
        return (
            <div className="content">
                <Breadcrumb>
                    <Breadcrumb.Item>环卫车管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">收运费记录</a></Breadcrumb.Item>
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
                    style={{ width: 300, marginRight: 10, marginBottom:10 }}/>

                    环卫车类型：
                    <Select value={state.toolbarParams.type} style={{ width: 200, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                type:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">餐厨垃圾环卫车</Select.Option>
                        <Select.Option value="2">其他垃圾环卫车</Select.Option>
                    </Select>
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
                                plotName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.plotName} 
                    placeholder="请输入小区名"
                    addonBefore={<span>小区名</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }}/>


                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                companyName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.companyName} 
                    placeholder="请输入物业公司名"
                    addonBefore={<span>物业公司</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }}/>

                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                userName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.userName} 
                    placeholder="请输入操作人姓名"
                    addonBefore={<span>操作人</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }}/>
                </div>
                <div className="main-toolbar">
                    时间段查询：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startTime ? [moment(state.toolbarParams.startTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endTime, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
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
                        }} />
                    </LocaleProvider>
                </div>
                <div className="main-toolbar">
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>增加</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>修改</Button>

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
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
                    }}>删除</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.SanitationCarAdmin.urls.sanitationCarExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                    <Upload name="file" 
                        style={{display:'inline'}}
                        fileList={[]}
                        headers={{ 
                            token:localStorage.getItem('token')
                        }}
                        action="http://118.190.145.65:8888/flockpeak-shop//admin/sanitationCarAdmin/importExcelSation" 
                        onChange={(info)=>{
                            _this.initIndex();
                        }}>
                        <Button style={{marginRight:10}} type="primary">数据导入</Button>
                    </Upload>
                </div>
                
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination} 
                    rowSelection={{
                        selectedRowKeys:state.indexTable.selectedRowKeys,
                        onChange:(selectedRowKeys)=>{
                            state.indexTable.selectedRowKeys = selectedRowKeys;
                            _this.setState({});
                        }
                    }}
                    columns={state.indexTable.head} dataSource={state.indexTable.data} />

                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
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
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
