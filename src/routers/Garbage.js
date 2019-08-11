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
const BMAP_NORMAL_MAP = window.BMAP_NORMAL_MAP;
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
                importExcelGarbage:false,
                list:false,
            },
            Modal :{
                visCate:false,
                visBmap:false
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
                    { title: '设备类型', dataIndex: 'type', key: 'type',render:(text)=>(
                        ['','办公室回收箱','移动称'][text]
                    )}, 
                    { title: '设备编号', dataIndex: 'number', key: 'number'}, 
                    { title: 'IMEI号', dataIndex: 'imei', key: 'imei'}, 
                    { title: '辖区管理部门', dataIndex: 'section', key: 'section'}, 
                    { title: '权属单位', dataIndex: 'company', key: 'company'}, 
                    { title: '装满', dataIndex: 'distance', key: 'distance',render:(text)=>(
                        ['','满','空'][text]
                    )}, 
                    { title: '位置', dataIndex: 'aaa', key: 'aaa',render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            _this.update('set',addons(_this.state,{
                                Modal:{
                                    visBmap:{
                                        $set:true
                                    }
                                },
                            }));
                            setTimeout(()=>{
                                let map = new BMap.Map("allmap");

                                let point = new BMap.Point(record.lon, record.lat);

                                map.centerAndZoom(point, 30);   //初始化地图,设置中心点坐标和地图级别

                                let gc = new BMap.Geocoder();

                                let marker = new BMap.Marker(point);  // 创建标注
                                map.addOverlay(marker);

                                gc.getLocation(point, function (rs) {
                                    var addComp = rs.addressComponents;
                                    
                                    let label = new BMap.Label(`
                                        <div>
                                            <p>设备编号：${record.number}</p>
                                            <p>设备类型：${['','办公室回收箱','移动称'][record.type]||''}</p>
                                            <p>权属单位：${record.company}</p>
                                            <p>今日收集垃圾量：${record.weight||''}</p>
                                            <p>实时位置：${record.community}</p>
                                            <p>时间：${new Date().toLocaleString()}</p>
                                        </div>
                                    `,{offset:new BMap.Size(20,-10)});
                                    label.setStyle({
                                        padding:'10px 5px',
                                        marginTop:'-130px',
                                        backgroundColor: 'rgba(0,255,60,0.7)',
                                    })
                                    marker.setLabel(label);
                                });
                            },100)
                            
                        }}>点击查看</a>
                    )}, 
                    { title: '设备管理员', dataIndex: 'adminRole', key: 'adminRole'}, 
                    { title: '更多信息', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
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
                                        <Form.Item {...formItemLayout} label='详细地址'>
                                            {record.address||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='温度'>
                                            {record.temperature||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='电量'>
                                            {record.electric||'--'}
                                        </Form.Item>
                                        <Form.Item {...formItemLayout} label='备注'>
                                            {record.remark||'--'}
                                        </Form.Item>
                                      </div>
                                    ),
                                });
                            }}>查看更多</a>
                        </span>:''
                    )}
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
                    _this.state.permission[config.Garbage.permission[el.url]] = true;
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
                url:config.Garbage.urls.list,
                params:{
                    page:_this.state.indexTable.pagination.current||1,
                    pageSize:_this.state.indexTable.pagination.pageSize||10,
                    ...params
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
            url = config.Garbage.urls.add;
            postData={
                ..._this.state.form,
            }
        }else if(_this.state.type=='update'){
            url = config.Garbage.urls.update;
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
                    <Breadcrumb.Item><a href="javascript:;">设备管理</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    
                    设备类型：<Select value={state.toolbarParams.type} style={{ width: 120, marginRight:10 }} onChange={(value)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                type:{
                                    $set:value    
                                }
                            }
                        }))
                    }}>
                        <Select.Option value="">全部</Select.Option>
                        <Select.Option value="1">办公室回收箱</Select.Option>
                        <Select.Option value="2">移动称</Select.Option>
                    </Select>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                number:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.number} 
                    placeholder="请输入设备编号"
                    addonBefore={<span>设备编号</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                imei:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.imei} 
                    placeholder="请输入IMEI号"
                    addonBefore={<span>IMEI号</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />
                    
                </div>
                
                <div className="main-toolbar">
                    
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                section:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.section} 
                    placeholder="请输入辖区部门"
                    addonBefore={<span>辖区管理部门</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                company:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.company} 
                    placeholder="请输入权属单位"
                    addonBefore={<span>权属单位</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                adminRole:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.adminRole} 
                    placeholder="请输入设备管理员"
                    addonBefore={<span>设备管理员</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                tel:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.tel} 
                    placeholder="请输入联系电话"
                    addonBefore={<span>联系电话</span>} 
                    style={{ width: 200, marginRight: 10, marginBottom:10 }} />

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
                    {
                        state.permission.add?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            _this.state.Modal.visCate = true;
                            _this.state.type = 'add';
                            _this.state.form = {
                                
                            }
                            _this.setState({});
                        }}>增加</Button>:''
                    }


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
                            _this.state.form = record;
                            _this.setState({});
                        }}>修改</Button>:''
                    }    

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    {
                        state.permission.delete ?
                        <Button style={{marginRight:10}} type="primary" onClick={()=>{
                            // if(_this.state.indexTable.selectedRowKeys.length>1) return message.info('只能选择一个进行删除');
                            // if(_this.state.indexTable.selectedRowKeys.length<1) return message.info('请选择一个进行删除');
                            Modal.confirm({
                                title:'提示',
                                content:'你确定要删除吗？',
                                okText:'确定',
                                cancelText:'取消',
                                onOk(){
                                    Ajax.post({
                                        url:config.Garbage.urls.delete,
                                        params:{
                                            ids:_this.state.indexTable.selectedRowKeys
                                        },
                                        success:(data)=>{
                                            _this.initIndex();
                                        }
                                    })
                                }
                            })
                        }}>删除</Button>:''
                    }

                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.urls.exportGarbageExcel+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>

                    {
                        state.permission.importExcelGarbage ?
                        <Upload name="file" 
                            style={{display:'inline'}}
                            className="myupdate"
                            headers={{ 
                                token:localStorage.getItem('token')
                            }}
                            action="http://118.190.145.65:8888/flockpeak-shop/admin/garbageAdmin/importExcelGarbage" 
                            onChange={(info)=>{
                                if(info.file.response && info.file.response.code) {
                                    message.info(info.file.response.msg);
                                }
                                _this.initIndex();
                            }}>
                            <Button style={{marginRight:10}} type="primary">数据导入</Button>
                        </Upload>:''    
                    }

                    
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

                <Modal title="设备管理"
                  width = '680px'
                  cancelText="取消"
                  okText="确定"
                  visible={state.Modal.visCate}
                  onOk={_this.cate.bind(_this)}
                  onCancel={()=>{
                    update('set',addons(state,{
                        Modal:{visCate:{$set:false}}
                    }))
                  }}>
                    
                    <Form.Item {...formItemLayout} label='地址'>
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
                    <Form.Item {...formItemLayout} label='详细地址'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'address')
                        }} type="text" value={state.form.address}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='设备类型'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'type')
                        }} style={{width:200}} value={state.form.type}>
                            <Select.Option value="1">办公室</Select.Option>
                            <Select.Option value="2">移动称</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='设备编号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'number')
                        }} type="text" value={state.form.number}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='IMEI号'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'imei')
                        }} type="text" value={state.form.imei}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='设备管理员'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'adminRole')
                        }} type="text" value={state.form.adminRole}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='联系电话'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'tel')
                        }} type="text" value={state.form.tel}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='温度'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'temperature')
                        }} type="text" value={state.form.temperature}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='电量'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'electric')
                        }} type="text" value={state.form.electric}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='装满'>
                        <Select onChange={(value)=>{
                            _this.updateForm(value,'distance')
                        }} style={{width:200}} value={state.form.distance}>
                            <Select.Option value="1">满</Select.Option>
                            <Select.Option value="2">空</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='权属单位'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'company')
                        }} type="text" value={state.form.company}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='备注'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'remark')
                        }} type="text" value={state.form.remark}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label='辖区管理部门'>
                        <Input onChange={(e)=>{
                            _this.updateForm(e.target.value,'section')
                        }} type="text" value={state.form.section}/>
                    </Form.Item>
                </Modal>
                <Modal title="设备状态"
                   onOk={()=>{
                        
                   }}
                   width={600}
                   onCancel={()=>{
                    update('set',addons(state,{Modal:{visBmap:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visBmap}>
                    <div style={{height:"400px"}} id={"allmap"}></div>
                </Modal>

            </div>
        );
    }
}
const App = withRouter(component);
export default App;
