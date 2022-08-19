/*
 * Nós vamos precisar usar estados agora! Não esqueça de importar useState
 */
import React, { useEffect, useState } from "react";
import "./App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import { ethers } from "ethers";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";

// Constantes
const TWITTER_HANDLE = "Web3dev_";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
	/*
	 * Só uma variável de estado que vamos usar para armazenar a carteira pública do usuário.
	 */
	// Estado
	const [currentAccount, setCurrentAccount] = useState(null);

	/*
	 * Logo abaixo da conta, configure essa propriedade de novo estado.
	 */
	const [characterNFT, setCharacterNFT] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	/*
	 * Já que esse método vai levar um tempo, lembre-se de declará-lo como async
	 */
	useEffect(() => {
		/*
		 * Quando nosso componente for montado, tenha certeza de configurar o estado de carregamento
		 */
		setIsLoading(true);
		checkIfWalletIsConnected();
	}, []);

	useEffect(() => {
		const fetchNFTMetadata = async () => {
			console.log("Checking for Character NFT on address:", currentAccount);

			const provider = new ethers.providers.Web3Provider(window.ethereum);
			const signer = provider.getSigner();
			const gameContract = new ethers.Contract(
				CONTRACT_ADDRESS,
				myEpicGame.abi,
				signer
			);

			const characterNFT = await gameContract.checkIfUserHasNFT();
			if (characterNFT.name) {
				console.log("User has character NFT");
				setCharacterNFT(transformCharacterData(characterNFT));
			}

			/*
			 * Uma vez que tivermos acabado a busca, configure o estado de carregamento para falso.
			 */
			setIsLoading(false);
		};

		if (currentAccount) {
			console.log("CurrentAccount:", currentAccount);
			fetchNFTMetadata();
		}
	}, [currentAccount]);

	const checkNetwork = async () => {
		try {
			if (window.ethereum.networkVersion !== "4") {
				alert("Please connect to Goerli!");
			}
		} catch (error) {
			console.log(error);
		}
	};
	const checkIfWalletIsConnected = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				console.log("Make sure you have MetaMask!");
				/*
				 * Nós configuramos o isLoading aqui porque usamos o return na proxima linha
				 */
				setIsLoading(false);
				return;
			} else {
				console.log("We have the ethereum object", ethereum);

				const accounts = await ethereum.request({ method: "eth_accounts" });

				if (accounts.length !== 0) {
					const account = accounts[0];
					console.log("Found an authorized account:", account);
					setCurrentAccount(account);
				} else {
					console.log("No authorized account found");
				}
			}
		} catch (error) {
			console.log(error);
		}
		/*
		 * Nós lançamos a propriedade de estado depois de toda lógica da função
		 */
		setIsLoading(false);
	};

	/*
	 * Implementa o seu método connectWallet aqui
	 */
	const connectWalletAction = async () => {
		try {
			const { ethereum } = window;

			if (!ethereum) {
				alert("Get MetaMask!");
				return;
			}

			/*
			 * Método chique para pedir acesso para a conta.
			 */
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			/*
			 * Boom! Isso deve escrever o endereço público uma vez que autorizarmos Metamask.
			 */
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	};
	// Métodos de renderização
	const renderContent = () => {
		/*
		 * Se esse app estiver carregando, renderize o indicador de carregamento
		 */
		if (isLoading) {
			return <LoadingIndicator />;
		}

		if (!currentAccount) {
			return (
				<div className="connect-wallet-container">
					<img
						src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
						alt="Monty Python Gif"
					/>
					<button
						className="cta-button connect-wallet-button"
						onClick={connectWalletAction}
					>
						Connect Wallet To Get Started
					</button>
				</div>
			);
		} else if (currentAccount && !characterNFT) {
			return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
		} else if (currentAccount && characterNFT) {
			return (
				<Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
			);
		}
	};

	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">
				<div className="header-container">
					<p className="header gradient-text">⚔️ Metaverso Slayer ⚔️</p>
					<p className="sub-text">Junte seus amigos para proteger o Metaverso!</p>
					{/*
					 * Aqui é onde nosso botão e código de imagem ficava! Lembre-se que movemos para o método de renderização.
					 */}
					{renderContent()}
				</div>
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
};

export default App;
