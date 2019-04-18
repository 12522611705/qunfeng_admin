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
                type:'',//环卫车类型查询
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
                    { title: '当时收运垃圾高度', dataIndex: 'altitude', key: 'altitude'}, 
                    { title: '收运车车牌号', dataIndex: 'carNumber', key: 'carNumber'}, 
                    { title: '省', dataIndex: 'pro', key: 'pro'}, 
                    { title: '市', dataIndex: 'city', key: 'city'}, 
                    { title: '区', dataIndex: 'area', key: 'area'},
                    { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime'},
                    { title: '司机名字', dataIndex: 'driverName', key: 'driverName'},
                    { title: '收运记录id', dataIndex: 'id', key: 'id'},
                    { title: '经度', dataIndex: 'lon', key: 'lon'},
                    { title: '纬度', dataIndex: 'lat', key: 'lat'},
                    { title: '小区名', dataIndex: 'plotName', key: 'plotName'},
                    { title: '当时温度', dataIndex: 'temperature', key: 'temperature'},
                    { title: '重量', dataIndex: 'weight', key: 'weight'},
                    { title: '操作者用户名字', dataIndex: 'userName', key: 'userName'},
                    { title: '操作人ID', dataIndex: 'userId', key: 'userId'},
                    { title: '环卫车类型', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['全部','餐厨垃圾环卫车','其它垃圾环卫车'][text] || '全部'
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
                    placeholder="请输入司机名"
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
                    placeholder="请输入小区名"
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
                    placeholder="请输入收运费车牌号"
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
                    placeholder="请输入操作人id"
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
                    <Select value={state.toolbarParams.pro} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.shen.map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                pro:{
                                                    $set:el.name
                                                },
                                                // city:{
                                                //     $set:state.address.city[el.sheng][0].name
                                                // },
                                                // area:{
                                                //     $set: state.address.city[el.sheng] && 
                                                //           state.address.city[el.sheng][0] && 
                                                //           state.address.area[el.sheng+state.address.city[el.sheng][0].di] && 
                                                //           state.address.area[el.sheng+state.address.city[el.sheng][0].di][0].name
                                                // }
                                            },
                                            address:{
                                                sheng:{
                                                    $set:el.sheng
                                                },
                                                // di:{
                                                //     $set:'01'
                                                // },
                                                // xian:{
                                                //     $set:'00'
                                                // }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>

                    <Select value={state.toolbarParams.city} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.city[state.address.sheng] && state.address.city[state.address.sheng].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                city:{
                                                    $set:el.name
                                                },
                                                // area:{
                                                //     $set:state.address.area[state.address.sheng+el.di][0].name
                                                // }
                                            },
                                            address:{
                                                di:{
                                                    $set:el.di
                                                },
                                                // xian:{
                                                //     $set:'00'
                                                // }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>
                    <Select value={state.toolbarParams.area} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.area[state.address.sheng+state.address.di] && 
                            state.address.area[state.address.sheng+state.address.di].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                     <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                area:{
                                                    $set:el.name
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
                <div className="main-toolbar">
                    环卫车类型：
                    <Select value={state.toolbarParams.type} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
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
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                </div>
                <div className="main-toolbar">
                    <Button type="primary" onClick={()=>{
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
                            }
                        })
                    }}>重置</Button>
                </div>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
               
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
