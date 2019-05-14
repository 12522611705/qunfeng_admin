import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, DatePicker, Modal, Tree } from 'antd';
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


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            Modal:{
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
                        _this.state.indexTable.pagination.current = page;
                        _this.initIndex();
                    }
                },
                head:[
                    { title: 'ID', dataIndex: 'id', key: 'id' }, 
                    { title: '用户来源', dataIndex: 'source', key: 'source', render:(text,record)=>(
                        ['','H5','安卓','IOS'][text]
                    ) }, 
                    { title: '反馈内容', dataIndex: 'content', key: 'content' }, 
                    { title: '用户ID', dataIndex: 'userId', key: 'userId' }, 
                    { title: '意见反馈图片', dataIndex: 'imgUrls', key: 'imgUrls' ,render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            _this.update('set',addons(_this.state,{
                                record:{$set:record},
                                Modal:{
                                    visThumb:{$set:true}
                                }
                            }))
                        }}>查看</a>
                    ) }, 
                    { title: '开始时间', dataIndex: 'creationTime', key: 'creationTime' }, 
                    { title: '手机号码', dataIndex: 'tel', key: 'tel' }
                ],
                data:[]
            },
            toolbarParams:{
                tel:'',
                startTime:'',
                endTime:'',
                source:''
            }
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
    initIndex(){
        const _this = this;
        const params = _this.state.toolbarParams;
        Ajax.get({
            url:config.Feedback.urls.feedbackList,
            params:{
                page:_this.state.indexTable.pagination.current,
                pageSize:_this.state.indexTable.pagination.pageSize,
                tel:params.tel||'',
                startTime:new Date(params.createTimeStart).getTime()||'',
                endTime:new Date(params.createTimeEnd).getTime()||'',
                source:params.source||''
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
                    <Breadcrumb.Item>用户管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">意见反馈</a></Breadcrumb.Item>
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
                    placeholder="请输入手机号码"
                    addonBefore={<span>手机号码</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    
                </div>
                <div className="main-toolbar">
                    状态：<Select value={state.toolbarParams.source} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                source:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">H5</Select.Option>
                        <Select.Option value="2">安卓</Select.Option>
                        <Select.Option value="3">IOS</Select.Option>
                    </Select>
                    时间段查询：
                    <RangePicker value={state.toolbarParams.createTimeStart ? [moment(state.toolbarParams.createTimeStart, 'YYYY/MM/DD'),moment(state.toolbarParams.createTimeEnd, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
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
                    }} />
                </div>
                <div style={{textAlign:"right"}} className="main-toolbar">
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams={
                            tel:'',
                            startTime:'',
                            endTime:'',
                            source:''
                        }
                        _this.initIndex({
                            toolbarParams:{
                                tel:{$set:''},
                                startTime:{$set:''},
                                endTime:{$set:''},
                                source:{$set:''},
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

                <Modal title="图片查看" 
                    okText="确定"
                    cancelText="取消"
                    onCancel={()=>{
                        update('set',addons(state,{
                            Modal:{
                                visThumb:{$set:false}
                            }
                        }))
                    }}
                    visible={state.Modal.visThumb}>
                    {
                        state.record.imgUrls && state.record.imgUrls.map((el,index)=>(
                            <div style={{paddingBottom:10}}><img style={{width:'100%'}} src={el.imgPath} key={index}/></div>
                        ))
                    }
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
