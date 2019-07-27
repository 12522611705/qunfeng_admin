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
                pagination:{
                    current:1,
                    total:0,
                    pageSize:10,
                    onChange(page){
                        _this.state.depositTable.pagination.current = page;
                        _this.initDeposit();
                    }
                },
                head:[
                    { title: '日期', dataIndex: 'dayss', key: 'dayss'}, 
                    { title: '投放用户总数', dataIndex: 'sumUser', key: 'sumUser'}, 
                    { title: '投放次数', dataIndex: 'put', key: 'put'}, 
                    { title: '总重量', dataIndex: 'sumWeight', key: 'sumWeight'}, 
                    { title: '总金额', dataIndex: 'sum', key: 'sum'}, 
                    { title: '绿色贡献值', dataIndex: 'lvs', key: 'lvs' }, 
                    { title: '更多信息', dataIndex: 'more', key: 'more' ,render:(text,record)=>(
                        <a href="javascript:;" onClick={()=>{
                            console.log(record.lists)
                            Modal.confirm({
                                width:800,
                                icon:<span></span>,
                                content:<div>
                                    <Table rowKey={record=>record.id} 
                                        pagination={false}
                                        columns={[
                                            { title: 'ID', dataIndex: 'id', key: 'id'}, 
                                            { title: '种类', dataIndex: 'kind', key: 'kind'}, 
                                            { title: '重量', dataIndex: 'weight', key: 'weight'}, 
                                            { title: '环保金', dataIndex: 'sum', key: 'sum'}, 
                                            { title: '绿色贡献值', dataIndex: 'lvs', key: 'lvs'}, 
                                            { title: '垃圾比重', dataIndex: 'ratio', key: 'ratio'}, 
                                        ]} 
                                        dataSource={record.lists && record.lists.slice(1) } />
                                </div>,
                                okText:'确定',
                                cancelText:'取消'
                            })

                        }}>点击查看</a>
                    )},
                    { title: '备注', dataIndex: 'remark', key: 'remark' }
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
            url:config.Day.urls.garbageDayQuantity,
            params:{
                ...params,
                startTime:new Date(params.startTime).getTime() || '',
                endTime:new Date(params.endTime).getTime() || '',
            },
            success:(data)=>{
                _this.state.indexTable.data = data.data;
                _this.state.indexTable.pagination.total = data.count;
                _this.state.indexTable.pagination.pageSize = data.pageSize;
                _this.state.indexTable.pagination.current = _this.state.indexTable.pagination.current;
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
                trigger: 'item',
                formatter: "{b} : {c}"
            },
            xAxis: {
                type: 'category',
                data: data.map((el)=>(el.kind))
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: data.map((el)=>(el.weight)),
                type: 'bar',//配置样式
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
                    <Breadcrumb.Item><a href="javascript:;">垃圾分类设备数据汇总</a></Breadcrumb.Item>
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
                    
                </div>
                <Table 
                    rowKey={record=>record.dayss || 1} 
                    rowSelection={{
                        type:'radio',
                        selectedRowKeys:state.indexTable.selectedRowKeys,
                        onChange:(selectedRowKeys,selectedRows)=>{
                            state.indexTable.selectedRowKeys = selectedRowKeys;
                            _this.drawBar(selectedRows[0].lists,'bar');
                            _this.setState({});
                        }
                    }}
                    pagination={state.indexTable.pagination}
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
