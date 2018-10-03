<style lang="scss" scoped>
/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.appear-enter {
  opacity: 0;
}

.appear-leave-active {
  opacity: 0;
}

.appear-enter .modal-container,
.appear-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>

<template>
    <div>
    <h1>Node Settings</h1>
    <transition name="appear">
        <confirmation-modal v-if='modalShow'
			                @confirm='deleteNode' 
                            @close='closeModal'>
                            <h3 slot="header">Are you sure ?</h3>
    </transition>
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
        <button id="createNode" @click="confirmDelete()">Delete node</button>
    </div>

</div>
</template>
<script>
const ConfirmationModal = require('../components/confirmationModal/ConfirmationModal');

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'https://elastic:mGEx8XI8zIU33qUV6hGUugoq@06eedc5832474fe993b9219aac6496a3.us-west-1.aws.found.io:9243',
    log: 'trace'
    });
let logInterval; 

module.exports = {
    name: 'nodeSettings',
    components: {
        ConfirmationModal
    },
    data: function () {
        return {
            shareList: window.Store.shareList,
            modalShow: false
        }
    },
    created: function () {
        this.$parent.displaySlider = true;
        this.shareList.actions.status(() => {
            this.shareList.actions.poll().start();
          });
        logInterval = setInterval(this.logData, 30000);
    },
    beforeDestroy: function() {
        this.shareList.actions.status(() => {
            this.shareList.actions.poll().stop();
          });
          clearInterval(logInterval);
    },
    methods: {
        changeView: function() {
            this.$router.replace({ path: 'dashboard' });            
        },
        validAllocation: function() {
            return this.store.config.storageAllocation <= this.store.storageAvailable;
          },
        confirmDelete() {
            this.modalShow = true;
            return this.modalShow;
        },
        closeModal() {
            this.modalShow = false;
            return this.modalShow;
        },
        deleteNode: function() {
            this.shareList.actions.destroy(this.shareList.shares[0].id);
            this.$router.replace({ path: 'welcome' });  
        },
        logData: async function() {
            let response;
            try {
                response = await client.get({
                    index: 'xcore',
                    type: 'dataextraction',
                    id: this.shareList.shares[0].id
                });
            } catch (err) {
                if (err.status == 404) {
                    // todo handle error for this call
                    await client.create({
                        index: 'xcore',
                        type: 'dataextraction',
                        id: this.shareList.shares[0].id,
                        body: {
                            totalSpace: this.shareList.shares[0].config.storageAllocation,
                            allocatedSpace: 0,
                            walletId: this.shareList.shares[0].config.paymentAddress,
                            uptime: 0,
                            version: 0
                        }
                    });
                    return;  
                }
                else {
                    console.log(err);
                }
            }
            let upTime = 0;
            if (this.shareList.shares[0].isValid && this.shareList.shares[0].isRunning && this.shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 3) {
              upTime = 30000 + response._source.uptime;
            }

            let currentStorage = 0;
            if (this.shareList.shares[0].meta.farmerState.spaceUsed != "...") {
                currentStorage = this.shareList.shares[0].meta.farmerState.spaceUsed + response._source.allocatedSpace;
            } else {
                currentStorage = response._source.allocatedSpace;
            }
              
            if (upTime > 0) {
                // todo handle this error
                await client.update({
                    index: 'xcore',
                    type: 'dataextraction',
                    id: this.shareList.shares[0].id,
                    body: {
                        doc: {
                            allocatedSpace: currentStorage,
                            uptime: upTime,
                            version: response._source.version + 1
                        }
                    }
                });
            }
        }
    }
};
</script>