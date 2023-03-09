import "./App.css";
import Button from "./components/button/button";
import { sequence } from "0xsequence";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { ERC_20_ABI } from "./assets/abis/abis";

function App() {
  sequence.initWallet("polygon");
  const [status, setStatus] = useState("Not Connected");
  const [address, setAddress] = useState("0x00");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wallet = sequence.getWallet();
    if (wallet.isConnected()) {
      setConnected(wallet.isConnected());
      wallet.getAddress().then((res) => {
        setAddress(res);
        setStatus("Connected!");
      });
    }
  }, []);

  const connectWallet = async () => {
    if (connected) {
      setStatus("Wallet already connected!");
      return;
    }
    const wallet = sequence.getWallet();
    const connectDetails = await wallet.connect({
      app: "Sequence Test App",
      authorize: true,
      settings: {
        theme: "dark",
        bannerUrl: "https://i.ibb.co/XXy1FXj/animals-banner.jpg",
        includedPaymentProviders: ["moonpay"],
        defaultFundingCurrency: "matic",
        defaultPurchaseAmount: 111,
      },
    });
    if (!connectDetails.error) {
      setConnected(true);
      setStatus("Connected!");
      setAddress(connectDetails.session.accountAddress);
    } else {
      setAddress(connectDetails.error);
    }
  };

  const disconnect = async () => {
    const wallet = sequence.getWallet();
    wallet.disconnect();
    setStatus("Disconnected!");
    setAddress("0x00");
    setConnected(false);
  };

  const openWallet = () => {
    const wallet = sequence.getWallet();
    wallet.openWallet();
    setStatus("Wallet opened!");
  };

  const closeWallet = () => {
    const wallet = sequence.getWallet();
    wallet.closeWallet();
    setStatus("Wallet Closed!");
  };

  const openWalletWithOptions = () => {
    const wallet = sequence.getWallet();
    const settings = {
      theme: "goldDark",
      bannerUrl: "https://i.ibb.co/XXy1FXj/animals-banner.jpg", // 3:1 aspect ratio, 1200x400 works best
      includedPaymentProviders: ["moonpay", "ramp"],
      defaultFundingCurrency: "eth",
      lockFundingCurrencyToDefault: false,
    };
    const intent = {
      type: "openWithOptions",
      options: {
        settings: settings,
      },
    };

    const path = "wallet/add-funds";
    wallet.openWallet(path, intent);
    setStatus("Wallet opened with options!");
  };

  const isConnected = async () => {
    const wallet = sequence.getWallet();
    setStatus(`isConnected?  ${wallet.isConnected()}`);
  };

  const isOpened = async () => {
    const wallet = sequence.getWallet();
    setStatus(`isOpened?: ${wallet.isOpened()}`);
  };

  const getDefaultChainID = async () => {
    const wallet = sequence.getWallet();
    setStatus(`Chain Id: ${await wallet.getChainId()}`);
  };

  const getAddress = async () => {
    const wallet = sequence.getWallet();
    setStatus(`getAddress(): ${await wallet.getAddress()}`);
  };

  const getBalance = async () => {
    const wallet = sequence.getWallet();
    const provider = wallet.getProvider();
    const account = await wallet.getAddress();
    const balance = await provider?.getBalance(account);
    setStatus(`getBalance(): ${balance.toString()}`);
  };

  const getNetworks = async () => {
    const wallet = sequence.getWallet();
    const result = await wallet.getNetworks();
    const networks = [];

    result.forEach((network) => {
      networks.push({
        chainId: network.chainId,
        name: network.name,
      });
    });
    setStatus(`getNetworks(): ${JSON.stringify(networks)}`);
  };

  const signMessage = async () => {
    const wallet = sequence.getWallet();

    const signer = wallet.getSigner();
    const message =
      "This is a test message to know how sequence signs a message";
    const signature = await signer.signMessage(message);
    setStatus(
      `signature: ${signature}\n Is a valid signature?: ${await wallet.utils.isValidMessageSignature(
        await wallet.getAddress(),
        message,
        signature,
        await wallet.getChainId()
      )}`
    );
  };

  const sendMATIC = async () => {
    const wallet = sequence.getWallet();
    const signer = wallet.getSigner();
    const toAddress = ethers.Wallet.createRandom().address;
    const tx = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: toAddress,
      value: ethers.utils.parseEther("1.234"),
      data: "0x",
    };

    const txnResp = await signer.sendTransaction(tx);
    setStatus(`txnResponse: ${JSON.stringify(txnResp)}`);
  };

  const sendDAI = async () => {
    const wallet = sequence.getWallet();
    const signer = wallet.getSigner();
    const toAddress = ethers.Wallet.createRandom().address;
    const daiContractAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
    const amount = ethers.utils.parseUnits("5", 18);
    const tx = {
      delegateCall: false,
      revertOnError: false,
      gasLimit: "0x55555",
      to: daiContractAddress,
      value: 0,
      data: new ethers.utils.Interface(ERC_20_ABI).encodeFunctionData(
        "transfer",
        [toAddress, amount.toHexString()]
      ),
    };

    const txnResp = await signer.sendTransaction(tx);
    setStatus(`txnResponse: ${JSON.stringify(txnResp)}`);
  };

  const getTokenSymbol = async () => {
    const wallet = sequence.getWallet();
    const signer = wallet.getSigner();
    const daiContractAddress = "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063";
    const abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)",

      "function transfer(address to, uint amount) returns (bool)",

      "event Transfer(address indexed from, address indexed to, uint amount)",
    ];
    const dai = new ethers.Contract(daiContractAddress, abi, signer);
    const daiSymbol = await dai.symbol();
    console.log(daiSymbol);
    setStatus(`Symbol: ${daiSymbol}`);
  };

  return (
    <div className="App container">
      <h1 className="mt-5">
        <a href="https://sequence.xyz" target="_blank" rel="noreferrer">
          <img src="/assets/images/logo-sequence.svg" width={250} alt="" />
        </a>
      </h1>
      <h3>Sequence Test app | Polygon</h3>

      <div className="row mt-5">
        <div className="col">
          <h4 className="info_box_container">{address}</h4>
        </div>
      </div>
      <div className="row mt-2">
        <div className="col">
          <h4 className="info_box_container">{status}</h4>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <Button text="Connect Wallet" onclick={connectWallet} />
        </div>
        <div className="col">
          <Button
            text="Disconnect Wallet"
            onclick={disconnect}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button
            text="Open Wallet"
            onclick={openWallet}
            disabled={!connected}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <Button
            text="Open Wallet with settings"
            onclick={openWalletWithOptions}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button
            text="Close Wallet"
            onclick={closeWallet}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button text="isConnected?" onclick={isConnected} />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <Button text="isOpened?" onclick={isOpened} disabled={!connected} />
        </div>
        <div className="col">
          <Button
            text="Get Chain id"
            onclick={getDefaultChainID}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button
            text="getAddress()"
            onclick={getAddress}
            disabled={!connected}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <Button
            text="getBalance()"
            onclick={getBalance}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button
            text="getNetworks()"
            onclick={getNetworks}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button
            text="sign message"
            onclick={signMessage}
            disabled={!connected}
          />
        </div>
      </div>

      <div className="row mt-3">
        <div className="col">
          <Button
            text="sendMatic()"
            onclick={sendMATIC}
            disabled={!connected}
          />
        </div>
        <div className="col">
          <Button text="sendDAI()" onclick={sendDAI} disabled={!connected} />
        </div>
        <div className="col">
          <Button
            text="get token symbol"
            onclick={getTokenSymbol}
            disabled={!connected}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
