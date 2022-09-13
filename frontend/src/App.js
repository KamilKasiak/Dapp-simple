import "./App.css";
import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

function App() {
  const [greet, setGreet] = useState("");
  const [greetingValue, setGreetingValue] = useState("");
  const [depositValue, setDepositValue] = useState("");
  const [balance, setBalance] = useState("");

  // A Web3Provider wraps a standard Web3 provider, which is
  // what MetaMask injects as window.ethereum into each page
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  // The MetaMask plugin also allows signing transactions to
  // send ether and pay to change state within the blockchain.
  // For this, you need the account signer...
  const signer = provider.getSigner();
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  // The ERC-20 Contract ABI, which is a common contract interface
  // for tokens (this is the Human-Readable ABI format)
  const ABI = [
    {
      inputs: [
        {
          internalType: "string",
          name: "_greeting",
          type: "string",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "greet",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_greeting",
          type: "string",
        },
      ],
      name: "setGreeting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

  // The Contract object
  const contract = new ethers.Contract(contractAddress, ABI, signer);

  useEffect(() => {
    const connectWallet = async () => {
      // MetaMask requires requesting permission to connect users accounts
      await provider.send("eth_requestAccounts", []);
    };

    const getBalance = async () => {
      // Get the balance of an account (by address or ENS name, if supported by network)
      const balance = await provider.getBalance(contractAddress);
      // { BigNumber: "182826475815887608" }
      // Often you need to format the output to something more user-friendly,
      // such as in ether (instead of wei)
      const balanceFormated = ethers.utils.formatEther(balance);
      // '0.182826475815887608'
      setBalance(balanceFormated);
    };

    const getGreeting = async () => {
      const greeting = await contract.greet();
      setGreet(greeting);
    };

    connectWallet().catch(console.error);
    getBalance().catch(console.error);
    getGreeting().catch(console.error);
  });

  const handleGreetingChange = (e) => {
    setGreetingValue(e.target.value);
  };

  const handleDepositChange = (e) => {
    setDepositValue(e.target.value);
  };

  const handleGreetingSubmit = async (e) => {
    e.preventDefault();
    const greetingUpdate = await contract.setGreeting(greetingValue);
    await greetingUpdate.wait(); // wait until transaction compleate before go to next
    setGreet(greetingUpdate);
    setGreetingValue("");
    window.location.reload();
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const ethValue = ethers.utils.parseEther(depositValue);
    const depositEth = await contract.deposit({ value: ethValue });
    await depositEth.wait();
    const balance = await provider.getBalance(contractAddress);
    const balanceFormated = ethers.utils.formatEther(balance);
    setBalance(balanceFormated);
    setDepositValue(0);
  };

  return (
    <div className="container">
      <div className="container text-center">
        <div className="row mt-5">
          <div className="col">
            <h3>{greet}</h3>
            <p>Contract balance is: {balance} eth</p>
          </div>
          <div className="col">
            <form className="mt-5 topForm" onSubmit={handleDepositSubmit}>
              <div className="mb-3">
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={depositValue}
                  aria-describedby="depositAmount"
                  onChange={handleDepositChange}
                />
              </div>
              <button type="submit" className="btn btn-success">
                Deposit
              </button>
            </form>
            <form className="mt-5" onSubmit={handleGreetingSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  value={greetingValue}
                  aria-describedby="test"
                  onChange={handleGreetingChange}
                />
              </div>
              <button type="submit" className="btn btn-dark">
                Change
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
