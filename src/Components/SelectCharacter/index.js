import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import LoadingIndicator from "../LoadingIndicator";

/*
 * Não se preocupe com setCharacterNFT ainda, vamos falar dele logo.
 */
const SelectCharacter = ({ setCharacterNFT }) => {
	const [characters, setCharacters] = useState([]);
	const [gameContract, setGameContract] = useState(null);
	const [mintingCharacter, setMintingCharacter] = useState(false);

	useEffect(() => {
		const getCharacters = async () => {
			try {
				console.log("Pegando personagens do contrato para mintar");

				const charactersTxn = await gameContract.getAllDefaultCharacters();
				console.log("charactersTxn:", charactersTxn);

				const characters = charactersTxn.map((characterData) =>
					transformCharacterData(characterData)
				);

				setCharacters(characters);
			} catch (error) {
				console.error("Algo deu errado ao buscar os personagens:", error);
			}
		};

		/*
		 * Adiciona um método callback que vai disparar quando o evento for recebido
		 */
		const onCharacterMint = async (sender, tokenId, characterIndex) => {
			console.log(
				`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
			);

			/*
			 * Uma vez que nosso personagem for mintado, podemos buscar os metadados a partir do nosso contrato e configurar no estado para se mover para a Arena.
			 */
			if (gameContract) {
				const characterNFT = await gameContract.checkIfUserHasNFT();
				console.log("CharacterNFT: ", characterNFT);
				setCharacterNFT(transformCharacterData(characterNFT));
			}
		};

		if (gameContract) {
			getCharacters();

			/*
			 * Configurar NFT Minted Listener
			 */
			gameContract.on("CharacterNFTMinted", onCharacterMint);
		}

		return () => {
			/*
			 * Quando seu componente se desmonta, vamos limpar esse listener
			 */
			if (gameContract) {
				gameContract.off("CharacterNFTMinted", onCharacterMint);
			}
		};
	}, [gameContract]);
	const onCharacterMint = async (sender, tokenId, characterIndex) => {
		console.log(
			`CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
		);
		if (gameContract) {
			const characterNFT = await gameContract.checkIfUserHasNFT();
			console.log("CharacterNFT: ", characterNFT);
			setCharacterNFT(transformCharacterData(characterNFT));
		}
	};
	// UseEffect
	useEffect(() => {
		const { ethereum } = window;

		if (ethereum) {
			const provider = new ethers.providers.Web3Provider(ethereum);
			const signer = provider.getSigner();
			const gameContract = new ethers.Contract(
				CONTRACT_ADDRESS,
				myEpicGame.abi,
				signer
			);

			/*
			 * Essa é a grande diferença. Configura nosso gameContract no estado.
			 */
			setGameContract(gameContract);
		} else {
			console.log("Ethereum object not found");
		}
	}, []);

	// Métodos de renderização
	const renderCharacters = () =>
		characters.map((character, index) => (
			<div className="character-item" key={character.name}>
				<div className="name-container">
					<p>{character.name}</p>
				</div>
				<img
					src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`}
					alt={character.name}
				/>
				<button
					type="button"
					className="character-mint-button"
					onClick={mintCharacterNFTAction(index)}
				>{`Mintar ${character.name}`}</button>
			</div>
		));

	// Actions
	const mintCharacterNFTAction = (characterId) => async () => {
		try {
			if (gameContract) {
				/*
				 * Mostre nosso indicador de carregamento
				 */
				setMintingCharacter(true);
				console.log("Mintando personagem...");
				const mintTxn = await gameContract.mintCharacterNFT(characterId);
				await mintTxn.wait();
				console.log(mintTxn);
				/*
				 * Esconde nosso indicador de carregamento quando o mint for terminado
				 */
				setMintingCharacter(false);
			}
		} catch (error) {
			console.warn("MintCharacterAction Error:", error);
			/*
			 * Se tiver um problema, esconda o indicador de carregamento também
			 */
			setMintingCharacter(false);
		}
	};

	return (
		<div className="select-character-container">
			<h2>Minte seu herói. Escolha com sabedoria.</h2>
			{characters.length > 0 && (
				<div className="character-grid">{renderCharacters()}</div>
			)}
			{/* Só mostre o seu indicador de carregamento se mintingCharacter for verdadeiro */}
			{mintingCharacter && (
				<div className="loading">
					<div className="indicator">
						<LoadingIndicator />
						<p>Mintando personagem...</p>
					</div>
					<img
						src="https://media2.giphy.com/media/61tYloUgq1eOk/giphy.gif?cid=ecf05e47dg95zbpabxhmhaksvoy8h526f96k4em0ndvx078s&rid=giphy.gif&ct=g"
						alt="Minting loading indicator"
					/>
				</div>
			)}
		</div>
	);
};

export default SelectCharacter;
