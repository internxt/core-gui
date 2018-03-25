'use strict';

module.exports = {
  template: `
<section>
  <div class="container">
    <div class="row wizard-nav">
      <div class="col-6 text-left">
        <a href="https://internxt.io/core"><small>X Core</small></a>
      </div>
      <div class="col-6 text-right">
        <small>Finished</small>
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <img src="imgs/logo-inxt.png" alt="X Core" class="logo logo-wizard">
      </div>
    </div>
    <div class="row text-center">
      <div class="col-12">
        <h2>You are amazing!</h2>
        <p>You have successfully configured X Core. <br class="hidden-sm-down">Keep on sharing and earning INXT.</p>
        <router-link :to="{path: '/overview'}" class="btn mt-3">Finish</router-link>
      </div>
    </div>
  </div>
</section>
  `
};
