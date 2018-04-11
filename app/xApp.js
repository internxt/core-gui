'use strict';
const {homedir} = require('os');
const VueRouter = require('vue-router');
const router = new VueRouter(require('./routes'));
const utils = require('storjshare-daemon').utils;

module.exports = {
  router,
  el: '#xApp',
  data: window.Store.shareList,
  components: {
    'dashboard': require('./views/xcore/dashboard')
  },
  created: function() {
    this.actions.load((err) => {
      this.actions.status(() => {
        //Check to see if any of the shares aren't using Ethereum addresses
        
      });
    });
  }
};
