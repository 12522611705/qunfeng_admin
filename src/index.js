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
// 区域管理
import Addres from './routers/Addres';
// 提现管理
import Deposit from './routers/Deposit';
// 回收记录列表
import GarbageLog from './routers/GarbageLog';
// 回收种类及价格推广
import Category from './routers/Category';
// 查询设备管理
import Garbage from './routers/Garbage';

// 用户数据统计
import Quantity from './routers/Quantity';
// 用户量趋势统计
import Trend from './routers/Trend';
// 活跃和非活跃用户
import Active from './routers/Active';
// 垃圾分类设备数据统计
import Sum from './routers/Sum';
// 垃圾分类设备每天数据汇总
import Day from './routers/Day';
// 用户年龄段统计
import Hour from './routers/Hour';
// 查询设备管理
import UserAge from './routers/UserAge';


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
				<Route path="/Addres"						component={Addres}/>
				<Route path="/Deposit"						component={Deposit}/>
				<Route path="/GarbageLog"					component={GarbageLog}/>
				<Route path="/Category"						component={Category}/>
				<Route path="/Garbage"						component={Garbage}/>

				<Route path="/Quantity"						component={Quantity}/>
				<Route path="/Trend"						component={Trend}/>
				<Route path="/Active"						component={Active}/>
				<Route path="/Sum"							component={Sum}/>
				<Route path="/Day"							component={Day}/>
				<Route path="/Hour"							component={Hour}/>
				<Route path="/UserAge"						component={UserAge}/>

			</App>
		</Switch>
	</HashRouter>
), document.getElementById('root'));


// import registerServiceWorker from './registerServiceWorker';
// registerServiceWorker();
