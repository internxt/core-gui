// const VueRouter = require('vue-router');
// const router = new VueRouter(require('../.././xRoutes'));
<template>
    <iframe id="civicFrame" src="http://internxt.com/civic" 
        style="position: fixed;
            top: -42px;
            left: -26px;
            width: 112%;
            height: 114%;">
    </iframe>
</template>
<script>
module.exports = {
  // router,
  name: "civic",
  data: function() {
    return {
      civicSip: null
    };
    console.log("kita");
  },
  created: function() {
    this.civicVerification();
  },
  methods: {
    civicVerification: function() {
      var self = this;
      var timer = setInterval(function() {
        if (
          document
            .getElementById("civicFrame")
            .contentWindow.document.getElementById("token").innerText.length > 0
        ) {
          clearInterval(timer);
          return self.$router.push({ path: "/welcome" });
        }
      }, 2000);
    }
  }
};
</script>