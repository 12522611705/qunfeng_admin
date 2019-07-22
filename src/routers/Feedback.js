import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, Tag, Checkbox, Form, message,
    DatePicker, LocaleProvider, Modal, Tree, Carousel } from 'antd';
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

const { RangePicker } = DatePicker;


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
            Modal:{
               visThumb:false,
               visFeed:false
            },
            permission:{
                deleteFeedback:false,
                updateFeedback:false,
                details:false
            },
            record:{},
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
                    { title: 'ID', dataIndex: 'id', key: 'id' }, 
                    { title: '用户名', dataIndex: 'userName', key: 'userName' }, 
                    { title: '用户类别', dataIndex: 'type', key: 'type',render:(text)=>(
                        ['普通用户','保洁员','物业公司工作人员','街道人员','城管局','司机','公司员工'][text]
                    ) },
                    { title: '反馈时间', dataIndex: 'creationTime', key: 'creationTime' }, 
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
                    { title: '处理意见', dataIndex: 'disposeIdea', key: 'disposeIdea' },
                    { title: '处理进度', dataIndex: 'schedule', key: 'schedule' , render:(text)=>(
                        ['','已完成','未完成'][text]
                    )},
                    { title: '更多详情', dataIndex: 'more', key: 'more' , render:(text,record)=>(
                        _this.state.permission.details ?
                        <a style={{color:'#1155cc'}} onClick={()=>{
                            Modal.info({
                                title: '更多信息',
                                content: (
                                  <div>
                                    <Form.Item {...formItemLayout} label='电话'>
                                        {record.tel||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='处理时间'>
                                        {record.disposeTime||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='处理人员'>
                                        {record.followUpPeople||'--'}
                                    </Form.Item>
                                    <Form.Item {...formItemLayout} label='备注'>
                                        {record.remark||'--'}
                                    </Form.Item>
                                  </div>
                                ),
                            });
                            
                       }} href="javascript:;">点击查看</a>:''
                    ) },
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
            },
            form:{

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
                    _this.state.permission[config.Feedback.permission[el.url]] = true;
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
            url:config.Feedback.urls.feedbackList,
            params:{
                state:(params.status1 && params.status2) ? '' : (params.status1 && 1 ) || (params.status2 && 2 ),
                page:_this.state.indexTable.pagination.current,
                pageSize:_this.state.indexTable.pagination.pageSize,
                tel:params.tel||'',
                startTime:new Date(params.createTimeStart).getTime()||'',
                endTime:new Date(params.createTimeEnd).getTime()||'',
                name:params.name||'',
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
                    },
                    ...updateParams
                }))
            }
        })
    }
    //修改
    updateFeed(){
        const _this = this;
        Ajax.post({
            url:config.Feedback.urls.updateFeedback,
            params:{
                ..._this.state.form,
                id:_this.state.indexTable.selectedRowKeys[0]
            },
            success:(data)=>{
                _this.initIndex({
                    Modal:{
                        visFeed:{$set:false}
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
            sm: { span: 7 },
          },
          wrapperCol: {
            xs: { span: 24 },
            sm: { span: 15 },
          },
        };
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
                    处理结果：
                    <Checkbox checked={state.toolbarParams.status1} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                status1:{
                                    $set:e.target.checked
                                } 
                            }
                        }))
                    }}>已完成</Checkbox>
                    <Checkbox checked={state.toolbarParams.status2} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                status2:{
                                    $set:e.target.checked
                                } 
                            }
                        }))
                    }}>未完成</Checkbox>
                </div>

                <div className="main-toolbar">
                    {
                        state.permission.updateFeedback ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            _this.state.Modal.visFeed = true;
                            _this.state.type = 'update';
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.state.form = {
                                disposeIdea:record.disposeIdea,
                                followUpPeople:record.followUpPeople,
                                remark:record.remark,
                                schedule:record.schedule
                            }
                            _this.setState({}); 
                        }}>修改</Button>:''
                    }
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    {
                        state.permission.deleteFeedback ?
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
                                        url:config.Feedback.urls.deleteFeedback,
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
                    
                    <Button type="primary" onClick={()=>{
                        window.open(config.Feedback.urls.exportFeedbackExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams)); 
                    }}>数据导出</Button>
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
                <Modal title="反馈信息修改"
                  width = '680px'
                  visible={state.Modal.visFeed}
                  onOk={_this.updateFeed.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visFeed:{$set:false}}
                    }))
                  }}>
                    <Form.Item {...formItemLayout} label='处理意见'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'disposeIdea')
                        }} type="text" value={state.form.disposeIdea}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='处理人员'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'followUpPeople')
                        }} type="text" value={state.form.followUpPeople}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'remark')
                        }} type="text" value={state.form.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='处理进度'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'source')
                        }} style={{width:200}} value={state.form.source}>
                            <Select.Option value="">全部</Select.Option>
                            <Select.Option value="1">未完成</Select.Option>
                            <Select.Option value="2">已完成</Select.Option>
                        </Select>
                    </Form.Item>
                </Modal>
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
