import React from 'react';
import ReactDOM from 'react-dom';
import { Route, Switch, HashRouter } from 'react-router-dom';

import { Ajax } from './utils/global';
import { config } from './utils/config';

// 首页
import App from './App';
// 用户列表页面
import Index from './routers/Index';
// 环卫车管理页面
import Car from './routers/Car';
// 角色管理页面
import Role from './routers/Role';
// 收运费记录
import CollectorLog from './routers/CollectorLog';
// 后台用户列表
import AdminUser from './routers/AdminUser';
// 推文管理
import Notification from './routers/Notification';
// 司机管理
import Driver from './routers/Driver';
import Card from './routers/Card';
import Feedback from './routers/Feedback';

// 欢迎登录
import Welcome from './routers/Welcome';


ReactDOM.render((
	<HashRouter>
		<Switch>
			<App>
				
				<Route path="/" exact 						component={Index}/>
				<Route path="/Car" 							component={Car}/>
				<Route path="/Role"							component={Role}/>
				<Route path="/CollectorLog"					component={CollectorLog}/>
				<Route path="/AdminUser"					component={AdminUser}/>
				<Route path="/Notification"					component={Notification}/>

				<Route path="/Driver"						component={Driver}/>
				<Route path="/Card"							component={Card}/>
				<Route path="/Feedback"						component={Feedback}/>
				<Route path="/Welcome"						component={Welcome}/>
	

			</App>
		</Switch>
	</HashRouter>
), document.getElementById('root'));


// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
