module.exports = {
    name: 'nodeSettings',
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
            this.$router.replace({ path: 'dashboard' });            
        }
    },
    template: `
    <div>
    <h1>Node Settings</h1>
    <div class="db-widget-container">
        <div class="db-widget">
            <div class="db-title">Wallet Address</div>
            <div class="db-data">{{shareList.shares[0].config.paymentAddress}}</div>
        </div>
    </div>

    <div class="db-widget-container">
        <div class="db-widget">
            <div class="db-title">Node Identity</div>
            <div class="db-data">{{shareList.shares[0].id}}</div>
        </div>
    </div>

    <div class="db-widget-container">
        <div class="db-widget">
            <div class="db-title">File Storage Location</div>
            <div class="db-data">{{shareList.shares[0].config.storagePath}}</div>
        </div>
    </div>

    <div class="db-widget-container">
        <div class="db-widget-small">
            <div class="db-title">Port</div>
            <div class="db-data">45000</div>
        </div>
        <div class="db-widget-small">
            <div class="db-title">Seed</div>
            <div class="db-data">3</div>
        </div>
        <div class="db-widget-small">
            <div class="db-title">Peer</div>
            <div class="db-data">{{shareList.shares[0].meta.farmerState.totalPeers}}</div>
        </div>
    </div>

    <div class="db-widget-container">
        <div class="db-widget">
            <div class="db-title">Disk Space</div>
            <div class="db-data">170GB of 300GB</div>
            <div class="db-data-small"> 0.054646 INXT per month</div>
        </div>
    </div>
</div>
    `
};