import React, { Component } from 'react';
import { Input, Select } from 'antd';

// router
// import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import addons from 'react-addons-update';
import update from 'react-update';


class component extends Component{
    constructor(props){
        super(props)
        const _this = this;
        this.update = update.bind(this);
        this.state = {
            
        }
    }
    componentDidMount(){
        
    }
    componentWillUnmount() {

    }
    componentWillReceiveProps(nextProps) {
        
    }
    render(){
        const _this = this;
        const state = _this.state;
        const update = _this.update;
       
        return (
            <div className="content">
                
               
            </div>
        );
    }
}
const App = withRouter(component);
export default App;
