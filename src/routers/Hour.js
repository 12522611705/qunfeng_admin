import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Table, Divider, message, Upload,
        Tag, DatePicker, LocaleProvider, Modal, Form } from 'antd';
import moment from 'moment';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';
// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseSearch, formatSearch } from '../utils/global';
import { config } from '../utils/config';

// 组件
import Cascader from '../components/Cascader';
// import { createForm } from 'rc-form';


const echarts = require('echarts/lib/echarts');
require('echarts/lib/chart/line');
require('echarts/lib/component/grid');
require('echarts/lib/component/legend');
require('echarts/lib/chart/pie');
require('echarts/lib/chart/bar');
require('echarts/lib/component/tooltip');
require('echarts/lib/component/dataZoom');
require('echarts/lib/component/title');

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
                
            },
            Modal:{
                
            },
            form:{

            },
            // 工具条查询参数
            toolbarParams:{
                
            },
            // 表格数据
            indexTable:{
                head:[
                    { title: '时间段', dataIndex: 'dayss', key: 'dayss',render:(text)=>(
                        text+':00'
                    )}, 
                    { title: '投放用户总数', dataIndex: 'sumUser', key: 'sumUser'}, 
                    { title: '投放次数', dataIndex: 'put', key: 'put'}, 
                    { title: '总重量', dataIndex: 'sumWeight', key: 'sumWeight'}, 
                    { title: '总金额', dataIndex: 'sum', key: 'sum'}, 
                    { title: '绿色贡献值', dataIndex: 'lvs', key: 'lvs' }
                ],
                data:[]
            },
            type:'add'
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
                fatherMenuId:search.id||''
            },
            success:(data)=>{
                data.forEach((el)=>{
                    _this.state.permission[config.UserAdmin.permission[el.url]] = true;
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
        Ajax.get({
            url:config.Hour.urls.garbageHourQuantity,
            params:{
                ...params,
                startTime:new Date(params.startTime).getTime() || '',
                endTime:new Date(params.endTime).getTime() || '',
            },
            success:(data)=>{
                _this.state.indexTable.data = data;
                _this.drawBar(data,'bar');
                _this.setState({})
            }
        })
    }
    // 画柱状图
    drawBar(data,id){
        console.log(data)
        if(!document.getElementById(id)) return;
        const _this = this;
        // 初始化echarts实例
        const myChart = echarts.init(document.getElementById(id));

        let option = {
            title : {
                // text: '活跃和非活跃用户数量的统计',
                top:20,
                x:'center'
            },
            tooltip : {
                trigger: 'axis',
                formatter: "{b} : {c}"
            },
            legend: {
                top:50,
                data:['投放次数','总重量']
            },
            grid: {
                top:100,
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: data.map((el)=>(el.dayss))
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                name:'投放次数',
                stack:'投放次数',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                data: data.map((el)=>(el.put)),
                type: 'line'
            },{
                name:'总重量',
                stack:'总重量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                data: data.map((el)=>(el.sumWeight)),
                type: 'line'
            }]
        };

        // 清空画布
        myChart.clear();

        // 使用刚指定的配置项和数据显示图表。
        myChart.setOption(option,true);

        //根据窗口大小自适应图表
        window.addEventListener("resize",()=>{
            myChart.resize();
        });
        
        return myChart;
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
                    <Breadcrumb.Item>数据统计</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">投放时间断统计</a></Breadcrumb.Item>
                </Breadcrumb>
                
                <div className="main-toolbar">
                    区域选择：
                    <Cascader data={state.toolbarParams} onChange={(data)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                pro:{$set:data.pro},
                                city:{$set:data.city},
                                area:{$set:data.area},
                                street:{$set:data.street},
                                comm:{$set:data.comm}
                            }
                        }))
                    }}/>
                    
                </div>

                <div className="main-toolbar">
                    设备类型：<Select value={state.toolbarParams.type} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                type:{$set:value}
                            }
                         }))
                    }} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value="1">办公室</Select.Option>
                        <Select.Option value="2">移动称</Select.Option>
                    </Select>

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                section:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.section} 
                    placeholder="请输入辖区管理部门"
                    addonBefore={<span>辖区管理部门</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>

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
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>

                </div>
                <div className="main-toolbar">
                    时间查询：
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
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams={};
                        _this.setState({});
                    }}>重置</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        window.open(config.urls.exportGrbageHourQuantity+'?token='+localStorage.getItem('token')+formatSearch(state.toolbarParams));
                    }}>数据导出</Button>
                </div>
                <Table 
                    rowKey={record=>record.dayss || 1} 
                    pagination={false}
                    columns={state.indexTable.head} 
                    dataSource={state.indexTable.data} />
                <div style={{height:'400px'}}>
                    <div style={{width:'100%',height:'400px',float:'left'}}>
                        <div style={{width:'100%',height:'100%'}} id="bar"></div>
                    </div>
                </div>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
