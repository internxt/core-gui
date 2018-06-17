module.exports = {
    name: 'nodeSettings',
    data: function () {
        return {
            shareList: window.Store.shareList,
        }
        console.log(shareList);
    },
    created: function () {
        this.$parent.displaySlider = true;
        // if(!this.shareList.shares[0].storageAvailable) {
        //     this.shareList.shares[0].errors.push(new Error('Invalid directory selected'));
        //   }
    },
    components: {
        'disk-allocator' : require('../components/disk-allocator')
    },
    methods: {
        changeView: function() {
            this.$router.replace({ path: 'dashboard' });            
        },
        validAllocation: function() {
            return this.store.config.storageAllocation <= this.store.storageAvailable;
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
            <div class="db-data">{{shareList.shares[0].config.rpcPort}}</div>
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
    <!--<disk-allocator
        v-model="shareList.shares[0].config.storageAllocation"
        v-bind:available="shareList.shares[0].storageAvailable">
    </disk-allocator> -->
    <div class="db-widget-container">
        <div class="db-widget">
            <div class="db-title">Disk Space</div>
           <!-- {{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%) -->
            <div class="db-data">{{(shareList.shares[0].meta.farmerState.spaceUsed) ? shareList.shares[0].meta.farmerState.spaceUsed : '0'}} of {{shareList.shares[0].config.storageAllocation}}</div>
            <div class="db-data-small"> to be implemented INXT per month</div>
        </div>
    </div>
</div>
    `
};