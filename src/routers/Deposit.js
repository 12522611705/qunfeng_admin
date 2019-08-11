import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, message,
    DatePicker, LocaleProvider, Modal, Tree } from 'antd';
import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseSearch, formatSearch } from '../utils/global';
import { config } from '../utils/config';
import Cities from '../utils/Cities';
// import { createForm } from 'rc-form';

// 组件
import Cascader from '../components/Cascader';
const { RangePicker } = DatePicker;
const { TextArea } = Input;

class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
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
        this.state = {
            permission:{
                list:false,
                update:false,
                add:false,
                details:false
            },
            Modal:{
               visUpdate:false,
               visThumb:false,
               visCard:false,
               visDetailUpdate:false,
               visDetail:false
            },
            record:{},
            type:'add',
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
                    { title: '订单号', dataIndex: 'orderNo', key: 'orderNo'},
                    { title: '用户名', dataIndex: 'userName', key: 'userName'}, 
                    { title: '用户类别', dataIndex: 'type', key: 'type',render:(text)=>(
                        ['普通用户','保洁员','物业公司工作人员','街道人员','城管局','司机','公司员工'][text]
                    )},  
                    { title: '电话号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '提现金额', dataIndex: 'money', key: 'money'}, 
                    { title: '提现', dataIndex: 'account', key: 'account',render:(text,record)=>(
                        _this.state.permission.details ?
                        <a href="javascript:;" onClick={()=>{
                            _this.state.Modal.visDetail = true;
                            _this.state.record = record;
                            _this.initDetails(record);
                        }}>查看明细</a>:''
                    )}, 

                    { title: '提交时间', dataIndex: 'careateTime', key: 'careateTime'}, 
                    { title: '审核时间', dataIndex: 'toAccountTime', key: 'toAccountTime'}, 
                    { title: '审核人', dataIndex: 'name', key: 'name'}, 
                    { title: '交易状态', dataIndex: 'state', key: 'state',render:(text)=>(
                        ['','提交申请成功','提现成功','提现失败','审核中','取消提现'][text]
                    )}
                ],
                data:[]
            },
            // 表格数据
            detailTable:{
                selectedRowKeys:[],
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        this.state.detailTable.pagination.current = page;
                        this.initDetails();
                    }
                },
                head:[
                    { title: '用户名', dataIndex: 'userName', key: 'userName'}, 
                    { title: '微信', dataIndex: 'weixin', key: 'weixin'}, 
                    { title: '支付宝', dataIndex: 'zhifubao', key: 'zhifubao'}, 
                    { title: '银行卡', dataIndex: 'yinhangka', key: 'yinhangka'}, 
                    { title: '提现时间', dataIndex: 'careateTime', key: 'careateTime'}, 
                    { title: '备注', dataIndex: 'remark', key: 'remark'}, 
                ],
                data:[]
            },
            toolbarParams:{
                
            },
            update:{
                remark:'',
                state:''
            },
            form:{

            },
            approval:{

            },
            thumbUrl:''
        }
    }
    componentDidMount(){
        this.initIndex()
        this.initPermission();
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
    }
    initDetails(record){
        const _this = this;
        _this.state.detailTable.data = [{
            id:record.id,
            userName:record.userName,
            weixin:record.weixin,
            zhifubao:record.zhifubao,
            yinhangka:record.yinhangka,
            careateTime:record.careateTime,
            remark:record.remark
        }]
        console.log(_this.state.detailTable)
        _this.setState({});
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
                    _this.state.permission[config.Deposit.permission[el.url]] = true;
                })
                console.log(_this.state.permission)
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
        Ajax.get({
            url:config.Deposit.urls.list,
            params:{
                page:_this.state.indexTable.pagination.current,
                pageSize:_this.state.indexTable.pagination.pageSize,
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
                    },
                    ...updateParams
                }))
            }
        })
    }
    updateDeposit(){
        const _this = this;
        Ajax.post({
            url:config.Deposit.urls.update,
            params:{
                ..._this.state.form,
                id:_this.state.indexTable.selectedRowKeys[0]
            },
            success:(data)=>{
                _this.initIndex({
                    Modal:{
                        visCard:{$set:false},
                        visDetailUpdate:{$set:false}
                    }
                })
            }
        })
    }
    updateForm(value,key){
        this.state.form[key] = value;
        this.setState({})
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
                    <Breadcrumb.Item><a href="javascript:;">提现记录</a></Breadcrumb.Item>
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
                    placeholder="请输入用户名"
                    addonBefore={<span>用户名</span>} 
                    style={{ width: 300, marginRight: 10 }}/>
                    
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
                    style={{ width: 300, marginRight: 10 }}/>

                    交易状态：<Select value={state.toolbarParams.state} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                state:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">提交申请</Select.Option>
                        <Select.Option value="2">提现成功</Select.Option>
                        <Select.Option value="3">提现失败</Select.Option>
                        <Select.Option value="4">审核中</Select.Option>
                        <Select.Option value="5">取消提现</Select.Option>
                    </Select>

                    
                </div>
                <div className="main-toolbar">
                    用户类别：<Select value={state.toolbarParams.type} onChange={(value)=>{
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
                    提交时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startCareateTime ? [moment(state.toolbarParams.startCareateTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endCareateTime, 'YYYY/MM/DD')] : []} 
                        style={{marginRight:10}}
                        onChange={(date,dateString)=>{
                            update('set',addons(state,{
                                toolbarParams:{
                                    startCareateTime:{
                                        $set:dateString[0]
                                    },
                                    endCareateTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                        }} />
                    </LocaleProvider>
                    审核时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startToAccountTime ? [moment(state.toolbarParams.startToAccountTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endToAccountTime, 'YYYY/MM/DD')] : []} 
                        style={{marginRight:10}}
                        onChange={(date,dateString)=>{
                            update('set',addons(state,{
                                toolbarParams:{
                                    startToAccountTime:{
                                        $set:dateString[0]
                                    },
                                    endToAccountTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                        }} />
                    </LocaleProvider>
                </div>
                
                <div className="main-toolbar">
                    审核状态：<Select value={state.toolbarParams.auditState} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                auditState:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">待审核</Select.Option>
                        <Select.Option value="2">待提交</Select.Option>
                        <Select.Option value="3">审核通过</Select.Option>
                        <Select.Option value="4">审核不通过</Select.Option>
                    </Select>
                    审核人：<Input type="text" style={{width:200}} value={state.toolbarParams.adminRole} 
                    placeholder="请输入审核人姓名"
                    onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminRole:{$set:e.target.value}
                            }
                        }))
                    }}/>
                </div>
                <div className="main-toolbar">
                    {
                        state.permission.update ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            state.Modal.visCard = true;
                            state.type = 'update';
                            let record = {};
                            state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            state.form = {
                                auditState:record.auditState,
                                money:record.money,
                                remark:record.remark,
                                state:record.state,
                                tel:record.tel,
                                userName:record.userName,
                                weixin:record.weixin,
                                yinhangka:record.yinhangka,
                                zhifubao:record.zhifubao,
                            }
                            _this.setState({});
                        }}>修改</Button>:''
                    }
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        if(state.indexTable.selectedRowKeys.length<1) return message.info('请至少选择一个进行审批');
                        state.Modal.visApproval = true;
                        state.approval={
                            remark:'',
                            state:''
                        }
                        _this.setState({});
                    }}>审批</Button>
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.urls.exportDepositLogExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>导出数据</Button>

                </div>
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
                <Modal title="提现明细"
                  width = '680px'
                  visible={state.Modal.visDetail}
                  footer={[
                    <Button type="primary" key="ok" onClick={()=>{
                        update('set',addons(state,{
                            Modal:{visDetail:{$set:false}}
                        }))    
                    }}>确定</Button>
                  ]}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visDetail:{$set:false}}
                    }))
                  }}>
                    <Table 
                    rowKey={record=>record.id} pagination={false}
                    columns={state.detailTable.head} dataSource={state.detailTable.data} />
                </Modal>
                <Modal title={state.type=='add'?"提现增加":"提现修改"}
                  width = '680px'
                  visible={state.Modal.visCard}
                  onOk={_this.updateDeposit.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visCard:{$set:false}}
                    }))
                  }}
                >
                    <Form.Item {...formItemLayout} label='审核状态'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'auditState')
                        }} style={{width:200}} value={state.form.auditState}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">审核通过</Select.Option>
                            <Select.Option value="2">未通过</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='提出金额'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'money')
                        }} type="text" value={state.form.money}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'remark')
                        }} type="text" value={state.form.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='交易状态'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'state')
                        }} style={{width:200}} value={String(state.form.state)}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">提交申请成功</Select.Option>
                            <Select.Option value="2">提现成功</Select.Option>
                            <Select.Option value="3">提现失败</Select.Option>
                            <Select.Option value="4">审核中</Select.Option>
                            <Select.Option value="5">取消提现</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='电话号码'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'tel')
                        }} type="text" value={state.form.tel}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='用户名'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'userName')
                        }} type="text" value={state.form.userName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='微信号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'weixin')
                        }} type="text" value={state.form.weixin}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='银行卡号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'yinhangka')
                        }} type="text" value={state.form.yinhangka}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='支付宝账号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'zhifubao')
                        }} type="text" value={state.form.zhifubao}/>
                    </Form.Item>
                </Modal>
                <Modal title="用户信息"
                  width = '680px'
                  visible={state.Modal.visDetailUpdate}
                  onOk={_this.updateDeposit.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visDetailUpdate:{$set:false}}
                    }))
                  }}
                >
                    <Form.Item {...formItemLayout} label='用户名'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'userName')
                        }} type="text" value={state.form.userName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='支付宝账号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'zhifubao')
                        }} type="text" value={state.form.zhifubao}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='微信号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'weixin')
                        }} type="text" value={state.form.weixin}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='银行卡号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'yinhangka')
                        }} type="text" value={state.form.yinhangka}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='提现时间'>
                        <LocaleProvider locale={zh_CN}>
                            <DatePicker value={state.toolbarParams.careateTime ? moment(state.toolbarParams.careateTime, 'YYYY/MM/DD') : null} 
                            style={{marginRight:10}}
                            onChange={(date,dateString)=>{
                                update('set',addons(state,{
                                    toolbarParams:{
                                        careateTime:{
                                            $set:dateString
                                        }
                                    }
                                }))
                            }} />
                        </LocaleProvider>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'remark')
                        }} type="text" value={state.form.remark}/>
                    </Form.Item>
                </Modal>
                <Modal title="审批"
                  width = '680px'
                  visible={state.Modal.visApproval}
                  onOk={()=>{
                    Ajax.post({
                        url:config.Deposit.urls.approval,
                        params:{
                            ...state.approval,
                            ids:_this.state.indexTable.selectedRowKeys
                        },
                        success:(data)=>{
                            _this.initIndex({
                                Modal:{visApproval:{$set:false}}
                            });
                        }
                    })
                  }}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visApproval:{$set:false}}
                    }))
                  }}>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            state.approval.remark = e.target.value;
                            _this.setState({});
                        }} type="text" value={state.approval.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='审核状态'>
                        <Select onChange={(value)=>{
                            state.approval.state = value;
                            _this.setState({});
                        }} style={{width:200}} value={String(state.approval.state)}>
                            <Select.Option value="1">通过</Select.Option>
                            <Select.Option value="2">不通过</Select.Option>
                        </Select>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
