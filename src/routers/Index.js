import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, DatePicker } from 'antd';

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
        this.update = update.bind(this);
        this.state = {
            // 工具条查询参数
            toolbarParams:{
                name:'',//用户名
                tel:'',//手机号码
                search:'',//查询字段
                sex:'',//性别
                ickNo:'',//用户ick号
                type:'',//用户类型
                createTimeStart:'',//开始时间
                createTimeEnd:'',//结束时间
                pro:'',//省
                city:'',//市
                area:'',//区
                cardId:'',//身份证号码
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
                    { title: '用户类别', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['','保洁员','物业公司','街道','城管局','公司员工'][text]
                    )}, 
                    { title: '用户名', dataIndex: 'name', key: 'name'}, 
                    { title: '注册时间', dataIndex: 'createTime', key: 'createTime'}, 
                    { title: '电话号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '省', dataIndex: 'pro', key: 'pro'}, 
                    { title: '市', dataIndex: 'city', key: 'city'}, 
                    { title: '区', dataIndex: 'area', key: 'area'}, 
                    { title: '详细地址', dataIndex: 'addres', key: 'addres'}, 
                    { title: '用户来源', dataIndex: 'source', key: 'source', render:(text)=>(
                        ['','H5','安卓','IOS','ICK号注册'][text]
                    )}, 
                    { title: 'ick卡号', dataIndex: 'ickNo', key: 'ickNo'}, 
                    { title: '性别', dataIndex: 'sex', key: 'sex', render:(text)=>(
                        ['保密','男','女'][text]
                    )}, 
                    { title: '当前账户积分余额', dataIndex: 'integral', key: 'integral',}, 
                    { title: '环保金余额', dataIndex: 'envirGold', key: 'envirGold',}, 
                    { title: '年龄', dataIndex: 'age', key: 'age',}, 
                    { title: '用户意见反馈', dataIndex: 'opinions', key: 'opinions',}
                ],
                data:[]
            }
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
    initIndex(updateParams){
        const _this = this;
        const params = _this.state.toolbarParams;
        Ajax.get({
            url:config.UserAdmin.urls.list,
            params:{
                name:params.name||'',//用户名
                tel:params.tel||'',//手机号码
                search:params.search||'',//查询字段
                sex:params.sex||'',//性别
                ickNo:params.ickNo||'',//用户ick号
                type:params.type||'',//用户类型
                createTimeStart:new Date(params.createTimeStart).getTime()||'',//开始时间
                createTimeEnd:new Date(params.createTimeEnd).getTime()||'',//结束时间
                pro:params.pro||'',//省
                city:params.city||'',//市
                area:params.area||'',//区
                cardId:params.cardId||'',//身份证号码
                source:params.source||'',//用户来源
                pageSize:_this.state.indexTable.pagination.pageSize||10,//每页长度
                page:_this.state.indexTable.pagination.current||1,//当前页
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
                    <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">用户列表</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                name:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.name} 
                    addonBefore={<span>用户名</span>} 
                    placeholder="请输入用户名"
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
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
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
                    时间段查询：
                    <RangePicker onChange={(date,dateString)=>{
                        state.toolbarParams.createTimeStart = dateString[0];
                        state.toolbarParams.createTimeEnd = dateString[1];
                        _this.initIndex();
                    }} />
                </div>
                <div className="main-toolbar">
                    详细地址：
                    <Select value={state.toolbarParams.pro} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>                        
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
                        <Select.Option value="">全部</Select.Option>
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
                        <Select.Option value="">全部</Select.Option>
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
                    用户来源：
                    <Select value={state.toolbarParams.source} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                source:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">H5</Select.Option>
                        <Select.Option value="2">安卓</Select.Option>
                        <Select.Option value="3">IOS</Select.Option>
                        <Select.Option value="4">ICK注册</Select.Option>
                    </Select>

                    用户类别：
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
                        <Select.Option value="1">保洁员</Select.Option>
                        <Select.Option value="2">物业公司</Select.Option>
                        <Select.Option value="3">街道</Select.Option>
                        <Select.Option value="4">城管局</Select.Option>
                        <Select.Option value="5">公司员工</Select.Option>
                    </Select>

                    性别：
                    <Select value={state.toolbarParams.sex} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                sex:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="0">保密</Select.Option>
                        <Select.Option value="1">男</Select.Option>
                        <Select.Option value="2">女</Select.Option>
                    </Select>
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                </div>
                <div className="main-toolbar">
                    <Button type="primary" onClick={()=>{
                        state.toolbarParams = {
                            name:'',//用户名
                            tel:'',//手机号码
                            search:'',//查询字段
                            sex:'',//性别
                            ickNo:'',//用户ick号
                            type:'',//用户类型
                            createTimeStart:'',//开始时间
                            createTimeEnd:'',//结束时间
                            pro:'',//省
                            city:'',//市
                            area:'',//区
                            cardId:'',//身份证号码
                            source:'',//用户来源
                            pageSize:10,//每页长度
                            page:1,//当前页
                        }
                        _this.initIndex({
                            toolbarParams:{
                                name:{$set:''},//用户名
                                tel:{$set:''},//手机号码
                                search:{$set:''},//查询字段
                                sex:{$set:''},//性别
                                ickNo:{$set:''},//用户ick号
                                type:{$set:''},//用户类型
                                createTimeStart:{$set:''},//开始时间
                                createTimeEnd:{$set:''},//结束时间
                                pro:{$set:''},//省
                                city:{$set:''},//市
                                area:{$set:''},//区
                                cardId:{$set:''},//身份证号码
                                source:{$set:''},//用户来源
                                pageSize:{$set:10},//每页长度
                                page:{$set:1},//当前页
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
