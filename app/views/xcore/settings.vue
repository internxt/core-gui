<template>
  <div>
    <h1>Node Information</h1>
    <transition name="appear">
        <confirmation-modal v-if='modalShow'
			                @confirm='deleteNode' 
                            @close='closeModal'>
                            <h3 slot="header">Are you sure ?</h3>
    </transition>
    <transition name="appear">
        <update-modal v-if='updateShow'
			                @confirm='confirmUpdate' 
                            @close='cancelUpdate'>
                            <h3 slot="header">New version available.</h3>
    </transition>

    <div class="db-widget-container">
      <div class="db-widget__double">
        <div class="db-widget">
          <div class="db-title tooltip">
            Status
            <span class="tooltiptext">
              <p>State: {{shareList.shares[0].state}}</p>
              <p>Is valid: {{shareList.shares[0].isValid}}</p>
              <p>Is errored: {{shareList.shares[0].isErrored}}</p>
              <p>Is running: {{shareList.shares[0].isRunning}}</p>
              <p>Is stopped: {{shareList.shares[0].isStopped}}</p>
              <p>Connection status: {{shareList.shares[0].meta.farmerState.bridgesConnectionStatus}}</p>
              <p>Peers: {{shareList.shares[0].meta.farmerState.totalPeers}}</p>
              <p>Delta: {{shareList.shares[0].meta.farmerState.ntpStatus.delta}}</p>
            </span>
          </div>
          <!-- need to wait in order to be displayed properly -->
          <div class="db-data" v-if="!isReachable || (shareList.shares[0].meta.farmerState.portStatus.connectionStatus !== 0 && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 3)">Unreachable</div>
          <div
            class="db-data"
            v-else-if="!shareList.shares[0] || !shareList.shares[0].isValid || (shareList.shares[0].isValid && !shareList.shares[0].isRunning) || (!shareList.shares[0].meta.farmerState.bridgesConnectionStatus && shareList.shares[0].meta.farmerState.bridgesConnectionStatus !== 0)"
          >Offline</div>
          <div
            class="db-data"
            v-else-if="!shareList.shares[0].isValid || (shareList.shares[0].isValid && !shareList.shares[0].isRunning) || shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 0"
          >Disconnected</div>
          <div
            class="db-data"
            v-else-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 1"
          >Connecting...</div>
          <div
            class="db-data"
            v-else-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 2"
          >Confirming</div>
          <div
            class="db-data"
            v-else-if="shareList.shares[0].isValid && shareList.shares[0].isRunning && shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 3"
          >Connected</div>
        </div>
        <div class="db-widget">
          <div class="db-title tooltip">
            Uptime
            <span class="tooltiptext">
              <p>Nº of restarts: {{shareList.shares[0].meta.numRestarts}}</p>
            </span>
          </div>
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
      <div class="db-widget__double">
        <div class="db-widget">
          <div class="db-title tooltip">
            Port
            <span class="tooltiptext">
              <p>Connection type: {{shareList.shares[0].meta.farmerState.portStatus.connectionType}}</p>
              <p>Address: {{shareList.shares[0].config.rpcAddress}}:{{shareList.shares[0].config.rpcPort}}</p>
              <p>Status: {{shareList.shares[0].meta.farmerState.portStatus.connectionStatus}}</p>
            </span>
          </div>
          <div
            class="db-data"
          >{{shareList.shares[0].config.rpcPort}} {{shareList.shares[0].meta.farmerState.portStatus.listenPort !== shareList.shares[0].config.rpcPort ? '!' : ''}}</div>
        </div>

        <div class="db-widget">
          <div class="db-title tooltip">
            Disk Space
            <span class="tooltiptext">
              <p>Percentage Used: {{shareList.shares[0].meta.farmerState.percentUsed}}</p>
              <p>Total Used: {{shareList.shares[0].meta.farmerState.spaceUsed}}</p>
              <p>Contracts received: {{shareList.shares[0].meta.farmerState.contractCount}}</p>
              <p>Data received: {{shareList.shares[0].meta.farmerState.dataReceivedCount}}</p>
              <p>Last activity: {{new Date(shareList.shares[0].meta.farmerState.lastActivity).toISOString()}}</p>
            </span>
          </div>
          <div
            class="db-data"
          >{{(shareList.shares[0].meta.farmerState.spaceUsed && shareList.shares[0].meta.farmerState.spaceUsed != '...') ? shareList.shares[0].meta.farmerState.spaceUsed : '0'}} of {{shareList.shares[0].config.storageAllocation}}</div>
        </div>
      </div>
    </div>
    <div class="db-widget-container">
      <button id="createNode" @click="confirmDelete()">Delete node</button>
    </div>
  </div>
</template>
<script>
const ConfirmationModal = require("../components/confirmationModal/ConfirmationModal");
const UpdateModal = require("../components/updateModal/UpdateModal");
const rimraf = require("rimraf");
const Updater = require("./../../lib/updater");
const request = require('request');

