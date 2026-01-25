'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';//24.3
//技能等相关信息
const characters = {
	/**@type { SMap<Skill> } */
	永世乐土: {
		meng_aboniya: ['阿波尼亚', ["female", "hyyz_b3", 3, ["mengjielv", "mengzuiyuan", "mengganzhao"], []]],
		mengjielv: {
			audio: 2,
			trigger: {
				player: "damageEnd",
			},
			check(event, player) {
				return (get.attitude(player, event.source) <= 0);
			},
			locked: false,
			notemp: true,
			filter: function (event) {
				return event.source && event.source.isIn() && event.num > 0;
			},
			content: function () {
				"step 0"
				event.count = trigger.num;
				"step 1"
				event.count--;
				player.draw();
				"step 2"
				if (player.countCards('he')) player.chooseCard('将一张牌置于伤害来源武将牌旁作为“律”', 'he', true);
				else event.goto(4);
				"step 3"
				if (result.cards && result.cards.length) {
					trigger.source.addToExpansion(result.cards, player, 'giveAuto').gaintag.add('mengjielv2');
				}
				"step 4"
				if (event.count > 0 && player.hasSkill('mengjielv')) {
					player.chooseBool(get.prompt2('mengjielv')).set('frequentSkill', 'mengjielv');
				}
				else event.finish();
				"step 5"
				if (result.bool) {
					player.logSkill('mengjielv', trigger.source);
					event.goto(1);
				}
			},
			global: "mengjielv2",
			ai: {
				maixie: true,
				"maixie_hp": true,
				threaten: 1,
				effect: {
					target: function (card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							if (target.hp >= 3) return [0.5, get.tag(card, 'damage') * 1.5];
							if (target.hp == 2) return [1, get.tag(card, 'damage') * 0.5];
						}
					},
				},
			},
			"_priority": 0,
		}, mengjielv2: {
			mod: {
				cardEnabled: function (card, player) {
					if (player.getExpansions('mengjielv2').length == 0 || !game.hasPlayer(function (current) {
						return current.hasSkill('mengjielv');
					})) return;
					var types = [];
					for (var i = 0; i < player.getExpansions('mengjielv2').length; i++) {
						types.push(get.type2(player.getExpansions('mengjielv2')[i]));
					}
					if (types.contains(get.type2(card))) return false;
				},
				cardSavable: function (card, player) {
					if (player.getExpansions('mengjielv2').length == 0 || !game.hasPlayer(function (current) {
						return current.hasSkill('mengjielv');
					})) return;
					var types = [];
					for (var i = 0; i < player.getExpansions('mengjielv2').length; i++) {
						types.push(get.type2(player.getExpansions('mengjielv2')[i]));
					}
					if (types.contains(get.type2(card))) return false;
				},
				cardRespondable: function (card, player) {
					if (player.getExpansions('mengjielv2').length == 0 || !game.hasPlayer(function (current) {
						return current.hasSkill('mengjielv');
					})) return;
					var types = [];
					for (var i = 0; i < player.getExpansions('mengjielv2').length; i++) {
						types.push(get.type2(player.getExpansions('mengjielv2')[i]));
					}
					if (types.contains(get.type2(card))) return false;
				},
			},
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			"_priority": 0,
		},
		mengzuiyuan: {
			audio: 2,
			trigger: {
				player: "phaseEnd",
			},
			forced: true,
			locked: false,
			filter: function (event) {
				return game.hasPlayer(function (current) {
					return current.getExpansions('mengjielv2').length > 0;
				});
			},
			logTarget: function (event, player) {
				return game.filterPlayer(function (current) {
					return current.getExpansions('mengjielv2').length > 0;
				}).sortBySeat(player);
			},
			content: function () {
				'step 0'
				event.targets = game.filterPlayer(function (current) {
					return current.getExpansions('mengjielv2').length > 0;
				}).sortBySeat(player);
				'step 1'
				var target = event.targets.shift();
				event.target = target;
				var num = target.getExpansions('mengjielv2').length;
				if (target.countCards('he') >= num) {
					target.chooseCard('he', num, '将' + get.cnNumber(num) + '张“律”包含类型的牌交给' + get.translation(player) + '，否则你失去1点体力且其获得所有“律”', (card, player) => {
						var target = _status.event.player;
						var types = [];
						for (var i = 0; i < target.getExpansions('mengjielv2').length; i++) {
							types.push(get.type2(target.getExpansions('mengjielv2')[i]));
						}
						return types.contains(get.type2(card));
					}).set('ai', function (card) {
						return 6 - get.value(card);
					});
				}
				'step 2'
				if (result.bool) target.give(result.cards, player);
				else target.loseHp();
				player.gain(target.getExpansions('mengjielv2'), 'draw');
				'step 3'
				if (event.targets.length) event.goto(1);
			},
			"_priority": 0,
		},
		mengganzhao: {
			audio: 3,
			logAudio: () => [
				"ext:忽悠宇宙/asset/yslt/audio/mengganzhao1.mp3",
				"ext:忽悠宇宙/asset/yslt/audio/mengganzhao2.mp3",
			],
			enable: "phaseUse",
			usable: 1,
			discard: false,
			lose: false,
			delay: 0,
			position: "h",
			filter: function (event, player) {
				return player.countCards('h');
			},
			filterCard: true,
			filterTarget: function (card, player, target) {
				return player != target;
			},
			check: function (card) { return 8 - get.value(card) },
			content: function () {
				"step 0"
				player.give(cards, target);
				"step 1"
				var list = ['选项一', '选项二'];
				player.chooseControl(list).set('choiceList', [
					'令' + get.translation(target) + '交给你两张牌（且这些牌不计入你的手牌上限）',
					'令' + get.translation(target) + '对你指定的另一名角色造成1点伤害',
				]).set('prompt', get.prompt('mengganzhao')).set('ai', function () {
					if (get.attitude(_status.event.source, player) > 0) return '选项二';
					if (!game.hasPlayer(function (current) {
						return get.damageEffect(current, _status.event.source, player) > 0;
					})) return '选项一';
					if (_status.event.source.countCards('he') < 2) return '选项一';
					return Math.random() < 0.5 ? '选项一' : '选项二';
				}).set('source', target);
				"step 2"
				if (result.control == '选项一') {
					target.chooseCard('he', 2, '交给' + get.translation(player) + '两张牌，或点“取消”令自己翻面').set('ai', function (card) {
						return 10 - get.value(card);
					});
					event.goto(4);
				}
				else {
					player.chooseTarget('请选择' + get.translation(target) + '造成伤害的目标', true).set('ai', function (_target) {
						return get.damageEffect(_target, _status.event.source, player);
					}).set('source', target);
				}
				"step 3"
				var target1 = result.targets[0];
				event.target1 = target1;
				target.chooseBool('是否对' + get.translation(target1) + '造成1点伤害，或点“取消”令自己翻面').set('ai', function () {
					return get.damageEffect(_status.event.source, _status.event.player, _status.event.player) < -2;
				}).set('source', target1);
				event.goto(5);
				"step 4"
				if (result.cards && result.cards.length) target.give(result.cards, player).gaintag.add('mengganzhao');
				else {
					game.broadcastAll(function () {
						if (lib.config.background_speak)
							game.hyyzSkillAudio('meng', 'mengganzhao', 3)
					});
					target.turnOver();
				}
				event.finish();
				"step 5"
				if (result.bool) event.target1.damage(target);
				else {
					game.broadcastAll(function () {
						if (lib.config.background_speak) game.hyyzSkillAudio('meng', 'mengganzhao', 3)
					});
					target.turnOver();
				}
			},
			mod: {
				ignoredHandcard: function (card, player) {
					if (card.hasGaintag('mengganzhao')) return true;
				},
				cardDiscardable: function (card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('mengganzhao')) return false;
				},
			},
			ai: {
				order: 8,
				result: {
					target: function (player, target) {
						if (target.isTurnedOver()) return 1;
						return -1;
					},
				},
			},
			"_priority": 0,
		},
		meng_ailixiya: ['爱莉希雅', ["female", "hyyz_b3", 3, ["mengwuxia", "mengailian", "mengzhenwo"], []]],
		mengwuxia: {
			trigger: {
				player: "damageBefore",
				source: "damageBefore",
			},
			forced: true,
			filter: function (event, player) {
				return event.source;
			},
			content: function () {
				trigger.cancel();
				trigger.player.damage(trigger.num, trigger.nature, 'nosource');
			},
			"_priority": 0,
		},
		mengailian: {
			trigger: {
				global: "damageBegin3",
			},
			content: function () {
				trigger.player.draw();
				if (trigger.source) {
					if (trigger.source.isIn()) player.gainPlayerCard(trigger.source, 'hej', true);
				}
				else player.gainPlayerCard(trigger.player, 'hej', true);
			},
		},
		mengzhenwo: {
			audio: 1,
			trigger: {
				player: "die",
			},
			forced: true,
			direct: true,
			skillAnimation: true,
			animationColor: "fire",
			forceDie: true,
			content: function () {
				"step 0"
				player.chooseTarget(get.prompt2('mengzhenwo'), true, lib.filter.notMe).set('forceDie', true).set('ai', function (target) {
					return get.attitude(_status.event.player, target);
				});
				"step 1"
				if (result.bool) {
					var target = result.targets[0];
					player.logSkill('mengzhenwo', target);
					player.line(target, 'green');
					target.gainMaxHp();
					target.draw(3);
				}
			},
			ai: {
				expose: 0.5,
			},
			"_priority": 0,
		},
		meng_geleixiu: ['格蕾修', ["female", "hyyz_b3", 3, ["mengfanxing"], []]],
		"mengfanxing": {
			forced: true,
			audio: 2,
			trigger: {
				player: "damageBegin3",
				source: "damageBegin1",
			},
			filter: function (event, player) {
				return player.storage.mengfanxing_damage == true && player.storage.mengfanxing_source == true;
			},
			content: function () {
				player.draw();
			},
			group: ["mengfanxing_damage", "mengfanxing_source"],
			subSkill: {
				damage: {
					trigger: {
						player: "damageBegin3",
					},
					forced: true,
					filter: function (event, player) {
						return !player.storage.mengfanxing_damage;
					},
					content: function () {
						game.broadcastAll(function () {
							if (lib.config.background_speak)
								game.hyyzSkillAudio('meng', 'mengfanxing', 1)
						});
						player.storage.mengfanxing_damage = true;
						player.addSkillLog('menghuimeng');
					},
					sub: true,
					"_priority": 0,
				},
				source: {
					trigger: {
						source: "damageBegin1",
					},
					forced: true,
					filter: function (event, player) {
						return !player.storage.mengfanxing_source;
					},
					content: function () {
						game.broadcastAll(function () {
							if (lib.config.background_speak)
								game.hyyzSkillAudio('meng', 'mengfanxing', 2)
						});
						player.storage.mengfanxing_source = true;
						player.addSkillLog('mengtiaohe');
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		"menghuimeng": {
			audio: 1,
			trigger: {
				player: "damageBegin3",
			},
			filter: function (event, player) {
				if (!event.source || !event.source.isIn() || event.source == player) return false;
				return event.source.getStockSkills('仲村由理', '天下第一').filter(function (skill) {
					var info = get.info(skill);
					return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
				}).length > 0;
			},
			skillAnimation: true,
			limited: true,
			direct: true,
			animationColor: "thunder",
			content: function () {
				'step 0'
				var list = trigger.source.getStockSkills('仲村由理', '天下第一').filter(function (skill) {
					var info = get.info(skill);
					return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
				});
				player.chooseControl(list, 'cancel2').set('prompt', '选择获得' + get.translation(trigger.source) + '的一个技能').set('forceDie', true).set('ai', function () {
					return list.randomGet();
				});
				'step 1'
				if (result.control != 'cancel2') {
					player.logSkill('menghuimeng', trigger.sourc);
					player.awakenSkill('menghuimeng');
					player.addSkillLog(result.control);
					game.broadcastAll(function (skill) {
						var list = [skill]; game.expandSkills(list);
						for (var i of list) {
							var info = lib.skill[i];
							if (!info) continue;
							if (!info.audioname2) info.audioname2 = {};
							info.audioname2.meng_geleixiu = 'menghuimeng';
						}
					}, result.control);
				}
				else event.finish();
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: (player, skill) => player.storage[skill] = false,
			"_priority": 0,
		},
		"mengtiaohe": {
			audio: 2,
			trigger: {
				source: "damageBegin",
			},
			usable: 1,
			content: function () {
				"step 0"
				var list = [];
				list.push('选项一');
				if (trigger.player.countDiscardableCards(player, 'he') > 0) list.push('选项二');
				list.push('背水！');
				list.push('cancel2');
				player.chooseControl(list).set('choiceList', [
					'令该角色失去一点体力',
					'防止此伤害并令其弃置两张牌',
					'背水！你翻面并执行所有选项',
				]);
				"step 1"
				if (result.control == '背水！') player.turnOver();
				"step 2"
				if ((result.control == '选项一' || result.control == '背水！')) trigger.player.loseHp();
				"step 3"
				if ((result.control == '选项二' || result.control == '背水！') && trigger.player.countDiscardableCards(player, 'he') > 0) {
					trigger.cancel();
					trigger.player.chooseToDiscard('he', 2, true);
				};
				"step 4"
				if (result.control == 'cancel2') event.finish();
			},
			"_priority": 0,
		},
		meng_hua: ['华', ["female", "hyyz_b3", 4, ["mengfusheng", "mengguiyi", "mengduao"], []]],
		"mengfusheng": {
			mark: true,
			locked: true,
			zhuanhuanji: true,
			marktext: "☯",
			intro: {
				content: function (storage, player, skill) {
					if (player.storage.mengfusheng == true) return '锁定技，出牌阶段开始时，你弃置一张牌，然后本回合使用的牌无距离限制，且造成的伤害+1';
					return '锁定技，出牌阶段开始时，你摸一张牌，然后本回合使用牌无次数限制，且不可被相应';
				},
			},
			audio: 2,
			trigger: {
				player: "phaseUseBegin",
			},
			forced: true,
			content: function () {
				'step 0'
				player.changeZhuanhuanji('mengfusheng');
				if (player.storage.mengfusheng != true) {
					player.chooseToDiscard('he', true);
				}
				else {
					player.draw();
				}
				'step 1'
				if (player.storage.mengfusheng != true) {
					player.addTempSkill('mengfusheng_yang', 'phaseAfter');
				}
				else {
					player.addTempSkill('mengfusheng_yin', 'phaseAfter');
				};
			},
			subSkill: {
				yin: {
					mod: {
						cardUsable: function (card, player) {
							return Infinity;
						},
					},
					forced: true,
					silent: true,
					trigger: {
						player: "useCard",
					},
					content: function () {
						trigger.directHit.addArray(game.players);
					},
					ai: {
						threaten: 1.5,
						"directHit_ai": true,
						skillTagFilter: function (player, tag, arg) {
							return true;
						},
					},
					sub: true,
					popup: false,
					"_priority": 1,
				},
				yang: {
					mod: {
						targetInRange: function (card) {
							return true;
						},
					},
					forced: true,
					nopop: true,
					trigger: {
						source: "damageBegin1",
					},
					content: function () {
						trigger.num++;
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengguiyi: {
			audio: 2,
			group: ["mengguiyi_del", "mengguiyi_x"],
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				if (get.type(event.card) != 'basic' && get.type(event.card) != 'trick') return false;
				return !player.getStorage('mengguiyi').contains(event.card.name);
			},
			forced: true,
			locked: false,
			content: function () {
				player.markAuto('mengguiyi', [trigger.card.name]);
			},
			intro: {
				content: "已记录：$",
			},
			subSkill: {
				x: {
					trigger: {
						player: ["useCard", "phaseEnd"],
					},
					init: function (player) {
						if (!player.storage.mengguiyi_x) player.storage.mengguiyi_x = [];
					},
					silent: true,
					charlotte: true,
					filter: function (event, player) {
						if (event.name == 'phase') return true;
						return player == _status.currentPhase && !player.getStorage('mengguiyi_x').contains(event.card.name);
					},
					content: function () {
						if (trigger.name == 'phase') {
							player.storage.mengguiyi_x = [];
						}
						else {
							if (!player.storage.mengguiyi_x) player.storage.mengguiyi_x = [];
							player.storage.mengguiyi_x.push([trigger.card.name]);
						}
					},
					sub: true,
					forced: true,
					popup: false,
					"_priority": 1,
				},
				del: {
					trigger: {
						player: "phaseJieshuBegin",
					},
					filter: function (event, player) {
						return player.storage.mengguiyi_x.length > 0;
					},
					direct: true,
					content: function () {
						'step 0'
						var num = player.storage.mengguiyi_x.length;
						var list = [];
						for (var name of player.getStorage('mengguiyi')) {
							if (get.type2(name) == 'trick') list.push(['锦囊', '', name]);
							else list.push(['基本', '', name]);
						}
						player.chooseButton(['###归忆###<div class="text center">是否删除至多' + get.cnNumber(num) + '张〖归忆〗已记录的牌名？</div>', [list, 'vcard']], [1, num]).set('ai', button => {
							return _status.event.getParent().player.getUseValue({ name: button.link[2] }, null, true);
						});
						'step 1'
						if (result.bool) {
							player.logSkill('mengguiyi');
							var cards = [];
							for (var i = 0; i < result.links.length; i++) {
								player.unmarkAuto('mengguiyi', [result.links[i][2]]);
								var card = get.cardPile2(function (card) {
									return card.name == result.links[i][2];
								});
								if (card) cards.push(card);
							}
							if (cards.length) player.gain(cards, 'gain2');
						}
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		"mengduao": {
			audio: 1,
			unique: true,
			enable: "chooseToUse",
			mark: true,
			limited: true,
			skillAnimation: true,
			animationColor: "fire",
			init: function (player) {
				player.storage.mengduao = false;
			},
			filter: function (event, player) {
				if (player.storage.mengduao) return false;
				if (event.type == 'dying') {
					if (player != event.dying) return false;
					return true;
				}
				return false;
			},
			content: function () {
				'step 0'
				player.awakenSkill('mengduao');
				player.storage.mengduao = true;
				'step 1'
				player.gainMaxHp();
				'step 2'
				var num = player.maxHp - player.hp;
				player.recover(num);
				'step 3'
				if (player.countCards('h') < player.maxHp) {
					player.drawTo(player.maxHp);
				}
			},
			intro: {
				content: "limited",
			},
			ai: {
				order: 1,
				skillTagFilter: function (player, arg, target) {
					if (player != target || player.storage.mengduao) return false;
				},
				save: true,
				result: {
					player: 1,
					threaten: function (player, target) {
						if (!target.storage.mengduao) return 0.6;
					},
				},
			},
			"_priority": 0,
		},
		meng_kaiwen: ['凯文', ["male", "hyyz_b3", "2/4", ["mengyuxiang", "mengcanmeng", "mengjiushi"], []]],
		mengyuxiang: {
			frequent: true,
			audio: 2,
			trigger: {
				player: ["useCard", "respond"],
			},
			filter: function (event, player) {
				return player.countCards('h') < player.hp;
			},
			content: function () {
				player.drawTo(player.maxHp);
			},
			"_priority": 0,
		},
		mengcanmeng: {
			audio: 2,
			usable: 1,
			trigger: {
				player: "damageBegin3",
			},
			filter: function (event, player) {
				if (!event.source || event.source == player || !event.source.isIn()) return false;
				return player.canUse('sha', event.source, false) && player.countCards('h') >= player.hp;
			},
			check: function (event, player) {
				return get.effect(event.source, { name: 'sha' }, player, player) > 0;
			},
			content: function () {
				player.useCard({ name: 'sha', isCard: true }, trigger.source);
			},
			"_priority": 0,
		},
		mengjiushi: {
			unique: true,
			zhuSkill: true,
			forced: true,
			group: "mengjiushi_die",
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			filter: function (event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			content: function () {
				var num = game.countPlayer(function (current) {
					return current != player && current.group == 'hyyz_b3';
				});
				player.gainMaxHp(num);
			},
			subSkill: {
				die: {
					trigger: {
						global: "die",
					},
					forced: true,
					audio: "mengjiushi",
					filter: function (event, player) {
						return event.player.group == 'hyyz_b3';
					},
					content: function () {
						player.loseMaxHp();
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		meng_kesimo: ['科斯魔', ["male", "hyyz_b3", 4, ["mengxuguang", "mengtieyan"], []]],
		"mengxuguang": {
			forced: true,
			audio: 2,
			group: "mengxuguang_dam",
			intro: {
				name: "裂",
				content: "mark",
			},
			marktext: "裂",
			trigger: {
				global: "phaseBegin",
			},
			filter: function (event, player) {
				return event.player.hasMark('mengxuguang');
			},
			content: function () {
				'step 0'
				event.num = trigger.player.countMark('mengxuguang');
				trigger.player.removeMark('mengxuguang', event.num);
				'step 1'
				if (!player.hasSkill('mengtieyan')) event.goto(4);
				else player.chooseBool(get.prompt('mengtieyan'), '是否摸' + get.cnNumber(event.num) + '张牌并选择' + get.translation(trigger.player) + '的一个技能获得？').set('ai', function () {
					return true;
				});
				'step 2'
				if (result.bool) {
					player.logSkill('mengtieyan', trigger.player);
					player.draw(event.num);
					var list = trigger.player.getStockSkills('仲村由理', '天下第一').filter(function (skill) {
						var info = get.info(skill);
						return info && !info.juexingji && !info.hiddenSkill && !info.zhuSkill && !info.charlotte && !info.limited && !info.dutySkill;
					});
					if (list.length) player.chooseControl(list).set('prompt', '选择获得' + get.translation(trigger.source) + '的一个技能').set('forceDie', true).set('ai', function () {
						return list.randomGet();
					});
					else event.goto(4);
				}
				else event.goto(4);
				'step 3'
				player.storage.mengtieyan = result.control;
				player.addTempSkill(result.control, { player: 'phaseAfter' });
				'step 4'
				trigger.player.loseHp();
			},
			subSkill: {
				dam: {
					forced: true,
					audio: "mengxuguang",
					trigger: {
						source: "damageBegin2",
					},
					logTarget: "player",
					content: function () {
						trigger.player.addMark('mengxuguang', 1);
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		"mengtieyan": {
			audio: 1,
			trigger: {
				global: "dying",
			},
			forced: true,
			locked: false,
			filter: function (event, player) {
				if (!player.storage.mengtieyan) return false;
				return event.reason && event.reason.getParent().name == 'mengxuguang';
			},
			content: function () {
				'step 0'
				var skill = player.storage.mengtieyan;
				player.addSkillLog(skill);
				'step 1'
				delete player.storage.mengtieyan;
			},
			"_priority": 0,
		},
		meng_meibiwusi: ['梅比乌斯', ["female", "hyyz_b3", 4, ["mengqiying", "mengwuxian"], []]],
		"mengqiying_mark": {
			marktext: "噬",
			intro: {
				name: "噬",
				content: "mark",
			},
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			audio: "mengqiying",
			forced: true,
			filter: function (event, player) {
				return player.hasMark('mengqiying_mark') && game.hasPlayer(function (current) {
					return current.hasSkill('mengqiying');
				});
			},
			content: function () {
				'step 0'
				player.chooseControl(function () {
					return player.countCards('h') < player.hp ? '选项一' : '选项二';
				}).set('prompt', '栖影').set('choiceList', ['跳过判定和出牌阶段', '跳过摸牌和弃牌阶段']);
				'step 1'
				if (result.control == '选项一') {
					player.skip('phaseJudge');
					player.skip('phaseUse');
				}
				else {
					player.skip('phaseDraw');
					player.skip('phaseDiscard');
				}
				game.log(player, '跳过了', result.control == '选项一' ? '#y判定和出牌阶段' : '#y摸牌和弃牌阶段');
			},
			ai: {
				nokeep: true,
				skillTagFilter: function (player) {
					if (!player.hasMark('mengqiying_mark')) return false;
				},
			},
			"_priority": 0,
		},
		"mengqiying_used": {
			trigger: {
				player: ["useCard", "respond"],
			},
			forced: true,
			filter: function (event, player) {
				return player.hasMark('mengqiying_mark') && game.hasPlayer(function (current) {
					return current.hasSkill('mengqiying');
				}) && player.hasHistory('lose', function (evt) {
					return evt.hs && evt.hs.length > 0 && evt.getParent() == event;
				});
			},
			content: function () {
				player.addTempSkill('mengqiying_used1');
			},
			"_priority": 0,
		},
		"mengqiying_used1": {
			charlotte: true,
			"_priority": 0,
		},
		mengqiying: {
			audio: 2,
			global: ["mengqiying_mark", "mengqiying_used"],
			group: "mengqiying_dis",
			enable: "phaseUse",
			usable: 1,
			filterCard: function (card) {
				return get.type(card) == 'trick' || get.type(card) == 'delay';
			},
			filterTarget: function (card, player, target) {
				return player != target && !target.hasMark('mengqiying_mark');
			},
			check: function (card) {
				return 7 - get.value(card);
			},
			position: "he",
			content: function () {
				target.addMark('mengqiying_mark');
			},
			subSkill: {
				dis: {
					trigger: {
						global: "phaseEnd",
					},
					audio: "mengqiying",
					forced: true,
					filter: function (event, player) {
						return event.player.hasMark('mengqiying_mark') && event.player.isIn();
					},
					logTarget: "player",
					content: function () {
						trigger.player.removeMark('mengqiying_mark', trigger.player.countMark('mengqiying_mark'));
						if (!trigger.player.hasSkill('mengqiying_used1')) trigger.player.loseHp();
						if (!trigger.player.hasHistory('gain', evt => {
							return evt.getParent(2) == event && evt.cards.length > 0;
						}) && !trigger.player.hasHistory('lose', function (evt) {
							return evt.type == 'discard' && evt.hs.length > 0;
						})) player.discardPlayerCard(trigger.player, true, 2, 'he');
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengwuxian: {
			audio: 2,
			trigger: {
				player: "dying",
			},
			forced: true,
			content: function () {
				'step 0'
				player.loseMaxHp();
				'step 1'
				var num = player.maxHp - player.hp;
				if (num > 0) player.recover(num);
				'step 2'
				player.drawTo(player.maxHp);
			},
			ai: {
				halfneg: true,
			},
			"_priority": 0,
		},
		meng_paduo: ['帕朵', ["female", "hyyz_b3", 3, ["mengkongmeng", "menglveji", "menghuoyin"], []]],
		mengkongmeng: {
			forced: true,
			trigger: {
				player: "phaseDrawBegin2",
			},
			filter: function (event, player) {
				return !event.numFixed;
			},
			content: function () {
				trigger.num += 2;
			},
			mod: {
				targetEnabled: function (card, player, target) {
					if (player == target || !target.isTurnedOver()) return;
					return false;
				},
				maxHandcard: function (player, num) {
					return num + player.maxHp;
				},
			},
			"_priority": 0,
		},
		menglveji: {
			audio: 1,
			enable: "phaseUse",
			usable: 1,
			filter: function (event, player) {
				return game.hasPlayer(function (current) {
					return current != player && current.countCards('hej') > 0;
				});
			},
			filterTarget: function (card, player, target) {
				return target.countCards('hej') > 0 && player != target;
			},
			selectTarget: [1, 2],
			prompt: "获得至多两名其他角色区域内的各一张牌，然后这些角色可以依次对你使用一张【杀】",
			contentBefore: function () {
				var evt = event.getParent();
				evt.sha = [];
			},
			content: function () {
				"step 0"
				player.gainPlayerCard(target, 'hes', true);
				"step 1"
				if (result.bool) event.getParent().sha.push(target);
			},
			contentAfter: function () {
				'step 0'
				var list = event.getParent().sha;
				if (!list.length) event.finish();
				else {
					for (var i = 0; i < list.length; i++) {
						var target = list[i];
						if (target && target.isIn() && target.canUse('sha', player, false)) target.chooseToUse(function (card, player, event) {
							if (get.name(card) != 'sha') return false;
							return lib.filter.filterCard.apply(this, arguments);
						}, '掠集：是否对' + get.translation(player) + '使用一张【杀】？').set('targetRequired', true).set('complexSelect', true).set('filterTarget', function (card, player, target) {
							if (target != _status.event.sourcex && !ui.selected.targets.contains(_status.event.sourcex)) return false;
							return lib.filter.filterTarget.apply(this, arguments);
						}).set('sourcex', player);
						game.delay();
					}
				}
			},
			ai: {
				order: 5,
				result: {
					target: function (player, target) {
						if (get.attitude(player, target) > 0 && target.countCards('j')) return 1;
						return -1;
					},
					player: function (player, target) {
						if (!target.canUse('sha', player)) return 0;
						if (target.countCards('he') == 0) return 0;
						if (target.countCards('he') == 1) return -0.1;
						if (player.hp <= 2) return -2;
						if (player.countCards('hs', 'shan') == 0) return -1;
						return -0.4;
					},
				},
				threaten: 1.1,
			},
			"_priority": 0,
		},
		menghuoyin: {
			audio: 2,
			trigger: {
				target: "useCardToTarget",
			},
			direct: true,
			filter: function (event, player) {
				if (!game.hasPlayer(function (current) {
					return current != player && lib.filter.targetEnabled2(event.card, event.player, current);
				})) return false;
				return player != event.player && event.targets.length == 1 && player.countCards('h') > 0;
			},
			content: function () {
				'step 0'
				player.chooseCardTarget({
					prompt: get.prompt('menghuoyin'),
					prompt2: '选择一张手牌交给一名其他角色，其代替你成为此牌的目标',
					filterCard: true,
					position: 'h',
					filterTarget: function (card, player, target) {
						if (player == target) return false;
						var evt = _status.event.getTrigger();
						return !evt.targets.contains(target) && lib.filter.targetEnabled2(evt.card, evt.player, target);
					},
					ai1: function (card) {
						return 6 - get.value(card);
					},
					ai2: function (target) {
						var trigger = _status.event.getTrigger();
						var player = _status.event.source;
						return get.effect(target, trigger.card, player, _status.event.player);
					},
				});
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					player.logSkill('menghuoyin', target);
					player.give(result.cards, target);
					var evt = trigger.getParent();
					evt.triggeredTargets2.remove(player);
					evt.targets.remove(player);
					evt.targets.push(target);
				}
				else event.finish();
				'step 2'
				player.turnOver();
			},
			"_priority": 0,
		},
		meng_qianjie: ['千劫', ["male", "hyyz_b3", 4, ["mengfenshen", "mengbengluo"], []]],
		"mengfenshen": {
			audio: 2,
			trigger: {
				player: "phaseUseBegin",
			},
			direct: true,
			content: function () {
				"step 0"
				player.chooseControl().set('choiceList', [
					'对自己造成一点火焰伤害，然后本回合每当你造成伤害时，你摸一张牌。',
					'否'
				]);
				"step 1"
				if (result.index == 0) {
					player.damage(1, 'fire');
					player.addTempSkill('mengfenshen2');
				}
				else event.finish();
			},
			"_priority": 0,
		},
		"mengfenshen2": {
			audio: "mengfenshen",
			trigger: {
				source: "damageEnd",
			},
			forced: true,
			content: function () {
				player.draw();
			},
			"_priority": 0,
		},
		"mengbengluo": {
			skillAnimation: true,
			animationColor: "fire",
			audio: 1,
			juexingji: true,
			unique: true,
			forced: true,
			trigger: {
				player: ["damageEnd", "loseHpEnd"],
			},
			init: function (player) {
				player.storage.mengbengluo = false;
			},
			filter: function (event, player) {
				return player.hp <= 2 && !player.storage.mengbengluo;
			},
			content: function () {
				"step 0"
				player.gainMaxHp();
				player.storage.mengbengluo = true;
				"step 1"
				var num = player.maxHp - player.hp;
				if (num > 0) player.recover(num);
				player.drawTo(player.maxHp);
				player.addSkill('mengaomie');
			},
			"_priority": 0,
		},
		"mengaomie": {
			audio: 2,
			forced: true,
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				return (get.type2(event.card, false) == 'trick' && get.tag(event.card, 'damage')) || event.card.name == 'sha';
			},
			content: function () {
				"step 0"
				var num = player.hp;
				if (num > 1) {
					player.loseHp();
					event.goto(1);
				}
				else event.finish();
				"step 1"
				trigger.baseDamage++;
				trigger.directHit.addArray(game.filterPlayer());
			},
			"_priority": 0,
		},
		meng_su: ['苏', ["male", "hyyz_b3", 4, ["mengmiyan", "mengtianhui", "mengyizhe"], []]],
		mengmiyan: {
			audio: 1,
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget(get.prompt('mengmiyan')).set('ai', (target) => -get.attitude2(target)).forResult()
			},
			async content(event, trigger, player) {
				player.addTempSkill('mengmiyan2', { player: 'phaseBeginStart' });
				player.storage.mengmiyan2.add(event.targets[0]);
				player.markSkill('mengmiyan2');
			},
		}, "mengmiyan2": {
			audio: "mengmiyan",
			trigger: {
				global: "damageSource",
			},
			charlotte: true,
			forced: true,
			logTarget: "source",
			filter: function (event, player) {
				return player.storage.mengmiyan2.contains(event.source);
			},
			content: function () {
				'step 0'
				trigger.source.chooseToDiscard('he', '密言：是否弃置一张牌？（或点“取消”令受伤角色摸一张牌）').set('ai', function (card) {
					return 7 - get.value(card);
				});
				'step 1'
				if (result.bool) {
					if (get.position(result.cards[0], true) == 'd') player.gain(result.cards[0], 'gain2');
				}
				else {
					trigger.player.draw();
					player.draw();
				}
			},
			onremove: true,
			intro: {
				content: "已选中$为技能目标",
			},
			init: function (player, skill) {
				if (!player.storage[skill]) player.storage[skill] = [];
			},
			"_priority": 0,
		},
		mengtianhui: {
			forced: true,
			audio: 2,
			trigger: {
				player: "useCardToPlayer",
			},
			group: "mengtianhui_1",
			filter: function (event, player) {
				return player.storage.mengmiyan2?.includes(event.target) && !event.target.hasSkill('fengyin') && !event.target.hasSkill('mengtianhui_2');
			},
			content: function () {
				if (!trigger.target.hasSkill('fengyin')) trigger.target.addTempSkill('fengyin');
				if (!trigger.target.hasSkill('mengtianhui_2')) trigger.target.addTempSkill('mengtianhui_2');
			},
			subSkill: {
				"1": {
					trigger: {
						source: "damageBegin1",
					},
					forced: true,
					filter: function (event, player) {
						return player.storage.mengmiyan2?.includes(event.player) && event.player.hasSkill('mengtianhui_2');
					},
					logTarget: "player",
					content: function () { trigger.num++ },
					sub: true,
					"_priority": 0,
				},
				"2": {
					charlotte: true,
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengyizhe: {
			audio: 2,
			trigger: {
				player: "phaseJieshuBegin",
			},
			direct: true,
			filter: function (event, player) {
				return !player.getStat('damage');
			},
			content: function () {
				'step 0'
				player.chooseTarget('是否令一名角色回复1点体力或摸两张牌？').set('ai', function (target) {
					return get.attitude(_status.event.player, target) > 0;
				});
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					event.target = target;
					player.logSkill('mengyizhe', target);
					if (target.hp < target.maxHp) player.chooseControl('摸牌', '回复体力').set('prompt', '令' + get.translation(target) + '摸两张牌或回复1点体力').set('ai', function () {
						if (get.recoverEffect(target, player, player) > 1) return '回复体力';
						return '摸牌';
					});
				}
				else event.finish();
				'step 2'
				if (result.control != '回复体力') event.target.draw(2);
				else event.target.recover();
			},
			"_priority": 0,
		},
		meng_weierwei: ['维尔薇', ["female", "hyyz_b3", 3, ["mengyuxi", "mengluoxuan", "mengwuzhuang"], []]],
		mengyuxi: {
			forced: true,
			mod: {
				cardname: function (card, player) {
					if (card.name == 'sha') return 'shan';
				},
				globalTo: function (from, to, distance) {
					return distance + to.countCards('e');
				},
			},
			"_priority": 0,
		},
		mengluoxuan: {
			group: "mengluoxuan_2",
			enable: "phaseUse",
			audio: 2,
			filter: function (event, player) {
				return game.hasPlayer(function (current) {
					return player.canUse('sha', current, false);
				});
			},
			filterCard: {
				type: "equip",
			},
			position: "he",
			filterTarget: function (card, player, target) {
				return target != player && player.canUse('sha', target, false);
			},
			check: function (card) {
				return 8 - get.value(card);
			},
			prompt: "弃置一张装备牌，视为使用一张无距离限制且不计入次数的【杀】",
			content: function () {
				player.useCard({ name: 'sha', isCard: true }, target, false);
			},
			ai: {
				order: function (item, player) {
					return get.order({ name: 'sha' }, player) + 1;
				},
				result: {
					target: function (player, target) {
						return get.effect(target, { name: 'sha' }, player, target);
					},
				},
			},
			subSkill: {
				"2": {
					trigger: {
						player: "damageBegin4",
					},
					filter: function (event, player) {
						return player != _status.currentPhase && player.countCards('he', { type: 'equip' }) && event.num > 0;
					},
					direct: true,
					content: function () {
						'step 0'
						var next = player.chooseToDiscard('he', '螺旋：是否弃置一张装备牌，然后摸' + get.cnNumber(trigger.num) + '张牌并防止此伤害？', function (card, player) {
							return get.type(card) == 'equip';
						});
						next.set('ai', function (card) {
							var player = _status.event.player;
							if (player.hp == 1 || _status.event.getTrigger().num > 1) {
								return 15 - get.value(card);
							}
							if (player.hp == 2) {
								return 13 - get.value(card);
							}
							return 11 - get.value(card);
						});
						next.logSkill = 'mengluoxuan';
						'step 1'
						if (result.bool) {
							game.delayx();
							player.draw(trigger.num);
							trigger.cancel();
						}
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengwuzhuang: {
			trigger: {
				player: "phaseUseBegin",
			},
			audio: 2,
			filter: function (event, player) {
				return player.countCards('h') > 0 && player.hasCard(function (card) {
					return lib.filter.cardDiscardable(card, player, 'mengwuzhuang');
				}, 'h');
			},
			direct: true,
			content: function () {
				'step 0'
				player.chooseToDiscard('h', '武装：是否弃置一张手牌，然后从牌堆/弃牌堆里随机获得一张装备牌？').set('ai', function (card) {
					return 8 - get.value(card);
				}).set('logSkill', 'mengwuzhuang');
				'step 1'
				if (result.bool) {
					var card = get.cardPile(function (card) {
						return get.type(card) == 'equip';
					});
					if (card) player.gain(card, 'gain2');
				}
			},
			"_priority": 0,
		},
		meng_shiyuanzhilvzhe: ['始源之律者', ["female", "shen", 3, ["mengzhuguang", "mengnisu", "mengyingwu"], []]],
		mengzhuguang: {
			audio: 2,
			forced: true,
			group: ["mengzhuguang_mark"],
			trigger: {
				player: "equipEnd",
			},
			intro: {
				content: "瑕",
			},
			marktext: "瑕",
			filter: function (event, player) {
				return get.subtype(event.card) == 'equip1';
			},
			content: function () {
				var cards = player.getCards('e', function (cards) {
					return get.subtype(cards) == 'equip1'
				});
				if (cards.length) player.discard(cards);
			},
			subSkill: {
				mark: {
					forced: true,
					trigger: {
						player: "damageBegin3",
						source: "damageBegin1",
					},
					content: function () {
						player.addMark('mengzhuguang', 1);
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		"mengnisu2": {
			audio: "mengnisu",
			trigger: {
				player: ["useCardAfter", "respondAfter"],
			},
			forced: true,
			charlotte: true,
			popup: false,
			filter: function (event, player) {
				return event.skill == 'mengnisu_backup';
			},
			content: function () {
			},
			"_priority": 0,
		},
		mengnisu: {
			direct: true,
			audio: 2,
			trigger: {
				player: "phaseBegin",
			},
			unique: true,
			group: ["mengnisu_damage", "mengnisu_change", "mengnisu_clean"],
			filter: function (event, player) {
				return player.countMark('mengzhuguang') > 0;
			},
			mod: {
				targetInRange: function (card, player, target) {
					if (target.hasMark('mengnisu_damage')) return true;
				},
			},
			content: function () {
				var num = player.countMark('mengzhuguang');
				"step 0"
				player.chooseTarget([1, num], '选择最多' + get.cnNumber(num) + '名其他角色，并移除自己等量“瑕标记”，然后本回合你对这些角色使用牌无距离限制，且其不可响应', function (card, player, target) {
					return player != target;
				})
				"step 1"
				if (result.bool) {
					var targets = result.targets.sortBySeat();
					player.removeMark('mengzhuguang', targets.length);
					for (var i = 0; i < targets.length; i++) {
						targets[i].addMark('mengnisu_damage');
						targets[i].addTempSkill('mengnisu_clean');
					}
				}
				event.finish();
			},
			subSkill: {
				clean: {
					forced: true,
					trigger: {
						global: "phaseEnd",
					},
					filter: function (event, player) {
						return event.player.countMark('mengzhuguang') > 0 || event.player.hasSkill('mengnisu');
					},
					content: function () {
						player.removeMark('mengnisu_damage');
					},
					sub: true,
					"_priority": 0,
				},
				damage: {
					trigger: {
						player: "useCardToPlayered",
					},
					forced: true,
					nopop: true,
					filter: function (event, player) {
						return event.target && event.target.hasMark('mengnisu_damage');
					},
					logTarget: "target",
					content: function () {
						trigger.directHit.add(trigger.target);
					},
					sub: true,
					"_priority": 0,
				},
				change: {
					audio: "mengnisu",
					enable: ["chooseToUse", "chooseToRespond"],
					filter: function (event, player) {
						if (!player.countMark('mengzhuguang') || player.storage.mengnisu_change.length > 1) return false;
						for (var i of lib.inpile) {
							var type = get.type(i);
							if ((type == 'basic' || type == 'trick') && !player.storage.mengnisu_change.contains(type) && event.filterCard({ name: i }, player, event)) return true;
						}
						return false;
					},
					init: function (player) {
						if (!player.storage.mengnisu_change) player.storage.mengnisu_change = [];
					},
					chooseButton: {
						dialog: function (event, player) {
							var list = [];
							for (var i = 0; i < lib.inpile.length; i++) {
								var name = lib.inpile[i];
								if (name == 'sha') {
									if (event.filterCard({ name: name }, player, event)) list.push(['基本', '', 'sha']);
									for (var j of lib.inpile_nature) {
										if (event.filterCard({ name: name, nature: j }, player, event)) list.push(['基本', '', 'sha', j]);
									}
								}
								else if (get.type(name) == 'trick' && !player.storage.mengnisu_change.contains('trick') && event.filterCard({ name: name }, player, event)) list.push(['锦囊', '', name]);
								else if (get.type(name) == 'basic' && !player.storage.mengnisu_change.contains('basic') && event.filterCard({ name: name }, player, event)) list.push(['基本', '', name]);
							}
							return ui.create.dialog('逆溯', [list, 'vcard']);
						},
						filter: function (button, player) {
							return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
						},
						check: function (button) {
							if (_status.event.getParent().type != 'phase') return 1;
							var player = _status.event.player;
							if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].contains(button.link[2])) return 0;
							return player.getUseValue({
								name: button.link[2],
								nature: button.link[3],
							});
						},
						backup: function (links, player) {
							return {
								filterCard: () => false,
								selectCard: -1,
								audio: 'mengnisu',
								popname: true,
								viewAs: { name: links[0][2], nature: links[0][3] },
								precontent: function () {
									player.removeMark('mengzhuguang', 1);
								},
								onuse: function (result, player) {
									var evt = _status.event.getParent('phase');
									if (evt && evt.name == 'phase' && !evt.xintaoluan) {
										evt.xintaoluan = true;
										var next = game.createEvent('mengnisu_change_clear');
										_status.event.next.remove(next);
										evt.after.push(next);
										next.player = player;
										next.setContent(function () {
											player.storage.mengnisu_change = [];
										});
									}
									player.storage.mengnisu_change.add(get.type(result.card));
								},
							}
						},
						prompt: function (links, player) {
							return '视为使用一张' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
						},
					},
					hiddenCard: function (player, name) {
						if (!lib.inpile.contains(name)) return false;
						var type = get.type(name);
						return (type == 'basic' || type == 'trick') && !player.storage.mengnisu_change.contains(type) && player.countMark('mengzhuguang') > 0;
					},
					ai: {
						combo: "mengzhuguang",
						fireAttack: true,
						respondSha: true,
						respondShan: true,
						skillTagFilter: function (player) {
							if (!player.countMark('mengzhuguang') || player.storage.mengnisu_change.length > 1) return false;
						},
						order: 1,
						result: {
							player: function (player) {
								if (_status.event.dying) return get.attitude(player, _status.event.dying);
								return 1;
							},
						},
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengyingwu: {
			audio: 2,
			unique: true,
			group: ["mengyingwu_reward", "mengyingwu_effect"],
			subSkill: {
				effect: {
					audio: "mengyingwu",
					charlotte: true,
					trigger: {
						player: "phaseJieshuBegin",
					},
					direct: true,
					filter: function (event, player) {
						return player.countMark('mengzhuguang') >= game.countPlayer();
					},
					content: function () {
						'step 0'
						var num1 = player.countMark('mengzhuguang');
						player.chooseTarget('影舞：请选择雷【杀】的目标可以视为对至多' + get.cnNumber(num1) + '名其他角色使用一张雷【杀】，且此雷【杀】造成伤害时，你摸等同于伤害值的牌', [1, num1], true, function (card, player, target) {
							return player.canUse('sha', target, false);
						}).set('ai', function (target) {
							var player = _status.event.player;
							return get.effect(target, { name: 'sha', nature: 'thunder' }, player, player);
						});
						'step 1'
						if (result.bool) {
							player.removeMark('mengzhuguang', result.targets.length);
							player.addTempSkill('mengyingwu_reward', 'mengyingwu_effectAfter');
							player.useCard({
								name: 'sha',
								nature: 'thunder',
								isCard: true,
								storage: { mengyingwu: true },
							}, 'mengyingwu_effect', result.targets);
						}
						else event.finish();
					},
					sub: true,
					"_priority": 0,
				},
				reward: {
					charlotte: true,
					trigger: {
						source: "damageSource",
					},
					forced: true,
					popup: false,
					filter: function (event, player) {
						return event.card && event.card.storage && event.card.storage.mengyingwu && event.getParent().type == 'card';
					},
					content: function () {
						player.draw(trigger.num);
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		meng_yidian: ['伊甸', ["female", "hyyz_b3", 3, ["mengyuepu", "menghuangjin"], []]],
		"menghuangjin": {
			audio: 2,
			forced: true,
			intro: {
				content: "音",
			},
			marktext: "音",
			group: ["menghuangjin_bianzou"],
			trigger: {
				source: "damageEnd",
			},
			content: function () {
				"step 0"
				event.count = trigger.num;
				"step 1"
				event.count--;
				player.addMark('menghuangjin', 1);
				"step 2"
				if (event.count > 0) event.goto(1);
			},
			subSkill: {
				bianzou: {
					forced: true,
					trigger: {
						global: "damageEnd",
					},
					filter(event, player) {
						return event.source?.hasSkill('mengbianzou') || event.source?.hasSkill('menghexian')
					},
					content: function () {
						"step 0"
						event.count = trigger.num;
						"step 1"
						event.count--;
						player.addMark('menghuangjin', 1);
						"step 2"
						if (event.count > 0) event.goto(1);
					},
				},
			},
			"_priority": 0,
		},
		"mengyuepu": {
			audio: 2,
			trigger: {
				player: "phaseEnd",
			},
			direct: true,
			group: ["mengyuepu_clean"],
			filter: function (event, player) {
				return player.countMark('menghuangjin') > 0;
			},
			content: function () {
				'step 0'
				var num = player.countMark('menghuangjin');
				player.removeMark('menghuangjin', num);
				if (num > 4) player.draw(5);
				else player.draw(num);
				//event.logged = false;
				//event.targets=[];
				event.goto(num % 2 == 1 ? 3 : 1);
				'step 1'
				player.chooseTarget(1, '选择一名角色，使其获得技能变奏');
				'step 2'
				if (result.bool) {
					var target = result.targets[0];
					target.addSkill('mengbianzou');
					event.finish();
				}
				else event.finish();
				'step 3'
				player.chooseTarget(1, '选择一名角色，使其获得技能和弦');
				'step 4'
				if (result.bool) {
					var target = result.targets[0];
					target.addSkill('menghexian');
					event.finish();
				}
				else event.finish();
			},
			subSkill: {
				clean: {
					trigger: {
						player: ["phaseUseEnd", "dieBegin"],
					},
					silent: true,
					charlotte: true,
					content: function () {
						for (var i = 0; i < game.players.length; i++) {
							if (game.players[i].hasSkill('menghexian')) {
								game.players[i].removeSkill('menghexian');
							}
							if (game.players[i].hasSkill('mengbianzou')) {
								game.players[i].removeSkill('mengbianzou');
							}
						}
						player.removeSkill('dawu3');
					},
					sub: true,
					forced: true,
					popup: false,
					"_priority": 1,
				},
			},
			"_priority": 0,
		},
		"menghexian": {
			name: "和弦",
			trigger: {
				player: "damageBegin4",
			},
			forced: true,
			charlotte: true,
			content: function () {
				trigger.num--;
				player.draw();
			},
			mark: true,
			intro: {
				content: "当你受到伤害时，你令伤害值减1；然后你摸一张牌",
			},
			ai: {
				filterDamage: true,
				skillTagFilter: function (player, tag, arg) {
					if (arg && arg.player) {
						if (arg.player.hasSkillTag('jueqing', false, player)) return false;
					}
				},
				effect: {
					target: function (card, player, target, current) {
						if (target && target.hp > 1 && get.tag(card, 'damage') && !player.hasSkillTag('jueqing', false, target)) return 0.8;
					},
				},
			},
			"_priority": 0,
		},
		"mengbianzou": {
			name: "变奏",
			trigger: {
				source: "damageBegin1",
			},
			forced: true,
			charlotte: true,
			filter: function (event, player) {
				return event.num <= 1;
			},
			content: function () {
				trigger.num++;
				player.draw();
			},
			mark: true,
			intro: {
				content: "当你造成伤害时，若此伤害不大于1，则此伤害+1，然后你摸一张牌",
			},
			"_priority": 0,
		},
		meng_ying: ['樱', ["female", "hyyz_b3", 4, ["mengsenluo", "mengshana"], []]],
		"mengsenluo": {
			audio: 2,
			trigger: {
				global: ["respond", "useCard"],
			},
			forced: true,
			filter: function (event, player) {
				if (!event.respondTo) return false;
				if (event.player == player && player != event.respondTo[0]) {
					var cards = [];
					if (get.itemtype(event.respondTo[1]) == 'card') cards.push(event.respondTo[1]);
					else if (event.respondTo[1].cards) cards.addArray(event.respondTo[1].cards);
					return cards.filterInD('od').length != 0;
				}
				if (event.player != player && player == event.respondTo[0]) {
					return event.cards.filterInD('od').length > 0;
				}
				return false;
			},
			logTarget: "player",
			content: function () {
				player.draw();
			},
			"_priority": 0,
		},
		"mengshana_dying": {
			forced: true,
			trigger: {
				player: "phaseEnd",
			},
			filter: function (event, player) {
				return (player.storage.mengshana == true);
			},
			mod: {
				cardUsable: function (card, player, target) {
					if (player == _status.currentPhase) return Infinity;
				},
				targetInRange: function (card, player, target) {
					if (player == _status.currentPhase) return true;
				},
			},
			content: function () {
				var num = player.hp;
				player.loseHp(num);
			},
			"_priority": 0,
		},
		"mengshana_damage": {
			trigger: {
				player: "useCard",
			},
			forced: true,
			filter: function (event, player) {
				return (player.storage.mengshana == true);
			},
			content: function () {
				trigger.directHit.addArray(game.filterPlayer());
			},
			"_priority": 0,
		},
		"mengshana_discard": {
			trigger: {
				player: "phaseDiscardBefore",
			},
			forced: true,
			filter: function (event, player) {
				return (player.storage.mengshana == true);
			},
			content: function () {
				trigger.cancel();
			},
			"_priority": 0,
		},
		"mengshana": {
			audio: 1,
			trigger: {
				player: "phaseUseAfter",
			},
			limited: true,
			group: ["mengshana_mark", "mengshana_hit", "mengshana_clean"],
			skillAnimation: true,
			animationColor: "thunder",
			unique: true,
			init: function (player) {
				player.storage.mengshana = false;
			},
			content: function () {
				"step 0"
				player.awakenSkill('mengshana');
				player.storage.mengshana = true;
				"step 1"
				var next = player.phaseDraw();
				event.next.remove(next);
				trigger.after.push(next);
				var next = player.phaseUse();
				event.next.remove(next);
				trigger.after.push(next);
				"step 2"
				player.addTempSkill('mengshana_dying');
				player.addTempSkill('mengshana_discard');
				player.addTempSkill('mengshana_damage');
				game.countPlayer(function (current) {
					if (current != player) {
						player.line(current, 'green');
						current.addTempSkill('fengyin');
						current.addMark('mengshana_mark');
						current.addTempSkill('mengshana_clean');
					}
				});
			},
			subSkill: {
				clean: {
					forced: true,
					trigger: {
						global: "phaseEnd",
					},
					filter: function (event, player) {
						return event.player.hasSkill('mengshana');
					},
					content: function () {
						player.removeMark('mengshana_mark');
					},
					"_priority": 0,
					sub: true,
				},
				mark: {
					mark: true,
					marktext: "刹",
					intro: {
						name: "刹那",
						content: "mark",
					},
					sub: true,
					"_priority": 0,
				},
				hit: {
					trigger: {
						player: "useCardToPlayered",
					},
					forced: true,
					filter: function (event, player) {
						return event.target && event.target.hasMark('mengshana_mark');
					},
					logTarget: "target",
					content: function () {
						trigger.directHit.add(trigger.target);
					},
					sub: true,
					"_priority": 0,
				},
			},
			mark: true,
			intro: {
				content: "limited",
			},
			"_priority": 0,
		},

		mengjielv: "戒律",
		"mengjielv2": "戒律",
		"mengjielv_info": "当你受到1点伤害后，你可以摸一张牌并将一张牌置于伤害来源的武将牌旁，称为“律”。（有“律”的角色不能使用或打出与其拥有的“律”类型相同的牌）",
		mengzuiyuan: "罪渊",
		"mengzuiyuan_info": "回合结束时，所有拥有“律”的角色需交给你X张与其拥有的“律”类型相同的牌，否则其失去1点体力。然后你获得其所有“律”。",
		mengganzhao: "感召",
		"mengganzhao_info": "出牌阶段限一次，你可以将一张手牌交给一名其他角色，然后选择以下一项令其选择是否执行：1.交给你两张牌；2.对你指定的一名角色造成1点伤害。若其不执行或无法执行，则其翻面。",

		mengwuxia: "无瑕",
		"mengwuxia_info": "锁定技，你造成或受到的伤害均视为无来源伤害。",
		mengailian: "爱恋",
		"mengailian_info": "当一名角色受到伤害时，你令其摸一张牌。然后若此伤害为无来源伤害，你获得其区域内的一张牌；否则你获得伤害来源区域内的一张牌。",
		mengzhenwo: "真我",
		"mengzhenwo_info": "锁定技，当你死亡时，你令一名其他角色加1点体力上限并摸三张牌。",

		"mengfanxing": "繁星",
		"mengfanxing_upgrade": "繁星",
		"mengfanxing_upgrade_info": "锁定技。每当你造成或受到伤害时，你摸一张牌",
		"mengfanxing_info": "锁定技。每项限一次，当你受到伤害时，你获得技能“绘梦”；当你造成伤害时，你获得技能“调和”；当你获得“绘梦”和“调和”后改为：每当你造成或受到伤害时，你摸一张牌",
		"menghuimeng": "绘梦",
		"menghuimeng_info": "限定技。当你受到伤害时，你可以获得伤害来源的一个技能（不包括主公技、觉醒技和限定技），直到游戏结束。",
		"mengtiaohe": "调和",
		"mengtiaohe_info": "每回合限一次，当你造成伤害时你可选择一项：①、令该角色失去一点体力；②、防止此伤害并令其弃置两张牌；③背水：你同时触发以上两项，你进行翻面。",

		"mengfusheng": "浮生",
		"mengfusheng_info": "转换技，锁定技，阴：锁定技，出牌阶段开始时，你摸一张牌，然后本回合使用牌无次数限制，且不可被相应。阳：锁定技，出牌阶段开始时，你弃置一张牌，然后本回合使用的牌无距离限制，且造成的伤害+1。",
		mengguiyi: "歸憶",
		"mengguiyi_info": "①当你使用不同牌名的牌后，你记录此牌名。②结束阶段，你可在〖追忆〗的记录中减少最多1张种牌的牌名，并从牌堆中获得所有本回合打出牌名相同的牌",
		//"mengzhuiyi": "追憶",
		//"mengzhuiyi_info": "①当你使用不同牌名的牌后，你记录此牌名。②结束阶段，你可在〖追忆〗的记录中减少最多1张种牌的牌名，并从牌堆中获得所有本回合打出牌名相同的牌",
		"mengduao": "渡鏖",
		"mengduao_info": "限定技，当你处于濒死状态时，你可以增加一点体力上限，并将体力回复至体力上限，然后将手牌补至体力上限。",

		mengyuxiang: "余响",
		"mengyuxiang_info": "当你使用或打出牌时，若你的手牌数小于你的体力值，你可以将手牌摸至体力上限。",
		mengcanmeng: "残梦",
		"mengcanmeng_info": "每回合限一次。当你受到伤害时，若你的手牌数不小于你的体力值，你可以视为对伤害来源使用一张【杀】。",
		mengjiushi: "救世",
		"mengjiushi_info": "主公技，锁定技。游戏开始时，你加X点体力上限（X为场上其他崩势力的角色数）；当一名崩势力角色死亡时，你减1点体力上限。",

		"mengxuguang": "旭光",
		"mengxuguang_info": "锁定技。每当你造成伤害时，受到伤害的角色获得一个“裂”标记，其回合开始时移除所有“裂”标记，然后失去一点体力。",
		"mengtieyan": "餮宴",
		"mengtieyan_info": "当一名角色移除“裂”标记时，你可以摸等同于移除的“裂”标记数的牌，并且你获得其一个技能（不包括主公技、觉醒技和限定技），直到你的下回合结束，若其因移除“裂”标记而进入濒死状态则改为获得技能直到游戏结束。",

		mengqiying: "栖影",
		"mengqiying_info": "出牌阶段限一次，你可以弃置一张普通锦囊，然后令一名其他角色获得“噬”标记:拥有“噬”记的角色准备阶段选择一项:1、跳过判定阶段和出牌阶段:2、跳过摸牌阶段和弃牌阶段。 回合结束时移除“噬”标记，若其本回合没有使用或打出过手牌则失去一点体力，若其没有获得过牌或弃置过手牌则你弃置其两张牌。",
		mengwuxian: "无限",
		"mengwuxian_info": "锁定技。当你进入濒死状态时，你减1点体力上限，然后将体力回复至体力上限，并将手牌补至体力上限。",

		mengkongmeng: "空梦",
		"mengkongmeng_info": "锁定技：①当你武将牌背面朝上时，你不能成为其他角色使用牌的目标；②摸牌阶段，你额外摸两张牌；③你的手牌上限+X（X为你的体力上限）。",
		menglveji: "掠集",
		"menglveji_info": "出牌阶段限一次，你可以获得至多两名其他角色区域内的各一张牌，然后这些角色可以依次对你使用一张【杀】。",
		menghuoyin: "祸引",
		"menghuoyin_info": "当你成为其他角色使用牌的唯一目标时，你可以将一张手牌交给一名其他角色，令其代替你成为此牌的目标，然后你翻面。",

		"mengfenshen": "焚身",
		"mengfenshen_info": "出牌阶段开始时，你可以对自己造成一点火焰伤害，然后本回合每当你造成伤害时，你摸一张牌。",
		"mengbengluo": "崩落",
		"mengbengluo_info": "觉醒技。当你体力值降至2或者2以下时，你增加一点体力上限并回复满体力，将手牌摸至体力上限，然后你获得技能“鏖灭”。",
		"mengaomie": "鏖灭",
		"mengaomie_info": "锁定技。回合内每当你使用杀或伤害类锦囊时，若你体力值不为1则你失去一点体力，然后此牌不可被响应且造成的伤害加1",

		mengmiyan: "密言",
		"mengmiyan2": "密言",
		"mengmiyan_info": "准备阶段，你可以选择一名角色。直到你下回合开始，当其造成1点伤害后，其须选择一项：1.令受伤角色摸一张牌，然后你摸一张牌；2.弃置一张牌，然后你获得其弃置的牌。",
		mengtianhui: "天慧",
		"mengtianhui_info": "锁定技，当你使用牌指定〖密言〗选择的角色为目标时，你令其本回合非锁定技失效，且你本回合对其造成的伤害+1。",
		mengyizhe: "医者",
		"mengyizhe_info": "结束阶段，若你本回合内未造成过伤害，则你可以令一名角色回复1点体力或摸两张牌。",

		mengyuxi: "愚戏",
		"mengyuxi_info": "锁定技。你的【杀】均视为【闪】；其他角色计算与你的距离+X（X为你装备区里的牌数）。",
		mengluoxuan: "螺旋",
		"mengluoxuan_info": "①出牌阶段，你可以弃置一张装备牌，视为使用一张无距离限制且不计入次数的【杀】。②当你于回合外受到伤害时，你可以弃置一张装备牌，然后摸等同于伤害值的牌并防止此伤害。",
		mengwuzhuang: "武装",
		"mengwuzhuang_info": "出牌阶段开始时，你可以弃置一张手牌，然后从牌堆或弃牌堆中随机获得一张装备牌。",

		mengzhuguang: "逐光",
		"mengzhuguang_info": "锁定技，当武器牌进入你的装备区时你弃置之；每当你造成或者受到伤害时，你获得一个“瑕”标记，你至多拥有13个“瑕”标记。",
		mengnisu: "逆溯",
		"mengnisu2": "逆溯",
		"mengnisu_info": "准备阶段，你可以选择任意名其他角色，并移除等量的“瑕”标记，然后本回合你对这些角色使用牌无距离限制，且其不可响应；每个角色回合各限一次，你可以移除一个“瑕”标记。①、视为使用一张基本牌；②、视为使用一张普通锦囊牌。",
		mengyingwu: "影舞",
		"mengyingwu_info": "结束回合开始时，若你拥有的“瑕”标记数不小于当前存活人数，则你可以弃置任意数量的“瑕”标记，并视为对等量的其他角色，以此使用一张无距离限制的雷杀，此杀每造成一点伤害，你摸一张牌。",

		"menghuangjin": "黄金",
		"menghuangjin_info": "锁定技。每当你或拥有乐谱给予技能的角色（该角色不能是你）造成一点伤害时你获得一个“音”标记；每当你移除“音”标记时你摸等同于移除的“音”标记数的牌（至多摸五张）。",
		"mengyuepu": "乐谱",
		"mengyuepu_info": "回合结束时，你移除所有的“音”标记，若移除的标记数为单数，你令一名角色获得技能“和弦”，直到你下个出牌阶段结束；若为双数则令一名角色获得技能“变奏”直到你的下个回合出牌阶段结束。",
		"menghexian": "和弦",
		"menghexian_info": "锁定技。当你受到伤害时，令此伤害-1，然后你摸一张牌。",
		"mengbianzou": "变奏",
		"mengbianzou_info": "锁定技。当你造成伤害时，若此伤害不大于1，则此伤害+1，然后你摸一张牌",

		"mengsenluo": "森罗",
		"mengsenluo_info": "锁定技。当你使用的牌被响应或你响应其他角色使用的牌时你摸一张牌。",
		"mengshana": "刹那",
		"mengshana_dying": "刹那",
		"mengshana_discard": "刹那",
		"mengshana_damage": "刹那",
		"mengshana_info": "限定技。出牌阶段结束时，你可以跳过弃牌阶段，然后进行一个额外的摸牌阶段和出牌阶段，此出牌阶段其他角色非锁定技失效，你使用的牌没有次数和距离限制，且不能被响应，然后回合结束时你进入濒死状态。",

	},
}, dynamicTranslates = {}
//批量将语音audio：5换成标准格式
for (let sort in characters)
	for (let name in characters[sort]) {
		const skill = characters[sort][name];
		if (!name.startsWith('meng_') && get.is.object(skill)) {
			if (typeof skill.audio == 'number')
				characters[sort][name].audio = 'ext:忽悠宇宙/asset/yslt/audio:' + skill.audio
			if ('subSkill' in skill)
				for (let subSkill in skill.subSkill)
					if (typeof skill.subSkill[subSkill].audio == 'number')
						characters[sort][name].subSkill[subSkill].audio = 'ext:忽悠宇宙/asset/yslt/audio:' + skill.subSkill[subSkill].audio
		}
	}
export { characters, dynamicTranslates } 