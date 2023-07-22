import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";
/*import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from "bootstrap";
*/

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [transactionCount, setTransactionCount] = useState(undefined);
  const [depositAmount, depositSetAmount] = useState('');
  const [withDrawAmount, withDrawSetAmount] = useState('');
  const [message, setMessage] = useState('Click Here');

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  }

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    }
    else {
      console.log("No account found");
    }
  }

  const connectAccount = async () => {
    if (!ethWallet) {
      alert('MetaMask wallet is required to connect');
      return;
    }

    const accounts = await ethWallet.request({ method: 'eth_requestAccounts' });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  }

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  }

  const getTransactionCount = async () => {
    if (ethWallet && account) {
      const provider = new ethers.providers.Web3Provider(ethWallet);
      const signer = provider.getSigner();
      const accountAddress = await signer.getAddress();
      const count = await provider.getTransactionCount(accountAddress);
      setTransactionCount(count);
    }
  };

  const fetchAccountProfile = async () => {
    try {
        if (atm) {
            const profile = await atm.accountProfile();
            if(message==profile){
              setMessage("Click Here");
            }else{
              setMessage(profile); 
            }
            
          }
      } catch (error) {
          console.error("Error fetching account profile:", error);
        }
  };

  const deposit = async () => {
    if (atm) {
      let tx = await atm.deposit(depositAmount);
      await tx.wait()
      getBalance();
      getTransactionCount();
    }
  }

  const withdraw = async () => {
    if (atm) {
      let tx = await atm.withdraw(withDrawAmount);
      await tx.wait()
      getBalance();
      getTransactionCount();
    }
  }

  useEffect(() => {
    if (ethWallet && account) {
      getTransactionCount();
    }
  }, [ethWallet, account]);

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>
    }

    if (balance == undefined) {
      getBalance();
    }


    const styles = {
      screenContainer: {
        margin: '25px 100px 10px 10px',
        height: '30px',
        width: 'fit-content',
        borderRadius: '20px',
        background: 'cadetblue',
        fontWeight: 'bold'
      },

      messageButton: {
        margin: '15px 10px 10px 10px',
        height: '30px',
        width: 'fit-content',
        borderRadius: '20px',
        background: 'cadetblue',
        fontWeight: 'bold'
      },

      titleStyle: {
        backgroundColor: '#D3D3D3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '25vh',
        boxShadow: '5px 10px 8px #888888',
        borderRadius: '20px'
      },

      titleStyleMessage: {
        backgroundColor: '#D3D3D3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '5vh',
        width: '40%',
        boxShadow: '5px 10px 8px #888888',
        borderRadius: '20px',
        fontFamily: 'cursive'
      },

      yourAccount: {
        fontFamily: "cursive",
        FontFaceSet: "larger",
        fontWeight: 'bold'
      },

      yourBalance: {
        fontFamily: "cursive",
        fontSize: "large",
        fontWeight: 'bold'
      },

      inputStyle: {
        height: '20px',
        width: '20%',
        boxShadow: '5px 10px 18px #E5E4E2'
      },

      messageDiv: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }


    };

    
    const handleDepositChange = (e) => {
      const inputAmount = parseInt(e.target.value);
      depositSetAmount(inputAmount);
    };

    const handleWithdrawChange = (e) => {
      const inputAmount = parseInt(e.target.value);
      withDrawSetAmount(inputAmount);
    };

    return (
      <div>
        <div style={styles.titleStyle}>
          <p style={styles.yourAccount}>Your Account: {account}</p>
          <p style={styles.yourBalance}>Your Balance: {balance}</p>
          <p style={styles.yourBalance}>Transaction Count: {transactionCount}</p>
        </div>
        <input
          style={styles.inputStyle}
          type="text"
          value={depositAmount}
          onChange={handleDepositChange}
          placeholder="Enter amount"
        />
        <button style={styles.screenContainer} onClick={deposit}>
          Deposit
        </button>
        <input
          style={styles.inputStyle}
          type="text"
          value={withDrawAmount}
          onChange={handleWithdrawChange}
          placeholder="Enter amount"
        />
        <button style={styles.screenContainer} onClick={withdraw}>
          Withdraw
        </button>
        <div style={styles.messageDiv}>
          <p style={styles.titleStyleMessage}>GET MESSAGE FROM THE CONTRACT</p>
          <button style={styles.messageButton} onClick={fetchAccountProfile}>
            {message}
          </button>	     
        </div>
        
      </div>
    )
  }

  useEffect(() => { 
    getWallet(); 
  }, []);
  

  return (
    <main className="container">
      <header><h1>Welcome to the Bank Dapp!</h1></header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center
        }
      `}
      </style>
    </main>
  )


}