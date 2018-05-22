'use strict';
const {homedir} = require('os');
const VueRouter = require('vue-router');
const router = new VueRouter(require('./xRoutes'));
const utils = require('storjshare-daemon').utils;

var vm = new Vue({
  router,
  el: '#xApp',
  data: window.Store.shareList,
  components: {
    'welcome': require('./views/xcore/welcome')
  },
  methods: {
    changeView: function() {
      router.replace({ path: 'settings' });            
    }
  },
  created: function() {
    this.actions.load((err) => {
      this.actions.status(() => {
        //Check to see if any of the shares aren't using Ethereum addresses
        if(this.shares.length === 0) {
          router.replace('welcome');
        } else {
          router.replace('dashboard');
        }
      });
    });
  }
});

document.getElementById("ViewChange").onclick = function () {
	vm.$refs.foo.changeView();
};
