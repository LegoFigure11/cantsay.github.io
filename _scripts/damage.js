function CALCULATE_ALL_MOVES_BW(p1, p2, field) {
	checkAirLock(p1, field);
	checkAirLock(p2, field);
	checkForecast(p1, field.getWeather());
	checkForecast(p2, field.getWeather());
	checkKlutz(p1);
	checkKlutz(p2);
	checkEvo(p1, p2);
	checkMinimize(p1, p2);
	checkSeeds(p1, field);
	checkSeeds(p2, field);
	p1.stats[DF] = getModifiedStat(p1.rawStats[DF], p1.boosts[DF]);
	p1.stats[SD] = getModifiedStat(p1.rawStats[SD], p1.boosts[SD]);
	p1.stats[SP] = getFinalSpeed(p1, field.getWeather());
	p2.stats[DF] = getModifiedStat(p2.rawStats[DF], p2.boosts[DF]);
	p2.stats[SD] = getModifiedStat(p2.rawStats[SD], p2.boosts[SD]);
	p2.stats[SP] = getFinalSpeed(p2, field.getWeather());
	checkIntimidate(p1, p2);
	checkIntimidate(p2, p1);
	checkZacianZamazaenta(p1);
	checkZacianZamazaenta(p2);
	checkDownload(p1, p2);
	checkDownload(p2, p1);
	p1.stats[AT] = getModifiedStat(p1.rawStats[AT], p1.boosts[AT]);
	p1.stats[SA] = getModifiedStat(p1.rawStats[SA], p1.boosts[SA]);
	p2.stats[AT] = getModifiedStat(p2.rawStats[AT], p2.boosts[AT]);
	p2.stats[SA] = getModifiedStat(p2.rawStats[SA], p2.boosts[SA]);
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	checkInfiltrator(p1, side1);
	checkInfiltrator(p2, side2);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = getDamageResult(p1, p2, p1.moves[i], side1);
		results[1][i] = getDamageResult(p2, p1, p2.moves[i], side2);
	}
	return results;
}

function CALCULATE_ALL_MOVES_LG(p1, p2, field) {
	checkMinimize(p1, p2);
	checkSeeds(p1, field);
	checkSeeds(p2, field);
	p1.stats[DF] = getModifiedStat(p1.rawStats[DF], p1.boosts[DF]);
	p1.stats[SD] = getModifiedStat(p1.rawStats[SD], p1.boosts[SD]);
	p1.stats[SP] = getFinalSpeed(p1, field.getWeather());
	p2.stats[DF] = getModifiedStat(p2.rawStats[DF], p2.boosts[DF]);
	p2.stats[SD] = getModifiedStat(p2.rawStats[SD], p2.boosts[SD]);
	p2.stats[SP] = getFinalSpeed(p2, field.getWeather());
	p1.stats[AT] = getModifiedStat(p1.rawStats[AT], p1.boosts[AT]);
	p1.stats[SA] = getModifiedStat(p1.rawStats[SA], p1.boosts[SA]);
	p2.stats[AT] = getModifiedStat(p2.rawStats[AT], p2.boosts[AT]);
	p2.stats[SA] = getModifiedStat(p2.rawStats[SA], p2.boosts[SA]);
	var side1 = field.getSide(1);
	var side2 = field.getSide(0);
	var results = [[], []];
	for (var i = 0; i < 4; i++) {
		results[0][i] = getLGDamageResult(p1, p2, p1.moves[i], side1);
		results[1][i] = getLGDamageResult(p2, p1, p2.moves[i], side2);
	}
	return results;
}

