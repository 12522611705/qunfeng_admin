import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, message, Upload,
        Tag, DatePicker, LocaleProvider, Modal, Form } from 'antd';

import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseSearch, formatSearch } from '../utils/global';
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
            permission:{
                garbageOrderList:false,
                depositList:false,
                userAdminList:false,
                userAdminDetails:false,
                userGradeLogList:false,
                userGradeLogDetails:false,
                walletAdminList:false,
                updateIntegral:false,
                importExcelUser:false,
                userExcel:false,
                walletAdminDetails:false,
                userAdminExportUserExcel:false,
                addUserAdmin:false,
                updataUserAdmin:false,
                deleteUserAdmin:false
            },
            Modal:{
                visContribution:false,
                visContributionDetail:false,
                visIntegral:false,
                visUser:false,
                visDeposit:false
            },
            form:{

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
                street:'',//街道
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
            // 提现参数
            depositParams:{
                createTimeStart:'',
                createTimeEnd:'',
                id:'',
                uid:''
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
            // 提现详情
            depositTable:{
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.depositTable.pagination.current = page;
                        _this.initDeposit();
                    }
                },
                head:[
                    { title: '提现名字', dataIndex: 'name', key: 'name'}, 
                    { title: '手机号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '提现金额', dataIndex: 'money', key: 'money'}, 
                    { title: '提现时间', dataIndex: 'careateTime', key: 'careateTime' }, 
                    { title: '备注', dataIndex: 'remark', key: 'remark' }
                ],
                data:[]
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
                    { title: '用户名', dataIndex: 'name', key: 'name'}, 
                    { title: '电话号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '用户类别', dataIndex: 'type', key: 'type', render:(text)=>(
                        ['','保洁员','物业公司','街道','城管局','公司员工'][text]
                    )}, 
                    { title: '所属物业公司', dataIndex: 'companyName', key: 'companyName' }, 
                    { title: '卡号', dataIndex: 'ickNo', key: 'ickNo' }, 
                    { title: '投放总重量Kg', dataIndex: 'throwIn', key: 'throwIn' }, 
                    { title: '绿色贡献值', dataIndex: 'contribution', key: 'contribution' }, 
                    // { title: '绿色贡献值', dataIndex: 'contribution', key: 'contribution' , render:(text,record)=>(
                    //    <div>
                    //     <p style={{textAlign:'center'}}>{text||0}</p>
                    //     {
                    //         _this.state.permission.userGradeLogList?
                    //         <p style={{textAlign:'center'}}><a style={{color:'#1155cc'}} onClick={()=>{
                    //             _this.state.contributionParams.userId = record.id;
                    //             _this.initContribution({
                    //                 Modal:{
                    //                     visContribution:{$set:true}
                    //                 }
                    //             })
                    //         }} href="javascript:;">点击查看</a></p>:''
                    //     }
                    //    </div>
                    // ) }, 
                    { title: '环保金余额', dataIndex: 'integral', key: 'integral' , render:(text,record)=>(
                       <div>
                        <p style={{textAlign:'center'}}>{text||0}</p>
                        {
                            _this.state.permission.walletAdminList?
                            <p style={{textAlign:'center',marginBottom:0}}><a style={{color:'#1155cc'}} onClick={()=>{
                                _this.state.integralParams.userId = record.id;
                                _this.initIntegral({
                                    Modal:{
                                        visIntegral:{$set:true}
                                    }
                                })
                            }} href="javascript:;">点击查看</a></p>:''
                        }
                        {
                            _this.state.permission.updateIntegral?
                            <p style={{textAlign:'center',marginBottom:0}}><a style={{color:'#1155cc'}} onClick={()=>{
                                _this.state.Modal.visIntegralValue = true;
                                _this.state.record = record;
                                _this.setState({});
                            }} href="javascript:;">修改金额</a></p>:''
                        }
                       </div>
                    ) }, 
                    { title: '提现', dataIndex: 'drawings', key: 'drawings' , render:(text,record)=>(
                       <div>
                        <p style={{textAlign:'center'}}>{text||0}</p>
                        {
                            _this.state.permission.depositList?
                            <p style={{textAlign:'center'}}><a style={{color:'#1155cc'}} onClick={()=>{
                                _this.state.depositParams.uid = record.id;
                                _this.initDeposit({
                                    Modal:{
                                        visDeposit:{$set:true}
                                    }
                                })
                            }} href="javascript:;">点击查看</a></p>:''
                        }
                       </div>
                    ) }, 
                    { title: '更多信息', dataIndex: 'more', key: 'more', render:(text,record)=>(
                        _this.state.permission.userAdminDetails ?
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
                                            <Form.Item {...formItemLayout} label='社区'>
                                                {data.community||'--'}
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
                                                {['','男','女'][data.sex]||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='年龄'>
                                                {data.age||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='用户来源'>
                                                {['','微信','安卓','IOS','IC卡'][data.source]||'--'}
                                            </Form.Item>
                                            <Form.Item {...formItemLayout} label='注册时间'>
                                                {data.createTime||'--'}
                                            </Form.Item>
                                          </div>
                                        ),
                                    });
                                }
                            })
                            
                       }} href="javascript:;">点击查看</a>:'--'
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
                    { title: '设备编号', dataIndex: 'number', key: 'number'}, 
                    { title: '回收类别', dataIndex: 'typeName', key: 'typeName' }, 
                    { title: '重量（kg）', dataIndex: 'weight', key: 'weight' },
                    { title: '环保金', dataIndex: 'integral', key: 'integral' },
                    { title: '绿色贡献值', dataIndex: 'green', key: 'green' }
                ],
                data:[]
            },
            type:'add'
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
                fatherMenuId:search.id||''
            },
            success:(data)=>{
                data.forEach((el)=>{
                    _this.state.permission[config.UserAdmin.permission[el.url]] = true;
                })
                _this.setState({});
            }
        })
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
     *  查看提现详情
     */
    initDeposit(updateParams){
        const _this = this;
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.UserAdmin.urls.depositList,
                params:{
                    userId:_this.state.depositParams.uid,
                    pageSize:_this.state.depositTable.pagination.pageSize,
                    page:_this.state.depositTable.pagination.current
                },
                success:(data)=>{
                    _this.update('set',addons(_this.state,{
                        depositTable:{
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
                                    $set:_this.state.depositTable.pagination.current
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
                url:config.UserAdmin.urls.garbageOrderList,
                params:{
                    startTime:new Date(params.createTimeStart).getTime()||'',
                    endTime :new Date(params.createTimeEnd).getTime()||'',
                    userId:params.userId||'',
                    pageSize:_this.state.integralTable.pagination.pageSize || 10,
                    page:_this.state.integralTable.pagination.current || 1
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
                street:params.street||'',//街道
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
    updateForm(value,key){
        this.state.form[key] = value;
        this.setState({})
    }
    user(){
        const _this = this;
        let url = '';
        let postData = {};
        if(_this.state.type=='add'){
            url = config.UserAdmin.urls.addUserAdmin;
            postData={
                ..._this.state.form,
            }
        }else if(_this.state.type=='update'){
            url = config.UserAdmin.urls.updataUserAdmin;
            postData={
                ..._this.state.form,
                id:_this.state.indexTable.selectedRowKeys[0]
            }
        }
        if(!/^1\d{10}$/.test(_this.state.form.tel)) return message.info('请输入正确的手机号码');
        if(!_this.state.form.password) return message.info('请输入密码');
        if(!/^\d{17}$/.test(_this.state.form.ickNo)) return message.info('请输入正确的ick号码');
        Ajax.post({
            url,
            params:postData,
            success:(data)=>{
                _this.initIndex({
                    Modal:{
                        visUser:{$set:false}
                    }
                })
            }
        })
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
                    <Cascader data={state.toolbarParams} onChange={(data)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                pro:{$set:data.pro},
                                city:{$set:data.city},
                                area:{$set:data.area},
                                street:{$set:data.street},
                                comm:{$set:data.comm}
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
                            street:'',//街道
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
                                street:{$set:''},//街道
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
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    {
                        state.permission.addUserAdmin ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            _this.state.Modal.visUser = true;
                            _this.state.type = 'add';
                            _this.state.form = {
                                ickNo:'',
                                tel:'',
                                password:'',
                                source:'',
                                pro:'',
                                city:'',
                                area:'',
                                street:'',
                                plot:'',
                                companyName:'',
                                type:'',
                                room:'',
                                sex:'',
                                age:'',
                                ridgepole:'',
                                community:''
                            }
                            _this.setState({});
                        }}>增加</Button>:''    
                    }
                    {
                        state.permission.updataUserAdmin?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            _this.state.Modal.visUser = true;
                            _this.state.type = 'update';
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.state.form = {
                                ickNo:record.ickNo,
                                tel:record.tel,
                                password:record.password,
                                source:record.source,
                                pro:record.pro,
                                city:record.city,
                                area:record.area,
                                street:record.street,
                                plot:record.plot,
                                companyName:record.companyName,
                                type:record.type,
                                room:record.room,
                                sex:record.sex,
                                age:record.age,
                                ridgepole:record.ridgepole,
                                community:record.community
                            }
                            _this.setState({});
                        }}>修改</Button>:''    
                    }
                    
                    {
                        state.permission.deleteUserAdmin?
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
                                        url:config.UserAdmin.urls.deleteUserAdmin,
                                        params:{
                                            ids:_this.state.indexTable.selectedRowKeys
                                        },
                                        success:(data)=>{
                                            _this.initIndex({})
                                        }
                                    }) 
                                }
                            })
                        }}>删除</Button>:''
                    }
                    {
                        state.permission.userExcel ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            window.open(config.UserAdmin.urls.userExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                        }}>数据导出</Button>:''
                    }
                    {
                        state.permission.importExcelUser ?
                        <Upload name="file" 
                            style={{display:'inline'}}
                            className="myupdate"
                            headers={{
                                token:localStorage.getItem('token')
                            }}
                            action="http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/importExcelUser" 
                            onChange={(info)=>{
                                if(info.file.response && info.file.response.code) {
                                    message.info(info.file.response.msg);
                                }
                                _this.initIndex();
                            }}>
                            <Button style={{marginRight:10}} type="primary">数据导入</Button>
                        </Upload>:''
                    }
                    
                </div>
                <Table 
                    rowKey={record=>record.id} 
                    rowSelection={{
                        selectedRowKeys:state.indexTable.selectedRowKeys,
                        onChange:(selectedRowKeys)=>{
                            state.indexTable.selectedRowKeys = selectedRowKeys;
                            _this.setState({});
                        }
                    }}
                    pagination={state.indexTable.pagination}
                    columns={state.indexTable.head} 
                    dataSource={state.indexTable.data} />
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
                  width={800}
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
                <Modal title="提现详情"
                  width={800}
                  visible={state.Modal.visDeposit}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visDeposit:{$set:false}}
                    }))
                  }}
                >
                    <div style={{marginBottom:10}}>
                        <LocaleProvider locale={zh_CN}>
                            <RangePicker value={state.depositParams.createTimeStart ? [moment(state.depositParams.createTimeStart, 'YYYY/MM/DD'),moment(state.depositParams.createTimeEnd, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                                // state.toolbarParams.createTimeStart = dateString[0];
                                // state.toolbarParams.createTimeEnd = dateString[1];
                                update('set',addons(state,{
                                    depositParams:{
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
                            _this.initDeposit();
                        }} type="primary">查询</Button>
                    </div>
                    <Table rowKey={record=>record.id} pagination={state.depositTable.pagination}
                    columns={state.depositTable.head} dataSource={state.depositTable.data} />
                </Modal>
                
                <Modal title="修改金额"
                  width = '680px'
                  visible={state.Modal.visIntegralValue}
                  onOk={()=>{
                    Ajax.post({
                        url:config.UserAdmin.urls.updateIntegral,
                        params:{
                            userId:state.record.id,
                            remark:state.integralRemark,
                            price:state.integralValue,
                        },
                        success:(data)=>{
                            _this.initIndex({
                                Modal:{
                                    visIntegralValue:{$set:false}
                                }
                            })
                        }
                    })
                  }}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visIntegralValue:{$set:false}}
                    }))
                  }}>
                    <Form.Item {...formItemLayout} label='金额'>
                        <Input onChange={(e)=>{
                            _this.state.integralValue = e.target.value;
                            _this.setState({});
                        }} type="text" value={state.integralValue}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.state.integralRemark = e.target.value;
                            _this.setState({});
                        }} type="text" value={state.integralRemark}/>
                    </Form.Item>
                </Modal>
                <Modal title="用户信息"
                  width = '680px'
                  visible={state.Modal.visUser}
                  onOk={_this.user.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visUser:{$set:false}}
                    }))
                  }}
                >
                    <Form.Item {...formItemLayout} label='用户名'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'name')
                        }} type="text" value={state.form.name}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='卡号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'ickNo')
                        }} type="text" value={state.form.ickNo}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='电话号码'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'tel')
                        }} type="text" value={state.form.tel}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='用户密码'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'password')
                        }} type="text" value={state.form.password}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='用户来源'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'source')
                        }} style={{width:200}} value={String(state.form.source)}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">H5</Select.Option>
                            <Select.Option value="2">安卓</Select.Option>
                            <Select.Option value="3">IOS</Select.Option>
                            <Select.Option value="4">ICK</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='年龄'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'source')
                        }} style={{width:200}} value={String(state.form.source)}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">20岁以下</Select.Option>
                            <Select.Option value="2">20-30</Select.Option>
                            <Select.Option value="3">30-40</Select.Option>
                            <Select.Option value="4">40-50</Select.Option>
                            <Select.Option value="5">50岁以上</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='性别'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'sex')
                        }} style={{width:200}} value={String(state.form.sex)}>
                            <Select.Option value="1">男</Select.Option>
                            <Select.Option value="2">女</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='所属物业公司'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'companyName')
                        }} type="text" value={state.form.companyName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='用户类型'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'type')
                        }} style={{width:200}} value={state.form.type}>
                            <Select.Option value="0">居民</Select.Option>
                            <Select.Option value="1">保洁员</Select.Option>
                            <Select.Option value="2">物业公司工作人员</Select.Option>
                            <Select.Option value="3">街道人员</Select.Option>
                            <Select.Option value="4">城管局</Select.Option>
                            <Select.Option value="5">司机</Select.Option>
                            <Select.Option value="6">公司员工</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='地区选择'>
                        <Cascader data={state.form} onChange={(data)=>{
                            update('set',addons(state,{
                                form:{
                                    pro:{$set:data.pro},
                                    city:{$set:data.city},
                                    area:{$set:data.area},
                                    street:{$set:data.street}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='小区名字'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'plot')
                        }} type="text" value={state.form.plot}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='社区'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'community')
                        }} type="text" value={state.form.community}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='单元：房号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'room')
                        }} type="text" value={state.form.room}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='单元：栋'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'ridgepole')
                        }} type="text" value={state.form.ridgepole}/>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
