import React, { Component } from 'react';
import { Menu, Icon, Dropdown, Form, Input, Button, Modal, message } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import emitter from './utils/events';

import addons from 'react-addons-update';
import update from 'react-update';

import { Ajax, parseSearch, formatSearch } from './utils/global';
import { config } from './utils/config';
// import { createForm } from 'rc-form';


// import reducers from './reducers';
import logo from './images/logo.png';
import styles from './css/app.css';


const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

// 
Array.prototype.distinct = function(){
    let arr = this;
    let result = [];
    let i = 0;
    let j = 0;
    let len = arr.length;
    for(i = 0; i < len; i++){
        for(j = i + 1; j < len; j++){
            if(arr[i] === arr[j]){
                j = ++i;
            }
        }
        result.push(arr[i]);
    }
    return result;
}

class component extends Component{
    constructor(props){
        super(props)
        this.update = update.bind(this);
        this.state = {
            Modal:{
                visUpdate:false
            },
            login:{
                account:'',
                password:'',
                creationUserId:'',
            },
            update:{
                password1:'',
                password2:''
            },
            menu:{
                selectedKeys:['0-0'],
                openKeys:['0']
            },
            menuData:[]
        }
        // 监听路由变化
        props.history.listen((location)=>{ 
            this.update('set',addons(this.state,{
                menu:{
                    selectedKeys:{
                        $set:[parseSearch(this.props.location.search)['menu']]
                    },
                    openKeys:{
                        $set:[parseSearch(this.props.location.search)['subMenu']]
                    }
                }
            }))
        })
    }
    componentDidMount(){
        const _this = this;
        // 组件装载完成以后声明一个自定义事件
        _this.eventEmitter = emitter.addListener('loading', (loading) => {
            _this.update('set',addons(_this.state,{
                loading:{
                    $set:loading
                }
            }))
        });
        _this.update('set',addons(_this.state,{
            menu:{
                selectedKeys:{
                    $set:[parseSearch(_this.props.location.search)['menu']] || '0-0'
                },
                openKeys:{
                    $set:[parseSearch(_this.props.location.search)['subMenu']] || '0'
                }
            }
        }))
        _this.getMenuData();
    }
    componentWillUnmount() {
        // 移除自定义事件
        emitter.removeListener(this.eventEmitter);

    }
    componentWillReceiveProps(nextProps) {
        
    }
     /**
     * @desc   获取菜单
     * @date   2019-04-08
     * @author luozhou
     * @param  {Object} options 
     */
    getMenuData(){
        const _this = this;
        if(!localStorage.getItem('token')) return;
        Ajax.get({
            url:config.JurisdictionAdmin.urls.list,
            params:{
                type:1
            },
            success:(data)=>{
                _this.update('set',addons(_this.state,{
                    menuData:{
                        $set:data
                    }
                }))
                Ajax.get({
                    url:config.JurisdictionAdmin.urls.list,
                    params:{
                        type:2,
                        fatherMenuId:data[[parseSearch(_this.props.location.search)['subMenu']] || 0].id
                    },
                    success:(d)=>{
                        _this.update('set',addons(_this.state,{
                            menuData:{
                                [[parseSearch(_this.props.location.search)['subMenu']] || 0]:{
                                    children:{
                                        $set:d
                                    }
                                }
                            }
                        }))
                    }
                })
            }
        })
    }
   /**
     * @desc   登录
     * @date   2019-04-08
     * @author luozhou
     * @param  {String} key   需要修改的信息的key
     * @param  {String} value 对应key的值
     */
    updateLogin(key,value){
        this.update('set',addons(this.state,{
            login:{
                [key]:{
                    $set:value
                }
            }
        }))
    }
    
