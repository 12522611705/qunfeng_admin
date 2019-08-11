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
                    { title: '时间段', dataIndex: 'name', key: 'name'}, 
                    { title: '用户总数', dataIndex: 'total', key: 'startTime'}, 
                    { title: '用户比例', dataIndex: 'proportion', key: 'proportion',render:(text)=>(
                        text.toFixed(4)+'%'
                    )}
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
            url:config.UserAge.urls.userAgeQuantity,
            params:{
                ...params,
                startTime:new Date(params.startTime).getTime(),
                endTime:new Date(params.endTime).getTime(),
            },
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    indexTable:{
                        data:{
                            $set:[{
                                name:'20岁以下',
                                total:data.twentyBelow,
                                proportion:data.twentyBelowProportion
                            },{
                                name:'20-30岁',
                                total:data.twenty,
                                proportion:data.twentyProportion
                            },{
                                name:'30-40岁',
                                total:data.thirty,
                                proportion:data.thirtyProportion
                            },{
                                name:'40-50岁',
                                total:data.forty,
                                proportion:data.fortyProportion
                            },{
                                name:'50岁以上',
                                total:data.fifty,
                                proportion:data.fiftyProportion
                            }]||[]
                        }
                    },
                    ...updateParams
                }))
                _this.drawPie(data,'pie');
            }
        })
    }
    // 画饼图
    drawPie(data,id){
        if(!document.getElementById(id)) return;
        const _this = this;
        // 初始化echarts实例
        const myChart = echarts.init(document.getElementById(id));

        let option = {
            title : {
                text: '年龄段用户比例',
                top:20,
                x:'center'
            },
            tooltip : {
                trigger: 'item',
                formatter: "{a} <br/>{b} : {c} ({d}%)"
            },
            legend: {
                orient: 'vertical',
                left: 'bottom',
                data: ['20岁以下','20-30岁','30-40岁','40-50岁','50岁以上']
            },
            series : [{
                name: '新增用户占比',
                type: 'pie',
                radius : '55%',
                center: ['50%', '60%'],
                data:[
                    {value:data.twentyBelow, name:'20岁以下'},
                    {value:data.twenty, name:'20-30岁'},
                    {value:data.thirty, name:'30-40岁'},
                    {value:data.forty, name:'40-50岁'},
                    {value:data.fifty, name:'50岁以上'}
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
                    <Breadcrumb.Item><a href="javascript:;">用户年龄段统计</a></Breadcrumb.Item>
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
                    rowKey={record=>record.name}
                    pagination={false}
                    columns={state.indexTable.head} 
                    dataSource={state.indexTable.data} />
                <div style={{height:'400px'}}>
                    <div style={{width:'100%',height:'400px',float:'left'}}>
                        <div style={{width:'100%',height:'100%'}} id="pie"></div>
                    </div>
                </div>
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
