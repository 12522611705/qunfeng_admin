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
                    { title: '用户来源', dataIndex: 'source', key: 'source', render:(text,record)=>(
                        ['','H5','安卓','IOS'][text]
                    ) }, 
                    { title: '反馈内容', dataIndex: 'content', key: 'content' }, 
                    { title: 'ID', dataIndex: 'id', key: 'id' }, 
                    { title: '用户ID', dataIndex: 'userId', key: 'userId' }, 
                    { title: '意见反馈图片', dataIndex: 'imgUrls', key: 'imgUrls' ,render:(text)=>(
                        <span style={{width:200}}>
                            <img style={{width:200}} src={text[0].imgPath}/>
                        </span>
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
                startTime:params.startTime||'',
                endTime:params.endTime||'',
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
                    状态：<Select defaultValue="" onChange={(value)=>{
                        state.toolbarParams.source = value;
                        _this.initIndex();
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">H5</Select.Option>
                        <Select.Option value="2">安卓</Select.Option>
                        <Select.Option value="3">IOS</Select.Option>
                    </Select>
                    时间段查询：
                    <RangePicker onChange={(date,dateString)=>{
                        state.toolbarParams.createTimeStart = dateString[0];
                        state.toolbarParams.createTimeEnd = dateString[1];
                        _this.initIndex();
                    }} />
                </div>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
               
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
