import React, { Component } from 'react';
import { Icon } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

class component extends Component{
    render(){
        return (
            <div className="content">
                <div style={{textAlign:'center',color:'#1890ff',marginTop:'150px',fontSize:'40px'}}>欢迎登录</div>
            </div>
        );
    }
}
const Welcome = withRouter(component);
export default Welcome;
