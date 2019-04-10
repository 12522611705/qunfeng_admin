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
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/userAdmin/update'
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
	// 环卫车管理
	SanitationCarAdmin:{
		urls:{
			list:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/list',		
			update:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/update',		
			delete:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/delete',		
			add:'http://118.190.145.65:8888/flockpeak-shop/admin/sanitationCarAdmin/add',		
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
		}
	}
	
	
	
}