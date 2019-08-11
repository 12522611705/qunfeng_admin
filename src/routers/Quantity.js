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
                selectedRowKeys:[],
                head:[
                    { title: 'ID', dataIndex: 'id', key: 'id'}, 
                    { title: '开始时间', dataIndex: 'startTime', key: 'startTime'}, 
                    { title: '结束时间', dataIndex: 'endTime', key: 'endTime'}, 
                    { title: '老用户总数', dataIndex: 'agedUser', key: 'agedUser'}, 
                    { title: '新增用户总数', dataIndex: 'newUser', key: 'newUser'}, 
                    { title: '用户总数', dataIndex: 'sumUser', key: 'sumUser'}, 
                    { title: '新增用户占比', dataIndex: 'newUserProportion', key: 'newUserProportion', render:(text)=>(
                        text.toFixed(2) + '%'
                    ) }, 
                    { title: '老用户占比', dataIndex: 'agedUserProportion', key: 'agedUserProportion' , render:(text)=>(
                        text.toFixed(2) + '%'
                    ) }
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
            url:config.Quantity.urls.userQuantity,
            params:{
                ...params,
                startTime:new Date(params.startTime).getTime(),
                endTime:new Date(params.endTime).getTime(),
            },
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    indexTable:{
                        data:{
                            $set:[data]||[]
                        }
                    },
                    ...updateParams
                }))
                _this.drawBar(data,'bar');
                _this.drawPie(data,'pie');
            }
        })
    }
    // 画柱状图
    drawBar(data,id){
        if(!document.getElementById(id)) return;
        const _this = this;
        // 初始化echarts实例
        const myChart = echarts.init(document.getElementById(id));

        let option = {
            title : {
                text: '用户量占比统计',
                top:20,
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{b} : {c}"
            },
            xAxis: {
                type: 'category',
                data: ['老用户总数','新用户总数']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: [data.agedUser,data.newUser],
                type: 'bar',//配置样式
                label: {
                    normal: {
                        show: true,
                        position: 'top'
                    }
                },
                itemStyle: {   
                    //通常情况下：
                    normal:{  
    　　　　　　　　　　　　//每个柱子的颜色即为colorList数组里的每一项，如果柱子数目多于colorList的长度，则柱子颜色循环使用该数组
                        color: function (params){
                            var colorList = ['rgb(164,205,238)','rgb(42,170,227)','rgb(25,46,94)','rgb(195,229,235)'];
                            return colorList[params.dataIndex];
                        }
                    },
                    //鼠标悬停时：
                    emphasis: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
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
    // 画饼图
    drawPie(data,id){
        if(!document.getElementById(id)) return;
        const _this = this;
        // 初始化echarts实例
        const myChart = echarts.init(document.getElementById(id));

        let option = {
            title : {
                text: '用户量占比统计',
                top:20,
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'bottom',
                data: ['新增用户占比','老用户占比']
            },
            series : [{
                name: '新增用户占比',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                label: {
                    normal: {
                        formatter: ' {b|{b}：}{c}',
                        borderWidth: 1,
                        borderRadius: 4,
                        rich: {
                            b: {
                                fontSize: 16,
                                lineHeight: 33
                            }
                        }
                    }
                },
                data:[
                    {value:data.newUserProportion.toFixed(2), name:'新增用户占比'},
                    {value:data.agedUserProportion.toFixed(2), name:'老用户占比'}
                ]
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
                    <Breadcrumb.Item><a href="javascript:;">用户数据统计</a></Breadcrumb.Item>
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
                    
                </div>
                <Table 
                    rowKey={record=>record.agedUser} 
                    rowSelection={{
                        selectedRowKeys:state.indexTable.selectedRowKeys,
                        onChange:(selectedRowKeys)=>{
                            state.indexTable.selectedRowKeys = selectedRowKeys;
                            _this.setState({});
                        }
                    }}
                    pagination={false}
                    columns={state.indexTable.head} 
                    dataSource={state.indexTable.data} />
                <div style={{height:'400px'}}>
                    <div style={{width:'50%',height:'400px',float:'left'}}>
                        <div style={{width:'100%',height:'100%'}} id="bar"></div>
                    </div>
                    <div style={{width:'50%',height:'400px',float:'right'}}>
                        <div style={{width:'100%',height:'100%'}} id="pie"></div>
                    </div>
                </div>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
