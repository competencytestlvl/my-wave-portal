// SPDX-License-Identifier: UNLICENSED

// Define Solidity version to use
pragma solidity ^0.8.4;

import "hardhat/console.sol";

// Create contract
contract WavePortal {
    
    // State variable store permanantly in contract with Unassigned integer to hold number of waves. Initally set to 0
    uint256 totalWaves;
    // Random number generation
    /* variables is private for the smart contract scope - can't be accessed or modified from other smart contracts. 
    but values can be read freely outside the blockchain*/
    uint private seed;

    // Solidity event to log the current state of the contract to transaction log and captured on client
    event NewWave(address indexed from, uint256 timestamp, string message);

    // Create a custom datatype - struct with properties waver, message and timestamp
    struct Wave {
       address waver; // Address of user who used the function
       string message; // Message that the user sent
       uint timestamp;  // Timestamp that the function was activated
    }

    // The variable below stores an array of structs to hold the waves
    Wave[] waves;

    // Map an addres to a number for the latest time user called the wave function
    mapping(address => uint) latestWaveAt;

    // Constructor that will run with each instantiation of the contract
    constructor() payable {
        console.log("Contract initialized");
        // define initial seed number
        // block difficulty tells miners how hard to mine based on transactions within block 
        // block timestamp is the Unix timestamp of the block being processed
        seed = (block.timestamp + block.difficulty) % 100;
    }

    // Custom publically visible function similar to public API endpoint
    // The message parameter is based on what the user sends via the frontend
    function wave(string memory _message) public{
        // Set current timestamp at least 15 min more than the previous recorded timestamp (cooldown period)
        require((latestWaveAt[msg.sender] + 5 minutes) < block.timestamp, "Reswpan time is 5 minutes.");
        // Update the current timestamp of user
        latestWaveAt[msg.sender] = block.timestamp;

        // Increment wave count
        totalWaves += 1;
        // Indicate wallet address of the person who called the function.
        console.log("%s has waved message: %s", msg.sender, _message);
        // This is where we store the data in the waves array of custom datatype, Waves.
        waves.push(Wave(msg.sender, _message, block.timestamp));
        
        // Generate a new seed for the next user that calls the function
        // % 100 brings the value down to 0-99
        seed = (block.difficulty + block.timestamp + seed) % 100; 
        console.log("Random number generated: %d", seed);
        // Give 50% probability the user who called the function wins the prize
        if (seed <= 50) {
            console.log("The user has won: %s", msg.sender);

            // initiate variable to define some ETH to be sent to users. Solidity allows ether keyword for monentary amounts
            uint prizeAmount = 0.0001 ether;
            // Ensure that the prize amount to give is less than balance of existing (this) contract, otherwise transaction is reverted
            require(prizeAmount <= address(this).balance, "Cannot withdraw larger amount than what is available in contract.");
            // Define tuple to send money
            (bool success, ) = (msg.sender).call{value: prizeAmount}(""); 
            // Requires success to return true to proceed.
            require(success, "Unable to withdraw amount from contract.");
        }

        // Emit event upon wave being called by contract
        emit NewWave(msg.sender, block.timestamp, _message);
    }

    // The function returns the waves struct array to make it easy to retrieve waves from our website
    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        console.log("There are currently total: %d waves", totalWaves);
        // Explicitly return value from variable
        return totalWaves;
    }
}