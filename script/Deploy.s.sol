// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script} from "forge-std/Script.sol";
import {MutualCredit} from "../contracts/MutualCredit.sol";
contract Deploy is Script {
    function run() external returns (MutualCredit deployed) {
        vm.startBroadcast();
        deployed = new MutualCredit();
        vm.stopBroadcast();
    }
}
