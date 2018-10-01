 <template>
        <div>
            <h1>Network Data</h1>
            <div class="db-widget-container">
                <div class="db-widget">
                    <div class="db-title">Status</div>
                    <!-- need to wait in order to be displayed properly -->
                    <div class="db-data" v-if="!shareList.shares[0].isValid || (shareList.shares[0].isValid && !shareList.shares[0].isRunning) || shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 0">Disconnected</div>
                    <div class="db-data" v-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 1">Connecting</div>
                    <div class="db-data" v-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 2">Confirming</div>
                    <div class="db-data" v-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 3">Connected</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">Uptime</div>
                    <div class="db-data">{{shareList.shares[0].meta.uptimeReadable}}</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">Upload Speed</div>
                    <div class="db-data">190 kb/s</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">Download Speed</div>
                    <div class="db-data">135 kb/s</div>
                </div>
            </div>
            <h1>Current Earnings</h1>
            <div class="db-widget-container">
                <div class="db-widget">
                    <div class="db-title">Per Week</div>
                    <div class="db-data">0.35616 INXT</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">Per Month</div>
                    <div class="db-data">1.52638 INXT</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">Per Year</div>
                    <div class="db-data">18.3165 INXT</div>
                </div>
                <div class="db-widget">
                    <div class="db-title">All Time</div>
                    <div class="db-data">14.9552 INXT</div>
                </div>
            </div>
        </div>
        </template>
<script>
const winston = require('winston');
require('winston-logstash');

module.exports = {
    name: 'dashboard',
    data: function () {
        return {
            shareList: window.Store.shareList,
        }
    },
    beforeCreate: function() {
        winston.add(winston.transports.Logstash, {
            port: 28777,
            node_name: 'my node name',
            host: '127.0.0.1'
          });
    },
    created: function () {
        this.$parent.displaySlider = true;
        this.shareList.actions.status(() => {
            this.shareList.actions.poll().start();
          });
          setInterval(logData, 10000);
    },
    beforeDestroy: function () {
        this.shareList.actions.status(() => {
            this.shareList.actions.poll().stop();
          });
    },
    methods: {
        changeView: function() {
            this.$router.replace({ path: 'settings' });            
        },
        logData: function() {
            // TODO
        }
    }
};
</script>