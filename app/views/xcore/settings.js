module.exports = {
    name: 'nodeSettings',
    data: function () {
        return {
            shareList: window.Store.shareList,
        }
    },
    created: function () {
        this.$parent.displaySlider = true;
        this.shareList.actions.status(() => {
            this.shareList.actions.poll().start();
          });
    },
    destroyed: function() {
        this.store.actions.poll().stop();
    },
    methods: {
        changeView: function() {
            this.$router.replace({ path: 'dashboard' });            
        },
        validAllocation: function() {
            return this.store.config.storageAllocation <= this.store.storageAvailable;
          },
        deleteNode: function() {
            this.shareList.actions.destroy(this.shareList.shares[0].id);
            this.$router.replace({ path: 'welcome' });  
        }
    },
    template: `
    <div>
    <h1>Node Settings</h1>
    <div class="db-widget-container">
        <div class="db-widget__double">
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
        </div>
    </div>
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
        <div class="db-widget__triple">
            <div class="db-widget">
                <div class="db-title">Port</div>
                <div class="db-data">{{shareList.shares[0].config.rpcPort}}</div>
            </div>
            <div class="db-widget">
                <div class="db-title">Peer</div>
                <div class="db-data">{{shareList.shares[0].meta.farmerState.totalPeers}}</div>
            </div>
            <div class="db-widget">
                <div class="db-title">Disk Space</div>
            <!-- {{share.meta.farmerState.spaceUsed}} ({{share.meta.farmerState.percentUsed}}%) -->
                <div class="db-data">{{(shareList.shares[0].meta.farmerState.spaceUsed) ? shareList.shares[0].meta.farmerState.spaceUsed : '0'}} of {{shareList.shares[0].config.storageAllocation}}</div>
                <!-- <div class="db-data-small"> to be implemented INXT per month</div> -->
            </div>
        </div>
    </div>
    <!--<disk-allocator
        v-model="shareList.shares[0].config.storageAllocation"
        v-bind:available="shareList.shares[0].storageAvailable">
    </disk-allocator> -->
    <div class="db-widget-container">
        <button id="createNode" v-on:click="deleteNode()">Delete node</button>
    </div>

</div>
    `
};