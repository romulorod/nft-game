import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";

/*
 * Passamos os metadados do nosso personagem NFT para que podemos ter um card legal na nossa UI
 */
const Arena = ({ characterNFT, setCharacterNFT }) => {
	// estado
	const [gameContract, setGameContract] = useState(null);
	const [boss, setBoss] = useState(null);
	const [attackState, setAttackState] = useState("");
	const [showToast, setShowToast] = useState(false);

	// UseEffects
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

			setGameContract(gameContract);
		} else {
			console.log("Ethereum object not found");
		}
	}, []);
	// UseEffects
	useEffect(() => {
		/*
		 * Configurando função async que vai pegar o bosso do nosso contrato e setar ele no estado
		 */
		const fetchBoss = async () => {
			const bossTxn = await gameContract.getBigBoss();
			console.log("Boss:", bossTxn);
			setBoss(transformCharacterData(bossTxn));
		};

		if (gameContract) {
			/*
			 * gameContract está pronto! Vamos buscar nosso boss
			 */
			fetchBoss();
		}
	}, [gameContract]);

	// UseEffects
	useEffect(() => {
		const fetchBoss = async () => {
			const bossTxn = await gameContract.getBigBoss();
			console.log("Boss:", bossTxn);
			setBoss(transformCharacterData(bossTxn));
		};

		/*
		 * Configura a lógica quando esse evento for disparado
		 */
		const onAttackComplete = (newBossHp, newPlayerHp) => {
			const bossHp = newBossHp.toNumber();
			const playerHp = newPlayerHp.toNumber();

			console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

			/*
			 * Atualiza o hp do boss e do player
			 */
			setBoss((prevState) => {
				return { ...prevState, hp: bossHp };
			});

			setCharacterNFT((prevState) => {
				return { ...prevState, hp: playerHp };
			});
		};

		if (gameContract) {
			fetchBoss();
			gameContract.on("AttackComplete", onAttackComplete);
		}

		/*
		 * Tem certeza de limpar esse evento quando componente for removido
		 */
		return () => {
			if (gameContract) {
				gameContract.off("AttackComplete", onAttackComplete);
			}
		};
	}, [gameContract]);

	const runAttackAction = async () => {
		try {
			if (gameContract) {
				setAttackState("attacking");
				console.log("Atacando boss...");
				const txn = await gameContract.attackBoss();
				await txn.wait();
				console.log(txn);
				setAttackState("hit");

				/*
				 * Configura seu estado toast para true e depois Falso 5 segundos depois
				 */
				setShowToast(true);
				setTimeout(() => {
					setShowToast(false);
				}, 5000);
			}
		} catch (error) {
			console.error("Erro ao atacar o boss:", error);
			setAttackState("");
		}
	};

	return (
		<div className="arena-container">
			{/* Add your toast HTML right here */}
			{boss && characterNFT && (
				<div id="toast" className={showToast ? "show" : ""}>
					<div id="desc">{`💥 ${boss.name} tomou ${characterNFT.attackDamage} de dano!`}</div>
				</div>
			)}

			{/* Boss */}
			{boss && (
				<div className="boss-container">
					<div className={`boss-content  ${attackState}`}>
						<h2>🔥 {boss.name} 🔥</h2>
						<div className="image-content">
							<img src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`} alt={`Boss ${boss.name}`} />
							<div className="health-bar">
								<progress value={boss.hp} max={boss.maxHp} />
								<p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
							</div>
						</div>
					</div>
					<div className="attack-container">
						<button className="cta-button" onClick={runAttackAction}>
							{`💥 Atacar o ${boss.name}`}
						</button>
					</div>
					{attackState === "attacking" && (
						<div className="loading-indicator">
							<LoadingIndicator />
							<p>Atacando ⚔️</p>
						</div>
					)}
				</div>
			)}

			{/* Personagem NFT */}
			{characterNFT && (
				<div className="players-container">
					<div className="player-container">
						<h2>Seu herói</h2>
						<div className="player">
							<div className="image-content">
								<h2>{characterNFT.name}</h2>
								<img
									src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
									alt={`Character ${characterNFT.name}`}
								/>
								<div className="health-bar">
									<progress value={characterNFT.hp} max={characterNFT.maxHp} />
									<p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
								</div>
							</div>
							<div className="stats">
								<h4>{`⚔️ Poder de Ataque: ${characterNFT.attackDamage}`}</h4>
							</div>
						</div>
					</div>
					{/* <div className="active-players">
            <h2>Active Players</h2>
            <div className="players-list">{renderActivePlayersList()}</div>
          </div> */}
				</div>
			)}
		</div>
	);
};

export default Arena;
