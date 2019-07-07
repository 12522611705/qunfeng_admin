import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, LocaleProvider, Modal, Tree } from 'antd';
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
                    { title: '环卫车类型', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['全部','餐厨垃圾环卫车','其它垃圾环卫车'][text] || '全部'
                    )},
                    { title: '省', dataIndex: 'pro', key: 'pro'}, 
                    { title: '市', dataIndex: 'city', key: 'city'}, 
                    { title: '区', dataIndex: 'area', key: 'area'},
                    { title: '街道', dataIndex: 'street', key: 'street'},
                    { title: '更多信息', dataIndex: 'more', key: 'more',render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            Modal.info({
                                title: '更多信息',
                                content: (
                                  <div>
                                    <Form.Item {...formItemLayout} label='小区'>
                                        {record.plotName||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='物业公司'>
                                        {record.companyName||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='操作人'>
                                        {record.userName||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='垃圾重量'>
                                        {record.weight||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='收运时间'>
                                        {record.creationTime||'--'}
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
                        state.toolbarParams = {
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
                            userName:'',//操作人姓名
                        }
                        _this.initIndex({
                            toolbarParams:{
                                driverName:{$set:1},//用户名
                                plotName:{$set:10},//手机号码
                                carNumber:{$set:''},//查询字段
                                userId:{$set:''},//性别
                                search:{$set:''},//用户ick号
                                startTime:{$set:''},//省
                                endTime:{$set:''},//市
                                pro:{$set:''},//市
                                city:{$set:''},//市
                                area:{$set:''},//区
                                source:{$set:''},//用户来源
                                pageSize:{$set:''},//每页长度
                                page:{$set:''},//当前页
                                type:{$set:''},//环卫车类型查询
                                companyName:{$set:''},//物业公司
                                userName:{$set:''},//操作人姓名
                            }
                        })
                    }}>重置</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    <Button type="primary" onClick={()=>{
                        window.open(config.CollectorLog.urls.exportCollectorLogExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                </div>
                
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
