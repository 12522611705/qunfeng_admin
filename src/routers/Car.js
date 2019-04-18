import React, { Component } from 'react';
import { Breadcrumb, Input, Icon, Select, Button, Form, Table, Divider, Tag, DatePicker, Modal, message } from 'antd';

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
                    { title: '车名', dataIndex: 'carName', key: 'carName'}, 
                    // { title: '司机名', dataIndex: 'driverName', key: 'driverName'}, 
                    { title: '车牌号', dataIndex: 'carNumber', key: 'carNumber'}, 
                    { title: 'imei号', dataIndex: 'imei', key: 'imei'}, 
                    { title: '环卫车类型', dataIndex: 'type', key: 'type'}, 
                    { title: '身份', dataIndex: 'pro', key: 'pro'}, 
                    { title: '市', dataIndex: 'city', key: 'city'}, 
                    { title: '区', dataIndex: 'area', key: 'area'}, 
                    { title: '是否在工作中', dataIndex: 'isWord', key: 'isWord', render:(text)=>(
                        ['','是','否'][text]
                    )},
                    { title: '操作', dataIndex: 'operation', key: 'operation', render:(text,record)=>(
                        <span>
                            <a href="javascript:;" onClick={()=>{
                                this.update('set',addons(this.state,{
                                    Modal:{
                                        visRecord:{
                                            $set:true
                                        }
                                    },
                                    recordType:{
                                        $set:'update'
                                    },
                                    record:{
                                        $set:record
                                    },
                                    newRecord:{
                                        carName:{
                                            $set:record.carName
                                        },
                                        // driverName:{
                                        //     $set:record.driverName
                                        // },
                                        carNumber:{
                                            $set:record.carNumber
                                        },
                                        imei:{
                                            $set:record.imei
                                        },
                                        type:{
                                            $set:record.type
                                        },
                                        pro:{
                                            $set:record.pro
                                        },
                                        city:{
                                            $set:record.city
                                        },
                                        area:{
                                            $set:record.area
                                        },
                                        isWord:{
                                            $set:String(record.isWord)
                                        },
                                    }
                                }))
                            }}>修改</a>
                            <Divider type="vertical" />
                            <a href="javascript:;" onClick={()=>{
                                Modal.confirm({
                                    title:'提示',
                                    content:'你确定要删除吗？',
                                    okText:'确定',
                                    cancelText:'取消',
                                    onOk(){
                                        Ajax.post({
                                            url:config.SanitationCarAdmin.urls.delete,
                                            params:{
                                                carId:record.id
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
            // 省市区查询
            address:{
                di:'',
                sheng:'',
                xian:'',
                shen:[],
                city:{},
                area:{}
            },
            toolbarParams:{
                carName:'',
                // driverName:'',
                carNumber:'',
                imei:'',
                pro:'',
                city:'',
                area:''
            },
            Modal:{
                visRecord:false
            },
            recordType:'add',
            record:{},
            newRecord:{
                carName:'',
                // driverName:'',
                carNumber:'',
                imei:'',
                type:'',
                pro:'',
                city:'',
                area:'',
                isWord:''
            }
        }
    }
    componentDidMount(){

        this.initIndex()
        // console.log(Cities)
        Cities.forEach((el)=>{
            if(el.level==1){
                this.state.address.shen.push(el)
            }
            if(el.level==2){
                this.state.address.city[el.sheng] = this.state.address.city[el.sheng]||[];
                this.state.address.city[el.sheng].push(el)
            }
            if(el.level==3){
                this.state.address.area[el.sheng+el.di] = this.state.address.area[el.sheng+el.di]||[];
                this.state.address.area[el.sheng+el.di].push(el)
            }
        })
        this.update('set',addons(this.state,{}));
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
        return new Promise((resolve,reject)=>{
            Ajax.get({
                url:config.SanitationCarAdmin.urls.list,
                params:{
                    page:_this.state.indexTable.pagination.current||1,
                    pageSize:_this.state.indexTable.pagination.pageSize||10,
                    carName:params.carName||'',
                    // driverName:params.driverName||'',
                    carNumber:params.carNumber||'',
                    imei:params.imei||'',
                    pro:params.pro||'',
                    city:params.city||'',
                    area:params.area||''
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
    isVehicleNumber(vehicleNumber){
        var xreg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
        var creg=/^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
        if(vehicleNumber.length == 7){
            return creg.test(vehicleNumber);
        } else if(vehicleNumber.length == 8){
            return xreg.test(vehicleNumber);
        } else{
            return false;
        }
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
                    <Breadcrumb.Item>环卫车管理</Breadcrumb.Item>
                    <Breadcrumb.Item><a href="javascript:;">环卫车列表</a></Breadcrumb.Item>
                </Breadcrumb>
                <div className="main-toolbar">
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                carName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.carName} 
                    placeholder="请输入车名"
                    addonBefore={<span>车名</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>

                    {/*<Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                driverName:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.driverName} 
                    addonBefore={<span>司机名</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>*/}

                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                carNumber:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.carNumber} 
                    placeholder="请输入车牌号"
                    addonBefore={<span>车牌号</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                    <Input onChange={(e)=>{
                        update('set',addons(state,{
                            toolbarParams:{
                                imei:{
                                    $set:e.target.value
                                }    
                            }
                        }))
                    }} value={state.toolbarParams.imei} 
                    placeholder="请输入emei号"
                    addonBefore={<span>imei号</span>} 
                    style={{ width: 300, marginRight: 10, marginBottom:10 }} 
                    addonAfter={<a onClick={()=>{
                        _this.initIndex();
                    }} href="javascript:;"><Icon type="search" /></a>}/>
                </div>
                <div className="main-toolbar">
                    详细地址：
                    <Select value={state.toolbarParams.pro} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.shen.map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                pro:{
                                                    $set:el.name
                                                },
                                                // city:{
                                                //     $set:state.address.city[el.sheng][0].name
                                                // },
                                                // area:{
                                                //     $set: state.address.city[el.sheng] && 
                                                //           state.address.city[el.sheng][0] && 
                                                //           state.address.area[el.sheng+state.address.city[el.sheng][0].di] && 
                                                //           state.address.area[el.sheng+state.address.city[el.sheng][0].di][0].name
                                                // }
                                            },
                                            address:{
                                                sheng:{
                                                    $set:el.sheng
                                                },
                                                // di:{
                                                //     $set:'01'
                                                // },
                                                // xian:{
                                                //     $set:'00'
                                                // }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>

                    <Select value={state.toolbarParams.city} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.city[state.address.sheng] && state.address.city[state.address.sheng].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                    <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                city:{
                                                    $set:el.name
                                                },
                                                // area:{
                                                //     $set:state.address.area[state.address.sheng+el.di][0].name
                                                // }
                                            },
                                            address:{
                                                di:{
                                                    $set:el.di
                                                },
                                                // xian:{
                                                //     $set:'00'
                                                // }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>
                    <Select value={state.toolbarParams.area} style={{ width: 120, marginRight:10 }}>
                        <Select.Option value=''>全部</Select.Option>
                        {
                            state.address.area[state.address.sheng+state.address.di] && 
                            state.address.area[state.address.sheng+state.address.di].map((el,index)=>{
                                return <Select.Option value={el.code} key={index}>
                                     <div onClick={()=>{
                                        update('set',addons(state,{
                                            toolbarParams:{
                                                area:{
                                                    $set:el.name
                                                }
                                            },
                                            address:{
                                                di:{
                                                    $set:el.di
                                                }
                                            }
                                        }))
                                    }}>{el.name}</div>
                                </Select.Option>
                            })
                        }
                    </Select>
                    <Button type="primary" onClick={()=>{
                        _this.initIndex();
                    }}>查询</Button>
                </div>
                <div className="main-toolbar">
                    <Button type="primary" onClick={()=>{
                        update('set',addons(state,{
                            Modal:{
                                visRecord:{
                                    $set:true
                                }
                            },
                            recordType:{
                                $set:'add'
                            },
                            newRecord:{
                                carName:{
                                    $set:''
                                },
                                // driverName:{
                                //     $set:''
                                // },
                                carNumber:{
                                    $set:''
                                },
                                imei:{
                                    $set:''
                                },
                                type:{
                                    $set:''
                                },
                                pro:{
                                    $set:''
                                },
                                city:{
                                    $set:''
                                },
                                area:{
                                    $set:''
                                },
                                isWord:{
                                    $set:''
                                },
                            }
                        }))
                    }}>添加环卫车</Button>
                </div>
                <div className="main-toolbar">
                    <Button type="primary" onClick={()=>{
                        state.toolbarParams = {
                            page:1,
                            pageSize:10,
                            carName:'',
                            // driverName:params.driverName||'',
                            carNumber:'',
                            imei:'',
                            pro:'',
                            city:'',
                            area:''
                        }
                        _this.initIndex({
                            toolbarParams:{
                                page:{$set:1},//用户名
                                pageSize:{$set:10},//手机号码
                                carName:{$set:''},//查询字段
                                carNumber:{$set:''},//性别
                                imei:{$set:''},//用户ick号
                                pro:{$set:''},//省
                                city:{$set:''},//市
                                area:{$set:''},//市
                            }
                        })
                    }}>重置</Button>
                </div>
                <Modal title={state.recordType=='add'?'添加环卫车':'修改环卫车记录'}
                   onOk={()=>{
                        let url = '';
                        if(state.recordType=='add'){
                            url  = config.SanitationCarAdmin.urls.add
                        }else if(state.recordType=='update'){
                            url  = config.SanitationCarAdmin.urls.update
                        }
                        if(!_this.isVehicleNumber(state.newRecord.carNumber)) return message.info('请输入的车牌号无效');
                        if(state.newRecord.imei.length!=15) return message.info('您输入的imei无效');
                        Ajax.post({
                            url,
                            params:{
                                number:0,
                                maxWeight:1,
                                carName:state.newRecord.carName,
                                // driverName:{
                                //     $set:record.driverName
                                // },
                                carNumber:state.newRecord.carNumber,
                                imei:state.newRecord.imei,
                                type:state.newRecord.type,
                                pro:state.newRecord.pro,
                                city:state.newRecord.city,
                                area:state.newRecord.area,
                                isWord:state.newRecord.isWord,
                                id:state.recordType=='update'?state.record.id:''
                            },
                            success:(data)=>{
                                _this.initIndex({Modal:{visRecord:{$set:false}}})
                            }
                        })
                   }}
                   onCancel={()=>{
                    update('set',addons(state,{Modal:{visRecord:{$set:false}}}))
                   }}
                   okText="确认"
                   cancelText="取消"
                   visible={state.Modal.visRecord}>
                    <Form.Item {...formItemLayout} label="车名" >
                        <Input placeholder="请输入车名" onChange={(e)=>{
                            _this.updateNewRecord('carName',e.target.value);
                        }} value={state.newRecord.carName}/>
                    </Form.Item>
                    {/*
                    <Form.Item {...formItemLayout} label="司机名" >
                        <Input placeholder="请输入司机名" onChange={(e)=>{
                            _this.updateNewRecord('driverName',e.target.value);
                        }} value={state.newRecord.driverName}/>
                    </Form.Item>*/}
                    <Form.Item {...formItemLayout} label="车牌号" >
                        <Input placeholder="请输入车牌号" onChange={(e)=>{
                            _this.updateNewRecord('carNumber',e.target.value);
                        }} value={state.newRecord.carNumber}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="imei" >
                        <Input placeholder="请输入emei" onChange={(e)=>{
                            _this.updateNewRecord('imei',e.target.value);
                        }} value={state.newRecord.imei}/>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="地址" >
                        <Select placeholder="--省--" value={state.newRecord.pro} style={{ width: 120, marginRight:10 }}>
                            {
                                state.address.shen.map((el,index)=>{
                                    return <Select.Option value={el.code} key={index}>
                                        <div onClick={()=>{
                                            update('set',addons(state,{
                                                newRecord:{
                                                    pro:{
                                                        $set:el.code
                                                    },
                                                    city:{
                                                        $set:state.address.city[el.sheng][0].code
                                                    },
                                                    area:{
                                                        $set: state.address.city[el.sheng] && 
                                                              state.address.city[el.sheng][0] && 
                                                              state.address.area[el.sheng+state.address.city[el.sheng][0].di] && 
                                                              state.address.area[el.sheng+state.address.city[el.sheng][0].di][0].code
                                                    }
                                                },
                                                address:{
                                                    sheng:{
                                                        $set:el.sheng
                                                    },
                                                    di:{
                                                        $set:'01'
                                                    },
                                                    xian:{
                                                        $set:'00'
                                                    }
                                                }
                                            }))
                                        }}>{el.name}</div>
                                    </Select.Option>
                                })
                            }
                        </Select>

                        <Select placeholder="--市--" value={state.newRecord.city} style={{ width: 120, marginRight:10 }}>
                            {
                                state.address.city[state.address.sheng] && state.address.city[state.address.sheng].map((el,index)=>{
                                    return <Select.Option value={el.code} key={index}>
                                        <div onClick={()=>{
                                            update('set',addons(state,{
                                                newRecord:{
                                                    city:{
                                                        $set:el.code
                                                    },
                                                    area:{
                                                        $set:state.address.area[state.address.sheng+el.di][0].code
                                                    }
                                                },
                                                address:{
                                                    di:{
                                                        $set:el.di
                                                    },
                                                    xian:{
                                                        $set:'00'
                                                    }
                                                }
                                            }))
                                        }}>{el.name}</div>
                                    </Select.Option>
                                })
                            }
                        </Select>
                        <Select placeholder="--区--" value={state.newRecord.area} style={{ width: 120, marginRight:10 }}>
                            {
                                state.address.area[state.address.sheng+state.address.di] && 
                                state.address.area[state.address.sheng+state.address.di].map((el,index)=>{
                                    return <Select.Option value={el.code} key={index}>
                                         <div onClick={()=>{
                                            update('set',addons(state,{
                                                newRecord:{
                                                    area:{
                                                        $set:el.code
                                                    }
                                                },
                                                address:{
                                                    di:{
                                                        $set:el.di
                                                    }
                                                }
                                            }))
                                        }}>{el.name}</div>
                                    </Select.Option>
                                })
                            }
                        </Select>
                    </Form.Item>
                    <Form.Item {...formItemLayout} label="是否在工作中" > 
                        <Select placeholder="请选择是否在工作中" value={state.newRecord.isWord} style={{ width: '100%' }} onChange={(value)=>{
                            _this.updateNewRecord('isWord',value);
                        }}>
                          <Select.Option value="1">是</Select.Option>
                          <Select.Option value="2">否</Select.Option>
                        </Select>
                    </Form.Item>
                </Modal>
                <Table rowKey={record=>record.id} columns={state.indexTable.head} dataSource={state.indexTable.data} />
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
