'use strict';

const about = require('../../package');
const daemonPackage = require('xcore-daemon/package');
const {ipcRenderer: ipc} = require('electron');

module.exports = {
  components: {
    'modal': require('../components/modal')
  },
  data: function() {
    return {
      isVisible: false
    };
  },
  methods: {
    close: function() {
      this.isVisible = false;
    }
  },
  created: function() {
    ipc.on('showAboutDialog', () => {
      this.isVisible = true;
    });
  },
  template: `
<modal v-bind:show="isVisible">
  <div slot="header">
    <h4 class="modal-title">About X Core</h4>
  </div>

  <div slot="body">
   <a href="https://internxt.io/whitepaper.pdf">X Core section</a> 
  </div>

  <div slot="footer">
    <button type="button" class="btn btn-blue" v-on:click="close">Close</button>
  </div>
</modal>
  `
};
