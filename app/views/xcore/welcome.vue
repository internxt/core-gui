<template>
    <div>
        <section>
            <div class="db-widget-container">
                <div class="db-widget-long">
                    <h3>Wallet Address</h3>
                    <input  v-model="newShare.config.paymentAddress"
                            class="input-field" 
                            type="text" 
                            placeholder="Enter an ERC20 wallet address">
                </div>
            </div>
            <div class="db-widget-container">
                <div class="db-widget-long">
                    <h3>File Storage Location</h3>
                    <input style="display:none" id="fileStorage" v-on:change="handleFileInput" class="input-field" type="file" placeholder="Select a location to store user files" webkitdirectory directory multiple/>
                    <div class="db-widget-long__upload">
                        <label id="storagePath">Select a location to store user files</label>
                        <img id="uploadImg" src="imgs/xcore/upload.png">
                    </div>
                </div>
            </div>
            <div class="db-widget-container">
                <div class="db-widget-long">
                    <h3>Storage Allocated</h3> 
                    <input v-model="newShare.config.storageAllocation" v-bind:available="newShare.storageAvailable" class="input-field" type="text" placeholder="Enter amount of storage in megabytes">
                </div>
            </div>
            <!-- <div class="db-widget-container">
                <div class="db-widget-long">
                    <h3>Port Number</h3> <img id="portSetup" @click="openPortSetup" src="imgs/xcore/info-icon.png">
                    <input v-model.number="newShare.config.rpcPort" class="input-field" type="text" placeholder="Enter your routers port number">
                </div>
            </div> -->
            <div class="db-widget-container">
                <div class="db-widget-long">
                    <h3>Hostname</h3>
                    <input v-model="newShare.config.rpcAddress" class="input-field" type="text" placeholder="Enter your IP here">
                </div>
            </div>
            <div class="db-widget-container">
                <button id="createNode" v-on:click="saveToDisk()">Create your node</button>
            </div>
            <div class="db-widget-container" v-if="errors.length">
                <p class="error-message" v-for="error in errors" :key="error">
                    {{error}}
                </p>
            </div>
            <!-- <img id="connectionImg" @click="chooseRandomPort" src="imgs/xcore/connection.png"> -->
        </section>
    </div>
</template>
<script>
'use strict';
const electron = require('electron');
var net = require('net');