module.exports = {
  name: "nodeSettings",
  components: {
    ConfirmationModal,
    UpdateModal
  },
  data: function() {
    return {
      shareList: window.Store.shareList,
      modalShow: false,
      updateShow: false,
      updateUrl: null,
      updateVersion: "1.0.0",
      isReachable: true,
      lastTimeReachabilityChecked: new Date()
    };
  },
  created: function() {
    this.$parent.displaySlider = true;
    this.shareList.actions.status(() => {
      this.shareList.actions.poll().start();
    });

    const updateChecker = new Updater();
    updateChecker.on("new-update", newUpdate => {
      this.updateUrl = newUpdate.url;
      this.updateVersion = newUpdate.version;
      this.updateShow = true;
    });
    updateChecker.checkForUpdates();
    setInterval(() => {
      updateChecker.checkForUpdates();
    }, 60 * 60 * 1000);

    setInterval(() => {
      let lastActivityDate = this.lastTimeReachabilityChecked;
      let currentDate = new Date();

      let diff = (currentDate.getTime() - lastActivityDate.getTime()) / 1000;
      if (diff > 4 * 60 || !this.isReachable || this.shareList.shares[0].meta.farmerState.portStatus.connectionStatus !== 0) {
        console.log('Checking reachability...');
      this.lastTimeReachabilityChecked = new Date();
        this.checkReachability().then(() => {
          console.log('Reachable!');
          this.isReachable = true;
        }).catch(err => {
          this.isReachable = false;
          console.log('Reachability failed:', err);
          console.log('Restarting node...');
          this.shareList.actions.poll().stop();
          this.shareList.actions.poll().start();
        });
      } else {
        console.log('No need to check');
      }
    }, 60 * 1000);
  },
  beforeDestroy: function() {
    this.shareList.actions.status(() => {
      this.shareList.actions.poll().stop();
    });
  },
  methods: {
    changeView: function() {
      this.$router.replace({ path: "dashboard" });
    },
    validAllocation: function() {
      return this.store.config.storageAllocation <= this.store.storageAvailable;
    },
    confirmUpdate() {
      window.open(this.updateUrl, "Download update", "frame=true");
    },
    cancelUpdate() {
      this.updateShow = false;
      return this.updateShow;
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
      var storagePath = this.shareList.shares[0].config.storagePath;

      rimraf(storagePath, () => {
        this.shareList.actions.destroy(this.shareList.shares[0].id);
        this.$router.replace({ path: "welcome" });
        this.closeModal();
      });
    },
    checkReachability: function() {
      return new Promise((resolve, reject) => {
        request.get(`http://${this.shareList.shares[0].config.rpcAddress}:${this.shareList.shares[0].config.rpcPort}`).on('response', response => {
          if (response.statusCode === 405 && response.statusMessage === 'Method Not Allowed') {
            this.isReachable = true;
            resolve();
          } else {
            this.isReachable = false;
            reject(new Error(JSON.stringify({ code: response.statusCode, text: response.statusMessage})));
          }
        }).on('error', err => {
          this.isReachable = false;
          reject(err);
        });
      });
    },
    logData: async function() {
      let response;
      try {
        response = await client.get({
          index: "xcore",
          type: "dataextraction",
          id: this.shareList.shares[0].id
        });
      } catch (err) {
        if (err.status == 404) {
          // todo handle error for this call
          await client.create({
            index: "xcore",
            type: "dataextraction",
            id: this.shareList.shares[0].id,
            body: {
              totalSpace: this.shareList.shares[0].config.storageAllocation,
              allocatedSpace: 0,
              walletId: this.shareList.shares[0].config.paymentAddress,
              uptime: 0,
              version: 0,
              rpcAddress: this.shareList.shares[0].config.rpcAddress,
              rpcPort: this.shareList.shares[0].config.rpcPort,
              contractCount: this.shareList.shares[0].meta.farmerState
                .contractCount,
              dataReceivedCount: this.shareList.shares[0].meta.farmerState
                .dataReceivedCount,
              peers: this.shareList.shares[0].meta.farmerState.totalPeers,
              isErrored: this.shareList.shares[0].isErrored,
              isRunning: this.shareList.shares[0].isRunning,
              isStopped: this.shareList.shares[0].isStopped,
              isValid: this.shareList.shares[0].isValid
            }
          });
          return;
        } else {
          console.log(err);
        }
      }
      let upTime = 0;
      if (
        this.shareList.shares[0].isValid &&
        this.shareList.shares[0].isRunning &&
        this.shareList.shares[0].meta.farmerState.bridgesConnectionStatus === 3
      ) {
        upTime = 30000 + response._source.uptime;
      }

      let currentStorage = 0;
      if (this.shareList.shares[0].meta.farmerState.spaceUsedBytes) {
        currentStorage =
          this.shareList.shares[0].meta.farmerState.spaceUsedBytes +
          response._source.allocatedSpace;
      } else {
        currentStorage = response._source.allocatedSpace;
      }

      if (upTime > 0) {
        // todo handle this error
        await client.update({
          index: "xcore",
          type: "dataextraction",
          id: this.shareList.shares[0].id,
          body: {
            doc: {
              allocatedSpace: currentStorage,
              uptime: upTime,
              version: response._source.version + 1,
              contractCount: this.shareList.shares[0].meta.farmerState
                .contractCount,
              dataReceivedCount: this.shareList.shares[0].meta.farmerState
                .dataReceivedCount,
              peers: this.shareList.shares[0].meta.farmerState.totalPeers,
              isErrored: this.shareList.shares[0].isErrored,
              isRunning: this.shareList.shares[0].isRunning,
              isStopped: this.shareList.shares[0].isStopped,
              isValid: this.shareList.shares[0].isValid
            }
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
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

.db-widget-container button {
  margin: auto;
}

.tooltip {
  position: relative;
  display: inline-block;
}

.tooltip .tooltiptext {
  visibility: hidden;
  width: 150px;
  background-color: #272533;
  color: #fff;
  text-align: left;
  border-radius: 4px;
  padding: 2px !important;

  font-size: 10px;

  /* Position the tooltip */
  position: absolute;
  z-index: 1;

  opacity: 0;
  transition: opacity 3s;
  transition-delay: 4s;

  p {
    margin-left: 3px;
  }
}

.tooltip:hover .tooltiptext {
  visibility: visible;
  opacity: 1;
}
</style>