'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/**@type { SMap < SMap< [String, Character, String, String] | Skill | String>> } */
const characters = {
	2501: {
		meng_yvkong: ['驭空', ['female', 'hyyz_xt', 3, ['mengxiaowang', 'mengqingping', 'mengyunjin', 'mengchenling'], ["clan:狐族",]], '七夕月', ''],
		mengxiaowang: {
			audio: [
				'ext:忽悠宇宙/asset/meng/audio/mengxiaowang1.mp3',
				'ext:忽悠宇宙/asset/meng/audio/mengxiaowang2.mp3',
				'ext:忽悠宇宙/asset/meng/audio/mengxiaowang3.mp3',
				'ext:忽悠宇宙/asset/meng/audio/mengxiaowang1.mp3',
				'ext:忽悠宇宙/asset/meng/audio/mengxiaowang2.mp3',
			],
			init(player) {
				player
					.when('phaseAfter')
					.filter((event, player) => {
						return game.getGlobalHistory('everything', (evt) => evt.player == player && lib.phaseName.includes(evt.name)).length == 6
					})
					.then(() => (player.awakenSkill('mengxiaowang')))
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (event.jinzhi) return false;
				let history = player.getHistory('useCard').map(i => (i.card.name))
				return lib.inpile.some(name => !history.includes(name) && get.timetype(name) == 'notime' && event.filterCard(get.autoViewAs({ name }, "unsure"), player, event))
			},
			chooseButton: {
				dialog(event, player) {
					const list = [], history = player.getHistory('useCard').map(i => (i.card.name));
					for (let name of lib.inpile) {
						if (get.timetype(name) != 'notime') continue;
						if (!event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) continue;
						if (history.includes(name)) continue;
						list.push([get.translation(get.type2(name)), "", name]);
					}
					return ui.create.dialog("霄望", [list, "vcard"]);
				},
				check(button) {
					const player = _status.event.player;
					if (player.isTurnedOver() && player.hp == 1) return -2;
					if (!player.isTurnedOver() && button.link[2] == 'hyyz_lingfu') return 100;
					if (_status.event.getParent().type != "phase") return 1;
					if (["wugu", "zhulu_card", "yiyi", "lulitongxin", "lianjunshengyan", "diaohulishan"].includes(button.link[2])) return 0;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup(links, player) {
					return {
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							suit: "none",
							number: null,
							isCard: true,
						},
						async precontent(event, trigger, player) {
							player.logSkill("mengxiaowang");
							event.result.card = {
								name: event.result.card.name,
								nature: event.result.card.nature,
								suit: "none",
								number: null,
								isCard: true,
							};
							event.result.cards = [];
							delete event.result.skill;
							let list = ['受到1点伤害'];
							if (!player.isTurnedOver()) list.add('翻至背面');
							const control = list.length > 1 ? (await player
								.chooseControl(list, 'cancel2')
								.set('ai', () => list[list.length - 1])
								.forResult()).control : list[0];
							switch (control) {
								case '受到1点伤害': await player.damage(); break;
								case '翻至背面': await player.turnOver(true); break;
								default: {
									var evt = event.getParent();
									evt.set("mengxiaowang", true);
									evt.goto(0);
									return;
								}
							}
						}
					};
				},
				prompt(links, player) {
					return (player.isTurnedOver() ? '受到1点伤害' : '受到1点伤害或翻至背面') + "视为使用" + get.translation(links[0][2]) + "";
				},
			},
			hiddenCard(player, name) {
				let history = player.getHistory('useCard').map(i => (i.card.name))
				return lib.inpile.includes(name) && get.timetype(name) == 'notime' && !history.includes(name)
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				order: 10,
				result: {
					player(player, target, card) {
						if (player.isTurnedOver() && player.hp == 1) return -1
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
		},
		mengqingping: {
			audio: 3,
			trigger: {
				player: 'damageAfter'
			},
			forced: true,
			async content(event, trigger, player) {
				await player.turnOver();
				player.when({ global: 'phaseAfter' }).then(() => {
					player.insertPhase('mengqingping');
				})
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (target.isTurnedOver() && target.hp > 1 && get.tag(card, 'damage') > 0) {
							return [1, 2]
						}
					}
				}
			}
		},
		mengyunjin: {
			audio: 2,
			trigger: {
				global: [
					"shaMiss",//闪
					"eventNeutralized",//无懈可击、金蝉脱壳、草船借箭的抵消，用trigger.unneutralize应对
					"useCardToExcluded",//无效
					"shaCancelled",//trigger.cancel()//cardname取消
				],
			},
			filter(event, player, name) {
				if (event.mengyunjin || !event.card) return false;
				if (!player.hasUseTarget(event.card, true, false)) return false;
				if (get.type(event.card) == 'basic') return player.countCards('hs', { name: 'shan' });
				if (get.type(event.card) == 'trick') return player.countCards('hs', { name: 'wuxie' });
				return false;
			},
			forced: true,
			async content(event, trigger, player) {
				trigger.set('mengyunjin', true)

				const next = player.chooseToUse(``);
				next.set('prompt', `云劲：使用一张${get.type(trigger.card) == 'basic' ? '【闪】' : '【无懈可击】'}抵消${get.translation(trigger.card)}的抵消并使用之`)
				next.set("type", "respond" + (get.type(trigger.card) == 'basic' ? "Shan" : "Wuxie"));
				next.set("card", trigger.card);
				next.set("filterCard", function (card, player) {
					return lib.filter.cardEnabled(card, player, "forceEnable") &&
						get.name(card) == (get.type(_status.event.card) == 'basic' ? 'shan' : 'wuxie')
				});
				next.set("ai", (card) => player.getUseValue(_status.event.card))
				next.set('_trigger', trigger)

				const result = await next.forResult();
				if (result && result.bool) {
					console.log(result);
					if (result.result == 'shaned' || result.card.name == 'shan' || result.card.name == 'wuxie')
						player.chooseUseTarget(trigger.card, true, false);
				}
			},
		},
		mengxiaowang_info: '霄望|若你从未执行过完整回合，你可以翻至背面或受到一点伤害，视为使用一张本回合未使用过的即时牌。',
		mengqingping_info: '清平|锁定技，你受到伤害后，翻面并于本回合结束后执行额外回合。',
		mengyunjin_info: '云劲|你的【闪】/【无懈可击】可以对一张被抵消或无效的基本/锦囊牌使用，使用之。',

		meng_miyali: ['米雅莉', ['female', 'hyyz_other', 4, ['hyyz_dualside', 'mengsanyin', 'mengshuren'], []], '咩阿栗诶', ''],
		hyyz_dualside: {//用了一小部分冰雪雨柔的代码。但是他写反面的方法有点怪
			charlotte: true,
			subSkill: {
				init: {
					trigger: {
						global: "gameStart",
						player: "enterGame"
					},
					silent: true,
					async content(event, trigger, player) {
						const names = [player.name1, player.name2];
						for (const now of names) {
							let name = now;
							if (now[now.length - 1] == '1' || now[now.length - 1] == '2') name = now.slice(0, now.length - 1)
							const name1 = name + '1', name2 = name + '2';
							if (name1 && lib.character[name1] && name2 && lib.character[name2]) {
								//先变成正面
								if (now != name1) player.reinit(now, name1, false);
								if (lib.translate[name1] == lib.translate[name2]) {//同一个角色，那就不分体力
									player.storage.hyyz_dualside = [
										name1, player.hp, player.maxHp,
										name2, player.hp, player.maxHp,
									]
								} else {
									//存储体力
									const characterList1 = lib.character[name1], characterList2 = lib.character[name2];
									player.storage.hyyz_dualside = [
										name1, characterList1.hp, characterList1.maxHp,
										name2, characterList2.hp, characterList2.maxHp
									]
								}
								break;
							}
						}
						const storage = player.storage.hyyz_dualside;
						if (get.mode() == "guozhan") {
							if (player.name1 == storage[0]) {
								player.showCharacter(0);
							} else {
								player.showCharacter(1);
							}
						}
						if (lib.translate[storage[0]] == lib.translate[storage[3]]) {
							player.markSkillCharacter("hyyz_dualside", { name: storage[3] }, '另一个你');
						} else {
							player.markSkillCharacter("hyyz_dualside", { name: storage[3] }, `反面为${get.translation(storage[3])}`, `当前体力：${storage[4]}/${storage[5]}`);
						}
					},
				},
				turn: {
					trigger: { player: ["turnOverAfter", "dieBefore"] },
					silent: true,
					filter(event, player) {
						if (player.storage.hyyz_dualside_over) return false;
						return Array.isArray(player.storage.hyyz_dualside);
					},
					async content(event, trigger, player) {
						const storage = player.storage.hyyz_dualside;
						let bool = player.isTurnedOver();
						if (trigger.name == "die" && lib.translate[storage[0]] != lib.translate[storage[3]]) {//不同名，则有复活多翻一次面
							bool = !bool;
						}
						if (bool) {//正→反
							storage[1] = player.hp;
							storage[2] = player.maxHp;
							player.unmarkSkill("hyyz_dualside");
							if (lib.translate[storage[0]] == lib.translate[storage[3]]) {//同名不切换
								player.reinit(storage[0], storage[3], [player.hp, player.maxHp]);
								player.markSkillCharacter("hyyz_dualside", { name: storage[0] }, '另一个你');
							} else {
								player.reinit(storage[0], storage[3], [storage[4], storage[5]]);
								player.markSkillCharacter("hyyz_dualside", { name: storage[0] }, `反面为${get.translation(storage[0])}`, `当前体力：${storage[1]}/${storage[2]}`);
							}
						} else {
							storage[4] = player.hp;
							storage[5] = player.maxHp;
							player.unmarkSkill("hyyz_dualside");
							if (lib.translate[storage[0]] == lib.translate[storage[3]]) {//同名不切换
								player.reinit(storage[3], storage[0], [player.hp, player.maxHp]);
								player.markSkillCharacter("hyyz_dualside", { name: storage[3] }, '另一个你');
							} else {
								player.reinit(storage[3], storage[0], [storage[1], storage[2]]);
								player.markSkillCharacter("hyyz_dualside", { name: storage[3] }, `正面为${get.translation(storage[3])}`, `当前体力：${storage[4]}/${storage[5]}`);
							}
						}

						if (trigger.name == "die" && lib.translate[storage[0]] != lib.translate[storage[3]]) {
							trigger.cancel();
							delete player.storage.hyyz_dualside;
							player.storage.hyyz_dualside_over = true;
							player.unmarkSkill("hyyz_dualside");
						}
					},
				},
			},
			group: ["hyyz_dualside_init", "hyyz_dualside_turn"],
		},
		meng_miyali1: ['米雅莉', ['female', 'hyyz_other', 4, ['mengsanyin', 'hyyz_dualside'], ['unseen']], '咩阿栗诶',],
		mengsanyin: {
			audio: 1,
			trigger: {
				global: "useCard",
			},
			filter(event, player) {
				if (player.mengsanyin && player.mengsanyin[game.roundNumber] >= 2) return false;
				if (get.suit(event.card) != 'heart') return false;
				return true;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard(get.prompt2('mengsanyin'), 'he', { color: 'red' })
					.set('ai', function (card) {
						const player = _status.event.player, trigger = _status.event.getTrigger();
						let eff = get.effect(trigger.targets[0], trigger.card, trigger.player, player)
						return get.effect(player, trigger.card, trigger.player, player) > eff ||
							get.effect(trigger.player, trigger.card, player, player) > eff;
					}).forResult();
			},
			async content(event, trigger, player) {
				if (!player.mengsanyin) player.mengsanyin = [];
				if (!player.mengsanyin[game.roundNumber]) player.mengsanyin[game.roundNumber] = 0;
				player.mengsanyin[game.roundNumber]++;

				player.recast(event.cards);
				trigger.card.storage.mengsanyin = true;
				trigger.mengsanyin = true;

				const { control } = await player
					.chooseControl('使用者', '目标')
					.set('prompt', '你想成为' + get.translation(trigger.card) + '的').set('ai', function () {
						const player = _status.event.player, trigger = _status.event.getTrigger();
						let eff = get.effect(trigger.targets[0], trigger.card, trigger.player, player)
						if (get.effect(player, trigger.card, trigger.player, player) > eff) return '目标';
						return '使用者';
					})
					.forResult();
				if (control) {
					game.log(player, '成为', trigger.card, '的', control);
					if (control == '使用者') {
						trigger.getParent().player = player;
						trigger.player == player;
					}
					if (control == '目标') {
						trigger.target = player;
						trigger.targets = [player];
					}
				}
			},
			group: ['mengsanyin_buff'],
			subSkill: {
				buff: {
					audio: 'mengsanyin',
					trigger: {
						player: ["recoverAfter", "gainAfter"]
					},
					forced: true,
					filter(event, player) {
						if (event.name == 'gain') {
							return event.getParent().name == 'useCard' && event.getParent().mengsanyin ||
								event.getParent(2).name == 'useCard' && event.getParent(2).mengsanyin ||
								event.getParent(3).name == 'useCard' && event.getParent(3).mengsanyin;
						}
						return event.card?.storage.mengsanyin;
					},
					async content(event, trigger, player) {
						let card = get.cardPile(function (card) {
							return get.color(card) == 'red';
						});
						if (card) {
							await player.gain(card, 'gain2');
						}
						player.turnOver();
					},
				},
			},
		},
		meng_miyali2: ['米雅莉', ['female', 'hyyz_other', 4, ['mengshuren', 'hyyz_dualside'], ['unseen']], '咩阿栗诶',],
		mengshuren: {
			audio: 1,
			trigger: {
				global: "useCard",
			},
			filter(event, player) {
				if (player.mengshuren && player.mengshuren[game.roundNumber] >= 2) return false;
				if (get.suit(event.card) != 'spade') return false;
				return true;
			},
			async content(event, trigger, player) {
				if (!player.mengshuren) {
					player.mengshuren = [];
				}
				if (!player.mengshuren[game.roundNumber]) {
					player.mengshuren[game.roundNumber] = 0;
				}
				player.mengshuren[game.roundNumber]++;
				await player.draw();

				const { cards, targets } = await player
					.chooseCardTarget({
						position: 'hs',
						filterCard: true,
						filterTarget(card, player, target) {
							return (trigger.targets.includes(target) || trigger.player == target) && player.canUse(card, target, false, false)
						},
						prompt: '对使用者或目标使用一张牌？',
						ai1(card, target, player) {
							return 7 - get.value(card);
						},
						ai2(card, target, player) {
							return get.effect(target, card, player, player);
						},
					})
					.forResult();
				if (cards && targets) {
					const card = cards[0];
					card.storage.mengshuren = true;
					player.useCard(cards[0], targets, false)
				}
			},
			group: ['mengshuren_buff'],
			subSkill: {
				buff: {
					audio: 'mengshuren',
					trigger: {
						global: "damageAfter",
					},
					forced: true,
					filter(event, player) {
						return event.card?.storage.mengshuren == true && player.countCards('he', { color: 'black' })
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseCard(true, '【束刃】<br>重铸一张黑色牌', 'he', { color: 'black' })
							.set('ai', function (card) {
								return 10 - get.value(card)
							})
							.forResult();
					},
					async content(event, trigger, player) {
						await player.recast(event.cards)
						player.turnOver();
					},
				},
			},
		},
		hyyz_dualside_info: '双面|这是一个双面武将，其他技能均为不同状态下各自独立生效的技能',
		mengsanyin_info: '散音|每轮限两次，一张红桃牌被使用时， 你可以重铸一张红色牌并将使用者或目标改为你，因此恢复体力/获得牌后，你检索一张红色牌并翻面。',
		mengshuren_info: '束刃|每轮限两次，一名角色使用黑桃牌时，你可以摸一张牌并对使用者或者目标使用一张牌，此牌造成伤害后，你重铸一张黑色牌并翻面。',

		meng_anjielina: ['安洁莉娜', ['female', 'hyyz_other', 3, ['mengxingshi', 'mengxunfeng'], []], '一般路过の祝商', ''],
		mengxingshi: {
			forced: true,
			trigger: {
				player: "drawBegin",
			},
			filter(event, player) {
				return !player.storage.mengxunfeng
			},
			async content(event, trigger, player) {
				trigger.bottom = true;
			},
			group: 'mengxingshi_use',
			subSkill: {
				use: {
					trigger: {
						player: 'useCard'
					},
					forced: true,
					async content(event, trigger, player) {
						const cards = player.storage.mengxunfeng ? get.bottomCards() : get.cards();
						await player.showCards(cards, get.translation(player) + "发动了【信使】");
						if (get.suit(cards[0]) == get.suit(trigger.card)) {
							const { targets } = await player
								.chooseTarget('将' + get.translation(cards) + '交出')
								.set('ai', (i) => get.attitude2(i))
								.forResult();
							if (targets) {
								await targets[0].gain(cards, 'gain2');
							}
						} else {
							let moveds = trigger.cards.filterInD();
							if (moveds.length > 1) {
								const { result } = await player
									.chooseToMove("信使：将牌按顺序置于牌堆" + player.storage.mengxunfeng ? "底" : "顶", true)
									.set("list", [["牌堆" + player.storage.mengxunfeng ? "底" : "顶", moveds]])
									.set("reverse", _status.currentPhase && _status.currentPhase.next && get.attitude(player, _status.currentPhase.next) > 0)
									.set("processAI", function (list) {
										const cards = list[0][1].slice(0);
										cards.sort(function (a, b) {
											return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
										});
										return [cards];
									});
								if (!result.bool) return;
								moveds = result.moved[0];
							}
							if (player.storage.mengxunfeng) {
								for (i = 0; i < moveds.length; i++) {
									ui.cardPile.appendChild(moveds[i]);
								}
								game.log(player, "将", moveds, "置于了牌堆底");
							} else {
								moveds.reverse();
								//await game.cardsGotoPile(moveds, "insert");
								for (var i = 0; i < moveds.length; i++) {
									ui.cardPile.insertBefore(moveds[i], ui.cardPile.firstChild);
								}
								game.log(player, "将", moveds, "置于了牌堆顶");
							}
						}
					},

				}
			},
			ai: {
				abnormalDraw: true,
				skillTagFilter(player, tag, arg) {
					if (tag === "abnormalDraw") return !arg || arg === "bottom";
				},
			},
		},
		mengxunfeng: {
			trigger: {
				player: 'enterGame',
				global: 'phaseBefore',
			},
			forced: true,
			locked: false,
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0)
			},
			async content(event, trigger, player) {
				game.countPlayer(async i => {
					if (i != player) i.addSkills('mengluoyi')
				})
			},
			group: 'mengxunfeng_gain',
			subSkill: {
				gain: {
					trigger: {
						player: "gainAfter",
						global: "loseAsyncAfter",
					},
					prompt: '交换“信使”中的“牌堆顶”与“牌堆底”？',
					filter(event, player) {
						var cards = event.getg(player);
						if (!cards.length) return false;
						return game.hasPlayer(current => {
							if (current == player) return false;
							return event.getl(current).cards2.length;
						});
					},
					async content(event, trigger, player) {
						if (player.storage.mengxunfeng) player.storage.mengxunfeng = false;
						else player.storage.mengxunfeng = true
					},
				}
			},
			onremove: true,
		},
		mengluoyi: {
			limited: true,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return game.hasPlayer(current => current.hasSkill('mengxunfeng')) && player.countCards('he');
			},
			filterCard: true,
			position: 'he',
			selectCard: [1, Infinity],
			check(card) {
				return 8 - get.value(card)
			},
			filterTarget(card, player, target) {
				return target != player && target.hasSkill('mengxunfeng');
			},
			selectTarget() {
				if (game.countPlayer(current => current.hasSkill('mengxunfeng')) > 1) return 1;
				return -1;
			},
			lose: false,
			discard: false,
			prompt() {
				const targets = game.filterPlayer((current) => current.hasSkill('mengxunfeng'));
				return '交给' + get.translation(targets) + (targets.length > 1 ? '中的一人' : '') + '任意张牌，然后其交给你等量的牌且其可先重铸任意张牌。';
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.awakenSkill('mengluoyi')
				await player.give(event.cards, target);
				const { cards } = await target
					.chooseCard('是否重铸任意张牌', [1, target.countCards('he')])
					.set('ai', (card) => {
						return _status.event.player.getUseValue(card) || get.value(card);
					})
					.set('k', player)
					.forResult();
				if (cards) await target.recast(cards);
				await target.chooseToGive(player, 'he', event.cards.length, true)
			},
			ai: {
				order: 1,
				result: {
					target: 2
				}
			}
		},
		mengxingshi_info: '信使|锁定技，你摸牌时，改为从牌堆底;你使用牌时，展示牌堆顶的牌;若花色与使用的牌相同，你将其交给一名角色，否则将使用的牌置于牌堆顶',
		mengxunfeng_info: '寻风|游戏开始时，其他角色获得“驿络”;获得其他角色的牌后，你可交换“信使”中的“牌堆顶”与“牌堆底”',
		mengluoyi_info: '驿络|限定技，出牌阶段，你可交给“安洁莉娜”任意张牌，然后其交给你等量的牌且其可先重铸任意张牌。',

		meng_sp_tingyun: ['停云', ['female', 'hyyz_other', 1, ['menghuqi', 'mengcansheng'], []], '鸦懿鸢霏'],
		menghuqi: {
			audio: 'mengruoxi',
			mark: true,
			intro: {
				content: '当前摸#张牌'
			},
			trigger: {
				player: 'dying'
			},
			enable: 'phaseUse',
			usable: 1,
			async content(event, trigger, player) {
				if (!player.storage.menghuqi) player.storage.menghuqi = 1;
				await player.draw(player.storage.menghuqi);
				if (player.countCards('he')) {
					const { cards, targets } = await player.chooseCardTarget({
						prompt: '交出一张牌，你下一次造成伤害时摸[1]张牌。其下一次造成伤害时令此技的[摸牌数]+1。',
						forced: true,
						filterCard: true,
						filterTarget: lib.filter.notMe,
						position: 'he',
					}).forResult();
					if (cards && targets) {
						await player.give(cards, targets[0]);
						player.when({ source: 'damageSource' }).then(() => {
							if (!player.storage.menghuqi) player.storage.menghuqi = 1;
							player.draw(player.storage.menghuqi)
						})
						targets[0].when({ source: 'damageSource' }).vars({ k: player }).then(() => {
							const current = game.findPlayer(i => i == k);
							if (current) {
								if (!current.storage.menghuqi) current.storage.menghuqi = 1;
								current.storage.menghuqi++;
							}
						})
					}
				}
			},
		},
		mengcansheng: {
			audio: 'mengwuguiWGR',
			priority: -1,
			marktext: '毁',
			intro: {
				name: '残生',
				name2: '毁',
				content: '「毁」标记'
			},
			forced: true,
			trigger: {
				player: 'dying'
			},
			filter(event, player) {
				return player.hp != 1;
			},
			async content(event, trigger, player) {
				const num = 1 - player.hp;
				if (num > 0) await player.recoverTo(1);
				else await player.loseHp(-num);
				if (num > 0) player.addMark('mengcansheng', num);

				if (player.countMark('mengcansheng') > game.countPlayer()) player.die();
			}
		},
		menghuqi_info: '狐祈|出牌阶段限1次或当你进入濒死状态时，你可以摸[1]张牌，并交给1名角色1张牌。然后你下一次造成伤害时摸[1]张牌。其下一次造成伤害时令你以此法的[摸牌数]+1。',
		mengcansheng_info: '残生|锁定技，当你处于濒死状态时，你将体力值调整至1,并获得等同于恢复值的「毁」标记。标记数大于游戏人数时，你死亡。',

		meng_bonisi: ['柏妮丝', ['female', 'hyyz_zzz', 4, ['mengyanji', 'mengrongyan'], []], '木善才'],
		mengyanji: {
			trigger: {
				global: 'damageAfter'
			},
			forced: true,
			filter(event, player) {
				if (player.storage.mengrongyan2 == true) return true;
				return event.source == player || event.player == player;
			},
			async content(event, trigger, player) {
				for (let current of game.filterPlayer()) await current.recast(current.getCards('he'));
			}
		},
		mengrongyan: {
			sunbenSkill: true,
			enable: 'phaseUse',
			filterTarget(card, player, target) {
				return target.hasUseTarget({ name: 'huogong' })
			},
			async content(event, trigger, player) {
				player.awakenSkill('mengrongyan');
				player.when({
					global: 'washCard'
				}).then(() => {
					player.popup("熔焰");
					player.restoreSkill('mengrongyan')
					game.log(player, "恢复了技能", "#g【熔焰】");
				})
				await event.targets[0].chooseUseTarget({ name: 'huogong', storage: { mengrongyan: true } }, true);
				if (game.getGlobalHistory('everything', (evt) => {
					return evt.name == 'damage' && evt.card?.storage.mengrongyan === true;
				}).length > 0) {
					player.changeSkin({ characterName: 'meng_bonisi' }, 'mengrongyan');
					player.storage.mengrongyan2 = true;
					player.when({ global: 'roundStart' }).then(() => {
						delete player.storage.mengrongyan2
						player.changeSkin({ characterName: 'meng_bonisi' }, 'meng_bonisi');
					})
				}

				if (player.storage.mengrongyan2) {
					for (let current of game.filterPlayer(i => i != player)) {
						const { targets: user } = await current
							.chooseTarget('熔焰：选择使用火攻的角色', (card, player, target) => {
								return target.hasUseTarget({ name: 'huogong' })
							}, true)
							.set('ai', (target) => {
								return target.getUseValue({ name: 'huogong' }) * get.attitude2(target);
							})
							.forResult()
						if (user) {
							await user[0].chooseUseTarget({ name: 'huogong', storage: { mengrongyan: true } }, true);
							if (!player.storage.mengrongyan2 && game.getGlobalHistory('everything', (evt) => {
								return evt.name == 'damage' && evt.card?.storage.mengrongyan === true;
							}).length > 0) {
								player.changeSkin({ characterName: 'meng_bonisi' }, 'mengrongyan');
								player.storage.mengrongyan2 = true;
								player.when({ global: 'roundStart' }).then(() => {
									delete player.storage.mengrongyan2
									player.changeSkin({ characterName: 'meng_bonisi' }, 'meng_bonisi');
								})
							}
						}
					}
				}
			},
			onremove(player) {
				delete player.storage.mengrongyan
				delete player.storage.mengrongyan2
			},
			subSkill: {
				sunben: {
					charlotte: true,
					trigger: {
						global: 'washCard'
					},
					forced: true,
					popup: false,
					firstDo: true,
					content() {
						player.popup("熔焰");
						player.removeSkill('mengrongyan_sunben')
						game.log(player, "恢复了技能", "#g【熔焰】");
					},
				},
			},
			ai: {
				order: 10,
				result: {
					target: 2
				}
			}
		},
		mengyanji_info: '焰疾|锁定技，当[你]造成或受到伤害时，所有角色需依次重铸所有牌。',
		mengrongyan_info: '熔焰|昂扬技，出牌阶段，[你]可令一名角色视为使用一张【火攻】，此牌造成伤害后，将武将牌上技能中的[你]改为“存活角色”，直到本轮结束。激昂：牌堆刷新时',

		meng_king: ['king', ['unkonwn', 'hyyz_other', 4, ['mengshouguan', 'mengzhushiK'], []], '咩阿栗诶'],
		mengshouguan: {
			audio: 2,
			trigger: {
				global: 'drawAfter'
			},
			check(event, player) {
				return get.attitude2(event.player) > 0
			},
			filter(event, player) {
				return event.player.isMaxHandcard() && event.player.hasEquipableSlot('equip5') && !event.player.getEquips('equip5').some(i => i.name == 'xuwangzhimian');
			},
			round: 1,
			logTarget: 'player',
			async content(event, trigger, player) {
				var card;
				if (!lib.inpile.includes("xuwangzhimian")) {
					card = game.createCard2("xuwangzhimian", 'club', 4);
					lib.inpile.push("xuwangzhimian");
				} else {
					let getcardPile = function (name) {
						const filter = (card) => card.name == name;
						for (let i = ui.discardPile.childNodes.length - 1; i >= 0; i--) {
							if (filter(ui.discardPile.childNodes[i])) {
								return ui.discardPile.childNodes[i];
							}
						}
						for (let i = ui.cardPile.childNodes.length - 1; i >= 0; i--) {
							if (filter(ui.cardPile.childNodes[i])) {
								return ui.cardPile.childNodes[i];
							}
						}
						let currents = game.filterPlayer(() => true);
						for (let i = currents.length - 1; i >= 0; i--) {
							const hej = currents[i].getCards("hej");
							for (let j = hej.length - 1; j >= 0; j--) {
								if (filter(hej[j])) return hej[j];
							}
						}
					}
					card = getcardPile('xuwangzhimian');
					let owner = get.owner(card)
					if (owner?.isIn() && owner != trigger.player) owner.$giveAuto(card, trigger.player)
				}
				if (!card) return;
				trigger.player.equip(card);
			},
			global: 'mengshouguan_give',
			subSkill: {
				give: {
					audio: 'mengshouguan',
					charlotte: true,
					trigger: {
						player: 'phaseDiscardBefore'
					},
					filter(event, player) {
						return event.player.getEquips('xuwangzhimian').length > 0
					},
					async cost(event, trigger, player) {
						if (player.countCards('h') > player.maxHp) {
							event.result = await player
								.chooseCardTarget({
									prompt: '授冠：弃牌阶段改为展示超出上限的手牌，选择其他角色各获得其中一张',
									filterCard: true,
									selectCard: player.countCards('h') - player.maxHp,
									filterTarget: lib.filter.notMe,
									selectTarget() {
										if (game.countPlayer(i => i != player) > ui.selected.cards.length) return ui.selected.cards.length;
										return -1
									},
									ai1(card) {
										return 100 - get.value(card);
									},
									ai2(target) {
										if (game.hasPlayer(i => i.hasSkill('mengshouguan') && !ui.selected.targets.includes(i))) return target.hasSkill('mengshouguan')
										return 100 + get.attitude2(target);
									}
								})
								.forResult();
						} else {
							event.result = { bool: true }
						}
					},
					async content(event, trigger, player) {
						trigger.cancel();

						if (event.cards?.length > 0 && event.targets?.length > 0) {
							const cards = event.cards, targets = event.targets;
							player.showCards(cards);
							if (player.hasSkill('mengzhushiK2') && game.hasPlayer(i => i.hasSkill('mengzhushiK'))) {
								const current = game.findPlayer(i => i.hasSkill('mengzhushiK'));
								const { links } = await current.chooseButton(cards.length >= 2 ? 2 : 1, [
									'授冠：先获得其中' + (cards.length >= 2 ? '两' : '一') + '张牌',
									cards,
								], (button) => {
									return get.value(button.link);
								}).forResult();
								if (links) {
									cards.removeArray(links)
									await current.gain(links, player, 'give');
								}
							}

							for (let target of targets) {
								if (!cards.length) break;
								const { links } = await target.chooseButton(['授冠：获得其中一张牌', cards], (button) => {
									return get.value(button.link);
								}).forResult();
								if (links) {
									cards.remove(links[0]);
									await target.gain(links, player, 'give');
								}
							}
						}
					},
				}
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (get.subtype(card) == 'equip5' && player.getEquips('equip5').some(i => i.name == 'xuwangzhimian')) {
							return [0, -3]
						}
					}
				}
			}
		},
		mengzhushiK: {
			audio: 1,
			trigger: {
				global: 'roundStart'
			},
			check(event, player) {
				return get.attitude2(event.player) > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget('造势：请一名其他角色摸两张牌', lib.filter.notMe).set('ai', i => get.attitude2(i)).forResult()
			},
			async content(event, trigger, player) {
				const { bool } = await event.targets[0].chooseBool('是否摸两张牌。若如此做，展示牌时，king先获得其中两张牌').forResult();
				if (bool) {
					event.targets[0].draw(2);
					event.targets[0].addSkill('mengzhushiK2');
				}
			},
		}, mengzhushiK2: { charlotte: true },
		mengshouguan_info: '授冠|每轮限一次，一名角色摸牌至最多时，你可将【虚妄之冕】（没有则先获得）置入其装备区。装备区有【虚妄之冕】的角色的弃牌阶段改为展示超出上限的手牌，选择其他角色各获得其中一张。',
		mengzhushiK_info: '助势|轮次开始时，你可以请一名其他角色摸两张牌。若其如此做，其因〖授冠〗展示牌时，你先获得其中两张。',

		meng_tibao: ['缇宝', ['female', 'qun', '2/3/3', ['mengtibao', 'mengxunhuan', 'mengchenyv', 'mengfeixiang'], []], '冷若寒'],
		mengtibao: {
			//noRemove: true,
			//noDisabled: true,
			//noAdd: true,
			//也是万万没想到我会这样处理吧
			unique: true,
			silent: true,
			direct: true,
			locked: true,
			charlotte: true,
			superCharlotte: true,
			init(player, skill) {
				player.addSkillBlocker(skill);
			},
			onremove(player, skill) {
				player.removeSkillBlocker(skill);
			},
			skillBlocker(skill, player) {//封印的技能
				const top = player.skills.indexOf('mengxunhuan'), bottom = player.skills.indexOf('mengchenyv');
				if (lib.skill[skill].charlotte || lib.skill[skill].persevereSkill) return false;
				if (top > 0 && player.skills.indexOf(skill) < top) return true;//只封印这俩
				if (bottom > 0 && player.skills.indexOf(skill) > bottom) return true;
				return false;
			},
			trigger: { global: 'damageBegin4' },
			filter(event, player) {
				player.getSkills(null, false, false).filter((i) => lib.skill.mengtibao.skillBlocker(i, player));//此技失效的技能
				return !player.hasSkill('mengfeixiang') && (event.source == player || event.player == player)
			},
			async content(event, trigger, player) {
				player.logSkill('mengfeixiang')
				player.changeZhuanhuanji('mengfeixiang');
				if (player.storage.mengfeixiang) {
					player.draw(2)
				} else {
					player.changeHujia(1)
				}
			},
		},
		mengxunhuan: {
			audio: 2,
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill];
				//player.updateMark(skill);
			},
			mark: true,
			marktext: '☯',
			intro: {
				//markcount(storage, player, skill) {
				//	return storage ? '甲' : '手'
				//},
				content(storage, player, skill) {
					return '你使用非伤害牌时，' + (storage ? '将护甲值调整至手牌数' : '将手牌数调整至护甲值')
				}
			},
			forced: true,
			locked: false,
			trigger: { player: 'useCard' },
			filter: (event, player) => !get.tag(event.card, 'damage') && player.hujia != player.countCards('h'),
			async content(event, trigger, player) {
				player.changeZhuanhuanji('mengxunhuan')
				const hujia = player.hujia - player.countCards('h');
				if (player.storage.mengxunhuan) {
					if (hujia > 0) {
						await player.draw(hujia);
					} else {
						await player.chooseToDiscard(true, -hujia)
					}
				} else {
					await player.changeHujia(-hujia)
				}
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (!get.tag(card, 'damage') && player.countCards('h') != player.hujia) {
							return [1, (player.storage.mengxunhuan ? 1 : -1) * (player.countCards('h') - player.hujia)]
						}
					}
				}
			}
		},
		mengchenyv: {
			audio: 2,
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill];
				//player.updateMark(skill);
			},
			mark: true,
			marktext: '☯',
			intro: {
				//markcount(storage, player, skill) {
				//	return storage ? '持恒' : '换位'
				//},
				content(storage, player, skill) {
					return '你发动其他技能时，' + (storage ? '令之本轮视为持恒技' : '令之本轮与此技能交换位置')
				}
			},
			forced: true,
			locked: false,
			trigger: {
				player: ["useSkill", "logSkillBegin", "useCard", "respond"],
			},
			filter(event, player) {
				if (["global", "equip"].includes(event.type)) return false;//全局+装备排除
				if ((get.info(event.skill) || {}).charlotte) return false;//有夏洛特排除
				const skill = get.sourceSkillFor(event);
				if (skill == 'mengchenyv' || !player.skills.includes(skill)) return false;
				const info = get.info(skill);
				if (!info || info.charlotte || info.equipSkill) return false;//夏洛特、装备排除
				return player.storage.mengchenyv ? !info.persevereSkill : true;
			},
			async content(event, trigger, player) {
				const skill = get.sourceSkillFor(trigger);
				player.changeZhuanhuanji('mengchenyv')
				if (player.storage.mengchenyv) {
					const from = player.skills.indexOf(skill), to = player.skills.indexOf(event.name);
					[player.skills[from], player.skills[to]] = [player.skills[to], player.skills[from]];
					game.log(player, '交换了', skill, '和', event.name, '的位置');
					player
						.when({ global: 'roundStart' })
						.vars({ skill: skill })
						.then(() => {
							if (player.skills.includes('mengchenyv') && player.skills.includes(skill)) {
								const from = player.skills.indexOf(skill), to = player.skills.indexOf('mengchenyv');
								[player.skills[from], player.skills[to]] = [player.skills[to], player.skills[from]];
								game.log(player, '换回了', skill, '和', '#g【沉谕】', '的位置');
							}
						})
				} else {
					const info = get.info(skill);
					if (!info.persevereSkill) {
						game.log(player, '令', skill, '本轮视为持恒技')
						lib.skill[skill].persevereSkill = true;
						lib.translate[skill + '_info'] = '持恒技，' + lib.translate[skill + '_info']
						player
							.when({ global: 'roundStart' })
							.vars({ skill: skill })
							.then(() => {
								delete lib.skill[skill].persevereSkill;
								lib.translate[skill + '_info'] = lib.translate[skill + '_info'].slice(4);
							})
					}
				}
			},
		},
		mengfeixiang: {
			audio: 2,
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill];
				//player.updateMark(skill);
			},
			/*mark: true,
			marktext: '☯',
			intro: {
				markcount(storage, player, skill) {
					return storage ? '+甲' : '+牌'
				},
				content(storage, player, skill) {
					return '你造成或受到伤害时，' + (storage ? '获得1点护甲' : '摸两张牌')
				}
			},*/
			//锤子哟，这技能真是蛮抽象的
		},
		mengxunhuan_info: '巡寰|转换技，此技能上的技能失效。你使用非伤害牌时，阳：将手牌数调整至护甲值，阴：将护甲值调整至手牌数。',
		mengchenyv_info: '沉谕|转换技，此技能下的技能失效。你发动其他技能时，阳：令之本轮与此技能交换位置。阴：令之本轮视为持恒技。',
		mengfeixiang_info: '非相|转换技，此技能仅失效时生效。你造成或受到伤害时，阳：摸两张牌。阴：获得1点护甲。',

		meng_caomao: ['曹髦', ["male", "wei", "3/4", ["mengqianlong", "mengfensi", "mengjuetao", "mengzhushi"], ["zhu"]], '尾巴酱·改', ''],
		mengqianlong: {
			audio: 6,
			logAudio(event, player, name, indexedData, costResult) {
				switch (player.getDamagedHp()) {
					case 1: return ['ext:忽悠宇宙/asset/meng/audio/mengqianlong1', 'ext:忽悠宇宙/asset/meng/audio/mengqianlong2']
					case 2: return ['ext:忽悠宇宙/asset/meng/audio/mengqianlong3', 'ext:忽悠宇宙/asset/meng/audio/mengqianlong4']
					default: return ['ext:忽悠宇宙/asset/meng/audio/mengqianlong5', 'ext:忽悠宇宙/asset/meng/audio/mengqianlong6']
				}
			},
			trigger: {
				player: "damageEnd"
			},
			frequent: true,
			async content(event, trigger, player) {
				const cards = get.cards(3);
				game.cardsGotoOrdering(cards);
				//展示牌
				game.log(player, "展示了", cards);
				const videoId = lib.status.videoId++;
				game.broadcastAll(
					function (player, id, cards) {
						if (player == game.me || player.isUnderControl()) return;
						const dialog = ui.create.dialog(get.translation(player) + "发动了【潜龙】", cards);
						dialog.videoId = id;
					},
					player, videoId, cards
				);
				game.addVideo("showCards", player, [get.translation(player) + "发动了【潜龙】", get.cardsInfo(cards)]);
				if (player != game.me && !player.isUnderControl() && !player.isOnline()) await game.delay(2);
				//选牌
				const next = player.chooseToMove("潜龙：获得至多" + get.cnNumber(Math.min(3, player.getDamagedHp())) + "张牌并将其余牌置于牌堆底");
				next.set("list", [["置于牌堆底", cards], ["自己获得"]]);
				next.set("filterMove", function (from, to, moved) {
					if (moved[0].includes(from.link)) {
						if (typeof to == "number") {
							if (to == 1) {
								if (moved[1].length >= _status.event.player.getDamagedHp()) return false;
							}
							return true;
						}
					}
					return true;
				});
				next.set("processAI", function (list) {
					let cards = list[0][1].slice(0),
						player = _status.event.player;
					cards.sort((a, b) => {
						return get.value(b, player) - get.value(a, player);
					});
					if (!player.storage.mengjuetao && player.hasSkill("mengjuetao") && player.hasSha()) {
						let gain,
							bottom,
							pai = cards.filter(card => card.name !== "sha");
						pai.sort((a, b) => {
							return get.value(b, player) - get.value(a, player);
						});
						gain = pai.splice(0, player.getDamagedHp());
						bottom = cards.slice(0);
						bottom.removeArray(gain);
						return [bottom, gain];
					}
					return [cards, cards.splice(0, player.getDamagedHp())];
				});
				const { moved } = await next.forResult();
				game.broadcastAll("closeDialog", videoId);
				game.addVideo("cardDialog", null, videoId);
				if (moved[0].length > 0) {
					for (var i of moved[0]) {
						i.fix();
						ui.cardPile.appendChild(i);
					}
				}
				if (moved[1].length > 0) await player.gain(moved[1], "gain2");
			},
			ai: {
				maixie: true,
				maixie_hp: true,
				effect: {
					target(card, player, target) {
						if (get.tag(card, "damage")) {
							if (player.hasSkillTag("jueqing", false, target)) return;
							if (!target.hasFriend()) return;
							var num = 1;
							if (!player.needsToDiscard() && target.isDamaged()) {
								num = 0.7;
							} else {
								num = 0.5;
							}
							if (target.hp >= 4) return [1, num * 2];
							if (target.hp == 3) return [1, num * 1.5];
							if (target.hp == 2) return [1, num * 0.5];
						}
					},
				},
			},
		},
		mengfensi: {
			init(player) {
				player.when({ player: 'dieBegin' }).assign({
					charlotte: true,
					firstDo: true,
					forced: true,
					popup: false,
					forceDie: true,
				}).then(() => {
					player.changeSkin({ characterName: "meng_caomao" }, "meng_caomao_dead");
				})
			},
			audio: 4,
			logAudio: () => false,
			trigger: {
				player: "phaseZhunbeiBegin"
			},
			locked: true,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(true, '忿肆：对一名体力值不小于你的角色造成1点伤害', (card, player, target) => target.hp >= player.hp)
					.set('ai', (target) => {
						return get.damageEffect(target, _status.event.player, _status.event.player);
					})
					.forResult();
			},
			logTarget: 'targets',
			line: 'green',
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (target == player)
					game.hyyzSkillAudio('meng', 'mengfensi', 1, 2)
				else game.hyyzSkillAudio('meng', 'mengfensi', 3, 4)
				await target.damage(player);
				if (target.isIn() && target.canUse("sha", player, false))
					await target.useCard({ name: "sha", isCard: true }, player, false, "noai");
			},
		},
		mengjuetao: {
			audio: 2,
			trigger: {
				player: "phaseUseBegin"
			},
			limited: true,
			skillAnimation: true,
			animationStr: '向死存魏',
			animationColor: "thunder",
			filter: (event, player) => player.hp == 1,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt2("mengjuetao"), lib.filter.notMe)
					.set("ai", function (target) {
						const att = -get.attitude(_status.event.player, target);
						if (att <= 0) return att;
						if (target.hasSkillTag("nodamage") || target.getEquip("qimenbagua")) return 0.01 * att;
						if (target.getEquip("tengjia") || target.getEquip("renwang")) return 0.3 * att;
						if (target.getEquip("rewrite_tengjia") || target.getEquip("rewrite_renwang")) return 0.2 * att;
						if (
							target.hasSkillTag(
								"freeShan",
								false,
								{
									player: _status.event.player,
								},
								true
							)
						)
							return 0.3 * att;
						if (target.getEquip(2)) return att / 2;
						return 1.2 * att;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.changeSkin({ characterName: "meng_caomao" }, "meng_caomao_shadow");
				player.awakenSkill("mengjuetao");
				while (target.isIn()) {
					const card = get.bottomCards()[0];
					game.cardsGotoOrdering(card);
					player.showCards(card);
					const { bool } = await player
						.chooseUseTarget(card, true, false, "nodistance")
						.set("filterTarget", function (card, player, target) {
							let evt = _status.event;
							if (_status.event.name == "chooseTarget") evt = evt.getParent();
							if (target != player && target != evt.mengjuetao_target) return false;
							return lib.filter.targetEnabledx(card, player, target);
						})
						.set("mengjuetao_target", target)
						.forResult();
					if (!bool) break;
				}
			},
		},
		mengzhushi: {
			audio: 3,
			usable: 1,
			trigger: {
				global: "recoverEnd"
			},
			zhuSkill: true,
			filter(event, player) {
				return player != event.player && event.player.group == "wei" && event.player == _status.currentPhase && event.player.isIn() && player.hasZhuSkill("mengzhushi", event.player);
			},
			async cost(event, trigger, player) {
				event.result = await trigger.player
					.chooseBool(`是否响应${get.translation(player)}的主公技【助势】？`, `令${get.translation(player)}摸一张牌`)
					.set("goon", get.attitude(trigger.player, player) > 0)
					.set("ai", () => _status.event.goon)
					.forResult();
			},
			async content(event, trigger, player) {
				trigger.player.line(player, "thunder");
				await player.draw();
			},
		},
		mengqianlong_info: "潜龙|你受到伤害后，可以亮出牌堆顶的三张牌并获得其中的至多已损失的体力值张牌，然后将剩余的牌置于牌堆底。",
		mengfensi_info: "忿肆|锁定技，准备阶段，你对一名体力值不小于你的角色造成1点伤害，若不为你，其视为对你使用【杀】。",
		mengjuetao_info: "决讨|限定技，出牌阶段开始时，若你的体力值为1，你可以选择一名角色，依次使用牌堆底的牌直到不能使用为止（只能指定你或该角色为目标）。",
		mengzhushi_info: "助势|每名其他魏势力的角色的回合限一次，当该角色回复体力时，其可以令你摸一张牌。",
	},
	2502: {
		hyyz_xt_sp_yinzhi: ['银枝', ['male', 'hyyz_xt', 4, ['mengketi', 'mengcimei', 'menggaojie'], []], '木善才'],
		mengketi: {
			audio: 12,
			init(player, skill) {
				player.storage.mengketi = [1, 14, 1]
			},
			mark: true,
			marktext: '客',
			intro: {
				markcount(storage, player, skill) {
					return '' + player.storage.mengketi[0] + '/' + player.storage.mengketi[1] + '/' + player.storage.mengketi[2]
				},
				content(storage, player, skill) {
					return `锁定技，你的手牌点数加<span class='greentext'>[${storage[0]}]</span>（至多为<span class='firetext'>[${storage[1]}]</span>）；你点数大于14-<span class='bluetext'>[${storage[2]}]</span>的手牌不计入手牌上限。`
				}
			},
			mod: {
				cardnumber(card, player, num) {
					if (Array.isArray(player.storage.mengketi)) {
						let max = num + player.storage.mengketi[0];
						if (max > player.storage.mengketi[1]) return player.storage.mengketi[1];
						return max
					}
				},
				ignoredHandcard(card, player, bool) {
					if (Array.isArray(player.storage.mengketi)) {
						let num = 14 - player.storage.mengketi[2];
						return get.number(card) > num;
					}
				},
				cardDiscardable(card, player, name, bool) {
					if (Array.isArray(player.storage.mengketi)) {
						let num = 14 - player.storage.mengketi[2];
						return get.number(card) <= num;
					}
				},
			},
		},
		mengcimei: {
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player) {
				var evt = event.getl(player);
				const 修正值 = player.storage.mengketi ? player.storage.mengketi[0] : 0
				return !['useCard', 'respond'].includes(event.getParent().name) && evt.cards2?.some(i => get.number(i) + 修正值 > 13)
			},
			direct: true,
			async content(event, trigger, player) {
				const 修正值 = player.storage.mengketi ? player.storage.mengketi[0] : 0
				const cards = trigger.getl(player).cards2;
				for (let card of cards) {
					const num = Math.min(get.number(card) + 修正值 - 13, game.players);
					if (num > 0) {
						const { targets } = await player.chooseTarget('赐美:令至多' + num + '名角色各摸一张牌',
							'若你以此法选择所有角色，则改为你摸' + num + '张牌并以任意方式分配给每名角色各其中一张。', [1, num])
							.set('ai', (target) => {
								return get.attitude2(target) + 3
							})
							.forResult()
						if (game.players.every(i => targets.includes(i)) && game.players.length == targets.length) {
							player.logSkill(event.name);
							let results = await player.draw(num).forResult();
							results = results.filter(i => player.getCards('he').includes(i));
							const { cards: cs, targets: ts } = await player.chooseCardTarget({
								filterCard: (card) => results.includes(card),
								selectCard: results.length,
								filterTarget: true,
								selectTarget: results.length,
								ai(card) {
									return get.value(card);
								},
								ai2(target) {
									return get.attitude2(card);
								}
							}).forResult()
							if (cs & ts) {
								for (let i = 0; i < cs.length; i++) {
									if (player.getCards('he').includes(cs[i]) && ts[i].isIn()) await player.give(cs[i], ts[i]);
								}
							}
						} else {
							player.logSkill(event.name, targets);
							await game.asyncDraw(targets)
						}
					}
				}
			},
		},
		menggaojie: {
			trigger: {
				player: ['phaseZhunbeiBegin', 'phaseJudgeBegin', 'phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin', 'phaseJieshuBegin']
			},
			filter(event, player) {
				return game.hasPlayer(current => player.canCompare(current));
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget((card, player, target) => {
						return player.canCompare(target)
					})
					.set('prompt', '高洁：与一名其他角色拼点')
					.set('prompt2', `若你赢，此技能视为未发动过；<br>若你没赢，你令“客体”中的一个数字+1并跳过${get.translation(trigger.name)}${['phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard'].includes(trigger.name) ? '，然后令“客体”中的一个数字+2。' : ''}`)
					.set("ai", target => {
						return -get.attitude2(target)
					})
					.forResult();
			},
			usable: 1,
			async content(event, trigger, player) {
				const { bool } = await player.chooseToCompare(event.targets[0]).set('small', true).forResult();
				if (bool) {
					delete player.storage.counttrigger.menggaojie;
					game.log(player, "重置了", "#g【高洁】");
				} else if (Array.isArray(player.storage.mengketi)) {
					trigger.cancel();
					const gaojie = async function (num, forced) {
						const list = [
							`锁定技，你的手牌点数加<span class='greentext'>[${player.storage.mengketi[0]}]</span>`,
							`（至多为<span class='firetext'>[${player.storage.mengketi[1]}]</span>）；`,
							`你点数大于14-<span class='bluetext'>[${player.storage.mengketi[2]}]</span>的手牌不计入手牌上限。`,
						];
						const { index } = await player
							.chooseControlList('令客体的哪个数字+' + num + '？', list, forced)
							.set('ai', () => {
								return [0, 1, 1].randomGet()
							})
							.forResult();
						if (index != undefined) {
							game.log(player, '令高洁的第', index + 1, '个数字+' + num)
							player.storage.mengketi[index] += num;
							player.markSkill('mengketi');
						}
					};
					await gaojie(1, true);
					if (['phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard'].includes(trigger.name)) {
						await gaojie(2, false);
					}
				}
			},
			ai: {
				combo: 'mengketi'
			}
		},
		mengketi_info: '客体|锁定技，你的手牌点数加[1]（至多为[14]）；你点数大于14-[1]的手牌不计入手牌上限。',
		mengcimei_info: '赐美|当你不应使用而失去一张牌时，你可令至多此牌点数-13名角色各摸一张牌，若你以此法选择所有角色，则改为你摸此牌点数-13张牌并以任意方式分配给每名角色各其中一张。',
		menggaojie_info: '高洁|每回合限一次，你的阶段开始时，你可以与一名其他角色拼点，若你赢，此技能视为未发动过；若你没赢，你令“客体”中的一个数字+1并跳过此阶段，若为主要阶段，则你可再令“客体”中的一个数字+2。',

		meng_caiwenji: ['蔡文姬', ['female', 'hyyz_other', 3, ['mengbianqin', 'mengzhaotong'], []], ['日玖阳气冲三关']],
		mengbianqin: {
			audio: 'chenqing',
			trigger: { global: 'phaseEnd' },
			filter(event, player) {
				return get.centralCards().filter(i => get.timetype(i) == 'notime' && player.hasUseTarget(i)).length > 0;
			},
			async cost(event, trigger, player) {
				const cards = get.centralCards().filter(i => get.timetype(i) == 'notime' && player.hasUseTarget(i))
				const { links } = await player.chooseButton(['辩琴：选择使用的牌', cards]).forResult();
				if (links) {
					event.result = {
						bool: true,
						cost_data: links[0]
					}
				}
			},
			async content(event, trigger, player) {
				player.chooseUseTarget(event.cost_data, true)
			},
		},
		mengzhaotong: {
			audio: 'beige',
			forced: true,
			trigger: {
				player: 'useCard'
			},
			usable: 1,
			async content(event, trigger, player) {
				let cards = trigger.cards.filterInD();
				if (cards.length > 1) {
					const { result } = await player
						.chooseToMove("将牌按顺序置于牌堆顶", true)
						.set("list", [["牌堆顶", cards]])
						.set("reverse", _status.currentPhase && _status.currentPhase.next && get.attitude(player, _status.currentPhase.next) > 0)
						.set("processAI", function (list) {
							const cards = list[0][1].slice(0);
							cards.sort(function (a, b) {
								return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
							});
							return [cards];
						});
					if (!result.bool) return;
					cards = result.moved[0];
				}
				cards.reverse();
				await game.cardsGotoPile(cards, "insert");
				game.log(player, "将", cards, "置于了牌堆顶");
				if (_status.currentPhase.countCards('h') >= player.countCards('h')) {
					trigger.targets.length = 0;
					const { suit } = await player.judge().forResult();
					switch (suit) {
						case "heart":
							await player.recover();
							break;
						case "diamond":
							await player.draw(2);
							break;
						case "club":
							await player.chooseToDiscard("he", 2, true);
							break;
						case "spade":
							await player.turnOver();
							break;
					}
				}
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (!player.storage.counttrigger?.mengzhaotong) {
							if (player.countCards('h') <= _status.currentPhase.countCards('h')) {
								const suit = get.suit(card, false);
								let value = 0;
								switch (suit) {
									case "heart":
										value = player.isDamaged() ? 4 : 0
										break;
									case "diamond":
										value = 2;
										break;
									case "club":
										value = -2
										break;
									case "spade":
										value = player.isTurnedOver() ? 10 : -3
										break;
								}
								value += game.countPlayer() / 2
								return [0, value, 0, 0]
							}
						}
					}
				}
			}
		},
		mengbianqin_info: '辩琴|一名角色的回合结束时，你可展示并使用一张本回合进入弃牌堆的即时牌。',
		mengzhaotong_info: '昭彤|锁定技，你每回合首次使用即时牌时，将其置于牌堆顶。若当前回合角色的手牌数不小于你，你取消之并进行“悲歌”判定。',

		hyyz_xt_shen_nikaduoli: ['尼卡多利', ['male', 'shen', 50, ['menghunqvmingzhichishenbumie', 'mengsimingzhangluyixiebozhi', 'mengtianchiwuxingbingxianqianli'], []], '天倾地痕-尾巴酱'],
		menghunqvmingzhichishenbumie: {
			audio: 12,
			logAudio(event, player, name) {
				if (name == 'damageBefore') {
					return [
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie1.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie2.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie3.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie4.mp3',
					]
				} else {
					return [
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie5.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie6.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie7.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie8.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie9.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie10.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie11.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghunqvmingzhichishenbumie12.mp3',
					]
				}
			},
			nobracket: true,
			marktext: '🔥',
			intro: {
				markcount(storage, player, x) {
					return storage + '/' + player.hp
				},
				content: '已<span class="firetext">预燃</span>#点体力'
			},
			trigger: {
				player: 'damageBefore',
				global: 'damageAfter',
			},
			forced: true,
			filter(event, player, name) {
				return event.num > 0;
			},
			async content(event, trigger, player) {
				if (event.triggername == 'damageBefore') {
					trigger.unreal = true
				} else {
					if (!player.storage.menghunqvmingzhichishenbumie) player.storage.menghunqvmingzhichishenbumie = 0;
					player.storage.menghunqvmingzhichishenbumie += trigger.num;
					player.markSkill(event.name)
					event.trigger('yvran')
				}
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (get.tag(card, 'damage') > 0) return 'zerotarget'
					}
				}
			}
		},
		mengsimingzhangluyixiebozhi: {
			audio: 2,
			nobracket: true,
			sunbenSkill: true,
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				if (player.hasSkill('mengsimingzhangluyixiebozhi_sunben')) return false;
				return event.card.name == 'sha' && event.targets.some(i => player.canCompare(i));
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard('》曰：司民掌戮，以血搏之', '可与目标拼点，你先令点数-N且伤害+N，没赢者视为【决斗】没赢。激昂：角色死亡。')
					.forResult()
			},
			async content(event, trigger, player) {
				player.addSkill('mengsimingzhangluyixiebozhi_sunben')
				const { numbers } = await player
					.chooseNumbers([
						{
							prompt: "令点数减任意值，伤害加等量值",
							min: 1,
							max: get.number(event.cards[0])
						}])
					.set("processAI", () => {
						return [get.event().maxNum];
					})
					.set("maxNum", get.number(event.cards[0]))
					.forResult();
				if (numbers?.[0] > 0) {
					trigger.cancel()
					player.storage.mengsimingzhangluyixiebozhi_add = [numbers[0], trigger.cards, trigger.card, trigger.baseDamage ?? 1 + trigger.extraDamage ?? 1];
					player.addTempSkill('mengsimingzhangluyixiebozhi_add');
				}
				const next = player.chooseToCompare(trigger.targets.filter(i => player.canCompare(i)))
				next.callback = lib.skill.mengsimingzhangluyixiebozhi.callback;
				if (!next.fixedResult) next.fixedResult = {}
				next.fixedResult[player.playerid] = event.cards[0]
			},
			async callback(event, trigger, player) {
				if (player.hasSkill('mengsimingzhangluyixiebozhi_add')) {
					const storage = player.storage.mengsimingzhangluyixiebozhi_add
					const card = get.autoViewAs({ name: 'juedou', isCard: true }, storage[1])
					if (event.winner !== player) {
						const next = player.damage();
						next.source = event.target;
						next.card = card;
						next.cards = storage[1];
						next.num = storage[0] + storage[3]
						next.nature = get.nature(storage[2])
						await next;
					};
					if (event.winner !== event.target) {
						const next = event.target.damage();
						next.source = player;
						next.card = card;
						next.cards = storage[1];
						next.num = storage[0] + storage[3]
						next.nature = get.nature(storage[2])
						await next;
					}
				}
			},
			subSkill: {
				add: {
					trigger: {
						player: "compare",
						target: "compare",
					},
					charlotte: true,
					direct: true,
					filter(event, player) {
						if (!player.storage.mengsimingzhangluyixiebozhi_add) return false;
						if (event.player == player) {
							if (event.iwhile) return false;
							return event.num1 > 0
						}
						return event.num2 > 0
					},
					async content(event, trigger, player) {
						const num = player.storage.mengsimingzhangluyixiebozhi_add[0]
						if (player == trigger.player) {
							trigger.num1 -= num;
							if (trigger.num1 < 0) trigger.num1 = 0;
						} else {
							trigger.num2 -= num;
							if (trigger.num2 < 0) trigger.num2 = 0;
						}
						game.log(player, "的拼点牌点数-" + num, '但令此伤害值+' + num);
					},
				},
				sunben: {
					mark: true,
					marktext: '⚔️',
					intro: {
						content: "》曰：魂躯明志，炽神不灭失效",
					},
					charlotte: true,
					direct: true,
					trigger: {
						global: ["dieBegin"],
					},
					async content(event, trigger, player) {
						game.log(player, '的', '#g【》曰：司民掌戮，以血搏之】', '重置了')
						player.removeSkill(event.name);
					},
				},
			}
		},
		mengtianchiwuxingbingxianqianli: {
			audio: 4,
			nobracket: true,
			unique: true,
			derivation: [],
			trigger: {
				player: "yvran",
			},
			filter(event, player) {
				return player.storage.menghunqvmingzhichishenbumie >= player.hp;
			},
			forced: true,
			juexingji: true,
			skillAnimation: true,
			animationColor: "gold",
			async content(event, trigger, player) {
				player.awakenSkill("mengtianchiwuxingbingxianqianli");
				lib.skill.menghunqvmingzhichishenbumie.intro.content = `已<span class="firetext">点燃</span>#点体力`;
				player.when({ global: 'phaseAfter' }).then(() => { player.loseHp(player.hp) })

				const color = player.isUnseen() ? 'fire' : get.groupnature(player.group, "raw");
				player.$fullscreenpop("鏖战模式", color);
				game.broadcastAll(function () {
					_status._aozhan = true;
					ui.aozhan = ui.create.div(".touchinfo.left", ui.window);
					ui.aozhan.innerHTML = "鏖战模式";
					if (ui.time3) ui.time3.style.display = "none";
					ui.aozhanInfo = ui.create.system("鏖战模式", null, true);
					lib.setPopped(
						ui.aozhanInfo,
						function () {
							var uiintro = ui.create.dialog("hidden");
							uiintro.add("鏖战模式");
							var list = ["尼卡多利发起纷争，游戏直接进入鏖战模式！", "在鏖战模式下，任何角色均不是非转化的【桃】的合法目标。【桃】可以被当做【杀】或【闪】使用或打出。"];
							var intro = '<ul style="text-align:left;margin-top:0;width:450px">';
							for (var i = 0; i < list.length; i++) {
								intro += "<li>" + list[i];
							}
							intro += "</ul>";
							uiintro.add('<div class="text center">' + intro + "</div>");
							var ul = uiintro.querySelector("ul");
							if (ul) {
								ul.style.width = "180px";
							}
							uiintro.add(ui.create.div(".placeholder"));
							return uiintro;
						},
						250
					);
					game.playBackgroundMusic();
				});
				const players = game.filterPlayer();
				players.forEach(i => i.addSkill("aozhan"))
				await game.delayx();

				for (let current of game.filterPlayer()) {
					game.trySkillAudio('mengtianchiwuxingbingxianqianli', player)
					if (!player.isIn() || !current.isIn()) {
						event.finish();
						return;
					}
					const showCards = get.cards(4);
					await game.cardsGotoOrdering(showCards);
					await player.showCards(showCards);
					while (player.isIn() && current.isIn() && showCards.length) {
						const card = showCards.shift();
						game.setNature(card, "fire", true);
						if (card.name == "sha" && player.canUse(card, current, false)) {
							await player.useCard(card, current, false);
						}
						card.fix();
						card.remove();
						card.destroyed = true;
						game.log(card, "被销毁了");
					}
					await game.delayx()
				}
			},
		},
		menghunqvmingzhichishenbumie_info: '炽神|》曰：魂躯明志，炽神不灭<li>锁定技，你不能因受伤扣减体力，所有角色造成伤害时预燃你等量体力。',
		mengsimingzhangluyixiebozhi_info: '掌戮|》曰：司民掌戮，以血搏之<li>昂扬技，你使用【杀】时可与目标拼点。你若令点数-N且伤害+N，则没赢者视之为【决斗】没赢。激昂：角色死亡。',
		mengtianchiwuxingbingxianqianli_info: '兵燹|》曰：天敕五刑，兵燹千里<li>觉醒技，若你已预燃所有体力，点燃之并令游戏进入“鏖战”，然后对所有角色执行燃烧且销毁亮出牌的【兵临城下】。',
	},
	2503: {
		meng_shengongbao: ['申公豹', ['male', 'qun', 4, ['mengchongshi', 'mengkunmiu'], []], '彪心慕凤-尾巴酱', ''],
		mengchongshi: {
			audio: 3,
			logAudio: (event, player, name, indexedData, costResult) => {
				if (event.targets.length == 1 && player.hasSkill('mengchongshi_fengshi') && player.hasSkill('mengchongshi_zhengong')) {
					return false
				}
				return ['ext:离谱人间/mengchongshi1.mp3', 'ext:离谱人间/mengchongshi2.mp3', 'ext:离谱人间/mengchongshi3.mp3']
			},
			trigger: {
				global: 'useCardToTargeted'
			},
			filter(event, player, name) {
				if (event.targets.length != event.getParent().triggeredTargets4.length) return false;
				return event.targets.includes(player);
			},
			forced: true,
			async content(event, trigger, player) {
				const func = function (list) {
					const index = list.indexOf(player), num = Math.min(index, player.countCards('e'));
					list.splice(index, 1);
					list.splice(index - num, 0, player);
					return list;
				}
				const evtx = trigger.getParent();
				trigger.targets = func(trigger.targets);
				evtx.targets = trigger.targets;
				evtx.triggeredTargets4 = func(evtx.triggeredTargets4)

				const addSkills = [];
				if (!player.hasSkill('mengchongshi_fengshi') && (trigger.targets[0] == player || evtx.triggeredTargets4[0] == player))
					addSkills.add('mengchongshi_fengshi')
				if (!player.hasSkill('mengchongshi_zhengong') && (trigger.targets[trigger.targets.length - 1] == player || evtx.triggeredTargets4[evtx.triggeredTargets4.length - 1] == player))
					addSkills.add('mengchongshi_zhengong')

				if (addSkills.length) player.addTempSkills(addSkills, { global: 'roundStart' })
			},
			subSkill: {
				fengshi: {
					audio: 'mengchongshi',
					trigger: {
						global: 'useCard'
					},
					filter(event, player) {
						if (!player.countDiscardableCards(player, 'he')) return false;
						if (event.player == player) {
							return event.targets.some(target => target != player && target.countCards('h') < player.countCards('h') && target.countDiscardableCards(player, 'he') > 0);
						} else if (event.targets.includes(player)) {
							return event.player.countDiscardableCards(player, 'he') && player.countCards('h') < event.player.countCards('h')
						}
					},
					async cost(event, trigger, player) {
						let str = '', targets;
						if (trigger.player == player) {
							targets = trigger.targets.filter(target => target.countCards('h') < player.countCards('h') && target.countDiscardableCards(player, 'he'));
							str = `锋势：你可以弃置自己和[${get.translation(targets)}]之一各一张牌，令此牌造成的伤害+1`;
						} else {
							str = `锋势：你可以弃置自己和${get.translation(trigger.player)}各一张牌，令此牌造成的伤害+1`;
						}
						event.result = await player.chooseCardTarget({
							prompt: str,
							filterCard: true,
							position: 'he',
							filterTarget: (card, player, target) => {
								const trigger = _status.event.getTrigger();
								return trigger.player == player ? targets.includes(target) : trigger.player
							},
							ai1(card) {
								const viewer = _status.event.player, trigger = _status.event.getTrigger();
								const player = trigger.player;
								//对你使用拆的收益
								const eff1 = get.effect(viewer, { name: "guohe" }, viewer, viewer);
								if (player == viewer) {//如果你是使用者
									for (let target of trigger.targets) {
										if (target.countCards('h') >= player.countCards('h')) continue;
										if (!target.countDiscardableCards(viewer, 'he')) continue;
										if (get.attitude(viewer, target) > 0) continue;
										//对此目标使用拆的收益
										const eff2 = get.effect(target, { name: "guohe" }, viewer, viewer);
										let eff = eff1 + eff2;
										//综合收益
										if (get.tag(trigger.card, "damage")) eff += get.effect(target, trigger.card, player, viewer);
										if (eff > 0) return 10 - get.value(card);
									}
								} else {//如果目标有你
									//对使用者拆的收益
									const eff2 = get.effect(player, { name: "guohe" }, viewer, viewer);
									let eff = eff1 + eff2;
									//综合收益
									if (get.tag(trigger.card, "damage")) eff += trigger.targets.reduce((sum, i) => sum + get.effect(i, trigger.card, player, viewer), 0);
									if (eff > 0) return 10 - get.value(card);
								}
								return 0
							},
							ai2(target) {
								return 100 - get.attitude2(target)
							},
						}).forResult()
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						if (get.tag(trigger.card, "damage")) trigger.baseDamage++;
						const target = event.targets[0];
						await player.discard(event.cards);
						await player.discardPlayerCard(target, "he", true);
					},
				},
				zhengong: {
					audio: 'mengchongshi',
					trigger: {
						player: "damageEnd",
					},
					filter(event, player) {
						return event.source?.countCards("e", (card) => player.countEquipableSlot(get.subtype(card)) > 0) > 0
					},
					async cost(event, trigger, player) {
						const { cards } = await player
							.choosePlayerCard('e', get.prompt("zzhenggong"), trigger.source).set('ai', (button) => {
								if (get.attitude2(_status.event.getTrigger().source) <= 0) {
									return get.equipValue(button.link);
								}
								return 0;
							})
							.forResult();
						if (cards) {
							event.result = {
								bool: true,
								targets: [trigger.source],
								cards: cards,
							}
						}
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						const card = event.cards[0]
						if (trigger.source.getCards("e").includes(card)) {
							trigger.source.$give(card, player, false)
							await player.equip(card);
						}
					},
					ai: {
						maixie_defend: true,
					},
				},
			}
		},
		mengkunmiu: {
			audio: 5,
			group: 'mengkunmiu_quan',
			global: 'mengkunmiu_ni',
			subSkill: {
				quan: {
					audio: 'mengkunmiu',
					name: '排异',
					enable: 'phaseUse',
					usable: 1,
					filter(event, player) {
						return player.countDiscardableCards(player, 'e');
					},
					filterCard: true,
					position: 'e',
					filterTarget: true,
					async content(event, trigger, player) {
						const target = event.targets[0];
						await target.draw(2);
						if (target.countCards("h") > player.countCards("h")) {
							await target.damage();
						}
					},
					locked: false,
					mod: {
						maxHandcard(player, num) {
							if (_status.currentPhase == player) return num + player.countCards('e');
						},
					},
				},
				ni: {
					audio: 'mengkunmiu',
					name: '陷嗣',
					enable: "chooseToUse",
					filter(event, player) {
						return game.hasPlayer(current => _status.currentPhase != current && current.countDiscardableCards(player, 'e') >= 2 && player.canUse({ name: 'sha' }, current))
					},
					viewAs: {
						name: "sha",
						isCard: true,
					},
					filterTarget(card, player, target) {
						if (_status.currentPhase == target || target.countDiscardableCards(player, 'e') < 2) return false;
						//let bool = false;
						//const targets = ui.selected.targets.slice(0);
						//if (targets.some(current => _status.currentPhase != current && current.countDiscardableCards(player, 'e') >= 2)) bool = true;
						//if (!bool && (_status.currentPhase == target || target.countDiscardableCards(player, 'e') < 2)) return false;
						return player.canUse({ name: 'sha' }, target)//_status.event._backup.filterTarget.apply(this, arguments);
					},
					complexSelect: true,
					selectCard: -1,
					filterCard() {
						return false;
					},
					forceaudio: true,
					prompt: "陷嗣（困谬）：弃置一名角色两张视为“逆”的装备牌，然后视为对其使用【杀】。",
					delay: false,
					log: false,
					async precontent(event, trigger, player) {
						player.discardPlayerCard(event.result.targets[0], 'e', 2);
					},
					ai: {
						order() {
							return get.order({ name: "sha" }) + 0.05;
						},
					}
				},
			},
			derivation: ['mengkunmiu_quan', 'mengkunmiu_ni']
		},
		mengchongshi_info: '崇势|你于即时牌的结算目标中前移装备区牌数。若为首位/末位，你本轮获得〖锋势〗/〖争功〗。',
		mengchongshi_fengshi_info: '锋势|当你[使用/被使用]牌时，你可弃置你和[一个手牌数小于你的目标/手牌数大于你的使用者]一张牌，令此牌造成的伤害+1。',
		mengchongshi_zhengong_info: '争功|当你受到伤害后，你可以装备伤害来源装备区的一张牌。',
		mengkunmiu_info: '困谬|锁定技，回合内/外，你装备区的牌视为“权”/“逆”。',
		mengkunmiu_quan_info: '排异|出牌阶段限一次，你可以移去一张“权”，令一名角色摸两张牌。若其手牌数大于你，对其造成1点伤害。',
		mengkunmiu_ni_info: '陷嗣|其他角色可以弃置你的两张“逆”以对你使用【杀】。',

		meng_guanzhe: ['观者', ['none', 'qun', 3, ['mengtianyan', 'mengdianxue', 'mengzhaijie'], []], ''],
		mengtianyan: {
			init() {
				lib.card.meng_guanzhe_card = {
					type: "special_delay",
					fullimage: true,
					noEffect: true,
					ai: {
						basic: {
							order: 1,
							useful: 1,
							value: 8,
						},
						result: {
							target: 1,
						},
					},
				}
				lib.translate.meng_guanzhe_card = '观者牌'
			},
			trigger: {
				player: ['phaseBegin', 'chooseToGuanxingAfter']
			},
			filter(event, player) {
				return event.name == 'phase' || event.result?.moved?.length > 0
			},
			frequent: 'check',
			prompt2(event, player, skill) {
				return event.name == 'phase' ? '是否卜算3？' : '是否改为将卜算的任意张牌置入你的判定区？';
			},
			check(event, player) {
				return event.name == 'phase' || game.me != player
			},
			async content(event, trigger, player) {
				if (trigger.name == 'phase') {
					await player.chooseToGuanxing(3);
				} else {
					const { links: cards } = await player
						.chooseCardButton('选择一些牌置入判定区', [1, Infinity], trigger.result.moved[0].concat(trigger.result.moved[1]), true)
						.forResult();
					if (cards) {
						for (const card of cards) {
							await player.addJudge({ name: 'meng_guanzhe_card' }, [card])
						}
					}
				}
			}
		},
		mengdianxue: {
			forced: true,
			trigger: {
				player: 'phaseJudgeBefore'
			},
			filter(event, player) {
				return player.countCards('j') > 0
			},
			async content(event, trigger, player) {
				let cards = player.getCards('j');
				await player.gain(cards, 'gain2');
				let count = cards.length;
				while (count > 0) {
					count--;
					await player.executeDelayCardEffect('shandian');
				}
			},
			group: ['mengdianxue_shandian', 'mengdianxue_yingbian'],
			subSkill: {
				shandian: {
					forced: true,
					trigger: {
						player: 'judgeEnd'
					},
					filter(event, player) {
						return event.getParent(2).name == 'mengdianxue' && get.position(event.result.card, true) == "o";
					},
					async content(event, trigger, player) {
						await player.chooseUseTarget('chuqibuyi', [trigger.result.card]);
					},
				},
				yingbian: {
					trigger: {
						player: 'yingbian'
					},
					charlotte: true,
					filter(event, player) {
						if (event.card.name != 'chuqibuyi' || event.getParent(2).name != "mengdianxue_shandian") return false;
						const list = event.temporaryYingbian || [];
						if (list.includes("force") || get.cardtag(event.card, "yingbian_force") || event.forceYingbian) return false;
						return true
					},
					async cost(event, trigger, player) {
						event.result = await lib.yingbian.condition.complex.get("zhuzhan")(trigger).forResult();
					},
					async content(event, trigger, player) {
						player.popup("yingbian_force_tag", lib.yingbian.condition.color.get("force"));
						game.log(player, "触发了", "#g【点穴】", "为", trigger.card, "添加的应变条件（", "#g助战）");
						trigger.yingbian_addTarget = true;
						player.addTempSkill("yingbian_changeTarget");
					}
				}
			},
		},
		mengzhaijie: {
			forced: true,
			trigger: {
				player: 'phaseJieshuBegin'
			}, filter(event, player) {
				return player.countCards('h')
			},
			async content(event, trigger, player) {
				const num = get.centralCards().filter(card => get.type2(card) == 'trick').length;
				const cards = player.getCards('h');
				if (cards.length >= num) {
					await player.chooseToDiscard(num, true);
				} else {
					await player.loseHp(num)
				}
				await player.chooseToGuanxing(cards.length)
			},
		},
		mengtianyan_info: '天眼|回合开始时，你卜算3。你卜算时，你可以改为将卜算的任意张牌置入你的判定区。',
		mengdianxue_info: '点穴|锁定技，判定阶段，你改为获得所有判定区内的牌并进行等量次【闪电】判定，判定牌生效后，你将每张判定牌当做一张【出其不意】（助战）使用。',
		mengzhaijie_info: '斋戒|锁定技，结束阶段，你卜算你手牌数张牌，且此次卜算须至少将X张牌弃置，否则你失去X点体力。（X为中央区内锦囊牌牌数）',

		meng_youla: ['优菈', ['female', 'hyyz_ys', 4, ['mengzuchou', 'menghailang'], []], '', ''],
		mengzuchou: {
			audio: 6,
			init(player) {
				player.storage.mengzuchou = [];
			},
			trigger: {
				global: 'useCardToPlayer'
			},
			filter(event, player) {
				if (player.getStorage('mengzuchou').includes(event.player)) return false;
				if (player.countCards('h') >= player.maxHp) return false;
				return event.player == player ? event.target != player : event.target == player;
			},
			async content(event, trigger, player) {
				player.storage.mengzuchou.add(trigger.player);
				player.when({ global: 'phaseAfter' }).then(() => { player.storage.mengzuchou = [] })
				await player.drawTo(player.maxHp)
				let target;
				while (true) {
					target = (target == trigger.target ? trigger.player : trigger.target);
					let list = [], bool;
					if (target.countCards('h') > 0) bool = true;
					if (target.countCards('he') > 0) list.add('弃置一张牌')
					list.add('失去一点体力，并令此牌无效')
					const { control } = await target.chooseControl(list)
						.set('prompt', '族仇：选择一项')
						.set('ai', () => list.randomGet())
						.forResult()
					if (control == '失去一点体力，并令此牌无效') {
						trigger.all_excluded = true
						await target.loseHp()
						break;
					} else {
						await target.chooseToDiscard('he', true)
						if (bool == true && !target.countCards('h')) break;
					}
				}
			},
		},
		menghailang: {
			audio: 3,
			usable: 1,
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				if (!game.hasPlayer(current => {
					if (event.targets.includes(current) || !event.player.canUse(event.card, current, true, false)) return false;
					return get.nameList(current).some(str => str.length >= get.cardNameLength(event.card))
				})) return false;
				return get.type(event.card) == 'trick' || get.type(event.card) == 'basic'
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget((card, player, target) => {
					if (trigger.targets.includes(target)) return false;
					if (!trigger.player.canUse(trigger.card, target, true, false)) return false;
					return get.nameList(target).some(str => str.length >= get.cardNameLength(trigger.card))
				}, [1, Infinity], '令任意名字数不小于此牌名字数的角色成为此目标')
					.set('ai', (target) => {
						return get.effect(target, trigger.card, trigger.player, player)
					})
					.forResult()
			},
			async content(event, trigger, player) {
				trigger.targets.addArray(event.targets)
			},
		},
		mengzuchou_info: '族仇|每回合每名角色限一次，你/其他角色使用牌指定其他角色/你为目标时，你可将手牌摸至体力上限，令其与你依次选择一项执行:1.弃置一张牌；2.失去一点体力，并令此牌无效。然后重复此操作，直到一方以此法失去所有手牌或选择2选项。',
		menghailang_info: '骇浪|每回合限一次，有角色使用基本牌或普通锦囊牌时，你可令任意名字数不小于此牌名字数的角色成为此目标。',

		meng_yunli: ['云璃', ['female', 'hyyz_xt', 4, ['mengjiandan', 'mengkanpo'], []], '掷山破云-柚衣'],
		mengjiandan: {
			audio: 2,
			group: ['mengjiandan_jiedao', 'mengjiandan_tao'],
			subSkill: {
				jiedao: {
					audio: 'mengjiandan',
					name: '剑胆·借刀',
					usable: 1,
					enable: 'phaseUse',
					filter(event, player) {
						var card = { name: "sha", isCard: true };
						return game.hasPlayer(target =>
							target != player &&
							target.getEquips(1).length > 0 &&
							target.inRange(player) && lib.filter.targetEnabled(card, target, player))
					},
					filterCard: true,
					discard: false,
					lose: false,
					delay: true,
					position: 'he',
					filterTarget(card, player, target) {
						var card = { name: "sha", isCard: true };
						return (
							player != target &&
							target.getEquips(1).length > 0 &&
							target.inRange(player) && lib.filter.targetEnabled(card, target, player)
						);
					},
					async content(event, trigger, player) {
						let card = get.autoViewAs({ name: 'jiedao' }, event.cards, player);
						const next = player.useCard(card, event.cards, event.targets[0]);
						next.addedTarget = player;
					},
				},
				tao: {
					audio: 'mengjiandan',
					name: '剑胆·强袭',
					usable: 1,
					enable: 'phaseUse',
					filter(event, player) {
						return player.canUse({ name: 'tao', isCard: true }, player) && player.countCards(card => get.subtype(card) == 'equip1') > 0;
					},
					filterCard(card, player) {
						return get.subtype(card) == 'equip1'
					},
					position: 'he',
					check(card) {
						return 10 - get.value(card);
					},
					filterTarget(card, player, target) {
						return target.inRange(player)
					},
					async content(event, trigger, player) {
						event.targets[0].damage('nocard');
					},
					ai: {
						order: 10,
						result: {
							target(player, target, card) {
								return get.damageEffect(target, player, player)
							},
							player(player, target, card) {
								return get.effect(player, { name: 'tao' }, player, player)
							}
						}
					}
				},
			}
		},
		mengkanpo: {
			audio: 4,
			trigger: {
				player: ['useCardAfter', 'respondAfter']
			},
			filter(event, player) {
				return event.respondTo && event.respondTo[0] != player;
			},
			async content(event, trigger, player) {
				await player.draw();
				await player.chooseToUse(function (card, player, event) {
					if (get.position(card) != 'h') return false;
					return lib.filter.cardEnabled.apply(this, arguments);
				}, "勘破：是否使用一张不计入次数且不可被响应的牌？")
					.set("addCount", false);
			},
			group: ['mengkanpo_dir'],
			subSkill: {
				dir: {
					trigger: {
						player: 'useCard'
					},
					direct: true,
					filter(event, player) {
						return event.getParent(2).name == 'mengkanpo' && event.getParent(5)?.respondTo[0].isIn()
					},
					async content(event, trigger, player) {
						trigger.directHit.add(trigger.getParent(5).respondTo[0])
					},
				}
			}
		},
		mengjiandan_info: '剑胆|每回合各限一次。①你可以将一张牌当作｛其使用杀只可指定你为目标的｝【借刀】使用。②弃置一张武器牌视为自己使用【桃】然后发动一次〖强袭〗（造成1点伤害）。',
		mengkanpo_info: '勘破|当你用牌响应其他角色的一张牌后，你可以摸一张牌并使用一张不计次数且不可被该角色响应的牌。',

		/**@type { [String,Character]} */
		hyyz_xt_sp_zhenliyisheng: ['真理医生', ["male", "hyyz_xt", 4, ['mengbianbo', 'mengguina'], []], '', ''],
		mengbianbo: {
			audio: 'hyyzbianbo',
			trigger: {
				player: ['phaseZhunbeiBefore', 'phaseJudgeBefore', 'phaseUseBefore', 'phaseDiscardBefore', 'phaseDiscardBefore', 'phaseJieshuBefore']
			},
			filter(event, player) {
				return game.hasPlayer(current => player.canCompare(current));
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt('mengbianbo'), '跳过' + get.translation(trigger.name) + '并与一名角色拼点，若你赢，对本回合拼点赢过的角色各造成1点伤害', (card, player, target) => {
						return player.canCompare(target)
					})
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				trigger.cancel();
				const { bool } = await player.chooseToCompare(event.targets[0]).forResult();
				if (bool) {
					const targets = []
					game.getGlobalHistory('everything', (evt) => {
						if (evt.name == 'chooseToCompare' && evt.result.winner?.isIn()) targets.add(evt.result.winner);
					})
					for (let target of targets) {
						await target.damage()
					}
				}
			},
		},
		mengguina: {
			audio: 'hyyzguina',
			trigger: {
				player: ["chooseToCompareAfter", "compareMultipleAfter"],
				target: ["chooseToCompareAfter", "compareMultipleAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.preserve) return false;
				if (player == event.player && event.num1 <= event.num2 || player != event.player && event.num1 >= event.num2) return true
				return player.storage.mengguina2
			},
			async content(event, trigger, player) {
				if (player == trigger.player && trigger.num1 <= trigger.num2 || player != trigger.player && trigger.num1 >= trigger.num2) {
					player.addSkill('mengguina2');
					player.storage.mengguina2++;
					player.markSkill('mengguina2')
				} else {
					player.removeSkill('mengguina2');
				}
			},
		}, mengguina2: {
			init(player) {
				player.storage.mengguina2 = 0;
				player.markSkill('mengguina2')
			},
			onremove(player) {
				delete player.storage.mengguina2
				player.unmarkSkill('mengguina2')
			},
			trigger: {
				player: "compare",
				target: "compare",
			},
			direct: true,
			forced: true,
			charlotte: true,
			nopop: true,
			mark: true,
			marktext: "归纳",
			intro: {
				name: '归纳',
				content(storage, player) {
					return "拼点牌点数+" + player.storage.mengguina2;
				},
			},
			async content(event, trigger, player) {
				game.log(player, "的拼点牌点数+", player.storage.mengguina2);
				if (player == trigger.player) trigger.num1 = Math.min(13, trigger.num1 + player.storage.mengguina2);
				else trigger.num2 = Math.min(13, trigger.num2 + player.storage.mengguina2);
			}
		},
		mengbianbo_info: '辩驳|你可以跳过一个阶段并拼点。若你赢，对本回合拼点赢过的角色各造成1点伤害。',
		mengguina_info: '归纳|锁定技，若你拼点没赢，直到拼点赢，你拼点的点数+1。',
	},
	2504: {
		meng_yianshan: ['伊安珊', ['female', 'hyyz_ys', 3, ['mengtuantie', 'mengshengtong', 'mengjiulong'], []], '九龙护体-冷若寒', ''],
		mengtuantie: {
			audio: 2,
			chargeSkill: 3,
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				return player.countCharge() == player.getHistory('useCard', evt => evt.card).length
			},
			async cost(event, trigger, player) {
				let list = [];
				if (player.countCharge(true) > 0) list.add('获得1蓄力点');
				list.add('摸' + get.cnNumber(player.countCharge()) + '张牌');
				const { control } = await player.chooseControl(list, 'cancel2')
					.set('prompt', '是否发动抟铁？')
					.set('ai', () => list[list.length - 1])
					.forResult()
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: control
					}
				}
			},
			async content(event, trigger, player) {
				if (event.cost_data == '获得1蓄力点') {
					player.addCharge()
				} else {
					player.draw(player.countCharge())
				}
			},
			group: 'mengtuantie_charge',
			subSkill: {
				charge: {
					audio: 'mengtuantie',
					trigger: {
						global: "phaseBefore",
						player: "enterGame",
					},
					forced: true,
					filter(event, player, name) {
						if (!player.countCharge(true)) return false;
						return name != "phaseBefore" || game.phaseNumber == 0;
					},
					content() {
						player.addCharge();
					},
				},
			}
		},
		mengshengtong: {
			audio: 2,
			chargeSkill: 0,
			init(player) {
				player.addCharge = async function (num, log) {
					if (typeof num != "number" || !num) num = 1;
					let maxCharge = player.getMaxCharge();
					num = Math.min(num, maxCharge - player.countMark("charge"));

					var next = game.createEvent("addCharge", false);
					next.player = this;
					next.num = num;
					next.log = log;
					next.setContent("addCharge");
					return next;
				};
				lib.element.content.addCharge = async function (event, trigger, player) {
					await event.trigger('addChargeBegin');
					if (event.num > 0) player.addMark("charge", event.num, event.log);
				}
			},
			trigger: {
				player: ['addChargeBegin', 'recoverBegin']
			},
			filter(event, player) {
				if (game.roundNumber == 0) return false;
				if (event.name == 'addCharge' && !player.isDamaged()) return false;
				if (event.name == 'recover' && !(player.countCharge(true) > 0)) return false;
				return event.num > 0 && event.getParent().name != 'mengshengtong'
			},
			prompt2(event, player) {
				if (event.name == 'addCharge') return '改为恢复' + event.num + '点体力';
				if (event.name == 'recover') return '改为获得' + event.num + '蓄力点';
			},
			async content(event, trigger, player) {
				if (trigger.name == 'addCharge') await player.recover(trigger.num)
				else await player.addCharge(trigger.num)
				trigger.num = 0;
			},
		},
		mengjiulong: {
			audio: 2,
			chargeSkill: 0,
			trigger: {
				player: 'phaseUseBegin'
			},
			filter(event, player) {
				return player.countCharge() > 0
			},
			async content(event, trigger, player) {
				let num = Math.ceil(player.countCharge() / 2);
				player.removeCharge(num);

				await player.gainMaxHp(num);
				player.storage.mengjiulong_hand = (player.storage.mengjiulong_hand || 0) + num
				lib.skill.mengjiulong.chargeSkill += num;

				//if (player.countCharge(true) > 0 && player.isDamaged() && player.getHandcardLimit() - player.countCards() > 0) {
				//	player.say('首个未选择过的技能改为强制发动')
				//}
			},
			mod: {
				maxHandcard(player, num) {
					return num += player.storage.mengjiulong_hand
				}
			}
		},
		mengtuantie_info: '抟铁|蓄力技（1/3），你使用牌结算完成后，若你本回合使用过的牌数与蓄力点数相同，你可以获得1蓄力点或摸等同于蓄力点数的牌。',
		mengshengtong_info: '生酮|蓄力技，你不因此恢复体力时，可以改为获得等量的蓄力点。你获得蓄力点时，可以改为恢复等量的体力。',
		mengjiulong_info: '九龙|蓄力技，出牌阶段开始时，你可以消耗半数取上蓄力点，增加等量的手牌，体力与蓄力点上限。',//[此阶段结束时，若你三者均未达到上限，令你首个未选择过的技能改为强制发动。（？？？）]

		meng_aikefei: ['爱可菲', ['male', 'hyyz_ys', 3, ['mengliaoqie', 'mengjinhui'], []], '菲常可爱-冷若寒', ''],
		mengliaoqie: {
			audio: 6,
			forced: true,
			group: ['mengliaoqie_1', 'mengliaoqie_2'],
			subSkill: {
				1: {
					audio: 'mengliaoqie',
					trigger: {
						player: 'useCard1'
					},
					forced: true,
					filter(event, player) {
						return get.tag(event.card, 'damage') > 0;
					},
					content() {
						trigger.effectCount++
					},
				},
				2: {
					audio: 'mengliaoqie',
					forced: true,
					trigger: {
						source: 'damageBefore'
					},
					content() {
						trigger.num = 0.5
					},
				},
			}
		},
		mengjinhui: {
			audio: 2,
			init(player) {
				player.storage.mengjinhui = []
			},
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				const storage = player.getStorage('mengjinhui'), length = lib.skill.mengjinhui.getSuits().length
				if (storage.length >= 2) return false;
				if (storage.length == 0) return length > 0
				if (storage.includes(1)) return length >= 4;
				if (storage.includes(4)) return length > 1;
			},
			/**中央区牌的花色类型 */
			getSuits() {
				let suits = [];
				const cards = get.centralCards(true)
				cards.forEach(card => suits.add(get.suit(card)));
				return suits;
			},
			async cost(event, trigger, player) {
				const storage = player.getStorage('mengjinhui'), cards = get.centralCards(true);
				const str = `锦荟：获得本回合弃牌堆${!storage.includes(1) ? '一张' : ''}${storage.length == 0 ? '或' : ''}${!storage.includes(4) ? '四张' : ''}花色不同的牌`
				const { links } = await player
					.chooseButton([str, cards])
					.set('filterButton', (button) => {
						const player = _status.event.player, storage = player.getStorage('mengjinhui'), length = lib.skill.mengjinhui.getSuits().length;
						if (storage.length == 0) {//[]
							if (length < 4) {
								return !ui.selected.buttons.length
							} else {
								if (ui.selected.buttons.length) {
									if (ui.selected.buttons.every(i => get.suit(i.link) != get.suit(button.link))) return true
								} else {
									return true
								}
							}
						}
						if (storage.includes(4)) {//[4]
							return !ui.selected.buttons.length
						} else {//[4]
							if (ui.selected.buttons.length) {
								if (ui.selected.buttons.every(i => get.suit(i.link) != get.suit(button.link))) return true
							} else {
								return true
							}
						}
					})
					.set('forced', false)
					.set('filterOk', function () {
						const player = _status.event.player, storage = player.getStorage('mengjinhui'), length = lib.skill.mengjinhui.getSuits().length;
						if (storage.length == 0) {
							if (length < 4) return ui.selected.buttons.length == 1
							else return (ui.selected.buttons.length == 1 || ui.selected.buttons.length == 4)
						}
						if (storage.includes(4)) {
							return ui.selected.buttons.length == 1
						} else {
							return ui.selected.buttons.length == 4
						}
					})
					.set('selectButton', [1, 4])
					.set("ai", get.buttonValue)
					.forResult();
				if (links?.length) event.result = {
					bool: true,
					cards: links
				}
			},
			async content(event, trigger, player) {
				await player.gain(event.cards, "gain2");
				player.storage.mengjinhui.add(event.cards.length)
				player.when({ global: 'phaseAfter' }).then(() => {
					player.storage.mengjinhui = []
				})
				if (event.cards.some(card => card.name == 'jiu' || card.name == 'sha')) {
					player.addGaintag(player.getCards('h'), 'mengjinhui_g')
					player.addSkill('mengjinhui_x')
				}
			},
			group: ['mengjinhui_lose'],
			subSkill: {
				x: {
					audio: 'mengliaoqie',
					enable: ["chooseToUse", "chooseToRespond"],
					filter(event, player) {
						if (!player.countCards("h", (card) => {
							return card.gaintag.includes('mengjinhui_g')
						}) > 0) return false;
						return event.filterCard(get.autoViewAs({ name: 'jiu' }, "unsure"), player, event) ||
							event.filterCard(get.autoViewAs({ name: 'sha', nature: 'ice' }, "unsure"), player, event)
					},
					chooseButton: {
						dialog(event, player) {
							let list = [];
							if (event.filterCard(get.autoViewAs({ name: 'jiu' }, "unsure"), player, event)) list.push(['锦囊', '', 'jiu'])
							if (event.filterCard(get.autoViewAs({ name: 'sha', nature: 'ice' }, "unsure"), player, event)) list.push(['锦囊', '', 'sha', 'ice'])
							return ui.create.dialog("锦荟", [list, "vcard"]);
						},
						check(button) {
							if (_status.event.getParent().type != "phase") return 1;
							var player = _status.event.player;
							return player.getUseValue({
								name: button.link[2],
								nature: button.link[3],
							});
						},
						backup(links, player) {
							return {
								filterCard: (card) => card.gaintag.includes('mengjinhui_g'),
								selectCard: -1,
								popname: true,
								check(card) {
									return 8 - get.value(card);
								},
								viewAs: {
									name: links[0][2], nature: links[0][3],
									storage: {
										mengjinhui: true,
									}
								},
							};
						},
						prompt(links, player) {
							return "选择" + get.translation(links[0][3]) + get.translation(links[0][2]) + "的目标";
						},
					},
					hiddenCard(player, name) {
						if (!lib.inpile.includes(name)) return false;
						return (name == 'jiu' || name == 'sha') && player.countCards("h", (card) => {
							return card.gaintag.includes('mengjinhui_g')
						}) > 0
					},
					ai: {
						fireAttack: true,
						respondSha: true,
						respondShan: true,
						skillTagFilter(player) {
							if (!player.countCards("h")) return false;
						},
						order: 1,
						result: {
							player(player) {
								if (_status.event.dying) return get.attitude(player, _status.event.dying);
								return 1;
							},
						},
					},
					mod: {
						cardEnabled2(card, player) {
							if (card.gaintag.includes('mengjinhui_g') && _status.event.skill != 'mengjinhui_x_backup') return false;

						},
					}
				},
				lose: {
					trigger: {
						player: 'useCard'
					}, silent: true,
					filter(event, player) {
						return event.card.storage.mengjinhui && !player.countCards("h", (card) => {
							return card.gaintag.includes('mengjinhui_g')
						})
					},
					async content(event, trigger, player) {
						player.removeSkill('mengjinhui_x')
					}
				}
			}
		},
		mengliaoqie_info: '缭切|锁定技，你的伤害类牌额外结算一次，但伤害基数改为0.5。',
		mengjinhui_g: '酒/冰杀',
		mengjinhui_info: '锦荟|每回合各限一次，你使用牌时，可以获得本回合弃牌堆一张或四张花色不同的牌。若获得了【酒】或【杀】，令你的所有手牌视为一张不计次数的【酒】或冰【杀】。',
	},
	2505: {
		//国战祝商
		Ymjuanniao: {
			trigger: {
				player: 'useCardToPlayered'
			},
			filter(event, player) {
				return event.targets.length == 1 && event.target.isIn();
			},
			async content(event, trigger, player) {
				await trigger.target.draw();
				trigger.target.addTempSkill('Ymjuanniao_no');
			},
			subSkill: {
				no: {
					mark: true,
					marktext: '倦',
					intro: {
						content: "锁定技，你不能成为牌的目标",
					},
					mod: {
						targetEnabled(card, player, target) {
							return false;
						},
					},
				}
			}
		},
		Ymershe: {
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (!player.countCards("hse")) return false;
				return event.filterCard(get.autoViewAs({ name: 'lulitongxin' }, "unsure"), player, event) ||
					event.filterCard(get.autoViewAs({ name: 'yuanjiao' }, "unsure"), player, event)
			},
			chooseButton: {
				dialog(event, player) {
					let list = [];
					if (event.filterCard(get.autoViewAs({ name: 'lulitongxin' }, "unsure"), player, event)) list.push(['锦囊', '', 'lulitongxin'])
					if (event.filterCard(get.autoViewAs({ name: 'yuanjiao' }, "unsure"), player, event)) list.push(['锦囊', '', 'yuanjiao'])
					return ui.create.dialog("二舌", [list, "vcard"]);
				},
				check(button) {
					if (_status.event.getParent().type != "phase") return 1;
					var player = _status.event.player;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup(links, player) {
					return {
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						viewAs: { name: links[0][2] },
						async precontent(event, trigger, player) {
							player.logSkill("Ymershe");
							const types = player.getCards("h").reduce((list, card) => {
								return list.add(get.type2(card));
							}, [])
							if (types.length) {
								const { control } = await player.chooseControl(types)
									.set("prompt", "选择一种类别的所有手牌")
									.forResult();
								if (control != 'cancel2') {
									const cards = player.getCards("h").filter(card => get.type2(card) == control);
									if (cards?.length > 0) {
										event.result.card = {
											name: event.result.card.name,
											nature: undefined,
											cards: cards
										};
										event.result.cards = cards;
									}

								}
							}
						},
					};
				},
				prompt(links, player) {
					return "选择" + get.translation(links[0][2]) + "的目标";
				},
			},
			hiddenCard(player, name) {
				if (!lib.inpile.includes(name)) return false;
				return (name == 'lulitongxin' || name == 'yuanjiao') && player.countCards("she") > 0
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player) {
					if (!player.countCards("hse")) return false;
				},
				order: 1,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
			group: 'Ymershe_no',
			subSkill: {
				no: {
					trigger: {
						player: 'useCardAfter'
					},
					filter(event, player) {
						if (!(event.skill == "Ymershe_backup")) return false;
						let groups = [];
						player.hasHistory('useCard', (evt) => {
							if (evt == event) return false;
							evt.targets.forEach(tar => {
								groups.add(tar[get.mode() == "guozhan" ? "identity" : "group"])
							})
							return evt.targets.some(tar => groups.includes(tar[get.mode() == "guozhan" ? "identity" : "group"]))
						})
					},
					forced: true,
					async content(event, trigger, player) {
						player.hideCharacter('Ym_zhushang' == player.name1 ? 0 : 1);
						player.addTempSkill("Ymershe_mingzhi")
					},
				},
				mingzhi: {
					ai: {
						nomingzhi: true,
					}
				}
			}
		},
		Ymjuanniao_info: '倦鸟|锁定技，你使用牌指定唯一目标后，对方摸一张牌且本回合不能再成为牌的目标。',
		Ymershe_info: '二舌|你可将一个类别的所有手牌当作【勠力同心】或【远交近攻】使用；若本回合你使用牌指定过目标势力的角色，你暗置此武将牌且本回合不可明置。',

		hyyz_b3_sp_kiana: ['琪亚娜', ['female', 'hyyz_b3', 4, ['mengcuijue', 'mengxinzhuo'], []], '疵已灼珏-微雨', ''],
		mengcuijue: {
			enable: "chooseToUse",
			filter(event, player) {
				return player.countEnabledSlot() > 0
			},
			viewAs: {
				name: "kaihua",
				isCard: true,
			},
			async precontent(event, trigger, player) {
				event.result = await player.chooseToDisable().forResult()
			},
			filterCard() {
				return false;
			},
			selectCard: -1,
			prompt: "废除一个装备栏，视为使用【树上开花】",
			group: 'mengcuijue_1',
			subSkill: {
				1: {
					trigger: {
						player: 'linkAfter'
					},
					filter(evenyt, player) {
						return player.isLinked();
					},
					forced: true,
					locked: false,
					async content(event, trigger, player) {
						await player.damage(1, 'fire')
						if (player.countDisabledSlot() > 0) await player.chooseToEnable()
					},
				}
			}
		},
		mengxinzhuo: {
			trigger: {
				player: 'gainAfter'
			},
			filter(event, player) {
				let name = lib.phaseName.find(phase => event.getParent(phase).name == phase);
				let historys = player.getHistory('gain', (evt) => evt != event && evt.cards.length > 0 && evt.getParent(name) == event.getParent(name));
				return historys[historys.length - 1]?.cards.length < event.cards.length
			},
			forced: true,
			async content(event, trigger, player) {
				let bool = false;

				let historys = []
				player.getRoundHistory('useCard', (evt) => {
					historys.add(evt.card.name)
				})
				const inpiles = lib.inpile.filter(i => !historys.includes(i))
				var list = [];
				for (let name of inpiles) {
					let type = get.type(name);
					if (type == "trick" || type == "basic") {
						if (player.hasUseTarget({ name: name, isCard: true, }, true, false)) {
							list.add([get.translation(type), "", name]);
						}
					}
					if (name == "sha") {
						for (var nature of lib.inpile_nature) list.add([type, "", name, nature]);
					}
				}
				if (list.length) {
					const { links } = await player
						.chooseButton(["视为使用一张基本牌或普通锦囊牌？", [list, "vcard"]])
						.set("filterButton", function (button) {
							return _status.event.target.hasUseTarget({
								name: button.link[2],
								nature: button.link[3],
								isCard: true,
							});
						})
						.set("ai", function (button) {
							return _status.event.target.getUseValue({
								name: button.link[2],
								nature: button.link[3],
								isCard: true,
							});
						})
						.set('target', player)
						.forResult();
					if (links) {
						bool = true;
						await player.chooseUseTarget(true, {
							name: links[0][2],
							nature: links[0][3],
							isCard: true,
						});
					}
				}

				if (!bool) {
					const { bool: boolx } = await player
						.chooseBool('弃置这些牌并恢复一点体力？')
						.forResult()
					if (boolx) {
						await player.discard(trigger.cards);
						await player.recover()
					}
				}
			},
		},
		mengcuijue_info: '淬珏|你可以废除一个装备栏，视为使用【树上开花】。当你进入连环状态后，受到一点火焰伤害并恢复一个装备栏',
		mengxinzhuo_info: '新灼|当你获得牌时，若比本阶段上次获得的牌多时，你可以视为使用一张本轮未被使用过的即时牌，或你弃置这些牌并恢复一点体力',

		meng_peiyuanshao: ['裴元绍', ['male', 'hyyz_other', 4, ['mengfuqin'], []],],
		mengfuqin: {
			enable: 'phaseUse',
			filterTarget(card, player, target) {
				return target != player && target.getGainableCards(player, 'he').length > 0
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				const { cards } = await player.gainPlayerCard(target, 'he', true).forResult();

				const sha = get.autoViewAs({ name: 'sha', isCard: true }),
					juedou = get.autoViewAs({ name: 'juedou', isCard: true })
				if (cards.some(i => get.type(i) == 'basic') &&
					(target.canUse(sha, player, false, false) || target.canUse(juedou, player, false, false))
				) {
					const { control } = await target
						.chooseControl('杀', '决斗').set('prompt', '对' + get.translation(player) + '使用：').set('ai', () =>
							get.effect(player, sha, target, target) > get.effect(player, juedou, target, target) ? '杀' : '决斗'
						).forResult()
					target.useCard(control == '杀' ? sha : juedou, player).set('baseDamage', player.getStat().skill.mengfuqin || 1)
				}
			},
			ai: {
				order: 10,
				result: {
					target: -2
				}
			}
		},
		mengfuqin_info: '复侵|出牌阶段，你可以选择一名其他角色并获得其一张牌，若为基本牌，则其视为对你使用一张伤害为X的【杀】或【决斗】。（X为此技能本回合发动次数）',

		hyyz_xt_sb_daheita: ['大黑塔', ['female', 'hyyz_xt', 4, ['mengtashi', 'mengkouzun'], []], '终行寰宇-咩阿栗诶', ''],
		mengtashi: {
			audio: 'mengqiuda',
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			filter(event, player) {
				return player.countCards('he', (i) => get.type2(i) != get.type2(player.getCards('he')[0])) > 0
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard(2, get.prompt('mengtashi'), '重铸两张类别不同的牌并检索获得一张与之类别不同的牌', 'he', (card) => {
					if (ui.selected.cards.length > 0) return get.type2(card) != get.type2(ui.selected.cards[0])
					return true;
				}).set("complexCard", true).forResult()
			},
			async content(event, trigger, player) {
				const num = Math.max(0, get.number(event.cards[0]), get.number(event.cards[1])),
					type = ['basic', 'trick', 'equip'].find(i => i != get.type2(event.cards[0]) && i != get.type2(event.cards[1]))
				await player.recast(event.cards);

				let tops = [];
				while (true) {
					const card = get.cards()[0];
					await game.cardsGotoOrdering(card);
					const judgestr = `${get.translation(player)}亮出的第${get.cnNumber(tops.length + 1, true)}张【拓识】牌`,
						videoId = lib.status.videoId++;
					game.addVideo("judge1", player, [get.cardInfo(card), judgestr, event.videoId]);
					game.broadcastAll(
						(player, card, str, id, cardid) => {
							let event;
							if (game.online) event = {};
							else event = _status.event;
							if (game.chess) event.node = card.copy("thrown", "center", ui.arena).addTempClass("start");
							else event.node = player.$throwordered(card.copy(), true);
							if (lib.cardOL) lib.cardOL[cardid] = event.node;
							event.node.cardid = cardid;
							event.node.classList.add("thrownhighlight");
							ui.arena.classList.add("thrownhighlight");
							event.dialog = ui.create.dialog(str);
							event.dialog.classList.add("center");
							event.dialog.videoId = id;
						},
						player, card, judgestr, videoId, get.id()//随机数
					);
					game.log(player, "亮出了牌堆顶的", card);
					await game.delayx(2);
					game.broadcastAll(id => {
						const dialog = get.idDialog(id);
						if (dialog) dialog.close();
						ui.arena.classList.remove("thrownhighlight");
					}, videoId);
					game.addVideo("judge2", null, videoId);

					if (get.type2(card) == type) {//检索获得一张与之类别不同的牌
						await player.gain(card, 'gain2')
						game.broadcastAll(() => ui.clear());
						await game.cardsDiscard(tops);
						break;
					} else if (['basic', 'trick'].includes(get.type2(card))) {//使用过程中出现的即时牌
						await player.chooseUseTarget(card, true, false)
					} else if (get.number(card) > num) {//获得点数均大于重铸牌的牌
						await player.gain(card, 'gain2')
					} else {
						tops.add(card);
					}
				}
			},
		},
		mengkouzun: {
			audio: 'mengqiuda',
			trigger: {
				player: 'useCardToPlayered'
			},
			filter(event, player) {
				return player.countCards('h')
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard(get.prompt('mengkouzun'), '展示一张点数极值的手牌', (card) => {
						return !player.countCards('h', (i) => get.number(i) < get.number(card)) || !player.countCards('h', (i) => get.number(i) > get.number(card))
					})
					.forResult()
			},
			async content(event, trigger, player) {
				const card1 = event.cards[0];
				await player.showCards(event.cards, '扣尊');

				let min = function (card) {
					return !trigger.target.countCards('h', (i) => get.number(i) < get.number(card))
				}, max = function (card) {
					return !trigger.target.countCards('h', (i) => get.number(i) > get.number(card))
				}
				if (!player.countCards('h', (i) => get.number(i) < get.number(card1))) {
					min = () => false;
				}
				if (!player.countCards('h', (i) => get.number(i) > get.number(card1))) {
					max = () => false;
				}
				if (trigger.target.countCards(card => min(card) || max(card))) {
					const { cards } = await trigger.target.chooseCard('展示一张手牌', (card) => min(card) || max(card)).forResult()
					await trigger.target.showCards(cards, '扣尊');
					const card2 = cards[0];
					if (get.number(card1) * get.number(card2) >= 42) {
						game.log(trigger.card, '不可被响应')
						trigger.getParent().directHit.add(trigger.target)
					} else {
						if (player.countCards('he')) {
							const { cards } = await player.chooseCard('重铸一张牌', 'he', true).forResult();
							if (cards) await player.recast(cards);
						}
						player.tempBanSkill('mengkouzun')
					}
				}
			},
		},
		mengtashi_info: '拓识|准备阶段，你可以重铸两张类别不同的牌并检索获得一张与之类别不同的牌，然后使用过程中出现的即时牌，获得点数均大于重铸牌的牌。',
		mengkouzun_info: '叩尊|你使用牌指定目标后，你可展示一张点数极值的手牌，并令其选择另一项，若你与其展示牌的点数之积不小于42，则此牌不可响应，反之你重铸一张牌且本轮此技能失效。',

		meng_jiguoyuanyi: ['继国缘一', ['male', 'hyyz_other', 4, ['mengjiyiJGYY', 'mengyanren'], []], '流萤一生推'],
		mengjiyiJGYY: {
			enable: 'phaseUse',
			usable: 1,
			filterCard: true,
			position: 'he',
			selectCard: [1, Infinity],
			async content(event, trigger, player) {
				if (player.storage.counttrigger?.mengyanren) delete player.storage.counttrigger.mengyanren;
				const card = get.cardPile((card) => {
					return get.number(card) == event.cards.length
				})
				if (card) player.gain(card, 'gain2')
			},
		},
		mengyanren: {
			trigger: {
				player: 'useCard'
			},
			usable: 1,
			filter(event, player) {
				return player.isPhaseUsing() && get.number(event.card) == player.getHistory('useCard').length;
			},
			async content(event, trigger, player) {
				if (player.stat[player.stat.length - 1].skill?.mengjiyiJGYY) delete player.stat[player.stat.length - 1].skill.mengjiyiJGYY
				player.draw(get.number(trigger.card))
			}
		},
		mengjiyiJGYY_info: '极意|出牌阶段限一次，你可以弃置任意张牌并检索出一张与你弃置牌数相同点数的牌。发动〖炎刃〗后重置发动次数。',
		mengyanren_info: '炎刃|出牌阶段限一次，当你使用牌时，若你本回合使用的牌数与此牌点数相同，你可以摸等量的牌数。发动〖极意〗后重置发动次数。',
	},
	/**@type { SMap<Skill> } */
	2506: {
		meng_sikeke: ['丝柯克', ['female', 'hyyz_ys', 4, ['mengyuanxin', 'mengfengyv', 'menghuangming'], ['hiddenSkill']], '至落天渊-冷若寒', ''],
		mengyuanxin: {
			audio: 5,
			trigger: { player: "showCharacterAfter" },
			hiddenSkill: true,
			filter(event, player) {
				return event.toShow?.some(i => get.character(i).skills?.includes("mengyuanxin")) && _status?.currentPhase?.isIn();
			},
			async content(event, trigger, player) {
				await _status.currentPhase.gain(lib.card.ying.getYing(1), 'gain2');
			},
			group: 'mengyuanxin_destroy',
			subSkill: {
				destroy: {
					trigger: {
						global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter(event, player) {
						if (event.name == 'lose') {
							const evt = event.getl(player);
							return evt?.cards?.some(i => i.name == 'ying')
						} else {
							return game.hasPlayer2(current => {
								const evt = event.getl(current);
								return evt?.cards?.some(i => i.name == 'ying')
							})
						}
					},
					async cost(event, trigger, player) {
						event.result = { bool: true }
					},
					async content(event, trigger, player) {
						player.when({ global: 'phaseAfter' }).then(() => { player.hyyzUnseen() })
					},
				},
			},
		},
		mengfengyv: {
			audio: 5,
			trigger: {
				player: 'damageBegin3',
				source: 'damageBegin1'
			},
			filter(event, player) {
				return player.countCards('he') >= 3
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard(3, 'he', get.prompt2('mengfengyv'))
					.set('ai', (card) => {
						if (get.value(card) > 10) return false;
						const player = _status.event.player, evt = _status.event.getTrigger()
						if (get.attitude2(evt.player) > 0) {
							if (get.color(card) != 'black') return 10;
						} else {
							if (get.color(card) == 'black') return 10;
						}
					})
					.forResult()
			},
			async content(event, trigger, player) {
				await player.recast(event.cards);
				let num = event.cards.filter(i => get.color(i) == 'black').length;
				trigger.num = num;
			},
		},
		menghuangming: {
			audio: 'mengfengyv',
			limited: true,
			mark: true,
			skillAnimation: true,
			animationColor: "blue",
			intro: {
				content: "limited",
			},
			init(player) {
				player.storage.menghuangming = false;
			},
			trigger: {
				global: 'roundStart'
			},
			filter(event, player) {
				return player.storage.menghuangming == false && game.roundNumber > 0
			},
			async cost(event, trigger, player) {
				let history = game.getAllGlobalHistory('everything', evt => {
					return evt.name == 'dying' && evt.player.isAlive();
				})
				if (!history.length) return;

				let current = history[history.length - 1].player;
				event.result = await player
					.chooseBool(get.prompt('menghuangming'), '杀死' + get.translation(current) + '？')
					.set('ai', () => {
						return get.attitude2(current) < 0
					})
					.forResult()
				if (event.result.bool) {
					event.result.targets = [current]
				}
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				player.awakenSkill('menghuangming');
				event.targets[0].die().source = player
			},
		},
		mengyuanxin_info: '渊心|隐匿技，你登场时，可以令当前回合角色获得一张【影】。【影】被销毁的回合结束时。你隐匿。',
		mengfengyv_info: '锋语|你造成或受到伤害时，可以重铸三张牌并令伤害值改为其中的黑色牌数。',
		menghuangming_info: '荒鸣|限定技，每轮结束时，你可以杀死最后一个脱离濒死的角色。',

		meng_fengjin: ['风堇', ['female', 'hyyz_xt', 3, ['mengpiye', 'mengyvqiong'], []], '咩阿栗诶', ''],
		mengpiye: {
			audio: 2,
			init(player) {
				if (!player.storage.counttrigger) player.storage.counttrigger = {}
				player.storage.counttrigger.mengpiye = 0;
			},
			trigger: {
				global: ['useCardToBegin', 'useCard', 'respond']
			},
			filter(event, player) {
				if (player.storage.counttrigger.mengpiye >= 2) return false;
				if (!player.countCards('h', card => {
					return !get.is.shownCard(card) && get.type(card) == 'basic'
				})) return false;
				if (['useCard', 'respond'].includes(event.name)) {
					return event.respondTo && event.respondTo[0].hasUseTarget(get.autoViewAs({ name: event.respondTo[1].name, isCard: true }))
				} else {
					return event.player
				}
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard(get.prompt('mengpiye'),
					['useCard', 'respond'].includes(trigger.name) ? '令使用者视为使用被抵消牌' : '令使用者于本轮内获得〖辟夜〗', card => {
						return !get.is.shownCard(card) && get.type(card) == 'basic'
					})
					.set('ai', (card) => {
						if (get.attitude2(trigger.player) > 0 && ['useCard', 'respond'].includes(trigger.name)) return 10
						return -1;
					})
					.forResult();
			},
			async content(event, trigger, player) {
				player.storage.counttrigger.mengpiye++
				player.when('roundStart').then(() => (player.storage.counttrigger.mengpiye = 0));
				await player.addShownCards(event.cards, 'visible_mengpiye');
				if (['useCard', 'respond'].includes(trigger.name)) {
					let card = get.autoViewAs({ name: trigger.respondTo[1].name, isCard: true });
					trigger.respondTo[0].chooseUseTarget(card, true);
				} else {
					trigger.player.addTempSkills('mengyvqiong')
				}
			},
		},
		mengyvqiong: {
			audio: 1,
			limited: true,
			mark: true,
			skillAnimation: true,
			animationColor: "pink",
			intro: {
				content: "limited",
			},
			init(player) {
				player.storage.mengyvqiong = false;
			},
			trigger: {
				player: "chooseToUseBegin",
			},
			filter(event, player) {
				return !player.storage.mengyvqiong && event.type == "dying" && player.storage.counttrigger?.mengpiye > 0 && player.countCards('h', card => get.is.shownCard(card)) > 0
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard(get.prompt2('mengyvqiong'), [1, player.storage.counttrigger.mengpiye], card => {
					return get.is.shownCard(card)
				}).forResult();
			},
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				const gains = get.cards(event.cards.length)
				const next = player.recast(event.cards);
				next.recastingGain = (player, cards) => {
					player.gain(gains, 'draw').log = false
				};
				await next;
				for (let i of gains) {
					if (get.owner(i) == player && get.color(i) == 'red') {
						let card = get.autoViewAs({ name: 'tao' }, [i], player);
						await player.useCard(card, [i], trigger.dying, "mengyvqiong");
					}
				}

			},
			ai: {
				save: true,
				order: 3,
				result: {
					player: 1,
				},
				skillTagFilter(player) {
					if (!_status.event.dying || !player.storage.counttrigger?.mengpiye) return false;
				},
			},
		},
		visible_mengpiye: '明',
		mengpiye_info: '辟夜|每轮限两次，一张单体牌被抵消后/生效时，你可以明置一张基本牌，令使用者视为使用被抵消牌/于本轮内获得〖辟夜〗。',
		mengyvqiong_info: '愈穹|限定技，一名角色进入濒死状态时，你可以重铸至多X张明置牌，并将因此获得的红色牌依次当【桃】对其使用（X为本轮〖辟夜〗发动次数）。 ',

		meng_mengjianyueruixi: ['梦见月瑞希', ['female', 'hyyz_ys', 3, ['mengqiyi'], []], '绮梦缱绻-冷若寒', ''],
		艹什么抽象技能无语了: {
			trigger: {
				player: 'phaseBegin'
			},
			silent: true,
			content() {
				for (let current of game.filterPlayer()) {
					current.meng_mengjianyueruixi = [current.countCards('h'), current.hp]
				}
			}
		},
		mengqiyi: {
			audio: 3,
			init(player) {
				game.addGlobalSkill('艹什么抽象技能无语了', player)
			},
			mod: {
				targetInRange(card, player, target) {
					if (target.hasHistory('lose')) {
						return true;
					}
				},
			},
			trigger: {
				player: 'gainAfter'
			},
			filter(event, player) {
				const evt = event.getParent(3);
				if (evt.name != 'useCard') return false;
				switch (evt.card.name) {
					case 'tuixinzhifu': {
						if (evt.skill = 'mengqiyi_1' || evt.getParent().name == 'mengqiyi_2') return event.cards.some(i => get.suit(i) == 'heart');
						return false;
					}
					case 'tiaojiyanmei': {
						return evt.getParent(2).name == 'mengqiyi' && event.cards.some(i => get.suit(i) == 'heart')
					}
					case 'kaihua': {
						return evt.getParent(2).name == 'mengqiyi' && get.centralCards().filter(i => get.suit(i) == 'heart' && get.position(i, false) == 'd');
					}
				}
			},
			forced: true,
			locked: false,
			async content(event, trigger, player) {
				const evt = trigger.getParent(3);
				switch (evt.card.name) {
					case 'tuixinzhifu': {
						const cards = trigger.cards.filter(i => get.suit(i) == 'heart' && get.owner(i) == player), cardx = get.autoViewAs({
							name: 'tiaojiyanmei',
							_tempTranslate: '调剂盐梅（' + get.translation(cards) + '）'
						}, cards);
						await player.chooseUseTarget(cardx, cards);
						break;
					}
					case 'tiaojiyanmei': {
						const cards = trigger.cards.filter(i => get.suit(i) == 'heart' && get.owner(i) == player), cardx = get.autoViewAs({
							name: 'kaihua',
							_tempTranslate: '树上开花（' + get.translation(cards) + '）'
						}, cards);
						await player.chooseUseTarget(cardx, cards);
						break;
					}
					case 'kaihua': {
						const cards = get.centralCards().filter(i => get.suit(i) == 'heart');
						for (let card of cards) {
							if (get.position(card, false) == 'd') {
								const { targets } = await player.chooseTarget('把' + get.translation(card) + '分配给……').forResult()
								if (targets) {
									await targets[0].gain(card, 'gain2');
									await targets[0].addSkills('mengqianmeng')
								}
							}
						}
						break;
					}
				}
			},
			group: ['mengqiyi_1', 'mengqiyi_2'],
			subSkill: {
				1: {
					audio: 'mengqiyi',
					enable: ["chooseToUse"],
					filter(event, player) {
						return player.isPhaseUsing();
					},
					filterCard(card, player) {
						return get.suit(card) == "heart";
					},
					position: "hes",
					viewAs: {
						name: "tuixinzhifu",
					},
					viewAsFilter(player) {
						if (!player.countCards("hes", card => {
							let cardx = get.autoViewAs({ name: 'tuixinzhifu' }, [card]);
							return get.suit(card) == 'heart' && player.hasUseTarget(cardx)
						})) {
							return false;
						}
					},
					prompt: "将一张♥牌当【推心置腹】使用",
					check(card) {
						return 8 - get.value(card);
					},
				},
				2: {
					audio: 'mengqiyi',
					trigger: {
						player: 'damageEnd'
					},
					filter(event, player) {
						return player.countCards("hes", card => {
							let cardx = get.autoViewAs({ name: 'tuixinzhifu' }, [card]);
							return get.suit(card) == 'heart' && player.hasUseTarget(cardx)
						})
					},
					async cost(event, trigger, player) {
						event.result = await player.chooseCardTarget({
							prompt: '将一张♥牌当【推心置腹】使用',
							filterCard(card) {
								let cardx = get.autoViewAs({ name: 'tuixinzhifu' }, [card]);
								return get.suit(card) == 'heart' && player.hasUseTarget(cardx)
							},
							position: 'hes',
							filterTarget(card, player, target) {
								let cardx = get.autoViewAs({ name: 'tuixinzhifu' }, [card]);
								return lib.filter.targetEnabled(cardx, player, target);
							},
							ai1(card) {
								return 8 - get.value(card);
							},
							ai2(target) {
								return get.effect(target, { name: "tuixinzhifu" }, player, player);
							},
						}).forResult()
					},
					async content(event, trigger, player) {
						player.useCard(get.autoViewAs({ name: 'tuixinzhifu' }, event.cards), event.cards, event.targets[0])
					},
				}
			},
			derivation: 'mengqianmeng',
		},
		mengqianmeng: {
			audio: 3,
			skillAnimation: true,
			animationColor: "green",
			juexingji: true,
			trigger: {
				player: "phaseEnd",
			},
			forced: true,
			filter(event, player) {
				return !player.storage.mengqianmeng
			},
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				for (let current of game.filterPlayer()) {
					await current.changeCardTo(current.meng_mengjianyueruixi?.[0])
					await game.changeHpTo(current, current.meng_mengjianyueruixi?.[1])
				}
				let list = lib.character[player.name][3];
				player.clearSkills(...list)
			},
		},
		mengqiyi_info: '绮呓|你对本回合失去过牌的角色使用牌无距离限制。出牌阶段或你受到伤害后，你可以将一张♥牌当【推心置腹】使用，然后你可以将因此获得的♥牌当【调剂盐梅】使用，然后你可以将因此获得的♥牌当【树上开花】使用，然后你可以分配本回合弃牌堆中的♥牌并令获得的角色获得“千梦”。',
		mengqianmeng_info: '千梦|觉醒技，回合结束时，所有角色将手牌数与体力值调整至本回合开始时，然后你失去非武将牌上的技能。',

		meng_saifeier: ['赛飞儿', ['female', 'hyyz_xt', 3, ['mengfanfei'], []], '偷天换日-流萤一生推', ''],
		mengfanfei: {
			audio: 4,
			limited: true,
			skillAnimation: true,
			animationColor: "metal",
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => (player.storage[skill] = false),
			trigger: {
				global: 'roundStart'
			},
			filter(event, player) {
				return player.countCards('h')
			},
			async cost(event, trigger, player) {
				const { numbers } = await player.chooseNumbers([
					{
						prompt: get.prompt('mengfanfei') + '<br>将一张手牌置于牌堆顶第x张',
						min: 1,
						max: game.countPlayer()
					}
				])
					.set("processAI", () => {
						return [get.event().maxNum];
					})
					.set("maxNum", game.countPlayer())
					.forResult();
				if (numbers && numbers[0] > 0) {
					event.result = {
						bool: true,
						cost_data: numbers
					}
				}
			},
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				let No = event.cost_data[0];
				const { cards } = await player.chooseCardToPile()
					.set('No', No)
					.set('prompt', '将一张手牌置于牌堆顶第' + No + '张')
					.forResult()
				player.addSkill('mengfanfei2')
				player.storage.mengfanfei2 = cards[0]
				player.addTempSkills(['old_guhuo', 'xinshensu'], { player: 'dammageEnd' });

				player.when({
					player: 'phaseAfter'
				}).filter((event, player) => event.player == player).then(() => {
					player.insertPhase('mengfanfei')
				})
			},
			ai: {
				threaten: 1.3,
			},
		}, mengfanfei2: {
			audio: 'mengfanfei',
			mod: {
				playerEnabled(card, player, target) {
					if (_status.event.getParent('phase').skill == 'meng_fanfei') {
						if (player.next = !target) return false;
					}
				}
			},
			trigger: {
				global: "loseEnd",
				player: 'gainAfter'
			},
			filter(event, player) {
				if (event.name == 'gain') return event.getg(player).some(i => i == player.storage.mengfanfei2)
				if (event.getParent().name == "useCard") return false;
				return event.cards.some(i => i == player.storage.mengfanfei2 && get.position(i) == "d");
			},
			charlotte: true,
			forced: true,
			async content(event, trigger, player) {
				if (trigger.name == 'gain') {
					player.restoreSkill('mengfanfei');
					delete player.storage.mengfanfei2
				} else {
					await player.damage();
					await player.gain(player.storage.mengfanfei2, 'gain2')
				}
			},
		},
		mengfanfei_info: '翻飞|限定技，每轮开始时，你可以将一张手牌置于牌堆顶任意位置（不超过存活角色数)。至你受到伤害前，你视为拥有〖蛊惑〗和〖神速〗且一名其他角色回合开始时，你执行一个仅能对其使用牌的额外回合。当此牌进入弃牌堆，你受到一点伤害并获得此牌。你获得此牌后视为此技能未发动。',
	},
	2507: {},
}, dynamicTranslates = {
	//双面武将
	hyyz_dualside(player) {
		if (player.storage.hyyz_dualside) {
			if (player.name == player.storage.hyyz_dualside[0] || player.name2 == player.storage.hyyz_dualside[0]) return '当前处于正面';
			if (player.name == player.storage.hyyz_dualside[3] || player.name2 == player.storage.hyyz_dualside[3]) return '当前处于反面';
		}
		return '这是一个双面武将，其他技能均为不同状态下各自独立生效的技能'
	},
	//米雅莉
	mengxingshi(player) {
		if (player.storage.mengxunfeng) {
			return '锁定技，你摸牌时，改为从<span class="bluetext">牌堆顶</span>;你使用牌时，展示<span class="bluetext">牌堆底</span>的牌;若花色与使用的牌相同，你将其交给一名角色，否则将使用的牌置于<span class="bluetext">牌堆底</span>'
		}
		return '锁定技，你摸牌时，改为从<span class="bluetext">牌堆底</span>;你使用牌时，展示<span class="bluetext">牌堆顶</span>的牌;若花色与使用的牌相同，你将其交给一名角色，否则将使用的牌置于<span class="bluetext">牌堆顶</span>'
	},
	//停云
	menghuqi(player) {
		if (player.storage.menghuqi) return '出牌阶段限1次或当你进入濒死状态时，你可以摸[' + player.storage.menghuqi + ']张牌，并交给1名角色1张牌。然后你下一次造成伤害时摸[' + player.storage.menghuqi + ']张牌。其下一次造成伤害时令你以此法的[摸牌数]+1。'
		return '出牌阶段限1次或当你进入濒死状态时，你可以摸[1]张牌，并交给1名角色1张牌。然后你下一次造成伤害时摸[1]张牌。其下一次造成伤害时令你以此法的[摸牌数]+1。'
	},
	//柏妮丝
	mengyanji(player) {
		if (player.storage.mengrongyan2) return '锁定技，当[存活角色]造成或受到伤害时，所有角色需依次重铸所有牌。';
		return '锁定技，当[你]造成或受到伤害时，所有角色需依次重铸所有牌。'
	},
	mengrongyan(player) {
		if (player.storage.mengrongyan2) return '熔焰|昂扬技，出牌阶段，[存活角色]可令一名角色视为使用一张【火攻】，此牌造成伤害后，将武将牌上技能中的[你]改为“存活角色”，直到本轮结束。激昂：牌堆刷新时'
		return '熔焰|昂扬技，出牌阶段，[你]可令一名角色视为使用一张【火攻】，此牌造成伤害后，将武将牌上技能中的[你]改为“存活角色”，直到本轮结束。激昂：牌堆刷新时'
	},
	//流萤
	mengxunmeng(player) {
		if (player.storage.mengxunmeng) return '当你不因此效果获得牌时，你摸一张牌，然后你展示所有手牌并选择一种花色，你弃置该花色的所有牌。当你的手牌花色均相同且数量不小于<span class="firetext">' + player.storage.mengxunmeng + '</span>时，你可以展示所有手牌并对一名其他角色造成一点伤害，然后令此句首个数字+1并重铸所有手牌。'
		return '当你不因此效果获得牌时，你摸一张牌，然后你展示所有手牌并选择一种花色，你弃置该花色的所有牌。当你的手牌花色均相同且数量不小于1时，你可以展示所有手牌并对一名其他角色造成一点伤害，然后令此句首个数字+1并重铸所有手牌。'
	},
	//缇宝
	mengxunhuan(player) {
		let index = lib.translate['mengxunhuan_info'].indexOf('阳');
		let str = lib.translate['mengxunhuan_info'].slice(0, index);
		if (player.storage.mengxunhuan) {
			return str += `阳：将手牌数调整至护甲值，<span class='bluetext'>阴：将护甲值调整至手牌数。</span>`
		} else {
			return str += `<span class='legendtext'>阳：将手牌数调整至护甲值，</span>阴：将护甲值调整至手牌数。`
		}
	},
	mengchenyv(player) {
		let index = lib.translate['mengchenyv_info'].indexOf('阳');
		let str = lib.translate['mengchenyv_info'].slice(0, index);
		if (player.storage.mengchenyv) {
			return str += `阳：令之本轮与此技能交换位置。<span class='bluetext'>阴：令之本轮视为持恒技。</span>`
		} else {
			return str += `<span class='legendtext'>阳：令之本轮与此技能交换位置。</span>阴：令之本轮视为持恒技。`
		}
	},
	mengfeixiang(player) {
		let index = lib.translate['mengfeixiang_info'].indexOf('阳');
		let str = lib.translate['mengfeixiang_info'].slice(0, index);
		if (player.storage.mengfeixiang) {
			return str += `阳：摸两张牌。<span class='bluetext'>阴：获得1点护甲。</span>`
		} else {
			return str += `<span class='legendtext'>阳：摸两张牌。</span>阴：获得1点护甲。`
		}
	},
	//银枝
	mengketi(player) {
		if (player.storage.mengketi) {
			const storage = player.storage.mengketi;
			return `锁定技，你的手牌点数加<span class='greentext'>[${storage[0]}]</span>（至多为<span class='firetext'>[${storage[1]}]</span>）；你点数大于14-<span class='bluetext'>[${storage[2]}]</span>的手牌不计入手牌上限。`
		}
		return '锁定技，你的手牌点数加[1]（至多为[14]）；你点数大于14-[1]的手牌不计入手牌上限。'
	}
};
export { characters, dynamicTranslates }