module.exports = {
    name: 'welcome',
    data: function () {
        return {
            errors: [],
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
                message: ''
            },
        };
    },
    beforeCreated: function () {
        this.newShare.actions.reset();        
    },
    created: function () {
        //Set tunnel options to 0 to prepare for removal of tunneling
        this.$set(this.newShare.config, 'maxTunnels', 0);
        this.$set(this.newShare.config, 'tunnelGatewayRange', {
            min: 0,
            max: 0
        });
        //Pre-fill their first payment address if they already have a share
        if (window.Store.shareList.shares.length > 0) {
            this.$set(this.newShare.config, 'paymentAddress', window.Store.shareList.shares[0].config.paymentAddress);
        }
        if (!this.newShare.storageAvailable) {
            this.newShare.errors.push(new Error('Invalid directory selected'));
        }
        // selecting random port
        let self = this;
        this.getFreePort(function (err, port) {
            self.$set(self.newShare.config, 'rpcPort', port);
        })
    },
    mounted: function() {
        this.bindUploadIcon();
    },
    methods: {
        checkEthereumAddress: function (address) {
            const utils = require('storjshare-daemon').utils;
            return utils.isValidEthereumAddress(address);
        },
        handleFileInput: function (event) {
            this.$set(this.newShare.config, 'storagePath', event.target.files[0].path);
            this.newShare.actions.getFreeDiskSpace(this.newShare.config.storagePath, () => {});
            document.getElementById('storagePath').style.color = "white";
            document.getElementById('storagePath').style.fontSize = "13.3333px"
        },
        pathIsValid: function () {
            for (let i = 0; i < this.shareList.shares.length; i++) {
                let share = this.shareList.shares[i];
                if (share.config.storagePath === this.newShare.config.storagePath) {
                    this.buttonText = 'Location In Use';
                    return false;
                }
            }
            if (!path.isAbsolute(this.newShare.config.storagePath)) {
                this.buttonText = 'Invalid Location';
                return false;
            }
            this.buttonText = 'Select Location';
            return true;
        },
        // chooseRandomPort: function () {
        //     this.$set(this.newShare.config, 'rpcPort', this.getRandomValidPort());
        // },
        // chooseRandomPort: function () {
        //     let self = this;
        //     this.getFreePort(function (err, port) {
        //         self.$set(self.newShare.config, 'rpcPort', port);
        //         // console.log(port)
        //         // if (err) throw err;
        //         // return port;
        //     })
            
        // },
        getFreePort: function (fn) {
            var server = net.createServer();
            var calledFn = false;

            server.on('error', function (err) {
                server.close();

                if (!calledFn) {
                    calledFn = true;
                    fn(err);
                }

            });

            server.listen(0, function () {
                var port = server.address().port;
                server.close();

                if (!calledFn) {
                    calledFn = true;

                    if (!port) {
                        fn(new Error('Unable to get the server\'s given port'));
                    } else {
                        fn(null, port);
                    }
                }
            });
        },
        getRandomValidPort: function () {
            return Math.floor(Math.random() * (this.MAXPORTNUM - this.MINPORTNUM)) + this.MINPORTNUM;
        },
        portIsAvailable: function (port, callback) {
            const utils = require('storjshare-daemon').utils;
            return utils.portIsAvailable(port, callback);
        },
        checkPort: function () {
            // this.continueButtonText = 'Checking...'; // TODO izmeniti ovo i ispod
            // this.uiState.isChecking = true;
            let self = this;
            this.portIsAvailable(this.newShare.config.rpcPort, function (err, result) {
                if (err || !result) {
                    self.invalidPort.port = self.newShare.config.rpcPort;
                    self.invalidPort.message = err || `Port ${self.invalidPort.port} appears to be in use`;
                    self.uiState.isChecking = false;
                    self.continueButtonText = 'Next';
                } else {
                    self.uiState.isChecking = false;
                }
            });
        },
        openPortSetup: function() {
            electron.shell.openExternal("https://internxt.com/portsetup");
        },
        validAllocation: function() {
            return this.newShare.config.storageAllocation <= this.newShare.storageAvailable;
        },
        validAddress: function() {
            return this.newShare.config.rpcAddress && this.newShare.config.rpcAddress.length !== 0;
        },
        saveToDisk: function() {

            this.errors = [];
            /**
             * Check if storage allocation is only written in numbers
             */
            if (!this.newShare.config.storageAllocation || isNaN(this.newShare.config.storageAllocation)) {
                this.errors.push('Storage allocation can be only numeric');
            }

            /**
             * Includes localhost, and all valid IP adresses 
             */
            const regex = new RegExp(/^localhost$|^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)
            if(!regex.test(this.newShare.config.rpcAddress)) {
                this.errors.push('Invalid host name');
            }

            console.log(...this.errors)

            if (!this.errors.length) {
                let configPath = this.newShare.actions.createShareConfig();
                if(configPath) {
                  this.shareList.actions.import(configPath, (err) => {
                    if(!err) {
                      return this.$router.push({ path: '/settings' });
                    }
                  });
                }
            }

        },
        bindUploadIcon: function() {
            var self = this;
            var imgBtn = document.getElementById('uploadImg');
            var fileBtn = document.getElementById('fileStorage');
            var storagePath = document.getElementById('storagePath');
            imgBtn.addEventListener('click', function(e) {
                document.getElementById('fileStorage').click();
            });
            fileBtn.addEventListener('change', function(e) {
                storagePath.innerText = fileBtn.files[0].path;
            })
        }
    }
};
</script>