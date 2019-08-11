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
                type:'1'
            },
            // 表格数据
            indexTable:{
                selectedRowKeys:[],
                head:[],
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
            url:config.Trend.urls.userTrendQuantity,
            params:{
                ...params
            },
            success:(data)=>{
                let head = [{
                    title: '', 
                    dataIndex: 'name', 
                    key: 'name',
                }];
                let newdata = [];
                data.forEach((el)=>{
                    head.push({
                        title: el.month+['','月','周'][params.type], 
                        dataIndex: el.month, 
                        key: el.month,
                        newUserCount: el.newUserCount,
                        userCount: el.userCount,
                    });
                })
                head.forEach((el)=>{
                    newdata[1] = newdata[1] || {};
                    newdata[1].name = '新增用户量';
                    newdata[1][el.key] = el.newUserCount;
                })
                head.forEach((el)=>{
                    newdata[0] = newdata[0] || {};
                    newdata[0].name = '总用户量';
                    newdata[0][el.key] = el.userCount;
                })
                _this.update('set',addons(_this.state,{
                    indexTable:{
                        data:{
                            $set:newdata
                        },
                        head:{
                            $set:head
                        }
                    },
                    ...updateParams
                }))
                _this.drawLine({
                    type:params.type,
                    legend:['总用户量','新增用户量'],
                    xAxis:head.map((el)=>(el.title)).slice(1),
                    data:[Object.values(newdata[0]).slice(1),Object.values(newdata[1]).slice(1)]
                },'line');
            }
        })
    }
    // 画线图
    drawLine(data,id){
        if(!document.getElementById(id)) return;
        const _this = this;
        // 初始化echarts实例
        const myChart = echarts.init(document.getElementById(id));

        let option = {
            title: {
                text: ['','最近半年用户量发展趋势（按月）','最近3个月用户量发展趋势（按周）'][data.type],
                left:'center',
                top:10
            },
            tooltip: {
                trigger: 'axis',
                 formatter: "{b} : {c}"
            },
            legend: {
                top:50,
                data:data.legend
            },
            grid: {
                top:100,
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: {}
                }
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: data.xAxis
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                name:'总用户量',
                type:'line',
                stack: '总用户量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                data:data.data[0]
            },{
                name:'新增用户量',
                type:'line',
                stack: '新增用户量',
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                data:data.data[1]
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
                    <Breadcrumb.Item><a href="javascript:;">用户了趋势分析</a></Breadcrumb.Item>
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
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                plot:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.plot} 
                    placeholder="请输入小区名字"
                    addonBefore={<span>小区名字</span>} 
                    style={{ width: 300, marginRight: 10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
                    选择周期：
                    <Select value={state.toolbarParams.type} onChange={(value)=>{
                         update('set',addons(state,{
                            toolbarParams:{
                                type:{$set:value}
                            }
                         }))
                    }} style={{ width: 300, marginRight:10 }}>
                        <Select.Option value="1">最近半年用户量发展趋势（按月）</Select.Option>
                        <Select.Option value="2">最近3个月用户量发展趋势（按周）</Select.Option>
                    </Select>
                </div>
                <div className="main-toolbar">
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        state.toolbarParams={};
                        _this.setState({});
                    }}>重置</Button>
                    <Button style={{marginRight:10}} type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                    
                </div>
                <Table 
                    rowKey={record=>record.name}
                    pagination={false}
                    columns={state.indexTable.head} 
                    dataSource={state.indexTable.data} />
                <div style={{height:'400px'}}>
                    <div style={{width:'100%',height:'400px',float:'left'}}>
                        <div style={{width:'100%',height:'100%'}} id="line"></div>
                    </div>
                </div>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
