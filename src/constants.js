const CONTRACT_ADDRESS = "0x87638f13bCc851faEEca1E074286fDaef0db5e9e";

const transformCharacterData = (characterData) => {
	return {
		name: characterData.name,
		imageURI: characterData.imageURI,
		hp: characterData.hp.toNumber(),
		maxHp: characterData.maxHp.toNumber(),
		attackDamage: characterData.attackDamage.toNumber(),
	};
};

export { CONTRACT_ADDRESS, transformCharacterData };
