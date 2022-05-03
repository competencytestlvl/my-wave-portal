// run.js - js file to compile, deploy and execute smart contract

const main = async () => {

    // Compile contract and generate the necessary files to work with contract under the artifacts directory.
    /* Note: Hardhat Runtime Environment (hre) is an object containing all the functionality of Harhat when running a task, test or script. 
    Each time 'npx hardhat' is run in the terminal, this hre object is being built based on hardhat.config.js specified in your code! 
    Thus, not required to perform import statemetn into your files like: const hre = require("hardhat")*/
    
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    /*
    1. Hardhat will create a local Ethereum network only for this contract. 
    2. After the script runs completely it'll destroy that local network.
    3. Everytime the contract is run, it'll be a fresh blockchain 
        e.g refreshing your local server every time so you always start from a clean slate which makes it easy to debug errors*/
    const waveContract = await waveContractFactory.deploy({
        // Deploy contract and fund it with 0.1 ETH from wallet
        value: hre.ethers.utils.parseEther("0.1"),
    });
    // Wait until contract officially deployed to our local blockchain. Constructor will run upon deployment.
    await waveContract.deployed();
    // Once deployed to waveContract.address, address of the deployed contract will be shown. 
    // This address is how we can actually find our contract on blockchain.
    console.log(`Contract deployed to address: ${waveContract.address}`);
    
    // Obtain existing contract address balance
    let contractBalance = await hre.ethers.provider.getBalance(
        // Obtain address of contract
        waveContract.address
    );
    // Check if contract actually has a balance of 0.1
    console.log(`Contract balance: ${hre.ethers.utils.formatEther(contractBalance)}`);

    // // Initialize state variable to hold count of waves
    // let waveCount;
    // // Manually call function from contract
    // waveCount = await waveContract.getTotalWaves();
    // // Show the output of waveCount
    // console.log(waveCount.toNumber());

    // Call function manually from contract to perform action
    let waveTxn = await waveContract.wave("Message #1 was broadcasted");
    // For for transaction to be mined
    await waveTxn.wait();

    // Demonstrate running the function again
    let waveTxn2 = await waveContract.wave("Message #2 was broadcasted");
    // For for transaction to be mined
    await waveTxn2.wait();

    // Need to have a wallet address when deploying to blockchain. Hardhat does this in the background.
    // Check contract balance again to see changes
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(`Contract balance: ${hre.ethers.utils.formatEther(contractBalance)}`);
    
    // Wait for contract to finish querying function
    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
};

const runMain = async () => {
    // Error handling
    try {
        // Run main() function
        await main();
        process.exit(0); // exit Node.js process with success code 0
    }
    catch (error) {
        console.log(error);
        process.exit(1); // exit Node.js process with error code 1
    }
};

// Call main running function
runMain();