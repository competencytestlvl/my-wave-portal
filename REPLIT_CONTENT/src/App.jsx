// useState returns an arraywith 2 items: current state of variable and set function
import React, { useEffect, useState } from "react";
// ethers is a library that helps frontend to communicate with smart contract
import { ethers } from "ethers";
import './App.css';
/* Import ABI content from utils directory in form of json. The Application Binary Interface (ABI) is the standard way to interact with contracts in the Ethereum ecosystem, both from outside the blockchain and for contract-to-contract interaction.*/ 
import abi from "./utils/WavePortal.json";

const App = () => {
  // State variable to store our user's public wallet.
  /* useState allows to set state variable and setter function to component 
  i.e. const [state, setState] = useState(initialState)*/
  const [currentAccount, setCurrentAccount] = useState("");
  // State property to store all waves
  const [allWaves, setAllWaves] = useState([]);
  // State property to store messages, initially set to empty string
  const [msg, setMsg] = useState("");
  // Variable for smart contract address (string) after it has been deployed
  const contractAddress = "YOUR_CONTRACT_ADDRESS";
  // Create reference to abi content
  const contractABI = abi.abi;

  /* Method to retrieve all waves from contract when user connected wallet
  within authorized account to call it.*/
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        // Connect to provider - to communicate with Ethereum nodes.
        const provider = new ethers.providers.Web3Provider(ethereum);
        // Obtain signer - abstraction of Ethereum Account, which can be used to sign messages and
        // transactions and send signed transactions to Ethereum Network for state changing operations.
        const signer = provider.getSigner();
        // Connect to contract
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        // Call the getAllwaves method from within smart contract
        const waves = await wavePortalContract.getAllWaves();
        
        // Define array to obtain address, timestamp and message in our UI
        // Loop through waves Apply function for each item in array
        const wavesCleaned = waves.map((wave) => {
          return {
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message,
          };
        });
        
        console.log(`cleaned : ${wavesCleaned}`);
        // Store data in React State
        setAllWaves(wavesCleaned);
      }
      else {
        console.log("Ethereum object does not exist!");
      }
    } 
    catch (error) {
      console.log(error);  
    }
  };

  // Listen for emitter events
  useEffect(() => {
    let wavePortalContract;
    let uponNewWave;

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      uponNewWave = (from, timestamp, message) => {
        // Access data on that event e.g. message and from
        console.log("NewWave", from, timestamp, message);
        /* user's message will automatically be appended to allWaves array 
        when we receive the event and our UI will update upon event occuring*/
        setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message,
        }]);
      };    
      wavePortalContract.on("NewWave", uponNewWave);
    }
    // Listen when contract throws the NewWave event
    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", uponNewWave);
      }
    };
  }, []);


  // Asynchronous function to check if wallet is connected
  const checkWalletConnection = async () => {
    try {
      // Check if have access to window.ethereum
      const { ethereum } = window;

      // Check existence of ethereum object
      if (!ethereum) {
        console.log("Make sure you have metamask");
        return;
      }
      else {
        console.log("We have the ethereum object", ethereum);
      }
      
      // Check if we're authorized to access accounts in the user's wallet
      // Use the request method from ethereum object
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        // Grab 1st account in case there are multiple accounts in the wallet
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        // Set current account as the active account
        setCurrentAccount(account);
        // Call function to get all waves
        getAllWaves();
      }
      else {
        console.log("No authorized account found");
      }
    } 
    catch (error) {
      console.log(error);
    }
  }

  // Implement code for connectWallet method here
  const connectWallet = async () => {
    try {
      const { ethereum } = window;  
      // Check if ethereum object exists      
      if (!ethereum) {
        alert("Please login to Metamask before proceeding!");
        return;
      }
      // Initializes Metamask window to allow user to connect to wallet 
      // The method is request of ethereum object
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log(`Connected successfully, ${accounts[0]}`);
      // Set the 1st account of wallet as the active account
      setCurrentAccount(accounts[0]);
    } 
    catch (error) {
      console.log(error);
    }
  }

  // asynchronous function to call contract from website using the credentials from Metamask 
  const wave = async () => {
    try {
      const { ethereum } = window;
      // Check if ethereum object exists
      if (ethereum) {
        /* The "Provider" is what we will use to communicate with ethereum nodes
        Use nodes that Metamask provides in the background to send/receive data 
        from deloyed contract*/
        const provider = new ethers.providers.Web3Provider(ethereum);
        /* The signer below is JsonRpcSigner used to sign transactions/messages
        and send to ethereum network with account #0*/
        const signer = provider.getSigner();
        // Contract address is the address that the contract was deployed to
        // The ABI is one of the files in artifacts directory when contract compiled
        const wavePortalContract = new ethers.Contract(contractAddress,
                                                       contractABI, 
                                                       signer);
        let count = await wavePortalContract.getTotalWaves();
        // Output count on console
        console.log("Total waves....", count.toNumber());
        /* Execute wave functionality from smart contract. 
        Explicitly set gas limit to pay and automatically be refunded if not used completely*/
        const waveTxn = await wavePortalContract.wave(msg, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);
        await waveTxn.wait();
        console.log("Minining completed --", waveTxn.hash);

        // Set the message to empty string
        setMsg("");
        
        // Update the count
        count = await wavePortalContract.getTotalWaves();
        console.log("Obtained total wave count...", count.toNumber());
      }
      else {
        console.log("Ethereum object does not exist!");
      }
    }
    catch (error){
      console.log(error);
    }
  }
  
  // This runs our function when the page loads.
  useEffect(() => {
    checkWalletConnection();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 HELLO
        </div>

        <div className="bio">
        Hi, I am RK. This is my implementation of a smart contract. Connect your Ethereum wallet (Metamask preferred) on Rinkeby testnet and send me a greeting!
          <hr />
          <span style={{color:'Red'}}>*Note: Refresh time set to 5 mins to prevent spam.</span>
        </div>
        <br />

        <textarea className="message-box"
          type="text"
          placeholder="Type your message here fam"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}>
        </textarea>

        <button className="waveButton" onClick={wave}>
          Wave here!
        </button>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {/*creates a new array with the results of calling a provided function on every element in the calling array.*/}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} 
              style={{ backgroundColor: "White", 
                      marginTop: "16px", 
                      padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App