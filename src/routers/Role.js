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
                visMenu:false
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
                                Ajax.get({
                                    url:config.JurisdictionAdmin.urls.listAll,
                                    params:{},
                                    success:(data)=>{
                                        _this.update('set',addons(_this.state,{
                                            Modal:{visMenu:{$set:true}},
                                            treeData:{$set:data}
                                       }))
                                    }
                                })
                            }}>菜单管理</a>
                        </span>
                    )},

                ],
                data:[]
            },
            menuTree:{
                checkedKeys:[]
            },
            treeData:[]
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
    /**
     * @desc   树列表递归
     * @date   2019-04-09
     * @author luozhou
     * @param  {String} data    数组
     * @param  {String} i       key值
     */
    // renderMenuTreeNodes(data,i){
    //     return data.map((item,index)=>{
    //         item.key = index;
    //         if (item.children) {
    //             return (
    //                 <Tree.TreeNode id={item.id} title={item.menuName} key={item.key} dataRef={item}>
    //                     {this.renderMenuTreeNodes(item.children,item.key)}
    //                 </Tree.TreeNode>
    //             );
    //         }
    //         return <Tree.TreeNode id={item.id} key={i>=0 ? (i+'-'+index) : index} title={item.menuName} />;
    //     })
    // }
    renderMenuTreeNodes(data,i){
        return data.map((item,index)=>{
            if (item.children) {
                return (
                    <Tree.TreeNode id={item.id} title={item.menuName} key={item.key} dataRef={item}>
                        {this.renderMenuTreeNodes(item.children)}
                    </Tree.TreeNode>
                );
            }
            return <Tree.TreeNode id={item.id} key={item.key} title={item.menuName} />;
        })
    }
    /**
     * @desc   通过keys获取data里面的对应的id集合
     * @date   2019-04-09
     * @author luozhou
     * @param  {String} keys    数组
     * @param  {String} data    数组
     */
    getKeysByIds(data,keys){
        let ids = [];
        const fn = (data,keys)=>{
            data.map((el)=>{
                if(keys.indexOf(el.key)>=0){
                    ids.push(el.id)
                }
                if(el.children){
                    fn(el.children,keys)
                }
            })
        }
        fn(data,keys);
        return ids;
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
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
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visMenu:{$set:false}}}))
                   }}
                   footer={[
                    <Button onClick={()=>{
                        Ajax.post({
                            url:config.RoleAdmin.urls.addRoleToAdminUser,
                            params:{
                                ids:_this.getKeysByIds(state.treeData,state.menuTree.checkedKeys)
                            },
                            success:(data)=>{
                                _this.initIndex();
                            }
                        })
                    }} type="primary" key="1">关联到用户</Button>,
                    <Button onClick={()=>{
                        Ajax.post({
                            url:config.RoleAdmin.urls.addMenuToRole,
                            params:{
                                ids:_this.getKeysByIds(state.treeData,state.menuTree.checkedKeys)
                            },
                            success:(data)=>{
                                _this.initIndex();
                            }
                        })
                    }} type="primary" key="2">菜单权限</Button>
                   ]}
                   visible={state.Modal.visMenu}>
                        <Tree
                            checkable
                            autoExpandParent={true}
                            onCheck={(checkedKeys,checkedNodes)=>{
                                update('set',addons(state,{
                                    menuTree:{
                                        checkedKeys:{
                                            $set:checkedKeys
                                        }
                                    }
                                }))
                            }}
                            checkedKeys={state.menuTree.checkedKeys}>
                            {_this.renderMenuTreeNodes(state.treeData)}
                      </Tree>
                </Modal>
                
                
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
