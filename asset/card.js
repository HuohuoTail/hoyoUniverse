'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/** @type { importCardConfig } */
export const hyyzcards = {
	card: {
		//伤害属性牌，用于检测收益
		hyyz_winddamage: {
			ai: {
				result: {
					target(player, target, card, isLink) {
						if (target.countCards('he') > 5) return -0.02;
						if (target.countCards('he') >= 3) return -0.8;
						if (target.countCards('he') == 1) return -1.75;
						return -1;
					}
				},
				tag: {
					damage: 1,
					hyyz_windDamage: 1,
					natureDamage: 1,
				},
			},
		},
		hyyz_quantumdamage: {
			ai: {
				result: {
					target(player, target, card, isLink) {
						if (target.countCards('he') >= 3) return -1.75;
						if (target.countCards('h') == 1) return -2;
						return -1.5;
					},
					player(player, target, card) {
						if (player.countCards('he') >= 2) return 0.8;
						if (player.countCards('he') > 0) return 0.4;
						return 0.5;
					}
				},
				tag: {
					damage: 1,
					hyyz_quantumDamage: 1,
					natureDamage: 1,
				},
			},
		},
		hyyz_imaginarydamage: {
			ai: {
				unequip_ai: true,
				skillTagFilter(player, tag, arg) {
					if (arg?.name == "sha" && arg.nature.includes('hyyz_imaginary') && arg.name == 'unequip_ai') return true;
					return true;
				},
				result: {
					target(player, target, card, isLink) {
						if (target.countCards('he') > 5) return -0.02;
						return -1;
					}
				},
				tag: {
					damage: 1,
					hyyz_imaginaryDamage: 1,
					natureDamage: 1,
				},
			},
		},
		hyyzJinghua: {
			ai: {
				result: {
					target(player, target, card, isLink) {
						if (target.canhyyzJinghua()) return 3.5;
						return 1;
					}
				},
				tag: {
					hyyzJinghua: 1,
				},
			},
		},
		//基本牌
		hyyz_chuochuo_info: [`戳戳`,
			`<li>戳你：出牌阶段，对一名其他角色使用。<span class="hyyzGroup">骊歌</span>戳一下目标角色，其随机获得一个负面${get.hyyzIntroduce('效果')}。`,
			`<li>“小伙伴们，好久不见啦！”<br>去年今日此门中，<br>人面桃花相映红。<br>人面不知何处去，<br>桃花依旧笑春风。
			<li>“再未聆骊歌温柔的问好声…”<br>骊歌捣药秋复春，<br>尾巴孤栖与谁邻？<br>今人不见古时月，<br>今月曾经照古人。`
		],
		hyyz_chuochuo: {
			legend: true,
			fullskin: true,//原比例填充卡面背景
			//fullimage:true,//拉伸全图不填充
			type: 'basic',
			enable: true,
			selectTarget: 1,
			filterTarget(card, player, target) {
				return target != player;
			},
			modTarget: true,
			async content(event, trigger, player) {
				const target = event.targets[0];
				game.log(target, '被<span class="hyyzGroup">骊歌</span>戳了一下');

				const all = get.hyyzBuff('debuff', 'dotdebuff'),
					has = Object.keys(target.gethyyzBuff('debuff'));
				if (target.getStorage('_hyyz_fireCard')?.length) has.add('hyyzBuff_zhuoshao');

				//检测没有的debuff
				if (all.some(buff => !has.includes(buff))) {
					await target.addhyyzBuff(all.filter(buff => !has.includes(buff)).randomGet());
					return;
				}
				//未达到上限的dotdebuff
				const dots = has.filter(buff => target.counthyyzBuff(buff) < 5 && get.hyyztype(buff, true) == 'dotdebuff');
				if (!target.countCards('he', card => !card.hasGaintag('_hyyz_fireCard'))) dots.remove('hyyzBuff_zhuoshao');
				if (dots.length) {
					await target.addhyyzBuff(dots.randomGet());
					return;
				}
				//随机buff
				await target.addhyyzBuff(all.randomGet());
			},
			ai: {
				basic: {
					order: 10,
					useful: 8,
					value: 1.5
				},
				result: {
					target: -1,
				},
			},
		},
		hyyz_lingfu_info: ['灵符',
			`<li>禳命：出牌阶段，对一名角色使用，目标角色${get.hyyzIntroduce('净化')}。若其已受伤/未受伤，其回复1点体力/摸一张牌。`,
			`“驱邪…缚魅…灵符…保命…”<br>不知名的角落传来怯怯的声音。`
		],
		hyyz_lingfu: {
			fullskin: true,
			type: "basic",
			cardcolor: "red",
			enable: true,
			filterTarget(card, player, target) {
				return true;
			},
			content() {
				target.hyyzJinghua();
				if (target.isDamaged()) {
					target.recover();
				} else {
					target.draw();
				}
			},
			ai: {
				basic: {
					order: (card, player) => {
						if (player.hasSkillTag('pretao')) return 9;
						if (player.hashyyzBuff('debuff')) return 10;
						return 2;
					},
					useful: (card, i) => {
						let player = _status.event.player;
						if (!game.checkMod(card, player, 'unchanged', 'cardEnabled2', player)) return 2 / (1 + i);
						if (game.hasPlayer(current => get.attitude(player, current) > 0 && current.hashyyzBuff('debuff'))) return 8.5;
						let fs = game.filterPlayer(current => {
							return get.attitude(player, current) > 0 && current.hp <= 2;
						}), damaged = 0, needs = 0;
						fs.forEach(f => {
							if (f.hp > 3 || !lib.filter.cardSavable(card, player, f)) return;
							if (f.hp > 1) damaged++;
							else needs++;
						});
						if (needs && damaged) return 5 * needs + 3 * damaged;
						if (needs + damaged > 1 || player.hasSkillTag('maixie')) return 8;
						if (player.hp / player.maxHp < 0.7) return 7 + Math.abs(player.hp / player.maxHp - 0.5);
						if (needs) return 7;
						if (damaged) return Math.max(3, 7.8 - i);
						return Math.max(1, 7.2 - i);
					},
					value: (card, player) => {
						if (game.hasPlayer(current => get.attitude(player, current) > 0 && current.hashyyzBuff('debuff'))) return 9
						let fs = game.filterPlayer(current => {
							return get.attitude(_status.event.player, current) > 0;
						}), damaged = 0, needs = 0;
						fs.forEach(f => {
							if (!player.canUse('tao', f)) return;
							if (f.hp <= 1) needs++;
							else if (f.hp == 2) damaged++;
						});
						if (needs && damaged || player.hasSkillTag('maixie')) return Math.max(9, 5 * needs + 3 * damaged);
						if (needs || damaged > 1) return 8;
						if (damaged) return 7.5;
						return Math.max(5, 9.2 - player.hp);
					},
				},
				result: {
					target(player, target) {
						if (target.canhyyzJinghua()) return 3.5;
						if (target.hasSkillTag('maixie')) return 3;
						if (target.isDamaged()) return target.getDamagedHp()
						return 1;
					},
					"target_use": (player, target, card) => {
						if (player === _status.currentPhase && player.hasSkillTag('nokeep', true, {
							card: card,
							target: target
						}, true)) return 2;
						let mode = get.mode(),
							taos = player.getCards('hs', i => get.name(i) === 'tao' && lib.filter.cardEnabled(i, target, 'forceEnable'));
						if (target.hp > 0) {
							if (!player.isPhaseUsing()) return 0;
							let min = 7.2 - 4 * player.hp / player.maxHp,
								nd = player.needsToDiscard(0, (i, player) => {
									return !player.canIgnoreHandcard(i) && (taos.includes(i) || get.value(i) >= min);
								}),
								keep = nd ? 0 : 2;
							if (nd > 2 || taos.length > 1 && (nd > 1 || nd && player.hp < 1 + taos.length) || target.identity === 'zhu' && (nd || target.hp < 3) && (mode === 'identity' || mode === 'versus' || mode === 'chess') || !player.hasFriend()) return 2;
							if (game.hasPlayer(current => {
								return player !== current && current.identity === 'zhu' && current.hp < 3 && (mode === 'identity' || mode === 'versus' || mode === 'chess') && get.attitude(player, current) > 0;
							})) keep = 3;
							else if (nd === 2 || player.hp < 2) return 2;
							if (nd === 2 && player.hp <= 1) return 2;
							if (keep === 3) return 0;
							if (taos.length <= player.hp / 2) keep = 1;
							if (keep && game.countPlayer(current => {
								if (player !== current && current.hp < 3 && player.hp > current.hp && get.attitude(player, current) > 2) {
									keep += player.hp - current.hp;
									return true;
								}
								return false;
							})) {
								if (keep > 2) return 0;
							}
							return 2;
						}
						if (target.isZhu2() || target === game.boss) return 2;
						if (player !== target) {
							if (target.hp < 0 && taos.length + target.hp <= 0) return 0;
							if (Math.abs(get.attitude(player, target)) < 1) return 0;
						}
						if (!player.getFriends().length) return 2;
						let tri = _status.event.getTrigger(),
							num = game.countPlayer(current => {
								if (get.attitude(current, target) > 0) return current.countCards('hs', i => get.name(i) === 'tao' && lib.filter.cardEnabled(i, target, 'forceEnable'));
							}),
							dis = 1,
							t = _status.currentPhase || game.me;
						while (t !== target) {
							let att = get.attitude(player, t);
							if (att < -2) dis++;
							else if (att < 1) dis += 0.45;
							t = t.next;
						}
						if (mode === 'identity') {
							if (tri && tri.name === 'dying') {
								if (target.identity === 'fan') {
									if (!tri.source && player !== target || tri.source && tri.source !== target && player.getFriends().includes(tri.source.identity)) {
										if (num > dis || player === target && player.countCards('hs', { type: 'basic' }) > 1.6 * dis) return 2;
										return 0;
									}
								}
								else if (tri.source && tri.source.isZhu && (target.identity === 'zhong' || target.identity === 'mingzhong') &&
									(tri.source.countCards('he') > 2 || player === tri.source && player.hasCard((i) => i.name !== 'tao', 'he'))) return 2;
								//if(player!==target&&!target.isZhu&&target.countCards('hs')<dis) return 0;
							}
							if (player.identity === 'zhu') {
								if (player.hp <= 1 && player !== target && taos + player.countCards('hs', 'jiu') <= Math.min(dis, game.countPlayer(current => {
									return current.identity === 'fan';
								}))) return 0;
							}
						}
						else if (mode === 'stone' && target.isMin() && player !== target && tri && tri.name === 'dying' && player.side === target.side && tri.source !== target.getEnemy()) return 0;
						return 2;
					},
				},
				tag: {
					recover: 1,
					save: 1,
					hyyzJinghua: 1,
				},
			},
		},
		//锦囊牌
		hyyz_zisu_info: ["自塑尘脂",
			"<li>抽卡：出牌阶段，对你使用。目标角色声明牌的主类别及检索方向，然后检索之。若失败，则改为摸两张牌。",
			`›基本牌:伤害/回复/${get.hyyzIntroduce('断拒')}<br>
			›锦囊牌:延时/伤害/${get.hyyzIntroduce('断拒')}<br>
			›装备牌:武器/防具/防御马/进攻马/宝物`],
		hyyz_zisu: {
			fullskin: true,
			type: "trick",
			enable: true,
			selectTarget: -1,
			cardcolor: "red",
			toself: true,
			filterTarget: lib.filter.isMe,
			modTarget: true,
			async content(event, trigger, player) {
				const map = Object.assign({}, lib.card.hyyz_zisu.controlMap), target = event.target;
				//第一步：类型
				const list1 = Object.keys(map);
				const { control1 } = await target.chooseControl(list1)
					.set('list1', list1)
					.set('prompt', '自塑尘脂')
					.set('prompt2', '一、选择定向牌的类型')
					.set('ai', () => {
						const list1 = _status.event.list1, player = _status.event.player;
						if (list1.includes('basic')) {
							if (player.hp <= 2 && player.isDamaged()) return 'basic';//太残血
						}
						if (list1.includes('equip')) {
							const hs = player.getCards('hs');
							if (hs.filter(i => !player.hasUseTarget(i) && player.hasUseTarget(i, false))) {//缺距离
								return 'equip'
							};
							if (player.hp <= 3 && !player.getEquips(2).length) return 'equip'//没有防具
						}
						if (list1.includes('trick')) {
							const enemies = game.countPlayer(current => current.isEnemyOf(player));
							if (enemies.filter(i => i.hp + i.hujia <= 2 || i.needsToDiscard() > 1)) {//可以收或需要控制
								return 'trick'
							}
						}
						if (list1.includes('equip')) return 'equip';
						if (list1.includes('trick')) return 'trick';
						return list1.randomGet()
					})
					.forResult();
				if (!control1 || control1 == 'cancel2') return;
				//第二步：描述
				const list2 = map[control1];
				const { control2 } = await target.chooseControl(list2)
					.set('list2', list2).set('control1', control1)
					.set('prompt', '自塑尘脂')
					.set('prompt2', '二、选择描述包含的词语')
					.set('ai', () => {
						const list2 = _status.event.list2, control1 = _status.event.control1, player = _status.event.player;
						switch (control1) {
							case 'basic': {
								if (list2.includes('回复')) return '回复'
								break;
							}
							case 'trick': {
								const enemies = game.countPlayer(current => current.isEnemyOf(player));
								if (enemies.filter(i => i.hp + i.hujia <= 2) && list2.includes('伤害')) return '伤害';
								if (enemies.filter(i => i.needsToDiscard() > 1) && list2.includes('延时')) return '延时';
								return '伤害'
							}
							default: {
								const hs = player.getCards('hs');
								if (hs.filter(i => !player.hasUseTarget(i) && player.hasUseTarget(i, false)) && list2.includes('武器')) {//缺距离
									return '武器'
								};
								if (player.hp <= 3 && !player.getEquips(2).length && list2.includes('防具')) return '防具'//没有防具
								break;
							}
						}
						return list2.randomGet();
					})
					.forResult();
				if (!control2 || control2 == 'cancel2') return;
				//第三步：检索
				let filter1 = function (card) {
					return get.type2(card) == control1
				}, filter2 = function (card) {
					const info = '' +
						(lib.translate[card.name] ?? '') +//牌名
						(lib.translate[card.name + '_info'] ?? '') +//牌描述
						(lib.translate[lib.card[card.name]?.type ?? ''] ?? '') +//牌类型
						(lib.translate[lib.card[card.name]?.subtype ?? ''] ?? '')//牌子类型
					if (control2 == '断拒') {
						const list = map[control1].slice();
						list.remove('断拒');
						return list.every(str => !info.includes(str))
					}
					return info.includes(control2)
				}
				game.log(player, `选择了<span class='bluetext'>${control2 == '断拒' ? '其他' : control2}</span><span class='yellowtext'>${get.translation(control1)}牌</span>`);

				const card = get.cardPile2((card) => filter1(card) && filter2(card));
				if (card) {
					await target.gain(card, 'gain2', 'log');
				} else {
					game.log('#y系统的嘲笑：', target, '，你歪了！');
					await target.draw(2);
				}
			},
			controlMap: {
				basic: ['伤害', '回复', '断拒'],
				trick: ['延时', '伤害', '断拒'],
				equip: ['武器', '防具', '防御马', '进攻马', '宝物']
			},
			ai: {
				wuxie(target, card, player, viewer) {
					if (target.countCards("h") * Math.max(target.hp, 5) > 6) return 0;
				},
				basic: {
					order: 7,
					useful: 4.5,
					value(card, player) {
						if (player.hp > 2) return 9.2;
						return 9.2 - 0.7 * Math.min(3, player.countCards("hs"));
					},
				},
				result: {
					target: 2,
				},
				tag: {
					draw: 2,
				},
			},
		},
		hyyz_qiongguan_info: ["穷观阵",
			"<li>成竹：此牌不计入手牌上限。<li>穷观：一名角色的判定牌生效时，对此牌使用。若判定牌与穷观阵的花色相同/不同，替换/代替之。",
			"一饮一琢，莫非前定；<br>兰因絮果，必有来因。"],
		hyyz_qiongguan: {
			legend: true,
			fullskin: true,
			wuxieable: true,
			notarget: true,
			type: "trick",
			//recastable() { return true; },
			global: "hyyz_qiongguan_skill",
			async content(event, trigger, player) {
				let evt_useCard = event.getParent(),//xtqiongguan=>useCard
					evt_judge = evt_useCard.getParent(5);//judge
				const chooseCardResultCards = evt_useCard.cards;

				if (evt_judge.player.judging[0].clone) {
					evt_judge.player.judging[0].clone.classList.remove('thrownhighlight');
					game.broadcast(function (card) {
						if (card.clone) card.clone.classList.remove('thrownhighlight');
					}, evt_judge.player.judging[0]);
					game.addVideo('deletenode', player, get.cardsInfo([evt_judge.player.judging[0].clone]));
				}
				if (get.suit(evt_judge.player.judging[0]) == get.suit(chooseCardResultCards[0])) {
					player.$gain2(evt_judge.player.judging[0]);
					await player.gain(evt_judge.player.judging[0]);
				} else {
					await game.cardsDiscard(evt_judge.player.judging[0]);
				}
				evt_judge.player.judging[0] = chooseCardResultCards[0];
				evt_judge.orderingCards.addArray(evt_useCard.cards);
				game.log(evt_judge.player, '将判定牌改为', chooseCardResultCards[0]);
				await game.delay(2);
			},
			ai: {
				basic: {
					order: 7.2,
					useful: 5,
					value: 2,
				},
				result: {
					player: 1,
				},
				tag: {
					judge: 1,
				},
			},
		},
		//神之键
		hyyz_xvkong_info: ["虚空万藏",
			"<li>智库：锁定技，牌堆顶的牌对你可见。<li>拟态：出牌阶段限一次，你可以将虚空万藏拟态为任意装备牌（除木牛流马外）。",
			"Ⅰ启示之键·理<br>"],
		hyyz_xvkong: {//8/4
			legend: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			skills: ["hyyz_xvkong_skill"],
			ai: {
				equipValue: 8,
				basic: {
					equipValue: 4,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 8,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_qianjie_info: ["千界一乘",
			"<li>瞭观：你的进攻距离无限。<li>跃迁：出牌阶段限一次，你可以将装备区内的【千界一乘】置入弃牌堆，并将座次移动至一名其他角色的下家。",
			"Ⅱ永劫之键·空"],
		hyyz_qianjie: {//5/5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip4",
			distance: {
				globalFrom: null,
			},
			skills: ["hyyz_qianjie_skill"],
			ai: {
				equipValue: 5,
				order: 10,
				basic: {
					equipValue: 5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_dizui_info: ["涤罪七雷",
			"<li>崩解：锁定技，你使用【杀】指定目标后，观看并弃置目标角色的一张牌。",
			"Ⅲ裁决之键·雷"],
		hyyz_dizui: {//5/5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_dizui_skill"],
			distance: {
				attackFrom: -1,
			},
			ai: {
				equipValue(card, player) {
					return 5
				},
				order: 8.5,
				basic: {
					equipValue: 5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_weixing_info: ["卫星",
			"<li>修复：锁定技，你每回合首次失去牌后，摸一张牌。",
			"Ⅳ修复之键·风"],
		hyyz_weixing: {//8/9
			legend: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			skills: ["hyyz_weixing_skill"],
			ai: {
				equipValue(card, player) {
					return player.countCards('h')
				},
				basic: {
					equipValue: 9,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 8,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_wanwu_info: ["万物休眠",
			"<li>休眠：你可以跳过自己的回合，然后摸一张牌并回复1点体力。<li>火种：锁定技，你濒死时，翻至背面并恢复1点体力。",
			"Ⅴ停滞之键·冰"],
		hyyz_wanwu: {//4-8/5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			skills: ["hyyz_wanwu_skill1", "hyyz_wanwu_skill2"],
			ai: {
				equipValue(card, player) {
					if (player.isMinHp() && player.hp < 2) return 8;
					return 4;
				},
				basic: {
					equipValue: 5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_heiyuan_info: ["黑渊",
			"<li>解构：每回合限一次，你使用【杀】对体力值不小于你的角色造成伤害后，你可以令其失去1点体力。",
			"Ⅵ创生之键·死<br>被【白花】替换后，与此牌合成为【黑渊白花】",],
		hyyz_heiyuan: {//3/3
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			distance: {
				attackFrom: -2,
			},
			ai: {
				equipValue: 3,
				order: 8.5,
				basic: {
					equipValue: 3,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
			skills: ["hyyz_heiyuan_skill"],
		},
		hyyz_baihua_info: ["白花",
			"<li>逆流：每回合限一次，体力值不小于你角色使用【杀】对你造成伤害后，你可以回复1点体力。",
			"Ⅵ创生之键·死<br>被【黑渊】替换后，与此牌合成为【黑渊白花】",],
		hyyz_baihua: {//2-3-5/3.5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			distance: {
				attackFrom: -2,
			},
			ai: {
				equipValue(card, player) {
					if (player.isMinHp()) return 5;
					if (player.isDamaged()) return 3;
					return 2
				},
				order: 1,
				basic: {
					equipValue: 3.5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
			skills: ["hyyz_baihua_skill"],
		},
		hyyz_heiyuanbaihua_info: ["黑渊白花",
			"<li>圣枪·解构&逆流：每回合限一次，当你受到/造成伤害后，你可以令受伤角色回复/失去1点体力。<li>圣枪·绽放&百岁兰：当一名角色进入濒死时，你可以弃置【黑渊】/【白花】，并令其失去/回复1点体力。",
			"Ⅵ创生之键·死"],
		hyyz_heiyuanbaihua: {//10/10
			legend: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_heiyuanbaihua_skill1", "hyyz_heiyuanbaihua_skill2"],
			distance: {
				attackFrom: -3,
			},
			ai: {
				equipValue: 10,
				order: 8.5,
				basic: {
					equipValue: 10,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_tianhuo1_info: ["天火双枪",
			"<li>天火·出鞘：出牌阶段限一次，你可以失去1点体力，造成1点火焰伤害。",
			"Ⅶ破坏之键·炎<br>你死亡或造成击杀时，升级为天火大剑。"],
		hyyz_tianhuo1: {//3.5-8/4.5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_tianhuo_skillx", "hyyz_tianhuo_skill"],
			distance: {
				attackFrom: -2,
			},
			ai: {
				equipValue(card, player) {
					if (player.hp > 2) return 8;
					return 3.5
				},
				order: 1,
				basic: {
					equipValue: 4.5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_tianhuo2_info: ["天火大剑",
			"<li>天火·出鞘：出牌阶段限一次，你可以失去1点体力，造成1点火焰伤害并令其" + get.hyyzIntroduce('灼烧') + "。",
			"Ⅶ破坏之键·炎<br>你死亡或造成击杀时，升级为劫灭。"],
		hyyz_tianhuo2: {//3.5-8/4.5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_tianhuo_skillx", "hyyz_tianhuo_skill"],
			distance: {
				attackFrom: -2,
			},
			ai: {
				equipValue(card, player) {
					if (player.hp > 2) return 8;
					return 3.5
				},
				order: 1,
				basic: {
					equipValue: 4.5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_tianhuo3_info: ["劫灭",
			"<li>天火·出鞘：出牌阶段限一次，你可以失去2点体力，分配2点火焰伤害并令其获得2层" + get.hyyzIntroduce('灼烧') + "。",
			"Ⅶ破坏之键·炎"],
		hyyz_tianhuo3: {//3.5-8/4.5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_tianhuo_skillx", "hyyz_tianhuo_skill"],
			distance: {
				attackFrom: -3,
			},
			ai: {
				equipValue(card, player) {
					if (player.hp > 2) return 8;
					return 3.5
				},
				order: 1,
				basic: {
					equipValue: 4.5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_yvdu_info: ["羽渡尘",
			"<li>洞察：锁定技，其他角色的手牌对你可见，你的手牌上限+2。",
			"Ⅷ意识之键·识"],
		hyyz_yvdu: {//4/4
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			skills: ["hyyz_yvdu_skill"],
			ai: {
				equipValue(card, player) {
					if (player.needsToDiscard()) return player.needsToDiscard() + 2;
					return 4
				},
				basic: {
					equipValue: 4,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_bushi_info: ["不识时务",
			"<li>俱摧：锁定技，你造成伤害前，移除目标两倍于伤害值的护甲。<li>不识抬举：出牌阶段，你可以弃置装备区内的一张【不识时务】，对一名其他角色造成1点伤害。",
			"Ⅷ意识之键·识"],
		hyyz_bushi: {//2-6/1
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_bushi_skill1", "hyyz_bushi_skill2"],
			ai: {
				equipValue(card, player) {
					if (game.hasPlayer(current => (current.hujia > 0 || current.hp == 1) && get.attitude(player, current) < 0)) return 6;
					return 2
				},
				order: 10,
				basic: {
					equipValue: 1,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw") return equipValue(card, player);
							if (method == "raw2") return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_xinghai_info: ["星海谐律",
			"<li>视界：锁定技，你和横置角色计算与其他横置角色的距离视为1。<li>陨集：每回合限一次，你使用黑色牌时，可横置一个目标角色。",
			"Ⅸ吞噬之键·岩"],
		hyyz_xinghai: {//4-3
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			skills: ["hyyz_xinghai_skill"],
			onLose() {
				game.removeGlobalSkill('hyyz_xinghai_skill2', player)
			},
			ai: {
				equipValue(card, player) {
					return 4
				},
				order: 10,
				basic: {
					equipValue: 3,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw") return equipValue(card, player);
							if (method == "raw2") return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_xuanyuan_info: ["轩辕剑",
			"<li>轩辕：你使用的【杀】可以" + get.hyyzIntroduce('附魔') + "任意出现过的属性。<li>墨影：你可令你即将造成伤害的【杀】/【决斗】视为另一者。",
			`Ⅹ支配之键·支配`],
		hyyz_xuanyuan: {//5/3
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_xuanyuan_skill1", "hyyz_xuanyuan_skill2"],
			distance: {
				attackFrom: -1,
			},
			ai: {
				equipValue: 5,
				basic: {
					equipValue: 3,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 3,
					value: (card, player, index, method) => {
						if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw") return equipValue(card, player);
							if (method == "raw2") return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_taixv_info: ["太虚之握",
			`<li>阴阳：每回合限一次，你于出牌阶段外造成伤害后，对受伤角色造成1点${get.hyyzIntroduce('附魔')}任一出现过的属性的伤害。`,
			"支配之键·支配"],
		hyyz_taixv: {//2.5-3.5/2.5
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_taixv_skill"],
			distance: {
				attackFrom: 0,
			},
			loseDelay: false,
			onEquip() {
			},
			onLose() {
			},
			ai: {
				equipValue(card, player) {//遍历手牌，往往优先于basic里的//进攻4防御7//给自己看的
					let skills = player.getSkills(null, false, false);
					for (let skill of skills) {
						let info = lib.translate[skill + '_info']
						if (info?.includes('回合外')) return 3.5;
					}
					return 2.5;//方天
				},
				basic: {
					equipValue: 2.5,//方天
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,//方天，寒冰
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_youda_info: ["犹大的誓约",
			"<li>神恩结界：锁定技，一名角色使用【杀】指定你为目标后，其本回合技能失效。",
			"Ⅺ约束之键·约束"],
		hyyz_youda: {//6/1
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip2",
			skills: ["hyyz_youda_skill"],
			ai: {
				order: 1,
				equipValue: 6,
				basic: {
					equipValue: 1,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw") return equipValue(card, player);
							if (method == "raw2") return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		hyyz_dizang_info: ["地藏御魂",
			"<li>御魂：你使用【杀】指定目标后，若你有召唤物，其可以视为使用风【杀】；否则，召唤" + get.hyyzIntroduce('地藏御魂') + "至目标的上家（地藏御魂将于自己的回合结束后死亡）。",
			"Ⅻ侵蚀之键·侵蚀"],
		hyyz_dizang: {//6/1
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_dizang_skill"],
			distance: {
				attackFrom: -1,
			},
			ai: {
				order: 1,
				equipValue: 6,
				basic: {
					equipValue: 1,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag("reverseEquip") ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards("e").includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card),
							current = player.getEquip(info.subtype),
							value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == "function") {
							if (method == "raw") return equipValue(card, player);
							if (method == "raw2") return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != "number") equipValue = 0;
						if (method == "raw") return equipValue;
						if (method == "raw2") return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		//其他
		hyyz_weiba_info: ["尾巴",
			"<li>附生：锁定技，额定回合结束后，你抉择：失去1点体力并执行一个被尾巴控制的回合；尾巴移至随机角色的宝物栏。",
			"艺海深耕岁月悠，<br>绝技在身意难休。<br>恐其湮没随尘逝，<br>急觅贤徒授秘猷。"],
		hyyz_weiba: {//0.5-6/2
			legend: true,
			fullskin: true,
			type: "equip",
			subtype: "equip5",
			ai: {
				order: 1,
				equipValue(card, player) {
					if (player.hasSkillTag('save')) return 6;
					if (player.hp <= 2) return -1;
					return 0.5;
				},
				basic: {
					equipValue: 2,
					order(card, player) {
						if (player && player.hasSkillTag('reverseEquip')) {
							return 8.5 - get.equipValue(card, player) / 20;
						}
						else {
							return 8 + get.equipValue(card, player) / 20;
						}
					},
					useful: 8,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
			skills: ["hyyz_weiba_skill"],
		},
		hyyz_zhili_info: ["支离剑",
			"<li>裂骨：此牌的攻击范围视为你已损失的体力值。<li>碎芒：你使用伤害即时牌指定目标后，可以失去1点体力并改为直接结算对应属性的伤害。",
			"生之来不能却，其去不能止<br>死亡亦如此"],
		hyyz_zhili: {//0.5-2/0.5
			audio(card, sex) { },
			epic: true,
			fullskin: true,
			type: "equip",
			subtype: "equip1",
			skills: ["hyyz_zhili_skill"],
			distance: {
				get attackFrom() {
					return typeof _status?.event?.player?.getDamagedHp() == 'number' ? 1 - _status.event.player.getDamagedHp() : 0
				}
			},
			ai: {
				equipValue(card, player) {
					if (!player.isDamaged()) return -1
					if (player.hasSkillTag('save')) return 2;
					return 0.5
				},
				order: 7.5,
				basic: {
					equipValue: 0.5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
		//meng
		meng_taohuasu_info: [`桃花酥`, `你可以将此牌当做一张带有“回复”描述的牌使用或打出。`, ``],
		meng_taohuasu: {
			fullimage: true,
			cardcolor: "red",
			type: "basic",
			global: "mengLife_skill",
			derivation: "hyyz_xt_sp_ruanmei",
			ai: {
				basic: {
					order: 7.2,
					useful: 4.5,
					value: 9.2,
				},
				result: {
					target: 2,
				},
				tag: {
					draw: 2,
				},
			},
		},
		meng_meihuagao_info: [`梅花糕`, `你可以将此牌当做一张带有“弃置”描述的牌使用或打出。`, ``],
		meng_meihuagao: {
			fullimage: true,
			cardcolor: "black",
			type: "basic",
			global: "mengLife_skill",
			derivation: "hyyz_xt_sp_ruanmei",
			ai: {
				basic: {
					order: 7.2,
					useful: 4.5,
					value: 9.2,
				},
				result: {
					target: 2,
				},
				tag: {
					draw: 2,
				},
			},
		},
		meng_caomeibing_info: [`草莓饼`, `你可以将此牌当做一张带有“获得”描述的牌使用或打出。`, ``],
		meng_caomeibing: {
			fullimage: true,
			cardcolor: "red",
			type: "basic",
			global: "mengLife_skill",
			derivation: "hyyz_xt_sp_ruanmei",
			ai: {
				basic: {
					order: 7.2,
					useful: 4.5,
					value: 9.2,
				},
				result: {
					target: 2,
				},
				tag: {
					draw: 2,
				},
			},
		},
		meng_chashaobao_info: [`叉烧包`, `你可以将此牌当做一张带有“伤害”描述的牌使用或打出。`, ``],
		meng_chashaobao: {
			fullimage: true,
			cardcolor: "black",
			type: "basic",
			global: "mengLife_skill",
			derivation: "hyyz_xt_sp_ruanmei",
			ai: {
				basic: {
					order: 7.2,
					useful: 4.5,
					value: 9.2,
				},
				result: {
					target: 2,
				},
				tag: {
					draw: 2,
				},
			},
		},
		meng_jiwang_info: ['继往开来', '出牌阶段，对包含你自己在内的一名角色使用。目标角色选择一项：①弃置所有手牌，然后摸等量的牌。②将所有手牌当做一张不为【继往开来】的普通锦囊牌使用。'],
		meng_jiwang: {
			fullskin: true,
			type: "trick",
			enable(card, player) {
				var hs = player.getCards("h", function (cardx) {
					return cardx != card && (!card.cards || !card.cards.includes(cardx));
				});
				if (!hs.length) return false;
				var use = true,
					discard = true;
				for (var i of hs) {
					if (use && !game.checkMod(i, player, "unchanged", "cardEnabled2", player)) use = false;
					if (discard && !lib.filter.cardDiscardable(i, player, "meng_jiwang")) discard = false;
					if (!use && !discard) return false;
				}
				return true;
			},
			selectTarget: -1,
			toself: true,
			filterTarget(card, player, target) {
				return target == player;
			},
			modTarget: true,
			content() {
				"step 0";
				var hs = player.getCards("h");
				if (hs.length) {
					var use = true,
						discard = true;
					for (var i of hs) {
						if (use && !game.checkMod(i, player, "unchanged", "cardEnabled2", player)) use = false;
						if (discard && !lib.filter.cardDiscardable(i, player, "meng_jiwang")) discard = false;
						if (!use && !discard) break;
					}
					if (use && discard)
						player
							.chooseControl()
							.set("prompt", "继往开来：请选择一项")
							.set("choiceList", ["弃置所有手牌，然后摸等量的牌", "将所有手牌当做一张普通锦囊牌使用"])
							.set("ai", function () {
								if (_status.event.player.countCards("h") > 2) return 0;
								return 1;
							});
					else if (use) event._result = { index: 1 };
					else if (discard) event._result = { index: 0 };
					else event.finish();
				} else event.finish();
				"step 1";
				var cards = player.getCards("h");
				if (result.index == 0) {
					player.discard(cards);
					player.draw(cards.length);
					event.finish();
				} else {
					var list = [];
					for (var i of lib.inpile) {
						if (i != "meng_jiwang" && get.type(i) == "trick" && lib.filter.filterCard({ name: i, cards: cards }, player)) list.push(["锦囊", "", i]);
					}
					if (list.length) {
						player.chooseButton(["继往开来：选择要使用的牌", [list, "vcard"]], true).set("ai", function (button) {
							var player = _status.event.player;
							return player.getUseValue({
								name: button.link[2],
								cards: player.getCards("h"),
							});
						});
					} else event.finish();
				}
				"step 2";
				if (result.bool) player.chooseUseTarget({ name: result.links[0][2] }, player.getCards("h"), true);
			},
			ai: {
				basic: {
					order: 0.5,
					useful: 3,
					value: 5,
				},
				result: {
					target(player, target) {
						if (
							target.needsToDiscard(1) ||
							!target.countCards("h", function (card) {
								return get.value(card, player) >= 5.5;
							})
						)
							return 1;
						return 0;
					},
				},
				tag: {
					draw: 2,
				},
			},
		},
		meng_shuangxiang_info: ['双相药物', '出牌阶段，对你使用，目标回复一点体力，并使场上所有角色本回合所有的转换技失效。',],
		meng_shuangxiang: {
			fullskin: true,
			type: "basic",
			cardcolor: "red",
			toself: true,
			enable(card, player) {
				return player.hp < player.maxHp;
			},
			selectTarget: -1,
			filterTarget(card, player, target) {
				return target == player && target.hp < target.maxHp;
			},
			modTarget(card, player, target) {
				return target.hp < target.maxHp;
			},
			async content(event, trigger, player) {
				await event.targets[0].recover();

				for (let current of game.filterPlayer()) {
					const skills = current.getStockSkills("仲村由理", "天下第一").filter(function (skill) {
						var info = get.info(skill);
						if (!info || info.hiddenSkill || info.zhuSkill || info.charlotte) return false;
						return info.zhuanhuanji || info.zhuanhuanLimit || lib.translate[skill + '_info']?.includes('转换');
					});
					if (skills.length) current.addTempSkill('meng_shuangxiang_skill');
				}
			},
			ai: {
				basic: {
					order: (card, player) => {
						if (player.hasSkillTag("pretao")) return 9;
						return 2;
					},
					useful: (card, i) => {
						let player = _status.event.player;
						if (!game.checkMod(card, player, "unchanged", "cardEnabled2", player)) return 2 / (1 + i);
						let fs = game.filterPlayer(current => {
							return get.attitude(player, current) > 0 && current.hp <= 2;
						}),
							damaged = 0,
							needs = 0;
						fs.forEach(f => {
							if (f.hp > 3 || !lib.filter.cardSavable(card, player, f)) return;
							if (f.hp > 1) damaged++;
							else needs++;
						});
						if (needs && damaged) return 5 * needs + 3 * damaged;
						if (needs + damaged > 1 || player.hasSkillTag("maixie")) return 8;
						if (player.hp / player.maxHp < 0.7) return 7 + Math.abs(player.hp / player.maxHp - 0.5);
						if (needs) return 7;
						if (damaged) return Math.max(3, 7.8 - i);
						return Math.max(1, 7.2 - i);
					},
					value: (card, player) => {
						let fs = game.filterPlayer(current => {
							return get.attitude(_status.event.player, current) > 0;
						}),
							damaged = 0,
							needs = 0;
						fs.forEach(f => {
							if (!player.canUse("tao", f)) return;
							if (f.hp <= 1) needs++;
							else if (f.hp == 2) damaged++;
						});
						if ((needs && damaged) || player.hasSkillTag("maixie")) return Math.max(9, 5 * needs + 3 * damaged);
						if (needs || damaged > 1) return 8;
						if (damaged) return 7.5;
						return Math.max(5, 9.2 - player.hp);
					},
				},
				result: {
					target: (player, target) => {
						if (target.hasSkillTag("maixie")) return 3;
						return 2;
					},
					"target_use": (player, target, card) => {
						let mode = get.mode(),
							taos = player.getCards("hs", i => get.name(i) === "tao" && lib.filter.cardEnabled(i, target, "forceEnable"));
						if (target !== _status.event.dying) {
							if (
								!player.isPhaseUsing() ||
								player.needsToDiscard(0, (i, player) => {
									return !player.canIgnoreHandcard(i) && taos.includes(i);
								}) ||
								player.hasSkillTag(
									"nokeep",
									true,
									{
										card: card,
										target: target,
									},
									true
								)
							)
								return 2;
							let min = 8.1 - (4.5 * player.hp) / player.maxHp,
								nd = player.needsToDiscard(0, (i, player) => {
									return !player.canIgnoreHandcard(i) && (taos.includes(i) || get.value(i) >= min);
								}),
								keep = nd ? 0 : 2;
							if (nd > 2 || (taos.length > 1 && (nd > 1 || (nd && player.hp < 1 + taos.length))) || (target.identity === "zhu" && (nd || target.hp < 3) && (mode === "identity" || mode === "versus" || mode === "chess")) || !player.hasFriend()) return 2;
							if (
								game.hasPlayer(current => {
									return player !== current && current.identity === "zhu" && current.hp < 3 && (mode === "identity" || mode === "versus" || mode === "chess") && get.attitude(player, current) > 0;
								})
							)
								keep = 3;
							else if (nd === 2 || player.hp < 2) return 2;
							if (nd === 2 && player.hp <= 1) return 2;
							if (keep === 3) return 0;
							if (taos.length <= player.hp / 2) keep = 1;
							if (
								keep &&
								game.countPlayer(current => {
									if (player !== current && current.hp < 3 && player.hp > current.hp && get.attitude(player, current) > 2) {
										keep += player.hp - current.hp;
										return true;
									}
									return false;
								})
							) {
								if (keep > 2) return 0;
							}
							return 2;
						}
						if (target.isZhu2() || target === game.boss) return 2;
						if (player !== target) {
							if (target.hp < 0 && taos.length + target.hp <= 0) return 0;
							if (Math.abs(get.attitude(player, target)) < 1) return 0;
						}
						if (!player.getFriends().length) return 2;
						let tri = _status.event.getTrigger(),
							num = game.countPlayer(current => {
								if (get.attitude(current, target) > 0) return current.countCards("hs", i => get.name(i) === "tao" && lib.filter.cardEnabled(i, target, "forceEnable"));
							}),
							dis = 1,
							t = _status.currentPhase || game.me;
						while (t !== target) {
							let att = get.attitude(player, t);
							if (att < -2) dis++;
							else if (att < 1) dis += 0.45;
							t = t.next;
						}
						if (mode === "identity") {
							if (tri && tri.name === "dying") {
								if (target.identity === "fan") {
									if ((!tri.source && player !== target) || (tri.source && tri.source !== target && player.getFriends().includes(tri.source.identity))) {
										if (num > dis || (player === target && player.countCards("hs", { type: "basic" }) > 1.6 * dis)) return 2;
										return 0;
									}
								} else if (tri.source && tri.source.isZhu && (target.identity === "zhong" || target.identity === "mingzhong") && (tri.source.countCards("he") > 2 || (player === tri.source && player.hasCard(i => i.name !== "tao", "he")))) return 2;
								//if(player!==target&&!target.isZhu&&target.countCards('hs')<dis) return 0;
							}
							if (player.identity === "zhu") {
								if (
									player.hp <= 1 &&
									player !== target &&
									taos + player.countCards("hs", "jiu") <=
									Math.min(
										dis,
										game.countPlayer(current => {
											return current.identity === "fan";
										})
									)
								)
									return 0;
							}
						} else if (mode === "stone" && target.isMin() && player !== target && tri && tri.name === "dying" && player.side === target.side && tri.source !== target.getEnemy()) return 0;
						return 2;
					},
				},
				tag: {
					recover: 1,
					save: 1,
				},
			},

		},
		meng_mengxiang_info: ["梦想一心", "每回合限一次，你可以改变一种装备栏的废除状态，视为使用或打出一张雷【杀】。<br>你对唯一目标使用【杀】时，若你没有<span class=\"thundertext\" style=\"font-family: yuanli\">护甲/防具/非锁定技/手牌</span>，目标角色的对应元素失效。"],
		meng_mengxiang: {//5/5
			legend: true,
			fullskin: true,
			derivation: 'hyyz_ys_leidianying',
			type: "equip",
			subtype: "equip1",
			skills: ["meng_mengxiang_skill1", "meng_mengxiang_skill2"],
			distance: {
				attackFrom: -2,
			},
			ai: {
				equipValue: 5,
				basic: {
					equipValue: 5,
					order: (card, player) => {
						const equipValue = get.equipValue(card, player) / 20;
						return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
					},
					useful: 2,
					value: (card, player, index, method) => {
						if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
						const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
						let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
						if (typeof equipValue == 'function') {
							if (method == 'raw') return equipValue(card, player);
							if (method == 'raw2') return equipValue(card, player) - value;
							return Math.max(0.1, equipValue(card, player) - value);
						}
						if (typeof equipValue != 'number') equipValue = 0;
						if (method == 'raw') return equipValue;
						if (method == 'raw2') return equipValue - value;
						return Math.max(0.1, equipValue - value);
					},
				},
				result: {
					target: (player, target, card) => get.equipResult(player, target, card.name),
				},
			},
		},
	},
	/**@type { SMap<Skill> } */
	skill: {
		//神之键
		hyyz_xvkong_skill: {
			equipSkill: true,
			init(player, skill) {
				player.storage.zhiku_shown = player.zhiku_shown();
				player.storage.zhiku_shown.observe(ui.cardPile, { childList: true, subtree: true });
			},
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('e', (card) => card.name.includes('hyyz_xvkong'));
			},
			chooseButton: {
				dialog(event, player) {
					let list = [];
					for (let name of lib.inpile) {
						if (get.type(name) == 'equip' && name != 'muniu') list.push([get.subtype(name), '', name]);
					}
					const cards = player.getCards('e', (card) => card.name.includes('hyyz_xvkong'));
					if (cards.length == 1) return ui.create.dialog('🔶拟态：将【虚空万藏】拟态为', [list, 'vcard']);
					return ui.create.dialog('🔶拟态：将【虚空万藏】拟态为', cards, '选择拟态对象', [list, 'vcard']);
				},
				select() {
					if (_status.event.player.countCards('e', (card) => card.name.includes('hyyz_xvkong')) == 1) return 1;
					return 2;
				},
				filter(button, player) {
					if (player.countCards('e', (card) => card.name.includes('hyyz_xvkong')) == 1 || ui.selected.buttons.length) {//已选
						const cards = player.getCards('e', (card) => card.name.includes('hyyz_xvkong'));
						if (get.itemtype(button.link) == 'card') return false;
						//底牌
						const card = cards.length == 1 ? cards[0] : ui.selected.buttons[0].link,
							//目标名
							name = button.link[2];
						if (get.translation(name) == '虚空万藏' && name != 'hyyz_xvkong') return false;//其他扩的虚空不能转化
						if (card.name == name || card.name.slice(9).includes(name)) return false;//同名装备，转化的同名装备
						return true;
					}
					//默认选原始牌
					return get.itemtype(button.link) == 'card';
				},
				check(button) {
					const card = button.link;
					if (get.itemtype(card) == 'card') {
						return true;
					} else {
						return get.equipValue({ name: card[2] });
					}
				},
				backup(links, player) {
					var next = get.copy(lib.skill['hyyz_xvkong_skill_backupx']);
					if (links.length == 1) {
						next.card = player.getCards('e').find((card) => card.name.includes('hyyz_xvkong'));
					} else {
						next.card = links.find(arr => get.itemtype(arr) == 'card');
					}
					next.choice = links.find(arr => Array.isArray(arr));
					return next;
				},
			},
			subSkill: {
				backup: {},
				backupx: {
					selectCard: -1,
					selectTarget: -1,
					filterCard: () => false,
					filterTarget: () => false,
					multitarget: true,
					async content(event, trigger, player) {
						//导入获取的数据
						const target_links = lib.skill.hyyz_xvkong_skill_backup.choice,//选择的牌的links
							source_card = lib.skill.hyyz_xvkong_skill_backup.card,//虚空万藏自己
							//目标原名
							target_name = target_links[2];

						if (lib.card[source_card.name]?.skills && Array.isArray(lib.card[source_card.name].skills)) {
							for (let skill of lib.card[source_card.name].skills) {
								player.removeSkill(skill);
							};
						}
						//目标名
						const name = 'hyyz_xvkong' + (target_name == 'hyyz_xvkong' ? '' : target_links[2]);
						const skills = ['hyyz_xvkong_skill'];
						if (Array.isArray(lib.card[target_name]?.skills)) skills.addArray(lib.card[target_name].skills);

						if (!lib.card[name]) {
							lib.card[name] = {//代码
								type: 'equip',
								subtype: lib.card[target_name].subtype,
								cardimage: lib.card[target_name].cardimage,
								distance: lib.card[target_name].distance,
								skills: skills,
								destroy: lib.card[target_name].destroy,
								ai: {
									equipValue: 10,
									basic: {
										equipValue: 9,
										order: (card, player) => {
											const equipValue = get.equipValue(card, player) / 20;
											return player && player.hasSkillTag('reverseEquip') ? 8.5 - equipValue : 8 + equipValue;
										},
										useful: 8,
										value: (card, player, index, method) => {
											if (!player.getCards('e').includes(card) && !player.canEquip(card, true)) return 0.01;
											const info = get.info(card), current = player.getEquip(info.subtype), value = current && card != current && get.value(current, player);
											let equipValue = info.ai.equipValue || info.ai.basic.equipValue;
											if (typeof equipValue == 'function') {
												if (method == 'raw') return equipValue(card, player);
												if (method == 'raw2') return equipValue(card, player) - value;
												return Math.max(0.1, equipValue(card, player) - value);
											}
											if (typeof equipValue != 'number') equipValue = 0;
											if (method == 'raw') return equipValue;
											if (method == 'raw2') return equipValue - value;
											return Math.max(0.1, equipValue - value);
										},
									},
									result: {
										target: (player, target, card) => get.equipResult(player, target, card.name),
									},
								},
								onEquip: lib.card[target_name].onEquip,
								onLose: lib.card[target_name].onLose,
								filterTarget(card, player, target) {
									return target == player;
								},
								enable: true,
								selectTarget: -1,
								filterTarget: (card, player, target) => player == target && target.canEquip(card, true),
								modTarget: true,
								allowMultiple: false,
								content: lib.element.content.equipCard || function () {
									if (
										!card?.cards.some(card => {
											return get.position(card, true) !== "o";
										})
									) {
										target.equip(card);
									}
								},
								legend: true,
								toself: true,
							};
							if (!lib.translate[name]) lib.translate[name] = `拟态•${get.translation(target_name, 'skill')} `;
							lib.translate[name + '_info'] = lib.translate[target_name + '_info'];
						}
						const card = game.createCard({
							name: name,
							number: get.number(source_card),
							suit: get.suit(source_card),
						});
						await player.lose([source_card], ui.special);
						source_card.fix();
						source_card.remove();
						source_card.destroyed = true;
						await player.equip(card);
					},
				},
			},
			ai: {
				order: 8.1,
				result: {
					player(player, target, card) {
						return 10;
					}
				}
			},
			"_priority": -25,
		},
		hyyz_qianjie_skill: {
			equipSkill: true,
			mod: {
				targetInRange: () => true,
			},
			seatRelated: true,
			enable: "phaseUse",
			usable: 1,
			prompt: "将此牌置入弃牌堆，移动至一名其他角色的下家？",
			changeSeat: true,
			filter(event, player) {
				return game.countPlayer() > 2;
			},
			filterTarget(card, player, target) {
				return player != target && player.previous != target;
			},
			async content(event, trigger, player) {
				const card = player.getEquips(4).find((card) => card.name.startsWith('hyyz_qianjie'));
				await player.loseToDiscardpile([card]);
				while (player.previous != event.targets[0]) {
					game.swapSeat(player, player.next, false, false);
				};
				game.log(player, '将座位移至', event.targets[0], '后');
			},
			ai: {
				order: 5,
				result: {
					target(player, target) {
						//比较你1和目标3之间，123的态度，45678的态度，前敌人-后敌人；的负
						let right = 0, left = 0;
						let x = player.next;
						while (x != target.next) {//从你右边一直到目标下家
							right += get.attitude(player, x);
							x = x.next;
						}

						while (x != player) {//从目标的下家一直到你上家
							left += get.attitude(player, x);
							x = x.next;
						}
						return -get.attitude(player, target)
					},
				},
			},
			"_priority": -25,
		},
		hyyz_dizui_skill: {
			equipSkill: true,
			trigger: {
				player: "useCardToPlayered"
			},
			forced: true,
			filter(event, player) {
				return event.card.name == 'sha';
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			prompt2: '观看并弃置目标的一张牌',
			async content(event, trigger, player) {
				await player.discardPlayerCard(trigger.target, "he", true, "visible");
			},
			ai: {
				"directHit_ai": true,
				skillTagFilter(player, tag, arg) {
					if (get.attitude(player, arg.target) > 0 || arg.card.name != "sha" || arg.target.countCards('h', 'shan') > 1) return false;
				},
			},
			"_priority": -25,
		},
		hyyz_weixing_skill: {
			equipSkill: true,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter"],
			},
			forced: true,
			usable: 1,
			filter(event, player) {
				if (event.name == 'gain' && event.player == player) return false;
				var evt = event.getl(player);
				return evt && evt.cards2 && evt.cards2.length > 0;
			},
			content() {
				player.draw();
			},
			"_priority": -25,
		},
		hyyz_wanwu_skill1: {
			equipSkill: true,
			trigger: {
				player: "phaseBegin",
			},
			check(event, player) {
				if (player.countCards('j', (card) => {
					return ['lebu', 'bingliang'].includes((card.viewAs || card.name))
				})) return player.isDamaged();
				return player.hp < 2;
			},
			prompt2: '跳过本回合，摸一张牌并回复1点体力',
			async content(event, trigger, player) {
				await player.draw();
				await player.recover()
				player.phaseSkipped = true;
				trigger.cancel();
			},
			"_priority": -25,
		}, hyyz_wanwu_skill2: {
			equipSkill: true,
			trigger: {
				player: "dying"
			},
			filter(event, player) {
				return !player.isTurnedOver();
			},
			forced: true,
			async content(event, trigger, player) {
				await player.turnOver();
				await player.recover();
			},
			"_priority": -25,
		},
		hyyz_heiyuan_skill: {
			equipSkill: true,
			trigger: {
				source: "damageSource",
			},
			usable: 1,
			filter(event, player) {
				return event.player.hp >= player.hp && event.card && event.card.name == 'sha' && event.player.isAlive();
			},
			prompt2(event, player) {
				return '令' + get.translation(event.player) + '失去1点体力？'
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			content() {
				trigger.player.loseHp()
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (card.name == 'sha' && player.hp <= target.hp) return [1, 0, 1, -2]
					}
				}
			},
			"_priority": -25,
		},
		hyyz_baihua_skill: {
			equipSkill: true,
			trigger: {
				player: "damageEnd",
			},
			usable: 1,
			filter(event, player) {
				if (!player.getDamagedHp()) return false;
				return event.source && event.source.hp >= player.hp && event.card && event.card.name == 'sha';
			},
			prompt2: '回复1点体力',
			content() {
				player.recover()
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (card.name == 'sha' && target.isDamaged() && player.hp >= target.hp) return [1, 2, 1, 0]
					}
				}
			},
			"_priority": -25,
		},
		hyyz_heiyuanbaihua_skill1: {
			equipSkill: true,
			trigger: {
				player: "damageEnd",
				source: "damageSource",
			},
			usable: 1,
			filter(event, player) {
				if (event.player == player) return player.getDamagedHp() > 0;
				return true;
			},
			check(event, player) {
				if (event.player == player) return true;
				if (event.source && event.source == player) return -get.attitude(player, event.target);
			},
			prompt2(event, player) {
				var str = '';
				if (event.player == player) str += '回复1点体力'
				if (event.source && event.source == player) {
					if (str.length > 1) str += '，并'
					str += '令' + get.translation(event.player) + '失去1点体力'
				}
				return str;
			},
			async content(event, trigger, player) {
				if (trigger.player == player) await player.recover();
				if (trigger.source && trigger.source == player) trigger.player.loseHp();
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (card.name == 'sha') return [1, 0, 1, -2]
					},
					target(card, player, target) {
						if (card.name == 'sha' && target.isDamaged()) return [1, 2, 1, 0]
					}
				}
			},
			"_priority": -25,
		}, hyyz_heiyuanbaihua_skill2: {
			equipSkill: true,
			trigger: {
				global: 'dying'
			},
			filter(event, player) {
				return player.getEquips('hyyz_heiyuanbaihua').length;
			},
			async cost(event, trigger, player) {
				const { links } = await player
					.chooseButton([
						'是否发动绽放&百岁兰？',
						`弃置【白花】以<span class='greentext'>百岁兰</span>；弃置【黑渊】以<span class='firetext'>绽放</span>`,
						[[['装备', '', 'hyyz_baihua'], ['装备', '', 'hyyz_heiyuan']], 'vcard']
					])
					.set('ai', (button) => {
						var att = get.attitude2(_status.event.getTrigger().player);
						if (att > 0) return button.link[2] == 'hyyz_baihua'
						if (att < 0) return button.link[2] == 'hyyz_heiyuan'
						return 0;
					})
					.forResult();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							links: links,
						}
					}
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				const dis_name = event.cost_data.links[0][2];

				if (dis_name == 'hyyz_baihua') await trigger.player.recover();
				else await trigger.player.loseHp();

				const decomposes = player.getEquips('hyyz_heiyuanbaihua');
				await player.lose(decomposes, ui.special);
				for (let decompose of decomposes) {
					decompose.fix();
					decompose.remove();
					decompose.destroyed = true;
					game.log(decompose, '被分解了');
				}
				//lib.inpile.remove('hyyz_heiyuanbaihua');

				lib.inpile.addArray(['hyyz_baihua', 'hyyz_heiyuan']);
				const new_name = dis_name == 'hyyz_baihua' ? 'hyyz_heiyuan' : 'hyyz_baihua';
				const new_card1 = game.createCard2(dis_name, dis_name == 'hyyz_baihua' ? 'heart' : 'spade', 6);
				await game.cardsDiscard(new_card1);

				const new_card2 = game.createCard2(new_name, new_name == 'hyyz_baihua' ? 'heart' : 'spade', 6);
				player.equip(new_card2);
			},
			ai: {
				order: 6,
				threaten: 1.4,
				save: true,
			},
			"_priority": -25,
		},
		hyyz_tianhuo_skillx: {
			equipSkill: true,
			trigger: {
				global: ['dieBefore']
			},
			forced: true,
			filter(event, player) {
				if (!player.countCards('e', (card) => ['hyyz_tianhuo1', 'hyyz_tianhuo2', 'hyyz_tianhuo3'].includes(card.name))) return false;
				return event.player == player || event.source == player
			},
			async content(event, trigger, player) {
				//销毁旧天火，保留最大级别的天火
				const decomposes = player.getCards('e').filter((card) => ['hyyz_tianhuo1', 'hyyz_tianhuo2', 'hyyz_tianhuo3'].includes(card.name));
				await player.lose(decomposes, ui.special);
				let num = 1;
				for (let decompose of decomposes) {
					num = Math.min(Math.max(decompose.name[decompose.name.length - 1], num), 2);
					decompose.fix();
					decompose.remove();
					decompose.destroyed = true;
					game.log(decompose, '被重构了');
					lib.inpile.remove(decompose.name);
				}
				num++;
				lib.inpile.add('hyyz_tianhuo' + num);
				const new_card = game.createCard2('hyyz_tianhuo' + num, "diamond", 1);
				player.equip(new_card);

			},
			"_priority": -25,
		},
		hyyz_tianhuo_skill: {
			equipSkill: true,
			enable: "phaseUse",
			usable: 1,
			filterTarget: true,
			selectTarget() {
				const player = _status.event.player;
				if (player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo3'))) return [1, 2]
				return 1
			},
			prompt() {
				const player = _status.event.player;
				if (player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo3'))) return "失去2点体力，分配等量火焰伤害并令其等量灼烧？"
				if (player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo2'))) return "失去1点体力，造成等量火焰伤害并令其灼烧？"
				return "失去1点体力，造成等量火焰伤害？"
			},
			contentBefore() {
				player.loseHp(player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo3')) ? 2 : 1);
			},
			async content(event, trigger, player) {
				if (player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo3'))) {
					await event.target.damage(player, event.targets.length == 2 ? 1 : 2, 'fire', 'nocard');
					await event.target.addhyyzBuff('hyyzBuff_zhuoshao', event.targets.length == 2 ? 1 : 2)
				} else if (player.getEquips(1).some(i => i.name.startsWith('hyyz_tianhuo2'))) {
					await event.target.damage(player, 1, 'fire', 'nocard');
					await event.target.addhyyzBuff('hyyzBuff_zhuoshao')
				} else {
					await event.target.damage(player, 1, 'fire', 'nocard');
				}
			},
			ai: {
				damage: true,
				order: 12,
				fireAttack: true,
				threaten: 1.3,
				result: {
					target(player, target, card) {
						if (target.hasSkillTag("nofire")) return 0;
						if (player.hp > 2 || player.hp > target.hp) return get.damageEffect(target, player, target, 'fire');
					},
				},
			},
			"_priority": -25,
		},
		hyyz_yvdu_skill: {
			equipSkill: true,
			mod: {
				maxHandcard(player, num) {
					return num + player.getEquips('5').filter(i => i.name.startsWith('hyyz_yvdu')).length * 2;
				},
			},
			ai: {
				viewHandcard: true,
				skillTagFilter(player, arg, target) {
					return target != player;
				},
			},
			"_priority": -25,
		},
		hyyz_bushi_skill1: {
			equipSkill: true,
			trigger: {
				source: "damageBefore",
			},
			forced: true,
			filter(event, player) {
				return event.player.hujia > 0;
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.changeHujia(-Math.min(trigger.player.hujia, trigger.num * 2), 'lose');
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (get.tag(card, 'damage') && target.hujia > 0) {
							return 2
						}
					}
				}
			},
			"_priority": -25,
		}, hyyz_bushi_skill2: {
			equipSkill: true,
			enable: "phaseUse",
			prompt: '弃置装备区的一张【不识时务】，对一名其他角色造成1点伤害',
			filterTarget: lib.filter.notMe,
			async content(event, trigger, player) {
				await player.discard(player.getEquips(1).find(card => card.name.startsWith('hyyz_bushi')));
				await event.targets[0].damage('nocard');
			},
			ai: {
				damage: true,
				order: 1,
				result: {
					target(player, target) {
						if (game.countPlayer(current => {
							return current.hujia > 0 &&
								player.canUse({ name: 'sha' }, current) && get.damageEffect(current, player, player) > 0
						})) {
							if (target.hp == 1) return get.damageEffect(target, player, target) * 1.5;
							return;
						}
						return get.damageEffect(target, player, target);
					},
				},
				threaten: 1.3,
			},
			"_priority": -25,
		},
		hyyz_xinghai_skill: {
			equipSkill: true,
			init(player) {
				game.addGlobalSkill('hyyz_xinghai_skill2', player)
			},
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				return get.color(event.card) == 'black' && event.targets.some(i => !i.isLinked())
			},
			usable: 1,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt('hyyz_xinghai_skill'), '横置一个目标角色', (card, player, target) => {
						const trigger = _status.event.getTrigger();
						return trigger.targets.includes(target) && !target.isLinked()
					})
					.set('ai', (target) => {
						return get.effect(target, { name: 'tiesuo', isCard: true }, _status.event.player, _status.event.player)
					})
					.forResult()
			},
			async content(event, trigger, player) {
				await event.targets[0].link(true)
			},
			"_priority": -25,
		}, hyyz_xinghai_skill2: {
			equipSkill: true,
			mod: {
				globalFrom(from, to, distance) {
					if (from != to) {
						if (from.getEquips(5).some(i => i.name.startsWith('hyyz_xinghai')) || from.isLinked()) {
							if (to.isLinked()) return distance - 1;
							//return distance + 1;
						}
					}
				},
			},
			"_priority": -25,
		},
		hyyz_xuanyuan_skill1: {
			equipSkill: true,
			trigger: {
				player: ["useCard2"]
			},
			filter(event, player) {
				const naturesList = lib.skill.hyyz_xuanyuan_skill1.historyNature()
				naturesList.removeArray(get.natureList(event.card))
				return event.card.name == 'sha' && naturesList.length;
			},
			historyNature() {
				let naturesList = [];
				game.getAllGlobalHistory('everything', (evt) => {
					if (evt.name == 'damage') {
						if (typeof evt.nature == 'string' && evt.nature != '') naturesList.addArray(evt.nature.split(lib.natureSeparator));
					}
					if (evt.name == 'useCard' && evt.card && get.nature(evt.card)) {
						naturesList.addArray(get.nature(evt.card).split(lib.natureSeparator));
					}
					if (evt.name == "changehyyzBuff" && evt.result.changeBuffs.length) {
						naturesList.addArray(get.hyyznatureList(evt.result.changeBuffs))
					}
				})
				return naturesList.filter(i => lib.nature.has(i));
			},
			async cost(event, trigger, player) {
				let naturesList = lib.skill.hyyz_xuanyuan_skill1.historyNature()
				naturesList.removeArray(get.natureList(trigger.card))

				naturesList = naturesList.map(name => [name, get.translation(name)]);

				const { links } = await player
					.chooseButton([get.prompt('hyyz_xuanyuan_skill1') + '<br>附魔任意属性', [naturesList.slice(0), 'tdnodes']], [1, naturesList.length])
					.set('ai', (button) => {
						if (button.link == 'hyyz_wind') return false
						return true;
					})
					.forResult();
				if (links) {
					event.result = {
						bool: true,
						cost_data: links
					}
				}
			},
			async content(event, trigger, player) {
				const natures = event.cost_data.join(lib.natureSeparator);
				game.setNature(trigger.card, natures, true);
			},
			mod: {
				targetInRange(card, player, target) {
					if (get.name(card) == 'sha') return true
				}
			},
			"_priority": -25,
		}, hyyz_xuanyuan_skill2: {
			equipSkill: true,
			trigger: {
				source: 'damageBefore'
			},
			filter(event, player) {
				if (!event.card && !event.cards) return false;
				return event.card.name == 'sha' || event.card.name == 'juedou'
			},
			prompt2(event, player) {
				return `造成伤害的牌视为${event.card.name == 'sha' ? '【决斗】' : '【杀】'}`
			},
			check(event, player) {
				const card = event.card;
				const cardx = get.autoViewAs({ name: card.name == 'sha' ? 'juedou' : 'sha' }, [card]);
				return get.effect(player, cardx, event.source || player, player) > get.effect(player, card, event.source || player, player)
			},
			async content(event, trigger, player) {
				const card = trigger.card;
				const cardx = get.autoViewAs({ name: card.name == 'sha' ? 'juedou' : 'sha' }, [card]);
				trigger.card = cardx;
				trigger.cards = [card]
			},
		},
		hyyz_taixv_skill: {
			equipSkill: true,
			trigger: {
				source: 'damageSource'
			},
			filter(event, player) {
				const naturesList = lib.skill.hyyz_xuanyuan_skill1.historyNature()
				naturesList.removeArray(get.natureList(event.card))
				return !player.isPhaseUsing() && naturesList.length;
			},
			prompt2(event, player) {
				return '对' + get.translation(event.player) + '造成1点附魔任一出现过的属性的伤害'
			},
			async cost(event, trigger, player) {
				let naturesList = lib.skill.hyyz_xuanyuan_skill1.historyNature()
				naturesList = naturesList.map(name => [name, get.translation(name)]);

				const { links } = await player
					.chooseButton([get.prompt('hyyz_taixv_skill') + '<br>对' + get.translation(trigger.player) + '造成1点附魔任一出现过的属性的伤害',
					[naturesList.slice(0), 'tdnodes']])
					.set('ai', (button) => {
						return true
					})
					.forResult();
				if (links) {
					event.result = {
						bool: true,
						cost_data: links
					}
				}
			},
			async content(event, trigger, player) {
				const natures = event.cost_data.join(lib.natureSeparator);
				await trigger.player.damage(natures, player, 'nocard')
			},

		},
		hyyz_youda_skill: {
			equipSkill: true,
			trigger: {
				target: 'useCardToTargeted',
			},
			filter(event, player) {
				if (player.hasSkillTag('unequip2')) return false;
				if (event.name == 'useCardToTargeted' && event.player.hasSkillTag("unequip", false, {
					name: event.card ? event.card.name : null,
					target: player,
					card: event.card,
				})) return false;
				return event.card.name == 'sha';
			},
			forced: true,
			async content(event, trigger, player) {
				trigger.player.addTempSkill('baiban');
			},
			"_priority": -25,
		},
		hyyz_dizang_skill: {
			equipSkill: true,
			mode: ['brawl', 'identity', 'boss', 'guozhan', 'doudizhu', 'single'],
			trigger: {
				player: 'useCardToPlayered'
			},
			seatRelated: true,
			filter(event, player) {
				return event.card.name == 'sha';
			},
			async content(event, trigger, player) {
				if (player.hasFellows()) {
					for (let fellow of player.getFellows()) {
						const card = {
							name: 'sha',
							nature: 'hyyz_wind',
							isCard: true
						}
						if (fellow.hasUseTarget(card)) await fellow.chooseUseTarget(card);
					}
				} else {
					lib.character.hyyz_dizang_character = ['none', 'hyyz_other', 2, ['hyyzwuming'], ['ext:忽悠宇宙/asset/hyyzCard/image/hyyz_dizang_character.jpg']]
					lib.translate.hyyz_dizang_character = '地藏御魂';
					lib.characterTitle.hyyz_dizang_character = '#r地藏御魂的鬼神'
					const { fellow } = await player
						.createFellow('hyyz_dizang_character', trigger.target.getSeatNum())
						.forResult();
					if (get.itemtype(fellow) == 'player') {
						fellow.when({ player: 'phaseAfter' }).then(() => {
							player.die();
						})
					}
				}
			},
		}, hyyzwuming: {
			mod: {
				cardnature(card, player, name) {
					if (card.name == 'sha' && get.color(card) == 'black') return 'hyyz_wind'
				},
				cardname(card, player, name) {
					if (get.color(card) == 'black') return 'sha'
				}
			}
		},
		//其他装备
		hyyz_weiba_skill: {
			equipSkill: true,
			trigger: {
				player: 'phaseAfter'
			},
			filter(event, player) {
				return event.skill != 'hyyz_weiba_skill';
			},
			forced: true,
			async content(event, trigger, player) {
				const { bool } = await player
					.chooseBool(get.prompt('hyyz_weiba_skill') + '失去1点体力，让尾巴大爷代你玩一回合；或让尾巴大爷伤心离开').set('ai', () => {
						return player.hp > 2
					})
					.forResult();
				if (bool) {
					await player.loseHp();
					player.when({
						player: ["loseAfter", "phaseAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					}).filter((event) => {
						if (event.name == 'phase') return event.skill == 'hyyz_weiba_skill';
						const evt = event.getl(player);
						return evt && (evt.es.length || evt.cards2.length > 1) &&
							(evt.es.includes(card => card.name.startsWith('hyyz_weiba')) || evt.cards2.includes(card => card.name.startsWith('hyyz_weiba')));
					}).then(() => {
						game.log('#r尾巴被', player, '#r暂时封印')
						ui.auto.show();
						if (player == game.me && (ui.auto.innerHTML == '托管' || _status.auto == true)) {
							_status.auto = false;
							player.say("蟹蟹尾巴大爷！");
						}
					})
					game.log('#g尾巴控制了', player)
					if (player == game.me) {
						_status.auto = true;
						ui.auto.hide();
						player.say("让老子来！");
					};
					player.insertPhase('hyyz_weiba_skill')
				} else {
					const card = player.getCards('e', (card) => {
						return card.name.startsWith('hyyz_weiba')
					})[0];
					const target = game.filterPlayer(current => !current.isMin() && player != current && current.canEquip(card)).randomGet();
					if (!target) return;
					target.equip(card);
					player.$give(card, target);
					player.line(target, "green");
				}
			},
		},
		hyyz_zhili_skill: {
			equipSkill: true,
			trigger: {
				player: "useCardToTargeted",
			},
			filter(event, player) {
				return event.target && event.card && (event.card.name == 'sha' || get.type(event.card, false) == 'trick' && get.tag(event.card, 'damage') > 0) && player.hp > 0;
			},
			prompt2: '直接结算伤害',
			logTarget: 'targets',
			async content(event, trigger, player) {
				await player.loseHp();
				trigger.excluded.add(trigger.target);
				const list = get.natureList(trigger.card);
				if (trigger.card.name != 'sha' &&
					lib.card[trigger.card.name] && lib.card[trigger.card.name].ai && lib.card[trigger.card.name].ai.tag) {
					const tags = lib.card[trigger.card.name].ai.tag;
					for (let tag in tags) {
						if (tag.length > 6 && tag.slice(tag.length - 6) == 'Damage' && tag.slice(0, tag.length - 6) != 'nature') {
							list.add(tag.slice(0, tag.length - 6))
						}
					}
				}
				let num = 1;
				if (typeof trigger.getParent().baseDamage == 'number') num = trigger.getParent().baseDamage;

				const next = trigger.target.damage();

				if (trigger.cards) next.cards = trigger.cards;
				else next.cards = [];
				if (trigger.card) next.card = trigger.card;
				next.num = num;
				next.source = player;
				next.nature = list.join(lib.natureSeparator)
				await next;
			},
			ai: {
				effect: {
					player(card, player) {
						if (card.name == 'sha' || get.type(card, false) == 'trick' && get.tag(card, 'damage') > 0) {
							if (player.hp == 1 && !player.countCards('hs', 'tao')) {
								return [1, -0.5, 1, -2];
							};
							if (player.hp > 1 || player.countCards('hs', 'tao') > 1) {
								return [1, -0.8, 1, -2];
							};
							if (player.hp >= 3) return [1, 0, 1, -2];
						}
					},
				},
			},
			"_priority": -25,
		},
		hyyz_qiongguan_skill: {
			trigger: {
				global: "judge",
			},
			forced: true,
			priority: 6,
			filter(event, player, name) {
				return player.countCards('hes', (card) => get.name(card) == 'hyyz_qiongguan' && lib.filter.cardEnabled(card, player, 'forceEnable'))
			},
			async content(event, trigger, player) {
				const next = player.chooseToUse();
				next.set('prompt', get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + '，' + '使用【穷观阵】修改此判定？');
				next.set('filterCard', (card, player) => get.name(card) == 'hyyz_qiongguan' && lib.filter.cardEnabled(card, player, 'forceEnable'));
				next.set("respondTo", [trigger.player, trigger.player.judging[0]])
				next.set('ai1', function (card) {
					const player = _status.event.player;
					const trigger = _status.event.getTrigger(), judging = trigger.player.judging[0]
					const result = trigger.judge(card) - trigger.judge(judging);
					const att = get.attitude(player, trigger.player);
					if (att == 0 || result == 0) return 0;
					if (att > 0) {
						return result - get.value(card) / 2;
					}
					else {
						return -result - get.value(card) / 2;
					}
				});
			},
			mod: {
				ignoredHandcard(card, player) {
					if (get.name(card) == 'hyyz_qiongguan') {
						return true;
					}
				},
				cardDiscardable(card, player, name) {
					if (name == "phaseDiscard" && get.name(card) == 'hyyz_qiongguan') {
						return false;
					}
				},
			},
			ai: {
				rejudge: true,
				tag: {
					rejudge: 1,
				},
			},
			"_priority": 600,
		},
		//meng

		mengLife_skill: {
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (event.filterCard({ name: 'wuxie' }, player, event) ||
					event.filterCard({ name: 'shan' }, player, event)) return false;
				if (player.countCards('hes', function (card) {
					if (['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(card.name)) return true;
				})) {
					for (var i of lib.inpile) {
						var type = get.type2(i);
						if ((type == 'basic' || type == 'trick') && event.filterCard({ name: i }, player, event)) return true;
					};
				};
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					var map = {
						'meng_taohuasu': false,//红桃 回复
						'meng_meihuagao': false,//梅花 弃置
						'meng_caomeibing': false,//方块 获得
						'meng_chashaobao': false,//黑桃 伤害
					};
					for (var i of player.getCards('hes')) if (map[i.name] != undefined) map[i.name] = true;
					var dialog = ui.create.dialog('生命牌', 'hidden');
					var list1 = [], list2 = [], list3 = [], list4 = [];
					for (var name of lib.inpile) {
						if (!event.filterCard({ name: name }, player, event)) continue;
						if (['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(name)) continue;
						var type = get.type(name);
						if (type == 'delay' || type == 'equip') continue;
						var info = lib.translate[name + '_info'];
						if (info) {
							if (info.indexOf('回复') != -1) {
								list1.push([type == 'trick' ? '锦囊' : '基本', '', name]);
							};
							if (info.indexOf('弃置') != -1) {
								list2.push([type == 'trick' ? '锦囊' : '基本', '', name]);
							};
							if (info.indexOf('获得') != -1) {
								list3.push([type == 'trick' ? '锦囊' : '基本', '', name]);
							};
							if (info.indexOf('伤害') != -1) {
								if (name == 'sha') {
									list4.push(['基本', '', 'sha']);
									for (var j of lib.inpile_nature) {
										if (event.filterCard({ name: name, nature: j }, player, event)) list4.push(['基本', '', 'sha', j]);
									}
								}
								else list4.push([type == 'trick' ? '锦囊' : '基本', '', name]);
							};
						};
					};
					if (map['meng_taohuasu'] && list1.length > 0) {
						dialog.addText('桃花酥（回复）');
						dialog.addSmall([list1, 'vcard']);
					};
					if (map['meng_meihuagao'] && list2.length > 0) {
						dialog.addText('梅花糕（弃置）');
						dialog.addSmall([list2, 'vcard']);
					};
					if (map['meng_caomeibing'] && list3.length > 0) {
						dialog.addText('草莓饼（获得）');
						dialog.addSmall([list3, 'vcard']);
					};
					if (map['meng_chashaobao'] && list4.length > 0) {
						dialog.addText('叉烧包（伤害）');
						dialog.addSmall([list4, 'vcard']);
					};
					if (!list1.length && !list2.length && !list3.length && !list4.length) dialog.addText('悲！没有奖励……');
					return dialog;
				},
				check(button) {
					if (_status.event.getParent().type != 'phase') return 1;
					var player = _status.event.player;
					if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup(links, player) {
					var life = links[0][2];
					var life_info = lib.translate[life + '_info'];
					return {
						filterCard(card) {
							if (life_info.indexOf('回复') != -1 && get.name(card) == 'meng_taohuasu') return true;
							if (life_info.indexOf('弃置') != -1 && get.name(card) == 'meng_meihuagao') return true;
							if (life_info.indexOf('获得') != -1 && get.name(card) == 'meng_caomeibing') return true;
							if (life_info.indexOf('伤害') != -1 && get.name(card) == 'meng_chashaobao') return true;
							return false;
						},
						popname: true,
						check(card) {
							return 10;
						},
						position: 'hes',
						viewAs: {
							name: links[0][2],
							nature: links[0][3]
						},
					};
				},
				prompt(links, player) {
					return '将一张【生命】牌当做【' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '】使用';
				},
			},
			hiddenCard(player, name) {
				if (name == 'shan' || name == 'wuxie') return false;
				if (!lib.inpile.includes(name)) return false;
				var type = get.type(name);
				if (player.countCards('hes', function (card) {
					if (['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(card.name)) return true;
				})) return (type == 'basic' || type == 'trick');
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				skillTagFilter(player) {
					if (!player.countCards('hes', function (card) {
						if (['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(card.name)) return true;
					})) return false;
				},
				order: 10,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
		},
		meng_shuangxiang_skill: {
			init(player, skill) {
				player.addSkillBlocker(skill);
				let list = player.getSkills(null, false, false).filter((i) => {
					return lib.skill.meng_shuangxiang_skill.skillBlocker(i, player);
				});
				if (list.length) {
					player.addTip(skill, "转换技失效");
					player.markSkill(skill)
				}
			},
			onremove(player, skill) {
				player.removeSkillBlocker(skill);
				player.removeTip(skill);
			},
			charlotte: true,
			skillBlocker(skill, player) {
				if (player.storage.ymshuguang) return false;
				const info = get.info(skill);
				if (info.persevereSkill || info.charlotte) return false;
				return info.zhuanhuanji || info.zhuanhuanLimit || lib.translate[skill + '_info']?.includes('转换');
			},
			intro: {
				content(storage, player, skill) {
					let list = player.getSkills(null, false, false).filter((i) => {
						return lib.skill.meng_shuangxiang_skill.skillBlocker(i, player);
					});
					if (list.length) return "失效技能：" + get.translation(list);
					return "无失效技能";
				},
			},
		},
		//梦想
		meng_mengxiang_skill1: {
			equipSkill: true,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (player.hasHistory('useSkill', (evt) => evt.skill == 'meng_mengxiang_skill1')) return false;
				return event.filterCard({ name: 'sha', isCard: true }, player, event);
			},
			chooseButton: {
				dialog(event, player) {
					const equips = [];
					for (let i = 1; i < 6; i++) {
						equips.push([i, get.translation('equip' + i)]);
					}
					return ui.create.dialog('梦想真说', [equips, 'tdnodes'], 'hidden');
				},
				select: 1,
				check(button) {
					var player = _status.event.player;
					if (typeof button.link == 'number') {
						if (player.hasDisabledSlot()) {
							return player.hasDisabledSlot('equip' + button.link);
						} else {
							if (button.link == 1) return -10;
							if (!player.hasEmptySlot(button.link)) {
								var card = player.getEquip(button.link);
								if (card) {
									var val = get.value(card);
									if (val > 0) return 0;
									return 5 - val;
								}
							}
							switch (button.link) {
								case 3: return 4.5;
								case 4: return 4.4;
								case 5: return 4.3;
								case 2: return (3 - player.hp) * 1.5;
								case 1: return -10;
							}
						}
					}
					return 2;
				},
				backup(links, player) {
					return {
						filterCard: () => { return false },
						selectCard: -1,
						equip: links[0],
						viewAs: {
							name: 'sha',
							nature: 'thunder',
							isCard: true,
						},
						popname: true,
						async precontent(event, trigger, player) {
							player.logSkill('meng_mengxiang_skill1');
							const equip = event.result.equip || lib.skill.meng_mengxiang_skill1_backup.equip;
							if (player.hasDisabledSlot(equip)) player.enableEquip(equip);
							else player.disableEquip(equip);
							delete event.result.skill;
						},
					}
				},
				prompt(links, player) {
					return (player.hasDisabledSlot('equip' + links[0]) ? '恢复' : '废除') + '自己的' + get.translation('equip' + links[0]) + '栏，视为使用雷【杀】';
				},
			},
			hiddenCard(player, name) {
				return name == 'sha';
			},
			ai: {
				respondSha: true,
				order: 1,
				result: {
					player: 1,
				},
			},
		},
		meng_mengxiang_skill2: {
			equipSkill: true,
			trigger: {
				player: "useCard",
			},
			logTarget: "target",
			filter(event, player) {
				let skills = player.getSkills(null, false, false).filter(function (skill) {
					return !lib.skill[skill].charlotte && !get.is.locked(skill, player);
				});
				if (player.countCards('h') > 0 && player.hujia > 0 && player.getEquip(2) && skills.length) return false;
				return event.card.name == 'sha' && event.targets.length == 1;
			},
			forced: true,
			async content(event, trigger, player) {
				const target = trigger.targets[0];
				let str = `<span class='thundertext'> ${get.translation(target)}</span> 的：`;
				if (!player.countCards('h')) {
					str += '<li><span class="firetext">手牌</span>失效';
					trigger.directHit.add(target);
				}
				if (!player.hujia) {
					str += '<li><span class="firetext">护甲</span>失效';
					target.addTempSkill('meng_mengxiang_skill2_hujia');
					target.storage.meng_mengxiang_skill2_hujia.add(trigger.card);
					target.markSkill('meng_mengxiang_skill2_hujia');
				}
				if (!player.getEquip(2)) {
					str += '<li><span class="firetext">防具</span>失效';
					target.addTempSkill('meng_mengxiang_skill2_fangjv');
					target.storage.meng_mengxiang_skill2_fangjv.add(trigger.card);
					target.markSkill('meng_mengxiang_skill2_fangjv');
				}
				let skills = player.getSkills(null, false, false).filter(function (skill) {
					return !lib.skill[skill].charlotte && !get.is.locked(skill, player);
				});
				if (!skills.length) {
					game.log('<li><span class="firetext">非锁定技</span>失效');
					target.addTempSkill('meng_mengxiang_skill2_skill');
					target.storage.meng_mengxiang_skill2_skill.add(trigger.card);
					target.markSkill('meng_mengxiang_skill2_skill');
				}
				game.log('#g【梦想一心】', str);
			},
			ai: {
				"directHit_ai": true,
			},
			subSkill: {
				hujia: {
					init(player, skill) {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					marktext: '⁂',
					intro: {
						name: "无想の一刀",
						content: "护甲失效",
					},
					trigger: {
						player: ["damage", "damageCancelled", "damageZero"],
						source: ["damage", "damageCancelled", "damageZero"],
						target: ["shaMiss", "useCardToExcluded", "useCardToEnd", "eventNeutralized"],
						global: ["useCardEnd"],
					},
					silent: true,
					forced: true,
					popup: false,
					priority: 12,
					charlotte: true,
					firstDo: true,
					filter(event, player) {
						return player.storage.meng_mengxiang_skill2_hujia && event.card && player.storage.meng_mengxiang_skill2_hujia.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					async content(event, trigger, player) {
						player.storage.meng_mengxiang_skill2_hujia.remove(trigger.card);
						if (!player.storage.meng_mengxiang_skill2_hujia.length) player.removeSkill('meng_mengxiang_skill2_hujia');
					},
					ai: {
						nohujia: true,
						skillTagFilter(player, tag, arg) {
							return true;
						}
					},
					"_priority": 1201,
				},
				fangjv: {
					init(player, skill) {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					marktext: '※',
					intro: {
						name: "无想の一刀",
						content: "防具失效",
					},
					trigger: {
						player: ["damage", "damageCancelled", "damageZero"],
						source: ["damage", "damageCancelled", "damageZero"],
						target: ["shaMiss", "useCardToExcluded", "useCardToEnd", "eventNeutralized"],
						global: ["useCardEnd"],
					},
					silent: true,
					forced: true,
					popup: false,
					priority: 12,
					charlotte: true,
					firstDo: true,
					filter(event, player) {
						return player.storage.meng_mengxiang_skill2_fangjv && event.card && player.storage.meng_mengxiang_skill2_fangjv.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					content() {
						player.storage.meng_mengxiang_skill2_fangjv.remove(trigger.card);
						if (!player.storage.meng_mengxiang_skill2_fangjv.length) player.removeSkill('meng_mengxiang_skill2_fangjv');
					},
					ai: {
						"unequip2": true,
					},
					"_priority": 1201,
				},
				skill: {
					init(player, skill) {
						if (!player.storage[skill]) player.storage[skill] = [];
						player.addSkillBlocker(skill);
					},
					onremove(player, skill) {
						player.removeSkillBlocker(skill);
						delete player.storage[skill];
					},
					skillBlocker(skill, player) {
						let info = get.info(skill);
						return !lib.skill[skill].charlotte && !get.is.locked(skill, player);
					},
					marktext: '🚫',
					intro: {
						name: "无想の一刀",
						content(storage, player, skill) {
							var list = player.getSkills(null, false, false).filter(function (i) {
								return lib.skill.meng_mengxiang_skill2_skill.skillBlocker(i, player);
							});
							if (list.length) return '失效技能：' + get.translation(list);
							return '无失效技能';
						},
					},
					trigger: {
						player: ["damage", "damageCancelled", "damageZero"],
						source: ["damage", "damageCancelled", "damageZero"],
						target: ["shaMiss", "useCardToExcluded", "useCardToEnd", "eventNeutralized"],
						global: ["useCardEnd"],
					},
					firstDo: true,
					charlotte: true,
					silent: true,
					forced: true,
					popup: false,
					priority: 12,
					filter(event, player) {
						return player.storage.meng_mengxiang_skill2_skill && event.card && player.storage.meng_mengxiang_skill2_skill.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					content() {
						player.storage.meng_mengxiang_skill2_skill.remove(trigger.card);
						if (!player.storage.meng_mengxiang_skill2_skill.length) player.removeSkill('meng_mengxiang_skill2_skill');
					},
					"_priority": 1201,
				},
			}
		},
	},
	translate: {
		hyyz_xvkong_skill: "拟态",
		hyyz_qianjie_skill: "跃迁",
		hyyz_dizui_skill: "崩解",
		hyyz_weixing_skill: "修复",
		hyyz_wanwu_skill1: "休眠", hyyz_wanwu_skill2: "火种",
		hyyz_heiyuan_skill: "解构", hyyz_baihua_skill: "逆流", hyyz_heiyuanbaihua_skill1: "解构&逆流", hyyz_heiyuanbaihua_skill2: "绽放&百岁兰",
		hyyz_tianhuo_skillx: '天火·重构', hyyz_tianhuo_skill: "天火·出鞘",
		hyyz_yvdu_skill: "洞察",
		hyyz_bushi_skill1: "俱摧", hyyz_bushi_skill2: "不识抬举！",
		hyyz_xinghai_skill: "陨集",
		hyyz_xuanyuan_skill1: '轩辕', hyyz_xuanyuan_skill2: '墨影',
		hyyz_taixv_skill: '阴阳',
		hyyz_youda_skill: "神恩结界",
		hyyz_dizang_skill: "御魂", hyyzwuming: '无明', hyyzwuming_info: '锁定技，你的黑色牌视为风【杀】。',

		hyyz_weiba_skill: '附生',
		hyyz_zhili_skill: "碎芒",
		visible_hyyz_qiongguan: '预',

		//meng
		mengLife_skill: "生命",
		meng_shuangxiang_skill: '双相药物',
		meng_mengxiang_skill1: "梦想真说",
		meng_mengxiang_skill2: "无限の一刀",
	},
	list: [
		//量子杀*5（黑桃） 虚数杀*5（黑桃1红桃3方块1） 风蚀杀*5（梅花）
		//戳戳*6（黑桃1红桃3方块2）

		//量子杀全部是黑桃*质数 1 3 5 7 11
		["spade", 1, "sha", "hyyz_quantum"],
		["spade", 2, "hyyz_qianjie"],//2千界一乘
		["spade", 3, "sha", "hyyz_quantum"],
		["spade", 4, "hyyz_weiba"],//------------尾巴
		["spade", 5, "sha", "hyyz_quantum"],
		["spade", 6, "hyyz_heiyuan"],//6黑渊
		["spade", 7, "sha", "hyyz_quantum"],
		["spade", 8, "hyyz_bushi"],//8不识时务
		["spade", 9, "hyyz_xinghai"],//9星海谐律
		["spade", 10, "hyyz_xuanyuan"],//10轩辕剑
		["spade", 11, "sha", "hyyz_quantum"],
		//["spade", 12, "hyyz_dizang"],//12地藏御魂
		["spade", 13, "hyyz_zhili"],//-------支离剑

		//风杀全是梅花*偶数 2 4 6 8 10
		["club", 1, "hyyz_xvkong"],//1虚空万藏
		["club", 2, "sha", "hyyz_wind"],
		["club", 3, "hyyz_dizui"],//3涤罪七雷
		["club", 4, "sha", "hyyz_wind"],
		["club", 5, "hyyz_wanwu"],//5万物休眠
		["club", 6, "sha", "hyyz_wind"],
		["club", 7, "hyyz_qiongguan"],
		["club", 8, "sha", "hyyz_wind"],
		["club", 9, "hyyz_qiongguan"],
		["club", 10, "sha", "hyyz_wind"],
		["club", 11, "hyyz_youda"],//11犹大的誓约
		["club", 12, "hyyz_qiongguan"],
		["club", 13, "hyyz_qiongguan"],

		//灵符全部是红桃*前五 1 2 3 4 5
		//戳戳全部是红桃*后五 9 10 11 12 13
		["heart", 1, "hyyz_lingfu"],
		["heart", 2, "hyyz_lingfu"],
		["heart", 3, "hyyz_lingfu"],
		["heart", 4, "hyyz_lingfu"],
		["heart", 5, "hyyz_lingfu"],
		["heart", 6, "hyyz_baihua"],//6白花//hyyz_heiyuanbaihua
		["heart", 7, "hyyz_tianhuo1"],//天火123
		["heart", 8, "hyyz_yvdu"],//8羽渡尘
		["heart", 9, "hyyz_chuochuo"],
		["heart", 10, "hyyz_chuochuo"],
		["heart", 11, "hyyz_chuochuo"],
		["heart", 12, "hyyz_chuochuo"],
		["heart", 13, "hyyz_chuochuo"],

		//虚数杀全部是方块*奇数 1 3 5 7 9
		//自塑尘脂全部是方块 2 6 10 11 12 13
		["diamond", 1, "sha", "hyyz_imaginary"],
		["diamond", 2, "hyyz_zisu"],
		["diamond", 3, "sha", "hyyz_imaginary"],
		["diamond", 4, "hyyz_weixing"],//4卫星
		["diamond", 5, "sha", "hyyz_imaginary"],
		["diamond", 6, "hyyz_zisu"],
		["diamond", 7, "sha", "hyyz_imaginary"],
		["diamond", 8, "hyyz_zisu"],
		["diamond", 9, "sha", "hyyz_imaginary"],
		["diamond", 10, "hyyz_taixv"],
		["diamond", 11, "hyyz_zisu"],
		["diamond", 12, "hyyz_zisu"],
		["diamond", 13, "hyyz_zisu"],

		["club", 1, "sha"],
		["club", 2, "sha"],
		["club", 3, "sha"],
		["club", 4, "sha"],
		["club", 5, "sha"],
		["club", 6, "sha"],
		["spade", 7, "sha", "ice"],
		["spade", 8, "sha", "ice"],
		["spade", 9, "sha", "ice"],
		["spade", 10, "sha", "ice"],
		["spade", 11, "sha", "ice"],
		["heart", 2, "shan"],
		["heart", 2, "shan"],
		["heart", 13, "shan"],
		["diamond", 2, "shan"],
		["diamond", 2, "shan"],
		["diamond", 3, "shan"],
		["diamond", 4, "shan"],
		["diamond", 5, "shan"],
		["diamond", 6, "shan"],
		["diamond", 7, "shan"],
		["diamond", 8, "shan"],
		["diamond", 9, "shan"],
		["diamond", 10, "shan"],
		["diamond", 11, "shan"],
		["diamond", 11, "shan"],
		["heart", 3, "tao"],
		["heart", 4, "tao"],
		["heart", 6, "tao"],
		["heart", 7, "tao"],
		["heart", 8, "tao"],
		["heart", 9, "tao"],
		["heart", 12, "tao"],
		["diamond", 12, "tao"],
	],
}
