'use strict';

module.exports = {
  components: {
    'ext-a' : require('../components/external-anchor')
  },
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6 text-left">
        <ext-a href="https://internxt.io/core"><small>X Core</small></ext-a>
      </div>
      <div class="col-6 text-right">
        <small>Setup Wizard</small>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <img src="imgs/logo-inxt.png" alt="X Core" class="logo logo-wizard">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>Welcome to X Core!</h2>
        <p>Using X Core, you can earn INXT tokens <br class="hidden-sm-down">by renting out your extra hard drive space.</p>
        <router-link :to="{path: '/share-wizard/wizard1'}" class="btn mt-3">Start Setup</router-link>
        <div class="text-center mt-3">
          <small><router-link :to="{path: '/overview'}">I'm an experienced user, skip setup</router-link></small>
        </div>
      </div>
    </div>
  </div>
</section>
  `
};
