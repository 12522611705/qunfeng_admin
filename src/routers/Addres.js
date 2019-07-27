import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, Tree } from 'antd';

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
const { TreeNode } = Tree;


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            Modal:{
                visAdd:false,
            },
            area:{
                value:[],
                address:[],
                type:'',
                id:'',
                halfValue:[],
                editorStatus:'add',
                parentCode:''
            },
            areaTreeData:[]
        }
    }
    componentDidMount(){
        this.initIndex()
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
    }
    // 添加省市区
    add(node,eve){
        eve.stopPropagation();
        const parentCode = ['',node.provinceCode,node.cityCode,node.areaCode,node.streetCode,node.communityCode][node.type-1];
        const type = node.type;

        this.update('set',addons(this.state,{
            Modal:{
                visAdd:{
                    $set:true
                }
            },
            area:{
                editorStatus:{$set:'add'},
                type:{$set:type},
                text:{$set:''},
                parentCode:{$set:parentCode}
            }
        }))

    }
    // 删除省市区
    del(node,eve){
        eve.stopPropagation();
        const _this = this;
        Modal.confirm({
            title:"你确定要删除此节点吗",
            okText:'确定',
            cancelText:'取消',
            onOk(){
                Ajax.post({
                    url:config.Addres.urls.delete,
                    params:{
                        id:['',node.provinceId,node.cityId,node.areaId,node.streetId,node.communityId][node.type],
                        type:node.type
                    },
                    success:(data)=>{
                        _this.initIndex();
                    }
                })
            }
        })
    }
    // 修改省市区
    editor(node,eve){
        eve.stopPropagation();
        const type = node.type;
        this.update('set',addons(this.state,{
            Modal:{
                visAdd:{
                    $set:true
                }
            },
            area:{
                editorStatus:{$set:'editor'},
                type:{$set:type},
                text:{$set:['',node.provinceName,node.cityName,node.areaName,node.street][node.type]},
                id:{$set:['',node.provinceId,node.cityId,node.areaId,node.streetId,node.communityId][node.type]}
            }
        }))
    }
    // 增加社区
    addComm(node,oldType,eve){
        eve.stopPropagation();
        const type = node.type;
        const parentCode = ['',node.provinceCode,node.cityCode,node.areaCode,node.streetCode,node.communityCode][type-1];
        const code = ['',node.provinceCode,node.cityCode,node.areaCode,node.streetCode,node.communityCode][type];

        this.update('set',addons(this.state,{
            Modal:{
                visAdd:{
                    $set:true
                }
            },
            area:{
                editorStatus:{$set:'add'},
                type:{$set: type && oldType},
                text:{$set:''},
                parentCode:{$set:oldType ? code : parentCode}
            }
        }))
    }
    // 渲染树节点
    renderTreeNodes(data){
        const _this = this;
        return data.map(item => {
            if (item.children) {
                return (
                    <TreeNode  
                        title={[['',item.provinceName,item.cityName,item.areaName,item.street,item.communityName][item.type],<span key="1" style={{position:'absolute',left:300}}>
                            <a onClick={_this.add.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">增加</a>
                            {
                                item.type == 4 ?
                                <a onClick={_this.addComm.bind(_this,item,5)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">增加社区</a>:''
                            }
                            <a onClick={_this.editor.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">编辑</a>
                            <a onClick={_this.del.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">删除</a>
                        </span>]} 
                        key={['',item.provinceCode,item.cityCode,item.areaCode,item.streetCode,item.communityCode][item.type]} 
                        dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode 
                        title={[['',item.provinceName,item.cityName,item.areaName,item.street,item.communityName][item.type],<span key="1" style={{position:'absolute',left:300}}>
                            <a onClick={_this.add.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">增加</a>
                            {
                                item.type == 4 ?
                                <a onClick={_this.addComm.bind(_this,item,5)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">增加社区</a>:''
                            }
                            <a onClick={_this.editor.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">编辑</a>
                            <a onClick={_this.del.bind(_this,item)} style={{color:'#1890ff',marginRight:10}} href="javascript:;">删除</a>
                        </span>]} 
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
    /*
     *  初始化页面数据
     */
    initIndex(updateParams){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.list,
            params:{},
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    areaTreeData:{$set:data},
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
                    <Breadcrumb.Item><a href="javascript:;">区域管理</a></Breadcrumb.Item>
                </Breadcrumb>
                <Tree showLine checkable 
                    value={state.area.value}
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
                                type:type,
                                code:code,
                                id:ids[type]
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
                <Modal title="添加" visible={state.Modal.visAdd} 
                onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{
                            visAdd:{$set:false}
                        }
                    }))
                }}
                okText="确定"
                cancelText="取消"
                onOk={()=>{
                    let url = '';
                    let params = '';
                    if(state.area.editorStatus == 'add'){
                        url = config.Addres.urls.add;
                        params = {
                            name:state.area.text,
                            type:state.area.type,
                            parentCode:state.area.parentCode
                        }
                    }else if(state.area.editorStatus == 'editor'){
                        url = config.Addres.urls.update;
                        params = {
                            name:state.area.text,
                            type:state.area.type,
                            id:state.area.id
                        }
                    }
                    Ajax.post({
                        url,
                        params,
                        success:(data)=>{
                            _this.initIndex({
                                Modal:{
                                    visAdd:{$set:false}
                                }
                            });
                        }
                    })
                }}>
                    <Form.Item {...formItemLayout} label="名字" > 
                        <Input type="text" value={state.area.text} onChange={(e)=>{
                            update('set',addons(state,{
                                area:{
                                    text:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    
                </Modal>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
