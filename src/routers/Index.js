import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, DatePicker, LocaleProvider, Modal, Form } from 'antd';
import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
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
                visContribution:false,
                visContributionDetail:false,
                visIntegral:false
            },
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
                ickNo:'',//ick卡号查询
                address:'',//输入框详细地址
                companyName:'',//公司名字
                ridgepole:'',//栋
                room:'',//房
                plot:'',//小区名字
                age:''//年龄段
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
            // 绿色贡献值参数
            contributionParams:{
                createTimeStart:'',
                createTimeEnd:'',
                id:'',
                userId:''
            },
            contributionParamsDetail:{
                orderId:''
            },
            // 环保金参数
            integralParams:{
                createTimeStart:'',
                createTimeEnd:'',
                id:'',
                userId:''
            },
            integralParamsDetail:{
                orderId:'',
                type:''
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
                    { title: '用户名', dataIndex: 'name', key: 'name'}, 
                    { title: '电话号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '用户类别', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['','保洁员','物业公司','街道','城管局','公司员工'][text]
                    )}, 
                    { title: '所属物业公司', dataIndex: 'companyName', key: 'companyName' }, 
                    { title: 'IC卡号码', dataIndex: 'ickNo', key: 'ickNo' }, 
                    { title: '绿色贡献值', dataIndex: 'contribution', key: 'contribution' , render:(text,record)=>(
                       <div>
                        <p style={{textAlign:'center'}}>{text||0}</p>
                        <p style={{textAlign:'center'}}><a style={{color:'#1155cc'}} onClick={()=>{
                            _this.state.contributionParams.userId = record.id;
                            _this.initContribution({
                                Modal:{
                                    visContribution:{$set:true}
                                }
                            })
                        }} href="javascript:;">点击查看</a></p>
                       </div>
                    ) }, 
                    { title: '环保金余额', dataIndex: 'integral', key: 'integral' , render:(text,record)=>(
                       <div>
                        <p style={{textAlign:'center'}}>{text||0}</p>
                        <p style={{textAlign:'center'}}><a style={{color:'#1155cc'}} onClick={()=>{
                            _this.state.integralParams.userId = record.id;
                            _this.initIntegral({
                                Modal:{
                                    visIntegral:{$set:true}
                                }
                            })
                        }} href="javascript:;">点击查看</a></p>
                       </div>
                    ) }, 
                    { title: '更多信息', dataIndex: 'more', key: 'more', render:(text,record)=>(
                       <a style={{color:'#1155cc'}} onClick={()=>{
                            Ajax.get({
                                url:config.UserAdmin.urls.details,
                                params:{
                                    userId:record.id
                                },
                                success:(data)=>{
                                    Modal.info({
                                        title: '更多信息',
                                        content: (
                                          <div>
                                            <Form.Item {...formItemLayout} label='省'>
                                                {data.pro||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='市'>
                                                {data.city||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='区'>
                                                {data.area||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='街道'>
                                                {data.street||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='详细地址'>
                                                {data.address||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='小区名字'>
                                                {data.plot||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='单元房号'>
                                                {data.room||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='性别'>
                                                {data.sex||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='年龄'>
                                                {data.age||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='用户来源'>
                                                {data.source||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='注册时间'>
                                                {data.createTime||'--'}
                                            </Form.Item>
                                          </div>
                                        ),
                                    });
                                }
                            })
                            
                       }} href="javascript:;">点击查看</a>
                    ) }, 
                ],
                data:[]
            },
            // 绿色贡献值表格
            contributionTable:{
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.contributionTable.pagination.current = page;
                        _this.initContribution();
                    }
                },
                head:[
                    { title: '时间', dataIndex: 'createTime', key: 'createTime'}, 
                    { title: '地点', dataIndex: 'address', key: 'address'}, 
                    { title: '变动情况', dataIndex: 'integral', key: 'integral'}, 
                    { title: '累计', dataIndex: 'laterIntegral', key: 'laterIntegral' }, 
                    { title: '备注', dataIndex: 'remark', key: 'remark' }, 
                    { title: '详情', dataIndex: 'more', key: 'more' , render:(text,record)=>(
                       <a style={{color:'#1155cc'}} onClick={()=>{
                            _this.state.contributionParamsDetail.orderId = record.orderId;
                            _this.initContributionDetail({
                                Modal:{
                                    visContributionDetail:{$set:true}    
                                }
                            });
                       }} href="javascript:;">点击查看</a>
                    ) }, 
                ],
                data:[]
            },
            // 绿色贡献值详情表格
            contributionTableDetail:{
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.contributionTableDetail.pagination.current = page;
                        _this.initContributionDetail();
                    }
                },
                head:[
                    { title: '种类', dataIndex: 'name', key: 'name'}, 
                    { title: '重量（kg）', dataIndex: 'weight', key: 'weight'}, 
                    { title: '变动情况', dataIndex: 'integral', key: 'integral'}
                ],
                data:[]
            },
            // 环保金额表格
            integralTable:{
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.integralTable.pagination.current = page;
                        _this.initIntegral();
                    }
                },
                head:[
                    { title: '时间', dataIndex: 'createTime', key: 'createTime'}, 
                    { title: '客户端', dataIndex: 'source', key: 'source',record:(text)=>(
                        ['','微信','安卓','ios','IC卡'][text]
                    )}, 
                    { title: '变动情况', dataIndex: 'integral', key: 'integral'}, 
                    { title: '余额', dataIndex: 'laterIntegral', key: 'laterIntegral' }, 
                    { title: '备注', dataIndex: 'remark', key: 'remark' }, 
                    { title: '详情', dataIndex: 'more', key: 'more' , render:(text,record)=>(
                        <a style={{color:'#1155cc'}} onClick={()=>{
                            _this.state.integralParamsDetail.orderId = record.orderId;
                            _this.state.integralParamsDetail.type = record.type;
                            _this.initIntegralDetail({
                                Modal:{
                                    visIntegralDetail:{$set:true}    
                                }
                            });
                        }} href="javascript:;">点击查看</a>
                    ) }, 
                ],
                data:[]
            },
            // 环保金详情表格
            integralTableDetail:{
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.integralTableDetail.pagination.current = page;
                        _this.initIntegralDetail();
                    }
                },
                head:[
                    { title: '种类', dataIndex: 'name', key: 'name'}, 
                    { title: '重量（kg）', dataIndex: 'weight', key: 'weight'}, 
                    { title: '变动情况', dataIndex: 'integral', key: 'integral'}
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
     *  初始化绿色贡献值表格
     */
    initContribution(updateParams){
        const _this = this;
        const params = _this.state.contributionParams;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.UserGradeLog.urls.list,
                params:{
                    createTimeStart:new Date(params.createTimeStart).getTime()||'',
                    createTimeEnd:new Date(params.createTimeEnd).getTime()||'',
                    id:params.id,
                    userId:params.userId,
                    pageSize:_this.state.contributionTable.pagination.pageSize,
                    page:_this.state.contributionTable.pagination.current
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        contributionTable:{
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
                                    $set:_this.state.contributionTable.pagination.current
                                }
                            }
                        },
                        ...updateParams
                    }))
                    resolve(data)
                }
            })
        })
    }
    /*
     *  初始化绿色贡献值表格详情
     */
    initContributionDetail(updateParams){
        const _this = this;
        const params = _this.state.contributionParams;
        const paramsDetail = _this.state.contributionParamsDetail;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.UserGradeLog.urls.details,
                params:{
                    orderId:paramsDetail.orderId,
                    userId:params.userId,
                    pageSize:_this.state.contributionTableDetail.pagination.pageSize,
                    page:_this.state.contributionTableDetail.pagination.current
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        contributionTableDetail:{
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
                                    $set:_this.state.contributionTableDetail.pagination.current
                                }
                            }
                        },
                        ...updateParams
                    }))
                    resolve(data)
                }
            })
        })
    }
    /*
     *  初始化环保金额表格
     */
    initIntegral(updateParams){
        
        const _this = this;
        const params = _this.state.integralParams;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.WalletAdmin.urls.list,
                params:{
                    createTimeStart:new Date(params.createTimeStart).getTime()||'',
                    createTimeEnd:new Date(params.createTimeEnd).getTime()||'',
                    id:params.id||'',
                    userId:params.userId||'',
                    pageSize:_this.state.integralTable.pagination.pageSize,
                    page:_this.state.integralTable.pagination.current
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        integralTable:{
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
                                    $set:_this.state.integralTable.pagination.current
                                }
                            }
                        },
                        ...updateParams
                    }))
                    resolve(data)
                }
            })
        })
    }
    /*
     *  初始化环保金详情表格
     */
    initIntegralDetail(updateParams){
        const _this = this;
        const params = _this.state.integralParams;
        const paramsDetail = _this.state.integralParamsDetail;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.WalletAdmin.urls.details,
                params:{
                    orderId:paramsDetail.orderId,
                    type:paramsDetail.type,
                    // userId:params.userId,
                    pageSize:_this.state.integralTableDetail.pagination.pageSize,
                    page:_this.state.integralTableDetail.pagination.current
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        integralTableDetail:{
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
                                    $set:_this.state.integralTableDetail.pagination.current
                                }
                            }
                        },
                        ...updateParams
                    }))
                    resolve(data)
                }
            })
        })
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
                ickNo:params.ickNo,//ick卡号查询
                address:params.address,//输入框详细地址
                companyName:params.companyName,//公司名字
                ridgepole:params.ridgepole,//栋
                room:params.room,//房
                plot:params.plot,//小区名字
                age:params.age//年龄段
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
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
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
                                                city:{
                                                    $set:''//state.address.city[el.sheng][0].name
                                                },
                                                area:{
                                                    $set:''// state.address.city[el.sheng] && 
                                                          // state.address.city[el.sheng][0] && 
                                                          // state.address.area[el.sheng+state.address.city[el.sheng][0].di] && 
                                                          // state.address.area[el.sheng+state.address.city[el.sheng][0].di][0].name
                                                }
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
                                                area:{
                                                    $set:''//state.address.area[state.address.sheng+el.di][0].name
                                                }
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
                    详细地址：<Input style={{width:200}} type="text" 
                        placeholder="请输入详细地址"
                        value={state.toolbarParams.address} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                address:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }}/>
                </div>
                <div className="main-toolbar">
                    小区名字：<Input style={{width:200}} type="text" 
                        placeholder="请输入小区名字"
                        value={state.toolbarParams.plot} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                plot:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }}/>
                    <span style={{marginLeft:10}}>单元房号：</span><Input style={{width:40}} type="text" 
                        value={state.toolbarParams.ridgepole} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                ridgepole:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }}/>栋
                    <Input style={{width:40}} type="text" 
                        value={state.toolbarParams.room} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                room:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }}/>房
                    <span style={{marginLeft:10}}>所属物业公司：</span><Input style={{width:200}} type="text" 
                        placeholder="请输入物业公司的名字"
                        value={state.toolbarParams.companyName} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                companyName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }}/>
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
                        <Select.Option value="1">微信</Select.Option>
                        <Select.Option value="2">安卓</Select.Option>
                        <Select.Option value="3">IOS</Select.Option>
                        <Select.Option value="4">IC卡</Select.Option>
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
                        <Select.Option value="1">居民</Select.Option>
                        <Select.Option value="2">保洁员</Select.Option>
                        <Select.Option value="3">物业公司</Select.Option>
                        <Select.Option value="4">街道</Select.Option>
                        <Select.Option value="5">城管局</Select.Option>
                        <Select.Option value="6">公司员工</Select.Option>
                    </Select>

                </div>
                <div className="main-toolbar">
                    用户年龄段：
                    <Select value={state.toolbarParams.age} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                age:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">20岁以下</Select.Option>
                        <Select.Option value="2">20-30</Select.Option>
                        <Select.Option value="3">30-40</Select.Option>
                        <Select.Option value="4">40-50</Select.Option>
                        <Select.Option value="5">50岁以上</Select.Option>
                    </Select>

                    注册时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.createTimeStart ? [moment(state.toolbarParams.createTimeStart, 'YYYY/MM/DD'),moment(state.toolbarParams.createTimeEnd, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                            // state.toolbarParams.createTimeStart = dateString[0];
                            // state.toolbarParams.createTimeEnd = dateString[1];
                            update('set',addons(state,{
                                toolbarParams:{
                                    createTimeStart:{
                                        $set:dateString[0]
                                    },
                                    createTimeEnd:{
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
                            ickNo:'',//ick卡号查询
                            address:'',//输入框详细地址
                            companyName:'',//公司名字
                            ridgepole:'',//栋
                            room:'',//房
                            plot:'',//小区名字
                            age:''//年龄段
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
                                ickNo:{$set:''},//ick卡号查询
                                address:{$set:''},//输入框详细地址
                                companyName:{$set:''},//公司名字
                                ridgepole:{$set:''},//栋
                                room:{$set:''},//房
                                plot:{$set:''},//小区名字
                                age:{$set:''}//年龄段
                            }
                        })
                    }}>重置</Button>
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                </div>
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination}
                    columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
                <Modal title="绿色贡献值"
                  width = '680px'
                  visible={state.Modal.visContribution}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visContribution:{$set:false}}
                    }))
                  }}
                >
                    <div style={{marginBottom:10}}>
                        <LocaleProvider locale={zh_CN}>
                            <RangePicker value={state.contributionParams.createTimeStart ? [moment(state.contributionParams.createTimeStart, 'YYYY/MM/DD'),moment(state.contributionParams.createTimeEnd, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                                // state.toolbarParams.createTimeStart = dateString[0];
                                // state.toolbarParams.createTimeEnd = dateString[1];
                                update('set',addons(state,{
                                    contributionParams:{
                                        createTimeStart:{
                                            $set:dateString[0]
                                        },
                                        createTimeEnd:{
                                            $set:dateString[1]
                                        }    
                                    }
                                }))
                                // _this.initIndex();
                            }} />
                        </LocaleProvider>
                        <Button style={{marginLeft:10}} onClick={()=>{
                            _this.initContribution();
                        }} type="primary">查询</Button>
                    </div>
                    <Table rowKey={record=>record.id} pagination={state.contributionTable.pagination}
                    columns={state.contributionTable.head} dataSource={state.contributionTable.data} />
                </Modal>
                <Modal title="绿色贡献值详情"
                  width = '680px'
                  visible={state.Modal.visContributionDetail}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visContributionDetail:{$set:false}}
                    }))
                  }}
                >
                  <Table rowKey={record=>record.name} pagination={state.contributionTableDetail.pagination}
                    columns={state.contributionTableDetail.head} dataSource={state.contributionTableDetail.data} />
                </Modal>
                <Modal title="环保金额"
                  visible={state.Modal.visIntegral}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visIntegral:{$set:false}}
                    }))
                  }}
                >
                    <div style={{marginBottom:10}}>
                        <LocaleProvider locale={zh_CN}>
                            <RangePicker value={state.integralParams.createTimeStart ? [moment(state.integralParams.createTimeStart, 'YYYY/MM/DD'),moment(state.integralParams.createTimeEnd, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                                // state.toolbarParams.createTimeStart = dateString[0];
                                // state.toolbarParams.createTimeEnd = dateString[1];
                                update('set',addons(state,{
                                    integralParams:{
                                        createTimeStart:{
                                            $set:dateString[0]
                                        },
                                        createTimeEnd:{
                                            $set:dateString[1]
                                        }    
                                    }
                                }))
                                // _this.initIndex();
                            }} />
                        </LocaleProvider>
                        <Button style={{marginLeft:10}} onClick={()=>{
                            _this.initIntegral();
                        }} type="primary">查询</Button>
                    </div>
                    <Table rowKey={record=>record.id} pagination={state.integralTable.pagination}
                    columns={state.integralTable.head} dataSource={state.integralTable.data} />
                </Modal>
                <Modal title="环保金详情"
                  width = '680px'
                  visible={state.Modal.visIntegralDetail}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visIntegralDetail:{$set:false}}
                    }))
                  }}
                >
                  <Table rowKey={record=>record.name} pagination={state.integralTableDetail.pagination}
                    columns={state.integralTableDetail.head} dataSource={state.integralTableDetail.data} />
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
