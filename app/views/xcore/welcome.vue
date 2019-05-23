<template>
  <div>
    <section>
      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>Wallet Address</h3>
          <input
            v-model="newShare.config.paymentAddress"
            class="input-field"
            type="text"
            placeholder="Enter an ERC20 wallet address"
          >
        </div>
        <p class="error-message" v-for="error in errorsWalletAddress" :key="error">{{error}}</p>
      </div>
      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>File Storage Location</h3>
          <input
            style="display:none"
            id="fileStorage"
            v-on:change="handleFileInput"
            class="input-field"
            type="file"
            placeholder="Select a location to store user files"
            webkitdirectory
            directory
            multiple
          >
          <div class="db-widget-long__upload">
            <label id="storagePath">Select a location to store user files</label>
            <img id="uploadImg" src="imgs/xcore/upload.png">
          </div>
        </div>
        <p class="error-message" v-for="error in errorsPath" :key="error">{{error}}</p>
      </div>
      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>Storage Allocated</h3>
          <input
            v-model="newShare.config.storageAllocation"
            v-bind:available="newShare.storageAvailable"
            class="input-field"
            type="text"
            placeholder="Enter amount of storage in megabytes"
          >
        </div>
        <p class="error-message" v-for="error in errorsStorageAllocation" :key="error">{{error}}</p>
      </div>

      <div class="db-widget-container">
        <div class="db-widget-long">
          <h3>IP Address</h3>
          <input
            v-model="newShare.config.rpcAddress"
            class="input-field"
            type="text"
            placeholder="Enter your IP Address"
          >
        </div>
        <p class="error-message" v-for="error in errorsHostname" :key="error">{{error}}</p>
      </div>

      <div class="db-widget-container">
        <button id="createNode" v-on:click="saveToDisk()">Create your node</button>
      </div>
    </section>
  </div>
</template>
<script>
"use strict";
const electron = require("electron");
var net = require("net");

