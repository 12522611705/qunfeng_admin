import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Upload, LocaleProvider,
    Divider, Tag, DatePicker, Modal, message } from 'antd';

import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, formatSearch, parseSearch } from '../utils/global';
import { config } from '../utils/config';

// 组件
import Cascader from '../components/Cascader';

// import { createForm } from 'rc-form';
import BMap  from 'BMap';
const BMAP_NORMAL_MAP =window.BMAP_NORMAL_MAP;
const BMAP_HYBRID_MAP = window.BMAP_HYBRID_MAP;

const { RangePicker } = DatePicker;

class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
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
        this.update = update.bind(this);
        this.state = {
            permission:{
                add:false,
                update:false,
                list:false,
            },
            Modal :{
                visCate:false
            },
            queryList:[],
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
                    { title: 'ID', dataIndex: 'id', key: 'id'}, 
                    { title: '种类', dataIndex: 'className', key: 'className'}, 
                    { title: '种类编号', dataIndex: 'number', key: 'number'}, 
                    { title: '环保金', dataIndex: 'price', key: 'price'}, 
                    { title: '绿色贡献值', dataIndex: 'lvs', key: 'lvs'}, 
                    { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime'}, 
                    { title: '操作人员', dataIndex: 'adminRole', key: 'adminRole'}, 
                    { title: '操作人员ID', dataIndex: 'adminRoleId', key: 'adminRoleId'}, 
                    { title: '查看详情', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        !_this.state.permission.details?
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                Modal.info({
                                    title: '更多信息',
                                    content: (
                                      <div>
                                        <Form.Item {...formItemLayout} label='省'>
                                            {record.pro||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='市'>
                                            {record.city||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='区'>
                                            {record.area||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='街道'>
                                            {record.street||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='社区'>
                                            {record.community||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='电话'>
                                            {record.tel||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='设备类型'>
                                            {['','办公室','移动称'][record.type]||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='种类编号'>
                                            {record.garbageNumber||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='权属单位'>
                                            {record.company||'--'}
                                        </Form.Item>
                                      </div>
                                    ),
                                });
                            }}>点击查看</a>
                        </span>:''
                    )},
                    { title: '备注', dataIndex: 'remark', key: 'remark'}, 
                ],
                data:[]
            },
            toolbarParams:{
                carName:'',
                // driverName:'',
                carNumber:'',
                imei:'',
                pro:'',
                city:'',
                area:'',
                street:'',
                type:'',
                adminRole:'',
                tel:''
            },
            Modal:{
                visRecord:false,
                visBmap:false
            },
            recordType:'add',
            record:{},
            newRecord:{
                
            },
            form:{

            }
        }
    }
    componentDidMount(){
        this.initIndex()
        this.initPermission()
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
                    _this.state.permission[config.Category.permission[el.url]] = true;
                })
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
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.Category.urls.list,
                params:{
                    page:_this.state.indexTable.pagination.current||1,
                    pageSize:_this.state.indexTable.pagination.pageSize||10,
                    ...params,
                    startTime:new Date(params.startTime).getTime()||'',//开始时间
                    endTime:new Date(params.endTime).getTime()||'',//结束时间
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
                    resolve();
                }
            })
        })
    }
    /**
     * @desc   修改密码
     * @date   2019-04-08
     * @author luozhou
     * @param  {String} key   需要修改的信息的key
     * @param  {String} value 对应key的值
     */
    updateNewRecord(key,value){
        this.update('set',addons(this.state,{
            newRecord:{
                [key]:{
                    $set:value
                }
            }
        }))
    }
    cate(){
        const _this = this;
        let url = '';
        let postData = {};
        if(_this.state.type=='add'){
            url = config.Category.urls.add;
            postData={
                ..._this.state.form,
            }
        }else if(_this.state.type=='update'){
            url = config.Category.urls.update;
            postData={
                ..._this.state.form,
                id:_this.state.indexTable.selectedRowKeys[0]
            }
        }
        Ajax.post({
            url,
            params:postData,
            success:(data)=>{
                _this.initIndex({
                    Modal:{
                        visCate:{$set:false}
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
                    <Breadcrumb.Item>垃圾分类设备管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">回收记录列表</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                className:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.className} 
                    placeholder="请输入种类名称"
                    addonBefore={<span>种类名称</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                number:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.number} 
                    placeholder="请输入种类编号"
                    addonBefore={<span>种类编号</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                facilityNumber:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.facilityNumber} 
                    placeholder="请输入设备编号"
                    addonBefore={<span>设备编号</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
                    
                </div>
                
                <div className="main-toolbar">
                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminRole:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.adminRole} 
                    placeholder="请输入操作人员"
                    addonBefore={<span>操作人员</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminRoleId:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.adminRoleId} 
                    placeholder="请输入操作人员ID"
                    addonBefore={<span>操作人员ID</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} />

                </div>
                <div className="main-toolbar">
                    更新时间：
                    <LocaleProvider locale={zh_CN}>
                        <RangePicker value={state.toolbarParams.startTime ? [moment(state.toolbarParams.startTime, 'YYYY/MM/DD'),moment(state.toolbarParams.endTime, 'YYYY/MM/DD')] : []} onChange={(date,dateString)=>{
                            // state.toolbarParams.startTime = dateString[0];
                            // state.toolbarParams.endTime = dateString[1];
                            update('set',addons(state,{
                                toolbarParams:{
                                    startTime:{
                                        $set:dateString[0]
                                    },
                                    endTime:{
                                        $set:dateString[1]
                                    }    
                                }
                            }))
                            // _this.initIndex();
                        }} />
                    </LocaleProvider>
                </div>

                <div className="main-toolbar">
                    详细地址：
                    <Cascader data={state.toolbarParams} onChange={(data)=>{
                        console.log(data)
                        update('set',addons(state,{
                            toolbarParams:{
                                pro:{$set:data.pro},
                                city:{$set:data.city},
                                area:{$set:data.area},
                                street:{$set:data.street}
                            }
                        }))
                    }}/>
                </div>
                <div className="main-toolbar">
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.state.Modal.visCate = true;
                        _this.state.type = 'add';
                        _this.state.form = {
                            
                        }
                        _this.setState({});
                    }}>增加</Button>

                    {
                        state.permission.update?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行修改');
                            if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行修改');
                            _this.state.Modal.visCate = true;
                            _this.state.type = 'update';
                            let record = {};
                            _this.state.indexTable.data.forEach((el)=>{
                                if(el.id == _this.state.indexTable.selectedRowKeys[0]){
                                    record = el;
                                }
                            })
                            _this.state.form = {
                                pro:record.pro,
                                city:record.city,
                                area:record.area,
                                street:record.street,
                                className:record.className,
                                company:record.company,
                                index:record.index,
                                lvs:record.lvs,
                                number:record.number,
                                price:record.price,
                                remark:record.remark,
                                tel:record.tel,
                                type:record.type,
                                imei:record.imei
                            }
                            _this.setState({});
                        }}>修改</Button>:''
                    }    

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.urls.exportCategoryExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
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

                <Modal title="回收价格管理"
                  width = '680px'
                  visible={state.Modal.visCate}
                  onOk={_this.cate.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visCate:{$set:false}}
                    }))
                  }}
                >
                    <Form.Item {...formItemLayout} label='详细地址'>
                        <Cascader data={state.form} onChange={(data)=>{
                            update('set',addons(state,{
                                form:{
                                    pro:{$set:data.pro},
                                    city:{$set:data.city},
                                    area:{$set:data.area},
                                    street:{$set:data.street}
                                }
                            }))
                        }}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='种类名称'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'className')
                        }} type="text" value={state.form.className}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='权属单位'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'company')
                        }} type="text" value={state.form.company}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='绿色贡献值'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'lvs')
                        }} type="text" value={state.form.lvs}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='种类编号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'number')
                        }} type="text" value={state.form.number}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='环保金'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'price')
                        }} type="text" value={state.form.price}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'remark')
                        }} type="text" value={state.form.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='电话'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'tel')
                        }} type="text" value={state.form.tel}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='设备类型'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'type')
                        }} style={{width:200}} value={state.form.type}>
                            <Select.Option value="1">办公室</Select.Option>
                            <Select.Option value="2">移动称</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item {...formItemLayout} label='IMEI号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'imei')
                        }} type="text" value={state.form.imei}/>
                    </Form.Item>
                </Modal>


            </div>
        );
    }
}
const App = withRouter(component);
export default App;
