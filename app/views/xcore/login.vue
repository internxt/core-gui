<template>
  <div style="margin-top: 150px;">
    <section>
      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>Email Address</h3>
          <input class="input-field" type="text" placeholder="Enter your email address">
        </div>
      </div>
      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>Password</h3>
          <input class="input-field" type="password" placeholder="Enter your password">
        </div>
      </div>
      <div class="db-widget-container">
        <button id="buttonSignIn" style="width: 48%;" v-on:click="signInOnBridge()">Sign in</button>
        <button id="buttonSignUp" style="width: 48%;" v-on:click="openBrowserSignUp()">Sign up</button>
      </div>
    </section>
  </div>
</template>

<script>
"use strict";

const shell = require("electron").shell;

module.exports = {
  name: "login",
  methods: {
    openBrowserSignUp: function() {
      shell.openExternal("https://cloud.internxt.com/");
    },
    signInOnBridge: function() {}
  }
};
</script>