import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Checkbox, Table, Divider, Tag, DatePicker, Modal, Tree, message } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseTree } from '../utils/global';
import { config } from '../utils/config';
import Cities from '../utils/Cities';
// import { createForm } from 'rc-form';

const { RangePicker } = DatePicker;
const { TreeNode } = Tree;

class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            Modal:{
               visAddUser:false,
               visAreaList:false,
               visChangePass:false,
               visRoleList:false
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
                    { title: '创建人ID', dataIndex: 'creationUserId', key: 'creationUserId'}, 
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                Ajax.get({
                                    url:config.RoleAdmin.urls.roleListByUserId,
                                    params:{
                                        userId:record.id
                                    },
                                    success:(data)=>{
                                        let roleIds = [];
                                        data.forEach((el)=>{
                                            if(el.isCheckmark==1){
                                                roleIds.push(el.id)
                                            }
                                        })
                                        _this.update('set',addons(_this.state,{
                                            Modal:{visRoleList:{$set:true}},
                                            record:{$set:record},
                                            roleList:{$set:data},
                                            roleIds:{$set:roleIds}
                                        }))
                                    }
                                })
                            }}>绑定角色</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{   
                                Ajax.get({
                                    url:config.Addres.urls.list,
                                    params:{
                                        userId:record.id
                                    },
                                    success:(data)=>{
                                        let areaValue = [];
                                        record.codes.map((el)=>{
                                            if(el.status == 0) return areaValue.push(el.code)
                                        })
                                        console.log(areaValue)
                                        _this.update('set',addons(_this.state,{
                                            Modal:{visAreaList:{$set:true}},
                                            record:{$set:record},
                                            areaTreeData:{$set:data},
                                            area:{
                                                value:{$set:areaValue}
                                            }
                                        }))
                                    }
                                })
                            }}>绑定区域</a>
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
                            <Divider type="vertical" />
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
            },
            roleList:[],
            roleIds:[],
            areaTreeData:[],
            area:{
                address:[],
                halfValue:[],
                value:[]
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
    // 渲染树节点
    renderTreeNodes(data){
        return data.map(item => {
            if (item.children) {
                return (
                    <TreeNode  
                        title={['',item.provinceName,item.cityName,item.areaName,item.street,item.communityName][item.type]} 
                        key={['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type]} 
                        dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode 
                        title={['',item.provinceName,item.cityName,item.areaName,item.street,item.communityName][item.type]} 
                        key={['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type]}
            {...item} />;
        })
    }
    // 根据key查找节点给其插入节点的子节点数据
    insertChildrenToTree(key,children){
        const fn = (data)=>{
            for(let i=0;i<data.length;i++){
                let item = data[i];
                if(['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type] == key){
                    item.children = children;
                    return;
                }
                if(item.children) fn(item.children);
            }
        }
        fn(this.state.areaTreeData);
    }
    // 通过key去找节点
    getKeysByNodes(keys,nodes){
        let arr = [];
        const fn = (data)=>{
            data.forEach((item)=>{
                if(keys.indexOf(['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type]) !=-1){
                    arr.push(item)
                }
                if(item.children) fn(item.children);
            })
        }
        fn(nodes);
        return arr;
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
                <Table rowKey={record=>record.id} pagination={state.indexTable.pagination}   
                    columns={state.indexTable.head} dataSource={state.indexTable.data} />
                <div style={{marginTop:-42,textAlign:'right'}}>
                    <span style={{paddingRight:10}}>共{ state.indexTable.pagination.total }条</span>
                </div>
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
                        <Input placeholder="请输入账号" onChange={(e)=>{
                            update('set',addons(state,{addUser:{account:{$set:e.target.value}}}))
                        }} value={state.addUser.account}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="密码" >
                        <Input placeholder="请输入密码" onChange={(e)=>{
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
                <Modal 
                    title="绑定角色" 
                    okText="确定"
                    cancelText="取消"
                    onOk={()=>{
                        Ajax.post({
                            url:config.RoleAdmin.urls.addRoleToAdminUser,
                            params:{
                                roleIds:state.roleIds,
                                userId:state.record.id
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visRoleList:{$set:false}}})
                            }
                        })
                    }}
                    onCancel={()=>{
                        update('set',addons(state,{Modal:{visRoleList:{$set:false}}}))
                    }}
                    visible={state.Modal.visRoleList}>
                    <Checkbox.Group value={state.roleIds} onChange={(values)=>{
                        update('set',addons(state,{roleIds:{$set:values}}));
                    }}>
                        {
                            state.roleList.map((el,index)=>(
                                <Checkbox key={index} value={el.id}>{el.roleName}</Checkbox>        
                            ))
                        }
                    </Checkbox.Group>
                </Modal>
                <Modal 
                    title="区域绑定" 
                    okText="确定"
                    cancelText="取消"
                    onOk={()=>{
                        Ajax.post({
                            url:config.Addres.urls.addAddresToAdminUser,
                            params:{
                                userId:state.record.id,
                                addres:state.area.address
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visAreaList:{$set:false}}})
                            }
                        })
                    }}
                    onCancel={()=>{
                        update('set',addons(state,{Modal:{visAreaList:{$set:false}}}))
                    }}
                    visible={state.Modal.visAreaList}>
                    <Tree showLine checkable 
                        checkedKeys={state.area.value}
                        onSelect={(selectedKeys,info)=>{
                            if(info.node.props.type==3){
                                Ajax.get({
                                    url:config.Addres.urls.streetList,
                                    params:{
                                        areaCode:selectedKeys[0]
                                    },
                                    success:(data)=>{
                                        _this.insertChildrenToTree(selectedKeys[0], data);
                                        update('set',addons(state,{}));
                                    }
                                })
                            }else if(info.node.props.type==4){
                                Ajax.get({
                                    url:config.Addres.urls.userCommunityListByCode,
                                    params:{
                                        code:selectedKeys[0]
                                    },
                                    success:(data)=>{
                                        console.log(selectedKeys[0], data)
                                        _this.insertChildrenToTree(selectedKeys[0], data);
                                        update('set',addons(state,{}));
                                    }
                                })
                            }
                        }}
                        onCheck={(checkedKeys,info)=>{
                            let address=[];
                            info.checkedNodes.forEach((item)=>{
                                const type = item.props.type || item.props.dataRef.type;
                                const code = item.key;
                                const ids = item.props.dataRef ? 
                                    ['',item.props.dataRef.provinceId,item.props.dataRef.cityId,item.props.dataRef.areaId,item.props.dataRef.streetId,item.props.dataRef.communityId] : 
                                    ['',item.props.provinceId,item.props.cityId,item.props.areaId,item.props.streetId,item.props.communityId];
                                address.push({
                                    status:0,
                                    type:type,
                                    code:code,
                                    id:ids[type]
                                })
                            })
                            
                            // info.halfCheckedKeys
                            _this.getKeysByNodes(info.halfCheckedKeys,state.areaTreeData).forEach((item)=>{
                                address.push({
                                    status:1,
                                    type:item.type,
                                    code:['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type],
                                    id:['',item.provinceId,item.cityId,item.areaId,item.streetId,item.communityId][item.type]
                                })
                            })

                            update('set',addons(state,{
                                area:{
                                    value:{$set:checkedKeys},
                                    halfValue:{$set:info.halfCheckedKeys},
                                    address:{$set:address}
                                }
                            }))
                        }}>
                        {_this.renderTreeNodes(state.areaTreeData)}
                    </Tree>
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