module.exports = {
  name: "welcome",
  data: function() {
    return {
      errorsWalletAddress: [],
      errorsPath: [],
      errorsStorageAllocation: [],
      errorsHostname: [],
      displaySlider: false,
      newShare: window.Store.newShare,
      shareList: window.Store.shareList,
      MAXPORTNUM: 65536,
      MINPORTNUM: 1024,
      uiState: {
        isChecking: false
      },
      invalidPort: {
        port: -1,
        message: ""
      }
    };
  },
  beforeCreated: function() {
    this.newShare.actions.reset();
  },
  created: function() {
    //Set tunnel options to 0 to prepare for removal of tunneling
    this.$set(this.newShare.config, "maxTunnels", 0);
    this.$set(this.newShare.config, "tunnelGatewayRange", {
      min: 0,
      max: 0
    });
    //Pre-fill their first payment address if they already have a share
    if (window.Store.shareList.shares.length > 0) {
      this.$set(
        this.newShare.config,
        "paymentAddress",
        window.Store.shareList.shares[0].config.paymentAddress
      );
    }
    if (!this.newShare.storageAvailable) {
      this.newShare.errors.push(new Error("Invalid directory selected"));
    }
    // selecting random port
    let self = this;
    this.getFreePort(function(err, port) {
      self.$set(self.newShare.config, "rpcPort", port);
    });
  },
  mounted: function() {
    this.bindUploadIcon();
  },
  methods: {
    checkEthereumAddress: function(address) {
      const utils = require("storjshare-daemon").utils;
      return utils.isValidEthereumAddress(address);
    },
    handleFileInput: function(event) {
      this.$set(
        this.newShare.config,
        "storagePath",
        event.target.files[0].path
      );
      this.newShare.actions.getFreeDiskSpace(
        this.newShare.config.storagePath,
        () => {}
      );
      document.getElementById("storagePath").style.color = "white";
      document.getElementById("storagePath").style.fontSize = "13.3333px";
    },
    pathIsValid: function() {
      for (let i = 0; i < this.shareList.shares.length; i++) {
        let share = this.shareList.shares[i];
        if (share.config.storagePath === this.newShare.config.storagePath) {
          this.buttonText = "Location In Use";
          return false;
        }
      }
      if (!path.isAbsolute(this.newShare.config.storagePath)) {
        this.buttonText = "Invalid Location";
        return false;
      }
      this.buttonText = "Select Location";
      return true;
    },
    getFreePort: function(fn) {
      var server = net.createServer();
      var calledFn = false;

      server.on("error", function(err) {
        server.close();

        if (!calledFn) {
          calledFn = true;
          fn(err);
        }
      });

      server.listen(0, function() {
        var port = server.address().port;
        server.close();

        if (!calledFn) {
          calledFn = true;

          if (!port) {
            fn(new Error("Unable to get the server's given port"));
          } else {
            fn(null, port);
          }
        }
      });
    },
    getRandomValidPort: function() {
      return (
        Math.floor(Math.random() * (this.MAXPORTNUM - this.MINPORTNUM)) +
        this.MINPORTNUM
      );
    },
    portIsAvailable: function(port, callback) {
      const utils = require("storjshare-daemon").utils;
      return utils.portIsAvailable(port, callback);
    },
    checkPort: function() {
      // this.continueButtonText = 'Checking...'; // TODO izmeniti ovo i ispod
      // this.uiState.isChecking = true;
      let self = this;
      this.portIsAvailable(this.newShare.config.rpcPort, function(err, result) {
        if (err || !result) {
          self.invalidPort.port = self.newShare.config.rpcPort;
          self.invalidPort.message =
            err || `Port ${self.invalidPort.port} appears to be in use`;
          self.uiState.isChecking = false;
          self.continueButtonText = "Next";
        } else {
          self.uiState.isChecking = false;
        }
      });
    },
    openPortSetup: function() {
      electron.shell.openExternal("https://internxt.com/portsetup");
    },
    validAllocation: function() {
      return (this.newShare.config.storageAllocation <= this.newShare.storageAvailable);
    },
    validAddress: function() {
      return (
        this.newShare.config.rpcAddress &&
        this.newShare.config.rpcAddress.length !== 0
      );
    },
    saveToDisk: function() {
      const maxStorageAllocation = 8 * 1024 * 1024; // 8 Terabytes
      this.errorsStorageAllocation = [];
      this.errorsHostname = [];
      this.errorsWalletAddress = [];
      this.errorsPath = [];

      /**
       * Check if ERP20 Wallet Address is valid.
       */

      const regex_ERP20 = new RegExp(/^0x[0-9A-Za-z]{40}$/g);

      if (!regex_ERP20.test(this.newShare.config.paymentAddress)) {
        this.errorsWalletAddress.push("Invalid wallet address format");
      } else if (!this.checkEthereumAddress(this.newShare.config.paymentAddress)) {
        this.errorsWalletAddress.push("Invalid wallet address (storj check)");
      }

      /**
       * Check path is not null
       */

      let storagePath = document.getElementById("fileStorage");

      if (!storagePath.value) {
        this.errorsPath.push("Choose a directory");
      }

      /**
       * Check if storage allocation is only written in numbers
       */

      let allocationMatch = /^([0-9]+)([Tt]|[Mm]|[Gg]|[Kk])?([Bb])?$/g.exec(
        this.newShare.config.storageAllocation.toString()
      );

      if (!allocationMatch) {
        this.errorsStorageAllocation.push("Storage allocation can only be numeric");
      }

      if (allocationMatch != null && false /* && allocationMatch[1] > maxStorageAllocation */) {
        this.errorsStorageAllocation.push("Storage allocation can be 8Tb maximum");
      }

      if (!this.errorsHostname.length && !this.errorsStorageAllocation.length) {
        let configPath = this.newShare.actions.createShareConfig();
        if (configPath) {
          this.shareList.actions.import(configPath, err => {
            if (!err) {
              return this.$router.push({ path: "/settings" });
            }
          });
        }
      }
    },
    bindUploadIcon: function() {
      var self = this;
      var imgBtn = document.getElementById("uploadImg");
      var fileBtn = document.getElementById("fileStorage");
      var storagePath = document.getElementById("storagePath");

      storagePath.addEventListener("click", function(e) {
        document.getElementById("fileStorage").click();
      });

      imgBtn.addEventListener("click", function(e) {
        document.getElementById("fileStorage").click();
      });
      fileBtn.addEventListener("change", function(e) {
        storagePath.innerText = fileBtn.files[0].path;
      });
    }
  }
};
</script>
