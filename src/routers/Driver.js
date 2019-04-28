import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, Tree, message } from 'antd';
import moment from 'moment';
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
               visAdd:false
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
                    { title: '驾照年审时间', dataIndex: 'annualAuditTime', key: 'annualAuditTime'}, 
                    { title: '生日时间', dataIndex: 'birthdayTime', key: 'birthdayTime'}, 
                    { title: '合同到期时间', dataIndex: 'contractTime', key: 'contractTime'}, 
                    { title: '创建人id', dataIndex: 'creationRole', key: 'creationRole'}, 
                    { title: '驾龄', dataIndex: 'driverAge', key: 'driverAge'}, 
                    { title: '驾驶证编号', dataIndex: 'driverNumber', key: 'driverNumber'}, 
                    { title: '驾驶证类型', dataIndex: 'drivingLicenceType', key: 'drivingLicenceType',render:(text)=>(
                    	['','A1','A2','A3','B1','B2','C1','C2','C3','C4','D','E','F','M','N','P'][text]
                    )}, 
                    { title: '驾照到期时间', dataIndex: 'drivingLicenseTime', key: 'drivingLicenseTime'}, 
                    { title: '入职时间', dataIndex: 'entryTime', key: 'entryTime'}, 
                    { title: '司机id', dataIndex: 'id', key: 'id'},
                    { title: '保险到期时间', dataIndex: 'insuranceTime', key: 'insuranceTime'},
                    { title: '是否在工作用', dataIndex: 'isWork', key: 'isWork',render:(text)=>(
                    	['','是','否'][text]
                    )},
                    { title: '司机名字', dataIndex: 'name', key: 'name'},
                    { title: '总收运重量', dataIndex: 'wumWeight', key: 'wumWeight'},
                    { title: '手机号码', dataIndex: 'tel', key: 'tel'},
                    { title: '最后修改时间', dataIndex: 'updateTime', key: 'updateTime'},
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
                                            url:config.Driver.urls.delete,
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
                                _this.update('set',addons(_this.state,{
		               				Modal:{visAdd:{$set:true}},
		               				editorType:{$set:'update'},
		               				record:{$set:record},
		               				newRecord:{
						            	annualAuditTime:{$set:record.annualAuditTime},
										contractTime:{$set:record.contractTime},
										driverAge:{$set:record.driverAge},
										driverNumber:{$set:record.driverNumber},
										drivingLicenceType:{$set:record.drivingLicenceType},
										drivingLicenseTime:{$set:record.drivingLicenseTime},
										entryTime:{$set:record.entryTime},
										name:{$set:record.name},
										tel:{$set:record.tel},
										imei:{$set:record.imei},
						            }
		               			}))
                            }}>修改</a>
                        </span>
                    )},

                ],
                data:[]
            },
            toolbarParams:{
            	tel:'',
            	driverNumber:'',
            	name:'',
            	drivingLicenceType:'',
            	startTime:'',
            	endTime:'',
            	isWork:''
            },
            editorType:'add',
            newRecord:{
            	annualAuditTime:'',
				contractTime:'',
				driverAge:'',
				driverNumber:'',
				drivingLicenceType:'1',
				drivingLicenseTime:'',
				entryTime:'',
				name:'',
				tel:'',
				imei:''
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
            url:config.Driver.urls.list,
            params:{
            	tel:params.tel||'',
            	driverNumber:params.driverNumber||'',
            	name:params.name||'',
            	drivingLicenceType:params.drivingLicenceType||'',
            	startTime:params.startTime||'',
            	endTime:params.endTime||'',
            	isWork:params.isWork||''
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
            sm: { span: 8 },
          },
          wrapperCol: {
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
                    <Button onClick={()=>{
                    	update('set',addons(state,{
               				Modal:{visAdd:{$set:true}},
               				editorType:{$set:'add'},
               				newRecord:{
				            	annualAuditTime:{$set:''},
								contractTime:{$set:''},
								driverAge:{$set:''},
								driverNumber:{$set:''},
								drivingLicenceType:{$set:'1'},
								drivingLicenseTime:{$set:''},
								entryTime:{$set:''},
								name:{$set:''},
								tel:{$set:''},
								imei:{$set:''},
				            }
               			}))
                    }} type="primary">添加司机</Button>
                </div>
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
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                driverNumber:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.driverNumber} 
                    placeholder="请输入驾驶证编号"
                    addonBefore={<span>驾驶证编号</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                name:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.name} 
                    placeholder="请输入司机名字"
                    addonBefore={<span>司机名字</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
                    驾驶证类型：<Select defaultValue="" onChange={(value)=>{
                    	state.toolbarParams.drivingLicenceType = value;
                    	_this.initIndex();
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>    
                        <Select.Option value="1">A1</Select.Option>    
                        <Select.Option value="2">A2</Select.Option>    
                        <Select.Option value="3">A3</Select.Option>    
                        <Select.Option value="4">B1</Select.Option>    
                        <Select.Option value="5">B2</Select.Option>    
                        <Select.Option value="6">C1</Select.Option>    
                        <Select.Option value="7">C2</Select.Option>    
                        <Select.Option value="8">C3</Select.Option>    
                        <Select.Option value="9">C4</Select.Option>    
                        <Select.Option value="10">D</Select.Option>    
                        <Select.Option value="11">E</Select.Option>    
                        <Select.Option value="12">F</Select.Option>    
                        <Select.Option value="13">M</Select.Option>    
                        <Select.Option value="14">N</Select.Option>    
                        <Select.Option value="15">P</Select.Option>    
                    </Select>
                    创建时间搜索：
                    <RangePicker onChange={(date,dateString)=>{
                        state.toolbarParams.createTimeStart = dateString[0];
                        state.toolbarParams.createTimeEnd = dateString[1];
                        _this.initIndex();
                    }} />
                    工作状态：<Select defaultValue="" onChange={(value)=>{
                    	state.toolbarParams.isWork = value;
                    	_this.initIndex();
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="">全部</Select.Option>    
                        <Select.Option value="1">是</Select.Option>    
                        <Select.Option value="2">否</Select.Option>    
                    </Select>
                </div>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
               	<Modal title={state.editorType=='add'?'添加司机':'修改司机信息'}
               		okText="确定"
               		cancelText="取消"
               		onOk={()=>{
               			let url = '';
               			let params = {
               				...state.newRecord
               			};
               			if(state.editorType == 'add'){
               				url = config.Driver.urls.add;
               			}
               			if(state.editorType == 'update'){
               				url = config.Driver.urls.update;
               				params.id = state.record.id;
               			}
               			if(!/^1\d{10}$/.test(params.tel)) return message.info('请输入正确的手机号码');
               			if(params.imei.length != 15) return message.info('请输入正确的15位数组imei号码');
               			Ajax.post({
	                        url,
	                        params,
	                        success:(data)=>{
	                            _this.initIndex({
	                                Modal:{visAdd:{$set:false}}
	                            });
	                        }
	                    })    
               		}}
               		onCancel={()=>{
               			update('set',addons(state,{
               				Modal:{visAdd:{$set:false}}
               			}))
               		}}
               		visible={state.Modal.visAdd}>
               		<Form.Item {...formItemLayout} label="驾驶证编号" > 
                        <Input type="text" value={state.newRecord.driverNumber} onChange={(e)=>{
                            update('set',addons(state,{
                                newRecord:{
                                    driverNumber:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="请输入手机号码" > 
                        <Input type="text" value={state.newRecord.tel} onChange={(e)=>{
                            update('set',addons(state,{
                                newRecord:{
                                    tel:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="驾龄" > 
                        <Input type="text" value={state.newRecord.driverAge} onChange={(e)=>{
                            update('set',addons(state,{
                                newRecord:{
                                    driverAge:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="驾驶证类型" > 
                        <Select value={state.newRecord.drivingLicenceType} onChange={(value)=>{
	                    	update('set',addons(state,{
	                    		newRecord:{
	                    			drivingLicenceType:{$set:value}
	                    		}
	                    	}))
	                    }} style={{ width: 120, marginRight:10 }}>
	                        <Select.Option value="1">A1</Select.Option>    
	                        <Select.Option value="2">A2</Select.Option>    
	                        <Select.Option value="3">A3</Select.Option>    
	                        <Select.Option value="4">B1</Select.Option>    
	                        <Select.Option value="5">B2</Select.Option>    
	                        <Select.Option value="6">C1</Select.Option>    
	                        <Select.Option value="7">C2</Select.Option>    
	                        <Select.Option value="8">C3</Select.Option>    
	                        <Select.Option value="9">C4</Select.Option>    
	                        <Select.Option value="10">D</Select.Option>    
	                        <Select.Option value="11">E</Select.Option>    
	                        <Select.Option value="12">F</Select.Option>    
	                        <Select.Option value="13">M</Select.Option>    
	                        <Select.Option value="14">N</Select.Option>    
	                        <Select.Option value="15">P</Select.Option>    
	                    </Select>
                    </Form.Item>
                    
                    <Form.Item {...formItemLayout} label="司机名字" > 
                        <Input type="text" value={state.newRecord.name} onChange={(e)=>{
                            update('set',addons(state,{
                                newRecord:{
                                    name:{$set:e.target.value}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="入职时间" > 
                        <DatePicker value={moment(state.newRecord.entryTime||new Date().toLocaleDateString(), 'YYYY/MM/DD')} onChange={(date,dateString)=>{
                        	console.log(dateString)
                        	// update('set',addons(state,{
                        	// 	newRecord:{
                        	// 		entryTime:{$set:dateString}
                        	// 	}
                        	// }))
                        }} />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="合同到期时间" > 
                        <DatePicker value={moment(state.newRecord.contractTime||new Date().toLocaleDateString(), 'YYYY/MM/DD')} onChange={()=>{

                        }} />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="驾驶证年审时间" > 
                        <DatePicker value={moment(state.newRecord.annualAuditTime||new Date().toLocaleDateString(), 'YYYY/MM/DD')} onChange={()=>{

                        }} />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="驾驶证到期时间" > 
                        <DatePicker value={moment(state.newRecord.drivingLicenseTime||new Date().toLocaleDateString(), 'YYYY/MM/DD')} onChange={()=>{

                        }} />
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="绑定的环卫车IMEI编号" > 
                        <Input type="text" value={state.newRecord.imei} onChange={(e)=>{
                            update('set',addons(state,{
                                newRecord:{
                                    imei:{$set:e.target.value}
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
