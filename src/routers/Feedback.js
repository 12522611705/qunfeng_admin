import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, DatePicker, LocaleProvider, Modal, Tree, Carousel } from 'antd';
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
                    { title: '反馈内容', dataIndex: 'content', key: 'content' }, 
                    { title: '图片', dataIndex: 'imgUrls', key: 'imgUrls' ,render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            _this.update('set',addons(_this.state,{
                                record:{$set:record},
                                Modal:{
                                    visThumb:{$set:true}
                                }
                            }))
                        }}>查看图片</a>
                    ) }, 
                    { title: '来源', dataIndex: 'source', key: 'source', render:(text,record)=>(
                        ['','H5','安卓','IOS'][text]
                    ) }, 
                    { title: '反馈时间', dataIndex: 'creationTime', key: 'creationTime' }, 
                    { title: '用户ID', dataIndex: 'userId', key: 'userId' }, 
                    { title: '电话号码', dataIndex: 'tel', key: 'tel' },

                    { title: '用户类别', dataIndex: 'type', key: 'type',render:(text)=>(
                        ['普通用户','保洁员','物业公司工作人员','街道人员','城管局','司机','公司员工'][text]
                    ) },
                    { title: '处理意见', dataIndex: 'disposeIdea', key: 'disposeIdea' },
                    { title: '处理结果', dataIndex: 'state', key: 'state' ,render:(text)=>(
                        ['','已完成','未完成'][text]
                    ) },
                    { title: '处理时间', dataIndex: 'disposeTime', key: 'disposeTime' },
                    { title: '跟进人', dataIndex: 'followUpPeople', key: 'followUpPeople' },
                    { title: '备注', dataIndex: 'remark', key: 'remark' },

                ],
                data:[]
            },
            toolbarParams:{
                tel:'',
                startTime:'',
                endTime:'',
                name:'',
                state:'',
                type:'',
                source:''
            }
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
                    // _this.state.permission[config.Notification.permission[el.url]] = true;
                })
                console.log(_this.state.permission)
                _this.setState({});
            }
        })
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
                name:params.name||'',
                state:params.state||'',
                type:params.type||'',
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
                                name:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.name} 
                    placeholder="请输入用户名"
                    addonBefore={<span>用户名</span>} 
                    style={{ width: 300, marginRight: 10 }} />

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
                    style={{ width: 300, marginRight: 10 }} />
                    
                </div>
                <div className="main-toolbar">
                    用户来源：<Select value={state.toolbarParams.source} onChange={(value)=>{
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
                    反馈时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.createTimeStart ? [moment(state.toolbarParams.createTimeStart, 'YYYY/MM/DD'),moment(state.toolbarParams.createTimeEnd, 'YYYY/MM/DD')] : []} 
                        style={{marginRight:10}}
                        onChange={(date,dateString)=>{
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
                    </LocaleProvider>
                    处理结果：<Select value={state.toolbarParams.state} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                state:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">已完成</Select.Option>
                        <Select.Option value="2">未完成</Select.Option>
                    </Select>
                </div>
                <div style={{textAlign:"right"}} className="main-toolbar">
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams={
                            tel:'',
                            startTime:'',
                            endTime:'',
                            name:'',
                            state:'',
                            type:'',
                            source:''
                        }
                        _this.initIndex({
                            toolbarParams:{
                                tel:{$set:''},
                                startTime:{$set:''},
                                endTime:{$set:''},
                                name:{$set:''},
                                state:{$set:''},
                                type:{$set:''},
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
                    <div style={{position:"relative"}}>
                        <Icon onClick={()=>{
                            _this.refs.carousel.prev();
                        }} style={{fontSize:40,cursor:"pointer",position:'absolute',top:'50%',left:0,zIndex:11}} type="left-circle" />
                        <Carousel ref="carousel">
                            {
                                state.record.imgUrls && state.record.imgUrls.map((el,index)=>(
                                    <div key={index} style={{paddingBottom:10}}><img style={{width:'100%'}} src={el.imgPath}/></div>
                                ))
                            }
                        </Carousel>
                        <Icon onClick={()=>{
                            _this.refs.carousel.next();
                        }} style={{fontSize:40,cursor:"pointer",position:'absolute',top:'50%',right:0,zIndex:11}} type="right-circle" />
                    </div>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
