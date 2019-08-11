import React, { Component } from 'react';
import { Input, Select } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';


import { Ajax } from '../utils/global';
import { config } from '../utils/config';
import Cities from '../utils/Cities';


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            value:{
                
            },
            address:{
                di:'',
                sheng:'',
                xian:'',
                shen:[],
                city:[],
                area:[],
                street:[],
                comm:[]
            }
        }
    }
    componentDidMount(){
        this.initPro();
        // Cities.forEach((el)=>{
        //     if(el.level==1){
        //         this.state.address.shen.push(el)
        //     }
        //     if(el.level==2){
        //         this.state.address.city[el.sheng] = this.state.address.city[el.sheng]||[];
        //         this.state.address.city[el.sheng].push(el)
        //     }
        //     if(el.level==3){
        //         this.state.address.area[el.sheng+el.di] = this.state.address.area[el.sheng+el.di]||[];
        //         this.state.address.area[el.sheng+el.di].push(el)
        //     }
        // })
        // this.setState({});
    }
    
    componentWillUnmount() {

    }
    // 初始化省
    initPro(){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.userProvinceList,
            params:{},
            success:(data)=>{
                _this.state.address.shen = data;
                _this.setState({});
            }
        })
    }
    // 初始化市
    initCity(record){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.userCityList,
            params:{
                code:record.provinceCode
            },
            success:(data)=>{
                _this.state.address.city = data;
                _this.setState({});
            }
        })
    }
    // 初始化区
    initArea(record){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.userAreaList,
            params:{
                code:record.cityCode
            },
            success:(data)=>{
                _this.state.address.area = data;
                _this.setState({});
            }
        })
    }
    // 初始化街道
    initStreet(record){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.userStreetList,
            params:{
                code:record.areaCode                
            },
            success:(data)=>{
                _this.state.address.street = data;
                _this.setState({});
            }
        })
    }
    // 初始化社区
    initComm(record){
        const _this = this;
        Ajax.get({
            url:config.Addres.urls.userCommunityList,
            params:{
                code:record.streetCode        
            },
            success:(data)=>{
                _this.state.address.comm = data;
                _this.setState({});
            }
        })
    }
    componentWillReceiveProps(nextProps) {
        const props = this.props;
        if(nextProps.data.pro != props.data.pro || 
            nextProps.data.city != props.data.city || 
            nextProps.data.area != props.data.area || 
            nextProps.data.comm != props.data.comm || 
            nextProps.data.street != props.data.street ){
            this.update('set',addons(this.state,{
                value:{
                    pro:{$set:nextProps.data.pro},
                    city:{$set:nextProps.data.city},
                    area:{$set:nextProps.data.area},
                    street:{$set:nextProps.data.street},
                    comm:{$set:nextProps.data.comm}
                }
            }))
        }
    }
    fn(params){
        const _this = this;
        _this.props.onChange({
            pro:_this.state.value.pro || '',
            city:_this.state.value.city || '',
            area:_this.state.value.area || '',
            street:_this.state.value.street || '',
            comm:_this.state.value.comm || '',
            ...params
        });        
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
        return (
            <div style={{display:'inline-block'}} className="clearfix">
                <Select placeholder="省" value={state.value.pro} style={{ width: 120, marginRight:10 }}>
                    {
                        state.address.shen.map((el,index)=>{
                            return <Select.Option value={el.provinceCode} key={index}>
                                <div onClick={()=>{
                                    _this.initCity(el);
                                    _this.fn({
                                        pro:el.provinceName
                                    });
                                }}>{el.provinceName}</div>
                            </Select.Option>
                        })
                    }
                </Select>
                <Select placeholder="市" value={state.value.city} style={{ width: 120, marginRight:10 }}>
                    {
                        state.address.city.map((el,index)=>{
                            return <Select.Option value={el.cityCode} key={index}>
                                <div onClick={()=>{
                                    _this.initArea(el);
                                    _this.fn({
                                        city:el.cityName
                                    });
                                }}>{el.cityName}</div>
                            </Select.Option>
                        })
                    }
                </Select>
                <Select placeholder="区/县" value={state.value.area} style={{ width: 120, marginRight:10 }}>
                    {
                        state.address.area.map((el,index)=>{
                            return <Select.Option value={el.areaCode} key={index}>
                                 <div onClick={()=>{
                                    _this.initStreet(el);
                                    _this.fn({
                                        area:el.areaName
                                    });
                                }}>{el.areaName}</div>
                            </Select.Option>
                        })
                    }
                </Select>
                <Select placeholder="街道办" value={state.value.street} style={{ width: 120, marginRight:10 }}>
                    {
                        state.address.street.map((el,index)=>{
                            return <Select.Option value={el.streetCode} key={index}>
                                 <div onClick={()=>{
                                    _this.initComm(el);
                                    _this.fn({
                                        street:el.streetName
                                    });
                                }}>{el.streetName}</div>
                            </Select.Option>
                        })
                    }
                </Select>
                <Select placeholder="社区" value={state.value.comm} style={{ width: 120, marginRight:10 }}>
                   {
                        state.address.comm.map((el,index)=>{
                            return <Select.Option value={el.communityCode} key={index}>
                                 <div onClick={()=>{
                                    _this.fn({
                                        comm:el.communityName
                                    });
                                    _this.setState({});
                                }}>{el.communityName}</div>
                            </Select.Option>
                        })
                    }
                </Select>
               
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
