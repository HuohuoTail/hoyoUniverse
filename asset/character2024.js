'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/**@type { SMap <SMap <Skill | [String, Character, String, String ]>> } */
const characters = {
	2401: {
		hyyz_ruanmei: ['阮·梅', ["female", "hyyz_xt", 3, ["hyyzpeiyu", "hyyznicha"], []], '#b做的好，就有「奖励」哦！', '气质温婉优雅的学者，「天才俱乐部」#81号会员，生命科学领域的专家。<br>凭借天赋与惊人的执著得到了博识尊的瞩目，在秘密的角落开始了对生命本源的研究与探索。<br>并因此被黑塔邀请，同螺丝咕姆、斯蒂芬联合开发了「模拟宇宙」。<br>私下里，她十分喜爱传统戏剧与点心，对刺绣也很感兴趣。'],
		hyyzpeiyu: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			chooseButton: {
				dialog(event, player) {
					const choice1 = [
						'锁定技，每回合限1次。你获得牌后，',
						'锁定技，每回合限1次。你受到伤害后，',
						'锁定技，每回合限1次。你造成伤害后，'
					], choice2 = [
						'摸2张牌。',
						'回复1点体力。',
						'对一名其他角色造成1点伤害。',
					];
					let dialog = ui.create.dialog('培育：〖造物〗合成ing', 'hidden');
					dialog.addText('父本（时机）');
					dialog.add([choice1, 'textbutton']);
					dialog.addText('母本（效果）');
					dialog.add([choice2, 'textbutton']);
					return dialog;
				},
				filter(button, player) {
					const choice1 = [
						'锁定技，每回合限1次。你获得牌后，',
						'锁定技，每回合限1次。你受到伤害后，',
						'锁定技，每回合限1次。你造成伤害后，'
					], choice2 = [
						'摸2张牌。',
						'回复1点体力。',
						'对一名其他角色造成1点伤害。',
					];
					if (ui.selected.buttons.length) {
						let on = ui.selected.buttons[0].link;
						return choice1.includes(on) && choice2.includes(button.link) || choice2.includes(on) && choice1.includes(button.link);
					}
					return true;
				},
				select: 2,
				backup(links, player) {
					var next = get.copy(lib.skill["hyyzpeiyu_backupx"]);
					next.links = links;
					return next;
				}
			},
			subSkill: {
				backup: {},
				backupx: {
					audio: "hyyzpeiyu",
					filterCard: () => false,
					selectCard: -1,
					async content(event, trigger, player) {
						const links = lib.skill.hyyzpeiyu_backup.links, choice1 = [
							'锁定技，每回合限1次。你获得牌后，',
							'锁定技，每回合限1次。你受到伤害后，',
							'锁定技，每回合限1次。你造成伤害后，'
						], choice2 = [
							'摸2张牌。',
							'回复1点体力。',
							'对一名其他角色造成1点伤害。',
						];
						game.countPlayer(async function (current) {
							if (current.hasSkill('hyyzzaowu')) await current.removeSkills(['hyyzzaowu']);
						});
						if (links[1].includes('锁定技')) links.reverse();
						const time = choice1.indexOf(links[0]);
						const func = choice2.indexOf(links[1]);
						if (func != undefined) {
							const color = await player.judge().forResult('color');
							if (color) {
								let hyyzzaowu = lib.skill.hyyzzaowu;
								hyyzzaowu.usable = (color == 'black' ? 2 : 1);//定义使用次数
								hyyzzaowu.trigger[time == 2 ? 'source' : 'player'].add(['gainAfter', 'damageEnd', 'damageSource'][time]);//定义时机
								const hyyzzaowu_info =
									`锁定技，每回合限${color == 'black' ? '2' : '1'}次。
							你${['获得牌', '受到伤害', '造成伤害'][time]}后，
							${func == 0 ? '摸' + (color == 'red' ? '3' : '2') + '张牌' : func == 1 ? '回复' + (color == 'red' ? '2' : '1') + '点体力' : '对一名其他角色造成' + (color == 'red' ? '2' : '1') + '点伤害。'}`;//翻译设定
								lib.translate.hyyzzaowu_info = hyyzzaowu_info;
								lib.skill.hyyzzaowu = hyyzzaowu;
								const targets = await player
									.chooseTarget('选择获得〖造物〗的角色', lib.translate.hyyzzaowu_info, true)
									.set('ai', function (target) {
										var player = _status.event.player;
										let att = get.attitude(player, target);
										if (target != player) att *= 10;
										return att;
									})
									.forResultTargets();
								if (targets) {
									player.line(targets, 'green');
									targets[0].addTempSkills('hyyzzaowu', { player: 'dieAfter' });
									targets[0].storage.hyyzzaowu = [func, color == 'red'];
								}
							}
						}
					},
				}
			},
			ai: {
				order: 5,
				result: {
					player: 2,
				}
			},
			derivation: "hyyzzaowu",
		},
		hyyzpeiyu_info: `培育|出牌阶段限一次，你可以清除场上的造物，然后在父母本中各选一项并进行判定。若结果为黑/红色，令父/母本中的数字+1。你将以上组合为技能〖造物〗并令一名角色获得之。<br><span style="font-family: yuanli">父本：<br>①锁定技，每回合限1次。你获得牌后，<br>②锁定技，每回合限1次。你受到伤害后，<br>③锁定技，每回合限1次。你造成伤害后，<br>母本：<br>①摸2张牌。<br>②回复1点体力。<br>③对一名其他角色造成1点伤害。</span>`,
		hyyzzaowu: {
			audio: 1,
			unique: true,
			onremove(player) {
				delete player.storage.hyyzzaowu;
			},
			mark: true,
			marktext: '造',
			intro: {
				name: lib.translate.hyyzzaowu,
				content: () => lib.translate.hyyzzaowu_info,
			},
			trigger: {
				player: [],
				source: [],
			},
			forced: true,
			charlotte: true,
			async content(event, trigger, player) {
				const num = player.getStorage('hyyzzaowu')[1] ? 1 : 0;
				switch (player.getStorage('hyyzzaowu')[0]) {
					case 0: await player.draw(2 + num); return;
					case 1: await player.recover(1 + num); return;
					case 2: {
						const { result: { targets } } = await player.chooseTarget('造物：造成' + (1 + num) + '点伤害', true).set('ai', (target) => -get.attitude(player, target));
						if (targets) {
							player.line(targets[0], 'fire');
							targets[0].damage(num + 1, player);
						}
					}
				};
			},
		},
		hyyzzaowu_info: '造物|一个尚未出生的孩子...',
		hyyznicha: {
			audio: 2,
			trigger: {
				global: 'hyyzzaowuAfter',
			},
			filter(event, player) {
				return event.player != player && event.player.storage.hyyzzaowu;
			},
			forced: true,
			async content(event, trigger, player) {
				switch (trigger.player.getStorage('hyyzzaowu')[0]) {
					case 0: {
						player.recover();
						const { result: { targets } } = await player.chooseTarget('造物：造成1点伤害', true)
							.set('ai', (target) => -get.attitude(player, target));
						if (targets) {
							player.line(targets, 'fire');
							targets[0].damage(1, player);
						}
						break;
					}
					case 1: {
						player.draw(2);
						const { result: { targets } } = await player.chooseTarget('造物：造成1点伤害', true)
							.set('ai', (target) => -get.attitude(player, target));
						if (targets) {
							player.line(targets, 'fire');
							targets[0].damage(1, player);
						}
						break;
					}
					case 2: {
						player.recover();
						player.draw(2);
						break;
					}
				};
			},
		},
		hyyznicha_info: "匿察|锁定技，其他角色发动〖造物〗后，你执行未组成此〖造物〗的其他母本。",

		hyyz_yinzhi: ['银枝', ["male", "hyyz_xt", 4, ["hyyzxinyang", "hyyzximei"], []], '#b您是否认为<br>纯美的女神「伊德莉拉」美貌盖世无双？', '他为人正直、光明磊落，高贵的天性令人敬佩——一位游走宇宙间的独行者，坚定践行「纯美」。维护「纯美」在宇宙间的名誉，是银枝的职责：履行这一义务，起手需虔诚，落枪时则将要令人心悦诚服。'],
		hyyzxinyang: {
			audio: 4,
			group: ['hyyzxinyang_gain', 'hyyzxinyang_lose'],
			subSkill: {
				gain: {
					audio: 'hyyzxinyang',
					trigger: {
						player: 'gainBefore',
						target: 'gift',
					},
					forced: true,
					priority: Infinity,
					firstDo: true,
					filter(event, player) {
						if (event.giver == player) return false;
						if (event.name == 'gift') return event.target != player;
						if (event.source && event.source == player) return false;
						return event.getParent(2).name != 'hyyzxinyang_gain';
					},
					content: function () {
						'step 0'
						if (trigger.getParent(2).name == 'useCard') {
							trigger.getParent(2).targets.remove(player);
							trigger.getParent(2).excluded.add(player);
						};
						if (trigger.name == 'gift') {
							trigger.deniedGift.add(trigger.card);
							trigger.deniedGifts = trigger.cards;
						}
						'step 1'
						var cards = trigger.cards;
						if (get.owner(cards[0])) get.owner(cards[0]).discard(cards);
						game.cardsDiscard(cards);
						'step 2'
						if (trigger.name == 'gain' && trigger.getg(player).length) {
							//trigger.getg(player) = [];
							player.loseToDiscardpile(trigger.cards);
						}
						'step 3'
						trigger.cancel();
						game.log('#g【信仰】', player, '放弃获得' + (trigger.source ? (get.translation(trigger.source) + '的') : ''), trigger.cards, '，改为摸两张牌');
						'step 4'
						if (trigger.bool) trigger.bool = false;
						if (trigger.cards) trigger.cards = [];
						if (trigger.links) trigger.links = [];
						if (trigger.buttons) trigger.buttons = {};
						player.draw(2);
					},
					ai: {
						refuseGifts: true,
					}
				},
				lose: {
					audio: 'hyyzxinyang',
					trigger: {
						global: ["rewriteDiscardResult", "rewriteGainResult", "gainBefore"],
						player: ['loseBefore'],
					},
					forced: true,
					priority: Infinity,
					firstDo: true,
					filter(event, player) {
						if (!player.countCards('h') || !event.cards || !event.cards.length) return false;
						if (_status.currentPhase == player) return false;
						if (event.name != 'lose' && event.player == player) return false;
						if (event.getParent(3).name == 'hyyzxinyang_lose') return false;
						if (event.name == 'gain') {
							return player.getCards('hes').some(card => card == event.cards[0]);
						} else {
							return event.name == 'lose' || event.player != player && event.target == player;
						}
					},
					content: function () {
						'step 0'
						if (trigger.getParent(2).name == 'useCard') {
							trigger.getParent(2).targets.remove(player);
							trigger.getParent(2).excluded.add(player);
						}
						'step 1'
						if (['gainPlayerCard', 'discardPlayerCard'].includes(trigger.name) && trigger.getParent(2).result) {
							trigger.getParent(2).result.bool = false;
							trigger.getParent(2).result.buttons = {};
							trigger.getParent(2).result.links = [];
							trigger.getParent(2).result.cards = [];
						};
						'step 2'
						if (trigger.result) {
							trigger.result.bool = false;
							trigger.result.cards = [];
							trigger.result.links = [];
							trigger.result.buttons = {};
						};
						if (trigger.name == 'lose') {
							var evt = trigger.getl(player);
							if (evt && evt.cards2 && evt.cards2.length > 0) {
								evt.hs = [];
								evt.hs = [];
								evt.es = [];
								evt.js = [];
								evt.ss = [];
								evt.xs = [];
							};
						}
						'step 3'
						if (trigger.bool) trigger.bool = false;
						if (trigger.cards) trigger.cards = [];
						if (trigger.links) trigger.links = [];
						if (trigger.buttons) trigger.buttons = {};
						'step 4'
						trigger.cancel();
						'step 5'
						player.chooseToDiscard(true, 'he');
						trigger.untrigger();
					},

				},
			},
		},
		hyyzxinyang_info: "信仰|锁定技，你不因此法获得牌时，改为摸两张牌；你于回合外不因此法失去牌时，改为弃一张牌。",
		hyyzximei: {
			audio: 3,
			trigger: {
				global: 'damageBegin4'
			},
			filter(event, player) {
				return player.inRange(event.player) && event.player != player;
			},
			async cost(event, trigger, player) {
				let list = [];
				if (trigger.source && player.canUse({ name: 'juedou' }, trigger.source)) list.add(trigger.source);
				if (trigger.player && player.canUse({ name: 'juedou' }, trigger.player)) list.add(trigger.player);
				let str = `邀决：[${get.translation(trigger.player)}]即将受到${trigger.source ? `[${get.translation(trigger.source)}]造成的` : ''}伤害`, str2 = `改为对[${get.translation(list[0])}]${list.length > 1 ? `或[${get.translation(list[1])}]` : ''}视为使用【决斗】<br>结算后，打出【杀】者摸牌；体力低者回血`;
				const result = await player.chooseTarget(str, str2, (card, player, target) => list.includes(target))
					.set('ai', function (target) {
						var player = _status.event.player;
						var att = get.attitude(player, target);
						if (att > 0) {
							return target.hp <= player && target.hp > 1;
						} else {
							return target.hp > player && player.hp > 1;
						}
					})
					.forResult();
				event.result = result;
			},
			usable: 1,
			logTarget: 'targets',
			async content(event, trigger, player) {
				trigger.cancel();
				player.useCard({ name: 'juedou' }, event.targets);
			},
			group: 'hyyzximei_dam',
			subSkill: {
				dam: {
					trigger: {
						player: 'useCardAfter',
					},
					filter: function (event, player) {
						return event.getParent().name == 'hyyzximei';
					},
					direct: true,
					async content(event, trigger, player) {
						const num0 = trigger.player.hp, num1 = trigger.targets[0].hp;
						game.hasPlayer(function (current) {
							if (current.getHistory('respond', evt => evt.respondTo[1] && evt.respondTo[1] == trigger.card).length > 0) {
								current.draw();
							}
						})
						if (num0 >= num1) await trigger.targets[0].recover();
						if (num0 <= num1) await trigger.player.recover();
					}
				}
			},
			ai: {
				threaten: 3,
			}
		},
		hyyzximei_info: "惜美|每回合限一次。你攻击范围内的其他角色受到伤害时，你可以改为对伤害来源或该角色视为使用【决斗】。结算结束后，因此打出过【杀】的角色摸一张牌，体力值最低的角色回复1点体力。",


		meng_aiyi: ['爱衣', ["female", "hyyz_b3", 3, ["mengmiaobu", "mengyansuan"], []], '浮生', ''],
		mengmiaobu: {
			audio: 5,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengmiaobu1.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengmiaobu2.mp3",
			],
			intro: {
				content(storage, player) {
					if (player == game.me || player.isUnderControl()) {
						var str = '记录的牌名：';
						for (var i of storage) {
							str += get.translation(i);
							if (storage.length > 1 && i != storage[storage.length - 1]) str += '、';
						}
						if (player.storage.mengmiaobu_log > 0) str += ('<br>发动瞄捕②的次数为' + player.storage.mengmiaobu_log);
						return str;
					} else {
						return '共记录了' + storage.length + '张牌名'
					}
				},
			},
			trigger: {
				global: "roundStart",
			},
			filter: function (event, player) {
				return player.countCards('he') >= 0 && player.getStorage('mengmiaobu').length < 3;
			},
			async cost(event, trigger, player) {
				player.storage.mengmiaobu_log = 0;
				event.result = await player
					.chooseToDiscard(get.prompt2('mengmiaobu'), 'he', [1, 3 - player.getStorage('mengmiaobu').length])
					.set('ai', (card) => 10 - get.value(card))
					.forResult();
			},
			async content(event, trigger, player) {
				var num = event.cards.length;

				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
					else if (get.type(name) == 'basic') list.push(['基本', '', name]);
				}
				var next = player.chooseButton([
					'瞄捕①：请选择至多' + num + '个牌名',
					[list, 'vcard'],
				]);
				next.set('forced', true);
				next.set('selectButton', [1, num]);
				next.set('filterButton', function (button) {
					var name = button.link[2];
					if (player.getStorage('mengmiaobu').includes(name)) return false;
					return true;
				});
				next.set('ai', function (button) {
					var val = _status.event.player.getUseValue({ name: button.link[2] });
					if (['sha', 'shan', 'tao'].includes(button.link[2])) val += 20;
					return val;
				});
				const links = await next.forResultLinks();
				if (links) {
					var names = links.map(i => i[2]);
					player.markAuto('mengmiaobu', names);
				}
			},
			group: "mengmiaobu_log",
			subSkill: {
				log: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/meng/audio/mengmiaobu3.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengmiaobu4.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengmiaobu5.mp3",
					],
					init(player) {
						player.storage.mengmiaobu_log = 0;
					},
					trigger: {
						global: "useCard",
					},
					filter(event, player) {
						return player.getStorage('mengmiaobu').length > 0 && player.getStorage('mengmiaobu').includes(event.card.name);
					},
					async cost(event, trigger, player) {
						var list = [
							'令' + get.translation(trigger.card) + '无效',
							'为' + get.translation(trigger.card) + '增加或减少一个目标',
							'摸两张牌并弃置' + get.translation(_status.currentPhase) + '区域内的一张牌',
						];
						for (var i = 0; i < list.length; i++) {
							list[i] = [i, list[i]];
						}
						var next = player.chooseButton([
							'瞄捕②：选择一项并移除【' + get.translation(trigger.card.name) + '】',
							[list.slice(0, 1), 'tdnodes'],
							[list.slice(1, 2), 'tdnodes'],
							[list.slice(2, 3), 'tdnodes'],
						]);
						var effect = 0;
						if (trigger.card.name == 'wuxie' || trigger.card.name == 'shan') {
							if (get.attitude(player, trigger.player) < -1) {
								effect = -1;
							}
						}
						else if (trigger.targets && trigger.targets.length) {
							for (var i = 0; i < trigger.targets.length; i++) {
								effect += get.effect(trigger.targets[i], trigger.card, trigger.player, player);
							}
						}
						next.set('eff', effect);
						next.set('ai', function (button) {
							if (_status.event.eff < 0) return button.link == 0;
							return button.link == 2;
						});
						const links = await next.forResultLinks();
						if (links) {
							event.result = {
								bool: true,
								cost_data: {
									links: links
								}
							}
						}
					},
					async content(event, trigger, player) {
						const links = event.cost_data.links;

						player.storage.mengmiaobu_log++;
						player.unmarkAuto('mengmiaobu', [trigger.card.name]);
						if (links[0] == 0) {
							trigger.targets.length = 0;
							trigger.all_excluded = true;
						} else if (links[0] == 1) {
							var str = '请选择' + get.translation(trigger.card) + '的额外目标或取消目标';
							const targets = await player
								.chooseTarget(str, function (card, player, target) {
									var player = _status.event.players;
									return lib.filter.targetEnabled2(_status.event.card, player, target) && lib.filter.targetInRange(_status.event.card, player, target);
								})
								.set('card', trigger.card).set('ai', function (target) {
									var trigger = _status.event.getTrigger();
									var player = _status.event.players;
									return get.effect(target, trigger.card, player, player);
								})
								.set('targets', trigger.targets).set('players', trigger.player)
								.forResultTargets();
							if (targets) {
								if (trigger.targets.includes(targets[0])) {
									game.log('#g【瞄捕】', targets, '移出', trigger.card, '的目标')
									trigger.targets.remove(targets[0]);
								} else {
									game.log('#g【瞄捕】', targets, '成为', trigger.card, '的额外目标')
									trigger.targets.addArray(targets);
								}
							}
						} else if (links[0] == 2) {
							await player.draw(2);
							await player.discardPlayerCard(_status.currentPhase, 'hej', true);
						}
					},
				},
			},
		},
		mengyansuan: {
			audio: 3,
			logAudio(event, player) {
				switch (player.storage.mengmiaobu_log) {
					case 1: return ['ext:忽悠宇宙/asset/meng/audio/mengyansuan1.mp3']
					case 2: return ['ext:忽悠宇宙/asset/meng/audio/mengyansuan2.mp3']
					default: return ['ext:忽悠宇宙/asset/meng/audio/mengyansuan3.mp3']
				}
			},
			trigger: {
				player: "phaseBegin",
			},
			frequent: true,
			filter: function (event, player) {
				return player.storage.mengmiaobu_log && player.storage.mengmiaobu_log > 0;
			},
			content: function () {
				'step 0'
				var num = player.storage.mengmiaobu_log;
				if (num > 0) {
					player.draw(num);
				}
				if (num > 1) {
					player.addTempSkill('mengyansuan_1');
				}
				if (num > 2) {
					player.chooseTarget([1, num], '弃置至多' + num + '名其他角色的各一张牌', function (card, player, target) {
						return target != player && target.countDiscardableCards(player, 'he') > 0;
					}).ai = function (target) {
						var player = _status.event.player;
						return get.effect(target, { name: 'guohe' }, player, player);
					};
				}
				'step 1'
				if (result.bool && result.targets.length > 0) {
					result.targets.sortBySeat();
					event.targets = result.targets;
					player.line(result.targets, 'green');
					player.logSkill('mengyansuan', result.targets);
				}
				else event.finish();
				'step 2'
				event.current = targets.shift();
				player.discardPlayerCard(event.current, 'he', true)
				event.current.addTempSkill('mengyansuan_2');
				if (targets.length) event.redo();
			},
			subSkill: {
				"1": {
					mark: true,
					intro: {
						content: function (storage, player) {
							return "无距离和次数限制，且手牌上限+" + player.storage.mengmiaobu_log
						},
					},
					mod: {
						targetInRange: function (card, player, target) {
							return true;
						},
						cardUsable: function (card, player) {
							return Infinity;
						},
						maxHandcard: function (player, num) {
							if (player.storage.mengmiaobu_log && player.storage.mengmiaobu_log > 0) return num + player.storage.mengmiaobu_log;
						},
					},
					sub: true,
					"_priority": 0,
				},
				"2": {
					mark: true,
					intro: {
						content: "受到的火焰伤害+1",
					},
					trigger: {
						global: "damageBegin3",
					},
					filter: function (event) {
						return event.nature == 'fire' || event.hasNature('fire');
					},
					charlotte: true,
					forced: true,
					logTarget: "player",
					content: function () {
						trigger.num++;
					},
					ai: {
						effect: {
							target: function (card, player, target, current) {
								if (get.tag(card, 'fireDamage') && current < 0) return 1.5;
							},
						},
					},
					"_priority": 0,
					sub: true,
				},
			},
		},
		meng_old_xinyanzhilvzhe: ['薪炎之律者', ["female", "hyyz_b3", 4, ["mengliaohuang", "mengjingmang"], ['die:meng_xinyanzhilvzhe']], '拾壹', ''],//
		mengliaohuang: {
			audio: "mengweizhu",
			trigger: {
				global: "damageEnd",
			},
			usable: 3,
			filter: function (event, player) {
				return event.nature && (['fire', 'thunder'].includes(event.nature) || event.lianhuanable == true);
			},
			list: [["diamond", "1", "huogong"], ["spade", "1", "fulei"], ["club", "1", "tiesuo"]],
			frequent: true,
			content: function () {
				'step 0'
				var list = [];
				if (trigger.nature == 'fire') list.push(lib.skill.mengliaohuang.list[0]);
				if (trigger.nature == 'thunder') list.push(lib.skill.mengliaohuang.list[1]);
				if (trigger.lianhuanable == true) list.push(lib.skill.mengliaohuang.list[2]);
				event.list = list;
				'step 1'
				if (event.list.length > 0) {
					var cardx = event.list.shift();
					event.cards = [ui.create.card(), ui.create.card()];
					event.cards[0].init(cardx);
					event.cards[1].init(cardx);
					if (trigger.source && trigger.source.isAlive()) player.chooseBool('将' + get.translation(cardx[2]) + '交给' + get.translation(trigger.source) + '，或点取消置入牌堆').set('ai', () => get.attitude(player, trigger.source) > 0);
					else event._result = { bool: false };
				} else event.finish();
				'step 2'
				if (result.bool) {
					trigger.source.gain(event.cards, 'gain2');
					game.delay();
				} else {
					game.log(player, '将', event.cards, '随机插入牌堆');
					while (event.cards.length) ui.cardPile.insertBefore(event.cards.shift().fix(), ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
					game.updateRoundNumber();
					game.delayx();
				}
				event.goto(1);
			},
			"_priority": 0,
		},
		mengjingmang: {
			audio: "mengbinye",
			unique: true,
			enable: "phaseUse",
			filter: function (event, player) {
				return !player.storage.mengjingmang;
			},
			limited: true,
			skillAnimation: "epic",
			animationColor: "fire",
			filterTarget: function (card, player, target) {
				return target.countCards('h') >= player.countCards('h');
			},
			selectTarget: -1,
			multitarget: true,
			multiline: true,
			content: function () {
				"step 0"
				player.awakenSkill('mengjingmang');
				player.storage.mengjingmang = true;
				event.currents0 = targets;//存储！
				event.currents = targets;//存储！
				event.not = [];//被选过的选项123
				"step 1"
				if (event.currents.length > 0) event.current = event.currents.shift();
				else event.finish();
				"step 2"
				if (event.current.countCards('h') > 0) {
					game.log(event.current, '：<font color=#FF4500>战争尚未结束！</font>');
					event.current.animate('target');
					var dialog = ['选择要使用的牌'];//窗口
					dialog.push('<div class="text center">你的手牌</div>');
					dialog.add(event.current.getCards('h'));
					var control = {
						1: [['锦囊', '', 'tiesuo'], ['锦囊', '', 'guohe']],//一个牌组list,[list,'vcard']
						2: [['基本', '', 'sha', 'fire'], ['基本', '', 'sha', 'thunder']],
						3: [['锦囊', '', 'juedou'], ['锦囊', '', 'wugu']],
					};
					if (event.not.length) for (let count of event.not) if (control[count]) delete control[count];
					for (let count in control) {//构筑
						dialog.push('<div class="text center">选项' + get.translation(count) + '</div>');
						dialog.push([control[count], 'vcard']);
					}
					event.current.chooseButton(true, dialog).set('filterButton', function (button) {
						if (!ui.selected.buttons.length) return true;
						var current = _status.event.player;
						var map = { hand: [], name: [] };
						var map2 = [['tiesuo', 'guohe'], ['sha'], ['juedou', 'wugu']];
						if (ui.selected.buttons.length) {
							for (var i = 0; i < ui.selected.buttons.length; i++) {
								var ui_button = ui.selected.buttons[i].link;
								if (current.getCards('h').includes(ui_button)) {
									map['hand'].push(ui_button);
								} else {
									map['name'].push(ui_button[2]);
									for (var j of map2) {
										if (j.includes(ui_button[2]) && j.includes(button.link[2])) {
											return false;
										}
									}
								}
							}
							if (map['hand'].length >= _status.event.hs && current.getCards('h').includes(button.link)) return false;
						}
						return true;
					}).set('selectButton', [2, event.current.countCards('h') * 2]).set('hs', Object.keys(control).length).set('filterOk', function () {
						if (!ui.selected.buttons.length) return false;
						let current = _status.event.player;
						let map = { true: 0, false: 0 };
						if (ui.selected.buttons.length) {
							for (let i = 0; i < ui.selected.buttons.length; i++) {
								map[current.getCards('h').includes(ui.selected.buttons[i].link)]++;
							}
						}
						return map['true'] == map['false'];
					});
				} else {
					event.goto(1);
				}
				"step 3"
				var map = result.links, names = [], cards = [];
				for (var i = 0; i < map.length; i++) {
					event.current.getCards('h').includes(map[i]) ? cards.push(map[i]) : names.push(map[i]);
				};
				for (var k of names) {
					if (['tiesuo', 'guohe'].includes(k[2])) event.not.push(1);
					if (k[2] == 'sha') event.not.push(2);
					if (['juedou', 'wugu'].includes(k[2])) event.not.push(3);
				};
				if (event.not.length >= 3) {
					event.not = [];
					if (player.hasSkill('mengliaohuang')) {
						game.log('#g【旌芒】', '重置', '#g【燎荒】');
						if (player.storage.counttrigger && player.storage.counttrigger.mengliaohuang && player.storage.counttrigger.mengliaohuang > 0) player.storage.counttrigger.mengliaohuang = 0;
					}
				}
				for (var j = 0; j < cards.length; j++) {
					var use_targets = event.currents0.filter((target) => target != event.current && target.isIn());
					if (use_targets.length > 0) {
						event.current.useCard({ name: names[j][2], nature: names[j][3] }, [cards[j]], use_targets);
					}
					else {
						event.goto(1);
						//event.current.loseToDiscardpile(cards[j]).log = false;
					}
				};
				"step 4"
				game.delay(0.5);
				event.goto(1);
			},
			ai: {
				order: 1,
				result: {
					target(player, target) {
						if (lib.config.mode == 'identity' && game.zhu.isZhu && player.identity == 'fan') {
							if (game.zhu.hp <= 2 && game.zhu.countCards('h') >= player) return 100;
						};
						if (player != target) return -10;
					},
				},
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => player.storage[skill] = false,
			"_priority": 0,
		},
		meng_jingyuan: ['景元', ["male", "hyyz_xt", 5, ["menglaoshen", "mengguiqu"], ['zhu']], '微雨'],
		menglaoshen: {
			audio: 2,
			trigger: {
				player: "loseAfter",
			},
			forced: true,
			filter(event, player) {
				var evt = event.getl(player);
				if ((!evt.hs || !evt.hs.length) && (!evt.es || !evt.es.length)) return false;
				return ['useCard', 'respond'].includes(event.getParent().name) || event.type == 'discard';
			},
			content() {
				'step 0'
				if (trigger.type == 'discard') {
					player.draw();
					event.finish();
				} else player.chooseTarget('劳神：请选择一名角色，与其一同失去1点体力', true, function (card, player, target) {
					return target != player;
				}).ai = function (target) {
					return -get.attitude(_status.event.player, target);
				};
				'step 1'
				player.line(result.targets[0], 'fire');
				player.loseHp();
				result.targets[0].loseHp();
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (player.hp == 1) return 0;
					},
				},
			},
			"_priority": 0,
		},
		mengguiqu: {
			audio: 2,
			enable: ["chooseToUse", "chooseToRespond"],
			init(player) {
				player.storage.mengguiqu = 0;
			},
			filter(event, player) {
				if (player.storage.mengguiqu >= player.getDamagedHp()) return false;
				for (var i of player.getCards('he')) {
					if (get.type(i) == 'equip' && event.filterCard(i, player, event)) return true;
				}
				for (var j of lib.inpile) {
					var type = get.type2(j);
					if ((type == 'basic' || type == 'trick') && event.filterCard({ name: j }, player, event)) return true;
				}
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					var dialog = ui.create.dialog('归去', 'hidden');
					var list0 = [], list1 = [];
					for (var i of lib.inpile) {
						if (get.type(i) == 'basic' && player.countCards('he', { type: 'basic' }) >= 2 && event.filterCard({ name: i }, player, event)) {
							list0.push(['基本', '', i]);
							if (i == 'sha') {
								for (var j of lib.inpile_nature) list0.push(['基本', '', 'sha', j]);
							}
						}
						else if (get.type(i) == 'trick' && player.countCards('he', function (card) { return get.type2(card) == 'trick' }) >= 2 && event.filterCard({ name: i }, player, event)) list0.push(['锦囊', '', i]);
					}
					if (list0.length > 0) {
						dialog.addText('即时牌');
						dialog.add([list0, 'vcard']);
					}
					for (var j of player.getCards('he')) {
						if (get.type(j) == 'equip' && player.countCards('he', { type: 'equip' }) >= 2 && event.filterCard(j, player, event)) list1.push(j);
					}
					if (list1.length > 0) {
						dialog.addText('直接置入装备区');
						dialog.add([list1, 'vcard']);
					}
					if (!list0.length && !list1.length) dialog.addText('没有成对的同类型牌，或没有可用牌');
					return dialog;
				},
				check(button) {
					if (_status.event.getParent().type != 'phase') return 1;
					var player = _status.event.player;
					if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
					var card = player.getCards('he').includes(button.link) ? button.link : {
						name: button.link[2],
						nature: button.link[3]
					};
					return player.getUseValue(card);
				},
				backup(links, player) {
					var guiqu = player.getCards('he').includes(links[0]) ? links[0] : {
						name: links[0][2],
						nature: links[0][3],
						suit: 'none',
						number: null,
						isCard: true,
					};
					return {
						selectCard: 2,
						filterCard(card, player) {
							if (!ui.selected.cards.length && get.type(guiqu) == 'equip' && card != guiqu) return false;
							if (ui.selected.cards.length) {
								if (get.type2(card) != get.type2(ui.selected.cards[0])) return false;
							}
							return get.type2(card) == get.type(guiqu) && lib.filter.cardDiscardable.apply(this, arguments);
						},
						complexCard: true,
						viewAs: guiqu,
						position: 'he',
						ignoreMod: true,
						precontent() {
							player.logSkill('mengguiqu');
							player.storage.mengguiqu++;
							player.syncStorage('mengguiqu');
							var cards = event.result.cards;
							//if (cards.length == player.countCards('he')) {
							player.discard(cards);
							//} else {
							//	player.discard(cards);
							//}
							if (get.type2(cards[0]) == 'equip') {
								event.result.card = cards[0];
								event.result.cards = cards;
							} else {
								event.result.card = {
									name: event.result.card.name,
									nature: event.result.card.nature,
									isCard: true,
								};
								event.result.cards = [];
								event.getParent().addCount = false;
							}
							delete event.result.skill;
						},
					};
				},
				prompt(links, player) {
					return player.getCards('he').includes(links[0]) ? '将' + get.translation(links[0]) + '置入装备区' : '弃置两张牌视为使用【' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '】';
				},
				hiddenCard(player, name) {
					if (!lib.inpile.includes(name)) return false;
					var type = get.type(name);
					return (type == 'basic' || type == 'trick') && player.countCards('he') >= 2;
				},
				ai: {
					fireAttack: true,
					respondSha: true,
					respondShan: true,
					skillTagFilter(player) {
						if (!player.countCards('he')) return false;
					},
					order: 15,
					result: {
						player(player) {
							if (_status.event.dying) return get.attitude(player, _status.event.dying);
							return 1;
						},
					},
				},
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'mengguiqu_backup') return true;
				},
			},
			"_priority": 0,
		},
		meng_ruanmei: ['阮·梅', ["female", "hyyz_xt", 3, ["mengtansheng", "mengzidian"], []], '柚衣'],
		mengtansheng: {
			getLifeCard() {//获得一张随机点数，根据花色决定类型的生命牌
				var suit = ['heart', 'diamond', 'club', 'spade'].randomGet();
				var number = Math.floor(Math.random() * 13) + 1;
				var name;
				switch (suit) {
					case 'heart': name = 'meng_taohuasu'; break;
					case 'club': name = 'meng_meihuagao'; break;
					case 'diamond': name = 'meng_caomeibing'; break;
					default: name = 'meng_chashaobao'; break;
				};
				return ui.create.card().init([suit, number, name]);
			},
			audio: 2,
			enable: "phaseUse",
			usable: 4,
			filter(event, player) {
				return player.countCards('he') && !player.hasSkill('mengtansheng_usable');
			},
			check(card) {
				return 8 - get.value(card);
			},
			filterCard(card, player) {
				var cards = [];
				player.getHistory('lose', function (evt) {
					if (evt.type != 'discard') return false;
					if (!evt.getParent(2).skill || evt.getParent(2).skill != 'mengtansheng') return false;
					cards.addArray(evt.cards2);
				});
				for (var i of cards) {
					if (get.suit(i) == get.suit(card, player)) return false;
				};
				return true;
			},
			position: "he",
			selectCard: 1,
			async content(event, trigger, player) {
				const card1 = event.cards[0];
				const card2 = lib.skill.mengtansheng.getLifeCard();
				await player.gain(card2, 'draw');
				await game.delayx();

				if (get.color(card1) == get.color(card2)) {
					player.addTempSkill('mengtansheng_add');
				} else {
					player.addTempSkill('mengtansheng_usable');
				}
				if (get.number(card1) == get.number(card2) && get.suit(card1) == get.suit(card2)) {
					game.hyyzSkillAudio('meng', 'mengtansheng', 3)
					let count = 0;
					while (count < 20) {
						count++;
						let card = get.cards()[0], bool = false;
						if (player.hasUseTarget(card)) {
							var next = player.chooseUseTarget(card);
							if (get.info(card).updateUsable == 'phaseUse') next.addCount = false;
							bool = await next.forResultBool();
						}
						if (!bool) {
							player.loseToDiscardpile(card);
							break;
						}
					}
				}
			},
			subSkill: {
				add: {
					silent: true,
					charlotte: true,
					forced: true,
					trigger: {
						player: 'useCard1',
					},
					filter(event, player) {
						if (get.itemtype(event.cards) != 'cards') return false;
						if (!event.cards.some(card => ['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(card.name))) return false;
						return true;
					},
					direct: true,
					content() {
						'step 0'
						trigger.directHit.addArray(game.filterPlayer());
						'step 1'
						var info = get.info(trigger.card, false);
						if (info.allowMultiple != false && trigger.targets && !info.multitarget &&
							game.hasPlayer(function (current) {
								return !trigger.targets.includes(current) &&
									lib.filter.targetEnabled2(trigger.card, player, current) &&
									lib.filter.targetInRange(trigger.card, player, current);
							})) {
							player.chooseTarget('探生：是否为' + get.translation(trigger.card) + '增加一个目标？', 1, function (card, player, target) {
								var trigger = _status.event.getTrigger(), player = _status.event.player;
								var trigger = _status.event.getTrigger();
								var card = trigger.card;
								return !trigger.targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
							}).set('ai', function (target) {
								var trigger = _status.event.getTrigger(), player = _status.event.player;
								return get.effect(target, trigger.card, player, player);
							});
						} else event.finish();
						'step 2'
						if (result.bool) {
							var targets = result.targets;
							player.logSkill('mengtansheng', targets);
							trigger.targets.addArray(targets);
						};
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter(player, tag, arg) {
							return ['meng_taohuasu', 'meng_meihuagao', 'meng_caomeibing', 'meng_chashaobao'].includes(arg.card.name);
						},
					},
				},
				usable: {},
			},
			ai: {
				result: {
					player(player, target) {
						return 2;
					}
				}
			},
			"_priority": 0,
		},
		mengzidian: {
			audio: 2,
			trigger: {
				global: 'phaseEnd'
			},
			frequent: true,
			filter(event, player) {
				return player.hasHistory('lose', evt => evt.cards2 && evt.cards2.length) ||
					player.hasHistory('gain', evt => evt.cards && evt.cards.length) ||
					game.getGlobalHistory('changeHp').some(evt => evt.player == player)
			},
			content() {
				player.gain(lib.skill.mengtansheng.getLifeCard(), 'draw');
			},
			"_priority": 0,
		},
		meng_guinaifen: ['桂乃芬', ["female", "hyyz_xt", 3, ["mengzhuyi", "menghenhuo", "mengtangcai"], []], '柚衣'],
		mengzhuyi: {
			audio: 4,
			trigger: {
				player: 'phaseUseBegin'
			},
			filter: (event, player) => {
				return player.countCards('he', function (card) {
					return get.type2(card) == 'trick' || get.type2(card) == 'basic';
				});
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard('诸艺：选择一种类型的牌全部重铸，本回合不能使用此类的牌', '本回合使用以下类型的牌时：<br>基本牌，无距离限制且不能被响应。<br>锦囊牌，可以增加或减少1个目标。<br>装备牌，摸一张牌。', function (card) {
						return (get.type2(card) == 'trick' || get.type2(card) == 'basic') && player.canRecast(card);
					})
					.set('ai', function (card) {
						if (!player.countCards('h', { name: 'tao' })) return get.type(card) == 'basic';
						return get.type2(card) == 'trick';
					}).forResult();
			},
			async content(event, trigger, player) {
				var typex = get.type2(event.cards[0]);
				player.recast(player.getCards('h', function (card) {
					return get.type2(card) == typex;
				}));
				player.addTempSkill('mengzhuyi_buff');
				player.storage.mengzhuyi_buff = typex;
			},
			subSkill: {
				buff: {
					mark: true,
					intro: {
						content: `不能使用或打出$牌`,
					},
					onremove: true,
					mod: {
						"cardEnabled2"(card, player) {
							if (get.position(card) != 'h') return false;
							if (get.type2(card) == player.storage.mengzhuyi_buff || player.storage.mengzhuyi_buff == 'trick' && get.type(card) == 'delay') return false;
						},
						targetInRange(card, player, target) {
							if (get.type2(card) == player.storage.mengzhuyi_buff) return;
							return true;
						},
					},
					trigger: {
						player: "useCard2",
					},
					filter: (event, player) => {
						return get.type(event.card) != 'delay';
					},
					direct: true,
					content: () => {
						'step 0'
						if (get.type(trigger.card) == 'equip') {
							player.draw();
							event.finish();
						} else if (get.type2(trigger.card) == 'basic') {
							game.log(trigger.card, '不能被响应');
							trigger.nowuxie = true;
							trigger.directHit.addArray(game.players);
							event.finish();
						} else {
							var goon = false;
							var info = get.info(trigger.card);
							if (trigger.targets && !info.multitarget) {
								var players = game.filterPlayer();
								for (var i = 0; i < players.length; i++) {
									if (lib.filter.targetEnabled2(trigger.card, player, players[i]) && !trigger.targets.includes(players[i])) {
										goon = true; break;
									}
								}
							}
							if (goon) {
								player.chooseTarget('诸艺：是否额外指定一名' + get.translation(trigger.card) + '的目标？', function (card, player, target) {
									var trigger = _status.event;
									if (trigger.targets.includes(target)) return false;
									return lib.filter.targetEnabled2(trigger.card, _status.event.player, target);
								}).set('ai', function (target) {
									var trigger = _status.event.getTrigger();
									var player = _status.event.player;
									return get.effect(target, trigger.card, player, player);
								}).set('targets', trigger.targets).set('card', trigger.card);
							}
							else {
								if (!info.multitarget && trigger.targets && trigger.targets.length > 1) {
									event.goto(3);
								}
							}
						}
						'step 1'
						if (result.bool) {
							if (!event.isMine()) game.delayx();
							event.target = result.targets[0];
						}
						else {
							event.finish();
						}
						'step 2'
						if (event.target) {
							player.logSkill('mengzhuyi', event.target);
							if (!trigger.targets.includes(event.target)) trigger.targets.push(event.target);
							game.log(trigger.card, '增加了', event.target);
						}
						event.finish();
						'step 3'
						player.chooseTarget('诸艺：是否减少一名' + get.translation(trigger.card) + '的目标？', function (card, player, target) {
							return _status.event.targets.includes(target);
						}).set('ai', function (target) {
							var trigger = _status.event.getTrigger();
							return -get.effect(target, trigger.card, trigger.player, _status.event.player);
						}).set('targets', trigger.targets);
						'step 4'
						if (result.bool) {
							event.targets = result.targets;
							if (event.isMine()) {
								player.logSkill('mengzhuyi', event.targets);
								event.finish();
							}
							for (var i = 0; i < result.targets.length; i++) {
								trigger.targets.remove(result.targets[i]);
								game.log(trigger.card, '移除了', result.targets[i]);
							}
							game.delay();
						}
						else {
							event.finish();
						}
						'step 5'
						player.logSkill('mengzhuyi', event.targets);
					},
					"_priority": 0,
				}
			}
		},
		menghenhuo: {
			audio: 1,
			enable: "phaseUse",
			usable: 1,
			filter: (event, player) => {
				return player;
			},
			content: () => {
				"step 0"
				player.damage(player);
				"step 1"
				var list = [
					'　　基本牌　　',
					'　　锦囊牌　　',
					'　　装备牌　　',
				];
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i]];
				}
				var next = player.chooseButton([
					'狠活：依次选择两个类型<br>本回合手牌中的前者将视为后者',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 2), 'tdnodes'],
					[list.slice(2, 3), 'tdnodes'],
				]);
				next.set('forced', true);
				next.set('selectButton', 2);
				next.set('filterButton', function (button) {
					return true;
				});
				next.set('ai', function (button) {
					var player = _status.event.player;
					switch (button.link) {
						case 0: return 10;
						case 1: return 5;
						case 2: return 0;
					}
				});
				"step 2"
				var map = {
					1: 'basic',
					2: 'trick',
					3: 'equip',
				};
				game.log("#g【狠活】", "本回合", player, "手牌中的", "#y" + lib.translate[map[result.links[0] + 1]] + "牌", "视为", "#y" + lib.translate[map[result.links[1] + 1]] + "牌");
				player.addTempSkill('menghenhuo_buff');
				player.storage.menghenhuo_buff = [map[result.links[0] + 1], map[result.links[1] + 1]];
			},
			ai: {
				order: 12,
				result: {
					player(player, target) {
						if (player.hp <= 1) return -5;
						return player.countCards('h') * 3;
					}
				}
			}
		}, menghenhuo_buff: {
			mark: true,
			marktext: "狠",
			intro: {
				name: "狠活",
				content(storage, player) {
					return `<span class=firetext>${lib.translate[storage[0]]}牌</span>视为<span class=greentext>${lib.translate[storage[1]]}牌</span>`;
				}
			},
			init(player) {
				delete player.storage.menghenhuo_buff;
				get.type = function (obj, method, player) {
					var returnx = '';
					if (typeof obj == 'string') obj = { name: obj };
					if (typeof obj != 'object') return;
					var name = get.name(obj, player);
					if (!lib.card[name]) {
						if (!name.startsWith('sha_')) return;
						if (name.slice(4).split('_').every(n => lib.nature.has(n))) returnx = lib.card['sha'].type;
					}
					if (method == 'trick' && lib.card[name].type == 'delay') returnx = 'trick';
					returnx = lib.card[name].type;


					if (get.itemtype(player) == 'player' || (player !== false && get.position(obj) == 'h')) {
						var owner = player || get.owner(obj);
					}
					if (_status.event.player) owner = _status.event.player;
					if (_status.event.getParent().player) owner = _status.event.getParent().player;
					if (owner && owner.hasSkill('menghenhuo_buff')) {
						var sto = owner.getStorage('menghenhuo_buff');
						if (returnx == sto[0]) return sto[1];
					}
					return returnx;
				};
			},
			onremove(player) {
				get.type = function (obj, method, player) {
					if (typeof obj == 'string') obj = { name: obj };
					if (typeof obj != 'object') return;
					var name = get.name(obj, player);
					if (!lib.card[name]) {
						if (!name.startsWith('sha_')) return;
						if (name.slice(4).split('_').every(n => lib.nature.has(n))) return lib.card['sha'].type;
					}
					if (method == 'trick' && lib.card[name].type == 'delay') return 'trick';
					return lib.card[name].type;
				};
				delete player.storage.menghenhuo_buff;
			},
		},
		mengtangcai: {
			audio: 3,
			trigger: {
				player: "damageEnd",
			},
			frequent: true,
			preHidden: true,
			filter: (event, player) => {
				return player.countCards('hej');
			},
			content: () => {
				"step 0"
				player.showCards(player.getCards('hej'));
				"step 1"
				var type = [];
				player.getCards('hej').map(card => type.add(get.type2(card)));
				player.draw(type.length);
			},
			ai: {
				"maixie_defend": true,
				threaten: 0.9,
			},
		},
		meng_luka: ['卢卡', ["male", "hyyz_xt", 4, ["menghanxin", "mengquanzhi"], []], '屺'],
		menghanxin: {
			audio: 5,
			logAudio: () => [
				'ext:忽悠宇宙/asset/meng/audio/menghanxin1.mp3',
				'ext:忽悠宇宙/asset/meng/audio/menghanxin2.mp3',
				'ext:忽悠宇宙/asset/meng/audio/menghanxin3.mp3',
			],
			enable: "phaseUse",
			usable: 1,
			filterTarget(card, player, target) {
				return player.canCompare(target);
			},
			filter: (event, player) => {
				return player.countCards('h') > 0;
			},
			content: () => {
				'step 0'
				player.chooseToCompare(target);
				'step 1'
				if (!result.tie) {
					var players = [player, target];
					if (result.bool) players.reverse();
					players[1].line(players[0], 'thunder');
					players[0].damage(players[1], 1);
				}
			},
			group: 'menghanxin_damage',
			global: 'menghanxin_add',
			subSkill: {
				damage: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/menghanxin4.mp3',
						'ext:忽悠宇宙/asset/meng/audio/menghanxin5.mp3',
					],
					trigger: {
						player: "damageAfter",
						source: "damageSource",
					},
					filter(event) {
						return event.num > 0
					},
					async cost(event, trigger, player) {
						event.result = await player.chooseCard('he', '是否重铸至多两张牌', [1, 2]).set('ai', function (card) {
							return 5 - get.value(card);
						}).forResult();
					},
					async content(event, trigger, player) {
						player.recast(event.cards);
					}
				},
				add: {
					trigger: {
						target: "compare",
					},
					direct: true,
					filter: (event, player) => {
						return event.getParent().name == 'menghanxin' && !event.iwhile && event.num1 < 13;
					},
					content: () => {
						trigger.num2 += 2;
						game.log(player, '的拼点牌点数+2');
					},
				}
			},
			ai: {
				order: 8,
				result: {
					player(player) {
						return player.hp > 2 ? 2 : -2;
					},
					target: -1,
				}
			}
		},
		mengquanzhi: {
			audio: 3,
			otherNum(player) {
				let num = 0;
				game.countPlayer2(function (current) {
					if (current != player) {
						current.getHistory('lose', evt => {
							if (evt.cards2 && evt.cards2.length) {
								for (let i of evt.cards2) {
									let a = get.number(i);
									if (typeof a == 'number') {
										if (evt.getParent(3).name == 'menghanxin') a += 2;
										if (a > num) num = Math.min(a, 13);
									}
								}
							}
						})
					}
				});
				return num;
			},
			mark: true,
			intro: {
				content(storage, player) {
					let num = lib.skill.mengquanzhi.otherNum(player);
					let str = '';
					if (num > 0) str += '本回合其他角色失去最大的点数：' + num;
					else str += '无记录';
					if (player.hasSkill('mengquanzhi_disable')) str += '<li>拳志②无效';
					return str;
				}
			},
			mod: {
				cardUsable(card, player) {
					if (typeof card == 'object') {
						var num1 = lib.skill.mengquanzhi.otherNum(player);
						var num2 = get.number(card);
						if (typeof num1 == 'number' && typeof num2 == 'number' && num1 > num2) return Infinity;
					}
				},
				aiOrder(player, card, num) {
					if (typeof card == 'object') {
						var num1 = lib.skill.mengquanzhi.otherNum(player);
						var num2 = get.number(card);
						if (typeof num1 == 'number' && typeof num2 == 'number' && num1 > num2) return num + 5;
					}
				},
			},
			trigger: {
				global: 'damageEnd'
			},
			filter: (event, player) => {
				if (player.hasSkill('mengquanzhi_disable')) return false;
				return event.source && event.source.isIn() && event.player != event.source &&
					(event.player.countCards('h') != event.source.countCards('h') ||
						event.player.hp != event.source.hp);
			},
			direct: true,
			content: () => {
				'step 0'
				var list = [];
				if (trigger.player.countCards('h') > trigger.source.countCards('h')) {
					list.push(trigger.source);
				} else {
					list.push(trigger.player);
				}
				if (trigger.player.hp > trigger.source.hp) {
					list.push(trigger.source);
				} else {
					list.push(trigger.player);
				}
				player.chooseTarget('拳志：令一名角色摸一张牌', (card, player, target) => list.includes(target));
				'step 1'
				if (result.bool) {
					if (trigger.source.hp > trigger.player.hp) player.addTempSkill('mengquanzhi_disable');
					result.targets[0].draw();
				}
			},
			subSkill: { disable: {} },
		},
		meng_baizhu: ['白术', ["male", "hyyz_ys", 3, ["mengzhenyao", "mengwenji"], []], '冷若寒'],
		mengzhenyao: {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filterTarget: lib.filter.notMe,
			async content(event, trigger, player) {
				const target = event.targets[0];
				await player.swapHandcards(target);
				const index1 = await player.chooseControl().set('choiceList', ['将一张手牌替换为【毒】', '创造一张【无中生有】', '与对方交换手牌']).set('forced', false).set('ai', function () {
					var targetx = _status.event.targetx;
					var player = _status.event.player;
					var value = 0;
					var cards0 = player.getCards('h');
					for (let i of cards0) value -= get.value(i);
					var cards1 = targetx.getCards('h');
					for (let i of cards1) value += get.value(i);
					if (get.attitude(player, targetx) > 0) return 1;
					else {
						if (value > 0) return 0;
						return Math.random() < 0.6 ? 1 : 2;
					}
				}).set('targetx', target).forResult('index');
				const index2 = await target.chooseControl().set('choiceList', ['将一张手牌替换为【毒】', '创造一张【无中生有】', '与对方交换手牌']).set('forced', false).set('ai', function () {
					var targetx = _status.event.targetx;
					var player = _status.event.player;
					var value = 0;
					var cards0 = player.getCards('h');
					for (let i of cards0) value -= get.value(i);
					var cards1 = targetx.getCards('h');
					for (let i of cards1) value += get.value(i);
					if (get.attitude(player, targetx) > 0) return 1;
					else {
						if (value > 0) return 0;
						return Math.random() < 0.6 ? 1 : 2;
					}
				}).set('targetx', player).forResult('index');

				if (index1 == 0) {
					if (player.countCards('h')) {
						const cards = await player.chooseCard('h', '将一张牌替换为【毒】', true).forResultCards();
						if (cards) {
							cards[0].init([get.suit(cards[0]), get.number(cards[0]), 'du']);
						}
					}
				}
				else if (index1 == 1) {
					await player.gain(game.createCard('wuzhong'));
				}
				else if (index1 == 2) {
					await player.swapHandcards(target);
				};

				if (index2 == 0) {
					if (target.countCards('h')) {
						const cards = await target.chooseCard('h', '将一张牌替换为【毒】', true).forResultCards();
						if (cards) {
							cards[0].init([get.suit(cards[0]), get.number(cards[0]), 'du']);
						}
					}
				}
				else if (index2 == 1) {
					await target.gain(game.createCard('wuzhong'));
				}
				else if (index2 == 2) {
					await target.swapHandcards(player);
				};
			},
			ai: {
				order: 10,
				result: {
					player: function (player, target) {
						var value = 0;
						var cards0 = player.getCards('h');
						for (let i of cards0) value -= get.value(i);
						var cards1 = target.getCards('h');
						for (let i of cards1) value += get.value(i);
						if (get.attitude(player, target) > 0) value += 2;
						return value;
					},
					target: function (player, target) {
						var value = 0;
						var cards0 = player.getCards('h');
						for (let i of cards0) value += get.value(i);
						var cards1 = target.getCards('h');
						for (let i of cards1) value -= get.value(i);
						if (get.attitude(player, target) > 0) value += 2;
						return value;
					}
				}
			}
		},
		mengwenji: {
			audio: 3,
			trigger: {
				global: 'damageEnd'
			},
			filter: (event, player) => {
				if (!event.source || !event.source.isIn()) return false;
				if (event.player == event.source) return false;
				if (event.player != player && event.source != player) return false;
				return player.canUse({ name: 'tuixinzhifu' }, event.player == player ? event.source : event.player, false);
			},
			content: () => {
				player.useCard({ name: 'tuixinzhifu' }, trigger.player == player ? trigger.source : trigger.player, false);
			}
		},
		meng_sp_fuxuan: ['符玄', ["female", "hyyz_xt", 6, ["mengchitong", "mengxizhi"], ["die:meng_fuxuan"]], '微雨'],
		mengchitong: {
			audio: 'mengjianzhi',
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			check(event, player) {
				return player.hp >= 3
			},
			frequent: false,
			prompt2: "失去1点体力",
			content() {
				player.loseHp()
			},
			group: ['mengchitong_dam'],
			subSkill: {
				dam: {
					audio: 'mengjianzhi',
					init(player) {
						player.storage.mengchitong_dam = []
					},
					trigger: {
						global: 'damageBegin4'
					},
					filter(event, player) {
						return !player.storage.mengchitong_dam.includes(event.player);
					},
					check(event, player) {
						if (event.player != player && player.isMinHp()) return false;
						return get.attitude(player, event.player) > 0;
					},
					logTarget: 'player',
					prompt2: "防止此伤害。若为未发动过此技的其他角色，你失去1点体力并摸两张牌",
					async content(event, trigger, player) {
						player.storage.mengchitong_dam.add(trigger.player);
						trigger.cancel();
						if (trigger.player != player) {
							await player.loseHp();
							player.draw(2);
						}
					},
				}
			}
		},
		mengxizhi: {
			audio: "mengqiongguan",
			trigger: {
				player: ['loseHpEnd', 'gainAfter'],
			},
			forced: true,
			filter: (event, player) => {
				if (event.name == 'loseHp') return true;
				if (event.name == 'gain' && event.cards && event.cards.length <= 1) return false;
				for (var card of event.cards) {
					if (get.color(card, player) != get.color(event.cards[0], player)) return false;
				}
				return true;
			},
			content: () => {
				'step 0'
				if (trigger.name == 'loseHp') {
					var cards = get.cards(player.hp);
					game.cardsGotoOrdering(cards);
					var next = player.chooseToMove();
					next.set('list', [
						['牌堆顶', cards],
					]);
					next.set('prompt', '悉知：调整牌堆顶的牌');
					next.processAI = function (list) {
						list[0][1].sort(function (a, b) {
							return player.getUseValue(b) - player.getUseValue(a);
						});
						return [list[0][1]];
					}
				} else {
					var color = get.color(trigger.cards[0]);
					var str = `令${color == 'red' ? '一' : '至多两名'}名角色${color == 'red' ? '回复1点体力' : '弃置共计两张牌'}`;
					player.chooseTarget(str, [1, color == 'red' ? 1 : 2], true, function (card, player, target) {
						return color == 'red' ? true : target.countCards('he');
					}).set('ai', (target) => color == 'red' ? get.recoverEffect(target, player, player) : -get.attitude(player, target));
				}
				'step 1'
				if (result.bool) {
					if (result.targets) {
						if (get.color(trigger.cards[0]) == 'red') {
							result.targets[0].recover();
						} else {
							if (result.targets.length == 2) {
								player.discardPlayerCard(result.targets[0], true);
								player.discardPlayerCard(result.targets[1], true);
							} else {
								player.discardPlayerCard(result.targets[0], Math.min(result.targets[0].countCards('he'), 2), true);
							}
						}
					} else {
						var top = result.moved[0];
						top.reverse();
						for (var i = 0; i < top.length; i++) {
							ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
						}
						player.popup(get.cnNumber(top.length) + '上');
						game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
						game.updateRoundNumber();
						game.delayx();
					}
				}
			}
		},

		meng_sp_nahida: ['纳西妲', ["female", "hyyz_ys", 3, ["mengxushi", "mengnanke", "mengzhezhi"], ["die:meng_nahida",]], '柚衣'],
		mengxushi: {
			audio: 'mengxvkong',
			trigger: {
				player: ['useCard', 'respond'],
			},
			mark: true,
			intro: {
				content: function (storage, player) {
					var str = '本回合使用过：<br>';
					var list = [];
					player.getHistory('useCard', evt => {
						if (get.suit(evt.card) != 'none' && !list.includes(get.suit(evt.card))) list.push(get.suit(evt.card));
					});
					player.getHistory('respond', evt => {
						if (get.suit(evt.card) != 'none' && !list.includes(get.suit(evt.card))) list.push(get.suit(evt.card));
					});
					if (!list.length) return '本回合未使用过有花色的牌';
					list.forEach(function (card) {
						str += get.translation(card);
					});
					return str;
				}
			},
			forced: true,
			content: () => {
				var suit = get.suit(trigger.card, player);
				if (suit && suit != 'none') {
					var bool = true;
					player.getHistory('useCard', evt => {
						if (evt != trigger && get.suit(evt.card) == get.suit(trigger.card)) {
							bool = false;
						}
					});
					player.getHistory('respond', evt => {
						if (evt != trigger && get.suit(evt.card) == get.suit(trigger.card)) bool = false;
					});
					if (bool) player.draw();
					else player.chooseToDiscard(true, 'he');
				} else player.draw();
			},
			mod: {
				aiUseful: function (player, card, num) {
					let suit = get.suit(card, player);
					if (!suit || suit == 'none') return;
					let bool = true;
					player.getHistory('useCard', evt => {
						if (get.suit(evt.card) == get.suit(card)) {
							bool = false;
						}
					});
					player.getHistory('respond', evt => {
						if (get.suit(evt.card) == get.suit(card)) bool = false;
					});
					return bool ? [num + 5] : [num - 5];
				},
				aiOrder: function () {
					lib.skill.mengxushi.mod.aiUseful.apply(this, arguments);
				},
			},
			ai: {
				effect: {
					player: function (card, player, target) {
						let suit = get.suit(card, player);
						if (!suit || suit == 'none') return;
						let bool = true;
						player.getHistory('useCard', evt => {
							if (get.suit(evt.card) == get.suit(card)) {
								bool = false;
							}
						});
						player.getHistory('respond', evt => {
							if (get.suit(evt.card) == get.suit(card)) bool = false;
						});
						return [1, bool ? 1 : -1];
					},
				}
			},
		},
		mengnanke: {
			audio: 'mengxvkong',
			enable: 'phaseUse',
			filter: (event, player) => {
				return !player.hasSkill('mengnanke_disable');
			},
			content: () => {
				player.addTempSkill('mengnanke_disable');
				lib.skill.mengnanke.delete();
			},
			delete() {
				game.countPlayer2(function (current) {
					var history = current.actionHistory[current.actionHistory.length - 1]['useCard'];
					if (history.length) {
						current.getStat().card['sha'] = 0;
						current.getStat().card['jiu'] = 0;
						game.getGlobalHistory().useCard = []
						game.log('<span class="firetext">——已删除</span>', current, '<span class="firetext">的<span class="yellowtext">使用牌</span>记录——</span>');
						history.length = 0;
						history = [];
					};
					var history = current.actionHistory[current.actionHistory.length - 1]['respond'];
					if (history.length) {
						game.getGlobalHistory().respond = []
						game.log('<span class="firetext">——已删除</span>', current, '<span class="firetext">的<span class="yellowtext">打出牌</span>记录——</span>');
						history.length = 0;
						history = [];
					};
				})
			},
			ai: {
				order: 1,
				result: { player: 4 }
			},
			group: 'mengnanke_1',
			subSkill: {
				1: {
					trigger: {
						player: ["loseAfter", "damageEnd"],
						global: "loseAsyncAfter"
					},
					filter: (event, player) => {
						if (player.hasSkill('mengnanke_disable')) return false;
						return event.name == 'damage' || event.type == 'discard' && event.getl(player).cards2.length > 0;
					},
					content: () => {
						player.addTempSkill('mengnanke_disable');
						lib.skill.mengnanke.delete();
					},
				},
				disable: {},
			},
		},
		mengzhezhi: {
			audio: 'mengxvkong',
			trigger: { global: 'phaseJieshuBegin' },
			filter: (event, player) => {
				if (!player.countCards('hes')) return false;
				return player.getHistory('useCard').length + player.getHistory('respond').length == 0 ||
					event.player.getHistory('useCard').length + event.player.getHistory('respond').length == 0;
			},
			direct: true,
			content: () => {
				'step 0'
				var list = [];
				for (var i of lib.inpile) {
					let card = { name: i };
					if (get.type(i) == 'basic') {
						if (i == 'shan' || i == 'du') continue;
						if (player.countCards('hes', { color: 'red' })) {
							if (player.canUse(card, trigger.player)) list.push(['基本', '', i]);
							if (i == 'sha') {
								for (var j of lib.inpile_nature) {
									card.nature = j;
									if (player.canUse(card, trigger.player)) list.push(['基本', '', 'sha', j]);
								}
							}
						}
					} else if (get.type(i) == 'trick') {
						if (i == 'wuxie' || i == 'du') continue;
						if (player.countCards('hes', { color: 'black' })) {
							if (player.canUse(card, trigger.player)) list.push(['锦囊', '', i]);
						}
					}
				}
				var dialog = ui.create.dialog('折枝：将一张红/黑色牌当任意基本/锦囊牌对其使用', 'hidden');
				dialog.addText('<div class="text center">你的手牌</div>');
				dialog.add(player.getCards('hes'));
				dialog.addText('<div class="text center">视为使用的牌</div>');
				dialog.add([list, 'vcard']);
				var next = player.chooseButton(dialog).set('selectButton', 2).set('filterButton', function (button) {
					let hs = _status.event.player.getCards('hes');
					if (ui.selected.buttons.length) {
						let ui_button = ui.selected.buttons[0].link, ready_button = button.link;
						if (hs.includes(ui_button) == hs.includes(ready_button)) return false;
						if (hs.includes(ui_button) == true) return get.type(ready_button[2]) == (get.color(ui_button) == 'black' ? 'trick' : 'basic');
						else return get.color(ready_button) == (get.type(ui_button[2]) == 'trick' ? 'black' : 'red');
					}
					else return true;
				}).set('ai', function (button) {
					let hs = _status.event.player.getCards('hes');
					if (hs.includes(button.link)) {
						return 10 - get.value(button.link);
					} else {
						return get.effect(_status.currentPhase, { name: button.link[2], nature: button.link[3] }, player, player);
					}
				});
				'step 1'
				if (result.bool && result.links && result.links.length == 2) {
					player.logSkill('mengzhezhi', trigger.player);
					var hs = player.getCards('hes');
					if (hs.includes(result.links[0])) {
						player.useCard({ name: result.links[1][2], nature: result.links[1][3] }, [result.links[0]], trigger.player, false);
					} else {
						player.useCard({ name: result.links[0][2], nature: result.links[0][3] }, [result.links[1]], trigger.player, false);
					}
				}
			}
		},
		meng_furina: ['芙宁娜', ["female", "hyyz_ys", 3, ["mengjvxing", "mengshenyi"], ['zhu',]], '踽踽独行-尾巴酱', `
			特别鸣谢——<br>
			代码导师：<font color=#ff0dac>紫灵谷的骊歌</font><br>
			引路老师：<font color=#ff0dac>萨巴鲁酱</font><br>
			代码参考：<font color=#ff0dac>《忽悠宇宙》扩展</font><br>
			教科书：<font color=#ff0dac>《大宝规则集》《三国杀DIY·设计攻略&资源导航》</font><br>
			模板来源（制图在米忽悠の小宇宙群相册）：<font color=#ff0dac>幽蝶化烬</font><br>
			<hr>基础意象：装备牌栏=>神权及其外显<br>
			<hr><b>芙宁娜 3 踽踽独行</b><br>
			踽踽独行意为孤独地行走，五百年来芙芙孤身一人走在看不到结局的路上，不能保证成功，也不能轻易放弃。她就像一根绷紧的琴弦，不能松弛，时常几近崩溃边缘……<br>
			<hr><b>踽行<br>
				使命技，锁定技，每轮结束时你废除末位装备栏，然后，令场上装备最少的角色转换手牌明置状态。<br>
				成功：洗牌后，你交出装备栏及其中牌并回复等量体力，然后修改〖神仪〗。<br>
				失败：你废除所有装备栏后，其他角色执行【水淹七军】。<br>
				无论成功与否，你获得〖人生〗</b><br>
			⑴五个装备栏逐渐向上废除=>耗时五百年，水灾逐渐淹没神座<br>
			⑵场上牌（主要为装备牌）最少=>罪犯的权力最少☞装备牌最少<br>
			⑶芙芙的装备栏随时间减少=>装备牌也减少☞芙芙注定要被众人审判<br>
			因为神仪的存在，芙芙非常害怕手牌的暴露。<br>
			⑷暴露手牌=>更容易失去普通牌=>废除装备栏=>使命失败=>五百年功亏一篑<br>
			使命成功<br>
			⑸洗牌=>时代更替=>预言<br>
			⑹回复体力=>芙芙复活！<br>
			⑺移动装备栏和装备牌=>转移神权给那维莱特<br>
			使命失败<br>
			⑻其他人水淹七军=>枫丹人坠入深海，仅余芙宁娜<br>
			⑼获得〖人生〗=>无论芙卡洛斯计划的成功与否，芙芙终将卸下伪装，成为凡人<br>
			<hr><b>神仪<br>
				锁定技，你预演明置牌；手牌数小于装备栏数时，摸牌补齐并明置。你于出牌阶段外失去<font color=#0fa7ff>明置</font>/<font color=#ff0dac>暗置</font>牌后，<font color=#0fa7ff>恢复首位</font>/<font color=#ff0dac>废除末位</font>装备栏。</b><br>
			神仪旨在用虚张声势隐藏自己，明置牌就是芙芙对外展示的形象。<br>
			⑴不断补充明置牌=>用神权保护自己<br>
			⑵用明置牌保护暗置牌=>用“虚假形象”保护“真实内心”<br>
			⑶失去明置牌=>恢复装备栏=>巩固神的形象<br>
			⑷失去暗置牌=>废除装备栏=>神的形象崩溃<br>
			装备栏减少时，补充明置牌的阈值也会降低，那么芙芙会更加难以维持神的形象，会如滚雪球般提高使命失败的概率。维持神仪的稳定，需要小心经营，如履薄冰，正如小心经营自己的形象的芙宁娜一般。因为前期没有明置牌，为了防止回合外失去普通牌，芙芙刚需前置位，从而于出牌阶段将暗置牌换为明置牌。<br>
			<hr><b>神仪改<br>
				你的手牌数小于装备栏数时，摸牌补齐并明置。你于出牌阶段外失去<font color=#ff0dac>暗置</font>/<font color=#0fa7ff>明置</font>牌后，<font color=#0fa7ff>恢复首位</font>/<font color=#ff0dac>废除末位</font>装备栏。</b><br>
			象征意义<br>
			⑴交换“明置”和“暗置”二词，相当于给芙芙一个靠自己从0开始，重新走自己人生，争取幸福生活的机会<br>
			⑵此时的芙芙玩法从尽可能使用明置牌、不愿展现内心的小心翼翼，变为了尽可能使用暗置牌，展示自己轻松自由的内心。玩家玩法的变化也反映了芙芙真实的内心感受，描述了芙芙走下神位后的生活。<br>
			<hr><b>人生<br>
				你的手牌数小于装备栏数时，摸牌补齐并明置。你于出牌阶段外失去<font color=#ff0dac>暗置</font>/<font color=#0fa7ff>明置</font>牌后，<font color=#0fa7ff>恢复首位</font>/<font color=#ff0dac>废除末位</font>装备栏。</b><br>
			象征意义<br>
			技能名很“宏大”，为了方便后人使用，不能过于个性化和私有化。我选择了降低与芙宁娜的耦合，提升其可用价值。<br>
			所谓生活，就是即使昨日天降横财，明日灾难降临，今日依然要喝咖啡，享受我的小蛋糕。<br>
			☞准备结束阶段改成弃牌摸牌阶段=>充满意外之喜/灾的人生<br>
			<hr>芙芙玩法<br>
			撑到洗牌即可任务完成，将权力交给忠臣来一波爆发和保护，人生和神仪都是触发技，玩起来更从容一些。但是牌堆的刷新速度要靠所有人，能不能保住枫丹，不是芙宁娜一个人的责任。但是，谢谢你，五百年来辛苦了，给你一个拥抱，我的芙芙。<br>
			如果失败，芙宁娜会失去所有权力，仅剩意义有限的人生。但是，请不要自责，我的芙宁娜，你已经很努力了，这一切都不怪你。`],
		_mengyvyan: {
			trigger: {
				player: 'useCardAfter'
			},
			silent: true,
			charlotte: true,
			filter(event) {
				return event.yvyan
			},
			async content(event, trigger, player) {
				let map = new Map();
				game.getGlobalHistory('changeHp', (evt) => {
					if (
						evt.getParent(3) == trigger
						//|| evt.getParent(2).name == '_lianhuan' && evt.getParent(2)._args && evt.getParent(2)._args.some(arr => arr.yvyan)
					) {
						if (evt.num != 0 && evt.player.isIn()) map.set(evt.player, -evt.num);
					}
				});
				if (map.size > 0) {
					let str = ``;
					for (let current of map.keys()) {
						const num = map.get(current);
						str += `<li><span class='bluetext'>${get.translation(current)}</span>调整体力值${num > 0 ? `<span class='greentext'>+` : `<span class='firetext'>`}${num}</span>`;
						current.hp += num;
						if (isNaN(current.hp)) current.hp = 0;
						if (current.hp > current.maxHp) current.hp = current.maxHp;
						current.update();
						if (event.popup !== false) {
							current.$damagepop(num, "water");
						}
						if (current.hp <= 0 && current.isAlive() && !event.nodying) {
							await game.asyncDelayx()
							event._dyinged = true;
							current.dying(event);
						}
						if (_status.dying.includes(current) && current.hp > 0) {
							_status.dying.remove(current);
							game.broadcast((list) => {
								_status.dying = list;
							}, _status.dying);
							var evt = event.getParent("_save");
							if (evt && evt.finish) evt.finish();
							evt = event.getParent("dying");
							if (evt && evt.finish) evt.finish();
						}
					}
					game.log(`<span class='yellowtext'>预演回溯</span>：`, str);
				}
			},
			"_priority": -998,
		},
		mengjvxing: {
			audio: 7,
			logAudio: () => false,
			init() {
				lib.translate['visible_meng_furina'] = '明·芙';
				game.hyyzSkillAudio('meng', 'mengjvxing_init',)
			},
			dutySkill: true,
			trigger: { global: "roundStart" },
			forced: true,
			filter: () => game.roundNumber > 1,
			async content(event, trigger, player) {
				const disableEndSort = async function (num) {
					if (!player.hasEnabledSlot()) {
						game.log('#g【踽行】-', player, '没有可废除的装备栏');
						return;
					}
					if (!num) num = 1;
					for (var i = 5; i > 0; i--) {
						while (player.countEnabledSlot('equip' + i) > 0) {
							await player.disableEquip('equip' + i);
							num--
						}
						if (num <= 0) return;
					}
				};
				const exchangeShownCards = function (player, str, translate) {
					if (!str) str = player.name;
					const cards = [[], []];
					player.getCards('h', (card) => {
						if (get.is.shownCard(card)) cards[0].add(card);
						else cards[1].add(card);
					});
					player.hideShownCards(cards[0]);
					player.addShownCards(cards[1], 'visible_' + str);
					lib.translate['visible_' + str] = translate ? translate : '明';
				};
				await disableEndSort();
				const players = game.filterPlayer(current => !game.hasPlayer(target => target.countCards('e') < current.countCards('e')));
				if (!players.length) return;
				else {
					let targets = [];
					if (players.length == 1) targets = players;
					else targets = (await player.chooseTarget('踽行：定断一名角色的罪行', '令其转换手牌明置状态', true, (card, player, target) => {
						return !game.hasPlayer(current => current.countCards('e') < target.countCards('e'));
					}).set('ai', (target) => {
						if (target == player) {
							return 3 * (player.countCards('h', (card) => !get.is.shownCard(card)) - player.countCards('h', (card) => get.is.shownCard(card)));
						}
						return -get.attitude2(target) / (get.distance(_status.event.player, target) + 0.1);
					})).result.targets;
					if (targets.length) {
						game.hyyzSkillAudio('meng', 'mengjvxing', player.countEnabledSlot())
						player.line(targets, 'thunder');
						exchangeShownCards(targets[0], 'meng_furina', '明·芙');
					}
				}
			},
			group: ["mengjvxing_achieve", "mengjvxing_fail"],
			subSkill: {
				achieve: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/mengjvxing5.mp3'
					],
					trigger: {
						global: "washCard",
					},
					forced: true,
					skillAnimation: true,
					animationColor: "water",
					async content(event, trigger, player) {
						player.awakenSkill('mengjvxing');
						game.log(player, '成功完成使命');
						player.changeSkin({ characterName: "meng_furina" }, "mengjvxing_achieve");
						await player.changeSkills(['mengshenyi_rewrite', 'mengrensheng'], ['mengshenyi']);

						game.filterPlayer((current) => {
							if (current == player) {
								player.say("我……真的成功了吗?");
							} else {
								if (Math.random() > 0.5) current.say(["500年来辛苦你了，芙芙！", "你也是我们心中的水神！", "芙芙，想给你一个拥抱！"].randomGet());
							};
						});
						if (!player.hasEnabledSlot()) {
							game.log('#g【踽行】-使命成功', player, '没有可交出的装备栏');
							return;
						};
						const { result: { targets } } = await player
							.chooseTarget('踽行：交出你的装备区', '将牌与装备牌转移给其他角色', true, lib.filter.notMe)
							.set('ai', (target) => get.attitude2(target));
						if (targets) {
							const target = targets[0];
							player.line(target, 'green');
							player.say('接下来就交给你了，我的龙王');
							for (let i = 1; i <= 5; i++) {
								let sort = 'equip' + i;
								let count = player.countEnabledSlot(sort);
								while (count > 0) {
									await target.expandEquip(sort);
									if (target.hasEmptySlot(sort)) {
										let card = undefined;
										if (player.hasEmptySlot(sort)) {
											//card = get.cardPile2((card) => get.type(card) == 'equip' && get.subtype(card) == sort);
										} else {
											card = player.getEquips(sort)[0];
										};
										if (card) {
											if (['h', 'e'].includes(get.position(card))) player.$give(card, target, false);
											target.equip(card);
											await player.recover();
										};
									};
									await player.disableEquip(sort);
									count--;
								}
							}
						}
					},
				},
				fail: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/mengjvxing6.mp3'
					],
					trigger: {
						player: "disableEquipAfter",
					},
					forced: true,
					filter(event, player) {
						return !player.hasEnabledSlot();
					},
					async content(event, trigger, player) {
						player.awakenSkill('mengjvxing');
						game.log(player, '使命失败');
						player.changeSkin({ characterName: "meng_furina" }, "mengjvxing_fail");
						player.changeSkills(['mengrensheng'], ['mengshenyi']);

						game.filterPlayer(function (current) {
							if (current == player) {
								player.say("对不起……真的对不起……");
							} else {
								if (Math.random() > 0.5) current.say(["这不怪你，你已经为我们付出了太多", "你已经尽力了，芙芙"].randomGet());
							};
						});
						const players = game.filterPlayer(current => current != player);
						for (let target of players) {
							let list = ['take_damage'];
							if (target.countCards('e')) list.add('discard_card');
							const control = await target.chooseControl(list, function (event, player) {
								let eff = get.damageEffect(player, player, player, "thunder");
								if (eff > 0) return "take_damage";
								if (player.hasSkillTag("noe") && player.countCards('e')) return "discard_card";
								if (!eff) return "take_damage";
								if (player.isDamaged() && player.hasCard((card) => get.name(card) == "baiyin" && get.recoverEffect(player, player, _status.event.player) > 0, "e")) return "discard_card";
								if (player.hasCard((card) => get.value(card, player) <= 0, "e") && !player.hasCard((card) => get.value(card, player) > Math.max(7, 12 - player.hp), "e")) return "discard_card";
								if ((player.hp > 2 && player.countCards("e") > 2) || (player.hp > 1 && player.countCards("e") > 3)) return "take_damage";
								return list[list.length - 1];
							}).set("prompt", "水淹七军").set("prompt2", "请选择一项：⒈弃置装备区里的所有牌；⒉受到1点雷电伤害。").forResultControl();
							if (control == "discard_card") {
								target.discard(
									target.getCards("e", (card) => lib.filter.cardDiscardable(card, target, "shuiyanqijunx"))
								);
							} else {
								var next = target.damage('source');
								game.setNature(next, "thunder", true);
							}
						}
					},
				},
			},
			derivation: ["mengrensheng"],
			"_priority": 9988,
		},
		mengshenyi: {
			audio: 13,
			logAudio: () => false,
			forced: true,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (player.isPhaseUsing()) return false;
				let evt = event.getl(player), Shown = 0;
				if (!evt || !evt.hs || !evt.hs.length) return false;

				for (let cardid in evt.gaintag_map) {
					if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) Shown++;
				};
				return 2 * Shown != evt.hs.length;
			},
			async content(event, trigger, player) {
				const enableBegin = async function (count) {
					if (!count) count = 1;
					while (count > 0) {
						if (!player.hasDisabledSlot()) break;
						for (let sort = 1; sort <= 5; sort++) {
							while (count > 0 && player.hasDisabledSlot('equip' + sort)) {
								await player.enableEquip('equip' + sort);
								count--;
							};
						}
					}
				};
				const disableEnd = async function (count) {
					if (!count) count = 1;
					while (count > 0) {
						if (!player.hasEnabledSlot()) break;
						for (let sort = 5; sort >= 1; sort--) {
							while (count > 0 && player.hasEnabledSlot('equip' + sort)) {
								await player.disableEquip('equip' + sort);
								count--;
							};
						}
					}
				};
				let Shown = 0;
				let evt = trigger.getl(player);
				for (let cardid in evt.gaintag_map) {
					if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) Shown++;
				};
				let index;
				if (Shown * 2 > evt.hs.length) {
					await enableBegin(2 * Shown - evt.hs.length);
					const count = player.countEnabledSlot();
					if (player.isPhaseUsing()) {
						if (count > 3) index = 3;
						if (count == 3) index = 2;
						if (count < 3) index = 1;
					} else {
						if (count > 3) index = 9;
						if (count == 3) index = 8;
						if (count < 3) index = 7;
					}
				} else {
					await disableEnd(evt.hs.length - 2 * Shown);
					const count = player.countEnabledSlot();
					if (player.isPhaseUsing()) {
						if (count > 3) index = 6;
						if (count == 3) index = 5;
						if (count < 3) index = 4;
					} else {
						if (count > 3) index = 13;
						if (count == 3) index = 12;
						if (count == 2) index = 11;
						if (count == 1) index = 10;
					}
				}
				game.hyyzSkillAudio('meng', 'mengshenyi', index)
			},
			group: ['mengshenyi_draw',],//'mengshenyi_yvyan'
			subSkill: {
				yvyan: {
					trigger: {
						player: 'useCard1'
					},
					filter(event, player) {
						return player.hasHistory('lose', evt => {
							if (event != evt.getParent()) return false;
							for (var cardid in evt.gaintag_map) {
								if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) return true;
							}
							return false;
						});
					},
					forced: true,
					async content(event, trigger, player) {
						game.log('#g【神仪】', player, '#g预演', '了', trigger.card, (trigger.cards.length && trigger.cards.some(i => i != trigger.cards[0])) ? `（${get.translation(trigger.cards)}）` : ``);
						trigger.yvyan = true;
					},
					"_priority": -998,
				},
				draw: {
					trigger: {
						player: ["loseAfter", "gainAfter", "disableEquipAfter", "enableEquipAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					priority: -Infinity,
					forced: true,
					filter(event, player) {
						if (player.countCards('h') >= player.countEnabledSlot()) return false;
						return ["disableEquip", "enableEquip"].includes(event.name) ||
							event.getl(player).cards2.length ||
							event.getg && event.getg(player).length;
					},
					async content(event, trigger, player) {
						const { result } = await player.draw(player.countEnabledSlot() - player.countCards('h'));
						if (result) {
							lib.translate['visible_meng_furina'] = '明·芙';
							player.addShownCards(result, 'visible_meng_furina');
						}
					},
				}
			},
			mod: {
				aiUseful(player, card, num) {
					if (get.itemtype(card) == 'card') {
						if (_status.event.getParent().name == 'phaseUse' && player == _status.currentPhase) {
							if (get.is.shownCard(card)) return num / 10;
						} else {
							if (get.is.shownCard(card)) return num * 10;
						}
					}
				},
				aiOrder() {
					lib.skill.mengshenyi.mod.aiUseful.apply(this, arguments);
				},
				aiValue(player, card, num) {
					if (get.itemtype(card) == 'card' && get.is.shownCard(card)) return num / 10;
				},
			},
			ai: {
				noh: true,
				nogain: 1,
				skillTagFilter(player, tag) {
					if (tag == 'noh' && player.countDisabledSlot() < player.countCards('h')) return false;
					if (tag == 'nogain' && player != _status.currentPhase) return true;
				},
			},
			derivation: ["mengshenyi_rewrite"],
		},
		mengshenyi_rewrite: {
			audio: 6,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (player.isPhaseUsing()) return false;
				let evt = event.getl(player), Shown = 0;
				if (!evt || !evt.hs || !evt.hs.length) return false;

				for (let cardid in evt.gaintag_map) {
					if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) Shown++;
				};
				return 2 * Shown != evt.hs.length;
			},
			async content(event, trigger, player) {
				const enableBegin = async function (count) {
					if (!count) count = 1;
					while (count > 0) {
						if (!player.hasDisabledSlot()) break;
						for (let sort = 1; sort <= 5; sort++) {
							while (count > 0 && player.hasDisabledSlot('equip' + sort)) {
								await player.enableEquip('equip' + sort);
								count--;
							};
						}
					}
				};
				const disableEnd = async function (count) {
					if (!count) count = 1;
					while (count > 0) {
						if (!player.hasEnabledSlot()) break;
						for (let sort = 5; sort >= 1; sort--) {
							while (count > 0 && player.hasEnabledSlot('equip' + sort)) {
								await player.disableEquip('equip' + sort);
								count--;
							};
						}
					}
				};
				let Shown = 0;
				let evt = trigger.getl(player);
				for (let cardid in evt.gaintag_map) {
					if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) Shown++;
				};
				if (Shown * 2 > evt.hs.length) {
					await disableEnd(2 * Shown - evt.hs.length);
				} else {
					await enableBegin(evt.hs.length - 2 * Shown);
				}
			},
			group: ['mengshenyi_draw'],
			mod: {
				aiUseful(player, card, num) {
					if (get.itemtype(card) == 'card') {
						if (_status.event.getParent().name == 'phaseUse' && player == _status.currentPhase) {
							if (get.is.shownCard(card)) return num * 10;
						} else {
							if (get.is.shownCard(card)) return num / 10;
						}
					}
				},
				aiOrder() {
					lib.skill.mengshenyi.mod.aiUseful.apply(this, arguments);
				},
				aiValue(player, card, num) {
					if (get.itemtype(card) == 'card' && get.is.shownCard(card)) return num * 10;
				},
			},
			ai: {
				noh: true,
				skillTagFilter(player, tag) {
					if (tag == 'noh' && player.countEnabledSlot() < player.countCards('h')) return false;
				},
			},
		},
		mengrensheng: {
			audio: 4,
			forced: true,
			logAudio: () => false,
			trigger: {
				player: "phaseChange",
			},
			forced: true,
			filter(event, player) {
				return ['phaseZhunbei', 'phaseJieshu'].includes(event.phaseList[event.num].split("|")[0]);
			},
			async content(event, trigger, player) {
				let str = `将${get.translation(trigger.phaseList[trigger.num].split("|")[0])}改为了`;

				if (Math.random() > 0.5) {
					trigger.phaseList[trigger.num] = 'phaseDiscard|mengrensheng';
					game.hyyzSkillAudio('meng', 'mengrensheng', 3, 4)
				} else {
					trigger.phaseList[trigger.num] = 'phaseDraw|mengrensheng';
					game.hyyzSkillAudio('meng', 'mengrensheng', 1, 2)
				}
				game.log('#g【人生】', str, trigger.phaseList[trigger.num].split("|")[0]);
			},
		},
		meng_zhongli: ['钟离', ["male", "hyyz_ys", 4, ["mengqiyue", "menglvheng", "mengminhui"], ['zhu',]], '鼎铸山河-尾巴酱', `
					特别鸣谢——<br>
					代码导师：<font color=#ff0dac>紫灵谷的骊歌</font><br>
					引路老师：<font color=#ff0dac>萨巴鲁酱</font><br>
					代码参考：<font color=#ff0dac>《忽悠宇宙》扩展</font><br>
					教科书：<font color=#ff0dac>《大宝规则集》《三国杀DIY·设计攻略&资源导航》</font><br>
					模板来源（制图在米忽悠の小宇宙群相册）：<font color=#ff0dac>幽蝶化烬</font><br>
					<hr>钟离的事迹不像芙芙一样是具体、单一、重复的，相比之下，钟离深入人心的地方是他的众多神名、众多形象、众多传说。换言之，一个故事不足以概括钟离，我对钟离的刻画，必然是片面的。<br>
					芙芙同款基础意象：装备牌=>神权/权力<br>
					因为没有岩属性，故基础意象=>装备牌=>岩神权能=>岩罚，岩盾，天星或各种岩造物<br>
					<hr>钟离 4/4 鼎铸山河<br>
					鼎=>大国重器。<br>
					以鼎喻言行分量重=>契约既成，一言九鼎<br>
					以鼎表重嶂不移=>武神荡尘涤污，璃月鼎立天下<br>
					以鼎作国家之象征=>以鼎合岩王爷之身份<br>
					<hr><b><u>契约<br>
						法则技，每名角色的出牌阶段限一次，<br>
						其可以展示一张牌并邀请其他角色展示一张牌，<br>
						该角色可以交换自己与其他角色的一张展示牌。</u></b><br>
					象征意义<br>
					钟离=>贸易之神、契约之神。<br>
					岩王爷鼓励交易=>不论敌友，每名角色都可各取所需。贸易，没有永远的敌人。<br>
					实战意义<br>
					提高卡牌利用率+增加高价值牌的传递=>增强全场“隐形”防御力，鼓励玩家断长补短=>高位面实现“岩”系防御高、重嶂不移的特色<同时>“液化”角色强度<br>
					<hr><b><u>律衡<br>
						锁定技，当牌在两名角色的区域间移动后，你抉择：<br>
						1.令失者的一个随机空装备栏置入装备牌。<br>
						2.将得者场上的一张牌当【杀】对其使用。</u></b><br>
					象征意义<br>
					钟离=>契约之神，曰：契约既成，食言者当受食岩之罚。<br>
					一名角色的牌进入另一名角色的区域=>打破平衡，以律法衡度失者的损失或惩罚贪者。<br>
					实机钟离为盾辅=>适合以装备作为补偿<br>
					对敌人出装备【杀】（而非直伤）=>“生吞”岩罚（必须“自食恶果”）<br>
					队友触发此技=>律法之下，众生平等。律衡为锁定技，无论敌我，破坏平衡者必当承担后果=>鼓励钟离主公，方便玩家配合选将，防止忠臣被克制<br>
					实战意义<br>
					单律衡=>收益迷惑且不稳定=>须搭配契约发动<br>
					意象上=>律衡与契约同为交易的一部分<br>
					收益上=>钟离通过改变律衡分支，可实现敌我区分。我的初版①为获得护甲，但收益逆天，因此改为置入装备牌。<br>
					隐性威慑=>敌人忌惮钟离对律衡②的实施=>主动放弃交易=>因为“律衡”的存在，契约和收益不会“失衡”<br>
					<hr><b><u>暝晖<br>
						主公技，限定技，其他角色造成击杀后，你将所有装备牌对其使用。</u></b><br>
					象征意义（实战意义不难理解）<br>
					暝晖=>光明与黑暗交相辉映<br>
					解读①敌人击杀队友：<br>
					<i>天星极陨，此乃天道！</i><br>
					钟离引动岩神之力，将场上的岩造物汇聚为天星砸向敌人。如何体现“砸”，只是给他装备吗？二技能律衡给出答案。该角色获得太多来自他人的装备，钟离只需执行“律衡②”，便可实现连续多刀斩杀，这是体现钟离作为“武神”杀敌的场景。<br>
					解读②队友击杀敌人：<br>
					<i>我的职责……又是否已经完成？</i><br>
					队友击杀=>璃月人民击杀魔神=>人民的成长<br>
					剧情对钟离着笔墨最多的——钟离放弃神位，贯彻以人为本的发展观。既然人民已经长大，何不安然退位，于是钟离将自己的装备尽数移动给此造成击杀的角色。不论芙芙还是钟离，装备都象征权力，让权于人，这是体现钟离作为“岩王帝君”假死卸任的场景。<br>
					这个技能非主公技不可，而因为解读①的高爆发，解读②的卸任设定，这个技能又非限定技不可。<br>`],
		mengqiyue: {
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			firstDo: true,
			forced: true,
			filter(event, player) {
				return (event.name != "phase" || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				game.filterPlayer(current => {
					current.addSkill('mengqiyue2');
				})
			},
		},
		mengqiyue2: {
			persevereSkill: true,
			forced: true,
			charlotte: true,
			locked: true,
			mark: true,
			marktext: '契约',
			intro: {
				name: '契约',
				content: `<div style="text-align: center;"><span class='bluetext'>钟离的法则</span></div><li>出牌阶段限一次，你可以展示一张牌并邀请其他角色展示一张牌，你可以交换自己与其他角色的展示牌。`
			},

			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return game.countPlayer(current => current != player && current.countCards('h') > 0);
			},
			filterCard: true,
			position: "he",
			lose: false,
			discard: false,
			delay: false,
			prompt: "契约：展示一张牌用来交易",
			check(card) {
				return 100 - get.value(card);
			},
			async content(event, trigger, player) {
				const card = event.cards[0];
				player.showCards(card, get.translation(player) + '发动了【契约】');
				card.gaintag = ['mengqiyue'];
				const { result: { control } } = await player
					.chooseControl('basic', 'trick', 'equip')
					.set('ai', function () {
						const player = _status.event.player;
						if (!player.countCards('h', card => get.type2(card) == 'trick')) return 'trick';
						return 'basic';
					})
					.set('prompt', '声明一种牌的类型');
				if (control) {
					const type = control;
					game.log(player, '想要', '#y' + get.translation(type));
					player.say('谁有' + get.translation(type) + '牌？');

					const sellers = game.filterPlayer(current => current != player && current.countCards('he', (card) => get.type2(card) == type));
					if (sellers.length > 0) {
						let commodity = [], count = 0;
						while (count < sellers.length) {
							const seller = sellers[count];
							count++;
							const { result: { cards } } = await seller.chooseCard()
								.set('position', 'he')
								.set('prompt', `契约：是否响应${get.translation(player)}对${get.translation(card)}的交易请求？`)
								.set('prompt2', `展示一张${get.translation(type)}牌作为你的商品`)
								.set('filterCard', (card) => get.type2(card) == type)
								.set('ai', (card) => {
									return get.value(card) >= get.value(_status.event.cardx) + (_status.event.att > 0 ? 2 : -2);
								})
								.set('att', get.attitude(seller, player))
								.set('cardx', card);
							if (cards) {
								commodity.add(cards[0]);
							};
						};
						if (commodity.length > 0) {
							let dialog = ui.create.dialog('###【契约】###挑选喜欢的商品', commodity);
							const getName = function (target) {
								if (target._tempTranslate) return target._tempTranslate;
								let name = target.name;
								if (lib.translate[name + '_ab']) return lib.translate[name + '_ab'];
								return get.translation(name);
							};
							for (let i = 0; i < commodity.length; i++) {
								dialog.buttons[i].querySelector('.info').innerHTML = getName(get.owner(commodity[i])) + '<br>¥' + get.useful(commodity[i]);
							};
							const { result: { links } } = await player.chooseButton(dialog)
								.set('ai', (button) => get.useful(button.link) * get.value(button.link));
							if (links) {
								game.log(player, '与', get.owner(links[0]), '#g交易成功！');
								//player.swapHandcards(get.owner(links[0]), [card], links);
								player.gain(links, 'giveAuto');
								get.owner(links[0]).gain([card], 'giveAuto');
								return;
							}
						}
					}
					game.log('#g【契约】-', '#r交易失败！');
					player.say('可惜，契约未成');
				};
			},
			ai: {
				order: 10,
				result: {
					player(player, target) {
						var current = game.findPlayer(current => current.hasSkill('mengqiyue'));
						return get.attitude(player, current) + 1.5;
					},
				},
			},
		},
		menglvheng: {
			audio: 8,
			trigger: {
				global: ["gainAfter", "equipAfter", "addJudgeAfter"/* , "loseAsyncAfter" */],
			},
			forced: true,
			filter(event, player) {
				let tos = [], froms = [], cards = [];
				switch (event.name) {
					case 'equip': {
						cards.addArray(event.cards);
						if (event.getParent(2).name == 'useCard') {
							froms.addArray(game.filterPlayer2(current => {
								if (current == event.player) return false;
								return current.hasHistory("lose", evt => {
									return evt.getParent() == event.getParent(2) && evt.cards.length > 0;
								});
							}))
						} else {
							froms.addArray(game.filterPlayer(current => {
								if (current == event.player) return false;
								let evt = event.getl(current);
								return evt && evt.cards && evt.cards.length;
							}));
						}
						tos.add(event.player);
						break;
					}
					case 'addJudge': {
						cards.addArray(event.cards);
						if (event.getParent(2).name == 'useCard') {
							froms.addArray(game.filterPlayer2(current => {
								if (current == event.player) return false;
								return current.hasHistory("lose", evt => {
									return evt.getParent() == event.getParent(2) && evt.cards.length > 0;
								});
							}))
						} else {
							froms.addArray(game.filterPlayer(current => {
								if (current == event.player) return false;
								let evt = event.getl(current);
								return evt && evt.cards && evt.cards.length;
							}));
						}
						tos.add(event.player);
						break;
					}
					case 'gain': {
						cards = event.getg(event.player);
						froms.addArray(game.filterPlayer(current => {
							if (current == event.player) return false;
							let evt = event.getl(current);
							return evt && evt.cards && evt.cards.length;
						}));
						tos.add(event.player);
						break;
					}
					default: {
						break;
					}
				};
				if (!cards.length) return false;
				if (froms.length >= 1 && tos.length == 1) {//一分多
					return froms[0].countEnabledSlot() > froms[0].countCards('e') || tos.some(current => {
						return current.countCards('e', (card) => {
							return lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), player, current);
						})
					})
				}
				else if (froms.length == 1 && tos.length >= 1) {//多给一
					return froms.some(current => current.countEnabledSlot() > current.countCards('e')) || tos[0].countCards('e', (card) => {
						return lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), player, tos[0]);
					})
				};
				return false;
			},
			async content(event, trigger, player) {
				let tos = [], froms = [], cards = [];
				switch (trigger.name) {
					case 'equip': {
						cards.addArray(trigger.cards);
						if (trigger.getParent(2).name == 'useCard') {
							froms.addArray(game.filterPlayer2(current => {
								if (current == trigger.player) return false;
								return current.hasHistory("lose", evt => {
									return evt.getParent() == trigger.getParent(2) && evt.cards.length > 0;
								});
							}))
						} else {
							froms.addArray(game.filterPlayer(current => {
								if (current == trigger.player) return false;
								let evt = trigger.getl(current);
								return evt && evt.cards && evt.cards.length;
							}));
						}
						tos.add(trigger.player);
						break;
					}
					case 'addJudge': {
						cards.addArray(trigger.cards);
						if (trigger.getParent(2).name == 'useCard') {
							froms.addArray(game.filterPlayer2(current => {
								if (current == trigger.player) return false;
								return current.hasHistory("lose", evt => {
									return evt.getParent() == trigger.getParent(2) && evt.cards.length > 0;
								});
							}))
						} else {
							froms.addArray(game.filterPlayer(current => {
								if (current == trigger.player) return false;
								let evt = trigger.getl(current);
								return evt && evt.cards && evt.cards.length;
							}));
						}
						tos.add(trigger.player);
						break;
					}
					case 'gain': {
						cards = trigger.getg(trigger.player);
						froms.addArray(game.filterPlayer(current => {
							if (current == trigger.player) return false;
							let evt = trigger.getl(current);
							return evt && evt.cards && evt.cards.length;
						}));
						tos.add(trigger.player);
						break;
					}
					default: {
						break;
					}
				};
				if (tos.length >= 1 && froms.length == 1) {
					froms.length = tos.length;
					froms.fill(froms[0], 1);
				};
				if (froms.length >= 1 && tos.length == 1) {
					tos.length = froms.length;
					tos.fill(tos[0], 1);
				};
				for (let i = 0; i < tos.length; i++) {
					const to = tos[i], from = froms[i];
					var strs = [];
					if (from.countEnabledSlot() > from.countCards('e')) {
						strs.add(`补偿：令${get.translation(from)}的一个随机空装备栏置入装备牌`)
					}
					if (to.countCards('e', (card) => {
						return lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), player, to);
					})) {
						strs.add(`岩罚：将${get.translation(to)}场上的一张牌当【杀】对其使用`)
					}

					const { result: { index } } = await player
						.chooseControlList(true, strs, '律衡：食言者，当受食岩之罚！')
					if (strs[index].slice(0, 2) == '补偿') {
						let sort = [1, 2, 3, 4, 5].filter(sort => from.countEmptySlot('equip' + sort) > 0).randomGet();
						let card = get.cardPile(card => {
							return get.type(card, false) == 'equip' && get.subtype(card, false) == 'equip' + sort && !get.cardtag(card, 'gifts') && from.canEquip(card);
						});
						if (card) from.equip(card);
					} else {
						let links;
						if (to.countCards('e', (card) => lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), player, to)) == 1) {
							links = to.getCards('e', (card) => lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), player, to));
						} else {
							let next = player.choosePlayerCard();
							next.set('forced', true);
							next.set('target', to);
							next.set('position', 'e');
							next.set('filterButton', (button) => {
								let card = button.link;
								return lib.filter.targetEnabled2(get.autoViewAs({ name: 'sha' }, [card]), _status.event.player, _status.event.target);
							});
							links = (await next).result.links;
						}
						if (links) {
							player.line(to);
							player.useCard({ name: 'sha' }, links, to, false);
						}
					}
				}
			},
		},
		mengminhui: {
			audio: 1,
			unique: true,
			mark: true,
			skillAnimation: true,
			animationStr: "暝晖",
			animationColor: "yellow",
			intro: {
				content: "limited",
			},
			trigger: {
				global: "dieAfter",
			},
			limited: true,
			zhuSkill: true,
			filter: function (event, player) {
				if (!player.hasZhuSkill('mengminhui')) return false;
				if (!player.countCards('hes', { type: 'equip' })) return false;
				return event.source && event.source != player && event.source.isIn();
			},
			check(event, player) {
				return get.attitude(player, event.source) < -2 && player.countCards('hes', { type: 'equip' }) >= Math.min(3, event.source.hp);
			},
			logTarget: "source",
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				let cards = player.getCards('hes', { type: 'equip' });
				while (cards.length > 0) {
					await player.useCard(cards.shift(), trigger.source);
				};
			},
			ai: {
				expose: 2,
			},
		},
		meng_nahida: ['纳西妲', ["female", "hyyz_ys", "3/4", ["mengkunchu", "mengxvkong", "mengzhuSun"], ['zhu',]], '破土新芽-尾巴酱', `
					特别鸣谢——<br>
					代码导师：<font color=#ff0dac>紫灵谷的骊歌</font><br>
					引路老师：<font color=#ff0dac>萨巴鲁酱</font><br>
					代码参考：<font color=#ff0dac>
						《忽悠宇宙》扩展</font><br>
						教科书：<font color=#ff0dac>《大宝规则集》《三国杀DIY·设计攻略&资源导航》</font><br>
						模板来源（制图在米忽悠の小宇宙群相册）：<font color=#ff0dac>幽蝶化烬</font><br>
					<hr>
					基础意象：装备牌栏=>神权及其外显。<br>
					基础意象：装备牌栏=>神权及其外显。<br>
					纳西妲的设计需要平衡本我，自我，超我三个概念。大慈树王以超我的姿态舍命救世；而纳西妲则在种种经历中重新找回并审视“自我”，成为新一代草之神。<br>
		
					<hr><b>纳西妲 3/4
						破土新芽</b><br>
						这个称号简单清新，描述了纳西妲的新芽本质，营造纳西妲身为新神在磨难下破土而出、破茧成蝶的情景。体力值的设计，保留温迪钟离和影纯正神躯的高上限4，而非芙宁娜的凡体3，考虑到纳西妲年幼、自我认知尚不成熟，因而体力值有所缺失。<br>
					<hr>
					<b>困雏<br>
						锁定技，[否极技]，你不能对未对你使用过牌的其他角色使用牌，没有扩展栏的其他角色对你使用牌时，获得你一个[装备栏]。<br>
						泰来：你本巡调离。</b><br>
					⑴锁定技=>不容改变的无力感<br>
					⑵☞现实屏障：教令院<br>
					┗游戏开始时无法对他人使用牌=>被关在教令院中无依无靠<br>
					┗∵装备栏=>权能<br>
					∴扩展装备栏=>草神权能的外放☞虚空终端<br>
					⑶☞内心屏障：超我的认知<br>
					┗不在乎纳西妲的人=>也无法接触之<br>
					┗对纳西妲使用了牌=>恰似夜中曙光<br>
					┗纳西妲对此人用牌=>借此窥见世间<br>
					⑷有人使用终端后，纳西妲可以借虚空的漏洞看到现实世界。而她被教令院囚禁后，虽然不能再看到外界，但得以重新审视自己，找回遗失的“本我”。<br>
					⑸p.s.否极技：民间标签。相当于无序有多个选项的转换技，选项全部选择后，触发“泰来”效果并重置此技。<br>
					本技能中，选项的执行为装备栏的废除；泰来触发后复原所有装备栏。<br>
					此处取“否极泰来”的内涵，异常合适<br>
					┗装备栏全废=>纳西妲被架空☞移出游戏☞消失在民众视野中=>囚禁的末路，救赎的开始=>既是否极，亦是泰来<br>
					本巡：民间标签。范围是角色每两个“回合开始时”之间的时间段，长度与一轮相同。<br>
					⑹泰来前☞〖困雏〗锁定技，纳西妲正如她向往的大慈树王一般，以透支自己的超我姿态无差别帮助所有人☞因为纳西妲从未将大贤者视为敌人和威胁，在她眼中，他们都是自己守护的对象。即使哭泣着表示“我有点生气了”，也依然像“慈母”般仅仅是责怪这些“犯错的孩子”。<br>
					⑺泰来后☞纳西妲从阴影中走出，重新认知“自我”后不再忽视自己的感受，甚至扬言要“报复”大贤者（真是有点可爱呢）。这个时候纳西妲已经得到了他人充足的关注，不再是孤身一人。<br>
					获得装备栏的操作流程是：①来源有扩展栏，删除此扩展栏；否则，废除一个装备栏。②目标直接获得一个扩展栏。<br>
					纳西妲被困的险境得以还原。当玩家感到憋屈无力的时候，如果能理解纳西妲当初比这难受一千万倍的感受，此番设计却也不算白费。<br>
		
					<hr>
					<b>虚空<br>
						装备栏异常的其他角色回合开始时，你可令其初始化装备栏，然后卜算2并与其各摸一张牌。因此获得含其他牌名的牌的角色废除一个装备栏或失去1点体力。</b><br>
					⑴☞大贤者的运营下，民众对虚空的滥用<br>
					⒈装备栏异常=>扩展栏是虚空<br>
					⒉初始化装备栏=>为民众排忧解难<br>
					⒊卜算=>终端的作用<br>
					⑵☞纳西妲被虚空“边缘化”“工具化”<br>
					⒈虽名为“虚空”，其也表现了技能拥有者——纳西妲无私奉献的过程。<br>
					⒉扩展装备栏何来☞来自〖困雏〗中纳西妲的给予<br>
					⑶☞纳西妲舍身救助须弥的生灵<br>
					⒈装备栏为神力=>异常则力量异常<br>
					⒉初始化装备栏=>为生灵解毒救助<br>
					⑷描述中包含其他牌=>可能很难被get到。<br>
					解读1：普通知识中隐藏的“禁忌知识”<br>
					解读2：剧情里艾尔海森植入的“木马”<br>
					解毒3：为生灵奉献自己的力量导致自身虚弱<br>
					将“一张牌里藏的另一张牌”视为入侵信息。入侵后，对民众和纳西妲都有害，且该角色须销毁终端。<br>
		
					<hr>
					<b>逐光<br>
						锁定技，你使用单体牌时，分配使用者与目标至不同角色。若包含你，你摸一张牌。</b><br>
					这个技能看似是辅助前二者的，但此技本身却又恰好成为纳西妲的最核心机制。<br>
					⑴锁定技=>为了玩家操作的便捷，不用一直点确定<br>
					⑵☞泰来前的纳西妲难道真的只能等人来救吗？<br>
					当有人首次对纳西妲使用牌后，纳西妲可以通过对此人使用牌，然后发动〖逐光〗改为令其他角色对自己使用，从而触发〖困雏〗给出虚空终端（额外装备栏），扩大自己接触外界的突破口。<br>
					纳西妲亦可自我救赎。她对自己使用牌时，也可以改为他人对纳西妲使用此牌，实现自创突破口。<br>
					⑶☞纳西妲困在教令院真的就对外界0接触吗?<br>
					当然不是，纳西妲通过虚空拯救了阿如村，拯救了迪娜泽黛，还帮助了许多迷茫或受难的须弥人。纳西妲使用牌可以实现离间敌人或明策队友，即使纳西妲不直接接触这些人，亦可通过此法提供帮助。<br>
		
					<hr>
					<b>总结</b><br>
					☞〖困雏〗纳西妲虽然依靠他人打开突破口；但她亦可〖逐光〗自救，并非妄自菲薄，自暴自弃。<br>
					☞纳西妲虽〖逐光〗为他人指明方向，催动他人行动；但自己“泰来”后亦能摆脱〖困雏〗身份，而非待人以严，待己以宽。<br>
					☞纳西妲亦可如她向往的大慈树王般，拥有舍命救世的决心，敢承受“禁忌知识”的伤害；但亦有手段消除“禁忌知识”，在未来的草主之路走出了独属于自己的人生。<br>
					☞纵使前期被〖虚空〗所限，但后期亦可利用〖虚空〗造福民众。这是一个神明成长的过程，让我们见证一个最有担当、最有责任感的神明的诞生吧。`],
		mengkunchu: {
			audio: 17,
			logAudio: () => [
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu1',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu2',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu3',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu4',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu5',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu6',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu7',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu8',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu9',
				'ext:忽悠宇宙/asset/meng/audio/mengkunchu10',
			],
			mod: {
				playerEnabled(card, player, target) {
					if (target != player) {
						if (!target.getAllHistory('useCard', evt => evt.targets.includes(player)).length) return false;
					}
				},
			},
			trigger: {
				target: "useCardToPlayer",
			},
			filter(event, player) {
				if (player.countExpandedSlots()) return false;
				return event.player != player && player.hasEnabledSlot() && !event.player.countExpandedSlots();
			},
			forced: true,
			logTarget: "player",
			async content(event, trigger, player) {
				//trigger.getParent().excluded.add(player);
				if (trigger.player != player) {
					trigger.player.say(['纳西妲！', '小吉祥草王，我们来救你了！', '不要放弃，草神大人！', '我们一直信仰着你啊！'].randomGet());
				};
				if (player.countExpandedSlots() && Object.keys(player.getExpandedSlots()).length) {
					let list = Object.keys(player.getExpandedSlots());
					list.sort();
					const control = list.length > 1 ? (await trigger.player
						.chooseControl(list)
						.set('prompt', `移除${get.translation(player)}的一个扩展装备栏`)
						.forResultControl()) : list[0];
					trigger.player.expandEquip(control);
					player.deleteEquip(control);
				}
				else if (player.hasEnabledSlot()) {
					let list = [];
					for (var i = 1; i <= 5; i++) {
						if (player.hasEnabledSlot('equip' + i)) list.push('equip' + i);
					}
					list.sort();
					const control = list.length > 1 ? (await trigger.player
						.chooseControl(list)
						.set('prompt', '废除一个装备栏')
						.forResultControl()) : list[0];
					trigger.player.expandEquip(control);
					player.disableEquip(control);
				}
			},
			group: "mengkunchu_disable",
			subSkill: {
				disable: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu11',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu12',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu13',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu14',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu15',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu16',
						'ext:忽悠宇宙/asset/meng/audio/mengkunchu17',
					],
					trigger: {
						player: "disableEquipAfter",
					},
					forced: true,
					filter(event, player) {
						return !player.hasEnabledSlot();
					},
					async content(event, trigger, player) {
						player.addTempSkill('mengkunchu_out', { player: 'phaseBegin' });
						player.addTempSkill('undist', { player: 'phaseBegin' });
					},
				},
				out: {
					charlotte: true,
					init(player) {
						if (player.isIn()) {
							game.broadcastAll(function (player) {
								player.classList.add('out');
							}, player);
							game.log(player, '移出了游戏');
						}
					},
					onremove(player) {
						for (let slot = 1; slot < 6; slot++) {
							if (player.countDisabledSlot('equip' + slot) > 0) {
								let count = player.countDisabledSlot('equip' + slot);
								for (let i = 0; i < count; i++) {
									player.enableEquip('equip' + slot);
								}
							};
						}
						if (player.isOut()) {
							game.broadcastAll(function (player) {
								player.logSkill('mengkunchu_disable')
								player.classList.remove('out');
							}, player);
							game.log(player, '移回了游戏');
						};
					},
					sub: true,
					"_priority": 0,
				},
			},
		},
		mengxvkong: {
			audio: 8,
			trigger: {
				global: "phaseBegin",
			},
			filter(event, player) {
				if (player == event.player) return false;
				return event.player.countExpandedSlots() > 0 || event.player.hasDisabledSlot();
			},
			//forced: true,
			logTarget: 'player',
			async content(event, trigger, player) {
				if (trigger.player.countExpandedSlots() > 0) {
					let count = trigger.player.countExpandedSlots();
					let list = Object.keys(trigger.player.getExpandedSlots());
					list.sort();
					while (list.length > 0) {
						trigger.player.deleteEquip(list.shift());
					}
				};
				if (trigger.player.countDisabledSlot() > 0) {
					let count = trigger.player.countDisabledSlot();
					let list = [];
					for (var i = 1; i <= 5; i++) {
						if (trigger.player.hasDisabledSlot('equip' + i)) list.push('equip' + i);
					}
					list.sort();
					while (list.length > 0) {
						trigger.player.enableEquip(list.shift());
					}
				}
				const hasInclusion = function (card) {
					let list = [];
					const info = lib.translate[card.name + '_info'];
					if (!info || info == {}) return [];
					const pile_names = Object.keys(lib.card);
					for (const name of pile_names) {
						if (get.translation(name) == get.translation(card.name)) continue;
						const reg = `【${get.translation(name)}】`;
						if (info.includes(reg)) list.add(reg);
						if (name == 'sha') {
							for (let nature of lib.inpile_nature) {
								const reg1 = `【${get.translation(nature) + get.translation(name)}】`;
								const reg2 = `${get.translation(nature)}【${get.translation(name)}】`;
								if (info.includes(reg1)) list.add(reg1);
								if (info.includes(reg2)) list.add(reg2);
							}
						}
					}
					return list;
				};
				if (!event.player.isIn() || !player.isIn()) return;
				const cards = get.cards(2);
				game.cardsGotoOrdering(cards);
				let next = player.chooseToMove();
				next.set('list', [
					['牌堆顶', cards],
					['牌堆底'],
				]);
				next.set('prompt', '虚空：点击将牌移动到牌堆顶或牌堆底');
				next.set('targetx', trigger.player);
				next.set('filterMove', (from, to, moved) => {
					return true || typeof to != 'number';
				});
				next.set('processAI', (list) => {
					let cards = list[0][1].slice(0);
					cards.sort((a, b) => get.value(b) - get.value(a));
					let tops = [];
					tops.add(cards.shift());
					if (get.attitude2(_status.event.targetx) > 0) {
						tops.add(cards.shift());
					} else {
						tops.add(cards.pop());
					}
					return [tops, cards];
				});
				const { result: { moved } } = await next;
				if (moved) {
					let top = moved[0], bottom = moved[1];
					top.reverse();
					player.$throw(top);
					for (var i = 0; i < top.length; i++) {
						ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
					}
					for (i = 0; i < bottom.length; i++) {
						ui.cardPile.appendChild(bottom[i]);
					}
					game.addCardKnower(top, player);
					game.addCardKnower(bottom, player);
					player.popup(get.cnNumber(top.length) + "上" + get.cnNumber(bottom.length) + "下");
					game.log(player, "将" + get.cnNumber(top.length) + "张牌置于牌堆顶");
					game.updateRoundNumber();
					await game.delayx();

					const { result: cards1 } = await player.draw();
					const { result: cards2 } = await trigger.player.draw();

					if (!hasInclusion(cards1[0]).length && !hasInclusion(cards2[0]).length) {
						game.hyyzSkillAudio('meng', 'mengxvkong', 1, 2, 3, 4, 5, 6, 7, 8)
					}
					if (hasInclusion(cards1[0]).length && player.isIn()) {
						let list = [];
						for (var i = 1; i <= 5; i++) {
							if (player.hasEnabledSlot('equip' + i)) list.push('equip' + i);
						};
						list.sort();
						list.add('cancel2')
						const control = list.length > 1 ? (await player
							.chooseControl(list)
							.set('prompt', '废除一个装备栏或失去1点体力')
							.forResultControl()) : list[0];
						if (control == 'cancel2') player.loseHp();
						else player.disableEquip(control);
					};
					await game.asyncDelayx();
					if (hasInclusion(cards2[0]).length) {
						let list = [];
						for (var i = 1; i <= 5; i++) {
							if (trigger.player.hasEnabledSlot('equip' + i)) list.push('equip' + i);
						};
						list.sort();
						list.add('cancel2')
						const control = list.length > 1 ? (await trigger.player
							.chooseControl(list)
							.set('prompt', '废除一个装备栏或失去1点体力')
							.forResultControl()) : list[0];
						if (control == 'cancel2') trigger.player.loseHp();
						else trigger.player.disableEquip(control);
					}
				}
			},
			"_priority": 0,
		},
		mengzhuSun: {
			trigger: {
				player: "useCardBefore",
			},
			filter: function (event, player) {
				if (!event.targets.length || event.targets.length != 1) return false;
				return game.hasPlayer(function (user) {
					return game.hasPlayer((target) => user != target && lib.filter.targetEnabled2(event.card, user, target));
				});
			},
			forced: true,
			async content(event, trigger, player) {
				if (false && game.hasPlayer((current) => lib.filter.targetEnabled2(trigger.card, current, current))) {
					const { result: { targets: targets1 } } = await player.chooseTarget(true, `逐光：选择一名角色`, `选择${get.translation(trigger.card)}的使用者`, function (card, player, target) {
						var trigger = _status.event.getTrigger();
						return game.hasPlayer(current => lib.filter.targetEnabled2(trigger.card, target, current));
					}).set('ai', function (target) {
						const trigger = _status.event.getTrigger(), player = _status.event.player;
						let eff = target.getUseValue(trigger.card);
						if (!target.getAllHistory('useCard', evt => evt.targets && evt.targets.includes(player)).length) {
							eff *= 1.5;
						}
						return eff;
					});
					if (targets1) {
						const { result: { targets: targets2 } } = await player.chooseTarget(true, `逐光：选择一名角色`, `选择${get.translation(targets1)}使用${get.translation(trigger.card)}的目标`, function (card, player, target) {
							var trigger = _status.event.getTrigger();
							return lib.filter.targetEnabled2(trigger.card, targets1[0], target);
						}).set('ai', function (target) {
							const trigger = _status.event.getTrigger(), card = trigger.card, player = _status.event.player;
							const user = _status.event.user;
							let eff = get.effect(target, card, user, player);
							if (!user.getAllHistory('useCard', evt => evt.targets && evt.targets.includes(player)).length) {
								if (eff > 0 && target == player) eff *= 1.5;
							}
							return eff;
						}).set('user', targets1[0]);
						if (targets2) {
							trigger.player = targets1[0];
							trigger.targets = targets2;
						}
					}
				}
				else if (game.hasPlayer((current) => {
					return game.hasPlayer((current2) => {
						if (current == current2) return false;
						if (get.type(trigger.card) == 'equip' && !current2.canEquip(trigger.card, true)) return false;
						if (get.type(trigger.card) == 'delay' && !current2.canAddJudge(trigger.card)) return false;
						return lib.filter.targetEnabled2(trigger.card, current, current2)
					})
				})) {
					const { result: { targets } } = await player.chooseTarget(2, '逐光：选择两名角色', `依次为${get.translation(trigger.card)}的使用者和目标`, function (card, player, target) {
						var trigger = _status.event.getTrigger();
						if (!ui.selected.targets.length) {
							if (get.type(trigger.card) == 'equip' && !target.canEquip(trigger.card, true)) return false;
							if (get.type(trigger.card) == 'delay' && !target.canAddJudge(trigger.card)) return false;
							return game.hasPlayer(current => lib.filter.targetEnabled2(trigger.card, target, current));
						} else {
							return lib.filter.targetEnabled2(trigger.card, ui.selected.targets[0], target);
						}
					}).set('ai', function (target) {
						const trigger = _status.event.getTrigger(), card = trigger.card, player = _status.event.player;
						if (!ui.selected.targets.length) {
							let eff = target.getUseValue(card);
							if (!target.getAllHistory('useCard', evt => evt.targets && evt.targets.includes(player)).length) {
								eff *= 1.5;
							}
							return eff;
						} else {
							var user = ui.selected.targets[0];
							let eff = get.effect(target, card, user, player);
							if (!user.getAllHistory('useCard', evt => evt.targets && evt.targets.includes(player)).length) {
								if (eff > 0 && target == player) eff *= 1.5;
							}
							return eff;
						}
					});
					if (targets) {
						trigger.player = targets[0];
						trigger.targets = [targets[1]];
						if (trigger.player == player || trigger.targets.includes(player)) await player.draw();
					}
				}
			},
			ai: {
				effect: {
					player(card, player, target, current) {
						return 5;
					},
				},
			},
		},
		meng_leidianying: ['雷电影', ["female", "hyyz_ys", 4, ["mengwuwang", "mengwuxiang"], ['zhu',]], '断目销魂-尾巴酱', `
					特别鸣谢——<br>
					代码导师：<font color=#ff0dac>紫灵谷的骊歌</font><br>
					引路老师：<font color=#ff0dac>萨巴鲁酱</font><br>
					代码参考：<font color=#ff0dac> 《忽悠宇宙》扩展</font><br>
					教科书：<font color=#ff0dac>《大宝规则集》《三国杀DIY·设计攻略&资源导航》</font><br>
					模板来源（制图在米忽悠の小宇宙群相册）：<font color=#ff0dac>幽蝶化烬</font><br>
					<hr>基础意象：装备栏=>神权。<br>
					<hr>
					影先后失去三位友人天狗“笹百合”、鬼族少女“御舆千代”、狐主“狐斋宫”、和孪生姐姐雷电真。逐渐碎裂的回忆撕裂她的内心，「前进就会有所失去」令影不再相信未来。为了维持现状，留住身边的一切，影造出了雷电将军，化为意识隐入「梦想一心」中，许以臣民千世万代不变不移的「永恒」。<br>
					<hr><b><u>影 4
							断目销魂<br>
						</u></b>“断目销魂”取自“目断魂销”，原意是指竭尽目力也看不见，内心十分悲痛。“目断魂销”适合表现影失去故友时的绝望的心情，但我们也知道，影最终走出阴霾，看到了人民心存的梦想和希望。将这个词改为有主动内涵的“断目销魂”，意为告别过去，走向未来；如“梦想一心”般，斩悲痛为决心。<br>
					<hr><b><u>无妄<br>
							锁定技，你的初始牌为【影】。你受到伤害时，或一名角色的判定结果确定为黑色时，你改为将一个{首项}当雷【杀】使用，结算中目标角色与{此项}类型相同的元素失效。<br>
							{①【影】② 护甲 ③
							普通技能}<br>
							无想<br>
							锁定技。每回合结开始时，若〖无妄〗：没有项目，你装备【梦想一心】；有项目，但你没有{首项}的元素，你删除此项并获得{同序号的技能}。<br>
							{①〖无念〗②〖无梦〗③〖无我〗}<br>
						</u></b>①〖无妄〗“目标角色本回合与{此项}类型相同的元素失效”，其实很好理解：<br>
					☞影牌=>牌失效=>强命<br>
					☞护甲=>护甲失效=>无视护甲<br>
					☞普通技能=>普通技能失效=>封技能<br>
					②〖无想〗的第一句，会根据〖无妄〗的执行进度抉择，〖无妄〗的选项全部删除后，影将获得【梦想一心】。<br>
					第一形态：【影】当雷杀，无子技能<br>
					①初始牌为四张【影】=>影的三位故友和姐姐真<br>
					失去【影】的方式，可能是弃置(被灾厄吞没的狐斋宫)，可能被敌人顺走(因发疯而对影挥刀的千代)，可能当杀使用(为稻妻战斗而陨落的百合)，失去最后一张(陨落的真)后，〖无妄〗会在〖无想〗的驱使下切换形态。三国杀的“牌”失去的方式恰好对应“剧情中人物”的逝去方式，这种“巧合”实在可遇不可求<br>
					②受到伤害时/判定为黑色=>友人逝去的原因=>守护/天灾<br>
					第二形态：护甲当雷杀+〖无念〗<br>
					①影的所有故友都逝去之后，影陷入极度的迷茫和痛苦。因为不断的“失去”，影开始坚信永恒可以留住一切，于是开始制备人偶（护甲），自己则前往“梦想一心”的净土闭关。<br>
					<hr>
					<b><u>无念<br>
							每回合结束后，若本回合没有角色对你使用过牌，你可以废除一个非武器栏，然后获得一枚护甲。</u></b><br>
					②结束阶段=>时机略早于〖无想〗，可以消耗非武器栏制备人偶。<br>
					③没有人对你使用牌=>影孤身一人作出的抉择<br>
					④非武器栏=>基础意象，象征雷神除无想的一刀外的权能<br>
					⑤换了护甲=>影用雷神权能换了执行永恒的人偶-雷电将军（甚至神之心都不要了）<br>
					⑥〖无妄〗中护甲当无视护甲的雷杀使用=>影授予人偶力量，其代行“御前决斗”的裁决<br>
					第三形态：非锁定技当雷杀+〖无念〗〖无梦〗<br>
					①在愚人众摸清人偶的行事法则后，诱导雷电将军实施“眼狩令”，为稻妻带来了巨大的危机。<br>
					<hr>
					<b><u>无梦<br>
							你使用【杀】指定目标后，获得目标角色一个失效的普通技能；然后若其有未失效的技能，你失去一个普通技能。</u></b><br>
					②普通技能=>普通人的神之眼<br>
					③〖无妄〗令技能本回合失效=>眼狩令<br>
					④〖无梦〗获得此技能=>神之眼?拿来吧你！<br>
					⑤未失效的技能=>大多数特殊技能，锁定技/使命技/觉醒技/限定技等等=>未被收缴的神之眼表示宵宫、托马、神里绫华、神里绫人、早柚、九条裟罗……以及没有神之眼的爷！他们是变数，是影追求永恒的阻碍。若有他们，将军的眼狩令便难以推行。<br>
					⑥如果想要到达下一阶段，需要影失去已有所有普通技能，包括〖无念〗和〖无梦〗。这意味着，影要想真正认识到无法达到的永恒，首先要放下自己的一切，有舍才有得。<br>
					⑦这个技能不会让敌人失去技能技能，通常情况只是普通技能的获得又失去（根本留不住神之眼好吧），而因为〖无妄〗的存在，所有普通技能都迟早会失去。<br>
					第四形态：〖无妄〗〖无想〗化为“妄想”<br>
					只剩〖无我〗<br>
					①因为违背了将军的理念，影的身体和意识产生了冲突。〖无我〗技能是影对自我的反思和矫正，象征着影的新生，象征着她将目光从过去投向未来，从自我投向外在。<br>
					<hr>
					<b><u>无我<br>
							锁定技，你使用【杀】后，若目标角色未改变体力值，你重铸一张牌且此【杀】不计入次数上限；否则，你将其的一张牌移至你的合法区域。</u></b><br>
					②使用【杀】未改变敌人的体力，一是被抵消了，二是濒死救回来了，都意味着对方坚不可摧，不易击溃。影会因此产生信仰的动摇，重铸和双刀是自我反思；而击败对方则可以夺回身体的掌控权。<br>
					<hr>
					P.S.<br>
					☞可以看到影的觉醒流程非常长，虽然设计上需要精打细算，但真实游玩时每一步都可以逃课。这也是修复之前的几个设计发育期过长的毛病。<br>
					跳过方式为：<br>
					☞第一阶段，丢弃浪费【影】牌。<br>
					☞第二阶段，不补充护甲。<br>
					☞第三阶段，这个阶段本来就很短暂，技能本就不多，抗两下就没了<br>
					但是需要注意，影其实是前期将，在获得〖无我〗前拥有多刀和防御能力，拖到后期反而严重匮乏防御力和进攻性，应当速战速决。<br>
					p.s.影的缺陷是卡距离，如果攻击范围内没有敌人，影要么被迫杀队友，要么无法免伤，分分钟崩盘。<br>
					<hr>
					<b><u>总结</u></b><br>
					影的整体设计，需要还原她失去友人=>造出人偶=>将军狩梦=>重审自己的过程，分别用【影】=>护甲=>普通技能=>重铸和移动牌代表这些事物。“失去”作为令影痛苦的根源，贯彻了整个武将；虽然影失去了以上种种，但也因此守护了她心爱的稻妻——她所失去的一切，换来的是稻妻的和平。人虽然最终会失去一切，但相比失去的东西，能留下什么才是我们应该在乎的。痛定思痛，痛何如哉?`],
		mengwuwang: {
			audio: 7,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang1.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang2.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang3.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang4.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang5.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengwuwang6.mp3",
			],
			init: (player, skill) => {
				game.hyyzSkillAudio('meng', 'mengwuwang', 7)
				player.storage[skill] = {
					card: (player) => player.countCards('h', { name: 'ying' }) > 0,
					hujia: (player) => player.hujia > 0,
					skill: (player) => lib.skill.mengwumeng.skills_normal([player]).length > 0,
				}
			},
			trigger: {
				player: 'damageBefore',
				global: 'judgeFixing',
			},
			filter(event, player) {
				if (event.name != 'damage' && (!event.result || event.result.color != 'black')) return false;
				let list = player.getStorage('mengwuwang'), keys = Object.keys(list);
				if (keys.length > 0) return list[keys[0]](player) && player.hasUseTarget({ name: 'sha', nature: 'thunder' });
				return false;
			},
			forced: true,
			async content(event, trigger, player) {
				if (trigger.name == 'damage') {
					trigger.cancel()
				} else {
					evt.finish();
					evt._triggered = null;
					if (evt.name.startsWith('pre_')) {
						var evtx = evt.getParent();
						evtx.finish();
						evtx._triggered = null;
					}
					var nexts = trigger.next.slice();
					for (var next of nexts) {
						if (next.name == 'judgeCallback') trigger.next.remove(next);
					}
					var evts = game.getGlobalHistory('cardMove', function (evt) {
						return evt.getParent(2) == trigger.getParent();
					});
					var cards = [];
					for (var i = evts.length - 1; i >= 0; i--) {
						var evt = evts[i];
						for (var card of evt.cards) {
							if (get.position(card, true) == 'o') cards.push(card);
						}
					}
					trigger.orderingCards.addArray(cards);
				}
				await game.delayx();
				const storage = player.getStorage('mengwuwang'), type = Object.keys(storage);
				if (storage[type[0]](player) && player.hasUseTarget({ name: 'sha', nature: 'thunder' })) {
					switch (type[0]) {
						case 'card': {
							const [cards, targets] = await player.chooseCardTarget({
								prompt: '选择雷<span class="yellowtext">【杀】</span>（<span class="yellowtext">【影】</span>）的目标',
								position: 'h',
								forced: true,
								filterCard(card) {
									return card.name == 'ying';
								},
								selectCard: 1,
								filterTarget(card, player, target) {
									return player.canUse({ name: 'sha', nature: 'thunder' }, target);
								},
								ai1(card) {
									return true;
								},
								ai2(target) {
									let player = _status.event.player;
									return get.effect(target, { name: 'sha', nature: 'thunder' }, player, player);
								},
							}).forResult('cards', 'targets');
							if (cards && targets) {
								const target = targets[0];
								player.logSkill('mengwuwang', target);
								target.addTempSkill('mengwuwang_card');
								target.storage.mengwuwang_card.add(trigger.card);
								target.markSkill('mengwuwang_card');
								await player.useCard(get.autoViewAs({ name: 'sha', nature: 'thunder' }, cards), cards, target, false);
								return;
							}
							break;
						}
						case 'hujia': {
							const targets = await player
								.chooseTarget(true, '选择雷<span class="yellowtext">【杀】</span>（<span class="yellowtext">护甲</span>）的目标', function (card, player, target) {
									return player.canUse({ name: 'sha', nature: 'thunder' }, target);
								})
								.set('ai', (target) => {
									var player = _status.event.player;
									return get.effect(target, { name: 'sha', nature: 'thunder' }, player, player);
								}).forResultTargets()
							if (targets) {
								const target = targets[0];
								player.logSkill('mengwuwang', target);
								target.addTempSkill('mengwuwang_hujia');
								target.storage.mengwuwang_hujia.add(trigger.card);
								target.markSkill('mengwuwang_hujia');
								player.changeHujia(-1);
								await player.useCard(get.autoViewAs({ name: 'sha', nature: 'thunder' }, []), [], target, false);
								return;
							}
							break;
						}
						case 'skill': {
							let skills = lib.skill.mengwumeng.skills_normal([player]);
							const control = await player.chooseControl(skills)
								.set('prompt', '选择当雷<span class="yellowtext">【杀】</span>使用的技能').set('forced', true).set('ai', () => {
									return skills.randomGet();
								})
								.forResultControl();
							if (control) {
								const targets = await player
									.chooseTarget(true, '选择雷<span class="yellowtext">【杀】</span>（<span class="yellowtext">' + get.translation(event.control) + '</span>）的目标', function (card, player, target) {
										return player.canUse({ name: 'sha', nature: 'thunder' }, target);
									})
									.set('ai', (target) => {
										var player = _status.event.player;
										return get.effect(target, { name: 'sha', nature: 'thunder' }, player, player);
									}).forResultTargets();
								if (targets) {
									const target = targets[0];
									player.logSkill('mengwuwang', target);
									target.addTempSkill('mengwuwang_skill');
									target.storage.mengwuwang_skill.add(trigger.card);
									target.markSkill('mengwuwang_skill');
									player.removeSkillLog(control);
									await player.useCard(get.autoViewAs({ name: 'sha', nature: 'thunder' }, []), [], target, false);
								}
							}
							break;
						}
					}
				}
			},
			group: 'mengwuwang_start',
			subSkill: {
				start: {
					trigger: {
						global: "phaseBefore",
						player: ["enterGame"],
					},
					filter(event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0);
					},
					forced: true,
					async content(event, trigger, player) {
						const cards = player.getCards('h');
						for (let card of cards) {
							const copy = game.createCard2(card.name, card.suit, card.number, card.nature);
							game.cardsGotoPile([copy], () => ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)]);
							card.init([card.suit, card.number, 'ying']);
						}
					},
				},
				card: {
					init: (player, skill) => {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					marktext: '妄',
					intro: {
						name: "无妄·影",
						content: "不能使用牌",
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
					filter: (event, player) => {
						return player.storage.mengwuwang_card && event.card && player.storage.mengwuwang_card.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					content: () => {
						player.storage.mengwuwang_card.remove(trigger.card);
						if (!player.storage.mengwuwang_card.length) player.removeSkill('mengwuwang_card');
					},
					mod: {
						"cardEnabled2": (card) => {
							if (card) return false;
						},
					},
					"_priority": 1201,
				},
				hujia: {
					init: (player, skill) => {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					marktext: '妄',
					intro: {
						name: "无妄·护甲",
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
					filter: (event, player) => {
						return player.storage.mengwuwang_hujia && event.card && player.storage.mengwuwang_hujia.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					content: () => {
						player.storage.mengwuwang_hujia.remove(trigger.card);
						if (!player.storage.mengwuwang_hujia.length) player.removeSkill('mengwuwang_hujia');
					},
					ai: {
						nohujia: true,
						skillTagFilter: function (player, tag, arg) {
							return true;
						}
					},
					"_priority": 1201,
				},
				skill: {
					init: (player, skill) => {
						if (!player.storage[skill]) player.storage[skill] = [];
						player.addSkillBlocker(skill);
					},
					onremove: (player, skill) => {
						player.removeSkillBlocker(skill);
						delete player.storage[skill];
					},
					skillBlocker: function (skill, player) {
						let info = get.info(skill);
						return info && !info.charlotte && !info.hiddenSkill && !info.zhuSkill && !info.juexingji && !info.limited && !info.dutySkill && !get.is.locked(skill);//普通技能
						//return !lib.skill[skill].charlotte && !get.is.locked(skill, player);
					},
					marktext: '妄',
					intro: {
						name: "无妄·普通技能",
						content: (storage, player, skill) => {
							var list = player.getSkills(null, false, false).filter(function (i) {
								return lib.skill.mengwuwang_skill.skillBlocker(i, player);
							});
							var str = '<li>【无妄】封锁的技能：' + get.translation(list);
							var skills_false = lib.skill.mengwumeng.skills_false([player]);
							if (skills_false.length) str += '<li>所有失效的技能：' + get.translation(skills_false);
							var skills_true = lib.skill.mengwumeng.skills_true([player]);
							if (skills_true.length) str += '<li>未失效的技能：' + get.translation(skills_true);
							return str;
						}
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
					filter: (event, player) => {
						return player.storage.mengwuwang_skill && event.card && player.storage.mengwuwang_skill.includes(event.card) && (event.name != 'damage' || event.notLink());
					},
					content: () => {
						player.storage.mengwuwang_skill.remove(trigger.card);
						if (!player.storage.mengwuwang_skill.length) player.removeSkill('mengwuwang_skill');
					},
					"_priority": 1201,
				}
			},
			mod: {
				aiValue(player, card, num) {
					if (card.name == 'ying' && player.getStorage('mengwuwang').card != undefined) return num * 10;
				},
			},
			ai: {
				"maixie_defend": true,
				effect: {
					target: function (card, player, target) {
						return;
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -1.5];
							if (!target.hasFriend()) return;
							let list = target.getStorage('mengwuwang'), l = Object.keys(list);
							if (!l.length) return;
							if (get.attitude(player, target) > 0) {
								return 4;
							} else {
								return [0, 0, 0, get.damageEffect(player, target, player, 'thunder')];
							}
						}
					},
				},
			},
			"_priority": 0,
		},
		mengwuxiang: {
			audio: 4,
			logAudio: () => false,
			trigger: {
				global: 'phaseBegin'
			},
			forced: true,
			filter: (event, player) => {
				let list = player.getStorage('mengwuwang'), keys = Object.keys(list);
				if (!keys.length) return !player.getEquips('meng_mengxiang').length;
				else {
					return !list[keys[0]](player);
				};
			},
			content: () => {
				'step 0'
				let list = player.getStorage('mengwuwang'), keys = Object.keys(list);
				if (!keys.length) {
					if (!player.hasEnabledSlot('equip1')) return;
					var card = get.cardPile(function (card) {
						return card.name.includes('meng_mengxiang')
					}, 'field');
					if (!card) {
						for (var i of game.filterPlayer()) {
							var card = i.getCards('he', (card) => card.name.search('meng_mengxiang') != -1)[0];
							if (card) break;
						};
					}
					if (!card) card = game.createCard2('meng_mengxiang', 'heart', 6);
					game.hyyzSkillAudio('meng', 'mengwuxiang', 4)
					player.$gain2(card, false);
					player.equip(card);
				}
				else {
					switch (keys[0]) {
						case 'card': {
							game.hyyzSkillAudio('meng', 'mengwuxiang', 1)
							player.addSkillLog(lib.skill.mengwuxiang.derivation[0]);
							lib.translate.mengwuwang_info =
								'锁定技，你的初始牌为【影】。你受到伤害时、或一名角色的判定结果为黑色时，你改为将一个{<span class="thundertext" style="font-family: yuanli">首项</span>}当雷【杀】使用，目标角色本回合与{<span class="thundertext" style="font-family: yuanli">此项</span>}类型相同的事物失效。<span class="thundertext" style="font-family: yuanli"><li><s>①【影】</s><li>②护甲<li>③普通技能</span>';
							delete player.storage.mengwuwang.card;
							break;
						}
						case 'hujia': {
							game.hyyzSkillAudio('meng', 'mengwuxiang', 2)
							player.addSkillLog(lib.skill.mengwuxiang.derivation[1]);
							lib.translate.mengwuwang_info =
								'锁定技，你的初始牌为【影】。你受到伤害时、或一名角色的判定结果为黑色时，你改为将一个{<span class="thundertext" style="font-family: yuanli">首项</span>}当雷【杀】使用，目标角色本回合与{<span class="thundertext" style="font-family: yuanli">此项</span>}类型相同的事物失效。<span class="thundertext" style="font-family: yuanli"><li><s>①【影】</s><li><s>②护甲</s><li>③普通技能</span>';
							delete player.storage.mengwuwang.hujia;
							break;
						}
						case 'skill': {
							game.hyyzSkillAudio('meng', 'mengwuxiang', 3)
							player.addSkillLog(lib.skill.mengwuxiang.derivation[2]);
							lib.translate.mengwuwang_info =
								'锁定技，你的初始牌为【影】。你受到伤害时、或一名角色的判定结果为黑色时，你改为将一个{<span class="thundertext" style="font-family: yuanli">首项</span>}当雷【杀】使用，目标角色本回合与{<span class="thundertext" style="font-family: yuanli">此项</span>}类型相同的事物失效。<span class="thundertext" style="font-family: yuanli"><li><s>①【影】</s><li><s>②护甲</s><li><s>③普通技能</s></span>';
							delete player.storage.mengwuwang.skill;
							break;
						}
					}
				};
			},
			derivation: ['mengwunian', 'mengwumeng', 'mengwuwo'],
			"_priority": 0,
		},
		mengwunian: {
			audio: 1,
			trigger: {
				global: 'phaseAfter'
			},
			filter(event, player) {
				var list = [];
				for (var i = 2; i <= 5; i++) {
					if (player.hasEnabledSlot(i)) list.push('equip' + i);
				}
				return list.length > 0 && !game.hasPlayer(function (current) {
					var history = current.getHistory('useCard', function (evt) {
						if (!evt || !evt.targets || !evt.targets.includes(player)) return false;
						return true;
					});
					return history.length > 0;
				});
			},
			async cost(event, trigger, player) {
				let list = [];
				for (let i = 2; i <= 5; i++) {
					if (player.hasEnabledSlot(i)) list.push('equip' + i);
				}
				list.sort();
				const control = await player.chooseControl(list, 'cancel2').set('prompt', '废除一个装备栏').forResultControl();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: control
						}
					}
				}
			},
			async content(event, trigger, player) {
				player.disableEquip(event.cost_data.control);
				player.changeHujia(1);
			},
		},
		mengwumeng: {
			audio: 2,
			init(player) {
				if (player == game.me) {
					_status.auto = true;
					ui.auto.hide();
				}
				player.say("厌离浮世泡影，欣求净土常道");
				player.changeSkin({ characterName: "meng_leidianying" }, "mengwumeng");
			},
			onremove(player) {
				if (player == game.me && (ui.auto.innerHTML == '托管' || _status.auto == true)) {
					_status.auto = false;
					ui.auto.show();
				}
				player.say("我会成为，下一个『开始』");
				player.changeSkin({ characterName: "meng_leidianying" }, "mengwumeng");
				player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/meng/image/meng_leidianying.jpg');
			},
			trigger: {
				player: 'useCardToTargeted'
			},
			filter: (event) => {
				if (event.card.name != 'sha' || !event.targets || !event.targets.length) return false;
				var skills_false = lib.skill.mengwumeng.skills_false([event.target]);
				return skills_false.length > 0;
			},
			direct: true,
			content: () => {
				'step 0'
				var skills_false = lib.skill.mengwumeng.skills_false([trigger.target]);
				game.log(trigger.target, '失效的普通技能：', '#g' + skills_false.map(skill => `【${get.translation(skill)}】`));

				event.videoId = lib.status.videoId++;
				var func = function (skills, id, target) {
					var dialog = ui.create.dialog('forcebutton');
					dialog.videoId = id;
					dialog.add('无梦：获得一个普通技能');
					for (var i = 0; i < skills.length; i++) {
						dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
					}
					dialog.addText(' <br> ');
				}
				if (player.isOnline()) player.send(func, skills_false, event.videoId);
				else if (player == game.me) func(skills_false, event.videoId);
				player.chooseControl(skills_false.concat('cancel2')).set('ai', () => {
					var controls = _status.event.controls;
					return controls[0];
				});
				'step 1'
				if (result.control) {
					game.broadcastAll('closeDialog', event.videoId);
					player.logSkill('mengwumeng');
					player.addSkillLog(result.control);
				}
				else event.finish();
				'step 1'
				var skills_true = lib.skill.mengwumeng.skills_true([trigger.target]), skills_normal = lib.skill.mengwumeng.skills_normal([player]);
				if (skills_true.length) game.log(trigger.target, '未失效的技能：', '#g' + skills_true.map(skill => `【${get.translation(skill)}】`));
				if (skills_normal.length) game.log(player, '的普通技能：', '#g' + skills_normal.map(skill => `【${get.translation(skill)}】`));

				if (skills_true.length > 0 && skills_normal.length > 0) {
					event.videoId = lib.status.videoId++;
					var func = function (skills, id, target) {
						var dialog = ui.create.dialog('forcebutton');
						dialog.videoId = id;
						dialog.add('无梦：失去一个普通技能');
						for (var i = 0; i < skills.length; i++) {
							dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
						}
						dialog.addText(' <br> ');
					}
					if (player.isOnline()) player.send(func, skills_normal, event.videoId);
					else if (player == game.me) func(skills_normal, event.videoId);
					player.chooseControl(skills_normal).set('ai', () => {
						var controls = _status.event.controls;
						let list = controls.filter(skill => skill != 'mengwumeng');
						if (controls.length > 1) return list.randomGet();
						else return controls[0];
					});
				} else event.finish();
				'step 2'
				if (result.control) {
					game.broadcastAll('closeDialog', event.videoId);
					player.removeSkillLog(result.control);
				}
			},
			skills_false: (targets, bool) => {//对象组失效的技能，普通
				bool = true;
				let skills_false = [];
				for (let current of targets) {
					if (!current.storage.skill_blocker || !current.storage.skill_blocker.length) continue;
					for (let lock of current.storage.skill_blocker) {//遍历起封锁作用的技能
						let skill_no = current.getSkills(null, false, false).filter(skill => lib.skill[lock].skillBlocker(skill, current));//获得被封锁的技能
						skills_false.addArray(skill_no);
					}
				};
				if (!bool) return skills_false;
				let skills_false_normal = skills_false.filter(skill => {
					let info = get.info(skill);
					return info && !info.charlotte && !info.hiddenSkill && !info.zhuSkill && !info.juexingji && !info.limited && !info.dutySkill && !get.is.locked(skill);
				})
				return skills_false_normal;
			},
			skills_true: (targets, bool) => {//对象组未失效的技能，普通
				//bool = true;
				let skills_true = [], skills_false = lib.skill.mengwumeng.skills_false(targets, bool);
				for (let current of targets) {
					let skill_true = current.getSkills(null, false, false).filter(function (skill) {
						let info = get.info(skill);
						return info && !info.charlotte && !skills_false.includes(skill);
					});
					skills_true.addArray(skill_true);
				};
				if (!bool) return skills_true;
				let skills_true_normal = skills_true.filter(skill => {
					let info = get.info(skill);
					return info && !info.charlotte && !info.hiddenSkill && !info.zhuSkill && !info.juexingji && !info.limited && !info.dutySkill && !get.is.locked(skill) && !skills_false.includes(skill);
				})
				return skills_true_normal;
			},
			skills_normal: (targets, bol) => {//对象组的普通技能
				let skills_normal = [];
				for (let current of targets) {
					let skill_normal = current.getSkills(null, false, false).filter(function (skill) {
						let info = get.info(skill);
						return info && !info.charlotte && !get.is.locked(skill) && !info.hiddenSkill && !info.zhuSkill && !info.juexingji && !info.limited && !info.dutySkill;
					});
					skills_normal.addArray(skill_normal);
				};
				return skills_normal;
			},
			"_priority": 0,
		},
		mengwuwo: {
			audio: 1,
			trigger: {
				player: 'useCardAfter'
			},
			filter: (event, player) => {
				return event.card.name == 'sha' && event.targets.length > 0;
			},
			forced: true,
			content: () => {
				'step 0'
				var list = trigger.targets.filter(current => current.hasSkill('mengwuwo_log'));
				if (list.length) {
					event.targets = list.filter(current => current.isIn() && current.countCards('he'));
					if (event.targets.length) event.goto(2);
					else event.finish();
				} else {
					player.chooseCard(true, 'he', (card) => {
						return player.canRecast(card);
					}).set('ai', (card) => {
						return 8 - get.value(card);
					}).set('prompt', '重铸一张牌且此【杀】不计入次数');
				};
				'step 1'
				if (result.bool && result.cards) {
					player.recast(result.cards);
					player.getStat().card.sha--;
					event.finish();
				};
				'step 2'
				event.target = event.targets.shift();
				player.choosePlayerCard(event.target, '选择要移动的牌', true, 'he');
				'step 3'
				event.card = result.cards[0];
				var list = ['手牌区'];
				if (lib.card[event.card.name].type == 'equip' && player.isEmpty(lib.card[event.card.name].subtype)) list.push('装备区');
				if (lib.card[event.card.name].type == 'delay' && !player.storage._disableJudge && !player.hasJudge(event.card.name)) list.push('判定区');
				if (list.length == 1) event._result = { control: list[0] };
				else {
					player.chooseControl(list).set('prompt', '把' + get.translation(event.card) + '移动到你的什么区域').ai = () => { return 0 };
				}
				'step 4'
				if (result.control == '手牌区') {
					var next = player.gain(event.card);
					if (event.target) {
						next.source = event.target;
						next.animate = 'giveAuto';
					}
					else next.animate = 'draw';
				}
				else if (result.control == '装备区') {
					if (event.target) event.target.$give(event.card, event.target);
					player.equip(event.card);
				}
				else {
					if (event.target) event.target.$give(event.card, player);
					player.addJudge(event.card);
				};
				'step 5'
				if (event.targets.length > 0) event.goto(2);
			},
			group: ['mengwuwo_use'],
			subSkill: {
				use: {
					trigger: {
						player: 'useCard1'
					},
					filter: (event, player) => {
						return event.card.name == 'sha';
					},
					charlotte: true,
					silent: true,
					content: () => {
						player.addTempSkill('mengwuwo_hp');
					}
				},
				hp: {
					trigger: {
						global: 'changeHp'
					},
					charlotte: true,
					forced: true,
					popup: false,
					silent: true,
					content: () => {
						trigger.player.addTempSkill('mengwuwo_log');
					},
				},
				log: { charlotte: true },
			},
			"_priority": 0,
		},
		meng_wendy: ['温迪', ["male", "hyyz_ys", 4, ["mengjvlan", "menggongdan", "mengqinxin"], ['zhu', 'die:meng_sp_wendy']], '尾巴酱', `
					特别鸣谢——<br>
					代码导师：<font color=#ff0dac>紫灵谷的骊歌</font><br>
					引路老师：<font color=#ff0dac>萨巴鲁酱</font><br>
					代码参考：<font color=#ff0dac>《忽悠宇宙》扩展</font><br>
					教科书：<font color=#ff0dac>《大宝规则集》《三国杀DIY·设计攻略&资源导航》</font><br>
					模板来源（制图在米忽悠の小宇宙群相册）：<font color=#ff0dac>幽蝶化烬</font><br>
					<hr><b><u>温迪4(	)<br>
						聚岚<br>
						每个轮次开始时，令所有角色抉择：<br>
						横置并摸一张牌；复原并重铸手牌；<br>
						将一张牌交给你，你可令其恢拓 1 。<br>
						你因此获得的杀，不计入所有上限、<br>
						默认指定与你横置状态不同的角色。<br>
					</u></b>抗争，是为了蒙德的抗争不被遗忘。<br>
					与先驱同生共死，让心灵洗尽铅华；<br>
					追随振弦的少年，投入解放的浪潮。<br>
					愿意同命共存者，潜力可破禁锢的风墙；<br>
					决心推翻暴权者，信念就是锋镝的航线。<br>
					<b><u>弓胆<br>
						转换技，锁定技，你使用【杀】时，<br>
						阳：所有目标替换为其中一个目标。<br>
						阴：重置琴心并令此牌不能被响应。<br>
						然后，交换与琴心同名的一对选项。<br>
					</u></b>抗争，是为了蒙德的人们拥有自由，<br>
					刺穿真正的敌人，不被泪水蒙蔽双眼；<br>
					重拾遗忘的初心，不因仇恨走火入魔。<br>
					无论弓弦还是号角，皆可奏响镇魂的幕曲；<br>
					无论笔刃还是枪炮，都是挽危救国的良药。<br>
					<b><u>琴心<br>
						转换技，限定技，你使用锦囊牌时，<br>
						阳：醉酒并切换此牌的可响应状态。<br>
						阴：将此牌名改为铁索连环或决斗。<br>
						此牌造成伤害后，摸与之等量的牌，<br>
						若手牌唯一最多，分配你超出的牌。<br>
					</u></b>抗争，是为了蒙德的诗文永不终结。<br>
					厮杀不能令战争停止，<br>
					镇压不会让狂风平息。<br>
					诗人自千年前走来，从未攫取权柄；<br>
					只为属于天空的鸟，能在苍穹翱翔。<br>
					骑士向云翳上走去，从未替天行道；<br>
					只为属于人民的歌，能够源远流长。<br>
					<hr>“风之国土的精神是自由。”<br>
					“风之国土的灵魂是诗文。”<br>
					“风之国土的脊梁是抗争。”<br>
					<br>
					蒙德的历史曾是抗争的历史。<br>
					抗争是为了蒙德过去的抗争不被遗忘，<br>
					如同草木突破土壤，以恒风之力洞穿石墙。<br>
					<br>
					蒙德的历史就是抗争的历史。<br>
					抗争是为了蒙德现在的人们拥有自由，<br>
					如同风神吹散冰雪，以狮牙之心奋起抗争。<br>
					<br>
					蒙德的历史将是抗争的历史。<br>
					抗争是为了蒙德未来的诗文永不终结，<br>
					如同轻风随韵而起，以悠悠之歌颂扬。<br>
					<hr>设计师们，当你完成一个作品之后，<br>
					一定要记得设计本身的意义。<br>
					武将的数值、音乐和美工，<br>
					强度、意象和隐喻，<br>
					都是作品的一部分。<br>
					战胜、优越他人并不意味着一切，<br>
					在抵达终点之前，<br>
					用你的眼睛多多观察这个“世界”吧。<br>`],
		mengjvlan: {
			audio: 'mengliufeng',
			trigger: {
				global: "roundStart"
			},
			filter(event, player) {
				return true
			},
			async content(event, trigger, player) {
				const players = game.filterPlayer();
				for (let current of players) {
					let list = [];
					if (!current.isLinked()) list.push("横置并摸一张牌");
					if ((current.isLinked() || current.isTurnedOver()) && current.countCards("h")) list.push("复原并重铸手牌");
					if (current.countCards("he")) list.push("将一张牌给温迪，其可以令你恢拓");
					if (!list.length) continue;
					const { result: { control } } = await current.chooseControl(list).set("prompt", "聚岚：选择一项").set('ai', () => {
						const list = _status.event.listx;
						const tar = _status.event.player, player = _status.event.playerx;
						const zhu = game.findPlayer(i => i.getSeatNum() == 1);
						const att = get.attitude(tar, zhu);
						let str;
						if (zhu.isLinked()) {//主公横
							if (att < 0) {//反贼
								if (list.includes('复原并重铸手牌')) str = '复原并重铸手牌';
							} else {
								if (list.includes("横置并摸一张牌")) str = '横置并摸一张牌';
							}
						} else {
							if (att < 0) {//反贼
								if (list.includes('横置并摸一张牌')) str = '横置并摸一张牌';
							} else {
								if (list.includes("复原并重铸手牌")) str = '复原并重铸手牌';
							}
						}
						if (get.attitude(tar, player) > 0 && list.includes('将一张牌给温迪，其可以令你恢拓')) {
							str = '将一张牌给温迪，其可以令你恢拓'
						}
						if (str && list.includes(str)) return str;
						else return list.randomGet();
					}).set('listx', list).set('playerx', player);
					switch (control) {
						case "横置并摸一张牌": {
							current.link(true);
							current.draw()
							break;
						}
						case "复原并重铸手牌": {
							if (current.isLinked()) current.link();
							if (current.isTurnedOver()) current.turnOver();
							current.recast(current.getCards("h"));
							break;
						}
						default: {
							const { result: { cards } } = await current.chooseCard("将一张牌交给温迪", "he", true).set('ai', (card) => {
								let val = get.value(card);
								if (card.name == 'sha') val += 2;
								return val;
							});
							if (cards) {
								if (current != player) await current.give(cards, player);
								cards.map(card => {
									if (get.name(card) == 'sha') player.addGaintag(card, 'mengjvlan');
								});
								let str = get.attitude(player, current) > 0 ? '✓' : '×';
								const { result: { bool } } = await player.chooseBool(str + '是否令' + get.translation(current) + '恢拓？').set('ai', () => get.translation(player, current));
								if (bool) {
									const { result: { color } } = await current.judge(function (card) {
										if (current.hp == current.maxHp) {
											if (get.color(card) == 'red') return -1;
										}
										if (get.color(card) == 'red') return 1;
										return 0;
									});
									if (color) {
										if (color == 'red') {
											if (current.hp < current.maxHp) current.recover();
										}
										else {
											current.draw();
										}
									}
								}
							}
							break;
						}
					}
				}
			},
			group: 'mengjvlan_use',
			subSkill: {
				use: {
					trigger: {
						player: "useCardBefore",
					},
					forced: true,
					charlotte: true,
					filter: function (event, player) {
						if (!event.cards || !event.cards.length) return false;
						if (!game.hasPlayer(current => current.isLinked() && !player.isLinked() || !current.isLinked() && player.isLinked())) return false;
						return event.cards.some(card => card.hasGaintag('mengjvlan'));
						return player.hasHistory('lose', evt => {
							if (event != evt.getParent()) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes("mengjvlan")) return true;
							}
							return false;
						});
					},
					content() {
						trigger.targets.addArray(game.filterPlayer(current => player.isLinked() && !current.isLinked() || !player.isLinked() && current.isLinked()))
					}
				}
			},
			mod: {
				targetInRange: function (card, player, target) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (i.hasGaintag('mengjvlan')) return true;
					}
				},
				cardUsable: function (card, player) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (i.hasGaintag('mengjvlan')) return true;
					}
				},
				ignoredHandcard: function (card, player) {
					if (card.hasGaintag('mengjvlan')) {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('mengjvlan')) {
						return false;
					}
				},
				aiUseful: function (player, card, num) {
					if (get.itemtype(card) == 'card') {
						if (card.hasGaintag('mengjvlan')) {
							return num + 10;
						}
					}
				},
				aiOrder: function () {
					lib.skill.mengjvlan.mod.aiUseful.apply(this, arguments);
				},
			},
		},
		menggongdan: {
			audio: 'menggexian',
			init: (player) => {
				player.storage.menggongdan = false
				player.updateMark('menggongdan');
			},
			mark: true,
			forced: true,
			zhuanhuanji: true,
			marktext: "☯",
			intro: {
				markcount: function (storage, player) {
					const key = lib.skill.menggongdan.key;
					const map = {
						'醉酒并切换此牌的可响应状态': '醉酒',
						'将此牌名改为铁索连环或决斗': '改名',
						'所有目标替换为其中一个目标': '集火',
						'重置琴心并令此牌不能被响应': '刷新',
					}
					return storage ? map[key[1]] : map[key[0]];
				},
				content: function (storage, player, skill) {
					const key = lib.skill.menggongdan.key;
					return `你使用【杀】时，${storage ? key[1] : key[0]}，然后，交换与琴心同类的一对选项。`;
				},
			},
			trigger: {
				player: "useCard1"
			},
			filter(event, player) {
				return event.card.name == "sha"
			},
			async content(event, trigger, player) {
				const key = lib.skill.menggongdan.key;
				if (player.storage.menggongdan) {
					if (key[1] == '重置琴心并令此牌不能被响应') {
						player.restoreSkill('mengqinxin');
						trigger.directHit.addArray(game.filterPlayer());
						game.log('#g【弓胆·阴】', '#y重置', '#g【琴心】；', trigger.card, '不能被响应');
					} else {
						const { result: { control } } = await player.chooseControl('铁索连环', '决斗').set('prompt', '将牌名改为铁索连环或决斗').set('ai', () => get.effect(trigger.target, { name: 'juedou' }, player, player) > 0 ? '决斗' : '铁索连环');
						if (control == '铁索连环') {
							trigger.card.name = 'tiesuo';
						} else {
							trigger.card.name = 'juedou';
						}
						game.log('#g【弓胆·阴】', '牌名改为', trigger.card);
					}
				} else {
					if (key[0] == '所有目标替换为其中一个目标') {
						const { result: { targets } } = await player.chooseTarget("所有目标替换为其中一个目标", (card, player, target) => {
							var trigger = _status.event.getTrigger();
							return trigger.targets.includes(target);
						}, true);
						if (targets) {
							trigger.targets.map(tar => tar = targets[0]);
							game.log('#g【弓胆·阳】', '目标集中至', targets[0]);
						}
					} else {
						//酒的代码
						/* game.addVideo('jiuNode', player, true);
						if (!player.storage.jiu) player.storage.jiu = 0;
						player.storage.jiu += 1;
						game.broadcastAll(function (player) {
							player.addSkill('jiu');
							if (!player.node.jiu && lib.config.jiu_effect) {
								player.node.jiu = ui.create.div('.playerjiu', player.node.avatar);
								player.node.jiu2 = ui.create.div('.playerjiu', player.node.avatar2);
							}
						}, player); */
						//
						//喝酒
						if (!player.storage.jiu) player.storage.jiu = 0;
						player.storage.jiu += 1;
						//jiu
						if (!trigger.baseDamage) trigger.baseDamage = 1;
						trigger.baseDamage += player.storage.jiu;
						trigger.jiu = true;
						trigger.jiu_add = player.storage.jiu;
						//失去jiu
						if (player.node.jiu) {
							player.node.jiu.delete();
							player.node.jiu2.delete();
							delete player.node.jiu;
							delete player.node.jiu2;
						}
						delete player.storage.jiu;


						if (trigger.directHit.length > 0) {
							trigger.directHit = [];
							game.log('#g【弓胆·阳】', '醉酒并切换为目标均可响应');
						}
						else {
							trigger.directHit.addArray(game.filterPlayer());
							game.log('#g【弓胆·阳】', '醉酒并切换为目标不可响应');
						}
					}
				}
				player.changeZhuanhuanji('menggongdan');
				const { result: { control } } = await player.chooseControl('交换“阳”', '交换“阴”').set('prompt', '交换【弓胆】和【琴心】的同名项');
				if (control == '交换“阳”') {
					let temp = lib.skill.menggongdan.key[0];
					lib.skill.menggongdan.key[0] = lib.skill.mengqinxin.key[0];
					lib.skill.mengqinxin.key[0] = temp;
				} else {
					let temp = lib.skill.menggongdan.key[1];
					lib.skill.menggongdan.key[1] = lib.skill.mengqinxin.key[1];
					lib.skill.mengqinxin.key[1] = temp;
				}
				player.updateMark('menggongdan');
				player.updateMark('mengqinxin');
			},
			key: ['所有目标替换为其中一个目标', '重置琴心并令此牌不能被响应',],
		},
		mengqinxin: {
			audio: 'mengbaizhan',
			init: (player) => {
				player.storage.mengqinxin = 0;
				player.updateMark('mengqinxin');
			},
			mark: true,
			zhuanhuanji: "number",
			marktext: "☯",
			intro: {
				markcount: function (storage, player) {
					const key = lib.skill.mengqinxin.key;
					const map = {
						'醉酒并切换此牌的可响应状态': '醉酒',
						'将此牌名改为铁索连环或决斗': '改名',
						'所有目标替换为其中一个目标': '集火',
						'重置琴心并令此牌不能被响应': '刷新',
					}
					return `${player.awakenedSkills.includes('mengqinxin') ? '×' : ''}${storage % 2 ? map[key[1]] : map[key[0]]}`;
				},
				content: function (storage, player, skill) {
					const key = lib.skill.mengqinxin.key;
					return `你使用锦囊牌时，${storage % 2 ? key[1] : key[0]}。此牌造成伤害后，摸与之等量的牌，若手牌唯一最多，分配你超出的牌。`;
				},
			},
			prompt2: function () {
				let player = _status.event.player, storage = player.storage.mengqinxin;
				const key = lib.skill.mengqinxin.key;
				return `你使用锦囊牌时，${storage % 2 ? key[1] : key[0]}。此牌造成伤害后，摸与之等量的牌，若手牌唯一最多，分配你超出的牌。`;
			},
			trigger: {
				player: "useCard1"
			},
			zhuanhuanji: true,
			filter(event, player) {
				return get.type2(event.card) == 'trick';
			},
			async content(event, trigger, player) {
				const key = lib.skill.mengqinxin.key;
				const str = player.storage.mengqinxin;
				if (str % 2) {//true
					if (key[1] == '重置琴心并令此牌不能被响应') {
						player.when('mengqinxinAfter').then(() => {
							player.restoreSkill('mengqinxin');
						})
						trigger.directHit.addArray(game.filterPlayer());
						game.log('#g【琴心·阴】', '#y重置', '#g【琴心】；', trigger.card, '不能被响应');
					} else {
						const { result: { control } } = await player.chooseControl('铁索连环', '决斗').set('prompt', '将牌名改为铁索连环或决斗').set('ai', () => get.effect(trigger.target, { name: 'juedou' }, player, player) > 0 ? '决斗' : '铁索连环');
						if (control == '铁索连环') {
							trigger.card.name = 'tiesuo';
						} else {
							trigger.card.name = 'juedou';
						}
						game.log('#g【琴心·阴】', '牌名改为', trigger.card);
					}
				} else {//0246 false
					if (key[0] == '所有目标替换为其中一个目标') {
						const { result: { targets } } = await player.chooseTarget("所有目标替换为其中一个目标", (card, player, target) => {
							var trigger = _status.event.getTrigger();
							return trigger.targets.includes(target);
						}, true);
						if (targets) trigger.targets.forEach(tar => tar = targets[0]);
						game.log('#g【琴心·阳】', '目标集中至', targets[0]);
					} else {
						game.addVideo('jiuNode', player, true);
						if (!player.storage.jiu) player.storage.jiu = 0;
						player.storage.jiu += 1;
						game.broadcastAll(function (player) {
							player.addSkill('jiu');
							if (!player.node.jiu && lib.config.jiu_effect) {
								player.node.jiu = ui.create.div('.playerjiu', player.node.avatar);
								player.node.jiu2 = ui.create.div('.playerjiu', player.node.avatar2);
							}
						}, player);
						if (trigger.directHit.length > 0) {
							trigger.directHit = [];
							game.log('#g【琴心·阳】', '切换为目标均可响应');
						}
						else {
							trigger.directHit.addArray(game.filterPlayer());
							game.log('#g【琴心·阳】', '切换为目标不可响应');
						}
					}
				}
				player.changeZhuanhuanji('mengqinxin');
				player.awakenSkill('mengqinxin', true);
				player.updateMark('menggongdan');
				player.updateMark('mengqinxin');
				player.addTempSkill('mengqinxin_buff');
				trigger.card.storage.mengqinxin = true;
			},
			key: ['醉酒并切换此牌的可响应状态', '将此牌名改为铁索连环或决斗']
		}, mengqinxin_buff: {
			trigger: {
				global: 'damageEnd'
			},
			forced: true,
			filter(event, player) {
				return event.card && event.card.storage.mengqinxin;
			},
			async content(event, trigger, player) {
				player.draw(trigger.num);

				while (player.countCards('h') > 0 && player.isMaxHandcard(true) && game.countPlayer(current => current != player && current.isIn())) {
					const { result } = await player.chooseCardTarget({
						prompt: '将一张手牌交给其他角色',
						filterCard: true,
						filterTarget: lib.filter.notMe,
						position: 'h',
						forced: true,
						ai1(card) {
							if (get.tag(card, 'recover') && !game.hasPlayer(function (current) {
								return get.attitude(current, player) > 0 && !current.hasSkillTag('nogain');
							})) return 0;
							return 1 / Math.max(0.1, get.value(card));
						},
						ai2(target) {
							var player = _status.event.player, att = get.attitude(player, target);
							if (target.hasSkillTag('nogain')) att /= 9;
							return 4 + att;
						},
					});
					if (result.bool) {
						player.line(result.targets[0], 'green');
						player.give(result.cards, result.targets[0]);
					}
				}
			}
		},
		"mengmiaobu_info": "瞄捕|每轮开始时，你可以弃置任意张牌并记录等量的非装备牌的牌名（其他角色不可见且至多为3）。有角色使用〖瞄捕①〗牌时，你选择一项并移除此牌名：<br>1.令此牌无效。<br>2.为此牌增加或减少一个目标。<br>3.摸两张牌并弃置当前回合角色区域内的一张牌。",
		"mengyansuan_info": "演算|回合开始时，你依次执行以下X项:<br>1.摸X张牌。<br>2.本回合使用牌无距离和次数限制且手牌上限+X。<br>3.弃置至多X名其他角色各一张牌并令其本回合受到的火焰伤害+1。<br>X为本轮〖瞄捕②〗的发动次数。",
		"mengliaohuang_info": "燎荒|回合技（3），一名角色受到火焰/雷电/传导伤害后，你可以将两张点数为A的方片【火攻】/黑桃【浮雷】/梅花【铁索连环】插入牌堆或交给伤害来源。",
		"mengjingmang_info": "旌芒|限定技，否极技。出牌阶段，你可以令所有手牌数不小于你的角色将至少一张手牌当做等量项对其他所有被选择的角色使用：<br>1.【铁索连环】或【过河拆桥】。<br>2.火【杀】或雷【杀】。<br>3.【决斗】或【五谷丰登】。<br>泰来：重置“燎荒”。",
		"menglaoshen_info": "劳神|锁定技，当你因使用或打出失去牌后，你与一名其他角色各失去一点体力。当你因弃置失去牌后，摸一张牌",
		"mengguiqu_info": "归去|每回合限X次，X为你已损失的体力值。你可以弃置两张类型相同的牌并视为使用或打出任意一张此类型的牌（无距离限制且不计入次数上限）。若弃置的牌为装备牌，改为将其中一张置入装备区。",
		"mengtansheng_info": "探生|出牌阶段每种花色限一次。你可以弃置一张牌并获得一张随机【生命】牌。若这两张牌：<br>1.颜色相同，本回合使用【生命】牌不能被响应且可以多选择一个目标。<br>2.颜色不同，本回合不能再发动此技。<br>3.点数和花色均相同，你亮出牌堆顶20张牌并可以依次使用之。",
		"mengzidian_info": "渍点|一名角色的回合结束后，若你于此回合改变过体力或手牌，你获得一张随机【生命】牌。",
		"mengzhuyi_info": "诸艺|出牌阶段开始时，你可以重铸所有基本牌或锦囊牌，且本回合不能使用或打出此类牌，本回合使用以下类型的牌时：<br>基本牌，无距离限制且不能被响应。<br>锦囊牌，可以增加或减少一个目标。<br>装备牌，摸一张牌。",
		"menghenhuo_info": "狠活|出牌阶段限一次，你可以对自己造成1点伤害，本回合令你的一种类型的牌视为另一种类型。",
		"mengtangcai_info": "堂彩|当你受到伤害后，你可以展示区域内所有牌并摸X张牌（X为其中包含的类型数）。",
		"menghanxin_info": "含辛|①出牌阶段限一次，你可以进行一次对方点数+2的拼点。赢的角色对另一方造成1点伤害。②你造成或受到伤害后，可以重铸至多两张牌。",
		"mengquanzhi_info": "拳志|①你使用点数小于X的牌无次数限制（X为本回合其他角色失去的牌的最大点数）。②一名角色造成伤害后，你可以令手牌数或体力值较小的一方摸一张牌。若伤害来源的体力值较大，本回合〖拳志〗②失效。",
		"mengzhenyao_info": "诊要|出牌阶段限一次，你可以与一名其他角色交换手牌。你们同时选择一项，然后依次执行：1.将一张手牌替换为【毒】。2.创造一张【无中生有】。3.与对方交换手牌。",
		"mengwenji_info": "问疾|当你对其他角色造成伤害后，或受到其他角色造成的伤害后，你可以视为对其使用一张【推心置腹】。",
		"mengchitong_info": "斥痛|准备阶段，你失去一点体力。每名角色限一次，当一名角色受到伤害时，你可以防止之；若该角色不是你，你失去一点体力并摸两张牌。",
		"mengxizhi_info": "悉知|锁定技，当你失去体力后，观看并调整牌堆顶等同于体力值数量的牌。当你一次性获得至少两张牌时，若这些牌：均为红色，令一名角色恢复一点体力；均为黑色，你弃置任意角色共计两张牌。",
		"mengxushi_info": "虚识|锁定技。你使用或打出手牌时，若你本回合使用或打出过此花色，弃一张牌；否则，摸一张牌。",
		"mengnanke_info": "南柯|每回合限一次。你的牌被弃置后、你受到伤害后、出牌阶段，你可以删除本回合所有角色使用或打出牌的记录和计入次数上限的用牌记录。",
		"mengzhezhi_info": "折枝|一名角色的回合结束阶段，若你或其本回合没有使用或打出过牌的记录，你可以将一张红/黑色牌当任意基本/锦囊牌对其使用。",
		"mengjvxing_info": "踽行|使命技，锁定技，每轮结束时你废除末位装备栏，然后，令场上装备最少的角色转换手牌明置状态。<br><hr><font color =#00FF00>成功</font>：洗牌后，你交出装备栏及其中牌并回复等量体力，然后修改〖神仪〗。<br><hr><font color=#FF4500>失败</font>：你废除所有装备栏后，其他角色执行【水淹七军】。<br><hr><font color=#48D1CC>无论成功与否，你获得〖人生〗</font>",
		"mengshenyi_info": "神仪|锁定技，手牌数小于装备栏数时，摸牌补齐并明置。你于出牌阶段外失去<font color=#0fa7ff>明置</font>/<font color=#ff0dac>暗置</font>牌后，<font color=#0fa7ff>恢复首位</font>/<font color=#ff0dac>废除末位</font>装备栏。",
		"mengrensheng_info": "人生|锁定技，你的准备阶段和结束阶段随机改为<font color=#ff0dac>摸牌阶段</font>或<font color=#0fa7ff>弃牌阶段</font>。",
		"mengshenyi_rewrite_info": "神仪|你的手牌数小于装备栏数时，摸牌补齐并明置。你于出牌阶段外失去<font color=#ff0dac>暗置</font>/<font color=#0fa7ff>明置</font>牌后，<font color=#0fa7ff>恢复首位</font>/<font color=#ff0dac>废除末位</font>装备栏。",
		"mengqiyue_info": "契约|法则技，每名角色的出牌阶段限一次，<br>其可以展示一张牌并邀请其他角色展示一张牌，<br>该角色可以交换自己与其他角色的一张展示牌。",
		"mengqiyue2_info": "契约|",
		"menglvheng_info": "律衡|锁定技，当牌在两名角色的区域间移动后，你抉择：<br>1.令失者的一个随机空装备栏置入装备牌。<br>2.将得者场上的一张牌当【杀】对其使用。",
		"mengminhui_info": "暝晖|主公技，限定技，其他角色造成击杀后，你将所有装备牌对其使用。",
		"mengkunchu_info": "困雏|锁定技，[否极技]，你不能对未对你使用过牌的其他角色使用牌，没有扩展栏的其他角色对你使用牌时，获得你一个[装备栏]。<br>泰来：你本巡调离。",
		"mengxvkong_info": "虚空|装备栏异常的其他角色回合开始时，你可令其初始化装备栏，然后卜算2并与其各摸一张牌。因此获得含其他牌名的牌的角色废除一个装备栏或失去1点体力。",
		"mengzhuSun_info": "逐光|锁定技，你使用单体牌时，分配使用者与目标至不同角色。若包含你，你摸一张牌。",
		"mengwuwang_info": "无妄|锁定技，你的初始牌为【影】。你受到伤害时，或一名角色的判定结果确定为黑色时，你改为将一个{<span class=\"thundertext\" style=\"font-family: yuanli\">首项</span>}当雷【杀】使用，结算中目标角色与{<span class=\"thundertext\" style=\"font-family: yuanli\">此项</span>}类型相同的事物失效。<span class=\"thundertext\" style=\"font-family: yuanli\"><li>①【影】<li>②护甲<li>③普通技能</span>",
		"mengwuwang_append": "",
		"mengwuxiang_info": "无想|锁定技。每回合开始时，若〖无妄〗：没有项目，你装备【梦想一心】；有项目但你没有{<span class=\"thundertext\" style=\"font-family: yuanli\">首项</span>}的事物，你删除此项并获得{<span class=\"firetext\" style=\"font-family: yuanli\">同序号的技能</span>}。<span class=\"firetext\" style=\"font-family: yuanli\"><li>①〖无念〗<li>②〖无梦〗<li>③〖无我〗</span>",
		"mengwuxiang_append": "",
		"mengwunian_info": "无念|每回合结束后，若本回合没有角色对你使用过牌，你可以废除一个非武器栏，然后获得一枚护甲。",
		"mengwumeng_info": "无梦|你使用【杀】指定目标后，可以获得目标角色一个失效的普通技能；然后若其有未失效的技能，你失去一个普通技能。",
		"mengwuwo_info": "无我|锁定技，你使用【杀】后，若目标角色未改变体力值，你重铸一张牌且此【杀】不计入次数上限；否则，你将其的一张牌移至你的合法区域。",
		"mengjvlan_info": "聚岚|每个轮次开始时，令所有角色抉择：<br>横置并摸一张牌；复原并重铸手牌；<br>将一张牌交给你，你可令其恢拓 1 。<br>你因此获得的杀，不计入所有上限、<br>默认指定与你横置状态不同的角色。",
		"menggongdan_info": "弓胆|转换技，锁定技，你使用【杀】时，<br>阳：所有目标替换为其中一个目标。<br>阴：重置琴心并令此牌不能被响应。<br>然后，交换与琴心同名的一对选项。",
		"mengqinxin_info": "琴心|转换技，限定技，你使用锦囊牌时，<br>阳：醉酒并切换此牌的可响应状态。<br>阴：将此牌名改为铁索连环或决斗。<br>此牌造成伤害后，摸与之等量的牌，<br>若手牌唯一最多，分配你超出的牌。"
	},
	2402: {

		hyyz_zhenliyisheng: ['真理医生', ["male", "hyyz_xt", 4, ["hyyzbianbo", "hyyzguina"], []], '#b我甚至无法和一个蠢材解释何为「蠢材」', '直率而自我的博识学会学者，常以奇怪的石膏头雕遮蔽面容。自幼便展露出过人的才智，如今却以「庸人」自居。坚信智慧与创造力并不为天才独有，致力于向全宇宙传播知识，医治名为愚钝的顽疾。'],
		hyyzbianbo: {
			audio: 4,
			group: 'hyyzbianbo_audio',
			subSkill: {
				audio: {
					trigger: {
						global: "useCard",
					},
					usable: 1,
					logTarget: 'player',
					filter(event, player) {
						if (event.targets.length != 1) return false;
						if (event.targets[0] != player) return false;
						return event.player == player || player.canCompare(event.player);
					},
					async content(event, trigger, player) {
						if (player == trigger.player) {
							game.hyyzSkillAudio('hyyz', 'hyyzbianbo', 3, 4)
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzbianbo', 1, 2)
						}
						const bool = await player.chooseToCompare(trigger.player).forResultBool();
						if (bool) {
							var list = ['此牌无效', '受到1点伤害'];
							const index = await trigger.player.chooseControl(true)
								.set('choiceList', list)
								.set('ai', () => trigger.player.hp > player.hp ? 1 : 0)
								.forResult('index');
							if (index == 0) {
								game.hyyzSkillAudio('hyyz', 'hyyzbianbo', 7)
								trigger.excluded.add(player);
								player.say('零分，下一个！');
								player.line(trigger.player);
							} else {
								game.hyyzSkillAudio('hyyz', 'hyyzbianbo', 8)
								player.say('负分，给我滚！');
								player.line(trigger.player);
								trigger.player.damage(player);
							}
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzbianbo', 5, 6)
							trigger.directHit.add(player);
							if (player.hasSkill('hyyzguina')) {
								lib.skill.hyyzguina.guina(player, trigger.card.name);
							}
						}
					},
					ai: {
						effect: {
							target(card, player, target, current) {
								var hs = player.getCards('h').sort(function (a, b) {
									return b.number - a.number;
								});
								var ts = target.getCards('h').sort(function (a, b) {
									return b.number - a.number;
								});
								if (!hs.length || !ts.length) return;
								if (hs[0].number < ts[0].number && player.countCards('he') < 4) return 0.5;
							},
						},
					},
				}
			},
			mod: {
				targetEnabled(card, player, target) {
					if (player.hasSkill('hyyzbianbo_buff')) return false;
				},
			},
		}, hyyzbianbo_buff: {
			forced: true,
			charlotte: true,
			mark: true,
			marktext: "辩",
			intro: {
				name: "辩驳",
				content: "不能再对真理医生使用牌",
			},
		},
		hyyzbianbo_info: "辩驳|每回合限一次，一名角色仅对你使用牌时，你可以与其拼点。<br>若你赢，其选择令此牌无效，或受到你造成的1点伤害。<br>若你没赢，不能响应此牌并〖归纳〗之。",
		hyyzguina: {
			audio: 4,
			guina(player, name, type) {
				if (!player.hasSkill('hyyzguina_buff')) {
					player.addTempSkill('hyyzguina_buff', 'roundStart');
				}
				if (!type) {
					player.getStorage('hyyzguina_buff').use[name] ? player.storage.hyyzguina_buff.use[name]++ : player.storage.hyyzguina_buff.use[name] = 1;
					player.getStorage('hyyzguina_buff').target[name] ? player.storage.hyyzguina_buff.target[name]++ : player.storage.hyyzguina_buff.target[name] = 1;
				} else {
					player.getStorage('hyyzguina_buff')[type][name] ? player.storage.hyyzguina_buff[type][name]++ : player.storage.hyyzguina_buff[type][name] = 1;
				}
				player.syncStorage('hyyzguina_buff');
			},
			group: 'hyyzguina_audio',
			subSkill: {
				audio: {
					trigger: {
						global: "useCardToPlayered",
					},
					forced: true,
					direct: true,
					filter(event, player) {
						if (event.player != player && event.target != player) return false;
						return event.target == event.targets[0];
					},
					content: function () {
						'step 0'
						game.log(player, '发动了', '#g【归纳】<br>', `<span class=greentext>〖归纳〗</font>了<span class=yellowtext>【${get.translation(trigger.card.name)}】</span>`);
						if (trigger.targets.includes(player)) lib.skill.hyyzguina.guina(player, trigger.card.name, "target");
						if (trigger.player == player) lib.skill.hyyzguina.guina(player, trigger.card.name, "use");
						'step 1'
						if (trigger.targets.includes(player) && player.getStorage('hyyzguina_buff').target[trigger.card.name] > 1) {
							game.hyyzSkillAudio('hyyz', 'hyyzguina', 3, 4)
							player.draw(player.getStorage('hyyzguina_buff').target[trigger.card.name]);
						};
						if (trigger.player == player && player.getStorage('hyyzguina_buff').use[trigger.card.name] > 1) {
							game.hyyzSkillAudio('hyyz', 'hyyzguina', 1, 2)
							trigger.getParent().effectCount = player.getStorage('hyyzguina_buff').use[trigger.card.name];
						};
					},
				}
			}
		}, hyyzguina_buff: {
			forced: true,
			locked: true,
			charlotte: true,
			mark: true,
			marktext: "归",
			intro: {
				name: "归纳",
				content: function (storage, player) {
					var uses = Object.keys(storage.use).length, targets = Object.keys(storage.target).length;
					if (!(uses + targets)) return '目前没有归纳';
					var str = '';
					if (uses) {
						str += '<p style="text-align: center;">使用牌</p>';
						for (let name in storage.use) {
							str += `<li>【${get.translation(name)}】：${storage.use[name]}`;
						};
					}
					if (targets) {
						str += '<p style="text-align: center;">成为目标</p>';
						for (let name in storage.target) {
							str += `<li>【${get.translation(name)}】：${storage.target[name]}`;
						};
					}
					return str;
				},
			},
			init: function (player) {
				player.storage.hyyzguina_buff = {
					use: {},
					target: {}
				};
			},
			onremove: function (player) {
				delete player.storage.hyyzguina_buff;
			},
		},
		hyyzguina_info: "归纳|锁定技。你每轮第N次<span class='bluetext'>成为一种牌的目标</span>/<span class='legendtext'>使用一种牌指定目标</span>后，若不为第一次，你<span class='bluetext'>摸N张牌</span>/<span class='legendtext'>此牌结算N次</span>。",

		hyyz_jiziwuliangta: ['姬子·无量塔', ["female", "hyyz_b3", 4, ["hyyzxiepin", "hyyzpoxiao", "hyyzhuozhong"], []], '#b活下去，琪亚娜……<br>这就是……最后一课了……', '天命A级女武神。姬子出生于极东之地，是从首批实验性瓦尔基里中成长起来的最高一线作战指挥官。2016年，姬子在与空之律者的战斗中战至力竭，在完成净化律者人格的目标后死亡。'],
		hyyzxiepin: {
			audio: 10,
			trigger: {
				target: "useCardToTarget",
			},
			zhuanhuanji: true,
			mark: true,
			marktext: "☯",
			intro: {
				content(storage, player, skill) {
					return `转换技。当其他角色对你使用牌时，你可以${storage ? '获得该角色一张牌' : '不响应此牌'}。`;
				},
			},
			prompt(event, player) {
				if (player.storage.hyyzxiepin) {
					return '【血拼】<br>获得' + get.translation(event.player) + '的一张牌？';
				} else return '【血拼】<br>不响应' + get.translation(event.card) + '？';
			},
			filter(event, player) {
				if (_status.dying.includes(player) || player.hp < 1) return false;
				if (event.player == player) return false;
				return player.storage.hyyzxiepin ? event.player.countGainableCards(player, 'he') : true;
			},
			check(event, player) {
				if (player.storage.hyyzxiepin) {
					return -get.attitude(player, event.player);
				} else {
					if (get.itemtype(event.cards) != 'cards') return false;
					if (event.getParent().excluded.contains(player)) return true;
					if (get.tag(event.card, 'respondSha')) {
						if (player.countCards('h', { name: 'sha' }) == 0) {
							return true;
						}
					}
					else if (get.tag(event.card, 'respondShan')) {
						if (player.countCards('h', { name: 'shan' }) == 0) {
							return true;
						}
					}
					else if (get.tag(event.card, 'damage')) {
						if (event.card.name == 'shuiyanqijunx') return player.countCards('e') == 0;
						return true;
					}
					return false;
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				player.changeZhuanhuanji('hyyzxiepin');
				if (!player.storage.hyyzxiepin) {
					await player.gainPlayerCard('血拼：获得' + get.translation(trigger.player) + '一张牌', true, trigger.player, 'he').set('ai', function (button) {
						const player = _status.event.player;
						var val = get.value(button.link), color = get.color(button.link);
						if (!player.hasSkill('hyyzpoxiao')) return val;
						if (player.getStorage('hyyzpoxiao').includes('red') && color == 'red') {
							val /= 2;
						};
						if (player.getStorage('hyyzpoxiao').includes('black') && color == 'black') {
							val /= 1.5;
						};
						return val;
					});
				} else {
					trigger.getParent().directHit.add(player);
					await player.gain(trigger.cards, "gain2");
				}
			},
			ai: {
				expose: 2,
				maixie: true,
				threaten: 0.8,
			},
		},
		hyyzxiepin_info: "血拼|转换技。若你不处于濒死状态，其他角色对你使用牌时，你可以：<br>阳：不响应此牌并获得之。<br>阴：获得该角色一张牌。",
		hyyzpoxiao: {
			audio: 7,
			marktext: '<font color=#FF4500>☄️</font>',
			intro: {
				content(storage, player) {
					let str = '破晓已触发的颜色：';
					if (storage.includes('red')) str += '<li><span class=\'firetext\'>空白之键<span>';
					if (storage.includes('black')) str += '<li><span class=\'thundertext\'>弑神之枪<span>';
					return str;
				}
			},
			forced: true,
			group: ['hyyzpoxiao_audio'],
			subSkill: {
				audio: {
					trigger: {
						player: "gainAfter",
						global: "loseAsyncAfter",
					},
					filter(event, player) {
						const cards = event.getg(player);
						if (!cards.length) return false;
						for (let i of cards) {
							if (player.getStorage('hyyzpoxiao').includes(get.color(i))) continue;
							if (game.hasPlayer(current => {
								if (current == player) return false;
								let evt = event.getl(current);
								if (evt && evt.cards && evt.cards.length) return true;
							})) return get.color(i) == 'red' || player.hasUseTarget(i, false);
						}
					},
					forced: true,
					async content(event, trigger, player) {
						const cards = trigger.getg(player);
						let red = [], black = [];
						for (let card of cards) {
							let color = get.color(card);
							if (player.getStorage('hyyzpoxiao').includes(color)) continue;
							if (game.hasPlayer(current => {
								if (current == player) return false;
								let evt = trigger.getl(current);
								if (evt && evt.cards && evt.cards.includes(card)) return true;
							})) {
								if (color == 'red') red.add(card);
								if (color == 'black' && player.hasUseTarget(card, false)) black.add(card);
							}
						}
						if (red.length) {
							const targets = await player
								.chooseUseTarget({ name: 'sha', nature: 'fire' }, '视为使用一张火【杀】', true, false)
								.set('logSkill', 'hyyzpoxiao')
								.forResultTargets();
							if (targets) {
								game.hyyzSkillAudio('hyyz', 'hyyzpoxiao', 1, 2, 3)
								player.markAuto('hyyzpoxiao', ['red']);
							}
						}
						if (black.length) {
							const links = black.length > 1 ? (
								await player
									.chooseButton(true, [`<span class='thundertext'>破晓</span>：使用其中一张牌`, black])
									.set('filterButton', (button) => player.hasUseTarget(button.link))
									.set('ai', (button) => (player.getUseValue(button.link) || get.value(button.link)))
							) : black;
							if (links) {
								game.hyyzSkillAudio('hyyz', 'hyyzpoxiao', 4, 5, 6, 7)
								player.markAuto('hyyzpoxiao', ['black']);
								player.chooseUseTarget(links[0], true, 'nopopup');
							}
						}
						player.when({
							global: 'phaseAfter'
						}).then(() => {
							delete player.storage.hyyzpoxiao;
							player.unmarkSkill('hyyzpoxiao');
						});
					},
				}
			}
		},
		hyyzpoxiao_info: "破晓|锁定技，每回合各限一次。<br>当你获得其他角色的<span class='firetext'>红色</span>/<span class='thundertext'>黑色</span>牌后，你对一名角色<span class='firetext'>视为使用火【杀】</span>/<span class='thundertext'>使用此牌</span>。",
		hyyzhuozhong: {
			audio: 1,
			unique: true,
			enable: "chooseToUse",
			filter: function (event, player) {
				return event.type == 'dying' && player.storage.hyyzhuozhong == false && _status.event.dying != player;
			},
			filterTarget: function (card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			mark: true,
			skillAnimation: true,
			animationStr: "火种",
			limited: true,
			animationColor: "wood",
			init(player) {
				player.storage.hyyzhuozhong = false;
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzhuozhong');
				player.addTempSkill('hyyzhuozhong_buff');
				player.storage.hyyzhuozhong_buff = event.target;
				await game.changeHpTo(player, event.target.hp, event.target, player.hp)
			},
			ai: {
				order: 6,
				threaten: 1.4,
				skillTagFilter: function (player) {
					if (!_status.event.dying) return false;
				},
				save: true,
				result: {
					target: 3,
				},
			},
			intro: {
				content: "limited",
			},
		}, hyyzhuozhong_buff: {
			charlotte: true,
			forceDie: true,
			forced: true,
			direct: true,
			trigger: {
				player: 'dieBefore'
			},
			filter: function (event, player) {
				//var list = player.getStockSkills('仲村由理', '天下第一').filter(function (skill) {
				//	var info = get.info(skill);
				//	return info && !info.charlotte //&& !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.limited && !info.dutySkill;
				//})
				return event.getParent(3).skill == 'hyyzhuozhong' //&& list.length > 0;
			},
			async content(event, trigger, player) {
				//var target = player.storage.hyyzhuozhong_buff;
				//var list = player.getStockSkills('仲村由理', '天下第一').filter(function (skill) {
				//	var info = get.info(skill);
				//	return info && !info.charlotte//&& !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.limited && !info.dutySkill;
				//});
				//const control = await target
				//	.chooseControl(list).set('prompt', '获得一个技能')
				//	.set('forceDie', true)
				//	.set('ai', function () {
				//		return list.randomGet();
				//	})
				//	.forResultControl()
				let control = 'hyyzhuozhong';
				if (control) {
					player.line(player.storage.hyyzhuozhong_buff, 'green');
					player.say('这就是……最后一课了……');
					await player.storage.hyyzhuozhong_buff.addSkills(control);
					await player.removeSkills(control)
					game.log('#g【火种】', player.storage.hyyzhuozhong_buff, '获得了技能', '#g【' + get.translation(control) + '】');
				}
			}
		},
		hyyzhuozhong_info: "火种|限定技。其他角色进入濒死时，你可以交换你们的体力值。若你因此死亡，该角色获得此技能。",


		hyyz_sp_huohuo: ['藿藿', ["female", "hyyz_xt", 3, ["hyyzweiqie", "hyyzxvxing"], ["die:hyyz_huohuo"]], '#b大勇若怯', `
			尾巴在奕水之安群参加比赛的冠军作品。<br>可怜又弱小的狐人小姑娘，也是怕鬼捉鬼的罗浮十王司见习判官。名为“尾巴”的岁阳被十王司的判官封印在她的颀尾上，使她成为了招邪的“贞凶之命”。害怕妖魔邪物，却总是受命捉拿邪祟，完成艰巨的除魔任务；自认能力不足，却无法鼓起勇气辞职，只好默默害怕地继续下去。
			<hr>
			●作者：就离谱<br>
			●个人介绍：大家好，我是尾巴大爷。首先，希望诸位加入「尾门」，我们的信仰只有一个，那就是——藿藿⸜₍๑•⌔•๑₎⸝！凛凛寒冬，让我们一起抱住藿藿取暖！<br>
			●总体设计：叙事方面，取材自我（尾巴）与她的初次相遇；实战操作，包含星铁中实机藿藿的技能效果；玩法感受，则是藿藿本人的性格特点。<br>
			●技能详解：<br>
			⑴〖畏怯〗技能表现藿藿胆小的性格特点，一碰到敌人就龟缩起来。因为延时类锦囊不能重复，所以如果队友不拆，相当于每轮限一次的防御技（如果是虚拟牌，当然就白嫖啦）。<br>
			⑵〖煦心〗是表现藿藿善良温暖的本性，是她救了尾巴大爷我！这个技能表现藿藿救尾巴的场景：<br>
			①将判定区的牌当锦囊使用，可以为队友解判定；如果锦囊是铁锁，可以复原横置的角色，还原实机藿藿的解控定位。除此之外，也可以对自己发动，消除一技能的负面影响；或清空牌量不多的区域，视为使用一张扭转战局的锦囊。<br>
			②若目标包含你，表示尾巴(该角色)在意藿藿，藿藿也愿意和尾巴在一起，尾巴就会得救，实现一次简单的治疗。<br>
			③但如果尾巴(该角色)开南万，想要变成“燎原”干坏事，野心膨胀的尾巴就会伤害藿藿，把藿藿吃掉！但如果藿藿愿意，也可以忍痛喂养尾巴，放任它四处撒野（˃˄ ˂̥̥ ）。<br>
			●总结总体而言，玩法很多。三血两技能，可防御可辅助，必要情况也可以扣一血开南蛮，收益虽高但也不阴间，有克制手段，也有被克制的技能。最后，新的一年，希望各位尾巴都可以找到困难时愿意帮助你的那位“藿藿”，2024新年快乐！`],
		hyyzweiqie: {
			logAudio: () => [
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzsuiyang_buff3.mp3',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzsuiyang_buff4.mp3',
			],
			trigger: {
				target: "useCardToTarget",
			},
			check(event, player) {
				return -get.attitude(player, event.player)
			},
			filter(event, player) {
				if (event.card.name != "sha") return false;
				if (event.targets.length != 1) return false;
				return get.itemtype(event.cards) != 'cards' || !player.hasJudge('lebu');
			},
			async content(event, trigger, player) {
				trigger.card.name = "lebu";
			},
		},
		hyyzweiqie_info: "畏怯|当你成为【杀】的唯一目标时，你可以将此牌合法改为【乐不思蜀】。",
		hyyzxvxing: {
			logAudio: () => [
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzxvxing1.mp3',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzxvxing2.mp3',
			],
			audio: 2,
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			filter(event, player) {
				return game.hasPlayer(current => current.countCards("hej"))
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseTarget()
					.set('prompt', `煦心：令一名角色将一个区域内的所有牌当任一张普通锦囊牌使用`)
					.set('prompt2', `目标包含你，其回复1点体力；<br>目标数大于其体力值，对你造成1点伤害`)
					.set('filterTarget', (card, player, target) => target.countCards("hej"))
					.set('ai', (target) => get.attitude2(target))
					.forResult()
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				let position = [];
				if (target.countCards("h")) position.add("手牌区");
				if (target.countCards("e")) position.add("装备区");
				if (target.countCards("j")) position.add("判定区");
				const control = await target.chooseControl(position)
					.set("prompt", "###将一个区域的牌当任意锦囊牌使用###目标包含藿藿，你回复1点体力；<br>目标数大于" + target.hp + "，对藿藿造成1点伤害")
					.set("ai", () => {
						let player = _status.event.player;
						if (position.includes('判定区')) return "判定区";
						if (position.length == 1) return position[0];
						let cards1 = player.getCards("e")
						let num1 = cards1.map(a => get.value(a)).reduce((a, b) => a + b);
						let cards2 = player.getCards("h")
						let num2 = cards2.map(a => get.value(a)).reduce((a, b) => a + b);
						if (num1 > num2) return "手牌区";
						return position[0];
					})
					.forResult('control');
				if (control) {
					game.hyyzSkillAudio('hyyz', 'hyyzxvxing', 3)
					let map = {
						"手牌区": "h",
						"装备区": "e",
						"判定区": "j",
					}
					let list = [];
					for (let name of lib.inpile) {
						if (!target.hasUseTarget({ name: name })) continue;
						if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
					};
					const links = await target.chooseButton(true, [`###选择一张牌###目标包含藿藿，其回复1点体力；<br>目标数大于${target.hp}，对藿藿造成1点伤害`, [list, 'vcard']])
						.set('ai', (button) => get.value({ name: button.link[2] }))
						.forResult('links')
					if (links) {
						let cards = target.getCards(map[control]);
						player.when({
							global: 'useCardAfter'
						}).filter((event, player) => {
							return event.getParent(2).name == "hyyzxvxing";
						}).then(() => {
							if (trigger.targets.includes(player)) {
								game.hyyzSkillAudio('hyyz', 'hyyzxvxing', 4, 5)
								player.line("green", trigger.player);
								trigger.player.recover();
							};
							if (trigger.targets.length > trigger.player.hp) {
								trigger.player.line("fire", player);
								player.damage(trigger.player);
							};
							game.delayx()
						})
						target.chooseUseTarget({ name: links[0][2] }, cards, true);
					}
				}
			},
		},
		hyyzxvxing_info: "煦心|准备阶段，你可以令一名角色将一个区域内的牌当任一普通锦囊牌使用。结算后若此牌的目标包含你，其回复1点体力；目标数大于其体力值，其对你造成1点伤害。",

		meng_danhengbailu: ['丹恒&白露', ["double", "hyyz_xt", 4, ["mengwugui", "menggushen", "mengjuefeng"], []], '日玖阳气冲三关'],//
		mengwugui: {
			init: (player) => {
				player.storage.mengwugui = {};
				player.syncStorage("mengwugui");
			},
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				if (!lib.skill.mengwugui.choices.length) return false;
				let map = player.getStorage('mengwugui');
				let list = lib.skill.mengwugui.choices.slice();
				for (let i of list) {
					if (map[i[0]]) continue;
					switch (i[0]) {
						case 'damage':
							return true;
						case 'discard':
							if (player.countCards('he') >= 2) return true;
							break;
						case 'link':
							if (!player.isLinked()) return true;
							break;
						case 'recover':
							if (player.isDamaged()) return true;
							break;
						case 'draw':
							return true;
						case 're':
							if (player.isLinked() || player.isTurnedOver()) return true;
							break;
					}
				}
				return false;
			},
			async content(event, trigger, player) {
				let dialog = ui.create.dialog('无归：选择一项', 'hidden');
				dialog.add([lib.skill.mengwugui.choices.slice(), 'textbutton']);
				const {
					result: {
						links
					}
				} = await player.chooseButton(dialog)
					.set('filterButton', function (button, player) {
						let link = button.link;
						let map = player.getStorage('mengwugui');
						if (map[link]) return false;
						if (link == 'damage') return true;
						if (link == 'discard') return player.countCards('he') >= 2;
						if (link == 'link') return !player.isLinked();
						if (link == 'recover') return player.isDamaged();
						if (link == 'draw') return true;
						if (link == 're') return player.isLinked() || player.isTurnedOver();
					})
					.set('ai', function (button) {
						return button.link == lib.skill.mengwugui.choices.slice()
							.randomGet();
					})
				if (!links || !links.length) return;
				player.storage.mengwugui[links[0]] = true;
				player.when({
					global: 'phaseAfter'
				})
					.then(() => {
						player.storage.mengwugui = {};
						player.syncStorage("mengwugui");
					});
				switch (links[0]) {
					case 'damage':
						player.damage('thunder');
						break;
					case 'discard':
						player.chooseToDiscard('he', 2, true);
						break;
					case 'link':
						player.link(true);
						break;
					case 'recover':
						player.recover();
						break;
					case 'draw':
						player.draw(2);
						break;
					case 're':
						{
							if (player.isLinked()) player.link();
							if (player.isTurnedOver()) player.turnOver();
							break;
						}
				}
				const {
					result: {
						targets
					}
				} = await player.chooseTarget('无归：令一名其他角色执行其他项或进行【闪电】判定', lib.filter.notMe)
					.set('ai', target => -get.attitude(player, target));
				if (!targets || !targets.length) return
				player.line(targets[0], 'fire');
				let list = [];
				const choiceList = lib.skill.mengwugui.choices.slice();
				let choiceList2 = choiceList.map((link, n, array) => {
					link = link[1];
					let ok = true;
					if (array[n][0] == links[0]) {
						link += '（' + get.translation(player) + '已选）';
						ok = false;
					}
					switch (choiceList[n][0]) {
						case 'damage':
							break;
						case 'discard':
							if (targets[0].countCards('he') < 2) ok = false;
							break;
						case 'link':
							if (targets[0].isLinked()) ok = false;
							break;
						case 'recover':
							if (targets[0].isDamaged()) ok = false;
							break;
						case 'draw':
							break;
						case 're':
							if (targets[0].isLinked() && targets[0].isTurnedOver()) ok = false;
							break;
					}
					if (ok) list.push('选项' + get.cnNumber(n + 1, true));
					else link = '<span style="opacity:0.5">' + link + '</span>';
					return link;
				});
				list.push('判【闪电】');
				if (list.length) {
					const {
						result: {
							control
						}
					} = await targets[0].chooseControl(list)
						.set('choiceList', choiceList2)
						.set('ai', () => list.randomGet());
					if (control && control != '判【闪电】') {
						let choice = choiceList[lib.skill.mengwugui.getNum[control.slice(2)] - 1][0];
						switch (choice) {
							case 'damage':
								targets[0].damage('thunder');
								break;
							case 'discard':
								targets[0].chooseToDiscard('he', 2, true);
								break;
							case 'link':
								targets[0].link(true);
								break;
							case 'recover':
								targets[0].recover();
								break;
							case 'draw':
								targets[0].draw(2);
								break;
							case 're':
								{
									if (targets[0].isLinked()) targets[0].link();
									if (targets[0].isTurnedOver()) targets[0].turnOver();
									break;
								}
						}
					} else {
						targets[0].executeDelayCardEffect('shandian');
					}
				} else {
					game.log(targets[0], "没有能执行的选项");
				}
			},
			choices: [
				["damage", "受到1点雷电伤害"],
				["discard", "弃置两张牌"],
				["link", "横置"],],
			getNum: {
				'一': 1,
				'二': 2,
				'三': 3,
				'四': 4,
				'五': 5,
				'六': 6,
				'七': 7,
				'八': 8,
				'九': 9,
				'十': 10,
				'十一': 11,
				'十二': 13,
			}
		},
		menggushen: {
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return lib.skill.menggushen.choices.length > 0;
			},
			chooseButton: {
				dialog(event, player) {
					var dialog = ui.create.dialog('顾神：选择一项', 'hidden');
					dialog.add([lib.skill.menggushen.choices.slice(), 'textbutton']);
					return dialog;
				},
				filter(button, player) {
					var link = button.link;
					if (link == 'damage') return true
					if (link == 'discard') return player.countCards("he") >= 2;
					if (link == 'link') return !player.isLinked();
					if (link == 'recover') return player.isDamaged();
					if (link == 'draw') return true;
					if (link == 're') return player.isLinked() || player.isTurnedOver();
				},
				backup(links) {
					var next = get.copy(lib.skill['menggushen_backupx']);
					next.choice = links[0];
					return next;
				},
				prompt(links) {
					if (links[0] == 'damage') return '受到1点雷电伤害';
					if (links[0] == 'discard') return '弃置两张牌';
					if (links[0] == 'link') return '横置';
					if (links[0] == 'recover') return '回复1点体力';
					if (links[0] == 'draw') return '摸两张牌';
					if (links[0] == 're') return '复原武将牌';
				},
			},
			subSkill: {
				backup: {
					sub: true,
					"_priority": 0,
				},
				backupx: {
					selectCard: -1,
					selectTarget: -1,
					filterCard: () => false,
					filterTarget: () => false,
					multitarget: true,
					content() {
						'step 0'
						var choice = lib.skill.menggushen_backup.choice;
						event.choice = choice;
						switch (choice) {
							case 'damage':
								player.damage('thunder');
								break;
							case 'discard':
								player.chooseToDiscard('he', 2, true);
								break;
							case 'link':
								player.link(true);
								break;
							case 'recover':
								player.recover();
								break;
							case 'draw':
								player.draw(2);
								break;
							case 're':
								{
									if (player.isLinked()) player.link();
									if (player.isTurnedOver()) player.turnOver();
									break;
								}
						}
						'step 1'
						if (!player.isIn() || !game.hasPlayer(current => current != player)) event.finish();
						else player.chooseTarget('顾神：令一名其他角色执行此项，或点取消进行【闪电】判定', lib.filter.notMe)
							.set('ai', target => get.attitude(player, target));
						'step 2'
						if (result.bool) {
							var target = result.targets[0];
							event.target = target;
							player.line(target, 'green');
							switch (event.choice) {
								case 'damage':
									target.damage('thunder');
									break;
								case 'discard':
									target.chooseToDiscard('he', 2, true);
									break;
								case 'link':
									target.link(true);
									break;
								case 'recover':
									target.recover();
									break;
								case 'draw':
									target.draw(2);
									break;
								case 're':
									{
										if (target.isLinked()) target.link();
										if (target.isTurnedOver()) target.turnOver();
										break;
									}
							}
						} else {
							player.executeDelayCardEffect('shandian');
						}

					},
					sub: true,
					"_priority": 0,
				},
			},
			choices: [
				["recover", "回复1点体力"],
				["draw", "摸两张牌"],
				["re", "复原武将牌"],],
		},
		mengjuefeng: {
			trigger: {
				player: 'damageAfter',
				source: 'damageSource'
			},
			usable: 1,
			async content(event, trigger, player) {
				player.draw(2);
				if (trigger.source && trigger.source.isIn() && player.hasSkill('mengwugui') && player.hasSkill('menggushen')) {
					let {
						result
					} = await trigger.source.chooseControl('交换选项', `令${trigger.source == player ? '你' : get.translation(player)}控顶`)
						.set('ai', () => `令${trigger.source == player ? '你' : get.translation(player)}控顶`);
					if (result.control) {
						if (result.control == '交换选项') {
							const choice1 = lib.skill.mengwugui.choices.slice(), choice2 = lib.skill.menggushen.choices.slice();
							let dialog = ui.create.dialog('交换上下两个选项', 'hidden');
							dialog.addText('无归');
							dialog.add([choice1, 'textbutton']);
							dialog.addText('顾神');
							dialog.add([choice2, 'textbutton']);
							let {
								result: {
									links
								}
							} = await player.chooseButton(dialog)
								.set('filterButton', function (button, player) {
									if (ui.selected.buttons.length) {
										let listx = _status.event.listx;
										return listx[0].some(link => link[0] == ui.selected.buttons[0].link) && listx[1].some(link => link[0] == button.link) || listx[0].some(link => link[0] == button.link) && listx[1].some(link => link[0] == ui.selected.buttons[0].link);
									}
									return true;
								})
								.set('selectButton', 2)
								.set('forced', true)
								.set('listx', [choice1, choice2]);
							if (links && links.length == 2) {
								let index1, index2;
								if (choice1.some(x => x[0] == links[0])) {
									for (let i = 0; i < choice1.length; i++) {
										if (choice1[i][0] == links[0]) {
											index1 = i;
											break;
										}
									}
									for (let i = 0; i < choice2.length; i++) {
										if (choice2[i][0] == links[1]) {
											index2 = i;
											break;
										}
									}
								} else if (choice2.some(x => x[0] == links[0])) {
									for (let i = 0; i < choice1.length; i++) {
										if (choice1[i][0] == links[1]) {
											index1 = i;
											break;
										}
									}
									for (let i = 0; i < choice2.length; i++) {
										if (choice2[i][0] == links[0]) {
											index2 = i;
											break;
										}
									}
								} else return;
								const str1 = lib.translate.mengwugui_info.replace(choice1[index1][1], choice2[index2][1]);
								const str2 = lib.translate.menggushen_info.replace(choice2[index2][1], choice1[index1][1]);
								lib.translate.mengwugui_info = str1;
								lib.translate.menggushen_info = str2;
								[lib.skill.mengwugui.choices[index1], lib.skill.menggushen.choices[index2]] = [lib.skill.menggushen.choices[index2], lib.skill.mengwugui.choices[index1]];
							} else return;
						} else if (player.countCards('he') > 0) {
							let {
								result
							} = await player.chooseCard('将一张牌控顶', true);
							if (result.bool) {
								player.lose(result.cards[0], ui.cardPile, 'insert');
								player.$throw(result.cards, 1000);
								game.log(player, '将一张牌置于牌堆顶');
							}
						}
					}
				}
			}
		},
		meng_pink: ['颦客', ["female", "shu", 7, ["mengyingzhu", "mengqiongpi"], []], '萨巴鲁酱', ''],
		mengyingzhu: {
			unique: true,
			audio: 6,
			logAudio: () => false,
			init(player) {
				player.storage.mengyingzhu = new Map();
			},
			marktext: '荧',
			intro: {
				content(storage, player) {
					var str = '“先辅”的角色：';
					storage.forEach((value, key, map) => {
						if (key.isIn()) str += `<li>${get.translation(key)}：${value}`;
					});
					return str;
				}
			},
			trigger: {
				global: 'roundStart',
				player: 'damageEnd',
			},
			forced: true,
			async content(event, trigger, player) {
				if (trigger.name == 'damage') {
					let yiji_targets = game.filterPlayer(current => player.getStorage('mengyingzhu').has(current));
					if (yiji_targets.length > 1) {
						yiji_targets = await player
							.chooseTarget(true, '与一名“偶”依次遗计X', 'X为你先辅其的次数', function (card, player, target) {
								return player.getStorage('mengyingzhu').has(target);
							})
							.set('ai', (target) => {
								let att = get.attitude2(target);
								if (player.getStorage('mengyingzhu').has(target)) att *= 2;
								return att;
							})
							.forResultTargets();
					}
					if (yiji_targets) {
						const target = yiji_targets[0];
						let map = player.getStorage('mengyingzhu');
						let a = ['为国除弊，怎惜残年！', '接天连夜无穷碧，映日荷花别样红！'].randomGet();
						player.say(a);
						if (a == '为国除弊，怎惜残年！') {
							game.hyyzSkillAudio('meng', 'mengyingzhu', 3)
						} else {
							game.hyyzSkillAudio('meng', 'mengyingzhu', 4)
						}
						const allcount = Math.min(map.get(target), 3);//先辅次数至多3
						for (const current of [player, target]) {
							await current.draw(allcount);
							let count = allcount;
							while (count > 0 && player.countCards('h')) {
								const [cards, targets] = await current
									.chooseCardTarget({
										filterCard(card) {
											return get.itemtype(card) == 'card'
										},
										filterTarget: lib.filter.notMe,
										selectCard: [1, count],
										prompt: `荧逐：你可以交出${count}/${allcount}张牌`,
										ai1(card) {
											if (!ui.selected.cards.length) return 1;
											return 0;
										},
										ai2(target) {
											var player = _status.event.player, card = ui.selected.cards[0];
											var val = target.getUseValue(card);
											if (val > 0) return val * get.attitude(player, target) * 2;
											return get.value(card) * get.attitude(player, target);
										},
									})
									.forResult('cards', 'targets');
								if (cards && targets) {
									if (player.getStorage('mengyingzhu').has(current) && targets[0] == player) {
										let a = ['姐妹们，爱国真的有用！', '耶！被阿中哥哥表扬了！'].randomGet();
										player.say(a);
										if (a == '姐妹们，爱国真的有用！') {
											game.hyyzSkillAudio('meng', 'mengyingzhu', 5)
										} else {
											game.hyyzSkillAudio('meng', 'mengyingzhu', 6)
										}
									};
									await current.give(cards, targets[0]);
									count -= cards.length;
								} else {
									break;
								}
							}
						}
					}
				} else {
					const targets = await player
						.chooseTarget(true, '“先辅”一名其他角色', lib.translate.xianfu_info, lib.filter.notMe)
						.set('ai', function (target) {
							let att = get.attitude(_status.event.player, target);
							if (att > 0) return att + 1;
							if (att == 0) return Math.random();
							return att;
						})
						.set('animate', false)
						.forResultTargets();
					if (targets) {
						const target = targets[0];
						const map = player.getStorage('mengyingzhu');

						let a = ['玄甲耀目，朱旗绛天！', '干云气惊八万里，一键光寒十九州！'].randomGet();
						player.say(a);
						if (a == '玄甲耀目，朱旗绛天！') {
							game.hyyzSkillAudio('meng', 'mengyingzhu', 1)
						} else {
							game.hyyzSkillAudio('meng', 'mengyingzhu', 2)
						}
						player.storage.mengyingzhu.set(target, map.has(target) ? map.get(target) + 1 : 1);
						player.markSkill('mengyingzhu');
						target.addSkill('mengyingzhu_log');
						target.markSkill('mengyingzhu_log');
					}
				}
			},
			group: ['mengyingzhu_xianfu', 'mengyingzhu_log', 'mengyingzhu_die'],
			subSkill: {
				xianfu: {
					charlotte: true,
					trigger: {
						global: ["damageEnd", "recoverEnd"],
					},
					forced: true,
					filter(event, player) {
						if (event.player.isDead() || !player.getStorage('mengyingzhu')?.size || !player.getStorage('mengyingzhu')?.has(event.player) || event.num <= 0) return false;
						if (event.name == 'damage') return true;
						return player.isDamaged();
					},
					logTarget: "player",
					async content(event, trigger, player) {
						player[trigger.name](trigger.num, 'nosource');
					},
				},
				log: {
					mark: true,
					marktext: '偶',
					intro: {
						markcount(storage, player) {
							let target = game.filterPlayer(current => current != player && current.hasSkill('mengyingzhu') && current.getStorage('mengyingzhu').size > 0)[0];
							if (!target) return;
							let map = target.getStorage('mengyingzhu');
							return '' + map.get(player);
						},
						content(storage, player) {
							let target = game.filterPlayer(current => current != player && current.hasSkill('mengyingzhu') && current.getStorage('mengyingzhu').size > 0)[0];
							if (!target) return '好像有人不在了<br>但你毫不在意';
							let map = target.getStorage('mengyingzhu');
							return `颦客对你的狂热：${map.get(player)}`;
						}
					}
				},
				die: {
					trigger: {
						player: ['changeHp', 'damageEnd', 'loseMaxHpEnd']
					},
					silent: true,
					charlotte: true,
					locked: true,
					forceDie: true,
					priority: Infinity,
					filter: (event, player) => player.isDamaged(),
					async content(event, trigger, player) {
						if (player.hp > 0) {
							player.maxHp = player.hp;
							player.update();
						} else {
							player.maxHp = player.hp;
							player.update();
							if (trigger.getParent()?.source) {
								const next = player.die();
								next.source = trigger.getParent().source;
							} else {
								player.say('江山娇矣…红旗漫乎…')//江山娇也！红旗漫也！
								player.die();
							}
						}
					},
					mod: {
						cardSavable(card, player) {
							if (player.name != 'meng_pink') return;
							if (player.isDying() && ['tao', 'jiu'].includes(card.name)) return false;
						},
						cardEnabled(card, player) {
							if (player.name != 'meng_pink') return;
							if (player.isDying() && ['tao', 'jiu'].includes(card.name)) return false;
						},
					},
				},
			},
			ai: {
				threaten(player, target) {
					return 1.5;
				},
			},
			derivation: ['xianfu', 'new_reyiji'],
		},
		mengqiongpi: {//<span class='firetext'>使命技</span>，当你或<span class='firetext'>“偶”</span>获得另一名角色的牌后或对另一名角色造成伤害后，你将该角色的一张牌置为“逆”。失败：当你成为<span class='firetext'>“偶”</span>使用虚拟牌的目标时，其获得你的所有牌与所有“逆”。
			audio: 12,
			unique: true,
			logAudio: () => false,
			dutySkill: true,
			trigger: {
				global: ["gainAfter", "loseAsyncAfter", 'damageAfter']
			},
			forced: true,
			filter(event, player) {
				const iso = function (current) {
					return player.getStorage('mengyingzhu').has(current)
				}
				if (!player.getStorage('mengyingzhu')) return false;
				if (event.name == 'damage') {//一名角色对其他角色造成伤害后
					if (!event.source || !event.player.countCards('he')) return false;
					if (event.source == player || iso(event.source)) return false;
					if (event.player == event.source) return false;
					//若该角色为你/偶，且受伤角色不为偶/你
					return iso(event.source) && event.player != player ||
						event.source == player && !iso(event.player)
				} else if (event.name == 'gain') {//一名角色获得其他角色的牌后
					let cards = event.getg(event.player);
					if (!cards.length) return false;
					if (event.player == player) {
						//game.log('pink获得牌');
						//你获得，失去的人非偶
						return game.hasPlayer(current => {
							if (current == player || !current.countCards('he') || !current.isIn()) return false;//
							//game.log('1是pink，且有牌');
							if (iso(current)) return false;
							//game.log('1',current,'不是偶');
							let hs = event.getl(current).cards;
							for (let i of hs) {
								if (cards.includes(i)) return true;
							}
						})
					} else if (iso(event.player)) {
						//game.log('偶获得牌');
						//偶获得牌，失去人非你+非此偶
						return game.hasPlayer(current => {
							if (current == event.player || !current.countCards('he') || !current.isIn()) return false;//
							if (current == player) return false;
							//game.log('通过2');
							let hs = event.getl(current).cards;
							for (let i of hs) {
								if (cards.includes(i)) return true;
							}
						})
					}
					return false;
				} else if (event.type == 'gain') {//不能你分配
					if (event.giver || !event.player == player || !event.player || !event.player.countCards('he') || !event.player.isIn()) return false;
					let hs = event.getl(event.player).cards;
					//偶分配牌，其他偶获得
					if (iso(event.player)) {
						//game.log('偶分配牌');
						return game.hasPlayer(current => {
							if (current == event.player) return false;//
							if (!iso(current)) return false;
							//game.log('通过3');
							let cards = event.getg(current);
							for (let i of cards) {
								if (hs.includes(i)) return true;
							}
						})
					} else {//普通人分配牌，你或偶获得
						//game.log('普通人分配牌');
						return game.hasPlayer(current => {
							if (current == event.player) return false;
							if (current == player || iso(current)) {
								//game.log('通过4');
								let cards = event.getg(current);
								for (let i of cards) {
									if (hs.includes(i)) return true;
								}
							}
						})
					}
				}
				return false;
			},
			content: function () {
				'step 0'
				let target;
				if (trigger.name == 'damage') {
					target = trigger.player;//拿受伤角色的牌
					if (player.getStorage('mengyingzhu').has(trigger.source)) {
						let a = ['摅高文之宿愤，光祖宗之玄灵！', '拓后嗣之境宇，振华夏之天声！'].randomGet();
						player.say(a);
						if (a == '摅高文之宿愤，光祖宗之玄灵！') {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 3)
						} else {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 4)
						}
					} else if (trigger.source == player) {
						let a = ['不服国命，纵兵凶战危，也应以血相偿！', '花墙霸屏金鼓震，饭圈起兮万人随！'].randomGet();
						player.say(a);
						if (a == '不服国命，纵兵凶战危，也应以血相偿！') {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 7)
						} else {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 8)
						}
					}
				} else if (trigger.name == 'gain') {
					var cards = trigger.getg(trigger.player);
					if (trigger.player == player) {
						let a = ['饭圈出征，寸草不生！', '守护我们最好的阿中哥哥！'].randomGet();
						player.say(a);
						if (a == '饭圈出征，寸草不生！') {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 5)
						} else {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 6)
						}
						target = game.filterPlayer(current => {
							if (current == trigger.player) return false;//失去牌的人是获得的牌的人
							if (player.getStorage('mengyingzhu').has(current) || !current.countCards('he') || current == player) return false;
							let hs = trigger.getl(current).cards;
							for (let i of hs) {
								if (cards.includes(i)) return true;
							}
							return false;
						})[0];
					} else {
						if (player.getStorage('mengyingzhu').has(trigger.player)) {
							let a = ['蠢尔蛮荆，大邦为仇！', '威动四极，武义直方！'].randomGet();
							player.say(a);
							if (a == '蠢尔蛮荆，大邦为仇！') {
								game.hyyzSkillAudio('meng', 'mengqiongpi', 1)
							} else {
								game.hyyzSkillAudio('meng', 'mengqiongpi', 2)
							}
						}
						target = game.filterPlayer(current => {
							if (current != trigger.player || !current.countCards('he') || current == player || !current.isIn()) return false;
							let hs = trigger.getl(current).cards;
							for (let i of hs) {
								if (cards.includes(i)) return true;
							}
							return false;
						})[0]
					}
					target = game.filterPlayer(current => {
						if (current == trigger.player || !current.countCards('he')) return false;
						var hs = trigger.getl(current).cards;
						for (var i of hs) {
							if (cards.includes(i)) return true;
						}
					})[0];
				} else {//拿分配牌的牌
					target = trigger.player;
				}
				if (!target) return;
				player.choosePlayerCard(target, 'he', true, '将' + get.translation(target) + '的一张牌置为“逆”');
				event.target = target;
				'step 1'
				if (result.bool) {
					player.addToExpansion(result.cards, event.target, 'give').gaintag.add('mengqiongpi');
				}
			},
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			onremove: function (player) {
				var cards = player.getExpansions('mengqiongpi');
				if (cards.length) player.loseToDiscardpile(cards);
			},
			global: 'mengqiongpi_ni',
			group: ['mengqiongpi_fail'],
			subSkill: {
				fail: {
					trigger: {
						target: 'useCardToTargeted'
					},
					forced: true,
					filter: (event, player) => {
						return player.getStorage('mengyingzhu').get(event.player) &&
							(get.itemtype(event.cards) != 'cards' || !event.cards || !event.cards.length);
					},
					content: function () {
						'step 0'
						game.log(player, '使命失败');
						player.awakenSkill('mengqiongpi');
						'step 1'
						let a = ['主公，臣妾无异心呐！', '铁拳怎么砸到我身上了？'].randomGet();
						player.say(a);
						if (a == '主公，臣妾无异心呐！') {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 11)
						} else {
							game.hyyzSkillAudio('meng', 'mengqiongpi', 12)
						}
						player.give(player.getCards('he'), trigger.player);
						player.give(player.getExpansions('mengqiongpi'), trigger.player);
					},
				},
				ni: {
					name: '陷嗣(茕辟)',
					enable: "chooseToUse",
					viewAs: {
						name: "sha",
						isCard: true,
					},
					filter: function (event, player) {
						return game.hasPlayer(function (current) {
							return current.hasSkill('mengqiongpi') && current.getExpansions('mengqiongpi').length > 1 && event.filterTarget({ name: 'sha' }, player, current);
						});
					},
					filterTarget: function (card, player, target) {
						var bool = false;
						var players = ui.selected.targets.slice(0);
						for (var i = 0; i < players.length; i++) {
							if (players[i].hasSkill('mengqiongpi') && players[i].getExpansions('mengqiongpi').length > 1) bool = true; break;
						}
						if (!bool && (!target.hasSkill('mengqiongpi') || target.getExpansions('mengqiongpi').length <= 1)) return false;
						return _status.event._backup.filterTarget.apply(this, arguments);
					},
					complexSelect: true,
					selectCard: -1,
					filterCard: function () {
						return false;
					},
					forceaudio: true,
					prompt: "弃置一名有【逆】的角色的两张【逆】，然后视为对包含其在内的角色使用【杀】。",
					delay: false,
					log: false,
					precontent: function () {
						"step 0"
						var targets = event.result.targets.filter(function (current) {
							return current.getExpansions('mengqiongpi').length > 1 && current.hasSkill('mengqiongpi');
						});
						if (targets.length == 1) {
							event.target = targets[0];
							event.goto(2);
						}
						else if (targets.length > 0) {
							player.chooseTarget(true, '选择弃置【陷嗣】牌的目标', function (card, player, target) {
								return _status.event.list.includes(target);
							}).set('list', targets).set('ai', function (target) {
								var player = _status.event.player;
								return get.attitude(player, target);
							});
						}
						else {
							event.finish();
						}
						"step 1"
						if (result.bool && result.targets.length) {
							event.target = result.targets[0];
						}
						else {
							event.finish();
						}
						"step 2"
						if (event.target) {
							if (event.target.getExpansions('mengqiongpi').length == 2) {
								event.directresult = event.target.getExpansions('mengqiongpi').slice(0);
							}
							else {
								player.chooseCardButton('移去两张“逆”', 2, event.target.getExpansions('mengqiongpi'), true);
							}
						}
						else {
							event.finish();
						}
						"step 3"
						if (event.directresult || result.bool) {
							player.logSkill('mengqiongpi', event.target);
							var links = event.directresult || result.links;
							target.loseToDiscardpile(links);
							let a = ['不惧千夫指，但求无愧心！', '你们越是指责我，那就越说明我做对了！'].randomGet();
							target.say(a);
							if (a == '不惧千夫指，但求无愧心！') {
								game.hyyzSkillAudio('meng', 'mengqiongpi', 9)
							} else {
								game.hyyzSkillAudio('meng', 'mengqiongpi', 10)
							};
						}
					},
					ai: {
						order: 10,
						effect: {
							player: (card, player, target, current) => {
								if (card.name != 'sha') return;
								if (!target.hasSkill('mengqiongpi') || target.getExpansions('mengqiongpi').length < 2) return;
								if (target.hasSkill('mengyingzhu') && target.getStorage('mengyingzhu').has(player)) {
									if (_status.event.skill == 'mengqiongpi_ni') {
										if (target.hp < 3) return [0, target.getExpansions('mengqiongpi').length - player.hp];
										if (!player.countCards('h')) return [1, 0, 0, target.getExpansions('mengqiongpi').length - 4];
									}
								}
							}
						}
					}
				}
			},
			ai: {
				threaten: 3,
			},
			derivation: 'xiansi'
		},
		meng_shanhugongxinhai: ['珊瑚宫心海', ["female", "hyyz_ys", 3, ["mengchengxin", "mengshouyuan"], []], '冷若寒'],//
		mengchengxin: {
			audio: 3,
			init: (player) => player.storage.mengchengxin = {
				"h": false,
				"e": false,
				"j": false,
			},
			hiddenCard: function (player, name) {
				let map = player.getStorage("mengchengxin")
				for (let i in map) {
					if (!player.countCards(i) || map[i]) continue;
					var cards = player.getCards(i);
					var mod2 = game.checkMod(cards[0], player, 'unchanged', 'cardEnabled2', player);
					if (mod2 === false) continue;
					return get.type(name) == 'trick'
				}
				return false;
			},
			enable: "chooseToUse",
			filter: function (event, player) {
				let map = player.getStorage("mengchengxin")
				for (let i in map) {
					if (!player.countCards(i) || map[i]) continue;
					var cards = player.getCards(i);
					var mod2 = game.checkMod(cards[0], player, 'unchanged', 'cardEnabled2', player);
					if (mod2 === false) continue;
					for (let j of lib.inpile) {
						if (get.type(j) == 'trick' && event.filterCard({
							name: j,
							cards: cards,
						}, player, event)) return true;
					}
				}
				return false;
			},
			chooseButton: {
				dialog: function (event, player) {
					var position = [];
					if (player.countCards("h") && !player.storage.mengchengxin["h"]) position.push(["h", "手牌区"]);
					if (player.countCards("e") && !player.storage.mengchengxin["e"]) position.push(["e", "装备区"]);
					if (player.countCards("j") && !player.storage.mengchengxin["j"]) position.push(["j", "判定区"]);
					var list = [];
					for (var i of lib.inpile) {
						if (!event.filterCard({
							name: i,
						}, player, event) || get.type(i) != 'trick') continue;
						if (["guohe", "wuzhong", "wuxie"].includes(i)) {
							list.push(['锦囊', '', i]);
						}
					}
					var list2 = [];
					player.getCards('j', card => {
						return (card.viewAs || card.name) == 'xumou_jsrg';
					})
						.map(card => {

							if (["basic", "trick"].includes(get.type2(card)) && !list2.some(list => list[2] == card.name) && event.filterCard({
								name: card.name,
							}, player, event)) list2.push([get.translation(get.type2(card)), "", card.name])
						})
					return ui.create.dialog('澄心', '牌源区域', [position, 'tdnodes'], '智囊', [list, 'vcard'], '蓄谋', list2.length ? [list2, 'vcard'] : '没有可转化的蓄谋牌', 'hidden');
				},
				select: 2,
				filter: function (button) {
					if (ui.selected.buttons.length) return (typeof ui.selected.buttons[0].link) != (typeof button.link);
					return true
				},
				check: function (button) {
					if (typeof button.link == 'num') return 1;
					var player = _status.event.player;
					return player.getUseValue({
						name: button.link[2]
					}) + 1;
				},
				backup: function (links, player) {
					var string1 = links.filter(a => typeof a == "string")[0];
					var string2 = links.filter(a => typeof a == "object")[0][2];
					var cards = player.getCards(string1);
					return {
						filterCard: () => false,
						cards: cards,
						position: string1,
						selectCard: -1,
						viewAs: {
							name: string2,
						},
						onuse: function (result, player) {
							// result.cards = lib.skill[result.skill].cards;
							// let p = lib.skill[result.skill].position;
						},
						precontent: function () {
							player.logSkill('mengchengxin', result.targets);
							event.result.cards = lib.skill[event.result.skill].cards;
							let p = lib.skill[event.result.skill].position;
							player.when({
								global: 'roundStart'
							}).then(() => {
								player.storage.mengchengxin = {
									"h": false,
									"e": false,
									"j": false,
								}
								player.syncStorage("mengchengxin");
							});
							player.storage.mengchengxin[p] = true;
							// var card = event.result.cards[0];
							// event.result.card.suit = get.suit(card);
							// event.result.card.number = get.number(card);
						},
					}
				},
				prompt: function (links, player) {
					let map = {
						"h": "手牌区",
						"e": "装备区",
						"j": "判定区",
					}
					return '将' + map[links.filter(a => typeof a == "string")[0]] + '的牌当做' + get.translation(links.filter(a => typeof a == "object")[0][2]) + '使用';
				},
			},
			ai: {
				order: 12,
				result: {
					player: 1,
				},
			},
			group: ["mengchengxin_1"],
			subSkill: {
				"1": {
					audio: 'mengchengxin',
					trigger: {
						player: "useCardAfter",
					},
					filter(event, player) {
						return event.skill && event.skill == "mengchengxin_backup" && player.countCards("hej") >= event.cards.length && !player.isDisabledJudge();
					},
					prompt: "是否将这些牌蓄谋?",
					async content(event, trigger, player) {
						trigger.cards.map(card => {
							player.addJudge({
								name: 'xumou_jsrg'
							}, card);
						})
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengshouyuan: {
			audio: 3,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player) {
				var evt = event.getl(player);
				if (!evt) return;
				return evt.js && evt.js.length > 0 && !player.countCards("j") || evt.hs && evt.hs.length > 0 && !player.countCards("h") || evt.es && evt.es.length > 0 && !player.countCards("e");
			},
			equip: (player, num) => {
				if (!num) return;
				if (!player.hasEmptySlot()) return;
				for (var i = 1; i < 7; i++) {
					if (player.hasEmptySlot(i)) {
						var sub = 'equip' + i,
							card = get.cardPile(function (card) {
								return get.subtype(card, false) == sub && !get.cardtag(card, 'gifts') && player.canEquip(card);
							});
						if (card) {
							num--;
							player.$gain2(card);
							game.delayx();
							player.equip(card);
							if (!num) return;
						}
					} else break;
				};
			},
			hand: (player, num) => {
				if (!num) return;
				if (player.hasSkill("mengshouyuan_h")) return;
				player.draw(num);
			},
			judge: (player, num) => {
				if (!num) return;
				if (player.isDisabledJudge()) return;
				while (num) {
					num--;
					player.addJudge({
						name: 'xumou_jsrg'
					}, get.cards());
				}
			},
			async content(event, trigger, player) {
				const map = player.getStorage("mengchengxin");
				let num = 0;
				if (map) for (let i in map) if (map[i] == true) num++;
				const evt = trigger.getl(player);
				if (evt.js && evt.js.length > 0 && !player.countCards("j")) {
					player.disableJudge();
					lib.skill.mengshouyuan.equip(player, num);
					lib.skill.mengshouyuan.hand(player, num);
				}
				if (evt.es && evt.es.length > 0 && !player.countCards("e")) {
					player.disableEquip('equip1');
					player.disableEquip('equip2');
					player.disableEquip('equip3');
					player.disableEquip('equip4');
					player.disableEquip('equip5');
					lib.skill.mengshouyuan.hand(player, num);
					lib.skill.mengshouyuan.judge(player, num);
				}
				if (evt.hs && evt.hs.length > 0 && !player.countCards("h")) {
					player.addSkill("mengshouyuan_h");
					lib.skill.mengshouyuan.equip(player, num);
					lib.skill.mengshouyuan.judge(player, num);
				}
			},
			group: ["mengshouyuan_hp"],
			subSkill: {
				hp: {
					trigger: {
						player: "changeHp",
					},
					filter(event, player) {
						return event.num != 0;
					},
					forced: true,
					async content(event, trigger, player) {
						let list = ["重置澄心"];
						if (player.isDisabledJudge()) list.push("判定区");
						if (player.hasDisabledSlot()) list.push("装备区");
						if (player.hasSkill("mengshouyuan_h")) list.push("手牌区");
						const {
							result: {
								control
							}
						} = await player.chooseControl(list)
							.set("prompt", "重置技能或复原区域")
						if (!control) return;
						switch (control) {
							case "重置澄心":
								{
									player.storage.mengchengxin = {
										"h": false,
										"e": false,
										"j": false,
									}
									player.syncStorage("mengchengxin");
									break;
								}
							case "判定区":
								{
									player.enableJudge()
									break;
								}
							case "装备区":
								{
									var k = [];
									for (var i = 1; i < 6; i++) {
										for (var j = 0; j < player.countDisabledSlot(i); j++) {
											k.push(i);
										}
									}
									if (k.length > 0) player.enableEquip(k);
									break;
								}
							case "手牌区":
								{
									player.removeSkill("mengshouyuan_h");
									break;
								}
						}
					},
					sub: true,
					"_priority": 0,
				},
				h: {
					init: (player) => {
						player.discard(player.getCards("h"))
					},
					trigger: {
						player: "gainBefore",
						target: "gift",
					},
					mark: true,
					marktext: "✋",
					intro: {
						content: "手牌区已废除",
					},
					forced: true,
					direct: true,
					slient: true,
					charlotte: true,
					priority: null,
					firstDo: true,
					filter: function (event, player) {
						if (event.giver == player) return false;
						if (event.name == 'gift') return event.target != player;
						if (event.source && event.source == player) return false;
						return event.getParent(2)
							.name != 'mengshouyuan_h';
					},
					content: function () {
						'step 0'
						game.trySkillAudio('mengshouyuan', player);
						if (trigger.getParent(2)
							.name == 'useCard') {
							trigger.getParent(2)
								.targets.remove(player);
							trigger.getParent(2)
								.excluded.add(player);
						};
						if (trigger.name == 'gift') {
							trigger.deniedGift.add(trigger.card);
							trigger.deniedGifts = trigger.cards;
						}
						'step 1'
						var cards = trigger.cards;
						if (get.owner(cards[0])) get.owner(cards[0])
							.discard(cards);
						game.cardsDiscard(cards);
						'step 2'
						if (trigger.name == 'gain' && trigger.getg(player)
							.length) {
							player.loseToDiscardpile(trigger.cards);
						}
						'step 3'
						trigger.cancel();
						'step 4'
						if (trigger.bool) trigger.bool = false;
						if (trigger.cards) trigger.cards = [];
						if (trigger.links) trigger.links = [];
						if (trigger.buttons) trigger.buttons = {};
					},
					ai: {
						refuseGifts: true,
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		meng_tuoma: ['托马', ["male", "hyyz_ys", 4, ["mengjingzheng", "menghuchi"], []], '柚衣', ''],
		mengjingzheng: {
			audio: 2,
			trigger: {
				global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter", "equipAfter"],
			},
			frequent: true,//自动发动
			filter(event, player) {
				if (event.name !== "cardsDiscard") {
					if (event.position !== ui.discardPile) return false;
					if (!game.hasPlayer(current => event.getl(current).cards?.someInD("od"))) return false;
					if (event.getParent(2).name == 'recast') return false;
				} else {
					const evt = event.getParent();
					if (evt.relatedEvent && ['useCard', 'respond'].includes(evt.relatedEvent.name)) return false;
				}
				return event.cards.some(card => get.position(card, false) == 'd' && [1, 11, 12, 13].includes(get.number(card)));
			},
			async content(event, trigger, player) {
				let cards = trigger.cards.filter(card => get.position(card, false) == 'd' && [1, 11, 12, 13].includes(get.number(card))).slice();
				player.gain(cards, 'gain2');
				const next = player.moveCard('精政：将其他角色判定区里的牌移动至你的判定区', (card) => get.position(card) == 'j');
				next.sourceTargets = game.filterPlayer(current => current != player && current.countCards('j', (card) => {
					return player.canAddJudge(card);
				}));
				next.aimTargets = [player];
			},
			mod: {
				aiValue: (player, card, num) => {
					if ([1, 11, 12, 13].includes(get.number(card))) return num / 10;
				},
			},
		},
		menghuchi: {
			audio: 3,
			trigger: {
				global: "useCardToTargeted",
			},
			usable: 1,
			filter: function (event, player) {
				if (event.targets.length != 1) return false;//玩家可以和来源拼点，且目标为一
				return get.distance(player, event.target) <= 1 && get.tag(event.card, 'damage') > 0 && player.canCompare(event.player);
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				const bool = await player.chooseToCompare(trigger.player).forResultBool();// 玩家与来源进行拼点
				if (bool) {
					trigger.targets.length = 0;
					trigger.getParent().excluded.addArray(game.filterPlayer());
				} else {
					if (player.hasSkill('mengjingzheng')) {
						player.removeSkills('mengjingzheng');
						player.when({ global: 'phaseAfter' }).then(() => (player.addSkills('mengjingzheng')))
					}
				}
			},
		},
		meng_wu_jingyuan: ['景元', ["male", "hyyz_xt", 3, ["mengkanxing", "mengqianjiang"], ["die:meng_jingyuan", "zhu"]], '忆·轻梦'],
		mengkanxing: {
			mark: true, // 拥有标记
			audio: "menglaoshen", // 技能发动音效
			intro: {
				content: "expansion", // 技能描述
				markcount: "expansion", // 标记数量描述
			},
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "roundStart"],// 当玩家失去卡牌时触发
			},
			forced: true,
			locked: false,
			filter(event, player) {
				if (event._roundStart) {
					return game.roundNumber > 1 && player.getExpansions("mengkanxing").length > 0;// 筛选条件：当前轮次数大于1且武将牌上拥有“堪行”牌
				} else {
					if (event.name == 'lose' && event.getParent(3).skill == 'mengkanxing') return false;// 如果是“堪行”“遣将”技能触发的失去卡牌，则不触发本技能
					if (event.name == 'addToExpansion' && event.getParent(2).skill == 'mengkanxing') return false;
					if (event.name == 'gain' && event.player == player) return false;
					var evt = event.getl(player);
					return evt && evt.cards2 && evt.cards2.length > 0;
				}
			},
			async content(event, trigger, player) {
				if (trigger._roundStart) {
					let cards = player.getExpansions("mengkanxing"), count = cards.length; // 获取扩展区中的“堪行”牌
					player.loseToDiscardpile(cards); // 弃置所有“堪行”牌
					while (count > 0) {
						count--;
						const bool = await player.chooseUseTarget({ name: "sha", nature: 'thunder', isCard: true }).forResultBool(); // 玩家使用一张雷属性杀
						if (!bool) return;
					}
				} else {
					let count = trigger.getl(player).cards2.length; // 记录失去卡牌的数量
					while (count > 0) {
						count--;
						await player.draw();// 玩家摸一张牌
						if (player.countCards('h') > 0) {
							const cards = await player.chooseCard('h', '将一张牌置于武将牌上作为“神君”', true).forResultCards(); // 玩家选择一张手牌并置于武将牌上作为“神君”
							if (cards && cards.length) {
								await player.addToExpansion(cards, player, 'giveAuto').gaintag.add('mengkanxing'); // 将选择的牌添加到武将牌上
							}
						}
					}
				}
			},
		},
		mengqianjiang: {
			audio: "mengguiqu",
			trigger: {
				player: "damageAfter",
			},
			forced: true,
			async content(event, trigger, player) {
				if (player.getExpansions("mengkanxing").length > 0) {
					let { result: { links } } = await player.chooseCardButton(player.getExpansions("mengkanxing"), true);
					if (links && links.length) {
						player.loseToDiscardpile(links);
					}
					player.recover();
				} else {
					player.draw();
				}
			},
		},
		meng_luocha: ['罗刹', ["male", "hyyz_xt", 4, ["mengxingmou", "mengzhangtu"], []], '微雨', ''],
		mengxingmou: {
			audio: "mengnishang", // 技能音效
			trigger: {
				player: "useCardAfter", // 时机:玩家使用卡牌
			},
			filter(event, player, cards) {
				if (get.itemtype(event.cards) != 'cards' || !event.cards || !event.cards.length || event.cards.length != 1) return false;
				if (!event.card.isCard) return false;
				return player.countCards('hes') > 0;//检测虚拟牌&&玩家有
			},
			direct: true, // 强制发动技能
			async content(event, trigger, player) {
				let bool0 = _status.currentPhase == player;
				let { result: { cards, bool: bool1 } } = await player.chooseCard('hes', [1, 1], true, `行谋：将一张牌当${bool0 ? '【铁索连环】使用/重铸' : '【火攻】使用'}`)// 玩家选择一张牌
				if (bool1) {
					player.logSkill("mengxingmou");
					let { result: { bool: bool2 } } = await player.chooseUseTarget({ name: bool0 ? 'tiesuo' : 'huogong' }, cards)
						.set('forced', bool0 ? false : true)
						.set('prompt', `选择${bool0 ? '铁锁连环' : '火攻'}（${get.translation(cards)}）的目标${bool0 ? '点取消重铸' : ''}`);
					if (bool0 && !bool2) {
						player.recast(cards);
					}
				}
			},
		},
		mengzhangtu: {
			init: function (player) {
				// 初始化玩家的属性，设置"mengzhangtu"为阳
				player.storage.mengzhangtu = true;
			},
			audio: "mengshouwang", // 技能音效
			mark: true, // 是否有标记
			locked: false, // 是否锁定
			zhuanhuanji: true, // 是否可以转换技
			marktext: "☯", // 标记文本
			intro: {
				content: function (storage, player, skill) {
					// 根据转换技状态返回不同的描述
					return `当你使用${storage ? '' : '非'}伤害类锦囊牌时，你可以${storage ? '摸' + game.countPlayer(current => current.isLinked()) + '张牌。' : '令一名角色恢复一点体力并弃置每个区域一张牌。'}`
				},
			},
			popup: false,
			trigger: {
				player: "useCard", // 时机:玩家使用卡牌
			},
			filter(event, player) {
				if (get.type2(event.card) != 'trick') return false;
				// 根据"mengzhangtu"属性的取值和卡牌类型以及标签来判断是否符合条件
				if (player.storage.mengzhangtu == true) {//阳
					return get.tag(event.card, 'damage') && game.countPlayer(current => current.isLinked()) > 0;
				} else {//阴
					return !get.tag(event.card, 'damage');
				}
			},
			prompt: () => `张图：是否${_status.event.player.storage.mengzhangtu ? '摸' + game.countPlayer(current => current.isLinked()) + '张牌' : '令一名角色恢复一点体力并弃置每个区域一张牌'}`,
			async content(event, trigger, player) {
				player.changeZhuanhuanji('mengzhangtu');
				if (!player.storage.mengzhangtu) {
					player.draw(game.countPlayer(current => current.isLinked())) // 如果"mengzhangtu"为true，则摸牌 // 玩家摸取对应数量的牌
				} else {
					let { result: { bool, targets } } = await player.chooseTarget('张图：令一名角色恢复一点体力并弃置每个区域一张牌', true); // 否则玩家选择目标
					targets[0].recover();
					let num = 0;
					if (targets[0].countCards('h')) num++;
					if (targets[0].countCards('e')) num++;
					if (targets[0].countCards('j')) num++;
					if (num > 0) {
						let { result: { links } } = await player.choosePlayerCard('弃置每个区域各一张牌', targets[0], num, 'hej', true).set('filterButton', function (button) {
							for (var i = 0; i < ui.selected.buttons.length; i++) {
								if (get.position(button.link) == get.position(ui.selected.buttons[i].link)) return false;
							}
							return true;
						});
						if (links && links.length) {
							targets[0].discard(links);
						}
					}
				};
			},
		},
		meng_natasha: ['娜塔莎', ["female", "hyyz_xt", 3, ["mengyizhex", "mengjiuhu"], []], '梦海离殇'],
		mengjiuhu: {
			audio: 2,
			marktext: "护",
			intro: {
				name: "救护", // 技能名称
				"name2": "护",
				content: "娜塔莎的回合开始时回复体力或摸牌", // 技能描述
			},
			enable: "phaseUse", // 技能可在出牌阶段使用
			usable: 1, // 每回合可以使用一次
			filter(event, player) {
				return game.countPlayer(current => current.isDamaged());
			},
			filterCard: function (card) {
				return get.color(card) == 'red'; // 过滤红色牌
			},
			filterTarget: function (card, player, target) {
				return target.isDamaged(); // 过滤受伤角色
			},
			content: function () {
				target.recover(); // 目标角色回复一点体力
				target.addMark("mengjiuhu", 1); // 给目标角色添加“护”标记
			},
			group: ["mengjiuhu_sub"], // 子技能组
			subSkill: {
				sub: {
					audio: 'mengjiuhu',
					trigger: {
						player: ["phaseBegin"], // 当玩家的回合开始时触发
					},
					filter(event, player) {
						return game.hasPlayer(current => current.hasMark('mengjiuhu')); // 当场上有拥有“护”标记的角色时过滤条件成立
					},
					forced: true, // 强制发动技能
					firstDo: true,
					async content(event, trigger, player) {
						let targets = game.filterPlayer(current => current.hasMark("mengjiuhu"));// 选择拥有“护”标记的角色
						while (targets.length > 0) {
							let target = targets.shift();
							await target.chooseDrawRecover(true).set('num1', 1).set('num2', 1);
							target.removeMark("mengjiuhu", 1);
						}
					},
				},
			},
		},
		mengyizhex: {
			audio: 2,
			trigger: {
				global: "recoverBegin", // 当有角色开始回复体力时触发
			},
			filter: function (event, player) {
				return player.countCards('he') > 0; // 筛选条件：拥有手牌或装备区的牌
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseToDiscard(get.prompt2('mengyizhex'), 'he')
					.set('ai', () => get.attitude(player, trigger.player) > 0 && trigger.player.getDamagedHp() > 1)
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.num++; // 如果成功弃置牌，则使回复量额外增加1
				await trigger.player.hyyzJinghua(); // 移除玩家身上的所有buff
				await player.draw();
			},
		},
		"mengwugui_info": "无归|每回合每项限一次，你使用牌时，选择一项<br>①受到1点雷电伤害。<br>②弃置两张牌。<br>③横置。<br>之后令一名角色抉择：选择另一项或进行【闪电】判定。",
		"menggushen_info": "顾神|出牌阶段限一次，你可选择一项<br>①回复1点体力。<br>②摸两张牌。<br>③复原武将牌。<br>之后进行【闪电】判定或令一名其他角色执行相同项",
		"mengjuefeng_info": "绝峰|回合技，你受到或造成伤害后，摸两张牌。之后造成伤害的角色可交换“无归”“顾神”中的一项或令你将一张牌置于牌堆顶。",
		"mengyingzhu_info": "荧逐|锁定技，每轮开始时，你“先辅”一名其他角色并塑其为<span class='firetext'>“偶”</span>；当你受到伤害后，你与一名<span class='firetext'>“偶”</span>依次遗计X（X为你“先辅”其的次数且至多为3）。",
		"mengqiongpi_info": "茕辟|<span class='firetext'>使命技</span>，当你或<span class='firetext'>“偶”</span>获得另一名角色的牌后或对另一名角色造成伤害后，你将该角色的一张牌置为“逆”。失败：当你成为<span class='firetext'>“偶”</span>使用虚拟牌的目标时，其获得你的所有牌与所有“逆”。",
		"mengchengxin_info": "澄心|每轮每个区域限一次，你可以将一个区域的所有牌当做任意一张智囊牌或蓄谋牌使用。此牌结算完成后，若你区域内的牌数不小于此牌的实体牌数，你可以用此牌的实体牌蓄谋。",
		"mengshouyuan_info": "守愿|当你失去一个区域的最后一张牌后，你可以废除该区域，然后为剩余区域置入等同于本轮“澄心”发动次数的牌。当你的体力值变化后，你恢复一个区域或重置“澄心”。",
		"mengjingzheng_info": "精政|当一张字母牌不因使用、打出或重铸而进入弃牌堆后，你获得之。然后你可以将场上的一张判定牌移至你的判定区。",
		"menghuchi_info": "护持|每回合限一次，距离1以内的角色成为伤害牌的唯一目标后，你可以与使用者拼点。若你赢，此牌无效；否则本回合失去〖精政〗。",
		"mengkanxing_info": "勘行|①当你不因〖遣将〗或此法而失去一张牌后，你可以摸一张牌，然后将一张牌置于武将牌上，称为“神君”；②每轮结束，你须弃置所有“神君”，视为使用等同于“神君”数的雷【杀】",
		"mengqianjiang_info": "遣将|锁定技，当你受到伤害后，若你有“神君”，你须弃置一张“神君”，然后回复一点体力；否则你摸一张牌。",
		"mengxingmou_info": "行谋|锁定技，当你于回合内/外使用一张非转化非虚拟的牌后，你需将一张牌当做【铁索连环】（可重铸） / 【火攻】使用。",
		"mengzhangtu_info": "张图|转换技，当你使用①阳：伤害类锦囊牌时，你可以摸x张牌；②阴:非伤害类锦囊牌时，你可以令一名角色恢复一点体力并弃置每个区域一张牌（x为场上横置的角色数）",
		"mengjiuhu_info": "救护|出牌阶段限一次，你可以弃置一张红色牌，然后令一名已受伤的角色回复1点体力，并令其获得“护”；回合开始时，你令有“护”的角色回复1点体力或摸一张牌，并移除“护”。",
		"mengyizhex_info": "医者|一名角色回复体力时，你可以弃置一张牌， 然后令此回复值+1并移除其所有负面效果，然后你摸一张牌。"

	},
	2403: {
		meng_zhongyanzhilvzhe: ['终焉之律者', ["female", "hyyz_b3", 4, ["mengzhaoxi", "mengpingji", "mengcifan"], []], '拾壹'],
		mengzhaoxi: {
			audio: 3,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content: function (storage, player, skill) {
					return `锁定技，转换技。${player.storage.mengzhaoxi ? "阴：你不" : "阳：你"}于当前回合获得的手牌只能当做【火攻】使用。`;
				},
			},
			mod: {
				cardname: function (card, player, name) {
					if (get.position(card) == 'h') {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(card)).length > 0 == !player.storage.mengzhaoxi) return 'huogong'
					}
				},
			},
			trigger: {
				player: "useCard",
			},
			filter: (event, player) => {
				if (get.itemtype(event.cards) != 'cards' || event.cards.length != 1) return false;
				return get.name(event.cards[0]) != 'huogong' && get.name(event.card) == 'huogong';
			},
			forced: true,
			locked: true,
			content: () => {
				player.changeZhuanhuanji('mengzhaoxi');
			},
			ai: {
				threaten: 1.05,
			},
		},
		mengpingji: {
			audio: 2,
			mark: true,
			marktext: '平',
			intro: {
				markcount(storage, player) {
					return ('' + player.getHistory('useCard', evt => evt.isPhaseUsing(player)).length + '/' + get.centralCards().length);
				},
				mark(dialog, storage, player) {
					player.updateMark('mengpingji');
					dialog.addText(`<li>使用的牌数：${player.getHistory('useCard', evt => evt.isPhaseUsing(player)).length}`);
					dialog.addText(`<li>中央区的牌数：${get.centralCards().length}`);
				},
				content(storage, player) {
					player.updateMark('mengpingji');
					return `${player.getHistory('useCard', evt => evt.isPhaseUsing(player)).length}<li>中央区的牌数：${get.centralCards().length}`
				}
			},
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				player.updateMark('mengpingji');
				if (!player.isPhaseUsing()) return false;
				let num = get.centralCards().length
				for (let card of event.cards) {
					if (get.position(card, true) == 'o') num++;
				}
				return player.getHistory('useCard', evt => evt.isPhaseUsing(player)).length == (num / 2);
			},
			frequent: true,
			async content(event, trigger, player) {
				var num = get.centralCards().length;
				for (let card of trigger.cards) {
					if (get.position(card, true) == 'o') num++;
				}
				await player.draw(num / 2);
				player.updateMark('mengpingji');
			},
			group: 'mengpingji_log',
			subSkill: {
				log: {
					trigger: {
						global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					charlotte: true,
					silent: true,
					content: function () {
						player.updateMark('mengpingji');
					}
				}
			}
		},
		mengcifan: {
			audio: 2,
			trigger: {
				global: 'dyingAfter'
			},
			filter(event, player) {
				return event.player.isAlive()
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.drawTo(trigger.player.maxHp)
			},
		},
		meng_xinyanzhilvzhe: ['薪炎之律者', ["female", "hyyz_b3", 4, ["mengweizhu", "mengbinye"], []], '拾壹'],
		mengweizhu: {
			audio: 4,
			trigger: {
				global: 'useCardAfter',
			},
			forced: true,
			filter(event, player) {
				//if (['delay', 'eauip'].includes(get.type(event.card))) return false;
				if (!player.countCards('h', { color: 'red' })) return false;
				return event.player == player || event.targets && event.targets.includes(player);
			},
			async content(event, trigger, player) {
				player.showCards(player.getCards('h', { color: 'red' }), get.translation(player) + '因【危烛】展示');
				if (!player.countCards('h', { color: 'black' })) {
					trigger.player.damage(player, 'fire');
				};
				if (!player.countCards('h', (card) => get.type2(card) == get.type2(trigger.card))) return;
				const { result: { cards } } = await player.chooseCard('危烛：你可以重置一张类型相同的牌', [1, Infinity], (card) => player.canRecast(card) && get.type2(card) == get.type2(trigger.card)).set('ai', (card) => {
					return get.attitude(player, trigger.player) > 0 && get.value(card) > 8;
				});
				if (cards) {
					let bool = false;
					if (cards.length == player.countCards('h')) bool = true;
					player.recast(cards);
					if (bool) {
						trigger.targets.map(tar => {
							tar.damage(player, 'fire');
						})
					}
				}
			}
		},
		mengbinye: {
			audio: 3,
			trigger: {
				player: "loseEnd",
			},
			filter: function (event, player) {
				for (var i = 0; i < event.cards.length; i++) {
					if (event.cards[i].original == 'h') {
						const color = get.color(event.cards[i]);
						if (!player.countCards('h', { color: color }) && !player.getStorage('mengbinye').includes(color)) return true;
					}
				}
				return false;
			},
			forced: true,
			content: function () {
				for (var i = 0; i < trigger.cards.length; i++) {
					if (trigger.cards[i].original == 'h') {
						const color = get.color(trigger.cards[i]);
						if (!player.countCards('h', { color: color }) && !player.getStorage('mengbinye').includes(color)) {
							player.markAuto('mengbinye', [color]);
						}
					}
				}
			},
			group: 'mengbinye_draw',
			subSkill: {
				draw: {
					trigger: {
						player: "drawBegin",
					},
					priority: -5,
					filter(event, player) {
						if (game.fixedPile) return false;
						if (event.num <= 0) return false;
						if (ui.cardPile.childNodes.length == 0) return false;
						return player.getStorage('mengbinye').length;
					},
					forced: true,
					async content(event, trigger, player) {
						let num = Math.min(player.getStorage('mengbinye').length, trigger.num);
						while (num > 0) {
							num--;
							let card = get.cardPile2((i) => {
								return player.canUse(i, player, false) && get.color(i) == player.getStorage('mengbinye')[0];
							});
							if (card) {
								player.unmarkAuto('mengbinye', [get.color(card)]);
								ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
							}
						};
					},
					"_priority": -500,
				}
			}
		},
		meng_shiwaluo: ['史瓦罗', ["male", "hyyz_xt", 4, ["mengshouhu", "mengbushu"], []], '咩阿栗诶'],//
		mengshouhu: {
			audio: 'mengweijia',
			trigger: {
				global: 'damageBegin4'
			},
			filter(event, player) {
				return event.player != player && event.num > 1;
			},
			check: (event, player) => get.attitude(player, event.player) >= 4,
			preHidden: true,
			content() {
				trigger.player = player;
				trigger.mengshouhu = true;
			},
			group: ['mengshouhu_dam', 'mengshouhu_hujia'],
			subSkill: {
				dam: {
					trigger: {
						player: "damageEnd",
					},
					filter: function (event, player) {
						return (event.source != undefined && event.num > 0 && event.mengshouhu == true);
					},
					direct: true,
					logTarget: "source",
					async content(event, trigger, player) {
						let num = trigger.num;
						while (num > 0) {
							num--;
							game.log(player, '对', trigger.source, '发动了', '#g【刚烈】');
							const { result: { color } } = await player.judge(function (card) {
								if (get.color(card) == 'red') return 1;
								return 0;
							});
							if (color == 'black') {
								if (trigger.source.countCards('he')) {
									player.discardPlayerCard(trigger.source, 'he', true);
								}
							} else if (trigger.source.isIn()) {
								trigger.source.damage();
							}
						}
					},
				},
				hujia: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/mengruyue1.mp3',
						'ext:忽悠宇宙/asset/meng/audio/mengruyue2.mp3',
						'ext:忽悠宇宙/asset/meng/audio/mengruyue4.mp3',
					],
					trigger: {
						player: 'phaseZhunbeiBegin'
					},
					filter(event, player) {
						return player.isDamaged() && game.countPlayer(current => !current.hujia);
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseTarget('守护：令至多' + player.getDamagedHp() + '名没有护甲的角色获得1点护甲', [1, player.getDamagedHp()], (card, player, target) => {
								return !target.hujia
							})
							.set('ai', (target) => get.attitude(player, target))
							.forResult();
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						event.targets.forEach(async target => {
							await target.changeHujia(1);
						})
					}
				}
			},
			"_priority": 0,
		},
		mengbushu: {
			audio: 'mengshouhu_hujia',
			trigger: {
				player: 'phaseJieshuBegin'
			},
			filter(event, player) {
				let suits = [];
				player.getHistory('useCard', (evt) => {
					if (evt.card && get.suit(evt.card) && get.suit(evt.card) != 'none') {
						suits.add(get.suit(evt.card));
					}
				});
				return suits.length >= player.hp;
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget([1, 2], get.prompt2('mengbushu'))
					.set('ai', (target) => get.attitude(player, target))
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const targets = event.targets;
				for (var i of targets) {
					const { result: { control } } = await i.chooseControl('火杀', '万箭齐发', '调虎离山').set('prompt', '获得一张...');
					if (control) {
						switch (control) {
							case '火杀': i.gain(game.createCard({ name: 'sha', nature: 'dire' }), 'gain2'); break;
							case '万箭齐发': i.gain(game.createCard('wanjian'), 'gain2'); break;
							case '调虎离山': i.gain(game.createCard('diaohulishan'), 'gain2'); break;
						}
					}
				}
			},
			"_priority": 0,
		},
		meng_wangxiayitong: ['王下一桶', ["none", "hyyz_xt", 4, ["mengmoli"], []], '咩阿栗诶'],//
		mengmoli: {
			enable: "phaseUse",
			usable: 1,
			viewAs: {
				name: "juedou",
			},
			filterCard: () => false,
			selectCard: -1,
			prompt: "视为使用一张【决斗】",
			group: ["mengmoli_dam"],
			ai: {
				order: 1,
			},
			subSkill: {
				dam: {
					trigger: {
						global: 'damageEnd'
					},
					filter: (event, player) => {
						return event.getParent().skill == 'mengmoli'
					},
					locked: true,
					direct: true,
					async content(event, trigger, player) {
						if (trigger.player == player) {
							if (trigger.source && trigger.source.isIn() && player.canUse({ name: "juedou" }, trigger.source, false)) {
								await player.recast(player.getCards('he', (card => get.tag(card, 'damage'))));
								player.useCard({ name: "juedou" }, trigger.source, false);
							}
						};
						if (trigger.source == player) {
							await player.recover();
							if (trigger.player.countCards('hej')) {
								player.gainPlayerCard(trigger.player, 'hej', true)
							};
						}
					}
				}
			},
		},
		meng_heitiane: ['黑天鹅', ["female", "hyyz_xt", 3, ["mengshuijing", "mengliuguang", "mengzhenzhao"], []], '柚衣'],
		mengshuijing: {
			audio: 4,
			init: (player) => {
				if (player.storage.mengshuijing) delete player.storage.mengshuijing;
				player.storage.mengshuijing_num = 1;
				player.storage.mengshuijing_history = new Map()
			},
			mark: true,
			intro: {
				content(storage, player) {
					if (storage && player.storage.mengshuijing_history && player.getStorage('mengshuijing_history').has(storage)) {
						if (player == game.me || player.isUnderControl()) {
							let str = `占卜<span class='bluetext'>${get.translation(storage)}</sapn>`;
							const list = player.getStorage('mengshuijing_history').get(storage);
							str += `<li><span class='${list[0] >= player.storage.mengshuijing_num ? 'green' : 'fire'}text'>造成${list[0]}/${player.storage.mengshuijing_num}点伤害</sapn>`;
							str += `<li><span class='${list[1] >= player.storage.mengshuijing_num ? 'green' : 'fire'}text'>弃置${list[1]}/${player.storage.mengshuijing_num}张牌</sapn>`;
							return str;
						}
						return '天机不可泄露';
					}
					else return '无记录';
				},
			},
			enable: "phaseUse",
			usable: 1,
			async content(event, trigger, player) {
				const { result: { targets } } = await player.chooseTarget(true, '水镜：猜测一名角色的行为，猜中其损伤，否则你损伤', lib.translate.mengshuijing_info)
					.set('ai', function (target) {
						const player = _status.event.player;
						let att = get.attitude(player, target);
						if (target.hasJudge('lebu')) att /= 5;
						if (player.storage.mengshuijing_history && player.getStorage('mengshuijing_history').has(target)) {
							const list = player.getStorage('mengshuijing_history').get(target);
							if (list[0] > player.storage.mengshuijing_num) att *= 1.5;
							if (list[1] > player.storage.mengshuijing_num) att *= 1.5;
						};
						return -att;
					})
					.set('animate', false);
				if (targets) {
					player.storage.mengshuijing = targets[0];
				} else {
					delete player.getStat().skill.mengshuijing;
				}
			},
			ai: {
				order: 1,
				result: {
					player: 2,
				},
			},
			group: ["mengshuijing_history", "mengshuijing_end"],
			subSkill: {
				end: {
					audio: 1,
					trigger: {
						global: "phaseEnd",
					},
					forced: true,
					filter(event, player) {
						return player.getStorage('mengshuijing') == event.player;
					},
					content() {
						const list = player.getStorage('mengshuijing_history').get(trigger.player);
						const count = player.storage.mengshuijing_num;
						let str = `<span class='greentext'>【水镜】</span>`;

						if (list[0] >= count) {
							str += `<li>${get.translation(trigger.player)}造成过<span class='greentext'>${list[0]}</span>/${count}点伤害`;
							if (count > 0) trigger.player.damage(trigger.player, count);
						} else {
							str += `<li>${get.translation(trigger.player)}造成过<span class='firetext'>${list[0]}</span>/${count}点伤害`;
							if (count > 0) player.damage(player, count);
						}

						if (list[1] >= count) {
							str += `<li>${get.translation(trigger.player)}弃置过<span class='greentext'>${list[1]}</span>/${count}张牌`;
							if (count > 0) trigger.player.chooseToDiscard('水镜：黑天鹅预测成功，请弃牌', 'he', count, true);
						} else {
							str += `<li>${get.translation(trigger.player)}弃置过<span class='firetext'>${list[1]}</span>/${count}张牌`;
							if (count > 0) player.chooseToDiscard('水镜：你预测失败，请弃牌', 'he', count, true);
						}
						game.log(str);
						delete player.storage.mengshuijing;
					},
				}
			},
			"_priority": 0,
		}, mengshuijing_history: {
			trigger: {
				global: ["roundStart", "damageEnd", "loseAfter"],
			},
			forced: true,
			direct: true,
			charlotte: true,
			filter(event, player) {
				switch (event.name) {
					case 'phase': return true;
					case 'damage': return event.source && event.source.isAlive() && event.num > 0;
					default: {
						if (event.type != 'discard') return false;
						if (!event.getl(event.player).cards2.length) return false;
						return true;
					}
				}
			},
			content() {
				let value;
				switch (trigger.name) {
					case 'phase': {
						player.storage.mengshuijing_history = new Map();
						game.countPlayer(current => {
							player.storage.mengshuijing_history.set(current, [0, 0]);
						});
						break;
					}
					case 'damage': {
						if (player.getStorage('mengshuijing_history').has(trigger.source)) {
							let list = player.getStorage('mengshuijing_history').get(trigger.source);
							value = [list[0] += 1, list[1]];
						} else {
							value = [1, 0];
						}
						player.storage.mengshuijing_history.set(trigger.source, value);
						break;
					}
					default: {
						const count = trigger.getl(trigger.player).cards2.length;
						if (player.getStorage('mengshuijing_history').has(trigger.discarder || trigger.getParent(2).player)) {
							let list = player.storage.mengshuijing_history.get(trigger.discarder || trigger.getParent(2).player);
							value = [list[0], list[1] += count];
						} else {
							value = [0, count];
						}
						player.storage.mengshuijing_history.set(trigger.discarder || trigger.getParent(2).player, value);
						break;
					}
				}
			},
			"_priority": 0,
		},
		mengliuguang: {
			audio: 4,
			init: (player, skill) => player.storage[skill] = 1,
			trigger: {
				global: "loseAfter",
			},
			filter(event, player) {
				if (event.type != 'discard') return false;
				for (let i of event.cards2) {
					if (get.position(i, true) == 'd') return player.hasSkill('mengshuijing');
				};
				return false;
			},
			forced: true,
			locked: false,
			usable: 1,
			async content(event, trigger, player) {
				let list = ['下回合〖水镜〗的数字+1', '下回合〖水镜〗的数字-1'];
				const cards = trigger.cards2.filter(card => get.position(card, true) == 'd');
				let num = Math.min(player.storage.mengshuijing_num, cards.length);
				if (num > 0) list.push('获得这些牌中的' + num + '张');
				let { result: { index } } = await player.chooseControlList(list).set('prompt', '流光：选择一项').set('ai', () => list.length - 1);
				if (index != undefined) {
					switch (index) {
						case 0: {
							player.when({
								global: 'phaseBegin'
							}).then(() => {
								player.addTempSkill('mengliuguang_add')
							})
							break;
						}
						case 1: {
							player.when({
								global: 'phaseBegin'
							}).then(() => {
								player.addTempSkill('mengliuguang_remove')
							})
							break;
						}
						case 2: {
							const { result: { links } } = await player.chooseButton(num, ['流光：获得其中' + num + '张', cards], (button) => {
								return _status.event.player.getUseValue(button.link) || get.value(button.link);
							});
							if (links) player.gain(links, 'gain2');
							break;
						}
						default: return;
					}
				}
			},
			subSkill: {
				add: {
					init: (player) => player.storage.mengshuijing_num = 2,
					mark: true,
					intro: {
						markcount(storage, player) {
							return '2';
						},
						content: '水镜的数字+1'
					},
					onremove: (player) => player.storage.mengshuijing_num = 1,
				},
				remove: {
					init: (player) => player.storage.mengshuijing_num = 0,
					mark: true,
					intro: {
						markcount(storage, player) {
							return '0';
						},
						content: '水镜的数字-1'
					},
					onremove: (player) => player.storage.mengshuijing_num = 1,
				},
			},
			"_priority": 0,
		},
		mengzhenzhao: {
			audio: 2,
			trigger: {
				player: 'damageEnd'
			},
			filter: (event, player) => event.num && player.hasSkill('mengshuijing'),
			async content(event, trigger, player) {
				event.count = trigger.num;
				while (true) {
					event.count--;
					const { result: { targets: targets1 } } = await player.chooseTarget('令一名角色弃置' + player.storage.mengshuijing_num + '张牌')
						.set('ai', function (target) {
							const player = _status.event.player;
							let val = get.attitude(player, target);
							if (player.storage.mengshuijing == target) val *= 10;
							return -val;
						});
					if (targets1) {
						targets1[0].chooseToDiscard(player.storage.mengshuijing_num, true, 'he');
						const { result: { targets: targets2 } } = await player.chooseTarget(lib.filter.notMe)
							.set('prompt', `是否令${get.translation(targets1[0])}视为对一名角色造成${player.storage.mengshuijing_num}点伤害？`)
							.set('ai', (target) => player.storage.mengshuijing_num * get.damageEffect(target, targets1[0], player));
						if (targets2) {
							targets2[0].damage(targets1[0], player.storage.mengshuijing_num, 'unreal');
						}
						else return;
					}
					else return;
					if (event.count > 0 && player.hasSkill(event.name) && !get.is.blocked(event.name, player)) {
						const { result: { bool } } = await player.chooseBool(get.prompt2(event.name)).set('frequentSkill', event.name);
						if (bool) player.logSkill(event.name);
						else return;
					}
					else return;
				}
			},
			"_priority": 0,
		},
		meng_jingliu: ['镜流', ["female", "hyyz_xt", 4, ["mengzuanyue", "mengshishui"], []], '微雨'],
		mengzuanyue: {
			audio: 2,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (!player.countCards('hse') || player.countCards('he', { color: 'red' }) == player.countCards('he', { color: 'black' })) return false;
				let color = player.countCards('he', { color: 'red' }) > player.countCards('he', { color: 'black' }) ? 'red' : 'black';
				for (var i of lib.inpile) {
					if (player.getStorage('mengzuanyue').includes(i)) continue;
					var info = lib.card[i];
					if (!info || info.notarget || (info.selectTarget && info.selectTarget != 1)) continue;
					if (color == 'black' && get.tag({ name: i }, 'damage')) continue;
					if (color == 'red' && !get.tag({ name: i }, 'damage')) continue;
					var type = get.type2(i);
					if ((type == 'basic' || type == 'trick') && event.filterCard({ name: i }, player, event)) return true;
				}
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					let list = [];
					let color = player.countCards('he', { color: 'red' }) > player.countCards('he', { color: 'black' }) ? 'red' : 'black';
					for (let name of lib.inpile) {
						if (player.getStorage('mengzuanyue').includes(name)) continue;
						var info = lib.card[name];
						if (!info || info.notarget || (info.selectTarget && info.selectTarget != 1)) continue;
						if (color == 'black' && get.tag({ name: name }, 'damage')) continue;
						if (color == 'red' && !get.tag({ name: name }, 'damage')) continue;
						if (name == 'sha') {
							list.push(['基本', '', 'sha']);
							for (let nature of lib.inpile_nature) list.push(['基本', '', name, nature]);
						}
						else if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
						else if (get.type(name) == 'basic') list.push(['基本', '', name]);
					}
					return ui.create.dialog('攥月', [list, 'vcard']);
				},
				filter(button, player) {
					return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
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
					const color = player.countCards('he', { color: 'red' }) > player.countCards('he', { color: 'black' }) ? 'red' : 'black';
					const numx = Math.abs(player.countCards('he', { color: 'red' }) - player.countCards('he', { color: 'black' }));
					return {
						audio: 'mengzuanyue',
						filterCard: (card) => get.color(card) == color,
						selectCard: numx,
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						position: 'hse',
						viewAs: {
							name: links[0][2],
							nature: links[0][3]
						},
						onuse(result, player) {
							player.markAuto('mengzuanyue', [result.card.name]);
							player.when({
								global: 'roundStart'
							}).then(() => {
								player.storage.mengzuanyue = [];
								player.unmarkSkill('mengzuanyue');
							})
						},
					}
				},
				prompt(links, player) {
					return '将' + Math.abs(player.countCards('he', { color: 'red' }) - player.countCards('he', { color: 'black' })) + '张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
				},
			},
			hiddenCard(player, name) {
				if (!lib.inpile.includes(name)) return false;
				var type = get.type(name);
				return (type == 'basic' || type == 'trick') && player.countCards('she') > 0 && player.countCards('he', { color: 'red' }) != player.countCards('he', { color: 'black' });
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player) {
					if (!player.countCards('hse')) return false;
				},
				order: 5,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
			"_priority": 0,
		},
		mengshishui: {
			audio: 8,
			logAudio(event, player) {
				if (player.storage.mengshishui) {
					return [
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang1.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang2.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang3.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang4.mp3',
					]
				} else {
					return [
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang5.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang6.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang7.mp3',
						'ext:忽悠宇宙/asset/hyyz/audio/hyyzfeiguang8.mp3',
					]
				}
			},
			trigger: {
				global: "loseEnd",
			},
			mark: true,
			zhuanhuanji: true,
			marktext: "☯",
			intro: {
				content(storage, player, skill) {
					var str = `转换技，锁定技，当一张装备牌非依此法进入弃牌堆后，若你场上有与此牌颜色相同的牌，${player.storage.mengshishui ? '你失去1点体力并将这些牌当做一张无法被响应的冰【杀】使用' : '你弃置这些牌并获得等量的其他角色各一张牌'}`;
					return str;
				},
			},
			filter(event, player) {
				if (event.getParent(2).name == 'mengshishui') return false;
				if (event.getParent(2).name == 'chooseUseTarget' && event.getParent(3).name == 'mengshishui') return false;
				if (event.getParent().name == 'useCard' && event.getParent(3).name != 'mengshishui') return false;
				for (let i of event.cards) {
					if (get.type(i) == 'equip' && get.position(i) == 'd' &&
						player.countCards('ej', { color: get.color(i) }) > 0) {
						return true;
					}
				}
				return false;
			},
			forced: true,
			async content(event, trigger, player) {
				const color = get.color(trigger.cards.filter(card => get.type(card) == 'equip' && get.position(card) == 'd' && player.countCards('ej', { color: get.color(card) }) > 0)[0]);
				const cards = player.getCards('ej', { color: color });
				if (player.storage.mengshishui) {
					player.changeZhuanhuanji('mengshishui');
					player.loseHp();
					player.chooseUseTarget({ name: 'sha', nature: 'ice' }, cards, true, false);
				} else {
					player.changeZhuanhuanji('mengshishui');
					player.discard(cards);
					const { result: { targets } } = await player.chooseTarget('获得其他角色的牌', Math.min(game.countPlayer(current => current != player && current.countCards('he')), cards.length), true).set('ai', (target) => -get.attitude(player, target));
					if (targets) {
						player.gainMultiple(targets, 'he');
					}
				}
			},
			"_priority": 0,
		},
		meng_sangbo: ['桑博', ["male", "hyyz_xt", 4, ["mengdahun", "mengzishu"], []], '浮生', ''],
		mengdahun: {
			audio: 5,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengdahun1.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengdahun2.mp3",
			],
			trigger: {
				player: 'damageBegin4'
			},
			prompt: '打诨：防止此伤害，其再次对你使用牌将有损害',
			filter: function (event, player) {
				return event.source && event.num;
			},
			content: function () {
				player.addTempSkill('mengdahun_buff');
				player.addTempSkill('mengdahun_draw')
				player.storage.mengdahun = [trigger.source, trigger.num];
				trigger.cancel();
			},
			usable: 1,
			"_priority": 0,
		}, mengdahun_buff: {
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengdahun3.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengdahun4.mp3",
			],
			forced: true,
			charlotte: true,
			trigger: {
				target: 'useCardToTargeted',
			},
			filter: function (event, player) {
				if (!player.storage.mengdahun || !player.storage.mengdahun[0]) return false;
				return event.player == player.storage.mengdahun[0];
			},
			content: function () {
				player.removeSkill('mengdahun_draw');
				player.when({
					global: 'phaseBegin'
				}).vars({
					list: player.storage.mengdahun,
				}).then(() => {
					player.logSkill('mengdahun', list[0], 'fire');
					player.damage(list[1], 'nosource');
					if (list[0].isIn()) list[0].addhyyzBuff('hyyzBuff_fenghua', 1);
				})
			},
			onremove: function (player) {
				delete player.storage.mengdahun;
			}
		}, mengdahun_draw: {
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengdahun5.mp3",
			],
			trigger: {
				global: 'phaseEnd',
			},
			forced: true,
			charlotte: true,
			filter: function (event, player) {
				return player.storage.mengdahun && player.storage.mengdahun[0] && player.storage.mengdahun[0].isIn();
			},
			content: function () {
				player.logSkill('mengdahun', player.storage.mengdahun[0], 'green');
				player.storage.mengdahun[0].draw(player.storage.mengdahun[1])
			}
		},
		mengzishu: {
			audio: 'mengdahun',
			trigger: {
				global: 'gainAfter'
			},
			filter: function (event, player) {
				return game.countPlayer(current => current.hp < player.hp) > 0 && player.inRange(event.player);
			},
			usable: game.countPlayer(current => current.hp < _status.event.player.hp),
			content: function () {
				'step 0'
				player.draw();
				'step 1'
				if (player.countCards('he') > 0 && (player.countCards('h') > trigger.player.countCards('h') || player.countCards('e') > trigger.player.countCards('e') || player.hp > trigger.player.hp)) player.chooseCard(true, 'he', '将一张牌交给' + get.translation(trigger.player));
				'step 2'
				if (result.bool) {
					player.give(result.cards, trigger.player);
				}
			},
			"_priority": 0,
		},
		meng_leidianzhen: ['雷电真', ["female", "hyyz_ys", 4, ["mengjiaohui", "mengzhufu", "mengxvyu"], []], '梦海离殇'],//
		mengjiaohui: {
			enable: 'phaseUse',
			filter(event, player) {
				return player.countCards('he');
			},
			usable: 1,
			filterCard: true,
			position: 'he',
			filterTarget: true,
			content() {
				targets[0].draw();
				targets[0].addTempSkill('mengjiaohui2', { player: 'phaseEnd' });
			},
			ai: {
				order: 1,
				result: {
					target: 1,
				}
			},
			"_priority": 0,
		}, mengjiaohui2: {
			mod: {
				cardUsable: function (card, player, num) {
					if (card.name == 'sha') return num + 1;
				}
			}
		},
		mengzhufu: {
			usable: 1,
			trigger: {
				global: 'damageEnd'
			},
			filter(event, player) {
				return player.countCards('he', { color: 'red' }) && event.player.isDamaged();
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseToDiscard('he', get.prompt2('mengzhufu', trigger.player), (card) => get.color(card) == 'red')
					.set('ai', (card) => (get.attitude(player, trigger.player) > 0 ? 10 : 0) - get.value(card))
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.recover();
			},
			"_priority": 0,
		},
		mengxvyu: {
			unique: true,
			zhuSkill: true,
			trigger: {
				global: 'gainAfter'
			},
			usable: 1,
			filter(event, player) {
				if (!player.hasZhuSkill('mengxvyu')) return false;
				if (event.player.group != 'hyyz_ys') return false;
				if (_status.currentPhase == event.player) return false;
				return true;
			},
			check(event, player) {
				return get.attitude(player, trigger.player) > 0;
			},
			content() {
				trigger.player.draw();
			},
			"_priority": 0,
		},
		meng_sp_xier: ['希儿', ["female", "hyyz_xt", "4/4/0", ["meng_shoupan", "meng_xingan"], ["die:meng_xier",]], '屺'],
		"meng_shoupan": {
			audio: "mengluandie",
			trigger: {
				global: "phaseJieshuBegin",
			},
			filter(event, player, card) {
				return player.hasMark("meng_shoupan_count") < 3;
			},
			group: ["buqu", "meng_shoupan_roundcount"],
			async content(event, trigger, player) {
				player.addTempSkill("meng_shoupan_count", 'roundStart')
				player.addMark("meng_shoupan_count", 1, false)
				let { result: { bool } } = await player.chooseToDiscard('he', { color: "red" });
				if (!bool) player.loseHp();
				let card = {
					name: 'sha',
					isCard: true,
					storage: {
						meng_shoupan: true,
					},
				}
				const { result: { targets } } = await player.chooseTarget(true)
				targets[0].addSkill("meng_shoupan_sub")
				player.useCard(card, targets[0]);
			},
			subSkill: {
				count: {
					onremove: true,
					charlotte: true,
					sub: true,
					"_priority": 0,
				},
				sub: {
					audio: "mengluandie",
					filter(event, player) {
						return event.card.storage && event.card.storage.meng_shoupan;
					},
					trigger: {
						global: "useCardAfter",
					},
					content() {
						"step 0"
						player.judge(function (card) {
							if (player.hp == player.maxHp) {
								if (get.color(card) == 'red') return -1;
							}
							if (get.color(card) == 'red') return 1;
							return 0;
						});
						"step 1"
						let num = 0;
						player.getHistory('sourceDamage', evt => {
							if (evt.card == trigger.card) num += evt.num;
						})
						if (result.color) {
							if (result.color == 'red') {
								if (player.hp < player.maxHp) player.recover();
							}
							else {
								player.draw(num);
							}
						}
					},
					sub: true,
					"_priority": 0,
				},
			},
		},
		"meng_xingan": {
			audio: "mengzaixian",
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player, card) {
				return get.tag(event.card, 'damage') && !event.target.getStorage("meng_xingan_sub").includes(event.card.name);
			},
			async content(event, trigger, player) {
				trigger.target.addSkill("meng_xingan_sub");
				trigger.target.markAuto("meng_xingan_sub", [trigger.card.name]);
				let list = [1, 2, 3]
				trigger.cancel();
				const { result: { control } } = await player.chooseControl(list)
				let { result: { bool } } = await trigger.target.chooseToDiscard('he', [control, control], function (card, player) {
					if (!ui.selected.cards.length) return true;
					var type = get.type(card, trigger.target);
					for (var i of ui.selected.cards) {
						if (get.type(i, trigger.target) == type) return false;
					}
					return true;
				})
				if (!bool) {
					trigger.target.turnOver();
					trigger.target.draw(control)
				}
			},
			subSkill: {
				sub: {
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		"mengzhaoxi_info": "朝夕|锁定技，转换技。你于①当前回合②非当前回合获得的手牌只能当做【火攻】使用。",
		"mengpingji_info": "平寂|你于出牌阶段使用第x张牌后，可以摸x张牌（x为中央区牌数的一半）。",
		"mengcifan_info": "赐繁|限定技·8，一名角色脱离濒死时，你可令其将手牌补至体力上限。周始：重置技能。",
		"mengweizhu_info": "危烛|锁定技，你参与牌结算后，展示所有红色手牌并重铸其中任意张与此牌类型相同的牌，然后若你展示/重铸了所有手牌，对使用者/目标造成一点火焰伤害。",
		"mengbinye_info": "秉烨|锁定技，你失去最后的黑色/红色手牌后，下一次获得的此颜色的牌将尽可能为能对自己使用的牌。",
		"mengshouhu_info": "守护|①每回合限一次。当其他角色受到大于1点的伤害时，你可以将此伤害转移给你，并发动〖刚烈〗。②准备阶段，令X名没有护甲的角色获得一点护甲（X为你已损失的体力值）。",
		"mengbushu_info": "部署|结束阶段，若你本回合使用过牌的花色数不小于当前体力值，你可以令至多两名角色选择并从游戏外获得一张火【杀】、【万箭齐发】或【调虎离山】。",
		"mengmoli_info": "磨砺|出牌阶段限一次，你可以视为使用【决斗】。若你因此受到伤害，你重铸所有伤害类牌并视为对同一目标使用【决斗】；若你因此造成伤害，你恢复一点体力并获得受伤角色区域内一张牌。",
		"mengshuijing_info": "水镜|出牌阶段限一次，你可以暗选一名角色。该角色的回合结束时，若其本轮执行过：①造成<span class='thundertext'>1</span>点伤害。②弃置<span class='thundertext'>1</span>张牌。其对自己执行满足项的效果，你对自己执行其未满足项的效果，然后重置此技。",
		"mengliuguang_info": "流光|每回合首次有牌被弃置后，你可以获得其中X张牌，或令下回合〖水镜〗中的数字<span class='greentext'>+1</span>/<span class='firetext'>-1</span>（X为〖水镜〗中的数字）。",
		"mengzhenzhao_info": "朕兆|当你受到一点伤害后，你可以令一名角色弃置X张牌，然后可以视为该角色对一名除你外的角色造成X点伤害。",
		"mengzuanyue_info": "攥月|每轮每种牌名限一次。若你的牌中红/黑色牌居多，你可以将差值数量的红/黑色牌当一张伤害/非伤害类单体即时牌使用或打出。",
		"mengshishui_info": "逝水|转换技，锁定技，当一张装备牌非依此法进入弃牌堆后，若你场上有与此牌颜色相同的牌，阳：你弃置这些牌并获得等量的其他角色各一张牌。阴：你失去1点体力并将这些牌当做一张无法被响应的冰【杀】使用。",
		"mengdahun_info": "打诨|每回合限一次，当你受到有来源的伤害时，你可以防止此伤害。直到本回合结束，若伤害来源再次对你使用牌，则下回合开始时，你受到等量的伤害且其获得一层[风化]，否则其摸等量的牌。",
		"mengzishu_info": "自熟|每名角色的回合限X次（X为体力值小于你的角色数），你攻击范围内的角色不因此技获得牌后，你可以摸一张牌。若你的手牌数、装备区的牌数、体力值中有一项大于其，则你交给其一张牌。",
		"mengjiaohui_info": "教诲|出牌阶段限一次，你可以弃置一张牌并令一名角色摸一张牌。若如此做，直到该角色的回合结束，其使用【杀】的次数上限+1。",
		"mengzhufu_info": "祝福|每回合限一次，一名角色受到伤害后，你可以弃置一张红色牌，令其回复1点体力。",
		"mengxvyu_info": "须臾|主公技，每回合限一次，原神势力角色于回合外获得牌后，你可以令其摸一张牌。",
		"meng_shoupan_info": "守盼|①你拥有界“不屈※”；②每轮限两次，一名角色的回合结束时，你可以失去1点体力或弃置一张红色牌并视为使用一张【杀】，此【杀】结算后其进行一次X为此【杀】造成伤害值的“恢拓”判定。",
		"meng_xingan_info": "行暗|每名角色每种牌名限一次，你使用伤害类牌指定目标时，你可以取消之并声明1~3的一个数字，然后该角色须弃置等量张不同类型的手牌，否则翻面并摸等量的牌。"



	},
	2404: {
		hyyz_huahuo: ['花火', ["female", "hyyz_xt", 3, ["hyyzjiaoshi", "hyyzkehun", "hyyzjiamian"], []], '#b不知你是否从中得到了少许欢愉？<br>——如果没有，今晚别睡太死哦', '「假面愚者」的成员之一，难以捉摸，不择手段。<br>危险的戏剧大师，沉迷于扮演，身怀千张假面，能化万种面相。<br>财富、地位、权利…于花火而言都不重要，能让她出手的，唯有「乐趣」。'],
		hyyzjiaoshi: {
			audio: 4,
			enable: ["chooseToUse", "chooseToRespond"],
			usable: 1,
			intro: {
				name: "矫饰",
				mark: function (dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						let froms = [];
						player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
						if (froms.length) {
							dialog.addText('你使用过的牌');
							dialog.addSmall([froms, 'vcard']);
						}
						else dialog.addText('没有使用过牌');
					} else {
						dialog.addText('嗯哼，你在偷看什么？');
					}
				},
				content(storage, player) {
					let froms = [];
					player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
					let str = '你使用过的牌';
					str += froms.map(card => get.translation(card.name));
					return str;
				},
			},
			filter(event, player) {
				let froms = [];
				player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
				if (!player.countCards('hes', (card) => froms.includes(card.name))) return false;
				let canViews = [];
				game.hasPlayer(current => {
					if (current != player) {
						current.getAllHistory('useCard', (evt) => canViews.add(evt.card.name));
					}
				})
				for (var i of lib.inpile) {
					if (!canViews.includes(i)) continue;
					var type = get.type(i);
					if ((type == 'basic' || type == 'trick') && event.filterCard({ name: i }, player, event)) return true;
					if (i == 'sha') {
						for (var j of lib.inpile_nature) {
							if (event.filterCard({ name: i, nature: j }, player, event)) return true;
						}
					}
				}
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					const dialog = ui.create.dialog('矫饰', 'hidden');
					let canViews = [];
					game.hasPlayer(current => {
						if (current != player) {
							current.getAllHistory('useCard', (evt) => canViews.add(evt.card.name));
						}
					})
					let list = [];
					for (const name of lib.inpile) {
						if (!canViews.includes(name)) continue;
						if (!event.filterCard({ name: name }, player, event)) continue;
						if (name == 'sha') {
							list.push(['基本', '', 'sha']);
							for (var j of lib.inpile_nature) {
								if (event.filterCard({ name: name, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
							}
						}
						else if (get.type2(name) == 'trick') list.push(['锦囊', '', name]);
						else if (get.type(name) == 'basic') list.push(['基本', '', name]);
					}
					dialog.add([list, 'vcard']);
					return dialog;
				},
				filter(button, player) {
					var evt = _status.event.getParent();
					if (!evt.filterCard({ name: button.link[2], nature: button.link[3] }, player, evt)) return false;
					return true;
				},
				check(button) {
					return _status.event.player.getUseValue({
						name: button.link[2],
						isCard: true
					});
				},
				prompt(links, player) {
					return `矫饰：将一张曾使用过的牌，当【${get.translation(links[0][2])}】使用`;
				},
				select: 1,
				backup(links, player) {
					return {
						audio: 'hyyzjiaoshi',
						filterCard(card) {
							let froms = [];
							player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
							return froms.includes(get.name(card));
						},
						selectCard: 1,
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						position: 'hes',
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
						},
						onuse(result, player) {
							//player.logSkill('hyyzjiaoshi')
						}
					}
				},
			},
			hiddenCard(player, name) {
				let froms = [];
				player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
				if (!player.countCards('hes', (card) => froms.includes(card.name))) return false;
				let canViews = [];
				game.hasPlayer(current => {
					if (current != player) {
						current.getAllHistory('useCard', (evt) => canViews.add(evt.card.name));
					}
				});
				if (player.getHistory('useSkill', (evt) => evt.sourceSkill == 'hyyzjiaoshi')) return false;
				return canViews.includes(name);
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter: function (player) {
					let froms = [];
					player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
					if (!player.countCards('hes', (card) => froms.includes(card.name))) return false;
					let canViews = [];
					game.hasPlayer(current => {
						if (current != player) {
							current.getAllHistory('useCard', (evt) => canViews.add(evt.card.name));
						}
					})
					return canViews.length > 0;
				},
				order: 1,
				result: {
					player: function (player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			}
		},
		hyyzjiaoshi_info: "矫饰|每回合限一次，你可以将一张使用过的牌 当其他角色使用过的即时牌使用或打出。",
		hyyzkehun: {
			audio: 6,
			forced: true,
			group: 'hyyzkehun_audio',
			subSkill: {
				audio: {
					trigger: {
						player: ['useCardAfter', 'respondEnd']
					},
					forced: true,
					mark: true,
					intro: {
						name: "科诨",
						mark(dialog, content, player) {
							if (player == game.me || player.isUnderControl()) {
								let froms = [];
								player.getAllHistory('useCard', (evt) => {
									if (get.itemtype(evt.cards) == 'cards') {
										for (let card of evt.cards) {
											if (card.name != evt.card.name) froms.add(get.name(evt.card));
										}
									}
								});
								if (froms.length) {
									dialog.addText('使用过的转化牌');
									dialog.addSmall([froms, 'vcard']);
									dialog.addText('p.s.以这些牌为底牌进行转化')
								}
								else dialog.addText('没有使用过转化牌');
							} else {
								dialog.addText('你追求女孩子的方式就是偷看吗？');
							}
						},
						content(storage, player) {
							let froms = [];
							player.getAllHistory('useCard', (evt) => froms.add(evt.card.name));
							let str = '你使用过的牌';
							str += froms.map(card => get.translation(card.name));
							return str;
						},
					},
					filter(event, player) {
						if (get.itemtype(event.cards) != 'cards') return false;
						if (!event.card.isCard) return true;
						if (!event.cards.some(card => card.name != event.card.name)) return false;
						return true;
					},
					frequent: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzkehun', 1, 2, 3, 4)
						await player.draw()

						let froms = [];
						player.getAllHistory('useCard', (evt) => {
							if (get.itemtype(evt.cards) == 'cards') {
								for (let card of evt.cards) {
									if (card.name != evt.card.name) froms.add(get.name(evt.card));
								}
							}
						});
						if (trigger.cards.some(card => froms.includes(card.name)) && game.hasPlayer(current => current.getSeatNum() > player.getSeatNum())) {
							const { result: { targets } } = await player.chooseTarget('令一名角色获得额外回合', function (card, player, target) {
								return target != player && target.getSeatNum() > player.getSeatNum();
							}).set('ai', (target) => {
								let player = _status.event.player;
								let val = get.attitude(player, target);
								return val;
							});
							if (targets) {
								player.say(['我方唱罢，你登场~', '接好你的面具咯~'].randomGet())
								game.hyyzSkillAudio('hyyz', 'hyyzkehun', 5, 6)

								targets[0].markSkillCharacter('hyyzkehun', player, '科诨', '进行一个只有出牌阶段的额外回合');
								targets[0].insertPhase().set('phaseList', [/* 'phaseDraw',  */'phaseUse']);
								targets[0].when({
									player: ["phaseAfter", "phaseCancelled"],
								}).then(() => {
									player.unmarkSkill('hyyzkehun');
								})
							}
						}
					},
				}
			},
		},
		hyyzkehun_info: "科诨|你使用或打出转化牌后摸一张牌。若你使用其他牌转化过此牌的一张底牌，令一名座次靠后的角色获得一个仅有出牌阶段的回合。",
		hyyzjiamian: {
			view(name, player) {
				let map = {};
				player.getAllHistory('useCard', (evt) => {
					if (get.itemtype(evt.cards) == 'cards') {
						for (let i of evt.cards) {
							if (i.name != evt.card.name) {
								map[i.name] = evt.card.name;
							}
						}
					}
				})
				if (map[name]) return map[name];
				return;
			},
			mod: {
				cardname(card, player, name) {
					if (get.position(card) == 'h' && _status.currentPhase != player) {
						return lib.skill.hyyzjiamian.view(card.name, player);
					}
				}
			},
		}, hyyzjiamian_info: "假面|锁定技，回合外，你手牌中成为过转化牌底牌的牌，视为其最后一次成为底牌时转化的牌。",


		meng_sp_leidianyayi: ['雷电芽衣', ["female", "hyyz_b3", 3, ["mengwanzui", "mengchangci", "mengguxing"], ['die:meng_leidianyayi']], '微雨', ''],
		mengwanzui: {
			audio: 'menglizui',
			trigger: {
				global: 'useCardToTarget'
			},
			filter(event, player) {
				if (event.targets.length != 1 || event.targets.includes(player)) return false;
				if (!player.countCards('he', (card) => get.type2(card) == get.type2(event.card))) return false;
				return !player.getRoundHistory('useCard', (evt) => evt.targets.includes(player) && event.card.name == evt.card.name).length
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseToDiscard('弃置一张同类型牌，将此牌目标改为你', 'he', (card) => get.type2(card) == get.type2(trigger.card))
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				trigger.getParent().targets = [player];
				trigger.targets = [player];
			},
			group: 'mengwanzui2'
		},
		mengchangci: {
			audio: 'mengwange',
			trigger: {
				player: "discard",
			},
			usable: 1,
			async content(event, trigger, player) {
				let currents = [];
				game.countPlayer2(current => {
					return current.hasHistory('useCard', evt => {
						currents.addArray(evt.targets);
					});
				});
				if (currents.length) {
					await player.useCard({ name: 'juedou', isCard: true }, currents);
				};
				game.asyncDraw(currents);
				await player.addTempSkill('mengchangci1', 'roundStart');
				currents.map(current => {
					current.addTempSkill('mengchangci2', 'roundStart');
				})
			}
		}, mengchangci1: {
			mod: {
				globalFrom(from, to, distance) {
					if (to.hasSkill('mengchangci2')) return distance + 1;
				},
			},
		}, mengchangci2: {
			mod: {
				globalFrom(from, to, distance) {
					if (to.hasSkill('mengchangci1')) return distance + 1;
				},
			},
		},
		mengguxing: {
			audio: 'mengchengshi',
			init(player) {
				lib.character['meng_jiu'] = ['', '', Infinity, [], []];
				lib.translate['meng_jiu'] = 'Ⅸ';
			},
			trigger: {
				target: "useCardToTarget",
			},
			forced: true,
			content() {
				var player;
				if (game.players.some(current => current.name == 'meng_jiu')) {
					player = game.players.find(current => current.name == 'meng_jiu');
					game.players.remove(player);
					game.dead.push(player);
				} else if (game.dead.some(current => current.name == 'meng_jiu')) {
					player = game.dead.find(current => current.name == 'meng_jiu');
				} else {
					player = ui.create.player();
					player.init('meng_jiu');
					player.classList.remove('likedead');
					player.classList.add('dead');
					game.dead.push(player);
				}
				trigger.getParent().player = player;
			}
		},
		meng_lingke: ['铃可', ['female', 'hyyz_xt', '1/3/2', ["mengjuejing", "mengxueyuan", "mengqiusheng"], []], '心之所向_星之所向'],
		mengjuejing: {
			audio: 2,
			trigger: {
				player: 'loseHpBefore'
			},
			forced: true,
			async content(event, trigger, player) {
				await player.addTempSkill('mengjuejing2', {
					global: 'phaseAfter',
					player: ['damageEnd', 'mengjuejingAfter']
				});
				trigger.cancel();
				await player.damage(trigger.num, player);
			},
			group: 'mengjuejing_dying',
			subSkill: {
				dying: {
					trigger: {
						player: 'dyingAfter'
					},
					firstDo: true,
					filter(event, player) {
						return player.isAlive() && event.source && event.source.isIn();
					},
					forced: true,
					async content(event, trigger, player) {
						const list = [
							`体力值：${player.hp}`,
							`护甲值：${player.hujia}`,
							`体力上限：${player.maxHp}`
						]
						for (var i = 0; i < list.length; i++) {
							list[i] = [i, list[i]];
						}
						let next = trigger.source.chooseButton([
							'绝景：交换两个数值',
							[list.slice(0, 1), 'tdnodes'],
							[list.slice(1, 2), 'tdnodes'],
							[list.slice(2, 3), 'tdnodes'],
						]);
						next.set('forced', true);
						next.set('selectButton', 2);
						next.set('filterButton', () => true);
						next.set('ai', (button) => {
							let target = _status.event.target;
							let player = _status.event.player;
							if (get.attitude(player, target) > 0) return true;
							if (ui.selected.buttons.length) {
								if (target.hujia < target.hp) return button.link == 1;
								return button.link == 0;
							} else {
								return button.link == 2;
							}
						});
						next.set('target', player);
						const { result: { links } } = await next;
						if (links) {
							const map = {
								0: 'player.hp',
								1: 'player.hujia',
								2: 'player.maxHp',
							};
							const num1 = eval(map[links[0]]), num2 = eval(map[links[1]]);
							eval(`${map[links[0]]}=${num2}`);
							eval(`${map[links[1]]}=${num1}`);
							if (eval(map[0]) == eval(map[1])) {
								eval(`${map[2]}+=1`);
							} else if (eval(map[1]) == eval(map[2])) {
								eval(`${map[0]}+=1`);
							} else if (eval(map[0]) == eval(map[2])) {
								eval(`${map[1]}+=1`);
							};
							player.update();
							if (player.maxHp <= 0) {
								player.die(event);
							}
							if (player.hp <= 0 && !event.nodying) {
								game.delayx();
								event._dyinged = true;
								player.dying(event);
							}
							player.drawTo(lib.skill.mengjuejing.max(player));
						}
					},
				}
			},
			max(player) {
				const a = player.hp, b = player.hujia, c = player.maxHp;
				let max;
				if (a > b && a > c) {
					max = a;
				} else if (b > a && b > c) {
					max = b;
				} else {
					max = c;
				}
				return max;
			}
		}, mengjuejing2: { ai: { nohujia: true } },
		mengxueyuan: {
			audio: 2,
			trigger: {
				player: 'damageEnd',
				source: 'damageEnd'
			},
			check(event, player) {
				return player.hujia > 0 || player.maxHp > 1;
			},
			filter(event, player) {
				return (event.getParent().name != 'mengjuejing');
			},
			async content(event, trigger, player) {
				player.loseHp();
			},
			group: 'mengxueyuan_dying',
			subSkill: {
				dying: {
					audio: 'mengxueyuan',
					trigger: {
						player: 'dyingAfter'
					},
					forced: true,
					locked: false,
					filter(event, player) {
						return player.isAlive() && event.getParent(6).name == 'mengxueyuan';
					},
					content() {
						player.changeHujia(2);
					}
				}
			}
		},
		mengqiusheng: {
			audio: 2,
			trigger: {
				player: 'dying'
			},
			async cost(event, trigger, player) {
				let list = ['体力上限'];
				if (player.hujia > 0) list.push('护甲');
				const control = await player.chooseControl(list, 'cancel2')
					.set('prompt', '求生：减少1点体力上限或护甲，回复体力至1点')
					.set('ai', () => {
						if (player.hujia > 0) return '护甲';
						return '体力上限'
					}).forResultControl();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: control
						}
					}
				}
			},
			async content(event, trigger, player) {
				const control = event.cost_data.control;
				if (control == '体力上限') {
					await player.loseMaxHp();
					await player.recover(1 - player.hp);
				} else {
					await player.changeHujia(-1);
					await player.recover(1 - player.hp);
				}
			}
		},
		meng_luotianyi: ['洛天依', ['female', 'hyyz_other', 3, ['mengzhongya', 'mengduyun'], []], '咩阿栗诶', ''],
		mengzhongya: {
			trigger: {
				player: 'useCardBefore'
			},
			usable: 1,
			forced: true,
			filter(event, player) {
				return player.isPhaseUsing() && event.card && !get.tag(event.card, 'damage');
			},
			content() {
				trigger.card.name = 'wugu';
				player.storage.mengzhongya_turn = trigger.card;
			},
			group: ['mengzhongya2', 'mengzhongya_turn'],
			subSkill: {
				turn: {
					init(player) {
						player.storage.mengzhongya_turn;
					},
					trigger: {
						player: 'useCardAfter'
					},
					charlotte: true,
					filter(event, player) {
						if (!player.storage.mengzhongya2 || !player.storage.mengzhongya2.length) return false;
						return event.card && event.card.name == 'wugu' && player.storage.mengzhongya_turn == event.card;
					},
					direct: true,
					async content(event, trigger, player) {
						const { result: { targets } } = await player.chooseTarget('众雅：令任意名本轮使用过伤害单体牌的角色翻面', [1, player.storage.mengzhongya2.length], (card, player, target) => {
							return player.storage.mengzhongya2.includes(target);
						}).set('ai', (target) => -get.attitude(player, target));
						if (targets) {
							targets.forEach(i => {
								i.turnOver();
							});
						}
					}
				}
			}
		},
		mengzhongya2: {
			init: (player) => {
				player.storage.mengzhongya2 = [];
			},
			trigger: {
				global: 'useCardAfter'
			},
			charlotte: true,
			direct: true,
			forced: true,
			filter(event, player) {
				return event.card && event.targets.length == 1 && get.tag(event.card, 'damage') && event.player != player;
			},
			content() {
				player.storage.mengzhongya2.add(trigger.player);
				player.when({
					global: 'roundStart'
				}).then(() => {
					player.storage.mengzhongya2 = [];
				})
			}
		},
		mengduyun: {
			trigger: {
				player: 'dying'
			},
			round: 1,
			content() {
				player.recover();
			},
			group: 'mengduyun_dying',
			subSkill: {
				dying: {
					trigger: {
						player: 'recoverAfter',
					},
					filter(event, player) {
						return event.getParent().name == 'mengduyun' && !_status.dying.includes(player);
					},
					charlotte: true,
					direct: true,
					forced: true,
					content: function* (event, map) {
						const player = map.player, cards = player.getCards('h');
						if (player.countCards('h')) {
							let result;
							if (cards.length == 1) {
								result = { bool: true, moved: [cards] };
							} else {
								result = yield player.chooseToMove("渡陨：将牌按顺序置于牌堆顶", true)
									.set("list", [["牌堆顶", cards]])
									.set("reverse", _status.currentPhase && _status.currentPhase.next ? get.attitude(player, _status.currentPhase.next) > 0 : false)
									.set("processAI", function (list) {
										var cards = list[0][1].slice(0);
										cards.sort(function (a, b) {
											return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
										});
										return [cards];
									});
							}
							if (result.bool) {
								let cards2 = result.moved[0];
								cards2.reverse();
								game.cardsGotoPile(cards2, "insert");
								game.log(player, "将", cards2, "置于了牌堆顶");
							}
						}
						let cards3 = [];
						while (cards3.length < 2) {
							let card = get.discardPile((card) => {
								if (cards3.includes(card)) return false;
								if (cards3.length > 0) {
									return get.type2(card, false) != get.type2(cards3[0], false) && get.suit(card, false) != get.suit(cards3[0], false);
								}
								return true;
							});
							if (card) cards3.push(card);
						}
						player.gain(cards3, 'gain2');
					}
				}
			}
		},
		meng_shajin: ['砂金', ['male', 'hyyz_xt', 4, ["mengyanglu", "mengtuipan"], []], '柚衣'],
		mengyanglu: {
			audio: 3,
			trigger: {
				target: ["rewriteGainResult"],
			},
			filter(event, player) {
				return event.player != player;
			},
			async cost(event, trigger, player) {
				const links = await player
					.choosePlayerCard(player, '即将失去' + get.translation(trigger.result.cards) + '改为交给其——', 'he')
					.set('filterButton', trigger.filterButton).set('selectButton', 1)
					.set('ai', function (button) {
						return 20 - get.value(button.link);
					}).forResultLinks();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							links: links
						}
					}
				}
			},
			async content(event, trigger, player) {
				const lose = event.cost_data.links;
				trigger.result.cards = lose.slice(0);
				trigger.result.links = lose.slice(0);
				trigger.cards = lose.slice(0);
				trigger.untrigger();
				await game.delayx();

				let cards = get.cards(2);
				const gain = await player.chooseButton(true, ['获得一张牌', cards]).forResultLinks();
				if (gain) {
					cards.remove(gain[0]);
					await player.gain(gain, 'draw');
					ui.cardPile.insertBefore(cards[0], ui.cardPile.firstChild);
					game.updateRoundNumber();
				}
			},
		},
		mengtuipan: {
			audio: 5,
			init(player) {
				player.storage.mengtuipan = [];
			},
			enable: "phaseUse",
			filterTarget(card, player, target) {
				return !player.storage.mengtuipan.includes(target) && target != player && target.countCards('he') > 0;
			},
			async content(event, trigger, player) {
				player.storage.mengtuipan.add(event.targets[0]);
				player.when({
					global: 'phaseAfter'
				}).then(() => {
					player.storage.mengtuipan = [];
				})

				await player.discardPlayerCard(event.targets[0], true);
				if (player.countCards('he')) await event.targets[0].useCard({ name: 'shunshou', isCard: true }, player);
				await player.useCard({ name: 'chuqibuyi' }, get.cards(), event.targets[0]);
			},
			ai: {
				order: 10,
				result: {
					target: -2,
				}
			}
		},
		meng_huangquan: ['黄泉', ["female", "hyyz_xt", 4, ["mengkuque", "mengnailuo"], []], '流萤一生推', '自称「巡海游侠」的旅人，本名不详。身佩一柄长刀，独行银河。<br>淡漠寡言，剑出如紫电般迅猛，却从来只以刀鞘战斗，收而不发。'],
		mengkuque: {
			audio: 5,
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			filter(event, player) {
				return player.hasEnabledSlot();
			},
			direct: true,
			async content(event, trigger, player) {
				let list = [];
				for (var i = 1; i <= 5; i++) {
					if (player.hasEnabledSlot('equip' + i)) list.push('equip' + i);
				}
				list.sort();
				const { result: { control } } = await player.chooseControl(list, 'cancel2').set('prompt', '废除一个装备栏');
				if (control != 'cancel2') {
					player.logSkill(event.name);
					await player.disableEquip(control);
					player.draw(player.countDisabled());
					if (!player.hasEnabledSlot()) {
						player.addTempSkill('mengkuque2');
					}
				}
			},
		}, mengkuque2: {
			mod: {
				globalFrom(from, to, distance) {
					return 1;
				},
			},
		},
		mengnailuo: {
			audio: 2,
			trigger: {
				player: 'phaseJieshuBegin'
			},
			filter(event, player) {
				return !player.hasEnabledSlot();
			},
			forced: true,
			content() {
				player.die();
			},
			group: ['mengnailuo_1', 'mengnailuo_2', 'mengnailuo_3'],
			subSkill: {
				1: {
					trigger: {
						player: 'phaseDrawBegin2'
					},
					filter(event, player) {
						return !event.numFixed && player.countDisabled() >= 1;
					},
					forced: true,
					content() {
						trigger.num += player.countDisabled();
					}
				},
				2: {
					forced: true,
					mod: {
						cardUsable(card, player, num) {
							if (card.name == 'sha' && player.countDisabled() >= 3) return num + player.countDisabled();
						},
					},
				},
				3: {
					init: (player) => player.storage.mengnailuo_4 = 0,
					trigger: {
						player: 'useCard'
					},
					filter(event, player) {
						return event.card.name == 'sha' && player.countDisabled() >= 5 && player.storage.mengnailuo_4 <= player.countDisabled();
					},
					forced: true,
					content() {
						player.storage.mengnailuo_4 = 1;
						for (let target of trigger.targets) {
							var id = target.playerid;
							var map = trigger.customArgs;
							if (!map[id]) map[id] = {};
							if (typeof map[id].extraDamage != 'number') {
								map[id].extraDamage = 0;
							}
							map[id].extraDamage++;
						}
						player.when({
							global: 'phaseEnd'
						}).then(() => {
							player.storage.mengnailuo_4 = 0;
						})
					}
				},
			}
		},
		"mengwanzui_info": "挽罪|当一名其他角色成为一张牌的唯一目标时，若你本轮未成为过同名牌的目标，你可以弃置一张同类型牌，然后将此牌目标改为你。",
		"mengchangci_info": "长辞|当你于一个回合首次弃置牌时，你可以视为对本回合成为过牌的目标的所有角色使用一张【决斗】，然后你依次与这些角色各摸一张牌且本轮你与其计算与对方的距离+1。",
		"mengguxing_info": "孤行|锁定技，当你成为一张牌的目标时，你令此牌改为无来源。",
		"mengjuejing_info": "绝景|锁定技，当你失去体力时，改为对自己造成等量的无视护甲的伤害。当你脱离濒死状态时，伤害来源选择你的{体力值，护甲值，体力上限}中的两项交换其值。若此时存在两项相同目不为零，你使剩余一项数值+1，并将手牌摸至与最大项相同。",
		"mengxueyuan_info": "雪原|当你不因“绝景”造成或受到伤害后，你可以失去1点体力。若你因此进入了濒死状态，则你脱离濒死状态后获得2点护甲。",
		"mengqiusheng_info": "求生|当你进入濒死状态后，你可以减少1点体力上限或护甲，回复体力至1点。",
		"mengzhongya_info": "众雅|锁定技，你于出牌阶段使用的首张非伤害牌视为【五谷丰登】，结算结束后，你可以令任意本轮使用过单体伤害牌的其他角色翻面。",
		"mengduyun_info": "渡陨|你每轮首次进入濒死状态后，可以恢复1点体力。若因此脱离濒死状态，你将手牌置于牌堆顶，然后获得弃牌堆中两张花色与类别不同的牌。",
		"mengyanglu_info": "徉露|锁定技。当其他角色摸取你的牌时，改为你交给其一张牌，然后你观看牌堆顶两张牌并获得其中一张牌",
		"mengtuipan_info": "推磐|出牌阶段每名角色限一次。你可以弃置其他角色一张牌并视为其对你使用一张无视距离的【顺手牵羊】，然后你亮出牌堆顶的一张牌当作【出其不意】对其使用。",
		"mengkuque_info": "枯榷|准备阶段，你可以废除一个装备栏并摸x张牌（x为你已废除的装备栏数量）。若你废除了你最后一个装备栏，则本回合你计算与其他角色距离均为一",
		"mengnailuo_info": "奈落|锁定技，若你已废除装备栏数量为1/3/5时，你获得以下前等量个效果：摸牌阶段多摸x张牌/使用【杀】次数+x/每回合使用的前x张【杀】伤害+1（x为你已废除的装备栏数量）。结束阶段，若你装备栏均处于废除状态，则你死亡。"

	},
	2405: {
		hyyz_huangquan: ['黄泉', ["female", "hyyz_xt", 1, ["hyyzlunshi", "hyyzxvwu", "hyyzanshang"], []], '#b愿为逝者哀哭，<br>泣下如雨，充盈渡川……<br>如潮涌至，领你归乡。', '自称「巡海游侠」的旅人，本名不详。身佩一柄长刀，独行银河。<br>淡漠寡言，剑出如紫电般迅猛，却从来只以刀鞘战斗，收而不发。'],
		hyyzlunshi: {
			audio: 2,
			trigger: {
				global: "gainAfter",
				player: "loseAsyncAfter",
			},
			filter(event, player) {
				if (event.name == "loseAsync") {
					if (event.type != "gain" || event.giver) return false;
					var cards = event.getl(player).cards2;

					return game.hasPlayer((current) => {
						if (current == player) return false;
						var cardsx = event.getg(current);
						for (var i of cardsx) {
							if (i.name == 'ying') return true;
							if (cards.includes(i)) return true;
						}
						return false;
					});
				}
				if (player == event.player) return false;
				if (event.giver) return false;
				var evt = event.getl(player);
				return evt && evt.cards2 && evt.cards2.length > 0;
			},
			forced: true,
			async content(event, trigger, player) {
				let targets = [], dam = [];
				if (trigger.name == 'loseAsync') {
					var cards = trigger.getl(player).cards2;
					game.countPlayer(current => {
						if (current == player) return false;
						var cardsx = trigger.getg(current);
						for (var i of cardsx) {
							if (i.name == 'ying') dam.add(current);
							if (cards.includes(i)) targets.add(current);
						}
					})
				} else {
					targets.add(trigger.player);
					if (trigger.getl(player).cards2.some(card => card.name == 'ying')) {
						dam.add(trigger.player);
					}
				};
				dam.map(current => {
					player.line(current, 'thunder');
					current.damage(player, 'thunder');
				});
				targets.removeArray(dam);
				for (let current of targets) {
					if (!player.countCards('he')) break;
					current.line(player);
					game.log(current, "观看了", player, "的手牌");
					current.viewHandcards(player, '沦逝');
					if (player.countCards('h', { name: 'ying' }) > current.countCards('h', { name: 'ying' })) {
						player.line(current, 'thunder');
						await current.damage(player, 'thunder')
					};
				}
			}
		},
		hyyzlunshi_info: "沦逝|锁定技，其他角色获得你的牌后，观看你的手牌。若此牌为【影】或你的【影】多于其，你对其造成1点雷电伤害。",
		hyyzxvwu: {
			audio: 5,
			init(player) {
				lib.element.player.addGouyu = function () {
					var next = game.createEvent("addGouyu");
					next.player = this;
					next.setContent("addGouyu");
					return next;
				};
				lib.element.content.addGouyu = function () {
					if (lib.config.background_audio) {
						game.playAudio("effect", "recover");
					}
					game.broadcast(function () {
						if (lib.config.background_audio) {
							game.playAudio("effect", "recover");
						}
					});
					game.broadcastAll(function (player) {
						if (lib.config.animation && !lib.config.low_performance) {
							player.$recover();
						}
					}, player);
					player.$damagepop(num, "wood");
					game.log(player, "获得了" + get.cnNumber(1) + "枚勾玉");
					player.maxHp += 1;
					player.changeHp(1, false);
				};
				player.storage.hyyzxvwu = [1, 2, 3, 4, 5];
				player.addSkill('hyyzxvwu_phase');
			},
			trigger: {
				global: 'dying'
			},
			filter(event, player) {
				return lib.skill.hyyzxvwu.phaseList.length;
			},
			forced: true,
			async content(event, trigger, player) {
				await trigger.player.addSkill('xtbenghuai');
				if (trigger.player == player) {
					if (lib.skill.hyyzxvwu.phaseList.length) {
						let { result: { bool, moved } } = await player.chooseToMove(`沦逝：删除一个阶段并重排剩余阶段`, true)
							.set('list', [
								[`重新排序`, [lib.skill.hyyzxvwu.phaseList, 'vcard']],
								[`删除`]
							])
							.set("filterMove", function (from, to, moved) {
								if (to == 0 && moved[1].length < 2) return false;
								if (to == 1 && moved[1].length > 0) return false;
								return true;
							})
							.set('filterOk', (moved) => moved[1].length == 1)
							.set('processAI', function (list) {
								const list2 = list[0][1][0], phases = ["phaseDraw", "phaseUse", "phaseZhunbei", "phaseJieshu", "phaseJudge", "phaseDiscard"];
								let phase_val = [];
								for (let i of phases) {
									if (list2.includes(i)) {
										phase_val.push(i);
									}
								}
								let remove = [['', '', phase_val[phase_val.length - 1]]]
								return [phase_val.slice(0, phase_val.length - 1).map(i => ['', '', i]), remove];
							})
						if (bool) {
							lib.skill.hyyzxvwu.phaseList = moved[0].map(card => card = card[2]);
							game.log(player, '删除了', '#r' + get.translation(moved[1][0][2]))
							game.log(player, '重排阶段为：', '#y' + get.translation(lib.skill.hyyzxvwu.phaseList));
						};
					}
					if (!player.storage.hyyzxvwu.length) {
						player.clearSkills(true);
						game.log(player, "#r丢失了技能信息");
					} else {
						let num = player.storage.hyyzxvwu.randomGet();
						player.storage.hyyzxvwu.remove(num);
						switch (num) {
							case 1: {
								lib.translate['hyyz_huangquan'] = '■■';
								player.node.name.innerHTML = '■■';
								game.log(player, "#r的姓名信息消散了");
								break;
							}
							case 2: {
								player.sex = '■';
								game.log(player, "#r的性别信息消散");
								break;
							}
							case 3: {
								player.group = '■■';
								player.node.name.dataset.nature = '■■';
								game.log(player, "#r的势力信息消散了");
								break;
							}
							case 4: {
								player.node['avatar'].setBackgroundImage('extension/忽悠宇宙/asset/hyyz/image/hyyz_huangquan_0.jpg');
								game.log(player, "#r的原画信息消散了");
								break;
							}
							case 5: {
								lib.characterTitle.hyyz_huangquan = '#r■■■■■■，<br>■■■■，■■■■……<br>■■■■，■■■■。'
								game.log(player, "#r的铭志消散了");
								break;
							}
							default: break;
						}
					}
				}
				if (trigger.player == player) await player.addGouyu();
			},
			phaseList: ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"],
			ai: {
				threaten: 3,
			}
		}, xtbenghuai: {
			trigger: {
				player: "phaseJieshuBegin",
			},
			forced: true,
			check: function () {
				return false;
			},
			filter: function (event, player) {
				return !player.isMinHp();
			},
			content: function () {
				"step 0";
				player.chooseControl("baonue_hp", "baonue_maxHp", function (event, player) {
					if (player.hp == player.maxHp) return "baonue_hp";
					if (player.hp < player.maxHp - 1 || player.hp <= 2) return "baonue_maxHp";
					return "baonue_hp";
				}).set("prompt", "崩坏：失去1点体力或减1点体力上限");
				"step 1";
				if (result.control == "baonue_hp") {
					player.loseHp();
				} else {
					player.loseMaxHp(true);
				}
			},
			ai: {
				threaten: 0.5,
				neg: true,
			},
			"_priority": 0,
		}, hyyzxvwu_phase: {
			audio: "hyyzxvwu",
			trigger: {
				player: 'phaseBefore'
			},
			charlotte: true,
			superCharlotte: true,
			forced: true,
			async content(event, trigger, player) {
				trigger.phaseList = lib.skill.hyyzxvwu.phaseList;
			},
		},
		hyyzxvwu_info: "虚无|锁定技，一名角色进入濒死状态时，其获得【崩坏】。若该角色为你，你删除一个阶段并重排剩余阶段，然后失去武将牌上的一种信息并获得一枚勾玉。",
		hyyzanshang: {
			audio: 2,
			trigger: {
				player: 'useCardToPlayered',
				target: 'useCardToTargeted',
			},
			forced: true,
			filter(event, player) {
				return get.name(event.card) == 'sha' && get.color(event.card) == 'black';
			},
			async content(event, trigger, player) {
				player.gain(lib.card.ying.getYing(1), 'gain2').animate = false;
				for (let i of trigger.targets) {
					if (i.countCards('h') < trigger.player.countCards('h')) {
						i.gainPlayerCard(trigger.player, 'h', '黯殇：获得对方的一张手牌', true);
					} else if (i.countCards('h') > trigger.player.countCards('h')) {
						trigger.player.gainPlayerCard(i, 'h', '黯殇：获得对方的一张手牌', true);
					}
				};
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (card.name != "sha") return;
						if (player.countCards('h') - target.countCards('h') < 1) return [1, 0.6];
					},
					player(card, player, target) {
						if (card.name != "sha") return;
						if (player.countCards('h') - target.countCards('h') != 1) return [1, 1.3];
					},
				}
			},
		},
		hyyzanshang_info: "黯殇|锁定技，当你指定或成为黑色【杀】的目标后，获得一张【影】，然后手牌较少的一方获得对方的一张手牌。",

		hyyz_shajin: ['砂金', ['male', 'hyyz_xt', 4, ['hyyzniming', 'hyyzpoai', 'hyyzqingzhi'], ['zhu',]], '#b我任命运拨转轮盘，<br>孤注一掷，<br>遍历死地而后生。<br>一切献给——琥珀王！', '星际和平公司「战略投资部」的高级干部，「石心十人」之一，基石为「诡弈砂金」。<br>个性张扬的风险爱好者，时常面带笑容，真心却难以揣测。<br>靠着同命运的博弈赢得如今的地位，将人生视作一场高风险、高回报的投资，而他向来游刃有余。'],
		hyyzniming: {
			audio: 2,
			init(player) {
				lib.character['hyyz_paidui'] = ['', '', Infinity, [], []];
				lib.translate['hyyz_paidui'] = '牌堆';
			},
			trigger: {
				player: ["judgeBegin"],
			},
			prompt(trigger, player) {
				var str = ''
				if (trigger.card) str = get.translation(trigger.card.viewAs || trigger.card.name);
				else if (trigger.skill) str = get.translation(trigger.skill);
				else str = get.translation(trigger.parent.name);
				return '逆命：即将进行' + get.translation(trigger.player) + '的' + str + '判定，是否与牌堆拼点？';
			},
			filter(event, player) {
				return ui.cardPile.childNodes.length > 1 && (player.hasSkill('hyyzpoai') && game.hasPlayer(current => current.countCards('ej'))) || player.countCards('h');
			},
			async content(event, trigger, player) {
				const { result } = await player.pileCompare();
				if (result.bool) {
					var cards = [result.player, result.target].filterInD("d");
					if (cards.length) {
						var str = ''
						if (trigger.card) str = get.translation(trigger.card.viewAs || trigger.card.name);
						else if (trigger.skill) str = get.translation(trigger.skill);
						else str = get.translation(trigger.parent.name);
						const { result: { links } } = await player
							.chooseButton([`###逆命：将一张牌置于牌堆顶###当前进行的是${str}判定`, cards], true)
							.set("ai", function (button) {
								var trigger = _status.event.getTrigger();
								var player = _status.event.player;
								if (trigger.name != 'judge') {
									var num = Math.abs(get.number(button.link) - player.hp);
									return get.value(button.link) + num;
								} else {
									var result = trigger.judge(button.link);
									var att = get.attitude(player, trigger.player);
									if (att == 0 || result == 0) return 0;
									return att * result;
								}
							});
						if (links) {
							var card = links[0];
							card.fix();
							ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
							game.updateRoundNumber();
							game.log(player, "将", card, "置于牌堆顶");
							//player.gain(cards.filter(i => i != card), 'gain2');
						} else {
							game.log(player, "没有将拼点牌置于牌堆顶");
						}
					}
				}
			},
			ai: {
				threaten: 2,
				expose: 0.8,
				tag: {
					rejudge: 1,
				},
			},
		},
		hyyzniming_info: "逆命|当你进行判定前，你可以与牌堆拼点。若你赢，须将一张拼点牌置于牌堆顶。",
		hyyzpoai: {
			audio: 6,
			init() {
				//新增任何情况都可以拼点的标签//谨慎使用
				lib.element.player.canCompare = function (target, goon, bool) {
					if (this == target) return false;
					if ((!this.countCards("h") && goon !== true && !this.hasSkillTag("canCompareSource")) || (!target.countCards("h") && bool !== true && !target.hasSkillTag("canCompareTarget")))
						return false;
					if (this.hasSkillTag("noCompareSource") || target.hasSkillTag("noCompareTarget")) return false;
					return true;
				};
			},
			forced: true,
			group: ['hyyzpoai_draw', 'hyyzpoai_audio'],
			subSkill: {
				audio: {
					trigger: {
						player: ["chooseToCompareBefore", "compareMultipleBefore", "pileCompareBefore"],
						target: ["chooseToCompareBefore", "compareMultipleBefore"],
					},
					filter(event, player) {
						if (event.preserve) return false;
						if (!game.hasPlayer(current => current.countCards('ej'))) return false;
						return event.player == player || event.target && event.target == player;
					},
					async cost(event, trigger, player) {
						const result = await player
							.chooseTarget((card, player, target) => target.countCards("ej"))
							.set('forced', player.countCards('h') ? false : true)
							.set('prompt', `破霭：${player.countCards('h') ? `是否用场上的一张牌拼点？` : '用场上的一张牌拼点'}`)
							.set("ai", (target) => {
								var player = _status.event.player;
								var att = get.attitude(player, target);
								if (att > 0 && (target.countCards("j") > 0 || target.countCards("e", (card) => get.value(card, target) < 0))) return 2;
								if (att < 0 && target.countCards("e", (card) => get.number(card) >= 11) > 0 && !target.hasSkillTag("noe")) return -1;
								return 0;
							}).forResult();
						event.result = result;
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						const target = event.targets[0];
						const links = await player.choosePlayerCard('破霭：选择一张牌用于拼点', target, 'ej', true).forResultLinks();
						if (links) {
							target.lose(links, ui.ordering, 'visible');
							if (!trigger.fixedResult) trigger.fixedResult = {};
							trigger.fixedResult[player.playerid] = game.cardsGotoOrdering(links).cards[0];
							trigger.hyyzpoai = target;
						}
					},
				},
				draw: {
					charlotte: true,
					direct: true,
					trigger: {
						player: ["chooseToCompareAfter", "compareMultipleAfter", "pileCompareAfter"],
						target: ["chooseToCompareAfter", "compareMultipleAfter"],
					},
					filter(event, player) {
						if (event.preserve) return false;
						return true;
					},
					async content(event, trigger, player) {
						let target;
						if (trigger.hyyzpoai) {
							target = trigger.hyyzpoai;
						} else {
							if (trigger.name == 'pileCompareAfter') {
								target = player;
							} else {
								if (trigger.player == player) target = player;
								if (trigger.target == player) target = trigger.target;
							}
						}
						if (trigger.result.winner && trigger.result.winner == player) {
							game.hyyzSkillAudio('hyyz', 'hyyzpoai', 5)
							let list = [];
							for (let i = 0; i < 6; i++) {
								if (player.hasEmptySlot('equip' + i)) list.add('equip' + i);
							}
							let card = get.cardPile((card) => get.subtype(card) == list.randomGet() && !get.cardtag(card, 'gifts') && player.canEquip(card, false));
							if (card) {
								player.$gain2(card);
								player.equip(card);
							}
						} else if (target.isIn()) {
							game.hyyzSkillAudio('hyyz', 'hyyzpoai', 6)
							player.give(player.getCards('he'), target, 'giveAuto');
						};
					},
				}
			},
			ai: {
				canCompareSource: true,
				canCompareTarget: true,
				skillTagFilter: function (player, tag, target) {
					if (tag == 'canCompareSource' || tag == 'canCompareTarget') {
						if (!game.hasPlayer(current => {
							return current.countCards('ej') > 0
						}) && !player.countCards('h')) return false;
					}
				},

			},
		},
		hyyzpoai_info: "破霭|锁定技，你可以使用场上的牌拼点。当你拼点赢后，随机使用一张装备牌；若你拼点没赢，将你的所有牌交给提供拼点牌的角色。",
		hyyzqingzhi: {
			audio: 2,
			enable: ['chooseToUse'],
			filter(event, player) {
				if (_status.currentPhase != player) return false;
				if (event.hyyzqingzhi || player.hasSkill('hyyzqingzhi2')) return false;
				return lib.inpile.some(name => get.type(name) == "trick" && event.filterCard({ name: name }, player, event));
			},
			hiddenCard(player, name) {
				return lib.inpile.some(name => get.type(name) == 'trick');
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (var i of lib.inpile) {
						if (get.type(i) == "trick" && event.filterCard({ name: i, isCard: true }, player, event)) list.push(["锦囊", "", i]);
					}
					return ui.create.dialog("倾掷", [list, "vcard"]);
				},
				check(button) {
					return _status.event.player.getUseValue({ name: button.link[2], isCard: true });
				},
				backup(links, player) {
					return {
						audio: 'hyyzqingzhi',
						viewAs: {
							name: links[0][2],
							isCard: true,
						},
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						precontent() {
							'step 0'
							player.logSkill("hyyzqingzhi");
							player.addTempSkill("hyyzqingzhi2");
							player.judge('倾掷', function (card) {
								if (get.suit(card) == 'spade' && get.number(card) >= 2 && get.number(card) <= 9) return -6;
								return 2;
							}).set('judge2', result => !result.bool);
							'step 1'
							if (!result.bool) {
								player.damage(3, 'thunder', 'nocard', 'nosource');

								var evt = event.getParent();
								evt.set("hyyzqingzhi", true);
								evt.goto(0);
								return;
							} else {
								var cards = event.result.cards;
								event.result.card = {
									name: event.result.card.name,
									nature: event.result.card.nature,
									isCard: true,
								};
								event.result.cards = cards;
								delete event.result.skill;
							}
						},
					};
				},
				prompt(links, player) {
					return "请选择" + get.translation(links[0][2]) + "的目标";
				},
			},
			ai: {
				order: 8,
				result: {
					player: 1,
				},
			},
		}, hyyzqingzhi2: { charlotte: true },
		hyyzqingzhi_info: "倾掷|出牌阶段限一次，你可以执行【闪电】判定。若判定失败，视为使用任意一张锦囊牌。",

	},
	2406: {


		hyyz_liuying: ['流萤', ["female", "hyyz_xt", "4/5", ["hyyzranshang", "hyyzyingzhu"], []], '#b飞萤扑火，向死而生<br>愿我们，在清醒的现实再会', '星核猎手成员，身着机械装甲「萨姆」的少女。<br>以兵器的身份诞生，因基因改造罹患「失熵」的痛苦。<br>为寻求生命的意义加入星核猎手，不断追逐违抗命运的方式。'],
		hyyzranshang: {
			audio: 8,
			forced: true,
			group: ['hyyzranshang_audio', 'hyyzranshang_1', 'hyyzranshang_2'],
			subSkill: {
				audio: {
					trigger: {
						player: ["changeHpAfter", "loseAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					filter(event, player) {
						if (player.countCards('e') == player.getDamagedHp()) return false;
						if (event.name == 'changeHp' || event.name == 'equip' && event.player == player) {
							return true;
						} else {
							const evt = event.getl(player);
							if (evt && evt.player === player && evt.es) return evt.es.length;
							return false;
						}
					},
					async content(event, trigger, player) {
						if (trigger.name == 'changeHp') {//改变体力值
							let num = player.getDamagedHp() - player.countCards('e');
							if (num > 0) {
								while (num > 0) {
									num--;
									let list = [];
									for (let i = 1; i < 6; i++) if (player.hasEmptySlot('equip' + i)) list.push('equip' + i);
									const control = list.randomGet();
									if (control) {
										const card = get.cardPile((card) => get.subtype(card) == control && !get.cardtag(card, 'gifts'));
										if (card) {
											game.hyyzSkillAudio('hyyz', 'hyyzranshang', 1, 2)
											await player.equip(card, 'draw');
										}
									};
								}
							} else {
								game.hyyzSkillAudio('hyyz', 'hyyzranshang', 3, 4)
								player.randomDiscard('e', Math.min(player.countDiscardableCards(player, "e"), -num));
							}
						} else {//改变装备
							let num = 0;
							for (let i = 1; i < 6; i++) {
								num += player.countEmptySlot('equip' + i);
							};
							if (num > player.hp) {
								game.hyyzSkillAudio('hyyz', 'hyyzranshang', 5, 6)
								player.recover(num - player.hp);
							}
							else {
								game.hyyzSkillAudio('hyyz', 'hyyzranshang', 7, 8)
								player.loseHp(player.hp - num);
							}
						}
					},
				},
				1: {
					trigger: {
						global: "phaseBefore",
						player: "enterGame",
					},
					forced: true,
					filter: function (event, player) {
						if (player.countCards('e') == player.getDamagedHp()) return false;
						return event.name != "phase" || game.phaseNumber == 0;
					},
					async content(event, trigger, player) {
						let num = player.getDamagedHp() - player.countCards('e');
						if (num > 0) {
							while (num > 0) {
								num--;
								let list = [];
								for (let i = 1; i < 6; i++) if (player.hasEmptySlot('equip' + i)) list.push('equip' + i);
								const control = list.randomGet();
								if (control) {
									const card = get.cardPile((card) => get.subtype(card) == control && !get.cardtag(card, 'gifts'));
									if (card) {
										game.hyyzSkillAudio('hyyz', 'hyyzranshang', 1, 2)
										await player.equip(card, 'draw');
									}
								};
							}
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzranshang', 3, 4)
							player.randomDiscard('e', Math.min(player.countDiscardableCards(player, "e"), -num));
						}
						await game.asyncDelay(1);
					}
				},
				2: {
					trigger: {
						global: "phaseJieshuBegin",
					},
					forced: true,
					async content(event, trigger, player) {
						const control = await player
							.chooseControl("失去体力", "减体力上限", (event, player) => {
								if (player.hp <= 1 && player.hp < player.maxHp) return "减体力上限";
								return "失去体力";
							})
							.set("prompt", "崩坏：失去1点体力或减1点体力上限")
							.forResultControl();
						game.hyyzSkillAudio('hyyz', 'hyyzranshang', 9)
						if (control == "失去体力") {
							player.loseHp();
						} else {
							player.loseMaxHp(true);
						}
					},
					ai: {
						threaten: 0.5,
						neg: true,
					},
				}
			},
			ai: {
				threaten: 3,
				noe: true,
				reverseEquip: true,
				effect: {
					target(card, player, target, current) {
						if (get.type(card) == "equip" && !get.cardtag(card, "gifts")) return [1, player.hp - player.getDamagedHp()];
						if (get.tag(card, "recover") > 0) return [1, (player.getDamagedHp() - player.hp) / 2];
					},
				},
			},
		},
		hyyzranshang_info: "燃熵|锁定技，你每回合结束时【崩坏】。你的体力/装备区的牌始终为另一项的补集数。",
		hyyzyingzhu: {
			audio: 5,
			forced: true,
			group: 'hyyzyingzhu_audio',
			subSkill: {
				audio: {
					trigger: { global: 'phaseBegin' },
					filter(event, player) {
						if (player.isMinHp()) {
							return player.hasUseTarget({ name: 'kaihua', isCard: true })
						};
						if (player.isMaxHp()) {
							return player.hasUseTarget({ name: 'huogong', isCard: true });
						};
						return false;
					},
					forced: true,
					async content(event, trigger, player) {
						if (player.isMinHp()) {
							player.addGaintag(player.getCards('h'), '_hyyz_fireCard');
							player.markAuto('_hyyz_fireCard', player.getCards('h'));
							player.when('useCard').filter((event, player) => {
								return event.getParent(2).name == 'hyyzyingzhu';
							}).then(() => {
								game.hyyzSkillAudio('hyyz', 'hyyzyingzhu', 1)
							})
							player.chooseUseTarget({ name: 'kaihua', isCard: true }, '视为使用【树上开花】').set('forced', true);
						};
						if (player.isMaxHp()) {
							player.addhyyzBuff('hyyzBuff_zhongshang');
							player.when('useCard').filter((event, player) => {
								return event.getParent(2).name == 'hyyzyingzhu';
							}).then(() => {
								game.hyyzSkillAudio('hyyz', 'hyyzyingzhu', 2, 3, 4, 5)
							})
							player.chooseUseTarget({ name: 'huogong', isCard: true }, '视为使用【火攻】').set('forced', true);
						};
					},
				}
			},
		},
		hyyzyingzhu_info: `萤逐|锁定技，每回合开始时，若你的体力值最少/最多，你<span class='legendtext'>${get.hyyzIntroduce('点燃')}手牌并视为使用【树上开花】</span>/<span class='bluetext'>身受${get.hyyzIntroduce('重伤')}并视为使用【火攻】</span>。`,

		hyyz_botiou: ['波提欧', ["male", "hyyz_xt", 4, ["hyyzduizhi", "hyyzxialie", "hyyzhenchi"], []], '#b我要狠狠地爱死你，<br>小宝贝！', '浪迹银河的改造人牛仔，极度乐观、放荡不羁。身为「巡海游侠」的一员，为惩奸除恶，可以无所不用其极——高调行事的背后，渴望以此引起复仇对象「星际和平公司」的注意。'],
		hyyzduizhi: {
			audio: 2,
			group: 'hyyzduizhi_audio',
			subSkill: {
				audio: {
					enable: 'phaseUse',
					usable: 1,
					filter(event, player) {
						return player.canDantiao();
					},
					filterTarget: lib.filter.notMe,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzduizhi', 1, 2)
						player.chooseDantiao(event.targets[0]);
						event.targets[0].addSkill('hyyzduizhi2');
						event.targets[0].storage.hyyzduizhi2 = player;
					},
				},
			}
		},
		hyyzduizhi_info: "对峙|出牌阶段限一次，你可以与一名其他角色于本回合和其的下一回合进行" + get.hyyzIntroduce('单挑') + "。",
		hyyzduizhi2: {
			mark: true,
			marktext: '对峙',
			intro: {
				name: "对峙",
				content: '你已经被$盯上了'
			},
			trigger: {
				player: 'phaseBegin'
			},
			forced: true,
			charlotte: true,
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyz', 'hyyzduizhi', 3, 4)
				if (player.storage.hyyzduizhi2.isIn()) {
					player.chooseDantiao(player.storage.hyyzduizhi2);
				}
				player.removeSkill(event.name);
			},
			onremove(player) {
				delete player.storage.hyyzduizhi2
			}
		},
		hyyzxialie: {
			audio: 7,
			init(player, skill) {
				player.storage[skill] = {
					shan: 0,//用来被闪删除
					sha: 0,//用牌标记额外使用的牌
				}
			},
			forced: true,
			mod: {
				cardUsable(card, player, num) {//出杀
					const storage = player.storage.hyyzxialie;
					if (!storage || !storage['sha']) return;
					if (card.name == "sha") return num + storage['sha'];
				},
			},
			group: ['hyyzxialie_audio', 'hyyzxialie_shan', 'hyyzxialie_clear'],
			subSkill: {
				audio: {
					trigger: {
						player: 'useCard1'
					},
					filter(event, player) {
						if (_status.currentPhase != player) return false;
						return event.card.name == 'sha' && (player.countCards('h') || event.targets.some(current => current.countCards('h')));
					},
					forced: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzxialie', 1, 2, 3, 4, 5)
						let players = [];
						if (player.countCards('h')) players.add(player);
						players.addArray(trigger.targets.filter(current => current.countCards('h')));

						let list = [];
						for (let target of players) {
							const cards = await target
								.chooseCard(`侠猎：展示一张牌`, `红色令此杀强命，黑色令${player == target ? '你' : get.translation(player)}多出杀`, "h", true)
								.forResultCards();
							if (cards) list.addArray(cards);
							else players.remove(target);
						};

						//窗口
						event.videoId = lib.status.videoId++;
						game.log(players, "分别展示了", list);
						game.broadcastAll((targets, cards, id, player) => {
							var dialog = ui.create.dialog(get.translation(player) + "发动了【侠猎】", cards);
							dialog.videoId = id;
							var getName = function (target) {
								if (target._tempTranslate) return target._tempTranslate;
								var name = target.name;
								if (lib.translate[name + "_ab"]) return lib.translate[name + "_ab"];
								return get.translation(name);
							};
							for (var i = 0; i < targets.length; i++) {
								dialog.buttons[i].querySelector(".info").innerHTML = getName(targets[i]) + get.translation(get.color(cards[i]));
							}
						}, players, list, event.videoId, player);
						await game.asyncDelay();
						game.broadcastAll("closeDialog", event.videoId);

						let colors = {
							red: 0,
							black: 0,
						};
						list.forEach(card => {
							let color = get.color(card);
							colors[color]++;
							if (color == 'black') player.storage.hyyzxialie['sha']++;
						});
						game.log('#g【侠猎】效果：', '<li>', trigger.targets, '额外出【闪】数+', colors['red'], "<li>", player, '额外出【杀】数+', colors['black']);
						//出闪
						for (let subTarget of trigger.targets) {
							const id = subTarget.playerid;
							const map = trigger.customArgs;
							if (!map[id]) map[id] = {};
							if (typeof map[id].shanRequired == "number") {
								map[id].shanRequired += colors['red'];
							} else {
								map[id].shanRequired = colors['red'] + 1;
							};
						};
					},
				},
				shan: {
					trigger: {
						player: 'shaAfter'
					},
					filter(event, player) {
						return event.card.name == 'sha';
					},
					direct: true,
					locked: true,
					charaltte: true,
					async content(event, trigger, player) {
						player.storage.hyyzxialie['shan'] += trigger.shanRequired;
					}
				},
				clear: {
					trigger: {
						player: 'phaseEnd'
					},
					forced: true,
					charaltte: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzxialie', 6, 7)
						if (_status.currentPhase == player) {
							let num = 0, str = `<span class='greentext'>【侠猎】</span>：`;
							if (player.storage.hyyzxialie['shan']) {
								str += `<li>少使用了${player.storage.hyyzxialie['shan']}张<span class='yellowtext'>【闪】</span>`;
								num++;
							}
							if (player.getCardUsable('sha')) {
								str += `<li>少使用了${player.getCardUsable('sha')}张<span class='yellowtext'>【杀】</span>`;
								num++;
							}
							if (num > 0) {
								game.log(str);
								await player.draw(num);
							}
						}
						player.storage.hyyzxialie = {
							sha: 0,
							shan: 0,
						}
					},
				}
			}
		},
		hyyzxialie_info: `侠猎|锁定技，你于回合内使用【杀】时，与目标角色各展示一张牌。
			<li>每展示一张	<span class='greentext'>黑色</span>/<span class='firetext'>红色</span>牌，<span class='greentext'>你本回合使用【杀】的次数上限+1</span>/<span class='firetext'>目标需要响应的【闪】数+1</span>。回合结束时，若你使用【杀】和目标使用【闪】有未被消耗的次数，各令你摸一张牌。`,
		hyyzhenchi: {
			audio: 2,
			trigger: {
				player: 'damageBegin3',
				source: 'damageBegin1'
			},
			filter(event) {
				return game.dead.length > game.countPlayer();
			},
			forced: true,
			content() {
				trigger.num++;
			}
		},
		hyyzhenchi_info: '恨斥|锁定技，场上的阵亡角色数大于存活角色数时，你受到和造成的伤害+1。',

		hyyz_kafuka: ['卡芙卡', ["female", "hyyz_xt", 3, ['hyyzmosuo', 'hyyzyuemian'], []], '#b“命运”就是这样，<br>创造奇迹的同时，<br>也以为只是偶然。', '在星际和平公司的通缉档案里，卡芙卡只留下了名字和「爱好收集大衣」的记录。人们对这位星核猎手所知甚少，只知道她是「命运的奴隶」艾利欧最信任的成员之一。为了到达艾利欧预见的「未来」，卡芙卡开始行动。'],
		hyyzmosuo: {
			audio: 4,
			trigger: {
				player: 'damageEnd',
				source: 'damageSource'
			},
			filter(event, player) {
				if (!event.source || event.source == event.player) return false;
				if (event.source == player) {
					return event.player.isIn();
				} else {
					return event.source.isIn();
				};
			},
			frequent: 'check',
			check(event, player) {
				const target = event.player == player ? event.source : event.player;
				return get.attitude(player, target) < 0;
			},
			async content(event, trigger, player) {
				const target = trigger.player == player ? trigger.source : trigger.player;
				if (target.countCards('ej')) {
					const cards = target.getCards('ej', (card) => {
						if (get.position(card) == 'e') return true;
						return (card.viewAs || card.name) != 'xumou_jsrg';
					});
					for (let card of cards) {
						await target.addJudge({ name: 'xumou_jsrg' }, [card]);
					};
				} else {
					//await player.addTempSkills(['hyyzyuemian'], { global: 'roundStart' });
				};

				if (!target.countCards('ej', (card) => {
					return ['equip'].includes(lib.card[card.name].type);
				})) {
					await target.addhyyzBuff('hyyzBuff_chudian', 1);
				};
				if (!target.countCards('ej', (card) => {
					return ['trick', 'delay'].includes(lib.card[card.name].type);
				})) {
					await target.hyyzBang();
				};
			},
			derivation: ['hyyzyuemian'],
			ai: {
				order: 1,
				result: {
					target(player, target, card) {
						if (ui.selected.targets.length) {
							return get.damageEffect(target, ui.selected.targets[0], _status.event.player) * ui.selected.targets[0].countCards('ej');
						} else {
							let num = 0;
							const players = game.filterPlayer(current => current != target);
							for (let i of players) {
								let dam = get.damageEffect(i, target, _status.event.player) * target.countCards('ej');
								if (dam > num) num = dam;
							};
							return num;
						}
					}
				}
			},
		},
		hyyzmosuo_info: `摩挲|当你造成或受到伤害后，你可以令对方“蓄谋”场上的牌。若该角色没有装备/锦囊的蓄谋牌，其${get.hyyzIntroduce('触电')}/${get.hyyzIntroduce('引爆')}。`,
		hyyzyuemian: {
			audio: 2,
			trigger: {
				player: "linkBegin",
				global: 'damageEnd'
			},
			forced: true,
			filter(event, player) {
				console.log(event);
				if (event.name == 'link') return !player.isLinked();
				else return event.dotDebuff && event.dotDebuff == 'hyyzBuff_chudian';
			},
			content() {
				if (trigger.name == 'link') trigger.cancel();
				else {
					player.chooseDrawRecover(true);
				}
			},
		},
		hyyzyuemian_info: "月绵|锁定技，你不能被横置。当有角色受到[触电]伤害后，你摸一张牌或回复1点体力。",

		hyyz_fuxuan: ['符玄', ["female", "hyyz_xt", "2/4", ['hyyzshiying', 'hyyzqiankun', 'hyyzjianzhi'], []], '#b其实命运从来只有一条道路', '「知识要用苦痛来换取。」凭借第三眼与穷观阵为仙舟占算航路，预卜事务吉凶，坚信自己所做的一切便是事情的「最优解」。符玄等待着将军承诺的「退位让贤」，然而这一天的到来…似乎还遥遥无期。'],
		hyyzshiying: {
			audio: 3,
			init(player) {
				player.storage.hyyzshiying = [];
			},
			group: 'hyyzshiying_audio',
			subSkill: {
				audio: {
					trigger: {
						global: 'damageBegin4'
					},
					filter(event, player) {
						if (event.player == player) return false;
						if (!player.countCards('h')) return false;
						return event.player.getHistory('damage', (evt) => evt != event).length || event.num > 1;
					},
					async cost(event, trigger, player) {
						const result = await player
							.chooseCard('示影：是否交给' + get.translation(trigger.player) + '一张手牌并将多余的伤害转移给你', player.getStorage('hyyzshiying').length > 0 ? `若牌名为${get.translation(player.getStorage('hyyzshiying'))}，你减1点体力上限` : `不会减体力上限`).set('ai', (card) => {
								let trigger = _status.event.getTrigger(), player = _status.event.player;
								if (get.attitude(player, trigger.player) < 0 || player.hp <= 2 || trigger.player.hp > 3) return -1;
								if (trigger.player.hp <= trigger.num) return 10;
								if (player.hasUseTarget(card)) return -1;
								return 10 - get.value(card);
							}).forResult();
						event.result = result;
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzshiying', 1, 2)
						const cards = event.cards;
						player.give(cards, trigger.player, 'giveAuto');
						if (player.getStorage('hyyzshiying').includes(get.name(cards[0]))) await player.loseMaxHp();
						player.markAuto('hyyzshiying', [get.name(cards[0])]);
						let move = 0;
						if (trigger.player.getHistory('damage', (evt) => evt != trigger).length) {
							move = trigger.num;
							trigger.cancel();
							game.hyyzSkillAudio('hyyz', 'hyyzshiying', 3)
							let next = player.damage();
							if (trigger.cards) next.cards = trigger.cards;
							else next.cards = [];
							if (trigger.card) next.cards = trigger.card;
							if (move) next.num = move;
							if (trigger.source) next.source = trigger.source;
							if (trigger.unreal) next.unreal = trigger.unreal;
							if (trigger.nature) next.nature = trigger.nature;
							await next;
						} else {
							move = trigger.num - 1;
							trigger.num = 1;
							trigger.hyyzshiying = move;
							player.when({
								global: 'damageEnd'
							}).filter((event, player) => {
								return event.hyyzshiying;
							}).then(() => {
								game.hyyzSkillAudio('hyyz', 'hyyzshiying', 3)
								let next = player.damage();
								if (trigger.cards) next.cards = trigger.cards;
								else next.cards = [];
								if (trigger.card) next.cards = trigger.card;
								if (trigger.hyyzshiying) next.num = trigger.hyyzshiying;
								if (trigger.source) next.source = trigger.source;
								if (trigger.unreal) next.unreal = trigger.unreal;
								if (trigger.nature) next.nature = trigger.nature;
							})
						};
					}
				}
			},
		},
		hyyzshiying_info: "示影|其他角色每回合受到大于1点的伤害时，你可以交给其一张手牌并将多余的伤害转移给你。若你以此法交出过此牌名的牌，你减1点体力上限。",
		hyyzqiankun: {
			audio: 1,
			trigger: {
				player: ['loseHpAfter', 'damageAfter']
			},
			frequent: true,
			filter(event, player) {
				return player.hp < player.getDamagedHp();
			},
			round: 1,
			async content(event, trigger, player) {
				const num = player.getDamagedHp() - player.hp;
				await player.changeHp(num);
				if (player.hp <= 0) await player.dying();
			}
		},
		hyyzqiankun_info: "乾坤|每轮限一次，当你受到伤害或失去体力后，若体力值低于已损失体力值，交换之。",
		hyyzjianzhi: {
			audio: 2,
			trigger: {
				global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.name.indexOf("lose") == 0) {
					if (event.getlx === false || event.position != ui.discardPile) return false;
				} else {
					var evt = event.getParent();
					if (evt.relatedEvent && evt.relatedEvent.name == "useCard") return false;
				}
				for (var i of event.cards) {
					var owner = false;
					if (event.hs && event.hs.includes(i)) owner = event.player;
					var type = get.type2(i, null, owner);
					if (type == "trick") return true;
				}
				return false;
			},
			usable: 1,
			async content(event, trigger, player) {
				var card;
				for (let i of trigger.cards) {
					var owner = false;
					if (trigger.hs && trigger.hs.includes(i)) owner = trigger.player;
					var type = get.type2(i, null, owner);
					if (type == "trick") card = i;
				}
				player.gain(card, 'gain2');
			},
		},
		hyyzjianzhi_info: "鉴知|锁定技，你获得每回合首张不因使用而进入弃牌堆的锦囊牌。",

		hyyz_heitiane: ['黑天鹅', ["female", "hyyz_xt", 3, ['hyyzyibu', 'hyyzminggan', 'hyyzyuexin'], []], '#b人们以为自己面对的是<br>现在与未来，<br>却无人知晓我们其实都在<br>走向过去。', '「流光忆庭」的忆者，神秘优雅的占卜师。常挂着温柔的微笑，耐心聆听他人的言语，并借此走入「记忆」，掌握全盘信息。热衷于收集独一无二的记忆，背后的想法却难以看透。'],
		hyyzminggan: {
			logAudio: (index) => typeof index === 'number' ? `ext:忽悠宇宙/asset/hyyz/audio/hyyzminggan${index}.mp3` : false,
			audio: 4,
			trigger: {
				global: ['judge']
			},
			filter(event, player) {
				return game.hasPlayer(current => player.canUse({ name: 'tuixinzhifu', isCard: true }, current)) && player.getStorage('hyyzminggan').length < 4;
			},
			async cost(event, trigger, player) {
				var next = player.chooseButton([
					'铭感：选择一种花色',
					[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					if (player.getStorage('hyyzminggan').includes(button.link[2])) return false;
					return true;
				});
				next.set('ai', function (button) {
					let suit = button.link[2].slice(6);
					return true;
				});
				const links = await next.forResultLinks();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							name: links[0][2],
						}
					}
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				player.logSkill("hyyzminggan", player, null, null, [[1, 2].randomGet()]);
				const name = event.cost_data.name;
				if (!player.storage.hyyzminggan) player.storage.hyyzminggan = [];
				player.storage.hyyzminggan.add(name);
				player.when({
					global: "phaseAfter"
				}).then(() => {
					player.storage.hyyzminggan = [];
				})
				const namex = name.slice(6);
				game.log(player, '声明了', namex);
				player.chat(lib.translate[namex]);
				await player.chooseUseTarget({
					name: 'tuixinzhifu',
					storage: {
						hyyzminggan: namex
					},
					isCard: true
				}, true);
			},
			group: ['hyyzminggan_judge'],
			subSkill: {
				judge: {
					trigger: {
						player: "gainAfter"
					},
					charaltte: true,
					forced: true,
					filter(event, player) {
						let evt = event.getParent(2);
						if (!evt?.card?.storage?.hyyzminggan) return false;
						if (event.getParent(5).name != 'hyyzminggan') return false;
						return event.getg(player).some(
							cardx => player.countCards('he', (card) => card == cardx) &&
								get.suit(cardx) == evt.card.storage.hyyzminggan
						);
					},
					async content(event, trigger, player) {
						player.logSkill("hyyzminggan", player, null, null, [[3, 4].randomGet()]);
						const evt = trigger.getParent(2);
						evt.finish();

						const list = trigger.getg(player).filter(
							cardx => player.countCards('he', (card) => card == cardx) && get.suit(cardx) == evt.card.storage.hyyzminggan
						), evtJudge = trigger.getParent(8);
						let cards = list.length == 1 ? list : (await player
							.chooseCard(`选择一张${get.translation(evt.card.storage.hyyzminggan)}牌进行改判`, 'he', true, (card) => list.includes(card) && get.suit(card) == trigger.getParent(2).card.storage.hyyzminggan)
							.forResultCards());
						await player.respond(cards[0], "hyyzminggan", "highlight", "noOrdering");
						game.cardsDiscard(evtJudge.player.judging[0]);
						evtJudge.player.judging[0] = cards[0];
						evtJudge.orderingCards.addArray(cards);
						game.log(evtJudge.player, "的判定牌改为", cards[0]);
					}
				}
			}
		},
		hyyzminggan_info: "铭感|每回合每种花色限一次。一名角色的判定牌生效前，你可以声明一种花色并视为使用一张【推心置腹】，若因此获得声明花色的牌，打出之代替判定牌并终止此牌结算。",
		hyyzyibu: {
			audio: 1,
			enable: 'phaseUse',
			usable: 1,
			filterTarget: true,
			filter(event, player) {
				return true;
			},
			async content(event, trigger, player) {
				const suits = [], target = event.targets[0];
				target.getHistory('lose', (evt) => {
					if (evt?.cards?.length) {
						evt.cards.map(card => suits.add(get.suit(card)));
					}
				})
				const judgeEvent = player.judge(card => {
					if (suits.includes(get.suit(card))) return 2;
					return 0;
				});
				judgeEvent.judge2 = result => result.bool;
				const { result: { suit } } = await judgeEvent;
				if (suit) {
					if (suits.includes(suit)) {
						await target.loseHp()
						let cards = get.centralCards().filter((card) => get.suit(card) == suit);
						if (cards) await player.gain(cards, 'gain2');
					}
				}
			},
			ai: {
				order: 1,
				result: {
					target(player, target, card) {
						if (target.getHistory('lose', (evt) => {
							return evt?.cards?.length;
						}).length > 0) return - 2;
						return 0;
					}
				}
			},
			subSkill: {
				no: {
					init(player, skill) {
						player.storage.skill = [];
					},
					onremove(player, skill) {
						delete player.storage.skill;
					},
					mark: true,
					intro: {
						content: "不能使用或打出$牌",
					},
					mod: {
						"cardEnabled2"(card, player) {
							if (player.getStorage('hyyzyibu_no').includes(get.suit(card)))
								return false;
						},
					},
				}
			}
		},
		hyyzyibu_info: `忆卜|出牌阶段限一次，你可以令一名角色判定。若该角色本回合失去过结果花色的牌，其失去1点体力；若为你，获得${get.hyyzIntroduce('中央区')}的同花色牌。`,
		hyyzyuexin: {
			locked: true,
			ai: {
				viewHandcard: true,
				skillTagFilter(player, tag, arg) {
					if (get.distance(player, arg) != 1) return false;
				},
			},
		},
		hyyzyuexin_info: "阅心|锁定技，距离为1的角色的手牌对你可见。",

		hyyz_xier: ['希儿', ["female", "hyyz_xt", 4, ['hyyzfuguang', 'hyyzlixing'], []], '#b用自己的力量去创造公平<br>这难道不是理所当然的事情吗？', '飒爽俊逸的「地火」成员，成长于地底危险混乱的环境，习惯独来独往。<br>作为曾经的弱者，如今的她锲而不舍地追求更强大的力量。为了有朝一日揭示地底的真相，为了给自己的族人正名，希儿可以忍受任何痛苦。<br>保护与被保护，压迫与被压迫，世界向希儿展示的始终是非黑即白的那一面——<br>直至「那名少女」的出现。'],
		hyyzfuguang: {
			audio: 2,
			trigger: {
				player: "useCard1",
			},
			filter(event, player) {
				if (event.card.name != "sha") return false;
				return event.targets.some(current => !current.getHistory('lose', (evt) => evt && evt.cards && evt.cards.length).length);
			},
			forced: true,
			content: function () {
				game.setNature(trigger.card, "hyyz_quantum");
			},
		},
		hyyzfuguang_info: "负光|锁定技，你对本回合未失去过牌的角色使用的【杀】视为量子【杀】。",
		hyyzlixing: {
			audio: 5,
			trigger: {
				player: "useCardAfter",
			},
			frequent: true,
			filter(event, player) {
				if (event.card.name != 'sha') return false;
				const history = player.getHistory('sourceDamage', (evt) => evt.card == event.card);
				if (history.length) {
					return event.targets.some(current => {
						return current.getHistory('lose', (evt) => evt && evt.cards && evt.cards.length > 0).length > 0;
					})
				} else {
					return true;
				}
			},
			async content(event, trigger, player) {
				const history = player.getHistory('sourceDamage', (evt) => evt.card == trigger.card);
				if (history.length) {
					let cards = [];
					for (const iterator of trigger.targets) {
						iterator.getHistory('lose', (evt) => {
							if (evt && evt.cards && evt.cards.length) {
								cards.addArray(evt.cards.filterInD('d'));
							}
						});
					};
					if (cards.length) {
						const { result: { targets } } = await player.chooseTarget(`将${get.translation(trigger.targets)}失去过的牌交给一名角色`, get.translation(cards), true)
							.set('ai', (target) => {
								var att = get.attitude(_status.event.player, target);
								if (att < 3) return 0;
								if (target.hasJudge("lebu")) att /= 2;
								if (target.hasSkillTag("nogain")) att /= 10;
								return att / (1 + get.distance(player, target, "absolute"));
							});
						if (targets) {
							targets[0].gain(cards, 'draw2');
						};
					};
				} else {
					player.draw(2);
					player.getStat().card[trigger.card.name]--;
				};
				player.when({
					global: 'dieAfter'
				}).filter((event, player) => {
					return event.source == player && event.reason && event.reason.cards.some(card => get.name(card) == 'sha');
				}).then(() => {
					player.addhyyzBuff('hyyzBuff_jiasu');
				})
			}
		},
		hyyzlixing_info: "励行|若你使用的【杀】未造成伤害，摸两张牌且不计入次数；造成伤害，你将目标本回合失去过的牌交给一名角色。若杀死了其他角色，你" + get.hyyzIntroduce('加速') + "。",

		hyyz_11: ['11号', ["female", "hyyz_zzz", 4, ['hyyzzhenya', 'hyyzliaoyuan'], []], '#b士兵11号就位！随时准备行动！', '令行禁止，忠于使命的士兵楷模…至少11号是这么要求自己的。<br>武器不需要情绪，只要切实地执行命令…至少11号是这么告诫自己的。<br> 不论遭遇何种强敌，都只需要点火、举剑、迎击…至少11号一直是这么做的。<br>软弱已随名字一起舍弃，只留下了坚定的内心…至少11号是这么认为的。'],
		hyyzzhenya: {
			init(player) {
				player.storage.hyyzzhenya = false;
				player.storage.hyyzzhenya_zhou = 0;
			},
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill];
				player.updateMark(skill);

				player.storage.hyyzzhenya_zhou++;
				if (player.storage.hyyzzhenya_zhou > 0 && player.storage.hyyzzhenya_zhou % 2 == 0) {
					delete player.getStat().card.sha;
					delete player.getStat().card.jiu;
				};
			},
			mark: true,
			marktext: "☯",
			intro: {
				name: '镇压',
				markcount(storage, player, skill) {
					let str = '*';
					const history = player.getAllHistory("useCard");
					if (!history.length) {
						//player.addTip('hyyzzhenya', '延时');
						return str;
					}
					const type = history[history.length - 1].card;
					str = lib.translate[get.timetype(type)];
					//if (player.hasSkill('hyyzliaoyuan_on')) {
					//	player.addTip('hyyzzhenya', storage ? '延时非伤' : '即时伤害')
					//} else {
					//	player.addTip('hyyzzhenya', storage ? '即时伤害' : '延时非伤')
					//}
					return str;
				},
				content(storage, player, skill) {//延时，伤害，非伤害，
					let str = `你使用${storage ? '非伤害' : '伤害'}牌时，若你上一张使用了${storage ? '即时' : '延时'}牌，附魔火并摸一张牌。周始：重置牌的使用次数。`;
					const history = player.getAllHistory("useCard");
					if (!history.length) {
						str += `<li>未使用过牌`;
						str += '<li>推荐：' + (storage ? '即时牌' : '延时牌')//不会触发技能 的默认档
						return str;
					}
					//上一张牌为
					const type = get.timetype(history[history.length - 1].card);
					str += `<li>上一张牌为${lib.translate[type]}牌`;
					if (player.hasSkill('hyyzliaoyuan_on')) {
						str += '<li>推荐：' + storage ? '非伤害牌' : '伤害牌'
					} else {
						if (type == 'notime' && storage) {//即时
							str += '<li>推荐：延时非伤害牌';
						} else if (type == 'time' && !storage) {//延时
							str += '<li>推荐：即时伤害牌';
						} else {
							str += '<li>不符合条件'
						};
					}
					return str;
				},
			},
			trigger: { player: 'useCard1' },
			forced: true,
			filter(event, player) {
				if (player.getAllHistory("useCard").length < 2 && !player.hasSkill('hyyzliaoyuan_on')) return false;
				//player.updateMark('hyyzzhenya');
				if (!player.storage.hyyzzhenya) {
					return get.tag(event.card, "damage")
				} else {
					return !get.tag(event.card, "damage") > 0
				}
			},
			async content(event, trigger, player) {
				let history = player.getAllHistory("useCard");
				const lastType = get.timetype(history[history.length - 2].card);
				if (
					!player.storage.hyyzzhenya && (lastType == 'time' || player.hasSkill('hyyzliaoyuan_on'))
					||
					player.storage.hyyzzhenya && (lastType == 'notime' || player.hasSkill('hyyzliaoyuan_on'))
				) {
					player.changeZhuanhuanji("hyyzzhenya");
					await player.draw();
					//trigger.card.storage.hyyzzhenya = true;
					player.when({ source: 'damageBegin1' })
						.filter((event, player) => event.card == trigger.card)
						.then(() => {
							game.setNature(trigger, "fire");
						})
					game.setNature(trigger.card, "fire", true);
				} else {
					player.tempBanSkill(event.name);
				};
			},
		},
		hyyzzhenya_info: `镇压|锁定技，转换技，
				你使用<span class='legendtext'>①伤害牌</span><span class='bluetext'>②非伤害牌</span>时，
				若你上一张使用了<span class='legendtext'>①延时牌</span><span class='bluetext'>②即时牌</span>，
				<span class='firetext'>${get.hyyzIntroduce('附魔')}"火并摸一张牌</span>；否则，此技能本回合失效。<br>
				${get.hyyzIntroduce('周始')}：<span class='greentext'>重置使用牌的次数限制。</span>`,
		hyyzliaoyuan: {
			unique: true,
			mark: true,
			skillAnimation: true,
			animationColor: "fire",
			limited: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => (player.storage[skill] = false),
			enable: 'phaseUse',
			async content(event, trigger, player) {
				player.awakenSkill("hyyzliaoyuan");
				player.restoreSkill('hyyzzhenya');
				player.storage.hyyzzhenya_zhou = 0;
				player.addTempSkill('hyyzliaoyuan_on');
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
			},
		}, hyyzliaoyuan_on: { charaltte: true },
		hyyzliaoyuan_info: "燎原|限定技，出牌阶段，你可以重置〖镇压〗并令之本回合无视上一张牌的类型。",

	},
	2407: {

		meng_liuying: ['流萤', ['female', 'hyyz_xt', '3/4', ['mengliuguangzhuhuo', 'mengranquyingshen', 'mengmengguihechu'], []], '昨夜流萤'],
		mengliuguangzhuhuo: {
			audio: 9,
			nobracket: true,
			trigger: {
				player: ['phaseJudgeBegin', 'phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin'],
			},
			forced: true,
			async content(event, trigger, player) {
				await player.draw();
				if (player.countCards('hes', (card) => {
					return player.hasUseTarget({ name: 'huogong' }, [card]);
				}) > 0) {
					const { result: { targets, cards } } = await player.chooseCardTarget({
						prompt: '流光逐火：将一张牌当【火攻】使用',
						position: 'hes',
						forced: true,
						filterCard(card) {
							return player.hasUseTarget({ name: 'huogong' }, [card]);
						},
						filterTarget(card, player, target) {
							if (ui.selected.cards.length) {
								return player.canUse({ name: 'huogong' }, target);
							}
						},
						ai1(card) {
							return 8 - get.value(card);
						},
						ai2(target) {
							var player = _status.event.player, att = get.attitude(player, target);
							return - att;
						},
					});
					if (targets && cards) {
						player.line(targets[0], 'fire');
						let card = {
							name: 'huogong',
							storage: {
								mengliuguangzhuhuo: true,
							}
						}
						player.when('useCardAfter').filter((event, player) => {
							return event.card && event.card.storage && event.card.storage.mengliuguangzhuhuo;
						}).then(() => {
							if (!player.getHistory('sourceDamage', (evt) => {
								return evt && evt.card && evt.card == trigger.card;
							}).length) {
								player.loseHp();
								player.draw(2);
							}
						});
						player.useCard(card, cards, targets);
					};
				}
			}
		},
		mengranquyingshen: {
			audio: 'mengliuguangzhuhuo',
			nobracket: true,
			trigger: {
				source: 'damageBegin1',
			},
			filter(event, player) {
				if (!event.card) return false;
				return true;
			},
			forced: true,
			content() {
				let suits = [];
				game.countPlayer(current => {
					current.getHistory('sourceDamage', (evt) => {
						if (evt.card) {
							suits.add(get.suit(evt.card));
						}
					})
				});
				if (!suits.includes(get.suit(trigger.card))) player.recover();
				else trigger.num++;
			}
		},
		mengmengguihechu: {
			audio: 5,
			nobracket: true,
			trigger: {
				player: 'dying'
			},
			filter(event, player) {
				var skills = player.getSkills(null, false, false).filter((skill) => {
					var info = get.info(skill);
					if (!info || info.charlotte || !get.is.locked(skill) || get.skillInfoTranslation(skill, player).length == 0 ||
						(info.inherit && info.inherit == 'mengcanshi')) return false;
					return true;
				});
				return skills.length > 0;
			},
			forced: true,
			content() {
				player.recover(1 - player.hp);
				let skills = player.getSkills(null, false, false).filter((skill) => {
					var info = get.info(skill);
					if (!info || info.charlotte || !get.is.locked(skill) || get.skillInfoTranslation(skill, player).length == 0 ||
						(info.inherit && info.inherit == 'mengcanshi')) return false;
					return true;
				});
				const name = skills[0] + '_canshi';
				lib.skill[name] = {};
				Object.assign(lib.skill[name], lib.skill['mengcanshi']);
				lib.translate[name] = lib.translate['mengcanshi'];
				lib.translate[name + '_info'] = lib.translate['mengcanshi_info'];
				player.removeSkill(skills[0]);
				player.addSkill(name);
			}
		},
		mengcanshi: {
			audio: 'mengmengguihechu',
			trigger: {
				player: "phaseDrawBegin1",
			},
			check(event, player) {
				var num = game.countPlayer(function (current) {
					return current.isDamaged();
				});
				return num > 3;
			},
			prompt(event, player) {
				var num = game.countPlayer(function (current) {
					return current.isDamaged();
				});
				return "残蚀：是否改为摸" + get.cnNumber(num) + "张牌？";
			},
			filter(event, player) {
				return !event.numFixed;
			},
			content() {
				trigger.changeToZero();
				var num = game.countPlayer(function (current) {
					return current.isDamaged();
				});
				if (num > 0) {
					player.draw(num);
				}
				player.addTempSkill("mengcanshi_1");
			},
			subSkill: {
				1: {
					trigger: {
						player: "useCard",
					},
					forced: true,
					filter(event, player) {
						if (player.countCards("he") == 0) return false;
						var type = get.type(event.card, "trick");
						return type == "basic" || type == "trick";
					},
					autodelay: true,
					content() {
						player.chooseToDiscard(true, "he");
					},
				}
			}
		},
		meng_re_liuying: ['流萤', ["female", "hyyz_xt", 4, ["mengshangjin", "mengranhuang"], ['die:meng_liuying']], '五雷正心', ''],
		"mengshangjin": {
			audio: 'mengliuguangzhuhuo',
			forced: true,
			trigger: {
				player: ["phaseZhunbeiEnd", "phaseJudgeEnd", "phaseDrawEnd", "phaseUseEnd", "phaseDiscardEnd", "phaseJieshuEnd"],
			},
			filter: function (event, player) {
				return !player.getHistory("gain", evt => evt.getParent(event.name) == event).length &&
					!player.getHistory("lose", evt => evt.getParent(event.name) == event && evt.hs.length).length;
			},
			async content(event, trigger, player) {
				player.chooseUseTarget('kaihua', true);
			},
			group: 'mengshangjin2',
		}, mengshangjin2: {
			trigger: {
				player: "loseAfter",
			},
			filter(event, player) {
				if (event.type != 'discard') return false;
				if (event.getParent(6).name != 'mengshangjin') return false;
				let cards = event.getl(player).cards2;
				return cards.some(card => {
					let card2 = get.autoViewAs({ name: "sha", nature: 'fire' }, [card]);
					return get.position(card, true) == 'd' && get.type(card) == 'equip' && player.hasUseTarget(card2);
				});
			},
			forced: true,
			direct: true,
			async content(event, trigger, player) {
				const cards = trigger.getl(player).cards2.filter(card => get.position(card, true) == 'd' && get.type(card) == 'equip');
				for (let i of cards) {
					let card = get.autoViewAs({ name: "sha", nature: 'fire' }, [i]);
					if (player.hasUseTarget(card)) {
						player.chooseUseTarget([i], card, true);
					}
				}
			},
		},
		"mengranhuang": {
			audio: 'mengmengguihechu',
			unique: true,
			limited: true,
			init(player) {
				player.storage.mengranhuang = false;
				player.addSkill('mengranhuang2')
			},
			mark: true,
			intro: {
				content: "limited",
			},
			skillAnimation: true,
			animationColor: "fire",

			enable: "chooseToUse",
			filter(event, player) {
				return !player.storage.mengranhuang
			},
			filterCard: () => false,
			selectCard: -1,
			viewAs: {
				name: "huogong",
			},
			prompt() {
				return `燃煌：将牌堆顶的牌（${get.translation(_status.pileTop)}）当【火攻】使用或打出`
			},
			async precontent(event, trigger, player) {
				player.awakenSkill("mengranhuang");
				player.storage.mengranhuang = true;
				event.result.cards = get.cards();
			},
		}, mengranhuang2: {
			trigger: {
				player: ["huogongBegin", "huogongAfter"]
			},
			forced: true,
			locked: false,
			popup: false,
			filter(event, player) {
				return event.skill == 'mengranhuang';
			},
			async content(event, trigger, player) {
				if (event.triggername == 'huogongBegin') {
					trigger.setContent(lib.skill.mengranhuang2.huogongContent);
				} else {
					const { result: { targets } } = await player.chooseTarget('分配“燃煌”', true, lib.filter.notMe);
					if (targets) {
						player.removeSkills(['mengranhuang']);
						targets[0].addSkills(['mengranhuang']);
					}
				}
			},
			huogongContent() {
				"step 0";
				if (target.countCards("h") == 0) {
					event.finish();
					return;
				}
				event._result = { cards: target.getCards("h").randomGets(1) };
				"step 1";
				target.showCards(result.cards).setContent(function () { });
				event.dialog = ui.create.dialog(get.translation(target) + "展示的手牌", result.cards);
				event.videoId = lib.status.videoId++;

				game.broadcast("createDialog", event.videoId, get.translation(target) + "展示的手牌", result.cards);
				game.addVideo("cardDialog", null, [get.translation(target) + "展示的手牌", get.cardsInfo(result.cards), event.videoId]);
				event.card2 = result.cards[0];
				game.log(target, "展示了", event.card2);
				event._result = {};

				if (get.centralCards().length > 0) {
					var chooseButton = player.chooseButton(1, ["你的手牌", player.getCards("h"), "中央区", get.centralCards()]);
				} else {
					var chooseButton = player.chooseButton(1, ["你的手牌", player.getCards("h")]);
				}
				chooseButton.set("suit", get.suit(event.card2));
				chooseButton.set('propmt', false)
				chooseButton.set("filterButton", function (button) {
					if (get.suit(button.link) == _status.event.suit) return true;
					return false;
				});
				event.list1 = [];
				event.list2 = [];
				game.delay(2);
				"step 2";
				if (result.bool) {
					var card = result.links[0];
					if (get.owner(card) == player) player.discard(card);
					else {
						player.$throw([card]);
						game.cardsDiscard([card]);
					}
					target.damage("fire");
				}
				event.dialog.close();
				game.addVideo("cardDialog", null, event.videoId);
				game.broadcast("closeDialog", event.videoId);
			},
		},
		meng_sp_liuying: ['流萤', ["female", "hyyz_xt", 3, ["mengxinying", "mengliuying"], ['die:meng_liuying']], '七夕月', ''],
		"mengxinying": {
			audio: 'mengliuguangzhuhuo',
			init(player) {
				player.storage.mengxinying = ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"]
			},
			mark: true,
			intro: {
				content(storage) {
					return get.translation(storage);
				}
			},
			trigger: {
				player: 'phaseBefore',
			},
			direct: true,
			locked: true,
			content() {
				trigger.phaseList = player.getStorage('mengxinying');
			},
			group: ['mengxinying_draw', 'mengxinying_discard'],
			subSkill: {
				draw: {
					audio: 'mengxinying',
					trigger: {
						player: 'phaseDrawBegin',
					},
					filter(event, player) {
						let phaseList = event.getParent().phaseList.slice(0);
						let keys = [];
						for (let i = 0; i < phaseList.length; i++) {
							if (i == 0) continue;
							if (phaseList[i].split("|")[0] == 'phaseDiscard') {
								keys.push(i + 1);
							}
						};
						if (!keys.length) return false;
						return true;
					},
					async content(event, trigger, player) {
						const evt = trigger.getParent();
						let phaseList = evt.phaseList.slice(0);
						let keys = [];
						for (let i = 0; i < phaseList.length; i++) {
							if (i == 0) continue;
							if (phaseList[i].split("|")[0] == 'phaseDiscard') {
								keys.push(i + 1);
							}
						};
						const { result: { control: key } } = await player
							.chooseControl(keys)
							.set('prompt', '向前移动序号为几的弃牌阶段？')
							.set('prompt2', get.translation(evt.phaseList))
						if (key) {
							let counts = Array.from({ length: (key - 1) }, (_, i) => i + 1);
							const { result: { control: count } } = await player
								.chooseControl(counts)
								.set('prompt', '你可以将第' + key + '个阶段前移至多' + counts.length + '次')
								.set('prompt2', get.translation(evt.phaseList))
							if (count) {
								if (key - 1 - count <= evt.num) evt.num++;

								let move = phaseList.splice(key - 1, 1)[0];
								phaseList.splice(key - 1 - count, 0, move);
								if (key - 1 - count == 0) {
									phaseList.push('phaseDiscard')
								}

								evt.phaseList = phaseList;
								player.storage.mengxinying = phaseList;
								if (!trigger.numFixed) trigger.num += count;
								else player.draw(count);
								player.storage.mengxinying_draw = count;
							}
						}

					},
				},
				discard: {
					audio: 'mengxinying',
					trigger: {
						player: 'phaseDiscardEnd'
					},
					forced: true,
					filter(event, player) {
						if (!player.storage.mengxinying_draw) return false;
						let phaseList = event.getParent().phaseList.slice(0);
						let keys = [];
						for (let i = 0; i < phaseList.length - 1; i++) {
							if (phaseList[i].split("|")[0] == 'phaseDraw') {
								keys.push(i + 1);
							}
						};
						if (!keys.length) return false;
						return true;
					},
					async content(event, trigger, player) {
						const evt = trigger.getParent();
						let count = player.storage.mengxinying_draw;
						delete player.storage.mengxinying_draw;
						let phaseList = evt.phaseList.slice(0);
						let keys = [];
						for (let i = 0; i < phaseList.length - 1; i++) {
							if (phaseList[i].split("|")[0] == 'phaseDraw') {
								keys.push(i + 1);
							}
						};
						const { result: { control: key } } = await player
							.chooseControl(keys)
							.set('prompt', '向后移动' + count + '次序号为几的摸牌阶段？')
							.set('prompt2', get.translation(evt.phaseList));
						if (key) {
							if (key - 1 + count >= evt.num) evt.num--;

							let move = phaseList.splice(key - 1, 1)[0];//key-1=2
							phaseList.splice(key - 1 + count, 0, move);//key-1+count
							if (key - 1 + count >= phaseList.length - 1) {
								phaseList.unshift('phaseDraw');
							}
							evt.phaseList = phaseList;
							player.storage.mengxinying = phaseList;
							player.chooseToDiscard(count, 'he', true);
						}
					},
				},
			}
		},
		"mengliuying": {
			audio: 'mengmengguihechu',
			forced: true,
			mark: true,
			intro: {
				name() {
					return _status.event.player.storage.mengliuying
				},
				content(storage, player) {
					if (!player.storage.mengliuying2.length) return '已全部被移除'
					return player.storage.mengliuying2.join('、');
				}
			},
			trigger: {
				player: 'phaseEnd'
			},
			init(player) {
				player.storage.mengliuying = '五种牌名';
				player.storage.mengliuying2 = [
					'五种牌名',
					'四种花色',
					'三种类型',
					'二种颜色',
					'一张实体',
				];
			},
			filter(event) {
				return event.skill != 'mengliuying';
			},
			async content(event, trigger, player) {
				player.insertPhase('mengliuying');
				const cards = get.centralCards().slice(0), storage = player.storage.mengliuying;
				let news = '';

				if (player.storage.mengliuying2.length > 1) {
					for (let i = 0; i < player.storage.mengliuying2.length; i++) {
						if (player.storage.mengliuying2[i] == storage) {
							let key = i + 1;
							if (player.storage.mengliuying2[key]) {
								news = player.storage.mengliuying2[key];
							} else {
								news = player.storage.mengliuying2[0];
							}
							game.log(news);
						}
					};
				}

				let bool = false;
				switch (storage) {
					case '五种牌名': {
						let names = [];
						cards.map(card => {
							names.add(card.name)
						});
						if (names.length == 5) bool = true;
						break;
					}
					case '四种花色': {
						let suits = [];
						cards.map(card => {
							suits.add(get.suit(card))
						});
						if (suits.length == 4) bool = true;
						break;
					}
					case '三种类型': {
						let types = [];
						cards.map(card => {
							types.add(get.type2(card))
						});
						if (types.length == 3) bool = true;
						break;
					}
					case '二种颜色': {
						let colors = [];
						cards.map(card => {
							colors.add(get.color(card))
						});
						if (colors.length == 2) bool = true;
						break;
					}
					case '一张实体': {
						if (cards.length == 1) bool = true;
						break;
					}
					default:
						break;
				}

				if (!bool) {
					if (storage != '无选项') {
						game.log(player, '#r移除了', storage);
						player.storage.mengliuying2.remove(storage);
					}

					player.when({
						player: 'phaseBefore'
					}).filter((event, player) => {
						return event.skill != 'mengliuying';
					}).then(() => {
						trigger.cancel();
					});
				} else {
				}

				if (news) player.storage.mengliuying = news;
				else player.storage.mengliuying = '无选项'
			}

		},

		"mengshangjin_info": "熵烬|锁定技，你的阶段结束时，若你手牌数未于此阶段变化过，你视为使用【树上开花】，弃置的装备牌当火【杀】使用。",
		"mengranhuang_info": "燃煌|限定技，你可将牌堆顶牌，当【火攻】使用，期间中央区牌视为你的手牌，结算后你分配此技能。",
		"mengxinying_info": "新盈|摸牌阶段，你可以将弃牌阶段前移任意个阶段并额外摸等量张牌；若移至顶，于尾须执行一个弃牌阶段；下个弃牌阶段须反向蓝字且等量的“新盈”。",
		"mengliuying_info": "留萤|锁定技，转换技，回合结束时，你提前执行下回合，若中央区有且仅有①五种牌名②四种花色③三种类型④二种颜色⑤一张实体，改为额外回合；若不满足，删除此项。",
		"mengliuguangzhuhuo_info": "流火逐光|锁定技，主要阶段开始时，你摸一张牌并将一张牌当做【火攻】使用，若此牌未造成伤害，你失去1点体力并摸两张牌。",
		"mengranquyingshen_info": "燃躯萤身|锁定技，当你造成渠道为牌的伤害时，若之花色与本回合内其他造成过伤害的牌均不同，你回复1点体力，否则令此伤害值+1。",
		"mengmengguihechu_info": "梦归何处|锁定技，当你进入濒死状态时，回复体力值至1点并将武将牌上的首个锁定技替换为“残蚀”。",
		"mengcanshi_info": "残蚀|摸牌阶段开始时，你可以改为摸X张牌（X为已受伤的角色数），若如此做，当你于此回合内使用基本牌或锦囊牌时，你弃置一张牌。"

	},
	2408: {

		hyyz_furina: ['芙宁娜', ['female', 'hyyz_ys', 3, ['hyyzshenyi', 'hyyzmantian'], ['zhu',]], '#b踽踽独行', '芙芙秉苍生之任，安危系于一身。承百年遗志，勉为水神，丝毫无差，惧惊天理。其能策勉，苦心孤诣，然众有不明者，欲揭其伪。天怒而降罚，芙芙由神降人。百年经营，心系苍生未改。芙芙之伟，在于牺牲，愿世人皆能明其志，共筑太平。'],
		hyyzshenyi: {
			audio: 8,
			logAudio: () => false,
			trigger: {
				player: "useCard",
			},
			onremove: true,
			forced: true,
			async content(event, trigger, player) {
				let shown = [];
				player.hasHistory('lose', evt => {
					if (trigger != evt.getParent()) return false;
					if (!Object.keys(evt.gaintag_map).length) shown.add(false);
					for (var cardid in evt.gaintag_map) {
						if (evt.gaintag_map[cardid].some(tag => tag.startsWith('visible_'))) shown.add(true);
						else shown.add(false)
					}
				});
				if (shown.length == 1) {
					game.countPlayer(current => {//给每人一个技能
						current.addTempSkill("hyyzshenyi_block");
						if (!current.storage.hyyzshenyi_block) current.storage.hyyzshenyi_block = [];
						current.storage.hyyzshenyi_block.add([trigger.card, shown[0] + '']);//hyyzshenyi_block=[[card1,true],[card2,false]]
						lib.skill.hyyzshenyi.updateBlocker(current);//hyyzshenyi_blocker
					});
					//有可重铸的牌
					if (player.countCards('h', (card) => shown[0] != get.is.shownCard(card)) > 0) {
						const cards = player.countCards('h', (card) => shown[0] != get.is.shownCard(card)) == 1
							?
							player.getCards('h').filter((card) => shown[0] != get.is.shownCard(card))
							:
							(await player.chooseCard('h', true, '神仪：重铸一张异置牌', (card) => shown[0] != get.is.shownCard(card)).forResultCards());
						if (cards) {
							const cards2 = (await player.recast(cards))._result;
							if (shown[0] == true) {
								await player.addShownCards(cards2, 'visible_hyyzshenyi');//明置维持
								const index = Math.min(4, player.countCards('h', (card) => get.is.shownCard(card)))//1234
								game.hyyzSkillAudio('hyyz', 'hyyzshenyi', index)
							} else {
								await player.hideShownCards(cards2);//明置减少
								const index = 5 + Math.min(3, player.countCards('h', (card) => get.is.shownCard(card)))//0123
								game.hyyzSkillAudio('hyyz', 'hyyzshenyi', index)
							}
						}
					} else {

					}
				} else {
					//不能被响应
					trigger.directHit.addArray(game.players);
				};
			},
			updateBlocker(player) {//把牌检索的条件单独筛出来
				const list = [], storage = player.storage.hyyzshenyi_block;
				if (storage && storage.length) {
					list.addArray(storage.map(i => i[1]));
				}
				player.storage.hyyzshenyi_blocker = list;//[true,false]
			},
			subSkill: {
				block: {//被强命者的技能
					trigger: {
						player: ["damageBefore", "damageCancelled", "damageZero"],
						target: ["shaMiss", "useCardToExcluded", "useCardToEnd"],
						global: ["useCardEnd"],
					},
					forced: true,
					firstDo: true,
					popup: false,
					charlotte: true,
					onremove: ["hyyzshenyi_block", "hyyzshenyi_blocker"],
					filter(event, player) {//使用特定牌时
						if (!event.card || !player.storage.hyyzshenyi_block) return false;
						return player.getStorage("hyyzshenyi_block").some(info => info[0] === event.card);//[[card1,true],[card2,false]]
					},
					async content(event, trigger, player) {
						const storage = player.storage.hyyzshenyi_block;
						for (let i = 0; i < storage.length; i++) {//遍历【[card1, true]，[card2, false]】
							if (storage[i][0] === trigger.card) {//如果是当前的牌
								storage.splice(i--, 1);//移除这个组
							}
						}
						if (!storage.length) player.removeSkill("hyyzshenyi_block");//没有就去掉这个技能
						else if (trigger.target && get.itemtype(trigger.target) == 'player') lib.skill.hyyzshenyi.updateBlocker(trigger.target);//否则对当前目标再次更新hyyzshenyi_blocker//[true,false]
					},
					mod: {
						cardEnabled(card, player) {//能否使用
							if (!player.storage.hyyzshenyi_blocker) return;//[true,false]
							let bools = [];
							if (Array.isArray(card.cards)) {
								card.cards.forEach(card => bools.add(get.is.shownCard(card) + ''));
							} else return;
							if (bools.length > 1) return false;//有明有暗，肯定不行
							const hs = player.getCards("h"), cards = [card];
							if (Array.isArray(card.cards)) cards.addArray(card.cards);//判定card能不能用
							if (cards.containsSome(...hs) && !player.storage.hyyzshenyi_blocker.includes(bools[0] + '')) return false;
							//包含手牌（只对手牌有限制），如果没有记录（状态不同）此明置情况，不能[true, false]
						},
						cardRespondable(card, player) {
							if (!player.storage.hyyzshenyi_blocker) return;
							let bools = [];
							if (Array.isArray(card.cards)) {
								card.cards.forEach(a => bools.add(get.is.shownCard(a) + ''));
							} else return;

							const evt = _status.event;
							if (evt.name == "chooseToRespond" && bools.length > 1) return false;//有明有暗，肯定不行
							const hs = player.getCards("h"), cards = [card];
							if (Array.isArray(card.cards)) cards.addArray(card.cards);
							if (evt.name == "chooseToRespond" && cards.containsSome(...hs) && !player.storage.hyyzshenyi_blocker.includes(bools[0] + '')) return false;
						},
					},
				},
			},
			mod: {
				aiUseful(player, card, num) {
					if (get.itemtype(card) == 'card') {
						if (get.is.shownCard(card)) return num * 6.5;
						else {
							return num - 6.5;
						}
					}
				},
				aiOrder() {
					lib.skill.hyyzshenyi.mod.aiUseful.apply(this, arguments);
				},
				aiValue(player, card, num) {
					if (get.itemtype(card) == 'card' && get.is.shownCard(card)) return num * 6.5;
				},
			},
		},
		visible_hyyzshenyi: '明·芙',
		hyyzshenyi_info: '神仪|锁定技，你使用<span class="firetext">明</span>/<span class="greentext">暗</span>置牌不能被异置牌响应，然后将一张异置牌重铸为同置牌。',
		hyyzmantian: {
			audio: 5,
			logAudio(event, player) {
				const num = player.countCards('h', (card) => get.is.shownCard(card));
				return ['ext:忽悠宇宙/asset/hyyz/audio/hyyzmantian' + (num + 1)];//0123
			},
			trigger: {
				global: 'phaseEnd'
			},
			forced: true,
			filter(event, player) {
				//逆天判断写函数
				const num = player.countCards('h', card => get.is.shownCard(card)), storage = (player.storage.hyyzmantian || 0);
				if (num < storage) {//减少
					player.changeSkin({ characterName: "hyyz_furina" }, "hyyzshenyiremove");
					return true;
				} else if (num == storage) {//不变
					if (lib.config['extension_忽悠动态包_enable'] && ['identity', 'versus', 'boss', 'doudizhu', 'single', 'brawl'].includes(get.mode())) {
						player.node['avatar' + (get.nameList(player).indexOf('hyyz_furina') ? 2 : '')].setBackgroundImage('extension/忽悠动态包/image/hyyz_furina.gif');
					} else {
						player.changeSkin({ characterName: "hyyz_furina" }, "hyyz_furina");
					}
				} else if (num > storage) {//增加
					player.changeSkin({ characterName: "hyyz_furina" }, "hyyzshenyiadd");
					game.hyyzSkillAudio('hyyz', 'hyyzmantian', 5)
				}
			},
			async content(event, trigger, player) {
				const shuiyan = async function (target) {
					let list = ['take_damage'];
					if (target.countCards('e')) list.add('discard_card');
					const control = await target.chooseControl(list, function (event, player) {
						let eff = get.damageEffect(player, player, player, "thunder");
						if (eff > 0) return "take_damage";
						if (player.hasSkillTag("noe") && player.countCards('e')) return "discard_card";
						if (!eff) return "take_damage";
						if (player.isDamaged() && player.hasCard((card) => get.name(card) == "baiyin" && get.recoverEffect(player, player, _status.event.player) > 0, "e")) return "discard_card";
						if (player.hasCard((card) => get.value(card, player) <= 0, "e") && !player.hasCard((card) => get.value(card, player) > Math.max(7, 12 - player.hp), "e")) return "discard_card";
						if ((player.hp > 2 && player.countCards("e") > 2) || (player.hp > 1 && player.countCards("e") > 3)) return "take_damage";
						return list[list.length - 1];
					}).set("prompt", "水淹七军").set("prompt2", "请选择一项：⒈弃置装备区里的所有牌；⒉受到1点雷电伤害。").forResultControl();
					if (control == "discard_card") {
						target.discard(
							target.getCards("e", (card) => lib.filter.cardDiscardable(card, target, "shuiyanqijunx"))
						);
					} else {
						var next = target.damage('nosource');
						game.setNature(next, "thunder", true);
					}
				}
				let num = game.roundNumber;
				const targets = game.countPlayer(current => current != player) <= num ? game.filterPlayer(current => current != player) :
					(await player
						.chooseTarget(`令${num}名其他角色【水淹七军】`, num, lib.filter.notMe, true)
						.set('ai', (target) => -get.attitude2(target))
						.forResultTargets());
				if (targets) {
					for (let target of targets) {
						player.line(target, 'thunder');
						await shuiyan(target);
					}
				}
			},
			group: ['hyyzmantian_init', 'hyyzmantian_log'],
			subSkill: {
				init: {//
					trigger: {
						global: "phaseBefore",
						player: ["enterGame"],
					},
					forced: true,
					filter(event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0);
					},
					async content(event, trigger, player) {
						player.addShownCards(player.getCards('h'), 'visible_hyyzshenyi');
					},
				},
				log: {//回合开始重置记录
					trigger: {
						global: 'phaseBefore'
					},
					charlotte: true,
					silent: true,
					priority: -10,
					async content(event, trigger, player) {
						player.storage.hyyzmantian = player.countCards('h', card => get.is.shownCard(card));
					},
				},
			},
			mod: {
				ignoredHandcard: function (card, player) {
					if (get.is.shownCard(card)) {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (name == "phaseDiscard" && get.is.shownCard(card)) {
						return false;
					}
				},
			},
		},
		hyyzmantian_info: '瞒天|锁定技，你<span class="firetext">明</span>置初始牌且<span class="firetext">明</span>置牌不计入手牌上限；<span class="firetext">明</span>置牌减少的回合结束后，令轮次名其他角色【水淹七军】。',

		hyyz_zhongli: ['钟离', ['male', 'hyyz_ys', 4, ['hyyzfuqiang', 'hyyzwanglong'], ['zhu',]], '#b鼎铸山河', '钟离者，神而帝者也。御国以明，擅通财器，璃月因之昌盛。故，税入既足，内可安民之生，外可驱邪避患。若成主公，每轮多决机宜，日理万机，尽瘁至形神磨损。<br>钟离者，帝而神者也。神荫广被，民众无忧，渐失独立之能。然，世事变迁，上有七星夺权，下有民众自立。纵国重生，方能化龙而翔，不受羁绊，翱翔于九天之上。'],
		hyyzfuqiang: {
			audio: 9,
			global: 'hyyzfuqiang2'
		}, hyyzfuqiang2: {
			charlotte: true,
			enable: "phaseUse",
			usable: 1,
			prompt: "富强：将要重铸的牌置入弃牌堆并摸一张牌",
			filter: (event, player) => player.countCards('he') && game.hasPlayer(current => current.hasSkill('hyyzfuqiang')),
			position: "he",
			filterCard: true,
			discard: false,
			lose: false,
			delay: false,
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyz', 'hyyzfuqiang', 10, 11, 12)
				await player.recast(event.cards);
				if (event.cards.filterInD('od').length) {
					const card = event.cards[0];
					if (get.type(card) == 'equip') {
						if (player.canEquip(card, true)) {
							const bool = await game.zhu
								.chooseBool(`是否对${get.translation(player)}使用${get.translation(card)}？`)
								.set('ai', () => get.effect(player, card, player, player) > 0)
								.forResultBool();
							if (bool) {
								await game.zhu.useCard(card, player);
								game.hyyzSkillAudio('hyyz', 'hyyzfuqiang', 1, 2, 3, 4, 5, 6)
							}
						}
					}
					else {
						if (game.zhu.hasUseTarget(get.autoViewAs({ name: 'sha' }, [card]), [card])) {
							const next = game.zhu.chooseUseTarget();
							next.prompt = '是否将' + get.translation(card) + '当【杀】使用？'
							next.card = get.autoViewAs({ name: 'sha' }, [card]);
							next.cards = [card];
							next.addCount = false;
							const bool = await next.forResultBool();
							if (bool) {
								game.hyyzSkillAudio('hyyz', 'hyyzfuqiang', 7, 8, 9)
							}
						}
					}
				}
			},
			ai: {
				order: 10,
				result: {
					player(player, target, card) {
						return get.attitude(player, game.zhu)
					}
				},
			},
		},
		hyyzfuqiang2_info: "富强|",
		hyyzfuqiang_info: '富强|每名角色可于出牌阶段至多重铸一张牌。若此牌<span class="greentext">为</span>/<span class="firetext">不为</span>装备牌，主公可将此牌<span class="greentext">对该角色</span>/<span class="firetext">当【杀】</span>使用。',
		hyyzwanglong: {
			audio: 4,
			forced: true,
			trigger: {
				global: 'useCard'
			},
			filter(event, player) {
				return event.name == 'sha' && game.zhu == event.player;
			},
			async content(event, trigger, player) { },
			global: 'hyyzwanglong2',
		}, hyyzwanglong2: {
			charlotte: true,
			mod: {
				attackRange(from, num) {
					if (from == game.zhu) {
						if (game.hasPlayer(current => current.hasSkill('hyyzwanglong'))) {
							const players = game.filterPlayer(current => current.hasSkill('hyyzwanglong'));
							let num = 0;
							players.forEach(current => {
								num = Math.max(get.distance(from, current), num);
							});
							if (num > 0) return num;
						}
					}
				},
			}
		},
		hyyzwanglong_info: '望龙|锁定技，主公的攻击范围增加你至其的距离。',

		hyyz_nahida: ['纳西妲', ['female', 'hyyz_ys', '3/5', ['hyyzsanling', 'hyyzpogu'], ['zhu',]], '#b破土新芽', '本、自、我三精，各表人性之异。<br>本乃快乐之渊，唯兴是图，徒余兽性。<br>自然现实之丈，拮抗两我，律衡一体。<br>超则至善之晷，良心为规，理念为导。<br>小草居深宫，以虚空之力，察尘世众心。塑得超我非凡，遗失本我之念，而况自我，失衡则危。<br>或借他人援手，或以自身省之，寻得本性，觉醒真我。此乃纳西妲成长之路，自我救赎之旅，待三我和谐，方造新神。'],
		hyyzsanling: {
			forced: true,
			group: ['hyyzsanling_1', 'hyyzsanling_2', 'hyyzsanling_3'],
			subSkill: {
				1: {
					trigger: {
						player: ["loseAfter", "disableEquipAfter"/* , "enableEquipAfter", "expandEquipAfter" ,*/],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					filter(event, player) {
						if (event.getl && !event.getl(player) && event.name != 'equip') return false;
						return player.countCards("h") < player.countCards('e');
					},
					async content(event, trigger, player) {
						player.drawTo(player.countCards('e'));
					},
					ai: {
						noh: true,
						skillTagFilter(player, tag) {
							if (tag == "noh" && player.countCards('e') < player.countCards("h")) {
								return false;
							}
						},
					},
				},
				2: {
					trigger: {
						player: ["loseAfter", "disableEquipAfter", "enableEquipAfter", "expandEquipAfter", "loseMaxHpAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					firstDo: true,
					filter(event, player) {
						let num = 0;
						for (let i = 1; i < 6; i++) {
							num += player.countEmptySlot('equip' + i);
						}
						return player.maxHp != num;
					},
					forced: true,
					async content(event, trigger, player) {
						let num = 0;
						for (let i = 1; i < 6; i++) {
							num += player.countEmptySlot('equip' + i);
						}
						if (player.maxHp > num) {
							player.loseMaxHp(player.maxHp - num)
						} else {
							player.gainMaxHp(num - player.maxHp);
						}
					},
				},
				3: {
					mod: {
						attackRange(player, num) {
							return player.countDisabledSlot();
						},
					}
				},
			}
		},
		hyyzsanling_info: '三灵|锁定技，你的<span class="greentext">手牌下限</span>/<span class="firetext">体力上限</span>/<span class="bluetext">攻击范围</span>为<span class="greentext">满</span>/<span class="firetext">空</span>/<span class="bluetext">废</span>装备栏数。',
		hyyzpogu: {
			audio: 17,
			logAudio: () => [
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu1',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu2',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu3',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu4',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu5',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu6',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu7',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu8',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu9',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu10',
			],
			trigger: {
				global: 'useCard'
			},
			filter(event, player) {
				if (['delay', 'equip'].includes(get.type(event.card))) return false;
				return event.targets.length == 1 && event.targets[0] == player && event.player != player;
			},
			async cost(event, trigger, player) {
				let choice = [];
				if (player.hasEnabledSlot()) choice.add('废除');
				if (player.hasDisabledSlot()) choice.add('恢复');
				choice.add('cancel2');
				const control = await player.chooseControl(choice)
					.set('ai', () => {
						if (get.effect(player, trigger.card, trigger.player, player) > 0) return 'cancel2'
						return choice[choice.length - 2]
					})
					.set('prompt', '改变一个装备栏')
					.forResultControl();
				if (control == 'cancel2') return;

				let equip;
				if (control == '废除') {
					let list = [];
					for (var i = 1; i <= 5; i++) {
						if (player.hasEnabledSlot('equip' + i)) list.add('equip' + i);
					}
					list.sort();
					equip = await player.chooseControl(list, 'cancel2').set('prompt', '废除一个装备栏').forResultControl();
					event.result = {
						bool: equip != 'cancel2',
						cost_data: { func: 'disableEquip', equip: equip }
					}
				} else {
					let list = [];
					for (var i = 1; i <= 5; i++) {
						if (player.hasDisabledSlot('equip' + i)) list.add('equip' + i);
					}
					list.sort();
					equip = await player.chooseControl(list, 'cancel2').set('prompt', '恢复一个装备栏').forResultControl();
					event.result = {
						bool: equip != 'cancel2',
						cost_data: { func: 'enableEquip', equip: equip, }
					}
				}
			},
			async content(event, trigger, player) {
				player.awakenSkill("hyyzpogu");
				player.when({
					global: 'phaseAfter'
				}).then(() => {
					player.addSkill('hyyzpogu2');
				})
				trigger.targets.remove(player);
				await player[event.cost_data.func](event.cost_data.equip);
			},
			init: (player, skill) => (player.storage[skill] = false),
			limited: true,
			skillAnimation: true,
			animationColor: "water",
			mark: true,
			intro: {
				content: "limited",
			},
		}, hyyzpogu2: {
			logAudio: () => [
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu11',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu12',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu13',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu14',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu15',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu16',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzpogu17',
			],
			charlotte: true,
			enable: 'phaseUse',
			filter(event, player) {
				return player.countCards('he') >= 3;
			},
			usable: 1,
			prompt: '重置：洗牌或出牌阶段弃置三张牌，以重置蓄势技',
			filterCard: true,
			selectCard: 3,
			position: 'he',
			async content(event, trigger, player) {
				game.log(player, '的', '#g【破梏】', '重置了');
				player.removeSkill('hyyzpogu2')
				player.restoreSkill("hyyzpogu");
			},
			ai: {
				order: 10,
				result: {
					player: 1
				}
			},
			group: 'hyyzpogu2_wash',
			subSkill: {
				wash: {
					audio: 'hyyzpogu2',
					trigger: {
						global: "washCard",
					},
					locked: true,
					charlotte: true,
					async content(event, trigger, player) {
						game.log(player, '的', '#g【破梏】', '重置了');
						player.removeSkill('hyyzpogu2')
						player.restoreSkill("hyyzpogu");
					},
				}
			},
		},
		hyyzpogu2_info: '蓄势|',
		hyyzpogu_info: '破梏|蓄势技，其他角色对你使用单体即时牌时，你可调整一个装备栏的废弃状态以取消之。',

		hyyz_leidianying: ['雷电影', ['female', 'hyyz_ys', 4, ['hyyzpaoying', 'hyyzhuanshi'], ['zhu',]], '#b断目销魂', '稻妻之地，本归一瞬；影武凄厉，困于永恒。意图定世之乱象，止时之流转。然失之常伴，如昼夜更迭，春秋代序，不可抗拒。影明此理，欲以神力锁永恒于瞬息。殊不知，失之于外，得之于内，万物非止，唯心永恒。以失为鉴，以梦当先，若世间无失，何知得之可贵？珍惜当下，亦可传承不息。'],
		hyyzpaoying: {
			audio: 1,
			trigger: {
				global: "phaseBefore",
				player: ["enterGame"],
			},
			forced: true,
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				const cards = player.getCards('h'), cardsx = [];
				cards.forEach(card => cardsx.add(game.createCard2(card.name, card.suit, card.number, card.nature)));
				game.cardsGotoPile(cardsx, () => ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)]);

				let list = [
					['spade', 1, 'ying'],
					['heart', 1, 'ying'],
					['club', 1, 'ying'],
					['diamond', 1, 'ying'],
				]
				for (let i = 0; i < 4; i++) {
					cards[i].init(list[i]);
					cards[i].hyyzpaoying = list[i][0];
				}
			},
			mod: {
				maxHandcard(player, num) {
					return num //+ player.countCards('h', (card) => card.name == 'ying');
				},
				cardname(card, player, target) {
					const map = {
						'spade': 'jiu',
						'heart': 'tao',
						'club': 'sha',
						'diamond': 'shan'
					}
					if (card.hyyzpaoying) return map[card.hyyzpaoying]
				},
				attackRange(player, num) {
					return player.countCards('h', (card) => card.name == 'ying');
				},
			}
		},
		hyyzpaoying_info: '泡影|锁定技，你的初始牌为不同花色且视为不同基本牌的【影】，你的攻击范围为【影】数。',
		hyyzhuanshi: {
			audio: 12,
			logAudio: () => false,
			trigger: {
				global: ["phaseAfter", "loseAfter", "gainAfter", "chooseToUse"],
			},
			forced: true,
			filter(event, player) {
				player.updateMark('hyyzhuanshi');
				if (event.name == 'phase') {
					const lose = [], center = get.centralCards();
					player.getHistory('lose', (evt) => lose.addArray(evt.getl(player).cards));
					return lose.some(card => !center.includes(card))
				}
			},
			async content(event, trigger, player) {
				let center = get.centralCards().slice(0);
				center.reverse()
				for (const card of center) {
					if (player.hasUseTarget(card, false, false)) {
						game.hyyzSkillAudio('hyyz', 'hyyzhuanshi', 1, 2, 3, 4, 5, 6)
						await player.chooseUseTarget(card, true, false, 'nodistance');
					}
					else if (game.hasPlayer(current => current.canAddJudge(get.autoViewAs({ name: "shandian" }, [card])))) {
						const targets = await player
							.chooseTarget(true, "请选择【闪电】的目标", "将【闪电】（" + get.translation(card) + "）置于一名角色的判定区内", function (cardx, player, target) {
								return target.canAddJudge(get.autoViewAs({ name: "shandian" }, [_status.event.card]));
							})
							.set("card", card)
							.set("ai", function (target) {
								var card = get.autoViewAs({ name: "shandian" }, [_status.event.card]),
									player = _status.event.player;
								return get.attitude(player, target) + Math.max(0, get.effect(target, card, player, player));
							})
							.forResultTargets();
						if (targets) {
							game.hyyzSkillAudio('hyyz', 'hyyzhuanshi', 7, 8, 9)
							await targets[0].addJudge({ name: "shandian", storage: { hyyzhuanshi: true } }, [card]);
							targets[0].addSkill('hyyzhuanshi_buff')
						}
						return;
					}
				}
			},
		}, hyyzhuanshi_buff: {
			charlotte: true,
			direct: true,
			firstDo: true,
			trigger: {
				player: ['shandianCancelBefore', 'shandianBefore'],
				global: 'addJudgeBefore'
			},
			filter(event, player) {
				if (!event.card?.storage.hyyzhuanshi) return false;
				switch (event.name) {
					case 'shandianCancel': return true;
					case 'shandian': return event.type != 'card';
					case 'addJudge': return event.getParent().name == 'moveCard';
				}
			},
			forced: true,
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyz', 'hyyzhuanshi', 10, 11, 12)
				switch (trigger.name) {
					case 'shandianCancel': trigger.setContent(lib.skill.hyyzhuanshi_buff.cancel); break;
					case 'shandian': trigger.setContent(lib.skill.hyyzhuanshi_buff.effect); break;
					case 'addJudge': {
						trigger.cancel();
						game.log('#y雷电影', '的', trigger.card, '（', trigger.cards, '）', '不能移动')
					}
				}
			},
			cancel() {
				player.addJudge(card, cards);
			},
			effect() {
				if (result.bool == false) {
					lib.animate.skill["shandian"].call(player, "shandian");
					player.damage(3, "thunder", "nosource");
				} else {
					player.addJudge(card, cards);
				}
			},
		},
		hyyzhuanshi_info: `患失|锁定技，你失去过牌的回合结束时，若这些牌不全在中央区，你依次无距离限制使用中央区的牌直至无法使用，然后将阻碍流程的牌当不可移动的【闪电】置于一名角色场上。`,


		hyyz_liang: ['良', ['male', 'hyyz_other', 4, ['hyyzliyi', 'hyyzlangxin'], []], '#g破枭成凤', '良家世代行商，他曾想过不承父业，成为一名游历天下的侠客。1626年，天启大爆炸夺走了他的一切，他在家破人亡后便化作流民、继而沦为盗匪，做了许多恶事。'],
		hyyzliyi: {
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			filter(event, player) {
				return player.hasUseTarget({ name: 'shunshou', isCard: true }, false);
			},
			direct: true,
			async content(event, trigger, player) {
				player.when({
					player: 'gainAfter'
				}).filter((event, player) => {
					return event.getParent(3).skill == 'hyyzliyi' && event.getg(player).length;
				}).then(() => {
					player.addGaintag(trigger.getg(player), 'hyyzliyi_bg');
				});
				let next = player.chooseUseTarget({ name: 'shunshou', isCard: true }, 'nodistance');
				next.logSkill = 'hyyzliyi';
				await next;
			},
			group: ['hyyzliyi_skill'],
		},
		hyyzliyi_bg: '🐏',
		hyyzliyi_info: '逦迤|准备阶段，你可以视为使用一张无距离限制的【顺手牵羊】，然后抉择：①目标视为对你使用【杀】并修改〖狼心〗；②将获得的牌置于其他角色的场上。',
		hyyzliyi_skill: {
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				if (event.skill != 'hyyzliyi') return false;
				return player.hasHistory('gain', (evt) => {
					if (evt.getParent(3) == event) {
						if (evt.cards.length && player.countCards('h', card => evt.cards.includes(card)) > 0)
							return event.targets.length == 1;
					};
				})
			},
			direct: true,
			locked: false,
			forced: true,
			async content(event, trigger, player) {
				const cards = [];
				player.getHistory('gain', (evt) => {
					if (evt.getParent(3) == trigger) {
						cards.addArray(evt.cards);
					};
				});
				let targets = undefined;
				if (cards.length > 0 && player.countCards('h', card => cards.includes(card)) > 0) {
					targets = await player
						.chooseTarget('逦迤：将' + get.translation(cards) + '置于其他角色场上', '或点取消视为' + get.translation(trigger.target) + '对你使用【杀】并修改〖狼心〗', lib.filter.notMe)
						.set('ai', (target) => 100 + get.attitude2(target))
						.forResultTargets();
				};
				if (targets) {
					const card = cards[0], target = targets[0];
					let list = [/* '蓄谋' */];
					if (get.type(card) == 'delay' && target.canAddJudge(get.name(card))) list.add('贴判定');
					if (get.type(card) == 'equip' && target.canEquip(card, false)) list.add('装备');
					if (get.type(card) != 'equip' && [1, 2, 3, 4, 5].some(num => target.hasEmptySlot('equip' + num))) list.add('强塞装备区');
					if (!list.length) return;
					const control = await player
						.chooseControl(list)
						.set('ai', () => list.randomGet())
						.forResultControl();
					player.line(target, 'green');
					player.say(['小羊们，祝一切安好', '小羊们，再见'].randomGet())
					switch (control) {
						case '蓄谋': target.addJudge({ name: 'xumou_jsrg' }, cards); break;
						case '贴判定': target.addJudge(get.name(card), cards); break;
						default: target.equip(card); break;
					};
				} else {
					if (player.hasSkill('hyyzlangxin') && player.storage.hyyzlangxin < 3) {
						player.storage.hyyzlangxin++;
						lib.translate['hyyzlangxin'] = lib.translate['hyyzlangxin' + player.storage.hyyzlangxin];
					}
					trigger.targets[0].line(player, 'fire');
					trigger.targets[0].useCard({ name: 'sha' }, player, false);
				}
			},
		},
		hyyzlangxin: {
			init(player) {
				player.storage.hyyzlangxin = 1;
			},
			trigger: {
				global: 'useCardToTargeted',
				player: ["useCard", "respond"]
			},
			direct: true,
			filter(event, player) {
				const func = lib.skill.hyyzlangxin.lineTarget;
				if (player.storage.hyyzlangxin == 2) {
					if (!['useCard', 'respond'].includes(event.name) || !event.respondTo || event.respondTo[1].name != 'sha') return false;
					return func({ name: 'wugu' }, player, event.respondTo[0], [player]).controls.length > 1;
				} else if (player.storage.hyyzlangxin == 3) {
					if (event.name != 'useCardToTargeted' || (event.player != player && event.target != player) || event.card.name != 'sha') return false;
					return func({ name: 'zengbin' }, player, event.target, [event.target]).controls.length > 1;
				} else {
					if (event.name != 'useCardToTargeted' || event.player != player || event.card.name != 'sha') return false;
					return func({ name: 'chenghuodajie' }, player, event.target, [event.target]).controls.length > 1;
				}
			},
			/**
			 * 
			 * @param {*} card 需要检测的牌
			 * @param {*} player 你
			 * @param {*} target 目标
			 * @param {*} adds 
			 * @returns 
			 */
			lineTarget(card, player, target, adds = null) {
				let controls = [];
				let left = [], right = [], leftTemp = player, rightTemp = player;
				while (leftTemp != target && rightTemp != target) {
					leftTemp = leftTemp.getPrevious();
					rightTemp = rightTemp.getNext();
					if (leftTemp != target) left.add(leftTemp);
					if (rightTemp != target) right.add(rightTemp);
				};
				if (adds) {
					left.addArray(adds);
					right.addArray(adds);
				}
				left.sortBySeat();
				right.sortBySeat();
				if (target == leftTemp && left.some(tar => lib.filter.targetEnabled2(card, player, tar))) controls.add("↖顺时针");
				if (target == rightTemp && right.some(tar => lib.filter.targetEnabled2(card, player, tar))) controls.add("逆时针↗");
				controls.add("cancel2");
				return {
					controls: controls,
					left: left,
					right: right,
					all: left.concat(right)
				}
			},
			async content(event, trigger, player) {
				const target = ['useCard', 'respond'].includes(trigger.name) ? trigger.respondTo[0] : trigger.target;
				const target2 = ['useCard', 'respond'].includes(trigger.name) ? player : trigger.target;
				let prompt2, card, say;
				switch (player.storage.hyyzlangxin) {
					case 1:
						prompt2 = `对自己和${get.translation(target)}某个方向间的所有角色使用<span class='firetext'>①【趁火打劫】</span>，或对其中手牌最少的一名角色使用<span class='firetext'>①背水</span>的此牌`;
						card = { name: 'chenghuodajie', isCard: true };
						say = '拿钱来，否则灭口！'
						break;
					case 2:
						prompt2 = `对自己和${get.translation(target)}某个方向间的所有角色使用<span style='font-weight:bold'>②【五谷丰登】</span>，或对其中手牌最少的一名角色使用<span style='font-weight:bold'>②翻倍</span>的此牌`
						card = { name: 'wugu', isCard: true };
						say = '唉，拿着这些，去做些营生吧。'
						break;
					case 3:
						prompt2 = `对${get.translation(trigger.player)}和${get.translation(target)}某个方向间的所有角色使用<span class='greentext'>③【增兵减灶】</span>或对其中手牌最少的一名角色使用<span class='greentext'>③断拒</span>的此牌`
						card = { name: 'zengbin', isCard: true };
						say = '迎闯王！不纳粮！'
						break;
					default: prompt2 = lib.translate['hyyzlangxin_info'];
				};
				const map = lib.skill.hyyzlangxin.lineTarget(card, player, target, [target2]);

				const control = await player.chooseControl(map.controls)
					.set("prompt", get.prompt("hyyzlangxin"))
					.set("prompt2", prompt2)
					.set("ai", () => player.storage.hyyzliyi == 1 ? map.controls.randomGet() : 'cancel2')
					.set('map', map)
					.forResultControl();
				if (control == 'cancel2') return;
				let targets = map[control == '↖顺时针' ? 'left' : 'right'];

				player.say(say);
				let str = '是否改为对手牌最少的一名角色';
				switch (player.storage.hyyzlangxin) {
					case 1: str += `<span class='firetext'>①背水【趁火打劫】</span>`; break;
					case 2: str += `<span style='font-weight:bold'>②翻倍【五谷丰登】</span>`; break;
					case 3: str += `<span class='greentext'>③断拒【增兵减灶】</span>`; break;
					default: str = lib.translate['hyyzlangxin_info'];
				};
				let min = Infinity;
				targets.forEach(current => { min = Math.min(min, current.countCards('h')) });
				const targets2 = await player
					.chooseTarget(str, (card, player, target) => targets.includes(target) && target.countCards('h') == min)
					.set('ai', (target) => -get.attitude2(target))
					.forResultTargets();

				if (targets2) {
					card.storage = { hyyzlangxin: true };
					player.logSkill(event.name, targets2);
					await player.useCard(card, targets2);
				} else {
					player.logSkill(event.name, targets);
					await player.useCard(card, targets);
				}
			},
			group: ['hyyzlangxin_skill'],
		}, hyyzlangxin_skill: {
			locked: true,
			charlotte: true,
			direct: true,
			trigger: {
				player: ['chenghuodajieBegin', 'useCard1', 'zengbinBegin']
			},
			filter(event, player) {
				if (event.name == 'useCard' && event.card.name != 'wugu') return false;
				return event.card.storage.hyyzlangxin;
			},
			async content(event, trigger, player) {
				if (trigger.name == 'useCard') {
					trigger.effectCount++;
				} else {
					trigger.setContent(lib.skill.hyyzlangxin_skill[trigger.card.name + 'Content']);
				}
			},
			chenghuodajieContent() {
				"step 0";
				if (typeof event.baseDamage != "number") event.baseDamage = 1;
				if (typeof event.extraDamage != "number") event.extraDamage = 0;
				if (!target.countCards("h") || !player.isIn()) event.finish();
				else player.choosePlayerCard(target, "h", true);
				"step 1";
				if (result.bool) {
					event.show_card = result.cards[0];
					player.showCards(event.show_card);
					target.give(event.show_card, player);
					target.damage();
				} else event.finish();
			},
			zengbinContent() {
				"step 0";
				target.draw(3);
			},
		},
		hyyzlangxin1: '狼心', hyyzlangxin2: '良心', hyyzlangxin3: '粮心',
		hyyzlangxin_info: `狼心|每轮限一次，
            你<span class='firetext'>①使用</span><span style='font-weight:bold'>②响应</span><span class='greentext'>③参与</span>【杀】的结算时，
            对路径和目标中的角色使用
            <span class='firetext'>①【趁火打劫】</span>
            <span style='font-weight:bold'>②【五谷丰登】</span>
            <span class='greentext'>③【增兵减灶】</span>，
            或对其中手牌最少的一名角色使用
            <span class='firetext'>①${get.hyyzIntroduce('背水')}</span>
			<span style='font-weight:bold'>②翻倍</span>
			<span class='greentext'>③${get.hyyzIntroduce('断拒')}</span>
			的此牌`,


		meng_sp_ruanmei: ['阮·梅', ['female', 'hyyz_xt', 3, ['mengshuanghuaraobaiwei', 'mengdanqinghuiqianqiu', 'mengrouyifuwansheng'], ['die:meng_ruanmei']], '日玖阳气冲三关', ''],
		mengshuanghuaraobaiwei: {
			audio: 'mengzidian',
			init(player) {
				player.storage.mengshuanghuaraobaiwei = 1;
			},
			hiddenCard(player, name) {
				if (get.cardNameLength(name) != player.storage.mengshuanghuaraobaiwei) return false;
				if (player.countCards('he', card => get.cardNameLength(card) <= get.cardNameLength(name))) return true;
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (event.mengshuanghuaraobaiwei) return false;
				if (!player.countCards('he')) return false;
				return lib.inpile.some(name => {
					if (get.tag({ name: name }, 'damage')) return false;
					if (!event.filterCard(get.autoViewAs({ name }, "unsure"), player, event)) return false;
					if (get.type(name) != "basic" && get.type(name) != "trick") return false;
					return player.countCards('he', card => get.cardNameLength(card) <= player.storage.mengshuanghuaraobaiwei);
				})
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (let name of lib.inpile) {
						if (name == 'sha' || get.tag({ name: name }, 'damage')) continue;
						if (!event.filterCard(get.autoViewAs({ name }, 'unsure'), player, event)) continue;
						let type = get.type(name);
						if (type == "basic" || type == "trick") list.push([type, "", name]);
					};
					return ui.create.dialog('霜花扰百味', [list, 'vcard']);
				},
				check(button) {
					let val = _status.event.player.getUseValue({
						name: button.link[2],
						isCard: true
					});
					return val;
				},
				backup(links, player) {
					return {
						filterCard(card) {
							return (ui.selected.cards || [])
								.reduce((sum, card) => sum + get.cardNameLength(card), 0) + get.cardNameLength(card) <= player.storage.mengshuanghuaraobaiwei;
						},
						complexCard: true,
						selectCard: [1, Infinity],
						viewAs: {
							name: links[0][2],
							suit: "none",
							number: null,
							isCard: true,
						},
						ignoreMod: true,
						popname: true,
						filterOk() {
							return ((ui.selected.cards || [])
								.reduce((sum, card) => sum + get.cardNameLength(card), 0) == player.storage.mengshuanghuaraobaiwei);
						},
						check(card) {
							let val = (get.value(card) * get.cardNameLength(card) || 0.5);
							game.log(card, (get.value(card) || 0.5), (get.value(card) * get.cardNameLength(card) || 0.5))
							if (ui.selected.cards.length) {
								if (ui.selected.cards.reduce((sum, card) => sum + get.cardNameLength(card), 0) + get.cardNameLength(card) <= player.storage.mengshuanghuaraobaiwei) {
									return 10 / val;
								}
							}
							return 1 / val;
						},
						position: "he",
						async precontent(event, trigger, player) {
							player.logSkill("mengshuanghuaraobaiwei");
							const cards = event.result.cards;

							player.loseToDiscardpile(cards).log = false
							game.log(player, "融铸了", cards);
							player.draw();

							if (cards.reduce((sum, card) => sum + get.cardNameLength(card), 0) == player.storage.mengshuanghuaraobaiwei) {
								player.storage.mengshuanghuaraobaiwei++;
								player.when({
									global: 'roundStart'
								}).then(() => {
									player.storage.mengshuanghuaraobaiwei = 1;
								})
								event.result.card = {
									name: event.result.card.name,
									isCard: true,
								};
								event.result.cards = [];
								delete event.result.skill;
							} else {
								var evt = event.getParent();
								evt.set("mengshuanghuaraobaiwei", true);
								evt.goto(0);
								return;
							}
						},
					};
				},
				prompt(links, player) {
					return '将任意张牌名和为' + player.storage.mengshuanghuaraobaiwei + '的牌当非伤害牌使用或打出'
				}
			},
			ai: {
				freeAttack: true,
				respondSha: true,
				respondShan: true,
				save: true,
				skillTagFilter(player) {
					return player.countCards('hes');
				},
				order: 20,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return (6 - player.storage.mengshuanghuaraobaiwei) * (player.countCards('he') - 4)
					},
				},
			},
		},
		mengdanqinghuiqianqiu: {
			audio: 2,
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				let suits = [];
				get.centralCards().forEach(card => suits.add(get.suit(card)));
				event.cards.forEach(card => suits.add(get.suit(card)))
				return suits.length < 4 && game.countPlayer(current => current.countCards() != current.getHandcardLimit());
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt2('mengdanqinghuiqianqiu'), (card, player, target) => {
						return target.countCards() != target.getHandcardLimit();
					})
					.set('ai', target => {
						if (get.attitude2(target) > 0) return false;
						if (game.hasPlayer(current => {
							return get.attitude2(current) < 0 && target.getHandcardLimit() - target.countCards() == 1;
						})) return target.getHandcardLimit() - target.countCards() == 1;
						return 100 - target.hp;
					})
					.forResult();
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				let list = [];
				if (target.hp >= 1) list.add('分配体力');
				if (target.countCards('h') >= 1) list.add('分配手牌');
				if (!list.length) return;
				const control = await player
					.chooseControl(list)
					.set('prompt', '对' + get.translation(target))
					.set('ai', () => list[0])
					.forResultControl();
				if (control == '分配体力') {
					const targets2 = await player
						.chooseTarget('分配' + get.translation(target) + '的一点体力给：')
						.set('filterTarget', (card, player, target) => target != event.targets[0])
						.set('ai', target => get.attitude2(target))
						.forResultTargets();
					if (targets2) {
						const target2 = targets2[0];
						target.line(target2)
						await target.changeHp(-1);
						if (target.hp <= 0 && !event.nodying) {
							game.delayx();
							event._dyinged = true;
							target.dying(event);
						}
						//await target.loseMaxHp();
						//await target2.gainMaxHp();
						await target2.changeHp(1);
					}
				} else {
					const links = await player
						.choosePlayerCard('h', '分配' + get.translation(target) + '的一张牌', target, true)
						.forResultCards();
					if (links) {
						const targets2 = await player
							.chooseTarget('分配' + get.translation(target) + '的' + get.translation(links) + '给：')
							.set('filterTarget', (card, player, target) => target != event.targets[0])
							.set('ai', target => get.attitude2(target))
							.forResultTargets();
						if (targets2) {
							const target2 = targets2[0];
							target.line(target2);
							await target2.gain(links, target, 'give');
						}
					}
				};

				if (target.countCards('h') != target.getHandcardLimit()) {
					player.chooseToDiscard(true, 'he');
				}

			},
		},
		mengrouyifuwansheng: {
			audio: 'mengtansheng',
			trigger: {
				player: 'useCardBegin'
			},
			forced: true,
			filter(event, player) {
				return (event.card.isCard && event.cards.length == 1);
			},
			async content(event, trigger, player) {
				trigger.cancel();

				let next = player.respond();
				next.cards = trigger.cards;
				next.card = trigger.card;
				next.source = player;
			},
			group: 'mengrouyifuwansheng_1',
			subSkill: {
				1: {
					forced: true,
					trigger: {
						global: 'phaseAfter'
					},
					filter() {
						let suits = [];
						get.centralCards().forEach(card => suits.add(get.suit(card)));
						return suits.length >= 4;
					},
					async content(event, trigger, player) {
						var recover = 0, lose = 0, players = game.filterPlayer();
						for (let current of players) {
							if (current.isDamaged()) {
								if (get.attitude2(current) > 0) {
									if (current.hp < 2) {
										lose--;
										recover += 0.5;
									}
									lose--;
									recover++;
								}
							} else if (get.attitude2(current) < 0) {
								if (current.hp < 2) {
									lose++;
									recover -= 0.5;
								}
								lose++;
								recover--;
							} else {
								if (get.attitude2(current) > 0) {
									lose--;
								} else if (get.attitude2(current) < 0) {
									lose++;
								}
							}
						}
						const control = await player.chooseControl('全场失去体力', '全场回复体力').set('ai', () => {
							if (lose > recover && lose > 0) return '全场失去体力';
							if (lose < recover && recover > 0) return '全场回复体力';
							if (player.hp > 1) return '全场失去体力';
							return '全场回复体力';
						}).forResultControl();
						control == '全场失去体力' && game.countPlayer(async current => await current.loseHp())
						control == '全场回复体力' && game.countPlayer(async current => await current.recover())
					},
				}
			}
		},
		meng_xiaogong: ['宵宫', ['female', 'hyyz_ys', 4, ['mengyanshi', 'mengqingcun', 'menghuahuoyouyi'], []], '柚衣', ''],
		mengyanshi: {
			audio: 3,
			trigger: {
				player: 'phaseUseBegin'
			},
			async content(event, trigger, player) {
				await player.drawTo(player.getHandcardLimit());
				player.hyyzDianran(player.getCards('h', card => ['trick', 'basic'].includes(get.type(card))))
			},
			group: ['mengyanshi_1'],
			subSkill: {
				1: {
					trigger: {
						player: 'damageBegin'
					},
					forced: true,
					async content(event, trigger, player) {
						trigger.cancel();
						player.loseHp(trigger.num)
					},
				},
			}
		},
		mengqingcun: {
			audio: 2,
			trigger: {
				player: ['loseAfter', 'loseToDiscardpile']
			},
			filter(event, player) {
				if (!event.cards.filterInD('d').length) return false;
				return event.type == 'discard' || event.name == 'loseToDiscardpile';
			},
			direct: true,
			async content(event, trigger, player) {
				const targets = await player.chooseTarget('是否交出' + get.translation(trigger.cards.filterInD('d')) + '？', lib.filter.notMe)
					.set('ai', (target) => get.attitude2(target))
					.forResultTargets();
				if (targets) {
					player.logSkill(event.name, targets);
					targets[0].gain(trigger.cards.filterInD('d'), 'gain2');
				}
			},
			group: 'mengqingcun_lose',
			subSkill: {
				lose: {
					trigger: {
						player: 'loseHpAfter'
					},
					direct: true,
					async content(event, trigger, player) {
						const targets = await player.chooseTarget('情存：是否令一名角色摸一张牌？')
							.set('ai', (target) => get.attitude2(target))
							.forResultTargets();
						if (targets) {
							player.logSkill(event.name, targets);
							targets[0].draw();
							if (targets[0] != player && targets[0].countCards()) {
								const cards = await targets[0]
									.chooseCard([1, 2], '是否交给' + get.translation(player) + '至多两张牌')
									.set('ai', (card) => {
										return 10 - get.value(card);
									}).forResultCards();
								if (cards) {
									targets[0].give(cards, player, 'giveAuto');
								}
							}
						}
					}
				}
			},
		},
		menghuahuoyouyi: {
			audio: 1,
			trigger: {
				player: 'useCardToTargeted'
			},
			filter(event, player) {
				if (!player.getStorage('_hyyz_fireCard') && player.getStorage('_hyyz_fireCard').length) return false;
				return get.itemtype(event.cards) == "cards" &&
					event.cards.some(card => player.getStorage('_hyyz_fireCard').includes(card))
					&& event.targets.length == 1 && event.target != player;
			},
			async content(event, trigger, player) {
				const bool = await trigger.target.chooseBool('是否放弃响应？').set('ai', () => false).forResultBool();
				if (bool) {
					trigger.getParent().directHit.add(trigger.target);
					trigger.card.storage.menghuahuoyouyi = true;
				};

				const target = trigger.target;
				let controls = [];
				let left = [], right = [], leftTemp = player, rightTemp = player;
				while (leftTemp != target && rightTemp != target) {
					leftTemp = leftTemp.getPrevious();
					rightTemp = rightTemp.getNext();
					if (leftTemp != target) left.add(leftTemp);
					if (rightTemp != target) right.add(rightTemp);
				};
				left.sortBySeat();
				right.sortBySeat();
				if (target == leftTemp) controls.add("↖顺时针");
				if (target == rightTemp) controls.add("逆时针↗");

				const control = await player.chooseControl(controls)
					.set("prompt", '确定一个路径')
					.set("ai", () => controls.randomGet())
					.forResultControl();
				if (control == 'cancel2') return;
				const targets = control == '↖顺时针' ? left : right;
				targets.forEach(async current => {
					const bool = await current.chooseBool('是否点燃手牌并〖情存〗此时？').set('ai', () => current.countCards('h') <= 2);
					if (bool) {
						current.hyyzDianran('h');
						await current.addTempSkill('mengqingcun');
					}
				})
			},
			global: 'menghuahuoyouyi_a',
			subSkill: {
				a: {
					trigger: {
						player: 'damageBegin'
					},
					direct: true,
					filter(event, player) {
						return event.card && event.card.storage.menghuahuoyouyi
					},
					async content(event, trigger, player) {
						trigger.cancel();
						player.loseHp(trigger.num)
					},
				}
			}
		},
		meng_botiou: ['波提欧', ['male', 'hyyz_xt', 4, ['mengxunhai', 'menghuxing'], []], '千秋万叶', ''],
		mengxunhai: {
			audio: 4,
			forced: true,
			trigger: {
				player: ['useCard', 'useCardToPlayer']
			},
			filter(event, player) {
				if (event.name == 'useCardToPlayer') {
					return event.target.countCards() > player.countCards();
				}
				if (get.type(event.card) != 'trick' && event.card.name != 'sha') return false;
				if (event.player != player) return false;
				return event.targets.length > 1;
			},
			async content(event, trigger, player) {
				if (trigger.name == 'useCardToPlayer') {
					player.gainPlayerCard(trigger.target, 'he', true);
					return;
				}
				trigger.targets.sortBySeat();
				trigger.targets.length = 1;
			},
			mod: {
				selectTarget(card, player, range) {
					if (card.name == "sha") range[1] = 1;
				},
			},
			global: 'mengxunhai_glo',
			subSkill: {
				glo: {
					audio: 'mengxunhai',
					trigger: {
						target: ['useCardToTargeted']
					},
					forced: true,
					filter(event, player) {
						if (get.type(event.card) != 'trick' && event.card.name != 'sha') return false;
						return event.targets.length > 1 && event.player.hasSkill('mengxunhai');
					},
					async content(event, trigger, player) {
						if (trigger.getParent().triggeredTargets1) {
							trigger.getParent().triggeredTargets1.sortBySeat();
							trigger.getParent().triggeredTargets1.length = 1;
						}
						if (trigger.getParent().triggeredTargets2) {
							trigger.getParent().triggeredTargets2.sortBySeat();
							trigger.getParent().triggeredTargets2.length = 1;
						}
						if (trigger.getParent().triggeredTargets3) {
							trigger.getParent().triggeredTargets3.sortBySeat();
							trigger.getParent().triggeredTargets3.length = 1;
						}
						if (trigger.getParent().triggeredTargets4) {
							trigger.getParent().triggeredTargets4.sortBySeat();
							trigger.getParent().triggeredTargets4.length = 1;
						}
						trigger.targets.sortBySeat();
						trigger.targets.length = 1;
					},
				}
			},
		},
		menghuxing: {
			audio: 7,
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			filter(event, player) {
				return !player.hasSkill('mengjueming')
			},
			async content(event, trigger, player) {
				await player.draw(2);
				if (player.countCards('hes') < 2 || !player.hasUseTarget(get.autoViewAs({ name: 'juedou' }, 'unsure'))) return;
				const [cards, targets] = await player.chooseCardTarget({
					prompt: "将两张牌当做【决斗】使用？",
					position: "he",
					forced: true,
					filterCard(card, player) {
						var card = get.autoViewAs({ name: "juedou" }, [card]);
						return lib.filter.cardEnabled(card, player);
					},
					selectCard: 2,
					filterTarget(card, player, target) {
						var card = get.autoViewAs({ name: "juedou" }, ui.selected.cards);
						return lib.filter.targetEnabled(card, player, target);
					},
					selectTarget() {
						var card = get.autoViewAs({ name: "juedou" }, ui.selected.cards);
						return lib.filter.selectTarget(card, _status.event.player);
					},
					ai1(card) {
						return 10 - get.value(card)
					},
					ai2(target) {
						return -get.attitude2(target);
					}
				}).forResult("cards", "targets");
				if (cards && targets) {
					const target = targets[0];
					await player.addSkills('mengjueming');
					await target.addSkills('mengjueming');
					player.useCard(get.autoViewAs({ name: "juedou" }, cards), cards, targets);
					player.addTempSkill('menghuxing_change');
				}
			},
			subSkill: {
				change: {
					audio: 'menghuxing',
					trigger: {
						player: "phaseChange",
					},
					forced: true,
					filter(event, player) {
						return event.phaseList[event.num].startsWith("phaseJudge");
					},
					async content(event, trigger, player) {
						trigger.phaseList[trigger.num] = "phaseDraw|menghuxing";
					},
				}
			}
		},
		mengjueming: {
			audio: 2,
			trigger: {
				global: "die",
			},
			forced: true,
			forceDie: true,
			async content(event, trigger, player) {
				game.filterPlayer(current => {
					if (current.hasSkill('mengjueming')) current.removeSkills('mengjueming');
				})
			},
			mod: {
				playerEnabled(card, player, target) {
					if (!target.hasSkill('mengjueming') || target == player) return false;
				},
				targetInRange(card, player, target) {
					if (target.hasSkill('mengjueming') && target != player) return true;
				},
				cardUsable(card, player, num) {
					return Infinity;
				}
			}
		},
		meng_leidianyayi: ['雷电芽衣', ['female', 'qun', 5, ['menglizui', 'mengchengshi'], []], '灯姐'],
		menglizui: {
			marktext: '罪',
			intro: {
				name: '逦罪',
				name2: '罪',
				content: '拥有#枚罪'
			},
			group: ['menglizui_1', 'menglizui_2'],
			subSkill: {
				1: {
					trigger: {
						source: 'damageSource',
					},
					forced: true,
					filter(event, player) {
						return event.num > 0;
					},
					async content(event, trigger, player) {
						player.addMark('menglizui', trigger.num)
					}
				},
				2: {
					trigger: {
						player: 'phaseBegin'
					},
					filter(event, player) {
						return player.countMark('menglizui') > 0
					},
					forced: true,
					async content(event, trigger, player) {
						const { cards } = await game.cardsGotoOrdering(get.cards(player.countMark('menglizui')));
						if (_status.connectMode) game.broadcastAll(function () {
							_status.noclearcountdown = true;
						});
						event.given_map = {};
						if (!cards.length) return;
						do {
							const { result: { bool, links }, } = cards.length == 1 ? { result: { links: cards.slice(0), bool: true } } : await player.chooseCardButton("逦罪：请选择要分配的牌", true, cards, [1, cards.length]).set("ai", () => {
								if (ui.selected.buttons.length == 0) return 1;
								return 0;
							});
							if (!bool) return;
							cards.removeArray(links);
							event.togive = links.slice(0);
							const {
								result: { targets },
							} = await player
								.chooseTarget("选择一名角色获得" + get.translation(links), true)
								.set("ai", target => {
									const att = get.attitude(_status.event.player, target);
									if (_status.event.enemy) {
										return -att;
									} else if (att > 0) {
										return att / (1 + target.countCards("h"));
									} else {
										return att / 100;
									}
								})
								.set("enemy", get.value(event.togive[0], player, "raw") < 0);
							if (targets.length) {
								const id = targets[0].playerid,
									map = event.given_map;
								if (!map[id]) map[id] = [];
								map[id].addArray(event.togive);
							}
						} while (cards.length > 0);
						if (_status.connectMode) {
							game.broadcastAll(function () {
								delete _status.noclearcountdown;
								game.stopCountChoose();
							});
						}
						const list = [];
						for (const i in event.given_map) {
							const source = (_status.connectMode ? lib.playerOL : game.playerMap)[i];
							player.line(source, "green");
							if (player !== source && (get.mode() !== "identity" || player.identity !== "nei")) player.addExpose(0.2);
							list.push([source, event.given_map[i]]);
						}
						game.loseAsync({
							gain_list: list,
							giver: player,
							animate: "draw",
						}).setContent("gaincardMultiple");

						const num = player.countMark('menglizui');
						await player.loseHp(num);
						player.removeMark('menglizui', num)
						if (player.isMinHp()) {
							player.addTempSkill('menglizui_3');
						}
					},
				},
				3: {
					trigger: {
						player: ["phaseJudgeBefore", "phaseDiscardBefore"]
					},
					forced: true,
					charlotte: true,
					content() {
						trigger.cancel();
					},
				}
			},
		},
		mengchengshi: {
			limited: true,
			enable: "chooseToUse",
			filter(event, player) {
				return event.type == 'dying' && player.storage.mengchengshi == false;
			},
			filterTarget: function (card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			skillAnimation: true,
			animationColor: "thunder",
			async content(event, trigger, player) {
				await player.awakenSkill('mengchengshi');
				await player.loseMaxHp();
				await event.target.recover(2 - event.target.hp);
				player.addSkills(['mengwange']);
				player.storage.mengwange = event.target
			},
			ai: {
				order: 6,
				threaten: 1.4,
				skillTagFilter: function (player) {
					if (!_status.event.dying) return false;
				},
				save: true,
				result: {
					target: 6,
				},
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => (player.storage[skill] = false),
		},
		mengwange: {
			trigger: {
				player: 'dying',
				global: 'damageBegin'
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'dying') {
					return player.storage.mengwange && player.storage.mengwange.isIn() && event.reason && event.reason.name == 'loseHp';
				} else {
					return event.player == player || player.storage.mengwange == event.source;
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == 'dying') {
					player.recoverTo(1);
					return;
				}
				trigger.source = player;
				await game.asyncDelay()

				if (trigger.player == player) {
					const color = await player.judge(function (card) {
						if (get.color(card) == "black") return 1;
						return 0;
					}).forResult('color');
					if (color == 'black') {
						trigger.cancel();
						player.addMark('menglizui', trigger.num)
					}
				}
			},
		},
		meng_sp_zhongli: ['钟离', ['male', 'hyyz_ys', 4, ['mengyouwen', 'mengbolun'], ['die:meng_zhongli', 'zhu']], '小浣熊', ''],
		mengyouwen: {
			audio: 'menglvheng',
			init(player, skill) {
				player.storage[skill] = {};
				player.storage.mengyouwen2 = [];//
			},
			marktext: '游',
			intro: {
				content(storage, player) {
					let list = player.storage.mengyouwen2;
					let list2 = list.map(a => get.translation(a));
					return '不计入手牌上限的牌：<br>' + list2
				}
			},
			trigger: {
				player: ['useCard', 'respond']
			},
			filter(event, player) {
				return !player.storage.mengyouwen[event.card.name] || player.storage.mengyouwen[event.card.name] < 3;
			},
			forced: true,
			async content(event, trigger, player) {
				if (!player.storage.mengyouwen[trigger.card.name]) player.storage.mengyouwen[trigger.card.name] = 0;
				player.storage.mengyouwen[trigger.card.name]++;

				switch (player.storage.mengyouwen[trigger.card.name]) {
					case 1:
						await player.gainMaxHp()
						break;
					case 2:
						await player.recover();
						break;
					default:
						await player.storage.mengyouwen2.add(trigger.card.name);
						player.markSkill('mengyouwen');
						break;
				}
			},
			mod: {
				ignoredHandcard: function (card, player) {
					if (player.storage.mengyouwen2.includes(card.name)) {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (name == "phaseDiscard" && player.storage.mengyouwen2.includes(card.name)) {
						return false;
					}
				},
			},
		},
		mengbolun: {
			audio: 'menglvheng',
			init(player, skill) {
				player.storage.mengbolun = {}
			},
			global: 'mengbolun2',
			trigger: {
				global: 'phaseAfter'
			},
			direct: true,
			async content(event, trigger, player) {
				player.storage.mengbolun = {};
			},
		}, mengbolun2: {
			audio: 'mengbolun',
			enable: ["chooseToUse", "chooseToRespond"],
			hiddenCard(player, name) {
				return game.hasPlayer(current => current.getStorage('mengyouwen2').includes(name));
			},
			filter(event, player) {
				if (game.hasPlayer(current => current.hasSkill('mengbolun3'))) return false;
				if (event.mengbolun2) return false;
				let list = [];
				game.filterPlayer(current => {
					if (current.getStorage('mengyouwen2').length) list.addArray(current.getStorage('mengyouwen2'));
				});
				for (var name of list) {
					var type = get.type(name);
					if ((type == 'basic' || type == 'trick') && event.filterCard({ name: name }, player, event)) return true;
					//if (name == 'sha') {
					//    for (var nature of lib.inpile_nature) {
					//        if (event.filterCard({ name: name, nature: nature }, player, event)) return true;
					//    }
					//}
				}
				return false;
			},
			chooseButton: {
				dialog(event, player) {
					let dialog = ui.create.dialog('博论', 'hidden');
					let cards = [];
					game.filterPlayer(current => {
						if (current.getStorage('mengyouwen2').length) cards.addArray(current.getStorage('mengyouwen2'));
					});

					let list = [];
					for (const name of cards) {
						let card = { name: name, isCard: true };
						if (!event.filterCard(card, player, event)) continue;
						const type = get.type(name);
						if (type == 'basic' || type == 'trick') list.push([type, '', name]);
						//if (name == 'sha') {
						//    let natures = [];
						//    lib.nature.forEach((value, key) => natures.add(key));
						//    for (let nature of natures) {
						//        card.nature = nature;
						//        if (!event.filterCard(card, player, event)) continue;
						//        list.push(['基本', '', 'sha', nature]);
						//    }
						//}
					}
					dialog.add([list, 'vcard']);
					return dialog;
				},
				filter(button, player) {
					var evt = _status.event.getParent();
					return evt.filterCard({
						name: button.link[2],
						nature: button.link[3]
					}, player, evt);
				},
				check(button) {
					return _status.event.player.getUseValue({
						name: button.link[2],
						isCard: true,
					});
				},
				backup(links, player) {
					return {
						audio: 'mengbolun',
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							suit: 'none',
							number: null,
							isCard: true,
						},
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						async precontent(event, trigger, player) {
							player.addTempSkill('mengbolun3');
							const name = event.result.card.name;
							let players = game.filterPlayer(current => current.getStorage('mengyouwen2').includes(name));
							let bool = false;
							if (players.length) {
								for (let current of players) {
									const a = await current
										.chooseBool('是否同意' + get.translation(player) + '使用' + get.translation(name) + '？')
										.set('ai', () => _status.event.att > 0)
										.forResultBool();
									if (a) {
										current.say('准了');
										bool = true;
										await current.draw();
										const control = await current
											.chooseControl('清除' + get.translation(name) + '记录', '减1点体力上限')
											.set('ai', () => current.isDamaged ? '减1点体力上限' : '清除' + get.translation(name) + '记录')
											.forResultControl();
										if (control == '减1点体力上限') {
											await current.loseMaxHp();
										} else {
											current.storage.mengyouwen2.remove(name);
											player.syncStorage('mengyouwen2');
											if (!current.storage.mengyouwen2.length) player.unmarkSkill('mengyouwen')
										}
										break;
									} else {
										current.say('不准');
									}
								}
							}
							if (bool) {
								event.result.card = {
									name: name,
									isCard: true,
								};
								event.result.cards = [];
								delete event.result.skill;
							} else {
								var evt = event.getParent();
								evt.set("mengbolun2", true);
								evt.goto(0);
								return;
							}
						},
					}
				},
				prompt(links, player) {
					return '询问钟离，是否同意你选择' + get.translation(links[0][2]) + '的目标';
				},
			},
			ai: {
				save: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter: function (player, tag, arg) {
					let list = [];
					game.filterPlayer(current => {
						if (current.getStorage('mengyouwen2').length) list.addArray(current.getStorage('mengyouwen2'));
					});
					if (!list.length || player.hasSkill('mengbolun3')) return false;
					if (tag == "respondSha" || tag == "respondShan") {
						if (arg == "respond") return false;
						return list.includes(tag == "respondSha" ? "sha" : "shan")
					}
					return list.includes("tao") || (list.includes("jiu") && arg == player);
				},
				order: 4,
				result: {
					player: 1,
				},
				threaten: 1.9,
			},
		}, mengbolun3: {},
		meng_feixiao: ['飞霄', ['female', 'hyyz_xt', 2, ['mengyueguan', 'mengleishou'], ['zhu']], '流萤一生推', ''],
		mengyueguan: {
			audio: 2,
			marktext: '飞黄',
			intro: {
				name: '钺贯',
				name2: '飞黄',
				content: '拥有#枚“飞黄”'
			},
			usable: 1,
			trigger: {
				global: ['useCardAfter', 'respondAfter']
			},
			filter(event, player) {
				return event.player != player && player.countCards('h', card => player.hasUseTarget(card));
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseToUse(get.prompt2('mengyueguan')).forResult();
			},
			async content(event, trigger, player) {
				await player.draw();
				if (player.countMark(event.name) < 12) player.addMark(event.name, 2);
				if (player.countMark(event.name) >= 6) await player.addSkills(['mengtiantong']);
				player
					.when({
						player: 'phaseDrawBegin2'
					})
					.filter((event, player) => {
						return !event.numFixed
					})
					.then(() => {
						trigger.num++;
					})
			},
			derivation: ['mengtiantong']
		},
		mengleishou: {
			audio: 5,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengleishou1.mp3",
			],
			limited: true,
			enable: "phaseUse",
			skillAnimation: true,
			animationColor: "water",
			filter(event, player) {
				return player.countMark('mengyueguan') >= 1
			},
			async content(event, trigger, player) {
				player.awakenSkill("mengleishou");
				const num = player.countMark('mengyueguan');
				game.hyyzSkillAudio('meng', 'mengleishou', 2)
				while (player.countMark('mengyueguan') > 0) {
					const bool = await player
						.chooseUseTarget({ name: "sha", isCard: true },
							`请选择【杀】的目标（${player.countMark('mengyueguan')}/${num}）`, true, false)
						.forResultBool();
					player.removeMark('mengyueguan', 1);
					if (bool) {
						if (!player.countMark('mengyueguan')) {
							game.hyyzSkillAudio('meng', 'mengleishou', 5)
						}
						else game.hyyzSkillAudio('meng', 'mengleishou', 3, 4)
					}
					else return;
					if (player.countMark('mengyueguan') < 6) await player.removeSkills(['mengtiantong']);
				}
			},
			ai: {
				order: 1,
				result: {
					player(player, target) {
						if (game.countPlayer(current => player.canUse('sha', current, true) && get.effect(current, { name: "sha" }, player, player) > 0)) return 1;
					},
				},
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => (player.storage[skill] = false),
		},
		mengtiantong: {
			audio: 1,
			trigger: {
				player: "phaseChange",
			},
			forced: true,
			filter(event, player) {
				return event.phaseList[event.num].startsWith("phaseJieshu");
			},
			async content(event, trigger, player) {
				await player.draw(Math.floor(player.countMark('mengyueguan')));
				trigger.phaseList.splice(trigger.num + 1, 0, "phaseUse|mengtiantong");
			},
		},
		meng_sanyueqi: ['三月七', ['female', 'qun', 4, ['mengxijian', 'menghuiwu'], []], '梦海离殇'],
		mengxijian: {
			audio: 2,
			trigger: {
				global: 'damageSource'
			},
			usable: 1,
			filter(event, player) {
				if (!player.countCards()) return false;
				if (event.source == player) return false;
				return event.card && event.source.isIn() && event.source.getHistory('useCard', (evt) => {
					return evt.card == event.card && evt.targets.length == 1;
				}).length;
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseCard(`是否交给${get.translation(trigger.source)}一张牌`)
					.set('ai', (card) => get.attitude2(trigger.source) * get.value(card))
					.forResult();
			},
			logTarget: 'source',
			async content(event, trigger, player) {
				await trigger.source.gain(event.cards, player, 'give');
				await player.gain(trigger.cards.filterInD());
			},
		},
		menghuiwu: {
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.hasUseTarget('sha');
			},
			filterCard: true,
			position: "he",
			prompt() {
				return '将一张牌当杀使用';
			},
			viewAs: {
				name: 'sha',
				storage: {
					menghuiwu: true,
				}
			},
			precontent() {
				event.getParent().addCount = false;
			},
			mod: {
				cardUsable(card, player, num) {
					if (card.storage.menghuiwu) return Infinity;
				}
			},
			group: 'menghuiwu_2',
			subSkill: {
				2: {
					trigger: {
						source: 'damageSource'
					},
					filter(event, player) {
						return event.card?.storage.menghuiwu
					},
					silent: true,
					async content(event, trigger, player) {
						player.draw()
					},
				}
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
			},
		},
		meng_quancong: ['全琮', ['male', 'wu', 4, ['mengbunao', 'mengnaohao'], []], '七夕月', '取上则可得中，取下则可得中，取中则可得中。'],
		mengbunao_info: '不孬|阶段技，你可以弃置至少半数手牌并摸三张牌。',
		mengbunao: {
			audio: ['xinyaoming'],
			enable: 'phaseUse',
			usable: 1,
			async content(event, trigger, player) {
				await player.draw(3);
				if (player.countCards('h')) await player.chooseToDiscard([Math.ceil(player.countCards('h') / 2), player.countCards('h')], true);
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				}
			}
		},
		mengnaohao_info: '孬好|阶段技，你可以摸三张牌并弃置至少半数手牌。',
		mengnaohao: {
			audio: ['sbyaoming1.mp3', 'sbyaoming2.mp3', 'yaoming1.mp3', 'yaoming2.mp3'],
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return player.countCards('h');
			},
			check(card) {
				return 8 - get.value(card);
			},
			filterCard: true,
			prompt2() {
				const player = _status.event.player;
				return get.prompt('mengnaohao') + '弃置至少' + Math.ceil(player.countCards('h') / 2) + '张手牌，然后摸三张牌';
			},
			selectCard() {
				const player = _status.event.player;
				return [Math.ceil(player.countCards('h') / 2), player.countCards('h')]
			},
			async content(event, trigger, player) {
				await player.draw(3);
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				}
			}
		},
		"mengshuanghuaraobaiwei_info": "霜花扰百味|你可熔铸字数共为x的牌，视为使用一张非伤害牌（x为本轮本技能使用次数且初始为1）。",
		"mengdanqinghuiqianqiu_info": "丹青绘千秋|你使用牌后，若中央区花色未满，你可分配一名手牌不等上限的角色的一点体力或一张手牌，除非其因此手牌数等于上限，你弃置一张牌。",
		"mengrouyifuwansheng_info": "柔荑抚万生|锁定技，你使用的常规牌皆为打出。中央区包含四色的回合结束时，你奏响“琴音”。",
		"mengyanshi_info": "烟逝|你即将受到的伤害视为体力流失。出牌阶段开始时，你可以将手牌摸至上限并点燃你的即时牌。",
		"mengqingcun_info": "情存|你的牌因弃置进入弃牌堆后你可以交给其他角色。你流失1点体力后，你可以令一名角色摸一张牌，然后该角色可以至多交给你两张牌。",
		"menghuahuoyouyi_info": "花火|你使用的被点燃牌若存在唯一指向线，终点角色可放弃响应〖烟逝〗一瞬，路径上角色可点燃手牌〖情存〗此时。",
		"mengxunhai_info": "巡海|锁定技，你的多目标锦囊牌和【杀】只能指定一名角色为目标。当你使用牌指定目标时，若目标手牌数大于你，你获得其一张牌。",
		"menghuxing_info": "呼星|准备阶段，若你没有“绝命”，你可以将摸两张牌，然后将两张牌当【决斗】使用，并令【决斗】的双方获得技能“绝命”直至其中一方死亡。若如此做，你本回合判定阶段改为摸牌阶段。",
		"mengjueming_info": "绝命|锁定技，你使用牌只能指定其他拥有“绝命”的角色为目标，且对其使用牌无距离和次数限制。",
		"menglizui_info": "逦罪|锁定技，你造成伤害后，你获得等同于伤害量的“罪”标记；回合开始时，你观看牌堆顶x张牌并任意分配之，然后你移除全部“罪”标记并失去等量的体力，若此时你体力值为全场最低，你跳过本回合判定与弃牌阶段。",
		"mengchengshi_info": "承世|限定技，一名角色陷入濒死状态时，你可减一点体力上限，令其恢复体力至2，然后你获得“挽歌”。",
		"mengwange_info": "挽歌|当你因失去体力陷入濒死状态时，若“承世”角色存活，你恢复体力至1；当你受到伤害时，可进行一次判定，若结果为黑色，你防止此伤害并获得等量“罪”；“承世”角色造成伤害时，你代替其成为伤害来源。",
		"mengyouwen_info": "游闻|锁定技，你使用或打出牌后，若此牌名是你本局游戏使用或打出的:首次，回复一点体力；第二次，增加一点体力上限；其他，记录此牌名且本局游戏不计入你手牌上限。",
		"mengbolun2": "博论",
		"mengbolun_info": "博论|每回合限一次，有角色需要使用〖游闻〗中的基本或普通锦囊牌时，你可以摸一张牌并视为其使用之，然后清除此记录或减1点体力上限。",
		"mengyueguan_info": "钺贯|每回合限一次，当一名其他角色使用或打出一张牌后，你可以使用一张牌并摸一张牌，然后你获得一层“飞黄”(至多12层)并令你下一次摸牌阶段摸牌数+1。当你至少持有6层“飞黄”时，视为拥有技能“天通”。",
		"mengleishou_info": "雷狩|限定技，出牌阶段，你可以消耗一层“飞黄”并视为对一名其他角色使用一张【杀】，然后你重复上述步骤直至你失去所有“飞黄”为止。",
		"mengtiantong_info": "天通|锁定技，结束阶段，你摸x张牌并执行额外的出牌阶段(x为“飞黄”层数的一半)。",
		"mengxijian_info": "习剑|每回合限一次，一名其他角色使用单目标牌造成伤害后，你可以交给其一张牌，然后你获得造成伤害的牌。",
		"menghuiwu_info": "会武|出牌阶段限一次，你可以将一张牌当不计次数的【杀】使用。若此【杀】造成伤害，你摸一张牌。"
	},
	2409: {

		hyyzminHp: {
			init(player, skill) {
				if (player.minHp == undefined) player.minHp = 1;
				player.markSkill(skill);
			},
			mark: true,
			marktext: '💔',
			intro: {
				markcount(storage, player) {
					return `${player.minHp}/${player.hp}/${player.maxHp}`;
				},
				content(storage, player) {
					return `
					<li>体力上限：${player.maxHp}
					<li>当前体力值：${player.hp}
					<li>体力下限：${player.minHp}
					<br>
					<li>体力下限是存活状态的最小体力，默认为1；低于体力下限时濒死。
					`
				},
			},
			onremove(player, skill) {
				delete player.minHp;
				player.unmarkSkill(skill);
			},
			trigger: {
				player: ['dyingBefore', 'changeHp'],
			},
			silent: true,
			priority: -999,
			//firstDo: true,
			charlotte: true,
			filter(event, player) {
				player.updateMarks('hyyzminHp');
				if (event.name == 'dying') return player.hp >= player.minHp;
				return player.hp < player.minHp;
			},
			async content(event, trigger, player) {
				if (trigger.name == 'dying') {
					trigger.cancel();
				}
				else lib.skill.hyyzminHp.dying(player);
			},
			dyingContent() {
				"step 0";
				event.forceDie = true;
				if (player.isDying() || player.hp > player.minHp - 1) {
					event.finish();
					return;
				}
				_status.dying.unshift(player);
				game.broadcast(function (list) {
					_status.dying = list;
				}, _status.dying);
				event.trigger("dying");
				game.log(player, "濒死");
				"step 1";
				delete event.filterStop;
				if (player.hp > player.minHp - 1 || event.nodying) {
					_status.dying.remove(player);
					game.broadcast(function (list) {
						_status.dying = list;
					}, _status.dying);
					event.finish();
				} else if (!event.skipTao) {
					var next = game.createEvent("_save");
					var start = false;
					var starts = [_status.currentPhase, event.source, event.player, game.me, game.players[0]];
					for (var i = 0; i < starts.length; i++) {
						if (get.itemtype(starts[i]) == "player") {
							start = starts[i];
							break;
						}
					}
					next.player = start;
					next._trigger = event;
					next.triggername = "_save";
					next.forceDie = true;
					next.setContent(lib.skill._save.content);
				}
				"step 2";
				_status.dying.remove(player);
				game.broadcast(function (list) {
					_status.dying = list;
				}, _status.dying);
				if (player.hp <= player.minHp - 1 && !event.nodying && !player.nodying) player.die(event.reason);

			},
			dying(current, reason) {
				if (current.nodying || current.hp > current.minHp - 1 || current.isDying()) return;
				var next = game.createEvent("dying");
				next.player = current;
				next.reason = reason;
				if (reason && reason.source) next.source = reason.source;
				next.setContent(lib.skill.hyyzminHp.dyingContent);
				next.filterStop = function () {
					if (this.player.hp > this.player.minHp - 1 || this.nodying) {
						delete this.filterStop;
						return true;
					}
				};
				return next;
			},
		},
		hyyzminHp_info: '体力下限|',
		hyyz_mansui: ['满穗', ['female', 'hyyz_other', 3, ['hyyzepiao', 'hyyzcimang'], []], '#g烟花易冷', ''],
		hyyzepiao: {
			init(player) {
				player.minHp = 1;
			},
			trigger: {
				player: 'drawBegin',
			},
			forced: true,
			filter(event, player) {
				return event.num != player.minHp
			},
			async content(event, trigger, player) {
				if (player.minHp > 0) {
					trigger.num = player.minHp
				} else {
					trigger.cancel()
				}
			},
			group: 'hyyzminHp',
		},
		hyyzepiao_info: "饿殍|锁定技，你的摸牌数为体力下限。",
		hyyzcimang: {
			frequent: true,
			logx(trigger, player) {
				let targets = [];
				let i = 1;
				while (i < 100) {
					if (['game', 'arrangeTrigger', 'phaseLoop'].includes(trigger.getParent(i).name)) break;
					if (trigger.getParent(i).name) {
						if (trigger.getParent(i).player != player) targets.add(trigger.getParent(i).player)
					};
					i++;
				}
				return targets;
			},
			group: ['hyyzcimang_canqu', 'hyyzcimang_kongchao', 'hyyzcimang_fujia'],
			subSkill: {
				canqu: {
					trigger: {
						player: 'changeHp'
					},
					filter(event, player) {
						return player.hp == 1 && lib.skill.hyyzcimang.logx(event, player).length > 0;
					},
					prompt2: '刺芒：是否饕餮他的肉体？',
					logTarget: (event, player) => lib.skill.hyyzcimang.logx(event, player),
					async content(event, trigger, player) {
						for (let target of lib.skill.hyyzcimang.logx(trigger, player)) {
							await target.loseHp();
							await target.loseMaxHp();
							await player.gainMaxHp();
							await player.recover();
						}
					},
				},
				kongchao: {
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter(event, player) {
						if (player.countCards("h")) return false;
						const evt = event.getl(player);
						return evt && evt.player == player && evt.hs && evt.hs.length > 0 && lib.skill.hyyzcimang.logx(event, player).length > 0;
					},
					prompt2: '刺芒：是否夺回你的曾经？',
					logTarget: (event, player) => lib.skill.hyyzcimang.logx(event, player),
					async content(event, trigger, player) {
						const cards = trigger.getl(player).hs;
						for (let target of lib.skill.hyyzcimang.logx(trigger, player)) {
							let gains = target.getCards('he', (card) => cards.some(i => i.name == card.name));
							await player.gain(gains, target, 'give');
						}
					},
				},
				fujia: {
					trigger: {
						global: "loseAsyncAfter",
						player: 'gainAfter'
					},
					filter(event, player) {
						return event.getg && event.getg(player).length && player.isMaxHandcard() && lib.skill.hyyzcimang.logx(event, player).length > 0;
					},
					prompt2: '刺芒：是否献出你的生命？',
					logTarget: (event, player) => lib.skill.hyyzcimang.logx(event, player),
					async content(event, trigger, player) {
						for (let target of lib.skill.hyyzcimang.logx(trigger, player)) {
							if (!target.hasSkill('hyyzminHp')) target.addSkill('hyyzminHp');
							if (!player.hasSkill('hyyzminHp')) player.addSkill('hyyzminHp');

							target.minHp--;
							target.updateMarks('hyyzminHp');
							player.minHp++;
							player.updateMarks('hyyzminHp');
							if (player.hp < player.minHp) lib.skill.hyyzminHp.dying(player);
						}
					},
				},
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 2) return 0.01;
					return 2;
				},
				effect: {
					target(card, player, target) {
						if (target.hp == 2 && get.tag(card, "damage") == 1) return [0, 10, 0, -10];
						if (target.hp == 2 && get.tag(card, "damage") > 1) return [0, -10];
					},
				}
			}
		},
		hyyzcimang_info: `刺芒|你可检索令你
		<span class='firetext'>残躯</span>/<span class='bluetext'>空巢</span>/<span class='greentext'>富甲</span>
		的其他角色的
		<span class='firetext'>勾玉</span>/<span class='bluetext'>同名牌</span>/<span class='greentext'>体力下限</span>。`,

		meng_xi: ['夕', ['female', 'hyyz_other', 3, ['menglanzhanmo', 'mengzhangloudie'], []], '黄粱酒温梦', ''],
		menglanzhanmo: {
			nobracket: true,
			init(player) {
				if (!player.storage.menglanzhanmo) player.storage.menglanzhanmo = [];
			},
			trigger: {
				player: 'phaseJieshu'
			},
			filter(event, player) {
				return game.hasPlayer(current => player.canCompare(current))
			},
			direct: true,
			async content(event, trigger, player) {//一名角色某色拼点牌在所有角色同色和异色均居多
				const map = new Map();
				let count = 1;
				while (count <= 3 && game.hasPlayer(current => player.canCompare(current))) {
					const targets = await player
						.chooseTarget((card, player, target) => player.canCompare(target))
						.set('prompt', `澜绽墨：与一名角色拼点${count + '/' + 3}`)
						.set('prompt2', `黑色拼点牌居多者视为使用一张任意即时牌并失去1点体力，红色居多者回复1点体力`)
						.set("ai", function (target) {
							var player = _status.event.player;
							if (get.attitude(player, target) < 0) {
								return !player.storage.menglanzhanmo.includes(target) || player.countCards('h') > 1;
							}
							return 0;
						})
						.forResultTargets();
					if (!targets) break;
					count++;
					const target = targets[0];
					player.logSkill('menglanzhanmo', target)
					const [card1, card2] = await player.chooseToCompare(target).forResult('player', 'target');
					//给每名角色的黑++红++
					if (card1) {
						if (!map.has(player)) map.set(player, { red: 0, black: 0, none: 0 })
						if (['red', 'black'].includes(get.color(card1))) {
							let temp = map.get(player);
							temp[get.color(card1)]++;
							map.set(player, temp)
						}
					}
					if (card2) {
						if (!map.has(target)) map.set(target, { red: 0, black: 0, none: 0 })
						if (['red', 'black'].includes(get.color(card2))) {
							let temp = map.get(target);
							temp[get.color(card2)]++;
							map.set(target, temp)
						}
					}
				};
				console.log(map);
				//先找最大的数字
				let num = 0, obj = { red: [], black: [] }
				map.forEach((color_num, current) => {
					for (const color in color_num) {
						if (color_num[color] > num) {
							num = color_num[color];
							if (color == 'red') {
								obj = { red: [current], black: [], }
							}
							else {
								obj = { red: [], black: [current], }
							}
						} else if (color_num[color] == num) {
							if (color == 'red') {
								obj.red.add(current)
							} else {
								obj.black.add(current)
							}
						}
					}
				})
				console.log(num, obj);
				for (let color in obj) {
					if (color == 'red') {
						for (let target of obj.red) {
							await target.recover()
						}
					} else if (color == 'black') {
						for (let target of obj.black) {
							var list = [];
							for (let name of lib.inpile) {
								let type = get.type(name);
								if (type == "trick" || type == "basic") {
									if (target.hasUseTarget({ name: name, isCard: true, }, true, false)) {
										list.add([get.translation(type), "", name]);
									}
								}
								if (name == "sha") {
									for (var nature of lib.inpile_nature) list.add([type, "", name, nature]);
								}
							}
							if (list.length) {
								const links = await target
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
									.set('target', target)
									.forResultLinks();
								if (links) {
									target.chooseUseTarget(true, {
										name: links[0][2],
										nature: links[0][3],
										isCard: true,
									});
								}
							}
							await target.loseHp();
						}
					}
				}
			},
		},
		mengzhangloudie: {
			nobracket: true,
			init(player) {
				player.storage.mengzhangloudie = 3;
			},
			mark: true,
			marktext: '嶂',
			intro: {
				name: '嶂楼叠',
				content: '此技剩余发动次数为#'
			},
			skillAnimation: true,
			animationColor: "water",
			trigger: {
				global: "chooseToCompareBefore",
			},
			filter(event, player) {
				if (player.storage.mengzhangloudie <= 0) return false;
				return !event.mengzhangloudie;
			},
			async cost(event, trigger, player) {
				const control = await player
					.chooseControl('摸两张牌', '弃两张牌', 'cancel2')
					.set('prompt', '嶂楼叠：是否令此次拼点的胜者弃或摸两张牌？')
					.set('ai', () => true)
					.forResultControl();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: control,
						}
					};
				}
			},
			async content(event, trigger, player) {
				player.storage.mengzhangloudie--;
				player.syncStorage('mengzhangloudie');
				trigger.mengzhangloudie = event.cost_data.control;
			},
			group: 'mengzhangloudie_after',
			subSkill: {
				after: {
					trigger: {
						global: ["chooseToCompareAfter", "compareMultipleAfter"]
					},
					forced: true,
					filter(event, player) {
						if (event.preserve) return false;
						return event.mengzhangloudie;
					},
					logTarget(event) {
						if (event.result.winner && event.result.winner.isIn()) return event.result.winner;
						return '';
					},
					async content(event, trigger, player) {
						const target = trigger.result.winner;
						if (get.itemtype(target) != 'player') return;
						if (trigger.mengzhangloudie == '摸两张牌') {
							target.draw(2);
						} else if (target.countCards('he') > 0) {
							target.chooseToDiscard('he', true, 2);
						};

						if (get.color(trigger.card1) == 'black' && get.color(trigger.card2) == 'black') {
							let cards = [trigger.card1, trigger.card2].filterInD("od");
							const control = cards.length == 1 ? '获得' + get.translation(cards) : (await player.chooseControl('获得' + get.translation(cards), '此技发动次数+1').forResultControl())
							if (control == '此技发动次数+1') {
								player.storage.mengzhangloudie++;
								player.syncStorage('mengzhangloudie');
							} else {
								await player.gain(cards, 'gian2');
							}
						}

						if (player.storage.mengzhangloudie <= 0) {
							player.awakenSkill('mengzhangloudie');
						}
					},
				}
			},
		},
		meng_chunjinaiyafala: ['纯烬艾雅法拉', ['female', 'hyyz_other', 3, ['menghuoshan', 'mengyunshuang', 'mengwushen'], []], '昨夜流萤', ''],
		menghuoshan: {
			nobracket: true,
			dutySkill: true,
			locked: false,
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			filter(event, player) {
				return !game.hasPlayer(current => current.hasJudge("huoshan"));
			},
			async content(event, trigger, player) {
				const card = game.createCard('huoshan');
				player.addJudge(card, [card]);
			},
			group: ["menghuoshan_fail"],
			subSkill: {
				fail: {
					trigger: {
						global: "die",
					},
					forced: true,
					filter(event, player) {
						return get.natureList(event.reason).includes('fire');
					},
					async content(event, trigger, player) {
						game.log(player, "使命失败");
						player.awakenSkill("menghuoshan");
					},
				},
			},
		},
		mengyunshuang: {
			nobracket: true,
			init(player, skill) {
				player.storage[skill] = [];
			},
			trigger: {
				global: 'damageBegin4'
			},
			filter(event, player) {
				if (player.storage.mengyunshuang.includes(event.player)) return false;
				return get.natureList(event).length > 0 && event.num > 0;
			},
			logTarget: 'player',
			prompt2(event, player) {
				return '防止此伤害，令' + get.translation(event.player) + '执行' + ['分配牌堆顶的一张牌', '摸两张牌', '加1点体力上限'][event.num - 1];
			},
			check(event, player) {
				return get.attitude2(event.player) > 0;
			},
			async content(event, trigger, player) {
				player.storage.mengyunshuang.add(trigger.player);
				player.when('roundStart').then(() => (player.storage.mengyunshuang = []));
				const num = trigger.num - 0;
				trigger.cancel();
				await game.asyncDelayx();
				const index = [
					async function (player) {
						const cards = get.cards();
						const targets = await player
							.chooseTarget('将' + get.translation(cards) + '交给...')
							.set('ai', (target) => get.attitude(player, target) > 0)
							.forResultTargets()
						if (targets) {
							await targets[0].gain(cards, 'gain2');
						};
					},
					async function (player) {
						await player.draw(2);
					},
					async function (player) {
						await player.gainMaxHp();
					},
				], map = ['分配牌堆顶的一张牌', '摸两张牌', '加1点体力上限']
				await index[num - 1](trigger.player);
				if (![1, 2, 3].includes(num) || trigger.player.hp == player.hp) return;
				let str2 = trigger.player.hp > player.hp ? '失去1点体力' : '回复1点体力';
				const bool = await trigger.player.chooseBool(`是否${str2}以令${get.translation(player)}执行${map[num - 1]}`);
				if (bool) {
					await trigger.player[trigger.player.hp > player.hp ? 'loseHp' : 'recover']();
					await index[num - 1](player);
				}
			},
		},
		mengwushen: {
			nobracket: true,
			enable: "phaseUse",
			viewAs: {
				name: "taoyuan",
				storage: {
					mengwushen: 0,
				}
			},
			usable: 1,
			selectCard: 0,
			delay: 0,
			group: ['mengwushen_recover', 'mengwushen_draw'],
			subSkill: {
				recover: {
					trigger: {
						global: 'recoverAfter'
					},
					silent: true,
					filter(event, player) {
						return event.getParent().skill == 'mengwushen' && !event.player.isDamaged()
					},
					async content(event, trigger, player) {
						trigger.getParent().card.storage.mengwushen++;
					},
				},
				draw: {
					trigger: {
						player: "useCardAfter",
					},
					silent: true,
					filter(event) {
						return event.skill == "mengwushen" && event.card.storage.mengwushen > 0;
					},
					async content(event, trigger, player) {
						await player.draw(trigger.card.storage.mengwushen);
						trigger.card.storage.mengwushen = 0;
					},
					forced: true,
					popup: false,
				},
			}
		},
		meng_sb_fuxuan: ['符玄', ['female', 'hyyz_xt', 3, ['mengxingzhou', 'mengdengkan'], ['die:meng_fuxuan']], '三秋'],
		mengxingzhou: {
			nobracket: true,
			audio: 'mengqiongguan',
			trigger: {
				global: 'roundStart'
			},
			frequent: true,
			async content(event, trigger, player) {
				if (!player.hasSkill('mengxingzhou_buff')) player.removeSkill('mengxingzhou_buff');
				const moved = await player.chooseToGuanxing(3).forResult('moved');
				if (moved?.[1].length > 0) {
					player.addSkill('mengxingzhou_buff');
					player.storage.mengxingzhou_buff = moved[1].length;
					player.storage.mengxingzhou_buff2 = moved[1].length;
				}
			},
			subSkill: {
				buff: {
					charlotte: true,
					silent: true,
					mark: true,
					marktext: '星舟',
					intro: {
						content(storage, player) {
							return `本轮再使用${storage - player.getRoundHistory('useCard', (evt) => evt.card).length}/${storage}张牌后，${_status.currentPhase == player ? '你' : get.translation(_status.currentPhase)}使用【洞烛先机】`;
						}
					},
					trigger: {
						player: 'useCardAfter'
					},
					filter(event, player) {
						return player.getRoundHistory('useCard', (evt) => evt.card).length == player.storage.mengxingzhou_buff
					},
					async content(event, trigger, player) {
						player.removeSkill(event.name);
						if (_status.currentPhase.hasUseTarget('dongzhuxianji')) {
							_status.currentPhase.chooseUseTarget({ name: 'dongzhuxianji', isCard: true }, true);
						}
					},
				}
			}
		},
		mengdengkan: {
			audio: 'mengjianzhi',
			nobracket: true,
			round: 1,
			enable: "chooseToUse",
			viewAs: {
				name: "wuxie",
				suit: "none",
				number: null,
				isCard: true,
			},
			filterCard: false,
			selectCard: -1,
			popname: true,
			ignoreMod: true,
			async precontent(event, trigger, player) {
				player.logSkill("mengdengkan");
				delete event.result.skill;
				const cards = await player.chooseToDiscard('选择摸两张牌或弃置两张牌', 2, 'he').forResultCards()
				if (!cards) await player.draw(2);
				event.card = { name: 'wuxie', isCard: true };
				event.result.card = {
					name: 'wuxie',
					storage: {
						mengdengkan: true,
					},
					isCard: true,
				};
				event.result.cards = [];
				player.when({
					player: 'useCardAfter'
				}).filter((event, player) => {
					return event.card.storage?.mengdengkan;
				}).then(() => {
					if (player.isMaxHandcard()) {
						let num = game.findPlayer(current => current.isMinHandcard()).countCards('h');
						if (num < player.countCards('h')) player.chooseToDiscard(true, player.countCards('h') - num);
					}
					if (player.isMinHandcard()) {
						let num = game.findPlayer(current => current.isMaxHandcard()).countCards('h');
						if (num > player.countCards('h')) player.drawTo(num);
					}
				})
			},
		},
		meng_fukaluosi: ['芙卡洛斯', ['female', 'hyyz_ys', '3/6', ['mengxuanzhong1', 'mengxuanzhong2'], ['zhu']], '冷若寒', ''],
		mengxuanzhong1: {
			group: ['mengxuanzhong1_respond', 'mengxuanzhong1_use'],
			mark: true,
			zhuanhuanji: true,
			marktext: "☯",
			intro: {
				content(storage, player, skill) {
					if (storage) return '你可以将一张手牌当作明置状态不同的手牌使用。'
					return '当你需要响应牌时，你可以明置一张手牌视为响应之。'
				},
			},
			subSkill: {
				respond: {
					trigger: {
						player: ["chooseToRespondBegin", "chooseToUseBegin"],
					},
					filter(event, player) {
						if (player.storage.mengxuanzhong1 == true) return false;
						if (event.responded || event.mengxuanzhong1 || !player.countCards('h', (card) => !get.is.shownCard(card))) return false;
						if (event.getParent().name != '_wuxie' && !(event.getParent(2) && event.getParent(2).name == "useCard")) return false;
						return event.respondTo && event.filterCard && lib.inpile.some(name => event.filterCard({ name: name }, player, event));
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseCard('明置一张牌，视为响应' + get.translation(trigger.respondTo[1]), 'h', (card) => !get.is.shownCard(card))
							.forResult();
					},
					async content(event, trigger, player) {
						player.changeZhuanhuanji('mengxuanzhong1')
						trigger.mengxuanzhong1 = true;
						const cards = event.cards;
						player.addShownCards(cards, 'visible_mengxuanzhong1');

						for (let name of lib.inpile) {
							if (trigger.filterCard({ name: name }, player, trigger)) {
								trigger.untrigger();
								trigger.set("responded", true);
								trigger.result = { bool: true, card: { name: name, isCard: true } };
								break;
							}
						}
					},
					hiddenCard(player, name) {
						if (player.storage.mengxuanzhong1 == true) return false;
						if (lib.inpile.includes(name) && player.countCards('h', (card) => !get.is.shownCard(card))) return true;
					},
				},
				use: {
					enable: ["chooseToUse", "chooseToRespond"],
					filter(event, player) {
						if (player.storage.mengxuanzhong1 != true) return false;
						const shown = player.getCards('h', (card) => get.is.shownCard(card)),
							hidden = player.getCards('h', (card) => !get.is.shownCard(card));
						if (!shown.length || !hidden.length) return false;

						return shown.some(card => event.filterCard({ name: card.name }, player, event)) ||
							hidden.some(card => event.filterCard({ name: card.name }, player, event));
					},
					chooseButton: {
						dialog(event, player) {
							let list = [];
							for (let card of player.getCards('h')) {
								if (!event.filterCard({ name: card.name }, player, event)) continue;
								if (card.name == 'sha') {
									if (get.natureList(card).length) {
										const nature = get.natureList(card).join(lib.natureSeparator)
										if (!list.some(arr => arr[2] == 'sha' && arr[3] == nature)) list.push(["基本", "", "sha", nature]);
									}
									else if (!list.some(arr => arr[2] == 'sha' && arr[3] == undefined)) list.push(["基本", "", "sha"]);
								}
								if (list.some(arr => arr[2] == card.name)) continue;
								if (get.type2(card) == "basic") list.push(["基本", "", card.name]);
								if (get.type2(card) == "trick") list.push(["锦囊", "", card.name]);
								if (get.type2(card) == "equip") list.push(["装备", "", card.name]);
							}
							list = [...new Set(list)];
							return ui.create.dialog("旋踵", [list, "vcard"]);
						},
						check(button) {
							if (_status.event.getParent().type != "phase") return 1;
							var player = _status.event.player;
							if (["wugu", "zhulu_card", "yiyi", "lulitongxin", "lianjunshengyan", "diaohulishan"].includes(button.link[2])) return 0;
							return player.getUseValue({
								name: button.link[2],
								nature: button.link[3],
							});
						},
						backup(links, player) {
							return {
								audio: "mengxuanzhong1",
								filterCard(card, player) {
									if (get.is.shownCard(card)) {//选择的牌为明牌
										//暗牌里存在与表面牌相同的
										const cards = player.getCards('h', (card) => !get.is.shownCard(card));
										return cards.some(card => {
											if (card.name != links[0][2]) return false;
											return !links[0][3] || links[0][3] == get.natureList(card).join(lib.natureSeparator);
										})
									} else {
										const cards = player.getCards('h', (card) => get.is.shownCard(card));
										return cards.some(card => {
											if (card.name != links[0][2]) return false;
											return !links[0][3] || links[0][3] == get.natureList(card).join(lib.natureSeparator);
										})
									}
								},
								popname: true,
								check(card) {
									return 8 - get.value(card);
								},
								viewAs: { name: links[0][2], nature: links[0][3] },
								async precontent(event, trigger, player) {
									player.changeZhuanhuanji('mengxuanzhong1')
								},
							};
						},
						prompt(links, player) {
							return "将一张牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
						},
					},
					hiddenCard(player, name) {
						if (player.storage.mengxuanzhong1 != true) return false;
						const shown = player.getCards('h', (card) => get.is.shownCard(card)),
							hidden = player.getCards('h', (card) => !get.is.shownCard(card));
						if (!shown.length || !hidden.length) return false;
						return player.countCards('h', (card) => card.name == name);
					},
					ai: {
						fireAttack: true,
						respondSha: true,
						respondShan: true,
						skillTagFilter(player) {
							const shown = player.getCards('h', (card) => get.is.shownCard(card)),
								hidden = player.getCards('h', (card) => !get.is.shownCard(card));
							if (!shown.length || !hidden.length) return false;
						},
						order: 1,
						result: {
							player(player) {
								if (_status.event.dying) return get.attitude(player, _status.event.dying);
								return 1;
							},
						},
					},
				}
			},
		},
		mengxuanzhong2: {
			intro: {
				markcount: "expansion",
				mark: function (dialog, storage, player) {
					var cards = player.getExpansions("mengxuanzhong2");
					if (player.isUnderControl(true)) dialog.addAuto(cards);
					else return "共有" + get.cnNumber(cards.length) + "张牌";
				},
			},
			trigger: {
				player: ["respond", "useCard"],
			},
			filter(event, player) {
				if (!event.respondTo) return false;
				if (event.respondTo[1]) {
					var cards = [];
					if (get.itemtype(event.respondTo[1]) == "card") cards.push(event.respondTo[1]);
					else if (event.respondTo[1].cards) cards.addArray(event.respondTo[1].cards);
					return cards.filterInD("od").length > 0;
				}
			},
			forced: true,
			async content(event, trigger, player) {
				var cards = [];
				if (get.itemtype(trigger.respondTo[1]) == "card") cards.push(trigger.respondTo[1]);
				else if (trigger.respondTo[1].cards) cards.addArray(trigger.respondTo[1].cards);
				cards = cards.filterInD("od");

				await player.addToExpansion(cards, "gain2", player).gaintag.add("mengxuanzhong2");
				if (player.getExpansions('mengxuanzhong2').length + 1 > ui.cardPile.childElementCount) {
					let count = player.getExpansions('mengxuanzhong2').length;
					await player.gain(player.getExpansions('mengxuanzhong2'), 'gain2');
					while (count) {
						count--;
						await player.executeDelayCardEffect('shandian');
					};

					if (player.isAlive()) {
						player.useCard({ name: 'shuiyanqijunx', isCard: true }, game.filterPlayer(current => player.canUse({ name: 'shuiyanqijunx', isCard: true }, current, false)))
					}
				}
			},
			group: 'mengxuanzhong2_effect',
		}, mengxuanzhong2_effect: {
			trigger: {
				player: "shuiyanqijunxBegin",
			},
			forced: true,
			popup: false,
			charlotte: true,
			filter(event, player) {
				return event.skill == "jianjie_huoji";
			},
			async content(event, trigger, player) {
				trigger.setContent(() => {
					target.discard(
						target.getCards("e", function (card) {
							return lib.filter.cardDiscardable(card, target, "shuiyanqijunx");
						})
					);
					target.damage("thunder");
				});
			},
		},
		"menglanzhanmo_info": "澜绽墨|结束阶段，你可依次拼点至多三次。若一名角色使用的一种颜色的拼点牌在所有角色的同色和异色拼点牌中均居多，若这种颜色为黑色，其视为使用一张任意即时牌并失去1点体力；红色：其回复1点体力。",
		"mengzhangloudie_info": "嶂楼叠|限定技·3，你可为一次拼点增加奖惩：胜者弃或摸两张牌。若双方拼点牌均为黑色，你令此技能发动次数+1，或获得双方拼点牌。",
		"menghuoshan_info": "火山实地考察|使命技，准备阶段，若场上没有【火山】，你从游戏外将之置入判定区。失败：一名角色因火焰伤害死亡。",
		"mengyunshuang_info": "云霜荫佑|每轮每名角色限一次，当一名角色受到属性伤害时，你可以防止之，令其执行第此伤害值项：1.观看牌堆顶的牌并可以分配之；2.摸两张牌；3.增加1点体力上限。然后其可以将体力值向你调整1以令你也一同执行此项。",
		"mengwushen_info": "无声润物|出牌阶段限一次，你可以视为使用一张【桃园结义】，然后摸×张牌。（X为因此回复体力至上限的角色数）",
		"mengxingzhou_info": "星舟占算|轮次开始时，你可以卜算3；若如此做，本轮内你使用第×张牌结算后；当前回合角色视为使用【洞烛先机】（×为你因此置于牌堆底牌的数量）。",
		"mengdengkan_info": "登瞰穷极|每轮限一次，你可以摸两张牌或弃置两张牌，视为使用【无懈可击】；然后若你的手牌数为场上最值，你将之调整为另一最值。",
		"visible_mengxuanzhong1": "明",
		"mengxuanzhong1_info": "旋踵|转换技，阳：当你需要响应牌时，你可以明置一张手牌视为响应之。阴：你可以将一张手牌当作明置状态不同的手牌使用。",
		"mengxuanzhong2_info": "悬冢|锁定技，你响应过的牌均置于武将牌上，高于牌堆时获得之并执行等量次【闪电】判定。然后，你视为对所有其他角色使用一张背水【水淹七军】。"
	},
	2410: {
		hyyz_luanpo: ['乱破', ['female', 'hyyz_xt', 4, ['hyyzmeiran', 'hyyzzhunian'], []], '#b夜露死苦，银河忍法千变万化，来世还请多加小心！'],//
		hyyzmeiran: { audio: 2, global: 'hyyzmeiran_buff' }, hyyzmeiran_buff: {
			sourceSkill: "hyyzmeiran",
			charlotte: true,
			trigger: {
				player: ['gainBefore', 'gainAfter']
			},
			filter(event, player, triggername) {
				if (triggername == 'gainBefore') {
					let cards = event.cards;
					for (let card of cards) {
						if (card.name == get.name(card)) continue;
						const owner = get.owner(card)
						if (!owner?.isIn() || owner == player) continue;
						return player.hasSkill('hyyzmeiran') || owner.hasSkill('hyyzmeiran');
					};
				} else {
					const cards = event.getg(player);
					if (event.hyyzmeiran_name) return true;
					return game.hasPlayer(current => {
						if (current == player) return false;
						if (!current.hasSkill('hyyzmeiran') && !player.hasSkill('hyyzmeiran')) return false;
						let evt = event.getl(current);
						return evt?.cards2?.some(card => cards.includes(card));
					})
				}
			},
			silent: true,
			async content(event, trigger, player) {
				if (event.triggername == 'gainBefore') {
					trigger.hyyzmeiran_name = {};
					const cards = trigger.cards.filter(card => {
						if (card.name == get.name(card)) return false;
						const owner = get.owner(card)
						if (!owner?.isIn() || owner == player) return false;
						return player.hasSkill('hyyzmeiran') || owner.hasSkill('hyyzmeiran');
					});
					trigger.hyyzmeiran_name = get.name(cards[0])
				} else {
					const hyyz_luanpo = game.findPlayer(current => current.hasSkill('hyyzmeiran'));
					if (hyyz_luanpo) hyyz_luanpo.logSkill('hyyzmeiran', player);
					let name = undefined, cards = [];
					if (trigger.hyyzmeiran_name) {
						name = trigger.hyyzmeiran_name, cards = trigger.getg(trigger.player);
					} else {
						let list = [['锦囊', '', 'wuxie'], ['锦囊', '', 'wuzhong'], ['锦囊', '', 'guohe']];
						if (list) {
							const links = await hyyz_luanpo
								.chooseButton(true, [`令${get.translation(trigger.player)}的${get.translation(trigger.getg(trigger.player))}视为`, [list, "vcard"]])
								.set('ai', (button) => {
									const att = _status.event.att, event = _status.event.getTrigger();
									const card = { name: button.link[2] };
									return att * (event.player.getUseValue(card) || get.value(card));
								})
								.set('att', get.attitude(hyyz_luanpo, player))
								.forResultLinks();
							if (links) {
								name = links[0][2], cards = trigger.getg(trigger.player);
							}
						}
					}
					lib.translate['hyyzmeiran_' + name] = lib.translate['hyyzmeiran'];
					game.log(player, '的', cards, '视为', `#y【${get.translation(name)}】`);
					player.addGaintag(cards, 'hyyzmeiran_' + name);
					await game.delayx();
					if (!(Math.min(trigger.player.countCards("he"), trigger.player.hp) >= 1)) return;
					const { result: { bool, links } } = await hyyz_luanpo
						.choosePlayerCard(trigger.player, "he", true, [1, Math.min(trigger.player.countCards("he"), trigger.player.hp)], `破军：将${get.translation(trigger.player)}至多${trigger.player.hp}张牌本回合置于武将牌旁`);
					if (bool && links.length) {
						trigger.player.addToExpansion(links, "giveAuto", trigger.player).gaintag.add("hyyzmeiran_pojun");
						trigger.player.addSkill("hyyzmeiran_pojun");
					}
				}
			},
			mod: {
				cardname(card, player) {
					if (card.gaintag?.some(tag => tag.startsWith('hyyzmeiran_') && tag.length > 11)) {
						return card.gaintag.find(tag => tag.startsWith('hyyzmeiran_')).slice(11);
					}
				}
			}
		}, hyyzmeiran_pojun: {
			trigger: {
				global: ["phaseEnd"]
			},
			forced: true,
			popup: false,
			charlotte: true,
			sourceSkill: "hyyzmeiran",
			filter(event, player) {
				return player.getExpansions("hyyzmeiran_pojun").length > 0;
			},
			async content(event, trigger, player) {
				const cards = player.getExpansions("hyyzmeiran_pojun");
				await player.gain(cards, "draw");
				game.log(player, "收回了" + get.cnNumber(cards.length) + "张“破军”牌");
				player.removeSkill("hyyzmeiran_pojun");
			},
			intro: {
				name: '媒染·破军',
				markcount: "expansion",
				mark(dialog, storage, player) {
					var cards = player.getExpansions("hyyzmeiran_pojun");
					if (player.isUnderControl(true)) dialog.addAuto(cards);
					else return "共有" + get.cnNumber(cards.length) + "张牌";
				},
			},
		},
		hyyzmeiran_info: `媒染|锁定技，你或其他角色获得对方的牌后，若此牌此前为转化牌，则其保留转化效果；否则，此牌视为你声明的智囊牌。然后你〖破军〗该角色。`,
		hyyzmeiran_pojun_info: '破军|',
		hyyzzhunian: {
			audio: 3,
			trigger: {
				global: 'drawBefore',
			},
			usable: 1,
			isZhu(target) {
				switch (get.mode()) {
					case "identity": return target.isZhu;
					case "guozhan": return get.is.jun(target);
					case "versus": return target.identity == "zhu";
					case "doudizhu": return target == game.zhu;
				}
				return false;
			},
			filter(event, player) {
				if (event.num < 1) return false;
				if (event.player == player) return game.hasPlayer(current => lib.skill.hyyzzhunian.isZhu(current));
				if (lib.skill.hyyzzhunian.isZhu(event.player)) return true;
			},
			forced: true,
			async content(event, trigger, player) {
				const source = trigger.player == player ? game.findPlayer(current => lib.skill.hyyzzhunian.isZhu(current)) : player;
				game.log(trigger.player, '的', '#y⟦摸牌⟧', '视为', '#y⟦获得', source, '#y的手牌⟧');
				const cards = get.cards(trigger.num);
				const next = game.createEvent('gain');
				next.player = trigger.player;
				next.source = source;
				next.cards = cards;
				next.log = false
				next.fromStorage = false
				next.fromRenku = false
				next.bySelf = false
				next.animate = 'giveAuto'
				next.delay = false
				next.setContent("gain");
				next.getd = function (player, key, position) {
					return [];
				}
				next.getl = function (player) {
					if (player.getSeatNum() == 1 || player.hasSkill('hyyzzhunian')) {
						return {
							player: player,
							hs: cards.slice(0),
							es: [],
							js: [],
							ss: [],
							xs: [],
							cards: cards.slice(0),
							cards2: cards.slice(0),
							gaintag_map: {},
							vcard_map: new Map(),
						}
					} else return {
						player: player,
						hs: [],
						es: [],
						js: [],
						ss: [],
						xs: [],
						cards: [],
						cards2: [],
						gaintag_map: {},
						vcard_map: new Map(),
					}
				};
				next.getg = function (player) {
					if (player.hasSkill('hyyzzhunian') || player.getSeatNum() == 1) {
						return cards.slice(0);
					} else {
						return [];
					}
				}
				next.gaintag = [];
				trigger.cancel();
				trigger = next;
				next.skill = 'hyyzzhunian';
				await game.delayx()
			},
		},
		hyyzzhunian_info: '筑念|锁定技，你/主公每回合的首次摸牌视为获得的是对方的手牌。',

		hyyz_zhigengniao: ['知更鸟', ["female", "hyyz_xt", 3, ['hyyzgongming', 'hyyzlingzhong'], []], '#b哥哥，梦，该醒了'],
		hyyzgongming: {
			audio: 5,
			logAudio(event, player, name, indexedData, costResult) {
				switch (event.name) {
					case 'phaseDraw': return 'ext:忽悠宇宙/asset/hyyz/audio/hyyzgongming2.mp3';
					case 'phaseUse': return 'ext:忽悠宇宙/asset/hyyz/audio/hyyzgongming3.mp3';
					case 'phaseDiscard': return 'ext:忽悠宇宙/asset/hyyz/audio/hyyzgongming4.mp3';
				}
			},
			trigger: {
				player: ['phaseDrawBegin', 'phaseUseBegin', 'phaseDiscardBegin']
			},
			prompt(event) {
				return `是否发动【共鸣】跳过${get.translation(event.name)}？`
			},
			prompt2(event, player, name) {
				const map = {
					phaseUse: '使用一张手牌（不可响应）。<br>若造成伤害或未执行，可以令其摸一张牌或弃一张手牌并终止此技能。',
					phaseDraw: '摸一张牌。',
					phaseDiscard: '弃一张手牌。<br>若未执行，可以令其摸一张牌或使用一张手牌（不可响应）并终止此技能。',
				}
				return `令所有角色${map[event.name]}`;
			},
			filter(event, player) {
				return true;
			},
			check(event, player) {
				switch (event.name) {
					case 'phaseDraw':
						return player.countCards('h') > 2 && player.getFriends().length - player.getEnemies().length > 1;
						break;
					case 'phaseUse':
						const cards = player.countCards('h');
						if (!cards.length) return true;
						return game.hasPlayer(current => {
							return cards.some(card => player.canUse(card, current) && get.effect(current, card, player, player) > 0);
						})
						break;
					case 'phaseDiscard':
						if (player.needsToDiscard() > 2) return true;
						return player.getEnemies().length > player.getFriends().length && player.getFriends().every(current => current.countCards('h') > 1);
					default:
						break;
				}
			},
			async content(event, trigger, player) {
				trigger.cancel();
				event.hyyzgongming = trigger.name;
				const currents = game.filterPlayer();
				switch (trigger.name) {
					case 'phaseDraw': {
						await Promise
							.all(currents.map((player) => player.draw(1, "nodelay")))
							.then(results => {
								//console.log(results);
							})
							.catch(error => {
								console.error(error);
							})
						break;
					}
					case 'phaseUse': {
						for (const current of currents) {
							if (!event.hyyzgongming) break;
							if (!current.countCards('h', (card) => current.hasUseTarget(card)) || !await current.chooseToUse({
								prompt: '共鸣：使用一张手牌',
								forced: true,
								filterCard: function (card, player, event) {
									if (get.itemtype(card) != "card" || (get.position(card) != "h" && get.position(card) != "s")) return false;
									return lib.filter.filterCard.apply(this, arguments);
								},
								addCount: false,
							}).forResultCards()) {
								await lib.skill.hyyzgongming.toOther(event, trigger, current);
							}
						}
						break;
					}
					case 'phaseDiscard': {
						for (const current of currents) {
							if (!event.hyyzgongming) break;
							if (!current.countCards('h') || !await current.chooseToDiscard('共鸣：弃置一张手牌', true).forResultCards()) {
								await lib.skill.hyyzgongming.toOther(event, trigger, current);
							}
						}
						break;
					}
					default: break;
				};
			},
			async toOther(event, trigger, current) {
				game.hyyzSkillAudio('hyyz', 'hyyzgongming', 5)
				const player = event.player,
					controls = ['cancel2'],
					map = { phaseDraw: '摸牌', phaseUse: '出牌', phaseDiscard: '弃牌' };
				if (trigger.name != 'phaseDraw') controls.unshift('摸牌');
				if (trigger.name != 'phaseUse' && current.countCards('h', (card) => current.hasUseTarget(card))) controls.unshift('出牌');
				if (trigger.name != 'phaseDiscard' && current.countCards('h')) controls.unshift('弃牌');
				const control = await player
					.chooseControl(controls)
					.set('prompt', '共鸣：' + get.translation(current) + (_status.event.triggername == 'damageSource' ? `造成了伤害` : '无法' + map[trigger.name]))
					.set('prompt2', `是否令${get.translation(current)}执行其他项并终止流程？`)
					.set('ai', () => {
						const att = get.attitude(player, current);
						if (att > 0) {
							if (controls.includes('摸牌')) return '摸牌';
							if (controls.includes('出牌')) return '出牌';
						} else {
							if (controls.includes('弃牌')) return '弃牌';
						}
						return 'cancel2';
					})
					.forResultControl();
				if (control != 'cancel2') {
					game.hyyzSkillAudio('hyyz', 'hyyzgongming', 1)
					if (control == '摸牌') await current.draw();
					if (control == '出牌') await current.chooseToUse({
						prompt: '共鸣：使用一张手牌',
						forced: true,
						filterCard(card, player, event) {
							if (get.position(card) != 'h') return false;
							return lib.filter.cardEnabled.apply(this, arguments);
						}
					})
					if (control == '弃牌') await current.chooseToDiscard(true);
					game.log(player, '终止了', '#g【共鸣】', '的流程');
					delete event.hyyzgongming;
				};
				return true;
			},
			group: ['hyyzgongming_skip'],
			subSkill: {
				skip: {
					trigger: {
						global: ['useCard', 'damageSource']
					},
					filter(event, player, name) {
						if (name == 'useCard') {
							return event.getParent(2).name == 'hyyzgongming';
						} else {
							return event.source && event.getParent(4).name == 'hyyzgongming' && event.getParent(4).hyyzgongming != undefined;
						}
					},
					charlotte: true,
					silent: true,
					async content(event, trigger, player) {
						if (event.triggername == 'useCard') {
							trigger.directHit.addArray(game.filterPlayer());
						} else {
							await lib.skill.hyyzgongming.toOther(trigger.getParent(4), trigger.getParent(7), trigger.source)
						}
					},
				},
			}
		},
		hyyzgongming_info: '共鸣|摸牌/弃牌/出牌阶段，你可以改为令所有角色各摸/弃/使用（不能被响应）一张手牌。若有角色未执行或因此使用牌造成伤害，你可以令其执行其他项，然后终止此流程。',
		hyyzlingzhong: {
			audio: 3,
			mark: true,
			marktext: '◉',
			intro: {
				mark(dialog, content, player) {
					var cards = get.centralCards();
					if (cards.length) {
						dialog.addAuto(cards);
					} else return "中央区无牌";
				},
			},
			trigger: {
				global: 'phaseAfter'
			},
			check(event, player) {
				let suits = [];
				get.centralCards().map(card => suits.add(get.suit(card)));
				if (suits.includes('heart') || suits.includes('diamond')) return game.hasPlayer(current => current != player && get.attitude2(current) > 0);
				return suits.includes('spade') && suits.includes('club');
			},
			filter(event, player) {
				return get.centralCards().length > 0;
			},
			prompt2(event, player, name) {
				let suits = [];
				get.centralCards().map(card => suits.add(get.suit(card)));
				return '中央区有花色<' + get.translation(suits) + '>，令任意角色执行对应的〖悲歌〗项。其他角色执行黑色项后，你执行相同项或翻面。'
			},
			round: 1,
			async content(event, trigger, player) {
				let suits = [], bool = false;
				get.centralCards().map(card => suits.add(get.suit(card)));
				let str = {
					heart: '回复1点体力',
					diamond: '摸两张牌',
					club: '弃置两张牌',
					spade: '翻面',
				};
				for (let suit of suits) {
					const targets = await player.chooseTarget('聆众：令一名其他角色' + str[suit], lib.filter.notMe, true)
						.set('suit', suit).set('suits', suits)
						.set('ai', (target) => {
							const suit = _status.event.suit, suits = _status.event.suit;
							const att = get.attitude2(target);
							switch (suit) {
								case 'heart': return att * 1 / (target.hp + target.hujia + 0.01);
								case 'diamond': return att * 1 / (target.countCards('h') + 0.01);
								case 'club': return -att * 1 / (target.countCards('h') + target.hp + target.hujia + 0.01);
								case 'spade': {
									if (att > 0) {
										//if (suit.includes('club') && !player.isTurnedOver() && target == player) return 10;
										if (target.isTurnedOver()) return 10;
									} else {
										if (!target.isTurnedOver()) return 10;
									}
								}
							}
						})
						.forResultTargets();
					if (targets) {
						const target = targets[0];
						player.line(target, 'fire');
						switch (suit) {
							case "heart": await target.recover(); break;
							case "diamond": await target.draw(2); break;
							case "club": {
								await target.chooseToDiscard("he", 2, true);
								if (target == player) break;
								const cards = await player
									.chooseToDiscard("he", 2, '###聆众：弃置两张牌###否则翻面')
									.set('ai', (card) => {
										if (player.isTurnedOver()) return false;
										return 8 - get.value(card)
									})
									.forResultCards();
								if (!cards) await player.turnOver();
								break;
							}
							case "spade": {
								await target.turnOver();
								if (target == player) break;
								await player.turnOver();
								break;
							}
						}
					}
				}
			},
		},
		hyyzlingzhong_info: '聆众|每轮限一次，中央区有牌的回合结束时，其中每有一种花色，令一名其他角色执行〖悲歌〗中的此花色项。其他角色执行黑色项后，你执行相同项或翻面。',


		hyyz_kekena: ['柯柯娜', ['male', 'hyyz_other', 3, ['hyyzwanmeng', 'hyyzguizhen'], []], '#b想象一朵未来的玫瑰',
			`
千金蔽，易初心，志道分流引。<br>
无奈现实多荆棘，唯余叹息伴孤衾。<br>
胸中满兆炽热，沉陨蹉跎烬。<br><br>
十年载，化残云，空梦枕边寻。<br>
曾经赤蔷今何在，徒留遗憾染素襟。<br>
心头无一闲事，尽逐岁月银。
`],
		hyyzwanmeng: {
			audio: 3,
			logAudio(event, player) {
				let num = 0, targets = [];
				player.getHistory('useCard', (evt) => {
					if (targets.some(a => !evt.targets.includes(a)) || evt.targets.some(a => !targets.includes(a))) {
						num++;
						targets = evt.targets;
					}
				});
				return 'ext:忽悠宇宙/asset/hyyz/audio/hyyzwanmeng' + num + '.mp3';
			},
			forced: true,
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				let num = 0, targets = [];
				player.getHistory('useCard', (evt) => {
					if (targets.some(a => !evt.targets.includes(a)) || evt.targets.some(a => !targets.includes(a))) {
						num++;
						targets = evt.targets;
					}
				});
				return player.isPhaseUsing() && [1, 2, 3].includes(num)
			},
			async content(event, trigger, player) {
				let num = 0, targets = [];
				player.getHistory('useCard', (evt) => {
					if (targets.some(a => !evt.targets.includes(a)) || evt.targets.some(a => !targets.includes(a))) {
						num++;
						targets = evt.targets;
					}
				});
				switch (num) {
					case 1: await player.gain(get.cards(1), 'draw'); break;
					case 2: {
						const cards = await player.chooseCard('挽梦：重铸二张牌', 2, true, 'he').forResultCards();
						if (cards?.length) await player.recast(cards);
						break;
					}
					case 3: await player.chooseToDiscard('挽梦：弃置三张牌', 'he', 3, true); break;
				}
			},
		},
		hyyzwanmeng_info: `挽梦|锁定技，你于出牌阶段使用牌时，执行本回合改变过目标的次数项：<br>①<span class='greentext'>获得</span>②<span class='bluetext'>重铸</span>③<span class='firetext'>弃置</span>序号张牌。`,
		hyyzguizhen: {
			logAudio: (index) => typeof index === "number" ? `ext:忽悠宇宙/asset/hyyz/audio/hyyzguizhen${index}.mp3` : false,
			audio: 2,
			trigger: {
				player: ["loseAfter", "changeSkillsBegin"],
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'changeSkills') return event.addSkill && event.addSkill.length > 0;
				if (player.countCards("h")) return false;
				const skills = player.getSkills(null, false, false).filter((skill) => {
					return skill != event.name && !lib.skill[skill].charlotte && !lib.skill[skill].persevereSkill;
				});
				if (!skills.length) return false;
				const evt = event.getl(player);
				return evt && evt.player == player && evt.hs && evt.hs.length > 0;
			},
			async content(event, trigger, player) {
				if (trigger.name == 'changeSkills') {
					const index = await player.chooseControlList(`归真：即将获得<span class='yellowtext'>${get.translation(trigger.addSkill)}</span>，请抉择`, ['失去1点体力', '改为获得〖制衡〗'], true, () => {
						const player = _status.event.player;
						if (player.storage['hyyzguizhen']?.includes('hyyzwanmeng') && !player.isDamaged()) return 0;
						return 1;
					}).forResult('index');
					player.logSkill("hyyzguizhen", player, null, null, [index + 1]);
					if (index == 0) {
						await player.loseHp();
					} else {
						trigger.addSkill = ['hyyzzhiheng'];
					}
				} else {
					const skills = player.getSkills(null, false, false).filter((skill) => {
						return skill != event.name && !lib.skill[skill].charlotte && !lib.skill[skill].persevereSkill;
					});
					if (!player.storage['hyyzguizhen']) player.storage['hyyzguizhen'] = [];
					player.storage['hyyzguizhen'].addArray(skills);
					await player.removeSkills(player.storage['hyyzguizhen']);
					if (!skills.includes('hyyzzhiheng')) game.trySkillAudio('hyyzzhiheng', player);
					player
						.when({ global: 'phaseAfter' })
						.filter((event, player) => player.storage['hyyzguizhen']?.length > 0)
						.then(() => {
							const skills = player.storage['hyyzguizhen']
							delete player.storage['hyyzguizhen'];
							player.addSkills(skills);
						});
				}
			},
			derivation: 'hyyzzhiheng',
		},
		hyyzguizhen_info: '归真|锁定技，你失去所有手牌后，本回合失去其他技能；你获得技能时选择一项：<br>1.失去1点体力；2.改为获得〖制衡〗。',
		hyyzzhiheng: {
			audio: 1,
			mod: {
				aiOrder(player, card, num) {
					if (num <= 0 || get.itemtype(card) !== "card" || get.type(card) !== "equip") return num;
					let eq = player.getEquip(get.subtype(card));
					if (eq && get.equipValue(card) - get.equipValue(eq) < Math.max(1.2, 6 - player.hp)) return 0;
				},
			},
			locked: false,
			enable: "phaseUse",
			usable: 1,
			position: "he",
			filterCard(card, player, event) {
				event = event || _status.event;
				if (typeof event != "string") event = event.getParent().name;
				var mod = game.checkMod(card, player, event, "unchanged", "cardDiscardable", player);
				if (mod != "unchanged") return mod;
				return true;
			},
			discard: false,
			lose: false,
			delay: false,
			selectCard: [1, Infinity],
			check(card) {
				let player = _status.event.player;
				if (
					get.position(card) == "h" &&
					!player.countCards("h", "du") &&
					(player.hp > 2 ||
						!player.countCards("h", i => {
							return get.value(i) >= 8;
						}))
				)
					return 1;
				if (get.position(card) == "e") {
					let subs = get.subtypes(card);
					if (subs.includes("equip2") || subs.includes("equip3")) return player.getHp() - get.value(card);
				}
				return 6 - get.value(card);
			},
			async content(event, trigger, player) {
				let num = 1;
				var hs = player.getCards("h");
				if (!hs.length || hs.some(card => !event.cards.includes(card))) num = 0;
				await player.discard(event.cards);
				await player.draw(num + event.cards.length);
			},
			ai: {
				order(item, player) {
					if (player.hasCard(i => get.value(i) > Math.max(6, 9 - player.hp), "he")) return 1;
					return 10;
				},
				result: {
					player: 1,
				},
				nokeep: true,
				skillTagFilter(player, tag, arg) {
					if (tag === "nokeep") return (!arg || (arg && arg.card && get.name(arg.card) === "tao")) && player.isPhaseUsing() && !player.getStat().skill.hyyzzhiheng && player.hasCard(card => get.name(card) !== "tao", "h");
				},
				threaten: 1.55,
			},
		},
		hyyzzhiheng_info: '制衡|出牌阶段限一次，你可以弃置任意张牌并摸等量的牌，若你在发动〖制衡〗时弃置了所有手牌，则你多摸一张牌。',


		meng_fu_hua: ['符华', ['female', 'hyyz_b3', 3, ['mengduhua'], ['die:meng_chiyuan']], '拾壹', ''],
		mengduhua: {
			enable: 'phaseUse',
			chooseButton: {
				dialog: () => ui.create.dialog('渡华', '选择分配的内容', [['体力值', '体力上限'], 'tdnodes'], 'hidden'),
				check(button) {
					const player = _status.event.player;
					if (player.isDamaged()) return '体力上限';
					return '体力值';
				},
				backup(links, player) {
					var next = get.copy(lib.skill["mengduhua_backupx"]);
					next.control = links[0];
					return next;
				},
			},
			ai: {
				order: 1,
				result: {
					player(player, target, card) {
						if (player.hp > 1 && player.isDamaged() >= 2) return 1;
					}
				}
			},
			mod: {
				targetInRange(card, player, target) {
					if (!card.cards) return;
					if (card.cards.some(card => card.hasGaintag("mengduhua"))) return true;
				},
				cardUsable(card, player, num) {
					if (!card.cards) return;
					if (card.cards.some(card => card.hasGaintag("mengduhua"))) return Infinity;
				},
			},
			subSkill: {
				backup: {},
				backupx: {
					audio: "mengduhua",
					filterCard: () => false,
					selectCard: -1,
					async content(event, trigger, player) {
						var control = lib.skill.mengduhua_backup.control;
						const targets = await player
							.chooseTarget('分配给一名角色' + control, lib.filter.notMe, true)
							.set('ai', target => get.attitude2(target))
							.forResultTargets();
						if (targets) {
							const target = targets[0];
							if (control == '体力值') {
								await player.loseHp();
								await target.recover();
							} else {
								await player.loseMaxHp();
								await target.gainMaxHp();
							};

							const cards = await target
								.chooseCard(`是否交给${get.translation(player)}一张牌`, (card) => card.name == 'sha')
								.set('ai', () => get.attitude(target, player))
								.forResultCards();
							if (cards) {
								player.gain(cards, target, 'give').gaintag.add("mengduhua");
							} else {
								const bool = await player.chooseBool('是否加1点手牌下限？').forResult('bool');
								if (bool) {
									player.addSkill('mengduhua2');
									player.storage.mengduhua2++;
									player.syncStorage('mengduhua2');
								}
							}
						}
					},

				},
			},
		}, mengduhua2: {
			init(player) {
				player.storage.mengduhua2 = 0;
			},
			mark: true,
			marktext: '渡',
			intro: {
				name: '渡华',
				content(storage, player) {
					return '手牌下限+' + storage
				}
			},
			trigger: {
				player: ["loseAfter", "changeHp", "gainMaxHpAfter", "loseMaxHpAfter", "mengduhua_backupAfter"],
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			charlotte: true,
			forced: true,
			filter(event, player) {
				if (event.getl && !event.getl(player) && event.name != 'mengduhua_backup') return false;
				return player.countCards("h") < player.storage.mengduhua2;
			},
			async content(event, trigger, player) {
				player.drawTo(player.storage.mengduhua2);
			},
			ai: {
				noh: true,
				skillTagFilter(player, tag) {
					if (tag == "noh" && player.storage.mengduhua2 < player.countCards("h")) {
						return false;
					}
				},
			},
		},

		mengduhua_info: '渡华|出牌阶段，我将分配1点体力或1点体力上限，以令得到分配的角色交给我一张本回合内无距离与次数限制【杀】。<span class="firetext">她有权于没有回应时增加1点手牌下限。</span>',
	},
	2411: {
		meng_moze: ['貊泽', ['male', 'hyyz_xt', 4, ['mengcangfeng', 'mengniying', 'mengjiandai'], []], '冷若寒'],
		mengcangfeng: {
			audio: 2,
			init(player) {
				player.storage.mengcangfeng = false;
			},
			zhuanhuanji: true,
			mark: true,
			marktext: "☯",
			intro: {
				content(storage, player, skill) {
					if (storage) return '你可以将不小于目标手牌数的牌当作刺【杀】使用';
					return '你可以将不小于目标手牌数的牌当作【推心置腹】使用';
				}
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (!player.countCards('h')) return false;
				if (player.storage.mengcangfeng) return event.filterCard(get.autoViewAs({ name: "sha", nature: 'stab' }, "unsure"), player, event);
				return event.filterCard(get.autoViewAs({ name: "tuixinzhifu" }, "unsure"), player, event);
			},
			chooseButton: {
				dialog(event, player) {
					let list;
					if (player.storage.mengcangfeng) {
						if (event.filterCard(get.autoViewAs({ name: "sha", nature: 'stab' }, "unsure"), player, event))
							list = ['基本', '', 'sha', 'stab']
					}
					else {
						if (event.filterCard(get.autoViewAs({ name: "tuixinzhifu" }, "unsure"), player, event))
							list = ['锦囊', '', 'tuixinzhifu']
					}
					return ui.create.dialog("藏锋", [[list], 'vcard'], "hidden");
				},
				check(button) {
					const card = { name: button.link[2], nature: button.link[3] };
					return _status.event.player.getUseValue(card);
				},
				backup(links, player) {
					return {
						audio: 'mengcangfeng',
						selectCard: [1, player.countCards('h')],
						filterCard: true,
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							isCard: true,
						},
						async precontent(event, trigger, player) {
							player.logSkill('mengcangfeng');
							player.changeZhuanhuanji('mengcangfeng');
						},
					}
				},
				prompt(links, player) {
					const name = links[0][2], nature = links[0][3];
					return '选择' + (get.translation(nature) || '') + get.translation(name) + '的目标';
				},
			},
			mod: {
				playerEnabled(card, player, target, result) {
					let evt = _status.event;
					if (evt.skill == 'mengcangfeng_backup') {
						if (target.countCards('h') > card.cards.length) return false;
					}
				},
				/* selectTarget(card, player, range) {
					if (range[1] == -1) return;
					let evt = _status.event;
					if (evt.skill == 'mengcangfeng_backup') {
						if (card.cards.length > 0) {
							let num = card.cards.length;
							if (typeof num == 'number' && num > range[1]) range[1] = num;
						}
					}
				} */
			},
			ai: {
				respondSha: true,
				skillTagFilter(player, tag, arg) {
					return player.countCards('h') > 0
				},
				order(item, player) {
					return 6;
				},
				result: {
					player: 1,
				},
			},
		},
		mengniying: {
			audio: 2,
			init(player) {
				player.storage.mengniying = false;
			},
			zhuanhuanji: true,
			mark: true,
			marktext: "☯",
			intro: {
				content(storage, player, skill) {
					return `锁定技，一名角色的回合跳过后，你获得两张【影】并可以${storage ? '使用' : '重铸'}任意张牌`;
				}
			},
			trigger: {
				global: "phaseOver",
			},
			filter(event, player) {
				return event.player.phaseSkipped == true;
			},
			forced: true,
			popup: false,
			async content(event, trigger, player) {
				player.changeZhuanhuanji('mengniying')
				await player.gain(lib.card.ying.getYing(2), 'gain2');
				while (!player.storage.mengniying) {
					const bool = await player
						.chooseToUse()
						//.set("type", "phase")
						.forResultBool();
					if (!bool) break;
				}
				if (player.storage.mengniying) {
					const cards = await player
						.chooseCard('重铸任意张牌', 'he', [1, player.countCards('he')])
						.forResultCards();
					if (cards) {
						await player.recast(cards)
					}
				}
			},
		},
		mengjiandai: {
			audio: 3,
			trigger: {
				player: ["turnOverBefore", "enterGame"],
				global: "phaseBefore",
			},
			forced: true,
			filter(event, player) {
				if (event.name == "turnOver") return player.isTurnedOver();
				return (event.name != "phase" || game.phaseNumber == 0) && !player.isTurnedOver();
			},
			content() {
				if (trigger.name != "turnOver") player.turnOver(true);
				else {
					game.log(player, '翻回失败');
					trigger.cancel();
				}
			},
		},
		meng_heita: ['黑塔', ['female', 'hyyz_xt', 3, ['mengaixing', 'mengwoxiang'], []], '七夕月'],
		mengaixing: {
			audio: 2,
			init(player) {
				player.storage.mengaixing = [];
			},
			marktext: '谒星',//看主公，拿3，看一份我，再拿4，进回合，换4，再换3，公式打牌[表情]
			intro: {
				markcount(storage, player) {
					return storage.length + '|' + storage.reduce((sum, i) => sum += i.length, 0);
				},
				mark(dialog, storage, player) {
					if (storage?.length > 0) {
						if (player == game.me || player.isUnderControl()) {
							for (let i = 1; i <= storage.length; i++) {
								dialog.addText(`第${i}份牌`)
								dialog.addSmall(storage[i - 1]);
							}
						} else {
							return "共有" + get.cnNumber(storage.length) + "份牌";
						}
					}
				},
				content(storage, player) {
					if (storage?.length > 0) {
						if (player == game.me || player.isUnderControl()) {
							let str = ''
							for (let i = 1; i <= storage.length; i++) {
								str += `<li>第${i}份牌`;
								str += '<br>' + get.translation(storage[i - 1]);
							}
							return str;
						}
						return "共有" + get.cnNumber(storage.length) + "份牌";
					}
				},
			},
			trigger: {
				global: 'phaseZhunbeiBegin'
			},
			filter(event, player) {
				return player.storage.mengaixing2[0] < player.storage.mengaixing2[1];
			},
			async cost(event, trigger, player) {
				const controls = [], gainrs = [];
				let players = game.filterPlayer(current => current.isMaxHandcard() && current.countCards('h') > 0 && current.countCards('h') <= 7);
				if (players.length > 0) {
					players.forEach(async current => {
						const tilte = `　　${get.translation(current)}的手牌　　`;
						controls.push(tilte);
						gainrs.push(current);
					});
				};
				if (player.getStorage('mengaixing').length > 0) {
					for (let i = 0; i < player.getStorage('mengaixing').length; i++) {
						const tilte = `第${i + 1}份牌`;
						controls.push(tilte);
						gainrs.push(i);
					}
				}
				controls.push('　　牌堆顶的牌　　');
				gainrs.push('c');
				for (let i = 0; i < controls.length; i++) controls[i] = [[[i, controls[i]]], 'tdnodes'];
				controls.unshift('谒星：选择牌数和为7的区域调换牌');

				const next = player.chooseButton(controls);
				next.set('selectButton', [1, controls.length - 1]);
				next.set('filterButton', (button) => {
					const player = _status.event.player, types = _status.event.types;
					let count = 0;
					for (let i of [...ui.selected.buttons, button]) {
						const source = types[i.link];
						if (typeof source == 'string') count += 1;
						else if (typeof source == 'number') count += player.getStorage('mengaixing')[source].length;
						else if (get.itemtype(source) == 'player') count += source.countCards('h');
					}
					return count <= 7;
				});
				next.set('types', gainrs)
				next.set('filterOk', () => {
					const player = _status.event.player, types = _status.event.types;
					let count = 0;
					for (let i of ui.selected.buttons) {
						const source = types[i.link];
						if (typeof source == 'string') count += 1;
						else if (typeof source == 'number') count += player.getStorage('mengaixing')[source].length;
						else if (get.itemtype(source) == 'player') count += source.countCards('h');
					}
					return count == 7 || count < 7 && ui.selected.buttons.some(i => typeof types[i.link] == 'string');
				})
				next.set('ai', (button) => true)
				const links = await next.forResultLinks();
				if (links?.length > 0) event.result = {
					bool: true,
					cost_data: {
						gainrs: gainrs.filter(gainr => links.includes(gainrs.indexOf(gainr))),
					}
				}
			},
			async content(event, trigger, player) {
				player.storage.mengaixing2[0]++;

				const controls = [];
				let gainrs = [], count = 0;
				if (event.cost_data.gainrs.some(source => typeof source == 'string')) {
					gainrs.push('c');
					controls.add(['牌堆顶的牌']);
				}
				if (event.cost_data.gainrs.some(source => get.itemtype(source) == 'player')) {
					const temps = event.cost_data.gainrs.filter(source => get.itemtype(source) == 'player');
					temps.sortBySeat();
					for (let source of temps) {
						gainrs.push(source);
						controls.add([`${get.translation(source)}的手牌`, source.getCards('h')]);
						count += source.countCards('h');
					}
				}
				if (event.cost_data.gainrs.some(source => typeof source == 'number')) {
					const temps = event.cost_data.gainrs.filter(source => typeof source == 'number');
					temps.sort((a, b) => b - a);
					controls.unshift([]);
					for (let source of temps) {
						gainrs.unshift(source);
						controls[0].unshift([`第${source + 1}份牌`, player.getStorage('mengaixing')[source]]);
						count += player.getStorage('mengaixing')[source].length;
					}
				}
				if (count < 7 && event.cost_data.gainrs.some(source => typeof source == 'string')) {
					controls.forEach(control => {
						if (control[0] == '牌堆顶的牌') {
							control.push(get.cards(7 - count));
						}
					})
				}
				const next = player.chooseToMove_new("谒星：交换其中的牌");
				next.set("list", controls);
				next.set("filterMove", (from, to) => typeof to != "number");
				next.set("processAI", (list) => {
					const moved = list.map(i => {
						if (Array.isArray(i[0]) && Array.isArray(i[0][1])) {
							return i[0][1];
						}
						else if (Array.isArray(i[1])) return i[1];
						else return [];
					})
					return moved;
				});
				const moved = await next.forResult('moved');
				if (moved) {
					//遍历每一格
					for (let i = 0; i < gainrs.length; i++) {
						const gainr = gainrs[i], nowCards = moved[i];
						const map = new Map();
						if (!Array.isArray(nowCards)) continue;
						//分类其中的来源source和牌
						nowCards.forEach(card => {
							if (get.owner(card)?.isIn()) {
								if (!map.has(get.owner(card))) map.set(get.owner(card), []);
								map.set(get.owner(card), map.get(get.owner(card)).add(card));
							} else if (player.getStorage('mengaixing').some(array => array.includes(card))) {
								if (!map.has('x')) map.set('x', []);
								map.set('x', map.get('x').add(card));
							} else {
								if (!map.has('c')) map.set('c', []);
								map.set('c', map.get('c').add(card));
							}
						})
						//放到牌堆顶//c=》c
						if (typeof gainr == 'string') {
							//先放到处理区
							const o_c = [];
							for (let [source, cards] of map) {
								o_c.addArray(cards);
								if (get.itemtype(source) == 'player') {
									await source.lose(cards, ui.ordering, 'visible');
									if (source == game.me) {
										event.delayed = true;
									} else {
										next.delay = false;
									}
								} else if (source == 'x') {
									for (let j = 0; j < player.getStorage('mengaixing').length; j++) {
										const os = player.getStorage('mengaixing')[j].filter(card => cards.includes(card));
										if (os.length) {
											player.storage.mengaixing[j].removeArray(os);
											player.$throw(os, 1000);
											await game.cardsGotoPile(os.reverse(), "insert");
										}
									}
								} else if (source == 'c') {
									await game.cardsGotoPile(cards.reverse(), "insert");
								}
							};
							//决定哪些放到武将牌上，哪些放回牌堆顶
							const num = player.getStorage('mengaixing').reduce((sum, i) => sum += i.length, 0);
							if (num + o_c.length <= 7) {
								game.log(player, '将', o_c, '置为新的“我”');
								player.storage.mengaixing2[1] = 2;
								player.storage.mengaixing.add(o_c);
								await game.cardsGotoSpecial(o_c);
								player.$gain2(o_c,);
								player.markSkill('mengaixing');
							} else {
								game.log(player, '将', o_c, '置于牌堆顶');
								await game.cardsGotoPile(o_c.reverse(), "insert");
							}
						}
						//武将牌上 栏//12345=》x
						if (typeof gainr == 'number') {
							for (let [source, cards] of map) {
								if (get.itemtype(source) == 'player') {
									game.log(player, "将", source, "的", cards, "置于武将牌上第", gainr + 1, "份牌");
									source.$giveAuto(cards, player)
									await source.lose(cards, ui.special, "toStorage");
									player.storage.mengaixing[gainr].addArray(cards);
									player.markSkill('mengaixing')
								} else if (source == 'x') {
									//从一个str[x]，移动到str[gainr]
									player.storage.mengaixing[gainr].addArray(cards);
									for (let card of cards) {
										for (let j = 0; j < player.storage.mengaixing.length; j++) {
											if (player.storage.mengaixing[j].includes(card) && j != gainr) {
												player.storage.mengaixing[j].remove(card)
												game.log(player, "将", card, "从第", j + 1, "份牌移到", gainr + 1, "份牌");
											}
										};
									}
									player.markSkill('mengaixing');
								} else if (source == 'c') {
									game.log(player, "将牌堆顶的", cards, "置于武将牌上第", gainr + 1, "份牌");
									player.storage.mengaixing[gainr].addArray(cards);
									player.markSkill('mengaixing');
								}
							};
						}
						//角色获得//'player'=》get.owner(card)
						if (get.itemtype(gainr) == 'player') {
							for (let [source, cards] of map) {
								if (get.itemtype(source) == 'player') {
									await source.give(cards, gainr, 'give');
								} else if (source == 'x') {
									for (let j = 0; j < player.getStorage('mengaixing').length; j++) {
										const gains = player.getStorage('mengaixing')[j].filter(card => cards.includes(card));
										if (gains.length > 0) {
											game.log(player, '将', gains, '从第', i + 1, '份牌中交给', gainr);
											await gainr.gain(gains, player, 'give');
											player.storage.mengaixing[j].removeArray(gains);
											player.markSkill('mengaixing');
										}
									}
								} else if (source == 'c') {
									await gainr.gain(cards, 'draw');
								}
							};
						}
					}
				}
				for (let zero of player.storage.mengaixing) {
					if (zero.length == 0) player.storage.mengaixing.remove(zero);
				}
			},
			group: 'mengaixing2',
		}, mengaixing2: {
			init(player) {
				player.storage.mengaixing2 = [0, 1]
			},
			trigger: {
				global: 'roundStart'
			},
			silent: true,
			charlotte: true,
			content() {
				player.storage.mengaixing2 = [0, 1]
			}
		},
		mengwoxiang: {
			audio: 2,
			enable: ["chooseToUse", "chooseToRespond"],
			hiddenCard(player, name) {
				return player.getStorage('mengaixing').some(array => array.length <= player.countCards('h'));
			},
			filter(event, player) {
				//if (event.responded || event.mengwoxiang) return false;
				if (player.getStorage('mengaixing').every(array => array.length > player.countCards('h'))) return false;
				return lib.inpile.some(i => event.filterCard(get.autoViewAs({ name: i }, "unsure"), player, event));
			},
			delay: false,
			async content(event, trigger, player) {
				const evt = event.getParent(2);
				//evt.set("mengwoxiang", true);

				let cards = player.getCards('h')
				if (cards.length > 1) {
					const moved = await player
						.chooseToMove("我相：将牌按顺序置于牌堆顶", true)
						.set("list", [["牌堆顶", cards]])
						.set("reverse", _status.currentPhase && _status.currentPhase.next && get.attitude(player, _status.currentPhase.next) > 0)
						.set("processAI", function (list) {
							const cards = list[0][1].slice(0);
							cards.sort(function (a, b) {
								return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
							});
							return [cards];
						}).forResult('moved');
					if (moved) cards = moved[0];
				}
				game.log(player, "将", cards, "置于了牌堆顶");
				await player.lose(cards, ui.cardPile, 'insert');
				await game.delayx();

				let controls = [];
				const dialog = [`我相：获得不大于${cards.length}张的一份牌`];
				let index = 0;
				while (index < player.getStorage('mengaixing').length) {
					if (player.getStorage('mengaixing')[index].length <= cards.length) {
						dialog.add(`第${index + 1}份牌`);
						dialog.add(player.getStorage('mengaixing')[index]);
						controls.add(`第${index + 1}份牌`);
					}
					index++;
				}
				const control = await player
					.chooseControl(controls)
					.set('dialog', dialog)
					.set('ai', () => {
						return 0;
					})
					.forResultControl();
				if (control != 'cancel2') {
					const i = control.match(/\d+/)[0] - 1;

					const cardx = player.getStorage('mengaixing')[i];
					await player.gain(cardx, player, 'give');
					player.storage.mengaixing.splice(i, 1);
					player.markSkill('mengaixing');
					for (let zero of player.storage.mengaixing) {
						if (zero.length == 0) player.storage.mengaixing.remove(zero);
					}
					evt.redo();
				}
				evt.goto(0);
			},
			ai: {
				order: 10,
				result: {
					player(player, target, card) {
						const evt = _status.event, storage = player.getStorage('mengaixing'),
							value = player.getCards('h').reduce((sum, card) => sum + get.value(card), 0);
						if (!storage?.length) return;
						for (const array of storage) {
							if (array.length <= player.countCards('h')) {
								const tempValue = array.reduce((sum, card) => sum + get.value(card), 0);
								if (tempValue > value) return tempValue - value;
							}
						}
					}
				}
			},
		},
		meng_kaqina: ['卡齐娜', ['female', 'hyyz_ys', 3, ['mengduoji'], []], '冷若寒'],
		mengduoji: {
			audio: 4,
			trigger: {
				player: ["phaseZhunbeiEnd", "phaseJudgeEnd", "phaseDrawEnd", "phaseUseEnd", "phaseDiscardEnd", "phaseJieshuEnd"],
			},
			filter(event, player) {
				let cards = [];
				game.countPlayer(current => {
					current.getHistory("lose", evt => {
						if (evt.getParent().name != 'useCard' && evt.getParent(event.name) == event && evt.cards?.length) cards.addArray(evt.cards.filterInD('d').filter(card => {
							return !get.info(card) || !get.info(card).destroy;
						}))
					}).length;
				})
				return cards.length > 0;
			},
			async cost(event, trigger, player) {
				const cards = [];
				game.countPlayer(current => {
					current.getHistory("lose", evt => {
						if (evt.getParent().name != 'useCard' && evt.getParent(trigger.name) == trigger && evt.cards?.length) cards.addArray(evt.cards.filterInD('d').filter(card => {
							return !get.info(card) || !get.info(card).destroy;
						}))
					}).length;
				})
				let links = await player.chooseCardButton('隳积：选择一张视为使用的牌', cards, [1, 1])
					.set('filterButton', (button) => {
						return player.hasUseTarget(get.autoViewAs({ name: button.link.name }, _status.event.cardx), player, false)
					})
					.set('cardx', cards).forResultLinks();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							links: links,
						}
					}
				}
			},
			async content(event, trigger, player) {
				const cards = [];
				game.countPlayer(current => {
					current.getHistory("lose", evt => {
						if (evt.getParent().name != 'useCard' && evt.getParent(trigger.name) == trigger && evt.cards?.length) cards.addArray(evt.cards.filterInD('d').filter(card => {
							return !get.info(card) || !get.info(card).destroy;
						}))
					}).length;
				});
				player.addTempSkill('mengduoji2', { player: ['mengduojiAfter'] });
				cards.map(card => player.storage.mengduoji2.add(get.suit(card)));

				const card = {
					name: event.cost_data.links[0].name,
					nature: get.nature(event.cost_data.links[0]),
					storage: { mengduoji: true }
				}
				await player.chooseUseTarget(get.autoViewAs(card, cards), cards, true);
			},
		}, mengduoji2: {
			charlotte: true,
			init(player) {
				player.storage.mengduoji2 = [];
			},
			trigger: {
				global: 'loseAfter',
				player: ['useCard0', 'yingbian', 'useCard1', 'useCard2', 'useCardToPlayer', 'useCardToTarget', 'useCardToPlayered', 'useCardToTargeted',]
			},
			filter(event, player) {
				if (event.name == 'lose') return event.cards.filterInD('d').filter(card => {
					return !get.info(card) || !get.info(card).destroy;
				}).length > 0;
				if (event.player == player && event.card?.storage.mengduoji == true) {
					let suits = [];
					event.card.cards.map(card => suits.add(get.suit(card)));
					return suits.length >= 4;
				}
			},
			silent: true,
			async content(event, trigger, player) {
				game.trySkillAudio('mengduoji', player);
				if (trigger.name == 'lose') {
					const cards = trigger.cards.filterInD('d').filter(card => !get.info(card) || !get.info(card).destroy);
					const evt = trigger.getParent('useCard');
					if (evt.card?.storage.mengduoji == true && evt.getParent(2).name == 'mengduoji') {
						evt.card.cards.addArray(cards);
						evt.cards.addArray(cards);
						if (evt.card.isCard) delete evt.card.isCard;
					}
					cards.map(card => player.storage.mengduoji2.add(get.suit(card)));
					if (player.storage.mengduoji2.length >= 4) {
						await player.draw(Math.max(evt.card.cards.length, evt.cards.length));
					}
					if (player.storage.mengduoji2.length >= 4) {
						game.log(evt.card, '终止结算');
						_status.event = evt;
						_status.event.finish();
						_status.event.untrigger(true);
					}
				} else {
					await player.draw(Math.max(trigger.card.cards.length, trigger.cards.length));
					game.log(trigger.card, '终止结算');
					_status.event = trigger;
					_status.event.finish();
					_status.event.untrigger(true);
				}
			}
		},
		meng_sp_meibiwusi: ['梅比乌斯', ['female', 'hyyz_b3', 4, ['mengliutu', 'mengfeiyun', 'mengtui4yan'], []], '微雨'],
		mengliutu: {
			audio: 'mengqiying',
			trigger: {
				global: [
					"phaseZhunbeiSkipped", "phaseZhunbeiCancelled",
					"phaseDrawSkipped", "phaseDrawCancelled",
					"phaseUseSkipped", "phaseUseCancelled",
					"phaseDiscardSkipped", "phaseDiscardCancelled",
					"phaseJieshuSkipped", "phaseJieshuCancelled"
				],
			},
			filter(event, player) {
				return event.player.countCards('he') > 0 || event.player.countCards('h') != 4;
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				const list = [];
				if (trigger.player.countCards('he') > 0) list.add('弃置一张牌执行' + get.translation(trigger.name));
				if (trigger.player.countCards('h') != 4) list.add('手牌调整至4');
				if (list.length == 2) list.add('背水：“崩坏”');
				const control = list.length == 1 ? list[0] : (await trigger.player
					.chooseControl(list)
					.set('ai', () => {
						const list = _status.event.list, trigger = _status.event.getTrigger();
						if (list.some(i => i.startsWith('弃'))) {
							if (
								trigger.name == 'phaseUse' && trigger.player.countCards('hs', (card) => trigger.player.getUseValue(card) > 0) > 1 ||
								trigger.name == 'phaseDraw'
							) {
								return list.find(i => i.startsWith('弃'))
							}
						}
						if (trigger.player.countCards('h') < 4 && list.some(i => i.startsWith('手'))) return list.find(i => i.startsWith('手'));
						return list.randomGet();
					})
					.set('list', list)
					.forResultControl());
				if (control != 'cancel2') {
					if (control.startsWith('弃')) {
						const cards = await trigger.player
							.chooseToDiscard('弃一张牌执行' + get.translation(trigger.name), true, 'he')
							.forResultCards();
						if (cards) {
							const next = trigger.player[trigger.name]();
							event.next.remove(next);
							trigger.next.push(next);
						}
					}
					else if (control.startsWith('手')) {
						const hs = trigger.player.countCards('h')
						if (hs > 4) trigger.player.chooseToDiscard(true, hs - 4);
						else trigger.player.draw(4 - hs);
					}
					else if (control.startsWith('背')) {
						const control = await player
							.chooseControl("baonue_hp", "baonue_maxHp", function (event, player) {
								if (player.hp == player.maxHp) return "baonue_hp";
								if (player.hp < player.maxHp - 1 || player.hp <= 2) return "baonue_maxHp";
								return "baonue_hp";
							})
							.set("prompt", "崩坏：失去1点体力或减1点体力上限")
							.forResultControl();
						if (control == "baonue_hp") await player.loseHp();
						else await player.loseMaxHp(true);

						const cards = await trigger.player
							.chooseToDiscard('弃一张牌执行' + get.translation(trigger.name), true, 'he')
							.forResultCards();

						const hs = trigger.player.countCards('h')
						if (hs > 4) await trigger.player.chooseToDiscard(true, hs - 4);
						else await trigger.player.draw(4 - hs);

						if (cards) {
							const next = trigger.player[trigger.name]();
							event.next.remove(next);
							trigger.next.push(next);
						}
					}
				}
			},
		},
		mengfeiyun: {
			audio: 'mengliutu',
			trigger: {
				player: ["phaseChange", "changeHp"]
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'changeHp') return player.getDamagedHp() > 0;
				return (event.num + 1) - player.getHistory("skipped").length == player.getDamagedHp();
			},
			async content(event, trigger, player) {
				if (trigger.name == 'changeHp') {
					player.addSkill('mengfeiyun2');
					player.storage.mengfeiyun2.push(player.getDamagedHp());
					return;
				}
				const old = get.translation(trigger.phaseList[trigger.num]);
				let list = lib.phaseName.slice(0);
				const control = await player
					.chooseControl(list)
					.set('prompt', '斐殒：改为任意阶段')
					.forResultControl();
				if (control) {
					trigger.phaseList[trigger.num] = control + '|mengfeiyun';
					game.log(player, '的', `#y${old}`, `改为`, `#y${get.translation(trigger.phaseList[trigger.num].split("|")[0])}`)
					game.delayx();
				}
			},
		}, mengfeiyun2: {
			init(player) {
				player.storage.mengfeiyun2 = [];
			},
			silent: true,
			firstDo: true,
			trigger: {
				player: [
					"phaseZhunbeiBefore",
					"phaseDrawBefore",
					"phaseUseBefore",
					"phaseDiscardBefore",
					"phaseJieshuBefore",
				],
			},
			async content(event, trigger, player) {
				if (!player.storage.mengfeiyun2.some(i => i == 0)) {
					player.storage.mengfeiyun2.forEach((value, index, array) => array[index] = value - 1);
				}
				const index = player.storage.mengfeiyun2.indexOf(0);
				if (index > -1) {
					player.storage.mengfeiyun2.splice(index, 1);
					trigger.cancel();
					game.log(player, '跳过', '#r' + get.translation(trigger.name));
				}
			},
		},
		mengtui4yan: {
			audio: 'mengwuxian',
			trigger: {
				player: "loseAfter",
				global: "loseAsyncAfter",
			},
			frequent: true,
			filter(event, player) {
				if (event.type != "discard" || event.getlx === false) return false;
				var evt = event.getParent("phaseDiscard"),
					evt2 = event.getl(player);
				return evt && evt2 && evt.name == "phaseDiscard" && evt.player == player && evt2.cards2 && evt2.cards2.length > 0;
			},
			content() {
				player.gainMaxHp();
			},
		},
		meng_sp_weierwei: ['维尔薇', ['female', 'hyyz_b3', '2/3/3', ['mengwanwo', 'mengwusheng'], []], '冷若寒', '我是谁？是涅槃的火凤，薄幸的佳俏，赴北的义士，逐日的神人，救世的良医，和合的贤者，残虐的恶徒，陷阵的英杰…还是，我自己？？'],
		mengwanwo: {
			audio: 'mengwuzhuang',
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				const cards = event.cards.filterInD();
				return cards.length > 0 && cards.some(card => {
					const skills = player.getSkills(null, false, false).filter(skill => {
						let info = get.info(skill);
						if (!info || get.is.empty(info) || info.charlotte) return false;
						return true;
					});
					return !skills.some(skill => lib.translate[skill + '_info']?.includes(get.translation(card.name)))
				});
			},
			forced: true,
			async content(event, trigger, player) {
				const cards = trigger.cards.filterInD();
				for (const card of cards) {
					const cardName = card.name, skillName = `mengwanwo_${cardName}`;
					const skills = player.getSkills(null, false, false).filter(skill => {
						let info = get.info(skill);
						if (!info || get.is.empty(info) || info.charlotte) return false;
						return true;
					});
					if (skills.some(skill => lib.translate[skill + '_info'].includes(get.translation(cardName)))) continue;
					lib.skill[skillName] = {
						unique: true,
						init(player, skill) {
							player.storage[skill] = false;
						},
						mark: true,
						intro: { content: "limited" },
						limited: true,
						skillAnimation: ["epic", "legend"].randomGet(),
						animationColor: [
							"fire",//橙红色
							"yellow",//黄色
							"blue",//浅天蓝色
							"green",//青色
							"ice",//低饱和灰蓝色
							"thunder",//浅蓝色，和blue很接近
							"kami",//低饱和灰绿色
							"white",//白色
							"poison",//浅绿
							"brown",//棕色
							"legend"//粉色
						].randomGet(),
						enable: "chooseToUse",
						viewAs: {
							name: cardName,
							nature: get.nature(card),
							number: get.number(card),
							color: get.color(card),
							suit: get.suit(card),
							storage: {
								mengwanwo: true,
							},
							isCard: true,
						},
						viewAsFilter(player) {
							if (player.storage[skillName]) return false;
						},
						filterCard: () => false,
						selectCard: -1,
						prompt: lib.translate[cardName + '_info'],
						onuse(result, player) {
							player.awakenSkill(skillName);
						},
					};
					lib.translate[skillName] = lib.translate[cardName];
					lib.translate[skillName + '_info'] = lib.translate[cardName + '_info'];
					player.addSkills([skillName]);
				}
			},
		},
		mengwusheng: {
			audio: 'mengluoxuan',
			unique: true,
			init(player, skill) {
				player.storage[skill] = false;
			},
			mark: true,
			intro: { content: "limited" },
			limited: true,
			skillAnimation: ["epic", "legend"].randomGet(),
			animationColor: [
				"fire",//橙红色
				"yellow",//黄色
				"blue",//浅天蓝色
				"green",//青色
				"ice",//低饱和灰蓝色
				"thunder",//浅蓝色，和blue很接近
				"kami",//低饱和灰绿色
				"white",//白色
				"poison",//浅绿
				"brown",//棕色
				"legend"//粉色
			].randomGet(),
			enable: "phaseUse",
			filter(event, player) {
				return !player.storage.mengwusheng;
			},
			async content(event, trigger, player) {
				player.awakenSkill('mengwusheng')
				const controls = [
					'失去至少半数技能并摸三张牌', '摸五张牌', '将至多半数技能改为【崩坏】并摸八张牌'
				]
				const index = await player
					.chooseControlList('无生：选择一项', controls, true)
					.set('ai', () => controls[0])
					.forResult('index');
				if (index == 1) {
					await player.draw(5);
					return;
				}
				const skills = player.getSkills(null, false, false).filter(skill => {
					let info = get.info(skill);
					if (!info || get.is.empty(info) || info.charlotte) return false;
					return true;
				});
				for (let i = 0; i < skills.length; i++) skills[i] = [skills[i], get.translation(skills[i])];
				const next = player.chooseButton();
				next.set('createDialog', [`${index ? '将至多' : '失去至少'}半数技能${index ? '改为【崩坏】并摸八张牌' : '并摸三张牌'}`, [skills, 'tdnodes']])
				next.set('forced', true);
				next.set('selectButton', [
					index ? 1 : Math.ceil(skills.length / 2),
					index ? Math.floor(skills.length / 2) : skills.length,
				]);
				const links = await next.forResultLinks();
				if (links?.length > 0) {
					if (index) {
						for (let skillName of links) {
							if (lib.translate[skillName] == '崩坏') continue;
							player.removeSkill(skillName);
							let num = 1;
							while (player.hasSkill('mengwanwo' + num)) num++;
							const skillName2 = 'mengwanwo' + num;
							lib.skill[skillName2] = {
								trigger: {
									player: "phaseJieshuBegin",
								},
								forced: true,
								check() {
									return false;
								},
								filter(event, player) {
									return !player.isMinHp();
								},
								async content(event, trigger, player) {
									const control = await player
										.chooseControl("baonue_hp", "baonue_maxHp", function (event, player) {
											if (player.hp == player.maxHp) return "baonue_hp";
											if (player.hp < player.maxHp - 1 || player.hp <= 2) return "baonue_maxHp";
											return "baonue_hp";
										})
										.set("prompt", "崩坏：失去1点体力或减1点体力上限")
										.forResultControl();
									if (control == "baonue_hp") await player.loseHp();
									else await player.loseMaxHp(true);
								},
								ai: {
									threaten: 0.5,
									neg: true,
								},
								priority: Number(skillName2[skillName2.length - 1]) - 1,
							};
							lib.translate[skillName2] = lib.translate['benghuai'];
							lib.translate[skillName2 + '_info'] = lib.translate['benghuai_info'];
							player.addSkill(skillName2);
						}
					} else {
						await player.removeSkills(links);
					}
					await player.draw(index ? 8 : 3);
				}
			},
		},
		"mengcangfeng_info": "藏锋|转换技，你可以将不小于目标手牌数的牌当作<br>阳：【推心置腹】，阴：刺【杀】使用。",
		"mengniying_info": "匿影|转换技，锁定技，一名角色的回合跳过后，你获得两张【影】并可以<br>阳：重铸任意张牌，阴：使用任意张牌。",
		"mengjiandai_info": "缄殆|锁定技，你始终处于翻面状态。",
		"mengaixing_info": "谒星|每轮限一次，一名角色的准备阶段，你可以任意交换以下牌数和为7的区域中的牌：手牌数最多角色的手牌；任意份武将牌上的牌；牌堆顶。若因此放到牌堆顶的牌与武将牌上的牌数和不超过7，将前者置为一份武将牌上的牌，本轮本技能改为“限两次”。",
		"mengwoxiang_info": "我相|当你需要使用牌时，你可以置顶手牌并获得牌数不大于其的一份武将牌上的牌。",
		"mengduoji_info": "隳积|你的阶段结束时，可以将此阶段不因使用进入弃牌堆的牌当其中一张使用。此牌结算过程中，进入弃牌堆的牌改为加入此牌的实体牌。当此牌的实体牌包含四种花色时，你终止此牌结算，重铸之。",
		"mengliutu_info": "毓荼|一名角色跳过阶段后，你可以令其选择：1.弃置一张牌并执行此阶段，2.将手牌调整至4张。背水：“崩坏”",
		"mengfeiyun_info": "斐殒|锁定技，你的第x个阶段改为任意阶段。你的体力值改变后，跳过你接下来的第x个阶段（x为你已损失体力值）。",
		"mengtui4yan_info": "蜕衍|你于弃牌阶段弃置牌后，加一点体力上限。",
		"meng_weierwei2": "维尔薇",
		"mengwanwo_info": "万我|锁定技，你使用的牌结算完毕进入弃牌堆后，若你没有描述含此牌名的技能，你将此牌置为限定技。",
		"mengwusheng_info": "无生|限定技，出牌阶段，你可以：1.失去至少半数技能并摸三张牌；2.摸五张牌；3.将至多半数技能改为【崩坏】并摸八张牌。"

	},
	2412: {
		meng_xigewen: ['希格雯', ['female', 'hyyz_ys', 3, ['mengyiyv', 'mengyvzan', 'mengyirong'], []], '奕水之安', ''],
		mengyiyv: {
			audio: 6,
			enable: 'chooseToUse',
			filter(event, player) {
				return event.filterCard(get.autoViewAs({ name: 'tao' }, 'unsure'), player, event)
			},
			filterCard(card, player) {
				return get.suit(card) == "heart";
			},
			position: "hes",
			viewAs: {
				name: "tao",
			},
			viewAsFilter(player) {
				if (!player.countCards("hes", { suit: "heart" })) return false;
			},
			prompt: "把❤牌当做【桃】使用",
			check(card) {
				return 8 - get.value(card);
			},
			hiddenCard(player, name) {
				return name == 'tao' && player.countCards('hes', card => get.suit(card) == 'heart') > 0;
			},
			locked: false,
			mod: {
				playerEnabled(card, player, target, result) {
					if (card.name == 'tao' || card.name == 'taoyuan') return target == player;
				},
			},
			group: 'mengyiyv_1',
			subSkill: {
				1: {
					trigger: {
						global: 'roundStart'
					},
					locked: true,
					silent: true,
					filter(event, player) {
						return game.roundNumber == 3;
					},
					async content(event, trigger, player) {
						game.log(player, '升级了', '#g【医愈】');
						player.removeSkill('mengyiyv');
						player.addSkill('mengyiyv_rewrite');
					},
				}
			},
			derivation: 'mengyiyv_rewrite'
		},
		mengyiyv_rewrite: {
			audio: 'mengyiyv',
			init(player) {
				lib.card['tao'].filterTarget = (card, player, target) => {
					if (target.hp >= target.maxHp) return false;
					if (target == player) return true;
					if (
						player.hasSkill('mengyiyv_rewrite') &&
						!player.hasHistory('useCard', (evt) => {
							return evt.getParent().type != 'dying' && evt.targets.some(target => target != player)
						})
					) return true;
					return false;
				}
				lib.card['tao'].selectTarget = 1;
				lib.card['tao'].enable = (card, player) => {
					if (player.hp < player.maxHp) return true;
					if (
						player.hasSkill('mengyiyv_rewrite') &&
						!player.hasHistory('useCard', (evt) => {
							return evt.getParent().type != 'dying' && evt.targets.some(target => target != player)
						}) &&
						game.hasPlayer(current => current.isDamaged())
					) return true;
					return false;
				};
			},
			onremove(player) {
				lib.card['tao'].filterTarget = function (card, player, target) {
					return target == player && target.hp < target.maxHp;
				}
				lib.card['tao'].selectTarget = -1;
				lib.card['tao'].enable = function (card, player) {
					return player.hp < player.maxHp;
				};
			},
			locked: false,
			enable: 'chooseToUse',
			filter(event, player) {
				return event.filterCard(get.autoViewAs({ name: 'tao' }, 'unsure'), player, event)
			},
			filterCard(card, player) {
				return get.color(card) == "red";
			},
			position: "hes",
			viewAs: {
				name: "tao",
			},
			viewAsFilter(player) {
				if (!player.countCards("hes", { color: "red" })) return false;
			},
			prompt: "把红牌当做【桃】使用",
			check(card) {
				return 8 - get.value(card);
			},
			hiddenCard(player, name) {
				return name == 'tao' && player.countCards('hes', card => get.color(card) == 'red') > 0;
			},
			mod: {
				targetEnabled(card, player, target, result) {
					if (card.name == 'tao' && target.isDamaged()) return true;
				},
			},
		},
		mengyvzan: {
			audio: 3,
			trigger: {
				global: 'recoverAfter'
			},
			filter(event, player) {
				return event.getParent(2).name == 'useCard' && event.getParent(2).player == player;
			},
			frequent: true,
			async content(event, trigger, player) {
				player.draw(trigger.getParent(2).cards.some(card => lib.card[card.name].type != 'basic') ? 2 : 1);
			},
		},
		mengyirong: {
			audio: 2,
			limited: true,
			enable: "phaseUse",
			skillAnimation: true,
			animationColor: "water",
			trigger: {
				global: ["dieBegin", "loseMaxHpBefore"]
			},
			check(event, player) {
				return get.attitude(player, event.player) > 0;
			},
			filter(event, player) {
				if (event.player == player) return false;
				if (player.storage.mengyirong) return false;
				if (event.name == 'loseMaxHp') return event.num == event.player.maxHp;
				return event.getParent().name == "dying" && event.player.isIn();
			},
			async content(event, trigger, player) {
				await player.awakenSkill("mengyirong");
				trigger.cancel();
				const target = trigger.player;
				target.maxHp = 3;
				target.hp = 2;
				target.update();
				await player.turnOver();
				if (player.hasSkill('mengyiyv') && !player.hasSkill('mengyiyv_rewrite')) {
					game.log(player, '升级了', '#g【医愈】');
					player.removeSkill('mengyiyv');
					player.addSkill('mengyiyv_rewrite');
				}
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => (player.storage[skill] = false),
			ai: {
				order: 5,
				result: {
					target(player, target, card) {
						return get.attitude(player, target) > 0;
					}
				}
			}
		},

		meng_dinyi: ['丁仪', ['male', 'hyyz_other', 3, ['mengwendao'], []], '朝闻道，夕死可矣-尾巴酱', '朝闻道，夕死可矣'],
		mengwendao: {
			audio: 8,
			logAudio: () => [
				'ext:忽悠宇宙/asset/meng/audio/mengwendao1',
				'ext:忽悠宇宙/asset/meng/audio/mengwendao2',
				'ext:忽悠宇宙/asset/meng/audio/mengwendao3',
				'ext:忽悠宇宙/asset/meng/audio/mengwendao4',
				'ext:忽悠宇宙/asset/meng/audio/mengwendao5',
				'ext:忽悠宇宙/asset/meng/audio/mengwendao6',
			],
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			async cost(event, trigger, player) {
				const max = ui.cardPile.childElementCount, concatNum = function (nums) {//[1,2,'五',5]
					nums = nums.filter(num => typeof num == 'number');//[1,2,5]
					nums.reverse();//[5,2,1]
					let num = 0;
					for (let i = 0; i < nums.length; i++) num += nums[i] * Math.pow(10, i);//5+20+100
					return num;
				}
				const dialog = ui.create.dialog('hidden');
				dialog.addText('问道：获取真理的机会摆在你眼前，你的选择是')
				dialog.addText('<span style = "font-size:12px ">尽力观看牌堆顶更多的牌</span>')
				dialog.add([[7, 8, 9], 'tdnodes'])
				dialog.add([[4, 5, 6], 'tdnodes'])
				dialog.add([[1, 2, 3], 'tdnodes'])
				dialog.add([[0, max, '放弃'], 'tdnodes'])

				const next = player.chooseButton();
				next.set('dialog', dialog)
				next.set('concatNum', concatNum)
				next.set('max', max)
				next.set('selectButton', [1, max.toString().length])
				next.set('forced', true)
				next.set('filterButton', (button, player) => {
					if (ui.selected.buttons.length) {
						//选过字符串，就不能再选
						if (typeof ui.selected.buttons[0].link == 'string') return false;
						//再次点击也不能选字符串
						if (typeof button.link == 'string') return false;
						const concatNum = _status.event.concatNum, max = _status.event.max;
						let nums = ui.selected.buttons.map(i => i.link), mumsadd = nums.add(button.link);
						if (concatNum(nums) >= max) return false;
						if (concatNum(mumsadd) >= max) return false;
						return true;
					}
					return button.link != 0;
				})
				next.set('ai', (button) => {
					let player = _status.event.player, max = _status.event.max;
					if (player.hp > max) return button.link == max;
					const numString = Math.ceil(player.hp / 2) + '', array = numString.split('');
					return button.link == array[ui.selected.buttons.length];
				})
				const links = await next.forResultLinks();
				dialog.close();
				if (links?.[0] != '放弃') event.result = {
					bool: true,
					cost_data: {
						num: Math.min(concatNum(links), max)
					}
				}
			},
			async content(event, trigger, player) {
				const count = event.cost_data.num;
				game.log(player, `观看了${count >= ui.cardPile.childElementCount ? '' : count + '/'}${ui.cardPile.childElementCount}份真理`)
				let list = [];
				for (let i = 0; i < ui.cardPile.childNodes.length && list.length < count; i++) list.push(ui.cardPile.childNodes[i]);
				let dialog = ui.create.dialog('求道：贪婪地选择想获知的真理吧！', 'hidden');
				dialog.addSmall(list);
				const cards = await player
					.chooseButton(dialog, [1, Infinity])
					.set('filterButton', (button) => {
						const card = button.link;
						if (ui.selected.buttons.length) {
							if (ui.selected.buttons.some(i => get.number(i.link) == get.number(card))) return false;
						}
						return player.hasUseTarget(card, false, false);
					})
					.set('ai', (button) => {
						return player.getUseValue(button.link, false, false)
					})
					.forResultLinks();
				if (cards) {
					let list = cards, num = count;
					while (list.some(card => player.hasUseTarget(card, false, false))) {
						let use_card = list.length == 1 ? [list[0]] : (await player
							.chooseButton(['选择要使用的卡牌', list, 'hidden'], (button) => get.order(button.link, player), (button) => player.hasUseTarget(button.link, false, false))
							.forResultLinks());
						if (use_card?.length) {
							list.remove(use_card[0]);
							const bool = await player.chooseUseTarget(use_card[0], true, false, 'nodistance').forResultBool();
							if (bool) num--;
						} else {
							break;
						}
					}
					if (num > 0) player.when({ player: 'phaseJieshuBegin' }).vars({ num: num }).then(() => {
						game.hyyzSkillAudio('meng', 'mengwendao', 7, 8)
						player.loseHp(num)
					});
				}
			},
		},

		meng_wangguiren: ['忘归人', ['female', 'hyyz_xt', 3, ['mengruoxi', 'mengwuguiWGR'], []], '微雨'],
		mengruoxi: {
			audio: 4,
			trigger: {
				player: 'useCardToExcluded',
			},
			filter(event, player) {
				return event.card.storage.mengruoxi;
			},
			logTarget(event, player) {
				return [event.target]
			},
			forced: true,
			locked: false,
			async content(event, trigger, player) {
				const card = get.autoViewAs({
					name: 'wuzhong',
					number: get.number(trigger.cards),
					suit: get.suit(trigger.cards),
				}, trigger.cards)
				game.log(player, '更改了对', trigger.target, '的结算效果为', card);
				const next = game.createEvent(card.name);
				next.setContent(get.info(card, false).content);
				next.target = trigger.target;
				next.targets = trigger.targets
				next.card = card;
				next.cards = trigger.cards;
				next.player = player;

				if (trigger.target.countCards('he') >= trigger.target.hp) {
					if (trigger.target == player && !player.countCards('e')) return;
					await player.gainPlayerCard(trigger.target, true, 'he');
				}
			},
			group: 'mengruoxi_temp',
			subSkill: {
				temp: {
					trigger: {
						player: ['useCard']
					},
					silent: true,
					forced: true,
					locked: false,
					filter(event, player) {
						return event.targets.some(target => player.getHistory('useCard').length == target.hp)
					},
					async content(event, trigger, player) {
						const targets = trigger.targets.filter(target => player.getHistory('useCard').length == target.hp);
						trigger.excluded.addArray(targets);
						trigger.card.storage.mengruoxi = targets;
					},
				}
			}
		},
		mengwuguiWGR: {
			audio: 2,
			trigger: {
				player: ["equipAfter", "addJudgeAfter", "gainAfter",],
			},
			subfrequent: ['delete'],
			filter(event, player) {
				return _status?.currentPhase?.isIn()
			},
			async cost(event, trigger, player) {
				const names = [], gains = event.name == 'gain' ? trigger.getg(player) : trigger.cards;
				for (let card of gains) {
					for (let cardx of player.getCards('he')) {
						if (card == cardx) continue;
						if (card.name == cardx.name) names.add(card.name);
					}
				}
				if (!names.length) return;

				const target = _status.currentPhase;
				const loses = target.getCards('hej', (card) => names.includes(card.name));
				let cards = undefined;
				if (loses.length) cards = await player
					.chooseCard('勿归：保留重复牌至一张，或点取消受到1点火焰伤害', names.length, card => {
						if (ui.selected.cards.length > 0 && ui.selected.cards.some(cardx => cardx.name == card.name)) return false;
						return names.includes(card.name)
					})
					.set('complexCard', true)
					.set('ai', (card) => true)
					.forResultCards();
				event.result = { bool: true, cards: cards, cost_data: { names: names } }
			},
			async content(event, trigger, player) {
				const target = _status.currentPhase;
				if (event.cards?.length) {
					const names = event.cost_data.names;
					target.discard(target.getCards('he', (card) => names.includes(card.name) && !event.cards.includes(card)));
				}
				else target.damage('fire', 'nosource');
			},
			group: 'mengwuguiWGR_delete',
			subSkill: {
				delete: {
					audio: 'mengwuguiWGR',
					trigger: {
						player: 'damageEnd'
					},
					frequent: true,
					prompt: '无归：删除你本回合的使用牌记录？',
					filter(event, player) {
						return player.actionHistory[player.actionHistory.length - 1]['useCard']
					},
					async content(event, trigger, player) {
						if (player.stat[player.stat.length - 1])
							for (let i in player.stat[player.stat.length - 1])
								player.stat[player.stat.length - 1][i] = 0

						game.log('<span class="firetext">——已删除</span>', player, '<span class="firetext">的<span class="yellowtext">使用牌</span>记录——</span>');
						player.actionHistory[player.actionHistory.length - 1]['useCard'].length = 0;

						game.getGlobalHistory().useCard = game.getGlobalHistory().useCard.filter(evt => !(evt.name == 'useCard' && evt.player == player))
					},
				}
			}
		},

		meng_sp_shajin: ['砂金', ['male', 'hyyz_xt', 4, ['mengcifuShajin', 'mengsandu', 'mengyazhu'], ['die:meng_shajin']], '囚石铸金-鸦懿鸢霏'],
		mengcifuShajin: {
			audio: 2,
			init(player) {
				player.maxHpx = player.maxHp;
			},
			trigger: {
				player: ['changeHp', 'loseMaxHpAfter', 'gainMaxHpAfter']
			},
			forced: true,
			filter(event, player) {
				return player.hp == 1;
			},
			async content(event, trigger, player) {
				player.removeSkills(event.name);
				game.log(player, "将体力上限调整到" + (player.maxHpx || 4));
				player.maxHp = (player.maxHpx || 4);
				player.update();
			},
			mod: {
				suit(card, suit) {
					const player = get.owner(card) || _status.event.player;
					if (player?.judging?.[0] == card) return 'spade'
				},
			},
			ai: {
				rejudge: true,
				tag: {
					rejudge: -1,
				},
			}
		},
		mengsandu: {
			audio: 'mengyanglu',
			init(player) {
				player.storage.mengsandu = 3;
			},
			mark: true,
			marktext: '三',
			intro: {
				content(storage, player, skill) {
					if (storage > 0) return '剩余可观看' + storage + '张牌'
					return '不能再发动三度'
				}
			},
			trigger: {
				player: "judge",
			},
			filter(event, player) {
				return ui.cardPile.childNodes.length >= 3 && player.storage.mengsandu > 0;
			},
			async cost(event, trigger, player) {
				player.storage.mengsandu--;
				player.markSkill('mengsandu');
				player.when({ global: 'phaseEnd' }).then(() => {
					player.markSkill(event.name);
					player.storage.mengsandu = 3;
				})
				let list = [];
				let all = ui.cardPile.childNodes.length;
				for (let i = 0; i < player.storage.mengsandu + 1; i++) {
					list.add(ui.cardPile.childNodes[all - 1 - i])
				}
				let dialog = ui.create.dialog(get.translation(trigger.player) + "的" + (trigger.judgestr || "") + "判定为" + get.translation(trigger.player.judging[0]) + "，是否发动三度，将其中1张牌作为判定牌", 'hidden');
				dialog.add(list);
				const cards = await player.chooseButton(dialog)
					.set('ai', (button) => {
						const trigger = _status.event.getTrigger();
						const judging = _status.event.judging;
						const result = trigger.judge(button.link) - trigger.judge(judging);
						if (result == 0) return 0;
						return get.attitude2(trigger.player) * result;
					})
					.set("judging", trigger.player.judging[0])
					.forResultLinks();
				if (cards) event.result = {
					bool: true,
					cost_data: {
						cards: cards
					}
				};
			},
			async content(event, trigger, player) {
				const chooseCardResultCards = event.cost_data.cards;
				await player.respond(chooseCardResultCards, "mengsandu", "highlight", "noOrdering");
				if (trigger.player.judging[0].clone) {
					trigger.player.judging[0].clone.classList.remove("thrownhighlight");
					game.broadcast(function (card) {
						if (card.clone) {
							card.clone.classList.remove("thrownhighlight");
						}
					}, trigger.player.judging[0]);
					game.addVideo("deletenode", player, get.cardsInfo([trigger.player.judging[0].clone]));
				}
				game.cardsDiscard(trigger.player.judging[0]);
				trigger.player.judging[0] = chooseCardResultCards[0];
				trigger.orderingCards.addArray(chooseCardResultCards);
				game.log(trigger.player, "的判定牌改为", chooseCardResultCards[0]);
				await game.delay(2);
			},
			ai: {
				rejudge: true,
				skillTagFilter(player, tag, arg) {
					if (!(player.storage.mengsandu > 0)) return false;
					let list = [];
					let all = ui.cardPile.childNodes.length;
					for (let i = 0; i < player.storage.mengsandu + 1; i++) {
						list.add(ui.cardPile.childNodes[all - 1 - i])
					}
					return list.some(card => get.suit(card) != 'spade');
				},
				tag: {
					rejudge: 1,
				},
			}
		},
		mengyazhu: {
			audio: 'mengtuipan',
			trigger: {
				player: 'damageBegin'
			},
			enable: 'phaseUse',
			check(event, player) {
				if (!player.isDamaged()) return false;
				if (player.hasSkill('mengcifuShajin')) return false;
				return get.suit(_status.pileTop) != 'spade' || player.hasSkillTag('rejudge');
			},
			filter(event, player) {
				return ui.cardPile.childElementCount > 0;
			},
			async content(event, trigger, player) {
				const suit = await player
					.judge('mengyazhu', (card) => {
						if (get.suit(card) == 'spade') return -2.5;
						return player.getDamagedHp();
					})
					.set('judge2', (result) => result.bool)
					.forResult('suit');
				if (suit == 'spade') {
					await player.loseMaxHp()
				} else if (player.isDamaged()) {
					await player.draw(player.getDamagedHp())
				}
			},
			ai: {
				order: 10,
				result: {
					player(player) {
						if (!player.isDamaged()) return -1;
						if (player.hasSkill('mengcifuShajin')) return -2.5
						if (player.hasSkillTag('rejudge') || get.suit(_status.pileTop) != 'spade') return 1
						return -2.5
					},
				}
			}
		},

		meng_cuicui: ['翠翠', ['female', 'hyyz_other', 3, ['hyyzgungunlai'], []], '生死远行-拾壹', '若还想与我相见，就来到我的梦里边。'],
		hyyzgungunlai: {
			nobracket: true,
			group: ['hyyzgungunlai_handCard', 'hyyzgungunlai_hp', 'hyyzgungunlai_friend'],
			subSkill: {
				handCard: {
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					prompt: '滚滚来：是否翻面并视为使用【无中生有】？',
					filter(event, player) {
						if (player.countCards("h")) return false;
						const evt = event.getl(player);
						return evt && evt.player == player && evt.hs && evt.hs.length > 0;
					},
					async content(event, trigger, player) {
						await player.turnOver()
						await player.chooseUseTarget({ name: 'wuzhong', isCard: true }, true);
					},
					ai: {
						threaten: 0.8,
						effect: {
							player_use(card, player, target) {
								if (player.countCards("h") === 1) return [1, 0.8];
							},
							target(card, player, target) {
								if (get.tag(card, "loseCard") && target.countCards("h") === 1) return 0.5;
							},
						},
						noh: true,
						skillTagFilter(player, tag) {
							if (tag == "noh") {
								if (player.countCards("h") != 1) return false;
							}
						},
					},
				},
				hp: {
					trigger: {
						player: 'dying'
					},
					filter(event, player) {
						return lib.skill.hyyzgungunlai_hp.hp_hp.has(player.maxHp) != undefined;
					},
					hp_hp: new Map([
						[1, 2],
						[2, 1],
						[3, 4],
						[4, 3],
						[5, 4],
					]),
					//翻转动画窗口创建
					async spinningHp(player, oldMaxHp, newMaxHp) {
						const videoId = lib.status.videoId++;
						const dialog = ui.create.dialog(`${get.translation(player)}翻转了体力牌<br>`, "forcebutton");
						dialog.videoId = videoId;
						//体力卡牌创建
						const hpCard = function (newMaxHp, player) {
							const card = ui.create.card(undefined, "noclick", undefined);
							card.removeEventListener(lib.config.touchscreen ? "touchend" : "click", ui.click.card);
							card.classList.add("button");
							card._customintro = uiintro => uiintro.add(`${get.translation(player)}的体力牌`);
							const fileName = `extension/忽悠宇宙/other/image/meng_cuicui/${lib.config['extension_十周年UI_enable'] ? 'ten_' : ''}hp${newMaxHp}.jpg`;
							new Promise((resolve, reject) => {
								const image = new Image();
								image.onload = resolve;
								image.onerror = reject;
								image.src = `${lib.assetURL}${fileName}`;
							}).then(() => {
								card.classList.add("fullskin");
								if (lib.config['extension_十周年UI_enable']) {
									card.node.image.style['width'] = '108px'
									card.node.image.style['height'] = '150px'
									card.node.image.style['top'] = '0px'
									card.node.image.style['background-size'] = 'contain';
									card.node.image.style['background-repeat'] = 'no-repeat';
								}
								card.node.image.style["background-image"] = `url(${lib.assetURL}${fileName})`
							}, () => { card.node.background.innerHTML = '勾玉' })
							return card;
						};
						const card = hpCard(newMaxHp, player);
						const buttons = ui.create.div(".buttons", dialog.content);
						setTimeout(() => {
							buttons.appendChild(card);
							dialog.open();
							//设置背景图
							card.style["background-image"] = `url(${lib.assetURL}extension/忽悠宇宙/other/image/meng_cuicui/${lib.config['extension_十周年UI_enable'] ? 'ten_' : ''}hp${oldMaxHp}.jpg)`
							ui.create.cardSpinning(card);
						}, 50);
						await game.delay(3);
						game.broadcastAll("closeDialog", videoId);
					},
					prompt: '是否翻面体力牌视为使用【树上开花】？',
					async content(event, trigger, player) {
						//调整动画
						let toMaxHp;
						if (player.storage.hyyzgungunlai_hp) {
							toMaxHp = player.storage.hyyzgungunlai_hp
							delete player.storage.hyyzgungunlai_hp;
						} else {
							toMaxHp = lib.skill.hyyzgungunlai_hp.hp_hp.get(player.maxHp);
							player.storage.hyyzgungunlai_hp = player.maxHp;
						}
						await lib.skill.hyyzgungunlai_hp.spinningHp(player, player.maxHp, toMaxHp);//56/28
						//log图片
						let image1 = '', image2 = '';
						for (let i = 0; i < player.maxHp; i++) {
							image1 += `<img style = 'width:18px; vertical-align: middle;' src='${lib.assetURL}extension/忽悠宇宙/other/image/meng_cuicui/hp.png'>`;
						}
						for (let i = 0; i < toMaxHp; i++) {
							image2 += `<img style = 'width:18px; vertical-align: middle;' src='${lib.assetURL}extension/忽悠宇宙/other/image/meng_cuicui/hp.png'>`;
						}
						game.log(player, "将体力牌从", image1, "翻到", image2);
						//体力变化
						const hp = player.hp;
						if (player.maxHp > toMaxHp) {
							player.maxHp = toMaxHp;
							player.hp = hp;
						} else if (player.maxHp < toMaxHp) {
							const x = toMaxHp - player.maxHp;
							player.maxHp = toMaxHp;
							player.hp = hp + x;
						}
						player.update();
						await game.delay(1);

						await player.chooseUseTarget({ name: 'kaihua', isCard: true }, true);
					}
				},
				friend: {
					trigger: {
						global: ['dieAfter']
					},
					filter(event, player) {
						return player.getFriends(false, true).includes(event.player) && !player.getFriends().length;
					},
					async content(event, trigger, player) {
						const choice = player.identity;
						const videoId = lib.status.videoId++;
						var createDialog = function (player, identity, id) {
							var dialog = ui.create.dialog(`${get.translation(player)}展示了自己的身份牌<br>`, "forcebutton");
							dialog.videoId = id;
							ui.create.spinningIdentityCard(identity, dialog);
						};
						game.broadcastAll(createDialog, player, choice, videoId);
						var color = "";
						if (choice == "zhong") color = "#y";
						else if (choice == "fan") color = "#g";
						else if (choice == "nei") color = "#b";
						game.log(player, "展示了自己的身份牌");
						await game.delay(3);
						game.broadcastAll("closeDialog", videoId);

						player.showIdentity();
						await player.chooseUseTarget({ name: 'meng_jiwang', isCard: true }, true);
					}
				},
			}
		},

		meng_xingjianya: ['星见雅', ['female', 'hyyz_zzz', 3, ['mengliyi', 'mengqixue', 'mengchenling'], ["clan:狐族"]], '九尾归庭-冷若寒', '「小雅知道英雄要做些什么吗？」<br>「要消灭所有坏人！」<br>「英雄可不是为了消灭什么诞生的，而是为了守护哦。」'],
		mengliyi: {
			audio: 4,
			backWater: true,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				markcount(storage, player) {
					return storage ? '得' : '失';
				},
				content(storage, player, skill) {
					let str1 = storage ? `<s>阳：获得</s>` : `<span class='greentext'>阳：获得</span>`
					let str2 = storage ? `<span class='greentext'>阴：失去</span>` : `<s>阴：失去</s>`;
					return '回合结束时，你执行一个仅有本回合' + str1 + str2 + '过牌的阶段的额外回合。' + (
						lib.skill.mengliyi.backWater ? '背水：你移动此项至上个发动的技能。' : '')
				},
			},
			trigger: {
				player: 'phaseAfter'
			},
			filter(event, player) {
				return lib.skill.mengliyi.getTwoHistory(player).some(i => i.length > 0);
			},
			async cost(event, trigger, player) {
				const phaseLists = lib.skill.mengliyi.getTwoHistory(player);
				const dialog = [], controls = [];

				if (!player.storage.mengliyi) {
					if (phaseLists[0].length > 0) {
						dialog.add(`阳：${get.translation(phaseLists[0])}`);
						controls.add('阳');
					} else {
						dialog.add('<s>没有获得牌的阶段</s>');
					}
					if (phaseLists[1].length > 0) dialog.add(`<s>阴：${get.translation(phaseLists[1])}</s>`);
				}
				else {
					if (phaseLists[1].length > 0) {
						dialog.add(`阴：${get.translation(phaseLists[1])}`)
						controls.add('阴');
					} else {
						dialog.add('<s>没有失去牌的阶段</s>');
					}
					if (phaseLists[0].length > 0) dialog.add(`<s>阳：${get.translation(phaseLists[0])}</s>`);
				}

				if (phaseLists.every(i => i.length > 0) && lib.skill.mengliyi.backWater == true &&
					player.getAllHistory('useSkill', (evt) => {
						return ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill)
					}).slice(-1).some(i => i.skill && i.skill != 'mengliyi')
				) controls.add('背水');
				if (!controls.length) return;
				controls.add('cancel2')

				const index = await player
					.chooseControlList(dialog)
					.set('prompt', '逦忆：获得一个只有特定阶段的回合？')
					.set('prompt2', lib.skill.mengliyi.backWater ? '背水：你移动此项至上个发动的技能。' : '')
					.set('controls', controls)
					.set('ai', () => 0)
					.forResult('index')
				if (index != undefined && controls[index] != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: controls[index]
						}
					}
				}
			},
			async content(event, trigger, player) {
				const phaseLists = lib.skill.mengliyi.getTwoHistory(player);
				let phaseList = [];
				let control = event.cost_data.control;
				switch (control) {
					case '阳':
						player.changeZhuanhuanji(event.name)
						phaseList = phaseLists[0];
						break;
					case '阴':
						player.changeZhuanhuanji(event.name)
						phaseList = phaseLists[1];
						break;
					default: {
						player.changeZhuanhuanji(event.name)
						player.changeZhuanhuanji(event.name)
						phaseList = phaseLists.reduce((sum, list) => sum.addArray(list), [])
						const lastSkill = player.getAllHistory('useSkill', (evt) => ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill)).slice(-2, -1)[0].skill;
						for (const name of ['mengliyi', 'mengqixue', 'mengchenling']) {
							if (name == lastSkill) {
								if (!lib.skill[name].backWater) {
									lib.skill[name].backWater = true;
									game.log('#g【' + get.translation(name) + '】', '#y增加背水');
								}
							} else {
								if (lib.skill[name].backWater) {
									lib.skill[name].backWater = false;
									game.log('#g【' + get.translation(name) + '】', '#r移除背水');
								}
							}
						}
					}
				}
				phaseList.sort((a, b) => {
					const list = lib.phaseName.slice(0);
					return list.indexOf(a) > list.indexOf(b)
				})
				player.insertPhase('mengliyi').set('phaseList', phaseList);
			},
			getTwoHistory(player) {
				const loses = [];
				player.getHistory('lose', evt => {
					if (!evt.getl(player)?.cards2.length) return false;
					let name = lib.phaseName.find(i => evt.getParent(i).name == i)
					if (name) loses.add(name);
				});
				const gains = [];
				player.getHistory('gain', evt => {
					if (!evt.getg(player).length) return false;
					let name = lib.phaseName.find(i => evt.getParent(i).name == i)
					if (name) gains.add(name);
				});
				return [gains, loses];
			},
		},
		mengqixue: {
			audio: 9,
			backWater: false,
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				return event.targets.length > 0;
			},
			async cost(event, trigger, player) {
				const targetsx = game.filterPlayer();
				game.getGlobalHistory('everything', (evt) => {
					switch (evt.name) {
						case 'changeHp': if (evt.num != 0) targetsx.remove(evt.player); break;
						case 'lose': if (evt.getl && evt.getl(evt.player)?.hs.length > 0) targetsx.remove(evt.player); break;
						case 'gain': {
							if (evt.getg(evt.player).length) targetsx.remove(evt.player);
							game.hasPlayer2(current => {
								if (evt.getl && evt.getl(current)?.hs.length) targetsx.remove(current)
							})
							break;
						}
						default: return false;
					}
				})
				const targets = targetsx.filter(i => trigger.targets.includes(i) && i.isIn());
				if (!targets.length) return;

				//存在多目标 且 上个技能不是自己
				if (lib.skill.mengqixue.backWater && targets.length > 1 &&
					player.getAllHistory('useSkill', (evt) => ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill)).slice(-1).some(i => i.skill && i.skill != 'mengqixue')
				) {
					const index = await player
						.chooseControlList(['一个目标', '所有目标（' + get.translation(targets) + '）'], false)
						.set('prompt', '泣雪：你可对一个目标或所有目标（背水）造成1点冰冻伤害')
						.set('ai', () => {
							if (targets.every(i => get.damageEffect(i, player, player, 'ice') > 0)) return 1;
							if (targets.some(i => get.damageEffect(i, player, player, 'ice') > 0)) return 0;
							return false;
						})
						.forResult('index');
					if (index == 0) {
						event.result = await player
							.chooseTarget('泣雪：对一个目标造成1点冰冻伤害', true, (card, player, target) => targets.includes(target))
							.set('ai', (target) => get.damageEffect(target, player, player, 'ice'))
							.forResult()
					} else if (index == 1) {
						event.result = {
							bool: true,
							targets: targets,
							cost_data: {
								backWater: true,
							}
						}
					}
				} else {
					event.result = await player
						.chooseTarget('泣雪：你可对一个目标造成1点冰冻伤害', (card, player, target) => targets.includes(target))
						.set('ai', (target) => get.damageEffect(target, player, player, 'ice'))
						.forResult();
				}
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				if (event.cost_data?.backWater) {
					const lastSkill = player.getAllHistory('useSkill', (evt) => ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill)).slice(-2, -1)[0].skill;
					for (const name of ['mengliyi', 'mengqixue', 'mengchenling']) {
						if (name == lastSkill) {
							if (!lib.skill[name].backWater) {
								lib.skill[name].backWater = true;
								game.log('#g【' + get.translation(name) + '】', '#y增加背水');
							}
						} else {
							if (lib.skill[name].backWater) {
								lib.skill[name].backWater = false;
								game.log('#g【' + get.translation(name) + '】', '#r移除背水');
							}
						}
					}
				}
				for (let targets of event.targets) await targets.damage(player, 'ice')

			},
			//group: ['mengqixue_log'],
			subSkill: {
				log: {
					trigger: {
						player: 'useCard1',
						global: ['loseAfter', 'gainAfter', 'changeHp']
					},
					silent: true,
					charlotte: true,
					filter(event, player) {
						if (event.name == 'useCard') return true;
						if (!player.storage.mengqixue?.length) return false;
						switch (event.name) {
							case 'lose':
								return event.getl && event.getl(event.player).hs.length > 0;
							case 'gain':
								if (event.getg && event.getg(event.player).length > 0) return true;
								for (const current of game.filterPlayer2()) {
									if (event.getl && event.getl(current).hs.length) return true;
								}
								return false;
							case 'changeHp':
								return event.num != 0;
						}
					},
					async content(event, trigger, player) {
						if (trigger.name == 'useCard') player.storage.mengqixue = game.filterPlayer2();//使用牌时检测所有角色
						else {
							switch (trigger.name) {
								case 'lose':
									player.storage.mengqixue.remove(trigger.player);//一旦触发，这个角色就移除，剩下未改变的角色
									break;
								case 'gain':
									if (trigger.getg && trigger.getg(trigger.player).length > 0) player.storage.mengqixue.remove(trigger.player);
									for (const current of game.filterPlayer2()) {
										if (trigger.getl && trigger.getl(current).hs.length) player.storage.mengqixue.remove(current);
									}
									break;
								case 'changeHp':
									player.storage.mengqixue.remove(trigger.player); break;
							}
						}

					},
				},
			}
		},
		mengchenling: {
			backWater: false,//星见雅独有检测标签
			audio: 4,
			audioname2: {
				meng_xingjianya: 'mengchenling_meng_xingjianya',
				meng_yvkong: 'mengchenling_meng_yvkong',
			},
			subSkill: {
				meng_xingjianya: { audio: 4 },
				meng_yvkong: { audio: 4 },
			},
			clanSkill: true,
			mark: true,
			marktext: "☯",
			zhuanhuanji(player, skill) {
				player.storage[skill] = !player.storage[skill]
				player.updateMark(skill)
			},
			intro: {
				markcount(storage, player) {
					if (!storage && _status.event.getParent('phase').skill != undefined) return '✓'
					if (storage) return '×';
					return '〇'
				},
				content(storage, player, skill) {
					const main = '宗族技，转换技，你使用牌时' + storage ? `阳：若于额外回合，你可令一名同族角色检索一张锦囊牌。` : `阴：无效。`

					let other = '';
					if (get.nameList(player).includes('meng_xingjianya')) other += (lib.skill.mengchenling.backWater ? '背水：你移动此项至上个发动的技能。' : '');
					return main + other
				},
			},
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				if (!game.hasPlayer((current) => current.hasClan("狐族"))) return false;
				if (!player.storage.mengchenling) return event.getParent('phase')?.skill;//阳检索
				return true//阴无效
			},
			async cost(event, trigger, player) {
				const dialog = [], controls = [];
				//阳
				if (!player.storage.mengchenling && trigger.getParent('phase')?.skill && game.hasPlayer((current) => current.hasClan("狐族"))) {
					dialog.add('阳：令一名同族角色检索一张锦囊牌')
					controls.add('阳')
				}
				//阴
				if (player.storage.mengchenling) {//发动过
					dialog.add('阴：无效')
					controls.add('阴')
				}
				//背水//星见雅专属//其他人没有
				const history = player.getAllHistory('useSkill', (evt) => ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill))
					.slice(-1).filter(i => i.skill && i.skill != 'mengchenling')
				if (dialog.length > 1 && lib.skill.mengchenling.backWater && history.length) controls.add('背水')

				if (!dialog.length) return;//没有长度就取消
				if (controls.length == 1) {
					event.result = {
						bool: true,
						cost_data: {
							control: controls[0]
						}
					}
				} else if (controls.length > 1 && controls.includes('背水')) {//背水//星见雅专属//其他人没有
					const index = await player.chooseControlList(dialog)
						.set('prompt', '沉陵：你可以选择一项')
						.set('prompt2', '背水：你移动此项至上个发动的技能' + get.translation(history[0].skill))
						.set('controls', controls)
						.set('ai', () => controls.length - 2)
						.forResult('index');
					if (index != undefined) {
						event.result = {
							bool: true,
							cost_data: {
								control: controls[index]
							}
						}
					}
				}
			},
			async content(event, trigger, player) {
				const control = event.cost_data.control;
				if (control == '背水') {//背水//星见雅专属
					player.changeZhuanhuanji(event.name)
					player.changeZhuanhuanji(event.name)
					const lastSkill = player.getAllHistory('useSkill', (evt) => ['mengliyi', 'mengqixue', 'mengchenling'].includes(evt.skill)).slice(-2, -1)[0].skill;
					for (const name of ['mengliyi', 'mengqixue', 'mengchenling']) {
						if (name == lastSkill) {
							if (!lib.skill[name].backWater) {
								lib.skill[name].backWater = true;
								game.log('#g【' + get.translation(name) + '】', '#y增加背水');
							}
						} else {
							if (lib.skill[name].backWater) {
								lib.skill[name].backWater = false;
								game.log('#g【' + get.translation(name) + '】', '#r移除背水');
							}
						}
					}
				}
				if (control == '阳' || control == '背水') {
					if (trigger.getParent('phase')?.skill != undefined) {
						let targets = game.filterPlayer(current => current.hasClan("狐族"));
						if (targets.length > 1) {
							targets = await player
								.chooseTarget(true, '令一名同族角色检索一张锦囊牌', (card, player, target) => {
									return target.hasClan("狐族")
								})
								.set('ai', (target) => get.attitude2(target))
								.forResultTargets();
						}
						if (!targets) return;
						player.changeZhuanhuanji(event.name)
						//检索锦囊牌
						let tops = [];
						while (true) {
							const card = get.cards()[0];
							await game.cardsGotoOrdering(card);
							const judgestr = `${get.translation(player)}亮出第${get.cnNumber(tops.length + 1, true)}张牌`,
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
							await game.delayx(1);
							game.broadcastAll(id => {
								const dialog = get.idDialog(id);
								if (dialog) dialog.close();
								ui.arena.classList.remove("thrownhighlight");
							}, videoId);
							game.addVideo("judge2", null, videoId);
							if (get.type(card) == 'trick') {
								await targets[0].gain(card, 'gain2');//获得
								game.broadcastAll(() => ui.clear());
								await game.cardsDiscard(tops);
								break;
							} else {
								tops.add(card);
							}
						}
					}
				}
				if (control == '阴' || control == '背水') {
					player.changeZhuanhuanji(event.name)
					trigger.excluded.addArray(game.filterPlayer())
				}
			},
			ai: {
				effect: {
					player(card, player, target) {
						const storage = player.storage.mengchenling
						if (!storage && _status.event.getParent('phase').skill != undefined) return [1, 1.5];
						if (storage) return 0.1;
						return 1
					}
				}
			}
		},

		meng_xier: ['希儿', ['female', 'hyyz_b3', 3, ['mengxiaoxiao'], ['die:meng_white_xier']], '拾壹', ''],
		mengxiaoxiao: {
			audio: 'mengmingguang',
			forced: true,
			trigger: {
				player: 'useCard'
			},
			filter(event, player) {
				return event.card.name == 'sha';
			},
			async content(event, trigger, player) {
				trigger.cancel();
				let tops = [];
				while (true) {
					const card = get.cards()[0];
					await game.cardsGotoOrdering(card);
					const judgestr = `${get.translation(player)}亮出的第${get.cnNumber(tops.length + 1, true)}张【萧萧】牌`,
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
					if (card.name == 'sha') {
						await player.gain(card, 'gain2')
						game.broadcastAll(() => ui.clear());

						while (tops.some(card => !get.tag(card, 'damage') && player.hasUseTarget(card, true, false))) {
							const bool = await player.chooseToRespond('打出一张杀以使用其中的非伤害牌', { name: "sha" }).set("ai", () => true).forResultBool();
							if (bool) {
								const links = await player
									.chooseButton(true, ['使用其中一张非伤害牌', tops])
									.set('filterButton', (button) => {
										let card = button.link;
										return !get.tag(card, 'damage') && player.hasUseTarget(card, true, false)
									})
									.forResultLinks();
								if (links) {
									tops.remove(links[0]);
									await player.chooseUseTarget(links[0], true, false)
								} else break;
							}
							else break;
						}
						await game.cardsDiscard(tops);
						break;
					} else {
						tops.add(card);
					}
				}
			},
		},

		meng_daheita: ['大黑塔', ['female', 'hyyz_xt', 4, ['mengqiuda'], []], '三顾博识-鸦懿鸢霏', '有什么问题能难倒无所不知的大机械头?'],
		mengqiuda: {
			audio: 6,
			logAudio: () => false,
			init(player) {
				player.storage.mengqiuda = 3;
			},
			trigger: {
				player: ["loseAfter", "mengwenshen_use"],
				global: ["phaseBefore", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player, name) {
				if (name == 'phaseBefore') return game.phaseNumber == 0;
				const hs = player.countCards('h', (card) => card.hasGaintag('mengwenshen_g'));
				let skills = [];
				if (hs >= player.storage.mengqiuda) skills.add('mengdayi');
				if (hs <= player.storage.mengqiuda) skills.add('mengwenshen');
				if (event.getg && event.getg(player).length || event.getl && event.getl(player).hs.length)
					return true;
			},
			forced: true,
			async content(event, trigger, player) {
				const hs = player.countCards('h', (card) => card.hasGaintag('mengwenshen_g'));
				let skills = [];
				if (hs >= player.storage.mengqiuda) skills.add('mengdayi');
				if (hs <= player.storage.mengqiuda) skills.add('mengwenshen');
				player.addAdditionalSkills('mengqiuda', skills);
			},
			derivation: ['mengwenshen', 'mengdayi'],
		},
		mengwenshen: {
			audio: 'mengqiuda',
			trigger: {
				player: "phaseDrawBegin1",
			},
			filter(event, player) {
				return !event.numFixed;
			},
			async cost(event, trigger, player) {
				const control = await player.chooseControl('牌堆顶', '牌堆底', 'cancel2')
					.set('ai', () => '牌堆底')
					.set('prompt', '问神：改为从哪里摸牌？')
					.forResultControl();
				if (control != 'cancel2') event.result = {
					bool: true,
					cost_data: {
						control: control
					}
				}
			},
			async content(event, trigger, player) {
				trigger.changeToZero();
				const next = player.draw(2);
				if (player.hasSkill('mengqiuda')) next.gaintag = ['mengwenshen_g'];
				if (event.cost_data.control == '牌堆底') next.bottom = true;
				await next;
				player.storage.mengwenshen_use = event.cost_data.control;
				player.when({
					player: 'phaseAfter'
				}).then(() => (delete player.storage.mengwenshen_use))
			},
			group: 'mengwenshen_use',
			subSkill: {
				use: {
					audio: 'mengwenshen',
					onremove: true,
					enable: 'phaseUse',
					filter(event, player) {
						return ['牌堆顶', '牌堆底'].includes(player.storage.mengwenshen_use)
					},
					async content(event, trigger, player) {
						const cards = (player.storage.mengwenshen_use == '牌堆顶' ? get.cards() : get.bottomCards());
						await player.showCards(cards, get.translation(player) + "发动了【问神】");
						await game.cardsGotoOrdering(cards);
						const tags = player.getCards('h', (card) => card.hasGaintag('mengwenshen_g'));
						if (tags.some(card => get.type2(card) == get.type2(cards[0]))) {
							game.log('#g类型相同')
							if (player.hasSkill('mengqiuda')) player.gain(cards, 'gain2').gaintag.add("mengwenshen_g")
							else player.gain(cards, 'gain2')
						} else {
							if (player.hasSkill('mengqiuda')) {
								player.storage.mengqiuda--;
								player.when({ global: 'phaseEnd' }).then(() => (player.storage.mengqiuda = 3))
								event.trigger('mengwenshen_use')
							}
							game.log('#r类型不同')
							await game.cardsDiscard(cards);
						}
					},
					ai: {
						order: 10,
						result: {
							player: 1
						}
					}
				},
			}
		},
		mengdayi: {
			audio: 'mengqiuda',
			enable: 'phaseUse',
			filter(event, player) {
				const tags = player.getCards('h', (card) => card.hasGaintag('mengwenshen_g'));
				return tags.some(i => tags.some(j => get.type2(i) == get.type2(j) && i != j));
			},
			filterCard(card) {
				if (!card.hasGaintag('mengwenshen_g')) return false;
				if (ui.selected.cards.length) {
					return get.type2(ui.selected.cards[0]) == get.type2(card);
				}
				return true;
			},
			selectCard() {
				const player = _status.event.player;
				return Math.max(1, player.getHistory('useSkill', (evt) => evt.skill == 'mengdayi').length);
			},
			complexCard: true,
			async content(event, trigger, player) {
				const list = [];
				for (const name of lib.inpile) {
					if (get.type2(name) != get.type2(event.cards[0])) continue;
					if (get.type2(name) == "trick") list.push(["锦囊", "", name]);
					else if (get.type(name) == "basic") list.push(["基本", "", name]);
					else if (get.type(name) == "equip") list.push(["装备", "", name]);
				}
				const next = player.chooseButton(['答疑：声明一个牌名去检索', [list, 'vcard']]);
				next.set('forced', true);
				next.set('ai', function (button) {
					let val = _status.event.player.getUseValue({ name: button.link[2] });
					if (['sha', 'shan', 'tao'].includes(button.link[2])) val += 20;
					return val;
				});
				const links = await next.forResultLinks();
				if (links) {
					const name = links[0][2];
					let card;
					const control = await player.chooseControl('牌堆顶', '牌堆底').set('prompt', '从哪里开始检索？').forResultControl();
					if (control == '牌堆顶') {
						for (let i = 0; i < ui.cardPile.childNodes.length; i++) {
							if (ui.cardPile.childNodes[i].name == name) card = ui.cardPile.childNodes[i];
						}
					} else {
						for (let i = ui.cardPile.childNodes.length; i > 0; i--) {
							if (ui.cardPile.childNodes[i - 1].name == name) card = ui.cardPile.childNodes[i - 1];
						}
					}
					if (card) player.gain(card, 'gain2');
					else game.log(player, '未得到解答')
				}
			},
		},

		meng_fuxuan: ['符玄', ['female', 'hyyz_xt', 5, ['mengfayan', 'mengqiongguanFSXS'], ['die:meng_fuxuan']], '浮生闲事', ''],
		mengfayan: {
			audio: "mengjianzhi",
			init(player) {
				player.storage.mengfayan = 1;
			},
			trigger: {
				global: 'phaseJieshuBegin'
			},
			round: 1,
			logTarget: 'player',
			filter(event, player) {
				return player.storage.mengfayan > 0 && event.player.countCards('h') > 0
			},
			async content(event, trigger, player) {
				const tops = get.cards(3);
				await game.cardsGotoOrdering(tops);
				//const cards = [ui.cardPile.childNodes[0], ui.cardPile.childNodes[1], ui.cardPile.childNodes[2]];
				const hs = trigger.player.getCards("h"), num = Math.min(player.storage.mengfayan, hs.length, 3);

				const links = await player
					.chooseButton(["法眼：选择要操作的牌", '<div class="text center">' + get.translation(trigger.player) + "的手牌</div>", hs, '<div class="text center">牌堆顶</div>', tops], 2 * num)
					.set("filterButton", function (button) {
						const num = _status.event.num;
						if (ui.selected.buttons.length) {
							if (ui.selected.buttons.filter(i => get.position(i.link) == 'h').length < num) {
								if (get.position(button.link) == 'h') return true;
							}
							if (ui.selected.buttons.filter(i => get.position(i.link) != 'h').length < num) {
								if (get.position(button.link) != 'h') return true;
							}
							return false;
						}
						return true;
					})
					.set("cards1", hs).set('target', trigger.player).set('num', num)
					.set("ai", function (button) {
						const card = button.link, hs = _status.event.cards1.slice(0),
							target = _status.event.target, att = get.attitude2(target);
						if (hs.includes(card)) {
							if (att > 0) return 10 - get.value(card);
							return get.value(card);
						} else {
							if (att > 0) return get.value(card);
							return 10 - get.value(card);
						}
					})
					.set('forced', true)
					.forResultLinks();
				if (links) {
					const move_h = links.filter(i => hs.includes(i)), move_top = links.filter(i => tops.includes(i));
					for (let i = 0; i < num; i++) {//换num张牌
						const index1 = tops.indexOf(move_top[i])//牌堆顶此牌的位置
						tops[index1] = move_h[i];//手牌=》牌堆顶

						const index2 = hs.indexOf(move_h[i])//手牌此牌的位置
						hs[index2] = move_top[i];//牌堆顶=》手牌
						if (player.hasSkill('mengqiongguanFSXS')) {
							player.storage.mengqiongguanFSXS.add(move_h[i]);
							player.markSkill('mengqiongguanFSXS')
						}
					}
					tops.reverse();
					game.log(player, '将', trigger.player, '的', tops.filter(i => trigger.player.getCards('h').includes(i)), '替换了牌堆顶的', hs.filter(i => !trigger.player.getCards('h').includes(i)))
					for (let card of tops) {
						if (trigger.player.getCards('h').includes(card)) {
							await trigger.player.lose(card, ui.cardPile, 'insert');
							trigger.player.$throw(card, 1000);
						} else {
							card.fix();
							ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
						}
					}
					await trigger.player.gain(hs.filter(i => !trigger.player.getCards('h').includes(i)), 'draw');
					game.updateRoundNumber();
					await game.delayx(2)
				}
				//game.log(ui.cardPile.childNodes[0], ui.cardPile.childNodes[1], ui.cardPile.childNodes[2])
			},
		},
		mengqiongguanFSXS: {
			audio: "mengqiongguan",
			init(player) {
				player.storage.mengqiongguanFSXS = [];
			},
			mark: true,
			intro: {
				mark(dialog, storage, player) {
					if (storage?.length > 0) {
						dialog.addSmall(storage);
					} else {
						dialog.addText(`没有正面朝上的牌`)
					}
				}
			},
			trigger: {
				global: ['gainAfter', 'loseAfter']
			},
			filter(event, player) {
				if (event.name == 'lose') {
					player.storage.mengqiongguanFSXS = player.storage.mengqiongguanFSXS.filter(card => {
						return get.cardPile(cardx => card == cardx);
					})
					player.markSkill('mengqiongguanFSXS')
					return;
				}
				let cards = event.getg(event.player).concat(event.cards)
				return cards.some(i => player.storage.mengqiongguanFSXS.includes(i));
			},
			async cost(event, trigger, player) {
				const gains = trigger.getg(trigger.player).concat(trigger.cards)
				let num = 0;
				for (let i of player.storage.mengqiongguanFSXS) {
					if (gains.includes(i)) {
						num++;
						player.storage.mengqiongguanFSXS.remove(i)
						player.markSkill('mengqiongguanFSXS')
					}
				}
				const controls = ['与' + get.translation(trigger.player) + '各摸' + num + '张牌'];
				if (player.storage.mengfayan < 3) controls.add('令“法眼”中的数字+1');
				const index = await player.chooseControlList(controls).set('ai', () => controls.length - 1).forResult('index');
				if (index != undefined && controls[index] != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							control: controls[index],
							num: num,
						}
					}
				}
			},
			async content(event, trigger, player) {
				const num = event.cost_data.num, control = event.cost_data.control;
				if (control.startsWith('令')) {
					player.storage.mengfayan++;
				} else {
					game.asyncDraw([player, trigger.player], num, undefined, true)
				}
			}
		},

		meng_zhigengniao: ['知更鸟', ['female', 'hyyz_xt', 3, ['menghesong', 'mengxiezou'], []], '小浣熊', ''],
		menghesong: {
			audio: 5,
			trigger: {
				global: 'useCardAfter'
			},
			usable: 1,
			filter(event, player) {
				return game.hasAllGlobalHistory('everything', (evt) => {
					return evt.name == 'damage' && evt.card == event.card && evt.num > 1
				});
			},
			direct: true,
			async content(event, trigger, player) {
				const bool = await player.chooseUseTarget({
					name: trigger.card.name,
					storage: { menghesong: true },
					isCard: true
				}, false).set('logSkill', event.name).forResultBool();
				if (bool) {
					const historys = player.getHistory('sourceDamage', (evt) => evt.card.storage.menghesong && evt.num > 0);
					if (historys?.length) {
						let num1, num2, dam;
						game.hasAllGlobalHistory('everything', (evt) => {
							if (evt.name == 'damage' && evt.card == trigger.card && evt.num > 1) {
								num1 = evt.num;
								dam = evt.player;
							}
						});
						num2 = historys[historys.length - 1].num;
						if (num1 == num2) {
							player.line(trigger.player, 'green');
							trigger.player.draw();
						} else {
							player.line(dam, 'green');
							dam.recover();
						}
					}
				} else {
					delete player.storage.counttrigger.menghesong
				}
			},
		},
		mengxiezou: {
			audio: 3,
			init(player) {
				player.storage.mengxiezou = [false, false]//- +
				player.storage.mengxiezoux = 0;
			},
			trigger: {
				global: 'damageBegin1'
			},
			filter(event, player) {
				if (!player.countCards('h') && !event.player.countCards('h') && event.player != player) return false;
				return event.source && player.storage.mengxiezou.filter(i => !i).length > 0 && player.storage.mengxiezoux < 2;
			},
			async cost(event, trigger, player) {
				if (player == trigger.source) {
					let list = [];
					if (!player.storage.mengxiezou[0]) list.add('-1')
					if (!player.storage.mengxiezou[1]) list.add('+1')
					const control = await player
						.chooseControl(list, 'cancel2')
						.set('ai', () => {
							if (get.damageEffect(trigger.player, trigger.source, player, get.nature(trigger)) > 0 &&
								!player.storage.mengxiezou[1]) return '+1'
							if (get.damageEffect(trigger.player, trigger.source, player, get.nature(trigger)) < 0 &&
								!player.storage.mengxiezou[0]) return '-1'
							return false;
						})
						.set('prompt', `协奏：令${get.translation(trigger.source)}对${get.translation(trigger.player)}的伤害`)
						.forResultControl()
					if (control != 'cancel2') event.result = {
						bool: true,
						cost_data: {
							control: control
						}
					}
				} else {
					event.result = await player
						.chooseBool(`###协奏：与${get.translation(trigger.source)}均分手牌###令${get.translation(trigger.source)}对${get.translation(trigger.player)}的伤害修改？`)
						.set('ai', () => {
							if (get.attitude2(trigger.source) > 0) return true;
							if (get.attitude2(trigger.player) > 0 && trigger.player.isMinHp() && player.countCards('h') - trigger.source.countCards('h') < 2) return true;
							if (trigger.source.countCards('h') > player.countCards('h')) return true;
							return false;
						})
						.forResult();
				}
			},
			async content(event, trigger, player) {
				player.storage.mengxiezoux++;
				const control = event.cost_data?.control;
				if (control != undefined) {
					if (control == '+1') {
						player.storage.mengxiezou[1] = true
						trigger.num++;
					}
					else {
						player.storage.mengxiezou[0] = true
						trigger.num--;
					}
				} else {
					const controls = [];
					controls.add(['你的手牌', player.getCards('h')])
					controls.add([get.translation(trigger.source) + '的手牌', trigger.source.getCards('h')])

					const next = player.chooseToMove()
					next.set("prompt", "协奏：均分你们的手牌且差值不能大于1");
					next.set("list", controls);
					next.set("filterMove", (from, to, moved) => {
						if (moved[0].length >= moved[1].length && to == 0) return false;
						if (moved[1].length >= moved[0].length && to == 1) return false;
						return true;
					});
					next.set("filterOk", (moved) => {
						return Math.abs(moved[0].length - moved[1].length) <= 1;
					});
					next.set("processAI", (list) => {
						const cards = list[0][1];
						if (list.length > 1) cards.addArray(list[1][1]);
						cards.sort((a, b) => get.value(b) - get.value(a));
						const results = list.length > 1 ?
							[cards.slice(0, Math.ceil(cards.length / 2)), cards.slice(Math.ceil(cards.length / 2), cards.length)]
							:
							[cards];
						if (get.damageEffect(trigger.player, trigger.source, player, get.nature(trigger)) > 0 &&
							results.length > 1 && results[0].length > results[1].length) {
							results[1].add(results[0].pop());
						}
						return results;
					});
					const moved = await next.forResult('moved');
					if (moved) {
						await player.swapHandcards(trigger.source,
							moved[1].filter(a => !trigger.source.countCards('h', b => a == b)),
							moved[0].filter(a => !player.countCards('h', b => a == b)),
						);
						if (player.countCards('h') > trigger.source.countCards('h') && !player.storage.mengxiezou[0]) {
							trigger.num--;
							player.storage.mengxiezou[0] = true
						}
						if (trigger.source.countCards('h') > player.countCards('h') && !player.storage.mengxiezou[1]) {
							trigger.num++;
							player.storage.mengxiezou[1] = true
						}
					}
				}
				player.when({ global: 'roundStart' }).then(() => {
					player.storage.mengxiezou = [false, false]
					player.storage.mengxiezoux = 0;
				})
			},
		},

		"mengyiyv_info": "医愈|你的❤牌可当做【桃】使用。你不能对其他角色使用【桃】和【桃园结义】。第三轮开始时，你升级〖医愈〗。",
		"mengyiyv_rewrite_info": "医愈|你的红色牌可当做【桃】使用。出牌阶段限一次，你可以对其他角色使用【桃】。",
		"mengyvzan_info": "誉赞|一名角色因你使用牌回复体力后，你摸一张牌，若实体牌包含非基本牌，改为摸两张牌。",
		"mengyirong_info": "易容|限定技，其他角色濒死结算完成后未脱离濒死状态，体力上限将减少至0时，你可以将其的体力上限调整至3，体力调整至2，然后你翻面。若你〖医愈〗为1级，你升级〖医愈〗。",
		"mengwendao_info": "问道|准备阶段，你可以观看牌堆顶任意张牌，然后无距离次数限制使用其中点数不同的牌。若如此做，结束阶段，你失去以此法观看但未使用牌数点体力。",
		"mengruoxi_info": "若昔|你每回合使用的第x张牌视为【无中生有】，然后获得其第×张牌（x为此牌目标体力值）。",
		"mengwuguiWGR_info": "勿归|当你的区域进入与你的牌同牌名的牌时，当前回合角色受到一点火焰伤害或你弃置你区域内该牌名的牌至一张。你受到伤害后，视为本回合未使用过牌。",
		"mengcifuShajin_info": "赐福|锁定技，你的判定牌花色始终为♠。当你体力值为1时，你失去此技能并将体力上限调整至游戏开始时。",
		"mengsandu_info": "三度|当你进行判定时，你观看牌堆底3张牌，然后你可以将其中1张牌作为判定牌。当你判定生效后，你观看的牌数－1直到回合结束。",
		"mengyazhu_info": "押注|出牌阶段或当你即将受到伤害时，你可以进行判定:若为♠，你减1点体力上限，否则你摸x张牌。（x为你的已损失体力值）",
		"hyyzgungunlai_info": "滚滚来|你失去最后的手牌/体力/队友时，可将你的武将牌/体力牌/身份牌翻面并视为使用一张【无中生有】/【树上开花】/【继往开来】。",
		"mengliyi_info": "逦忆|转换技，回合结束时，你执行一个仅有本回合阳：获得过牌，阴：失去过牌的阶段的额外回合。背水：你移动此项至上个发动的技能。",
		"mengqixue_info": "泣雪|你使用牌结算完成后，你可对本回合未变化过手牌与体力的一个目标造成1点冰冻伤害。",
		"mengchenling_info": "沉陵|宗族技，转换技，你使用牌时，阳：若于额外回合，你可令一名狐族角色检索一张锦囊牌。阴：无效。",
		"mengxiaoxiao_info": "萧萧|锁定技，你使用的【杀】的效果改为检索一张【杀】，然后你可打出任意张【杀】以使用检索过程中等量张非伤害牌。",
		"mengqiuda_info": "求答|锁定技，当你「智」牌数：不小于3，你视为拥有「答疑」:不大于3，你视为拥有「问神」。你因「问神」获得的牌视为「智」牌。",
		"mengwenshen_g": "智",
		"mengwenshen_info": "问神|摸牌阶段，你可以改为从牌堆顶/底摸2张牌。出牌阶段，你可以亮出牌堆底/顶1张牌，若与任意1张「智」牌类型相同则获得之，否则令「求答」的所有数字-1直到回合结束。",
		"mengdayi_info": "答疑|出牌阶段，你可以弃置x张同类型的「智」牌，然后声明一种与这些牌同类型的牌名，从牌堆顶/底检索之。(x为本回合发动次数且至少为1)",
		"mengfayan_info": "法眼|每轮限一次，一名角色的结束阶段，你可以观看牌堆顶的三张牌并可交换其中的1张牌，然后将这些牌置于牌堆顶，被交换的那张牌正面朝上。",
		"mengqiongguanFSXS_info": "穷观|当有角色从牌堆中获得正面朝上的牌时，你可以与其各摸一张牌堆底的牌或令“法眼”中的数字+1。",
		"menghesong_info": "合颂|每回合限一次，有角色使用牌造成大于1的伤害后，在此牌结算后你可视为使用一张同名牌。若你因此造成的伤害值与其造成的伤害值：相同，其摸一张牌；不相同，你令受伤角色回复1点体力。",
		"mengxiezou_info": "协奏|每轮每项各限一次，一名角色造成伤害时，你可观看并分配你与其的手牌且差值不能大于1。若因此你的手牌数大于/小于其（若为你无此条件），此伤害-1/+1。"
	},
}, dynamicTranslates = {
	//黑天鹅
	mengshuijing(player) {
		let num;
		if (player.storage.mengshuijing_num < 1) num = `<span class="firetext">${player.storage.mengshuijing_num}</span>`;
		else if (player.storage.mengshuijing_num == 1) num = `<span class="thundertext">${player.storage.mengshuijing_num}</span>`;
		else if (player.storage.mengshuijing_num > 1) num = `<span class="greentext">${player.storage.mengshuijing_num}</span>`;
		return '出牌阶段限一次，你可以暗选一名角色。该角色的回合结束时，若其本轮执行过：①造成' + num + '点伤害。②弃置' + num + '张牌。其对自己执行满足项的效果，你对自己执行其未满足项的效果，然后重置此技。'
	},
	//温迪
	menggongdan(player) {
		const key = lib.skill.menggongdan.key;
		return `转换技，锁定技，你使用【杀】时，<br>阳：${key[0]}。<br>阴：${key[1]}。<br>然后，交换与琴心同名的一对选项。`;
	},
	mengqinxin(player) {
		const key = lib.skill.mengqinxin.key;
		return `转换技，限定技，你使用锦囊牌时，<br>阳：${key[0]}。<br>阴：${key[1]}。<br>此牌造成伤害后，摸与之等量的牌，<br>若手牌唯一最多，分配你超出的牌。`
	},
	//雅雅
	mengliyi(player) {
		let str = player.storage.mengliyi ? '阳：获得过牌，<span class="legendtext">阴：失去过牌的阶段的额外回合。</span>' : '<span class="legendtext">阳：获得过牌，</span>阴：失去过牌的阶段的额外回合。';
		return '转换技，回合结束时，你执行一个仅有本回合' + str +
			(lib.skill.mengliyi.backWater ? '<span class="bluetext">背水：你移动此项至上个发动的技能。</span>' : '')
	},
	mengqixue() {
		return '你使用牌结算完成后，若所有目标均未变化过手牌与体力，你可对一个目标造成1点冰冻伤害。' +
			(lib.skill.mengqixue.backWater ? '<span class="bluetext">背水：你移动此项至上个发动的技能。</span>' : '')
	},
	mengchenling(player) {
		let str = player.storage.mengchenling ? '阳：若于额外回合，你可令一名同族角色检索一张锦囊牌。<span class="legendtext">阴：无效。</span>' : '<span class="legendtext">阳：若于额外回合，你可令一名同族角色检索一张锦囊牌。</span>阴：无效。';
		return '宗族技，转换技，你使用牌时，' + str +
			(lib.skill.mengchenling.backWater ? '<span class="bluetext">背水：你移动此项至上个发动的技能。</span>' : '')
	},
	//大黑塔
	mengqiuda(player) {
		if (player.storage.mengqiuda) return `锁定技，当你「智」牌数：不小于<span class='greentext'>${player.storage.mengqiuda}</span>，你视为拥有「答疑」:不大于<span class='greentext'>${player.storage.mengqiuda}</span>，你视为拥有「问神」。你因「问神」获得的牌视为「智」牌。`
		return '锁定技，当你「智」牌数：不小于3，你视为拥有「答疑」:不大于3，你视为拥有「问神」。你因「问神」获得的牌视为「智」牌。'
	},
	//浮生-符玄
	mengfayan(player) {
		if (player.storage.mengfayan) return `每轮限一次，一名角色的结束阶段，你可以观看牌堆顶的三张牌并可交换其中的<span class='greentext'>${player.storage.mengfayan}</span>张牌，然后将这些牌置于牌堆顶，被交换的那张牌正面朝上。`
		return '每轮限一次，一名角色的结束阶段，你可以观看牌堆顶的三张牌并可交换其中的1张牌，然后将这些牌置于牌堆顶，被交换的那张牌正面朝上。'
	},
	//良
	hyyzlangxin(player) {
		switch (player.storage.hyyzlangxin) {
			case 2:
				return `每轮限一次，你<span style='font-weight:bold'>②响应</span>【杀】的结算时，
							对路径及目标中的其他角色使用<span style='font-weight:bold'>②【五谷丰登】</span>，
							或对其中手牌最少的一名角色使用<span style='font-weight:bold'>②翻倍</span>的此牌`
			case 3:
				return `每轮限一次，你<span class='greentext'>③参与</span>【杀】的结算时，
							对路径及目标中的其他角色使用<span class='greentext'>③【增兵减灶】</span>，
							或对其中手牌最少的一名角色使用<span class='greentext'>③断拒</span>的此牌`
			default:
				return `每轮限一次，你<span class='firetext'>①使用</span>【杀】的结算时，
							对路径及目标中的其他角色使用<span class='firetext'>①【趁火打劫】</span>，
							或对其中手牌最少的一名角色使用<span class='firetext'>①背水</span>的此牌`
		}
	},
};
//批量将语音audio：5换成标准格式
for (let sort in characters)
	for (let name in characters[sort]) {
		const skill = characters[sort][name];
		if (!name.startsWith('meng_') && get.is.object(skill)) {
			if (typeof skill.audio == 'number')
				characters[sort][name].audio = 'ext:忽悠宇宙/asset/meng/audio:' + skill.audio
			if ('subSkill' in skill)
				for (let subSkill in skill.subSkill)
					if (typeof skill.subSkill[subSkill].audio == 'number')
						characters[sort][name].subSkill[subSkill].audio = 'ext:忽悠宇宙/asset/meng/audio:' + skill.subSkill[subSkill].audio
		}
	}
export { characters, dynamicTranslates }

let str = {

};
for (let i in str) {
	if (!i.endsWith('_info') && str[i + '_info']) {
		str[i + '_info'] = str[i] + '|' + str[i + '_info']
		delete str[i]
	}
}
str