module.exports = {
    name: 'dashboard',
    data: function () {
        return {
            shareList: window.Store.shareList,
        }
    },
    created: function () {
        this.$parent.displaySlider = true;
    },
    methods: {
        changeView: function() {
            this.$router.replace({ path: 'settings' });            
        }
    },
    template: `
        <div>
            <h1>Network Data</h1>
            <div class="db-widget-container">
                <div class="db-widget">
                    <div class="db-title">Status</div>
                    <div class="db-data">{{shareList.shares.length}}</div>
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
    `
};