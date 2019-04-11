import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, Tree, message } from 'antd';

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
               visAddUser:false,
               visChangePass:false
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
                    { title: '用户名', dataIndex: 'account', key: 'account'}, 
                    { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime'}, 
                    { title: '用户ID', dataIndex: 'creationUserId', key: 'creationUserId'}, 
                    // { title: '所属角色', dataIndex: 'current', key: 'current', render:()=>(
                    //     <div>
                    //         <p>我是老师</p>
                    //         <p>我是学生</p>
                    //         <p>我是班委</p>
                    //     </div>
                    // )}, 
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        <span>
                            <a href="javascript:;" onClick={()=>{
                               Modal.confirm({
                                    title:'提示',
                                    content:'你确定要删除该角色吗？',
                                    okText:'确定',
                                    cancelText:'取消',
                                    onOk(){
                                        Ajax.post({
                                            url:config.UserAdmin.urls.deleteUser,
                                            params:{
                                                id:record.id
                                            },
                                            success:(data)=>{
                                                _this.initIndex();
                                            }
                                        })
                                    }
                                })
                            }}>删除</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{
                               Ajax.post({
                                    url:config.RoleAdmin.urls.addRoleToAdminUser,
                                    params:{
                                        userId:record.id,
                                        roleIds:[]
                                    },
                                    success:(data)=>{
                                        
                                    }
                                })
                            }}>绑定角色</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{
                                _this.update('set',addons(_this.state,{
                                    Modal:{visChangePass:{$set:true}},
                                    record:{$set:record},
                                    changePass:{
                                        password1:{$set:''},
                                        password2:{$set:''}
                                    }
                                }))
                            }}>修改密码</a>
                        </span>
                    )},

                ],
                data:[]
            },
            addUser:{
                account:'',
                password:''
            },
            changePass:{
                password1:'',
                password2:''
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
    initIndex(updateParams){
        const _this = this;
        const params = _this.state.toolbarParams;
        Ajax.get({
            url:config.UserAdmin.urls.adminUserList,
            params:{},
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    indexTable:{
                        data:{
                            $set:data||[]
                        },
                        // pagination:{
                        //     total:{
                        //         $set:data.count
                        //     },
                        //     pageSize:{
                        //         $set:data.pageSize
                        //     },
                        //     current:{
                        //         $set:_this.state.indexTable.pagination.current
                        //     }
                        // }
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
                    <Button type="primary" onClick={()=>{
                        update('set',addons(state,{
                            Modal:{visAddUser:{$set:true}},
                            addUser:{
                                account:{$set:''},
                                password:{$set:''}
                            }
                        }))
                    }}>添加用户</Button>
                </div>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <Modal 
                    title="添加用户" 
                    okText="确定"
                    cancelText="取消"
                    onOk={()=>{
                        if(!state.addUser.account.length) return message.info('账号不能为空！');
                        if(!state.addUser.password.length) return message.info('密码不能为空！');
                        Ajax.post({
                            url:config.UserAdmin.urls.add,
                            params:{
                                ...state.addUser
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visAddUser:{$set:false}}})
                            }
                        })
                    }}
                    onCancel={()=>{
                        update('set',addons(state,{Modal:{visAddUser:{$set:false}}}))
                    }}
                    visible={state.Modal.visAddUser}>
                    <Form.Item {...formItemLayout} label="账号" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            update('set',addons(state,{addUser:{account:{$set:e.target.value}}}))
                        }} value={state.addUser.account}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="密码" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            update('set',addons(state,{addUser:{password:{$set:e.target.value}}}))
                        }} value={state.addUser.password}/>
                    </Form.Item>
                </Modal>
                <Modal 
                    title="修改密码" 
                    okText="确定"
                    cancelText="取消"
                    onOk={()=>{
                        if(!state.changePass.password1.length || !state.changePass.password2.length) return message.info('密码不能为空');
                        if(state.changePass.password1 != state.changePass.password2) return message.info('两次密码输入不一致');
                        Ajax.post({
                            url:config.UserAdmin.urls.update,
                            params:{
                                account:state.record.account,
                                password:state.changePass.password1
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visChangePass:{$set:false}}})
                            }
                        })
                    }}
                    onCancel={()=>{
                        update('set',addons(state,{Modal:{visChangePass:{$set:false}}}))
                    }}
                    visible={state.Modal.visChangePass}>
                    <Form.Item {...formItemLayout} label="密码" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            update('set',addons(state,{changePass:{password1:{$set:e.target.value}}}))
                        }} value={state.changePass.password1}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="确认密码" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            update('set',addons(state,{changePass:{password2:{$set:e.target.value}}}))
                        }} value={state.changePass.password2}/>
                    </Form.Item>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
