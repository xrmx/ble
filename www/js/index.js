/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    bleDevices: {
    },
    bleStatus: {
        scanStarted: 0
    },
    bleDiscoverDroidSuccess: function(status) {
        var services = status["services"];
        console.log(services);
        for (var i=0; i < services.length; i++) {
            var buf = services[i]["serviceUuid"];
            for (var j=0; j < services[i]["characteristics"].length; j++) {
                var chars = services[i]["characteristics"][j];
                buf += " " + chars["characteristicUuid"] + " descriptors " + chars["descriptors"];
            }
            console.log(buf);
        }
    },
    bleConnectSuccess: function(status) {
        console.log("bleConnectSuccess: " + status["status"] + " " + device.platform);
        if (status["status"] != "connected")
            return;
        if (device.platform == "Android")
            bluetoothle.discover(app.bleDiscoverDroidSuccess, app.bleFail);
    },
    bleConnect: function(e) {
        var target = e.target || e.srcElement;
        if (target.nodeName != 'A')
            return false;
        bluetoothle.connect(app.bleConnectSuccess, app.bleFail, { "address": target.dataset.address });
        return false;
    },
    bleScanStop: function() {
        var elContainer = document.getElementById("bledevices");
        elContainer.innerHTML = "";
        for (var key in app.bleDevices) {
            var el = app.bleDevices[key];
            elContainer.innerHTML += "<a class='bledevice' data-address='"+ el.address +"' href=''>address:"+ el.address + " name:" + el.name + " rssi:" + el.rssi + "</a><br />";
        }
    },
    bleScanUpdate: function(status) {
        if (status["status"] != "scanResult")
            return;

        var address = status["address"];
        var name = status["name"];
        var rssi = status["rssi"];
        // RACY
        app.bleDevices[address] = {
            address: address,
            name: name,
            rssi: rssi
        };

        var now = Date.now();
        // stop scanning after one minute
        if (now - app.bleStatus.scanStarted > 60)
            bluetoothle.stopScan(app.bleScanStop, app.bleFail);
    },
    bleScan: function(status) {
        bluetoothle.startScan(app.bleScanUpdate, app.bleFail, {});
        app.bleStatus.scanStarted = Date.now();
    },
    bleFail: function() {
        console.log("Bluetooth Low Energy Epic Fail");
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        bluetoothle.initialize(app.bleScan, app.bleFail);

        var rescan = document.getElementById("blerescan");
        rescan.addEventListener('click', app.bleScan, false);

        var devices = document.getElementById("bledevices");
        devices.addEventListener('click', app.bleConnect, false);
    }
};
