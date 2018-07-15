// const VueRouter = require('vue-router');
// const router = new VueRouter(require('../.././xRoutes'));

module.exports = {
    // router,
    name: 'civic',
    data: function () {
        return {
            civicSip: null
        }
        console.log("kita");
    },
    created: function () {
        this.civicVerification();
    },
    methods: {
        civicVerification: function () {
            var self = this;
            var timer = setInterval(function() {
                if(document.getElementById("civicFrame").contentWindow.document.getElementById('token').innerText.length > 0) {
                    clearInterval(timer);
                    return self.$router.push({ path: '/welcome' });
                }
               
            }, 2000);
        }
    },
    template: `
    <iframe id="civicFrame" src="http://internxt.com/civic" style="position: fixed;
    top: -35px;
    left: -20px;
    bottom: 0px;
    right: 0px;
    width: 109%;
    height: 111.1%;
    border: none;
    margin: 0px;
    padding: 0px;
    overflow: hidden;
    z-index: 999999;"></iframe>`
};