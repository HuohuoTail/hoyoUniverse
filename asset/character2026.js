'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
/**@type { SMap < SMap< [String, Character, String, String] | Skill | String>> } */
const characters = {
	2601: {
		hyyz_xt_sp_jingliu: ['镜流', ['female', 'hyyz_xt', 4, ['mengmysfeiguang'], []], '习自微雨的李素裳'],
		mengmysfeiguang: {
			enable: 'phaseUse',
			usable: 2,
			filter(event, player) {
				return player.countCards('h') != player.hp
			},
			async content(event, trigger, player) {
				const result = await player.changeCardTo(player.hp).forResult();
				let cards;
				if (result.bool) {
					if (result.type == 'draw' && result.cards.some(i => i.name == 'sha')) {
						cards = result.cards.filter(i => i.name == 'sha' && player.getCards('he').includes(i))
					}
					if (result.type == 'chooseToDiscard' && result.cards.some(i => lib.translate[i.name]?.includes('剑'))) {
						cards = result.cards.filter(i => lib.translate[i.name]?.includes('剑') && get.position(i) == 'd')
					}
				}
				if (cards) {
					const card = get.autoViewAs({ name: 'sha', nature: 'ice' }, cards);
					await player.chooseUseTarget(card, cards, true, false);
				}
			},
			ai: {
				order: 1,
			}
		},
		mengmysfeiguang_info: '飞光|出牌阶段限两次，你可以调整手牌至体力值，若因此得到含“杀”牌或弃置含“剑”牌，将之当无距离次数限制的冰【杀】使用。',

		hyyz_b3_re_hua: ['华', ['female', 'hyyz_b3', 3, ['hyyzb3recunjin', 'hyyzb3refusheng'], []], '尾巴酱', '融汇自骊歌和冷若寒的华'],
		hyyzb3recunjin: {
			audio: 'hyyzcunjin',
			trigger: {
				player: ['useCardAfter', 'loseAfter', 'gainAfter'],
			},
			filter(event, player) {
				switch (event.name) {
					case 'useCard': return player.countDiscardableCards(player, 'he') > 0;
					case 'lose': return event.type == 'discard';
					case 'gain': return player.countCards('hs', (i) => player.hasUseTarget(i)) > 0;
				}
			},
			lastDo: true,
			direct: true,
			frequent: true,
			async content(event, trigger, player) {
				switch (trigger.name) {
					case 'useCard': {
						player.chooseToDiscard('寸劲：弃置一张牌', 'he').set('ai', (card) => 8 - get.value(card)).set('logSkill', 'hyyzb3recunjin');
						break;
					}
					case 'lose': {
						const { bool } = await player
							.chooseBool('寸劲：摸一张牌？')
							.set('frequentSkill', 'hyyzb3recunjin')
							.forResult();
						if (bool) {
							player.logSkill('hyyzb3recunjin')
							await player.draw();
						}
						break;
					}
					case 'gain': {
						player.chooseToUse('寸劲：使用一张牌').set('logSkill', 'hyyzb3recunjin');
						break;
					}
				}
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 1) return 4;
					return 0.01;
				},
				effect: {
					target(card, player, target) {
						if (card.name == 'guohe') return [1, 2];
					},
				},
			},
		},
		hyyzb3refusheng: {
			audio: 'hyyzfusheng',
			persevereSkill: true,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter(event, player) {
				if (player.countCards("he")) return false;
				const evt = event.getl(player);
				return evt && evt.player == player && evt.cards2.length
			},
			async cost(event, trigger, player) {
				const cards = trigger.getl(player).hs.filter(i => get.position(i) == 'd');
				let list = ['失去1点体力', '减1点体力上限', '断拒'];

				const { index } = await player
					.chooseControlList(list, get.prompt('hyyzb3refusheng'))
					.set('ai', () => {
						const player = _status.event.player, list = _status.event.list;
						let k = [];
						if (player.hp > 1 && list.includes('失去1点体力')) k.add(list.indexOf('失去1点体力'));
						if (cards.some(i => player.hasUseTarget(i) && player.getUseValue(i) >= 20) && player.isDamaged() && list.includes('减1点体力上限')) k.add(list.indexOf('减1点体力上限'));
						if (k.length >= 2) k.add(3)
						return k.randomGet();
					})
					.set('cards', cards).set('list', list)
					.forResult();
				if (index != list.length) {
					event.result = {
						bool: true,
						cards: cards,
						cost_data: list[index],
					}
				}
			},
			async content(event, trigger, player) {
				switch (event.cost_data) {
					case '断拒': await player.removeSkills(event.name); break;
					case '失去1点体力': await player.loseHp(); break;
					case '减1点体力上限': await player.loseMaxHp(); break;
				}
				await player.drawTo(player.getHandcardLimit())
			},
		},
		hyyzb3recunjin_info: '寸劲|当你<span class=yellowtext>使用</span>/<span class=firetext>弃置</span>/<span class=thundertext>获得</span>牌后，你可以<span class=yellowtext>弃置</span>/<span class=firetext>摸</span>/<span class=thundertext>使用</span>一张牌。',
		hyyzb3refusheng_info: `浮生|持恒技，你失去所有牌后，可以<br>①失去1点体力；<br>②减1点体力上限；<br>${get.hyyzIntroduce('断拒')}：失去此技；<br>然后将手牌摸至上限。`,

	},
	ym: {
		/**@type { [String, Character, String, String ] } */
		hyyz_ɸ_huyouyvzhou: ['忽悠宇宙', ['none', "shen", Infinity, ["hyyzhyyz"], []], `尾巴酱`, '忽悠宇宙扩展内的各种随机武将'],
		hyyzhyyz: {
			trigger: {
				player: ["phaseBegin"],
			},
			forced: true,
			firstDo: true,
			superCharlotte: true,
			skillAnimation: "epic",
			animationColor: "fire",
			charlotte: true,
			async content(event, trigger, player) {
				player.clearSkills();
				player.hyyzJinghua();
				if (_status.characterlist.length) {
					let list = [];
					for (let name of _status.characterlist) {
						if (name == 'huyouyvzhou') continue;
						if (['meng_', 'ym_', 'hyyz_'].some(a => name.startsWith(a))) {
							list.add(name);
						};
					};
					const control = (player.name2 != undefined) ?
						(await player.chooseControl(player.name1, player.name2, true)
							.set('prompt', '请选择要更换的武将牌').forResult()).control
						: player.name1;
					let now = list.randomGet();
					player.reinit(control, now, [player.hp, 4]);
					game.log(player, '（忽悠宇宙）', '将武将牌替换为', now);
				}
				var map = {
					'准备阶段': 'phaseZhunbei',
					'判定阶段': 'phaseJudge',
					'摸牌阶段': 'phaseDraw',
					'出牌阶段': 'phaseUse',
					'弃牌阶段': 'phaseDiscard',
					'结束阶段': 'phaseJieshu',
				};
				const { control: phase } = await player.chooseControl('准备阶段', '判定阶段', '摸牌阶段', '出牌阶段', '弃牌阶段', '结束阶段')
					.set('prompt', '选择要执行的阶段')
					.set('prompt2', '将此阶段插入到任一阶段后')
					.set('ai', () => player.countCards('h') < 4 ? '摸牌阶段' : '出牌阶段')
					.forResult();
				if (phase) {
					const { control: phase2 } = await player.chooseControl(trigger.phaseList).set('prompt', '插入到哪个阶段后？').forResult();
					if (phase2) {
						game.log(player, '将【', phase, '】插入到【', phase2, '】后');
						let num = trigger.phaseList.indexOf(phase2);
						trigger.phaseList.splice(num + 1, 0, map[phase]);
						game.log(player, '的', '#y当前阶段为', trigger.phaseList);
					}
				}
				player.addSkill(event.name);
			},
		},
		hyyz_ɸ_huyouyvzhou_prefix: 'ɸ',
		hyyzhyyz_info: `忽悠|锁定技，回合开始时，你失去所有其他技能并${get.hyyzIntroduce('净化')}，然后将一张武将牌替换为《忽悠宇宙》扩展中的随机武将，并将任一阶段插入到本回合的一个阶段后。`,

		hyyz_ɸ_huyouzongzu: ['忽悠宗族', ['none', 'shen', 4, ['hyyzhyyz2'], []], `尾巴酱`, '随机宗族武将'],
		hyyz_ɸ_huyouzongzu_prefix: 'ɸ',
		hyyzhyyz2: {
			init(player) {
				lib.hyyz.clanSkills = {};
				for (let skillName in lib.skill) if (lib.skill[skillName].clanSkill) lib.hyyz.clanSkills[skillName] = [];
				const clanSkills = Object.keys(lib.hyyz.clanSkills)
				if (!_status.hyyzhyyz2) {
					_status.hyyzhyyz2 = [];
					if (!_status.characterlist) game.initCharactertList();

					for (const name of _status.characterlist) {
						if (!lib.character[name][3]) continue;
						if (lib.character[name].clans?.length > 0) {
							let clan = clanSkills.find(skill => lib.character[name].skills.includes(skill))
							if (clan) lib.hyyz.clanSkills[clan].add(name)
						}
					}
				}
			},
			forced: true,
			trigger: {
				player: 'phaseBegin'
			},
			filter(event) {
				return Object.keys(lib.hyyz.clanSkills).length > 0
			},
			content() {
				'step 0'
				event.clanSkill = Object.keys(lib.hyyz.clanSkills).randomGet()
				player.addTempSkills(event.clanSkill, { player: 'phaseBefore' })
				'step 1'
				let characters = lib.hyyz.clanSkills[event.clanSkill].randomGets(3);
				let skills = [];
				for (let i of characters) {
					skills.addArray(
						(lib.character[i][3] || []).filter(function (skill) {
							var info = get.info(skill);
							return info && !info.hiddenSkill && !info.charlotte && !info.clanSkill;
						})
					)
				}
				if (!skills.length) {
					event.finish();
					return;
				}
				if (player.isUnderControl()) {
					game.swapPlayerAuto(player);
				}
				var switchToAuto = function () {
					_status.imchoosing = false;
					event._result = {
						bool: true,
						skills: skills.randomGets(2),
					};
					if (event.dialog) {
						event.dialog.close();
					}
					if (event.control) {
						event.control.close();
					}
				};
				var chooseButton = function (list, skills) {
					var event = _status.event;
					if (!event._result) {
						event._result = {};
					}
					event._result.skills = [];
					var rSkill = event._result.skills;
					var dialog = ui.create.dialog("请选择获得至多两个技能", [list, "character"], "hidden");
					event.dialog = dialog;
					var table = document.createElement("div");
					table.classList.add("add-setting");
					table.style.margin = "0";
					table.style.width = "100%";
					table.style.position = "relative";
					for (var i = 0; i < skills.length; i++) {
						var td = ui.create.div(".shadowed.reduce_radius.pointerdiv.tdnode");
						td.link = skills[i];
						table.appendChild(td);
						td.innerHTML = "<span>" + get.translation(skills[i]) + "</span>";
						td.addEventListener(lib.config.touchscreen ? "touchend" : "click", function () {
							if (_status.dragged) {
								return;
							}
							if (_status.justdragged) {
								return;
							}
							_status.tempNoButton = true;
							setTimeout(function () {
								_status.tempNoButton = false;
							}, 500);
							var link = this.link;
							if (!this.classList.contains("bluebg")) {
								if (rSkill.length >= 2) {
									return;
								}
								rSkill.add(link);
								this.classList.add("bluebg");
							} else {
								this.classList.remove("bluebg");
								rSkill.remove(link);
							}
						});
					}
					dialog.content.appendChild(table);
					dialog.add("　　");
					dialog.open();

					event.switchToAuto = function () {
						event.dialog.close();
						event.control.close();
						game.resume();
						_status.imchoosing = false;
					};
					event.control = ui.create.control("ok", function (link) {
						event.dialog.close();
						event.control.close();
						game.resume();
						_status.imchoosing = false;
					});
					for (var i = 0; i < event.dialog.buttons.length; i++) {
						event.dialog.buttons[i].classList.add("selectable");
					}
					game.pause();
					game.countChoose();
				};
				if (event.isMine()) {
					chooseButton(characters, skills);
				} else if (event.isOnline()) {
					event.player.send(chooseButton, characters, skills);
					event.player.wait();
					game.pause();
				} else {
					switchToAuto();
				}
				'step 2'
				var map = event.result || result;
				if (map && map.skills && map.skills.length) {
					player.addTempSkills(map.skills, { player: 'phaseBefore' });
				}
			},
			eg: {//lib.hyyz.clanSkills
				"mengchenling": ["hyyz_zzz_xingjianya", "hyyz_xt_yvkong"],
				"clanzelie": ["clan_luji", "clan_lujing"],
				"clanquhuo": ["clan_yangbiao", "clan_yangci", "clan_yangxiu", "clan_yangzhong"],
				"clanbaozu": ["clan_zhongyan", "clan_zhonghui", "clan_zhongyu", "clan_zhongyao"],
				"clanzhongliu": ["clan_wangling", "clan_wangyun", "clan_wanghun", "clan_wanglun", "clan_wangguang", "clan_wangmingshan", "clan_wangchang", "clan_wangshen"],
				"clanxumin": ["clan_hanshao", "clan_hanrong"],
				"clandaojie": ["clan_xunshu", "clan_xunchen", "clan_xuncai", "clan_xuncan", "clan_xunyou", "clan_xunshuang"],
				"clanmuyin": ["clan_wuyi", "clan_wuxian", "clan_wuban", "clan_wukuang", "clan_wuqiao"]
			}
		},
		hyyzhyyz2_info: '忽悠|锁定技，回合开始时，你随机获得一种宗族技，然后从随机三名该族角色的技能中选择两个技能获得，直到你的下一回合结束。',

		//hyyz_ɸ_meng: ['忽悠群友', ['none', 'shen', 4, ['hyyzhyyz3'], []], `<img src=${lib.assetURL}extension/忽悠宇宙/other/hyyz.png width="76" height="22">`, '随机群友武将'],
		hyyzhyyz3: {},
		hyyzhyyz3_info: `忽悠|锁定技，回合开始时，你失去所有其他技能并${get.hyyzIntroduce('净化')}，然后一张武将牌切换为《粉丝堂》的随机自设，从该设计师的五个圆梦作品中选择两个技能获得，直到你的下一回合结束。`,

		ym_zilinggudelige: ['紫灵谷的骊歌', ['female', "hyyz_ɸ", 4, ["ymgengxin", "ymsanlian", "ymzhenggao"], ["zhu"]], `<img src=${lib.assetURL}extension/忽悠宇宙/lige.png width="50" height="50">-紫灵谷的骊歌`, '紫灵谷的骊歌，名不见经传的业余小up，喜欢武将制作，本扩展包的初代作者。'],
		ymgengxin: {
			audio: 4,
			logAudio(event, player) {
				return [
					'ext:忽悠宇宙/asset/ym/audio/ymgengxin1.mp3',
					'ext:忽悠宇宙/asset/ym/audio/ymgengxin2.mp3',
					'ext:忽悠宇宙/asset/ym/audio/ymgengxin3.mp3',
				]
			},
			enable: "phaseUse",
			position: "he",
			filter(event, player) {
				if (!player.countCards('he') || player.getExpansions('ymshiping').length >= 4) return false;
				var suits = [];
				if (player.getExpansions('ymshiping').length > 0) {
					for (var i of player.getExpansions('ymshiping')) {
						suits.push(get.suit(i, false));
					}
				};
				if (player.countCards('he', function (card) {
					return !suits.includes(get.suit(card))
				}) > 0) return true;
			},
			filterCard(card, player) {
				var suits = [];
				if (player.getExpansions('ymshiping').length > 0) {
					for (var i of player.getExpansions('ymshiping')) {
						suits.push(get.suit(i, false));
					}
				};
				if (ui.selected.cards.length > 0) {
					for (var j of ui.selected.cards) {
						suits.push(get.suit(j, false));
					}
				}
				return !suits.includes(get.suit(card, player));
			},
			selectCard: [1, Infinity],
			discard: false,
			lose: false,
			complexCard: true,
			check(card) {
				return 10 - _status.event.player.getUseValue(card);
			},
			async content(event, trigger, player) {
				var cards = event.cards;
				player.addToExpansion(cards, player, 'give').gaintag.add('ymshiping');
				player.draw(cards.length);
			},
			group: ['ymgengxin_sub', 'ymshiping'],
			subSkill: {
				sub: {
					logAudio(event, player) {
						return [
							'ext:忽悠宇宙/asset/ym/audio/ymgengxin4.mp3',
						]
					},
					trigger: {
						global: ["phaseBefore"],
						player: "enterGame",
					},
					forced: true,
					filter(event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0);
					},
					async content(event, trigger, player) {
						player.say('大家好，我是紫灵谷的骊歌！')
					}
				}
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				},
			},
		},
		ymshiping: {
			init(player) {
				player.markSkill('ymshiping');
			},
			charlotte: true,
			locked: true,
			mark: true,
			marktext: "视频",
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					var content = player.getExpansions('ymshiping');
					if (content && content.length) {
						dialog.addAuto(content);
					} else return '断更ing……';
				},
				content(content, player) {
					var content = player.getExpansions('ymshiping');
					if (content && content.length) {
						return get.translation(content);
					} else return '断更ing……';
				},
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
		},
		ymsanlian: {
			audio: 4,
			init(player) {
				player.storage.ymsanlian = [];
			},
			onremove(player) {
				for (var i of player.storage.ymsanlian) player.removeGaintag(i);
			},
			mod: {
				aiOrder(card, player, num) {
					if (!card.cards) return num;
					for (var i of card.cards) {
						for (var j of player.storage.ymsanlian) {
							if (i.hasGaintag(j) && !player.hasSkill('ymyuanmeng')) {
								return num - 0.5;
							}
						}
					}

				},
			},
			group: "ymshiping",
			global: "ymsanlian_give",
			subSkill: {
				give: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/ym/audio/ymsanlian1.mp3",
					],
					enable: "phaseUse",
					usable: 1,
					filter(event, player) {
						if (player.hasSkill('ymsanlian')) return false;
						var targets = game.filterPlayer(function (current) {
							return current != player &&
								current.hasSkill('ymsanlian') && current.hasSkill('ymshiping') &&
								current.getExpansions('ymshiping').length > 0;
						});
						if (!targets.length) return false;
						return true;
					},
					filterTarget(card, player, target) {
						return target != player && target.hasSkill('ymsanlian') && target.hasSkill('ymshiping') &&
							target.getExpansions('ymshiping').length > 0;
					},
					selectTarget() {
						if (game.countPlayer(current => {
							return current.hasSkill('ymsanlian') && current.hasSkill('ymshiping') &&
								current.getExpansions('ymshiping').length > 0;
						}) > 1) return 1;
						return -1;
					},
					complexSelect: true,
					prompt() {
						var player = _status.event.player;
						var targets = game.filterPlayer(function (current) {
							return current != player &&
								current.hasSkill('ymsanlian') && current.hasSkill('ymshiping') &&
								current.getExpansions('ymshiping').length > 0;
						});
						return '获得' + get.translation(targets) + (targets.length > 1 ? '中的一人' : '') + '的一张“视频”，然后交给其至多三张牌';
					},
					async content(event, trigger, player) {
						const target = event.targets[0];
						const { links } = await player
							.chooseCardButton(true, '获得一张“视频”', target.getExpansions('ymshiping'))
							.set('ai', (button) => {
								return get.value(button.link) || player.getUseValue(button.link)
							})
							.forResult();
						if (links) {
							await target.give(links, player, false);
							if (player.countCards('he') > 0) {
								const { cards } = await player
									.chooseCard(true, 'he', [1, 3]).set('ai', function (card) {
										var player = _status.event.player;
										var target = _status.event.targetx;
										if (card.name == 'du') {
											if (get.attitude(player, target) < 0) return 20;
											else return -1;
										}
										if (target.storage.ymzhenggao && target.storage.ymzhenggao.length < 5) return 12 - get.value(card);
										var num = player.needsToDiscard();
										if (ui.selected.cards.length < player.needsToDiscard()) return 8 - get.value(card);
										else return -1;
									})
									.set('prompt', '交给' + get.translation(target) + '至多三张牌')
									.set('targetx', target)
									.forResult();
								if (cards) {
									game.hyyzSkillAudio('ym', 'ymsanlian', cards.length + 1)
									await player.give(cards, target, false);
									target.addGaintag(cards, player.name);
									if (!target.storage.ymsanlian.includes(player.name)) {
										target.storage.ymsanlian.push(player.name);
									}
								}
							}
						}
					},
					ai: {
						order: 1,
						result: {
							target: 2,
						},
					},
				},
			},
		},
		ymzhenggao: {
			audio: 2,
			init(player) {
				player.storage.ymzhenggao = 0;
			},
			onremove(player) {
				delete player.storage.ymzhenggao;
			},
			mark: true,
			marktext: "征",
			intro: {
				content(storage, player) {
					if (player.storage.ymzhenggao == 0) return '没有粉丝……暂时……';
					return '你的支持率：' + player.storage.ymzhenggao;
				},
			},
			trigger: {
				global: ["gainAfter", "loseAsyncAfter"],
			},
			forced: true,
			dutySkill: true,
			filter(event, player) {
				if (event.name == 'phaseDiscard') return true;
				var cards = event.getg(player);
				if (!cards.length) return false;
				return game.hasPlayer(current => {
					if (current == player) return false;
					var evt = event.getl(current);
					if (evt && evt.cards && evt.cards.length) return true;
					return false;
				});
			},
			async content(event, trigger, player) {
				const cards = trigger.getg(player);
				await player.recover();
				player.storage.ymzhenggao += cards.length;
				player.syncStorage('ymzhenggao');
			},
			group: ["ymzhenggao_achieve", "ymzhenggao_fail"],
			subSkill: {
				achieve: {
					trigger: {
						player: "ymzhenggaoAfter",
					},
					forced: true,
					skillAnimation: true,
					animationColor: "fire",
					filter(event, player) {
						return player.storage.ymzhenggao >= 5;
					},
					async content(event, trigger, player) {
						game.log(player, '成功完成使命');
						player.popup('成功');
						player.awakenSkill('ymzhenggao');
						player.unmarkSkill('ymzhenggao');
						await player.loseMaxHp();
						await player.addSkills('ymyuanmeng');
					},
					sub: true,
					"_priority": 0,
				},
				fail: {
					trigger: {
						global: "roundStart",
					},
					forced: true,
					filter(event, player) {
						return game.roundNumber == 4;
					},
					async content(event, trigger, player) {
						game.log(player, '使命失败');
						player.popup('失败');
						player.awakenSkill('ymzhenggao');
						player.unmarkSkill('ymzhenggao');
						await player.clearSkills();
						await player.addSkillLog('ymduangeng');
					},
				},
			},
			derivation: ["ymyuanmeng", "ymduangeng"],
		},
		ymyuanmeng: {
			audio: 3,
			trigger: {
				player: "useCard",
			},
			forced: true,
			charlotte: true,
			filter(event, player) {
				return player.hasHistory('lose', evt => {
					if (event != evt.getParent()) return false;
					for (var i in evt.gaintag_map) {
						for (var j of player.storage.ymsanlian) {
							if (evt.gaintag_map[i].includes(j)) return true;
						}
					}
					return false;
				});
			},
			content() {
				game.log(trigger.card, '不能被响应')
				trigger.directHit.addArray(game.filterPlayer());

				var log = {}
				player.getHistory('lose', function (evt) {
					if (trigger == evt.getParent()) {
						for (var i in evt.gaintag_map) {
							for (var j of player.storage.ymsanlian) {
								if (evt.gaintag_map[i].includes(j)) log[j] ? (log[j]++) : (log[j] = 1);
							}
						}
					}
				});
				for (var i in log) {
					var target = game.filterPlayer(function (current) {
						return current.name == i && current.isIn();
					})[0];
					if (target) {
						target.draw(log[i]);
					}
				}
			},
			mod: {
				targetInRange(card, player, target) {
					if (!card.cards) return;
					for (var i of card.cards) {
						for (var j of player.storage.ymsanlian) {
							if (i.hasGaintag(j)) return true;
						}
					}
				},
				aiUseful(player, card, num) {
					if (get.itemtype(card) == 'card') {
						if (!player.storage.ymsanlian) return;
						for (var name of player.storage.ymsanlian) {
							if (card.hasGaintag(name)) {
								return num + 10;
							}
						}
					}
				},
				aiOrder() {
					lib.skill.ymyuanmeng.mod.aiUseful.apply(this, arguments);
				},
			},
		},
		ymduangeng: {
			audio: 2,
			init(player) {
				player.say('饿死啦！饿死啦！我不干啦！')
				player.markSkill('ymshiping');
			},
			group: "ymshiping",
			trigger: {
				player: "phaseJieshuBegin",
			},
			filterButton(event, player) {
				return player.getExpansions('ymshiping').length > 0
			},
			async cost(event, trigger, player) {
				const { links } = await player
					.chooseCardButton(get.prompt('ymduangeng'), '弃置一张“视频”牌，然后回复1点体力并摸两张牌', player.getExpansions('ymshiping')).set('ai', function () {
						return _status.event.player.isDamaged();
					}).forResult();
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
				await player.loseToDiscardpile(event.cost_data.links);
				await player.recover();
				await player.draw(2);
				if (player.getExpansions('ymshiping').length <= 0) {
					player.removeSkills(['ymshiping', 'ymduangeng']);
				}
			},
		},
		ymgengxin_info: "更新|出牌阶段，你可以将不同花色的牌置于武将牌上，称为“视频”，然后摸等量的牌。",
		ymshiping: "视频",
		ymsanlian_info: "三连|其他角色的出牌阶段限一次，其可以获得一张“视频”并交给你至多三张牌。",
		ymzhenggao_info: "征稿|使命技，你获得其他角色的牌后恢复1点体力。<br><span class=greentext>成功</span>：当你累计获得其他角色五张牌后，你减1点体力上限并获得〖圆梦〗。<br><span class=firetext>失败</span>：第四轮开始时，你失去所有技能并获得〖断更〗。",
		ymyuanmeng_info: "圆梦|锁定技，你使用因“三连”获得的牌无距离限制且不能被响应，然后令交出此牌的角色摸一张牌。",
		ymduangeng_info: "断更|结束阶段，你可以弃置一张“视频”，然后回复1点体力并摸两张牌。",

		ym_weibajiang: ['就离谱', ['male', "hyyz_ɸ", 3, ["ymzhuxin", "ymyingping", "ymzhuojian"], []], `<img src=${lib.assetURL}extension/忽悠宇宙/huohuoTail.png width="50" height="50">-尾巴酱`, '狂傲无比的，花里胡哨的，虚情假意的，拐弯抹角的，含沙射影的，隔岸观火的，添油加醋的，画蛇添足的，自以为是的，在下不才，可抨击一二。骊歌更新期间的某群友，无丝竹之乱耳、无案牍之劳形时期的尾巴酱。'],
		ymzhuxin: {
			audio: 2,
			trigger: {
				player: "useCardToTargeted",
			},
			filter(event, player) {
				return event.card?.name == 'sha';
			},
			forced: true,
			async content(event, trigger, player) {
				trigger.getParent().targets.remove(trigger.target);
				let cards;
				if (trigger.target.countCards('he') > 0) {
					cards = (await trigger.target
						.chooseToDiscard('诛心：弃置【闪】可免伤，否则失去1点体力', 'he', true)
						.set('ai', (card) => {
							const target = _status.event.getTrigger().target;
							if (card.name == 'shan') return -get.effect(target, { name: "losehp" }, target, target);
							return - get.value(card);
						}).forResult()).cards;
				}
				if (!cards || get.name(cards[0]) != 'shan') {
					await trigger.target.loseHp();
				}
			},
			ai: {
				unequip: true,
				"unequip_ai": true,
				skillTagFilter(player, tag, arg) {
					return arg?.name == 'sha'
				},
				effect: {
					target(card, player, target) {
						if (card.name == "jiu" && target.hp > 0) return "zeroplayertarget";
					},
				},
			},
		},
		ymyingping: {
			audio: 2,
			trigger: {
				player: "gainAfter",
				global: "loseAsyncAfter",
			},
			filter(event, player) {
				return event.getg && event.getg(player)?.some(card =>
					player.hasUseTarget(card) && player.countCards('h', cardx => cardx == card) && get.timetype(card) == 'notime'
				)
			},
			usable: 1,
			async cost(event, trigger, player) {
				const { links } = await player.chooseButton(["是否使用其中的牌？", trigger.getg(player)])
					.set('filterButton', (button) => {
						return _status.event.player.hasUseTarget(button.link) &&
							_status.event.player.countCards(card => card == button.link) &&
							get.timetype(button.link) == 'notime'
					})
					.set("ai", button => _status.event.player.getUseValue(button.link))
					.forResult();
				if (links) {
					event.result = {
						bool: true,
						cards: links,
					}
				}
			},
			async content(event, trigger, player) {
				let card, cards;
				if (_status.currentPhase == player) {
					cards = [];
					card = get.autoViewAs({
						name: get.name(event.cards[0]),
						nature: get.nature(get.name(event.cards[0])),
						color: 'none',
						suit: 'none',
						number: null,
						storage: {},
						isCard: true
					}, cards);
				} else {
					cards = [event.cards[0], event.cards[0]];
					card = get.autoViewAs({
						name: get.name(event.cards[0]),
						nature: get.nature(get.name(event.cards[0])),
						color: get.color(event.cards[0]),
						suit: 'none',
						number: null,
						storage: {},
					}, cards);
				}
				const next = player.chooseUseTarget()
				next.set('cards', cards)
				next.set('card', card)
				next.set('forced', true)
				next.set('addCount', false)
				await next;
			},
		},
		ymzhuojian: {
			audio: 2,
			trigger: {
				global: ["useCard", "respond"]
			},
			forced: true,
			filter(event, player) {
				return (get.is.convertedCard(event.card) || get.is.virtualCard(event.card) || event.cards.some(i => get.name(i) != event.card.name));
			},
			async content(event, trigger, player) {
				if (trigger.name == 'useCard' && trigger.targets.includes(player)) {
					trigger.excluded.add(player);
				}
				const names = []
				player.getHistory('useCard', function (evt) {
					names.add(evt.card.name);
				})
				let card = get.cardPile((card) => !names.includes(card.name))
				if (card) player.gain(card, 'draw');

				/*player
					.when({
						global: ["useCardAfter", "respondAfter"]
					})
					.filter((event, player) => event.card == trigger.card)
					.then(() => {
					})*/
			},
		},
		ymzhuxin_info: "诛心|锁定技，你使用【杀】的结算方式改为目标角色弃置一张牌，若不为【闪】，其失去1点体力。",
		ymyingping_info: "应评|回合技，你于回合内/外获得牌后，可以使用其中一张即时牌且实体牌数-1/+1。",
		ymzhuojian_info: "灼见|锁定技，虚拟牌和转化牌对你无效；结算后你获得一张本回合未使用过的牌。",

		ym_canghaiyisu: ['沧海依酥', ['female', "hyyz_ɸ", 4, ["ymmoyu", "ymxingmeng"], []], '沧海依酥', '感觉没什么好介绍的，就是上班没事的时候摸鱼划水，有事的时候拼命干活。工作累了就停下休息吧，但是人生不能一直原地踏步，所以该前进的时候也要努力前行啊。'],
		ymmoyu: {
			trigger: {
				global: "phaseUseBefore"
			},
			forced: true,
			filter(event, player) {
				return event.getParent().skill != 'ymxingmeng';
			},
			content() {
				if (trigger.player == player) {
					trigger.cancel();
				} else {
					player.draw();
					player.chooseToUse();
				}
			},
		},
		ymxingmeng: {
			trigger: {
				global: "phaseAfter"
			},
			filter(event, player) {
				return event.player != player && player.getStat('damage') > 0;
			},
			content() {
				player.insertPhase('ymxingmeng');
			},
			"_priority": 0,
		},
		"ymmoyu_info": "摸鱼|锁定技，你跳过出牌阶段；其他角色的出牌阶段开始时，你摸一张牌，然后可以使用一张牌。",
		"ymxingmeng_info": "醒梦|其他角色的回合结束后，若你于此回合内造成过伤害，你执行一个额外的回合且此回合内〖摸鱼〗失效。",

		ym_re_canghaiyisu: ['沧海依酥', ['female', 'hyyz_ɸ', 4, ['ymremoyu', 'ymrexingmeng'], []], '沧海依酥', ''],
		ymremoyu: {
			init(player) {
				player.storage.ymremoyu = [];
			},
			forced: true,
			trigger: {
				global: 'phaseUseBegin',
			},
			async content(event, trigger, player) {
				if (trigger.player == player) {
					trigger.cancel();
				} else {
					player.draw();
					const { result: { card } } = await player
						.chooseToUse('摸鱼：使用一张牌', function (card, player, event) {
							if (get.position(card) != 'h') return false;
							return lib.filter.cardEnabled.apply(this, arguments);
						}).set('logSkill', 'ymremoyu');
					if (card) {
						if (get.type(card) != 'equip') player.storage.ymremoyu.add(card.name);
					}
				}
			}
		},
		ymrexingmeng: {
			skillAnimation: true,
			animationColor: "water",
			juexingji: true,
			unique: true,
			trigger: {
				player: "phaseBegin",
			},
			filter(event, player) {
				return !player.storage.ymrexingmeng && player.storage.ymremoyu.length >= game.countPlayer();
			},
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				player.storage[event.name] = true;
				player.addSkillLog('ymyimeng');
				player.storage.ymyimeng = player.storage.ymremoyu;
				player.removeSkill('ymremoyu');
			},
			derivation: ["ymyimeng"],
		},
		ymyimeng: {
			hiddenCard(player, name) {
				return player.getStorage("ymyimeng").includes(name) &&
					!player.getStorage("ymyimeng2").includes(name) &&
					player.countCards("hes") > 0;
			},
			init(player) {
				player.storage.ymyimeng = [];
				player.storage.ymyimeng2 = [];
			},
			enable: "chooseToUse",
			filter(event, player) {
				return player.hasCard((card) =>
					lib.inpile.some((name) => {
						if (player.getStorage("ymyimeng").includes(name) || player.getStorage("ymyimeng2").includes(name)) return false;
						if (get.type(name) != "basic" && get.type(name) != "trick") return false;
						if (event.filterCard({ name: name, isCard: true, cards: [card] }, player, event)) return true;
						if (name == "sha") {
							for (var nature of lib.inpile_nature) {
								if (event.filterCard({ name: name, nature: nature, isCard: true, cards: [card] }, player, event)) return true;
							}
						}
						return false;
					}, "hes")
				) > 0;
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (var name of player.getStorage("ymyimeng")) {
						if (get.type(name) == "basic" || get.type(name) == "trick") {
							if (player.getStorage("ymyimeng2").includes(name)) continue;
							list.push([get.translation(get.type(name)), "", name]);
							if (name == "sha") {
								for (var j of lib.inpile_nature) list.push(["基本", "", "sha", j]);
							}
						}
					}
					return ui.create.dialog("忆梦", [list, "vcard"]);
				},
				filter(button, player) {
					return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
				},
				check(button) {
					var player = _status.event.player;
					var card = { name: button.link[2], nature: button.link[3] };
					if (player.countCards("hes", (cardx) => cardx.name == card.name)) return 0;
					return _status.event.getParent().type == "phase" ? player.getUseValue(card) : 1;
				},
				backup(links, player) {
					return {
						filterCard: true,
						popname: true,
						check(card) {
							return 7 - get.value(card);
						},
						position: "hes",
						viewAs: { name: links[0][2], nature: links[0][3] },
						onuse(result, player) {
							player.markAuto("ymyimeng2", [result.card.name]);
							player.when({
								global: 'phaseAfter'
							}).then(() => {
								player.storage.ymyimeng2 = [];
							})
						},
					};
				},
				prompt(links, player) {
					return "将一张牌当做" + (get.translation(links[0][3]) || "") + get.translation(links[0][2]) + "使用";
				},
			},
			ai: {
				order: 4,
				save: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter(player, tag, arg) {
					if (!player.countCards("hes") || player.hasSkill("taoluan3")) return false;
					if (tag == "respondSha" || tag == "respondShan") {
						if (arg == "respond") return false;
						return !player
							.getStorage("taoluan")
							.includes(tag == "respondSha" ? "sha" : "shan");
					}
					return (
						!player.getStorage("taoluan").includes("tao") ||
						(!player.getStorage("taoluan").includes("jiu") && arg == player)
					);
				},
				result: {
					player(player) {
						var num = player.countMark("xintaoluan2");
						var players = game.filterPlayer();
						for (var i = 0; i < players.length; i++) {
							if (
								players[i] != player &&
								players[i].countCards("he") > (num + 1) * 2 &&
								get.attitude(player, players[i]) > 0
							) {
								return 1;
							}
						}
						return 0;
					},
				},
				threaten: 1.9,
			},
		},
		ymremoyu_info: "摸鱼|锁定技，你始终跳过出牌阶段。其他角色的出牌阶段开始时，你摸一张牌然后你可以使用一张手牌；若此牌不为装备牌，则记录此牌的牌名。",
		ymrexingmeng_info: "醒梦|觉醒技，回合开始时，若你记录的牌名数不小于当前存活人数，则你失去技能〖摸鱼〗，然后获得技能〖忆梦〗。",
		ymyimeng_info: "忆梦|每回合每种牌名限一次，你可以将一张牌当做已记录牌名的牌使用或打出。",

		ym_menghai: ['梦海离殇', ['male', "hyyz_ɸ", 4, ["ymyingji", "ymanxing"], []], '梦海离殇', '我是梦海离殇，以前的名字是影寂-黯星，驭空的设计者，现在这个(影寂-黯星)名字变成了我如今的技能，技能效果吗就是按照技能名字的意思写的，虽然二技能不太像，但是是我想要的技能效果，台词也是我朋友帮我写的，谢谢他帮我写了。'],
		ymyingji: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('he', { color: 'black' }) && game.hasPlayer(current => player.canUse('sha', current, false));
			},
			filterTarget(card, player, target) {
				return target != player && player.canUse('sha', target, false);
			},
			filterCard: {
				color: "black",
			},
			position: "he",
			check(card) {
				return 7 - get.value(card);
			},
			content() {
				'step 0'
				player.useCard({ name: 'sha' }, target, false).animate = false;
			},
			ai: {
				order: 10,
				result: {
					target(player, target) {
						if (player.hasUnknown()) return 0;
						return get.effect(target, { name: 'sha' }, player, target);
					},
				},
			},
			"_priority": 0,
		},
		ymanxing: {
			audio: 2,
			trigger: {
				global: "damageEnd",
			},
			filter(event, player) {
				return event.player.isIn();
			},
			check(event, player) {
				var att1 = get.attitude(player, event.player);
				var att2 = get.attitude(player, event.source);
				return att1 > 0 && att2 <= 0;
			},
			preHidden: true,
			content() {
				"step 0"
				player.judge(function (card) {
					if (get.color(card) == 'black') return 2;
					else return 1;
				});
				"step 1"
				if (result.color == 'black') {
					if (trigger.source && trigger.source.isAlive()) {
						player.link(trigger.source, 'fire')
						trigger.source.damage(player);
					}
				} else {
					player.link(trigger.player, 'green')
					trigger.player.draw();
				}
			},
			ai: {
				expose: 0.3,
			},
			"_priority": 0,
		},
		"ymyingji_info": "影寂|出牌阶段限一次，你可以弃置一张黑色牌，视为使用一张无距离限制且不计入次数上限的【杀】。",
		"ymanxing_info": "黯星|一名角色受到伤害后，你可以进行一次判定。若结果为黑色，你对伤害来源造成1点伤害；否则，受伤角色摸一张牌。",

		ym_sp_menghai: ['梦海离殇', ['male', 'hyyz_ɸ', 4, ['ymspxingmeng', 'ymlangu'], []], '梦海离殇', ''],
		ymspxingmeng: {
			audio: 3,
			trigger: {
				source: 'damageSource'
			},
			usable: 1,
			frequent: true,
			content() {
				if (trigger.player.countCards('h') > player.countCards('h')) {
					player.discardPlayerCard(trigger.player, 'he');
				} else if (trigger.player.countCards('h') == player.countCards('h')) {
					trigger.player.damage(player);
				} else if (trigger.player.countCards('h') < player.countCards('h')) {
					player.draw();
				};
			},
		},
		ymlangu: {
			audio: 3,
			trigger: {
				global: 'phaseEnd'
			},
			filter: (event, player) => event.player.getStat('damage') > 0,
			prompt: (event, player) => {
				let num = 0;
				event.player.getHistory("sourceDamage", function (evt) {
					num += evt.num;
				});
				return `兰谷：令${get.translation(event.player)}摸${num}张牌`;
			},
			check: (event, player) => {
				return get.attitude(player, event.player) > 0;
			},
			content() {
				let num = 0;
				trigger.player.getHistory("sourceDamage", function (evt) {
					num += evt.num;
				});
				trigger.player.draw(num);
			}
		},
		ymspxingmeng_info: "星梦|每回合限一次，当你对一名角色造成伤害后，若其当前手牌数：多于你，你可以弃置其一张牌；少于你，你可以摸一张牌；等于你，你可以对其造成1点伤害。",
		ymlangu_info: "兰谷|一名角色的结束阶段，若其本回合造成过伤害，你可以令其摸×张牌（×为其本回合造成的总伤害值）。",

		ym_miealiei: ['咩阿栗诶', ['female', "hyyz_ɸ", "3/4", ["ymxunshi", "ymzaobing", "ympanli"], []], '咩阿栗诶', '原名来星那由，砂狼白子设计师，因为找了坑人的师傅而走了设计的歪路，后来因为一些事情，转生了，改名咩阿栗。一技能拜师，还原了那由拜师时的过程，师傅出多少，他就出多少，二技能，体现了那由制作武将，从被师傅怒骂到让师傅感到满意的过程，觉醒技就是最近，那由的武将经过群友的一番修改，提建议后，意识到了那个坑比师傅，于是果断离开了师傅，觉醒后的精修和修改造兵都是为了体现那由酱的进步总结：前期攒灵感，后期就是觉醒钟会体验卡。'],
		ymxunshi: {
			audio: 2,
			logAudio: () => [
				"ext:忽悠宇宙/asset/ym/audio/ymxunshi1.mp3",
			],
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			forced: true,
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				const { targets } = await player
					.chooseTarget(get.prompt2(event.name), true, lib.filter.notMe).set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) return att + 1;
						if (att == 0) return Math.random();
						return att;
					})
					.forResult()
				if (targets) {
					player.storage.ymxunshi = targets[0];
					targets[0].addSkill('ymxunshi_shi');
				}
			},
			group: 'ymxunshi_linggan',
			subSkill: {
				shi: {
					init(player) {
						player.storage.ymxunshi_shi = [];
					},
					mark: true,
					marktext: "师",
					intro: {
						name: "寻师",
						content() {
							return "你成为了咩阿栗诶的师傅，你使用过的花色有$"
						}
					},
					trigger: {
						player: "useCard"
					},
					filter(event, player) {
						if (_status.currentPhase != player) return false;
						return get.suit(event.card) != 'none';
					},
					silent: true,
					charlotte: true,
					async content(event, trigger, player) {
						player.storage.ymxunshi_shi.add(get.suit(trigger.card));
						player.markSkill(event.name);
						player.when({
							player: 'phaseBegin'
						}).then(() => {
							player.storage.ymxunshi_shi = [];
							player.markSkill(event.name);
						})
					}
				},
				linggan: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/ym/audio/ymxunshi2.mp3",
					],
					marktext: '灵感',
					intro: {
						name: "灵感",
						content: "expansion",
						markcount: "expansion",
					},
					onremove(player, skill) {
						var cards = player.getExpansions(skill);
						if (cards.length) player.loseToDiscardpile(cards);
					},
					trigger: {
						global: 'changeHp'
					},
					filter(event, player) {
						return player.storage.ymxunshi == event.player && event.num != 0
					},
					forced: true,
					async content(event, trigger, player) {
						await player.draw(Math.abs(trigger.num));
						if (!player.countCards('he')) return;
						const { cards } = await player.chooseCard('寻师：可以将一张牌置于武将牌上', 'he').forResult();
						if (cards) {
							player.addToExpansion(cards, player, 'giveAuto').gaintag.add('ymxunshi_linggan');
						}
					},

				}
			}
		},
		ymzaobing: {
			audio: 1,
			enable: "phaseUse",
			usable: 2,
			filter(event, player) {
				return player.countCards('he');
			},
			filterCard: true,
			position: "he",
			check(card) {
				return 7 - get.value(card);
			},
			discard: false,
			lose: false,
			async content(event, trigger, player) {
				let suits = [];
				let suit = get.suit(event.cards[0]);
				if (player.storage.ymxunshi?.isIn()) {
					suits = player.storage.ymxunshi.getStorage('ymxunshi_shi');
				}
				if (suits.includes(suit)) {
					let next = player.recast(event.cards)
					next.recastingGain = (player, cards) => {
						let next = player.draw(cards.length + 1)
						next.log = false;
						next.gaintag = ['ymzaobing']
					}
					await next;
				} else {
					let next = player.recast(event.cards)
					next.recastingLose = (player, cards) => {
						if (player.hasSkill('ymxunshi')) player.addToExpansion(event.cards, player, 'giveAuto').gaintag.add('ymxunshi_linggan');
						else player.loseToDiscardpile(cards).log = false;
					}
					next.recastingGain = (player, cards) => {
						let next = player.draw(cards.length)
						next.log = false;
						next.gaintag = ['ymzaobing']
					}
					await next;
				}
			},
			mod: {
				ignoredHandcard(card, player) {
					if (card.hasGaintag('ymzaobing')) {
						return true;
					}
				},
				cardDiscardable(card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('ymzaobing')) {
						return false;
					}
				},
			},
			ai: {
				combo: "ymxunshi",
				order: 1,
				result: {
					player: 1,
				}
			},
		},
		ympanli: {
			audio: 1,
			unique: true,
			juexingji: true,
			skillAnimation: true,
			animationColor: "fire",
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			filter(event, player) {
				return player.getExpansions('ymxunshi_linggan').length > game.countPlayer();
			},
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				await player.draw(player.countCards('e'));
				player.changeSkills(['ymzaobing_rewrite', 'ymjingxiu'], ['ymxunshi', 'ymzaobing'],)
			},
			derivation: ["ymzaobing_rewrite", "ymjingxiu"],
		},
		ymzaobing_rewrite: {
			audio: 1,
			enable: "phaseUse",
			filter(event, player) {
				return player.countCards('he');
			},
			check(card) {
				return 7 - get.value(card);
			},
			position: "he",
			filterCard(card, player) {
				let suits = [];
				game.getGlobalHistory('everything', (evt) => {
					if (evt.name == 'lose' && evt.player == player && evt.getParent(2).name == "recast" && evt.getParent(3).name == "ymzaobing_rewrite") {
						evt.cards.map(cardx => suits.add(get.suit(cardx)))
					}
				})
				return !suits.includes(get.suit(card));
			},
			discard: false,
			lose: false,
			async content(event, trigger, player) {
				let cardx = event.cards[0];

				let next = player.recast(event.cards)
				next.recastingGain = (player, cards) => {
					let next = player.draw(cards.length)
					next.log = false;
					next.gaintag = ['ymzaobing']
				}
				await next;
				if (player.getExpansions('ymxunshi_linggan').some(card => get.suit(card) == get.suit(cardx))) {
					const { links } = await player
						.chooseCardButton('弃置一张“灵感”，摸两张牌；或视为使用一张锦囊牌', player.getExpansions('ymxunshi_linggan'))
						.forResult();
					if (links) {
						await player.loseToDiscardpile(links);
						player.draw(2).gaintag = ['ymzaobing'];
					} else {
						let list = [];
						for (let name of lib.inpile) {
							if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
						}
						let dialog = ui.create.dialog('造兵', [list, 'vcard']);
						const { links: links2 } = await player
							.chooseButton(true, dialog)
							.set('filterButton', function (button) {
								let name = button.link[2];
								if (player.getHistory('useCard', (evt) => {
									return evt.card.name == name && evt.card.storage.ymzaobing
								}).length) return false
								return true
							})
							.set('ai', function (button) {
								return player.getUseValue({ name: button.link[2] }) || get.value({ name: button.link[2] })
							})
							.forResult()
						if (links2) {
							player.chooseUseTarget(true, { name: links2[0][2], storage: { ymzaobing: true } });
						}
					}
				} else {
					if (player.countCards('h') > 0) {
						const { cards } = await player.chooseCard('将一张手牌置于武将牌上', 'h').forResult();
						if (cards) player.addToExpansion(cards, player, 'giveAuto').gaintag.add('ymxunshi_linggan');
					}
				}
			},
			mod: {
				ignoredHandcard(card, player) {
					if (card.hasGaintag('ymzaobing')) {
						return true;
					}
				},
				cardDiscardable(card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('ymzaobing')) {
						return false;
					}
				},
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				}
			},
		},
		ymjingxiu: {
			audio: 1,
			trigger: {
				player: "useCard1",
			},
			filter(event, player) {
				if (!player.getExpansions('ymxunshi_linggan').length) return false;
				return event.player.hasHistory('lose', function (evt) {
					if (evt.getParent() != event) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('ymzaobing')) return true;
					}
					return false;
				});
			},
			filterx(event, player) {
				var card = event.card;
				var info = get.info(card);
				if (info.allowMultiple == false) return false;
				if (event.targets && !info.multitarget) {
					if (game.hasPlayer(function (current) {
						return !event.targets.includes(current) &&
							lib.filter.targetEnabled2(card, player, current) &&
							lib.filter.targetInRange(card, player, current);
					})) {
						return true;
					}
				}
				return false;
			},
			async cost(event, trigger, player) {
				const { links } = await player
					.chooseCardButton('弃置至多三张“灵感”牌，加强' + get.translation(trigger.card), player.getExpansions('ymxunshi_linggan'), [1, Math.min(3, player.getExpansions('ymlinggan').length)])
					.set('ai', () => true)
					.forResult();
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
				await player.loseToDiscardpile(links);
				let list = ['摸' + links.length + '张牌',]
				if (lib.skill.ymjingxiu.filterx(trigger, player)) {
					list.push('为此牌增加至多' + links.length + '个目标');
				};
				if (list.length == 1) {
					await player.draw(links.length);
					return;
				}
				const { targets } = await player
					.chooseTarget('精修：为' + get.translation(trigger.card) + '增加至多' + links.length + '个目标？或点取消摸' + links.length + '张牌', [1, links.length], function (card, player, target) {
						let trigger = _status.event.getTrigger();
						return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, player, target) && lib.filter.targetInRange(trigger.card, player, target);
					})
					.set('ai', function (target) {
						let card = _status.event.getTrigger().card;
						let player = _status.event.player;
						return get.effect(target, card, player, player);
					})
					.forResult();
				if (targets) {
					player.line(targets);
					trigger.targets.addArray(targets);
				} else {
					await player.draw(links.length);
				}
			},
			mod: {
				aiOrder(player, card, num) {
					if (get.itemtype(card) == 'card' && card.hasGaintag('ymzaobing')) return num + 0.5;
				},
			},
			ai: {
				"directHit_ai": true,
			},
		},
		ymxunshi_info: "寻师|锁定技，游戏开始时，你令一名其他角色获得“师”；该角色的体力值改变后，你摸等量的牌，然后可以将一张牌置于武将牌上，称为“灵感”。",
		ymzaobing_info: "造兵|出牌阶段限两次，你可以重铸一张牌（不计入手牌上限）。若“师”上一回合内使用过此牌的花色，此重铸的摸牌数+1，否则，此重铸失去的牌加入“灵感”。",
		ympanli_info: "叛离|觉醒技，准备阶段，若“灵感”数大于存活角色数，你摸与装备区内牌数等量的牌，失去〖寻师〗，修改〖造兵〗，并获得〖精修〗。",
		ymzaobing_rewrite_info: "造兵|出牌阶段每种花色限一次，你可以重铸一张牌（不计入手牌上限）。若此牌花色与“灵感”中的一张牌花色相同，你选择一项：1.弃置一张灵感，摸两张牌。2.视为使用一张本回合未以次法使用过的锦囊牌。否则，将一张手牌加入“灵感”。",
		ymjingxiu_info: "精修|当你使用〖造兵〗牌时，可以弃置至多三张“灵感”，令此牌额外指定等量的目标或摸等量的牌。",

		ym_sp_miealiei: ['魔羊', ['female', 'hyyz_ɸ', 4, ['ymkunlv', 'ymsiyan'], []], '咩阿栗诶', ''],
		ymkunlv: {
			audio: 1,
			forced: true,
			trigger: {
				player: 'phaseBegin'
			},
			filter(event, player) {
				let suits = [];
				player.getCards('he').map(card => {
					suits.add(get.suit(card, player));
				});
				if (suits.length >= player.hp) return true;
			},
			async content(event, trigger, player) {
				let result;
				if (game.hasPlayer(current => current.hp < player.hp)) {
					result = await player.chooseTarget('困虑：将手牌向一名体力值不大于你的角色调整2', (card, player, target) => {
						return target.hp <= player.hp;
					})
						.set('ai', (target) => {
							if (player.storage.ymkunlv != undefined) {
								if (player.storage.ymkunlv == 1) {
									if (game.hasPlayer(current => current.hp < player.hp && current.countCards('h') < player.countCards('h'))) return target.countCards('h') < player.countCards('h');
								} else {
									if (game.hasPlayer(current => current.hp < player.hp && current.countCards('h') > player.countCards('h'))) return target.countCards('h') > player.countCards('h');
								}
							}
							if (game.hasPlayer(current => current.hp < player.hp && current.countCards('h') > player.countCards('h'))) {
								return target.countCards('h') > player.countCards('h');
							} else {
								return true;
							};
						})
						.forResult()
				} else {
					result = { bool: true, targets: [player] };
				}
				if (result.targets) {
					const targets = result.targets;
					const temp = targets[0] == player ? player.hp : targets[0].countCards('h');

					if (temp > player.countCards('h')) {//1
						if (player.storage.ymkunlv == 0) {
							player.addTempSkill('ymsiling');
						} else {
							player.when('phaseAfter').then(() => {
								var next = player.phaseDraw();
								event.next.remove(next);
								trigger.next.push(next);
							})
						}
						player.storage.ymkunlv = 1;
						await player.draw(2);
					} else if (temp < player.countCards('h')) {//0
						if (player.storage.ymkunlv == 1) {
							player.addTempSkill('ymsiling');
						} else {
							player.when('phaseAfter').then(() => {
								var next = player.phaseDraw();
								event.next.remove(next);
								trigger.next.push(next);
							})
						}
						player.storage.ymkunlv = 0;
						await player.chooseToDiscard('h', true, 2);
					}
				}
			},
			derivation: 'ymsiling',
		},
		ymsiyan: {
			audio: 1,
			trigger: {
				player: ['drawAfter', 'discardAfter']
			},
			filter(event, player) {
				return (event.name == 'draw' ? event.getParent().name : event.getParent(2).name) == 'ymkunlv';
			},
			async cost(event, trigger, player) {
				let cards = player.getCards('he');
				let list = [];
				for (let i = 0; i < cards.length; i++) {
					list.add(get.color(cards[i]));
				}
				list.sort();
				const { control } = await player
					.chooseControl(list, 'cancel2')
					.set('prompt', get.prompt2('ymsiyan'))
					.set('ai', function () {
						var player = _status.event.player;
						var val = {}, min = ['', 100];
						for (var i of player.getCards('he')) {
							var suit = get.suit(i);
							if (!val[suit]) {
								val[suit] = get.value(i);
							} else {
								val[suit] += get.value(i);
							}
							if (val[suit] < min[1]) min = [suit, val[suit]];
						}
						return min[0];
					})
					.forResult();
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
				player.recast(player.getCards('he', { color: event.cost_data.control }));
			},
			group: 'ymsiyan_draw',
			subSkill: {
				draw: {
					trigger: {
						player: 'gainAfter'
					},
					forced: true,
					charlotte: true,
					filter(event, player) {
						if (event.getParent(3).name != 'ymsiyan') return false;
						if (event.getg(player).length < 2) return false;
						let types = [], types2 = ['trick', 'equip', 'basic'];
						for (let i of event.getg(player)) {
							types.add(get.type2(i));
							types2.remove(get.type2(i));
						}
						return types.length == 2 && types2.length > 0 && get.discarded().some(card => get.type2(card) == types2[0]);
					},
					async content(event, trigger, player) {
						let types = ['trick', 'equip', 'basic'];
						for (let i of trigger.getg(player)) types.remove(get.type2(i));

						let list = get.discarded().filter((card) => get.type2(card) == types[0]);
						const { result: { links } } = await player.chooseButton(['选择要获得的牌', list], 1, true);
						if (links) {
							player.gain(links, 'gain2');
						}
					}
				}
			}
		},
		ymsiling: {
			audio: 1,
			init(player) {
				player.storage.ymsiling = [];
			},
			enable: 'phaseUse',
			filter(event, player) {
				if (player.countCards("h") == 0) return false;
				return game.hasPlayer(function (current) {
					return current.countCards('h') <= player.countCards('h') && player.canCompare(current);
				});
			},
			filterTarget(card, player, target) {
				return target.countCards('h') <= player.countCards('h') + 1 && player.canCompare(target) &&
					!player.storage.ymsiling.includes(target);
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.storage.ymsiling.push(target);
				player.when({
					global: 'phaseAfter'
				}).then(() => {
					player.storage.ymsiling = [];
				})
				await player.draw();
				const { bool } = await player.chooseToCompare(target).forResult();
				if (bool) {
					await player.useCard({ name: 'zhibi' }, [target]);
					let bool2 = false
					if (target.countCards('h'))
						bool2 = (
							await player
								.discardPlayerCard('弃置其一张牌，否则对其造成1点伤害', target, 'he')
								.set('ai', (card) => false)
						).bool;
					if (!bool2) target.damage();
				}
			},
		},
		ymkunlv_info: "困虑|锁定技，回合开始时，若你拥有的花色数不小于你的体力值，则你将手牌向一名体力值不大于你的角色调整2（如果没有则调整至你的体力值）。若调整方向与上次：不同，则本回合内你获得〖司凌〗；相同，你回合结束后你获得一个摸牌阶段。",
		ymsiyan_info: "思焰|你的手牌因〖困虑〗调整后，你可重铸手中一种颜色的所有牌。若你因此获得至少两种类别不同的牌，则你可从中央区内获得一张未因此获得的类别牌。",
		ymsiling_info: "司凌|出牌阶段每名其他角色限一次，你可摸一张牌并与一名手牌数不大于你的角色拼点，若你赢，则视为对其使用一张【知已知彼】然后弃置其一张牌/造成一点伤害。",

		ym_re_miealiei: ['眠羊', ['female', 'hyyz_ɸ', '3/4', ['ymfanxing', 'ymqinglv'], []], '卸锱轻旅-咩阿栗诶', '负重寻找答案，可能会因为背上的重量而忘记了自己想要寻找的答案，反之亦然'],
		ymfanxing_info: '繁行|锁定技，你每回合使用首张牌后，需选择①重铸一组同花手牌;②〖制衡〗区域内所有牌③将手牌数向体力上限调整一。',
		ymfanxing: {
			audio: 1,
			trigger: {
				player: 'useCardAfter'
			},
			listFilter(player) {
				let list = [];
				if (!lib.skill.ymfanxing.list?.length) return [];
				for (let i of lib.skill.ymfanxing.list) {
					if (
						i == '重铸一组同花手牌' && player.countCards('h', (card) => player.countCards('h', (card2) => card != card2 && get.suit(card) == get.suit(card2)) > 0) > 0 ||
						i == '〖制衡〗区域内所有牌' && player.countCards('he') ||
						i == '将手牌数向体力上限调整一' && player.countCards('h') != player.maxHp
					) list.add(i);
				};
				return list;
			},
			filter(event, player) {
				if (player.hasHistory('useCard', (evt) => evt != event)) return false;
				return lib.skill.ymfanxing.listFilter(player).length > 0;
			},
			forced: true,
			async content(event, trigger, player) {
				let list = lib.skill.ymfanxing.listFilter(player);
				if (!list.length) return;
				const { index } = await player
					.chooseControlList(list, true)
					.set('ai', () => 0)
					.forResult();
				if (index != undefined) {
					if (list[index].startsWith('重')) {
						const { cards } = await player
							.chooseCard('重铸一组同花手牌', 2, 'h', (card) => {
								if (ui.selected.cards.length) {
									return get.suit(card) == get.suit(ui.selected.cards[0])
								}
								return player.countCards('h', (card2) => card != card2 && get.suit(card) == get.suit(card2))
							})
							.set('complexCard', true)
							.set('ai', () => true)
							.forResult();
						if (cards) {
							await player.recast(cards);
						}
					} else if (list[index].startsWith('〖')) {
						let cards = player.getCards('hej');
						await player.discard(cards);
						await player.draw(cards.length);
					} else if (list[index].startsWith('将')) {
						if (player.countCards('h') > player.maxHp) await player.chooseToDiscard(true);
						else if (player.countCards('h') < player.maxHp) await player.draw();
					}
				}
			},
			list: ['重铸一组同花手牌', '〖制衡〗区域内所有牌', '将手牌数向体力上限调整一'],
		},
		ymqinglv_info: '轻旅|结束阶段，你可以执行〖繁行〗中的一项，若获得牌数不大于你弃牌阶段的弃牌数，你可删去此项并摸两张牌。',
		ymqinglv: {
			audio: 1,
			trigger: {
				player: 'phaseJieshuBegin'
			},
			filter(event, player) {
				if (!player.hasSkill('ymfanxing')) return false;
				return lib.skill.ymfanxing.listFilter(player).length > 0;
			},
			async cost(event, trigger, player) {
				let list = lib.skill.ymfanxing.listFilter(player);
				if (!list.length) return;
				const { index } = await player
					.chooseControlList(list, true)
					.set('ai', () => 0)
					.forResult();
				if (index != undefined) event.result = {
					bool: true,
					cost_data: {
						index: index
					}
				}
			},
			async content(event, trigger, player) {
				let list = lib.skill.ymfanxing.listFilter(player)
				const control = list[event.cost_data.index];

				let num1 = 0;
				if (control.startsWith('重')) {
					const { cards } = await player
						.chooseCard('重铸一组同花手牌', 2, 'h', (card) => {
							if (ui.selected.cards.length) {
								return get.suit(card) == get.suit(ui.selected.cards[0])
							}
							return player.countCards('h', (card2) => card != card2 && get.suit(card) == get.suit(card2))
						})
						.set('complexCard', true)
						.set('ai', () => true)
						.forResult();
					if (cards) {
						await player.recast(cards);
						num1 = cards.length;
					}
				} else if (control.startsWith('〖')) {
					let cards = player.getCards('hej');
					num1 = cards.length;
					await player.discard(cards);
					await player.draw(cards.length);
				} else if (control.startsWith('将')) {
					if (player.countCards('h') > player.maxHp) await player.chooseToDiscard(true);
					else if (player.countCards('h') < player.maxHp) {
						await player.draw();
						num1 = 1;
					}
				}

				let num2 = 0;
				player.getHistory("lose", function (evt) {
					if (evt.type != "discard") return false;
					let evt2 = evt.getParent("phaseDiscard");
					if (evt2 && evt2.player == player) num2 += evt.cards2.length;
				});
				if (num1 < num2) {
					lib.skill.ymfanxing.list.remove(control)
					game.log(lib.skill.ymfanxing.list)
					player.draw(2)
				}
			},
		},
		ym_youyi: ['柚衣', ['female', "hyyz_ɸ", 4, ["ymzhumeng", "ymgongmian"], []], '柚衣', '我的形象就用我的头像吧~魔女之旅的伊蕾娜，也是我很喜欢很憧憬的角色。沾沾光~逐梦技能是追逐梦想的意思嘛。其实就是完善圆梦武将的设计，同时现实中也在小小的追梦嘛。技能效果就是一件事去反复做，精益求精。共励技能是共同勉励，一起加油的意思。就是群里的大家一起努力进步，互相吸取经验，争取更完善的设计。同时也是现实中希望大家都可以一起努力啦~实战方面我的思路是两个技能有一定的配合，2技能可以蹭蹭多过牌多用牌的武将，也是向有能力的人学习借鉴经验嘛~但是别人的东西终究是别人的，每回合只能一次。也是自我表现想进步，终究还是靠自己。不限次数和距离就是表示精益求精嘛~'],
		ymzhumeng: {
			audio: 2,
			lastcard(player) {
				var name = '';
				var history = player.getAllHistory('useCard', function (evt) {
					if (get.type(evt.card) == 'trick' || get.type(evt.card) == 'basic') return true;
				});
				if (history.length) name = history[history.length - 1].card.name;
				return name;
			},
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				var name = lib.skill.ymzhumeng.lastcard(player);
				if (!name) return false;
				return game.hasPlayer(current => player.canUse({ name: name }, current, false));
			},
			filterCard: true,
			position: "he",
			prompt() {
				var name = lib.skill.ymzhumeng.lastcard(_status.event.player);
				return '将一张牌当' + get.translation(name) + '使用';
			},
			viewAs(cards, player) {
				return {
					name: lib.skill.ymzhumeng.lastcard(player),
				};
			},
			ai: {
				order: 8,
				result: {
					player: 1
				}
			},
			mod: {
				cardUsable(card, player) {
					if (_status.event.skill) return Infinity;
				},
				targetInRange(card, player) {
					if (_status.event.skill) return true;
				}
			},
		},
		ymgongmian: {
			audio: 2,
			trigger: {
				global: "useCardAfter",
			},
			usable: 1,
			frequent: true,
			filter(event, player) {
				var history = event.player.getHistory('useCard', function (evt) {
					return evt != event && evt.card.name == event.card.name;
				});
				return history.length == 1 && event.cards.filterInD().length > 0;
			},
			content() {
				'step 0'
				player.chooseTarget(true, get.prompt('ymgongmian'), '将' + get.translation(trigger.cards) + '交给一名其他角色', function (card, player, target) {
					return target != _status.event.getTrigger().player;
				}).set('ai', function (target) {
					var player = _status.event.player, att = get.attitude(player, target);
					if (target.hasSkillTag('nogain')) att /= 9;
					return 4 + att;
				}).set('sha', trigger.cards[0].name == 'sha').set('wuxie', trigger.cards[0].name == 'wuxie');
				'step 1'
				if (result.bool) {
					result.targets[0].gain(trigger.cards.filterInD(), 'gain2').gaintag.add('ymgongmian');
				}
			},
			global: 'ymgongmian_buff',
			subSkill: {
				buff: {
					mod: {
						cardUsable(card) {
							if (!card.cards) return;
							for (var i of card.cards) {
								if (i.hasGaintag('ymgongmian')) return Infinity;
							}
						},
						targetInRange(card, player, target) {
							if (!card.cards) return;
							for (var i of card.cards) {
								if (i.hasGaintag('ymgongmian')) return true;
							}
						},
					}
				}
			}
		},
		ymzhumeng_info: "逐梦|出牌阶段限一次。你可以将一张牌当上次使用的基本牌或普通锦囊牌使用（无次数和距离限制）。",
		ymgongmian_info: "共勉|每回合限一次。当一名角色于回合内使用了两次同名的牌后，你可以将第二张同名牌交给除使用者外的一名角色（以此法交出的牌无次数和距离限制）。",

		ym_yanfeng: ['焰枫', ['male', "hyyz_ɸ", 4, ["ymbianma", "ymxianpo"], []], '魈', '介绍也没什么，不过是小说的自己，技能就关於我编码，无次数是因为修改规则，仙魄就是群内的人都叫我“魈上仙”，可叠加是因为我不可能只帮那三个，这三个效果是被我帮助人的馈赠。在此附一首诗句我非我，心外求，独立于世，难觅真我。寻寻觅觅，空落泪，我仍是我，未曾改变。梦中之我，真实之你，跨越时空，交相辉映。心若有光，何处不乐，我非我，但我是我。'],
		ymbianma: {
			mod: {
				cardUsable(card) {
					if (card) return Infinity;
				},
			},
		},
		ymxianpo: {
			init(player, skill) {
				player.storage.mengxiaopo = [0, 0, 0];
			},
			trigger: {
				player: 'phaseZhunbeiBegin'
			},
			frequent: true,
			content() {
				'step 0'
				var list = [
					'摸牌阶段多摸一张牌',
					'判定阶段多摸一张牌并弃置判定区内的牌',
					'手牌上限+1',
				];
				player.chooseControlList(true, list, '选择一项永久获得').set('ai', function () {
					if (_status.event.player.hp <= 2) return 2;
					if (!_status.event.player.storage.mengxiaopo[0]) return 1;
					return 0;
				});
				'step 1'
				player.storage.mengxiaopo[result.index]++;
				player.syncStorage('mengxiaopo');
				player.markSkill('mengxiaopo');
			},
			mark: true,
			intro: {
				content(storage, player) {
					var str = '';
					if (player.storage.mengxiaopo[0]) str += '<li>摸牌阶段多摸' + get.cnNumber(player.storage.mengxiaopo[0]) + '张牌';
					if (player.storage.mengxiaopo[1]) str += '<li>判定阶段摸' + get.cnNumber(player.storage.mengxiaopo[1]) + '张牌并弃置判定区内的牌';
					if (player.storage.mengxiaopo[2]) str += '<li>手牌上限+' + player.storage.mengxiaopo[2];
					return str;
				}
			},
			group: ['ymxianpo_buff_1', 'ymxianpo_buff_2', 'ymxianpo_buff_3'],
		},
		ymxianpo_buff: {
			subSkill: {
				1: {
					silent: true,
					popup: false,
					locked: true,
					forced: true,
					charlotte: true,
					trigger: {
						player: "phaseDrawBegin2",
					},
					preHidden: true,
					filter(event, player) {
						return !event.numFixed && player.storage.mengxiaopo[0];
					},
					content() {
						trigger.num += player.storage.mengxiaopo[0];
					},
					ai: {
						threaten: 1.5,
					},
				},
				2: {
					trigger: {
						player: "phaseJudgeBegin",
					},
					silent: true,
					popup: false,
					locked: true,
					forced: true,
					charlotte: true,
					filter(event, player) {
						return player.storage.mengxiaopo && player.storage.mengxiaopo[1];
					},
					content() {
						'step 0'
						player.draw(player.storage.mengxiaopo[1]);
						player.discard(player.getCards('j'));
					},
				},
				3: {
					mod: {
						maxHandcard(player, num) {
							if (player.storage.mengxiaopo[2]) return num + player.storage.mengxiaopo[2];
						},
					},
				},
			}
		},
		ymbianma_info: "编码|锁定技，你使用牌无次数限制。",
		ymxianpo_info: "仙魄|准备阶段你选择并获得一项：<br>1.摸牌阶段多摸一张牌。<br>2.判定阶段多摸一张牌并弃置判定区内的牌。<br>3.你的手牌上限+1。",

		ym_fushengyi: ['浮生亦', ['female', "hyyz_ɸ", 4, ["ymdaiduo", "ymcunzhi", ""], []], '浮生亦', ''],
		ymdaiduo: {
			init(player) {
				player.storage.ymdaiduo = 0;
			},
			forced: true,
			trigger: {
				player: 'phaseBegin'
			},
			filter(event, player) {
				return player.storage.ymdaiduo + 1 > 0;
			},
			content() {
				'step 0'
				player.storage.ymdaiduo++;
				'step 1'
				var list0 = ['phaseZhunbei', 'phaseJudge', 'phaseDraw', 'phaseUse', 'phaseDiscard', 'phaseJieshu'];
				var num = Math.min(list0.length, player.storage.ymdaiduo);
				var list1 = [];
				while (list1.length < num) {
					var name = list0.randomGet();
					list0.remove(name);
					list1.push(name);
				};
				for (var i of list1) {
					game.log(player, '跳过了下个', i);
					player.skip(i);
				};
				if (list0.length == 0) player.addTempSkill("ymdaiduo_end");
				'step 2'
			},
			subSkill: {
				end: {
					onremove(player) {
						player.logSkill('ymdaiduo');
						player.turnOver();
						player.storage.ymdaiduo = 0;
					},
				}
			}
		},
		ymcunzhi: {
			trigger: {
				player: ["phaseZhunbeiSkipped", "phaseZhunbeiCancelled", "phaseDrawSkipped", "phaseDrawCancelled", "phaseUseSkipped", "phaseUseCancelled", "phaseDiscardSkipped", "phaseDiscardCancelled", "phaseJieshuSkipped", "phaseJieshuCancelled"],
			},
			forced: true,
			content() {
				'step 0'
				'step 1'
				switch (trigger.currentPhase) {
					case 'phaseZhunbei': {
						if (game.hasPlayer(current => current.countCards('h') > 0)) player.chooseTarget(true, '令一名角色扣置所有手牌').set('ai', function (target) {
							return -get.attitude(player, target);
						});
						else event.finish();
						break;
					}
					case 'phaseDraw': {
						if (game.hasPlayer(current => current != player && current.countCards('h') > 0)) player.chooseTarget(true, '观看并获得其他角色花色最多的手牌').set('ai', function (target) {
							if (get.attitude(player, target) < 0) return target.countCards('h') > 0;
						});
						else event.finish();
						break;
					}
					case 'phaseUse': {
						player.loseHp();
						var num = player.storage.ymdaiduo;
						player.chooseTarget(true, [1, num], '对至多' + num + '名角色造成1点伤害').set('ai', function (target) {
							return get.damageEffect(target, player, player);
						});
						break;
					}
					case 'phaseDiscard': {
						if (player.countCards('h') > 0) player.chooseCardTarget({
							prompt: '请选择【存志】的牌和目标',
							prompt2: '将任意花色不同的手牌交给一名其他角色',
							filterCard(card) {
								for (var i of ui.selected.cards) {
									if (get.suit(i) == get.suit(card)) return false;
								}
								return true;
							},
							complexSelect: true,
							complexCard: true,
							selectCard: [1, 4],
							forced: true,
							filterTarget: lib.filter.notMe,
							ai1(card) {
								if (get.tag(card, 'recover') && !game.hasPlayer(function (current) {
									return get.attitude(current, player) > 0 && !current.hasSkillTag('nogain');
								})) return 0;
								return 1 / Math.max(0.1, get.value(card));
							},
							ai2(target) {
								var player = _status.event.player;
								var card = ui.selected.cards[0];
								var att = get.attitude(player, target);
								if (card.name == 'du') return -6 * att;
								if (att > 0) {
									if (get.position(card) == 'h' && target.getUseValue(card) > player.getUseValue(card)) return 4 * att;
									if (get.value(card, target) > get.value(card, player)) return 2 * att;
									return 1.2 * att;
								}
								return -att * Math.min(4, target.countCards('he')) / 4;
							},
						});
						else event.finish();
						break;
					}
					case 'phaseJieshu': {
						player.recover();
						var num = player.storage.ymdaiduo;;
						var cards = get.bottomCards(num);
						game.cardsGotoOrdering(cards);
						var next = player.chooseToMove();
						next.set('list', [
							['牌堆顶'],
							['牌堆底', cards],
						]);
						next.set('forced', true);
						next.set('prompt', '存志：点击将牌全部移动到牌堆顶');
						next.processAI = function (list) {
							var cards = list[1][1];
							return [cards, []];
						};
						next.set('filterOk', function (moved) {
							return moved[1] == [] || moved[1].length == 0;
						});
						break;
					}
				}
				'step 2'
				switch (trigger.currentPhase) {
					case 'phaseZhunbei': {
						var target = result.targets[0];
						target.addSkill('ymcunzhi2');
						break;
					}
					case 'phaseDraw': {
						var target = result.targets[0];
						player.viewHandcards(target);
						var map = {};
						for (var i of target.getCards('h')) {
							if (!map[get.suit(i)]) map[get.suit(i)] = 1;
							else map[get.suit(i)]++;
						};
						var max = 0, max_suit = [];
						for (i in map) {
							if (map[i] > max) {
								max = map[i];
								max_suit = [i];
							}
							if (map[i] == max) {
								max_suit.push(i);
							}
						}
						var cards = target.getCards('h').filter(function (card) {
							return max_suit.includes(get.suit(card));
						})
						target.give(cards, player, 'giveAuto');
						break;
					}
					case 'phaseUse': {
						var targets = result.targets;
						for (var i of targets) i.damage();
						break;
					}
					case 'phaseDiscard': {
						var target = result.targets[0], cards = result.cards;
						player.give(cards, target);
						break;
					}
					case 'phaseJieshu': {
						var top = result.moved[0];
						top.reverse();
						for (var i = 0; i < top.length; i++) {
							ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
						}
						player.popup(get.cnNumber(top.length) + '上');
						game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
						game.updateRoundNumber();
						game.delayx();
						break;
					}
				}
			},
		},
		ymcunzhi2: {
			init(player) {
				player.addToExpansion(player.getCards('h'), 'giveAuto', player).gaintag.add('ymcunzhi2');
			},
			trigger: {
				player: "phaseBegin",
			},
			forced: true,
			popup: false,
			charlotte: true,
			filter(event, player) {
				return player.getExpansions('ymcunzhi2').length > 0;
			},
			content() {
				'step 0'
				var cards = player.getExpansions('ymcunzhi2');
				player.gain(cards, 'draw');
				game.log(player, '收回了' + get.cnNumber(cards.length) + '张“存志”牌');
				'step 1'
				player.removeSkill('ymcunzhi2');
			},
			intro: {
				markcount: "expansion",
				mark(dialog, storage, player) {
					var cards = player.getExpansions('ymcunzhi2');
					if (player.isUnderControl(true)) dialog.addAuto(cards);
					else return '共有' + get.cnNumber(cards.length) + '张牌';
				},
			},
		},
		ymdaiduo_info: "怠惰|锁定技。回合开始时，你随机跳过X+1个阶段（X为此技能发动的次数）。若你因此跳过所有阶段，回合结束后你翻面井清空此技能发动的次数。",
		ymcunzhi2: "存志",
		ymcunzhi_info: "存志|锁定技，当你跳过一个阶段后：<br>1.准备阶段，令一名角色将手牌置于武将牌上直到其回合开始。<br>2.摸牌阶段，观看并获得一名其他角色数量最多的花色的手牌。<br>3.出牌阶段，失去1点体力并对至多X名角色造成1点伤害。<br>4.弃牌阶段，将花色不同的任意手牌交给一名其他角色。<br>5.结束阶段，回复1点体力，观看并将牌堆底的X张牌以任意顺序置于牌堆顶。<br>",

		ym_lalalala: ['啦啦啦啦', ['male', "hyyz_ɸ", 4, ["ymanli"], []], '啦啦啦啦', '啦啦啦啦，新人。十分想要朋友的啦啦啦啦在学校到处安利游戏，只要他玩了这个游戏，啦啦啦啦就会开心，感觉自己帮到了忙，有成就感。反之，啦啦啦啦就会陷入脑补和精神内耗中。如果啦啦啦啦成功让整个班都玩上了自己安利的游戏，他就会反复回味这个过程使自己开心，如果啦啦啦啦在达到使命前就被外界的压力击倒，他就会走向极端，认为世上所有都不喜欢自己。'],
		ymanli: {
			audio: 10,
			logAudio: () => [
				"ext:忽悠宇宙/asset/ym/audio/ymanli1.mp3",
				"ext:忽悠宇宙/asset/ym/audio/ymanli2.mp3",
				"ext:忽悠宇宙/asset/ym/audio/ymanli3.mp3",
			],
			trigger: {
				global: 'phaseUseBegin'
			},
			filter(event, player) {
				return event.player != player && player.countCards('he') > 0;
			},
			dutySkill: true,
			async cost(event, trigger, player) {
				event.result = await player.chooseCardTarget({
					prompt: '安利',
					prompt2: '是否将一张牌交给其他角色',
					position: 'he',
					filterCard: true,
					filterTarget: lib.filter.notMe,
					ai1(card) {
						return 7 - get.value(card);
					},
					ai2(target) {
						return get.attitude(_status.event.player, target) >= -2;
					}
				}).forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				let target = event.targets[0];
				player.addSkill('ymyouxi');
				player.give(event.cards, target).gaintag.add('ymyouxi');
				if (!player.getStorage('ymyouxi').includes(target)) player.storage.ymyouxi.push(target);
			},
			group: ['ymanli_achieve', 'ymanli_fail'],
			subSkill: {
				achieve: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/ym/audio/ymanli4.mp3",
					],
					trigger: {
						player: 'ymanliAfter'
					},
					forced: true,
					skillAnimation: true,
					animationColor: 'fire',
					filter(event, player) {
						return !game.hasPlayer(function (current) {
							return player.storage.ymyouxi && !player.storage.ymyouxi.includes(current) && current != player;
						})
					},
					async content(event, trigger, player) {
						game.log(player, '成功完成使命');
						await player.awakenSkill('ymanli');
						await player.gainMaxHp();
						await player.recover();
						await player.addSkills('ymyongle');
					},
				},
				fail: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/ym/audio/ymanli5.mp3",
					],
					trigger: {
						player: 'dying'
					},
					forced: true,
					async content(event, trigger, player) {
						game.log(player, '使命失败');
						player.awakenSkill('ymanli');
						player.maxHp = 2;
						player.hp = 2;
						await player.update();
						await player.addSkills('ymguli');
					},
				},
			},
			derivation: ['ymyongle', 'ymguli'],
		},
		ymyouxi: {
			init(player) {
				player.storage.ymyouxi = [];
			},
			mark: true,
			marktext: '安',
			intro: {
				content(storage, player) {
					var str = '已安利的角色：';
					for (var i of storage) {
						if (i.name) str += get.translation(i.name);
						if (i != storage[storage.length - 1]) str += '、';
					}
					return str;
				}
			},
			trigger: {
				global: ['useCard', 'loseAfter', 'loseAsyncAfter'],
			},
			silent: true,
			charlotte: true,
			filter(event, player) {
				if (!player.storage.ymyouxi.includes(event.player)) return false;
				if (event.name != 'useCard') {
					if (event.type != 'discard') return false;
					var evt = event.getl(event.player);
					if (!evt || !evt.cards2 || !evt.cards2.length) return false;
					if (event.name == 'lose') {
						for (var i in event.gaintag_map) {
							if (event.gaintag_map[i].includes('ymyouxi')) return true;
						}
						return false;
					}
				}
				return event.player.hasHistory('lose', function (evt) {
					if (evt.getParent() != event) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('ymyouxi')) return true;
					}
					return false;
				});
			},
			content() {
				if (trigger.name == 'useCard') {
					game.hyyzSkillAudio('ym', 'ymanli', 6, 7)
					var num = player.maxHp - player.countCards('h');
					if (num > 0) player.chooseDrawRecover(num);
					else player.recover();
				} else {
					game.hyyzSkillAudio('ym', 'ymanli', 8, 9)
					player.loseHp();
				}
			},
		},
		ymyongle: {
			audio: 2,
			trigger: {
				player: 'phaseAfter',
			},
			frequent: true,
			content() {
				player.drawTo(player.maxHp);
				player.recover();
			}
		},
		ymguli: {
			audio: 2,
			trigger: {
				player: 'phaseAfter',
			},
			forced: true,
			content() {
				'step 0'
				player.chooseTarget('孤立：请选择一名角色，与其一同失去1点体力', true, function (card, player, target) {
					return target != player;
				}).ai = function (target) {
					return -get.attitude(_status.event.player, target);
				};
				'step 1'
				player.line(result.targets[0], 'fire');
				player.loseHp();
				result.targets[0].loseHp();
			}
		},
		ymanli_info: "安利|使命技，其他角色的出牌阶段开始时，你可以将一张手牌交给一名其他角色并标记为“游戏”。该角色使用“游戏”时你选择一项：<br>1.将手牌摸至体力上限。<br>2.回复1点体力。该角色弃置“游戏”时你失去1点体力。<br><span class=greentext>成功</span>：若你对所有其他角色发动过此技，你加1点体力上限并回复一点体力，然后获得〖永乐〗。<br><span class=firetext>失败</span>：当你进入濒死状态时，将体力上限和体力值调整至2，并获得〖孤立〗。",
		ymyouxi: "游戏",
		ymyongle_info: "永乐|回合结束后，你将手牌摸至体力上限并回复1点体力。",
		ymguli_info: "孤立|锁定技，回合结束后，你与一名其他角色各失去1点体力。",

		ym_rijiu: ['日玖阳气冲三关', ['male', "hyyz_ɸ", 3, ["ymxuanxiang", "ymxiaoxing", "ymhuanying"], []], '日玖阳气冲三关', '形象就斗胆借用一下爱缇的吧，至于为什么想借用她?因为我认为我和她很像，在平凡的现实中撕开一道口子，创造一个只属于自己的幻想的世界。这个武将设计是玩法驱动，记得在很久之前，up曾经对我说过“这个机制值得更优秀”。但是随着时间，它已经被我慢慢忘记了。直到我翻看以前的武将，这才想起，因此，我最终决定用这个“值得更优秀”的机制来写这个武将。'],
		ymxuanxiang: {
			mark: true,
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					var content = player.getExpansions('ymxuanxiang');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							dialog.addText('游戏外的牌');
							dialog.addAuto(content);
						}
						else {
							return '共有' + get.cnNumber(content.length) + '张牌移出游戏';
						}
					} else return '没有牌移出游戏';
				},
				content(content, player) {
					var content = player.getExpansions('ymxuanxiang');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							return get.translation(content);
						}
						return '共有' + get.cnNumber(content.length) + '张牌移出游戏';
					} else return '没有牌移出游戏';
				},
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			trigger: {
				global: 'phaseBegin'
			},
			filter(event, player) {
				return true;
			},
			check(event, player) {
				return get.attitude(player, event.player) > 0 && player.hp > 2;
			},
			content() {
				'step 0'
				player.loseHp();
				let says = [
					'#ext:忽悠宇宙/asset/ym/audio/ymxuanxiang1',
					'#ext:忽悠宇宙/asset/ym/audio/ymxuanxiang2'
				];
				player.say(lib.translate[says.randomGet()]);
				'step 1'
				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					var card = { name: name };
					if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
					else if (get.type(name) == 'basic') list.push(['基本', '', name]);
				}
				var next = player.chooseButton([
					'绚想：请选择至多' + player.hp + '个牌名令其视为使用之',
					[list, 'vcard'],
				]);
				next.set('forced', true);
				next.set('selectButton', [1, player.hp]);
				next.set('filterButton', function (button) {
					var name = button.link[2];
					for (var i of player.getExpansions('ymxuanxiang')) {
						if (i.name == name) return false;
					}
					return game.hasPlayer(function (current) {
						return _status.event.targetx.canUse({ name: name }, current, true);
					});
				});
				next.set('ai', function (button) {
					var val = _status.event.targetx.getUseValue({ name: button.link[2] });
					return val;
				});
				next.set('targetx', trigger.player);
				'step 2'
				for (var i of result.links) {
					var name = i[2];
					trigger.player.chooseUseTarget(true, { name: name });
					var card = get.cardPile(function (card) {
						return card.name == name;
					});
					if (card) {
						player.addToExpansion([card], player, 'gain2').gaintag.add('ymxuanxiang');
					}
				};
			}
		},
		ymhuanying: {
			trigger: {
				global: 'useCard'
			},
			filter(event, player) {
				if (!player.getExpansions('ymxuanxiang').length) return false;
				for (var i of player.getExpansions('ymxuanxiang')) {
					if (i.name == event.card.name) return true;
				}
				return false;
			},
			frequent: true,
			content() {
				'step 0'
				let says = [
					'#ext:忽悠宇宙/asset/ym/audio/ymhuanying1',
					'#ext:忽悠宇宙/asset/ym/audio/ymhuanying2'
				];
				player.say(lib.translate[says.randomGet()]);
				trigger.directHit.add(player);
				'step 1'
				for (var i of player.getExpansions('ymxuanxiang')) {
					if (i.name == trigger.card.name) {
						var list = [i];
						game.log(player, '将', list, '加入牌堆');
						while (list.length) ui.cardPile.insertBefore(list.shift().fix(), ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length)]);
						game.updateRoundNumber();
						game.delayx();
					}
				}
			}
		},
		ymxiaoxing: {
			trigger: {
				global: ["loseAfter", "addToExpansionAfter", "cardsGotoSpecialAfter", "loseAsyncAfter"],
			},
			filter(event, player, name) {
				if (event.name == 'lose' || event.name == 'loseAsync') return event.getlx !== false && event.toStorage == true;
				if (event.name == 'cardsGotoSpecial') return !event.notrigger;
				return true;
			},
			frequent: true,
			content() {
				let says = [
					'#ext:忽悠宇宙/asset/ym/audio/ymxiaoxing1',
					'#ext:忽悠宇宙/asset/ym/audio/ymxiaoxing2'
				];
				player.say(lib.translate[says.randomGet()]);
				player.draw();
			},
			group: ["ymxiaoxing_1"],
			subSkill: {
				"1": {
					trigger: {
						global: ["loseAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter(event, player) {
						return game.hasPlayer(function (current) {
							var evt = event.getl(current);
							return evt && (evt.xs.length > 0 || evt.ss.length > 0);
						});
					},
					async cost(event, trigger, player) {
						var list = ['失去1点体力获得之'];
						if (player.isDamaged()) list.push('回复1点体力');
						const { control } = await player.chooseControl(list, 'cancel2')
							.set('ai', function () {
								if (!player.isDamaged() && player.countCards('h') > 1) return '失去1点体力获得之';
								return '回复1点体力';
							}).forResult();
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
						let says = [
							'#ext:忽悠宇宙/asset/ym/audio/ymxiaoxing1',
							'#ext:忽悠宇宙/asset/ym/audio/ymxiaoxing2'
						];
						player.say(lib.translate[says.randomGet()]);
						if (control == '失去1点体力获得之') {
							await player.loseHp();
							if (get.position(trigger.cards[0]) == 'o') await player.gain(trigger.cards, 'gain2');
							else if (get.owner(trigger.cards[0])?.isIn()) {
								await player.gain(trigger.cards, get.owner(trigger.cards[0]), 'give');
							}
						} else if (control == '回复1点体力') {
							await player.recover();
						}
					},
				},
			},
		},
		ymxuanxiang_info: "绚想|每回合开始时，你可以失去1点体力，令当前回合角色视为使用至多X张未移出游戏的即时牌，然后随机将牌堆中同名的一张牌移出游戏。（X为你的体力值）",
		ymhuanying_info: "还因|当一张牌被使用时，若游戏外有同名的牌，你不能响应此牌，然后将游戏外的同名牌插入牌堆。",
		ymxiaoxing_info: "晓心|当有牌移出游戏时，你摸一张牌。当有牌加入游戏时，你可以失去1点体力获得之，或回复1点体力。",

		ym_xilin: ['西琳', ['male', "hyyz_ɸ", 3, ["ymbailan", "ymle", "ymdiaotu"], []], '西琳', '西琳感觉没啥好说的吧，就是太摆了，有想法也摆，有时候还没事来群刷个乐的表情，有时掏出一下吊图来。'],
		ymbailan: {
			trigger: {
				player: 'phaseUseEnd'
			},
			forced: true,
			filter(event, player) {
				return player.getHistory('useCard').length < player.maxHp
			},
			content() {
				player.skip('phaseDiscard');
			},
			mod: {
				targetEnabled(card, player, target, now) {
					if (player.countCards('h') > player.maxHp) {
						if (card.name == 'shunshou' || card.name == 'guohe') return false;
					}
				},
			}
		},
		ymle: {
			audio: 1,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('hes') > 0;
			},
			position: "hes",
			discard: false,
			lose: false,
			delay: false,
			filterCard: true,
			selectTarget: 1,
			filterTarget(card, player, target) {
				return !target.hasJudge('lebu') && player.canUse({ name: 'lebu' }, target);;
			},
			check(card) {
				return 9 - get.value(card);
			},
			content() {
				"step 0"
				player.useCard({ name: 'lebu' }, cards, targets);
				"step 1"
				if (player.countCards('he')) {
					player.chooseCardTarget({
						prompt: '是否反转一名角色某花色的延时类判定结果？',
						prompt2: '弃置一张牌，并选择一名判定区内有【乐不思蜀】的其他角色',
						filterCard: lib.filter.cardDiscardable,
						position: 'he',
						filterTarget(card, player, target) {
							return target.hasJudge('lebu');
						},
						ai1(card) {
							return 7 - get.value(card);
						},
						ai2(target) {
							return -get.attitude(_status.event.player, target);
						}
					});
				}
				else {
					event.finish();
				}
				"step 2"
				if (result.bool) {
					player.discard(result.cards);
					var target = result.targets[0];
					var next = player.chooseButton([
						'乐：选择花色后，若原先判定失败则将视为判定成功，反之',
						[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
					]);
					next.set('forced', true);
					next.set('selectButton', [1, 1]);
					next.set('filterButton', function (button) {
						return true
					});
					next.set('ai', function (button) {
						if (button.link[2].slice(6) == 'heart') {
							return 1;
						};
					});
					event.target = target;
				} else event.finish();
				"step 3"
				if (result.bool) {
					var suit = result.links[0][2].slice(6);
					event.target.addSkill('ymle_buff');
					event.target.storage.ymle_buff = suit;
				}
			},
			ai: {
				order: 1,
				result: {
					target: -1,
				}
			}
		},
		ymle_buff: {
			mark: true,
			marktext: '乐',
			intro: {
				name: '乐',
				content: '你进行延时类锦囊牌的判定时，反转$花色的判定结果'
			},
			mod: {
				judge(player, result) {
					if (!player.storage.ymle_buff || !_status.event.cardname || !_status.event.node) return;
					if (!_status.event.judgestr) return;
					if (typeof _status.event.node != 'object') return;
					if (get.type(_status.event.cardname) == 'delay' && get.suit(_status.event.node) == player.storage.ymle_buff) {
						game.log('#g乐！', '判定结果反转！')
						if (result.bool == false) {
							result.bool = true;
						} else {
							result.bool = false;
						}
					}
				},
			},
		},
		ymdiaotu: {
			audio: 1,
			trigger: {
				player: 'phaseEnd'
			},
			filter(event, player) {
				return player.countCards('h') && player.getHistory('useCard').length < player.maxHp;
			},
			direct: true,
			content() {
				'step 0'
				player.chooseToDiscard('he', '弃置一张牌，视为使用【万箭齐发】或【桃园结义】').set('ai', function (card) {
					var num1 = 0, num2 = 0;
					num1 = player.getFriends().length;
					num2 = player.getEnemies().length;
					if (num1 != num2) return 7 - get.value(card);
				});
				'step 1'
				if (result.bool) {
					player.logSkill('ymdiaotu');
					player.chooseControl('万箭齐发', '桃园结义');
				} else event.finish();
				'step 2'
				player.chooseUseTarget({ name: (result.control == '万箭齐发' ? 'wanjian' : 'taoyuan') }, true);
			}
		},
		ymbailan_info: "摆烂|锁定技。出牌阶段结束时，若你本回合使用的牌小于体力上限，你跳过下个弃牌阶段。若你的手牌数量大于体力上限，你不能成为【过河拆桥】和【顺手牵羊】的目标。",
		ymle_info: "乐|出牌阶段限一次，你可以将一张牌当【乐不思蜀】使用，然后可以弃置一张牌并选择一名判定区有【乐不思蜀】的其他角色。若如此做，你声明一种花色，该角色进行延时类锦囊牌的判定时，此花色的判定结果反转。",
		ymdiaotu_info: "吊图|结束阶段，你可以弃置一张牌视为使用【万箭齐发】或【桃园结义】。",

		ym_zhongshiweiyu: ['终世微雨', ['male', "hyyz_ɸ", 3, ["ymxudu", "ymfenxin"], []], '微雨', ''],
		ymxudu: {
			forced: true,
			trigger: {
				global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter", "equipAfter"],
			},
			filter(event, player) {
				return lib.skill.ymxudu.count() > player.maxHp;
			},
			usable: 1,
			count() {
				var num = 0;
				game.countPlayer2(function (current) {
					current.getHistory('lose', function (evt) {
						if (evt.position == ui.discardPile) {
							for (var i = 0; i < evt.cards.length; i++) {
								if (evt.cards[i]) num++;
							}
						}
					})
				});
				game.getGlobalHistory('cardMove', function (evt) {
					if (evt.name == 'cardsDiscard') {
						for (var i = 0; i < evt.cards.length; i++) {
							if (evt.cards[i]) num++;
						}
					}
				})
				return num;
			},
			content() {
				'step 0'
				player.gainMaxHp();
				'step 1'
				player.addTempSkill('ymxudu_hand');
			},
			subSkill: {
				hand: {
					forced: true,
					charlotte: true,
					group: "undist",
					mark: true,
					marktext: '虚',
					mod: {
						"cardEnabled2"(card) {
							if (get.position(card) == 'h') return false;
						},
					},
					intro: {
						content: "不能使用或打出手牌，不计入距离和座次的计算",
					},
				}
			}
		},
		ymfenxin: {
			init(player) {
				player.storage.ymfenxin = [];
			},
			trigger: {
				global: 'useCard'
			},
			filter(event, player) {
				if (player.storage.ymfenxin.includes(get.type2(event.card))) return false;
				return get.itemtype(event.cards) == 'cards' && get.position(event.cards[0], true) == 'o';
			},
			prompt: '奋心：减1点体力上限获得此牌？',
			check(event, player) {
				return player.isDamaged();
			},
			content() {
				'step 0'
				player.loseMaxHp();
				player.storage.ymfenxin.push(get.type2(trigger.card));
				player.gain(trigger.cards, 'gain2');
				'step 1'
				if (trigger.player == player) {
					if (player.getStat().card[trigger.card.name]) player.getStat().card[trigger.card.name]--;
				}
			},
			group: ['ymfenxin_gain', 'ymfenxin_clear'],
			subSkill: {
				gain: {
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					filter(event, player) {
						if (event.name == 'gain' && event.player != player) return false;
						var types = [], types2 = [];
						player.hasHistory('gain', evt => {
							if (!evt.cards || !evt.cards.length) return false;
							for (var i of evt.cards) {
								if (!types.includes(get.type2(i))) {
									types.push(get.type2(i))
								}
							}
						});
						if (types.length < 3) return false;
						player.hasHistory('lose', evt => {
							if (!evt.cards2 || !evt.cards2.length) return false;
							for (var i of evt.cards2) {
								if (!types2.includes(get.type2(i))) {
									types2.push(get.type2(i))
								}
							}
						});
						if (types2.length < 3) return false;
						return true;
					},
					content() {
						game.log('#g【奋心】', '已刷新！');
						player.storage.ymfenxin = [];
					},
				},
				clear: {
					trigger: {
						global: "phaseEnd"
					},
					silent: true,
					popup: false,
					locked: true,
					forced: true,
					charlotte: true,
					content() {
						player.storage.ymfenxin = [];
					}
				}
			}
		},
		ymxudu_info: "虚度|锁定技，本回合进入弃牌堆的牌数首次超过你的体力上限后，你加一点体力上限，本回合你不能使用牌且不计入座次和距离的计算。",
		ymfenxin_info: "奋心|①每回合每种类型的牌限一次。当一张牌被使用时， 你可以减1点体力上限并获得此牌；若使用者为你，此牌不计入次数限制。②若你本回合获得且失去所有类别的牌，此技能视为未发动。",

		ym_daowuji: ['道无吉', ['male', "hyyz_ɸ", 8, ["ymfenji", "ymduofa", "ymdaogui"], []], '埋埋埋埋喵', ''],
		ymfenji: {
			unique: true,
			init(player) {
				if (!player.storage.ymfenji) {//人格
					player.storage.ymfenji = {
						owned: {},//所有人格牌，每个属性都是数组
						current: {}//当前使用的角色及技能，也是数组
					};
				}
			},
			intro: {
				mark(dialog, content, player) {
					var list = Object.keys(content.owned);//当前数组
					if (list.length > 0) {
						var characters = Object.keys(player.storage.ymfenji.current);
						if (characters.length > 0) {
							for (var character in player.storage.ymfenji.current) {
								var skills = player.storage.ymfenji.current[character];//获取对应的技能组
								dialog.addSmall([[character], 'character']);
								for (var skill of skills) {
									dialog.add(
										'<div><div class="skill">【' +
										get.translation(lib.translate[skill + '_ab'] || get.translation(skill).slice(0, 2)) +
										'】</div>' + '<div>' + get.skillInfoTranslation(skill, player) +
										'</div></div>'
									);
								}
							}
						} else {
							return '没有人格显现';
						}
						if (player.isUnderControl(true)) {
							dialog.addSmall([list, 'character']);
						}
						else {
							dialog.addText('共有' + get.cnNumber(list.length) + '张“人格”');
						}
					}
					else {
						return '没有人格';
					}
				},
				onunmark(storage, player) {
					_status.characterlist.addArray(Object.keys(storage.owned));//放回包里
					storage.owned = [];
				},
			},
			addRenge(player, num) {
				if (!player.storage.ymfenji) return;//如果没有空
				if (!_status.characterlist) {
					lib.skill.pingjian.initList();//借用评荐的初始化
				}
				_status.characterlist.randomSort();//打乱顺序
				for (var i = 0; i < _status.characterlist.length; i++) {//所有池（名）中
					let name = _status.characterlist[i];//获取一个
					if (!name || !lib.character[name] || !lib.character[name][3]) return;
					if (name.indexOf('mengdaowuji') != -1 || name.indexOf('key_') == 0 || name.indexOf('sp_key_') == 0 ||//基础名隔离
						lib.skill.ymfenji.banned.includes(name) ||//默认ban位
						player.storage.ymfenji.owned[name]) continue;//目前在用的
					let skills = lib.character[name][3].filter(skill => {//该对象所有组
						const categories = get.skillCategoriesOf(skill);//获取标签
						if (categories.some(type => lib.skill.ymfenji.bannedType.includes(type))) return false;//不含ban类型
						var info = get.translation(skill).concat(get.translation(skill + '_info'));
						for (var ix = 0; ix < info.length; ix++) {
							if (/仁|义|礼|智|信|暴|妒|狂|怒|疑/.test(info[ix]) == true) return true;
						}
					})
					if (skills.length) {//得到检索结果
						player.storage.ymfenji.owned[name] = skills;//存入一个人物及其组
						_status.characterlist.remove(name);//移去检索的结果
						return name;
					}
				}
			},
			addRenges(player, num) {//多次循环addRenge
				var list = [];
				for (var i = 0; i < num; i++) {
					var name = lib.skill.ymfenji.addRenge(player);
					if (name) list.push(name);
				}
				if (list.length) {
					player.syncStorage('ymfenji');
					player.markSkill('ymfenji');
					game.log(player, '获得了', get.cnNumber(list.length) + '张', '#g人格');
				}
			},
			banned: ["lisu", "sp_xiahoudun", "xushao", "jsrg_xushao", "zhoutai", "old_zhoutai", "shixie", "xin_zhoutai", "dc_shixie", "old_shixie", "zuoci"],
			bannedType: ["Charlotte",],// "主公技", "觉醒技", "限定技", "隐匿技", "使命技"
			trigger: {
				global: 'roundStart'
			},
			filter(event, player) {
				return true//!get.is.empty(player.storage.ymfenji.owned);
			},
			check(event, player) {
				return player.maxHp > 5 || player.getDamagedHp() >= 2;
			},
			prompt: '分极：是否减少体力上限增加等量人格？',
			content() {
				'step 0'
				var map = {};
				var list = [];
				for (var i = 1; i <= player.maxHp; i++) {
					var cn = get.cnNumber(i, true);
					map[cn] = i;
					list.push(cn);
				}
				event.map = map;
				player.chooseControl(list, function () {
					return get.cnNumber(_status.event.goon, true);
				}).set('prompt', '失去任意点体力').set('goon', player.maxHp - 2);
				'step 1'
				var num = event.map[result.control] || 1;
				player.loseMaxHp(num);
				lib.skill.ymfenji.addRenges(player, num);
			},
			group: 'ymfenji_1',
			subSkill: {
				1: {
					trigger: {
						player: ["phaseBegin"],
					},
					filter(event, player) {
						var owned = Object.keys(player.storage.ymfenji.owned).length;
						var now = Object.keys(player.storage.ymfenji.current).length;
						return owned - now > 0;
						return owned >= 2 && owned - now >= 2;
					},
					prompt() {
						var player = _status.event.player;
						var owned = Object.keys(player.storage.ymfenji.owned).length;
						var now = Object.keys(player.storage.ymfenji.current).length;
						return '分极：是否切换人格？（剩余人格' + (owned - now) + '/' + owned + '）';
					},
					check(event, player) {
						var owned = Object.keys(player.storage.ymfenji.owned).length;
						var now = Object.keys(player.storage.ymfenji.current).length;
						if (now > 2) return false;
						if (owned - now < 2) return false;
					},
					content() {
						'step 0'
						var characters = Object.keys(player.storage.ymfenji.owned);
						var now = Object.keys(player.storage.ymfenji.current);
						var dialog = ui.create.dialog('<h3>【分极】</h3>', 'hidden');
						var num = Math.min(characters.length - now.length, 2);
						dialog.addText('<font align="center";font size=3px>选择' + num + '张武将牌，视为拥有该武将的特定技能</font>');
						dialog.add([characters, 'character']);
						var next = player.chooseButton(dialog);
						next.set('ai', function (button) {
							return get.rank(button.link, true) - lib.character[button.link][2];
						});
						next.set('selectButton', num);
						next.set('forced', true);
						next.set('filterButton', function (button) {
							if (player.storage.ymfenji.current) {
								if (player.storage.ymfenji.current[button.link] != undefined) return false;
							}
							return true;
						});
						'step 1'
						var map = result.links;
						if (map) player.say('道爷，我成了！！');
						var old = Object.keys(player.storage.ymfenji.current);
						if (old.length) {
							for (let i in player.storage.ymfenji.current) {
								for (let j of player.storage.ymfenji.current[i]) {
									player.removeSkill(j);
									game.log(player, '失去了', '<font color=#FF4500>【' + get.translation(j) + '】</font>');
								}
								delete player.storage.ymfenji.current[i];
							}
						}
						for (let i in map) {
							if (player.storage.ymfenji.owned[map[i]]) {
								var character = map[i];
								var skills = player.storage.ymfenji.owned[character];
								player.storage.ymfenji.current[character] = skills;
								for (let skill of skills) {
									player.addTempSkill(skill, { player: 'dieAfter' });
									game.log(player, '获得了', '#g【' + get.translation(skill) + '】');
								}
								player.syncStorage('ymfenji');
								player.updateMarks('ymfenji');
							}
						}
					}
				}
			}
		},
		ymduofa: {
			trigger: {
				player: 'damageBegin4'
			},
			filter(event, player) {
				return event.num >= player.hp;
			},
			prompt2(event, player) {
				var str = '减1点体力上限';
				var owned = Object.keys(player.storage.ymfenji.owned).length;
				var now = Object.keys(player.storage.ymfenji.current).length;
				if (owned - now > 0) {
					str += '，或弃置一张人格牌';
				}
				str += '，然后防止此伤害，并回复' + event.num + '点体力';
				return str;
			},
			content() {
				'step 0'
				if (Object.keys(player.storage.ymfenji.owned).length - Object.keys(player.storage.ymfenji.current).length > 0) {
					var characters = Object.keys(player.storage.ymfenji.owned);
					var dialog = ui.create.dialog('<h3>躲罚</h3>', 'hidden');
					dialog.addText('<font align="center";font size=3px>弃置一张人格牌，或点取消减1点体力上限</font>');
					dialog.add([characters, 'character']);
					var next = player.chooseButton();
					next.set('ai', function (button) {
						return get.rank(button.link, true) - lib.character[button.link][2];
					});
					next.set('dialog', dialog);
					next.set('selectButton', [1, 1]);
					next.set('filterButton', function (button) {
						if (player.storage.ymfenji.current) {
							if (player.storage.ymfenji.current[button.link]) return false;
						}
						return true;
					});
					event.dialog = dialog;
				} else {
					event._result = { bool: false };
				}
				'step 1'
				if (event.dialog) event.dialog.close();
				if (result.bool) {
					var map = result.links;
					for (let i in map) {
						if (player.storage.ymfenji.owned[map[i]]) {
							_status.characterlist.push(player.storage.ymfenji.owned[map[i]]);
							delete player.storage.ymfenji.owned[map[i]];
							game.log(player, '失去了一个人格');
							player.syncStorage('ymfenji');
							player.updateMarks('ymfenji');
						}
					}
				} else {
					player.loseMaxHp();
				}
				player.say('万物皆有法，道爷我算不得？！');
				var num = trigger.num;
				trigger.cancel();
				player.recover(num);
			},
		},
		ymdaogui: {
			trigger: {
				global: "judgeBefore",
			},
			filter(event, player) {
				return !player.hasSkill('ymkuitian');
			},
			prompt: '道诡：是否猜测判定结果？',
			content() {
				'step 0'
				player.addTempSkill('ymkuitian', { global: 'judgeAfter' });
				'step 1'
				var next = player.chooseButton([
					'猜测' + get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定的花色',
					[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
				]);
				next.set('forced', true);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					return true;
				});
				next.set('ai', function (button) {
					if (get.itemtype(_status.pileTop) != 'card') return 1;
					else return button.link[2].slice(6) == get.suit(_status.pileTop);
				});
				'step 2'
				player.storage.ymkuitian[0] = result.links[0][2].slice(6);
				var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((i) => get.strNumber(i));
				player.chooseControl(list, true).set('ai', function () {
					return get.rand(0, 12);
				}).set('prompt', '猜测' + get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定的点数');
				'step 3'
				player.storage.ymkuitian[1] = result.index + 1;
				game.log(player, '进行窥天：', '#g' + get.translation(player.storage.ymkuitian[0]), '#g' + player.storage.ymkuitian[1])
			},
			derivation: 'ymkuitian',
		},
		ymkuitian: {
			init(player, skill) {
				player.storage.ymkuitian = [];
			},
			onremove(player, skill) {
				delete player.storage.ymkuitian;
			},
			locked: true,
			charlotte: true,
			mark: true,
			marktext: '窥',
			intro: {
				name: "窥天",
				content(storage, player) {
					if (storage != []) {
						if (storage.length == 1) return '窥天：' + get.translation(storage[0]);
						return '窥天：' + get.translation(storage[0]) + storage[1];
					}
					return '未进行“窥天”';
				}
			},
			trigger: {
				global: "judgeFixing",
			},
			forced: true,
			filter(event, player) {
				return event.result;
			},
			content() {
				'step 0'
				if (!player.storage.ymkuitian || player.storage.ymkuitian.length != 2) {
					event.finish();
				}
				'step 1'
				if (trigger.result.suit && player.storage.ymkuitian[0] &&
					trigger.result.suit == player.storage.ymkuitian[0]) {
					event.kuitian = true;
				}
				if (trigger.result.number && player.storage.ymkuitian[1] &&
					trigger.result.number == player.storage.ymkuitian[1]) {
					event.kuitian = true;
				}
				'step 2'
				if (!event.kuitian) {
					player.say('哼！道爷自有手段躲这该死的天劫！');
					event.finish();//失败
				}
				else {
					player.say('天机别人碰得，我就碰不得？');
					player.chooseTarget('道诡：令一名角色加减体力上限', true).set('ai', (target) => target == player);
				}
				'step 3'
				event.target = result.targets[0];
				player.chooseControl('加1点体力上限', '减1点体力上限').set('prompt', '令' + get.translation(event.target)).set('ai', () => '加1点体力上限');
				'step 4'
				event.control = result.control;
				var goon = false;
				if (trigger.result.judge < 0.5) {
					goon = true;
				} else if (trigger.result.judge <= 0 && get.attitude(trigger.player, player) >= 2) {
					goon = Math.random() > 0.5 ? true : false;
				}
				trigger.player.chooseBool('是否改为终止判定？', get.translation(player) + '即将令' + get.translation(event.target) + event.control).set('ai', () => goon);
				'step 5'
				if (result.bool) {
					game.log('#g【道诡】', trigger.player, '终止了判定');
					var evt = trigger.getParent();
					if (evt.name == 'phaseJudge') evt.excluded = true;
					else {
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
					}
				} else {
					game.log('#g【道诡】', trigger.player, '没有干涉', player, '的选择');
					event.target[event.control == '加1点体力上限' ? 'gainMaxHp' : 'loseMaxHp']();
				}
				'step 6'
				lib.skill.ymfenji.addRenges(player, 1);
				var characters = Object.keys(player.storage.ymfenji.owned);
				var dialog = ui.create.dialog('<h3>【道诡】</h3>', 'hidden');
				dialog.addText('<font align="center";font size=3px>展示一张人格牌</font>');
				dialog.add([characters, 'character']);
				var next = player.chooseButton(dialog);
				next.set('ai', function (button) {
					return get.rank(button.link, true) - lib.character[button.link][2];
				});
				next.set('selectButton', 1);
				next.set('forced', false);
				next.set('filterButton', function (button) {
					if (player.storage.ymfenji.current) {
						if (player.storage.ymfenji.current[button.link] != undefined) return false;
					}
					return true;
				});
				'step 7'
				if (result.bool) {
					var map = result.links;
					for (let i in map) {
						if (player.storage.ymfenji.owned[map[i]]) {
							var character = map[i];
							var skills = player.storage.ymfenji.owned[character];
							player.storage.ymfenji.current[character] = skills;
							for (let skill of skills) {
								player.addTempSkill(skill, { player: 'dieAfter' });
								game.log(player, '获得了', '#g【' + get.translation(skill) + '】');
							}
							player.syncStorage('ymfenji');
							player.updateMarks('ymfenji');
						}
					}
				}
				'step 8'
				player.removeSkill('ymkuitian');
			},
		},
		ymfenji_info: "分极|①每轮开始时，你可以减少任意体力上限并获得等量“人格”牌。<br>②回合开始时，你可以重新展示两张“人格”牌（剩余人格牌不足则全展示），然后视为拥有其中含“仁义礼智信暴妒狂怒疑”的技能（人格牌：技能中含“仁义礼智信暴妒狂怒疑”的武将牌）。",
		ymduofa_info: "躲罚|锁定技，你受到致命伤害时，可以减1点体力上限或弃置一张未展示的人格牌，防止此伤害并回复等量体力。",
		ymdaogui_info: "道诡|窥天技，你可以令一名角色加/减1点体力上限；判定者可以将此操作改为终止判定。结算后，你获得并展示一张人格牌。",
		ymkuitian_info: "窥天技|一名角色判定前，若你未「窥天」，你猜测判定结果的花色和点数。判定结果确定后，若至少猜对一项，则「窥天」成功并触发「窥天」技。",

		ym_sp_daowuji: ['道无吉', ['male', 'hyyz_ɸ', 4, ['ymgualun', 'ymbolu', 'ymxiuyao'], []], '埋埋埋埋喵', ''],
		ymgualun: {
			audio: "shejian",
			mark: true,
			marktext: "卦",
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			init(player) {
				player.storage.ymgualun = [];
			},
			trigger: {
				global: "useCardToPlayered"
			},
			filter(event, player) {
				if (event.ymgualun) return false;
				if (get.type(event.card) == 'equip') return false;
				return event.player != player && player.canCompare(event.player) && player.countCards('he') && !event.ymgualun;
			},
			direct: true,
			async content(event, trigger, player) {
				const { result: { cards: give } } = await player.chooseCard(1, "he", "卦论：是否交给" + get.translation(trigger.player) + "一张牌并与之拼点？",);
				if (give) {
					player.logSkill('ymgualun', trigger.player);
					trigger.ymgualun = true;
					player.give(give, trigger.player);
					if (player.canCompare(trigger.player)) {
						const result = await player.chooseToCompare(trigger.player).forResult()
						if (result) {
							if (result.player) {
								if (player.getExpansions('ymgualun').some(
									card => get.suit(card) == get.suit(result.player)
								)) await player.gain(result.player, 'gain2');
								else {
									game.log(player, '将', result.player, '置于武将牌旁');
									player.addToExpansion(result.player, player, 'gain2').gaintag.add('ymgualun');
								}
							}
							if (result.target) await trigger.player.gain(result.target, 'gain2');
							if (result.winner) await result.winner.draw();
							if (result.bool) {
								if (player.storage.ymbolu) player.markAuto('ymbolu', [trigger.card.name]);
							}
						}
					}
				}
			},
			group: ["ymgualun_gaipan"],
			subSkill: {
				gaipan: {
					audio: "kuangcai",
					trigger: {
						global: "judge",
					},
					direct: true,
					filter(event, player) {
						return player.getExpansions('ymgualun').length && event.player.isIn();
					},
					async content(event, trigger, player) {
						const { result: { bool, links } } = await player.chooseButton([
							get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' + get.translation(trigger.player.judging[0]) + '，是否用卦论牌发动鬼才？', player.getExpansions('ymgualun'), 'hidden',
						]).set('filterButton', button => {
							const player = get.event('player'), card = button.link;
							const mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
							if (mod2 != 'unchanged') return mod2;
							const mod = game.checkMod(card, player, 'unchanged', 'cardRespondable', player);
							if (mod != 'unchanged') return mod;
							return true;
						}).set('ai', button => {
							const card = button.link, trigger = get.event().getTrigger();
							const player = get.event('player'), judging = get.event('judging');
							const result = trigger.judge(card) - trigger.judge(judging) + 0.00001;
							const attitude = get.attitude(player, trigger.player);
							return result * attitude;
						}).set('judging', trigger.player.judging[0]);
						if (bool) {
							event.forceDie = true;
							await player.respond(links, 'ymgualun', 'highlight', 'noOrdering');
							if (trigger.player.judging[0].clone) {
								trigger.player.judging[0].clone.classList.remove('thrownhighlight');
								game.broadcast(card => {
									if (card.clone) card.clone.classList.remove('thrownhighlight');
								}, trigger.player.judging[0]);
								game.addVideo('deletenode', player, get.cardsInfo([trigger.player.judging[0].clone]));
							}
							await game.cardsDiscard(trigger.player.judging[0]);
							trigger.player.judging[0] = links[0];
							trigger.orderingCards.addArray(links);
							game.log(trigger.player, '的判定牌改为', links[0]);
							await game.asyncDelay(2);
							//await player.draw();
						}
					},
					ai: {
						combo: "ymgualun",
						rejudge: true,
						tag: {
							rejudge: 0.6,
						},
					},
				},
			},
		},
		ymbolu: {
			audio: "kuangcai",
			mark: true,
			marktext: "箓",
			onremove: true,
			intro: {
				name: "博箓",
				mark(dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						dialog.add([player.getStorage('ymbolu'), 'vcard']);
					}
				},
				content: "已记录牌名：$",
			},
			init(player) {
				player.storage.ymbolu = ['shan'];
			},
			hiddenCard(player, name) {
				if (player.storage.ymbolu.includes(name) && player.countCards('hes')) return true;
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				if (event.ymbolu) return false;
				if (_status.currentPhase == player && !player.countCards('hes')) return false;
				return player.getStorage('ymbolu').some(name => event.filterCard(get.autoViewAs({ name }, "unsure"), player, event) &&
					(get.type2(name) == "basic" || get.type2(name) == "trick"));
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (let name of player.getStorage('ymbolu')) {
						if (!event.filterCard(get.autoViewAs({ name }, 'unsure'), player, event)) continue;
						let type = get.type2(name);
						if (name == 'sha') {
							list.push([type, '', 'sha']);
							for (var nature of lib.inpile_nature) {
								if (event.filterCard(get.autoViewAs({ name, nature }, 'unsure'), player, event)) list.push([type, '', 'sha', nature]);
							}
						}
						else if (type == "basic" || type == "trick") list.push([type, "", name]);
					}
					return ui.create.dialog('博箓', [list, 'vcard']);
				},
				backup(links, player) {
					return {
						audio: "kuangcai",
						filterCard: (card) => _status.currentPhase == _status.event.player,
						position: "hes",
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						selectCard: (card, player) => _status.currentPhase == _status.event.player ? 1 : -1,
						viewAs: { name: links[0][2], nature: links[0][3] },
						precontent() {
							'step 0'
							player.judge('博箓', function (card) {
								if (lib.translate[card.name].length == lib.translate[event.result.card.name].length) return 2;
								return -2;
							}).set('judge2', result => result.bool).set('ymxiuyao', event.result.card.name);
							'step 1'
							if (result.bool) {
								var cards = event.result.cards;
								event.result.card = {
									name: event.result.card.name,
									nature: event.result.card.nature,
									isCard: true,
								};
								event.result.cards = cards;
								delete event.result.skill;
							} else {
								var evt = event.getParent();
								evt.set("ymbolu", true);
								evt.goto(0);
								return;
							}
						},
					};
				},
				prompt(links, player) {
					if (_status.currentPhase == player) return `将一张牌当${(get.translation(links[0][3]) || '') + get.translation(links[0][2])}使用`;
					else '视为使用或打出一张' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
				},
			},
			ai: {
				freeAttack: true,
				respondSha: true,
				respondShan: true,
				save: true,
				skillTagFilter(player) {
					return player.getStorage('ymbolu').length && player.countCards('hes');
				},
				order: 1,
				result: {
					player(player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
		},
		ymxiuyao: {
			trigger: {
				player: "judgeEnd",
			},
			filter(event, player) {
				return event.getParent().name == 'pre_ymbolu_backup' && event.judge(event.result.card) < 0 && event.ymxiuyao != undefined;
			},
			forced: true,
			async content(event, trigger, player) {
				let name = trigger.ymxiuyao;
				const { result: { bool } } = await player.chooseBool('是否移除' + get.translation(name) + '并摸一张牌？').set('ai', () => false);
				if (bool) {
					player.storage.ymbolu.remove(name);
					player.draw();
				}
				if (!player.getExpansions('ymgualun').length || get.position(trigger.result.card, true) != "o") return;
				const { result: { links } } = await player.chooseButton(['替换一张牌', player.getExpansions('ymgualun')], true);
				if (links) {
					player.loseToDiscardpile(links);
					game.log(player, '将', trigger.result.card, '置于武将牌旁');
					player.addToExpansion(trigger.result.card, player, 'gain2').gaintag.add('ymgualun');
				}
			},
			group: "ymxiuyao_add",
			subSkill: {
				add: {
					trigger: {
						player: "compare",
						target: "compare",
					},
					filter(event, player) {
						if (!player.getExpansions('ymgualun').length) return false;
						if (event.player == player) return !event.iwhile;
						return true;
					},
					forced: true,
					locked: false,
					content() {
						let num = player.getExpansions('ymgualun').length;
						if (player == trigger.player) {
							trigger.num1 += num;
							if (trigger.num1 > 13) trigger.num1 = 13;
						} else {
							trigger.num2 += updateRoundNumber;
							if (trigger.num2 > 13) trigger.num2 = 13;
						}
						game.log(player, "的拼点牌点数+", num);
					},
					sub: true,
					"_priority": 0,
				},
			}
		},
		ymgualun_info: "卦论|其他角色使用牌指定目标后，你可以交给其一张牌并与其进行拼点牌回收且赢者摸一张牌的拼点。若你赢，则你将此牌名加入“博箓”；你收回武将牌上没有该花色的拼点牌置于武将上且你可以用这些牌发动【鬼才】。",
		ymbolu_info: "博箓|锁定技，当你需要使用或打出【闪】时，你可以进行一次判定，若判定结果与你需要使用牌的牌名字数相同，你视为使用之，若于你回合内则改为将一张牌当作此牌使用或打出。",
		ymxiuyao_info: "修爻|锁定技，你的拼点牌点数+X，X为【卦论】的牌数。〖博箓〗判定失败后，你可以摸一张牌并移除此牌名；然后将判定牌与【卦论】的一张牌交换。",

		ym_lengruohan: ['冷若寒', ['male', "hyyz_ɸ", 4, ["ymguxing", "ymqisi"], []], '冷若寒', ''],
		ymguxing: {
			trigger: {
				global: 'phaseBegin'
			},
			filter(event, player) {
				return player.countCards('h') > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCardTarget({
					prompt: '孤行',
					prompt2: '将一张手牌当调虎离山使用',
					position: 'h',
					filterCard: true,
					filterTarget(card, player, target) {
						return lib.filter.targetEnabled2({ name: 'diaohulishan', isCard: true }, _status.event.getTrigger().player, target) && target != _status.currentPhase;
					},
					selectTarget: [1, 2],
					ai1(card) {
						return 8 - get.value(card);
					},
					ai2(target) {
						return get.attitude(_status.event.player, target) > 0;
					}
				}).forResult()
			},
			async content(event, trigger, player) {
				await player.useCard({ name: 'diaohulishan', isCard: true }, event.cards, event.targets);
				_status.currentPhase.draw(event.targets.length);
			},
			ai: {
				order: 10,
				effect: {
					target(card, player, target, result) {
						if (card.name) return [0, 10]
						if (card.name == 'diaohulishan') [0, 10]
					}
				}
			}
		},
		ymqisi: {
			unique: true,
			init(player, skill) {
				player.storage[skill] = false;
			},
			mark: true,
			intro: {
				content: "limited",
			},
			skillAnimation: "epic",
			animationColor: "thunder",
			enable: "phaseUse",
			limited: true,
			useCards(player) {
				var num = 0;
				player.getAllHistory('useCard', function (evt) {
					var cardx = evt.card;
					if (get.type(cardx) == 'trick' || get.type(cardx) == 'basic') num++;
				});
				return num;
			},
			filter(event, player) {
				return !player.storage.ymqisi && lib.skill.ymqisi.useCards(player) > 0;
			},
			ranTargets(card, player) {
				var targets = game.filterPlayer(function (current) {
					return lib.filter.targetEnabled2(card, player, current)
				});
				if (!targets.length) return [];
				var num = Math.floor(Math.random() * targets.length) + 1;
				if (!lib.skill.xunshi.isXunshi(card)) num = 1;
				return targets.randomGets(num);
			},
			ranCard() {
				var cards = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					if (name == 'wuxie' || name == 'shan') continue;
					if (get.type(name) == 'trick' || get.type(name) == 'basic') cards.push(name);
				}
				if (!cards.length) return;
				return cards.randomGet();
			},
			content() {
				"step 0"
				player.awakenSkill('ymqisi');
				player.storage.ymqisi = true;
				"step 1"
				event.count = lib.skill.ymqisi.useCards(player);
				"step 2"
				game.log("#g剩余【绮思】次数：", "#y" + event.count);
				event.count--;
				var card = { name: lib.skill.ymqisi.ranCard() };
				game.log("#g随机牌名：", "#y" + get.translation(card.name));
				var targets = lib.skill.ymqisi.ranTargets(card, player);
				game.log("#g随机目标数：", "#y" + targets.length);
				if (targets.length) {
					player.useCard(card, targets);
				}
				if (event.count > 0) event.redo();
			},
			ai: {
				order: 10,
				result: {
					player(player, target) {
						if (lib.skill.ymqisi.useCards(player) >= 20 || player.hp < 2) return 20;
					}
				}
			}
		},
		ymguxing_info: "孤行|每回合开始时，你可以将一张手牌当【调虎离山】对非当前回合角色使用，然后令当前回合角色摸与目标数等量的牌。",
		ymqisi_info: "绮思|限定技，出牌阶段，你可以视为使用X张无距离限制的即时牌，若此牌为<span class='bluetext'>多</span>/<span class='legendtext'>单</span>目标牌，则目标数为随机<span class='bluetext'>多个</span>/<span class='legendtext'>单个</span>（X为本局游戏你使用即时牌的次数）。",

		ym_xinzhi: ['心之所向_星之所向', ['female', 'hyyz_ɸ', 4, ['ymjingjin'], []], '心之所向_星之所向', ''],
		ymjingjin: {
			init(player) {
				if (!player.storage.ymjingjin) player.storage.ymjingjin = [4, 2, 3, 1];
			},
			getInfo: (player) => {
				if (!player.storage.ymjingjin) player.storage.ymjingjin = [4, 2, 3, 1];
				return player.storage.ymjingjin;
			},
			onremove: true,
			forced: true,
			trigger: {
				player: 'damageEnd',
				source: 'damageSource',
			},
			filter(event, player) {
				return true;
			},
			async content(event, trigger, player) {
				const info = lib.skill.ymjingjin.getInfo(player);
				//0
				const cards = get.cards(info[0]);
				game.cardsGotoOrdering(cards);
				var next = player.chooseToMove();
				next.set("list", [["牌堆顶", cards]]);
				next.set("prompt", "精进：重排牌堆顶的牌");
				next.processAI = function (list) {
					var cards = list[0][1],
						player = _status.event.player;
					var target = _status.event.getTrigger().name == "phaseZhunbei" ? player : player.next;
					var att = get.sgn(get.attitude(player, target));
					var top = [];
					var judges = target.getCards("j");
					if (player != target || !target.hasWuxie()) {
						for (var i = 0; i < judges.length; i++) {
							var judge = get.judge(judges[i]);
							cards.sort(function (a, b) {
								return (judge(b) - judge(a)) * att;
							});
							if (judge(cards[0]) * att < 0) {
								top.push(cards.shift());
							} else {
								top.unshift(cards.shift());
							}
						}
					}
					if (cards.length > 0) {
						top.addArray(cards);
					}
					return [top];
				};
				const result = await next.forResult().forResult()
				if (result.bool) {
					let top = result.moved[0];
					top.reverse();
					for (var i = 0; i < top.length; i++) {
						ui.cardPile.insertBefore(top[i], ui.cardPile.firstChild);
					}
					player.popup(get.cnNumber(top.length) + "上");
					game.log(player, "将" + get.cnNumber(top.length) + "张牌置于牌堆顶");
					game.updateRoundNumber();
					game.delayx();
				};
				//1
				player.discardPlayerCard(trigger.player, info[1], true);
				//2
				trigger.player.draw(info[2]);
				//3
				if (trigger.source) {
					if (trigger.source.countCards('h') > info[3]) {
						let num = trigger.source.countCards('h') - info[3];
						trigger.source.chooseToDiscard(true, `弃置${num}张牌`, num);
					} else if (trigger.source.countCards('h') < info[3]) {
						trigger.source.drawTo(info[3]);
					}
				};

				let target;
				if (!trigger.source) target = player;
				else {
					if (player.countCards('h') > trigger.source.countCards('h')) target = trigger.source;
					if (player.countCards('h') < trigger.source.countCards('h')) target = player;
				};
				if (target && target.isIn()) {
					let list = [1, 2, 3, 4];
					const { control: a } = await target.chooseControl(list)
						.set('prompt', '〖精进〗：观看牌堆顶几张牌？')
						.set('prompt2', '锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶4张牌并以任意顺序放回，然后你弃置受伤角色2张牌、令其摸3张牌并令伤害来源将手牌数调整至1。')
						.set('ai', () => {
							if (!_status.event.player.hasSkill('ymjingjin')) {
								return 4;
							} else {
								return 1;
							}
						}).forResult()
					list.remove(a);
					player.storage.ymjingjin[0] = a;

					const { control: b } = await target.chooseControl(list)
						.set('prompt', '〖精进〗：弃置受伤角色几张牌？')
						.set('prompt2', '锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶4张牌并以任意顺序放回，然后你弃置受伤角色2张牌、令其摸3张牌并令伤害来源将手牌数调整至1。').set('ai', () => {
							if (!_status.event.player.hasSkill('ymjingjin')) {
								return 3;
							} else {
								return 4;
							}
						}).forResult()
					list.remove(b);
					player.storage.ymjingjin[1] = b;

					const { control: c } = await target.chooseControl(list)
						.set('prompt', '〖精进〗：受伤角色摸几张牌？')
						.set('prompt2', '锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶4张牌并以任意顺序放回，然后你弃置受伤角色2张牌、令其摸3张牌并令伤害来源将手牌数调整至1。').set('ai', () => {
							if (!_status.event.player.hasSkill('ymjingjin')) {
								return 4;
							} else {
								return 3;
							}
						}).forResult()
					list.remove(c);
					player.storage.ymjingjin[2] = c;

					const { control: d } = await target.chooseControl(list)
						.set('prompt', '〖精进〗：伤害来源将手牌数调整至？')
						.set('prompt2', '锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶4张牌并以任意顺序放回，然后你弃置受伤角色2张牌、令其摸3张牌并令伤害来源将手牌数调整至1。').set('ai', () => 2).forResult()
					list.remove(d);
					player.storage.ymjingjin[3] = d;
				}
			},
			mark: true,
			intro: {
				content(storage, player) {
					var info = lib.skill.ymjingjin.getInfo(player);
					return `
										<span class=thundertext>观看牌堆顶：${info[0]}</span><br>
										<span class=firetext>弃置受伤角色：${info[1]}</span><br>
										<span class=greentext>受伤角色摸：${info[2]}</span><br>
										<span class=yellowtext>伤害来源手牌至：${info[3]}</span>
										`;
				},
			},
			ai: {
				threaten: 8.8,
			},
		},
		ymjingjin_info: "精进|锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶4张牌并以任意顺序放回，然后你弃置受伤角色2张牌、令其摸3张牌并令伤害来源将手牌数调整至1。历战：你与该角色中手牌数较小者交换〖精进〗中的任意个阿拉伯数字。",

		ym_mushancai: ['木善才', ['male', 'hyyz_ɸ', 4, ['ymjiejian', 'ymyingbian'], []], '木善才', ''],
		ymjiejian: {
			enable: 'phaseUse',
			filter(event, player) {
				return game.hasPlayer(current => {
					return player.canCompare(current);
				})
			},
			filterTarget(card, player, target) {
				return player.canCompare(target);
			},
			async content(event, trigger, player) {
				const target = event.targets[0];
				const result = await player.chooseToCompare(target).forResult()
				if (result.bool) {
					if (player.hasDisabledSlot() || target.hasDisabledSlot()) {
						const result2 = await player.chooseControl('摸一张牌', '恢复装备栏').set('prompt', '借鉴：令你们').set('ai', () => Math.random() > 0.3 ? '恢复装备栏' : '摸一张牌').forResult();
						if (result2.control == '摸一张牌') {
							await game.asyncDraw([player, target]);
						} else {
							if (player.hasDisabledSlot()) await player.chooseToEnable().set("ai", function () {
								var player = _status.event.player;
								var list = [2, 5, 1, 3, 4];
								for (var i of list) {
									if (player.hasDisabledSlot(i)) return "equip" + i;
								}
							});
							if (target.hasDisabledSlot()) await target.chooseToEnable().set("ai", function () {
								var player = _status.event.player;
								var list = [2, 5, 1, 3, 4];
								for (var i of list) {
									if (player.hasDisabledSlot(i)) return "equip" + i;
								}
							});
						}
					} else {
						await game.asyncDraw([player, target]);
					}
					const num = Math.floor((lib.translate[result.player.name].length + lib.translate[result.target.name].length) / 2);
					game.log(lib.translate[result.player.name].length, '+', lib.translate[result.target.name].length, '均值为', num);
					let list = [];
					for (let i of lib.inpile) {
						let type = get.type(i);
						if (type == "basic" || type == "trick") list.push([type, "", i]);
						if (i == "sha") {
							for (let j of lib.inpile_nature) list.push([type, "", i, j]);
						}
					}
					if (list.length) {
						const result3 = await player.chooseButton(["视为使用一张字数为<span class='firetext'>" + num + "</span>的基本牌或普通锦囊牌？", [list, "vcard"]])
							.set("num", num)
							.set("filterButton", function (button) {
								if (lib.translate[button.link[2]].length != _status.event.num) return false;
								return player.hasUseTarget({
									name: button.link[2],
									nature: button.link[3],
									isCard: true,
								});
							})
							.set("ai", function (button) {
								return player.getUseValue({
									name: button.link[2],
									nature: button.link[3],
									isCard: true,
								});
							})
							.forResult()
						if (result3.bool) {
							await player.chooseUseTarget(true, {
								name: result3.links[0][2],
								nature: result3.links[0][3],
								isCard: true,
							});
						}
					}
					if (player.getStat().skill.ymjiejian >= num) {
						player.awakenSkill(event.name);
						player.when({
							global: 'phaseAfter'
						}).then(() => {
							player.restoreSkill('ymjiejian');
						})
					};
				}
			},
			ai: {
				order: 10,
				result: {
					player: 2,
					target: -1,
				}
			}
		},
		ymyingbian: {
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
			trigger: {
				player: ["chooseToCompareBefore", "compareMultipleBefore"],
				target: ["chooseToCompareBefore", "compareMultipleBefore"],
			},
			filter(event, player) {
				if (event.preserve) return false;
				if (player.countCards('h')) return false;
				let cardPile = Array.from(ui.cardPile.childNodes);
				if (!cardPile.some(card => get.type(card) == 'equip' && get.subtype(card) != undefined && player.hasEnabledSlot(get.subtype(card)))) return false;
				return event.player == player || event.target == player;
			},
			async cost(event, trigger, player) {
				let list = [];
				for (var i = 1; i <= 5; i++) {
					let cardPile = Array.from(ui.cardPile.childNodes);
					if (player.hasEnabledSlot('equip' + i) && cardPile.some(card => get.subtype(card) == 'equip' + i)) list.add('equip' + i);
				}
				if (!list.length) return;
				list.sort();
				let { result: { control } } = await player.chooseControl(list, 'cancel2').set('prompt', '是否废除一个装备栏并用牌堆对应的牌进行拼点？');
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
				await player.disableEquip(control);
				let list2 = [];
				for (let i of ui.cardPile.childNodes) if (get.subtype(i) == control) list2.push(i);
				if (!list2.length) return;
				let { result: { links } } = await player.chooseButton(['选择要拼点的牌', list2], 1, true);
				if (links) {
					if (!trigger.fixedResult) trigger.fixedResult = {};
					trigger.fixedResult[player.playerid] = game.cardsGotoOrdering(links).cards[0];
				}
			},
			ai: {
				canCompareSource: true,
				canCompareTarget: true,
			}
		},
		ymjiejian_info: "借鉴|出牌阶段，你可与一名其他角色进行拼点，若你赢，则你与其各摸一张牌或各恢复一个装备栏，然后你可视为使用一张牌名字数为X的基本牌或普通锦囊牌。X为本次拼点牌牌名之和的一半（向下取整）。若你本回合发动此技的次数达到X，此技能本回合失效。",
		ymyingbian_info: "应变|当你没有手牌且需要拼点时，你可以废除一个装备栏并使用牌堆中一张对应副类别装备牌进行拼点。",

		ym_zhouwang: ['纣王', ["female", "hyyz_ɸ", '3/6', ["ymhumeng", "ymqiuyu"], []], '纣王', '穷兵黩武、重刑厚敛、拒谏饰非，是与夏桀并称“桀纣”的典型暴君'],
		ymhumeng: {
			audio: 7,
			init(player) {
				if (!player.storage.ymhumeng) player.storage.ymhumeng = new Map([
					['live', undefined],
					['die', undefined],
					['ear', undefined],
					['eye', undefined],
					['mouth', undefined],
					['nose', undefined]
				]);
			},
			mark: true,
			intro: {
				mark(dialog, storage, player) {
					dialog.content.style['overflow-x'] = 'visible'
					let core = document.createElement('div');
					core.style.width = '0';
					const centerX = -48, centerY = 80, radius = 75,
						radian = Math.PI * 2 / 6;
					for (let i = 0; i < 6; i++) {
						let td = document.createElement('div');
						let text = document.createElement('div')
						let key = ['live', 'die', 'ear', 'eye', 'mouth', 'nose'][i];
						td.appendChild(player.getStorage('ymhumeng').get(key));
						text.innerHTML = `${'生死耳目口鼻'[i]}`
						td.style.position = 'absolute';
						td.style.transform = `rotate(${60 * i}deg)`
						td.style.scale = '0.5'
						text.style.position = 'absolute';
						core.appendChild(td);
						core.appendChild(text)
						td.style.left = (centerX + radius * Math.sin(radian * i)) + 'px';
						td.style.top = (centerY - radius * Math.cos(radian * i)) + 'px';
						text.style.left = (35 * Math.sin(radian * i)) + 'px';
						text.style.top = (125 - 35 * Math.cos(radian * i)) + 'px';
					}
					dialog.content.appendChild(core);
				}
			},
			forced: true,
			map: {
				live: '生',
				die: '死',
				ear: '耳',
				eye: '目',
				mouth: '口',
				nose: '鼻',
			},
			group: ['ymhumeng_start', 'ymhumeng_use', 'ymhumeng_buff'],
			subSkill: {
				start: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng1.mp3'],
					trigger: {
						global: 'phaseBefore',
						player: 'enterGame',
					},
					filter(event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0)
					},
					forced: true,
					async content(event, trigger, player) {
						for (let [key, value] of player.storage.ymhumeng) {
							let card = get.cards()[0]
							player.storage.ymhumeng.set(key, card);
						};
					},
				},
				use: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng1.mp3'],
					usable: 1,
					enable: ["chooseToUse", "chooseToRespond"],
					chooseButton: {
						dialog(event, player) {
							let list = [];
							for (let [key, card] of player.getStorage('ymhumeng')) {
								if (get.type(card) == 'basic' || get.type(card) == 'trick') {
									list.add([lib.skill.ymhumeng.map[key], '', card.name])
								}
							}
							return ui.create.dialog('狐梦', [list, 'vcard']);
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
						filter(button, player) {
							return _status.event.getParent().filterCard({
								name: button.link[2]
							}, player, _status.event.getParent());
						},
						backup(links, player) {
							return {
								audio: "ymhumeng",
								filterCard: () => false,
								selectCard: -1,
								viewAs: {
									name: links[0][2],
									nature: links[0][3]
								},
								precontent() {
									player.logSkill('ymhumeng')
								}
							}
						},
						prompt(links, player) {
							return '视为使用一张' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]);
						}
					},
					hiddenCard(player, name) {
						let list = [];
						for (let [name, card] of player.getStorage('ymhumeng')) {
							list.add(card.name);
						}
						if (!list.length) return false;
						return list.includes(name);
					},
					ai: {
						respondSha: true,
						respondShan: true,
						order: 7,
						save: true,
						order: 1,
						result: {
							player(player) {
								if (_status.event.dying) return get.attitude(player, _status.event.dying);
								return 1;
							},
						},
						skillTagFilter(player) {
							return !player.getStat().skill.ymhumeng_use
						}
					}
				},
				buff: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng1.mp3'],
					trigger: {
						player: 'phaseBegin'
					},
					async cost(event, trigger, player) {
						let list = [], strs = ''
						for (let [key, card] of player.getStorage('ymhumeng')) {
							strs += `「${lib.skill.ymhumeng.map[key]}」`;
							list.add(card);
						}
						const { links } = await player
							.chooseButton(['狐梦:选择一张牌与牌堆顶的一张牌交换', '', strs, list])
							.set('ai', function (button) {
								if (!_status.event.player.isDamaged()) return false;
								if (get.type(button.link) == 'equip' || get.type(button.link) == 'delay') return 20;
								if (button.link.name == 'tao' || button.link.name == 'jiu' || button.link.name == 'wuxie') return 0
								return get.buttonValue(button);
							})
							.forResult();
						if (links) event.result = {
							bool: true,
							cost_data: {
								links: links
							}
						}
					},
					async content(event, trigger, player) {
						await player.loseMaxHp()
						const top = get.cards()[0], cardx = event.cost_data.links[0];
						for (let [key, card] of player.getStorage('ymhumeng')) {
							if (card == cardx) {
								player.getStorage('ymhumeng').set(key, top);
								game.cardsGotoPile(card, 'insert');
								game.log(player, '将', card, '置于了牌堆顶');
								player.addTempSkill('ymhumeng_' + key, { player: 'phaseBefore' })
								break;
							}
						}
					},
				},

				live: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng2.mp3'],
					trigger: {
						player: 'phaseZhunbeiBegin'
					},
					forced: true,
					async content(event, trigger, player) {
						await player.recover()
						var types = ['trick', 'basic', 'equip']
						var cards = []
						var str = ''
						types.forEach(type => {
							var card = get.cardPile(function (card) {
								return get.type2(card) == type
							})
							card ? cards.push(card) : str += get.translation(type)
						});
						if (cards) player.gain(cards, 'gain2', 'log');
					}
				},

				die: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng3.mp3'],
					trigger: {
						player: 'phaseUseBegin'
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseTarget(lib.filter.notMe, true, '选择角色本回合非锁定技失效，对其使用牌无距离和次数限制，其不能使用或打出手牌且装备牌失效')
							.set('ai', function (target) {
								var player = _status.event.player;
								return get.damageEffect(target, player, player)
							}).forResult();
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						let target = event.targets[0];
						target.addTempSkill('fengyin')
						target.addTempSkill('ymhumeng_unequip')
						player.addTempSkill('ymhumeng_use2')
						target.addTempSkill('ymhumeng_nouse')
						target.markSkillCharacter('ymhumeng_nouse', player, '死', '无法使用或打出任何手牌')
					}
				},
				unequip: {
					firstDo: true,
					ai: { unequip2: true },
					init(player, skill) {
						if (!player.storage[skill]) player.storage[skill] = [];
					},
					onremove: true,
					trigger: {
						player: ['damage', 'damageCancelled', 'damageZero'],
						source: ['damage', 'damageCancelled', 'damageZero'],
						target: ['shaMiss', 'useCardToExcluded', 'useCardToEnd', 'eventNeutralized'],
						global: ['useCardEnd'],
					},
					charlotte: true,
					filter(event, player) {
						return event.card && (event.name != 'damage' || event.notLink());
					},
					silent: true,
					forced: true,
					popup: false,
					priority: 12,
					content() {
					},
					marktext: '※',
					intro: { content: '当前防具技能已失效' },
				},
				use2: {
					mod: {
						targetInRange(card, player, target) {
							if (target.hasSkill('ymhumeng_nouse')) {
								return true;
							}
						},
						cardUsableTarget(card, player, target) {
							if (target.hasSkill('ymhumeng_nouse')) return true;
						},
					},
					charlotte: true,
				},
				nouse: {
					mod: {
						cardEnabled2(card, player) {
							if (get.position(card) == 'h') return false;
						},
					},
					ai: {
						effect: {
							target(card, player, target) {
								if (get.tag(card, 'damage')) return [0, -999999];
							},
						},
					},
					charlotte: true,
				},

				ear: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng4.mp3'],
					init(player) {
						player.changeHujia(player.hp)
					},
					trigger: {
						global: 'phaseBegin'
					},
					filter(event, player) {
						return event.player != player && player.hujia > 0
					},
					content() {
						player.changeHujia(-1)
						if (trigger.player.countCards('he')) {
							player.gainPlayerCard(trigger.player, 'he')
						}
						player.useCard({ name: 'sha', nature: 'stab' }, trigger.player, false)
					}
				},

				eye: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng5.mp3'],
					enable: 'phaseUse',
					usable: 3,
					check(card) {
						return 2.5;
					},
					filterTarget: () => true,
					selectTarget: 2,
					multitarget: true,
					multiline: true,
					async content(event, trigger, player) {
						const target1 = event.targets[0], target2 = event.targets[1];
						const num = target1.hp - target2.hp;
						await target1.changeHp(num);
						if (target1.hp <= 0) await target1.dying({ source: player });

						await target2.changeHp(-num)
						if (target2.hp <= 0) await target2.dying({ source: player });
						player
							.when({ player: 'phaseEnd' })
							.vars({ num: num })
							.then(() => {
								player.draw(num);
							})
					},

				},

				mouth: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng6.mp3'],
					trigger: {
						player: 'phaseDrawBefore'
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseTarget([1, 6], function (card, player, target) {
								return target.countCards('h') && player != target
							}, '是否改为与至多六名角色拼点？')
							.set('ai', function (target) {
								var att = get.attitude(_status.event.player, target);
								if (att > 0) return att + 1;
								if (att == 0) return Math.random();
								return att;
							})
							.forResult();
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						trigger.cancel();
						player.when({
							player: "compare",
						}).filter((event, player) => {
							return event.getParent().name == "ymhumeng_mouth" && !event.iwhile
						}).then(() => {
							let list = [], strs = ''
							for (let [key, card] of player.getStorage('ymhumeng')) {
								strs += `「${lib.skill.ymhumeng.map[key]}」`;
								list.add(card);
							}
							player
								.chooseButton(['吞梦:是否指定一个拼点的点数？', '', strs, list])
								.set('ai', function (button) {
									return get.number(button.link) + 1;
								})
						}).then(() => {
							if (result.bool) {
								trigger.num1 = get.number(result.links[0])
								game.log(player, "的拼点牌点数改为" + get.number(result.links[0]));
							}
						})
						if (!player.countCards('h')) await player.draw();
						let next = player.chooseToCompare(event.targets);
						next.callback = lib.skill.ymhumeng_mouth.callback;
						await next;
					},
					callback() {
						"step 0";
						if (event.winner !== player) {
							game.delay();
							player.addMark("gushe", 1);
							if (player.countMark("gushe") >= 7) {
								player.die();
							}
						}
						"step 1";
						if (event.winner !== player) {
							player.chooseToDiscard("he", "弃置一张牌，或摸一张牌").set("ai", function () {
								return -1;
							});
						} else event.goto(3);
						"step 2";
						if (!result.bool) {
							player.draw();
						}
						"step 3";
						if (event.winner !== target) {
							target
								.chooseToDiscard("he", "弃置一张牌，或令" + get.translation(player) + "摸一张牌")
								.set("ai", function (card) {
									if (_status.event.goon) return 6 - get.value(card);
									return 0;
								})
								.set("goon", get.attitude(target, player) < 0);
						} else event.finish();
						"step 4";
						if (!result.bool) player.draw();
					},
				},

				nose: {
					logAudio: () => ['ext:忽悠宇宙/asset/ym/audio/ymhumeng7.mp3'],
					init(player) {
						if (!player.storage.ymhumeng_nose) player.storage.ymhumeng_nose = []
					},
					onremove: true,
					trigger: {
						global: 'useCardAfter'
					},
					filter(event, player) {
						return event.player != player && !player.getStorage('ymhumeng_nose').includes(event.player)
					},
					async content(event, trigger, player) {
						player.getStorage('ymhumeng_nose').add(trigger.player)
						const { suit } = await player
							.judge((card) => {
								if (get.suit(card) == 'heart') return -10;
								return 0;
							})
							.set('judge2', (result) => !result)
							.forResult();
						if (suit == 'heart') {
							trigger.player.skip("phaseUse");
						} else {
							player.line(trigger.player)
							trigger.player.damage('thunder')
						}
					},

				},
			},
		},
		ymqiuyu: {
			audio: 2,
			usable: 1,
			enable: 'phaseUse',
			filterTarget(card, player, target) {
				return player != target && target.countCards('h')
			},
			multitarget: true,
			multiline: true,
			selectTarget() {
				return [Math.floor(game.players.length * 1 / 3) + 1, game.filterPlayer(i => i != _status.event.player).length]
			},
			content() {
				player.chooseToDebate(targets.concat(player)).set('callback', lib.skill.ymqiuyu.callback);
			},
			callback() {
				var result = event.debateResult;
				if (result.bool && result.opinion) {
					var redtargets = result.red.map(i => i[0]), blacktargets = result.black.map(i => i[0])
					if (redtargets.length != blacktargets.length) {
						player.useCard({ name: redtargets.length > blacktargets.length ? 'taoyuan' : 'wugu', isCard: true }, (redtargets.length > blacktargets.length ? redtargets : blacktargets).sortBySeat(), true)
					}
				} else {
					player.recover()
					player.draw(2)
				}

			},
			ai: {
				order: 10,
				result: {
					player: 1,
				}
			}
		},
		ymhumeng_info: `狐梦|锁定技，游戏开始时，你将六张牌置于武将牌上，这些牌称之为“六狐”。<br>
					①每张“六狐”牌被依次命名为「生」「死」「耳」「目」「口」「鼻」。<br>
					②每回合限一次，当你需要使用或打出一张“六狐”牌包含牌名的牌时，你可以视为使用或打出之。<br>
					③回合开始时，你可以减一点上限，选择一张“六狐”牌交换牌堆顶的一张牌，并获得一种持续至下一回合开始时的对应效果：<br>
					「生」:准备阶段开始时，你回复一点体力并获得三种类型不同的牌各一张<br>
					「死」:出牌阶段开始时，你令一名其他角色的非锁定技失效，你对其使用牌无距离和次数限制，其不能使用或打出手牌且装备牌失效直到回合结束<br>
					「耳」:你获得等同于你体力值的护甲。一名其他角色回合开始时，你可以失去一点护甲，获得其一张牌并视为对其使用一张无距离限制的刺【杀】<br>
					「目」:出牌阶段限三次，你可以令两名角色交换体力值，回合结束时你摸等同于交换总差值的牌<br>
					「口」:摸牌阶段，你可以改为与至多6名其他角色拼点。若你没有手牌则摸一张进行拼点。没赢的角色选择弃置一张牌或令你摸一张牌<br>
					「鼻」:每名其他角色限一次，当一名角色使用牌结算完毕后，你进行一次判定。若结果为♥，其跳过下一个出牌阶段，否则受到一点雷电伤害。<br>`,
		ymhumeng_eye_info: '看梦|出牌阶段限三次，你可以令两名角色交换体力值，回合结束时你摸等同于交换总差值的牌',
		ymhumeng_live_info: '生梦|准备阶段开始时，你回复一点体力并获得三种类型不同的牌各一张',
		ymhumeng_ear_info: '听梦|你获得等同于你体力值的护甲。一名其他角色回合开始时，你可以失去一点护甲，获得其一张牌并视为对其使用一张无距离限制的刺【杀】',
		ymhumeng_nose_info: '嗅梦|每名其他角色限一次，当一名角色使用牌结算完毕后，你进行一次判定。若结果为♥，其跳过下一个出牌阶段，否则受到一点雷电伤害',
		ymhumeng_die_info: '死梦|出牌阶段开始时，你令一名其他角色的非锁定技失效，你对其使用牌无距离和次数限制，其不能使用或打出手牌且装备牌失效直到回合结束',
		ymhumeng_mouth_info: '吞梦|摸牌阶段，你可以改为与至多6名其他角色拼点。你以此法拼点的牌的点数改为从“六狐”牌中任意一张的点数。没赢的角色选择弃置一张牌或令你摸一张牌',
		ymqiuyu_info: "求谕|出牌阶段限一次，你可以与至少X名其他角色进行议事，X为1/3场上人数+1(向下取整)。若红>黑，你对红色方使用一张【桃园结义】;若黑>红,你对黑色方使用一张【五谷丰登】;相等，你回复一点体力并摸两张牌",

		ym_xiaohuanxiong: ['小浣熊君', ['male', 'hyyz_ɸ', 3, ['ymhuanzuo', 'ymzhuhe'], []], '樾舟'],
		ymhuanzuo_info: '欢作|锁定技，有角色摸牌阶段外一次获得或失去两张及以上的牌后，你摸一张牌。',
		ymhuanzuo: {
			audio: 2,
			trigger: {
				global: ["loseAfter", "gainAfter", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.getParent('phaseDraw')?.player != event.player) {
					if (event.getl(event.player)?.cards2.length > 1 || event.getg && event.getg(event.player).length > 1) return true;
				}
				return false;
			},
			async content(event, trigger, player) {
				await player.draw()
			},
		},
		ymzhuhe_info: '箸和|游戏开始时，你将牌堆顶三张牌置于你武将牌上，称为“箸”。每名角色的出牌阶段限一次，其可观看“箸”，然后选择将一张手牌置于其中，若此牌与其中两张牌满足加减条件，其获得这两张牌，然后将“箸”补至3。',
		ymzhuhe: {
			audio: 2,
			trigger: { global: "phaseBefore", player: "enterGame" },
			forced: true,
			locked: false,
			filter: (event) => event.name != "phase" || game.phaseNumber == 0,
			content() {
				player.addToExpansion(get.cards(3), "draw").gaintag.add("ymzhuhe")
			},
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					content = player.getExpansions("ymzhuhe");
					let nums = [];
					for (let card1 of content) {
						for (let card2 of content) {
							if (card1 == card2) continue;
							nums.add(Math.abs(get.number(card1) - get.number(card2)));
							nums.add(get.number(card1) + get.number(card2))
						}
					}
					nums = nums.filter(i => i > 0 && i <= 13)
					nums.sort((a, b) => a - b);
					if (content && content.length) {
						dialog.addAuto(content);
						if (nums.length) dialog.addText(nums.join('、'))
					}
				},
				content(content, player) {
					var content = player.getExpansions("ymzhuhe");
					if (content && content.length) {
						return get.translation(content);
					}
				},
			},
			global: 'ymzhuhe_lige',
			subSkill: {
				lige: {
					enable: "phaseUse",
					usable: 1,
					filter(event, player) {
						const targets = game.filterPlayer(function (current) {
							return current.hasSkill('ymzhuhe') && current.getExpansions('ymzhuhe').length > 0;
						});
						return targets.length > 0 && player.countCards('h') > 0;
					},
					filterTarget(card, player, target) {
						return target.hasSkill('ymzhuhe') && target.getExpansions('ymzhuhe').length > 0;
					},
					selectTarget() {
						if (game.countPlayer(current => {
							return current.hasSkill('ymzhuhe') && current.getExpansions('ymzhuhe').length > 0;
						}) > 1) return 1;
						return -1;
					},
					prompt() {
						const targets = game.filterPlayer(function (current) {
							return current.hasSkill('ymzhuhe') && current.getExpansions('ymzhuhe').length > 0;
						});
						return '箸和：交换' + get.translation(targets) + (targets.length > 1 ? '中的一人' : '') + '的一张“箸”';
					},
					async content(event, trigger, player) {
						const target = event.targets[0];
						const alls = target.getExpansions('ymzhuhe'), nums = [];
						for (let card1 of alls) {
							for (let card2 of alls) {
								if (card1 == card2) continue;
								nums.add(Math.abs(get.number(card1) - get.number(card2)));
								nums.add(get.number(card1) + get.number(card2))
							}
						}
						const next = player.chooseButton(1,
							[
								'将一张手牌置于其中，若此牌与其中两张牌满足加减条件，获得这两张牌',
								get.translation(target) + "的“箸”",
								target.getExpansions('ymzhuhe'),
								"你的手牌",
								player.getCards("h"),
							]
						);
						next.set("filterButton", function (button) {
							return get.position(button.link) == 'h'
						});
						next.set('ai', (button) => {
							const card = button.link, nums = _status.event.nums;
							if (get.attitude2(_status.event.target) > 0) {
								if (player.countCards('h', cardx => nums.includes(get.number(cardx))))
									return nums.includes(get.number(card));
								return get.value(card) < 10;
							}
							return get.value(card) < 8 && !nums.includes(get.number(card));
						})
						next.set('nums', nums.filter(i => i > 0 && i <= 13))
						next.set('target', target)
						const { links } = await next.forResult();
						if (links) {
							await target.addToExpansion("giveAuto", links, target).gaintag.add("ymzhuhe");
							const hand = links[0], alls = target.getExpansions('ymzhuhe').filter(i => i != hand);
							for (let card1 of alls) {
								for (let card2 of alls) {
									if (card1 == card2) continue;
									const list = [card1, card2, hand];
									list.sort((a, b) => get.number(a) - get.number(b));//从小到大排
									if (get.number(list[0]) + get.number(list[1]) == get.number(list[2])) {
										await player.gain([card1, card2], 'give', player);
										if (target.getExpansions('ymzhuhe').length < 3) await target.addToExpansion(get.cards(3 - target.getExpansions('ymzhuhe').length), "draw").gaintag.add("ymzhuhe");
										return;
									}
								}
							}
						};
					},
					ai: {
						order: 10,
						result: {
							target: 2,
							player: 0.5,
						},
					},
				}
			}
		},

	},
}, dynamicTranslates = {
	//心之所向_星之所向
	ymjingjin(player) {
		var info = lib.skill.ymjingjin.getInfo(player);
		return `锁定技，当你对一名角色造成或受到伤害时，你观看牌堆顶<span class=thundertext>${info[0]}</span>张牌并以任意顺序放回，然后你弃置受伤角色<span class=firetext>${info[1]}</span>张牌、令其摸<span class=greentext>${info[2]}</span>张牌并令伤害来源将手牌数调整至<span class=yellowtext>${info[3]}</span>。历战：你与该角色中手牌数较小者交换〖精进〗中的任意个阿拉伯数字。`
	},
	//眠羊
	ymfanxing() {
		if (lib.skill.ymfanxing.list.length) {
			let list = ['①', '②', '③'],
				str = '锁定技，你每回合使用首张牌后，需选择'
			for (let i = 0; i < lib.skill.ymfanxing.list.length; i++) {
				str += list[i] + lib.skill.ymfanxing.list[i];
			}
			return str;
		}
		return '轻装上阵';
	},
	ymqinglv() {
		if (lib.skill.ymfanxing.list.length) return '结束阶段，你可以执行〖繁行〗中的一项，若获得牌数不大于你弃牌阶段的弃牌数，你可删去此项并摸两张牌。';
		return '轻装上阵'
	},
};
export { characters, dynamicTranslates }