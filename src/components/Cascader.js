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
                pro:'',
                city:'',
                area:'',
                street:''
            },
            address:{
                di:'',
                sheng:'',
                xian:'',
                shen:[],
                city:{},
                area:{}
            },
            street:[]
        }
    }
    componentDidMount(){
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
        this.setState({});
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        const props = this.props;
        if(nextProps.data.pro != props.data.pro || nextProps.data.city != props.data.city || nextProps.data.area != props.data.area || nextProps.data.street != props.data.street ){
            this.update('set',addons(this.state,{
                value:{
                    pro:{$set:nextProps.data.pro},
                    city:{$set:nextProps.data.city},
                    area:{$set:nextProps.data.area},
                    street:{$set:nextProps.data.street}
                }
            }))    
        }
    }
    fn(params){
        const _this = this;
        _this.props.onChange({
            pro:_this.state.value.pro,
            city:_this.state.value.city,
            area:_this.state.value.area,
            street:_this.state.value.street,
            ...params
        });        
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
        return (
            <div style={{display:'inline-block'}} className="clearfix">
                <Select value={state.value.pro} style={{ width: 120, marginRight:10 }}>
                    <Select.Option value="">全部</Select.Option>                        
                    {
                        state.address.shen.map((el,index)=>{
                            return <Select.Option value={el.code} key={index}>
                                <div onClick={()=>{
                                    state.value.pro = el.name;
                                    state.address.sheng = el.sheng;
                                    _this.fn({
                                        pro:el.name
                                    });
                                }}>{el.name}</div>
                            </Select.Option>
                        })
                    }
                </Select>

                <Select value={state.value.city} style={{ width: 120, marginRight:10 }}>
                    <Select.Option value="">全部</Select.Option>
                    {
                        state.address.city[state.address.sheng] && state.address.city[state.address.sheng].map((el,index)=>{
                            return <Select.Option value={el.code} key={index}>
                                <div onClick={()=>{
                                    state.value.city = el.name;
                                    state.address.di = el.di;
                                    _this.fn({
                                        city:el.name
                                    });
                                }}>{el.name}</div>
                            </Select.Option>
                        })
                    }
                </Select>

                <Select value={state.value.area} style={{ width: 120, marginRight:10 }}>
                    <Select.Option value="">全部</Select.Option>
                    {
                        state.address.area[state.address.sheng+state.address.di] && 
                        state.address.area[state.address.sheng+state.address.di].map((el,index)=>{
                            return <Select.Option value={el.code} key={index}>
                                 <div onClick={()=>{
                                    Ajax.get({
                                        url:config.urls.streetList,
                                        params:{
                                            pro:state.value.pro,
                                            city:state.value.city,
                                            area:el.name
                                        },
                                        success:(data)=>{
                                            state.value.area = el.name;
                                            state.street = data;
                                            _this.fn({
                                                area:el.name
                                            });
                                        }
                                    })
                                    
                                }}>{el.name}</div>
                            </Select.Option>
                        })
                    }
                </Select>

                <Select value={state.value.street} style={{ width: 120, marginRight:10 }}>
                    <Select.Option value="">全部</Select.Option>
                    {
                        state.street.map((el,index)=>{
                            return <Select.Option value={el.street} key={index}>
                                 <div onClick={()=>{
                                    state.value.street = el.street;
                                    _this.fn({
                                        street:el.street
                                    });
                                }}>{el.street}</div>
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
