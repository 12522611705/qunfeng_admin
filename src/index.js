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
	

			</App>
		</Switch>
	</HashRouter>
), document.getElementById('root'));


// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
