import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, DatePicker, Modal, Tree } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax } from '../utils/global';
import { config } from '../utils/config';
import Cities from '../utils/Cities';
// import { createForm } from 'rc-form';

const { RangePicker } = DatePicker;


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
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
            },
            // 省市区查询
            address:{
                di:'',
                sheng:'',
                xian:'',
                shen:[],
                city:{},
                area:{}
            },
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
                    { title: '司机名', dataIndex: 'driverName', key: 'driverName'}, 
                    { title: '小区名', dataIndex: 'plotName', key: 'plotName'}, 
                    { title: '收运车车牌号', dataIndex: 'carNumber', key: 'carNumber'}, 
                    { title: '省', dataIndex: 'pro', key: 'pro'}, 
                    { title: '市', dataIndex: 'city', key: 'city'}, 
                    { title: '区', dataIndex: 'area', key: 'area'},
                    { title: '开始时间', dataIndex: 'startTime', key: 'startTime'},
                    { title: '结束时间', dataIndex: 'endTime', key: 'endTime'},
                    { title: '操作人ID', dataIndex: 'userId', key: 'userId'},
                    { title: '环卫车类型', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['','餐厨垃圾环卫车','其它垃圾环卫车'][text]
                    )},
                    // { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                    //     <span>
                    //         <a href="javascript:;" onClick={()=>{
                    //            Modal.confirm({
                    //                 title:'提示',
                    //                 content:'你确定要删除该角色吗？',
                    //                 okText:'确定',
                    //                 cancelText:'取消',
                    //                 onOk(){
                    //                     Ajax.post({
                    //                         url:config.RoleAdmin.urls.delete,
                    //                         params:{
                    //                             carId:record.id
                    //                         },
                    //                         success:(data)=>{
                    //                             _this.initIndex();
                    //                         }
                    //                     })
                    //                 }
                    //             })
                    //         }}>删除</a>
                    //         <Divider type="vertical" />
                            
                    //     </span>
                    // )},

                ],
                data:[]
            },
        }
    }
    componentDidMount(){
        this.initIndex();
        // console.log(Cities)
        Cities.forEach((el)=>{
            if(el.level==1){
                this.state.address.shen.push(el)
            }
            if(el.level==2){
                this.state.address.city[el.sheng] = this.state.address.city[el.sheng]||[];
                this.state.address.city[el.sheng].push(el)
            }
            if(el.level==3){
                this.state.address.area[el.sheng+el.di] = this.state.address.area[el.sheng+el.di]||[];
                this.state.address.area[el.sheng+el.di].push(el)
            }
        })
        this.update('set',addons(this.state,{}));
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
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
                ...params
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
                                driverName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.driverName} 
                    addonBefore={<span>司机名</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                plotName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.plotName} 
                    addonBefore={<span>小区名</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                carNumber:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.carNumber} 
                    addonBefore={<span>收运费车牌号</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                userId:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.userId} 
                    addonBefore={<span>操作人ID</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
                    时间段查询：
                    <RangePicker onChange={(date,dateString)=>{
                        state.toolbarParams.startTime = dateString[0];
                        state.toolbarParams.endTime = dateString[1];
                        _this.initIndex();
                    }} />
                </div>
                <div className="main-toolbar">
                    详细地址：
                    <Select placeholder="--省--" value={state.toolbarParams.pro} style={{ width: 120, marginRight:10 }}>
                        {
                            state.address.shen.map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                pro:{
                                                    $set:el.code
                                                },
                                                city:{
                                                    $set:state.address.city[el.sheng][0].code
                                                },
                                                area:{
                                                    $set: state.address.city[el.sheng] && 
                                                          state.address.city[el.sheng][0] && 
                                                          state.address.area[el.sheng+state.address.city[el.sheng][0].di] && 
                                                          state.address.area[el.sheng+state.address.city[el.sheng][0].di][0].code
                                                }
                                            },
                                            address:{
                                                sheng:{
                                                    $set:el.sheng
                                                },
                                                di:{
                                                    $set:'01'
                                                },
                                                xian:{
                                                    $set:'00'
                                                }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>

                    <Select placeholder="--市--" value={state.toolbarParams.city} style={{ width: 120, marginRight:10 }}>
                        {
                            state.address.city[state.address.sheng] && state.address.city[state.address.sheng].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                city:{
                                                    $set:el.code
                                                },
                                                area:{
                                                    $set:state.address.area[state.address.sheng+el.di][0].code
                                                }
                                            },
                                            address:{
                                                di:{
                                                    $set:el.di
                                                },
                                                xian:{
                                                    $set:'00'
                                                }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>
                    <Select placeholder="--区--" value={state.toolbarParams.area} style={{ width: 120, marginRight:10 }}>
                        {
                            state.address.area[state.address.sheng+state.address.di] && 
                            state.address.area[state.address.sheng+state.address.di].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                     <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                area:{
                                                    $set:el.code
                                                }
                                            },
                                            address:{
                                                di:{
                                                    $set:el.di
                                                }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                </div>
                {/*<div className="main-toolbar">
                    环卫车类型：
                    <Select value={state.toolbarParams.source} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                source:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="1">H5</Select.Option>
                        <Select.Option value="2">安卓</Select.Option>
                        <Select.Option value="3">IOS</Select.Option>
                        <Select.Option value="4">ICK注册</Select.Option>
                    </Select>

                </div>*/}
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
               
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