   /**
     * @desc   修改密码
     * @date   2019-04-08
     * @author luozhou
     * @param  {String} key   需要修改的信息的key
     * @param  {String} value 对应key的值
     */
    updateUpdate(key,value){
        this.update('set',addons(this.state,{
            update:{
                [key]:{
                    $set:value
                }
            }
        }))
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
        const props = _this.props;
        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        return (
            <div style={{height:'100%'}}>
                {
                    localStorage.getItem('token') ?
                    <div id="app">
                        <div className={[styles.toolbar,'clearfix'].join(' ')}>
                            <div className={styles.logo}>
                                <Icon style={{fontSize:18,marginRight:10}} type="windows" />系统管理
                            </div>
                            <div className={styles.user}>
                                <Dropdown overlay={
                                    <Menu>
                                        <Menu.Item>
                                          <a onClick={()=>{
                                            update('set',addons(state,{
                                                Modal:{
                                                    visUpdate:{
                                                        $set:true
                                                    }
                                                }
                                            }))
                                          }} href="javascript:;">修改密码</a>
                                        </Menu.Item>
                                        <Menu.Item>
                                          <a onClick={()=>{
                                            Ajax.post({
                                                url:config.UserAdmin.urls.exitLogin,
                                                params:{},
                                                success:(data)=>{
                                                    localStorage.setItem('token','');
                                                    window.location.reload();
                                                }
                                            })
                                          }} href="javascript:;">退出登陆</a>
                                        </Menu.Item>
                                    </Menu>
                                }>
                                    <a className="ant-dropdown-link" href="javascript:;">
                                        用户名 <Icon type="down" />
                                    </a>
                                </Dropdown>
                                
                            </div>
                        </div>
                        <div className={[styles.main,styles.clearfix].join(' ')}>
                            <div className={styles.left}>
                                <Menu
                                    style={{ width: 200, height:'100%' }}
                                    selectedKeys={state.menu.selectedKeys}
                                    openKeys={state.menu.openKeys}
                                    mode="inline"
                                  >
                                    {
                                        state.menuData.map((el,index)=>(
                                            <SubMenu key={index} 
                                                title={<span onClick={()=>{
                                                    props.history.push({
                                                        pathname:el.path,
                                                        search:'?subMenu='+index+'&menu='+index + '-' + '0'
                                                    })
                                                    _this.update('set',addons(_this.state,{
                                                        menu:{
                                                            openKeys:{
                                                                $set:[String(index)]
                                                            },
                                                            selectedKeys:{
                                                                $set:[String(index) + '-' + '0']
                                                            }
                                                        }
                                                    }))
                                                    if(el.children) return;
                                                    Ajax.get({
                                                        url:config.JurisdictionAdmin.urls.list,
                                                        params:{
                                                            type:2,
                                                            fatherMenuId:el.id
                                                        },
                                                        success:(d)=>{
                                                            _this.update('set',addons(_this.state,{
                                                                menuData:{
                                                                    [index]:{
                                                                        children:{
                                                                            $set:d
                                                                        }
                                                                    }
                                                                }
                                                            }))
                                                        }
                                                    })
                                                }}><Icon type={el.icon || "folder"} /><span>{el.menuName}</span></span>}>
                                                {
                                                    el.children && el.children.map((e,i)=>(
                                                        <Menu.Item onClick={()=>{
                                                            
                                                            let search = parseSearch(_this.props.location.search);
                                                            search.menu=String(index) + '-' + i;

                                                            props.history.push({
                                                                pathname: e.path,
                                                                search:'?'+formatSearch(search)
                                                            })

                                                            _this.update('set',addons(_this.state,{
                                                                menu:{
                                                                    openKeys:{
                                                                        $set:[String(index)]
                                                                    },
                                                                    selectedKeys:{
                                                                        $set:[String(index) + '-' + i]
                                                                    }
                                                                }
                                                            }))
                                                        }} key={index+'-'+i}>{e.menuName}</Menu.Item>
                                                    ))
                                                }
                                            </SubMenu>
                                        ))
                                    }
                                </Menu>
                            </div>
                            <div className={styles.right}>
                                {_this.props.children}
                            </div>
                        </div>
                        <Modal
                            title="修改密码"
                            visible={state.Modal.visUpdate}
                            okText="确定"
                            cancelText="取消"
                            onCancel={()=>{
                                update('set',addons(state,{Modal:{visUpdate:{$set:false}}}));
                            }}
                            onOk={()=>{
                                if(!state.update.password1.length || !state.update.password2.length) return message.info('密码不能为空');
                                if(state.update.password1 != state.update.password2) return message.info('两次密码输入不一致');
                                Ajax.post({
                                    url:config.UserAdmin.urls.update,
                                    params:{
                                        password:state.update.password1||'',
                                    },
                                    success:(data)=>{
                                        localStorage.setItem('token','');
                                        window.location.reload();
                                    }
                                })
                            }}>
                            <Form.Item {...formItemLayout} label="新密码">
                                <Input onChange={(e)=>{
                                    _this.updateUpdate('password1',e.target.value);
                                }} value={state.update.password1} type="text" placeholder="请输入新密码" />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="确认新密码">
                                <Input onChange={(e)=>{
                                    _this.updateUpdate('password2',e.target.value);
                                }} value={state.update.password2} type="text" placeholder="请确认新密码" />
                            </Form.Item>
                        </Modal>
                        {
                            state.loading ?
                            <span>loading</span> :''
                        }
                    </div>:
                    <div className={styles.login}>
                        <div className={styles.content}>
                            <h3 className={styles.title}>群峰后台管理系统登录</h3>
                            <Form.Item {...formItemLayout} label="账号">
                                <Input onChange={(e)=>{
                                    _this.updateLogin('account',e.target.value);
                                }} value={state.login.account} type="text" placeholder="请输入账号" />
                            </Form.Item>
                            <Form.Item {...formItemLayout} label="密码">
                                <Input onChange={(e)=>{
                                    _this.updateLogin('password',e.target.value);
                                }} value={state.login.password} type="password" placeholder="请输入密码" />
                                <Button style={{marginTop:20}} onClick={()=>{
                                    Ajax.get({
                                        url:config.UserAdmin.urls.login,
                                        params:{
                                            account:state.login.account||'',
                                            password:state.login.password||'',
                                        },
                                        success:(data)=>{
                                            localStorage.setItem('token',data);
                                            window.location.reload();
                                        }
                                    })
                                }} type="primary">登录</Button>
                            </Form.Item>
                        </div>
                    </div>
                }
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
