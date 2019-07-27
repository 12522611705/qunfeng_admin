import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, message, Upload,
    DatePicker, LocaleProvider, Modal, Tree } from 'antd';
import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseSearch } from '../utils/global';
import { config } from '../utils/config';
import Cities from '../utils/Cities';
// import { createForm } from 'rc-form';

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
            sm: { span: 4 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 20 },
          },
        };
        this.state = {
            permission:{
                list:false,
                update:false,
                add:false
            },
            Modal:{
               visUpdate:false,
               visThumb:false,
               visCard:false
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
                        this.state.indexTable.pagination.current = page;
                        this.initIndex();
                    }
                },
                head:[
                    { title: 'ID', dataIndex: 'id', key: 'id'}, 
                    { title: '用户名', dataIndex: 'userName', key: 'userName'}, 
                    { title: '用户类别', dataIndex: 'userType', key: 'userType',render:(text)=>(
                        ['普通用户','保洁员','物业公司工作人员','街道人员','城管局','司机','公司员工'][text]
                    )}, 
                    { title: '姓名', dataIndex: 'name', key: 'name'}, 
                    { title: '提交时间', dataIndex: 'creationTime', key: 'creationTime'}, 
                    { title: '状态', dataIndex: 'state', key: 'state',render:(text)=>(
                    	['','待审核','待提交','审核通过','审核不通过'][text]
                    )}, 
                    { title: '审核人', dataIndex: 'adminName', key: 'adminName'}, 
                    { title: '更多详情', dataIndex: 'more', key: 'more',render:(text,record)=>(
                        <a style={{color:'#1155cc'}} onClick={()=>{
                            Modal.info({
                                title: '更多详情',
                                width:600,
                                content: (
                                  <div>
                                    <Form.Item {...formItemLayout} label='正面'>
                                        <img style={{width:'100%'}} src={record.cardFrontUrl}/>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='反面'>
                                        <img style={{width:'100%'}} src={record.cardBackUrl}/>
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='证件号码'>
                                        {record.cardNo||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='手机号码'>
                                        {record.tel||'--'}
                                    </Form.Item>
                                  </div>
                                ),
                            });
                            
                       }} href="javascript:;">查看更多</a>
                    )}, 
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        _this.state.permission.update?
                        <span>
                            <a style={{color:record.state==3 || record.state==4 ? '#ccc' : '#1890ff'}} href="javascript:;" onClick={()=>{
                                if(record.state == 3 || record.state == 4 ) return;
                                Ajax.post({
                                    url:config.Card.urls.update,
                                    params:{
                                        state:3,
                                        id:record.id
                                    },
                                    success:(data)=>{
                                        _this.initIndex();
                                    }
                                })
                            }}>通过</a>
                            <Divider type="vertical"/>
                            <a style={{color:record.state==3 || record.state==4 ? '#ccc' : '#1890ff'}} href="javascript:;" onClick={()=>{
                                if(record.state == 3 || record.state == 4 ) return;
                                Ajax.post({
                                    url:config.Card.urls.update,
                                    params:{
                                        state:4,
                                        id:record.id
                                    },
                                    success:(data)=>{
                                        _this.initIndex();
                                    }
                                })
                            }}>不通过</a>
                        </span>:'--'
                        
                    )},
                ],
                data:[]
            },
            toolbarParams:{
            	tel:'',
            	startTime:'',
            	endTime:'',
            	cardNo:'',
            	state:'',
                userName:'',
                adminName:'',
                userType:'',
                updateStartTime:'',
                updateEndTime:'',
            	name:''
            },
            update:{
                remark:'',
                state:'',
                fileList1:[],
                fileList2:[]
            },
            form:{

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
                    _this.state.permission[config.Card.permission[el.url]] = true;
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
            url:config.Card.urls.list,
            params:{
                page:_this.state.indexTable.pagination.current,
                pageSize:_this.state.indexTable.pagination.pageSize,
            	tel:params.tel||'',
            	startTime:new Date(params.startTime).getTime()||'',
            	endTime:new Date(params.endTime).getTime()||'',
            	cardNo:params.cardNo||'',
            	state:params.state||'',
                userName:params.userName||'',
                adminName:params.adminName||'',
                userType:params.userType||'',
                updateStartTime:new Date(params.updateStartTime).getTime()||'',
                updateEndTime:new Date(params.updateEndTime).getTime()||'',
            	name:params.name||''
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
    card(){
        const _this = this;
        let url = '';
        let postData = {};
        if(_this.state.type=='add'){
            url = config.Card.urls.add;
            postData={
                ..._this.state.form,
            }
        }else if(_this.state.type=='update'){
            url = config.Card.urls.update;
            postData={
                ..._this.state.form,
                id:_this.state.indexTable.selectedRowKeys[0]
            }
        }
        Ajax.post({
            url,
            params:postData,
            success:(data)=>{
                _this.initIndex({
                    Modal:{
                        visCard:{$set:false}
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
                    <Breadcrumb.Item><a href="javascript:;">身份验证管理</a></Breadcrumb.Item>
                </Breadcrumb>
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

                    用户类别：<Select value={state.toolbarParams.userType} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                userType:{$set:value}
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
                                name:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.name} 
                    placeholder="请输入姓名"
                    addonBefore={<span>证件姓名</span>} 
                    style={{ width: 300, marginRight: 10 }}/>

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                cardNo:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.cardNo} 
                    placeholder="请输入证件号码"
                    addonBefore={<span>证件号码</span>} 
                    style={{ width: 300, marginRight: 10 }}/>
                </div>
                <div className="main-toolbar">
                    提交时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startTime ? [moment(state.toolbarParams.startTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endTime, 'YYYY/MM/DD')] : []} 
                        style={{marginRight:10}}
                        onChange={(date,dateString)=>{
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
                    审核时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.updateStartTime ? [moment(state.toolbarParams.updateStartTime, 'YYYY/MM/DD'),moment(state.toolbarParams.updateEndTime, 'YYYY/MM/DD')] : []} 
                        onChange={(date,dateString)=>{
                            update('set',addons(state,{
                                toolbarParams:{
                                    updateStartTime:{
                                        $set:dateString[0]
                                    },
                                    updateEndTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                        }} />
                    </LocaleProvider>
                </div>
                <div className="main-toolbar">
	                审核状态：<Select value={state.toolbarParams.state} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                state:{$set:value}
                            }
                         }))
	                }} style={{ width: 120, marginRight:10 }}>
	                    <Select.Option value="">全部</Select.Option>
	                    <Select.Option value="1">待审核</Select.Option>
	                    <Select.Option value="2">待提交</Select.Option>
	                    <Select.Option value="3">审核通过</Select.Option>
	                    <Select.Option value="4">审核不通过</Select.Option>
	                </Select>
                    审核人：<Input type="text" style={{width:200}} value={state.toolbarParams.adminName} 
                    placeholder="请输入审核人姓名"
                    onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminName:{$set:e.target.value}
                            }
                        }))
                    }}/>
                </div>

                <div className="main-toolbar">
                    {
                        state.permission.add ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            _this.state.Modal.visCard = true;
                            _this.state.type = 'add';
                            _this.setState({});
                        }}>增加</Button>:''    
                    }
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    {
                        state.permission.update ?
                        <Button type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            _this.state.Modal.visCard = true;
                            _this.state.type = 'update';
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.state.form = {
                                name:record.name,
                                cardNo:record.cardNo,
                                tel:record.tel,
                                cardFrontUrl:record.cardFrontUrl,
                                cardBackUrl:record.cardBackUrl,
                                state:record.state,
                            }
                            _this.setState({});
                        }}>修改</Button>:''
                    }
                    
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
                <Modal title="查看大图"
                   onOk={()=>{
                        update('set',addons(state,{Modal:{visThumb:{$set:false}}}))
                   }}
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visThumb:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visThumb}>
                    <img style={{width:'100%'}} src={state.thumbUrl}/>
                </Modal>
                <Modal title="修改"
                   onOk={()=>{
                        Ajax.post({
                            url:config.Card.urls.update,
                            params:{
                                remark:state.update.remark,
                                state:state.update.state,
                                id:state.record.id
                            },
                            success:(data)=>{
                                _this.initIndex({
                                    Modal:{visUpdate:{$set:false}}
                                });
                            }
                        })
                   }}
                   onCancel={()=>{
                    update('set',addons(state,{Modal:{visUpdate:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visUpdate}>
                    <Form.Item {...formItemLayout} label="状态" > 
                        <Select onChange={(value)=>{
                            update('set',addons(state,{
                                update:{
                                    state:{$set:value}
                                }
                            }))
                        }} value={state.update.state} style={{ width: 120, marginRight:10 }}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">待审核</Select.Option>
                            <Select.Option value="2">待提交</Select.Option>
                            <Select.Option value="3">审核通过</Select.Option>
                            <Select.Option value="4">审核不通过</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="备注" > 
                        <TextArea rows="4" type="textarea" value={state.update.remark} onChange={(e)=>{
                            update('set',addons(state,{
                                update:{
                                    remark:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                </Modal>
                <Modal title="用户信息"
                  width = '680px'
                  visible={state.Modal.visCard}
                  onOk={_this.card.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visCard:{$set:false}}
                    }))
                  }}
                >
                    <Form.Item {...formItemLayout} label='身份证真实名字'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'name')
                        }} type="text" value={state.form.name}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='身份证号码'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'cardNo')
                        }} type="text" value={state.form.cardNo}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='手机号码'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'tel')
                        }} type="text" value={state.form.tel}/>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label='身份证正面'>
                        <Upload 
                              action='http://118.190.145.65:8888/flockpeak-shop/ossImg/upload'
                              listType='picture'
                              onChange={(info)=>{
                                state.form.cardFrontUrl = info.file.response && info.file.response.data && info.file.response.data.split('?')[0];
                                state.update.fileList1 = [{
                                    uid: info.file.uid,
                                    name: info.file.name,
                                    status: info.file.status,
                                    url: info.file.uid,
                                    thumbUrl: state.form.cardFrontUrl,
                                }]
                                _this.setState({});
                              }}
                              fileList= {state.update.fileList1}>
                            <Button>
                                <Icon type="upload" /> 点击长传
                            </Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='身份证反面'>
                        <Upload 
                              action='http://118.190.145.65:8888/flockpeak-shop/ossImg/upload'
                              listType='picture'
                              onChange={(info)=>{
                                state.form.cardBackUrl = info.file.response && info.file.response.data && info.file.response.data.split('?')[0];
                                state.update.fileList2 = [{
                                    uid: info.file.uid,
                                    name: info.file.name,
                                    status: info.file.status,
                                    url: info.file.uid,
                                    thumbUrl: state.form.cardBackUrl,
                                }]
                                _this.setState({});
                              }}
                              fileList= {state.update.fileList2}>
                            <Button>
                                <Icon type="upload" /> 点击长传
                            </Button>
                        </Upload>
                    </Form.Item>
                    
                    <Form.Item {...formItemLayout} label='审核状态'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'state')
                        }} style={{width:200}} value={state.form.state}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">未提交</Select.Option>
                            <Select.Option value="2">待审核</Select.Option>
                            <Select.Option value="3">审核通过</Select.Option>
                            <Select.Option value="4">未通过</Select.Option>
                        </Select>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
