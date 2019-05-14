import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, Tree } from 'antd';
import moment from 'moment';

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
const { TextArea } = Input;

class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            Modal:{
               visUpdate:false,
               visThumb:false
            },
            record:{},
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
                    { title: '用户手机号码', dataIndex: 'tel', key: 'tel'}, 
                    { title: '身份证名字', dataIndex: 'name', key: 'name'}, 
                    { title: '身份证正面图片', dataIndex: 'cardFrontUrl', key: 'cardFrontUrl',render:(text)=>(
                    	<img onClick={()=>{
                            _this.update('set',addons(_this.state,{
                                thumbUrl:{$set:text},
                                Modal:{
                                    visThumb:{$set:true}
                                }
                            }))
                        }} style={{width:200,height:40}} src={text}/>
                    )}, 
                    { title: '身份证反面图片', dataIndex: 'cardBackUrl', key: 'cardBackUrl',render:(text)=>(
                        <img onClick={()=>{
                            _this.update('set',addons(_this.state,{
                                thumbUrl:{$set:text},
                                Modal:{
                                    visThumb:{$set:true}
                                }
                            }))
                        }} style={{width:200,height:40}} src={text}/>
                    )}, 
                    { title: '身份证号码', dataIndex: 'cardNo', key: 'cardNo'}, 
                    { title: '状态', dataIndex: 'state', key: 'state',render:(text)=>(
                    	['','待审核','待提交','审核通过','审核不通过'][text]
                    )}, 
                    { title: '开始时间', dataIndex: 'creationTime', key: 'creationTime'}, 
                    { title: '备注', dataIndex: 'remark', key: 'remark', render:(text,record)=>(
                        <TextArea defaultValue={text} onBlur={(e)=>{
                            Ajax.post({
                                url:config.Card.urls.update,
                                params:{
                                    remark:e.target.value,
                                    id:record.id
                                },
                                success:(data)=>{
                                    _this.initIndex();
                                }
                            })
                        }}/>
                    )},
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
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
                        </span>
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
            	name:''
            },
            update:{
                remark:'',
                state:''
            },
            thumbUrl:''
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
        Ajax.get({
            url:config.Card.urls.list,
            params:{
                page:_this.state.indexTable.pagination.current,
                pageSize:_this.state.indexTable.pagination.pageSize,
            	tel:params.tel||'',
            	startTime:params.startTime||'',
            	endTime:params.endTime||'',
            	cardNo:params.cardNo||'',
            	state:params.state||'',
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
                                cardNo:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.cardNo} 
                    placeholder="请输入身份证号"
                    addonBefore={<span>身份证号</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                name:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.name} 
                    placeholder="请输入身份证名字"
                    addonBefore={<span>身份证名字</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
	                状态：<Select value={state.toolbarParams.state} onChange={(value)=>{
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
                    时间段查询：
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
                </div>

                <div style={{textAlign:"right"}} className="main-toolbar">
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams = {
                            tel:'',
                            startTime:'',
                            endTime:'',
                            cardNo:'',
                            state:'',
                            name:''
                        }
                        _this.initIndex({
                            toolbarParams:{
                                tel:{$set:''},
                                startTime:{$set:''},
                                endTime:{$set:''},
                                cardNo:{$set:''},
                                state:{$set:''},
                                name:{$set:''},
                            }
                        })
                    }}>重置</Button>
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>搜索</Button>
                </div>
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination}
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
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
