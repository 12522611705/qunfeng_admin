import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, Tree } from 'antd';

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
            permission:{
                roleAdminList:false,
                roleAdminDelete:false,
                roleAdminAddMenuToRole:false,
                roleAdminAddRoleToAdminUser:false,
                roleAdminDetails:false,
                jurisdictionAdminList:false,
                jurisdictionAdminListAll:false,
                roleAdminAddRole:false,
                roleAdminRoleListByUserId:false,
                adminAddresAddAddresToAdminUser:false,
            },
            Modal:{
                visMenu:false,
                visAddRole:false
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
                                            Ajax.get({
                                                url:config.RoleAdmin.urls.details,
                                                params:{
                                                    roleId:record.id
                                                },
                                                success:(checkIds)=>{
                                                    let ids = [];
                                                    checkIds.forEach((el)=>{
                                                        if(el.status==0){
                                                            ids.push(el.id)    
                                                        }
                                                    })
                                                    _this.update('set',addons(_this.state,{
                                                        Modal:{visMenu:{$set:true}},
                                                        treeData:{$set:data},
                                                        menuTree:{
                                                            checkedKeys:{$set:_this.getIdsByKeys(data,ids)}
                                                        },
                                                        record:{$set:record}
                                                   }))
                                                }
                                            })
                                        }
                                    })
                                }}>添加菜单到角色</a>
                        </span>
                    )},

                ],
                data:[]
            },
            menuTree:{
                checkedKeys:[],
                halfValue:[]
            },
            treeData:[],
            addRole:{
                remark:'',
                roleName:''
            }
        }
    }
    componentDidMount(){
        this.initIndex();
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
                    _this.state.permission[config.RoleAdmin.permission[el.url]] = true;
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
                    },
                    ...updateParams
                }))
            }
        })
    }
    // 渲染树子节点
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
     * @param  {Array}  keys    数组
     * @param  {Array}  data    数组
     * @param  {String} data    id字符串
     */
    getKeysByIds(data,keys,halfKeys){
        let ids = [];
        const fn = (data,keys,halfKeys)=>{
            data.map((el)=>{
                if(keys.indexOf(el.key)>=0){
                    ids.push({
                        menuId:el.id,
                        status:0
                    })
                }
                if(halfKeys.indexOf(el.key)>=0){
                    ids.push({
                        menuId:el.id,
                        status:1
                    })
                }
                if(el.children){
                    fn(el.children,keys,halfKeys)
                }
            })
        }
        fn(data,keys,halfKeys);
        return ids;
    }
    /**
     * @desc   通过keys获取data里面的对应的id集合
     * @date   2019-04-09
     * @author luozhou
     * @param  {Array}  ids    数组
     * @param  {Array}  data    数组
     * @param  {String} data    id字符串
     */
    getIdsByKeys(data,ids,keyType='key'){
        let keys = [];
        const fn = (data,ids)=>{
            data.map((el)=>{
                if(ids.indexOf(el.id)>=0){
                    keys.push(el[keyType])
                }
                if(el.children){
                    fn(el.children,ids)
                }
            })
        }
        fn(data,ids);
        return keys;
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
                    <Breadcrumb.Item><a href="javascript:;">角色管理</a></Breadcrumb.Item>
                </Breadcrumb>
                
                <div className="main-toolbar">
                    <Button onClick={()=>{
                        update('set',addons(state,{
                            Modal:{visAddRole:{$set:true}}
                        }))
                    }} type="primary">添加角色</Button>
                </div>
                
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination}  
                    columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
                <Modal title="菜单列表"
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visMenu:{$set:false}}}))
                   }}
                   footer={[
                    <Button onClick={()=>{
                        Ajax.post({
                            url:config.RoleAdmin.urls.addMenuToRole,
                            params:{
                                menuIds:_this.getKeysByIds(state.treeData,state.menuTree.checkedKeys,state.menuTree.halfValue),
                                roleId:state.record.id
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visMenu:{$set:false}}});
                            }
                        })
                    }} type="primary" key="2">确定</Button>
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
                                        },
                                        halfValue:{
                                            $set:checkedNodes.halfCheckedKeys
                                        }
                                    }
                                }))
                            }}
                            checkedKeys={state.menuTree.checkedKeys}>
                            {_this.renderMenuTreeNodes(state.treeData)}
                      </Tree>
                </Modal>
                <Modal title="添加角色"
                   onCancel={()=>{
                        update('set',addons(state,{Modal:{visAddRole:{$set:false}}}))
                   }}
                   footer={[
                    <Button onClick={()=>{
                        Ajax.post({
                            url:config.RoleAdmin.urls.addRole,
                            params:{
                                remark:state.addRole.remark,
                                roleName:state.addRole.roleName
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visAddRole:{$set:false}}});
                            }
                        })
                    }} type="primary" key="2">确定</Button>
                   ]}
                   visible={state.Modal.visAddRole}>
                        <Form.Item {...formItemLayout} label="角色名" >
                            <Input placeholder="请输入角色名" onChange={(e)=>{
                                update('set',addons(state,{addRole:{roleName:{$set:e.target.value}}}))
                            }} value={state.addRole.roleName}/>
                        </Form.Item>
                        <Form.Item {...formItemLayout} label="备注" >
                            <Input placeholder="请填写备注信息" onChange={(e)=>{
                                update('set',addons(state,{addRole:{remark:{$set:e.target.value}}}))
                            }} value={state.addRole.remark}/>
                        </Form.Item>
                </Modal>
                
                
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
