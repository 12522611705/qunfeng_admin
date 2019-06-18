export const config = {
	// 用户列表
	UserAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/list',
			add:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/add',
			exitLogin:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/exitLogin',
			login:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/login',
			menuList:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/menuList',
			adminUserDetailsByToken:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/adminUserDetailsByToken',
			adminUserList:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/adminUserList',
			deleteUser:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/deleteUser',
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/update',
			details:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/details'
		},
		router:{},
		permission:{}
	},
	// 权限管理
	JurisdictionAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/jurisdictionAdmin/list',
			listAll:'http://118.190.145.65:8888/flockpeak-shop/admin/jurisdictionAdmin/listAll'
		}
	},
	// 后台用户等级积分管理
	UserGradeLog:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/userGradeLog/list',
			details:'http://118.190.145.65:8888/flockpeak-shop/admin/userGradeLog/details'
		}
	},
	// 用户环保金额管理
	WalletAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/walletAdmin/list',
			details:'http://118.190.145.65:8888/flockpeak-shop/admin/walletAdmin/details'
		}
	},
	// 环卫车管理
	SanitationCarAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/list',		
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/update',		
			delete:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/delete',		
			details:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/details',		
			add:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/add',	
			exportSanitationCarExcel:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/exportSanitationCarExcel',
			sanitationCarExcel:'http://118.190.145.65:8888/flockpeak-shop/exportExcel/sanitationCarExcel',
		}
	},
	// 角色管理
	RoleAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/list',
			details:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/details',
			delete:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/delete',
			addMenuToRole:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/addMenuToRole',
			addRoleToAdminUser:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/addRoleToAdminUser',
			addRole:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/addRole',
			roleListByUserId:'http://118.190.145.65:8888/flockpeak-shop/admin/roleAdmin/roleListByUserId',
		}
	},
	// 收运费记录
	CollectorLog:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/collectorLog/list',
			exportCollectorLogExcel:'http://118.190.145.65:8888/flockpeak-shop/exportExcel/exportCollectorLogExcel'

		}
	},
	// 推文管理
	Notification:{
		urls:{
			notificationAdd:'http://118.190.145.65:8888/flockpeak-shop/admin/notificationAdmin/notificationAdd',
			notificationDelete:'http://118.190.145.65:8888/flockpeak-shop/admin/notificationAdmin/notificationDelete',
			notificationList:'http://118.190.145.65:8888/flockpeak-shop/admin/notificationAdmin/notificationList',
			notificationPublish:'http://118.190.145.65:8888/flockpeak-shop/admin/notificationAdmin/notificationPublish',
			notificationUpdate:'http://118.190.145.65:8888/flockpeak-shop/admin/notificationAdmin/notificationUpdate'
		}
	},
	// 意见反馈
	Feedback:{
		urls:{
			feedbackList:'http://118.190.145.65:8888/flockpeak-shop/admin/feedbackAdmin/feedbackList'
		}
	},
	// 身份验证管理
	Card:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/cardAdmin/list',
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/cardAdmin/update'
		}
	},
	// 司机管理
	Driver:{
		urls:{
			add:'http://118.190.145.65:8888/flockpeak-shop/admin/driverAdmin/add',
			delete:'http://118.190.145.65:8888/flockpeak-shop/admin/driverAdmin/delete',
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/driverAdmin/list',
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/driverAdmin/update'
		}
	}
	
}