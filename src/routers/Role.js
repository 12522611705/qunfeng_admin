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
                visMenu:false,
                visUser:false
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
                    { title: '创建人id', dataIndex: 'creationRoleId', key: 'creationRoleId'}, 
                    { title: '创建时间', dataIndex: 'creationTime', key: 'creationTime'}, 
                    { title: '角色id', dataIndex: 'id', key: 'id'}, 
                    { title: '备注', dataIndex: 'remark', key: 'remark'}, 
                    { title: '角色名', dataIndex: 'roleName', key: 'roleName'}, 
                    { title: '状态', dataIndex: 'state', key: 'state'},
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
                                            url:config.RoleAdmin.urls.delete,
                                            params:{
                                                carId:record.id
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
                               _this.update('set',addons(_this.state,{
                                    Modal:{visMenu:{$set:true}}
                               }))
                            }}>菜单管理</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{
                               _this.update('set',addons(_this.state,{
                                    Modal:{visUser:{$set:true}}
                               }))
                            }}>用户关联</a>
                        </span>
                    )},

                ],
                data:[]
            },
            menuTree:{
                checkedKeys:[],
                selectedKeys:[]
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
            url:config.RoleAdmin.urls.list,
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
                    }
                }))
            }
        })
    }
    renderMenuTreeNodes(data){
        return data.map((item)=>{
            if (item.children) {
                return (
                    <Tree.TreeNode title={item.title} key={item.key} dataRef={item}>
                        {this.renderMenuTreeNodes(item.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode {...item} />;
        })
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
        const treeData = [{
            title: '0-0',
            key: '0-0',
            children: [{
                title: '0-0-0',
                key: '0-0-0',
                children: [
                    { title: '0-0-0-0', key: '0-0-0-0' },
                    { title: '0-0-0-1', key: '0-0-0-1' },
                    { title: '0-0-0-2', key: '0-0-0-2' },
                ],
            }, {
                title: '0-0-1',
                key: '0-0-1',
                children: [
                    { title: '0-0-1-0', key: '0-0-1-0' },
                    { title: '0-0-1-1', key: '0-0-1-1' },
                    { title: '0-0-1-2', key: '0-0-1-2' },
                ],
            }, {
                title: '0-0-2',
                key: '0-0-2',
            }],
        }, {
            title: '0-1',
            key: '0-1',
            children: [
                { title: '0-1-0-0', key: '0-1-0-0' },
                { title: '0-1-0-1', key: '0-1-0-1' },
                { title: '0-1-0-2', key: '0-1-0-2' },
            ],
        }, {
            title: '0-2',
            key: '0-2',
        }];
        return (
            <div className="content">
                <Breadcrumb>
                    <Breadcrumb.Item>权限管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">角色管理</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    
                </div>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <Modal title="菜单管理"
                   onOk={()=>{
                        
                   }}
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visMenu:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visMenu}>
                        <Tree
                        checkable
                        autoExpandParent={true}
                        onCheck={(checkedKeys)=>{
                            update('set',addons(state,{
                                menuTree:{
                                    checkedKeys:{
                                        $set:checkedKeys
                                    }
                                }
                            }))
                        }}
                        checkedKeys={state.menuTree.checkedKeys}
                        onSelect={(selectedKeys)=>{
                            update('set',addons(state,{
                                menuTree:{
                                    selectedKeys:{
                                        $set:selectedKeys
                                    }
                                }
                            }))
                        }}
                        selectedKeys={state.menuTree.selectedKeys}
                      >
                        {_this.renderMenuTreeNodes(treeData)}
                      </Tree>
                </Modal>
                <Modal title="用户关联"
                   onOk={()=>{
                        
                   }}
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visUser:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visUser}>
                        <Tree
                        checkable
                        autoExpandParent={true}
                        onCheck={(checkedKeys)=>{
                            update('set',addons(state,{
                                menuTree:{
                                    checkedKeys:{
                                        $set:checkedKeys
                                    }
                                }
                            }))
                        }}
                        checkedKeys={state.menuTree.checkedKeys}
                        onSelect={(selectedKeys)=>{
                            update('set',addons(state,{
                                menuTree:{
                                    selectedKeys:{
                                        $set:selectedKeys
                                    }
                                }
                            }))
                        }}
                        selectedKeys={state.menuTree.selectedKeys}
                      >
                        {_this.renderMenuTreeNodes(treeData)}
                      </Tree>
                </Modal>
                
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
