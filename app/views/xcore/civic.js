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
            var timer = setInterval(function() {
                if(document.getElementById("civicFrame").contentWindow.document.getElementById('token').innerText.length > 0) {
                    clearInterval(timer);
                    return this.$router.push({ path: '/welcome' });
                    // router.replace('welcome');
                }
               
            }, 2000);
        }
    },
    template: `
    <iframe id="civicFrame" src="http://internxt.com/civic"  width="400" height="400" style="border:none;"></iframe>`
};