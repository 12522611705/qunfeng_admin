import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Upload, Table, Divider, Tag, message, Checkbox,
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

// 引入编辑器组件
import BraftEditor from 'braft-editor'
// 引入编辑器样式
import 'braft-editor/dist/index.css'

// import { createForm } from 'rc-form';

const { RangePicker } = DatePicker;


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            permission:{
                notificationList:false,
                notificationAdd:false,
                notificationUpdate:false,
                notificationDelete:false,
                notificationPublish:false,
            },
            Modal:{
               visAdd:false
            },
            record:{},
            add:{
                creationRoleName:'',
                headline:'',
                headlineImgUrl:'',
                text:''
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
                    { title: '标题', dataIndex: 'headline', key: 'headline'}, 
                    { title: '缩列图', dataIndex: 'headlineImgUrl', key: 'headlineImgUrl', render:(text)=>(
                        <img src={text} width={60}/>
                    )}, 
                    { title: '作者', dataIndex: 'creationRoleName', key: 'creationRoleName'}, 
                    { title: '推文内容', dataIndex: 'text', key: 'text', render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            Modal.info({
                                width:800,
                                title:record.headline,
                                // content:<div style={{wordBreak: 'break-all'}}>{text}</div>
                                content:<div className="notificationContent" dangerouslySetInnerHTML={{__html:text}} style={{wordBreak: 'break-all'}}></div>
                            })
                        }}>查看</a>
                    )}, 
                    { title: '状态', dataIndex: 'status', key: 'status',render:(text)=>(
                        ['','待发布','已发布'][text]
                    )},
                    { title: '发布时间', dataIndex: 'time', key: 'time' },
                ],
                data:[]
            },
            toolbarParams:{
                status:'',
                headline:'',
                startUpdateTime:'',
                endUpdateTime:'',
                createTimeStart:'',
                createTimeEnd:''
            },
            selectedRowKeys:[],
            add:{
                creationRoleName:'',
                headline:'',
                headlineImgUrl:'',
                text:BraftEditor.createEditorState(null)
            },
            fileList:[]
        }
    }
    async componentDidMount(){
        this.initIndex()
        this.initPermission();
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
    }
    async submitContent(){
        // 在编辑器获得焦点时按下ctrl+s会执行此方法
        // 编辑器内容提交到服务端之前，可直接调用editorState.toHTML()来获取HTML格式的内容
        const htmlContent = this.state.editorState.toHTML()
        console.log(htmlContent)
    }

    handleEditorChange(editorState){
        this.update('set',addons(this.state,{
            add:{
                text:{$set:editorState}
            }
        }))
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
                    _this.state.permission[config.Notification.permission[el.url]] = true;
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
            url:config.Notification.urls.notificationList,
            params:{
                status:(params.status1 && params.status2) ? '' : (params.status1 && 1 ) || (params.status2 && 2 ),
                headline:params.headline||'',
                page:_this.state.indexTable.pagination.current||1,
                pageSize:_this.state.indexTable.pagination.pageSize||10,
                startTime:new Date(params.createTimeStart).getTime() || '',
                endTime:new Date(params.createTimeEnd).getTime() || '',
                startUpdateTime:new Date(params.startUpdateTime).getTime() || '',
                endUpdateTime:new Date(params.endUpdateTime).getTime() || ''
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
                    <Breadcrumb.Item>权限管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">后台用户列表</a></Breadcrumb.Item>
                </Breadcrumb>

                <div className="main-toolbar">
                    推文状态：
                    <Checkbox checked={state.toolbarParams.status1} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                status1:{
                                    $set:e.target.checked
                                } 
                            }
                        }))
                    }}>待发布</Checkbox>
                    <Checkbox checked={state.toolbarParams.status2} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                status2:{
                                    $set:e.target.checked
                                } 
                            }
                        }))
                    }}>已发布</Checkbox>
                    推文标题：
                    <Input type='text' style={{width:200}} value={state.toolbarParams.headline} onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                headline:{
                                    $set:e.target.value
                                } 
                            }
                        }))
                    }}/>
                    
                </div>
                <div className="main-toolbar">
                    创建时间：
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
                    发布时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startUpdateTime ? [moment(state.toolbarParams.startUpdateTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endUpdateTime, 'YYYY/MM/DD')] : []} 
                        onChange={(date,dateString)=>{
                            update('set',addons(state,{
                                toolbarParams:{
                                    startUpdateTime:{
                                        $set:dateString[0]
                                    },
                                    endUpdateTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                        }} />
                    </LocaleProvider>
                </div>
                <div className="main-toolbar">
                    {
                        state.permission.notificationAdd?
                        <Button onClick={()=>{
                            update('set',addons(state,{
                                editorState:{$set:'add'},
                                Modal:{visAdd:{$set:true}},
                                fileList:{
                                    $set:[]
                                },
                                add:{
                                    creationRoleName:{$set:''},
                                    headline:{$set:''},
                                    headlineImgUrl:{$set:''},
                                    text:{$set:BraftEditor.createEditorState(null)}
                                }
                            }))
                        }} type="primary" style={{marginRight:10}}>增加</Button>:''
                    }
                    {
                        state.permission.notificationUpdate?
                        <Button onClick={()=>{
                            if(_this.state.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            _this.state.Modal.visColle = true;
                            _this.state.type = 'update';
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.update('set',addons(_this.state,{
                                editorState:{$set:'update'},
                                record:{$set:record},
                                Modal:{visAdd:{$set:true}},
                                add:{
                                    creationRoleName:{$set:record.creationRoleName},
                                    headline:{$set:record.headline},
                                    headlineImgUrl:{$set:record.headlineImgUrl},
                                    text:{$set:BraftEditor.createEditorState(record.text)}
                                },
                                fileList:{
                                    $set:[{
                                        uid: '-1',
                                        name: '缩列图',
                                        status: 'done',
                                        url: record.headlineImgUrl
                                    }]
                                }
                            }))
                        }} type="primary" style={{marginRight:10}}>修改</Button>:''
                    }
                    
                    {
                        state.permission.notificationDelete?
                        <Button onClick={()=>{
                            if(_this.state.selectedRowKeys.length<1) return message.info('请至少选择一个进行删除');
                            Modal.confirm({
                                title:'提示',
                                content:'你确定要删除选中推文吗？',
                                okText:'确定',
                                cancelText:'取消',
                                onOk(){
                                    Ajax.post({
                                        url:config.Notification.urls.notificationDelete,
                                        params:{
                                            id:state.tableIds
                                        },
                                        success:(data)=>{
                                            state.tableIds = [];
                                            state.selectedRowKeys = [];
                                            _this.initIndex();
                                        }
                                    })
                                }
                            })
                        }} type="primary" style={{marginRight:10}}>删除</Button>:''
                    }
                    {
                        state.permission.notificationPublish?
                        <Button onClick={()=>{
                            if(_this.state.selectedRowKeys.length<1) return message.info('请至少选择一个推文发布');
                            Modal.confirm({
                                title:'提示',
                                content:'你确定要发布选中推文吗？',
                                okText:'确定',
                                cancelText:'取消',
                                onOk(){
                                    Ajax.post({
                                        url:config.Notification.urls.notificationPublish,
                                        params:{
                                            id:state.tableIds
                                        },
                                        success:(data)=>{
                                            state.tableIds = [];
                                            state.selectedRowKeys = [];
                                            _this.initIndex();
                                        }
                                    })
                                }
                            })
                        }} type="primary" style={{marginRight:10}}>发布</Button>:''    
                    }
                    <Button type="primary" onClick={()=>{
                        window.open(config.Notification.urls.exportNotificationExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                    <Button onClick={()=>{
                        _this.initIndex();
                    }} type="primary" style={{marginLeft:10}}>查询</Button>
                </div>
                <Table rowSelection={{
                    onChange: (selectedRowKeys, selectedRows) => {
                        let ids = [];
                        selectedRows.forEach((el)=>{
                            ids.push(el.id)
                        })
                        update('set',addons(state,{
                            selectedRowKeys:{$set:selectedRowKeys},
                            tableIds:{$set:ids}
                        }));   
                    }
                }} rowKey={record=>record.id} pagination={state.indexTable.pagination}
                columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
                <Modal title={state.editorState=='add'?'添加推文':'修改推文'}
                    onCancel={()=>{
                        update('set',addons(state,{Modal:{visAdd:{$set:false}}}))
                    }}
                    onOk={()=>{
                        if(state.editorState=='add'){
                            Ajax.post({
                                url:config.Notification.urls.notificationAdd,
                                params:{
                                    creationRoleName:state.add.creationRoleName,
                                    headline:state.add.headline,
                                    headlineImgUrl:state.add.headlineImgUrl.split('?')[0],
                                    text:state.add.text.toHTML()
                                },
                                success:(data)=>{
                                    _this.initIndex({
                                        Modal:{visAdd:{$set:false}}
                                    });
                                }
                            })    
                        }else{
                            Ajax.post({
                                url:config.Notification.urls.notificationUpdate,
                                params:{
                                    id:state.record.id,
                                    creationRoleName:state.add.creationRoleName,
                                    headline:state.add.headline,
                                    headlineImgUrl:state.add.headlineImgUrl.split('?')[0],
                                    text:state.add.text.toHTML()
                                },
                                success:(data)=>{
                                    _this.initIndex({
                                        Modal:{visAdd:{$set:false}}
                                    });
                                }
                            })
                        }
                    }}
                    width={800}
                    okText="确定"
                    cancelText="取消"
                    visible={state.Modal.visAdd}>
                    <Form.Item {...formItemLayout} label="推文标题" >
                        <Input placeholder="请输入推文标题" onChange={(e)=>{
                            update('set',addons(state,{
                                add:{headline:{$set:e.target.value}}
                            }))
                        }} value={state.add.headline}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="作者名字" >
                        <Input placeholder="请输入作者名字" onChange={(e)=>{
                            update('set',addons(state,{
                                add:{creationRoleName:{$set:e.target.value}}
                            }))
                        }} value={state.add.creationRoleName}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="缩列图" >
                        <Upload action='http://118.190.145.65:8888/flockpeak-shop/ossImg/upload' 
                            listType='picture' 
                            fileList={state.fileList}
                            onChange={(info)=>{
                                update('set',addons(state,{
                                    add:{
                                        headlineImgUrl:{
                                            $set:info.file.response && info.file.response.data
                                        }    
                                    },
                                    fileList:{
                                        $set:[{
                                            uid: info.file.uid,
                                            name: info.file.name,
                                            status: info.file.status,
                                            url: info.file.response && info.file.response.data
                                        }]
                                    }
                                }))
                            }}>
                            <Button><Icon type="camera" />点击上传</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="推文内容" >
                        <div style = {{border:'1px solid #ddd'}}>
                            <BraftEditor
                                value={state.add.text}
                                onChange={_this.handleEditorChange.bind(_this)}
                                media={{
                                    accepts: {audio:false,video:false},
                                    uploadFn:(param)=>{
                                        const serverURL = 'http://118.190.145.65:8888/flockpeak-shop/ossImg/upload'
                                        const xhr = new XMLHttpRequest
                                        const fd = new FormData()
                                        const successFn = (response) => {
                                            // 假设服务端直接返回文件上传后的地址
                                            // 上传成功后调用param.success并传入上传后的文件地址
                                            param.success({
                                                url: JSON.parse(xhr.responseText).data.split('?')[0],
                                                meta: {
                                                    id: 'xxx',
                                                    title: 'xxx',
                                                    alt: 'xxx',
                                                    loop: false, // 指定音视频是否循环播放
                                                    autoPlay: false, // 指定音视频是否自动播放
                                                    controls: false, // 指定音视频是否显示控制栏
                                                    poster: 'http://xxx/xx.png', // 指定视频播放器的封面
                                                }
                                            })
                                        }

                                        const progressFn = (event) => {
                                            // 上传进度发生变化时调用param.progress
                                            param.progress(event.loaded / event.total * 100)
                                        }

                                        const errorFn = (response) => {
                                            // 上传发生错误时调用param.error
                                            param.error({
                                              msg: 'unable to upload.'
                                            })
                                        }
                                        xhr.upload.addEventListener("progress", progressFn, false)
                                        xhr.addEventListener("load", successFn, false)
                                        xhr.addEventListener("error", errorFn, false)
                                        xhr.addEventListener("abort", errorFn, false)
                                        fd.append('file', param.file)
                                        xhr.open('POST', serverURL, true)
                                        xhr.send(fd)
                                    }
                                }}
                                onSave={_this.submitContent.bind(_this)}/>
                        </div>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