function getDamageResult(attacker, defender, move, field) {
	var moveDescName = move.name;
	var isQuarteredByProtect = false;
	if (move.isZ) {
		if (move.name === "Nature Power") {
			move.zp = field.terrain === "Electric" || field.terrain === "Grassy" || field.terrain === "Psychic" || field.terrain === "Misty" ? 175 : 160;
			move.type = field.terrain === "Electric" ? "Electric" : field.terrain === "Grassy" ? "Grass" : field.terrain === "Misty" ? "Fairy" : move.type = field.terrain === "Psychic" ? "Psychic" : "Normal";
		}
	}
	if (field.isProtect) {
	  isQuarteredByProtect = true;
	}

	if (move.isMax) {
		moveDescName = move.name + " (" + move.basePower + " BP)";
		if (attacker.item == "Choice Band" || attacker.item == "Choice Specs" || attacker.item == "Choice Scarf") {
			attacker.item = "";
		}
	}
	var description = {
		"attackerName": attacker.name,
		"moveName": moveDescName,
		"defenderName": defender.name,
		"isDynamax": defender.isDynamax
	};
	if (move.basePower === 0 && !["Physical", "Special"].includes(move.category)) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	var defAbility = defender.ability;
	if (["Mold Breaker", "Teravolt", "Turboblaze"].indexOf(attacker.ability) !== -1 && defAbility !== "Shadow Shield") {
		defAbility = "";
		description.attackerAbility = attacker.ability;
	} else if (["Moongeist Beam", "Sunsteel Strike", "Searing Sunraze Smash", "Menacing Moonraze Maelstrom", "Light That Burns the Sky", "G-Max Drum Solo", "G-Max Hydrosnipe", "G-Max Fireball"].includes(move.name) && defAbility !== "Shadow Shield")
		defAbility = ""; //works as a mold breaker

	var isCritical = move.isCrit && ["Battle Armor", "Shell Armor"].indexOf(defAbility) === -1;

	switch (move.name) {
	case "Weather Ball":
		move.type = field.weather.indexOf("Sun") > -1 ? "Fire" :
			field.weather.indexOf("Rain") > -1 ? "Water" :
				field.weather === "Sand" ? "Rock" :
					field.weather === "Hail" ? "Ice" :
						"Normal";
		description.weather = field.weather;
		description.moveType = move.type;
		break;

	case "Terrain Pulse":
		move.type = field.terrain === "Electric" ? "Electric" : field.terrain === "Grassy" ? "Grass" : field.terrain === "Misty" ? "Fairy" : move.type = field.terrain === "Psychic" ? "Psychic" : "Normal";
		break;

	case "Judgment":
		if (attacker.item.indexOf("Plate") !== -1) {
			move.type = getItemBoostType(attacker.item);
		}
		break;

	case "Multi-Attack":
		if (attacker.item.indexOf("Memory") !== -1) {
			move.type = getMultiAttack(attacker.item);
		}
		break;

	case "Techno Blast":
		if (attacker.item.indexOf("Drive") !== -1) {
			move.type = getTechnoBlast(attacker.item);
		}
		break;

	case "Natural Gift":
		if (attacker.item.indexOf("Berry") !== -1) {
			var gift = getNaturalGift(attacker.item);
			move.type = gift.t;
			move.basePower = gift.p;
			description.attackerItem = attacker.item;
			description.moveBP = move.basePower;
			description.moveType = move.type;
		}
		break;

	case "Nature Power":
		move.type = field.terrain === "Electric" ? "Electric" : field.terrain === "Grassy" ? "Grass" : field.terrain === "Misty" ? "Fairy" : move.type = field.terrain === "Psychic" ? "Psychic" : "Normal";
		break;

	case "Revelation Dance":
		move.type = attacker.type1;
		break;

	case "Aura Wheel":
		if (attacker.name.includes("Morpeko-Hangry")) {
			move.type = "Dark";
		}
		break;
	}

	var isAerilate = attacker.ability === "Aerilate" && move.type === "Normal" && move.name !== "Revelation Dance";
	var isPixilate = attacker.ability === "Pixilate" && move.type === "Normal" && move.name !== "Revelation Dance";
	var isRefrigerate = attacker.ability === "Refrigerate" && move.type === "Normal" && move.name !== "Revelation Dance";
	var isGalvanize = attacker.ability === "Galvanize" && move.type === "Normal" && move.name !== "Revelation Dance";
	var isNormalize = attacker.ability === "Normalize" && (["Hidden Power", "Weather Ball", "Natural Gift", "Judgment", "Techno Blast", "Revelation Dance", "Multi-Attack"].indexOf(move.name) === -1) && !move.isZ;
	if (!move.isZ) { //Z-Moves don't receive -ate type changes
		if (isAerilate) {
			move.type = "Flying";
		} else if (isPixilate) {
			move.type = "Fairy";
		} else if (isRefrigerate) {
			move.type = "Ice";
		} else if (isGalvanize) {
			move.type = "Electric";
		} else if (attacker.ability === "Normalize") {
			move.type = "Normal";
			description.attackerAbility = attacker.ability;
		} else if (attacker.ability === "Liquid Voice" && move.flags.sound) {
			move.type = "Water";
			description.attackerAbility = attacker.ability;
		}
	}
	var typeEffect1 = getMoveEffectiveness(move, defender.type1, attacker.ability === "Scrappy" || field.isForesight, field.isGravity);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, attacker.ability === "Scrappy" || field.isForesight, field.isGravity) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;

	if (typeEffectiveness === 0 && move.name === "Thousand Arrows") {
		typeEffectiveness = 1;
	}

	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (defAbility === "Wonder Guard" && typeEffectiveness <= 1 ||
            move.type === "Grass" && defAbility === "Sap Sipper" ||
            move.type === "Fire" && defAbility.indexOf("Flash Fire") !== -1 ||
            move.type === "Water" && ["Dry Skin", "Storm Drain", "Water Absorb"].indexOf(defAbility) !== -1 ||
            move.type === "Electric" && ["Lightning Rod", "Lightningrod", "Motor Drive", "Volt Absorb"].indexOf(defAbility) !== -1 ||
            move.type === "Ground" && !field.isGravity && move.name !== "Thousand Arrows" && defAbility === "Levitate" ||
            move.flags.bullet && defAbility === "Bulletproof" ||
            move.flags.sound && defAbility === "Soundproof") {
		description.defenderAbility = defAbility;
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.type === "Ground" && move.name !== "Thousand Arrows" && !field.isGravity && defender.item === "Air Balloon") {
		description.defenderItem = defender.item;
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (defender.item === "Ring Target" && typeEffectiveness === 0) {
		if (typeChart[move.type][defender.type1] === 0) {
			typeEffectiveness = typeEffect2;
		} else if (typeChart[move.type][defender.type2] === 0) {
			typeEffectiveness = typeEffect1;
		}
	}
	if (field.weather === "Harsh Sun" && move.type === "Water" || field.weather === "Heavy Rain" && move.type === "Fire") {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.name === "Sky Drop" &&
        ([defender.type1, defender.type2].indexOf("Flying") !== -1 ||
            defender.weight >= 200.0 || field.isGravity)) {
		return {"damage": [0], "description": buildDescription(description)};
	}
	if (move.name === "Synchronoise" &&
            [defender.type1, defender.type2].indexOf(attacker.type1) === -1 && [defender.type1, defender.type2].indexOf(attacker.type2) === -1) {
		return {"damage": [0], "description": buildDescription(description)};
	}

	description.HPEVs = defender.HPEVs + " HP";

	if (["Seismic Toss", "Night Shade"].indexOf(move.name) !== -1) {
		var lv = attacker.level;
		if (attacker.ability === "Parental Bond") {
			lv *= 2;
		}
		return {"damage": [lv], "description": buildDescription(description)};
	}

	if (move.name === "Surging Strikes") {
		move.hits = 3;
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}
	var turnOrder = attacker.stats[SP] > defender.stats[SP] ? "FIRST" : "LAST";

	////////////////////////////////
	////////// BASE POWER //////////
	////////////////////////////////
	var basePower;
	switch (move.name) {
	case "Payback":
		basePower = turnOrder === "LAST" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Electro Ball":
		var r = Math.floor(attacker.stats[SP] / defender.stats[SP]);
		basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : 60;
		description.moveBP = basePower;
		break;
	case "Gyro Ball":
		basePower = Math.min(150, Math.floor(25 * defender.stats[SP] / attacker.stats[SP]));
		description.moveBP = basePower;
		break;
	case "Punishment":
		basePower = Math.min(200, 60 + 20 * countBoosts(defender.boosts));
		description.moveBP = basePower;
		break;
	case "Low Kick":
	case "Grass Knot":
		var w = defender.weight;
		basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Hex":
		basePower = move.basePower * (defender.status !== "Healthy" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Heavy Slam":
	case "Heat Crash":
		var wr = attacker.weight / defender.weight;
		basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
		description.moveBP = basePower;
		break;
	case "Stored Power":
	case "Power Trip":
		basePower = 20 + 20 * countBoosts(attacker.boosts);
		description.moveBP = basePower;
		break;
	case "Acrobatics":
		basePower = attacker.item === "Flying Gem" || attacker.item === "" ? 110 : 55;
		description.moveBP = basePower;
		break;
	case "Wake-Up Slap":
		basePower = move.basePower * (defender.status === "Asleep" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Weather Ball":
		basePower = field.weather !== "" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Terrain Pulse":
		basePower = field.terrain !== "" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Fling":
		basePower = getFlingPower(attacker.item);
		description.moveBP = basePower;
		description.attackerItem = attacker.item;
		break;
	case "Eruption":
	case "Dragon Energy":
	case "Water Spout":
		basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
		description.moveBP = basePower;
		break;
	case "Flail":
	case "Reversal":
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Bulldoze":
	case "Earthquake":
		basePower = field.terrain === "Grassy" ? move.basePower / 2 : move.basePower;
		description.terrain = field.terrain;
		break;
	case "Nature Power":
		basePower = field.terrain === "Electric" || field.terrain === "Grassy" || field.terrain === "Psychic" ? 90 : field.terrain === "Misty" ? 95 : 80;
		break;
	case "Water Shuriken":
		basePower = (attacker.name === "Ash-Greninja" && attacker.ability === "Battle Bond") ? 20 : 15;
		description.moveBP = basePower;
		break;
	case "Misty Explosion":
		basePower = move.basePower * (field.terrain === "Misty" ? 1.5 : 1);
		description.moveBP = basePower;
		break;
	case "Rising Voltage":
		basePower = move.basePower * (field.terrain === "Electric" && (field.isGravity || (defender.type1 !== "Flying" && defender.type2 !== "Flying" &&
                defender.item !== "Air Balloon" && defender.ability !== "Levitate")) ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Expanding Force":
		basePower = move.basePower * (field.terrain === "Psychic" ? 1.5 : 1);
		move.isSpread = (field.terrain === "Psychic");
		description.moveBP = basePower;
		break;
	default:
		basePower = move.basePower;
	}

	var bpMods = [];
	if (attacker.ability === "Technician" && basePower <= 60 ||
            attacker.ability === "Flare Boost" && attacker.status === "Burned" && move.category === "Special" ||
            attacker.ability === "Toxic Boost" && (attacker.status === "Poisoned" || attacker.status === "Badly Poisoned") &&
                    move.category === "Physical") {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Analytic" && turnOrder !== "FIRST") {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Sand Force" && field.weather === "Sand" && ["Rock", "Ground", "Steel"].indexOf(move.type) !== -1) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
		description.weather = field.weather;
	} else if ((attacker.ability === "Reckless" && (move.recoil || move.hasCrashDamage)) ||
            attacker.ability === "Iron Fist" && move.flags.punch) {
		bpMods.push(0x1333);
		description.attackerAbility = attacker.ability;
	}

	if (field.isBattery && move.category === "Special") {
		bpMods.push(0x14CD);
		description.isBattery = true;
	}

	if (field.isPowerSpot) {
		bpMods.push(0x14CD);
		description.isPowerSpot = true;
	}

	if (field.isMinimized && (["Astonish", "Body Slam", "Dragon Rush", "Extrasensory", "FLying Press", "Heat Crash", "Heavy Slam", "Malicious Moonsault", "Needle Arm", "Phantom Force", "Shadow Force", "Steamroller", "Stomp"].includes(move.name))) {
		bpMods.push(0x2000);
		description.isMinimized = true;
	}

	if (defAbility === "Heatproof" && move.type === "Fire") {
		bpMods.push(0x800);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Dry Skin" && move.type === "Fire") {
		bpMods.push(0x1400);
		description.defenderAbility = defAbility;
	}

	if (attacker.ability === "Sheer Force" && move.secondary) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	}

	if (attacker.ability === "Transistor" && move.type === "Electric") {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}

	if (attacker.ability === "Dragon's Maw" && move.type === "Dragon") {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}

	if (getItemBoostType(attacker.item) === move.type) {
		bpMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Muscle Band" && move.category === "Physical" ||
            attacker.item === "Wise Glasses" && move.category === "Special") {
		bpMods.push(0x1199);
		description.attackerItem = attacker.item;
	} else if ((attacker.item === "Adamant Orb" && attacker.name === "Dialga" ||
            attacker.item === "Lustrous Orb" && attacker.name === "Palkia" ||
            attacker.item === "Griseous Orb" && attacker.name === "Giratina-O") &&
            (move.type === attacker.type1 || move.type === attacker.type2)) {
		bpMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === move.type + " Gem") {
		bpMods.push(gen >= 6 ? 0x14CD : 0x1800);
		description.attackerItem = attacker.item;
	}

	if (move.name === "Facade" && ["Burned", "Paralyzed", "Poisoned", "Badly Poisoned"].includes(attacker.status) ||
            move.name === "Brine" && defender.curHP <= defender.maxHP / 2 ||
            move.name === "Venoshock" && (defender.status === "Poisoned" || defender.status === "Badly Poisoned")) {
		bpMods.push(0x2000);
		description.moveBP = move.basePower * 2;
	} else if ((move.name === "Solar Beam" || move.name == "SolarBeam") && ["Rain", "Sand", "Hail", "Heavy Rain"].includes(field.weather)) {
		bpMods.push(0x800);
		description.moveBP = move.basePower / 2;
		description.weather = field.weather;
	} else if (gen >= 6 && move.name === "Knock Off" && !(defender.item === "" ||
            defender.name === "Giratina-O" && defender.item === "Griseous Orb" ||
            defender.name.indexOf("Silvally") !== -1 && defender.item.indexOf("Memory") ||
            defender.name.indexOf("Arceus") !== -1 && defender.item.indexOf("Plate") ||
            defender.item.indexOf(" Z") !== -1)) {
		bpMods.push(0x1800);
		description.moveBP = move.basePower * 1.5;
	} else if (["Breakneck Blitz", "Bloom Doom", "Inferno Overdrive", "Hydro Vortex", "Gigavolt Havoc", "Subzero Slammer", "Supersonic Skystrike",
		"Savage Spin-Out", "Acid Downpour", "Tectonic Rage", "Continental Crush", "All-Out Pummeling", "Shattered Psyche", "Never-Ending Nightmare",
		"Devastating Drake", "Black Hole Eclipse", "Corkscrew Crash", "Twinkle Tackle"].indexOf(move.name) !== -1) {
		// show z-move power in description
		description.moveBP = move.basePower;
	}

	if (field.isHelpingHand) {
		bpMods.push(0x1800);
		description.isHelpingHand = true;
	}
	if (gen == 6 && (isAerilate || isPixilate || isRefrigerate || isGalvanize)) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (gen >= 7 && !move.isZ && (isAerilate || isPixilate || isRefrigerate || isNormalize || isGalvanize)) {
		bpMods.push(0x1333);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Mega Launcher" && move.flags.pulse ||
            attacker.ability === "Strong Jaw" && move.flags.bite) {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Tough Claws" && move.flags.contact) { //boosts by 1.3x for contact moves, apparently
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (defender.ability === "Fluffy" && move.flags.contact) {
		bpMods.push(0x800);
	}

	var isAttackerAura = attacker.ability === move.type + " Aura";
	var isDefenderAura = defAbility === move.type + " Aura";
	var auraActive = $("input:checkbox[id='" + move.type.toLowerCase() + "-aura']:checked").val() != undefined;
	var auraBreak = $("input:checkbox[id='aura-break']:checked").val() != undefined;
	if (auraActive) {
		if (auraBreak) {
			bpMods.push(0x0C00);
			description.attackerAbility = attacker.ability;
			description.defenderAbility = defAbility;
		} else {
			bpMods.push(0x1547);
			if (isAttackerAura) {
				description.attackerAbility = attacker.ability;
			}
			if (isDefenderAura) {
				description.defenderAbility = defAbility;
			}
		}
	}

	if (move.type === "Steel" && attacker.ability === "Steelworker") {
		bpMods.push(0x1800);
	}

	basePower = Math.max(1, pokeRound(basePower * chainMods(bpMods) / 0x1000));
	if (gen == 6) basePower = attacker.isChild ? basePower / 2 : basePower;
	else if (gen >= 7) basePower = attacker.isChild ? basePower / 4 : basePower;

	////////////////////////////////
	////////// (SP)ATTACK //////////
	////////////////////////////////
	var attack;
	var attackSource = move.name === "Foul Play" ? defender : attacker;
	if (move.usesHighestAttackStat) {
		move.category = attackSource.stats[AT] >= attackSource.stats[SA] ? "Physical" : "Special";
	}
	var attackStat = move.name === "Body Press" ? DF : move.category === "Physical" ? AT : SA;
	description.attackEVs = attacker.evs[attackStat] +
            (NATURES[attacker.nature][0] === attackStat ? "+" : NATURES[attacker.nature][1] === attackStat ? "-" : "") + " " +
            toSmogonStat(attackStat);
	if (attackSource.boosts[attackStat] === 0 || isCritical && attackSource.boosts[attackStat] < 0) {
		attack = attackSource.rawStats[attackStat];
	} else if (defAbility === "Unaware") {
		attack = attackSource.rawStats[attackStat];
		description.defenderAbility = defAbility;
	} else {
		attack = attackSource.stats[attackStat];
		description.attackBoost = attackSource.boosts[attackStat];
	}

	// unlike all other attack modifiers, Hustle gets applied directly
	if (attacker.ability === "Hustle" && move.category === "Physical") {
		attack = pokeRound(attack * 3 / 2);
		description.attackerAbility = attacker.ability;
	}

	var atMods = [];
	if (defAbility === "Thick Fat" && (move.type === "Fire" || move.type === "Ice") || defAbility === "Water Bubble" && move.type === "Fire") {
		atMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	if (defAbility === "Fluffy" && move.type === "Fire") {
		atMods.push(0x2000);
		description.defenderAbility = defAbility;
	}

	if (attacker.ability === "Guts" && attacker.status !== "Healthy" && move.category === "Physical" ||
            attacker.ability === "Overgrow" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Grass" ||
            attacker.ability === "Blaze" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Fire" ||
            attacker.ability === "Torrent" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Water" ||
            attacker.ability === "Swarm" && attacker.curHP <= attacker.maxHP / 3 && move.type === "Bug") {
		atMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Flash Fire (Activated)" && move.type === "Fire") {
		atMods.push(0x1800);
		description.attackerAbility = "Flash Fire";
	} else if (attacker.ability === "Solar Power" && field.weather.indexOf("Sun") > -1 && move.category === "Special" ||
            attacker.ability === "Flower Gift" && field.weather.indexOf("Sun") > -1 && move.category === "Physical") {
		atMods.push(0x1800);
		description.attackerAbility = attacker.ability;
		description.weather = field.weather;
	} else if (attacker.ability === "Defeatist" && attacker.curHP <= attacker.maxHP / 2 ||
            attacker.ability === "Slow Start" && move.category === "Physical") {
		atMods.push(0x800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Water Bubble" && move.type === "Water" ||
        (attacker.ability === "Huge Power" || attacker.ability === "Pure Power") && move.category === "Physical") {
		atMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Gorilla Tactics" && move.category === "Physical" && !attacker.isDynamax) {
		atMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}

	if (attacker.item === "Thick Club" && (attacker.name === "Cubone" || attacker.name === "Marowak" || attacker.name === "Marowak-Alola") && move.category === "Physical" ||
            attacker.item === "Deep Sea Tooth" && attacker.name === "Clamperl" && move.category === "Special" ||
            attacker.item === "Light Ball" && attacker.name === "Pikachu" && !move.isZ) {
		atMods.push(0x2000);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Soul Dew" && (attacker.name === "Latios" || attacker.name === "Latias") && move.category === "Special" ||
            attacker.item === "Choice Band" && (move.category === "Physical" || move.name === "Body Press") ||
            attacker.item === "Choice Specs" && move.category === "Special" && !move.isZ) {
		atMods.push(0x1800);
		description.attackerItem = attacker.item;
	}

	attack = Math.max(1, pokeRound(attack * chainMods(atMods) / 0x1000));

	////////////////////////////////
	///////// (SP)DEFENSE //////////
	////////////////////////////////
	var defense;
	var hitsPhysical = move.category === "Physical" || move.defensiveCategory === "Physical";
	var defenseStat = hitsPhysical ? DF : SD;
	description.defenseEVs = defender.evs[defenseStat] +
            (NATURES[defender.nature][0] === defenseStat ? "+" : NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
            toSmogonStat(defenseStat);
	if (defender.boosts[defenseStat] === 0 || isCritical && defender.boosts[defenseStat] > 0 || move.ignoresDefenseBoosts) {
		defense = defender.rawStats[defenseStat];
	} else if (attacker.ability === "Unaware" || move.name === "Darkest Lariat") {
		defense = defender.rawStats[defenseStat];
		description.attackerAbility = attacker.ability;
	} else {
		defense = defender.stats[defenseStat];
		description.defenseBoost = defender.boosts[defenseStat];
	}

	// unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
	if (field.weather === "Sand" && (defender.type1 === "Rock" || defender.type2 === "Rock") && !hitsPhysical) {
		defense = pokeRound(defense * 3 / 2);
		description.weather = field.weather;
	}

	var dfMods = [];
	if (defAbility === "Marvel Scale" && defender.status !== "Healthy" && hitsPhysical) {
		dfMods.push(0x1800);
		description.defenderAbility = defAbility;
	} else if (defAbility === "Flower Gift" && field.weather.indexOf("Sun") > -1 && !hitsPhysical) {
		dfMods.push(0x1800);
		description.defenderAbility = defAbility;
		description.weather = field.weather;
	}

	if (defender.item === "Deep Sea Scale" && defender.name === "Clamperl" && !hitsPhysical ||
            defender.item === "Metal Powder" && defender.name === "Ditto" ||
            defender.item === "Soul Dew" && (defender.name === "Latios" || defender.name === "Latias") && !hitsPhysical ||
            defender.item === "Assault Vest" && !hitsPhysical || defender.item === "Eviolite") {
		dfMods.push(0x1800);
		description.defenderItem = defender.item;
	}

	defense = Math.max(1, pokeRound(defense * chainMods(dfMods) / 0x1000));

	////////////////////////////////
	//////////// DAMAGE ////////////
	////////////////////////////////
	var baseDamage = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * basePower * attack / defense) / 50 + 2);
	if (field.format !== "Singles" && ["allAdjacent", "allAdjacentFoes"].includes(move.target)) {
		baseDamage = pokeRound(baseDamage * 0xC00 / 0x1000);
	}
	if (field.weather.indexOf("Sun") > -1 && move.type === "Fire" || field.weather.indexOf("Rain") > -1 && move.type === "Water") {
		baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
		description.weather = field.weather;
	} else if (field.weather === "Sun" && move.type === "Water" || field.weather === "Rain" && move.type === "Fire" ||
               field.weather === "Strong Winds" && (defender.type1 === "Flying" || defender.type2 === "Flying") &&
               typeChart[move.type]["Flying"] > 1) {
		baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
		description.weather = field.weather;
	}
	var terrainMultiplier = [8].includes(gen) ? 0x14CD : 0x1800;
	if (field.isGravity || attacker.type1 !== "Flying" && attacker.type2 !== "Flying" &&
                attacker.item !== "Air Balloon" && attacker.ability !== "Levitate") {
		if (field.terrain === "Electric" && move.type === "Electric") {
			baseDamage = pokeRound(baseDamage * terrainMultiplier / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Grassy" && move.type == "Grass") {
			baseDamage = pokeRound(baseDamage * terrainMultiplier / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Psychic" && move.type == "Psychic") {
			baseDamage = pokeRound(baseDamage * terrainMultiplier / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (field.isGravity || defender.type1 !== "Flying" && defender.type2 !== "Flying" &&
            defender.item !== "Air Balloon" && defender.ability !== "Levitate") {
		if (field.terrain === "Misty" && move.type === "Dragon") {
			baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (isCritical) {
		baseDamage = Math.floor(baseDamage * (gen >= 6 ? 1.5 : 2));
		description.isCritical = isCritical;
	}
	// the random factor is applied between the crit mod and the stab mod, so don't apply anything below this until we're inside the loop
	var stabMod = 0x1000;
	if (move.type === attacker.type1 || move.type === attacker.type2) {
		if (attacker.ability === "Adaptability") {
			stabMod = 0x2000;
			description.attackerAbility = attacker.ability;
		} else {
			stabMod = 0x1800;
		}
	} else if (attacker.ability === "Protean" || attacker.ability == "Libero") {
		stabMod = 0x1800;
		description.attackerAbility = attacker.ability;
	}
	var applyBurn = attacker.status === "Burned" && move.category === "Physical" && attacker.ability !== "Guts" && (move.name === "Facade" && gen === 5);
	description.isBurned = applyBurn;
	var finalMods = [];
	if (field.isReflect && move.category === "Physical" && !isCritical) {
		finalMods.push(field.format !== "Singles" ? 0xA8F : 0x800);
		description.isReflect = true;
	} else if (field.isLightScreen && move.category === "Special" && !isCritical) {
		finalMods.push(field.format !== "Singles" ? 0xA8F : 0x800);
		description.isLightScreen = true;
	}
	if ((move.name === "Dynamax Cannon" || move.name === "Behemoth Blade" || move.name === "Behemoth Bash") && defender.isDynamax) {
		finalMods.push(0x2000);
	}
	if ((defAbility === "Multiscale" || defAbility == "Shadow Shield") && defender.curHP === defender.maxHP) {
		finalMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	if (attacker.ability === "Tinted Lens" && typeEffectiveness < 1) {
		finalMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	}
	if ((defAbility === "Punk Rock" && move.flags.sound) || (defAbility === "Ice Scales" && move.category === "Special")) {
		finalMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	if (attacker.ability == "Punk Rock" && move.flags.sound) {
		finalMods.push(0x14CC);
		description.attackerAbility = attacker.ability;
	}
	if (field.isFriendGuard) {
		finalMods.push(0xC00);
		description.isFriendGuard = true;
	}
	if (attacker.ability === "Sniper" && isCritical) {
		finalMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}
	if (attacker.ability === "Neuroforce" && typeEffectiveness > 1) {
		finalMods.push(0x1400);
		description.attackerAbility = attacker.ability;
	}
	if ((defAbility === "Solid Rock" || defAbility === "Filter" || defAbility === "Prism Armor") && typeEffectiveness > 1) {
		finalMods.push(0xC00);
		description.defenderAbility = defAbility;
	}
	if (attacker.item === "Expert Belt" && typeEffectiveness > 1 && !move.isZ) {
		finalMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Life Orb" && !move.isZ) {
		finalMods.push(0x14CC);
		description.attackerItem = attacker.item;
	}
	if (getBerryResistType(defender.item) === move.type && (typeEffectiveness > 1 || move.type === "Normal") &&
            attacker.ability !== "Unnerve") {
		finalMods.push(0x800);
		description.defenderItem = defender.item;
	}
	if (defAbility === "Fur Coat" && hitsPhysical) {
		finalMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	if (isQuarteredByProtect) {
		finalMods.push(0x400);
		description.isQuarteredByProtect = true;
	}
	var finalMod = chainMods(finalMods);

	var damage = [], pbDamage = [];
	var child, childDamage, j;
	if (attacker.ability === "Parental Bond" && move.hits === 1 && (field.format === "Singles" || !move.isSpread)) {
		child = JSON.parse(JSON.stringify(attacker));
		child.rawStats = attacker.rawStats;
		child.stats = attacker.stats;
		child.ability = "";
		child.isChild = true;
		if (move.name === "Power-Up Punch") {
			child.boosts[AT]++;
			child.stats[AT] = getModifiedStat(child.rawStats[AT], child.boosts[AT]);
		}
		childDamage = getDamageResult(child, defender, move, field).damage;
		description.attackerAbility = attacker.ability;
		if (move.name === "Power-Up Punch") {
			child.boosts[AT]--;
			child.stats[AT] = getModifiedStat(child.rawStats[AT], child.boosts[AT]);
		}
	}
	for (var i = 0; i < 16; i++) {
		damage[i] = Math.floor(baseDamage * (85 + i) / 100);
		damage[i] = pokeRound(damage[i] * stabMod / 0x1000);
		damage[i] = Math.floor(damage[i] * typeEffectiveness);
		if (applyBurn) {
			damage[i] = Math.floor(damage[i] / 2);
		}
		damage[i] = Math.max(1, pokeRound(damage[i] * finalMod / 0x1000) % 65536);
		if (["Grass Knot", "Low Kick", "Heat Crash", "Heavy Slam"].includes(move.name) && defender.isDynamax) {
			damage[i] = 0;
			description.isZeroVsDynamax = true;
		}
		if (attacker.ability === "Parental Bond" && move.hits === 1 && (field.format === "Singles" || !["allAdjacent", "allAdjacentFoes"].includes(move.target))) {
			for (j = 0; j < 16; j++) {
				pbDamage[16 * i + j] = damage[i] + childDamage[j];
			}
		}
	}
	// Return a bit more info if this is a Parental Bond usage.
	if (pbDamage.length) {
		return {
			"damage": pbDamage.sort(numericSort),
			"parentDamage": damage,
			"childDamage": childDamage,
			"description": buildDescription(description)
		};
	}
	return {"damage": pbDamage.length ? pbDamage.sort(numericSort) : damage, "description": buildDescription(description)};
}

function getLGDamageResult(attacker, defender, move, field) {
	var moveDescName = move.name;
	var description = {
		"attackerName": attacker.name,
		"moveName": moveDescName,
		"defenderName": defender.name
	};
	if (move.basePower === 0 && !["Physical", "Special"].includes(move.category)) {
		return {"damage": [0], "description": buildLGDescription(description)};
	}

	var defAbility = "";
	var isCritical = move.isCrit;

	var typeEffect1 = getMoveEffectiveness(move, defender.type1, attacker.ability === "Scrappy" || field.isForesight, field.isGravity);
	var typeEffect2 = defender.type2 ? getMoveEffectiveness(move, defender.type2, attacker.ability === "Scrappy" || field.isForesight, field.isGravity) : 1;
	var typeEffectiveness = typeEffect1 * typeEffect2;

	if (typeEffectiveness === 0) {
		return {"damage": [0], "description": buildLGDescription(description)};
	}

	if (move.name === "Sky Drop" &&
        ([defender.type1, defender.type2].indexOf("Flying") !== -1 ||
            defender.weight >= 200.0 || field.isGravity)) {
		return {"damage": [0], "description": buildLGDescription(description)};
	}
	if (move.name === "Synchronoise" &&
            [defender.type1, defender.type2].indexOf(attacker.type1) === -1 && [defender.type1, defender.type2].indexOf(attacker.type2) === -1) {
		return {"damage": [0], "description": buildLGDescription(description)};
	}

	description.HPAVs = defender.HPAVs + " HP";

	if (["Seismic Toss", "Night Shade"].indexOf(move.name) !== -1) {
		var lv = attacker.level;
		if (attacker.ability === "Parental Bond") {
			lv *= 2;
		}
		return {"damage": [lv], "description": buildLGDescription(description)};
	}

	if (move.hits > 1) {
		description.hits = move.hits;
	}
	var turnOrder = attacker.stats[SP] > defender.stats[SP] ? "FIRST" : "LAST";

	////////////////////////////////
	////////// BASE POWER //////////
	////////////////////////////////
	var basePower;
	switch (move.name) {
	case "Payback":
		basePower = turnOrder === "LAST" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Electro Ball":
		var r = Math.floor(attacker.stats[SP] / defender.stats[SP]);
		basePower = r >= 4 ? 150 : r >= 3 ? 120 : r >= 2 ? 80 : 60;
		description.moveBP = basePower;
		break;
	case "Gyro Ball":
		basePower = Math.min(150, Math.floor(25 * defender.stats[SP] / attacker.stats[SP]));
		description.moveBP = basePower;
		break;
	case "Punishment":
		basePower = Math.min(200, 60 + 20 * countBoosts(defender.boosts));
		description.moveBP = basePower;
		break;
	case "Low Kick":
	case "Grass Knot":
		var w = defender.weight;
		basePower = w >= 200 ? 120 : w >= 100 ? 100 : w >= 50 ? 80 : w >= 25 ? 60 : w >= 10 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Hex":
		basePower = move.basePower * (defender.status !== "Healthy" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Heavy Slam":
	case "Heat Crash":
		var wr = attacker.weight / defender.weight;
		basePower = wr >= 5 ? 120 : wr >= 4 ? 100 : wr >= 3 ? 80 : wr >= 2 ? 60 : 40;
		description.moveBP = basePower;
		break;
	case "Stored Power":
	case "Power Trip":
		basePower = 20 + 20 * countBoosts(attacker.boosts);
		description.moveBP = basePower;
		break;
	case "Acrobatics":
		basePower = attacker.item === "Flying Gem" || attacker.item === "" ? 110 : 55;
		description.moveBP = basePower;
		break;
	case "Wake-Up Slap":
		basePower = move.basePower * (defender.status === "Asleep" ? 2 : 1);
		description.moveBP = basePower;
		break;
	case "Weather Ball":
		basePower = field.weather !== "" ? 100 : 50;
		description.moveBP = basePower;
		break;
	case "Fling":
		basePower = getFlingPower(attacker.item);
		description.moveBP = basePower;
		description.attackerItem = attacker.item;
		break;
	case "Eruption":
	case "Water Spout":
		basePower = Math.max(1, Math.floor(150 * attacker.curHP / attacker.maxHP));
		description.moveBP = basePower;
		break;
	case "Flail":
	case "Reversal":
		var p = Math.floor(48 * attacker.curHP / attacker.maxHP);
		basePower = p <= 1 ? 200 : p <= 4 ? 150 : p <= 9 ? 100 : p <= 16 ? 80 : p <= 32 ? 40 : 20;
		description.moveBP = basePower;
		break;
	case "Bulldoze":
	case "Earthquake":
		basePower = field.terrain === "Grassy" ? move.basePower / 2 : move.basePower;
		description.terrain = field.terrain;
		break;
	case "Nature Power":
		basePower = field.terrain === "Electric" || field.terrain === "Grassy" || field.terrain === "Psychic" ? 90 : field.terrain === "Misty" ? 95 : 80;
		break;
	case "Water Shuriken":
		basePower = (attacker.name === "Ash-Greninja" && attacker.ability === "Battle Bond") ? 20 : 15;
		description.moveBP = basePower;
		break;
	default:
		basePower = move.basePower;
	}

	var bpMods = [];
	if (attacker.ability === "Technician" && basePower <= 60 ||
            attacker.ability === "Flare Boost" && attacker.status === "Burned" && move.category === "Special" ||
            attacker.ability === "Toxic Boost" && (attacker.status === "Poisoned" || attacker.status === "Badly Poisoned") &&
                    move.category === "Physical") {
		bpMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Analytic" && turnOrder !== "FIRST") {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
	} else if (attacker.ability === "Sand Force" && field.weather === "Sand" && ["Rock", "Ground", "Steel"].indexOf(move.type) !== -1) {
		bpMods.push(0x14CD);
		description.attackerAbility = attacker.ability;
		description.weather = field.weather;
	} else if ((attacker.ability === "Reckless" && (typeof move.hasRecoil === "number" || move.hasRecoil === "crash")) ||
            attacker.ability === "Iron Fist" && move.flags.punch) {
		bpMods.push(0x1333);
		description.attackerAbility = attacker.ability;
	}

	if (field.isMinimized && (move.name === "Stomp" || move.name === "Heavy Slam")) {
		bpMods.push(0x2000);
		description.isMinimized = true;
	}

	if (move.name === "Facade" && ["Burned", "Paralyzed", "Poisoned", "Badly Poisoned"].indexOf(attacker.status) !== -1 ||
            move.name === "Brine" && defender.curHP <= defender.maxHP / 2 ||
            move.name === "Venoshock" && (defender.status === "Poisoned" || defender.status === "Badly Poisoned")) {
		bpMods.push(0x2000);
		description.moveBP = move.basePower * 2;
	} else if ((move.name === "Solar Beam" || move.name == "SolarBeam") && ["Rain", "Sand", "Hail", "Heavy Rain"].indexOf(field.weather) !== -1) {
		bpMods.push(0x800);
		description.moveBP = move.basePower / 2;
		description.weather = field.weather;
	} else if (gen >= 6 && move.name === "Knock Off" && !(defender.item === "" ||
            defender.name === "Giratina-O" && defender.item === "Griseous Orb" ||
            defender.name.indexOf("Silvally") !== -1 && defender.item.indexOf("Memory") ||
            defender.name.indexOf("Arceus") !== -1 && defender.item.indexOf("Plate") ||
            defender.item.indexOf(" Z") !== -1)) {
		bpMods.push(0x1800);
		description.moveBP = move.basePower * 1.5;
	} else if (["Breakneck Blitz", "Bloom Doom", "Inferno Overdrive", "Hydro Vortex", "Gigavolt Havoc", "Subzero Slammer", "Supersonic Skystrike",
		"Savage Spin-Out", "Acid Downpour", "Tectonic Rage", "Continental Crush", "All-Out Pummeling", "Shattered Psyche", "Never-Ending Nightmare",
		"Devastating Drake", "Black Hole Eclipse", "Corkscrew Crash", "Twinkle Tackle"].indexOf(move.name) !== -1) {
		// show z-move power in description
		description.moveBP = move.basePower;
	}

	if (field.isHelpingHand) {
		bpMods.push(0x1800);
		description.isHelpingHand = true;
	}

	var isAttackerAura = attacker.ability === move.type + " Aura";
	var isDefenderAura = defAbility === move.type + " Aura";
	var auraActive = $("input:checkbox[id='" + move.type.toLowerCase() + "-aura']:checked").val() != undefined;
	var auraBreak = $("input:checkbox[id='aura-break']:checked").val() != undefined;
	if (auraActive) {
		if (auraBreak) {
			bpMods.push(0x0C00);
			description.attackerAbility = attacker.ability;
			description.defenderAbility = defAbility;
		} else {
			bpMods.push(0x1547);
			if (isAttackerAura) {
				description.attackerAbility = attacker.ability;
			}
			if (isDefenderAura) {
				description.defenderAbility = defAbility;
			}
		}
	}

	basePower = Math.max(1, pokeRound(basePower * chainMods(bpMods) / 0x1000));
	if (gen == 6) basePower = attacker.isChild ? basePower / 2 : basePower;
	else if (gen >= 7) basePower = attacker.isChild ? basePower / 4 : basePower;

	////////////////////////////////
	////////// (SP)ATTACK //////////
	////////////////////////////////
	var attack;
	var attackSource = move.name === "Foul Play" ? defender : attacker;
	if (move.usesHighestAttackStat) {
		move.category = attackSource.stats[AT] >= attackSource.stats[SA] ? "Physical" : "Special";
	}
	var attackStat = move.category === "Physical" ? AT : SA;
	description.attackAVs = attacker.avs[attackStat] +
            (NATURES[attacker.nature][0] === attackStat ? "+" : NATURES[attacker.nature][1] === attackStat ? "-" : "") + " " +
            toSmogonStat(attackStat);
	if (attackSource.boosts[attackStat] === 0 || isCritical && attackSource.boosts[attackStat] < 0) {
		attack = attackSource.rawStats[attackStat];
	} else if (defAbility === "Unaware") {
		attack = attackSource.rawStats[attackStat];
		description.defenderAbility = defAbility;
	} else {
		attack = attackSource.stats[attackStat];
		description.attackBoost = attackSource.boosts[attackStat];
	}

	var atMods = [];
	attack = Math.max(1, pokeRound(attack * chainMods(atMods) / 0x1000));

	////////////////////////////////
	///////// (SP)DEFENSE //////////
	////////////////////////////////
	var defense;
	var hitsPhysical = move.category === "Physical" || move.defensiveCategory === "Physical";
	var defenseStat = hitsPhysical ? DF : SD;
	description.defenseAVs = defender.avs[defenseStat] +
            (NATURES[defender.nature][0] === defenseStat ? "+" : NATURES[defender.nature][1] === defenseStat ? "-" : "") + " " +
            toSmogonStat(defenseStat);
	if (defender.boosts[defenseStat] === 0 || isCritical && defender.boosts[defenseStat] > 0 || move.ignoresDefenseBoosts) {
		defense = defender.rawStats[defenseStat];
	} else if (attacker.ability === "Unaware") {
		defense = defender.rawStats[defenseStat];
		description.attackerAbility = attacker.ability;
	} else {
		defense = defender.stats[defenseStat];
		description.defenseBoost = defender.boosts[defenseStat];
	}

	// unlike all other defense modifiers, Sandstorm SpD boost gets applied directly
	if (field.weather === "Sand" && (defender.type1 === "Rock" || defender.type2 === "Rock") && !hitsPhysical) {
		defense = pokeRound(defense * 3 / 2);
		description.weather = field.weather;
	}

	var dfMods = [];

	defense = Math.max(1, pokeRound(defense * chainMods(dfMods) / 0x1000));

	////////////////////////////////
	//////////// DAMAGE ////////////
	////////////////////////////////
	var baseDamage = Math.floor(Math.floor(Math.floor(2 * attacker.level / 5 + 2) * basePower * attack / defense) / 50 + 2);
	if (field.format !== "Singles" && move.isSpread) {
		baseDamage = pokeRound(baseDamage * 0xC00 / 0x1000);
	}
	if (field.weather.indexOf("Sun") > -1 && move.type === "Fire" || field.weather.indexOf("Rain") > -1 && move.type === "Water") {
		baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
		description.weather = field.weather;
	} else if (field.weather === "Sun" && move.type === "Water" || field.weather === "Rain" && move.type === "Fire" ||
               field.weather === "Strong Winds" && (defender.type1 === "Flying" || defender.type2 === "Flying") &&
               typeChart[move.type]["Flying"] > 1) {
		baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
		description.weather = field.weather;
	}
	if (field.isGravity || attacker.type1 !== "Flying" && attacker.type2 !== "Flying" &&
                attacker.item !== "Air Balloon" && attacker.ability !== "Levitate") {
		if (field.terrain === "Electric" && move.type === "Electric") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Grassy" && move.type == "Grass") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		} else if (field.terrain === "Psychic" && move.type == "Psychic") {
			baseDamage = pokeRound(baseDamage * 0x1800 / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (field.isGravity || defender.type1 !== "Flying" && defender.type2 !== "Flying" &&
            defender.item !== "Air Balloon" && defender.ability !== "Levitate") {
		if (field.terrain === "Misty" && move.type === "Dragon") {
			baseDamage = pokeRound(baseDamage * 0x800 / 0x1000);
			description.terrain = field.terrain;
		}
	}
	if (isCritical) {
		baseDamage = Math.floor(baseDamage * (gen >= 6 ? 1.5 : 2));
		description.isCritical = isCritical;
	}
	// the random factor is applied between the crit mod and the stab mod, so don't apply anything below this until we're inside the loop
	var stabMod = 0x1000;
	if (move.type === attacker.type1 || move.type === attacker.type2) {
		if (attacker.ability === "Adaptability") {
			stabMod = 0x2000;
			description.attackerAbility = attacker.ability;
		} else {
			stabMod = 0x1800;
		}
	} else if (attacker.ability === "Protean") {
		stabMod = 0x1800;
		description.attackerAbility = attacker.ability;
	}
	var applyBurn = attacker.status === "Burned" && move.category === "Physical" && attacker.ability !== "Guts" && !move.ignoresBurn;
	description.isBurned = applyBurn;
	var finalMods = [];
	if (field.isReflect && move.category === "Physical" && !isCritical) {
		finalMods.push(field.format !== "Singles" ? 0xA8F : 0x800);
		description.isReflect = true;
	} else if (field.isLightScreen && move.category === "Special" && !isCritical) {
		finalMods.push(field.format !== "Singles" ? 0xA8F : 0x800);
		description.isLightScreen = true;
	}
	if ((defAbility === "Multiscale" || defAbility == "Shadow Shield") && defender.curHP === defender.maxHP) {
		finalMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	if (attacker.ability === "Tinted Lens" && typeEffectiveness < 1) {
		finalMods.push(0x2000);
		description.attackerAbility = attacker.ability;
	}
	if (field.isFriendGuard) {
		finalMods.push(0xC00);
		description.isFriendGuard = true;
	}
	if (attacker.ability === "Sniper" && isCritical) {
		finalMods.push(0x1800);
		description.attackerAbility = attacker.ability;
	}
	if (attacker.ability === "Neuroforce" && typeEffectiveness > 1 && !move.isZ) {
		finalMods.push(0x1400);
		description.attackerAbility = attacker.ability;
	}
	if ((defAbility === "Solid Rock" || defAbility === "Filter" || defAbility === "Prism Armor") && typeEffectiveness > 1) {
		finalMods.push(0xC00);
		description.defenderAbility = defAbility;
	}
	if (attacker.item === "Expert Belt" && typeEffectiveness > 1 && !move.isZ) {
		finalMods.push(0x1333);
		description.attackerItem = attacker.item;
	} else if (attacker.item === "Life Orb" && !move.isZ) {
		finalMods.push(0x14CC);
		description.attackerItem = attacker.item;
	}
	if (getBerryResistType(defender.item) === move.type && (typeEffectiveness > 1 || move.type === "Normal") &&
            attacker.ability !== "Unnerve") {
		finalMods.push(0x800);
		description.defenderItem = defender.item;
	}
	if (defAbility === "Fur Coat" && hitsPhysical) {
		finalMods.push(0x800);
		description.defenderAbility = defAbility;
	}
	var finalMod = chainMods(finalMods);

	var damage = [], pbDamage = [];
	var child, childDamage, j;
	if (attacker.ability === "Parental Bond" && move.hits === 1 && (field.format === "Singles" || !move.isSpread)) {
		child = JSON.parse(JSON.stringify(attacker));
		child.rawStats = attacker.rawStats;
		child.stats = attacker.stats;
		child.ability = "";
		child.isChild = true;
		if (move.name === "Power-Up Punch") {
			child.boosts[AT]++;
			child.stats[AT] = getModifiedStat(child.rawStats[AT], child.boosts[AT]);
		}
		childDamage = getDamageResult(child, defender, move, field).damage;
		description.attackerAbility = attacker.ability;
		if (move.name === "Power-Up Punch") {
			child.boosts[AT]--;
			child.stats[AT] = getModifiedStat(child.rawStats[AT], child.boosts[AT]);
		}
	}
	for (var i = 0; i < 16; i++) {
		damage[i] = Math.floor(baseDamage * (85 + i) / 100);
		damage[i] = pokeRound(damage[i] * stabMod / 0x1000);
		damage[i] = Math.floor(damage[i] * typeEffectiveness);
		if (applyBurn) {
			damage[i] = Math.floor(damage[i] / 2);
		}
		damage[i] = Math.max(1, damage[i]);
		damage[i] = pokeRound(damage[i] * finalMod / 0x1000);
		if (attacker.ability === "Parental Bond" && move.hits === 1 && (field.format === "Singles" || !move.isSpread)) {
			for (j = 0; j < 16; j++) {
				pbDamage[16 * i + j] = damage[i] + childDamage[j];
			}
		}
	}
	// Return a bit more info if this is a Parental Bond usage.
	if (pbDamage.length) {
		return {
			"damage": pbDamage.sort(numericSort),
			"parentDamage": damage,
			"childDamage": childDamage,
			"description": buildLGDescription(description)
		};
	}
	return {"damage": pbDamage.length ? pbDamage.sort(numericSort) : damage, "description": buildLGDescription(description)};
}

function numericSort(a, b) {
	return a - b;
}

function buildDescription(description) {
	var output = "";
	if (description.attackBoost) {
		if (description.attackBoost > 0) {
			output += "+";
		}
		output += description.attackBoost + " ";
	}
	output = appendIfSet(output, description.attackEVs);
	output = appendIfSet(output, description.attackerItem);
	output = appendIfSet(output, description.attackerAbility);
	if (description.isBurned) {
		output += "burned ";
	}
	output += description.attackerName + " ";
	if (description.isHelpingHand) {
		output += "Helping Hand ";
	}
	if (description.isPowerSpot) {
		output += "Power Spot ";
	}
	if (description.isBattery) {
		output += "Battery ";
	}
	output += description.moveName + " ";
	if (description.moveBP && description.moveType) {
		output += "(" + description.moveBP + " BP " + description.moveType + ") ";
	} else if (description.moveBP) {
		output += "(" + description.moveBP + " BP) ";
	} else if (description.moveType) {
		output += "(" + description.moveType + ") ";
	}
	if (description.hits) {
		output += "(" + description.hits + " hits) ";
	}
	output += "vs. ";
	if (description.defenseBoost) {
		if (description.defenseBoost > 0) {
			output += "+";
		}
		output += description.defenseBoost + " ";
	}
	output = appendIfSet(output, description.HPEVs);
	if (description.defenseEVs) {
		output += " / " + description.defenseEVs + " ";
	}
	output = appendIfSet(output, description.defenderItem);
	output = appendIfSet(output, description.defenderAbility);
	if (description.isMinimized) {
		output += "Minimized ";
	}
	if (description.isDynamax) {
		output += "Dynamax ";
	}
	output += description.defenderName;
	if (description.weather) {
		output += " in " + description.weather;
	} else if (description.terrain) {
		output += " in " + description.terrain + " Terrain";
	}
	if (description.isReflect) {
		output += " through Reflect";
	} else if (description.isLightScreen) {
		output += " through Light Screen";
	}
	if (description.isCritical) {
		output += " on a critical hit";
	}
	if (description.isFriendGuard) {
		output += " with Friend Guard";
	}
	if (description.isQuarteredByProtect) {
		output += " through Protect";
	}
	if (description.isZeroVsDynamax) {
		output += " (this move has No Effect against Dynamax Pokémon!)";
	}

	return output;
}

function buildLGDescription(description) {
	var output = "";
	if (description.attackBoost) {
		if (description.attackBoost > 0) {
			output += "+";
		}
		output += description.attackBoost + " ";
	}
	output = appendIfSet(output, description.attackEVs);
	output = appendIfSet(output, description.attackerItem);
	output = appendIfSet(output, description.attackerAbility);
	if (description.isBurned) {
		output += "burned ";
	}
	output += description.attackerName + " ";
	if (description.isHelpingHand) {
		output += "Helping Hand ";
	}
	if (description.isPowerSpot) {
		output += "Power Spot ";
	}
	if (description.isBattery) {
		output += "Battery ";
	}
	output += description.moveName + " ";
	if (description.moveBP && description.moveType) {
		output += "(" + description.moveBP + " BP " + description.moveType + ") ";
	} else if (description.moveBP) {
		output += "(" + description.moveBP + " BP) ";
	} else if (description.moveType) {
		output += "(" + description.moveType + ") ";
	}
	if (description.hits) {
		output += "(" + description.hits + " hits) ";
	}
	output += "vs. ";
	if (description.defenseBoost) {
		if (description.defenseBoost > 0) {
			output += "+";
		}
		output += description.defenseBoost + " ";
	}
	output = appendIfSet(output, description.HPEVs);
	if (description.defenseEVs) {
		output += " / " + description.defenseEVs + " ";
	}
	output = appendIfSet(output, description.defenderItem);
	output = appendIfSet(output, description.defenderAbility);
	if (description.isMinimized) {
		output += "Minimized ";
	}
	output += description.defenderName;
	if (description.weather) {
		output += " in " + description.weather;
	} else if (description.terrain) {
		output += " in " + description.terrain + " Terrain";
	}
	if (description.isReflect) {
		output += " through Reflect";
	} else if (description.isLightScreen) {
		output += " through Light Screen";
	}
	if (description.isCritical) {
		output += " on a critical hit";
	}
	if (description.isFriendGuard) {
		output += " with Friend Guard";
	}
	if (description.isQuarteredByProtect) {
		output += " through Protect";
	}

	return output;
}

function appendIfSet(str, toAppend) {
	if (toAppend) {
		return str + toAppend + " ";
	}
	return str;
}

function toSmogonStat(stat) {
	return stat === AT ? "Atk" :
		stat === DF ? "Def" :
			stat === SA ? "SpA" :
				stat === SD ? "SpD" :
					stat === SP ? "Spe" :
						"wtf";
}

function chainMods(mods) {
	var M = 0x1000;
	for (var i = 0; i < mods.length; i++) {
		if (mods[i] !== 0x1000) {
			M = M * mods[i] + 0x800 >> 12;
		}
	}
	return M;
}

function getMoveEffectiveness(move, type, isGhostRevealed, isGravity) {
	if (isGhostRevealed && type === "Ghost" && (move.type === "Normal" || move.type === "Fighting")) {
		return 1;
	} else if (isGravity && type === "Flying" && move.type === "Ground") {
		return 1;
	} else if (move.name === "Freeze-Dry" && type === "Water") {
		return 2;
	} else if (move.name === "Flying Press") {
		return typeChart["Fighting"][type] * typeChart["Flying"][type];
	} else {
		return typeChart[move.type][type];
	}
}

function getModifiedStat(stat, mod) {
	return mod > 0 ? Math.floor(stat * (2 + mod) / 2) :
		mod < 0 ? Math.floor(stat * 2 / (2 - mod)) :
			stat;
}

function getFinalSpeed(pokemon, weather, terrain) {
	var speed = getModifiedStat(pokemon.rawStats[SP], pokemon.boosts[SP]);
	if (pokemon.item === "Choice Scarf") {
		speed = Math.floor(speed * 1.5);
	} else if (pokemon.item === "Macho Brace" || pokemon.item === "Iron Ball") {
		speed = Math.floor(speed / 2);
	}
	if (pokemon.ability === "Chlorophyll" && weather.indexOf("Sun") > -1 ||
            pokemon.ability === "Sand Rush" && weather === "Sand" ||
            pokemon.ability === "Swift Swim" && weather.indexOf("Rain") > -1 ||
            pokemon.ability === "Slush Rush" && weather.indexOf("Hail") > -1 ||
            pokemon.ability === "Surge Surfer" && terrain === "Electric") {
		speed *= 2;
	}
	return speed;
}

function checkAirLock(pokemon, field) {
	if (pokemon.ability === "Air Lock" || pokemon.ability === "Cloud Nine") {
		field.clearWeather();
	}
}

function checkParentalBondPuP(pokemon) {
	var moveArray = [];
	for (var l = 0; l < pokemon.moves.length; l++) {
		moveArray.push(pokemon.moves[l].name);
	}
	if (pokemon.ability === "Parental Bond" && moveArray.indexOf("Power-Up Punch")) {
		alert("Please ensure that Power-up Punch is in the 4th moveslot, otherwise you may experience some errors in calcs!");
	}
}

function checkForecast(pokemon, weather) {
	if (pokemon.ability === "Forecast" && pokemon.name === "Castform") {
		if (weather.indexOf("Sun") > -1) {
			pokemon.type1 = "Fire";
		} else if (weather.indexOf("Rain") > -1) {
			pokemon.type1 = "Water";
		} else if (weather === "Hail") {
			pokemon.type1 = "Ice";
		} else {
			pokemon.type1 = "Normal";
		}
		pokemon.type2 = "";
	}
}
function checkKlutz(pokemon) {
	if (pokemon.ability === "Klutz") {
		pokemon.item = "";
	}
}

function checkSeeds(pokemon, field) {
	var terrain = field.getTerrain();
	if ((pokemon.item === "Psychic Seed" && terrain === "Psychic") ||
		(pokemon.item === "Misty Seed" && terrain === "Misty")) {
		pokemon.boosts[SD] = Math.min(6, pokemon.boosts[SD] + 1);
	} else if ((pokemon.item === "Electric Seed" && terrain === "Electric") ||
			   (pokemon.item === "Grassy Seed" && terrain === "Grassy")) {
		pokemon.boosts[DF] = Math.min(6, pokemon.boosts[DF] + 1);
	}
}

function checkZacianZamazaenta(pokemon) {
	if (pokemon.ability === "Intrepid Sword") {
		pokemon.boosts[AT] = Math.min(6, pokemon.boosts[AT] + 1);
	} else if (pokemon.ability === "Dauntless Shield") {
		pokemon.boosts[DF] = Math.min(6, pokemon.boosts[DF] + 1);
	}
}

function checkIntimidate(source, target) {
	if (source.ability === "Intimidate") {
		if (target.ability === "Contrary" || target.ability === "Defiant") {
			target.boosts[AT] = Math.min(6, target.boosts[AT] + 1);
		} else if (["Clear Body", "White Smoke", "Hyper Cutter", "Full Metal Body", "Inner Focus"].indexOf(target.ability) !== -1) {
			// no effect
		} else if (target.ability === "Simple") {
			target.boosts[AT] = Math.max(-6, target.boosts[AT] - 2);
		} else if (target.ability === "Mirror Armor" || target.ability === "Magic Bounce") {
			source.boosts[AT] = Math.min(6, source.boosts[AT] - 1);
		} else {
			target.boosts[AT] = Math.max(-6, target.boosts[AT] - 1);
		}
	}
}

function checkMinimize(p1, p2) {
	if ($("#minimL").prop("checked")) {
		p1.boosts[ES] = Math.min(6, p2.boosts[ES] + 2);
	}
	if ($("#minimR").prop("checked")) {
		p2.boosts[ES] = Math.min(6, p2.boosts[ES] + 2);
	}
}

function checkEvo(p1, p2) {
	if ($("#evoL").prop("checked")) {
		p1.boosts[AT] = Math.min(6, p1.boosts[AT] + 2);
		p1.boosts[DF] = Math.min(6, p1.boosts[DF] + 2);
		p1.boosts[SA] = Math.min(6, p1.boosts[SA] + 2);
		p1.boosts[SD] = Math.min(6, p1.boosts[SD] + 2);
		p1.boosts[SP] = Math.min(6, p1.boosts[SP] + 2);
	}
	if ($("#evoR").prop("checked")) {
		p2.boosts[AT] = Math.min(6, p2.boosts[AT] + 2);
		p2.boosts[DF] = Math.min(6, p2.boosts[DF] + 2);
		p2.boosts[SA] = Math.min(6, p2.boosts[SA] + 2);
		p2.boosts[SD] = Math.min(6, p2.boosts[SD] + 2);
		p2.boosts[SP] = Math.min(6, p2.boosts[SP] + 2);
	}

	if ($("#clangL").prop("checked")) {
		p1.boosts[AT] = Math.min(6, p1.boosts[AT] + 1);
		p1.boosts[DF] = Math.min(6, p1.boosts[DF] + 1);
		p1.boosts[SA] = Math.min(6, p1.boosts[SA] + 1);
		p1.boosts[SD] = Math.min(6, p1.boosts[SD] + 1);
		p1.boosts[SP] = Math.min(6, p1.boosts[SP] + 1);
	}
	if ($("#clangR").prop("checked")) {
		p2.boosts[AT] = Math.min(6, p2.boosts[AT] + 1);
		p2.boosts[DF] = Math.min(6, p2.boosts[DF] + 1);
		p2.boosts[SA] = Math.min(6, p2.boosts[SA] + 1);
		p2.boosts[SD] = Math.min(6, p2.boosts[SD] + 1);
		p2.boosts[SP] = Math.min(6, p2.boosts[SP] + 1);
	}

	if ($("#wpL").prop("checked")) {
		p1.boosts[AT] = Math.min(6, p1.boosts[AT] + 2);
		p1.boosts[SA] = Math.min(6, p1.boosts[SA] + 2);
	}
	if ($("#wpR").prop("checked")) {
		p2.boosts[AT] = Math.min(6, p2.boosts[AT] + 2);
		p2.boosts[SA] = Math.min(6, p2.boosts[SA] + 2);
	}
}

function checkDownload(source, target) {
	if (source.ability === "Download") {
		if (target.stats[SD] <= target.stats[DF]) {
			source.boosts[SA] = Math.min(6, source.boosts[SA] + 1);
		} else {
			source.boosts[AT] = Math.min(6, source.boosts[AT] + 1);
		}
	}
}
function checkInfiltrator(attacker, affectedSide) {
	if (attacker.ability === "Infiltrator") {
		affectedSide.isReflect = false;
		affectedSide.isLightScreen = false;
	}
}

function countBoosts(boosts) {
	var sum = 0;
	for (var i = 0; i < STATS.length; i++) {
		if (boosts[STATS[i]] > 0) {
			sum += boosts[STATS[i]];
		}
	}
	return sum;
}

// GameFreak rounds DOWN on .5
function pokeRound(num) {
	return num % 1 > 0.5 ? Math.ceil(num) : Math.floor(num);
}

function getTechnoBlast(item) {
	switch (item) {
	case "Burn Drive":
		return "Fire";
	case "Chill Drive":
		return "Ice";
	case "Douse Drive":
		return "Water";
	case "Shock Drive":
		return "Electric";
	default:
		return "";
	}
}

function getItemBoostType(item) {
	switch (item) {
	case "Draco Plate":
	case "Dragon Fang":
		return "Dragon";
	case "Dread Plate":
	case "BlackGlasses":
	case "Black Glasses":
		return "Dark";
	case "Earth Plate":
	case "Soft Sand":
		return "Ground";
	case "Fist Plate":
	case "Black Belt":
		return "Fighting";
	case "Flame Plate":
	case "Charcoal":
		return "Fire";
	case "Icicle Plate":
	case "NeverMeltIce":
	case "Never-Melt Ice":
		return "Ice";
	case "Insect Plate":
	case "SilverPowder":
	case "Silver Powder":
		return "Bug";
	case "Iron Plate":
	case "Metal Coat":
		return "Steel";
	case "Meadow Plate":
	case "Rose Incense":
	case "Miracle Seed":
		return "Grass";
	case "Mind Plate":
	case "Odd Incense":
	case "TwistedSpoon":
	case "Twisted Spoon":
		return "Psychic";
	case "Pixie Plate":
		return "Fairy";
	case "Sky Plate":
	case "Sharp Beak":
		return "Flying";
	case "Splash Plate":
	case "Sea Incense":
	case "Wave Incense":
	case "Mystic Water":
		return "Water";
	case "Spooky Plate":
	case "Spell Tag":
		return "Ghost";
	case "Stone Plate":
	case "Rock Incense":
	case "Hard Stone":
		return "Rock";
	case "Toxic Plate":
	case "Poison Barb":
		return "Poison";
	case "Zap Plate":
	case "Magnet":
		return "Electric";
	case "Silk Scarf":
	case "Pink Bow":
	case "Polkadot Bow":
		return "Normal";
	default:
		return "";
	}
}

function getBerryResistType(berry) {
	switch (berry) {
	case "Chilan Berry":
		return "Normal";
	case "Occa Berry":
		return "Fire";
	case "Passho Berry":
		return "Water";
	case "Wacan Berry":
		return "Electric";
	case "Rindo Berry":
		return "Grass";
	case "Yache Berry":
		return "Ice";
	case "Chople Berry":
		return "Fighting";
	case "Kebia Berry":
		return "Poison";
	case "Shuca Berry":
		return "Ground";
	case "Coba Berry":
		return "Flying";
	case "Payapa Berry":
		return "Psychic";
	case "Tanga Berry":
		return "Bug";
	case "Charti Berry":
		return "Rock";
	case "Kasib Berry":
		return "Ghost";
	case "Haban Berry":
		return "Dragon";
	case "Colbur Berry":
		return "Dark";
	case "Babiri Berry":
		return "Steel";
	case "Roseli Berry":
		return "Fairy";
	default:
		return "";
	}
}

function getFlingPower(item) {
	return item === "Iron Ball" ? 130 :
		item === "Hard Stone" ? 100 :
			item.indexOf("Plate") !== -1 || ["Deep Sea Tooth", "Thick Club"].indexOf(item) !== -1 ? 90 :
				["Assault Vest", "Weakness Policy"].indexOf(item) !== -1 ? 80 :
					["Poison Barb", "Dragon Fang"].indexOf(item) !== -1 ? 70 :
						["Adamant Orb", "Lustrous Orb", "Macho Brace", "Stick"].indexOf(item) !== -1 ? 60 :
							item === "Sharp Beak" ? 50 :
								item === "Eviolite" ? 40 :
									["Black Belt", "Black Sludge", "Black Glasses", "Charcoal", "Deep Sea Scale", "Flame Orb", "King's Rock",
										"Life Orb", "Light Ball", "Magnet", "Metal Coat", "Miracle Seed", "Mystic Water", "Never-Melt Ice",
										"Razor Fang", "Soul Dew", "Spell Tag", "Toxic Orb", "Twisted Spoon"].indexOf(item) !== -1 ? 30 :
										10;
}

function getNaturalGift(item) {
	var gift = {
		"Apicot Berry": {"t": "Ground", "p": 100},
		"Babiri Berry": {"t": "Steel", "p": 80},
		"Belue Berry": {"t": "Electric", "p": 100},
		"Charti Berry": {"t": "Rock", "p": 80},
		"Chesto Berry": {"t": "Water", "p": 80},
		"Chilan Berry": {"t": "Normal", "p": 80},
		"Chople Berry": {"t": "Fighting", "p": 80},
		"Coba Berry": {"t": "Flying", "p": 80},
		"Colbur Berry": {"t": "Dark", "p": 80},
		"Custap Berry": {"t": "Ghost", "p": 100},
		"Durin Berry": {"t": "Water", "p": 100},
		"Enigma Berry": {"t": "Bug", "p": 100},
		"Ganlon Berry": {"t": "Ice", "p": 100},
		"Haban Berry": {"t": "Dragon", "p": 80},
		"Jaboca Berry": {"t": "Dragon", "p": 100},
		"Kasib Berry": {"t": "Ghost", "p": 80},
		"Kebia Berry": {"t": "Poison", "p": 80},
		"Kee Berry": {"t": "Fairy", "p": 100},
		"Lansat Berry": {"t": "Flying", "p": 100},
		"Leppa Berry": {"t": "Fighting", "p": 80},
		"Liechi Berry": {"t": "Grass", "p": 100},
		"Lum Berry": {"t": "Flying", "p": 80},
		"Maranga Berry": {"t": "Dark", "p": 100},
		"Micle Berry": {"t": "Rock", "p": 100},
		"Occa Berry": {"t": "Fire", "p": 80},
		"Oran Berry": {"t": "Poison", "p": 80},
		"Passho Berry": {"t": "Water", "p": 80},
		"Payapa Berry": {"t": "Psychic", "p": 80},
		"Petaya Berry": {"t": "Poison", "p": 100},
		"Rawst Berry": {"t": "Grass", "p": 80},
		"Rindo Berry": {"t": "Grass", "p": 80},
		"Roseli Berry": {"t": "Fairy", "p": 80},
		"Rowap Berry": {"t": "Dark", "p": 100},
		"Salac Berry": {"t": "Fighting", "p": 100},
		"Shuca Berry": {"t": "Ground", "p": 80},
		"Sitrus Berry": {"t": "Psychic", "p": 80},
		"Starf Berry": {"t": "Psychic", "p": 100},
		"Tanga Berry": {"t": "Bug", "p": 80},
		"Wacan Berry": {"t": "Electric", "p": 80},
		"Watmel Berry": {"t": "Fire", "p": 100},
		"Yache Berry": {"t": "Ice", "p": 80}
	}[item];
	if (gift) {
		if (gen < 6) {
			gift.p -= 20;
		}
		return gift;
	}
	return {"t": "Normal", "p": 1};
}

function getMultiAttack(item) {
	switch (item) {
	case "Bug Memory":
		return "Bug";
	case "Dark Memory":
		return "Dark";
	case "Dragon Memory":
		return "Dragon";
	case "Electric Memory":
		return "Electric";
	case "Fairy Memory":
		return "Fairy";
	case "Fighting Memory":
		return "Fighting";
	case "Fire Memory":
		return "Fire";
	case "Flying Memory":
		return "Flying";
	case "Ghost Memory":
		return "Ghost";
	case "Grass Memory":
		return "Grass";
	case "Ground Memory":
		return "Ground";
	case "Ice Memory":
		return "Ice";
	case "Poison Memory":
		return "Poison";
	case "Psychic Memory":
		return "Psychic";
	case "Rock Memory":
		return "Rock";
	case "Steel Memory":
		return "Steel";
	case "Water Memory":
		return "Water";
	default:
		return "";
	}
}
