// deploy.js - file to create a new block and get our smart contract on it

const main = async () => {
    // // Get wallet address and balance of person deploying contract
    // const [deployer] = await hre.ethers.getSigners();
    // const accountBalance = await deployer.getBalance();
  
    // console.log("Deploying contracts with account: ", deployer.address);
    // console.log("Account balance: ", accountBalance.toString());
  
    const waveContractFactory = await hre.ethers.getContractFactory("WavePortal");
    // Deploy contract and fund it with 0.001 ETH from wallet
    const waveContract = await waveContractFactory.deploy({
      value: hre.ethers.utils.parseEther("0.001"),
    });
    await waveContract.deployed();
  
    // Show address of contract on blockchain
    console.log(`WavePortal address: ${waveContract.address}`);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } 
    catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();