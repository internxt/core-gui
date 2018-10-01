'use strict';
const {homedir} = require('os');
const VueRouter = require('vue-router');
const router = new VueRouter(require('./xRoutes'));
const utils = require('storjshare-daemon').utils;

var vm = new Vue({
  router,
  el: '#xApp',

  data: {shareList: window.Store.shareList, displaySlider : false},
  components: {
    'welcome': require('./views/xcore/welcome'),
    'settings': require('./views/xcore/settings'),
    'dashboard': require('./views/xcore/dashboard'),
    'civic': require('./views/xcore/civic')
  },
  methods: {
    changeView: function() {
      router.replace({ path: 'settings' });            
    }
  },
  created: function() {
    this.shareList.actions.load((err) => {
      this.shareList.actions.status(() => {
        //Check to see if any of the shares aren't using Ethereum addresses
        if(this.shareList.shares.length === 0) {
          // civic
          router.replace('civic');
        } else {
          router.replace('settings');
        }
      });
    });
  }
});

// document.getElementById("ViewChange").onclick = function () {
// 	vm.$refs.foo.changeView();
// };
