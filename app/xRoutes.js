module.exports = {
  routes: [
    {
      path: '/welcome',
      component: require('./views/xcore/welcome')
    },
    {
      path: '/dashboard',
      component: require('./views/xcore/dashboard')
    },
    {
      path: '/settings',
      component: require('./views/xcore/settings')
    },
    {
      path: '/login',
      component: require('./views/xcore/login')
    }
  ]
};