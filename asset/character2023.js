'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';
//技能等相关信息
const characters = {
	/**@type { SMap<Skill> } */
	2306: {
		hyyz_jingyuan: ['景元', ["male", "hyyz_xt", 4, ["hyyzshenjun", "hyyzzhankan", "hyyzshence"], ['zhu']], '#b闭目藏睛坐中阵<br>不屑浮名绊此身<br>举头移锋惊电起<br>追魔扫秽敬弓神', '仙舟联盟帝弓七天将之一，负责节制罗浮云骑军的「神策将军」。师从前代「罗浮」剑首，但并不显名于武力。'],
		hyyzshenjun: {
			init: (player) => player.storage.hyyzshenjun = 0,
			audio: 2,
			mark: true,
			marktext: "君",
			intro: {
				name: "神霄雷府总司驱雷掣电追魔扫秽天君",
				content(storage) {
					let str = '神霄雷府总司驱雷掣电追魔扫秽天君的段数为：<br>';
					if (!storage) return str += '0';
					return str + storage;
				},
			},
			trigger: {
				player: ["useCard", "respond"],
			},
			forced: true,
			filter(event, player) {
				return event.card && get.type2(event.card) && player.storage.hyyzshenjun < 10;
			},
			async content(event, trigger, player) {
				let num = 0;
				switch (get.type2(trigger.card)) {
					case 'basic': num = 1; break;
					case 'trick': num = 2; break;
					case 'equip': num = 3; break;
				};
				player.storage.hyyzshenjun += num;
				if (player.storage.hyyzshenjun > 10) player.storage.hyyzshenjun = 10;
				player.syncStorage('hyyzshenjun');
			},
		},
		hyyzzhankan: {
			audio: 2,
			trigger: {
				player: "phaseUseBegin",
			},
			forced: true,
			filter(event, player) {
				return player.storage.hyyzshenjun >= 3;
			},
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyz', 'hyyzzhankan', 1)
				let bool = false;
				game.delay(1.5);
				do {
					if (!bool) {
						game.hyyzSkillAudio('hyyz', 'hyyzzhankan', 2)
						bool = true;
					}
					player.storage.hyyzshenjun -= 3;
					player.syncStorage('hyyzshenjun');
					const targets = await player.chooseTarget(true, lib.filter.notMe)
						.set('ai', (target) => get.damageEffect(target, player, player, 'thunder'))
						.set('prompt', '斩勘：对一名其他角色造成1点雷电伤害')
						.forResultTargets();
					if (targets) {
						player.line(targets[0], 'thunder');
						targets[0].damage(player, 'thunder');
					}
					else return;
				} while (player.storage.hyyzshenjun >= 3);
			},
			ai: {
				combo: 'hyyzshenjun',
				threaten: 3,
				expose: 1,
			},
		},
		hyyzshence: {
			audio: 4,
			zhuSkill: true,
			unique: true,
			forced: true,
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			filter(event, player) {
				if (!player.hasZhuSkill('hyyzshence')) return false;
				if (event.player.group != 'hyyz_xt') return false;
				return player.storage.hyyzshenjun < 10 && (event.name != 'phase' || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				let num = game.countPlayer((current) => current.group == 'hyyz_xt');
				num = Math.min(num, 10 - player.storage.hyyzshenjun);
				if (num > 0) {
					player.storage.hyyzshenjun += num;
					player.syncStorage('hyyzshenjun');
					game.log('#g【神策】', '“神君”增加', num, '段');
				}
			},
			ai: {
				combo: 'hyyzshenjun',
			}
		},
		hyyzshenjun_info: "神君|锁定技，当你使用或打出基本/锦囊/装备牌时，〖神君〗增加1/2/3段（至多10段）。",
		hyyzzhankan_info: "斩勘|锁定技，出牌阶段开始时，你减少三段〖神君〗并对一名其他角色造成1点雷电伤害，然后重复此流程。",
		hyyzshence_info: "神策|主公技，锁定技，游戏开始时，场上每有一名星铁势力的角色，〖神君〗增加1段。",

		hyyz_qingque: ['青雀', ["female", "hyyz_xt", 3, ["hyyzlaoyue", "hyyzmenqing", "hyyzangang"], []], '#b摸鱼ing...', '仙舟「罗浮」太卜司的卜者，兼书库管理员。因工作一再偷闲摸鱼，即将贬无可贬成为「掌门人」。'],
		hyyzqiongyu: {
			charlotte: true,
			unique: true,
			intro: {
				markcount: "expansion",
				mark(dialog, content, player) {
					var content = player.getExpansions('hyyzqiongyu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							dialog.addAuto(content);
						}
						else {
							return '共有' + get.cnNumber(content.length) + '张“琼玉牌”';
						}
					}
				},
				content(content, player) {
					var content = player.getExpansions('hyyzqiongyu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							return get.translation(content);
						}
						return '共有' + get.cnNumber(content.length) + '张“琼玉牌”';
					}
				},
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
		},
		hyyzlaoyue: {
			audio: 11,
			frequent: 'hyyzlaoyue_phase',
			group: ["hyyzlaoyue_phase", "hyyzlaoyue_lose", "hyyzlaoyue_four", "hyyzqiongyu"],
			subSkill: {
				phase: {
					trigger: {
						global: "phaseBegin",
					},
					frequent: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzlaoyue', 1, 2, 3, 4, 5)
						player.addToExpansion(get.cards(), player, 'draw').gaintag.add('hyyzqiongyu');
						game.log(player, '增加一张“琼玉牌”');
					},
				},
				lose: {
					enable: "phaseUse",
					filter: (event, player) => player.countCards('he') > 0,
					filterCard: true,
					position: "he",
					check: (card) => 8 - get.value(card),
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzlaoyue', 6, 7, 8, 9, 10, 11)
						player.addToExpansion(get.cards(2), player, 'draw').gaintag.add('hyyzqiongyu');
						game.log(player, '增加两张“琼玉牌”');
					},
					ai: {
						order: 3,
						result: {
							player(player, target) {
								if (player.countCards('h') < player.hp) return -2;
								if (player.countCards('h') > player.hp) return 1;
							},
						},
					},
				},
				four: {
					trigger: {
						player: ["addToExpansionAfter", "loseToDiscardpile"],
					},
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length >= 4;
					},
					direct: true,
					silent: true,
					charlotte: true,
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length > 4;
					},
					async content(event, trigger, player) {
						var num = player.getExpansions('hyyzqiongyu').length - 4;
						let links = await player.chooseCardButton('弃置' + get.cnNumber(num) + '张“琼玉牌”', player.getExpansions('hyyzqiongyu'), true, num)
							.set('ai', (button) => get.type(button.link) != 'basic')
							.forResultLinks();
						if (links) {
							player.loseToDiscardpile(links);
							game.log(player, '弃置', get.cnNumber(links.length), '张“琼玉牌”');
						}
					}
				}
			},
			ai: {
				combo: "hyyzangang",
			}
		},
		hyyzmenqing: {
			audio: 2,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				return player.getExpansions('hyyzqiongyu').length && event.filterCard({ name: 'sha' }, player, event);
			},
			hiddenCard(player, name) {
				return name == 'sha' && player.getExpansions('hyyzqiongyu').length > 0;
			},
			chooseButton: {
				dialog: function (event, player) {
					return ui.create.dialog('门清', player.getExpansions('hyyzqiongyu'), 'hidden');
				},
				filter: function (button, player) {
					var evt = _status.event.getParent();
					var card = get.autoViewAs({ name: 'sha' }, [button.link]);
					return evt.filterCard(card, player, evt);
				},
				select: 1,
				check: function (button) {
					var player = _status.event.player;
					return get.type2(button.link) != 'basic';
				},
				backup: function (links, player) {
					return {
						audio: "hyyzmenqing",
						filterCard: links[0],
						selectCard: -1,
						position: 'x',
						viewAs: {
							name: 'sha',
						},
						onuse: function (result, player) {
							player.logSkill('hyyzmenqing', result.targets);
						},
						onrespond: function (result, player) {
							player.logSkill('hyyzmenqing');
						}
					};
				},
				prompt: function (links, player) {
					return '选择杀（' + get.translation(links[0]) + '）的目标';
				},
			},
			ai: {
				combo: "hyyzlaoyue",
				order: function (item, player) {
					if (player.getExpansions('hyyzqiongyu').length >= 3) return 6;
					return 1;
				},
				respondSha: true,
				skillTagFilter: function (player, tag, arg) {
					return player.getExpansions('hyyzqiongyu').length > 0;
				},
			},
			mod: {
				targetInRange: function (card) {
					if (_status.event.skill == 'hyyzmenqing_backup') return true;
				},
			},
			group: "hyyzqiongyu",
		},
		hyyzangang: {
			audio: 2,
			group: ["hyyzqiongyu", "hyyzangang_audio"],
			subSkill: {
				audio: {
					trigger: {
						player: ["addToExpansionAfter", "loseToDiscardpile"],
					},
					filter(event, player, name) {
						return player.getExpansions('hyyzqiongyu').length == 4 &&
							player.getExpansions('hyyzqiongyu').every(val => get.type2(player.getExpansions('hyyzqiongyu')[0]) == get.type2(val));
					},
					async cost(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzangang', 1)
						const { result } = await player.chooseTarget('对一名其他角色造成2点伤害', lib.filter.notMe, true)
							.set('ai', (target) => -get.attitude(_status.event.player, target));
						event.result = result;
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzangang', 2)
						await player.loseToDiscardpile(player.getExpansions('hyyzqiongyu'));
						event.targets[0].damage(2);
					},
				}
			},
			ai: {
				combo: "hyyzlaoyue",
			}
		},
		hyyzqiongyu_info: "琼玉牌|",
		hyyzlaoyue_info: "捞月|你可以于{每回合开始时/出牌阶段弃置一张牌}，将牌堆顶的{一/二}张牌加入“琼玉牌”并弃置至四张。",
		hyyzmenqing_info: "门清|你可以将一张“琼玉牌”当无距离限制的【杀】使用或打出。",
		hyyzangang_info: "暗杠|锁定技，若“琼玉牌”为四张类型相同的牌，弃置所有“琼玉牌”并对一名其他角色造成两点伤害。",

		hyyz_bailu: ['白露', ["female", "hyyz_xt", 3, ["hyyzleiyin", "hyyzxuanhu"], []], '#b看本小姐我一尾巴抄到你爹妈认不出来！', '仙舟「罗浮」持明族的尊长，有「衔药龙女」之称的医士。以独门医理和唯有龙脉方可施行的「医疗手段」救死扶伤。'],
		hyyzleiyin: {
			audio: 2,
			init() {
				lib.hyyz.buff.set('hyyzBuff_shengxi', ['生息', 'buff']);
			},
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return player.countCards('he');
			},
			filterCard: true,
			check(card) {
				if (ui.selected.cards.length) return -1;
				return 8 - get.value(card);
			},
			selectCard: [1, 3],
			position: 'he',
			filterTarget: true,
			selectTarget() {
				return ui.selected.cards.length;
			},
			async content(event, trigger, player) {
				const target = event.target;
				const cards = await target.draw().forResult();
				target.addhyyzBuff('hyyzBuff_shengxi')
				if (get.color(cards[0]) == 'red') {
					let next = target.chooseUseTarget();
					next.cards = cards;
					next.card = get.autoViewAs({ name: 'tao' }, cards);
					next.targets = [target];
					next.prompt = `是否对自己使用${get.translation(get.autoViewAs({ name: 'tao' }, cards))}（${get.translation(cards)}）？`
					await next;
				}
			},
			ai: {
				order: 10,
				result: {
					target: 2,
				},
			},
		},
		hyyzBuff_shengxi: {
			charlotte: true,
			audio: 2,
			mark: true,
			marktext: "💜",
			intro: {
				name: "生息",
				content: "增益效果：加2点体力上限，下次受到伤害后，回复1点体力。失去此效果的回合结束后，减2点体力上限。",
			},
			init(player) {
				player.gainMaxHp(2);
			},
			onremove(player) {
				player.when({ global: 'phaseAfter' }).then(() => (player.loseMaxHp(2)));
			},
			trigger: {
				player: "damageEnd",
			},
			forced: true,
			async content(event, trigger, player) {
				player.recover();
				player.removehyyzBuff('hyyzBuff_shengxi');
			},
			ai: {
				maixie: true,
				"maixie_hp": true,
			},
		},
		hyyzxuanhu: {
			audio: 1,
			enable: "chooseToUse",
			filter(event, player) {
				return event.type == 'dying' && player.storage.hyyzxuanhu == false && _status.event.dying != player;
			},
			filterTarget(card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			mark: true,
			skillAnimation: true,
			animationStr: "悬壶",
			limited: true,
			animationColor: "wood",
			init(player) {
				player.storage.hyyzxuanhu = false;
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzxuanhu');
				player.storage.hyyzxuanhu = true;
				let count = player.maxHp;
				while (count > 0) {
					count--;
					await player.useSkill('hyyzleiyin', event.targets);
				}
			},
			ai: {
				order: 6,
				threaten: 1.4,
				skillTagFilter(player) {
					if (!_status.event.dying) return false;
				},
				save: true,
				result: {
					target: 6,
				},
			},
			intro: {
				content: "limited",
			},
		},
		hyyzleiyin_info: "雷音|出牌阶段限一次，你可以弃置至多三张牌，令等量的角色各摸一张牌并获得" + get.hyyzIntroduce('生息') + "，因此获得红色牌的角色可以将此牌当【桃】使用。",
		hyyzBuff_shengxi_info: '生息|',
		hyyzxuanhu_info: "悬壶|限定技，一名其他角色进入濒死时，你可以对其发动体力上限次〖雷音〗。",

	},
	2307: {
		hyyz_luocha: ['罗刹', ["male", "hyyz_xt", 3, ["hyyzzanghua", "hyyzxuanxin"], ['zhu',]], '#b一介行商罢了', '金发俊雅的年轻人，背着巨大的棺棹。身为天外行商的他，不幸被卷入仙舟「罗浮」的星核危机，一身精湛医术莫名有了用武之地。'],
		hyyzzanghua: {
			audio: 4,
			logAudio(event, player) {
				return player.storage.hyyzzanghua ? [
					'ext:忽悠宇宙/asset/hyyz/audio/hyyzzanghua3.mp3',
					'ext:忽悠宇宙/asset/hyyz/audio/hyyzzanghua4.mp3',
					'ext:忽悠宇宙/asset/hyyz/audio/hyyzzanghua5.mp3',
				] : [
					'ext:忽悠宇宙/asset/hyyz/audio/hyyzzanghua1.mp3',
					'ext:忽悠宇宙/asset/hyyz/audio/hyyzzanghua2.mp3',
				]
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				markcount(storage, player) {
					return storage ? '灭' : '救';
				},
				content(storage, player, skill) {
					return storage ?
						`一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。` :
						`一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`;
				},
			},
			trigger: {
				global: 'damageAfter'
			},
			filter(event, player) {
				if (player.storage.hyyzzanghua) {
					return event.source && event.source.hp > event.source.getDamagedHp();
				} else {
					return event.player.hp < event.player.getDamagedHp();
				}
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseBool()
					.set('prompt', `是否对${player.storage.hyyzzanghua ? get.translation(trigger.source) : get.translation(trigger.player)}发动${get.translation('hyyzzanghua')}？`)
					.set('prompt2', player.storage.hyyzzanghua ?
						`${get.translation(trigger.source)}${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。` :
						`${get.translation(trigger.player)}${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`)
					.set('ai', () => player.storage.hyyzzanghua ? get.attitude2(trigger.source) < 0 : get.attitude2(trigger.player) > 0)
					.forResult();
				event.result.targets = player.storage.hyyzzanghua ? [trigger.source] : [trigger.player];
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const storage = player.storage.hyyzzanghua ? true : false;
				player.changeZhuanhuanji('hyyzzanghua');
				player.updateMark('hyyzzanghua')
				if (storage) {
					await trigger.source.hyyzQvsan();
					while (trigger.source.hp >= trigger.source.getDamagedHp()) {
						await trigger.source.loseHp();
					}
				} else {
					await trigger.player.hyyzJinghua()
					while (trigger.player.hp <= trigger.player.getDamagedHp()) {
						await trigger.player.recover();
					}
				}
			},
		},
		hyyzxuanxin: {
			audio: 2,
			trigger: {
				global: 'roundStart'
			},
			filter(event, player) {
				return true;
			},
			frequent: true,
			async content(event, trigger, player) {
				player.changeZhuanhuanji('hyyzzanghua');
				player.updateMark('hyyzzanghua');
				await game.delayx();
				let list = [];
				if (lib.inpile.some(name => get.translation(name).includes('黑渊'))) list.add(['装备', '', 'hyyz_heiyuan']);
				if (lib.inpile.some(name => get.translation(name).includes('白花'))) list.add(['装备', '', 'hyyz_baihua']);
				if (!list.length) return;
				const links = await player.chooseButton(['选择要装备的牌', [list, 'vcard']], true).set('ai', (button) => {
					const name = button.link[2];
					if (player.getEquips('hyyz_heiyuan').length) return name == 'hyyz_baihua';
					if (player.getEquips('hyyz_baihua').length) return name == 'hyyz_heiyuan';
					return true;
				}).forResultLinks();
				if (links) {
					const name = links[0][2];
					let card, target;
					card = get.cardPile((card) => card.name.includes(name));
					if (!card) {
						let players = game.filterPlayer();
						for (let current of players) {
							if (current.countCards('hej', (card) => card.name.includes(name))) {
								card = current.getCards('hej', (card) => card.name.includes(name))[0];
								target = current;
							};
							if (card) break;
						}
					}
					if (card) {
						player.equip(card);
					}
					else game.log(name, '不在游戏中');

					if (target?.isIn()) {
						const index = await player
							.chooseControlList([
								`${get.translation(target)}${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`,
								`${get.translation(target)}${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。`,
							])
							.set('prompt', '你可以对' + get.translation(target) + '发动一次葬花')
							.set('ai', () => get.attitude2(target) > 0 ? 1 : 0)
							.forResult('index');
						if (index == 0) {
							await target.hyyzQvsan();
							while (target.hp >= target.getDamagedHp()) {
								await target.loseHp();
							}
						} else if (index == 1) {
							await target.hyyzJinghua();
							while (target.hp <= target.getDamagedHp()) {
								await target.recover();
							}
						}
					}
				}
			},
		},
		hyyzzanghua_info: `葬花|转换技：<br>
			阳：一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。<br>
			阴：一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`,
		hyyzxuanxin_info: '悬心|每轮开始时，你可以转换〖葬花〗并装备一张名字包含“黑渊”或“白花”的牌。若此牌在角色的区域内，你可以对其发动一项〖葬花〗。',

		hyyz_welt: ['瓦尔特', ["male", "hyyz_xt", 4, ["hyyzduanjie", "hyyzshenpan"], ['zhu',]], '#b继承「世界」之名', '老成持重的列车组前辈。享受着久违的冒险奇遇，心底埋藏的热血再度燃烧，偶尔还会将经历的冒险旅程画在本子里。'],
		hyyzduanjie: {
			audio: 3,
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player) {
				return event.card.name == 'sha' && event.target != player && !event.target.hashyyzBuff('hyyzBuff_jingu');
			},
			shaRelated: true,
			forced: true,
			logTarget: "target",
			content() {
				trigger.target.addhyyzBuff('hyyzBuff_jingu');
			},
			ai: {
				effect: {
					player: function (card, player, target) {
						if (card.name == 'sha') return [1, 2];
					},
				},
				"unequip_ai": true,
				skillTagFilter: function (player, tag, arg) {
					if (tag == 'unequip_ai' && arg && arg.name == 'sha' && arg.target) return true;
					return false;
				},
			},
		},
		hyyzshenpan: {
			audio: 3,
			frequent: 'hyyzshenpan_dam',
			group: ["hyyzshenpan_dam", "hyyzshenpan_lose"],
			subSkill: {
				dam: {
					trigger: {
						source: "damageSource",
					},
					check: function (event, player) {
						return -get.attitude(player, event.player)
					},
					frequent: "check",
					filter: function (event, player) {
						return !event.player.hashyyzBuff('hyyzBuff_jiansu') && event.player.isAlive();
					},
					usable: 1,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzshenpan', 1)
						player.logSkill('hyyzshenpan_dam', trigger.player);
						trigger.player.addhyyzBuff('hyyzBuff_jiansu');
					},
				},
				lose: {
					trigger: {
						global: ["loseAfter"]
					},
					filter(event, player) {
						if (!event.player.hashyyzBuff('hyyzBuff_jingu')) return false;
						if (event.player == player) return false;
						if (event.type != 'discard' || event.getlx === false) return false;
						var evt = event.getl(event.player);
						if (evt && evt.cards && evt.cards.length) {
							for (var i of evt.cards) {
								if (i.original != 'j' && get.position(i, true) == 'd') {
									return true;
								}
							}
							return false;
						}
					},
					async cost(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzshenpan', 2)
						let cards = [];
						for (let i of trigger.getl(trigger.player).cards) {
							if (get.position(i) == 'd') cards.add(i);
						}
						let { result: { bool, links } } = await player.chooseButton(['审判：获得其中一张牌，然后可以对' + get.translation(trigger.player) + '使用此牌', cards], (button) => {
							return _status.event.player.getUseValue(button.link) || get.value(button.link);
						});
						event.result = {
							bool: bool,
							cards: links
						}
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzshenpan', 3)
						player.gain(event.cards[0], 'gain2');
						if (player.canUse(event.cards[0], trigger.player, false)) {
							let bool = await player
								.chooseBool('是否对' + get.translation(trigger.player) + '使用' + get.translation(event.cards[0]) + '？')
								.forResultBool();
							if (bool) player.useCard(event.cards[0], trigger.player);
						}
					},
				},
			},
		},
		hyyzduanjie_info: `断界|锁定技，当你使用【杀】指定目标后，令目标角色${get.hyyzIntroduce('禁锢')}。`,
		hyyzshenpan_info: `审判|你对其他角色造成伤害后，你可以令其${get.hyyzIntroduce('减速')}。被${get.hyyzIntroduce('禁锢')}的角色的牌因弃置进入弃牌堆后，你获得其中一张牌，然后你可以对其使用此牌。`,

		hyyz_yinlang: ['银狼', ["female", "hyyz_xt", 3, ["hyyzhuiya", "hyyzruqin", "hyyzfengjin"], []], '#b（ᗜ ‸ ᗜ）', '「星核猎手」的成员，骇客高手。将宇宙视作大型沉浸式模拟游戏，玩乐其中。掌握了能够修改现实数据的「以太编辑」。'],
		hyyzhuiya: {
			audio: 2,
			trigger: {
				player: "useCardToPlayered",
			},
			filter(event, player) {
				if (_status.currentPhase != player || !player.isPhaseUsing()) return false;
				return event.target != player
			},
			usable: 1,
			logTarget: "target",
			check(event) {
				return -get.attitude2(event.target)
			},
			async content(event, trigger, player) {
				trigger.getParent().directHit.addArray(game.filterPlayer());

				const weakness = get.weakness().filter(i => !trigger.target.hasWeakness(i));
				if (weakness.length) {
					const control = await player
						.chooseControl(weakness.map(i => i + '_logo'))
						.set('prompt', '植入一个弱点')
						.set('ai', () => {
							return weakness.map(i => i + '_logo')[0];
						})
						.forResultControl();
					if (control) {
						await trigger.target.addWeakness(control.slice(0, -5));
					}
				}
			},
		},
		hyyzruqin: {
			audio: 3,
			trigger: {
				player: ['useCardBefore', 'respondBefore']
			},
			locked: false,
			forced: true,
			firstDo: true,
			filter(event, player) {
				let cards = player.getCards("s", card => {
					return card.gaintag.some(tag => tag.startsWith('hyyzruqin')) && card._cardid;
				});
				return event.cards && event.cards.some(card => cards.includes(card));
			},
			async content(event, trigger, player) {
				const idList = player.getCards("s", card => card.gaintag.some(tag => tag.startsWith('hyyzruqin'))).map(i => i._cardid);
				let current_cards = [];
				game.countPlayer(current => {
					current_cards.addArray(current.getCards('h', (card) => idList.includes(card.cardid)))
				})

				let trigger_cards = [];
				for (let i of trigger.cards) {
					let cardx = current_cards.find(card => card.cardid == i._cardid);
					if (cardx) trigger_cards.add(cardx);
				}

				let old_cards = trigger.cards.slice();
				trigger.cards = trigger_cards;
				trigger.card.cards = trigger_cards;

				if (player.isOnline2()) {
					player.send((cards, player) => {
						cards.forEach(i => i.delete());
						if (player == game.me) ui.updatehl();
					}, old_cards, player);
				}
				old_cards.forEach(i => i.delete());
				if (player == game.me) ui.updatehl();
			},
			global: 'hyyzruqin_other',
			subSkill: {
				other: {
					trigger: {
						global: ["phaseBefore", "equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter", "changeWeaknessAfter"],
						player: ["enterGame", "loseAfter", "die"],
					},
					forceDie: true,
					priority: -50,
					forced: true,
					charlotte: true,
					silent: true,
					filter(event, player, name) {
						if (event.name == 'changeWeakness') return true;
						if (!player.isMaxWeakness()) return false;
						//游戏开始时初始化
						if (event.name == 'die') return true;
						if (name == 'enterGame' || name == 'phaseBefore') {
							return event.name != 'phase' || game.phaseNumber == 0;
						}
						if (event.name == 'gain' && event.player == player) {
							return true//player.isMaxWeakness()
						}
						const evt = event.getl(player);
						if (!evt || !evt.hs || !evt.hs.length/*  || !player.isMaxWeakness() */) return false;
						return true;
					},
					async content(event, trigger, player) {
						const targets = game.filterPlayer(current => current != player && current.hasSkill('hyyzruqin'));
						for (let target of targets) {
							const tag = 'hyyzruqin_' + player.name;
							lib.translate[tag] = '' + lib.translate[player.name].slice(0, 4);
							const cardsx = player.isMaxWeakness() ? player.getCards('h').map((card) => {
								let cardx = ui.create.card();
								cardx.init(get.cardInfo(card));
								cardx._cardid = card.cardid;
								return cardx;
							}) : [];
							target.getCards('s', card => card.hasGaintag(tag)).filter(i => !cardsx.includes(i)).forEach(i => i.delete());
							if (!target.countCards('s', card => card.hasGaintag(tag))) target.directgains(cardsx, null, tag);
						}
					},
				}
			},
			mod: {
				cardEnabled2(card, player) {
					if (card.gaintag?.some(tag => tag.startsWith('hyyzruqin')) && _status.currentPhase == player) return false;
				},
			},
		},
		hyyzfengjin: {
			audio: 2,
			trigger: {
				source: "damageEnd",
			},
			check(event, player) {
				return get.attitude(player, event.player) <= 0;
			},
			filter(event, player) {
				if (event.player.hashyyzBuff('hyyzBuff_zhongshang') &&
					event.player.hashyyzBuff('hyyzBuff_xuruo') &&
					event.player.hashyyzBuff('hyyzBuff_jiansu')) return false;
				return event.player != player && event.player.isIn();
			},
			async cost(event, trigger, player) {
				let list = ['hyyzBuff_zhongshang', 'hyyzBuff_xuruo', 'hyyzBuff_jiansu'].filter(skill => !trigger.player.hashyyzBuff(skill));
				let control = await player
					.chooseControl(list, 'cancel2')
					.set('prompt', '封禁：是否令' + get.translation(trigger.player) + '获得一个debuff？')
					.set('ai', () => {
						const trigger = _status.event.getTrigger();
						if (get.attitude2(trigger.player) < 0) {
							return list.randomGet()
						}
						return 'cancel2'
					}).forResultControl();
				event.result = {
					bool: control != 'cancel2',
					cost_data: control,
				}
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.addhyyzBuff(event.cost_data);
			},
		},
		hyyzhuiya_info: `绘鸦|出牌阶段限一次，你使用牌指定其他角色后，可以为其植入一个自身没有的${get.hyyzIntroduce('弱点')}，且此牌不能被响应。`,
		hyyzruqin_info: "入侵|回合外，你可以使用或打出弱点最多的角色的手牌。",
		hyyzfengjin_info: `封禁|当你造成伤害后，你可以令受伤角色获得${get.hyyzIntroduce('减速')}、${get.hyyzIntroduce('虚弱')}或${get.hyyzIntroduce('重伤')}。`,

		hyyz_jizi: ['姬子', ["female", "hyyz_xt", 4, ["hyyzzhuiji", "hyyzxinghuo", "hyyztianhuo"], ['zhu',]], '#b好啦，打起精神来<br>这就是我们要开拓的新世界！', '星穹列车的修复者。为了见证广阔的星空，选择与星穹列车同行。爱好是制作手调咖啡。'],
		hyyzzhuiji: {
			audio: 4,
			group: 'hyyzzhuiji_audio',
			subSkill: {
				audio: {
					trigger: {
						player: "damageEnd",
						source: "damageSource",
					},
					filter: function (event, player) {
						return event.player.countDiscardableCards(player, "e") > 0;
					},
					async cost(event, trigger, player) {
						const { result } = await player.discardPlayerCard(get.prompt('hyyzzhuiji', trigger.player), trigger.player, 'e',).set('ai', function (button) {
							const trigger = _status.event.getTrigger();
							const target = trigger.player, player = _status.event.player;
							const att = get.attitude(player, target);
							if (player.hp <= 2 && target == player) return 12 - get.value(button.link);
							if (att > 0) return 8 - get.value(button.link);
							return 0.1 + get.value(button.link);
						});
						event.result = result
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						if (trigger.player == player) {
							game.hyyzSkillAudio('hyyz', 'hyyzzhuiji', 1, 2)
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzzhuiji', 3, 4)
						}
					},
				}
			},
		},
		hyyzxinghuo: {
			audio: 4,
			marktext: "星",
			intro: {
				content: "expansion",
				markcount: "expansion",
			},
			onremove(player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			group: 'hyyzxinghuo_audio',
			subSkill: {
				audio: {
					trigger: {
						global: ["loseAsyncAfter", "loseAfter"],
					},
					filter(event, player) {
						if (event.type != 'discard' || event.getlx === false) return;
						var evt = event.getl(event.player);
						for (var i = 0; i < evt.cards2.length; i++) {
							if (get.type(evt.cards2[i]) == 'equip' && get.position(evt.cards2[i]) == 'd') {
								return true;
							}
						}
						return false;
					},
					async cost(event, trigger, player) {
						let cards = [];
						let evt = trigger.getl(trigger.player);
						for (let i = 0; i < evt.cards2.length; i++) {
							if (get.type(evt.cards2[i]) == 'equip' && get.position(evt.cards2[i]) == 'd') {
								cards.add(evt.cards2[i]);
							}
						}
						let str = [
							'令' + get.translation(trigger.player) + '[灼烧]',
							'将' + get.translation(cards) + '置于武将牌上并摸一张牌'];
						let { result: { index } } = await player.chooseControlList('星火', str, function () {
							var player = _status.event.player, target = _status.event.target;
							if (target.hasSkillTag('nofire')) return 1;
							if (get.attitude(player, target) < 0) {
								if (target.hp <= 1) return 1;
							}
							return 1;
						}).set('target', trigger.player);
						event.result = {
							bool: (index == 0 || index == 1),
							cards: cards,
							cost_data: {
								index: index
							}
						}
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						if (event.cost_data.index == 0) {
							trigger.player.addhyyzBuff('hyyzBuff_zhuoshao');
							game.hyyzSkillAudio('hyyz', 'hyyzxinghuo', 1, 2)
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzxinghuo', 3)
							player.addToExpansion(event.cards, 'gain2').gaintag.add('hyyzxinghuo');
							player.draw();
						}
						if (trigger.player == player) {
							game.hyyzSkillAudio('hyyz', 'hyyzxinghuo', 4)
							await player.recover();
						}
					},
				}
			}
		},
		hyyztianhuo: {
			audio: 1,
			skillAnimation: true,
			animationColor: "fire",
			juexingji: true,
			unique: true,
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			forced: true,
			filter(event, player) {
				return player.getExpansions('hyyzxinghuo').length >= 3;
			},
			derivation: "hyyzhonglian",
			content() {
				player.awakenSkill('hyyztianhuo');
				player.loseMaxHp();
				player.addSkill('hyyzhonglian');
			},
		},
		hyyzhonglian: {
			audio: 3,
			init(player) {
				player.storage.hyyzhonglian = [];
			},
			group: 'hyyzhonglian_audio',
			subSkill: {
				audio: {
					enable: "phaseUse",
					filter(card, player) {
						return player.getExpansions('hyyzxinghuo').length > 0 && game.countPlayer(function (current) {
							return current.countCards('h') > 0 && !current.hasSkill('hyyzhonglian_no');
						}) > 0
					},
					filterTarget: function (card, player, target) {
						return target.countCards('h') && !player.storage.hyyzhonglian.includes(target);
					},
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzhonglian', 1)
						const target = event.targets[0];
						player.storage.hyyzhonglian.add(target);
						player.when({
							global: 'phaseAfter'
						}).then(() => {
							player.storage.hyyzhonglian = []
						})
						let cards = await player.choosePlayerCard(target, true, 'h').forResultCards();
						if (cards) {
							let suit = get.suit(cards[0]);
							target.showCards(cards[0]);
							const loses = player.getExpansions('hyyzxinghuo').filter(card => get.suit(card) == suit);
							if (loses.length) {
								const bool = await player
									.chooseBool()
									.set('prompt', `是否弃置${get.translation(loses)}对${get.translation(target)}造成1点火焰伤害？`)
									.set('ai', () => true)
									.forResultBool();
								if (bool) {
									game.hyyzSkillAudio('hyyz', 'hyyzhonglian', 2)
									player.loseToDiscardpile(loses);
									target.damage('fire', player)
								}
							}
							game.hyyzSkillAudio('hyyz', 'hyyzhonglian', 3)
						}
					},
					ai: {
						combo: 'hyyzxinghuo',
						order: 8,
						result: {
							target: function (player, target) {
								if (target.hasSkillTag('nofire')) return 0;
								return get.damageEffect(target, player, target, 'fire') - (target.countCards('e') > 1 ? 1.5 : 0);
							},
						},
						tag: {
							damage: 1,
							fireDamage: 1,
							natureDamage: 1,
							norepeat: 1,
						},
					},
				},
			},
		},
		hyyzzhuiji_info: "追击|当你受到伤害/造成伤害后，你可以弃置受伤角色装备区内的一张牌。",
		hyyzxinghuo_info: "星火|锁定技，一名角色的装备牌因弃置进入弃牌堆后，你选择一项：<br>1.令该角色" + get.hyyzIntroduce('灼烧') + "。<br>2.将这些牌置于武将牌上并摸一张牌。<br>若该角色为你，你回复1点体力。",
		hyyztianhuo_info: "天火|觉醒技，准备阶段，若你武将牌上至少有三张“星火”牌，你减1点体力上限并获得〖红莲〗。",
		hyyzhonglian_info: "红莲|出牌阶段每名角色限一次，你可以展示一名角色的一张手牌，然后你可以弃置“星火”牌中与此牌花色相同的牌并对其造成1点火焰伤害。",

		hyyz_ren: ['刃', ["male", "hyyz_xt", 1, ["hyyzzhuchou", "hyyzhuiduo", "hyyztushang"], []], '#b哼', '弃身锋刃的剑客，原名不详。效忠于「命运的奴隶」，拥有可怖的自愈能力。手持古剑作战，剑身遍布破碎裂痕，正如其身，亦如其心。'],
		hyyzzhuchou: {
			audio: 2,
			mod: {
				cardname(card, player) {
					if (lib.card[card.name].type == 'basic' && get.color(card) == 'red') return 'juedou';
				},
			},
			trigger: {
				player: "useCard",
			},
			forced: true,
			filter(event, player) {
				return event.card.name == "juedou" && get.color(event.card) == 'red';
			},
			content() { },
		},
		hyyzhuiduo: {
			audio: 5,
			forced: true,
			group: ['hyyzhuiduo_init', 'hyyzhuiduo_dying', 'hyyzhuiduo_recover'],
			subSkill: {
				init: {
					trigger: {
						global: ["gameDrawAfter", "changeHp"]
					},
					direct: true,
					filter(event, player) {
						if (event.name == 'changeHp') {
							return player.hp <= 0 && player.hasSkill('hyyzhuiduo_mark');
						} else return true;
					},
					async content(event, trigger, player) {
						if (trigger.name == 'changeHp') {
							player.updateMark('hyyzhuiduo_mark');
						}
						else player.disableJudge();
					},
				},
				dying: {
					trigger: {
						player: ["dyingBefore"],

					},
					filter(event, player) {
						return player.hp <= 0;
					},
					forced: true,
					async content(event, trigger, player) {
						trigger.cancel();
						if (!player.hasSkill("hyyzhuiduo_mark")) player.addTempSkill("hyyzhuiduo_mark", { player: 'phaseEnd' });
						else player.say('还没结束！');
					},
				},
				recover: {
					trigger: {
						source: "damageEnd",
					},
					filter(event, player) {
						return player.hp < 1;
					},
					forced: true,
					async content(event, trigger, player) {
						game.hyyzSkillAudio('hyyz', 'hyyzhuiduo', 3, 4, 5)
						player.recover(trigger.num);
					},
				},
				mark: {
					marktext: "隳",
					intro: {
						markcount(storage, player) {
							return ('' + player.hp);
						},
						content: function (event, player) {
							return '你的体力值为' + get.translation(player.hp);
						},
					},
					forced: true,
					init(player) {
						game.log(player, "堕入<font color=#FF4500>魔阴身</font>");
						game.hyyzSkillAudio('hyyz', 'hyyzhuiduo', 1)
						player.markSkill('hyyzhuiduo_mark');
					},
					onremove(player) {
						if (player.hp < 1) {
							game.log(player, '<font color=#FF4500>泯灭人性</font>');
							player.die();
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzhuiduo', 2)
							game.log(player, '<font color=#FF4500>恢复人性</font>');
						}
					},
				},
			},
			ai: {
				nokeep: true,
			},
		},
		hyyztushang: {
			audio: 2,
			trigger: {
				source: "damageSource",
				player: "damageEnd",
			},
			usable: 3,
			forced: true,
			content() {
				player.draw(trigger.num).gaintag = ['hyyztushang'];
			},
			mod: {
				ignoredHandcard: function (card, player) {
					if (card.hasGaintag('hyyztushang')) {
						return true;
					}
				},
				cardDiscardable: function (card, player, name) {
					if (name == 'phaseDiscard' && card.hasGaintag('hyyztushang')) {
						return false;
					}
				},
			},
			ai: {
				maixie: true,
				"maixie_hp": true,
				effect: {
					player: function (card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							return [1, 0.8]
						}
					},
					target: function (card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							return [1, 0.8];
						}
					},
				},
				threaten: 0.6,
			},
		},
		hyyzzhuchou_info: "诛雠|锁定技，你的红色基本牌视为【决斗】。",
		hyyzhuiduo_info: "隳堕|锁定技，你没有判定区，且不会进入濒死状态。<br>若你的体力值小于1：<br>1.你造成伤害后恢复等量体力；<br>2.回合结束后你死亡。",
		hyyztushang_info: "荼殇|锁定技，每回合限三次，你造成或受到1点伤害后，摸一张牌且不计入手牌上限。",

		meng_sushang: ['素裳', ["female", "hyyz_xt", 4, ["mengshanqing", "mengyouren", "mengwuji"], []], '柚衣'],
		mengshanqing: {
			audio: 3,
			trigger: {
				player: "useCardToPlayer",
			},
			shaRelated: true,
			filter(event, player) {
				if (event.card.name != 'sha' || get.itemtype(event.cards) != 'cards') return false;
				return event.target.countGainableCards(player, 'he') > 0;
			},
			check(event, player) {
				return event.target.countGainableCards(player, 'he') > 0 && get.attitude(player, event.target) < 0;
			},
			frequent: "check",
			logTarget: "target",
			content() {
				'step 0'
				if (trigger.target.countGainableCards(player, 'e') > 0) {
					player.gainPlayerCard(trigger.target, 'e', true);
				} else if (trigger.target.countGainableCards(player, 'h') > 0) {
					player.gainPlayerCard(trigger.target, 'h', true);
				}
			},
			ai: {
				"unequip_ai": true,
				"directHit_ai": true,
				skillTagFilter(player, tag, arg) {
					if (tag == 'directHit_ai') return arg.card.name == 'sha' && arg.target.countCards('e', function (card) {
						return get.value(card) > 1;
					}) > 0;
					if (arg && arg.name == 'sha' && arg.target.getEquip(2)) return true;
					return false;
				},
			},
		},
		mengyouren: {
			audio: 3,
			trigger: {
				player: "useCardAfter",
			},
			check(event, player) {
				return get.attitude(player, event.targets[0]) < 0;
			},
			shaRelated: true,
			frequent: "check",
			forced: false,
			filter(event, player) {
				return event.card.name == 'sha' && get.itemtype(event.cards) == 'cards' && event.targets.length > 0;
			},
			content() {
				'step 0'
				var num = lib.skill.mengyouren.num(trigger);
				event.cards = get.cards(num);

				var list = [], reds = [], blacks = [];
				var dialog = ['游刃：弃置某种颜色的牌，视为对' + get.translation(trigger.targets) + '使用等量【杀】，然后获得剩余的牌'];
				for (var i of event.cards) {
					if (get.color(i) == 'red') reds.push(i);
					else if (get.color(i) == 'black') blacks.push(i);
				}
				if (reds.length > 0) {
					dialog.push('<div class="text center">红色牌</div>');
					dialog.push(reds);
					list.push('red');
				}
				if (blacks.length > 0) {
					dialog.push('<div class="text center">黑色牌</div>');
					dialog.push(blacks);
					list.push('black');
				}
				var bool = false;
				for (var i of trigger.targets) {
					if (i.isIn()) bool = true;
				}
				if (list.length && bool) {
					list.push('cancel2');
					player.chooseControl(list).set('dialog', dialog).set('ai', function () {
						if (blacks.length >= reds.length) return 'black';
						else return 'red' || _status.event.control;
					}).set('control', list);
				} else {
					event._result = { control: 'cancel2' };
				}
				'step 1'
				var gain = [];
				if (result.control == 'cancel2') {
					gain = event.cards;
				} else {
					var color = result.control;
					for (var i of event.cards) {
						if (get.color(i) == color) {
							for (var j of trigger.targets) {
								game.cardsDiscard(i);
								if (j.isIn() && player.canUse({ name: 'sha' }, j, false)) player.useCard({ name: 'sha', isCard: true }, j, false, 'noai');
							}
						}
						else gain.push(i);
					}
				}
				player.gain(gain, 'gain2');
			},
			num(event) {
				var num = 1;
				var str = '#g【游刃】：';
				for (var i of event.targets) {
					if (i.countCards('e') == 0) {
						str += '<li>' + get.translation(i) + '的装备区内没有牌';
						num++; break;
					}
				}
				for (var i of event.targets) {
					if (i.countCards('h') == 0) {
						str += '<li>' + get.translation(i) + '的手牌区内没有牌';
						num++; break;
					}
				}

				if (event.player.hasHistory('sourceDamage', function (evt) {
					return evt.card == event.card;
				})) {
					str += '<li>' + get.translation(event.card) + '造成过伤害';
					num++;
				}
				if (num <= 1) str != '没有任何条件满足'
				game.log(str);//游刃打印
				return num;
			},
		},
		mengwuji: {
			audio: 3,
			mod: {
				cardname(card, player, name) {
					if (get.type(card.name) == 'delay') return 'sha';
				},
			},
			ai: {
				skillTagFilter(player) {
					if (!player.countCards('h', function (card) {
						return get.type(card) == 'delay'
					})) return false;
				},
				respondSha: true,
			},
			trigger: {
				player: ["useCard1", "respond"],
			},
			firstDo: true,
			forced: true,
			filter(event, player) {
				return event.card.name == 'sha' && !event.skill &&
					event.cards.length == 1 && get.type(event.cards[0]) == 'delay';
			},
			content() { },
		},
		mengshanqing_info: "山倾|当你使用非虚拟【杀】指定目标时，若其装备区内有牌，你获得其装备区的一张牌，否则获得其一张手牌。",
		mengyouren_info: "游刃|你使用的非虚拟【杀】结算结束后，展示牌堆顶一张牌；每满足一项便多展示一张牌：<br> 1.目标角色装备区内没有牌。<br> 2.目标角色手牌区内没有牌。<br> 3.此【杀】造成过伤害。<br> 若目标角色存活，你可以弃置展示牌中一种颜色的所有牌，视为对其使用相同数量的【杀】；然后获得剩余的牌。",
		mengwuji_info: "武继|锁定技，你的延时类锦囊牌视为【杀】。",

		meng_wu_yvkong: ['驭空', ["female", "hyyz_xt", 3, ["mengtianque", "mengguanyun"], []], '梦海离殇'],
		mengtianque: {
			audio: 3,
			mark: true,
			markname: "鸣",
			intro: {
				content: "当前有#层“鸣弦号令”",
			},
			init: function (player) {
				player.storage.mengtianque = 0
			},
			trigger: {
				player: ["phaseZhunbeiBegin"],
				global: "damageBegin1",
			},
			"prompt2": function (event, player) {
				var str = '是否令' + get.translation(event.player) + '受到的伤害+1，然后回合结束移除一层“鸣弦号令”？'
				return event.name == 'damage' ? str : '是否增加两层“鸣弦号令”？'
			},
			frequent: function (event, player) {
				if (event.name == 'phaseZhunbei') return true;
				else return false;
			},
			check: function (event, player) {
				return event.name == 'phaseZhunbei' || get.attitude(player, event.player) < 0;
			},
			filter: function (event, player) {
				return event.name == 'damage' ? player.storage.mengtianque > 0 : player.storage.mengtianque == 0;
			},
			content: function () {
				if (trigger.name == 'damage') {
					trigger.num++;
					player.addTempSkill('mengtianque_remove');
				} else {
					player.storage.mengtianque += 2;
					player.syncStorage('mengtianque');
				}

			},
			subSkill: {
				remove: {
					onremove: function (player) {
						player.storage.mengtianque--;
						player.syncStorage('mengtianque');
					},
					sub: true,
				},
			},
		},
		mengguanyun: {
			audio: 2,
			trigger: {
				source: "damageEnd",
			},
			filter: function (event, player) {
				if (player.storage.mengtianque <= 0) return false;
				if (!event.player || !event.player.isIn()) return false;
				var evt = event.getParent('phaseUse');
				return event.player.countCards('he') > 0 && evt && evt.player == player;
			},
			logTarget: "player",
			check: function (event, player) {
				return get.attitude(player, event.player) < 0
			},
			content: function () {
				'step 0'
				player.discardPlayerCard(true, get.prompt('mengguanyun', trigger.player), 'he', trigger.player);
				player.draw();
			},
		},
		"mengtianque_info": "天阙|准备阶段，若你没有“鸣弦号令”，你获得两层“鸣弦号令”。当一名角色造成伤害时，你可以令此伤害+1；若如此做，当前回合结束时，你移除一层“鸣弦号令”。",
		"mengguanyun_info": "贯云|当你于出牌阶段对一名角色造成伤害后，若你有“鸣弦号令”，你弃置其一张牌，然后摸一张牌。",

		meng_wu_xier: ['希儿', ["female", "hyyz_xt", 3, ["mengluandie", "mengzaixian"], ['die:meng_xier']], '慕辞'],
		mengluandie: {
			audio: 5,
			logAudio: () => [
				`ext:忽悠宇宙/asset/meng/audio/mengluandie1.mp3`,
				`ext:忽悠宇宙/asset/meng/audio/mengluandie2.mp3`,
			],
			enable: "phaseUse",
			usable: 1,
			chooseButton: {
				dialog(event, player) {
					let list = [
						'　本回合使用【杀】造成的伤害+1　',
						'　本回合使用的【杀】不能被响应　',
						'　　　　　　摸三张牌　　　　　　',
						'　　本回合可以多使用XXX张杀　　',
					];
					for (var i = 0; i < list.length; i++) {
						list[i] = [i, list[i].replace(/XXX/g, player.hp + '')];
					}
					return ui.create.dialog(
						'【乱蝶】：请选择至多' + get.cnNumber(player.hp) + '项',
						[list.slice(0, 1), 'tdnodes'],
						[list.slice(1, 2), 'tdnodes'],
						[list.slice(2, 3), 'tdnodes'],
						[list.slice(3, 4), 'tdnodes'],
						'hidden'
					);
				},
				select: () => [1, _status.event.player.hp],
				check(button) {
					var player = _status.event.player;
					switch (button.link) {
						case 0: return player.countCards('h', 'sha') * 1.5 || player.hp >= 4;
						case 1: return player.countCards('h', 'sha') * 1.7 || player.hp >= 4;
						case 2: return 4 - player.countCards('h', 'sha') || player.hp >= 4;
						case 3: return player.countCards('h', 'sha') + 1 || player.hp >= 4;
					}
				},
				backup(links, player) {
					return {
						audio: 'mengluandie',
						filterCard: () => { return false },
						selectCard: -1,
						popname: false,
						async content(event, trigger, player) {
							for (let i of links) {
								game.log(player, '选择了', '#g【乱蝶】', '的', '#y选项' + get.cnNumber(i + 1, true));
								if (i != 2) player.addTempSkill('mengluandie_' + (i + 1));
								switch (i) {
									case 0: game.log(player, '本回合使用【杀】造成的伤害+1'); break;
									case 1: game.log(player, '本回合使用的【杀】不能被响应'); break;
									case 2: await player.draw(3); break;
									case 3: game.log(player, '本回合可以多使用' + get.cnNumber(player.hp) + '张杀'); break;
								}
							}
						},
					}
				},
			},
			ai: {
				threaten: 1.5,
				order(item, player) {
					if (player.countCards('h', 'tao') && player.isDamaged()) return 1;
					return 10;
				},
				result: {
					player: 10,
				},
			},
			subSkill: {
				"1": {
					charlotte: true,
					forced: true,
					logAudio: () => [
						`ext:忽悠宇宙/asset/meng/audio/mengluandie3.mp3`,
						`ext:忽悠宇宙/asset/meng/audio/mengluandie4.mp3`,
						`ext:忽悠宇宙/asset/meng/audio/mengluandie5.mp3`,
					],
					trigger: {
						source: "damageBegin1",
					},
					filter(event) {
						return event.card?.name == 'sha' && event.notLink();
					},
					content() {
						game.log(trigger.card, '造成的伤害+1');
						trigger.num++;
					},
					ai: {
						effect: {
							player: function (card, player, target) {
								if (card.name == 'sha') return [1, 2];
							},
						},
						damageBonus: true,
					},
				},
				"2": {
					trigger: {
						player: "useCard",
					},
					charlotte: true,
					forced: true,
					filter(event) {
						return event.card.name == 'sha';
					},
					content: function () {
						game.log(trigger.card, '不能被响应');
						trigger.directHit.addArray(game.players);
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter: function (player, tag, arg) {
							return arg.card.name == 'sha';
						},
					},
				},
				"4": {
					charlotte: true,
					forced: true,
					init(player) {
						player.storage.mengluandie_4 = player.hp
					},
					onremove: true,
					mod: {
						cardUsable(card, player, num) {
							if (card.name == 'sha') return num + player.storage.mengluandie_4;
						},
					},
				},
			},
		},
		mengzaixian: {
			audio: 2,
			trigger: {
				global: "phaseAfter",
			},
			frequent: true,
			filter: function (event, player) {
				return player.getStat('kill') > 0;
			},
			round: 1,
			content: function () {
				player.addTempSkill('mengzaixian_buff')
				player.insertPhase();
			},
			derivation: ["mengzaixian_buff"],
			group: ["mengzaixian_roundcount"],
		},
		mengzaixian_buff: {
			init: function (player) {
				game.log(player, '进入了增幅状态')
				player.recover();
				player.draw(player.hp);
			},
			charlotte: true,
			locked: true,
			onremove: function (player) {
				game.log(player, '退出了增幅状态');
			},
			ai: {
				unequip: true,
				"unequip_ai": true,
				skillTagFilter: function (player, tag, arg) {
					if (arg && arg.name == 'sha') return true;
					return false;
				},
			},
		},
		mengluandie_backup_info: '乱蝶|',
		mengluandie_info: "乱蝶|出牌阶段限一次，你可以选择至多X项（X为你当前的体力值）：<br>1.本回合使用【杀】造成的伤害+1。<br>2.本回合使用的【杀】不能被响应。<br>3.摸三张牌。<br>4.本回合可以多使用X张杀。",
		"mengzaixian_info": "再现|每轮限一次，每回合结束后，若你于本回合内杀死过角色，则你可以进行一个额外的回合并[增幅]至回合结束。",
		"mengzaixian_buff_info": "增幅|效果：获得此效果时回复一点体力并摸X张牌（X为你的体力值）；你使用的【杀】无视防具。",

		meng_bronya: ['布洛妮娅', ["female", "hyyz_xt", 3, ["mengzhenjun", "mengzhenqu", "mengjunzhen"], ['zhu',]], '微雨'],
		mengzhenjun: {
			audio: 2,
			trigger: {
				player: "phaseUseEnd",
			},
			filter(event, player) {
				return player.countCards('he') > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget('整军：是否令一名其他角色[净化]并其执行一个出牌阶段。', '若其未[净化]，其摸两张牌。', lib.filter.notMe)
					.set('ai', (target) => {
						if (get.attitude2(target) > 4) {
							var num = get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1)
							if (target.isTurnedOver()) num += 2;
							if (target.countCards('j') > 0) num++;
							if (target.isLinked()) num++;
							return num;
						}
						return false;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (target.canhyyzJinghua()) {
					target.hyyzJinghua();
				}
				else target.draw(2);
				var next = target.phaseUse();
				event.next.remove(next);
				trigger.getParent('phase').next.push(next);
			},
			ai: {
				expose: 0.5,
			},
		},
		mengzhenqu: {
			audio: 2,
			trigger: {
				global: "phaseUseBegin",
			},
			filter(event, player) {
				return player.countCards('he') && event.player != player;
			},
			round: 1,
			async cost(event, trigger, player) {
				const result = await player
					.chooseCard('he', [1, Infinity], '阵曲：是否交出牌，令' + get.translation(trigger.player) + '强命且首次造成的伤害+1')
					.set('ai', card => get.attitude2(trigger.player) * get.value(card))
					.set('prompt2', '交出的牌不能被响应')
					.forResult();
				event.result = result;
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.gain(event.cards, 'giveAuto').gaintag.add('mengzhenqu');
				await game.asyncDelay()
				player.drawTo(player.maxHp);
				trigger.player.addSkill('mengzhenqu_dir');
			},
			subSkill: {
				dir: {
					forced: true,
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						if (!event.card || !(get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name))) return false;
						return event.player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('mengzhenqu')) return true;
							}
							return false;
						});
					},
					content() {
						trigger.directHit.addArray(game.filterPlayer());
					},
				},
			},
		},
		mengjunzhen: {
			audio: 1,
			zhuSkill: true,
			unique: true,
			trigger: {
				global: "damageBegin1",
			},
			filter(event, player) {
				if (!event.card || !event.cards.length) return false;
				if (player.countCards('h') <= player.hp) return false;
				if (!player.hasZhuSkill('mengjunzhen')) return false;
				if (!event.source || event.source == player || event.source.group != 'hyyz_xt') return false;
				return event.source.hasHistory('gain', (evt) => {
					game.log(evt.cards, '+++', event.cards)
					return event.cards.some(card => evt.cards.includes(card))
				})
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseCard('h', player.countCards('h') - player.hp, '军阵：是否重铸一些牌令此牌伤害+1？')
					.set('ai', () => get.attitude2(trigger.source))
					.forResult();
				event.result = result;
			},
			logTarget: 'source',
			async content(event, trigger, player) {
				player.recast(event.cards);
				trigger.num++;
			},
		},
		"mengzhenjun_info": "整军|出牌阶段结束时，你可以令一名其他角色[净化]并执行一个出牌阶段。若其未[净化]，其摸两张牌。",
		"mengzhenqu_info": "阵曲|每轮限一次，其他角色的出牌阶段开始时，你可以交给其任意张牌并将手牌摸至体力上限，该角色使用这些牌不能被响应。",
		"mengjunzhen_info": "军阵|主公技，其他星铁势力的角色使用当前回合获得的牌造成伤害时，你可以重铸超出体力值的手牌并令此牌伤害+1。",

		meng_wu_ren: ['刃', ["male", "hyyz_xt", 4, ["mengwansi", "mengdibian", "mengenci"], []], '纤衣'],
		mengwansi: {
			audio: 2,
			logAudio: () => ["ext:忽悠宇宙/asset/meng/audio/mengwansi2.mp3"],
			trigger: {
				global: "roundStart",
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget('万死', '对一名角色造成1点伤害，然后将体力值调整至' + Math.ceil(player.maxHp / 2), true)
					.set('ai', (target) => get.damageEffect(target, player, player))
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				await event.targets[0].damage(player, 'nocard');
				var num = Math.ceil(player.maxHp / 2);
				if (player.hp > num) player.damage(player.hp - num);
				else if (num > player.hp) player.recover(num - player.hp);
			},
		},
		mengdibian: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			prompt: "对自己造成1点伤害，然后摸已损失体力值数量的牌，且本回合使用杀或普通锦囊牌指定的目标数上限+2。",
			async content(event, trigger, player) {
				await player.damage(1, player);
				await player.draw(player.getDamagedHp());
				player.addTempSkill('mengdibian_add');
			},
			subSkill: {
				add: {
					charlotte: true,
					trigger: {
						player: "useCard1",
					},
					filter(event, player) {
						var info = get.info(event.card, false);
						if (info.allowMultiple == false) return false;
						if (event.card.name != 'sha' && info.type != 'trick') return false;
						if (event.targets && !info.multitarget) {
							if (game.hasPlayer(function (current) {
								return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, player, current) && lib.filter.targetInRange(event.card, player, current);
							})) {
								return true;
							}
						}
						return false;
					},
					async cost(event, trigger, player) {
						var num = game.countPlayer(function (current) {
							return !trigger.targets.includes(current) && lib.filter.targetEnabled2(trigger.card, player, current) && lib.filter.targetInRange(trigger.card, player, current);
						});
						event.result = await player
							.chooseTarget('地变：是否为' + get.translation(trigger.card) + '增加' + (num > 1 ? '至多两个' : '一个') + '目标？', [1, Math.min(2, num)], function (card, player, target) {
								var trigger = _status.event.getTrigger();
								var card = trigger.card;
								return !trigger.targets.includes(target) && lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
							})
							.set('ai', function (target) {
								var player = _status.event.player;
								var card = _status.event.getTrigger().card;
								return get.effect(target, card, player, player);
							})
							.forResult();
					},
					logTarget: 'targets',
					async content(event, trigger, player) {
						player.logSkill('mengdibian')
						var targets = event.targets.sortBySeat();
						trigger.targets.addArray(targets);
					},
				},
			},
			ai: {
				order: 10,
				result: {
					player: function (player) {
						if (player.hp > 1 || player.countCards('hs', 'tao')) return 1;
					},
				},
			},
		},
		mengenci: {
			audio: 6,
			marktext: "赐",
			intro: {
				name: "恩赐",
				"name2": "赐",
				content: "当前有#枚“赐”",
			},
			trigger: {
				player: "damageEnd",
			},
			forced: true,
			async content(event, trigger, player) {
				if (player.countMark('mengenci') < 5) {
					player.addMark('mengenci', 1);
				}
				if (player.countMark('mengenci') > player.hp && trigger.source?.isIn()) {
					const bool = await player
						.chooseBool('是否对' + get.translation(trigger.source) + '造成1点伤害并恢复1点体力？').set('ai', function () {
							var player = _status.event.player, source = _status.event.source;
							if (source == player) return false;
							return -get.attitude(player, source);
						})
						.set('source', trigger.source)
						.forResultBool();
					if (bool) {
						player.logSkill(event.name, trigger.source)
						await trigger.source.damage('nocard');
						await player.recover();
					}
				}
			},
			group: "mengenci_damage",
			subSkill: {
				damage: {
					audio: 'mengenci',
					trigger: {
						source: "damageBegin1",
					},
					filter(event, player) {
						return player.countMark('mengenci') > 0 && event.num != player.countMark('mengenci');
					},
					"prompt2"(event, player) {
						var str = player.countMark('mengenci');
						return "是否移去所有“赐”令“" + get.translation(event.player) + "”受到的伤害改为" + str + "？"
					},
					check(event, player) {
						if (event.player == player) return false;
						return player.countMark('mengenci') > 1 && get.attitude(player, event.player) < 0;
					},
					content() {
						var num = player.countMark('mengenci');
						player.removeMark('mengenci', num);
						trigger.num = num;
					},
				},
			},
		},
		"mengwansi_info": "万死|锁定技，每轮开始时，对一名角色造成1点伤害，然后将体力值调整（回复或对自己造成伤害）至体力上限的一半（向上取整）。",
		"mengdibian_info": "地变|出牌阶段限一次，你可以对自己造成1点伤害，然后摸X张牌，且本回合使用【杀】或普通锦囊牌可以额外指定两个目标。X为你已损失的体力值。",
		"mengenci_info": "恩赐|①当你受到伤害后，获得一枚“赐”（至多为5）。若“赐”的数量大于你的体力值，你可以对伤害来源造成1点伤害并回复1点体力。<br>②你对其他角色造成伤害时，将伤害值改为“赐”的数量并移去所有的“赐”。",

	},
	2308: {
		hyyz_hua: ['华', ["female", "hyyz_b3", 3, ["hyyzcunjin", "hyyzshenyin", "hyyzfusheng"], []], '#b现在还不是绝望的时候<br>因为我来了', '符华，本名华，第一文明纪元抗崩坏组织“逐火之蛾”的十三英桀之一，位次“XII”，刻印为“浮生”。负责火种计划的先行者，第二文明纪元成为守护神州的仙人赤鸢。天穹峰事件中失去无敌的力量，和天命主教奥托达成交易，成为天命A级女武神。伪装身份成为圣芙蕾雅学园学生，琪亚娜所在班级的班长。因为奥托的背叛而死，临死前发动羽渡尘第零额定功率，将意识转移到一根羽毛身上，压制空之律者的存在。抛弃的身体则被奥托治好，其中诞生了律者的意识。'],
		hyyzcunjin: {
			audio: 11,
			trigger: {
				player: ["useCardAfter", "loseAfter", "gainAfter"],
			},
			filter(event, player) {
				switch (event.name) {
					case 'useCard': return player.countCards('he') > 0;
					case 'lose': return event.type == 'discard';
					case 'gain': return player.countCards('hs') > 0;
				}
			},
			direct: true,
			firstDo: true,
			frequent: true,
			async content(event, trigger, player) {
				switch (trigger.name) {
					case 'useCard': {
						player.chooseToDiscard('寸劲：弃置一张牌', 'he').set('ai', (card) => 8 - get.value(card)).set('logSkill', 'hyyzcunjin');
						break;
					}
					case 'lose': {
						const bool = await player.chooseBool('寸劲：摸一张牌？').set("frequentSkill", "hyyzcunjin").forResultBool();
						if (bool) {
							player.logSkill('hyyzcunjin')
							await player.draw();
						}
						break;
					}
					case 'gain': {
						player.chooseToUse('寸劲：使用一张牌').set('logSkill', 'hyyzcunjin');
						break;
					}
				}
			},
			ai: {
				threaten: function (player, target) {
					if (target.hp == 1) return 4;
					return 0.01;
				},
				effect: {
					target: function (card, player, target) {
						if (card.name == 'guohe') return [1, 2];
						if (get.type(card) == 'delay') return 0;
					},
				},
			},
		},
		hyyzshenyin: {
			audio: 1,
			trigger: {
				player: "useCard",
			},
			filter(event, player) {
				var list = [];
				player.getHistory('useCard', function (evt) {
					var type = get.type2(evt.card);
					list.add(type);
				})
				return list.length == player.maxHp;
			},
			forced: true,
			async content(event, trigger, player) {
				await player.gainMaxHp();
			},
			group: ['hyyzshenyin_recover'],
			subSkill: {
				recover: {
					audio: 'hyyzshenyin',
					trigger: {
						player: ["loseMaxHpAfter", "gainMaxHpAfter"],
					},
					forced: true,
					filter: function (event, player) {
						return event.num > 0;
					},
					async content(event, trigger, player) {
						await player.recover();
					},
				}
			}
		},
		hyyzfusheng: {
			audio: 5,
			trigger: {
				player: "phaseUseBefore"
			},
			forced: true,
			content: function () {
				player.say('此即，浮生之铭！');
				trigger.cancel();
			},
			group: 'hyyzfusheng_dying',
			subSkill: {
				dying: {
					audio: 'hyyzfusheng',
					trigger: {
						global: 'dying'
					},
					filter(event, player) {
						if (!event.source || !event.source.isIn() || event.source == event.player) return false;
						if (event.player != player && event.source != player) return false;
						return true;
					},
					forced: true,
					content() {
						player.loseMaxHp(player.maxHp - 1);
					},
				},
			},
			ai: {
				effect: {
					player: function (card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							if (target.hp == 1) return [1, -2];
						}
					}
				}
			}
		},
		hyyzcunjin_info: "寸劲|当你使用牌后，你可以弃置一张牌；<br>当你弃置牌后，你可以摸一张牌；<br>当你获得牌后，你可以使用一张牌。",
		hyyzshenyin_info: "神音|锁定技，当你使用牌时，若本回合使用牌的类型数等于体力上限，你加1点体力上限；你改变体力上限后，回复1点体力。",
		hyyzfusheng_info: "浮生|锁定技，你跳过出牌阶段；你令其他角色进入濒死时，或其他角色令你进入濒死时，你将体力上限减至1。",

		hyyz_bronya: ['布洛妮娅', ["female", "hyyz_xt", 3, ["hyyzceli", "hyyzchuxin"], ['zhu',]], '#b「让世界变得美好」', '贝洛伯格「大守护者」继承人，年轻干练的银鬃铁卫统领。<br>布洛妮娅从小接受着严格的教育，具备一名「继承人」所需的优雅举止与亲和力。<br>但在看到下层区的恶劣环境后，未来的最高决策者逐渐生出了疑惑…「我所受的训练，真的能带领人民过上他们想要的生活么？」'],
		hyyzceli: {
			audio: 4,
			init: (player) => player.storage.hyyzceli = [],
			trigger: {
				player: "phaseEnd",
			},
			filter(event, player) {
				return ["judge", "draw", "useCard", "discard"].some(name => !player.storage.hyyzceli.includes(name));
			},
			async cost(event, trigger, player) {
				const list = ["judge", "draw", "useCard", "discard"].filter(a => !player.storage.hyyzceli.includes(a));
				let str = `令一名其他角色[净化]并摸${list.length}张牌，然后依次执行`;
				const map = {
					'judge': '判定阶段',
					'draw': '摸牌阶段',
					'useCard': '出牌阶段',
					'discard': '弃牌阶段',
				}
				list.forEach(arr => {
					str += `“${map[arr]}”`
				});
				const result = await player.chooseTarget(str, lib.filter.notMe)
					.set('ai', function (target) {
						let player = _status.event.player, att = get.attitude(player, target);
						let arr = _status.event.list;
						let val = 0;
						if (target.canhyyzJinghua()) val += 2;
						if (arr.includes('draw')) val += 2;
						if (arr.includes('useCard') && target.countCards('hs', { name: 'sha' })) val += 2;
						if (arr.includes('discard') && target.needsToDiscard()) val -= target.needsToDiscard();
						return val * att;
					}).set('list', list).forResult();
				event.result = result;
				event.result.num = list.length;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				target.hyyzJinghua();
				await target.draw(event.num);
				let list = [];
				if (!player.storage.hyyzceli.includes('judge')) list.add('phaseJudge');
				if (!player.storage.hyyzceli.includes('draw')) list.add('phaseDraw');
				if (!player.storage.hyyzceli.includes('useCard')) list.add('phaseUse');
				if (!player.storage.hyyzceli.includes('discard')) list.add('phaseDiscard');
				target.insertPhase().set('phaseList', list);
			},
			group: "hyyzceli_add",
			subSkill: {
				add: {
					trigger: { player: ["judge", "drawBegin", "useCard", "discard"] },
					direct: true,
					forced: true,
					charlotte: true,
					async content(event, trigger, player) {
						player.storage.hyyzceli.add(trigger.name);
						player.when({
							global: 'phaseAfter'
						}).then(() => {
							player.storage.hyyzceli = [];
						})
					},
				},
			},
		},
		hyyzceli_info: `策励|回合结束后，若你本回合未进行
		<span class=firetext>判定</span>/
		<span class=thundertext>摸牌</span>/
		<span class=yellowtext>使用牌</span>/
		<span class=greentext>弃置牌</span>，你可令一名其他角色${get.hyyzIntroduce('净化')}并摸X张牌（X为你满足的条件数），然后该角色获得拥有
		<span class=firetext>判定</span>/
		<span class=thundertext>摸牌</span>/
		<span class=yellowtext>出牌</span>/
		<span class=greentext>弃牌</span>阶段的回合。`,
		hyyzchuxin: {
			audio: 5,
			locked: true,
			group: 'hyyzchuxin_audio',
			subSkill: {
				audio: {
					trigger: {
						player: "damageBegin4",
					},
					forced: true,
					async content(event, trigger, player) {
						if (player.hasHistory('lose', (evt) => evt.cards2 && evt.cards2.length)) {
							game.log('#g【初心】', player, '尝试找回初心');
							game.hyyzSkillAudio('hyyz', 'hyyzchuxin', 3, 4)
							var cards = [];
							player.hasHistory('lose', function (evt) {
								if (evt.cards2 && evt.cards2.length) {
									for (var i of evt.cards2) {
										var card = get.cardPile(function (card) {
											if (cards.includes(card)) return false;
											return get.type(card, 'trick') == get.type(i, 'trick');
										});
										if (card) cards.push(card);
									}
								}
							})
							if (cards.length) player.gain(cards, 'gain2');
						} else {
							game.log('#g【初心】', player, '初心未失，防止此伤害');
							game.hyyzSkillAudio('hyyz', 'hyyzchuxin', 1, 5, 2)
							trigger.cancel()
						}
					},
					ai: {
						effect: {
							target(card, player, target) {
								if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
								if (get.tag(card, 'damage')) {

									let lose = 0;
									target.hasHistory('lose', function (evt) {
										if (evt.cards2?.length) lose += evt.cards2.length;
									})
									if (lose <= 0) return 'zerotarget';
									else {
										let att = 1;
										if (get.attitude(player, target) > 0) {
											att = player.needsToDiscard() ? 0.7 : 0.5;
										}
										if (target.hp >= 4) return [1, att * lose];
										if (target.hp == 3) return [1, att * lose * 0.75];
										if (target.hp == 2) return [1, att * 0.25];
									}
								} else {
									return [1, 2]
								}
							},
						},
					},
				}
			}
		},
		hyyzchuxin_info: "初心|锁定技，当你受到伤害时，若你本回合未失去过牌，防止此伤害；否则，获得与失去牌等量且类型相同的牌。",

		hyyz_sushang: ['素裳', ["female", "hyyz_xt", 4, ["hyyzmengdong", "hyyzruoming", "hyyzhuangwu"], []], '#b本姑娘的名字将来也会和那些英雄一样，青史流传！', '单纯热心的云骑军新人，执一柄重剑。<br>憧憬着云骑军历史上的传奇，渴望成为响当当的人物。<br>为此，素裳坚决恪守「急人所急，有求必应；日行一善，三省吾身」的信条，过着助人为乐的忙碌日子。'],
		hyyzmengdong: {
			audio: 3,
			trigger: {
				player: 'phaseDrawEnd'
			},
			forced: true,
			content() { },
			mod: {
				cardname(card, player, target) {
					if (get.type(card.name, 'trick') == 'trick') return 'sha';
				},
				targetInRange(card) {
					if (!card.cards || card.name != 'sha' || !card.isCard) return;
					for (var i of card.cards) {
						if (get.type(i.name, 'trick') == 'trick') return true;
					}
				},
			},
		},
		"hyyzmengdong_info": "懵懂|锁定技，你的普通锦囊牌视为无距离限制的【杀】。",
		hyyzruoming: {
			audio: 3,
			trigger: {
				player: 'useCardBefore'
			},
			filter(event, player) {
				return event.card.name == 'sha' && event.getParent().name != 'hyyzhuangwu';
			},
			direct: true,
			async content(event, trigger, player) {
				const card = get.cards()[0];
				game.cardsGotoOrdering(card);
				let goon = true, type = get.type2(card);
				if (trigger.targets && trigger.targets.length > 0) {
					let att = get.attitude(player, trigger.targets[0]);
					if (type == 'trick' || card.name == 'sha') {
						if (player.canUse(card, trigger.targets[0], false)) {
							goon = att * get.effect(player, card, trigger.targets[0], player) > 0;
						}
					} else {
						if (player.canUse(card, player, false)) {
							goon = get.effect(player, card, player, player) >= 0;
						}
					};
				}
				const bool = await player.chooseBool()
					.set('prompt', `若明：是否将${get.translation(card)}加入${get.translation(trigger.card)}的实体牌？`)
					.set('ai', () => goon)
					.forResultBool();
				if (bool) {
					trigger.cards.add(card);
				} else {
					ui.cardPile.insertBefore(card.fix(), ui.cardPile.firstChild);
				}
				const cards = await player.chooseCard((card) => !trigger.cards.includes(card))
					.set('prompt', '若明：是否将一张手牌加入' + get.translation(trigger.card) + '的实体牌？')
					.set('ai', (card) => {
						let trigger = _status.event.getTrigger();
						return get.effect(trigger.targets[0], card, trigger.player, trigger.player);
					})
					.forResultCards();
				if (cards) {
					game.cardsGotoOrdering(cards[0]);
					trigger.cards.add(cards[0]);
				}
				if (bool && cards) {
					player.logSkill('hyyzruoming');
					game.log(trigger.card, '的实体牌改为', trigger.cards);
				}
			},
		},
		"hyyzruoming_info": "若明|当你非因〖恍悟〗使用【杀】时，你可以将牌堆顶的牌和一张手牌加入实体牌。",
		hyyzhuangwu: {
			audio: 3,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				if (event.card.name != 'sha' || get.itemtype(event.cards) != 'cards') return false;
				if (!event.cards.length) return false;
				return event.card.name == 'sha' && event.getParent().name != 'hyyzhuangwu';
			},
			forced: true,
			async content(event, trigger, player) {
				let cards = trigger.cards;
				const targets = trigger.targets;
				await player.showCards(get.translation(player) + '发动了【恍悟】', cards);
				do {
					let card = cards.shift();
					for (let target of targets) {
						if (target.isIn() && player.canUse(card, target, false)) {
							await player.useCard(card, target, false);
						} else if (player.canUse(card, player, false)) {
							await player.useCard(card, player, false);
						} else {
							await player.gain(card, 'gain2');
						}
					}
				} while (cards.length > 0);
			}
		},
		"hyyzhuangwu_info": "恍悟|锁定技，你非因〖恍悟〗使用【杀】后，对其中的实体牌依次执行首个可被执行的选项：<br>1.对目标角色使用。<br>2.对自己使用。<br>3.获得之。",


		meng_wu_nahida: ['纳西妲', ["female", "shen", 3, ["mengxukong", "menghuanmeng", "mengmoye"], []], '日玖阳气冲三关'],
		mengxukong: {
			audio: 1,
			trigger: {
				global: "useCardAfter",
			},
			frequent: true,
			filter(event, player) {
				return !player.getStorage('mengxukong').includes(event.card.name) &&
					(get.type(event.card, false) == 'trick' || get.type(event.card) == 'basic');
			},
			async content(event, trigger, player) {
				player.markAuto('mengxukong', [trigger.card.name]);
				game.log('【虚空】记录了', trigger.card.name)
			},
			onremove: true,
			intro: {
				name: "虚空",
				mark: function (dialog, content, player) {
					dialog.addText('虚空数据');
					if (player == game.me || player.isUnderControl()) {
						dialog.addSmall([player.getStorage('mengxukong'), 'vcard']);
					}
				},
				content: "已记录牌名：$",
			},
			group: ["mengxukong_add"],
			subSkill: {
				add: {
					trigger: {
						player: "phaseBegin",
					},
					async cost(event, trigger, player) {
						const dialog = [get.prompt('mengxukong')];
						let list1 = player.getStorage('mengxukong'), list2 = lib.inpile.filter(function (i) {
							return !list1.includes(i) && (get.type(i, false) == 'trick' || get.type(i) == 'basic');
						});
						if (list1.length) {
							dialog.addArray([
								'<div class="text center">已记录</div>',
								'<div class="text center">（可触发“唤梦”反转）</div>',
								[list1, 'vcard']
							])
						} else {
							dialog.addArray([
								'<div class="text center">——目前没有记录——</div>',
								'<div class="text center">（可触发“唤梦”反转）</div>'
							])
						}

						if (list2.length) {
							dialog.addArray([
								'<div class="text center">未记录</div>',
								'<div class="text center">（可触发“摩耶”防御）</div>',
								[list2, 'vcard']
							]);
						} else {
							dialog.addArray([
								'<div class="text center">——目前所有牌都被记录——</div>',
								'<div class="text center">（可触发“摩耶”防御）</div>'
							]);
						}
						const links = await player.chooseButton(dialog)
							.set('ai', function (button) {
								var player = _status.event.player, name = button.link[2];
								if (player.getStorage('mengxukong').includes(name)) {
									return -get.effect(player, { name: name }, player, player);
								}
								else {
									return get.effect(player, { name: name }, player, player) * (1 + player.countCards('hs', name));
								}
							})
							.forResultLinks();
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
						var name = event.cost_data.links[0][2];
						if (player.getStorage('mengxukong').includes(name)) {
							player.unmarkAuto('mengxukong', [name]);
							game.log(player, '从“虚空”中移除了', '#y' + get.translation(name));
						}
						else {
							player.markAuto('mengxukong', [name]);
							game.log(player, '向“虚空”中添加了', '#y' + get.translation(name));
						}
					},
				},
			},
		},
		menghuanmeng: {
			audio: 1,
			trigger: {
				global: "useCard1",
			},
			usable: 1,
			filter(event, player) {
				var target = event.target || event.targets[0];
				if (!target || !target.isIn()) return false;
				return player.getStorage('mengxukong').includes(event.card.name) &&
					(get.type(event.card, false) == 'trick' || get.type(event.card) == 'basic');
			},
			prompt(event, player) {
				var target = event.target || event.targets[0];
				event.player.line(target);
				return '唤梦：' + get.translation(event.player) + '对' + get.translation(event.target || event.targets[0]) + '使用' + get.translation(event.card) + '，是否交换目标和使用者？'
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0 && get.attitude(player, (event.target || event.targets[0])) > 0;
			},
			async content(event, trigger, player) {
				await player.draw();
				player.line([trigger.player, trigger.targets[0]]);
				game.log(player, '交换了', trigger.card, '的使用者（', trigger.player, '）和目标（', trigger.target || trigger.targets[0], '）');
				const user = trigger.target || trigger.targets[0];
				const targets = trigger.targets.slice(1);
				targets.unshift(trigger.player);
				trigger.player = user;
				trigger.targets = targets;
				trigger.target = trigger.player;
				user.line(targets, 'fire')
			},
		},
		mengmoye: {
			audio: 1,
			trigger: {
				target: "useCardToTarget",
			},
			forced: true,
			filter: function (event, player) {
				if (event.player == player) return false;
				return !player.getStorage('mengxukong').includes(event.card.name) &&
					(get.type(event.card, false) == 'trick' || get.type(event.card) == 'basic');
			},
			content: function () {
				game.log(trigger.card, '对', player, '无效');
				player.markAuto('mengxukong', [trigger.card.name]);
				trigger.targets.remove(player);
			},
		},
		"mengxukong_info": "虚空当一张基本牌或普通锦囊牌使用后，若“虚空”中未记录此牌名，你可以记录此牌名。回合开始时，你可以在“虚空”中增加或移除一种牌名。",
		"menghuanmeng_info": "唤梦每回合限一次，一名角色使用“虚空”中记录的牌时，你可以摸一张牌并交换此牌的使用者和首个目标角色。",
		"mengmoye_info": "摩耶锁定技，每回合限一次。当你成为其他角色使用基本牌或普通锦囊牌的目标时，若“虚空”中未记录此牌名，你记录此牌名并取消之。",

		meng_jiepade: ['杰帕德', ["male", "hyyz_xt", 4, ["mengyuhan", "mengjianyi", "mengjueyi"], []], '流萤一生推', ''],
		mengyuhan: {
			audio: 2,
			trigger: {
				source: "damageSource",
			},
			filter: function (event, player) {
				return event.player && event.player.isIn();
			},
			forced: true,
			logTarget: "player",
			content: function () {
				'step 0'
				trigger.player.judge(function (card) {
					var color = get.color(card);
					if (color == 'black') return 4;
					return 0;
				});
				'step 1'
				if (result.color == 'black') {
					trigger.player.addhyyzBuff('hyyzBuff_dongjie');
					player.draw();
				}
			},
		},
		mengjianyi: {
			audio: 5,
			logAudio: () => [
				'ext:忽悠宇宙/asset/meng/audio/mengjianyi1.mp3'
			],
			enable: "phaseUse",
			usable: 1,
			"prompt2": "令任意名角色将护甲补充至2，并获得〖坚毅〗",
			filterCard(card) {
				for (var i of ui.selected.cards) {
					if (get.suit(i) == get.suit(card)) return false;
				}
				return true;
			},
			complexSelect: true,
			complexCard: true,
			complexTarget: true,
			selectCard: [1, 4],
			filterTarget: true,
			position: "he",
			selectTarget() {
				return ui.selected.cards.length;
			},
			targetprompt(target) {
				var num = Math.ceil(_status.event.player.maxHp / 2);
				if (target.hujia >= num) return "护甲不变"
				else return "护甲+" + (num - target.hujia);
			},
			check: function (card) {
				var player = _status.event.player;
				var num = game.countPlayer(function (current) {
					if (get.attitude(player, current) > 0) {
						if (current == player && player.hujia < Math.ceil(player.maxHp / 2)) return true;
						if (!current.hasSkill('mengjianyi_buff')) return true;
						if (current.hp + current.hujia < 3) return true;
					}
				});
				if (num > 0) {
					if (ui.selected.cards.length < num) return 10 - get.value(card) && (get.type(card) == 'equip' || true);
				}
				return -1;
			},
			async content(event, trigger, player) {
				let num = Math.ceil(player.maxHp / 2);
				for (let target of event.targets) {
					if (target.hujia < num) await target.changeHujia(num - target.hujia);
					await target.addSkills('mengjianyi_buff');
				}
			},
			derivation: ["mengjianyi_buff"],
			ai: {
				order: 8,
				result: {
					target: function (player, target) {
						if (get.attitude(player, target) > 0) {
							if (target == player && player.hujia < Math.ceil(player.maxHp / 2)) return 3;
							if (!target.hasSkill('mengjianyi_buff')) return 3;
							if (target.hujia + target.hp < 3) return 2;
							return 0;
						}

					},
				},
			},
		},
		mengjueyi: {
			audio: 2,
			enable: "chooseToUse",
			mark: true,
			skillAnimation: true,
			animationStr: "决意",
			limited: true,
			animationColor: "water",
			filter: function (event, player) {
				return event.type == 'dying' && player == event.dying;
			},
			content: function () {
				'step 0'
				player.awakenSkill('mengjueyi');
				if (player.hp < 1) player.recover(1 - player.hp);
				'step 1'
				player.changeHujia(2);
				player.addSkill('mengjianyi_buff');
				'step 2'
				var cards = [];
				for (var i of lib.suit) {
					var card = get.cardPile2(function (card) {
						return get.suit(card, false) == i;
					});
					if (card) cards.push(card);
				}
				if (cards.length) player.gain(cards, 'gain2');
			},
			ai: {
				order: 1,
				skillTagFilter: function (player, arg, target) {
					if (player != target || player.storage.mengjueyi) return false;
				},
				save: true,
				result: {
					player: function (player) {
						if (player.hp <= 0) return 10;
						return 0;
					},
				},
				threaten: function (player, target) {
					if (!target.storage.mengjueyi) return 0.6;
				},
			},
			intro: {
				content: "limited",
			},
			init: function (player, skill) {
				player.storage[skill] = false;
			},
		},
		"mengjianyi_buff": {
			audio: 'mengjianyi',
			logAudio: () => false,
			init: function (player) {
				game.log('#g【坚毅】', player, '被赋予〖坚毅〗');
				player.disableEquip('equip1');
				player.disableEquip('equip2');
				player.disableEquip('equip3');
				player.disableEquip('equip4');
				player.disableEquip('equip5');
				player.disableJudge();
				player.when('changeHujiaAfter').filter(() => !player.hujia).then(() => player.removeSkill('mengjianyi_buff'))
			},
			onremove: function (player) {
				game.log('#g【坚毅】', player, '被移除〖坚毅〗');
				player.enableEquip('equip1');
				player.enableEquip('equip2');
				player.enableEquip('equip3');
				player.enableEquip('equip4');
				player.enableEquip('equip5');
				player.enableJudge();
			},
			mark: true,
			marktext: "🔰",
			intro: {
				name: "坚毅",
				content: "锁定技，获得/失去此技能时，你废除/恢复装备区和判定区。<br>①1.摸牌阶段，你多摸一张牌。<br>2.你的手牌上限+1，使用【杀】的次数上限+1，攻击范围+1。<br>3.当你受到伤害时，此伤害改为1。<br>4.当你失去所有护甲后，失去此效果。",
			},
			trigger: {
				player: ["damageBegin3", "phaseDrawBegin2"],
			},
			forced: true,
			charlotte: true,
			filter(event, player) {
				return event.name == 'damage' || !event.numFixed;
			},
			content() {
				if (trigger.name == 'damage') {
					if (player.name == 'meng_jiepade') {
						game.hyyzSkillAudio('meng', 'mengjianyi', 4, 5)
					} else {
						game.hyyzSkillAudio('meng', 'mengjianyi', 3)
					}
					trigger.num = 1
				} else {
					game.hyyzSkillAudio('meng', 'mengjianyi', 2)
					trigger.num++;
				}
			},
			mod: {
				attackFrom: function (from, to, distance) {
					if (from.hujia > 0) return distance - 1;
				},
				cardUsable: function (card, player, num) {
					if (card.name == 'sha') return num + 1;
				},
				maxHandcard: function (player, num) {
					return num + 1;
				},
			},
		},
		"mengyuhan_info": "余寒|锁定技，当你造成伤害后，令目标角色进行判定。若结果为黑色，你摸一张牌且目标角色[冻结]。",
		"mengjianyi_info": "坚毅|出牌阶段限一次，你可以弃置任意张花色不同的牌，令等量的角色将护甲补充到X（X为你体力上限的一半向上取整）并获得[坚毅]。",
		"mengjueyi_info": "决意|限定技，当你进入濒死状态后，你可以将体力值回复至1并获得2点护甲，获得〖坚毅〗，然后从牌堆获得四张花色不同的牌。",
		"mengjianyi_buff_info": "坚毅|效果：获得/失去此效果时，你废除/恢复装备区和判定区。<br>1.摸牌阶段，你多摸一张牌。<br>2.你的手牌上限+1，使用【杀】的次数上限+1，攻击范围+1。<br>3.当你受到伤害时，此伤害改为1。<br>4.当你受到伤害后，若你没有护甲，失去此效果。",

		meng_xierde: ['希尔德', ["female", "hyyz_other", 3, ["menghengyue", "mengguanyang"], []], '屺', ''],
		menghengyue: {
			audio: 1,
			mod: {
				attackRangeBase(player) {
					if (player.getEquip(1)) return 2;
				},
				globalFrom(from, to, distance) {
					if (_status.currentPhase == from) {
						return distance - from.storage.menghengyue1;
					}
				},
			},
			init(player) {
				player.storage.menghengyue = [];
				player.storage.menghengyue1 = 0;
			},
			intro: {
				name: "横跃",
				content: "已记录花色：$",
				onunmark: true,
			},
			forced: true,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				var suit = get.suit(event.card);
				if (!lib.suit.includes(suit)) return false;
				if (player.storage.menghengyue && player.storage.menghengyue.includes(suit)) return false;
				return _status.currentPhase == player;
			},
			content() {
				'step 0'
				player.markAuto('menghengyue', [get.suit(trigger.card)]);
				player.storage.menghengyue1++;
				player.syncStorage('menghengyue1');
				'step 1'
				var players = game.filterPlayer((current) => current != player && get.distance(player, current) == 1 && current.countCards('he') > 0);
				if (players.length > 0) {
					if (players.length > 1) player.chooseTarget(true, '横跃', '获得其一张牌，然后摸一张牌并交给其一张牌', function (card, player, target) {
						return target != player && get.distance(player, target) == 1 && target.countCards('he');
					}).set('ai', function (target) {
						return -get.attitude(_status.event.player, target) * Math.sqrt(1 + target.countCards('he'));
					});
					else event._result = { bool: true, targets: players }
				} else {
					game.log('#g【横跃】', '没有距离为1且有牌的其他角色');
					event.finish();
				}
				'step 2'
				event.target = result.targets[0];
				if (event.target.countCards('he')) player.gainPlayerCard(event.target, true, 'he');
				player.draw();
				player.chooseCard(true, '交给' + get.translation(event.target) + '一张牌', 'he');
				'step 3'
				event.target.gain(result.cards, player, 'giveAuto');
			},
			group: "menghengyue_summer",
			subSkill: {
				summer: {
					trigger: {
						player: "phaseAfter",
					},
					silent: true,
					filter: function (event, player) {
						return player == _status.currentPhase;
					},
					content: function () {
						player.storage.menghengyue = [];
						player.storage.menghengyue1 = 0;
						player.unmarkSkill('menghengyue')
					},
					forced: true,
					popup: false,
					sub: true,
				},
			},
		},
		mengguanyang: {
			audio: 1,
			enable: "chooseToUse",
			filter: function (event, player) {
				return player.storage.menghengyue1 && player.storage.menghengyue1 > 0 && player.countCards('he') >= player.storage.menghengyue1;
			},
			filterCard: true,
			selectCard: function () {
				return _status.event.player.storage.menghengyue1
			},
			usable: 1,
			position: "hes",
			viewAs: {
				name: "sha",
				storage: {
					mengguanyang: true,
				},
			},
			check: function (card) {
				var player = _status.event.player;
				return 7 - get.useful(card);
			},
			precontent: function () {
				event.getParent().addCount = false;
			},
			mod: {
				targetInRange: function (card) {
					if (card.storage && card.storage.mengguanyang) return true;
				},
				cardUsable: function (card, player, num) {
					if (card.storage && card.storage.mengguanyang) return Infinity;
				},
			},
			group: ["mengguanyang_shan", "mengguanyang_used"],
			subSkill: {
				shan: {
					trigger: {
						player: "useCardToPlayered",
					},
					filter: function (event, player) {
						return event.target.hp >= player.hp && event.card && event.card.storage.mengguanyang && event.card.name == 'sha' && !event.getParent().directHit.includes(event.target);
					},
					direct: true,
					popup: false,
					content: function () {
						"step 0"
						player.logSkill('mengguanyang', trigger.target);
						game.log('#g【贯杨】', '此杀需要两张闪才能抵消');
						"step 1"
						var id = trigger.target.playerid;
						var map = trigger.getParent().customArgs;
						if (!map[id]) map[id] = {};
						if (typeof map[id].shanRequired == 'number') {
							map[id].shanRequired++;
						}
						else {
							map[id].shanRequired = 2;
						}
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter: function (player, tag, arg) {
							if (arg.card.name != 'sha' || arg.target.countCards('h', 'shan') > 1) return false;
						},
					},
					sub: true,
				},
				used: {
					trigger: {
						player: "useCardAfter",
					},
					charlotte: true,
					direct: true,
					filter: function (event, player) {
						if (!event.card.storage || !event.card.storage.mengguanyang) return false;
						return game.hasPlayer(function (current) {
							return current.hasHistory('damage', evt => evt.card == event.card) && get.distance(player, current) == 1;
						})
					},
					content: function () {
						'step 0'
						var targets = game.filterPlayer(current => {
							return current.hasHistory('damage', evt => evt.card == trigger.card)
								&& get.distance(player, current) == 1;
						});
						player.logSkill('mengguanyang', targets);
						for (var i of targets) {
							if (i.countCards('h') > i.hp) {
								i.addhyyzBuff('hyyzBuff_jiansu')
							}
						}
					},
					sub: true,
				},
			},
			ai: {
				yingbian: function (card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0, hit = false;
					if (get.cardtag(card, 'yingbian_hit')) {
						hit = true;
						if (targets.filter(function (target) {
							return target.hasShan() && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.nature(card)) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_all')) {
						if (game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_damage')) {
						if (targets.filter(function (target) {
							return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan() || player.hasSkillTag('directHit_ai', true, {
								target: target,
								card: card,
							}, true)) && !target.hasSkillTag('filterDamage', null, {
								player: player,
								card: card,
								jiu: true,
							})
						})) base += 5;
					}
					return base;
				},
				canLink: function (player, target, card) {
					if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
					if (target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
						target: target,
						card: card,
					}, true)) return false;
					if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				order: function (item, player) {
					if (player.hasSkillTag('presha', true, null, true)) return 10;
					if (lib.linked.includes(get.nature(item))) {
						if (game.hasPlayer(function (current) {
							return current != player && current.isLinked() && player.canUse(item, current, null, true) && get.effect(current, item, player, player) > 0 && lib.card.sha.ai.canLink(player, current, item);
						}) && game.countPlayer(function (current) {
							return current.isLinked() && get.damageEffect(current, player, player, get.nature(item)) > 0;
						}) > 1) return 3.1;
						return 3;
					}
					return 3.05;
				},
				result: {
					target: function (player, target, card, isLink) {
						var eff = function () {
							if (!isLink && player.hasSkill('jiu')) {
								if (!target.hasSkillTag('filterDamage', null, {
									player: player,
									card: card,
									jiu: true,
								})) {
									if (get.attitude(player, target) > 0) {
										return -7;
									}
									else {
										return -4;
									}
								}
								return -0.5;
							}
							return -1.5;
						}();
						if (!isLink && target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
							target: target,
							card: card,
						}, true)) return eff / 1.2;
						return eff;
					},
				},
				respond: 1,
				respondShan: 1,
				damage: function (card) {
					if (card.nature == 'poison') return;
					return 1;
				},
				natureDamage: function (card) {
					if (card.nature) return 1;
				},
				fireDamage: function (card, nature) {
					if (card.nature == 'fire') return 1;
				},
				thunderDamage: function (card, nature) {
					if (card.nature == 'thunder') return 1;
				},
				poisonDamage: function (card, nature) {
					if (card.nature == 'poison') return 1;
				},
			},
		},
		"menghengyue_info": "横跃|锁定技，若你的武器栏内有牌，你的攻击范围视为2。当你于出牌阶段内首次使用一种花色的牌后，你获得距离为1的其他角色的一张牌，然后摸一张牌并交给其一张牌；若如此做，本回合你计算与其他角色的距离-1。",
		"mengguanyang_info": "贯杨|出牌阶段限一次，你可以将X张牌当一张无距离和次数限制的【杀】对一名其他角色使用（X为本回合发动“横跃”的次数）。若该角色的体力值不小于你，其须使用两张【闪】响应此【杀】；此【杀】造成伤害后，若你与该角色的距离为1，你令其[减速]。",

		meng_wu_tingyun: ['停云', ["female", "hyyz_xt", 3, ["shenfuyao", "shencifu", "shenyidao"], ["die:meng_tingyun",]], '纣王', ''],
		shenfuyao: {
			audio: 'mengfuyao',
			//nobracket: true,
			trigger: {
				global: "damageEnd",
			},
			filter(event, player) {
				return player.countCards('he') > 0 && player.canUse({ name: 'sha', nature: 'thunder', isCard: true }, event.player, false) && event.player.isIn();
			},
			usable: 1,
			async cost(event, trigger, player) {
				event.result = await player
					.chooseToDiscard('he', '是否弃置一张牌，视为对' + get.translation(trigger.player) + '使用一张雷【杀】？')
					.set('ai', function (card) {
						let trigger = _status.event.getTrigger();
						if (get.effect(trigger.player, { name: 'sha', nature: 'thunder', isCard: true }, player, player) > 0) {
							return 8 - get.value(card);
						}
					})
					.forResult()
			},
			async content(event, trigger, player) {
				let next = player.useCard({ name: 'sha', nature: 'thunder', isCard: true }, trigger.player, false);
				if (trigger.source?.hasSkill('shencifu_cifu')) {
					next.customArgs = { default: {}, };
					next.customArgs[trigger.player.playerid] = { extraDamage: 1 }
				}
				await next;
			},
		},
		shencifu: {
			audio: 'mengcifu',
			//nobracket: true,
			trigger: {
				player: "phaseUseBegin",
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget('赐福：转移标记并增加3枚“祝愿”').set('ai', function (target) {
					return get.attitude2(target);
				}).forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				event.targets[0].addSkills('shencifu_cifu');
				event.targets[0].addMark('shencifu_cifu', 3);
			},
			subSkill: {
				cifu: {
					audio: 'mengcifu_cifu',
					name: "赐福",
					mark: true,
					marktext: "赐福",
					intro: {
						name: "赐福",
						"name2": "祝愿",
						content: "你成为停云赐福的对象<br>剩余#枚“祝愿”",
					},
					trigger: { player: "useCard1" },
					filter(event, player) {
						if (get.type(event.card) == 'equip' || get.type(event.card) == 'delay' || event.card.name == 'shan') return false;
						return player.countMark('shencifu_cifu');
					},
					"filter1": function (event, player) {
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
					"filter2": function (event, player) {
						if (!get.tag(event.card, 'damage') && !get.tag(event.card, 'recover')) return false;
						return player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('shenyidao')) return false;
							}
							return true;
						});
					},
					async cost(event, trigger, player) {
						let list = [];
						if (lib.skill.shencifu_cifu.filter1(trigger, player)) list.add('为' + get.translation(trigger.card) + '多选择一个目标');
						if (lib.skill.shencifu_cifu.filter2(trigger, player)) list.add('令' + get.translation(trigger.card) + '的伤害值与回复量+1');
						const index = await player
							.chooseControlList('赐福：是否弃置一枚“祝愿”并选择一项', list)
							.set('ai', () => {
								var player = _status.event.player;
								var trigger = _status.event.getTrigger();
								let a = 0, b = 0;
								game.findPlayer(current => {
									if (!trigger.targets.includes(current) && lib.filter.targetEnabled2(trigger.card, player, current) && lib.filter.targetInRange(trigger.card, player, current)) {
										if (get.effect(current, trigger.card, player, player) > a) {
											a = get.effect(current, trigger.card, player, player);
										}
									}
								});
								b = get.effect(trigger.targets[0], trigger.card, player, player);
								if (a >= b) return 0;
								return 1;
							})
							.forResult('index');
						if (index != undefined) event.result = {
							bool: true,
							cost_data: { index: index },
						}
					},
					async content(event, trigger, player) {
						player.removeMark('shencifu_cifu', 1);
						if (event.cost_data.index == 0) {
							const targets = await player
								.chooseTarget('请选择' + get.translation(trigger.card) + '的额外目标', function (card, player, target) {
									let trigger = _status.event.getTrigger();
									if (trigger.targets.includes(target)) return false;
									return lib.filter.targetEnabled2(trigger.card, trigger.player, target) && lib.filter.targetInRange(trigger.card, player, target);
								}).set('ai', function (target) {
									let trigger = _status.event.getTrigger();
									let player = _status.event.player;
									return get.effect(target, trigger.card, player, player);
								})
								.forResultTargets();
							if (targets) {
								player.line(targets, 'fire');
								trigger.targets.addArray(targets);
							}
						} else {
							trigger.baseDamage++;
						};
						await game.delayx()
						player
							.when({
								source: 'damageSource'
							})
							.filter((event, player) => event.card == trigger.card && player.hasSkill('shencifu_cifu'))
							.then(() => {
								let targets = game.filterPlayer(i => i.hasSkill('shencifu'));
								targets.add(player);
								game.asyncDraw(targets);
							})
					},
				},
			},
		},
		shenyidao: {
			audio: 'mengyidao',
			//nobracket: true,
			enable: "phaseUse",
			usable: 1,
			filter(card, player) {
				return player.countCards('h') > 0;
			},
			filterCard: true,
			filterTarget: true,
			check(card) {
				return 7 - get.value(card);
			},
			async content(event, trigger, player) {
				await player.turnOver();
				const target = event.targets[0];
				var cards = [];
				for (var i = 0; i < 3; i++) {
					var card = get.cardPile(function (card) {
						return !cards.includes(card) &&
							(card.name == 'sha' || (get.type(card) == 'trick' && get.tag(card, 'damage') > 0));
					});
					if (card) cards.add(card);
				}
				if (cards) {
					await target.gain(cards, 'gain2').gaintag.add('shenyidao');
					target.addSkill('shenyidao_dir');
				}
			},
			subSkill: {
				dir: {
					trigger: {
						player: "useCard",
					},
					forced: true,
					filter: function (event, player) {
						if (!event.card || !(get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name))) return false;
						return event.player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('shenyidao')) return true;
							}
							return false;
						});
					},
					content() {
						trigger.directHit.addArray(game.filterPlayer());
					},
					mod: {
						targetInRange: function (card, player, target) {
							if (!card.cards) return;
							for (var i of card.cards) {
								if (i.hasGaintag('shenyidao')) return true;
							}
						},
						cardUsable: function (card, player, target) {
							if (!card.cards) return;
							for (var i of card.cards) {
								if (i.hasGaintag('shenyidao')) return Infinity;
							}
						},
						aiOrder: function (player, card, num) {
							if (get.itemtype(card) == 'card' && card.hasGaintag('shenyidao')) return num + 0.5;
						},
					},
					ai: {
						"directHit_ai": true,
					},
				},
			},
			ai: {
				order: 10,
				result: {
					target: 4,
					player: -2,
				}
			}
		},
		"shenfuyao_info": "扶摇|每回合限一次，一名角色受到伤害后，你可以弃一张牌视为对其使用一张雷【杀】；若伤害来源有“赐福”标记，此杀伤害+1。 ",
		"shencifu_info": "赐福|出牌阶段开始时，你将“赐福”标记转移给一名角色并令其获得三枚“祝愿”。<br>有“赐福”标记的角色使用基本牌或普通锦囊时，其可以弃置一枚“祝愿”并选择一项：<br>1.为此牌额外指定一个目标。<br>2.令此牌的伤害值与回复值+1。<br>若如此做，此牌造成伤害后，你与有“赐福”标记的角色各摸一张牌。",
		"shenyidao_info": "仪祷|出牌阶段限一次，你可以弃置一张手牌并选择一名角色。你翻面并令其获得三张【杀】或伤害类普通锦囊牌。该角色使用以此法获得的牌无距离和次数限制、不能被响应且该角色不能对此牌执行“赐福”②。",

		meng_tingyun: ['停云', ["female", "hyyz_xt", 3, ["mengfuyao", "mengcifu", "mengyidao"], []], '纣王', ''],
		mengfuyao: {
			audio: 1,
			trigger: {
				global: "damageEnd",
			},
			frequent: true,
			usable: 2,
			filter(event, player) {
				if (event.player == player || event.source && event.source == player) return true;
				if (player.storage.mengcifu && (
					event.player == player.storage.mengcifu || event.source && event.source == player.storage.mengcifu
				)) return true;
				return false;
			},
			async content(event, trigger, player) {
				await player.draw();
				if (player.storage.mengcifu && player != player.storage.mengcifu) player.storage.mengcifu.draw();
			},
		},
		mengcifu: {
			audio: 4,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengcifu1.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengcifu2.mp3",
			],
			mark: true,
			marktext: "赐福",
			intro: {
				name: "被赐福的角色",
				mark: function (dialog, content, player) {
					dialog.add([content]);
					dialog.addText(get.translation(content.name));
				},
			},
			trigger: {
				global: "phaseBefore",
				player: ["enterGame", "phaseUseBegin"],
			},
			filter(event, player) {
				if (event.name == 'phaseUseBegin') return true;
				return (event.name != 'phase' || game.phaseNumber == 0)
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget('是否更改赐福目标？')
					.set('ai', function (target) {
						return get.attitude(_status.event.player, target) > 4 &&
							(get.threaten(target) / Math.sqrt(target.hp + 1) / Math.sqrt(target.countCards('h') + 1) > 0);;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				player.storage.mengcifu = event.targets[0];
			},
			group: "mengcifu_cifu",
			subSkill: {
				cifu: {
					audio: 'mengcifu',
					logAudio: () => [
						"ext:忽悠宇宙/asset/meng/audio/mengcifu3.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengcifu4.mp3",
					],
					trigger: {
						global: "useCardToPlayered",
					},
					filter(event, player) {
						if (player.storage.mengcifu != event.player) return false;
						if (!player.countCards('he')) return false;
						return (get.type(event.card) == 'basic' || get.type(event.card) == 'trick') && event.targets.length == 1;
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseToDiscard('是否弃置一张牌令' + get.translation(trigger.player) + '强化' + get.translation(trigger.card) + '？')
							.set('ai', function (card) {
								var trigger = _status.event.getTrigger();
								if (get.tag(trigger.card, 'damage') > 0 ||
									trigger.card.name == 'tao' && trigger.player.getDamagedHp() > 1) return 8 - get.value(card);
							})
							.forResult();
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						let list = ['不能被响应'];
						if (get.tag(trigger.card, 'damage') || get.tag(trigger.card, 'recover')) {
							list.add('伤害值与回复量+1')
						};
						const control = await trigger.player
							.chooseControl(list)
							.set('ai', function () {
								var trigger = _status.event.getTrigger();
								if (trigger.card.name == 'tao' && trigger.player.getDamagedHp() > 1) return list[list.length - 1]
								return Math.random() < 0.8 ? list[0] : list[list.length - 1];
							})
							.forResultControl();
						if (control.startsWith('不能')) {
							player.popup('强命');
							trigger.getParent().directHit.addArray(game.filterPlayer());
						} else {
							player.popup('强化');
							trigger.targets[0].addTempSkill('mengcifu_add');
							trigger.targets[0].storage.mengcifu_add = trigger.card;
						}
					},
				},
				add: {
					onremove: true,
					trigger: {
						player: ["damageBegin1", "recoverBegin"],
					},
					filter(event, player) {
						return player.storage.mengcifu_add == event.card;
					},
					silent: true,
					charlotte: true,
					content() {
						player.logSkill('mengcifu', player.storage.mengcifu)
						trigger.num++;
					},
				},
			},
		},
		mengyidao: {
			audio: 2,
			trigger: {
				player: "phaseJieshuBegin",
			},
			filter: function (event, player) {
				return player.countCards('he') > 0
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCardTarget({
					prompt: get.prompt('mengyidao'),
					prompt2: `弃置一张牌，令一名角色摸一张牌${player.storage.mengcifu && player.storage.mengcifu != player ? '或令' + get.translation(player.storage.mengcifu) + '摸三张牌' : ''}`,
					filterCard: true,
					position: 'he',
					filterTarget: true,
					ai1(card) {
						return 7 - get.value(card);
					},
					ai2(target) {
						var att = get.attitude(_status.event.player, target);
						if (target == _status.event.player.storage.mengcifu && target != player) att *= 3;
						return att;
					}
				}).forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				await player.discard(event.cards);
				if (event.targets[0] == player.storage.mengcifu && event.targets[0] != player) event.targets[0].draw(3);
				else event.targets[0].draw()
			},
		},
		"mengfuyao_info": "扶摇|每回合限两次，当你或“赐福”角色受到或造成伤害后，你与“赐福”角色各摸一张牌（若均为你则只摸一张牌）。",
		"mengcifu_info": "赐福|游戏开始时或出牌阶段开始时，你将“赐福”角色改为场上的一名角色。当“赐福”角色使用牌指定唯一目标后，你可以弃置一张牌并令其选择一项： 1.令此牌不能被响应。2.令此牌造成的伤害值与回复值+1。",
		"mengyidao_info": "仪祷|结束阶段，你可以弃置一张牌并令一名角色摸一张牌；若该角色为其他“赐福”角色，则改为摸三张。",

		meng_kelala: ['克拉拉', ["female", "hyyz_xt", 4, ["mengdaijia", "mengweijia", "mengruyue"], []], '日玖阳气冲三关'],
		mengdaijia: {
			audio: 3,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengdaijia1.mp3",
				"ext:忽悠宇宙/asset/meng/audio/mengdaijia2.mp3",
			],
			trigger: {
				global: "phaseZhunbeiBegin",
			},
			check(event, player) {
				var num = game.countPlayer(function (current) {
					return current != player && get.attitude(player, current) > 3 && player.hp > current.hp;
				})
				if (num <= 0) return false;
				if (get.attitude(player, event.player) < -2) {
					var cards = player.getCards('h');
					if (cards.length > player.hp) return true;
					for (var i = 0; i < cards.length; i++) {
						var useful = get.useful(cards[i]);
						if (useful < 5 || get.number(cards[i]) > 9 && useful < 7) return true;
					}
				}
				return false;
			},
			logTarget: "player",
			filter(event, player) {
				return player.canCompare(event.player) && !player.getRoundHistory('damage').length;
			},
			async content(event, trigger, player) {
				const bool = await player.chooseToCompare(trigger.player, function (card) {
					var player = get.owner(card);
					var target = _status.event.getParent().target;
					if (target != player && get.attitude(player, target) < 0 &&
						game.hasPlayer((current) => current != target &&
							get.attitude(target, current) > 4 && current.hp < target.hp))
						return -get.number(card);
				}).forResultBool();
				if (bool) {
					game.hyyzSkillAudio('meng', 'mengdaijia', 3)
					trigger.player.addTempSkill('mengdaijia_me');
					trigger.player.storage.xtshengjia_me = player;
				}
				else {
					player.damage(trigger.player);
				}
			},
			subSkill: {
				me: {
					onremove: true,
					mod: {
						playerEnabled(card, player, target) {
							if (player.storage.xtshengjia_me != target && target != player && (!get.info(card) || !get.info(card).singleCard || !ui.selected.targets.length)) return false;
						},
					},
					mark: true,
					intro: {
						content(player, storage) {
							return '只能对自己和' + get.translation(storage) + '使用牌';
						},
					},
					sub: true,
				},
			},
		},
		mengweijia: {
			audio: 2,
			trigger: {
				player: "damageEnd",
			},
			filter(event, player) {
				return event.source && event.source != player;
			},
			forced: true,
			logTarget: 'source',
			content() {
				trigger.source.damage(player);
				trigger.source.addSkills('mengjinggao');
			},
			ai: {
				"maixie_defend": true,
				threaten: 0.85,
				effect: {
					target(card, player, target) {
						if (player.hasSkillTag('jueqing', false, target)) return;
						return [1, 0, 0, player.hp == 1 ? -1.2 : -0.8];
					},
				},
			},
		},
		mengruyue: {
			audio: 4,
			logAudio: () => false,
			trigger: {
				source: "damageBegin1",
			},
			filter(event, player) {
				if (!event.player.hasSkill('mengjinggao')) return false;
				if (!event.card) return true;
				if (_status.currentPhase != player) return true;
			},
			forced: true,
			async content(event, trigger, player) {
				const control = await player
					.chooseControl('此伤害+1', '回复1点体力')
					.set('ai', () => ['此伤害+1', '回复1点体力'].randomGet())
					.forResultControl();
				if (control == '此伤害+1') {
					game.hyyzSkillAudio('meng', 'mengruyue', 1, 2)
					trigger.num++;
				} else {
					await trigger.player.removeSkills(['mengjinggao']);
					game.hyyzSkillAudio('meng', 'mengruyue', 3, 4)
					player.recover();
				}
			},
		}, mengjinggao: {
			mark: true,
			marktext: "警",
			intro: {
				name: "警告",
				content: "史瓦罗在看着你",
			},
			charlotte: true,
			locked: true,
		},
		"mengdaijia_info": "代价|一名角色的准备阶段，若你本轮未受过伤，你可以与其拼点。若你赢，该角色本回合不能对除你们外的角色使用牌；否则，其对你造成1点伤害。",
		mengjinggao_info: "警告|",
		"mengweijia_info": "为家|锁定技，你受到伤害后，对伤害来源造成1点伤害，并令其获得“警告”。",
		"mengruyue_info": "如约|锁定技，你对有“警告”的其他角色造成无卡牌伤害或回合外伤害时，你移去“警告”并选择一项：此伤害+1；回复1点体力。",

		meng_sb_xier: ['希儿', ["female", "hyyz_b3", 3, ["mengshuangsheng", "mengbian"], []], '微雨'],
		mengshuangsheng: {
			audio: 5,
			logAudio: () => false,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content: function (storage, player, skill) {
					var str = '';
					if (player.storage.mengshuangsheng == true) str += '当你使用伤害牌时，可以令目标本回合非锁定技失效并改为对目标〖强袭〗';
					else str += '当你受到伤害时，你可以弃置两张颜色不同的牌并改为加1点体力上限。';
					return str;
				},
			},
			group: ["mengshuangsheng_1", "mengshuangsheng_2"],
			subSkill: {
				"1": {
					logAudio: () => [
						"ext:忽悠宇宙/asset/meng/audio/mengshuangsheng1.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengshuangsheng2.mp3",
					],
					trigger: {
						player: "damageBegin4",
					},
					filter(event, player) {
						return player.storage.mengshuangsheng != true && player.countCards('he', { color: 'red' }) && player.countCards('he', { color: 'black' });
					},
					async cost(event, trigger, player) {
						event.result = await player
							.chooseToDiscard('是否发动【双生·阳】？', '弃置两张颜色不同的牌并改为加1点体力上限', 'he', 2, function (card) {
								if (ui.selected.cards.length > 0) {
									if (get.color(card) == get.color(ui.selected.cards[0])) return false;
								}
								return true;
							})
							.set('complexCard', true)
							.set('ai', (card) => 8 - get.value(card))
							.forResult();
					},
					async content(event, trigger, player) {
						game.hyyzSkillAudio('meng', 'mengshuangsheng', 1, 2)
						player.changeZhuanhuanji('mengshuangsheng');
						trigger.cancel();
						player.gainMaxHp();
					},
					ai: {
						"maixie_defend": true,
						effect: {
							target: function (card, player, target) {
								if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
								if (!target.hasFriend()) return;
								if (target.countCards('he', { color: 'red' }) && target.countCards('he', { color: 'black' })) {
									return [1, 2];
								}
							},
						},
					},
				},
				"2": {
					logAudio: () => [
						"ext:忽悠宇宙/asset/meng/audio/mengshuangsheng3.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengshuangsheng4.mp3",
						"ext:忽悠宇宙/asset/meng/audio/mengshuangsheng5.mp3",
					],
					trigger: {
						player: "useCard",
					},
					filter(event, player) {
						if (!event.cards.length) return false;
						if (!get.tag(event.card, 'damage') || !event.targets.length) return false;
						return player.storage.mengshuangsheng == true && player.hp > 0 && event.target != player;
					},
					prompt: '是否发动【双生·阴】？',
					prompt2: "令目标本回合非锁定技失效，改为对其〖强袭〗。",
					check(event, player) {
						return player.hp > 1;
					},
					async content(event, trigger, player) {
						player.changeZhuanhuanji('mengshuangsheng');
						trigger.cancel();
						for (let target of trigger.targets) {
							target.addTempSkill('fengyin');
							await player.loseHp();
							await target.damage(player, 1);
						}
					},
				}
			},
		},
		mengbian: {
			audio: 2,
			unique: true,
			trigger: {
				player: 'dying'
			},
			juexingji: true,
			skillAnimation: true,
			animationColor: "gray",
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill('mengbian');
				await player.addSkills(['mengjuangu']);
				while (player.maxHp > 0 && player.isDamaged()) {
					await player.loseMaxHp();
					await player.chooseUseTarget({ name: 'sha', nature: 'hyyz_quantum' }, false, 'nodistance');
				}
			},
			derivation: 'mengjuangu',
			ai: {
				order: 100,
				result: {
					target: function (player, target) {
						var eff = get.damageEffect(target, player, player);
						if (player.maxHp == 1 || player.maxHp == player.hp) return;
						if (ui.selected.targets.length <= player.getDamagedHp()) return -eff;
					},
				},
			},
		},
		mengjuangu: {
			audio: 4,
			trigger: {
				player: "loseAfter",
			},
			forced: true,
			filter(event, player) {
				var evt = event.getl(player);
				if (!evt.cards2 || !evt.cards2.length) return false;
				return !["useCard", "respond"].includes(event.getParent().name);
			},
			async content(event, trigger, player) {
				player.changeHujia(1);
			},
			group: "mengjuangu_1",
			subSkill: {
				"1": {
					audio: 'mengjuangu',
					trigger: {
						player: "changeHujiaBefore",
					},
					filter(event, player) {
						return player.isDamaged() && event.num > 0;
					},
					forced: true,
					async content(event, trigger, player) {
						let num = player.getDamagedHp();
						if (trigger.num > num) {
							await player.recover(trigger.num - num);
							trigger.num -= num;
						} else {
							trigger.cancel();
							await player.recover(trigger.num);
						}
						await player.draw();
					},
				},
			},
		},
		"mengshuangsheng_info": "双生|转换技。<br>阳：当你受到伤害时，你可以弃置两张颜色不同的牌并改为加1点体力上限。<br>阴：当你使用非虚拟伤害牌时，可以令目标本回合非锁定技失效并改为对目标〖强袭〗。",
		"mengbian_info": "彼岸|觉醒技，当你进入濒死状态时，获得〖眷顾〗，然后重复减少1点体力上限并视为使用无距离限制的量子【杀】，直到你未受伤。",
		"mengjuangu_info": "眷顾|锁定技，你不因使用或打出失去牌后，获得1枚护甲；当你获得护甲时，优先改为回复体力。",

		meng_alan: ['阿兰', ["male", "hyyz_xt", 4, ['mengshinu', 'mengjianren'], []], '流萤一生推', ''],
		mengshinu: {
			audio: 4,
			trigger: {
				player: 'useCardToPlayered'
			},
			filter: function (event, player) {
				return event.card.name == 'sha' && player.isPhaseUsing()
			},
			logTarget: "target",
			usable: 1,
			check(event, player) {
				return get.attitude(player, event.target) <= 0;
			},
			async content(event, trigger, player) {
				if (player.hp > 1) await player.loseHp();
				const num = player.getDamagedHp();
				if (num >= 1) {
					game.log('#g【释怒】', trigger.card, '改为雷属性');
					trigger.card.nature = 'thunder';
				};
				if (num >= 2) {
					game.log('#g【释怒】', trigger.card, '不能被响应');
					trigger.getParent().directHit.push(trigger.target);
				}
				if (num >= 3) {
					game.log('#g【释怒】', trigger.card, '的伤害+', player.getDamagedHp());
					var id = trigger.target.playerid;
					var map = trigger.getParent().customArgs;
					if (!map[id]) map[id] = {};
					if (typeof map[id].extraDamage != 'number') {
						map[id].extraDamage = 0;
					}
					map[id].extraDamage += player.getDamagedHp();
				}
			}
		},
		mengjianren: {
			audio: 3,
			trigger: {
				player: 'dying'
			},
			round: 1,
			forced: true,
			content: function () {
				player.recover(1 - player.hp);
			},
			mod: {
				maxHandcard(player) {
					return player.getDamagedHp();
				},
			},
			group: 'mengjianren_1',
			subSkill: {
				"1": {
					audio: 'mengjianren',
					trigger: {
						player: 'phaseJieshuBegin',
					},
					forced: true,
					filter(event, player) {
						return player.getDamagedHp() > 0;
					},
					content() {
						player.draw(player.getDamagedHp())
					},
				}
			}
		},
		"mengshinu_info": "释怒|出牌阶段限一次，当你使用【杀】指定目标后，你可以失去1点体力（若体力值为1，则跳过这一步），然后执行前X项效果（X为你已损失的体力值）：<br>1.此【杀】改为雷【杀】。2.此【杀】不能被响应。3.此【杀】的伤害+X。",
		"mengjianren_info": "坚忍|锁定技。<br>①每轮限一次，当你进入濒死状态时，将体力值回复至1点。<br>②你的手牌上限视为x。<br>③结束阶段，你摸X张牌。",

		meng_kiana: ['琪亚娜', ["female", "hyyz_b3", 4, ['mengyuehua', 'mengliushang'], ['zhu',]], '拾壹'],
		mengyuehua: {
			audio: 3,
			init: function (player) {
				player.storage.mengyuehua = [1, 2, 3, 4, 5, 6, 7];
				player.storage.mengyuehua2 = [1, 2, 3, 4, 5, 6, 7];
				player.syncStorage('mengyuehua');
			},
			mark: true,
			intro: {
				content: function (storage, player) {
					var list = [
						'1.造成1点火焰伤害<br>',
						'2.回复1点体力<br>',
						'3.摸一张牌<br>',
						'4.造成1点冰冻伤害<br>',
						'5.你弃置一名角色的一张牌<br>',
						'6.获得其他角色的一张牌<br>',
						'7.造成1点雷电伤害<br>',
					];
					var str = '';
					for (var i = 0; i < 7; i++) {
						if (player.storage.mengyuehua2.includes(i + 1)) {
							if (player.storage.mengyuehua.includes(i + 1)) {
								str += '<p style=\"color:rgb(124,252,0)\">';
								str += list[i];
								str += '</p>';
							}
							else {
								str += '<p style=\"color:rgb(255,102,102)\">';
								str += list[i];
								str += '</p>';
							}
						}
					}
					return str;
				}
			},
			trigger: {
				source: 'damageSource',
				player: ['recoverEnd', 'drawAfter', 'gainAfter'],
				global: ['loseAfter', 'loseAsyncAfter'],
			},
			direct: true,
			filter: function (event, player) {
				if (player.storage.mengyuehua.length == 0) return false;
				var list = player.storage.mengyuehua;
				switch (event.name) {
					case 'damage': {
						if (event.num != 1) return false;
						if (event.nature != undefined) {
							if (event.nature == 'fire' || event.hasNature("fire")) return list.includes(1);
							if (event.nature == 'ice' || event.hasNature("ice")) return list.includes(4);
							if (event.nature == 'thunder' || event.hasNature("thunder")) return list.includes(7);
						}
						else return false;
					}
					case 'lose': {
						if (event.type != 'discard' || !list.includes(5)) return false;
						if (event.player == player && event.cards.length == 1) return true;
						if (event.getParent().notBySelf != true) return false;
						if ((event.discarder || event.getParent(2).player) != player) return false;
						var evtx = event.getl(event.player);
						return evtx && evtx.cards2 && evtx.cards2.length == 1;
					}
					case 'recover': return event.num == 1 && list.includes(2);
					case 'draw': return event.num == 1 && list.includes(3);
					default: {
						var cards = event.getg(player);
						if (!cards.length) return false;
						return game.hasPlayer(current => {
							return current != player && event.getl(current).cards2.length;
						}) && list.includes(6);
					}
				}
			},
			content: function () {
				'step 0'
				switch (trigger.name) {
					case 'damage': {
						if (trigger.nature == 'fire') {
							player.storage.mengyuehua.remove(1);
							game.log('#g【月华】', player, '触发并禁用', '#y选项一');
						}
						else if (trigger.nature == 'ice') {
							player.storage.mengyuehua.remove(4);
							game.log('#g【月华】', player, '触发并禁用', '#y选项四');
						}
						else if (trigger.nature == 'thunder') {
							player.storage.mengyuehua.remove(7);
							game.log('#g【月华】', player, '触发并禁用', '#y选项七');
						}
						break;
					}
					case 'lose': {
						player.storage.mengyuehua.remove(5);
						game.log('#g【月华】', player, '触发并禁用', '#y选项五');
						break;
					}
					case 'recover': {
						player.storage.mengyuehua.remove(2);
						game.log('#g【月华】', player, '触发并禁用', '#y选项二');
						break;
					}
					case 'draw': {
						player.storage.mengyuehua.remove(3);
						game.log('#g【月华】', player, '触发并禁用', '#y选项三');
						break;
					}
					default: {
						player.storage.mengyuehua.remove(6);
						game.log('#g【月华】', player, '触发并禁用', '#y选项六');
						break;
					}
				}
				player.syncStorage('mengyuehua');
				'step 1'
				var list = [
					'对一名角色造成1点火焰伤害',
					'回复1点体力',
					'摸一张牌',
					'对一名角色造成1点冰冻伤害',
					'弃置一名角色区域内的一张牌',
					'获得一名其他角色的一张牌',
					'对一名角色造成1点雷电伤害',
				];
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i]];
				}
				var next = player.chooseButton([
					'月华：执行一项',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 3), 'tdnodes'],
					[list.slice(3, 4), 'tdnodes'],
					[list.slice(4, 5), 'tdnodes'],
					[list.slice(5, 6), 'tdnodes'],
					[list.slice(6, 7), 'tdnodes'],
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					var player = _status.event.player;
					var list = player.storage.mengyuehua;
					if (button.link == 0) return list.includes(1);
					if (button.link == 1) return list.includes(2) && player.isDamaged();
					if (button.link == 2) return list.includes(3);
					if (button.link == 3) return list.includes(4);
					if (button.link == 4) return list.includes(5) && game.hasPlayer((current) => current != player && current.countDiscardableCards(player, 'hej') > 0);
					if (button.link == 5) return list.includes(6) && game.hasPlayer((current) => current != player && current.countGainableCards(player, 'hej') > 0);
					if (button.link == 6) return list.includes(7);
				});
				next.set('ai', function (button) {
					var player = _status.event.player;
					var event = _status.event.getTrigger();
					switch (button.link) {
						case 0: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'fire') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 1: {
							if (player.isDamaged()) {
								if (player.hp == 1) return 2;
								if (player.hp == 2) return 1.5;
								return 1.2
							};
						}
						case 2: return 0.8;
						case 3: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'ice') > num) num = get.damageEffect(current, player, player);
							})) return num;
						}
						case 4: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.guohe.ai.result.target(player, current) > num) num = att * lib.card.guohe.ai.result.target(player, current);
							})) return num;
						}
						case 5: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.shunshou.ai.result.target(player, current) > num) num = att * lib.card.shunshou.ai.result.target(player, current);
							})) return num;
						}
						case 6: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'thunder') > num) num = get.damageEffect(current, player, player) > num;
							})) return num;
						}
					}
				});
				'step 2'
				if (result.bool) {
					player.logSkill('mengyuehua');
					var map = [
						function (trigger, player) {
							player.storage.mengyuehua.remove(1);
							player.syncStorage('mengyuehua');
							player.chooseTarget('月华，对一名角色造成1点火焰伤害', true).set('ai', function (target) {
								return get.damageEffect(target, player, player, 'fire');
							});
							event.nature = 'fire';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(2);
							player.syncStorage('mengyuehua');
							player.recover();
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(3);
							player.syncStorage('mengyuehua');
							player.draw();
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(4);
							player.syncStorage('mengyuehua');
							player.chooseTarget('月华，对一名角色造成1点冰冻伤害', true).set('ai', function (target) {
								return get.damageEffect(target, player, player, 'ice');
							});
							event.nature = 'ice';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(5);
							player.syncStorage('mengyuehua');
							player.chooseTarget('月华：弃置一名角色区域内的一张牌', function (card, player, target) {
								return target.countDiscardableCards(player, 'hej');
							}, true);
							event.do = 'discardPlayerCard';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(6);
							player.syncStorage('mengyuehua');
							player.chooseTarget('月华：获得一名角色区域内的一张牌', function (card, player, target) {
								return target.countGainableCards(player, 'hej') && target != player;
							}, true);
							event.do = 'gainPlayerCard';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(7);
							player.syncStorage('mengyuehua');
							player.chooseTarget('月华，对一名角色造成1点雷电伤害').set('ai', function (target) {
								return get.damageEffect(target, player, player, 'thunder');
							}, true);
							event.nature = 'thunder';
						},
					];
					for (var i = 0; i < result.links.length; i++) {
						game.log('#g【月华】', player, '执行并禁用了', '#y选项' + get.cnNumber(result.links[i] + 1, true));
						map[result.links[i]](trigger, player);
					}
					if (result.links.includes(1) || result.links.includes(2)) event.finish();
				} else event.finish();
				'step 3'
				var target = result.targets[0];
				if (event.nature) {
					target.damage(event.nature);
				} else if (event.do) {
					player[event.do](target, true);
				}
			},
			group: 'mengyuehua_clear',
			subSkill: {
				clear: {
					trigger: {
						global: 'phaseEnd'
					},
					direct: true,
					content: function () {
						player.storage.mengyuehua = [];
						for (var i of player.storage.mengyuehua2) player.storage.mengyuehua.push(i);
						player.syncStorage('mengyuehua');
					},
					sub: true,
				}
			}
		},
		mengliushang: {
			audio: 2,
			trigger: {
				player: ["useCard", "respond"],
			},
			preHidden: true,
			filter: function (event, player) {
				return event.respondTo && event.respondTo[0] != player;
			},
			content: function () {
				'step 0'
				var list = [
					'对一名角色造成1点火焰伤害',
					'回复1点体力',
					'摸一张牌',
					'对一名角色造成1点冰冻伤害',
					'弃置一名角色区域内的一张牌',
					'获得一名其他角色的一张牌',
					'对一名角色造成1点雷电伤害',
				];
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i]];
				}
				var next = player.chooseButton([
					'流裳：执行一项并永久移除',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 3), 'tdnodes'],
					[list.slice(3, 4), 'tdnodes'],
					[list.slice(4, 5), 'tdnodes'],
					[list.slice(5, 6), 'tdnodes'],
					[list.slice(6, 7), 'tdnodes'],
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					var player = _status.event.player;
					var list = player.storage.mengyuehua;
					if (button.link == 0) return list.includes(1);
					if (button.link == 1) return list.includes(2) && player.isDamaged();
					if (button.link == 2) return list.includes(3);
					if (button.link == 3) return list.includes(4);
					if (button.link == 4) return list.includes(5) && game.hasPlayer((current) => current.countDiscardableCards(player, 'hej') > 0);
					if (button.link == 5) return list.includes(6) && game.hasPlayer((current) => current.countGainableCards(player, 'hej') > 0);
					if (button.link == 6) return list.includes(7);
				});
				next.set('ai', function (button) {
					var player = _status.event.player;
					var event = _status.event.getTrigger();
					switch (button.link) {
						case 0: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'fire') > num) num = get.damageEffect(current, player, player);
							})) return num - 1;
						}
						case 1: {
							if (player.isDamaged()) {
								if (player.hp == 1) return 1;
								if (player.hp == 2) return 0.5;
								return 0.2
							};
						}
						case 2: return 0.1;
						case 3: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'ice') > num) num = get.damageEffect(current, player, player);
							})) return num - 1;
						}
						case 4: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.guohe.ai.result.target(player, current) > num) num = att * lib.card.guohe.ai.result.target(player, current);
							})) return num - 1;
						}
						case 5: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								var att = get.attitude(player, current);
								if (att < 0) att = -Math.sqrt(-att);
								else att = Math.sqrt(att);
								if (att * lib.card.shunshou.ai.result.target(player, current) > num) num = att * lib.card.shunshou.ai.result.target(player, current);
							})) return num - 1;
						}
						case 6: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								if (get.damageEffect(current, player, player, 'thunder') > num) num = get.damageEffect(current, player, player) > num;
							})) return num - 1;
						}
					}
				});
				'step 1'
				if (result.bool) {
					player.logSkill('mengliushang');
					var map = [
						function (trigger, player) {
							player.storage.mengyuehua.remove(1);
							player.storage.mengyuehua2.remove(1);
							player.syncStorage('mengyuehua');
							player.chooseTarget('流裳，对一名角色造成1点火焰伤害', true).set('ai', function (target) {
								return get.damageEffect(target, player, player, 'fire');
							});
							event.nature = 'fire';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(2);
							player.storage.mengyuehua2.remove(2);
							player.syncStorage('mengyuehua');
							player.recover();
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(3);
							player.storage.mengyuehua2.remove(3);
							player.syncStorage('mengyuehua');
							player.draw();
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(4);
							player.storage.mengyuehua2.remove(4);
							player.syncStorage('mengyuehua');
							player.chooseTarget('流裳，对一名角色造成1点冰冻伤害', true).set('ai', function (target) {
								return get.damageEffect(target, player, player, 'ice');
							});
							event.nature = 'ice';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(5);
							player.storage.mengyuehua2.remove(5);
							player.syncStorage('mengyuehua');
							player.chooseTarget('流裳：弃置一名角色区域内的一张牌', function (card, player, target) {
								return target.countDiscardableCards(player, 'hej');
							}, true);
							event.do = 'discardPlayerCard';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(6);
							player.storage.mengyuehua2.remove(6);
							player.syncStorage('mengyuehua');
							player.chooseTarget('流裳：获得一名角色区域内的一张牌', function (card, player, target) {
								return target.countGainableCards(player, 'hej') && target != player;
							}, true);
							event.do = 'gainPlayerCard';
						},
						function (trigger, player) {
							player.storage.mengyuehua.remove(7);
							player.storage.mengyuehua2.remove(7);
							player.syncStorage('mengyuehua');
							player.chooseTarget('流裳，对一名角色造成1点雷电伤害').set('ai', function (target) {
								return get.damageEffect(target, player, player, 'thunder');
							}, true);
							event.nature = 'thunder';
						},
					];
					for (var i = 0; i < result.links.length; i++) {
						game.log(player, '选择了', '#g【月华】', '的', '#y选项' + get.cnNumber(result.links[i] + 1, true));
						map[result.links[i]](trigger, player);
					}
					if (result.links.includes(1) || result.links.includes(2)) event.finish();
				} else event.finish();
				'step 2'
				var target = result.targets[0];
				if (event.nature) {
					target.damage(event.nature);
				} else if (event.do) {
					player[event.do](target, true);
				}
			}
		},
		"mengyuehua_info": "月华当你执行以下一项后，你可以选择一项执行（每回合每项只能触发和执行一次）：<br>1.对一名角色造成1点火焰伤害；<br>2.回复1点体力；<br>3.摸一张牌；<br>4.对一名角色造成1点冰冻伤害；<br>5.弃置一名角色区域内的一张牌；<br>6.获得一名其他角色的一张牌；<br>7.对一名角色造成1点雷电伤害。",
		"mengliushang_info": "流裳当你响应其他角色的牌后，你可以执行并移除〖月华〗中的一项。",

		meng_sb_jiziwuliangta: ['姬子', ["female", "hyyz_b3", "1/9", ["mengezhan", "mengzhuoshi", "mengjiyi", "mengzhicheng"], []], '沧海依酥', ''],
		mengezhan: {
			audio: 2,
			ai: {
				halfneg: true,
				threaten: 1.2,
				effect: {
					target: function (card, player, target) {
						if (target.countCards('he')) return [1, 0, 0, -1];
					}
				}
			},
			group: ['mengezhan_target', 'mengezhan_player'],
			subSkill: {
				target: {
					audio: 'mengezhan',
					trigger: {
						global: 'useCardAfter'
					},
					filter: function (event, player) {
						if (_status.currentPhase == player) return false;
						if (!event.player.isIn() || event.player == player) return false;
						if (!event.targets || event.targets.length != 1 || event.targets[0] != player) return false;
						return player.canUse({ name: 'sha' }, event.player, false) && player.countCards('h');
					},
					async cost(event, trigger, player) {
						event.result = await player.chooseCard('恶战：将一张手牌当【杀】对' + get.translation(trigger.player) + '使用')
							.set('ai', function (card) {
								if (get.effect(player, { name: 'sha' }, trigger.player, player) > 0) return 7 - get.value(card);
							}).forResult()
					},
					logTarget: 'player',
					async content(event, trigger, player) {
						var card = get.autoViewAs({ name: 'sha' }, event.cards)
						player.useCard(card, event.cards, trigger.player, false);
					},
				},
				player: {
					audio: 'mengezhan',
					trigger: {
						player: 'useCardAfter'
					},
					filter: function (event, player) {
						if (!player.isPhaseUsing()) return false;
						if (!event.targets || event.targets.length != 1) return false;
						if (!event.targets[0].isIn() || event.targets[0] == player) return false;
						if (!event.targets[0].canUse({ name: 'sha' }, player)) return false;
						return event.targets[0].countCards('h');
					},
					async cost(event, trigger, player) {
						event.result = await trigger.targets[0].chooseCard('将一张手牌当【杀】对' + get.translation(player) + '使用').set('ai', function (card) {
							if (get.effect(trigger.targets[0], { name: 'sha' }, player, trigger.targets[0]) > 0) return 8 - get.value(card);
						}).forResult();
					},
					async content(event, trigger, player) {
						var card = get.autoViewAs({ name: 'sha' }, event.cards)
						trigger.targets[0].useCard(card, event.cards, player, false)
					},
				}
			}
		},
		mengzhuoshi: {
			audio: 2,
			trigger: {
				player: 'damageBegin4'
			},
			filter: function (event, player) {
				return event.num > 0;
			},
			forced: true,
			async content(event, trigger, player) {
				var num = trigger.num;
				trigger.cancel();
				await player.loseMaxHp(num);
				await player.draw(num);
			},
			ai: {
				fireAttack: true,
				halfneg: true,
				threaten: 1.05,
				effect: {
					target(card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							return [1, 0, 0, -1];
						}
					}
				}
			},
		},
		mengjiyi: {
			audio: 'mengezhan',
			mod: {
				maxHandcard: function (player, num) {
					return player.maxHp;
				}
			},
			trigger: {
				player: ['useCard', 'shaMiss']
			},
			filter: function (event, player) {
				if (event.name == 'useCard') return event.card.name == 'sha';
				return event.target.isIn() && event.target.countCards('h') > 0;
			},
			forced: true,
			logTarget: 'targets',
			content: function () {
				if (trigger.name == 'useCard') {
					trigger.card.nature = 'fire';
				} else {
					trigger.target.chooseToDiscard(true);
				}
			},
			ai: {
				fireAttack: true,
			}
		},
		mengzhicheng: {
			audio: 1,
			trigger: {
				player: 'dieBegin'
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget('志承：令一名其他角色增加一点体力上限并回复1点体力，然后令其获得技能〖疾疫〗和你区域内的所有牌', lib.filter.notMe)
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hp == 1) {
								att += 2;
							}
							if (target.hp < target.maxHp) {
								att += 2;
							}
						}
						return att;
					})
					.forResult();
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				await target.gainMaxHp();
				await target.recover();
				target.addSkills('mengjiyi');
				target.gain(player.getCards('hej'), player, 'giveAuto');
			},
			ai: {
				threaten: function (player, target) {
					if (target.hp == 1) return 2;
					return 0.5;
				},
			}
		},
		"mengezhan_info": "恶战|回合外，其他角色对你使用牌后，若你为此牌的唯一目标，你可以将一张手牌当无距离限制的【杀】对其使用；<br>出牌阶段，你对其他角色使用牌后，若此牌的目标唯一，目标角色可以将一张手牌当【杀】对你使用。",
		"mengzhuoshi_info": "灼蚀|锁定技，当你受到伤害时，改为减少X点的体力上限并摸X张牌（X为伤害值）。",
		"mengjiyi_info": "疾疫|锁定技，你的手牌上限等于体力上限。你使用的【杀】改为火【杀】，其他角色响应你的【杀】后须弃置一张手牌。",
		"mengzhicheng_info": "志承|当你死亡时，你可以令一名其他角色增加一点体力上限并回复1点体力，然后令其获得技能〖疾疫〗和你区域内的所有牌。",

	},
	2309: {
		hyyz_danhengyinyue: ['丹恒·饮月', ["male", "hyyz_xt", 4, ["hyyznilin", "hyyzwangtu"], []], '#b斩断过往<br>一念虚实', '罗浮龙尊，掌苍龙之传。行云布雨，膺责守望不死建木。尊号「饮月君」。'],
		hyyznilin: {
			audio: 6,
			init: function (player) {
				player.storage.hyyznilin = [[], []];
			},
			enable: ["chooseToUse", "chooseToRespond"],
			filter: function (event, player) {
				return event.filterCard({ name: 'sha' }, player, event);
			},
			chooseButton: {
				dialog: function (event, player) {
					var list = [];
					if (event.filterCard({ name: 'sha' }, player, event)) {
						list.push(['基本', '', 'sha'])
						for (var nature of lib.inpile_nature) {
							if (event.filterCard({ name: 'sha', nature: nature }, player, event)) list.push(['基本', '', 'sha', nature]);
						}
					}
					if (player.countCards('h') > 0) var list1 = player.getCards('h');
					else var list1 = '你没有手牌';
					var list2 = get.cards(3);
					for (var i = 2; i >= 0; i--) {
						ui.cardPile.insertBefore(list2[i], ui.cardPile.firstChild);
					}
					return ui.create.dialog('逆鳞', [list, 'vcard'], '你的手牌', list1, '牌堆顶的牌', list2, 'hidden');
				},
				check: function (button) {
					let player = _status.event.player;
					let card = button.link;
					if (get.itemtype(card) == 'card') {
						return 10 - (_status.event.currentPhase == player ? player.getUseValue(card) : get.value(card)) / (card.name == 'sha' ? 10 : 1);
					}
					else {
						if (card[3] == 'hyyz_quantum') return 2.97 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'fire') return 2.95 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'hyyz_wind') return 2.93 + player.getUseValue({ name: card[2], nature: [3] });
						else if (card[3] == 'thunder') return 2.91 + player.getUseValue({ name: card[2], nature: [3] });
						else return 2.9 + player.getUseValue({ name: card[2], nature: [3] });
					}
				},
				select: 4,
				filter: function (button, player) {
					if (ui.selected.buttons.length) {
						if (ui.selected.buttons.some(i => get.position(i.link) == undefined)) return get.position(button.link);
						if (ui.selected.buttons.length == 3) return !get.position(button.link);
					}
					return true
				},
				backup: function (links, player) {
					let cards = [], views = [];
					cards = links.filter(i => get.position(i));
					views = links.filter(i => !get.position(i));
					return {
						filterCard: function (card) {
							return false;
						},
						selectCard: -1,
						cards: cards,
						viewAs: {
							name: views[0][2],
							nature: views[0][3],
						},
						precontent: function () {
							player.logSkill('hyyznilin');
							event.result.cards = lib.skill[event.result.skill].cards;
						},
						onuse: function (result, player) {
							let cards0 = lib.skill[result.skill].cards;
							let num = cards0.filter(link => player.getCards('h').includes(link)).length;

							var cards = [];
							while (cards.length < num) {
								var card = get.cardPile(function (card) {
									return !cards0.includes(card) && !cards.includes(card);
								});
								if (card) cards.push(card);
							}
							if (cards.length) {
								game.log(player, '摸了' + get.cnNumber(num) + '张牌');
								player.gain(cards, 'draw');
							}
							//player.awakenSkill('hyyznilin');
							//player.when('phaseAfter').then(() => {
							//    player.restoreSkill('hyyznilin');
							//})
						},
						onrespond: function (result, player) {
							player.draw(lib.skill[result.skill].cards.length);
						},
					}
				},
				prompt: function (links, player) {
					let views = links.filter(i => !get.position(i));
					return '选择【' + get.translation(views[0][3] || '') + get.translation(views[0][2]) + '】的目标';
				},
			},
			hiddenCard: function (player, name) {
				return name == 'sha';
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'hyyznilin_backup') return true;
				},
				selectTarget(card, player, range) {
					if (range[1] == -1) return;
					let evt = _status.event;
					if (evt.skill == 'hyyznilin_backup') {
						if (evt._result && evt._result.links && evt._result.links.length) {
							let cards = evt._result.links.filter(link => get.itemtype(link) == 'card' && player.getCards('h').includes(link))
							let num = cards.length;
							if (typeof num == 'number' && num > range[1]) range[1] = num;
						}
					}
				}
			},
			ai: {
				effect: {
					target: function (card, player, target, effect) {
						if (get.tag(card, 'respondSha')) return 0.7;
					},
				},
				order: 11,
				respondSha: true,
				result: {
					player: function (player) {
						return 1;
					},
				},
			},
		},
		"hyyznilin_info": "逆鳞|你可以观看并在<span class='thundertext'>牌堆顶三张牌和手牌</span>中选择三张当任意【杀】使用或打出。<br>此【杀】无距离限制，目标上限为X且你摸X张牌，X为此【杀】包含的手牌数。",
		hyyzwangtu: {
			audio: 2,
			trigger: {
				target: 'useCardToTargeted',
			},
			forced: true,
			async content(event, trigger, player) {
				if (!player.hasSkill('hyyzwangtu_buff')) player.addTempSkill('hyyzwangtu_buff', 'roundStart');
				player.storage.hyyzwangtu_buff++;
				player.syncStorage('hyyzwangtu_buff');
				player.updateMark('hyyzwangtu_buff');
			},
			subSkill: {
				buff: {
					init(player, skill) {
						player.storage.hyyzwangtu_buff = 0;
					},
					mark: true,
					intro: {
						markcount(storage, player) {
							return ('+' + storage);
						},
						content: function (storage) {
							return '其他角色计算与你的距离+' + storage;
						},
					},
					mod: {
						globalTo: function (from, to, distance) {
							if (typeof to.storage.hyyzwangtu_buff == 'number') {
								return distance + to.storage.hyyzwangtu_buff;
							}
						},
					},
				}
			}
		},
		"hyyzwangtu_info": "亡途|锁定技，当你成为一张牌的目标后，本轮其他角色计算与你的距离+1。",

		hyyz_kaiwen: ['凯文', ["male", "hyyz_b3", 4, ["hyyzqishuang", "hyyzshenghen", "hyyzjiushi"], ['zhu',]], '#b不论付出多少代价<br>人类<br>一定会战胜崩坏！', '凯文·卡斯兰娜，第一文明纪元联合国下属对崩坏组织“逐火之蛾”的十三英桀之首，位次“I”，刻印为“救世”。人类最强大的保护者，最接近逐火之蛾宏愿的人，被所有人承认的“英雄”。世人坚信，他终将带领人类战胜崩坏。'],//die：bgm代替
		hyyzqishuang: {
			audio: 3,
			trigger: {
				source: "damageBegin1",
			},
			forced: true,
			filter: (event, player) => !event.nature,
			async content(event, trigger, player) {
				game.setNature(trigger, player.countCards('e', (card) => card.name.includes('tianhuo')) > 0 ? 'fire' : 'ice');
			},
		},
		hyyzqishuang_info: "欺霜|锁定技，你造成的普通伤害视为冰属性（若你已装备“天火圣裁”，则改为火属性）。",
		hyyzshenghen: {
			audio: 5,
			enable: "phaseUse",
			usable: 1,
			filterTarget(card, player, target) {
				if (target == player) return false;
				if (ui.selected.targets.length) {
					for (var i of ui.selected.targets) {
						if (i.hp == target.hp) return false;
					}
				}
				return true;
			},
			selectTarget: [1, Infinity],
			complexTarget: true,
			multiline: true,
			async content(event, trigger, player) {
				const cards = await event.target.chooseToUse(function (card, player, event) {
					if (get.type(card) == 'equip') return false;
					return lib.filter.cardEnabled.apply(this, arguments);
				}, '是否使用一张非装备牌？', '若你使用，则凯文获得之；<br>否则翻面或被杀').forResultCards();
				if (cards) {
					player.gain(cards, 'gain2');
				} else {
					const control = await event.target.chooseControl('翻面', '被杀').set('ai', function () {
						let target = _status.event.player;
						if (target.isTurnedOver()) return '翻面';
						if (target.hp > 1) return '被杀';
						return '翻面';
					}).forResultControl();
					if (control == '被杀') {
						player.recover();
						player.useCard({ name: 'sha', isCard: true }, event.target, false);
					} else {
						event.target.turnOver();
					}
				}
			},
			ai: {
				order: 4,
				expose: 0.2,
				result: {
					target(player, target) {
						let att = get.attitude(player, target);
						let value = 0;
						if (att > 0) {
							if (target.countCards('h') >= 5) value += 2;
							if (target.isTurnedOver()) value += 5;
						} else {
							value -= 2;
							if (!target.countCards('h', { name: 'sha' })) value -= 2;
						}
						return value;
					},
				},
			}
		},
		hyyzshenghen_info: "圣痕|出牌阶段限一次，选择任意体力值不同的其他角色，这些角色选择一项：1.使用一张非装备牌且你获得之；2.你回复1点体力并视为对其使用【杀】；3.翻面。",
		hyyzjiushi: {
			audio: 2,
			skillAnimation: "epic",
			animationColor: "fire",
			animationStr: '业魔入渊,劫灭出鞘',
			juexingji: true,
			trigger: {
				global: "dieAfter",
			},
			filter(event, player) {
				return game.dead && game.dead.length >= game.filterPlayer().length;
			},
			forced: true,
			async content(event, trigger, player) {
				player.awakenSkill(event.name);
				player.storage[event.name] = true;
				await game.delayx();
				var num = 0;
				game.countPlayer(function (current) {
					if (current != player) num += current.maxHp;
				})
				await player.gainMaxHp(num);
				await player.changeGroup("shen");

				const card = lib.skill.hyyzjiushi.equip();
				if (card) await player.equip(card);
				else game.log('#g【天火圣裁】', '不在游戏中');

				player.say('此即，救世之铭！');
				await player.addSkills('hyyzyemo');
			},
			derivation: ["hyyzyemo"],
			equip() {
				let card;
				card = get.cardPile((card) => card.name.includes('tianhuo'));
				if (!card) {
					let players = game.filterPlayer();
					for (let current of players) {
						if (current.countCards('hej', (card) => card.name.includes('tianhuo')) > 0) {
							card = current.getCards('hej', (card) => card.name.includes('tianhuo'))[0];
						};
						if (card) break;
					}
				}
				return card;
			}
		},
		hyyzjiushi_info: "救世|觉醒技,一名角色死亡后，若至少有一半的角色阵亡，你将体力上限改为存活角色的体力上限之和，势力改为神，然后装备【天火圣裁】并获得〖业魔〗。",
		hyyzyemo: {
			audio: 4,
			trigger: {
				player: ["loseHpBefore", "damageBegin4"],
				source: 'damageBegin3',
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'damage' && event.source && event.source == player) return player.getHistory('sourceDamage').length > 0
				else return true;
			},
			async content(event, trigger, player) {
				let num;
				if (trigger.name == 'damage' && trigger.source && trigger.source == player) {
					num = player.getHistory('sourceDamage').length;
					trigger.num += num;
				}
				else {
					num = trigger.num;
					trigger.cancel();
				};
				await player.loseMaxHp(num);
			},
			group: "hyyzyemo_equip",
			subSkill: {
				equip: {
					audio: 'hyyzyemo',
					trigger: {
						player: "phaseZhunbeiBegin",
					},
					filter(event, player) {
						if (!player.getEquips('equip1').some(card => card.name.includes('tianhuo'))) return false;
						const card = lib.skill.hyyzjiushi.equip();
						return card;
					},
					forced: true,
					async content(event, trigger, player) {
						const card = lib.skill.hyyzjiushi.equip();
						if (card) await player.equip(card);
						else game.log('#g【天火圣裁】', '不在游戏中');
					},
				}
			},
			mod: {
				aiValue: function (player, card, num) {
					if (card.name.includes('tianhuo')) return 100;
				},
			},
		},
		"hyyzyemo_info": "业魔|锁定技，准备阶段，你装备【天火圣裁】。 当你造成伤害时，此伤害值加X且你减X点体力上限（X为你本回合造成伤害的次数）。当你受到伤害或失去体力时，改为减体力上限。",


		meng_shaoxia: ['少侠', ["male", "qun", 4, ["mengweie", "mengmushou"], ["zhu"]], '尾巴酱', '以身为铒，邀天下人入局。<br>扩展包中第一个以公益为目的创作的武将，无侮辱、轻佻、歧视、玩笑等含义，武将的初衷在于让大家记住平民英雄。如有冒犯，联系b站紫灵谷的骊歌，即刻删除。'],
		mengweie: {
			trigger: {
				global: "roundStart",
			},
			direct: true,
			content: function () {
				'step 0'
				game.filterPlayer(function (current) {
					if (current.hasSkill('mengshuguang')) {
						current.draw(2);
					};
				})
				'step 1'
				player.chooseTarget('伪恶：对一名角色出谋划策', lib.translate['mengweie_info'], function (card, player, target) {
					return !target.hasSkill('mengshuguang')
				}).set('ai', function (target) {
					var att = get.attitude(player, target), eff = get.damageEffect(target, player, target) * 10;
					if (!game.countPlayer(function (current) {
						return current.hasSkill('mengshuguang')
					})) {
						if (target == player) att /= 2;
						if (get.damageEffect(target, player, target) * 10 > 0) att *= 10
						return att;
					} else return false;
				});
				'step 2'
				if (result.bool) {
					var target = result.targets[0];
					game.filterPlayer(function (current) {
						if (current.hasSkill('mengshuguang')) {
							current.removeSkill('mengshuguang');
						};
					})
					player.logSkill('mengweie', target);
					target.damage(player, 'unreal');
					target.addSkill('mengshuguang');
				}
			},
			derivation: 'mengshuguang',
			group: 'mengweie_die',
			subSkill: {
				die: {
					trigger: {
						player: 'dieBegin',
					},
					forceDie: true,
					forced: true,
					charlotte: true,
					content: function () {
						game.countPlayer(function (current) {
							if (current.hasSkill('mengshuguang')) {
								player.say('对不起，我尽力了……');
								current.removeSkill('mengshuguang');
							}
						})
					}
				}
			}
		},
		mengshuguang: {
			mark: true,
			marktext: '曙',
			intro: {
				name: '曙光',
				name2: '曙',
				content: '此计若成，我儿有救矣！',
			},
			trigger: {
				global: ["loseAfter", "loseAsyncAfter"],
			},
			filter: function (event, player) {
				if (event.type != 'discard' || event.getlx === false) return false;
				var cards = event.cards.slice(0);
				var evt = event.getl(player);
				if (evt && evt.cards) cards.removeArray(evt.cards);
				for (var i = 0; i < cards.length; i++) {
					if (cards[i].original != 'j' && get.type(cards[i], event.player) == 'basic' && get.position(cards[i], true) == 'd') {
						return true;
					}
				}
				return false;
			},
			direct: true,
			async content(event, trigger, player) {
				if (trigger.delay == false) game.delay();

				let cards = [], cards2 = trigger.cards.slice(0), evt = trigger.getl(player);
				if (evt && evt.cards) cards2.removeArray(evt.cards);
				for (var i = 0; i < cards2.length; i++) {
					if (cards2[i].original != 'j' && get.type(cards[i], event.player) == 'basic' && get.position(cards2[i], true) == 'd') {
						cards.push(cards2[i]);
					}
				}
				if (cards.length) {
					const { result: { bool } } = await trigger.player.chooseBool('曙光：' + get.translation(player) + '需要善款，将这些用不上的物资捐助给他吧', get.translation(cards), function (card, player, target) {
						return player != target;
					}).set('ai', () => get.attitude(trigger.player, player) > 0);
					if (bool) {
						trigger.player.logSkill('mengshuguang', player);
						player.gain(cards, 'gain2', 'log').giver = trigger.player;
						player.say(['谢谢好心人！', '好人一生平安！', '我实在无以回报……'].randomGet());
					}
				}
			},
			mod: {
				maxHandcard: function (player, num) {
					return num + 2;
				},
			}
		},
		mengmushou: {
			mod: {
				targetEnabled: function (card) {
					if ((get.type(card) == 'trick' || get.type(card) == 'delay') &&
						get.color(card) == 'black') return false;
				},
			},
			init: function (player) {
				player.storage.mengmushou = 0;
			},
			mark: true,
			intro: {
				content: '你已帮助别人筹集的善款：#'
			},
			trigger: {
				global: 'gainAfter',
			},
			filter: function (event, player) {
				return event.player.hasSkill('mengshuguang');
			},
			charlotte: true,
			forced: true,
			dutySkill: true,
			content: function () {
				player.storage.mengmushou += trigger.cards.length;
				game.log('#y捐款+' + trigger.cards.length)
				player.syncStorage('mengmushou');
			},
			group: ['mengmushou_achieve', 'mengmushou_fail'],
			subSkill: {
				achieve: {
					trigger: {
						global: 'gainAfter'
					},
					forced: true,
					skillAnimation: true,
					animationColor: 'fire',
					filter: function (event, player) {
						return player.storage.mengmushou >= 28;
					},
					content: function () {
						'step 0'
						game.log(player, '成功完成使命');
						player.awakenSkill('mengmushou');
						'step 1'
						player.gainMaxHp(2);
						'step 2'
						//player.recover(2);
						'step 3'
						player.addSkillLog('mengshentui');
					},
				},
				fail: {
					trigger: {
						global: 'dying'
					},
					forced: true,
					filter: function (event, player) {
						return event.player.hasSkill('mengshuguang');
					},
					content: function () {
						'step 0'
						game.log(player, '使命失败');
						player.awakenSkill('mengmushou');
						'step 1'
						player.loseMaxHp(2);
						trigger.player.recover(2);
						'step 2'
						player.addSkillLog('mengshentui');
					},
				},
			},
			derivation: 'mengshentui',
		},
		mengshentui: {
			trigger: {
				global: "useCard",
			},
			forced: true,
			filter: function (event, player) {
				if (event.player == event.targets[0]) return false;
				if (event.targets.length != 1) return false;
				if (player != event.targets[0] && player != event.player) return false;
				return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name));
			},
			content: function () {
				'step 0'
				var target = trigger.player.maxHp > trigger.targets[0].maxHp ? trigger.targets[0] : trigger.player;
				trigger.directHit.push(target);
			},
		},
		meng_jiziwuliangta: ['姬子', ["female", "hyyz_b3", "4/6", ["mengnuwu", "mengjiezhan", "mengxinhuo"], []], '柚衣'],
		mengnuwu: {
			audio: 2,
			trigger: {
				player: "damageBegin",
				source: "damageBegin",
			},
			usable: 1,
			filter(event, player) {
				return event.num > 0;
			},
			maxhp(target1, target2, player) {
				//数组，输入（角色1，角色2，视角）根据两名角色，判定体力值较高的一方，返回[该角色，名字/你]
				if (!target1 || !target1.isIn() ||
					!target2 || !target2.isIn() ||
					target1.hp == target2.hp) return [];
				var target = target1.hp > target2.hp ? target1 : target2;
				return [target, target == player ? '你' : get.translation(target)];
			},
			prompt(event, player) {
				var list = lib.skill.mengnuwu.maxhp(event.player, event.source, player);
				return `女武：${list.length && list[0] != player ? list[1] + '失去1点体力，' : ''}你摸${event.num * 2}张牌`;
			},
			async content(event, trigger, player) {
				let max = lib.skill.mengnuwu.maxhp(trigger.player, trigger.source, player);
				if (max.length > 0 && max[0] != player) await max[0].loseHp();
				player.draw(trigger.num * 2);
			},
		},
		mengjiezhan: {
			audio: 2,
			trigger: {
				player: "useCard",
			},
			filter(event, player) {
				return get.timetype(event.card) == 'notime' && get.tag(event.card, 'damage');
			},
			async cost(event, trigger, player) {
				const control = await player
					.chooseControl('baonue_hp', 'baonue_maxHp', 'cancel2', function (event, player) {
						let zhu = false;
						switch (get.mode()) {
							case 'identity': {
								zhu = player.isZhu;
								break;
							}
							case 'guozhan': {
								zhu = get.is.jun(player);
								break;
							}
							case 'versus': {
								zhu = player.identity == 'zhu';
								break;
							}
							case 'doudizhu': {
								zhu = player == game.zhu;
								break;
							}
						}
						if (zhu && player.hp <= 3) return false;
						if (player.hp == player.maxHp) return 'baonue_hp';
						if (player.hp < player.maxHp - 1 || player.hp <= 2) return 'baonue_maxHp';
						return 'baonue_hp';
					})
					.set('prompt', '竭战：是否【崩坏】，令此牌不能被响应且不计入使用次数？')
					.forResultControl();
				if (control && control != 'cancel2') {
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
				if (control == 'baonue_hp') await player.loseHp();
				else await player.loseMaxHp(true);

				trigger.directHit.addArray(game.players);
				if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
				const targets = await player
					.chooseTarget('令一名角色随机获得一张红色牌', true).set('ai', function (target) {
						return get.attitude(_status.event.player, target)
					})
					.forResultTargets();
				if (targets) {
					let card = get.cardPile2((card) => get.color(card) == 'red');
					if (card) targets[0].gain(card, 'gain2');
				}
			},
		},
		mengxinhuo: {
			audio: 1,
			trigger: {
				player: "dying",
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseTarget(get.prompt2('mengxinhuo'), lib.filter.notMe)
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hp == 1) {
								att += 2;
							}
							if (target.hp < target.maxHp) {
								att += 2;
							}
						}
						return att;
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				await target.addSkills('mengxinyan');
				target.gain(player.getCards('he'), player, 'giveAuto');
				const num = player.maxHp;
				await player.loseMaxHp(num);
				await target.gainMaxHp(num);
			},
		},
		mengxinyan: {
			trigger: {
				player: "useCard",
			},
			forced: true,
			filter(event, player) {
				return event.card && get.color(event.card) == 'red'
			},
			priority: 20,
			async content(event, trigger, player) {
				const control = await player.chooseControl('增加火属性', '伤害+1', '背水').forResultControl();
				if (control != '伤害+1') {
					game.setNature(trigger.card, "fire");
					trigger.card.storage.mengxinyan ? trigger.card.storage.mengxinyan += 1 : trigger.card.storage.mengxinyan = 1;
				}
				if (control != '增加火属性') {
					trigger.card.storage.mengxinyan ? trigger.card.storage.mengxinyan += 2 : trigger.card.storage.mengxinyan = 2;
				}
				if (control == '背水') {
					player.hyyzDianran(player.getCards('h', { color: 'red' }));
				}
			},
			group: 'mengxinyan_1',
			subSkill: {
				1: {
					trigger: {
						source: 'damageBegin1'
					},
					filter(event, player) {
						return event.card && event.card.storage.mengxinyan && event.card.storage.mengxinyan > 0;
					},
					forced: true,
					async content(event, trigger, player) {
						const num = trigger.card.storage.mengxinyan;
						if (num != 1) {
							trigger.num++;
						}
						if (num != 2) {
							game.setNature(trigger, "fire");
						}
					}
				}
			}
		},
		meng_shenlilingren: ['神里绫人', ["male", "hyyz_ys", 3, ["mengwenmou", "menggutu"], []], '微雨', ''],
		mengwenmou: {
			audio: 2,
			trigger: {
				player: ["useCard", "respond"],
			},
			frequent: true,
			priority: 10,
			filter: function (event, player) {
				return get.suit(event.card);
				var suit = get.suit(event.card), name = event.card.name;
				return event.card && (suit || name) && player.countCards('h', function (card) {
					return suit == get.suit(card) || name == card.name;
				}) > 0;
			},
			content: function () {
				if (player.countCards('h', function (card) {
					return get.suit(trigger.card) == get.suit(card);
				}) > 0) {
					if (trigger.card.name == 'sha') player.getStat().card.sha--;
					if (trigger.card.name == 'jiu') player.getStat().card.jiu--;
				} else {
					player.draw()
					//var suits = ['club', 'diamond', 'heart', 'spade'];
					//for (var i of player.getCards('h')) {
					//	suits.remove(get.suit(i));
					//};
					//if (suits.length > 0) {
					//	var card = get.cardPile2(function (card) {
					//		return suits.includes(get.suit(card));
					//	});
					//	if (card) player.gain(card, 'gain2');
					//}
				}
			},
			ai: {
				"maixie_defend": true,
				effect: {
					target: function (card, player, target) {
						if (target.countCards('h') > 3) return [1, 5];
						if (get.attitude(target, player) < 0) return [1, 1];
					},
				},
			}
		},
		menggutu: {
			audio: 3,
			trigger: {
				player: ["useCard", "respond"],
			},
			preHidden: true,
			filter: function (event, player) {
				return event.respondTo && event.respondTo[0] != player
			},
			forced: true,
			async content(event, trigger, player) {
				const color = await player
					.judge(function (card) {
						if (player.hp == player.maxHp) {
							if (get.color(card) == "red") return -1;
						}
						if (get.color(card) == "red") return 1;
						return 0;
					})
					.forResult('color');
				if (color) switch (color) {
					case "red":
						if (player.hp < player.maxHp) player.recover();
						break;
					case "black":
						player.draw();
						break;
					default:
						break;
				}
			},
		},
		meng_lizhilvzhe: ['理之律者', ["female", "shen", 3, ["mengsheyuan", "mengkanming"], []], '屺', ''],
		mengsheyuan: {
			audio: 2,
			onremove: true,
			intro: {
				name: "涉渊",
				mark: function (dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						dialog.add([player.getStorage('mengsheyuan'), 'vcard']);
						var card = player.getStorage('mengsheyuan')[player.getStorage('mengsheyuan').length - 1];
						var type = get.type(card, 'trick');
						dialog.addText('最后一张记录牌：');
						dialog.addSmall([[card], 'vcard']);
						dialog.addText('类型：' + get.translation(type));
						var str = '失去的牌数：<br>';
						str += '<li>相同类型：' + player.storage.mengsheyuan_lose[0] + '/1';
						str += '<li>不同类型：' + player.storage.mengsheyuan_lose[1] + '/2';
						dialog.addText(str);
					} else {
						dialog.addText('偷看女孩子的记录可是不礼貌的哦！');
					}
				},
			},
			trigger: {
				global: 'phaseEnd',
			},
			filter: function (event, player) {
				if (event.player == player) return false;
				return game.getGlobalHistory('cardMove', evt => {
					if (evt.name == 'lose' && evt.position == ui.discardPile || evt.name == 'cardsDiscard') {
						for (var i of evt.cards.filterInD('d')) {
							if (get.type(i) != 'equip') return true;
						}
					}
				});
			},
			frequent: true,
			content: function () {
				'step 0'
				var cards = [];
				game.getGlobalHistory('cardMove', evt => {
					if (evt.name == 'lose' && evt.position == ui.discardPile || evt.name == 'cardsDiscard') {
						for (var i of evt.cards.filterInD('d')) {
							if (get.type(i) != 'equip') {
								cards.push(i);
							}
						}
					}
				});
				if (cards.length) {
					var card = cards.randomGet();
					player.showCards(card);
					if (player.storage.mengsheyuan && player.storage.mengsheyuan.length > 0 && player.storage.mengsheyuan.includes(card.name)) player.unmarkAuto('mengsheyuan', [card.name]);
					player.markAuto('mengsheyuan', [card.name]);
					game.log('【涉渊】记录了', '#g【' + get.translation(card.name) + '】');
					player.addSkill('mengsheyuan_lose');
					player.storage.mengsheyuan_lose = [0, 0];
					player.syncStorage('mengsheyuan_lose');
				}
			},
			subSkill: {
				lose: {
					init: function (player) {
						player.storage.mengsheyuan_lose = [0, 0];
					},
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					forced: true,
					direct: true,
					silent: true,
					filter: function (event, player) {
						if (player.countDisabled() >= 5) return false;
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						return evt && evt.cards2 && evt.cards2.length > 0;
					},
					content: function () {
						'step 0'
						event.type = get.type(player.getStorage('mengsheyuan')[player.getStorage('mengsheyuan').length - 1], 'trick');//记录类型
						var evt = trigger.getl(player);
						for (var i of evt.cards2) {
							if (get.type(i, 'trick') == event.type) {
								player.storage.mengsheyuan_lose[0]++;
							}
							else {
								player.storage.mengsheyuan_lose[1]++;
							};
						}
						player.syncStorage('mengsheyuan_lose');
						'step 1'
						if (player.storage.mengsheyuan_lose[0] > 0 && player.countDisabled() < 5) {
							event.num = 1;
						} else if (player.storage.mengsheyuan_lose[1] > 1 && player.countDisabled() < 5) {
							event.num = 2;
						} else event.finish();
						'step 2'
						var list = [];
						for (var i = 1; i <= 5; i++) {
							if (player.hasEnabledSlot(i)) list.push('equip' + i);
						}
						list.sort();
						player.chooseControl(list, 'cancel2').set('prompt', '请选择废除一个装备栏').set('ai', function (evevt, player, list) {
							for (var i = 1; i <= 5; i++) {
								if (_status.event.list.includes('equip' + i) && !player.getEquip(i)) return 'equip' + i;
							}
							return _status.event.list.randomGet();
						}).set('list', list);
						'step 3'
						if (result.control && result.control != 'cancel2') {
							game.hyyzSkillAudio('meng', 'mengsheyuan', 3)
							player.storage.mengsheyuan_lose[event.num - 1] -= event.num;
							delete event.num;
							player.disableEquip(result.control);
							if (!player.hasSkill('mengsheyuan_usable')) {
								event.notype = event.type == 'basic' ? 'trick' : 'basic';
								var gains = [];
								while (gains.length < 2) {
									var card = get.cardPile(function (card) {
										return get.type(card, 'trick') == event.notype && !gains.includes(card);
									});
									if (card) gains.push(card);
								}
								if (gains.length == 2) player.gain(gains, 'gain2', 'log');
							}
							player.addTempSkill('mengsheyuan_usable');
							event.goto(1);
						} else event.finish();
					}
				},
				usable: {
					charlotte: true,
					sub: true,
				}
			}
		},
		mengkanming: {
			audio: 2,
			enable: ["chooseToUse",],
			filter: function (event, player) {
				if (!player.getStorage('mengsheyuan').length || player.hasSkill('mengkanming_used')) return false;
				if (player.countDisabled() < 5 || !player.countCards('hse')) return false;
				if (event.name == 'chooseToRespond' && event.responded) return false;
				for (var i of player.getStorage('mengsheyuan')) {
					if (get.type(i) != 'equip' && event.filterCard({ name: i, isCard: true }, player, event)) return true;
				}
				return false;
			},
			chooseButton: {
				dialog: function (event, player) {
					var list = [];
					var names = player.getStorage('mengsheyuan');
					for (var i of names) {
						if (i == 'sha') {
							list.push(['基本', '', 'sha']);
							for (var j of lib.inpile_nature) {
								//if (event.filterCard({ name: i, nature: j }, player, event))
								list.push(['基本', '', 'sha', j]);
							}
						}
						else if (get.type2(i) == 'trick') list.push(['锦囊', '', i]);
						else if (get.type(i) == 'basic') list.push(['基本', '', i]);
					}
					return ui.create.dialog('堪名', [list, 'vcard']);
				},
				filter: function (button, player) {
					return _status.event.getParent().filterCard({ name: button.link[2] }, player, _status.event.getParent());
				},
				check: function (button) {
					if (_status.event.getParent().type != 'phase') return 1;
					var player = _status.event.player;
					if (['wugu', 'zhulu_card', 'yiyi', 'lulitongxin', 'lianjunshengyan', 'diaohulishan'].includes(button.link[2])) return 0;
					return player.getUseValue({
						name: button.link[2],
						nature: button.link[3],
					});
				},
				backup: function (links, player) {
					return {
						audio: 'mengkanming',
						filterCard: function () { return true },
						check: function (card) {
							return 10 - get.value(card);
						},
						position: 'hes',
						viewAs: {
							name: links[0][2],
							nature: links[0][3],
							isCard: false,
						},
						precontent: function () {
							player.addTempSkill('mengkanming_used');
						},
					}
				},
				prompt: function (links, player) {
					return '将一张牌当做' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '使用';
				},
			},
			hiddenCard: function (player, name) {
				if (player.countCards('hes') && player.getStorage('mengsheyuan').includes(name)) return true;
				return false;
			},
			group: ['mengkanming_log', 'mengkanming_after'],
			subSkill: {
				used: {
					charlotte: true,
				},
				log: {
					trigger: {
						global: "changeHp",
					},
					charlotte: true,
					silent: true,
					filter: function (event, player) {
						return event.getParent(2).skill == 'mengkanming_backup' && !player.hasSkill('mengkanming_log2');
					},
					content: function () {
						game.log(trigger.player, '改变了体力值', '#g【堪名】②', '失效')
						player.addTempSkill('mengkanming_log2');
					},
				},
				log2: {
					charlotte: true,
				},
				after: {
					trigger: {
						player: 'useCardAfter'
					},
					filter: function (event, player) {
						return event.skill == 'mengkanming_backup' && !player.hasSkill('mengkanming_log2');
					},
					direct: true,
					content: function () {
						'step 0'
						if (player.hasSkill('mengkanming_log2')) {
							player.removeSkill('mengkanming_log2');
						}
						'step 1'
						event.count = 0;
						'step 2'
						if (player.countDisabledSlot() > 0) {
							var list = [];
							for (var i = 1; i <= 5; i++) {
								if (player.hasDisabledSlot(i)) list.push('equip' + i);
							}
							player.chooseControl(list, 'cancel2').set('prompt', '堪名：是否恢复一个装备栏？').set('ai', function (evevt, player, list) {
								return _status.event.list.randomGet();
							}).set('list', list);
						} else event.finish()
						'step 3'
						if (result.control && result.control != 'cancel2') {
							game.hyyzSkillAudio('meng', 'mengkanming', 1, 2)
							player.enableEquip(result.control);
							event.count++;
							if (event.count >= 2) {
								event.count -= 2;
								player.chooseDrawRecover(true);
							}
							event.goto(2)
						};

					}
				}
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter: function (player) {
					if (player.countCards('hse') < 1) return false;
				},
				order: 1,
				result: {
					player: function (player) {
						if (_status.event.dying) return get.attitude(player, _status.event.dying);
						return 1;
					},
				},
			},
		},
		meng_lisushang: ['李素裳', ["female", "hyyz_b3", 3, ["mengzhejian", "mengtaixu", "mengjianxin"], []], '微雨'],//
		mengzhejian: {
			audio: 2,
			trigger: {
				global: "mengzhejian",
			},
			direct: true,
			forced: true,
			locked: true,
			content: function () {
				player.draw();
			},
			mod: {
				globalFrom: function (from, to) {
					if (to.getEquip(1)) return -Infinity;
				},
			},
			group: "mengzhejian_gain",
			global: "mengzhejian_lose",
			subSkill: {
				lose: {
					trigger: {
						player: ["loseAfter"],
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter: function (event, player) {
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						if (!evt || !evt.es || !evt.es.length > 0) return false;
						if (event.name == 'equip' && event.player == player) return false;
						for (var i of evt.es) {
							if (get.subtype(i, false) == 'equip1') return true;
						}
						return false;
					},
					forced: true,
					silent: true,
					popup: false,
					content: function () {
						game.hyyzSkillAudio('meng', 'mengzhejian', 1)
						event.trigger('mengzhejian');
					},
					sub: true,
				},
				gain: {
					forced: true,
					silent: true,
					popup: false,
					trigger: {
						global: ["equipAfter"],
					},
					filter: function (event, player) {
						return get.subtype(event.card) == 'equip1';
					},
					content: function () {
						game.hyyzSkillAudio('meng', 'mengzhejian', 2)
						event.trigger('mengzhejian');
					},
					sub: true,
				},
			},
		},
		mengtaixu: {
			audio: 2,
			trigger: {
				player: "useCardToPlayered",
			},
			filter: function (event, player) {
				if (event.targets.length != 1 || !event.cards || event.cards.length != 1) return false;
				return event.target.getEquips(1).length || event.target.hasEmptySlot(1);
			},
			prompt2: function (event, player) {
				if (event.target.getEquips(1).length) {
					return '获得' + get.translation(event.target.getEquips(1)) + '并令其本回合不能使用或打出牌';
				} else {
					return '将' + get.translation(event.cards[0]) + '置入其武器栏';
				}
			},
			logTarget: 'target',
			content: function () {
				if (trigger.target.getEquips(1).length) {
					trigger.getParent().excluded.add(trigger.target);
					trigger.target.give(trigger.target.getEquips(1), player, 'giveAuto');
					trigger.target.addhyyzBuff('hyyzBuff_dongjie');
				} else {
					var card = trigger.cards[0];
					trigger.target.$gain2(card);
					trigger.target.equip(card);
				}
			},
		},
		mengjianxin: {
			audio: 2,
			trigger: {
				player: "shaBegin",
			},
			forced: true,
			filter: function (event, player) {
				return event.card.nature == 'ice' || get.natureList(event.card).includes('ice');
			},
			content: function () { },
			group: ["mengjianxin_disable"],
			subSkill: {
				disable: {
					audio: "mengjianxin",
					trigger: {
						global: "gameDrawAfter",
						player: "enterGame",
					},
					forced: true,
					content: function () {
						player.disableEquip(1);
					},
				}
			},
			mod: {
				cardname: function (card) {
					if (get.subtype(card, false) == 'equip1') return 'sha';
				},
				cardUsable: function (card, player) {
					if (!card.cards || card.name != 'sha') return;
					for (var i of card.cards) {
						if (lib.card[i.name].subtype == 'equip1') return Infinity;
					}
				},
				cardnature: function (card) {
					var info = get.translation(card.name);
					if (lib.card[card.name].subtype == 'equip1' && info.indexOf('剑') != -1) return 'ice';
				},
				targetInRange: function (card) {
					if (!card.cards || card.name != 'sha') return;
					for (var i of card.cards) {
						var info = get.translation(i.name);
						if (lib.card[i.name].subtype == 'equip1' && info.indexOf('剑') != -1) return true;
					}
				},
			},
		},
		meng_wu_fuxuan: ['符玄', ["female", "hyyz_xt", 5, ["mengqiongguan", "mengbie"], ["die:meng_fuxuan",]], '慕辞', ''],
		mengqiongguan: {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return game.hasPlayer(function (current) {
					return !current.hasSkill('mengqiongguan_buff');
				});
			},
			filterTarget(card, player, target) {
				return !target.hasSkill('mengqiongguan_buff');
			},
			content() {
				target.addSkills(['mengqiongguan_buff', 'mengjianzhi']);
				player.addSkills(['mengqiongguan_buff', 'mengjianzhi']);
			},
			derivation: ["mengqiongguan_buff", "mengjianzhi"],
			group: ["mengqiongguan_game"],
			subSkill: {
				game: {
					trigger: {
						global: "phaseBefore",
						player: "enterGame",
					},
					direct: true,
					filter: function (event, player) {
						return game.hasPlayer(current => !current.hasSkill('mengqiongguan_buff')) && (event.name != 'phase' || game.phaseNumber == 0);
					},
					content: function () {
						'step 0'
						player.chooseTarget('请选择“穷观阵”保护的对象', '能够将其每回合超过1点的伤害转移给你', function (card, player, target) {
							return !target.hasSkill('mengqiongguan_buff');
						}).set('ai', function (target) {
							var player = _status.event.player, att = get.attitude(player, target);
							if (att > 0) {
								if (target == player) return att + 10 - target.hp;
								else return att + 100 - target.hp;
							}
							if (att == 0) return Math.random();
							return att;
						});
						'step 1'
						if (result.bool) {
							var target = result.targets[0];
							player.logSkill('mengqiongguan', target);
							target.addSkill('mengqiongguan_buff');
							target.addSkill('mengjianzhi');
							player.addSkill('mengqiongguan_buff');
							player.addSkill('mengjianzhi');
							player.when('die').assign({
								forceDie: true,
								charlotte: true,
								firstDo: true,
							}).then(() => {
								game.countPlayer(function (current) {
									if (current.hasSkill('mengqiongguan_buff')) current.removeSkill('mengqiongguan_buff');
									if (current.hasSkill('mengjianzhi')) current.removeSkill('mengjianzhi');
								})
							});
						}
					},
					sub: true,
				},
			},
			ai: {
				order: 10,
				expose: 0.2,
				result: {
					target: function (player, target) {
						if (target == player) return 10 - target.hp;
						else return 100 - target.hp;
					},
				},
			},
		}, mengqiongguan_buff: {
			audio: 1,
			mark: true,
			intro: {
				name: "穷观阵",
				content: function (storage, player) {
					if (!player.hasSkill('mengqiongguan')) return '将超过1点的伤害转移给符玄';
					return '正在保护[穷观阵]内的其他角色';
				},
			},
			trigger: {
				player: "damageBegin3",
			},
			forced: true,
			filter(event, player) {
				if (player.hasSkill('mengqiongguan')) return false;
				if (!game.hasPlayer(function (current) {
					return current != player && current.hasSkill('mengqiongguan');
				})) return false;
				return player.getHistory('damage', (evt) => evt != event).length > 0 || event.num > 1;
			},
			logTarget(event, player) {
				return game.findPlayer(function (current) {
					return current != player && current.hasSkill('mengqiongguan');
				})
			},
			async content(event, trigger, player) {
				let target = game.findPlayer(function (current) {
					return current != player && current.hasSkill('mengqiongguan');
				});
				if (player.getHistory('damage', (evt) => evt != trigger).length > 0) {
					trigger.cancel();
					game.log('#g【穷观阵】', player, '转移此次伤害');
					let next = target.damage();
					next.cards = trigger.cards || [];
					next.cards = trigger.card;
					next.num = trigger.num;
					if (trigger.source) next.source = trigger.source;
					next.unreal = trigger.unreal;
					next.nature = trigger.nature;
					await next;
				}
				else {
					let move = trigger.num - 1;
					trigger.num = 1;
					trigger.hyyzshiying = move;
					target.when({
						global: 'damageEnd'
					}).filter((event, player) => {
						return event.hyyzshiying;
					}).then(() => {
						let next = player.damage();
						next.cards = trigger.cards || [];
						next.cards = trigger.card;
						if (trigger.hyyzshiying) next.num = trigger.hyyzshiying;
						next.source = trigger.source;
						next.unreal = trigger.unreal;
						next.nature = trigger.nature;
					})
				}
			},
		},
		mengjianzhi: {
			audio: 2,
			mark: true,
			intro: {
				name: "鉴知",
				content: "获得此技时加1点体力上限并回复1点体力，失去此技时减1点体力上限。<br>你每回合首次使用【杀】造成伤害时，此伤害+1。",
			},
			init(player) {
				player.gainMaxHp();
				player.recover();
			},
			onremove(player) {
				player.loseMaxHp();
			},
			trigger: {
				source: "damageBegin1",
			},
			forced: true,
			usable: 1,
			filter(event, player) {
				return event.card?.name == 'sha';
			},
			content() {
				trigger.num++;
			},
		},
		mengbie: {
			audio: 'mengqiongguan',
			trigger: {
				player: ["damageEnd", "loseHpEnd", "recoverEnd"],
			},
			filter(event, player) {
				var num = 0;
				player.getHistory('damage', function (evt) {
					num += evt.num;
				});
				return player.hp < player.getDamagedHp() && num > 0;
			},
			round: 1,
			forced: true,
			content() {
				var num = 0;
				player.getHistory('damage', function (evt) {
					num += evt.num;
				});
				player.recover(num);
			},
		},
		meng_old_zhongyanzhilvzhe: ['终焉之律者', ["female", "hyyz_b3", 5, ["mengpingji_old", "mengzhaoxi_old", "mengcifan_old"], ['zhu', 'die:meng_zhongyanzhilvzhe']], '拾壹', ''],
		mengpingji_old: {
			audio: "mengpingji",
			trigger: {
				global: 'damageEnd'
			},
			filter: function (event, player) {
				if (!event.source) return false;
				return player.storage.mengpingji_old || player.countCards('he');
			},
			direct: true,
			content: function () {
				'step 0'
				if (player.storage.mengpingji_old) {
					player.logSkill('mengpingji_old');
					var num = 0, list = player.storage.mengpingji_old;
					if (trigger.player == list['player']) {
						game.log('<li>目标均为：', trigger.player);
						num++;
					} else game.log('<li>目标不同');
					if (trigger.source == list['source']) {
						game.log('<li>来源均为：', trigger.source);
						num++;
					} else game.log('<li>来源不同');
					if (trigger.num == list['num']) {
						game.log('<li>点数均为：', trigger.num);
						num++;
					} else game.log('<li>点数不同');
					if (trigger.nature == undefined && list['nature'] == undefined) {
						game.log('<li>属性均为：', 'undefined');
						num++;
					} else if (trigger.nature == list['nature']) {
						game.log('<li>属性均为：', trigger.nature);
						num++;
					} else game.log('<li>属性不同');
					if (num > 0) player.draw(num);
					delete player.storage.mengpingji_old;
					event.finish();
				} else {
					player.chooseToDiscard('he', '平寂：你可以弃置一张牌并记录此伤害').set('ai', function (card) {
						return 8 - get.value(card);
					});
				}
				'step 1'
				if (result.bool) {
					player.logSkill('mengpingji_old');
					game.log('记录此伤害：<br>', '<li>属性：', trigger.nature, '<li>点数：', trigger.num, '<li>来源：', trigger.source, '<li>目标：', trigger.player);
					player.storage.mengpingji_old = {
						'nature': trigger.nature,
						'num': trigger.num,
						'source': trigger.source,
						'player': trigger.player,
					};
				}
			}
		},
		mengzhaoxi_old: {
			audio: "mengzhaoxi",
			mod: {
				cardname: function (card, player, name) {
					if (get.position(card) == 'h') {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(card)).length) return 'huogong'
					}
				},
			},
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				if (get.itemtype(event.cards) != 'cards' || event.cards.length != 1) return false;
				return get.name(event.cards[0]) != 'huogong' && get.name(event.card) == 'huogong';
			},
			forced: true,
			locked: true,
			content: function () { },
			group: 'mengzhaoxi_old_use',
			subSkill: {
				use: {
					trigger: {
						global: 'useCardAfter'
					},
					filter: function (event, player) {
						if (event.targets.length != 1) return false;
						if (event.player == player || _status.currentPhase != event.player) return false;
						if (event.player.getHistory('useCard', evt => evt && evt != event && evt.targets.length == 1).length) return false;
						return player.canUse('huogong', event.targets[0]) && player.countCards('h');
					},
					forced: true,
					locked: false,
					content: function () {
						'step 0'
						var next = player.chooseToUse(function (card, player, event) {
							if (get.name(card) != 'huogong') return false;
							return lib.filter.cardEnabled.apply(this, arguments);
						});
						next.set('prompt', '朝夕：是否对' + get.translation(trigger.targets[0]) + '使用一张【火攻】？');
						next.set('logSkill', 'mengzhaoxi_old');
						next.set('filterTarget', function (card, player, target) {
							if (target != _status.event.sourcex && !ui.selected.targets.includes(_status.event.sourcex)) return false;
							return lib.filter.targetEnabled.apply(this, arguments);
						})
						next.set('targetRequired', true)
						next.set('sourcex', trigger.targets[0]);
					},

				}
			},
		},
		mengcifan_old: {
			audio: "mengcifan",
			group: ['mengcifan_old_top', 'mengcifan_old_wugu'],
			subSkill: {
				top: {
					audio: 'mengcifan_old',
					trigger: {
						source: 'damageSource'
					},
					filter: function (event, player) {
						if (get.itemtype(event.cards) != 'cards') return false;
						for (var i of event.cards) {
							if (get.position(i, true) == 'o') return true;
						}
					},
					prompt: function (event, player) {
						return '赐繁：是否将' + get.translation(event.cards) + '置于牌堆顶？';
					},
					content: function () {
						"step 0"
						event.cards = [];
						for (var i of trigger.cards) {
							if (get.position(i, true) == 'o') event.cards.push(i);
						}
						if (event.cards.length > 1) {
							var next = player.chooseToMove('赐繁：将牌按顺序置于牌堆顶');
							next.set('list', [['牌堆顶', event.cards]]);
							next.set('reverse', ((_status.currentPhase && _status.currentPhase.next) ? get.attitude(player, _status.currentPhase.next) > 0 : false));
							next.set('processAI', function (list) {
								var cards = list[0][1].slice(0);
								cards.sort(function (a, b) {
									return (_status.event.reverse ? 1 : -1) * (get.value(b) - get.value(a));
								});
								return [cards];
							});
						}
						"step 1"
						if (result.bool && result.moved && result.moved[0].length) cards = result.moved[0].slice(0);
						while (cards.length) {
							var card = cards.pop();
							if (get.position(card, true) == 'o') {
								card.fix();
								ui.cardPile.insertBefore(card, ui.cardPile.firstChild);
								game.log(player, '将', card, '置于牌堆顶');
							}
						}
						game.updateRoundNumber();
					},
				},
				wugu: {
					audio: 'mengcifan_old',
					trigger: {
						global: 'dyingAfter'
					},
					filter: function (event, player) {
						return event.player.isAlive();
					},
					direct: true,
					content: function () {
						var card = {
							name: 'wugu',
							isCard: true,
						}
						player.chooseUseTarget('###是否发动【赐繁】？###视为使用一张【五谷丰登】', card, false, 'nodistance').logSkill = 'mengcifan_old';
					}
				},
			},
		},
		meng_sp_kafuka: ['卡芙卡', ["female", "hyyz_xt", 3, ["menglaixin", "mengyueluo"], []], '微雨', ''],
		menglaixin: {
			audio: 8,
			logAudio: () => false,
			trigger: {
				global: 'phaseBegin'
			},
			filter(event, player) {
				return event.player != player && player.countCards('he') > 0;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCard('he',
					'来信：你可以交给其一张牌，然后其执行一项',
					'1.将此牌交给你，然后与你各失去1点体力。<br>2.令你摸两张牌并移动场上一张牌。<br>3.与你各摸一张牌，然后本回合不能对你使用牌。')
					.set('ai', function (card) {
						var att = _status.event.att;
						if (att > 0) {
							return 6 - get.value(card);
						} else {
							if (player.hp <= 2) return 0;
							else return 10 - get.value(card);
						};
					})
					.set('att', get.attitude2(trigger.player))
					.forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				await player.give(event.cards, trigger.player, 'giveAuto');
				var name = get.translation(player);
				var list = [
					'将' + get.translation(event.cards) + '交给' + name + '，然后与' + name + '各失去1点体力。',
					'令' + name + '摸两张牌并移动场上一张牌',
					'与' + name + '各摸一张牌，然后本回合不能对' + name + '使用牌',
				]
				const index = await trigger.player.chooseControlList(list, '选择一项', true)
					.set('ai', function () {
						var targetx = _status.event.targetx;
						var playerx = _status.event.playerx;
						var att = get.attitude(targetx, playerx);
						if (att >= 0) {
							return 1;
						} else {
							if (get.effect(targetx, { name: 'losehp' }, targetx, targetx) >= 0) return 0;
							if (targetx.hp + targetx.countCards('h', 'tao') > playerx.hp + playerx.countCards('h', 'tao')) return 0;
							if (game.players.length != 2) return 2;
							return 1;
						}
					})
					.set('targetx', trigger.player).set('playerx', player)
					.forResult('index');
				if (index != undefined) {
					switch (index) {
						case 0: {
							game.hyyzSkillAudio('meng', 'menglaixin', 1, 2, 3, 4)
							await trigger.player.give(event.cards, player, 'giveAuto');
							await trigger.player.loseHp();
							await player.loseHp();
							break;
						}
						case 1: {
							game.hyyzSkillAudio('meng', 'menglaixin', 5, 6)
							await player.draw(2);
							await player.moveCard();
							break;
						}
						case 2: {
							game.hyyzSkillAudio('meng', 'menglaixin', 7, 8)
							await trigger.player.draw();
							await player.draw();
							trigger.player.addTempSkill('menglaixin_no');
						}
					}
				}
			},
			mod: {
				targetEnabled(card, player, target) {
					if (player.hasSkill('menglaixin_no')) return false;
				},
			},
			subSkill: {
				no: {
					charlotte: true,
					mark: true,
					intro: {
						content(player, storage) {
							return '不能对卡夫卡使用牌';
						},
					},
				}
			}
		},
		mengyueluo: {
			audio: 2,
			trigger: {
				player: "gainAfter",
				global: "loseAsyncAfter",
			},
			filter(event, player) {
				var evt = event.getParent('phaseDraw');
				if (evt && evt.player == player) return false;
				return event.getg(player).length > 0 && event.getParent(3).name != 'mengyueluo';
			},
			async cost(event, trigger, player) {
				const cards = trigger.getg(player);
				event.result = await player
					.chooseCardTarget({
						prompt: get.prompt('mengyueluo'),
						prompt2: '将其中一张红/黑色牌当【乐不思蜀】/【兵粮寸断】置入其他角色的判定区内。',
						cards: cards.filter(card => player.countCards('he', (cardx) => cardx == card)),
						filterCard(card) {
							return cards.includes(card);
						},
						filterTarget(card, player, target) {
							let cardx = get.autoViewAs({ name: get.color(ui.selected.cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, ui.selected.cards);
							return player != target && target.canAddJudge(cardx)
						},
						ai1(card) {
							return 12 - get.value(card);
						},
						ai2(target) {
							let cardx = get.autoViewAs({ name: get.color(ui.selected.cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, ui.selected.cards);
							return get.effect(target, cardx, player, player) || -get.attitude2(target);
						},
					})
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				let cards = event.cards, target = event.targets[0];
				player.$give(cards, target);
				await target.addJudge({ name: get.color(cards[0], false) == 'red' ? 'lebu' : 'bingliang' }, event.cards);
				if (!game.hasPlayer(current => {
					if (current == player) return false;
					return trigger.getl(current).cards2.length;
				})) {
					await player.chooseDrawRecover();
				} else {
					await player.useCard({ name: 'sha', nature: 'thunder', isCard: true }, game.filterPlayer(current => current != player));
					await player.turnOver();
					await player.loseMaxHp();
				}
			},
		},
		meng_luocharen: ['罗刹人', ["male", "hyyz_b3", 3, ["mengnishang", "mengshouwang", "mengwenrun"], []], '柚衣'],
		"mengnishang": {
			audio: 1,
			mod: {
				targetEnabled(card, player, target, now) {
					if (card.name == 'shunshou' || card.name == 'guohe') return false;
				},
			},
			global: "mengnishang_gain",
			subSkill: {
				gain: {
					audio: 'mengnishang',
					enable: "phaseUse",
					usable: 1,
					filter: function (event, player) {
						if (!game.countPlayer((current) => current.hasSkill('mengnishang'))) return false;
						return player.countCards('he') >= 2 && !player.hasSkill('mengnishang');
					},
					filterCard: true,
					position: 'he',
					selectCard: 2,
					discard: false,
					lose: false,
					delay: 0,
					filterTarget(card, player, target) {
						return target.hasSkill('mengnishang');
					},
					selectTarget() {
						if (game.countPlayer((current) => current.hasSkill('mengnishang')) > 1) return 1;
						return -1;
					},
					check(card) {
						if (card.name == 'du') return 20;
						if (get.owner(card).countCards('h') < get.owner(card).hp) return 0;
						return 5 - get.value(card);
					},
					async content(event, trigger, player) {
						let target = event.targets[0];
						await player.give(event.cards, target);
						const cards = await target
							.chooseCard('交给' + get.translation(player) + '一张牌', 'he', true, (card) => !event.cards.includes(card))
							.set('ai', (card) => 15 - get.value(card))
							.forResultCards()
						if (cards) await player.gain(cards, target, 'give');
					},
					ai: {
						order: 10,
						result: {
							player(player, target) {
								var val = 0.8;
								if (ui.selected.cards[0]) val -= get.value(ui.selected.cards[0]);
								if (ui.selected.cards[1]) val -= get.value(ui.selected.cards[1]);
								return val;
							},
							target: 2,
						}
					}
				},
			},
		},
		"mengshouwang": {
			audio: 2,
			trigger: {
				global: 'useCardToPlayered'
			},
			filter(event, player) {
				if (event.card.name != 'sha') return false;
				if (!player.countCards('he', function (card) {
					return get.type2(card) != 'trick';
				})) return false;
				var evt = lib.skill.mengshouwang.getLastUsed(event.player, event.getParent());
				if (!evt || !evt.card) return false;
				return evt.targets && evt.targets.includes(event.target);
			},
			getLastUsed: function (player, event) {
				var history = player.getAllHistory('useCard', function (evt) {
					return evt.card.name == 'sha' && evt.targets;
				}), index;
				if (event) index = history.indexOf(event) - 1;
				else index = history.length - 1;
				if (index >= 0) return history[index];
				return false;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseCardTarget({
					prompt: get.prompt('mengshouwang'),
					prompt: '弃置一张非锦囊牌，对其攻击范围内的角色造成1点伤害',
					filterCard: function (card) {
						return get.type2(card) != 'trick';
					},
					position: 'he',
					filterTarget: function (card, player, target) {
						return trigger.player.inRange(target);
					},
					ai1: function (card) {
						return 8 - get.value(card);
					},
					ai2: function (target) {
						return get.damageEffect(target, player, player);
					}
				}).forResult();
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				await player.discard(event.cards);
				await event.targets[0].damage();
			},
		},
		"mengwenrun": {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filter: function (event, player) {
				return player.countCards('e');
			},
			filterCard: true,
			position: 'e',
			filterTarget: true,
			check(card) {
				return 8 - get.value(card);
			},
			content() {
				'step 0'
				target.recover();
				target.addSkill('mengwenrun_1');
				'step 1'
				if (!target.getEquips('equip1')?.length) target.draw();
			},
			ai: {
				order: 1,
				target: function (player, target) {
					return 2;
				}
			},
			subSkill: {
				1: {
					trigger: {
						player: 'phaseBegin'
					},
					charlotte: true,
					popup: true,
					forced: true,
					direct: true,
					content: function () {
						player.addTempSkill('mengwenrun_2', { player: 'phaseAfter' });
						player.removeSkill('mengwenrun_1'),
							player.storage.mengwenrun_2++;
						player.updateMarks('mengwenrun_2');
					}
				},
				2: {
					charlotte: true,
					mark: true,
					intro: {
						content: "出杀次数+#",
					},
					init: function (player, skill) {
						if (!player.storage[skill]) player.storage[skill] = 0;
					},
					onremove: true,
					mod: {
						maxHandcard: function (player, num) {
							return num + player.storage.mengwenrun_2;
						},
						cardUsable: function (card, player, num) {
							if (card.name == 'sha') return num + player.storage.mengwenrun_2;
						},
					},
				}
			},
			"_priority": 0,
		},
		meng_shenlilinghua: ['神里绫华', ["female", "hyyz_ys", 3, ["menglinren", "mengqingzi"], []], '七夕月', ''],
		menglinren: {
			audio: 3,
			trigger: {
				player: 'useCard1'
			},
			filter: function (event, player) {
				if (!event.targets || event.targets.length != 1) return false;
				return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name));
			},
			check: function (event, player) {
				var types = lib.skill.menglinren.respond(event.card);
				var func = function (player) {
					var cards = player.getCards('h', function (card) {
						return types.includes(get.type2(card));
					});
					var val = 0;
					for (var i of cards) {
						val += get.value(i, player);
					};
					return [val, cards.length];
				}
				return func(player)[0] <= func(event.targets[0])[0] || func(player)[1] < 3;
			},
			respond: function (card) {
				var respond = [];
				if (get.type(card) == 'basic') respond.push('basic');
				else if (get.type(card) == 'trick') {
					respond.push('trick');
					if (['nanman', 'wanjian', 'juedou'].includes(card.name)) respond.push('basic');
				};
				return respond;
			},
			content: function () {
				'step 0'
				event.types = lib.skill.menglinren.respond(trigger.card);
				'step 1'
				player.addTempSkill('menglinren_no');
				event.cards1 = player.getCards('h', function (card) {
					return event.types.includes(get.type2(card));
				});
				player.give(event.cards1, trigger.targets[0], 'giveAuto');
				trigger.targets[0].addTempSkill('menglinren_no');
				event.cards2 = trigger.targets[0].getCards('h', function (card) {
					return event.types.includes(get.type2(card));
				});
				trigger.targets[0].give(event.cards2, player, 'giveAuto');
				'step 2'
				trigger.targets[0].addGaintag(event.cards1, 'menglinren');
				player.addGaintag(event.cards2, 'menglinren');
				player.chooseTarget('选择一名角色成为' + get.translation(event.card) + '的额外目标（无视合法性）').set('ai', function (target) {
					var player = _status.event.player;
					var card = _status.event.getTrigger().card;
					return get.effect(target, card, player, player) && !_status.event.targetx.includes(target) || target == player;
				}).set('targetx', trigger.targets);
				'step 3'
				if (result.bool) {
					if (!trigger.targets.includes(result.targets[0])) trigger.targets.push(result.targets[0]);
					game.log('#g【凛刃】', '强制更新此牌的目标为', '<li>' + get.translation(trigger.targets));
				}
			},
			subSkill: {
				no: {
					mod: {
						"cardEnabled2": function (card) {
							if (get.itemtype(card) == 'card' && card.hasGaintag('menglinren')) return false;
						},
						cardDiscardable: function (card) {
							if (card.hasGaintag('menglinren')) return false;
						},
					},
					onremove: function (player) {
						player.removeGaintag('menglinren');
					},
				}
			}
		},
		mengqingzi: {
			audio: 3,
			trigger: {
				global: 'useCard2'
			},
			forced: true,
			filter: function (event, player) {
				if (!event.targets.includes(player) && event.player != player) return false;
				return event.targets.length > 1;
			},
			content: function () {
				'step 0'
				if (trigger.targets.includes(player)) {
					game.log('#g【顷姿】', '将', player, '从目标中移除');
					trigger.targets.remove(player);
				}
				'step 1'
				if (trigger.player == player) {
					game.log('#g【顷姿】', '此牌结算两次');
					trigger.effectCount++;
				}
				if (!trigger.targets.length) event.finish();
				'step 2'
				player.chooseTarget('你可以取消其中一个目标或令一个目标摸一张牌', function (card, player, target) {
					return _status.event.targetx.includes(target);
				}).set('targetx', trigger.targets).set('ai', function (target) {
					var player = _status.event.player;
					return -get.effect(target, _status.event.getTrigger().card, player, player)
				});
				'step 3'
				if (result.bool) {
					event.target = result.targets[0];
					player.chooseControl('此牌无效', '摸一张牌');
				} else event.finish();
				'step 4'
				if (result.control == '此牌无效') {
					game.log('#g【顷姿】', '此牌对', event.target, '无效');
					trigger.excluded.add(event.target);
				}
				else event.target.draw();
			}
		},
		meng_kuisangti: ['奎桑提', ["male", "hyyz_other", 5, ["mengxuexing", "mengpijing", "mengaoan"], []], '流萤一生推', ''],
		mengxuexing: {
			audio: 6,
			logAudio: () => [
				"ext:忽悠宇宙/asset/meng/audio/mengxuexing1",
				"ext:忽悠宇宙/asset/meng/audio/mengxuexing2",
				"ext:忽悠宇宙/asset/meng/audio/mengxuexing3",
			],
			trigger: {
				source: "damageSource"
			},
			forced: true,
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.addhyyzBuff('hyyzBuff_zhongshang');
			},
			group: 'mengxuexing_ohhh',
			subSkill: {
				ohhh: {
					logAudio: () => [
						"ext:忽悠宇宙/asset/meng/audio/mengxuexing4",
						"ext:忽悠宇宙/asset/meng/audio/mengxuexing5",
						"ext:忽悠宇宙/asset/meng/audio/mengxuexing6",
					],
					forced: true,
					trigger: {
						player: "useCard",
					},
					filter: function (event, player) {
						if (!player.storage.mengaoan) return false;
						return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name)) && game.hasPlayer(function (current) {
							return current.hashyyzBuff('hyyzBuff_zhongshang');
						});
					},
					content: function () {
						trigger.directHit.addArray(game.filterPlayer(function (current) {
							return current.hashyyzBuff('hyyzBuff_zhongshang');
						}));
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter: function (player, tag, arg) {
							return arg.target.hasSkill('mengkui');
						},
					},
				}
			}
		},
		mengpijing: {
			audio: 5,
			enable: "phaseUse",
			usable: 1,
			async content(event, trigger, player) {
				if (player.hujia > 0) {
					var num = player.hujia;
					player.changeHujia(-num);
					player.draw(player.storage.mengaoan ? num + 1 : num);
				} else {
					await player.loseHp();
					player.changeHujia(player.storage.mengaoan ? 3 : 2);
				}
			},
			ai: {
				order: 8,
				result: {
					player(player) {
						if (player.hp < 2 || player.hujia) return -1;
						return 1;
					},
				},
			},
		},
		mengaoan: {
			audio: 5,
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return Math.ceil(event.player.hp / 2) > 0;
			},
			prompt(event, player) {
				var num = Math.ceil(event.player.hp / 2);
				return '傲岸：失去' + num + '点体力，你进入一轮全盛姿态，然后你[重伤]并对一名角色造成1点伤害';
			},
			filterTarget: true,
			async content(event, trigger, player) {
				player.loseHp(Math.ceil(player.hp / 2));
				event.targets[0].damage();
				player.storage.mengaoan = true;
				lib.skill.mengpijing.usable = 2
				player.addTempSkill('mengquansheng', { player: 'phaseBegin' })
				player.when({
					player: 'phaseBegin'
				}).then(() => {
					lib.skill.mengpijing.usable = 1;
					delete player.storage.mengaoan;
				})
			},
			ai: {
				order: 10,
				result: {
					player(player) {
						return player.hp > 1;
					}
				}
			},
		},
		mengquansheng: {
			audio: 'mengaoan',
			mark: true,
			marktext: '盛',
			intro: {
				name: "全盛姿态",
				content: '所有技能得到加强<br>你造成伤害后回复一点体力',
			},
			trigger: {
				source: 'damageSource'
			},
			forced: true,
			content: function () {
				game.log('#g全盛姿态，' + get.translation(player) + '恢复1点体力');
				player.recover();
			},
		},
		"mengweie_info": "伪恶|每轮开始时，令有〖曙光〗的角色摸两张牌；然后你可以令一名角色获得〖曙光〗并视为对其造成过1点伤害。",
		"mengshuguang_info": "曙光|你的手牌上限+2。其他角色的基本牌因弃置进入弃牌堆后，其可以将这些牌交给你。",
		"mengmushou_info": "幕手|使命技。锁定技，你不能成为黑色锦囊牌的目标。<br><span class=greentext>成功</span>：有〖曙光〗的角色获得二十八张牌后，你加两点体力上限并回复2点体力。<br><span class=firetext>失败</span>：有〖曙光〗的角色进入濒死状态时，你减2点体力上限并令其回复2点体力。<br><hr><span class=thundertext>〖幕手〗失效后，你获得〖身退〗。</span>",
		"mengshentui_info": "身退|你对/被其他角色使用单体即时牌时，体力上限较小的一方不能响应此牌。",

		"mengnuwu_info": "女武|锁定技，你每回合首次造成或受到伤害时，体力值较大的一方失去1点体力，然后你摸两倍于伤害值的牌。",
		"mengjiezhan_info": "竭战|当你使用伤害即时牌时，你可以〖崩坏〗并令此牌不可响应且不计次数，然后令一名角色获得一张红色牌。",
		"mengxinhuo_info": "薪火|当你进入濒死状态时，你可以令一名角色获得〖薪炎〗，并将所有牌和体力上限交给该角色。",
		"mengxinyan_info": "薪炎|锁定技，你使用红色牌时：增加火属性；伤害+1；背水：点燃红色手牌。",

		"mengwenmou_info": "稳谋|当你使用或打出牌时，若你手牌中有此牌的花色，此牌不计入使用次数；否则，摸一张牌。",
		"menggutu_info": "固图|锁定技，你响应其他角色的牌时〖恢拓〗1。",

		"mengsheyuan_info": "涉渊|其他角色的回合结束后，你随机展示一张本回合进入弃牌堆的非装备牌，然后重新记录此牌。若如此做，此后你每失去1/2张与〖涉渊〗最后一张记录的牌类型相同/不同的牌后，可以废除一个装备栏（若装备栏均被废除，则不进行失去牌的记录）。若本回合未以此法废除过装备栏，你获得牌堆中两张与〖涉渊〗最后一张记录的牌类型不同的非装备牌。",
		"mengkanming_info": "堪名|每回合限一次，若你的装备栏均已被废除，你可以将一张牌当〖涉渊〗记录的牌使用。此牌结算结束后，若没有角色因此牌改变体力值，你复原至少一个装备栏。每以此法复原两个装备栏，你回复1点体力或摸一张牌。",

		"mengzhejian_info": "折剑|锁定技，当有牌进入或离开一名角色的武器栏后，你摸一张牌。你计算与武器栏内有牌的其他角色的距离为1。",
		"mengtaixu_info": "太虚|当你使用一张非虚拟牌指定唯一目标后，若目标角色的武器栏为空，你将此牌置入其武器栏；<br>否则，你改为获得该角色武器栏内的牌并[冻结]其。",
		"mengjianxin_info": "剑心|锁定技，你没有武器栏。你的武器牌视为无次数限制的【杀】；若此牌的牌名包含“剑”，则此牌无距离限制且改为冰【杀】。",

		"mengqiongguan_info": "穷观|游戏开始时，或出牌阶段限一次，你可以选择一名没有[穷观阵]的角色，然后与其获得[穷观阵]和〖鉴知〗。当你死亡后，移去场上的〖穷观阵〗和〖鉴知〗。",
		"mengqiongguan_buff_info": "穷观阵|锁定技，若你不是符玄，当你受到本回合第2点或更多的伤害时，将多余的伤害转移给符玄。",
		"mengjianzhi_info": "鉴知|锁定技，获得此技时加1点体力上限并回复1点体力，失去此技时减1点体力上限。你每回合首次使用【杀】造成伤害时，此伤害+1。",
		"mengbie_info": "避厄|锁定技，每轮限一次，当你的体力值变化后，若体力值小于体力上限的一半，你回复X点体力（X为你本回合受到的伤害数）。",

		"mengpingji_old_info": "平寂|一名角色造成伤害后，若你没有记录，你可以弃置一张牌并记录此伤害的属性、数值、伤害来源和受伤角色；否则，你摸X张牌（X为此伤害与记录相同的项目数）并清除记录。",
		"mengzhaoxi_old_info": "朝夕|你不于当前回合内获得的牌均视为【火攻】。其他角色于其回合内首次使用目标唯一的牌后，你可以对同一目标使用一张【火攻】。",
		"mengcifan_old_info": "赐繁|当你使用牌造成伤害后，你可以将此牌置于牌堆顶。一名角色脱离濒死后，你可以视为使用一张【五谷丰登】。",

		"menglaixin_info": "来信|其他角色的回合开始时，你可以交给其一张牌，然后其选择一项：<br>1.将此牌交给你，然后与你各失去1点体力。<br>2.令你摸两张牌并移动场上一张牌。<br>3.与你各摸一张牌，然后本回合不能对你使用牌。",
		"mengyueluo_info": "悦落|当你于摸牌阶段外不因此技获得牌后，你可以将其中一张红/黑色牌当【乐不思蜀】/【兵粮寸断】置入其他角色的判定区内。若此牌来源不为其他角色，你回复1点体力或摸一张牌；否则，视为对所有其他角色使用一张雷【杀】，然后你翻面并减1点体力上限。",

		"mengnishang_info": "匿商|①锁定技，你不能成为【顺手牵羊】【过河拆桥】的目标。②其他角色的出牌阶段限一次，其可以交给你两张牌，然后令你交给其除这两张牌外的一张牌。",
		"mengshouwang_info": "守望|当一名角色使用【杀】指定其上一张【杀】包含的目标后，你可以弃置一张锦囊牌，对其攻击范围内的一名角色造成1点伤害。",
		"mengwenrun_info": "温润|出牌阶段限一次。你可以弃置一张装备区内的牌，令一名角色回复1点体力且下回合使用【杀】的次数上限+1。若其武器栏内没有牌，其摸一张牌。",

		"menglinren_info": "凛刃|当你使用目标唯一的牌时1，你可以与目标角色交换手牌中可用于响应此牌的所有同类型的牌。若如此做，本回合你们无法使用、打出或弃置这些牌，然后你令一名角色加入此牌的目标。",
		"mengqingzi_info": "倾姿|锁定技，当一名角色使用目标不唯一的牌时2，若你为此牌目标，将你从目标中移除；若你为使用者，此牌额外结算一次。然后你可以取消此牌的一个目标，或令其中一个目标摸一张牌。",

		"mengxuexing_info": "血性|锁定技，你造成伤害后，受伤角色[重伤]。<br><span class=firetext>全盛姿态：[重伤]的角色不能响应你使用的牌。</span>",
		"mengpijing_info": "辟径|出牌阶段限一次，若你没有护甲，你失去1点体力并获得2点护甲；否则，失去所有护甲并摸等量的牌。<br><span class=firetext>全盛姿态：此技改为出牌阶段限两次，且收益的数值+1。</span>",
		"mengaoan_info": "傲岸|出牌阶段限一次，你可以失去一半体力（向上取整），直到你的下回合开始进入全盛姿态。若如此做，你[重伤]并对其他角色造成一点伤害。<br><span class=firetext>全盛姿态：你造成伤害后回复一点体力。</span>",

	},
	2310: {
		hyyz_kaituozhe: ['开拓者', ["female", "hyyz_xt", 4, ["hyyzchuxing"], []], '#b以自己的意志，抵达结局吧！', '你记得不多。<br>你并非来自此地，也并非来自彼方，你本不去往任意一处——<br>直到模糊的声在你耳边吹拂，那悲伤爱怜的劝导，似是而非的催促……<br>种子扎根。你睁开双眼，那说话的人已不在。<br>只是声音愈来愈多愈清晰。<br>有无虑的关照，有镇静的劝告，有毅然的坚持，有温柔的点拨……<br>你看到锦线正织成明日。<br>巨大的兽自无垠降下，<br>金色的瞳从黑夜俯视，<br>你也不再被过去抛弃。<br>你还将开拓漫长旅途，<br>踏过的荆棘都成了路。<br>列车鸣笛，愿你抵达将至的未来<br>——以你自己的意志。'],
		hyyzchuxing: {
			trigger: {
				global: ["phaseBefore", "gainPathBegin"],
				player: ["enterGame"],
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'gainPath') {
					return event.paths.length > 0;
				}
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async content(event, trigger, player) {
				if (trigger.name == 'gainPath') {
					let skills = [];
					for (let path of trigger.paths) {
						if (path in lib.skill.hyyzchuxing.map) await player.addSkills(lib.skill.hyyzchuxing.map[path])
					}
				}
				else player.chooseUseTarget({ name: 'zhulu_card', isCard: true }, true)
			},
			map: {
				hyyz_kaituo: [''],
				hyyz_huimie: ['hyyzsheming'],
				hyyz_xunlie: [''],
				hyyz_zhishi: [''],
				hyyz_tongxie: ['hyyzzhulian'],
				hyyz_cunhu: ['hyyzzhongwang'],
				hyyz_xvwu: [''],
				hyyz_fengrao: [''],
				hyyz_jiyi: [''],
			},
			derivation: ['', 'hyyzsheming', '', '', 'hyyzzhulian', 'hyyzzhongwang', '', ''],
		},
		hyyzchuxing_info: `初行|锁定技，游戏开始时，你视为使用【逐鹿天下】。一名角色激活命途后，你获得对应技能。<span class=\"text\" style=\"font-family: yuanli\"><br>毁灭：舍命<br>存护：众望<br>同谐：翥跹</span>`,
		hyyzsheming: {
			pathSkill: true,
			audio: 4,
			cardSuit: function (list) {
				if (!list) return [];
				var suits = [];
				if (list.length < 1) return [];
				for (var i of list) {
					var suit = get.suit(i);
					if (suit && !suits.includes(suit)) {
						suits.push(suit);
					}
				}
				return suits;
			},
			enable: "phaseUse",
			usable: 1,
			filterTarget: lib.filter.notMe,
			async content(event, trigger, player) {
				let cardx = [];
				const cards1 = await event.target
					.chooseToDiscard(2, 'he', '弃置两张牌，否则受到' + get.translation(player) + '造成的1点伤害', '提示：尽可能选择花色相同的两张牌')
					.set('ai', function (card) {
						var target = _status.event.player;
						if (target.hp > 3 || ['jiu', 'tao'].includes(card.name)) return -1;
						if (target.hp < 2 && target.countCards('he') >= 2) return 100;
						var value = get.value(card);
						if (ui.selected.cards.length) {
							if (get.suit(ui.selected.cards[0]) == get.suit(card)) value /= 2;
						}
						return 10 - value;
					}).forResultCards();
				if (cards1) cardx.addArray(cards1)
				else if (event.target.isIn()) {
					player.line(event.target);
					event.target.damage(player);
				}
				else return;
				if (!player.isIn()) return;
				const cards2 = await player
					.chooseToDiscard(2, 'he', '弃置两张牌，否则受到' + get.translation(event.target) + '造成的1点伤害', '你们弃置的牌花色不同，可以摸两张牌')
					.set('cardsx', cardx)
					.set('ai', function (card) {
						var player = _status.event.player;
						if (player.hp > 2 || ['jiu', 'tao'].includes(card.name)) return -1;
						var cardsx = _status.event.cardsx.slice();
						var suits = lib.skill.hyyzsheming.cardSuit(cardsx), suits_no = lib.suit.slice();
						suits_no.removeArray(suits);

						if (cardsx.length) {
							if (suits.length < 2) return 10 - get.value(card);
							if (!player.countCards('he', { suit: suits_no[0] }) || !player.countCards('he', { suit: suits_no[1] })) return 10 - get.value(card);//你没合适的牌
							if (ui.selected.cards.length) {
								if (!cardsx.includes(ui.selected.cards[0])) cardsx.push(ui.selected.cards[0]);
								suits = lib.skill.hyyzsheming.cardSuit(cardsx);
							}
							return !suits.includes(get.suit(card));
						} else {
							if (ui.selected.cards.length) return get.suit(ui.selected.cards[0]) != get.suit(card);
							return true;
						}
					})
					.forResultCards()
				if (cards2) cardx.addArray(cards2);
				else if (event.target.isAlive()) {
					player.damage(event.target);
					event.target.line(player);
				};
				let suits = lib.skill.hyyzsheming.cardSuit(cardx);
				if (suits.length == 0) {
					game.log(player, '和', event.target, '均未弃置牌');
				} else {
					if (suits.length == cardx.length) player.draw(2);
					if (cardx.length == 4) {
						delete player.getStat().skill.hyyzsheming;
					}
				}
			},
			ai: {
				order: 8,
				expose: 0.3,
				result: {
					target: function (player, target) {
						if (target.hasSkillTag('noh')) return 0;
						if (target.countCards('he') < 2 || target.hp < 2) return -5;
						return -2;
					},
					player: function (player, target) {
						return player.hp + player.countCards('h') - 5;
					},
				},
				threaten: 1.1,
			},
		},
		hyyzsheming_info: "舍命|出牌阶段限一次，你可以令一名其他角色与你分别抉择：①弃置两张牌②受到对方造成的1点伤害。若弃置的牌花色各不相同，你摸两张牌；若弃置了四张牌，重置此技。",
		hyyzzhongwang: {
			pathSkill: true,
			audio: 1,
			mark: true,
			intro: {
				content: "limited",
			},
			limited: true,
			skillAnimation: true,
			animationColor: 'fire',
			enable: 'phaseUse',
			filter(event, player) {
				return game.hasPlayer(current => current.countCards('e', function (card) {
					return player.hasEmptySlot(get.subtype(card));
				}));
			},
			async content(event, trigger, player) {
				player.awakenSkill('hyyzzhongwang');
				player.storage.hyyzzhongwang = true;

				let count = 0;
				while (count < 5) {
					count++;
					if (player.hasEmptySlot(count)) {
						let targets = game.filterPlayer(current => current.getEquip(count));
						let target = targets.randomGet();
						if (target) {
							let card = target.getEquip(count);
							target.line(player, 'green');
							target.$give(card, player, 'giveAuto');
							await player.equip(card);
						}
					};
				}

				const targets = await player.chooseTarget('对一名其他角色造成1点火焰伤害', lib.filter.notMe)
					.set('ai', function (target) {
						let player = _status.event.player;
						return get.damageEffect(target, player, player, 'fire');
					})
					.forResultTargets();
				if (targets) {
					player.line(targets, 'fire');
					targets[0].damage('fire');
				}
			},
			ai: {
				order: 10,
				result: {
					player(card, player, target) {
						if (game.roundNumber > 1) return 2;
					}
				}
			},
		},
		hyyzzhongwang_info: "众望|限定技，出牌阶段，令此后有牌被移动时你摸一张牌，然后你随机移动场上的装备牌至你的空装备栏，并对一名其他角色造成1点火焰伤害。",
		hyyzzhulian: {
			audio: 5,
			pathSkill: true,
			enable: 'phaseUse',
			usable: 2,
			filter(event, player) {
				return player.countCards('he') > 0;
			},
			filterCard: true,
			check: (card) => 8 - get.value(card),
			position: 'he',
			discard: false,
			lose: false,
			delay: false,
			filterTarget: lib.filter.notMe,
			async content(event, trigger, player) {
				const target = event.targets[0], cards = event.cards;
				const contentx = async function (player, target, cards) {
					let tos = ['手牌区'];
					if (cards.every(card => lib.card[card.name].type == 'equip' && target.canEquip(card, true))) tos.push('装备区');
					if (!target.storage._disableJudge) tos.push('判定区');
					let to;
					if (tos.length == 1) to = tos[0];
					else {
						to = await player.chooseControl(tos).set('prompt', `把${get.translation(cards)}移动到${get.translation(target)}的...`).forResultControl();
					}
					if (to == '手牌区') {
						var next = target.gain(cards);
						next.source = player;
						next.animate = 'giveAuto';
					} else if (to == '装备区') {
						while (cards.length && cards.some(card => target.canEquip(card, true))) {
							let card = cards.find(card => target.canEquip(card, true));
							cards.remove(card);
							player.$give(card, target);
							target.equip(card);
						}
					} else if (to == '判定区') {
						let next = player.chooseToMove(prompt, true);
						if (cards.some(card => lib.card[card.name].type == 'delay' && !target.hasJudge(card.name))) {
							next.set('list', [
								['蓄谋', cards],
								['判定']
							]);
							next.set('targetx', target);
							next.set('filterMove', function (from, to, moved) {
								const card = from.link, targetx = _status.event.targetx;
								if (to == 1) {
									if (lib.card[card.name].type != 'delay') return false;
									if (targetx.hasJudge(card.name)) return false;
									if (moved[1].some(card => targetx.hasJudge(card.name))) return false;
								}
								return true;
							});
							next.set('filterOk', function (moved) {
								return true;
							});
						} else {
							next.set('list', [
								['蓄谋', cards]
							]);
						}
						const { result: { moved } } = await next;
						if (moved) {
							let jsrg = moved[0], judge = moved[1];
							if (jsrg.length) {
								player.$give(jsrg, target);
								jsrg.forEach(card => target.addJudge({ name: 'xumou_jsrg' }, card));
							}
							if (judge && judge.length) {
								player.$give(judge, target);
								judge.map(card => target.addJudge(card));
							}
						}
					}
					game.updateRoundNumber();
					await game.asyncDelay();
					await player.draw();
				};
				const control = await player
					.chooseControl('控顶', '置入' + get.translation(target) + '的区域')
					.set('prompt', `控顶并获得对方牌
					给对方牌并摸牌`)
					.forResultControl();
				if (control == '控顶') {
					player.lose(cards, ui.cardPile, 'insert');
					player.$throw(cards, 1000);
					game.log(player, '将一张牌置于牌堆顶');
					await player.gainPlayerCard(target, 'hej', true);
				} else {
					await contentx(player, target, cards);
				}
			},
		},
		hyyzzhulian_info: "翥跹|出牌阶段限两次，你可以选择一张牌和一名其他角色，你将此牌置于其中一项并获得另一项一张牌：①牌堆顶②该角色的区域内。",
		/*hyyz_tongxie: {
			audio:  1,
			pathSkill: true,
			trigger: {
				player: ['useSkillAfter', 'logSkill'],
			},
			filter(event, player) {
				return event.skill && lib.skill[event.skill].pathSkill && event.skill != 'hyyz_tongxie';
				if (["global", "equip"].includes(event.type)) return false;
				if (!event.skill) return false;
				let skills = game.expandSkills(event.player.getSkills('aaa', false, false));
				skills = skills.filter((skill) => {
					let info = get.info(skill);
					if (!info || info.juexingji || info.hiddenSkill || info.zhuSkill || info.dutySkill || info.chargeSkill || lib.skill.hyyz_tongxie.banned.includes(j)) return false;
					if (skill.init || (skill.ai && (skill.ai.combo || skill.ai.notemp || skill.ai.neg))) return false;
					return true;
				});
				//if (lib.filter.skillDisabled(event.skill)) return false;
				if (!skills.includes(event.skill)) return false;
				return true;
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseTarget(`令一名角色发动${get.translation(trigger.skill)}`, `其可以改为觉醒命途`, lib.filter.notMe)
					.set('ai', (target) => get.attitude2(target) > 0)
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				if (!target.hasPath()) {
					const bool = await target.chooseBool('你没有命途，是否改为觉醒命途？').forResultBool();
					if (bool) {
						target.choosePaths(true).set('ai', () => ['hyyz_huimie', 'hyyz_cunhu'].randomGet());
						return;
					}
				}
				const info = lib.skill[trigger.skill];
				let result = { bool: false };
				if (event.name == 'logSkill') {
					'什么也没有，只是过滤一下'
				} else if (info.filterTarget == undefined && info.filterCard == undefined) {//没有选择任何目标和牌
					result = await target.chooseBool()
						.set('prompt', info.prompt || get.prompt(trigger.skill) || '是否发动【同谐】')
						.forResult();
				} else {
					let object = {
						prompt: info.prompt || get.prompt(trigger.skill) || get.prompt(trigger.sourceSkill) || '是否发动【同谐】',
						filterCard: info.filterCard || false,
						filterTarget: info.filterTarget || false,
					};
					if (info.filterCard != undefined) {
						object.selectCard = info.selectCard || 1;
						object.position = info.position || 'h';
						object.multitarget = info.multitarget || undefined;
						object.discard = info.discard || undefined;
						object.lose = info.lose || undefined;
						object.delay = info.delay || undefined;
						object.complexCard = info.complexCard || undefined;
					};
					if (info.filterTarget != undefined) {
						object.selectTarget = info.selectTarget || 1;
						object.complexTarget = info.complexTarget || undefined;
						object.multitarget = info.multitarget || undefined;
					}
					object.complexSelect = info.complexSelect || undefined;
					object.multiline = info.multiline || undefined;
					result = await target.chooseCardTarget(object).forResult();
				}
				if (result.bool) {
					target.useSkill(result.cards, result.targets, trigger.skill);
				};
			},
		},
		hyyz_tongxie_info: get.hyyzIntroduce('命途') + "技，你发动其他命途技后，可令一名其他角色选择是否发动此技。若其没有命途，其可以改为选择命途。",*/

		meng_sp_ren: ['刃', ['male', 'hyyz_xt', 4, ["mengkunsheng", "mengyetu", "mengenciJLP"], ["die:meng_ren"]], '尾巴酱'],
		"mengkunsheng": {
			audio: 2,
			trigger: {
				global: 'phaseEnd',
			},
			forced: true,
			content() {
				player[player.getDamagedHp() > player.hp ? 'recover' : 'loseHp'](Math.abs(player.getDamagedHp() - player.hp));
			},
			ai: {
				threaten: function (player, target) {
					return target.getDamagedHp();
				},
				maixie: true,
			}
		},
		"mengyetu": {
			audio: 'mengwansi',
			trigger: {
				player: 'useCard2'
			},
			forced: true,
			filter(event, player) {
				return event.card.name == 'sha';
			},
			async content(event, trigger, player) {
				player.loseHp();
				game.setNature(trigger.card, 'hyyz_wind');
				let num = Math.min(player.getDamagedHp(), game.countPlayer(function (current) {
					return !trigger.targets.includes(current) && lib.filter.filterTarget(trigger.card, player, current);
				}));
				if (!num) return;
				const { result: { targets } } = await player.chooseTarget(`业途-誓仇`, `是否令至多${get.cnNumber(num)}名其他角色也成为此【杀】的目标`, [1, num], function (card, player, target) {
					var evt = _status.event.getTrigger();
					return target != player && !evt.targets.includes(target) && lib.filter.targetEnabled2(evt.card, player, target) && lib.filter.targetInRange(evt.card, player, target);
				}).set('ai', function (target) {
					return get.effect(target, { name: 'sha' }, _status.event.player);
				});
				if (targets) {
					player.line(targets, trigger.card.nature);
					trigger.targets.addArray(targets);
					trigger.mengyetu = true;
					player.addTempSkill('mengyetu_1');
				}
			},
			derivation: "dc_olshichou",
			subSkill: {
				1: {
					trigger: {
						player: "useCardAfter",
					},
					filter: function (event, player) {
						return event.mengyetu && !player.getHistory('sourceDamage', function (evt) {
							return evt.card == event.card;
						}).length && event.cards.filterInD().length > 0;
					},
					charlotte: true,
					forced: true,
					popup: false,
					content: function () {
						player.gain(trigger.cards.filterInD(), 'gain2');
					},
					"_priority": 0,
				},
			}
		},
		"mengenciJLP": {
			audio: 5,
			init(player) {
				player.storage.mengenciJLP = [];
			},
			trigger: {
				player: ["dying"],
			},
			forced: true,
			initList: function () {
				var list, skills = [];
				var banned = ['xunyi'];
				if (get.mode() == 'guozhan') {
					list = [];
					for (var i in lib.characterPack.mode_guozhan) list.push(i);
				}
				else if (_status.connectMode) list = get.charactersOL();
				else {
					list = [];
					for (var i in lib.character) {
						if (lib.filter.characterDisabled2(i) || lib.filter.characterDisabled(i)) continue;
						list.push(i);
					}
				}
				for (var i of list) {
					if (i.indexOf('gz_jun') == 0) continue;
					if (!lib.character[i] || !lib.character[i][3]) continue;
					for (var j of lib.character[i][3]) {
						var skill = lib.skill[j];
						if (!skill || skill.zhuSkill || banned.includes(j)) continue;
						if (skill.ai && (skill.ai.combo || skill.ai.notemp || skill.ai.neg)) continue;
						var info0 = get.translation(j), info1 = get.translation(j + '_info');
						for (var word of info0) {
							if (/死/.test(word) == true) {
								if (!skills.includes(j)) skills.push(j);
								break;
							}
						}
						for (var word of info1) {
							if (/死/.test(word) == true) {
								if (!skills.includes(j)) skills.push(j);
								break;
							}
						}
					}
				}
				_status.mengenciJLP_list = skills;
			},
			async content(event, trigger, player) {
				await player.recover();

				if (!_status.mengenciJLP_list) lib.skill.mengenciJLP.initList();
				var list = _status.mengenciJLP_list.filter(function (i) {
					return !player.hasSkill(i, null, null, false);
				}).randomGets(3);
				if (list.length == 0) event.goto(2);
				else {
					event.videoId = lib.status.videoId++;
					let func = function (skills, id, target) {
						let dialog = ui.create.dialog('forcebutton');
						dialog.videoId = id;
						dialog.add('恩赐：获得一个技能');
						for (var i = 0; i < skills.length; i++) {
							dialog.add('<div class="popup pointerdiv" style="width:80%;display:inline-block"><div class="skill">【' + get.translation(skills[i]) + '】</div><div>' + lib.translate[skills[i] + '_info'] + '</div></div>');
						}
						dialog.addText(' <br> ');
					}
					if (player.isOnline()) player.send(func, list, event.videoId);
					else if (player == game.me) func(list, event.videoId);
					const { result: { control } } = await player.chooseControl(list).set('ai', function () {
						var controls = _status.event.controls;
						if (controls.includes('cslilu')) return 'cslilu';
						return controls[0];
					});
					if (control) {
						game.broadcastAll('closeDialog', event.videoId);
						if (player.storage.mengenciJLP) {
							player.removeSkillLog(player.storage.mengenciJLP);
							delete player.storage.mengenciJLP;
						}
						player.storage.mengenciJLP = control;
						player.addSkillLog(control);

					}
				}
			},
		},
		meng_kafuka: ['卡芙卡', ["female", "hyyz_xt", 3, ["mengyuemian", "mengyexuan"], []], '柚衣'],
		mengyuemian: {
			audio: 2,
			trigger: {
				player: "linkBegin",
				global: 'damageEnd'
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'link') return !player.isLinked();
				else return event.dotDebuff == 'hyyzBuff_chudian';
			},
			content() {
				if (trigger.name == 'link') trigger.cancel();
				else {
					player.chooseDrawRecover(true);
				}
			},
		},
		mengyexuan: {
			audio: 4,
			logAudio: (index) => [
				`ext:忽悠宇宙/asset/hyyz/audio/hyyzmosuo1.mp3`,
				`ext:忽悠宇宙/asset/hyyz/audio/hyyzmosuo2.mp3`
			],
			enable: "phaseUse",
			usable: 1,
			filter(event, player) {
				return player.countCards('he');
			},
			filterCard: true,
			selectCard() {
				return [1, Math.min(3, game.countPlayer((current) => current != _status.event.player))]
			},
			position: "he",
			filterTarget: lib.filter.notMe,
			selectTarget: () => (ui.selected.cards.length),
			prompt: '夜喧，选择判定的角色',
			targetprompt(target) {
				return get.translation(get.color(ui.selected.cards[ui.selected.targets.indexOf(target)]));
			},
			discard: false,
			delay: false,
			loseTo: "cardPile",
			insert: true,
			visible: false,
			check(card) {
				if (get.color(card) == 'red') return _status.event.player.hp > 3;
				else return 8 - get.value(card);
			},
			async content(event, trigger, player) {
				const user = event.target;
				const color = await user
					.judge('mengyexuan', (card) => get.color(card) == 'red' ? 1 : 1.5)
					.forResult('color');
				if (color == 'black') {
					game.hyyzSkillAudio('meng', 'mengyexuan', 3)
					await user.addhyyzBuff('hyyzBuff_chudian');
					await user.hyyzBang()
				} else {
					game.hyyzSkillAudio('meng', 'mengyexuan', 4)
					const cards = user.countCards('h') ? (await player.choosePlayerCard(user, true, 'h', 'visible')
						.set('prompt', '夜喧：选择一张牌')
						.set('prompt2', '令其对你指定的角色使用此牌，或你获得此牌，其视为对你指定的角色使用【杀】')
						.set('user', user)
						.set('ai', button => {
							var player = _status.event.player, user = _status.event.user;
							var card = button.link;
							var eff = 0, att = -1;
							game.countPlayer(function (current) {
								if (current != user && user.canUse(button.link, current)) {
									eff = get.effect(current, card, user, player);
									att = (get.attitude(player, current) + get.attitude(player, user)) / 1.5;
								}
							});
							if (eff * att > 0) return eff * att;
							else return get.value(card);
						})
						.forResultCards()) : [];
					if (cards?.length > 0) {
						let cardx;
						if (!user.hasUseTarget(cards[0])) {
							await user.give(cards, player, 'giveAuto');
							cardx = { name: 'sha', isCard: true }
						} else {
							cardx = cards[0];
						};
						if (cardx && user.hasUseTarget(cardx)) {
							const targets = await player
								.chooseTarget(true, (card, player, target) => user.canUse(cardx, target))
								.set('prompt', `夜喧：选择${get.translation(user)}使用${get.translation(cardx)}的目标`)
								.set('ai', (target) => get.effect(target, cardx, user, player))
								.forResultTargets();
							if (targets) {
								await user.useCard(cardx, targets)
							}
						}
					}
				}
			},
			ai: {
				order: 10,
				result: {
					target(player, target) {
						if (get.attitude(player, target) > 0) return;
						var eff = get.damageEffect(target, player, player, 'thunder');
						if (target.hashyyzBuff('hyyzBuff_chudian')) eff *= 2;
						return eff * get.attitude(player, target);
					},
				},
			},
		},
		meng_re_shalangbaizi: ['砂狼白子', ["female", "hyyz_other", 4, ["mengrejipo", "mengzhilei", "mengkongxi"], ['ext:忽悠宇宙/asset/meng/image/meng_shalangbaizi.jpg', 'die:meng_shalangbaizi']], '咩阿栗诶', ''],//
		mengrejipo: {
			audio: 'mengjipo',
			trigger: {
				source: "damageBegin1",
			},
			priority: 20,
			direct: true,
			content: function () {
				'step 0'
				if (trigger.player.hasSkill('mengzhiru_buff1')) {
					player.logSkill('mengrejipo');
					trigger.player.removeSkill('mengzhiru_buff1');
					game.log(trigger.player, '#g触发[减攻]击破，此伤害+1');
					trigger.num++;
					trigger.player.addTempSkill('fengyin');
					event.finish();
				} else if (trigger.player.hasSkill('mengzhiru_buff2')) {
					player.logSkill('mengrejipo');
					trigger.player.removeSkill('mengzhiru_buff2');
					trigger.nature = lib.inpile_nature.randomGet();
					game.log(trigger.player, '#g触发[减防]击破，此伤害+1');
					trigger.num++;
					player.addTempSkill('mengrejipo_num');
					player.storage.mengrejipo_num2.push(trigger.player);
					event.finish();
				} else {
					player.chooseBool(get.prompt('mengrejipo', trigger.player), '摸一张牌并令此伤害-1，然后植入[弱点]').set('ai', function () {
						return get.attitude(player, trigger.player) < 0;
					});
				};
				'step 1'
				if (result.bool) {
					player.logSkill('mengrejipo');
					trigger.num--;
					player.draw();
					var cards = game.cardsGotoOrdering(get.cards(2)).cards;
					player.showCards(cards);
					if (get.type2(cards[0], false) == get.type2(cards[1], false)) {
						game.log(trigger.player, '#g植入[减攻]');
						trigger.player.addSkill('mengzhiru_buff1');
					} else {
						game.log(trigger.player, '#g植入[减防]');
						trigger.player.addSkill('mengzhiru_buff2');
					};
					player.when('die').assign({
						forceDie: true,
						charlotte: true,
						firstDo: true,
					}).then(() => {
						if (current.hasSkill('mengzhiru_buff1')) current.removeSkill('mengzhiru_buff1');
						if (current.hasSkill('mengzhiru_buff2')) current.removeSkill('mengzhiru_buff2');
					});
				}
			},
			subSkill: {
				num: {
					init: function (player) {
						player.storage.mengrejipo_num = 0;
						player.storage.mengrejipo_num2 = [];
					},
					onremove: true,
					trigger: {
						source: "damageEnd",
					},
					filter: function (event, player) {
						return player.storage.mengrejipo_num2.includes(event.player);
					},
					forced: true,
					charlotte: true,
					content: function () {
						game.log(trigger.player, '#r[减防]弱点击破', '，砂狼白子本回合可以额外使用一张杀');
						player.storage.mengrejipo_num++;
						player.syncStorage('mengrejipo_num');
					},
					mark: true,
					marktext: "破",
					intro: {
						name: "破防",
						content: function (content, player) {
							return "你可以额外使用" + player.storage.mengrejipo_num + "张杀";
						},
					},
					mod: {
						cardUsable: function (card, player, num) {
							if (card.name == 'sha') return num + player.storage.mengrejipo_num;
						},
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 2000,
		}, "mengzhiru_buff1": {
			mark: true,
			marktext: "攻",
			intro: {
				name: "减攻",
				content: "效果：你使用牌指定目标后，除非弃置两张牌（优先弃置手牌），否则此牌无效。",
			},
			trigger: {
				player: "useCardToPlayered",
			},
			filter: function (event, player) {
				return player.countCards('he') > 0
			},
			charlotte: true,
			forced: true,
			content: function () {
				'step 0'
				if (player.countCards('he') >= 2) player.chooseToDiscard('弃置两张牌，否则此牌无效', 2, 'he', function (card) {
					if (player.countCards('h') >= 2) return get.position(card) == 'h';
					return true;
				}).set('ai', function (card) {
					return true;
				});
				else event._result = { bool: false };
				'step 1'
				if (!result.bool) {
					game.log(player, '#r[减攻]', '此牌无效');
					trigger.getParent().excluded.addArray(game.players);
				}
			},
			"_priority": 0,
		}, "mengzhiru_buff2": {
			mark: true,
			marktext: "防",
			intro: {
				name: "减防",
				content: "效果：防具无效且手牌上限基数为2。",
			},
			charlotte: true,
			ai: {
				"unequip2": true,
			},
			mod: {
				maxHandcardBase: function (player, num) {
					return 2;
				},
			},
			"_priority": 0,
		},
		mengzhilei: {
			audio: 'mengjiecai',
			trigger: {
				player: "phaseUseBegin",
			},
			content: function () {
				'step 0'
				var cards = game.cardsGotoOrdering(get.cards(3)).cards;
				player.showCards(cards);
				var types = [], bool = false;
				for (var i of cards) {
					var type = get.type2(i, false);
					if (!types.includes(type)) types.push(type);
					else {
						bool = true;
						break;
					}
				};
				if (bool) {
					player.chooseTarget(get.prompt2('mengzhilei'), [1, 2], lib.filter.notMe).set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (target.hasSkill('mengzhiru_buff1') || target.hasSkill('mengzhiru_buff2')) att *= 5;
						return -att;
					});
				} else event.finish();
				'step 1'
				if (result.bool) {
					event.targets = result.targets;
				} else event.finish();
				'step 2'
				event.to = event.targets.shift();
				event.from = (event.to.hasSkill('mengzhiru_buff1') || event.to.hasSkill('mengzhiru_buff2')) ? player : event.to;
				list = [
					'令' + get.translation(event.to) + '受到1点无来源的火焰伤害，然后' + get.translation(event.to) + '弃置装备区内的所有牌',
					'令' + get.translation(event.to) + '弃置两张牌（优先弃置手牌）',
				];
				event.from.chooseControlList(list, true);
				'step 3'
				player.line(event.to, 'fire');
				if (result.index == 0) {
					event.to.damage('fire', 'nosource', 'nocard');
					event.to.discard(event.to.getCards('e'));
				} else {
					event.to.chooseToDiscard('弃置两张牌', 2, 'he', function (card) {
						if (player.countCards('h') >= 2) return get.position(card) == 'h';
						return true;
					}, true);
				};
				if (event.targets.length > 0) event.goto(2);
			},
		},
		mengkongxi: {
			audio: 'mengyouji',
			enable: "phaseUse",
			usable: 1,
			position: "hes",
			viewAs: {
				name: "wanjian",
				storage: {
					mengkongxi: true,
				},
			},
			filterCard: function (card, player) {
				if (ui.selected.cards.length) {
					return get.type2(card) == get.type2(ui.selected.cards[0]);
				}
				var cards = player.getCards('hes');
				for (var i = 0; i < cards.length; i++) {
					if (card != cards[i]) {
						if (get.type2(card) == get.type2(cards[i])) return true;
					}
				}
				return false;
			},
			selectCard: 2,
			complexCard: true,
			check: function (card) {
				var player = _status.event.player;
				var targets = game.filterPlayer(function (current) {
					return player.canUse('wanjian', current);
				});
				var num = 0;
				for (var i = 0; i < targets.length; i++) {
					var eff = get.sgn(get.effect(targets[i], { name: 'wanjian' }, player, player));
					if (targets[i].hp == 1) {
						eff *= 1.5;
					}
					num += eff;
				}
				if (!player.needsToDiscard(-1)) {
					if (targets.length >= 7) {
						if (num < 2) return 0;
					}
					else if (targets.length >= 5) {
						if (num < 1.5) return 0;
					}
				}
				return 6 - get.value(card);
			},
			group: ["mengkongxi_add", "mengkongxi_count", "mengkongxi_draw"],
			subSkill: {
				add: {
					trigger: {
						global: "damageBegin1",
					},
					filter: function (event, player) {
						return event.card && event.card.storage && event.card.storage.mengkongxi;
					},
					priority: null,
					silent: true,
					charlotte: true,
					forced: true,
					popup: false,
					content: function () {
						game.log('#g【空袭】，此伤害+1')
						trigger.num++;
					},
					sub: true,
					"_priority": null,
				},
				count: {
					trigger: {
						global: "damageEnd",
					},
					filter: function (event, player) {
						return event.card && event.card.storage && event.card.storage.mengkongxi;
					},
					charlotte: true,
					silent: true,
					forced: true,
					popup: false,
					content: function () {
						if (!player.storage.mengkongxi_count) player.storage.mengkongxi_count = 0;
						player.storage.mengkongxi_count += trigger.num;
					},
					sub: true,
					"_priority": 1,
				},
				draw: {
					trigger: {
						player: "useCardAfter",
					},
					filter: function (event, player) {
						return event.card && event.card.storage && event.card.storage.mengkongxi;
					},
					charlotte: true,
					forced: true,
					content: function () {
						var num = player.storage.mengkongxi_count;
						if (num > 0) player.draw(num);
						delete player.storage.mengkongxi_count;
					},
					sub: true,
					"_priority": 0,
				},
			},
			ai: {
				order: 8,
				threaten: 1.14,
				unequip: true,
				"unequip_ai": true,
				skillTagFilter: function (player, tag, arg) {
					if (arg && arg.name == 'wanjian' && (tag.name == 'unequip' || tag.name == 'unequip_ai') && arg.card && arg.card.storage && arg.card.storage.mengkongxi) return true;
					return false;
				},
				basic: {
					order: 8.5,
					useful: 1,
					value: 5,
				},
				wuxie: function (target, card, player, viewer) {
					if (get.attitude(viewer, target) > 0 && target.countCards('h', 'shan')) {
						if (!target.countCards('h') || target.hp == 1 || Math.random() < 0.7) return 0;
					}
				},
				result: {
					"target_use": function (player, target) {
						if (player.hasUnknown(2) && get.mode() != 'guozhan') return 0;
						var nh = target.countCards('h');
						if (get.mode() == 'identity') {
							if (target.isZhu && nh <= 2 && target.hp <= 1) return -100;
						}
						if (nh == 0) return -2;
						if (nh == 1) return -1.7
						return -1.5;
					},
					target: function (player, target) {
						var nh = target.countCards('h');
						if (get.mode() == 'identity') {
							if (target.isZhu && nh <= 2 && target.hp <= 1) return -100;
						}
						if (nh == 0) return -2;
						if (nh == 1) return -1.7
						return -1.5;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage: 1,
					multitarget: 1,
					multineg: 1,
				},
			},
			"_priority": 0,
		},
		meng_shalangbaizi: ['砂狼白子', ["female", "hyyz_other", 4, ["mengjipo", "mengjiecai", "mengyouji"], []], '咩阿栗诶', ''],
		mengjipo: {
			audio: 4,
			trigger: {
				source: 'damageBegin1'
			},
			logTarget: 'player',
			prompt2: (event, player) => event.player.hasSkill('mengruodian') ? '[击破]此弱点？' : '植入[弱点]',
			check: (event, player) => -get.attitude(player, event.player),
			content() {
				if (trigger.player.hasSkill('mengruodian')) {
					trigger.player.removeSkill('mengruodian');
				} else {
					game.log('#g[植入]', '此伤害-1');
					trigger.num--;
					trigger.player.addSkill('mengruodian');
				}
			}
		},
		mengruodian: {
			init(player, skill) {
				player.markSkill(skill);
				player.storage[skill] = ['gong', 'fang'].randomGet();
			},
			onremove(player, skill) {
				let tar = game.filterPlayer(current => current.hasSkill('mengjipo'))[0]
				tar.draw();
				tar.addSkill('mengruodian_jipo');
				//tar.when('phaseEnd').then(() => player.removeSkill('mengruodian_jipo'));//持续到白子tar的回合结束
				tar.storage.mengruodian_jipo.add(player);
				player.unmarkSkill(skill);
				delete player.storage[skill];
			},
			trigger: {
				player: 'useCard'
			},
			mark: true,
			marktext: '弱',
			intro: {
				name: '弱点',
				markcount: (storage, player) => storage == 'gong' ? ' 攻' : ' 防',
				content(storage, player) {
					return (storage == 'gong' ? '减攻：你使用牌时随机弃置一张牌。' : '减防：你的防具和护甲失效；且每失效一项，手牌上限-1。') + '<br>击破后，白子摸一张牌，直到白子的回合结束，受到的伤害+1。'
				}
			},
			forced: true,
			charlotte: true,
			filter: (event, player) => player.countCards('he') > 0 && player.storage.mengruodian == 'gong',
			content() {
				player.discard(player.getCards('he').randomGet());
			},
			mod: {
				maxHandcard(player, num) {
					if (player.storage.mengruodian != 'fang') return;
					let k = 0;
					if (player.getEquip(2)) k++;
					if (player.hujia > 0) k++;
					return num - k;
				}
			},
			ai: {
				nohujia: true,
				"unequip2": true,
			},
			subSkill: {
				jipo: {
					init(player, skill) {
						player.storage[skill] = [];
					},
					trigger: {
						global: 'damageBegin1',
					},
					mark: true,
					marktext: '破',
					intro: {
						name: '击破',
						content(storage, player) {
							return get.translation(storage);
						}
					},
					priority: 10,
					forced: true,
					charlotte: true,
					filter(event, player) {
						return player.storage.mengruodian_jipo.includes(event.player);
					},
					content() {
						game.log('#g[击破]', '此伤害+1');
						trigger.num++;
						//下次
						player.storage.mengruodian_jipo.remove(trigger.player);
						if (!player.storage.mengruodian_jipo.length) player.removeSkill('mengruodian_jipo');
					}
				}
			}
		},
		mengjiecai: {
			audio: 2,
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return player.countCards('he', (card) => {
					if (card.name == 'sha') return true;
					if (get.type(card) == 'trick' && get.tag(card, 'damage') > 0) return true;
					return false;
				});
			},
			filterCard(card) {
				if (card.name == 'sha') return true;
				if (get.type(card) == 'trick' && get.tag(card, 'damage') > 0) return true;
				return false;
			},
			selectCard: () => [1, game.countPlayer(current => current != _status.event.player)],
			filterTarget: lib.filter.notMe,
			selectTarget() {
				return ui.selected.cards.length;
			},
			multitarget: false,
			multiline: false,
			async content(event, trigger, player) {
				let str = event.target.hasSkill('mengruodian') ? '然后' : '否则' + `受到1点火焰伤害`;
				const { result: { cards } } = await event.target.chooseCard(`将${event.cards.length}张牌交给白子`, 'he', str, event.cards.length)
					.set('forced', event.target.hasSkill('mengruodian') ? true : false);
				if (cards) {
					player.gain(cards, event.target, 'give');
				}
				if (!cards || event.target.hasSkill('mengruodian')) {
					event.target.damage(player, 'fire');
				}
			},
			ai: {
				order: 8,
				result: {
					target: -5,
				}
			}
		},
		mengyouji: {
			audio: 4,
			enable: 'phaseUse',
			usable: 1,
			filter(event, player) {
				return game.hasPlayer(current => current != player && !current.getEquips(3).length && !current.getEquips(4).length)
			},
			filterTarget(card, player, target) {
				return target != player && !target.getEquips(3).length && !target.getEquips(4).length;
			},
			selectTarget: -1,
			multitarget: true,
			multiline: true,
			content() {
				let next = player.useCard({ name: 'wanjian', isCard: true }, targets)
				next.directHit = game.filterPlayer(current => current.hasSkill('mengruodian'));
			}
		},
		meng_nuoaier: ['诺艾尔', ["female", "hyyz_ys", 3, ["mengchawei", "mengkuangzhu", "mengjianshou"], []], '日玖阳气冲三关'],
		mengchawei: {
			audio: 4,
			trigger: {
				player: ["phaseZhunbeiBegin", "damageEnd"],
			},
			async cost(event, trigger, player) {
				const result = await player.chooseTarget('察微：观看一名角色的手牌', '令其摸一张牌，或弃置其一张牌')
					.set('ai', function (target) {
						var att = get.attitude(_status.event.player, target);
						if (att > 0) {
							if (target.hasSkillTag('nogain')) {
								return false;
							} else {
								if (target == player) return att;
								else return att * 2;
							}
						} else {
							return -att * (target.countCards('e') + 1);
						}
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				let cards = undefined;
				const target = event.targets[0];
				if (target.countCards('he')) {
					cards = await player
						.discardPlayerCard('弃置' + get.translation(target) + '的一张牌，或点取消令其摸一张牌', target, 'he', 'visible').set('ai', button => {
							var att = _status.event.att, target = _status.event.targetx;
							var card = button.link;
							var val = target.getUseValue(card);
							if (att <= 0) {
								if (val > 0) return val;
								return get.value(card);
							}
							return -100;
						})
						.set('att', get.attitude(player, target))
						.set('targetx', target)
						.forResultCards();
				}
				if (!cards) {
					target.draw();
				}
			},
		},
		mengkuangzhu: {
			audio: 7,
			trigger: {
				global: ["chooseToUseBegin", "chooseToRespondBegin"],
			},
			filter: function (event, player) {
				if (player.hp < 1) return false;
				if (event.player == _status.currentPhase || event.player == player) return false;
				if (event.responded || event.mengkuangzhu || player.hasSkill('mengkuangzhu_usable')) return false;
				for (var name of lib.inpile) {
					return get.type(name) == 'basic' && event.filterCard({ name: name }, event.player, event);
				}
				return false;
			},
			direct: true,
			content: function () {
				'step 0'
				var list = [];
				for (var name of lib.inpile) {
					if (get.type(name) == 'basic' && trigger.filterCard({ name: name }, trigger.player, trigger)) list.push(name);
				}
				var listx = [];
				for (var name of list) {
					listx.push([get.type2(name), '', name]);
					if (name == 'sha') {
						for (var nature of lib.inpile_nature) {
							if (trigger.filterCard({ name: name, nature: nature }, player, trigger)) {
								listx.push([get.type2(name), '', name, nature]);
							}
						}
					}
				}
				var evt = trigger.getParent();
				var names = '';
				for (var i = 0; i < list.length; i++) {
					names += '【' + get.translation(list[i]) + '】';
					names += i < list.length - 2 ? '、' : '或';
				}
				names = names.slice(0, names.length - 1);
				var prompt2 = '<span class="yellowtext">' + get.translation(trigger.player) + '</span>' + (evt.card ? '因<span class="yellowtext">' + get.translation(evt.card) + '</span>' : '') + '可' + (trigger.name == 'chooseToUse' ? '使用' : '打出') + '一张<span class="yellowtext">' + names + '</span><br>是否受到1点伤害，视为其' + (trigger.name == 'chooseToUse' ? '使用' : '打出') + '之？';
				event.prompt2 = prompt2;//显示str
				if (!listx.length) event.finish();
				else {
					player.chooseButton(['###【匡助】###<div class="text center">' + prompt2 + '</div>', [listx, 'vcard']]).set('ai', function () {
						if (_status.event.dyx < 0) return false;
						return get.attitude(player, trigger.player) > 4 && player.hp + player.hujia > 0 && Math.random() + 1;
					}).set('dyx', trigger.dying ? get.attitude(player, trigger.dying) : 0);
				}
				'step 1'
				if (result.bool) {
					var card = {
						name: result.links[0][2],
						nature: result.links[0][3],
						isCard: true,
					};
					event.card = card;

					if (trigger.name == 'chooseToUse' && game.countPlayer(function (current) {
						return trigger.player.canUse(card, current, false);
					}) > 0) {
						var next = player.chooseCardTarget({
							prompt: '匡助',
							prompt2: '选择' + get.translation(trigger.player) + '使用' + get.translation(card) + '的目标角色',
							filterCard: function () { return false },
							forced: true,
							selectCard: -1,
						});
						var keys = ['filterTarget', 'selectTarget', 'ai'];
						for (var key of keys) delete next[key];
						for (var i in trigger) {
							if (!next.hasOwnProperty(i)) next[i] = trigger[i];
						}
						next.cardx = card
						next.filterTargetx = trigger.filterTarget || (() => false);
						next.filterTarget = function (card, player, target) {
							var filter = this.filterTargetx;
							if (typeof filter != 'function') filter = (() => filter);
							card = _status.event.cardx;
							player = _status.event.getTrigger().player;
							return this.filterTargetx.apply(this, arguments);
						};
						//if (typeof next.selectTarget != 'number' && typeof next.selectTarget != 'function' && get.itemtype(next.selectTarget) != 'select') next.selectTarget = -1;
					} else {
						event._result = { bool: true, targets: [] };
					}
				}
				else event.finish();
				'step 2'
				var targets = result.targets || [];
				event.targets = targets;
				player.logSkill('mengkuangzhu', trigger.player);
				player.say(['不要怕，我来帮忙啦', '好痛……', '我没关系的'].randomGet());
				player.addTempSkill('mengkuangzhu_usable');
				trigger.player.line(player);
				player.damage(trigger.player, 'nocard');
				trigger.untrigger();
				trigger.set('responded', true);
				var result = {
					bool: true,
					card: card,
				};
				if (targets.length) result.targets = targets;
				trigger.result = result;
				'step 3'
				trigger.player.chooseControl('必须回报诺艾尔小姐！', '残忍拒绝！').set('prompt', '可爱的诺艾尔小姐舍身帮助了你，不打算让她摸一张牌么？').set('ai', () => get.attitude(trigger.player, player) >= 0 ? '必须回报诺艾尔小姐！' : '残忍拒绝');
				'step 4'
				if (result.control == '必须回报诺艾尔小姐！') player.draw();
			},
			global: 'mengkuangzhu_ai',
			subSkill: {
				usable: {},
				ai: {
					charlotte: true,
					ai: {
						save: true,
						skillTagFilter: function (player, arg, target) {
							return _status.currentPhase && _status.currentPhase != player && game.countPlayer(function (current) {
								return current.hasSkill('mengkuangzhu') && !current.hasSkill('mengkuangzhu_usable')
							});
						},
					},
					sub: true,
					"_priority": 0,
				}
			},
			"_priority": 0,
		},
		mengjianshou: {
			audio: 4,
			trigger: {
				player: 'gainAfter',
				global: 'loseAsyncAfter'
			},
			usable: 1,
			forced: true,
			filter(event, player) {
				return player.hujia < 1 && event.getg(player).length;
			},
			async content(event, trigger, player) {
				player.changeHujia(1);
			},
			mod: {
				targetEnabled(card, player, target, now) {
					if (card.name == 'shunshou' && player.hasSkill('mengjianshou')) return false;
				},
				playerEnabled(card, player, target) {
					if (card.cards && card.cards.some(a => a.hasGaintag('mengjianshou')) && player != target) return false;
				},
			},
			group: 'mengjianshou2',
		}, mengjianshou2: {
			forced: true,
			charlotte: true,
			direct: true,
			trigger: {
				player: ['gainAfter'],
				global: 'loseAsyncAfter'
			},
			filter(event, player) {
				return player != _status.currentPhase && event.getg(player).length;
			},
			async content(event, trigger, player) {
				player.addGaintag(trigger.getg(player), "mengjianshou");
			},
		},
		meng_qingqizhe: ['倾奇者', ["male", "hyyz_ys", 3, ["mengsanpan", "mengnixin", "menggulu"], []], '柚衣'],
		mengsanpan: {
			audio: 4,
			logAudio: () => false,
			mark: true,
			marktext: "叛",
			intro: {
				content(storage, player, skill) {
					var str = '<li>上一轮于回合外';
					if (player.storage.mengsanpan_log[1][0]) {
						str += '<p style=\"color:rgb(124,252,0)\">体力值减少过</p>';
					} else str += '<p style="color:rgb(255,102,102)">体力值未减少</p>';
					if (player.storage.mengsanpan_log[1][1]) {
						str += '<p style=\"color:rgb(124,252,0)\">失去过牌</p>';
					} else str += '<p style=\"color:rgb(255,102,102)\">未失去过牌</p>';
					str += '<li>当前';
					if (player.countCards('j') > 0) str += '<p style=\"color:rgb(124,252,0)\">判定区有牌</p>';
					else str += '<p style=\"color:rgb(255,102,102)\">判定区没有牌</p>';
					str += '<li>本轮于回合外';
					if (player.storage.mengsanpan_log[0][0]) {
						str += '<p style=\"color:rgb(124,252,0)\">体力值减少过</p>';
					} else str += '<p style=\"color:rgb(255,102,102)\">体力值未减少</p>';
					if (player.storage.mengsanpan_log[0][1]) {
						str += '<p style=\"color:rgb(124,252,0)\">失去过牌</p>';
					} else str += '<p style=\"color:rgb(255,102,102)\">未失去过牌</p>';
					return str;
				},
			},
			trigger: {
				player: "phaseBegin",
			},
			forced: true,
			async content(event, trigger, player) {
				let num = 0;
				if (player.storage.mengsanpan_log && player.storage.mengsanpan_log[1][0]) {
					game.log('#g【三叛】1', '上轮于回合外体力值减少')
					num++;
					player.storage.mengsanpan_log[1][0] = false;
				}
				if (player.storage.mengsanpan_log && player.storage.mengsanpan_log[1][1]) {
					game.log('#g【三叛】1', '上轮于回合外失去过牌')
					num++;
					player.storage.mengsanpan_log[1][1] = false;
				}
				if (player.countCards('j') > 0) {
					game.log('#g【三叛】', '判定区有牌')
					num++;
				}

				if (num > 0) {
					while (num && game.hasPlayer(current => current != player && current.countCards('hej') > 0)) {
						num--;
						const targets = await player
							.chooseTarget(true, '三叛：获得一名其他角色区域内的一张牌（剩余' + num + '次）', function (card, player, current) {
								return current != player && current.countCards('hej') > 0
							})
							.set('ai', function (target) {
								var player = _status.event.player;
								return get.effect(target, { name: 'shunshou' }, player, player);
							})
							.forResultTargets();
						if (targets) {
							game.hyyzSkillAudio('meng', 'mengsanpan', 1, 2)
							await player.gainPlayerCard(targets[0], 'hej', true);
						} else return;
					}
				} else if (player.countCards('he')) {
					const [cards, targets] = await player
						.chooseCardTarget({
							prompt: '三叛：是否弃置一张牌，令一名角色回复1点体力或摸两张牌',
							filterCard: true,
							position: 'he',
							filterTarget: true,
							ai1(card) {
								return 8 - get.value(card);
							},
							ai2(target) {
								return get.attitude(_status.event.player, target);
							}
						})
						.forResult('cards', 'targets');
					if (cards && targets) {
						game.hyyzSkillAudio('meng', 'mengsanpan', 3, 4)
						await player.discard(cards);
						await targets[0].chooseDrawRecover('三叛：回复1点体力或摸两张牌', 2, true);
					}
				}
			},
			group: ["mengsanpan_hp", "mengsanpan_lose", "mengsanpan_log"],
			subSkill: {
				log: {
					silent: true,
					locked: true,
					charlotte: true,
					init: function (player) {
						player.storage.mengsanpan_log = [[false, false], [false, false]];
					},
					trigger: {
						global: "roundStart",
					},
					content: function () {
						game.log('#g【三叛】1', '截止上轮记录')
						player.storage.mengsanpan_log[1] = player.storage.mengsanpan_log[0];
						game.log('#g【三叛】0', '记录刷新')
						player.storage.mengsanpan_log[0] = [false, false];
					},
				},
				hp: {
					silent: true,
					locked: true,
					charlotte: true,
					trigger: {
						player: ["damageEnd", "loseHp"],
					},
					filter: function (event, player) {
						return player.storage.mengsanpan_log[0][0] == false && player != _status.currentPhase;
					},
					content: function () {
						game.log('#g【三叛】0', '记录回合外体力减少');
						player.storage.mengsanpan_log[0][0] = true;
					},
				},
				lose: {
					silent: true,
					locked: true,
					charlotte: true,
					trigger: {
						player: "loseAfter",
						global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
					},
					filter: function (event, player) {
						if (player == _status.currentPhase) return false;
						if (event.name == 'gain' && event.player == player) return false;
						var evt = event.getl(player);
						return evt && evt.cards2 && evt.cards2.length > 0 && player.storage.mengsanpan_log[0][1] == false;
					},
					content: function () {
						game.log('#g【三叛】0', '记录回合外失去牌')
						player.storage.mengsanpan_log[0][1] = true;
					},
				},
			},
			"_priority": 0,
		},
		mengnixin: {
			audio: 3,
			logAudio: () => false,
			trigger: {
				global: "damageBegin4",
				player: "phaseDiscardBegin",
			},
			filter: function (event, player) {
				if (event.name == 'phaseDiscard') return true;
				if (!event.source || event.source == event.player) return false;
				if (event.player == player && _status.currentPhase != event.source) return true;
				if (event.source == player && _status.currentPhase != player) return true;
			},
			forced: true,
			content: function () {
				if (trigger.name == 'phaseDiscard') {
					game.hyyzSkillAudio('meng', 'mengnixin', 1)
				} else {
					if (trigger.player == player) {
						game.hyyzSkillAudio('meng', 'mengnixin', 3)
					} else {
						game.hyyzSkillAudio('meng', 'mengnixin', 2)
					}
					trigger.cancel();
				}
			},
			mod: {
				maxHandcard: function (player, num) {
					return num + 1;
				},
			},
			"_priority": 0,
		},
		menggulu: {
			audio: 2,
			trigger: {
				player: "gainAfter",
			},
			filter: function (event, player) {
				if (!event.source || event.source == player || !event.source.isIn()) return false;
				if (_status.currentPhase != player) return false;
				return player.countCards('he', function (card) { return get.type(card) == 'equip' }) > 0 || event.source.countCards('e') > 0;
			},
			frequent: 'check',
			check: function (event, player) {
				if (get.attitude(event.player, event.source) < 0) return true;
			},
			content: function () {
				'step 0'
				var targetx = [];
				if (player.countCards('he', function (card) { return get.type(card) == 'equip' }) > 0) targetx.push(player);
				if (trigger.source != player && trigger.source.countCards('e') > 0) targetx.push(trigger.source);
				if (targetx.length > 0) player.chooseTarget('孤履：选择对方或自己', '1.重铸对方装备区内的一张牌。若此牌为武器牌，则其额外摸一张牌。<br>2.你弃置一张装备牌并对其造成1点雷电伤害。若此牌为武器牌，则你回复1点体力。', function (card, player, target) {
					return _status.event.targetx.includes(target);
				}).set('targetx', targetx).set('ai', function (target) {
					var sourcex = _status.event.sourcex;
					var att = get.attitude(player, sourcex);
					if (att < 0) return player.countCards('he', function (card) { return get.type(card) == 'equip' });
				}).set('sourcex', trigger.source).set('logSkill', 'menggulu');
				else event.finish();
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					if (target == player) {
						player.chooseCard(true, 'he', function (card) { return get.type(card) == 'equip' });
					} else {
						player.choosePlayerCard(true, target, 'e');
					}
				} else event.finish();
				'step 2'
				var cardx = result.cards[0] || result.links[0];
				var target = get.owner(cardx);
				if (target == player) {
					player.discard(cardx);
					trigger.source.damage('thunder');
					if (get.subtype(cardx) == 'equip1') player.recover()
				} else {
					target.recast(cardx);
					if (get.subtype(cardx) == 'equip1') target.draw();
				}
			},
			"_priority": 0,
		},
		meng_yanqing: ['彦卿', ["male", "hyyz_xt", 4, ['mengjiaoqi', 'mengduanao'], []], '屺'],
		mengjiaoqi: {
			audio: 4,
			logAudio: () => [
				'ext:忽悠宇宙/asset/meng/audio/mengjiaoqi1.mp3',
				'ext:忽悠宇宙/asset/meng/audio/mengjiaoqi2.mp3',
			],
			trigger: {
				player: "phaseDrawAfter",
			},
			filter(event, player) {
				return player.countCards('h') && game.countPlayer(function (current) {
					return lib.filter.targetEnabled({ name: 'sha' }, player, current);
				});
			},
			async cost(event, trigger, player) {
				const result = await player.chooseCardTarget({
					prompt: '选择普通【杀】的目标',
					prompt2: '将任意手牌当无距离限制的【杀】使用',
					position: 'h',
					filterCard: true,
					selectCard: [1, player.countCards('h')],
					filterTarget(card, player, target) {
						return lib.filter.targetEnabled({ name: 'sha' }, player, target);
					},
					ai1(card) {
						return 4 - get.value(card);
					},
					ai2(target) {
						return get.effect(target, { name: 'sha' }, player);
					},
				}).forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				player.useCard({
					name: 'sha',
					storage: {
						mengjiaoqi: true
					},
				}, event.cards, event.targets, false);
			},
			group: 'mengjiaoqi_damage',
			subSkill: {
				damage: {
					logAudio: () => [
						'ext:忽悠宇宙/asset/meng/audio/mengjiaoqi3.mp3',
						'ext:忽悠宇宙/asset/meng/audio/mengjiaoqi4.mp3',
					],
					trigger: {
						source: 'damageSource'
					},
					filter(event, player) {
						return event.card && event.card.storage && event.card.storage.mengjiaoqi;
					},
					direct: true,
					async content(event, trigger, player) {
						var num = player.countCards('h');
						game.filterPlayer((current) => {
							var hs = current.countCards('h');
							if (hs > num) num = hs;
						});
						num++;
						if (player.storage.mengduanao) await player.recover();
						else await player.loseHp();
						await player.drawTo(num)
					}
				},
			}
		},
		mengduanao: {
			audio: 2,
			round: 1,
			trigger: {
				global: 'damageEnd',
			},
			filter(event, player) {
				if (event.source == player) {
					return event.player.isAlive()
				} else {
					return event.source && event.source.isAlive()
				}
			},
			logTarget(event, player) {
				if (event.source == player) {
					return event.player
				} else {
					return event.source
				}
			},
			async content(event, trigger, player) {
				await player.draw();
				const target = trigger.source == player ? trigger.player : trigger.source;
				if (!player.canCompare(target)) return;
				const bool = await player.chooseToCompare(target).forResultBool();
				if (bool) {
					target.addhyyzBuff('hyyzBuff_dongjie');
				} else {
					var cards = player.getCards('h');
					var list = [];
					cards.forEach(card => list.add(get.suit(card)));

					const control = await player
						.chooseControl(list, 'cancel2').set('prompt', '弃置一种花色的所有手牌，下次发动〖骄麒〗时的“失去”改为“回复”。').set('ai', function () {
							var player = _status.event.player;
							if (player.hasSkill('mengduanao_add')) return 'cancel2';
							var val = {}, min = ['', 100];
							for (var i of player.getCards('h')) {
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
						.forResultControl();
					if (control != 'cancel2') {
						player.discard(player.getCards('h', { suit: control }));
						player.storage.mengduanao = true;
					}
				}
			},
		},
		meng_chiyuan: ['赤鸢', ["female", "hyyz_b3", 3, ["mengshuyun", "mengcaixin"], []], '微雨', ''],
		mengshuyun: {
			audio: 2,
			trigger: {
				global: "damageBegin4",
			},
			check: function (event, player) {
				return get.attitude(player, event.player) > 0;
			},
			logTarget: "player",
			content: function () {
				'step 0'
				trigger.player.judge();
				'step 1'
				if (player.countCards('he')) {
					var str = '';
					if (result.suit == 'red') {
						str += '防止此伤害';
						if (trigger.source && trigger.source.isIn()) {
							str += '，并' + get.translation(trigger.player) + '对' + get.translation(trigger.source) + '造成一点伤害';
						}
					} else {
						if (trigger.source && trigger.source.isIn()) {
							str += get.translation(trigger.player) + '获得' + get.translation(trigger.source) + '一张牌'
						};
						if (trigger.num > 1) {
							if (str.length > 0) str += '，且';
							str += '此伤害-1';
						}
						if (!str.length) str += '无事发生';
					}
					player.chooseToDiscard('he', function (card) {
						return get.suit(card) == _status.event.suitx;
					}).set('suitx', result.suit).set('ai', function (card) {
						return get.attitude(player, trigger.player) > 0 && get.value(card) < 8;
					}).set('prompt2', str);
				} else event._result = { bool: false };
				'step 2'
				if (result.bool) {
					var color = get.color(result.cards[0]);
					if (color == 'red') {
						trigger.cancel();
						if (trigger.source && trigger.source.isIn()) trigger.source.damage(trigger.player);
					} else {
						if (trigger.source && trigger.source.isIn() && trigger.source.countCards('he') > 0) trigger.player.gainPlayerCard(trigger.source, 'he');
						if (trigger.num > 1) trigger.num--;
					}
				}
			},
		},
		mengcaixin: {
			audio: 4,
			group: ["mengcaixin_cancel", "mengcaixin_use", "mengcaixin_exc"],
			subSkill: {
				cancel: {
					logAudio(event, player) {
						return [
							'ext:忽悠宇宙/asset/meng/audio/mengcaixin1.mp3',
							'ext:忽悠宇宙/asset/meng/audio/mengcaixin2.mp3',
						]
					},
					trigger: {
						global: ["damageCancelled", "damageZero", "damageAfter"],
					},
					forced: true,
					filter: function (event, player, name) {
						if (name == 'damageCancelled') return true;
						for (var i of event.change_history) {
							if (i < 0) return true;
						}
						return false;
					},
					content: function () {
						player.gainMaxHp();
						//player.draw();
					},
				},
				use: {
					logAudio(event, player) {
						return [
							'ext:忽悠宇宙/asset/meng/audio/mengcaixin3.mp3',
						]
					},
					trigger: {
						player: "useCardAfter",
					},
					filter: function (event, player) {
						return player.maxHp > 1 && (event.card.name == 'sha' || event.card.name == 'jiu');
					},
					"prompt2": function (event, player) {
						return "减1点体力上限令" + get.translation(event.card) + "不计入次数限制"
					},
					check: function (event, player) {
						if (event.card.name == 'sha' && player.countCards('h', { name: 'sha' }) > 0 && player.getDamagedHp() > 2) return true;
					},
					content: function () {
						player.loseMaxHp();
						if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
					},
				},
				exc: {
					logAudio(event, player) {
						return [
							'ext:忽悠宇宙/asset/meng/audio/mengcaixin4.mp3',
						]
					},
					"prompt2": function (event, player) {
						return "减1点体力上限令" + get.translation(event.card) + "无效，并获得" + get.translation(event.player) + "一张牌";
					},
					trigger: {
						global: ["useCard"],
					},
					logTarget: "player",
					filter: function (event, player) {
						if (event.player == player) return false;
						return _status.currentPhase == player && event.player.maxHp > 1;
					},
					check: function (event, player) {
						return player.getDamagedHp() > 2;
					},
					content: function () {
						'step 0'
						player.loseMaxHp();
						if (trigger.name == 'useCard') {
							trigger.all_excluded = true;
							trigger.targets.length = 0;
							game.log('#g【裁心】', trigger.card, '被取消');
						} else {

						}
						'step 1'
						player.gainPlayerCard(trigger.player, 'he');
					},
				},
			},
		},
		meng_shuoyeguanxing: ['朔夜观星', ["female", "hyyz_b3", 3, ["mengtianfu", "mengdizai", "mengfengyang"], []], '沧海依酥'],
		mengtianfu: {
			audio: 2,
			marktext: '星',
			intro: {
				name: '天覆',
				name2: '星',
				content: '你有#枚“星”'
			},
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			forced: true,
			filter: function (event, player) {
				return player.countMark('mengtianfu') > 0;
			},
			preHidden: true,
			content: function () {
				"step 0"
				event.hand0 = player.getCards('h');
				"step 1"
				var num = player.countMark('mengtianfu');
				player.removeMark('mengtianfu', 5);
				player.unmarkSkill('mengtianfu');
				var cards = get.cards(num);
				game.cardsGotoOrdering(cards);

				var next = player.chooseToMove(true);
				next.set('list', [
					['牌堆顶', cards],
					['牌堆底'],
					['你的手牌', player.getCards('h')],
				]);
				next.set('prompt', '天覆：交换等量手牌，并将牌移动到牌堆顶或牌堆底');
				next.set('num', player.countCards('h'));
				next.set('filterMove', function (from, to, moved) {
					if ((to == 0 || to == 1) && moved[2].includes(from.link)) return false;
					else return to != 2;
				});
				next.set('filterOk', function (moved) {
					return moved[2].length == _status.event.num;
				});
				next.processAI = function (list) {
					var cards = list[0][1], player = _status.event.player;
					var top = [];
					var judges = player.getCards('j');
					var stopped = false;
					if (!player.hasWuxie()) {
						for (var i = 0; i < judges.length; i++) {
							var judge = get.judge(judges[i]);
							cards.sort(function (a, b) {
								return judge(b) - judge(a);
							});
							if (judge(cards[0]) < 0) {
								stopped = true; break;
							}
							else {
								top.unshift(cards.shift());
							}
						}
					}
					var bottom;
					if (!stopped) {
						cards.sort(function (a, b) {
							return get.value(b, player) - get.value(a, player);
						});
						while (cards.length) {
							if (get.value(cards[0], player) <= 5) break;
							top.unshift(cards.shift());
						}
					}
					bottom = cards;
					return [top, bottom, player.getCards('h')];
				};
				"step 2"
				var top = result.moved[0];
				var bottom = result.moved[1];
				var hand = result.moved[2];
				top.reverse();
				game.cardsGotoPile(top.concat(bottom), ['top_cards', top], function (event, card) {
					if (event.top_cards.includes(card)) return ui.cardPile.firstChild;
					return null;
				});
				player.gain(hand, 'gain2', 'log');
				player.popup(get.cnNumber(top.length) + '上' + get.cnNumber(bottom.length) + '下');
				game.log(player, '将' + get.cnNumber(top.length) + '张牌置于牌堆顶');
				"step 3"
				var bool = true;
				if (event.hand0.length == 0) bool = false;
				for (var i of event.hand0) {
					if (player.getCards('h').includes(i)) {
						bool = false;
						break;
					}
				}
				if (bool) {
					game.log('#g【天覆】', '手牌全部被置换');
					player.draw();
				}
				"step 4"
				game.delayx();
			},
			group: 'mengtianfu_add',
			subSkill: {
				add: {
					trigger: {
						global: 'changeHp'
					},
					filter: function (event, player) {
						return event.num != 0 && player.countMark('mengtianfu') < 5;
					},
					direct: true,
					content: function () {
						player.logSkill('mengtianfu', trigger.player);
						player.addMark('mengtianfu', Math.min(5 - player.countMark('mengtianfu'), Math.abs(trigger.num)));
						player.markSkill('mengtianfu');
					},
				}
			},
			ai: {
				threaten: 1.2,
			},
			"_priority": 0,
		},
		mengdizai: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			filter: function (event, player) {
				if (game.countPlayer() < 3) return false;
				return player.countCards('he') > 0;
			},
			position: "he",
			filterCard: true,
			filterTarget: function (card, player, target) {
				return player != target;
			},
			check: function (card) {
				return 6 - get.value(card);
			},
			selectTarget: 2,
			multitarget: true,
			multiline: true,
			targetprompt: ["拼点发起人", "拼点目标"],
			content: function () {
				'step 0'
				targets[0].draw('bottom');
				targets[1].draw('bottom');
				'step 1'
				game.delayx();
				if (targets[0].canCompare(targets[1])) {
					targets[0].chooseToCompare(targets[1]);
				}
				else event.finish();
				'step 2'
				if (result.winner == targets[0] && result.winner != targets[1]) {
					targets[0].chooseToDiscard('he', 2, true);
					targets[1].damage(targets[0]);
				} else if (result.winner == targets[1] && result.winner != targets[0]) {
					targets[1].chooseToDiscard('he', 2, true);
					targets[0].damage(targets[1]);
				} else if (result.winner !== targets[0] && result.winner !== targets[1]) {
					player.gain([result.player, result.target].filterInD('d'), 'gain2').gaintag.add('mengdizai');;
				}
			},
			ai: {
				order: 1,
				result: {
					target: -1,
				},
			},
			group: 'mengdizai_tag',
			subSkill: {
				tag: {
					charlotte: true,
					onremove: function (player) {
						player.removeGaintag('mengdizai');
					},
					mod: {
						ignoredHandcard: function (card, player) {
							if (card.hasGaintag('mengdizai')) return true;
						},
						cardDiscardable: function (card, player, name) {
							if (name == 'phaseDiscard' && card.hasGaintag('mengdizai')) return false;
						},
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengfengyang: {
			audio: 2,
			trigger: {
				global: "chooseToCompareAfter",
			},
			filter: function (event, player) {
				if (event.preserve) return false;
				return true;
			},
			direct: true,
			content: function () {
				'step 0'
				var targetx = [], str = '';
				var num1 = trigger.num1;
				if (trigger.result.targets && trigger.result.targets.length >= 2) {
					str += '目标数大于1';
					str += '<li>' + get.translation(trigger.player) + '的拼点牌为' + num1;
					for (var i = 0; i < trigger.targets.length; i++) {
						var num2 = trigger.result.num2[i];
						str += '<li>' + get.translation(trigger.targets[i]) + '的拼点牌为' + num2;
						var str2 = '<li>本次拼点没赢的角色为：';
						if (num1 > num2) {
							str2 += '[' + get.translation(trigger.targets[i]) + ']';
							if (!targetx.includes(trigger.targets[i])) targetx.push(trigger.targets[i]);
						}
						if (num1 < num2) {
							str2 += '[' + get.translation(trigger.player) + ']';
							if (!targetx.includes(trigger.player)) targetx.push(trigger.player);
						}
						if (num1 == num2) {
							str2 += '[' + get.translation(trigger.targets[i]) + ']';
							str2 += '[' + get.translation(trigger.player) + ']';
							if (!targetx.includes(trigger.targets[i])) {
								targetx.push(trigger.targets[i]);
							}
							if (!targetx.includes(trigger.player)) {
								targetx.push(trigger.player);
							}
						}
						str += str2;
					}
				} else {
					str += '目标数唯一';
					str += '<li>' + get.translation(trigger.player) + '的拼点牌为' + num1;
					var num2 = trigger.num2;
					str += '<li>' + get.translation(trigger.target) + '的拼点牌为' + num2;
					var str2 = '<li>本次拼点没赢的角色为：';
					if (num1 > num2) {
						str2 += '[' + get.translation(trigger.target) + ']';
						targetx = [trigger.target];
					}
					if (num1 < num2) {
						str2 += '[' + get.translation(trigger.player) + ']';
						targetx = [trigger.player];
					}
					if (num1 == num2) {
						str2 += '[' + get.translation(trigger.player) + ']';
						str2 += '[' + get.translation(trigger.target) + ']';
						targetx = [trigger.player, trigger.target];
					}
					str += str2;
				}
				game.log('#g【风扬】', str);
				event.targetx = targetx;
				'step 1'
				event.target = event.targetx.shift();
				if (event.target.countCards('h') > 0) {
					player.chooseBool('风扬：是否观看并交换' + get.translation(event.target) + '的手牌？');
				} else {
					game.log('#g【风扬】', event.target, '没有手牌');
					event._result = { bool: false };
				}
				'step 2'
				if (result.bool) {
					player.logSkill('mengfengyang', event.target);
					var next = player.chooseToMove('风场：交换你们的手牌');
					next.set('list', [
						[get.translation(event.target) + '的手牌', event.target.getCards('h')],
						['你的手牌', player.countCards('h') > 0 ? player.getCards('h') : []],
					]);
					next.set('filterMove', function (from, to) {
						return typeof to != 'number';
					});
					next.set('processAI', function (list) {
						var cards = list[0][1].concat(list[1][1]).sort(function (a, b) {
							return get.value(a) - get.value(b);
						}), cards2 = cards.splice(0, event.target.countCards('h'));
						return [cards2, cards];
					});
				} else {
					if (event.targetx.length > 0) event.goto(1);
					else event.finish();
				}
				'step 3'
				if (result.bool) {
					var pushs = result.moved[0], gains = result.moved[1];
					pushs.removeArray(event.target.getCards('h'));
					gains.removeArray(player.getCards('h'));
					if (!pushs.length || pushs.length != gains.length) return;
					player.give(pushs, event.target, 'giveAuto');
					event.target.give(gains, player, 'giveAuto');
				}
				'step 4'
				if (event.targetx.length > 0) event.goto(1);
			},
			ai: {
				noCompareTarget: true,
			},
			"_priority": 0,
		},
		meng_kalilu: ['卡莉露', ["female", "hyyz_ys", 3, ["menglinting", "mengquanxin"], []], '沧海依酥'],//
		menglinting: {
			trigger: {
				global: 'useCardToPlayer'
			},
			filter(event, player) {
				var info = get.info(event.card, false);
				if (info.allowMultiple == false) return false;
				if (get.tag(event.card, 'damage') || get.timetype(event.card) != 'notime') return false;
				return game.hasPlayer(function (current) {
					return current.countCards('he') > 0 && !event.targets.includes(current) && event.player.canUse(event.card, current);
				});
			},
			async cost(event, trigger, player) {
				const result = await player
					.chooseTarget('聆听：将非目标的一张牌交给' + get.translation(trigger.player) + '，然后令该角色加入' + get.translation(trigger.card) + '的目标')
					.set('filterTarget', (card, player, target) => {
						return target.countCards('he') && !trigger.targets.includes(target) && trigger.player.canUse(trigger.card, target);
					})
					.set('ai', (target) => get.effect(target, trigger.card, player, player) * Math.sign(get.attitude2(trigger.player)))
					.forResult();
				event.result = result;
			},
			usable: 1,
			logTarget: 'targets',
			async content(event, trigger, player) {
				const cards = await player
					.choosePlayerCard('he', event.targets[0], true)
					.forResultCards();
				if (cards) {
					trigger.player.gain(cards, event.targets[0], 'give');
					trigger.getParent().targets.add(event.targets[0]);
				}
			},
		},
		mengquanxin: {
			usable: 1,
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				//if (!player.isPhaseUsing()) return false;
				return lib.nature.some(name => {
					return get.type(name) && !get.tag({ name: name }, 'damage') && event.filterCard({ name: name }, player, event) && get.timetype(name) == 'notime';
				});
			},
			chooseButton: {
				dialog(event, player) {
					var list = [];
					for (var name of lib.inpile) {
						if (get.type(name) == 'trick' &&
							event.filterCard({ name: name }, player, event) &&
							!get.tag({ name: name }, 'damage') &&
							get.timetype(name) == 'notime')
							list.push(['锦囊', '', name]);
					}
					return ui.create.dialog('泉心', [list, 'vcard']);
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
					return {
						filterCard: () => false,
						selectCard: -1,
						popname: true,
						check(card) {
							return 8 - get.value(card);
						},
						position: 'hse',
						viewAs: {
							name: links[0][2],
							nature: links[0][3]
						},
					}
				},
				prompt(links, player) {
					return '视为使用' + (get.translation(links[0][3]) || '') + get.translation(links[0][2]) + '';
				},
			},
			hiddenCard(player, name) {
				var type = get.type(name);
				return type == 'trick' && !get.tag(name, 'damage') && get.timetype(name) == 'notime'
			},
			ai: {
				order: 10,
				result: {
					player: 1,
				},
			},
		},

		mengkunsheng_info: "困生|锁定技，每回合结束时，交换你的体力值和已损失体力值。",
		mengyetu_info: "业途|锁定技，你使用【杀】时，失去1点体力并附魔“风”与〖誓仇〗。",
		mengenciJLP_info: "恩赐|锁定技，当你进入濒死时，回复1点体力并重新获得一个含有“死”字的技能。",

		"mengyuemian_info": "月绵|锁定技，你不能被横置。当有角色受到[触电]伤害后，你摸一张牌或回复1点体力。",
		"mengyexuan_info": "夜喧|出牌阶段限一次，你可以将至多三张牌置于牌堆顶，然后令等量的其他角色依次进行判定，若结果为：<br>1.红色，你观看并选择其的一张手牌，然后指定另一名角色。若其可以对指定的角色使用此牌，其使用之；否则，你获得此牌并视为其对你指定的角色使用【杀】。<br>2.黑色，令该角色[触电]，然后引爆其的所有dot效果。",

		"mengrejipo_info": "击破|当你对没有[弱点]的其他角色造成伤害时，你可以摸一张牌并令此伤害-1。若如此做，你亮出牌堆顶两张牌，若这两张牌类别相同/不同，目标角色获得[减攻]/[减防]。若其有[弱点]，移除其的[弱点]并令此伤害+1，然后执行对应的[弱点击破]。<br><span class=firetext>[减攻]</span>=效果：你使用牌指定目标时，除非弃置两张牌（优先弃置手牌），否则此牌无效。<br><span class=firetext>[减攻击破]</span>=效果：本回合其的非锁定技无效。<br><span class=firetext>[减防]</span>=效果：防具无效且手牌上限基数为2。<br><span class=firetext>[减防击破]</span>=效果：此伤害改为随机属性，且你对其造成伤害后，本回合使用【杀】的次数上限+1。",
		"mengzhilei_info": "掷雷|出牌阶段开始时，你展示牌堆顶的三张牌。若其中有类别相同的牌，你选择至多两名角色，并令这些角色各选择一项：<br>1.受到1点无来源的火焰伤害，然后弃置装备区内的所有牌。<br>2.弃置两张牌（优先弃置手牌）。<br>若你选择的角色有[弱点]，则该角色改为由你替其选择一项。",
		"mengkongxi_info": "空袭|出牌阶段限一次，你可以将两张类别相同的牌当做无视防具的【万箭齐发】使用，且此牌造成的伤害+1。此牌结算结束后，你摸X张牌，X为此牌造成的伤害数。",

		"mengjipo_info": "击破|你对其他角色造成伤害时，若其有[弱点]，令其[击破]；否则，可以令此伤害-1并令目标随机获得减攻/减防[弱点]。<br><span class=firetext>[减攻]</span>你使用牌时随机弃置一张牌。<br><span class=firetext>[减防]</span>你的防具和护甲失效；且每失效一项，手牌上限-1。<br><span class=firetext>[击破]</span>白子摸一张牌，且白子下次对该角色造成的伤害+1。",
		"mengruodian_info": "弱点|",
		"mengjiecai_info": "劫财|出牌阶段限一次，你可以弃置任意张伤害类牌并令等量其他角色选择一项：<br>1.将等量的牌交给你。<br>2.对其造成1点火焰伤害。<br>若其有[弱点］，改为两项同时执行。",
		"mengyouji_info": "游击|出牌阶段限一次，你可以视为对没有坐骑牌的其他角色使用【万箭齐发】，有[弱点]的角色不能响应此牌。",

		"mengchawei_info": "察微|准备阶段或你受到伤害后，你可以观看一名角色的手牌，然后你弃置其中一张牌，或令其摸一张牌。",
		"mengkuangzhu_info": "匡助|每回合限一次，当一名其他角色于回合外需要使用或打出一张基本牌时，你可以受到1点伤害并视为其使用或打出此牌。若如此做，其可以令你摸一张牌。",
		"mengjianshou_info": "缄守|锁定技，你不能成为【顺手牵羊】的目标；你不能对其他角色使用回合外获得的牌；每回合首次获得牌后，将护甲补充至1。",

		"mengsanpan_info": "三叛|锁定技，回合开始时，你每满足一项，可以获得其他角色区域内的一张牌：<br>1.上一轮你于回合外体力值减少过。<br>2.上一轮你于回合外失去过牌。<br>3.你的判定区有牌。<br>若均不满足，你可以弃置一张牌，令一名角色回复1点体力或摸两张牌。",
		"mengnixin_info": "匿心|锁定技，你的手牌上限+1。你于回合外对其他角色造成伤害时，或其他角色于其回合外对你造成伤害时，防止之。",
		"menggulu_info": "孤履|当你于回合内获得其他角色的牌后，你可以选择一项：<br>1.重铸其装备区内的一张牌。若此牌为武器牌，则其额外摸一张牌。<br>2.你弃置一张装备牌并对其造成1点雷电伤害。若此牌为武器牌，则你回复1点体力。",

		mengjiaoqi_info: "骄麒|摸牌阶段结束时，你可以将任意手牌当无距离限制的【杀】使用。此【杀】造成伤害后，你失去1点体力并将手牌摸至唯一最多。",
		mengduanao_info: "断傲|每轮限一次，一名角色/你造成伤害后，你可以摸一张牌并与该角色/受伤角色拼点。若你赢，其[冻结]；若你没赢，你可以弃置一种花色的所有牌，下次发动〖骄麒〗时的“失去”改为“回复”。",

		"mengshuyun_info": "疏云|一名角色受到伤害时，你可以令其进行判定，然后你可以弃置一张与判定结果花色相同的牌。若此牌为：<br>①红色：防止此伤害并对伤害来源造成一点伤害。<br>②黑色：其获得伤害来源一张牌，然后若此伤害大于1，此伤害-1。",
		"mengcaixin_info": "裁心|当有伤害被防止时，或伤害值发生过减少的伤害事件结算结束后，你加一点体力上限。<br>你使用【酒】或【杀】后，若你的体力上限大于1，你可以减一点体力上限令此牌不计入次数限制。<br>当其他角色于你的回合使用牌时，你可以减一点体力上限，令此牌取消之并获得其一张牌。",


		"mengtianfu_info": "天覆|锁定技，每当有角色体力值发生变化时，你获得与变化数等量的“星”（至多为5）。准备阶段，你移除所有“星”标记并观看牌堆顶等量的牌，你可以用手牌交换这些牌并将这些牌置于牌堆顶和牌堆底。",
		"mengdizai_info": "地载|出牌阶段限一次，你可以弃置一张牌，令选择两名其他角色从牌堆底各摸一张牌，并进行拼点。赢的角色弃置两张牌并对没赢的角色造成一点伤害；若均没赢，则你获得两张拼点牌（不计入手牌上限）。",
		"mengfengyang_info": "风扬|你不能成为其他角色拼点的目标。一名角色发动拼点后，你可以依次观看并用任意张手牌交换此次拼点中没赢的角色的手牌。",

		menglinting_info: "聆听|每回合限一次，一名角色使用非伤害类即时牌指定目标时，你可以将非目标角色的一张牌交给使用者，然后令该角色加入目标。",
		mengquanxin_info: "泉心|每回合限一次，你可以视为使用一张非伤害类即时锦囊牌。",
	},
	2311: {



		hyyz_jingliu: ['镜流', ["female", "hyyz_xt", 4, ["hyyzfeiguang", "hyyzzhuanpo"], []], '#b谨守此誓，吾等云骑<br>如云翳障空，卫蔽仙舟<br>拔剑！', '镜流，曾经的罗浮剑首，云骑军不败盛名的缔造者。而今其名字已被抹去，成为行走于魔阴身边缘的仙舟叛徒，汲汲追寻旧日的夙愿。倒在她剑下的丰饶之民数不胜数，造翼者的羽卫，步离人的父狼，连高如山岳的器兽也当不住她的一击，可最终因魔阴神智狂乱、大开杀戒，成了逃亡域外的重犯。'],
		hyyzfeiguang: {
			audio: 8,
			init(player) {
				player.storage.hyyzfeiguang = false;
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					var str = '';
					if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
						if (player.storage.hyyzfeiguang == false) str += '阳：每回合限一次，你可以视为使用或打出一张不计入次数冰【杀】';
						else str += '阴：你受到伤害后获得四张基本牌';
					} else {
						if (player.storage.hyyzfeiguang == false) str += '阳：每回合限一次，你可以将一张牌当不计入次数的冰【杀】使用或打出';
						else str += '阴：你受到伤害后须弃置所有黑色手牌，然后获得四张与弃置牌颜色不同的基本牌';
					}
					return str;
				},
			},
			group: ['hyyzfeiguang_use', 'hyyzfeiguang_dam'],
			subSkill: {
				use: {
					enable: ["chooseToRespond", "chooseToUse"],
					usable: 1,
					filter(event, player) {
						return player.countCards('he') > 0 && player.storage.hyyzfeiguang == false;
					},
					position: "hes",
					prompt(event, player) {
						var player = _status.event.player;
						if (!player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo) {
							return '将一张牌当不计入次数的冰【杀】使用或打出'
						} else {
							return '视为使用或打出一张不计入次数的冰【杀】'
						}
					},
					filterCard(card, player, event) {
						return !player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo;
					},
					selectCard(card) {
						var player = _status.event.player;
						if (!player.hasSkill('hyyzzhuanpo') || !player.storage.hyyzzhuanpo) {
							return 1;
						} else {
							return -1;
						}
					},
					viewAs: {
						name: "sha",
						nature: "ice",
						storage: {
							hyyzfeiguang: true,
						}
					},
					check(card) {
						return 8 - get.value(card)
					},
					precontent() {
						event.getParent().addCount = false;
					},
					onuse(links, player) {
						'step 0'
						player.changeZhuanhuanji('hyyzfeiguang');
						'step 1'
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 3, 4)
							player.changeZhuanhuanji('hyyzzhuanpo');
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 1, 2)
						}
					},
					onrespond(links, player) {
						'step 0'
						player.changeZhuanhuanji('hyyzfeiguang');
						'step 1'
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 3, 4)
							player.changeZhuanhuanji('hyyzzhuanpo');
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 1, 2)
						}
					},
				},
				dam: {
					trigger: {
						player: 'damageEnd'
					},
					filter(event, player) {
						if (player.storage.hyyzfeiguang == false) return false;
						return true//player.countCards('h') > 0;
					},
					forced: true,
					check(event, player) {
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							return true//player.countCards('h') > 0;
						} else {
							return player.countCards('h', { color: 'black' }) < 4;
						}
					},
					prompt2(event, player) {
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							return '获得四张基本牌';
						} else {
							if (player.countCards('h', { color: 'black' }) > 0) {
								return '弃置所有黑色手牌，然后获得四张红色基本牌';
							} else {
								return '弃置所有黑色手牌，然后获得四张基本牌';
							}
						}
					},
					content() {
						'step 0'
						player.changeZhuanhuanji('hyyzfeiguang');
						if (player.hasSkill('hyyzzhuanpo') && player.storage.hyyzzhuanpo) {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 7, 8)
							player.changeZhuanhuanji('hyyzzhuanpo');
							var colors = [];
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzfeiguang', 5, 6)
							if (player.countCards('h', { color: 'black' }) > 0) {
								player.discard(player.getCards('h', { color: 'black' }));
								var colors = ['black'];
							} else {
								var colors = [];
							}

						}
						var cards = [];
						while (cards.length < 4) {
							var card = get.cardPile(function (card) {
								return get.type(card) == 'basic' && !colors.includes(get.color(card)) && !cards.includes(card);
							});
							if (card) cards.push(card);
						}
						if (cards.length) player.gain(cards, 'gain2');
					},
					ai: {
						maixie: true,
						"maixie_hp": true,
						result: {
							effect: function (card, player, target) {
								if (get.tag(card, 'damage') && target.storage.hyyzfeiguang != false) {
									if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
									if (!target.hasFriend()) return;
									var num = 1;
									if (get.attitude(player, target) > 0) {
										if (player.needsToDiscard()) {
											num = 0.7;
										}
										else {
											num = 0.5;
										}
									}
									if (target.hp >= 4) return [1, num * 2];
									if (target.hp == 3) return [1, num * 1.5];
									if (target.hp == 2) return [1, num * 0.5];
								}
							},
						},
						threaten: 0.6,
					},
				},
			},
		},
		hyyzfeiguang_info: "飞光|转换技，<br>阳：每回合限一次，你可以将一张牌当不计入次数的冰【杀】使用或打出。<br>阴：你受到伤害后须弃置所有黑色手牌，然后获得四张与弃置牌颜色不同的基本牌。",
		hyyzzhuanpo: {
			audio: 2,
			init(player) {
				player.storage.hyyzzhuanpo = false;
			},
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content: function (storage, player, skill) {
					var str = '';
					if (player.storage.hyyzzhuanpo == false) str += '阳：你使用【杀】指定目标后，可以对自己或曾对其造成过伤害的角色造成1点伤害并令此【杀】不可被响应';
					else str += '阴：你发动〖飞光〗时不消耗手牌';
					return str;
				},
			},
			trigger: { player: "useCardToTargeted" },
			filter(event, player) {
				if (player.storage.hyyzzhuanpo || event.card.name != 'sha') return false;
				if (!event.targets.length) return false;
				return true || event.target.getAllHistory('damage', function (evt) {
					if (!evt || !evt.source || !evt.source.isAlive()) return false;
					return true;
				}).length > 0;
			},
			async cost(event, trigger, player) {
				let targetx = [player];
				trigger.target.getAllHistory('damage', function (evt) {
					if (!evt || !evt.source || !evt.source.isAlive()) return false;
					targetx.add(evt.source);
				});
				const result = await player
					.chooseTarget('转魄：对自己或一名伤害来源造成1点伤害，然后此【杀】不可被响应')
					.set('filterTarget', (card, player, target) => targetx.includes(target))
					.set('ai', function (target) {
						if (player.hasSkill('hyyzfeiguang') && player.storage.hyyzfeiguang != false) {
							if (player.hp > 3) return target == player;
						}
						return get.damageEffect(target, player, player, 'fire');
					})
					.forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				player.changeZhuanhuanji('hyyzzhuanpo');
				target.damage();
				trigger.getParent().directHit.addArray(game.filterPlayer());
			},
		},
		hyyzzhuanpo_info: "转魄|转换技。<br>阳：你使用【杀】指定目标后，可以对自己或曾对其造成过伤害的角色造成1点伤害并令此【杀】不可被响应。<br>阴：你发动〖飞光〗时不消耗手牌。",

		hyyz_huohuo: ['藿藿', ["female", "hyyz_xt", 3, ["hyyzqienuo", "hyyzqushen", "hyyzsuiyang"], []], '#b你们不要过来啊啊啊！', '可怜又弱小的狐人小姑娘，也是怕鬼捉鬼的罗浮十王司见习判官。<br>名为「尾巴」的岁阳被十王司的判官封印在她的颀尾上，使她成为了招邪的「贞凶之命」。<br>害怕妖魔邪物，却总是受命捉拿邪祟，完成艰巨的除魔任务；<br>自认能力不足，却无法鼓起勇气辞职，只好默默害怕地继续下去。'],
		hyyzqienuo: {
			audio: 4,
			forced: true,
			group: 'hyyzqienuo_audio',
			subSkill: {
				audio: {
					trigger: {
						global: "useCard",
					},
					forced: true,
					filter(event, player) {
						if (!event.targets || event.targets.length != 1) return false;
						if (event.targets[0] == event.player) return false;
						if (event.player == player) {
							return get.type(event.card) == 'basic'
						} else {
							return get.type(event.card) == 'trick' && event.targets[0] == player;
						}
					},
					async content(event, trigger, player) {
						if (trigger.player == player) {
							game.hyyzSkillAudio('hyyz', 'hyyzqienuo', 1, 2)
						} else {
							game.hyyzSkillAudio('hyyz', 'hyyzqienuo', 3, 4)
						}
						game.log(player, '将', trigger.card, '的使用者由', trigger.player, '改为', trigger.targets[0]);
						trigger.untrigger();
						trigger.player = trigger.targets[0];
						if (trigger.card.name == 'shunshou') {
							game.log(player, '抱住了自己，但好像没什么可拿的');
							trigger.targets.remove(player);
						}
					},
				}
			},
		},
		"hyyzqienuo_info": "怯懦|锁定技，当你使用单体基本牌时，或其他角色对你使用单体普通锦囊牌时，目标角色成为此牌的使用者。",
		hyyzqushen: {
			audio: 2,
			trigger: {
				global: "useCardToTarget",
			},
			filter(event, player) {
				if (player.countCards('he') <= 0) return false;
				if (!event.targets || event.targets.length != 1 || event.targets[0] != event.player) return false;
				if (!['basic', 'trick'].includes(get.type(event.card))) return false;
				return game.hasPlayer(function (current) {
					return !event.targets.includes(current) && lib.filter.targetEnabled2(event.card, event.player, current);
				});
			},
			usable: 1,
			async cost(event, trigger, player) {
				const result = await player.chooseCardTarget({
					prompt: '驱神：是否增加一个目标？',
					prompt2: `使用者为${get.translation(trigger.player)}且${get.type(trigger.card) == 'basic' ? '额外目标[净化]' : '此牌不能被【无懈可击】响应'} `,
					filterCard(card, player) {
						return lib.filter.cardDiscardable(card, player);
					},
					filterTarget(card, player, target) {
						let trigger = _status.event.getTrigger();
						return !trigger.targets.includes(target) && lib.filter.targetEnabled2(trigger.card, trigger.player, target);
					},
					position: 'he',
					ai1(card) {
						return 8 - get.value(card);
					},
					ai2(target) {
						let player = _status.event.player, card = _status.event.getTrigger().card;
						let eff = get.effect(target, card, player, player), type = get.type2(card);
						let val = eff;
						if (eff > 0) {
							if (type == 'basic' && target.canhyyzJinghua()) val *= 2;
						} else {
							if (type == 'basic' && target.canhyyzJinghua()) val /= 2;
						}
						return eff;
					},
				}).forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const cards = event.cards, target = event.targets[0];
				player.discard(cards);
				player.line(target);
				trigger.targets.add(target);
				if (get.type(trigger.card) == 'basic') {
					trigger.targets.map(player => player.hyyzJinghua());
				} else {
					trigger.getParent().nowuxie = true;
				}

			},
			"_priority": 0,
		},
		hyyzqushen_info: "驱神|每回合限一次。当一名角色使用基本牌或普通锦囊牌指定自己为唯一目标时，你可以弃置一张牌并为此牌增加一个目标。若此牌为基本牌，目标角色" + get.hyyzIntroduce('净化') + "；否则，此牌不能被【无懈可击】响应。",
		hyyzsuiyang: {
			audio: 5,
			mark: true,
			intro: {
				content: "limited",
			},
			init(player, skill) {
				player.storage[skill] = false;
			},
			unique: true,
			enable: "phaseUse",
			filter: (event, player) => !player.storage.hyyzsuiyang,
			limited: true,
			skillAnimation: "epic",
			direct: true,
			animationColor: "wood",
			async content(event, trigger, player) {
				game.hyyzSkillAudio('hyyz', 'hyyzsuiyang', 1)
				player.awakenSkill('hyyzsuiyang');

				var list = [];
				for (var i = 0; i < lib.inpile.length; i++) {
					var name = lib.inpile[i];
					if (get.type(name) == 'basic') list.push(['基本', '', name]);
				}
				const links = await player
					.chooseButton(true, ['岁阳：选择“岁阳”', [list, 'vcard'], true])
					.set('ai', function (button) {
						var value = 0;
						if (button.link[2] == 'tao') value += 4;
						if (button.link[2] == 'jiu') value += 3;
						if (button.link[2] == 'shan') value += 2;
						if (button.link[2] == 'sha') value += 1;
						return value;
					})
					.forResultLinks();
				if (links) {
					let name = links[0][2];
					player.addSkill('hyyzsuiyang_buff');
					player.storage.hyyzsuiyang_buff = name;
					let card = get.cardPile2(card => card.name == name);
					if (card) {
						player.gain(card, 'gain2').gaintag.add('hyyzsuiyang');
						player.loseHp();
					}
				}
			},
			ai: {
				order: 9,
				result: {
					player: 1,
				},
			},
		},
		hyyzsuiyang_info: "岁阳|限定技，出牌阶段，你可以获得一张基本牌，然后失去1点体力。每回合结束时，若你没有〖岁阳〗牌，从牌堆获得之。",
		hyyzsuiyang_buff: {
			mark: true,
			marktext: "岁阳",
			onremove: true,
			intro: {
				name: "岁阳",
				mark: function (dialog, content, player) {
					if (player == game.me || player.isUnderControl()) {
						dialog.addText('已被“岁阳”寄生：');
						dialog.addSmall([[player.storage.hyyzsuiyang_buff], 'vcard']);
					} else dialog.addText('该角色已被“岁阳”寄生');
				},
				content: "岁阳名：$",
			},
			trigger: {
				global: "phaseEnd",
			},
			filter(event, player) {
				return !player.countCards('h', (card) => card.hasGaintag('hyyzsuiyang'));
			},
			forced: true,
			charlotte: true,
			silent: true,
			async content(event, trigger, player) {
				let card = get.cardPile((card) => card.name == player.storage.hyyzsuiyang_buff);
				if (card) player.gain(card, 'draw').gaintag.add('hyyzsuiyang');
			},
			group: ['hyyzsuiyang_buff_use', 'hyyzsuiyang_buff_damage'],
			subSkill: {
				use: {
					forced: true,
					charlotte: true,
					silent: true,
					trigger: {
						player: "useCard1",
					},
					filter(event, player) {
						return player.hasHistory('lose', function (evt) {
							if (evt.getParent() != event) return false;
							for (var i in evt.gaintag_map) {
								if (evt.gaintag_map[i].includes('hyyzsuiyang')) return true;
							}
							return false;
						});
					},
					content() {
						game.hyyzSkillAudio('hyyz', 'hyyzsuiyang', 2, 3)
					},
				},
				damage: {
					forced: true,
					charlotte: true,
					locked: false,
					silent: true,
					trigger: {
						player: 'damageBegin'
					},
					filter(event, player) {
						return player.countCards('h', (card) => card.hasGaintag('hyyzsuiyang')) > 0;
					},
					content() {
						game.hyyzSkillAudio('hyyz', 'hyyzsuiyang', 4, 5)
					}
				},
			},
		},

		meng_yelianna: ['叶莲娜', ["female", "hyyz_other", 4, ["mengdonghen", "mengjiannu", "mengrongyu"], []], '日玖阳气冲三关', ''],
		mengdonghen: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content: function (storage, player, skill) {
					var str = '当你成为其他角色使用牌的目标后，';
					if (player.storage.mengdonghen == true) str += '阴：失去1点体力并获得此牌';
					else str += '阳：此牌对你无效';
					return str;
				},
			},
			prompt: function (event, player) {
				var str = '';
				if (player.storage.mengdonghen == true) str += '失去1点体力并获得' + get.translation(event.card);
				else str += get.translation(event.card) + '对你无效';
				return str;
			},
			check: function (event, player) {
				if (player.storage.mengdonghen == true) {
					return player.hp > 1;
				} else {
					return -get.effect(player, event.card, event.player, player)
				}
			},
			locked: true,
			trigger: {
				target: 'useCardToTargeted'
			},
			filter: function (event, player) {
				return event.card && event.player != player;
			},
			content: function () {
				'step 0'
				player.changeZhuanhuanji('mengdonghen');
				if (player.storage.mengdonghen != true) {//阳
					player.loseHp();
					player.gain(trigger.cards, 'gain2');
				}
				else {//阴
					game.log('#g【冬痕】', trigger.card, '对', player, '无效')
					trigger.getParent().excluded.add(player);
				}
			},
		},
		mengjiannu: {
			enable: "phaseUse",
			usable: 1,
			filter: function (event, player) {
				return player.countCards('h') > 0;
			},
			content: function () {
				'step 0'
				var prompt = '###' + get.prompt('mengjiannu') + '###重铸一种花色的所有牌';
				var next = player.chooseButton(true, [prompt, [lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']], 1);
				next.set('filterButton', button => {
					var player = _status.event.player;
					var cards = player.getCards('h', { suit: button.link[2].slice(6) });
					return cards.length > 0 && cards.filter(card => lib.filter.cardDiscardable(card, player)).length == cards.length;
				});
				next.set('ai', button => {
					var player = _status.event.player;
					return 30 - player.getCards('h', { suit: button.link[2].slice(6) }).map(i => get.value(i)).reduce((p, c) => p + c, 0);
				});
				next.set('custom', {
					replace: {
						button: function (button) {
							if (!_status.event.isMine()) return;
							if (!_status.event.isMine()) return;
							if (button.classList.contains('selectable') == false) return;
							var cards = _status.event.player.getCards('h', { suit: button.link[2].slice(6) });
							if (cards.length) {
								var chosen = cards.filter(i => ui.selected.cards.contains(i)).length == cards.length;
								if (chosen) {
									ui.selected.cards.removeArray(cards);
									cards.forEach(card => {
										card.classList.remove('selected');
										card.updateTransform(false);
									});
								} else {
									ui.selected.cards.addArray(cards);
									cards.forEach(card => {
										card.classList.add('selected');
										card.updateTransform(true);
									});
								}
							}
							if (button.classList.contains('selected')) {
								ui.selected.buttons.remove(button);
								button.classList.remove('selected');
								if (_status.multitarget || _status.event.complexSelect) {
									game.uncheck();
									game.check();
								}
							}
							else {
								button.classList.add('selected');
								ui.selected.buttons.add(button);
							}
							var custom = _status.event.custom;
							if (custom && custom.add && custom.add.button) {
								custom.add.button();
							}
							game.check();
						}
					},
					add: next.custom.add
				});
				'step 1'
				if (result.bool) {
					var cards = result.cards;
					if (!cards.length) {
						var suits = result.links.map(i => i[2].slice(6));
						cards = player.getCards('h', card => suits.includes(get.suit(card, player)));
					}
					event.cards = cards;
					if (!cards.length) event.finish();
					else {
						player.recast(cards);
						if (game.hasPlayer(function (current) {
							var card = { name: 'sha', nature: 'ice' };
							return lib.filter.targetEnabled2(card, player, current) && lib.filter.targetInRange(card, player, current);
						})) {
							player.chooseTarget('视为使用一张冰【杀】，或点取消摸一张牌', function (card, player, target) {
								var card = { name: 'sha', nature: 'ice' };
								return lib.filter.targetEnabled2(card, player, target) && lib.filter.targetInRange(card, player, target);
							}).set('ai', function (target) {
								var card = { name: 'sha', nature: 'ice' };
								return get.effect(target, card, player, player);
							})
						} else {
							event._result = { bool: false, targets: [] };
						}
					}
				}
				'step 2'
				if (result.bool && result.targets.length > 0) {
					player.useCard({ name: 'sha', nature: 'ice' }, result.targets[0], false).set('addCount', false);
				} else {
					player.draw();
				}
			},
			onremove: true,
			marktext: "缄怒",
			intro: {
				content: "失去最后一种花色：$",
				onunmark: true,
			},
			group: 'mengjiannu_lose',
			subSkill: {
				lose: {
					trigger: {
						player: "loseEnd",
					},
					direct: true,
					filter: function (event, player) {
						for (var i = 0; i < event.cards.length; i++) {
							if (event.cards[i].original == 'h') {
								var suit = get.suit(event.cards[i]);
								if (!player.countCards('h', { suit: suit }) && !player.getStorage('mengjiannu').includes(suit)) return true;
							}
						}
						return false;
					},
					content: function () {
						'step 0'
						for (var i = 0; i < trigger.cards.length; i++) {
							if (trigger.cards[i].original == 'h') {
								var suit = get.suit(trigger.cards[i]);
								if (!player.countCards('h', { suit: suit }) && !player.getStorage('mengjiannu').includes(suit)) {
									player.markAuto('mengjiannu', [suit]);
								}
							}
						}
						'step 1'
						if (player.getStorage('mengjiannu').length >= 4) {
							player.chooseTarget(get.prompt('mengjiannu'), '造成1点冰冻伤害').set('ai', function (target) {
								var player = _status.event.player;
								return get.damageEffect(target, player, player, 'ice');
							});
						}
						'step 2'
						if (result.bool && result.targets && result.targets.length) {
							player.logSkill('mengjiannu', result.targets);
							player.unmarkSkill('mengjiannu');
							player.line(result.targets[0], 'ice');
							result.targets[0].damage('ice');
						}
					}
				}
			}
		},
		mengrongyu: {
			mod: {
				maxHandcard(player, num) {
					return num++;
				},
			},
			trigger: {
				player: "dieBegin",
			},
			async cost(event, trigger, player) {
				const result = await player.chooseTarget(get.prompt2('mengrongyu'), function (card, player, target) {
					return player != target;
				}).set('ai', function (target) {
					var att = get.attitude(_status.event.player, target);
					if (att > 0) {
						if (target.countCards('hs', { name: 'tao' })) return true;
						if (target.countCards('hs', { name: 'jiu' })) return true;
					}
					return -target.hp * att;
				}).forResult();
				event.result = result;
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				var num = target.hp;
				target.damage(num, 'nosource');
				target.recover(num);
				target.addSkills(['jsrgfeiyang', 'jsrgbahu'])
			},
			ai: {
				threaten(player, target) {
					if (target.hp == 1) return 2;
					return 0.5;
				},
			},
			"_priority": 0,
		},
		meng_saixiliya: ['塞西莉亚', ["female", "hyyz_b3", "3/5", ["mengxieheng1", "mengxieheng2", "mengxieheng3"], []], '七夕月', ''],
		mengxieheng1: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					return (player.storage.mengxieheng1 ? '阴：你使用【桃】时' : '阳：你使用【杀】时') + '，令所有角色加入此牌目标。';
				},
			},
			trigger: {
				player: "useCard",
			},
			locked: true,
			forced: true,
			filter(event, player) {
				return event.card.name == (player.storage.mengxieheng1 ? 'tao' : 'sha');
			},
			async content(event, trigger, player) {
				player.changeZhuanhuanji('mengxieheng1');
				trigger.targets = game.filterPlayer();
				player.line(game.filterPlayer(), trigger.card.name == 'sha' ? 'fire' : 'green');
			},
			ai: {
				threaten: 1.05,
				effect: {
					player(card, player, target, num) {
						if (player.storage.mengxieheng1 && card.name != 'tao') return;
						if (!player.storage.mengxieheng1 && card.name != 'sha') return;
						let val = 0;
						game.countPlayer(current => {
							val += lib.card[card.name].ai.result.target(player, current);
						})
						return [0, val + (player.hp - 2)];
					}
				}
			},
		},
		mengxieheng2: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					return (player.storage.mengxieheng2 ? '阴：你使用牌时，若目标包含自己，将自己移出目标。' : '阳：你使用牌时，若目标包含其他角色，将其他角色移出目标。')
				},
			},
			trigger: {
				player: "useCard",
			},
			locked: true,
			forced: true,
			filter: function (event, player) {
				if (player.storage.mengxieheng2 != true) {//阳
					return event.targets.filter(target => target != player).length > 0
				} else {
					return event.targets.filter(target => target == player).length > 0;
				}
			},
			async content(event, trigger, player) {
				if (player.storage.mengxieheng2 != true) {//阳
					trigger.targets.removeArray(game.filterPlayer(current => current != player));
				} else {
					trigger.targets.remove(player)
				};
				player.changeZhuanhuanji('mengxieheng2');
			},
			ai: {
				threaten: 1.05,
				effect: {
					player(card, player, target) {
						if (player.storage.mengxieheng2 && target == player) return 'zeroplayer'
						if (!player.storage.mengxieheng2 && target != player) return 'zerotarget';
					}
				}
			},
		},
		mengxieheng3: {
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content(storage, player, skill) {
					var str = '';
					if (player.storage.mengxieheng3) str += '阴：你使用的牌结算后，若有角色因此牌受到伤害或回复体力，你失去一点体力并获得此牌，且此牌不计入使用次数。';
					else str += '阳：你使用的牌结算后，若没有角色因此牌受到伤害或回复体力，你将手牌摸至或弃置至已损失体力值，然后本回合你使用同类型的牌额外结算一次。';
					return str;
				},
			},
			trigger: {
				player: "useCardAfter",
			},
			forced: true,
			filter(event, player) {
				let history = game.getGlobalHistory('everything', evt => (evt.name == 'damage' || evt.name == 'recover') && evt.card == event.card);
				if (player.storage.mengxieheng3) {
					return history.length > 0
				} else {
					return !history.length
				}
			},
			async content(event, trigger, player) {
				player.changeZhuanhuanji('mengxieheng3');
				if (!player.storage.mengxieheng3) {
					await player.loseHp();
					await player.gain(trigger.cards, 'gain2');
					if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
				} else {
					const num = player.countCards('h') - player.getDamagedHp();
					if (num > 0) await trigger.player.chooseToDiscard('h', true, num)
					else await trigger.player.draw(-num);
					player.storage.mengxieheng3_add = get.type2(trigger.card);
					player.addTempSkill('mengxieheng3_add');
				}
			},
			subSkill: {
				add: {
					onremove: true,
					trigger: {
						player: "useCard",
					},
					charlotte: true,
					silent: true,
					forced: true,
					filter(event, player) {
						return player.storage.mengxieheng3_add == get.type2(event.card);
					},
					async content(event, trigger, player) {
						trigger.effectCount++;
					},
					ai: {
						effect: {
							player(card, player, target) {
								if (player.storage.mengxieheng3_add == get.type2(card)) {
									return 2
								}
							}
						}
					}
				},
			},
			ai: {
				threaten: 1.05,
				effect: {
					player(card, player, target) {
						if (player.storage.mengxieheng3 && (get.tag(card, 'damage') > 0 || get.tag(card, 'recover') > 0)) {
							if (player.hp <= 1) return -2;
							return [1, 0.5]
						}
						if (!player.storage.mengxieheng3 && !get.tag(card, 'damage') && !get.tag(card, 'recover')) {
							return [1, player.getDamagedHp() - player.countCards('h') + 2];
						}
					}
				}
			},
		},
		meng_laiyila: ['莱依拉', ["female", "hyyz_ys", 3, ["mengfanqi", "mengmiansi"], []], '屺'],
		mengfanqi: {
			audio: 3,
			init(player) {
				player.storage.mengfanqi = true;
			},
			trigger: {
				player: "phaseDrawBegin2",
			},
			filter(event, player) {
				return !event.numFixed;
			},
			async cost(event, trigger, player) {
				const map = { '一': 1, '二': 2 };
				if (player.storage.mengfanqi) {
					map['三'] = 3;
					map['四'] = 4;
				}
				const list = Object.keys(map);
				const control = await player
					.chooseControl(list, 'cancel2', function () {
						return get.cnNumber(_status.event.goon, true);
					})
					.set('goon', player.skipList.includes('phaseUse') ? 4 : (
						player.countCards('h', (card) => get.tag(card, 'damage') && player.hasUseTarget(card)) ? 1 : 4
					))
					.set('prompt', '繁期：多摸至多' + get.translation(list.length) + '张牌')
					.set('prompt2', '不为1，本回合你使用牌时，不能再对其他角色使用牌；<br>为4，下次发动此技至多多摸两张牌')
					.forResultControl();
				if (control != 'cancel2') {
					event.result = {
						bool: true,
						cost_data: {
							num: map[control],
						}
					}
				}
			},
			async content(event, trigger, player) {
				const num = event.cost_data.num || 1;
				player.storage.mengfanqi = Boolean(num < 4);
				trigger.num += num;
				if (num > 1) player.addTempSkill('mengfanqi2', { player: 'phaseUseAfter' });
			},
		}, "mengfanqi2": {
			trigger: {
				player: "useCard1",
			},
			filter: function (event, player) {
				return player.isPhaseUsing();
			},
			silent: true,
			popup: false,
			locked: true,
			forced: true,
			charlotte: true,
			content: function () {
				player.addTempSkill('zishou2', { player: 'phaseUseAfter' })
			},
			"_priority": 1,
		},
		mengmiansi: {
			audio: 3,
			trigger: {
				player: "phaseDiscardBegin",
			},
			filter(event, player) {
				return !player.isTurnedOver();
			},
			async content(event, trigger, player) {
				player.turnOver();
				player.addTempSkill('mengmiansi_tag', 'phaseDiscardAfter');
			},
			group: ["mengmiansi2"],
			subSkill: {
				tag: {
					mod: {
						ignoredHandcard: function (card, player) {
							if (player.hasHistory('gain', evt => evt?.cards?.includes(card))) {
								return true;
							}
							if (card.hasGaintag('mengmiansi')) { }
						},
						cardDiscardable: function (card, player, name) {
							if (name == 'phaseDiscard' && player.hasHistory('gain', evt => evt?.cards?.includes(card))) {
								return false;
							}
						},
					},
				},
			},
		}, "mengmiansi2": {
			audio: 'mengmiansi',
			trigger: {
				player: "turnOverEnd",
			},
			filter(event, player) {
				return player.countCards('he') >= 1;
			},
			async cost(event, trigger, player) {
				let dialog = ui.create.dialog('眠思', 'hidden');
				//dialog.addText('若选择出杀，将根据你选择的排序依次使用之')
				var table = document.createElement('div');
				table.classList.add('add-setting');
				table.style.margin = '0';
				table.style.width = '100%';
				table.style.position = 'relative';

				const list = ['出杀', '移牌', '回复'];
				dialog.add([list.map((item, i) => [i, item]), "tdnodes"]);
				dialog.add(player.getCards('he'));

				let next = player.chooseButton();
				next.set('dialog', dialog);
				next.set('selectButton', [2, 4]);
				next.set('ai', () => {
					//console.log(_status.event.dialog.buttons);
					return true;
				})
				next.set('filterButton', function (button, player) {
					if (!player.hasUseTarget({ name: 'sha' }) && button.link == 0) return false;
					if (!player.canMoveCard() && button.link == 1) return false;
					var map = {
						number: 0,
						object: 0,
					};
					if (ui.selected.buttons.length) {
						for (var i = 0; i < ui.selected.buttons.length; i++) {
							map[typeof ui.selected.buttons[i].link]++;
						}
					}
					if (map['object'] == map['number']) return true;
					else {
						if (map['object'] > map['number']) return typeof button.link == 'number';
						if (map['object'] < map['number']) return typeof button.link == 'object';
					}
				});
				next.set('filterOk', (button) => {
					return ui.selected.buttons.filter(buttonx => typeof buttonx.link == 'number').length ==
						ui.selected.buttons.filter(buttonx => typeof buttonx.link == 'object').length
				})
				const links = await next.forResultLinks();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							dialog: dialog,
							links: links,
						}
					}
				}
			},
			async content(event, trigger, player) {
				const dialog = event.cost_data.dialog, links = event.cost_data.links;
				if (links) {
					dialog.close();
					const cards = links.filter(i => typeof i != 'number');
					const control = links.filter(i => typeof i == 'number');
					player.discard(cards);
					if (control.includes(0) && player.hasUseTarget({ name: 'sha' })) {//包含杀
						const card = get.autoViewAs({ name: 'sha' }, cards);
						await player.chooseUseTarget(card, cards, true);
					};
					if (control.includes(1)) {
						await player.moveCard(true);
						let map = [];
						while (false && map.length < 3 && game.hasPlayer(current => {
							return current != player && current.countDiscardableCards(player, 'he') && map.filter(k => k == current.name).length < 2;
						})) {
							const { result: { targets: discarder } } = await player.chooseTarget('弃置一名其他角色的牌（' + map.length + '/3）', function (card, player, target) {
								if (map.filter(k => k == target.name).length >= 2) return false;
								return target.countDiscardableCards(player, 'he') && target != player;
							}).set('ai', (target) => -get.attitude(player, target));
							if (discarder) {
								map.push(discarder[0].name);
								player.discardPlayerCard(discarder[0], 'he', true);
							}
						}
					};
					if (control.includes(2)) {
						player.recover();
						player.draw();
					};
				}
			},
			ai: {
				//unequip: true,
				//"unequip_ai": true,
				//skillTagFilter: function (player, tag, arg) {
				//	if (tag == 'unequip' && (!arg || !arg.card || !arg.card.storage || !arg.card.storage.mengmiansi)) return false;
				//	if (tag == 'unequip_ai' && (!arg || arg.name != 'sha')) return false;
				//},
			},
			"_priority": 0,
		},
		meng_aierhaisen: ['艾尔海森', ["male", "hyyz_ys", 4, ["mengtuiyan", "mengrishen"], []], '柚衣'],
		mengtuiyan: {
			audio: 5,
			logAudio: () => [`ext:忽悠宇宙/asset/meng/audio/mengtuiyan1.mp3`],
			enable: "phaseUse",
			filterTarget(card, player, target) {
				return player != target && target.countCards('h') > 0;
			},
			async content(event, trigger, player) {
				const target = event.target;
				const cards = await target.chooseCard('推演：选择一张手牌', true).forResultCards();
				if (!cards) return;
				const CARD = cards[0];
				var list = [
					'此时是否有此牌的合法目标',
					'　　此牌是否是基本牌　　',
					'　　　　此牌的颜色　　　　'
				];
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i]];
				}
				let next = target.chooseButton([
					'赐福：选择两种描述方式',
					[list.slice(0, 1), 'tdnodes'],
					[list.slice(1, 2), 'tdnodes'],
					[list.slice(2, 3), 'tdnodes'],
				]);
				next.set('forced', true);
				next.set('selectButton', 2);
				next.set('filterButton', () => true);
				const links = await next.forResultLinks()
				if (links) {
					let str = '这是一张';
					if (links.includes(0)) {
						str += `[${target.hasUseTarget(CARD) ? '' : '不'}能使用的]`;
					}
					if (links.includes(2)) {
						str += `[${get.translation(get.color(CARD))}]`;
					}
					if (links.includes(1)) {
						str += `[${get.type(CARD) == 'basic' ? '' : '非'}基本]`;
					}
					str += '牌';
					target.say(str);
					game.log(target, '说', str);

					const cards = await player
						.choosePlayerCard(target, true, 'h', 'visible')
						.set('prompt', '猜猜看他说的是那张牌？')
						.set('ai', (card) => {
							if (Math.random() > 0.3) return CARD;
							return true;
						})
						.forResultCards();
					if (cards) {
						if (cards[0] == CARD) target.showCards(cards);
						else target.showCards([CARD, cards[0]]);
						game.log(player, '选择了', cards);
						if (cards[0] == CARD) {
							game.hyyzSkillAudio('meng', 'mengtuiyan', 2, 3)
							player.say('如我所料');
							await player.draw(target.countCards('h'));
							player.tempBanSkill(event.name)
						} else {
							game.hyyzSkillAudio('meng', 'mengtuiyan', 4, 5)
							player.say('计划有变');
							await player.loseHp();
							await player.gain(CARD, target, 'give');
						}
					}
				}
			},
			ai: {
				order: 15,
				result: {
					player: function (player, target) {
						var num = target.countCards('he');
						if (player.hp <= 1) return (1 - num) * 10 + 1;
						return 3 - num;
					},
					target: -1,
				},
				threaten: 2,
			},
		},
		mengrishen: {
			audio: 4,
			logAudio(event, player) {
				if (event.name == 'useCard') return [
					'ext:忽悠宇宙/asset/meng/audio/mengrishen3.mp3',
					'ext:忽悠宇宙/asset/meng/audio/mengrishen4.mp3',
				];
				return [
					'ext:忽悠宇宙/asset/meng/audio/mengrishen1.mp3',
					'ext:忽悠宇宙/asset/meng/audio/mengrishen2.mp3',
				];
			},
			trigger: {
				player: ["gainAfter", "useCard1"],
				global: "loseAsyncAfter",
			},
			forced: true,
			filter: function (event, player) {
				if (event.name == 'useCard') {
					return player.hasHistory('lose', evt => {
						if (event != evt.getParent()) return false;
						for (var i in evt.gaintag_map) {
							if (evt.gaintag_map[i][0].indexOf('visible_') != -1) return true;
						}
						return false;
					});
				}
				else {
					var evt = event.getParent('phaseDraw');
					if (evt && evt.player == player) return false;
					return event.getg(player).length > 0;
				}
			},
			content: function () {
				'step 0'
				if (trigger.name == 'useCard') {
					game.log(trigger.card, '不能被响应');
					trigger.directHit.addArray(game.players);
				} else {
					var cards = trigger.getg(player);
					player.addShownCards(cards, 'visible_dddxianglang');
				}
			},
			"_priority": 0,
		},
		meng_fuleai_xier: ['希儿·芙乐艾', ["female", "hyyz_b3", 4, ["mengshuanghun", "mengsisheng"], []], '沧海依酥', ''],
		mengshuanghun: {
			audio: 2,
			logAudio: () => false,
			init(player) {
				lib.character['meng_white_xier'] = ["female", "hyyz_b3", 4, ["mengbaizhou", "mengmingguang"], ['ext:忽悠宇宙/asset/meng/image/meng_white_xier.jpg']];
				lib.character['meng_black_xier'] = ["female", "hyyz_b3", 4, ["mengheiye", "menganying"], ['ext:忽悠宇宙/asset/meng/image/meng_black_xier.jpg']];
				player.when({
					player: 'dieBegin'
				}).then(() => {
					game.hyyzSkillAudio('meng', player.storage.mengshuanghun)
				})
			},
			trigger: {
				global: ["phaseBefore"],
				player: "enterGame",
			},
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async cost(event, trigger, player) {
				const links = await player
					.chooseButton(true, ['双魂：选择一个人格', [['meng_white_xier', 'meng_black_xier'], 'character']])
					.forResultLinks();
				if (links) event.result = {
					bool: true,
					cost_data: {
						links: links,
					}
				}
			},
			async content(event, trigger, player) {
				const name = event.cost_data.links[0];
				player.storage.mengshuanghun = name;
				player.markSkill('mengshuanghun');
				const skills = lib.character[name][3];
				player.addAdditionalSkill('mengshuanghun', skills);
				player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/meng/image/' + name + '.jpg');
				game.hyyzSkillAudio('meng', 'mengshuanghun', (name == 'meng_white_xier' ? 1 : 2))
			},
			derivation: ['mengbaizhou', 'mengmingguang', 'mengheiye', 'menganying'],
		},
		mengsisheng: {
			audio: 2,
			logAudio: () => false,
			trigger: {
				player: ["phaseZhunbeiBegin", "turnOverEnd"],
			},
			filter(event, player) {
				if (player.hasSkill('mengsisheng_end') || player.hasSkill('mengsisheng_phase')) return false;
				return true;
			},
			content: function () {
				'step 0'
				if (player.isLinked()) {
					player.link();
				}
				'step 1'
				if (player.isTurnedOver()) {
					player.turnOver();
				}
				'step 2'
				if (player.storage.mengshuanghun && player.storage.mengshuanghun == 'meng_white_xier') {
					player.storage.mengshuanghun = 'meng_black_xier';
				} else player.storage.mengshuanghun = 'meng_white_xier';
				player.syncStorage('mengshuanghun');
				player.markSkill('mengshuanghun');
				player.addTempSkill('mengsisheng_phase', { player: 'phaseBegin' });
				'step 3'
				if (player.storage.mengshuanghun == 'meng_white_xier') {
					game.hyyzSkillAudio('meng', 'mengsisheng', 1)
					player.addAdditionalSkill('mengshuanghun', ['mengbaizhou', 'mengmingguang']);
					player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/meng/image/meng_white_xier.jpg');
				} else {
					game.hyyzSkillAudio('meng', 'mengsisheng', 2)
					player.addAdditionalSkill('mengshuanghun', ['mengheiye', 'menganying']);
					player.node.avatar.setBackgroundImage('extension/忽悠宇宙/asset/meng/image/meng_black_xier.jpg');
				}
			},
			subSkill: {
				phase: {
					mark: true,
					intro: {
						content: '死生失效'
					},
					onremove: function (player, skill) {
						player.addTempSkill('mengsisheng_end');
					},
					charlotte: true,
				},
				end: {
					mark: true,
					intro: {
						content: '死生失效'
					},
				}
			},
			"_priority": 0,
		},
		mengbaizhou: {
			audio: 2,
			enable: "phaseUse",
			usable: 1,
			filterCard: true,
			position: "he",
			selectCard: [1, Infinity],
			check(card) {
				var player = get.owner(card);
				if (get.type(card) == 'trick') return 10;
				if (player.countCards('h') - player.hp - ui.selected.cards.length > 0) {
					return 8 - get.value(card);
				}
				return 4 - get.value(card);
			},
			filterTarget: true,
			content: function () {
				target.recover();
				target.draw(cards.length);
			},
			ai: {
				expose: 0.2,
				order: 1,
				result: {
					target(player, target, card) {
						if (target.isDamaged()) return ui.selected.cards.length + 3;
						return ui.selected.cards.length
					}
				},
			},
		},
		mengmingguang: {
			audio: 2,
			trigger: {
				global: "recoverAfter",
			},
			usable: 1,
			check(event, player) {
				return get.attitude(player, event.player) > 0;
			},
			logTarget: 'player',
			async content(event, trigger, player) {
				trigger.player.when({
					player: 'damageBegin3'
				}).then(() => {
					let target = game.findPlayer(current => current.hasSkill('mengmingguang'));
					if (target) target.logSkill('mengmingguang', player)
					trigger.num--;
				})
				await player.drawTo(player.maxHp)
			},
		},
		mengheiye: {
			audio: 2,
			trigger: {
				source: "damageSource",
			},
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			filter(event, player) {
				return event.card && get.color(event.card) == 'black' && event.player.isAlive();
			},
			content: function () {
				'step 0'
				trigger.player.loseHp()
				'step 1'
				if (trigger.player.getDamagedHp() > 0) player.draw(trigger.player.getDamagedHp());
			},
		},
		menganying: {
			audio: 2,
			trigger: {
				global: "loseHpEnd",
			},
			usable: 1,
			check(event, player) {
				return get.attitude(player, event.player) < 0;
			},
			filter(event, player) {
				return event.player.isAlive()
			},
			async content(event, trigger, player) {
				trigger.player.when({
					player: 'damageBegin3'
				}).then(() => {
					let target = game.findPlayer(current => current.hasSkill('menganying'));
					if (target) target.logSkill('menganying', player)
					trigger.num++;
				})

				var num = trigger.player.countCards('h') - trigger.player.hp;
				if (num > 0) await trigger.player.chooseToDiscard('h', true, num)
				else await trigger.player.draw(-num);
			},
		},
		meng_wu_xiaogong: ['宵宫', ["female", "hyyz_ys", 3, ["mengyanshang", "menghuahuo", "mengxiaji"], ['die:meng_xiaogong']], '冷若寒', ''],
		mengyanshang: {
			audio: "mengyanshi",
			mod: {
				targetInRange: function (card, player, target) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return true;
					}
				},
				cardUsable: function (card, player) {
					if (!card.cards) return;
					for (var i of card.cards) {
						if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return Infinity;
					}
				},
			},
			trigger: {
				player: "useCard",
			},
			filter: function (event, player) {
				if (get.itemtype(event.cards) != 'cards') return false;
				for (var i of event.cards) {
					if (player.getHistory('gain', evt => evt && evt.cards && evt.cards.includes(i)).length) return true;
				}
				return false;
			},
			forced: true,
			content() { },
		},
		menghuahuo: {
			audio: "mengqingcun",
			init: function (player) {
				player.storage.menghuahuo = []
			},
			trigger: {
				player: 'useCardAfter'
			},
			filter: function (event, player) {
				if (!event.card) return false;
				return ['trick', 'basic'].includes(get.type(event.card));
			},
			frequent: true,
			content: function () {
				'step 0'
				var card1 = game.createCard(trigger.card);
				var card2 = game.createCard(trigger.card);
				var cards = [card1, card2];
				player.$throw(cards, 1000);
				game.log('【花火】', player, '将', cards, '加入牌堆');
				game.cardsGotoPile(cards, () => {
					return ui.cardPile.childNodes[get.rand(0, ui.cardPile.childNodes.length - 1)];
				});
				player.storage.menghuahuo.push(card1);
				player.storage.menghuahuo.push(card2);
				player.markSkill('menghuahuo');
				'step 1'
				game.updateRoundNumber();
				game.delayx();
			},
			intro: {
				mark: function (dialog, content, player) {
					dialog.addAuto(content);
				},
			},
			group: ["menghuahuo_use", "menghuahuo_lose"],
			subSkill: {
				use: {
					trigger: {
						global: "useCardToPlayer",
					},
					filter: function (event, player) {
						return player.storage.menghuahuo && player.storage.menghuahuo.length && event.cards.filter(function (i) {
							return player.storage.menghuahuo.includes(i);
						}).length > 0;
					},
					direct: true,
					content: function () {
						'step 0'
						player.logSkill('menghuahuo')
						var list = trigger.cards.filter(function (i) {
							return player.storage.menghuahuo.includes(i);
						});
						var cards = [];
						for (var cardx of list) {
							for (var i = 0; i < ui.cardPile.childNodes.length; i++) {
								var card = ui.cardPile.childNodes[i];
								if (card.name == cardx.name) {
									cards.push(card);
								}
							}
						}
						player.gain(cards, 'gain2').triggerd = null;
						player.discard(cards);
						//player.$throw(cards, 1000);
						//game.log(player, '将', cards, '置入了弃牌堆');
						//game.cardsDiscard(cards);
						game.delayx();
					},
					sub: true,
					"_priority": 0,
				},
				lose: {
					trigger: {
						global: ["loseAfter", "cardsDiscardAfter", "loseAsyncAfter"],
					},
					direct: true,
					filter: function (event, player) {
						if (event.name.indexOf('lose') == 0) {
							if (event.getlx === false || event.position != ui.discardPile) return false;
						}
						else {
							var evt = event.getParent();
							if (evt.relatedEvent && evt.relatedEvent.name == 'useCard') return false;
						}
						for (var i of event.cards) {
							var owner = false;
							if (event.hs && event.hs.includes(i)) owner = event.player;
							var type = get.type(i, null, owner);
							if ((type == 'basic' || type == 'trick') && player.storage.menghuahuo && player.storage.menghuahuo.includes(i)) return true;
						}
						return false;
					},
					content: function () {
						player.logSkill('menghuahuo')
						var num = 0;
						for (var i of trigger.cards) {
							if (player.storage.menghuahuo && player.storage.menghuahuo.includes(i)) num++;
						}
						player.draw(num);
					},
				}
			},
			"_priority": 0,
		},
		mengxiaji: {
			audio: "menghuahuoyouyi",
			unique: true,
			enable: "phaseUse",
			limited: true,
			filter: function (event, player) {
				return !player.storage.mengxiaji
			},
			skillAnimation: "epic",
			animationColor: "fire",
			content: function () {
				player.storage.mengxiaji = true;
				game.filterPlayer(function (current) {
					current.addSkill('mengxiaji2');
				});
			},
			mark: true,
			intro: {
				content: "limited",
			},
			init: function (player, skill) {
				player.storage[skill] = false;
			},
			ai: {
				order: 1,
				result: {
					player: 1,
				}
			}
		},
		mengxiaji2: {
			trigger: {
				player: ['phaseBegin', 'die'],
			},
			forceDie: true,
			silent: true,
			popup: false,
			locked: true,
			forced: true,
			charlotte: true,
			filter: function (event, player) {
				return player.hasSkill('mengxiaji');
			},
			content: function () {
				game.filterPlayer(function (current) {
					current.removeSkill('mengxiaji2');
				});
			},
			mod: {
				cardname: function (card, player, name) {
					if (card) return 'huogong';
				},
			}
		},
		meng_sp_furina: ['芙宁娜', ["female", "hyyz_ys", 4, ["mengduanming"], []], '沧海依酥', ''],
		mengduanming: {
			audio: 3,
			trigger: {
				player: 'phaseUseBefore'
			},
			filter: function (event, player) {
				return game.hasPlayer(i => i != player && i.countCards('h') > 0);
			},
			direct: true,
			content: function () {
				'step 0'
				player.chooseTarget(get.prompt('mengduanming'), function (card, player, target) {
					return target != player && target.countCards('h') > 0;
				}).set('ai', (target) => get.attitude(player, target) < 0);
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					player.logSkill('mengduanming', target);
					var next = player.chooseButton([
						'断明：选择你觉得对方有的花色',
						[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
					]);
					next.set('forced', true);
					next.set('selectButton', [0, 4]);
					next.set('filterButton', function (button) {
						return true
					});
					next.set('ai', function (button) {
						if (button.link[2].slice(6) == 'heart' || button.link[2].slice(6) == 'diamond') {
							return 1;
						} else return 1;
					});
					event.target = target;
				} else event.finish()
				'step 2'
				target.showHandcards();
				var suit_player = { 'spade': false, 'heart': false, 'club': false, 'diamond': false }, str_player = '';
				for (var i of result.links) {
					suit_player[i[2].slice(6)] = true;
					str_player += get.translation(i[2]);
				};
				var suit_target = { 'spade': false, 'heart': false, 'club': false, 'diamond': false };
				for (var j of target.getCards('h')) suit_target[get.suit(j, target)] = true;
				var num = 0;
				for (var k in suit_player) {
					if (suit_player[k] == suit_target[k]) {
						if (suit_player[k] == true) {
							game.log('猜有', k, '，实有', k, '，猜对了');
						} else game.log('猜无', k, '，实无', k, '，猜对了');
						num++;
					} else {
						if (suit_player[k] == true) {
							game.log('猜有', k, '，实无', k, '，', '猜错了');
						} else game.log('猜无', k, '，实有', k, '，', '猜错了');
						//num--;
					}
				}
				game.log(player, '猜对的花色数为', num);
				event.num = num;
				'step 3'
				if (num <= 0) {
					trigger.cancel();
					target.skip('phaseUse');
					target.addTempSkill('mengduanming_skip', { player: 'phaseUseSkipped' });
				} else if (num > 0) {
					player.draw();
					player.discardPlayerCard(target, 'he', true);
					if (num > 1) {
						player.addTempSkill('mengduanming_pla');
						target.addTempSkill('mengduanming_tar');
						if (num > 2) {
							target.damage(player);
							if (num > 3) {
								target.addTempSkill('fengyin');
							}
						}
					}
				}
			},
			subSkill: {
				skip: {
					mark: true,
					intro: {
						content: "跳过下回合的出牌阶段",
					},
					"_priority": 0,
				},
				pla: {
					mark: true,
					intro: {
						content: "无距离和次数限制",
					},
					mod: {
						targetInRange: function (card, player, target) {
							if (target.hasSkill('mengduanming_tar')) {
								return true;
							}
						},
						cardUsableTarget: function (card, player, target) {
							if (target.hasSkill('mengduanming_tar')) return true;
						},
					},
					charlotte: true,
				},
				tar: {
					mark: true,
					intro: {
						content: "被芙宁娜审判",
					},
					ai: {
						effect: {
							target: function (card, player, target) {
								if (get.tag(card, 'damage')) return [0, -999999];
							},
						},
					},
					charlotte: true,
				}
			}
		},
		meng_sp_wendy: ['温迪', ["male", "hyyz_ys", 3, ["mengliufeng", "menggexian", "mengbaizhan"], []], '微雨'],
		mengliufeng: {
			audio: 3,
			init(player) {
				player.storage.mengliufeng = 0;
			},
			trigger: {
				global: "roundStart",
			},
			filter(event, player) {
				return player.getHandcardLimit() > 0 || game.hasPlayer(current => get.distance(current, player) > 1);
			},
			async cost(event, trigger, player) {
				var list = [];
				if (game.hasPlayer(current => get.distance(current, player) > 1)) list.add('手牌上限+1');
				if (player.getHandcardLimit() > 0) list.add('手牌上限-1');
				const control = await player.chooseControl(list).set('ai', () => 0).forResultControl();
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
				if (event.cost_data.control == '手牌上限+1') {
					player.storage.mengliufeng++;
				}
				if (event.cost_data.control == '手牌上限-1') {
					player.storage.mengliufeng--;
				};
				player.markSkill('mengliufeng');
			},
			mod: {
				maxHandcard(player, num) {
					if (player.storage.mengliufeng == 0) return;
					return num + player.storage.mengliufeng;
				},
				globalTo(from, to, distance) {
					if (to.storage.mengliufeng && to.storage.mengliufeng != 0) {
						return distance - to.storage.mengliufeng;
					};
				},
			},
			onremove: true,
			marktext: "流风",
			intro: {
				content(storage, player) {
					if (storage == 0) return '无变化';
					return `手牌上限${storage}，计算与你的距离${storage > 0 ? '-' + storage : '+' + (-storage)}`;
				},
			},
		},
		menggexian: {
			audio: 2,
			trigger: {
				player: "phaseEnd",
			},
			filter(event, player) {
				return game.hasPlayer(current => get.distance(current, player) == 1);
			},
			async content(event, trigger, player) {
				const targets = game.filterPlayer(current => get.distance(current, player) == 1);
				let list = ["phaseZhunbei", "phaseJudge", "phaseDraw", "phaseUse", "phaseDiscard", "phaseJieshu"];
				for (let target of targets) {
					if (!list.length && !target.countCards('he')) continue;
					let cards = undefined;
					if (target.countCards('h')) {
						let bool = list.length ? false : true,
							str = `交给${get.translation(player)}一张牌` + (list.length ? `，或令其执行${get.translation(list[0])}` : ``);
						cards = await target
							.chooseCard('he', str)
							.set('forced', bool)
							.set('ai', (card) => 8 - get.value(card))
							.forResultCards();
					};
					if (cards) {
						await player.gain(cards, target, 'give');
					} else {
						var next = player[list.shift()]();
						event.next.remove(next);
						trigger.next.push(next);
					}
				}
			},
		},
		mengbaizhan: {
			audio: 2,
			trigger: {
				global: 'useCardEnd'
			},
			filter(event, player) {
				let history = game.getGlobalHistory("useCard");
				return player.getHandcardLimit() == history.indexOf(event) + 1;
			},
			forced: true,
			async content(event, trigger, player) {
				player.gain(trigger.cards.filterInD(), 'gain2');
				if (trigger.player == player) {
					if (player.getStat().card[trigger.card.name] > 0) player.getStat().card[trigger.card.name]--;
				}
			},
			mod: {
				cardUsable(card, player, num) {
					if (game.getGlobalHistory("useCard").length + 1 == player.getHandcardLimit()) return Infinity;
				},
			},
		},
		meng_abeiduo: ['阿贝多', ["male", "hyyz_ys", 3, ["mengsucheng", "mengchuangsheng", "mengbaie"], []], '微雨'],
		mengsucheng: {
			audio: 3,
			init: function (player) {
				player.storage.mengsucheng = [];
			},
			enable: "phaseUse",
			filter: function (card, player) {
				return !player.hasSkill('mengsucheng_no');
			},
			onremove: true,
			content: function () {
				'step 0'
				var cards = get.cards();
				var content = ['牌堆顶的牌', cards];
				game.log(player, '观看了牌堆顶的牌');
				player.chooseControl('ok').set('dialog', content);
				ui.cardPile.insertBefore(cards[0], ui.cardPile.firstChild);
				if (!player.getStorage('mengsucheng').includes(get.suit(cards[0]))) {
					player.markAuto('mengsucheng', [get.suit(cards[0])]);
					event.finish();
				} else {
					player.addTempSkill('mengsucheng_no');
					var list = [];
					for (var i = 0; i < lib.inpile.length; i++) {
						var name = lib.inpile[i];
						if (get.type(name) == 'trick') list.push(['锦囊', '', name]);
					}
					player.chooseButton(true, ['选择视为使用的牌', [list, 'vcard'], true]).set('ai', function (button) {
						return button.link[2] == 'wuzhong' ? 1 : 0;
					});
				}
				'step 1'
				var num = player.getStorage('mengsucheng').length;
				event.card = { name: result.links[0][2] };
				if (game.countPlayer((current) => lib.filter.targetEnabled2(event.card, player, current)) > 0) {
					player.chooseTarget('视为对至多' + num + '名角色使用' + get.translation(event.card), [1, num], function (card, player, target) {
						return lib.filter.targetEnabled2(_status.event.cardx, player, target)
					}).set('ai', function (target) {
						return get.effect(target, _status.event.cardx, player, player)
					}).set('cardx', event.card);
				} else event.finish();
				'step 2'
				var targets = result.targets;
				if (targets.length > 0) targets.sortBySeat();
				for (var i of targets) {
					player.useCard(event.card, i, false);
				}
			},
			group: "mengsucheng_clear",
			subSkill: {
				no: {
					sub: true,
					"_priority": 0,
				},
				clear: {
					trigger: {
						player: "phaseEnd",
					},
					forced: true,
					silent: true,
					popup: false,
					content: function () {
						player.storage.mengsucheng = [];
					},
					sub: true,
					"_priority": 1,
				},
			},
			ai: {
				order: 9,
				result: {
					player: 1,
				},
			},
			"_priority": 0,
		},
		mengchuangsheng: {
			audio: 3,
			trigger: {
				player: ["useCardAfter", "respondEnd"],
			},
			direct: true,
			filter: function (event, player) {
				return !player.hasSkill('mengchuangsheng_no');
			},
			content: function () {
				'step 0'
				var next = player.chooseButton([
					'创生：猜测牌堆顶的牌的花色',
					[lib.suit.map(i => ['', '', 'lukai_' + i]), 'vcard']
				]);
				next.set('forced', false);
				next.set('selectButton', [1, 1]);
				next.set('filterButton', function (button) {
					return true
				});
				next.set('ai', function (button) {
					if (_status.event.player.hp == 1) return button.link[2].slice(6) == get.suit(_status.pileTop)
					if (_status.event.player.hasSkill('mengsucheng_no')) return 1;
					else if (get.itemtype(_status.pileTop) != 'card') return 1;
				});
				'step 1'
				if (result.bool) {
					player.logSkill('mengchuangsheng');
					var suitx = result.links[0][2].slice(6);
					var cards = get.cards();
					var suit2 = get.suit(cards[0]);
					if (suitx == suit2) {
						player.gain(cards, 'gain2');
						if (player.getStat().card[trigger.card.name] > 0) delete player.getStat().card[trigger.card.name];
					} else {
						player.showCards(cards);
						player.addTempSkill('mengchuangsheng_no');
					}
				}
			},
			subSkill: {
				no: {
					sub: true,
					"_priority": 0,
				},
			},
		},
		mengbaie: {
			audio: 2,
			trigger: {
				player: "gainAfter",
			},
			frequent: true,
			filter: function (event, player) {
				for (var i of event.getg(player)) {
					if (!player.getStorage('mengbaie').includes(get.suit(i))) {
						return true;
					}
				}
				return false;
			},
			onremove: true,
			mark: true,
			marktext: "白垩",
			intro: {
				content: "已获得牌的花色：$",
				onunmark: true,
			},
			forced: true,
			content: function () {
				'step 0'
				for (var i of trigger.getg(player)) {
					if (!player.getStorage('mengbaie').includes(get.suit(i))) {
						player.markAuto('mengbaie', [get.suit(i)]);
					}
				}
				'step 1'
				if (!player.hasSkill('mengchuangsheng_no') && !player.hasSkill('mengsucheng_no')) {
					event.finish();
				} else {
					var list = [];
					if (player.hasSkill('mengchuangsheng_no')) list.push('创生');
					if (player.hasSkill('mengsucheng_no')) list.push('塑成');
					player.chooseControl(list).set('prompt', '白垩：选择清除的技能记录');
				}
				'step 2'
				if (result.control == '塑成') {
					player.storage.mengsucheng = [];
					player.removeSkill('mengsucheng_no');
				};
				if (result.control == '创生') {
					player.removeSkill('mengchuangsheng_no');
				};
			},
			group: 'mengbaie_clear',
			subSkill: {
				clear: {
					trigger: {
						global: "phaseEnd",
					},
					forced: true,
					silent: true,
					popup: false,
					content: function () {
						player.storage.mengbaie = [];
						player.syncStorage('mengbaie');
						player.unmarkSkill('mengbaie');
					},
					sub: true,
					"_priority": 1,
				}
			},
			"_priority": 0,
		},

		"mengdonghen_info": "冬痕|转换技，当你成为其他角色使用牌的目标后，阳：令此牌对你无效。阴：你失去1点体力并获得此牌。",
		"mengjiannu_info": "缄怒|①出牌阶段限一次，你可以重铸一种花色的所有手牌，然后摸一张牌或视为使用一张不计入使用次数的冰【杀】。②当你累计失去过每种花色的所有手牌后，重置此项并对一名角色造成1点冰属性伤害。",
		mengrongyu_info: "融语|你的手牌上限+1。当你死亡时，〖夷灭〗一名其他角色，然后其获得〖飞扬〗〖跋扈〗。",

		mengxieheng1_info: "血痕1|锁定技，转换技。阳: 你使用【杀】时，阴: 你使用【桃】时，令所有角色加入此牌目标。",
		mengxieheng2_info: "血痕2|锁定技，转换技。阳：你使用牌时，若目标包含其他角色，将其他角色移出目标。阴: 你使用牌时，若目标包含自己，将自己移出目标。",
		mengxieheng3_info: "血痕3|锁定技，转换技。阳: 你使用的牌结算后，若没有角色因此牌受到伤害或回复体力，你将手牌摸至或弃置至已损失体力值，然后本回合你使用同类型的牌额外结算一次。阴: 你使用的牌结算后，若有角色因此牌受到伤害或回复体力，你失去一点体力并获得此牌，且此牌不计入使用次数。",

		"mengfanqi_info": "繁期|摸牌阶段，你可以多摸至多四张牌。若你以此法多摸的牌数：不为1，当你于出牌阶段使用牌时，此阶段不能再对其他角色使用牌；为4，下次发动此技至多多摸两张牌。",
		"mengmiansi_info": "眠思|弃牌阶段开始时，你可以将武将牌翻至背面，并令本回合内获得的牌不计入手牌上限。<br>当你翻面后，你可以选择至多两项并弃置等量的牌：<br>1.将弃置的牌当【杀】使用。<br>2.移动场上一张牌。<br>3.回复1点体力并摸一张牌",

		"mengtuiyan_info": "推演|出牌阶段，你可以令一名其他角色选择一张手牌并选择两项进行描述：1.此时是否有此牌的合法目标。<br>2.此牌是否是基本牌。<br>3.此牌的颜色。<br>你观看并选择该角色的一张手牌，若你与其选择的手牌相同，摸X张牌（X为其的手牌数）且不能再发动此技；否则，你失去1点体力并获得其选择的牌。",
		"mengrishen_info": "日神|锁定技，你于摸牌阶段外获得的牌明置；你使用明置的牌时，其他角色不可响应之。",

		"meng_black_xier": "Vollerei",
		"meng_white_xier": "Seele",
		"mengshuanghun_info": "双魂|锁定技，游戏开始时，你从两张“人格”牌中选择一张置于武将牌上，你视为拥有武将牌上“人格”牌的所有技能。",
		"mengsisheng_info": "死生|准备阶段，或你翻面后，你可以更换“人格”牌并复原武将牌，然后此技能无效直到你的下个回合结束。",
		"mengbaizhou_info": "白昼|出牌阶段限一次，你可以弃置任意张牌，令一名角色回复1点体力并摸等量的牌。",
		"mengmingguang_info": "明光|每回合限一次，当一名角色回复体力后，你可以令其下次受到的伤害-1，然后你将手牌摸至体力上限。",
		"mengheiye_info": "黑夜|当你使用黑色牌造成伤害后，你可以令目标角色失去1点体力，然后你摸X张牌，X为其已损失的体力值。",
		"menganying_info": "暗影|每回合限一次，当一名角色失去体力后，你可以令其下次受到的伤害+1，然后你令其将手牌摸至/弃置至当前体力值。",

		mengyanshang_info: "炎上|锁定技，你使用本回合获得的牌无距离和次数限制。",
		menghuahuo_info: "花火|当你使用基本牌或普通锦囊牌后，你可以将与此牌同名的两张牌加入牌堆并标记为“花火”。当一张“花火”牌被使用后，你弃置牌堆中所有与之同名的牌。当一张“花火”牌不因使用而进入弃牌堆后，你摸一张牌。",
		mengxiaji_info: "夏祭|限定技，出牌阶段，你可以令所有角色的手牌视为【火攻】，直到你的回合开始或死亡。",

		mengduanming_info: "断明|出牌阶段开始前，你可以猜测一名有手牌的其他角色手牌中的花色，然后其展示所有手牌。若你猜对的花色数：<br>1.小于1，你和该角色跳过下个出牌阶段。<br>2.不小于1，摸一张牌并弃置其一张牌。<br>3.不小于2，本回合对其使用牌无距离和次数限制。<br>4.不小于3，对其造成一点伤害。<br>5.大于3: 令其本回合非锁定技失效。",

		"mengliufeng_info": "流风|锁定技，每轮开始时，你令手牌上限+1/-1，然后其他角色计算与你的距离-1/+1。",
		"menggexian_info": "歌仙|回合结束后，令所有与你距离为1的其他角色选择一项：交给你一张牌，你执行首个未执行的阶段：准备、判定、摸牌、出牌、弃牌、结束。",
		"mengbaizhan_info": "百盏|锁定技，每回合第Y张牌被使用后，你获得之；若来源为你，此牌不计入次数。Y为你的手牌上限。",

		"mengsucheng_info": "塑成|出牌阶段，你可以观看牌堆顶的一张牌。若记录中没有此牌的花色，你记录之；否则，视为对至多X名角色使用一张普通锦囊牌且本回合不能再发动此技，X为本回合此技的发动次数。",
		"mengchuangsheng_info": "创生|当你使用或打出牌后，你可以声明一种花色并展示牌堆顶的牌。若牌堆顶的牌与你声明的花色相同，你获得之并令当前使用的牌不计入使用次数；否则，本回合不能再发动此技。",
		"mengbaie_info": "白垩|你每回合首次获得一种花色的牌后，你重置〖塑成〗或〖创生〗并清除记录。",

	},
	2312: {
		meng_zhipeizhilvzhe: ['支配之律者', ["female", "hyyz_b3", 3, ["mengzongou", "mengkuixi"], []], '咩阿栗诶'],
		mengzongou: {
			audio: 14,
			enable: "phaseUse",
			usable: 1,
			filter: (event, player) => player.countCards('he', card => get.type(card) == 'trick'),
			filterCard: (card) => get.type(card) == 'trick',
			content: () => {
				'step 0'
				var len = get.cardNameLength(cards[0]) + player.getDamagedHp();
				var cards = get.cards(len);
				player.showCards(cards, get.translation(player) + '发动了【纵偶】');
				var suits = [];
				for (let card of cards) {
					if (get.suit(card) && get.suit(card) != 'none' && !suits.includes(get.suit(card))) suits.push(get.suit(card));
				};
				event.suits = suits;
				'step 1'
				if (game.countPlayer(current => current.isIn() && current != player) > 1) {
					player.chooseTarget('纵偶', `将${get.translation(event.suits[0])}分配给其他角色`, lib.filter.notMe, true).set('ai', (target) => {
						var eff = -get.attitude(player, target);
						if (target.hasSkill('mengzongou_mark') && target.storage.mengzongou_mark && target.storage.mengzongou_mark.includes(_status.event.suitx)) eff /= 2;
						return eff;
					}).set('suitx', event.suits[0]);
				}
				else event._result = { bool: true, targets: game.filterPlayer(current => current.isIn() && current != player) };
				'step 2'
				var target = result.targets[0];
				player.line(target, 'fire');
				target.addSkill('mengzongou_mark');
				player.when('die').assign({
					forceDie: true,
					charlotte: true,
					firstDo: true,
				}).then(() => {
					game.countPlayer(function (current) {
						if (current.hasSkill('mengzongou_mark')) current.removeSkill('mengzongou_mark');
					})
				});
				game.log(target, '被', player, '<span class="firetext">操控</span>了');
				do {
					var suit = event.suits.shift();
					if (!target.storage.mengzongou_mark.includes(suit)) {
						target.markAuto('mengzongou_mark', [suit]);
					}
				} while (game.countPlayer(current => current.isIn() && current != player) == 1 && event.suits.length);
				'step 3'
				if (event.suits.length) event.goto(1);
			},
			group: 'mengzongou_use',
			subSkill: {
				mark: {
					mark: true,
					charlotte: true,
					locked: true,
					init: (player) => player.storage.mengzongou_mark = [],
					marktext: '傀',
					intro: {
						name: "傀",
						content: function (storage, player) {
							if (!storage) return '没有“傀”标记';
							var str = '“傀”标记的花色：';
							str += storage.map(suit => get.translation(suit));
							return str;
						}
					},
					onremove: (player) => player.unmarkSkill('mengzongou_mark'),
				},
				use: {

					trigger: {
						global: 'useCardToPlayer'
					},
					direct: true,
					filter: (event, player) => {
						return event.targets.length == 1 && event.player.hasSkill('mengzongou_mark') && event.player.storage.mengzongou_mark.includes(get.suit(event.card)) && !event.getParent().mengzongou_use && game.countPlayer(function (current) {
							return lib.filter.targetEnabled2(event.card, event.player, current) && !event.targets.includes(current) && lib.filter.targetInRange(event.card, event.player, current);
						});
					},
					content: () => {
						'step 0'
						player.chooseTarget('纵偶', `重新指定${get.translation(trigger.player)}使用${get.translation(trigger.card)}的目标`, function (card, player, target) {
							var trigger = _status.event.getTrigger();
							var card = trigger.card;
							return lib.filter.targetEnabled2(card, trigger.player, target) && !trigger.targets.includes(target) && lib.filter.targetInRange(card, trigger.player, target);
						}).set('ai', (target) => get.effect(target, trigger.card, trigger.player, player))
						'step 1'
						if (result.bool) {
							var targets = result.targets;
							if (trigger.target != targets[0]) {
								player.logSkill('mengzongou', targets, 'fire');
								game.log(player, '将', trigger.card, '的目标改为了', targets[0]);
								trigger.player.unmarkAuto('mengzongou_mark', [get.suit(trigger.card)]);
								trigger.getParent().mengzongou_use = true;
								trigger.getParent().targets.remove(trigger.target);
								trigger.getParent().targets.push(targets[0]);
							}
						}
					}
				},
			},
			ai: {
				order: 12,
				result: {
					player: 10,
				}
			}
		},
		mengkuixi: {
			audio: "mengzongou",
			trigger: {
				global: 'useCard1',
			},
			direct: true,
			filter: (event, player) => {
				if (event.name == 'shan' || event.name == 'wuxie') return false;
				if (get.type(event.card) == 'equip' || get.type(event.card) == 'delay') return false;
				if (player.getStorage('mengkuixi').length > 0) return false;
				var info = get.translation(get.name(event.card) + '_info');
				if (!info) return false;
				for (var i of ['伤害', '回复', '弃置']) {
					if (info.indexOf(i) != -1) return true;
				};
				return false;
			},
			filter1: (event, player) => {
				if (get.type(event.card) == 'equip' || get.type(event.card) == 'delay') return false;
				var info = get.info(event.card);
				if (event.targets && !info.multitarget) {
					var players = game.filterPlayer();
					for (var i = 0; i < players.length; i++) {
						if (lib.filter.targetEnabled2(event.card, event.player, players[i]) && !event.targets.includes(players[i]) && lib.filter.targetInRange(event.card, event.player, players[i])) {
							return true;
						}
					}
				}
			},
			filter2: (event, player) => {
				return event.targets && event.targets.length > 0;
			},
			content: () => {
				'step 0'
				var list = [
					'为XXX增加/减少一个目标',
					'令XXX无法被响应',
					'XXX结算结束后，分配此牌的花色为“傀”',
				], card = get.translation(trigger.card);
				for (var i = 0; i < list.length; i++) {
					list[i] = [i, list[i].replace(/XXX/g, card)];
				}
				var next = player.chooseButton([
					`傀戏：<span class='thundertext'>选择一项</span>或<span class='thundertext'>直接确定</span>`,
					[list.slice(0, 2), 'tdnodes'],
					[list.slice(2, 3), 'tdnodes'],
				]);
				next.set('forced', true);
				next.set('selectButton', [0, 1]);
				next.set('filterButton', function (button) {
					var trigger = _status.event.getTrigger();
					if (button.link == 0) return _status.event.bool1 || _status.event.bool2;
					if (button.link == 1) return true;
					if (button.link == 2) return player.hasSkill('mengzongou') && get.suit(trigger.card) && get.suit(trigger.card) != 'none';
				});
				next.set('bool1', lib.skill.mengkuixi.filter1(trigger, player));
				next.set('bool2', lib.skill.mengkuixi.filter2(trigger, player));
				next.set('ai', function (button) {
					var player = _status.event.player;
					var event = _status.event.getTrigger();
					switch (button.link) {
						case 0: {
							var num = 0;
							if (game.hasPlayer(function (current) {
								return lib.filter.targetEnabled2(event.card, player, current) && !event.targets.includes(current) && get.effect(current, event.card, player, player) > 0;
							})) num = 1.6 + Math.random();
							var info = get.info(event.card);
							if (info.multitarget && trigger.targets && trigger.targets.length && get.effect(current, event.card, player, player) < 0) num = 1.9 + Math.random();
							return num;
						}
						case 1: {
							if (get.attitude(player, event.player) > 0) {
								var num = 1.3;
								if (event.card.name == 'sha') {
									if (!event.targets.filter(current => get.effect(current, event.card, player, player) > 0).length) return 0;
									if (event.card.name == 'sha' && event.targets.filter(function (current) {
										if (current.mayHaveShan() && get.attitude(player, current) <= 0) {
											if (current.hasSkillTag('useShan')) num = 1.8;
											return true;
										}
										return false;
									}).length) return num + Math.random();
								};
								return 0.5 + Math.random();
							} else return -1;
						}
						case 2: {
							return 0.3 + Math.random();
						}
					}
				});
				'step 1'
				if (result.links && result.links.length) {
					if (result.links[0] == 0) {
						player.chooseTarget(true, '选择一名角色', '选择原目标则取消之，选择非原目标则增加之', function (card, player, target) {
							var trigger = _status.event.getTrigger();
							if (trigger.targets.includes(target)) return true;
							if (get.type(trigger.card) == 'equip' || get.type(trigger.card) == 'delay') return trigger.targets.includes(target);
							return trigger.targets.includes(target) || (lib.filter.targetEnabled2(trigger.card, trigger.player, target) && lib.filter.targetInRange(trigger.card, trigger.player, target));
						}).set('ai', function (target) {
							var player = _status.event.player;
							var trigger = _status.event.getTrigger();
							return (trigger.targets.includes(target) ? -1 : 1) * get.effect(target, trigger.card, trigger.player, player);
						});
					}
					else {
						player.logSkill('mengkuixi', result.links[0] == 1 ? trigger.player : undefined);
						if (!player.storage.mengkuixi) {
							player.when({ global: 'phaseAfter' }).then(() => { player.unmarkSkill('mengkuixi') });
						}
						player.markAuto('mengkuixi', trigger.card);
						if (result.links[0] == 1) {
							game.log(trigger.card, '不能被响应');
							trigger.nowuxie = true;
							trigger.directHit.addArray(game.players);
						}
						else if (result.links[0] == 2) {
							game.log(trigger.card, '结算后将被', player, '用于<span class="firetext">操控</span>');
							trigger.card.storage.mengkuixi_add = true;
						}
						event.finish();
					}
				}
				else event.finish();
				'step 2'
				if (result.bool && result.targets && result.targets.length) {
					var target = result.targets[0];
					player.logSkill('mengkuixi', target);
					if (!player.storage.mengkuixi) {
						player.when({ global: 'phaseAfter' }).then(() => { player.unmarkSkill('mengkuixi') });
					}
					player.markAuto('mengkuixi', trigger.card);
					game.log(player, '将', target, trigger.targets.includes(target) ? '移出' : '加入', '了目标');
					trigger.targets[trigger.targets.includes(target) ? 'remove' : 'push'](target);
					if (trigger.targets == []) trigger.targets.length = 0;
				}
			},
			marktext: "傀",
			intro: {
				content: storage => `本回合已发动过${storage.length}次〖傀戏〗`,
				onunmark: true,
			},
			group: 'mengkuixi_add',
			subSkill: {
				add: {
					trigger: {
						global: 'useCardAfter'
					},
					charlotte: true,
					forced: true,
					locked: true,
					direct: true,
					filter: (event, player) => player.hasSkill('mengzongou') && event.card.storage && event.card.storage.mengkuixi_add && get.suit(event.card) != 'none',
					content: () => {
						'step 0'
						if (game.countPlayer(current => current.isIn() && current != player) > 1) {
							player.chooseTarget('傀戏', `将${get.translation(get.suit(trigger.card))}分配给其他角色`, lib.filter.notMe, true).set('ai', (target) => {
								var trigger = _status.event.getTrigger();
								var eff = -get.attitude(player, target);
								if (target.hasSkill('mengzongou_mark') && target.storage.mengzongou_mark && target.storage.mengzongou_mark.includes(get.suit(trigger.card))) eff /= 2;
								return eff;
							});
						} else event._result = { bool: true, targets: game.filterPlayer(current => current.isIn() && current != player) };
						'step 1'
						if (result.bool && result.targets && result.targets.length) {
							var target = result.targets[0];
							player.logSkill('mengkuixi', target);
							player.line(target, 'fire');
							game.log(target, '被', player, '<span class="firetext">操控</span>了');
							target.addSkill('mengzongou_mark');
							if (!target.storage.mengzongou_mark.includes(get.suit(trigger.card))) {
								target.markAuto('mengzongou_mark', [get.suit(trigger.card)]);
							}
						}
					}
				}
			}
		},
		meng_zhaoxing: ['赵信', ["male", "hyyz_other", 4, ["mengdianci", "mengwuwei"], []], '流萤一生推'],
		mengdianci: {
			audio: 2,
			enable: "phaseUse",
			filterCard: true,
			selectCard: -1,
			position: "h",
			filter: function (event, player) {
				if (player.hasSkill('mengdianci_buff')) return false;
				var hs = player.getCards('h');
				if (!hs.length) return false;
				for (var card of hs) {
					var mod2 = game.checkMod(card, player, 'unchanged', 'cardEnabled2', player);
					if (mod2 === false) return false;
				}
				return event.filterCard(get.autoViewAs({ name: 'sha' }, hs));
			},
			check: function () { return 1 },
			viewAs: {
				name: "sha",
				storage: {
					mengdianci: true,
				},
			},
			onuse: function (links, player) {
				player.addTempSkill('mengdianci_buff', 'phaseUseAfter');
			},
			mod: {
				targetInRange: function (card, player, target) {
					if (card.storage && card.storage.mengdianci) {
						if (get.distance(player, target) != 1) return false;
					}
				},
			},
			ai: {
				order: 8,
				threaten: 1.14,
				yingbian: function (card, player, targets, viewer) {
					if (get.attitude(viewer, player) <= 0) return 0;
					var base = 0, hit = false;
					if (get.cardtag(card, 'yingbian_hit')) {
						hit = true;
						if (targets.filter(function (target) {
							return target.hasShan() && get.attitude(viewer, target) < 0 && get.damageEffect(target, player, viewer, get.nature(card)) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_all')) {
						if (game.hasPlayer(function (current) {
							return !targets.includes(current) && lib.filter.targetEnabled2(card, player, current) && get.effect(current, card, player, player) > 0;
						})) base += 5;
					}
					if (get.cardtag(card, 'yingbian_damage')) {
						if (targets.filter(function (target) {
							return get.attitude(player, target) < 0 && (hit || !target.mayHaveShan() || player.hasSkillTag('directHit_ai', true, {
								target: target,
								card: card,
							}, true)) && !target.hasSkillTag('filterDamage', null, {
								player: player,
								card: card,
								jiu: true,
							})
						})) base += 5;
					}
					return base;
				},
				canLink: function (player, target, card) {
					if (!target.isLinked() && !player.hasSkill('wutiesuolian_skill')) return false;
					if (target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
						target: target,
						card: card,
					}, true)) return false;
					if (player.hasSkill('jueqing') || player.hasSkill('gangzhi') || target.hasSkill('gangzhi')) return false;
					return true;
				},
				basic: {
					useful: [5, 3, 1],
					value: [5, 3, 1],
				},
				result: {
					target: function (player, target, card, isLink) {
						var eff = function () {
							if (!isLink && player.hasSkill('jiu')) {
								if (!target.hasSkillTag('filterDamage', null, {
									player: player,
									card: card,
									jiu: true,
								})) {
									if (get.attitude(player, target) > 0) {
										return -7;
									}
									else {
										return -4;
									}
								}
								return -0.5;
							}
							return -1.5;
						}();
						if (!isLink && target.mayHaveShan() && !player.hasSkillTag('directHit_ai', true, {
							target: target,
							card: card,
						}, true)) return eff / 1.2;
						return eff;
					},
				},
				tag: {
					respond: 1,
					respondShan: 1,
					damage: function (card) {
						if (game.hasNature(card, 'poison')) return;
						return 1;
					},
					natureDamage: function (card) {
						if (game.hasNature(card)) return 1;
					},
					fireDamage: function (card, nature) {
						if (game.hasNature(card, 'fire')) return 1;
					},
					thunderDamage: function (card, nature) {
						if (game.hasNature(card, 'thunder')) return 1;
					},
					poisonDamage: function (card, nature) {
						if (game.hasNature(card, 'poison')) return 1;
					},
				},
			},
		},
		"mengdianci_buff": {
			audio: "mengdianci",
			trigger: {
				global: "useCardAfter",
			},
			charlotte: true,
			forced: true,
			filter: function (event, player) {
				return event.card.storage && event.card.storage.mengdianci && game.hasPlayer2(current => {
					return current.hasHistory('sourceDamage', evt => evt.card == event.card);
				});
			},
			content: function () {
				'step 0'
				var list = trigger.cards.slice(0);
				var map = { basic: 0, trick: 0, equip: 0 };
				for (let i of list) {
					var type = get.type(i);
					switch (type) {
						case 'basic': map.basic++; break;
						case 'trick': map.trick++; break;
						case 'equip': if (get.subtype(i) == 'equip1') map.equip++; break;
					}
				}
				if (map.trick > 0) player.draw(map.trick);
				if (map.equip > 0) player.changeHujia(map.equip);
				if (map.basic > 0) {
					for (let target of trigger.targets) {
						for (var count = 0; count < map.basic; count++) {
							if (player.canUse({ name: 'sha' }, target, false, false)) player.useCard({ name: 'sha' }, target, false);
							else break;
						}
					}
				}
			},
			sub: true,
			"_priority": 0,
		},
		mengwuwei: {
			audio: 4,
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			forced: true,
			filter: function (event, player) {
				return game.hasPlayer(current => current != player && !current.hasSkill('mengwuwei_juedou')) && (event.name != 'phase' || game.phaseNumber == 0);
			},
			content: function () {
				'step 0'
				player.chooseTarget('请选择【决斗】的目标', lib.translate.mengwuwei_info, true, function (card, player, target) {
					return target != player && !target.hasSkill('mengwuwei_juedou');
				}).set('ai', function (target) {
					var att = get.attitude(_status.event.player, target);
					if (att > 0) return att + 1;
					if (att == 0) return Math.random();
					return -att;
				}).animate = true;
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					target.addSkill('mengwuwei_juedou');
				}
			},
			mod: {
				globalFrom: function (from, to, distance) {
					if (to.hasSkill('mengwuwei_juedou')) return -Infinity;
				},
			},
			group: "mengwuwei_add",
			subSkill: {
				juedou: {
					mark: true,
					marktext: "🔱",
					intro: {
						content: "赵信的「决斗」目标",
					},
					sub: true,
					"_priority": 0,
				},
				add: {
					trigger: {
						source: "damageSource",
						player: "damageEnd",
					},
					direct: true,
					forced: true,
					filter: function (event, player) {
						return event.source && event.source.isAlive();
					},
					content: function () {
						'step 0'
						player.logSkill('mengwuwei');
						var target = trigger.source == player ? trigger.player : trigger.source;
						if (target.hasSkill('mengwuwei_juedou')) {
							player.draw();
						} else {
							game.filterPlayer(function (current) {
								if (current.hasSkill('mengwuwei_juedou')) current.removeSkill('mengwuwei_juedou')
							})
							target.addSkill('mengwuwei_juedou');
						}
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		meng_wodanheng: ['我丹恒', ["male", "hyyz_xt", 3, ["menggufeng", "mengqinghua"], []], '七夕月', ''],
		menggufeng: {
			audio: 4,
			mark: true,
			marktext: "☯",
			zhuanhuanji: true,
			intro: {
				content: function (storage, player, skill) {
					var str = '古枫：';
					if (player.storage.menggufeng == true) str += '阴：将X张手牌当等量数值的风【杀】使用，X为上次发动〖古枫①阳〗时使用的手牌数。';
					else str += '阳：将一半（向下取整）的手牌当等量数值的【酒】使用。';
					return str;
				},
			},
			locked: true,
			lasttrick: function (player) {
				var name = '';
				var history = player.getAllHistory('useCard', function (evt) {
					var cardx = evt.card;
					var info = lib.card[cardx.name];
					if (cardx.name == 'wuzhong' || cardx.name == 'hyyz_zisu') return true;
					if (!info || info.type != 'trick' || info.notarget || info.selectTarget && info.selectTarget != 1) return false;
					if (get.type2(cardx) == 'trick') return true;
				});
				if (history.length) name = history[history.length - 1].card.name;
				return name;
			},
			group: ['menggufeng_jiusha', 'menggufeng_buff'],
			subSkill: {
				jiusha: {
					name: '古枫①',
					enable: "chooseToUse",
					filter: function (event, player) {
						if (player.storage.menggufeng) return true;//杀
						else return Math.floor(player.countCards('h') / 2) > 0;//酒
					},
					prompt: function (event, player) {
						var player = _status.event.player;
						if (player.storage.menggufeng) {
							var num = player.storage.menggufeng2;
							return '古枫杀：将' + num + '张手牌当伤害基数为' + num + '的风【杀】使用';
						} else {
							var num = Math.floor(player.countCards('h') / 2);
							return '古枫酒：将' + num + '张手牌当伤害基数为' + num + '的【酒】使用';
						}
					},
					check: function (card) {
						var player = _status.event.player;
						return 7 - get.useful(card);
					},
					filterCard: true,
					selectCard: function () {
						if (_status.event.player.storage.menggufeng) {
							return _status.event.player.storage.menggufeng2;
						} else return Math.floor(_status.event.player.countCards('h') / 2);
					},
					position: "h",
					viewAs: function (cards, player) {
						if (player.storage.menggufeng) {
							return {
								name: "sha",
								nature: "hyyz_wind",
								storage: {
									menggufeng: true,
								},
							}
						} else return {
							name: "jiu",
							storage: {
								menggufeng: true,
							},
						}
					},
					precontent: function () {
						if (player.storage.menggufeng) {
							game.hyyzSkillAudio('meng', 'menggufeng', 2)
							player.changeZhuanhuanji('menggufeng');
							player.addTempSkill('menggufeng_sha2');
						} else {
							game.hyyzSkillAudio('meng', 'menggufeng', 1)
							player.changeZhuanhuanji('menggufeng');
							var num = Math.floor(player.countCards('h') / 2);
							player.storage.menggufeng2 = num;
							player.addTempSkill('menggufeng_jiu2');
						}
					},
				},
				buff: {
					trigger: {
						global: "useCard",
					},
					silent: true,
					popup: false,
					locked: true,
					forced: true,
					charlotte: true,
					filter: function (event, player) {
						return event.card && event.card.storage && event.card.storage.menggufeng;
					},
					content: function () {
						'step 0'
						var num = trigger.cards.length;
						if (typeof trigger.baseDamage != 'number') trigger.baseDamage = num;
						trigger.baseDamage += num - 1;
						'step 1'
						if (player.hasSkill('menggufeng_sha2') && player.hasSkill('menggufeng_jiu2')) {
							player.addTempSkill('menggufeng_trick');
						}
					},
					"_priority": 1,
				},
				"jiu2": { sub: true, "_priority": 0 },
				"sha2": { sub: true, "_priority": 0 },
				trick: {
					name: '古枫②',
					enable: "phaseUse",
					usable: 1,
					filter: function (event, player) {
						if (!player.hasSkill('menggufeng_sha2') || !player.hasSkill('menggufeng_jiu2')) return;
						var name = lib.skill.menggufeng.lasttrick(player);
						if (!name || !event.filterCard({ name: name }, player, event)) return false;
						return player.countCards('h') > 0;
					},
					filterCard: true,
					selectCard: -1,
					position: "h",
					prompt: function (event, player) {
						var name = lib.skill.menggufeng.lasttrick(_status.event.player);
						return '将所有手牌当' + get.translation(name) + '使用';
					},
					viewAs: function (cards, player) {
						var name = lib.skill.menggufeng.lasttrick(player);
						if (name) return { name: name };
						else return null;
					},
					precontent: function (links, player) {
						game.hyyzSkillAudio('meng', 'menggufeng', 3, 4)
						player.removeSkill('menggufeng_trick')
					},
					ai: {
						order: 10,
					},
					mod: {
						"cardEnabled2": function (card, player) {
							if (!player.hasSkill('menggufeng_sha2') || !player.hasSkill('menggufeng_jiu2')) return;
							if (get.position(card) == 'h' &&
								!_status.event.skill && !['menggufeng_jiusha', 'menggufeng_trick'].includes(_status.event.skill)) return false;
						},
					},
					sub: true,
					"_priority": 0,
				},
			},
		},
		mengqinghua: {
			audio: 2,
			getLastUsed: function (player, event) {
				var history = player.getAllHistory('useCard');
				var index;
				if (event) index = history.indexOf(event) - 1;
				else index = history.length - 1;
				if (index >= 0) return history[index];
				return false;
			},
			forced: true,
			trigger: {
				player: "useCardAfter",
			},
			filter: function (event, player) {
				if (event.card.isCard || get.itemtype(event.cards) != 'cards') return false;
				var evtx = lib.skill.mengqinghua.getLastUsed(player, event);
				if (!evtx || !evtx.card || evtx.card.isCard || get.itemtype(evtx.cards) != 'cards') return false;
				return true;
			},
			content: function () {
				'step 0'
				var num = 0;
				var targets = [];
				if (trigger.player.getAllHistory('sourceDamage', function (evt) {
					if (evt.card == trigger.card) {
						game.log(evt.card, '造成过伤害');
						if (evt.player) targets.push(evt.player);
						return true;
					} else return false;
				}).length > 0) num++;
				var evtx = lib.skill.mengqinghua.getLastUsed(player, trigger);
				if (trigger.player.getAllHistory('sourceDamage', function (evt) {
					if (evt.card == evtx.card) {
						game.log(evt.card, '造成过伤害');
						if (evt.player) targets.push(evt.player);
						return true;
					} else return false;
				}).length > 0) num++;
				if (num > 0) {
					for (var i of targets) i.draw();
					player.draw();
					for (var i of [trigger.card, evtx.card]) {
						if (player.getStat().card[i.name] && player.getStat().card[i.name] > 0) {
							game.log(i, '不计入使用次数');
							player.getStat().card[i.name]--;
						}
					}
				}
			},
		},
		meng_tuopa: ['托帕', ["female", "hyyz_xt", 3, ["mengzhaiquan", "mengshougou", "mengshicha"], []], '柚衣'],
		mengzhaiquan: {
			audio: 1,
			marktext: "债",
			intro: {
				name: "债权",
				"name2": "债",
				content: "当前有#个“债”",
			},
			trigger: {
				player: ["chooseToRespondBegin", "chooseToUseBegin"],
			},
			direct: true,
			popup: false,
			filter: function (event, player) {
				return _status.currentPhase != player && game.hasPlayer(current => current.countMark('mengzhaiquan') > 0);
			},
			priority: 101,
			content: function () {
				'step 0'
				var cardname = [];
				for (var name of lib.inpile) {
					if (trigger.filterCard({ name: name }, player, trigger)) {
						cardname.push(name);
					}
				}
				if (!cardname.length) event.finish();
				else {
					event.name = cardname;
					player.chooseTarget(get.prompt2('mengzhaiquan'), function (card, player, target) {
						return target.countMark('mengzhaiquan') > 0;
					})
				}
				'step 1'
				if (result.bool) {
					player.logSkill('mengzhaiquan');
					event.target = result.targets[0];
					event.target.chooseCard(function (card) {
						return card.name == _status.event.name;
					}).set('name', event.name);
				} else event.finish();
				'step 2'
				if (result.bool) {
					event.target.give(result.cards, player, 'giveAuto');
					event.target.removeMark('mengzhaiquan', 1);
				} else {
					var num = event.target.countMark('mengzhaiquan');
					event.target.removeMark('mengzhaiquan', num);
					player.line(event.target, 'fire');
					event.target.damage(num, 'fire');
				}
			},
			ai: {
				respondSha: true,
				respondShan: true,
				effect: {
					target: function (card, player, target, effect) {
						if (get.tag(card, 'respondShan')) return 0.7;
						if (get.tag(card, 'respondSha')) return 0.7;
					},
				},
			},
			hiddenCard: function (player, name) {
				if (_status.currentPhase == player) return false;
				return true;
			},
			"_priority": 10100,
			group: 'mengzhaiquan_mark',
			subSkill: {
				mark: {
					trigger: {
						global: "gainAfter",
					},
					filter: function (event, player) {
						return event.player != player && event.source && event.source == player;
					},
					forced: true,
					content: function () {
						'step 0'
						trigger.player.addMark('mengzhaiquan', trigger.cards.length);
					},
				}
			}
		},
		mengshougou: {
			audio: 3,
			trigger: {
				global: 'phaseDrawAfter'
			},
			filter: function (event, player) {
				return event.player.hasMark('mengzhaiquan');
			},
			forced: true,
			content: function () {
				'step 0'
				var num = Math.min(trigger.player.countCards('h'), trigger.player.countMark('mengzhaiquan'))
				player.gainPlayerCard(trigger.player, [0, num], 'visible', 'h', true);
				'step 1'
				if (result.bool) {
					if (result.cards.length > 0) trigger.player.removeMark('mengzhaiquan', result.cards.length);
				}
			}
		},
		mengshicha: {
			audio: 3,
			enable: "phaseUse",
			usable: 1,
			filterTarget: function (card, player, target) {
				return target.countCards('h') < target.maxHp;
			},
			content: function () {
				'step 0'
				event.num = target.maxHp - target.countCards('h');
				player.draw(event.num);
				'step 1'
				event.num = Math.min(player.countCards('he'), num);
				if (target == player) event.finish();
				else player.chooseCard('交给' + get.translation(target) + get.translation(event.num) + '张牌', event.num, true);
				'step 2'
				player.give(result.cards, target, 'giveAuto');
			}
		},
		meng_aisida: ['艾丝妲', ["female", "hyyz_xt", 3, ["menglisi", "mengshanzhi", "mengchuxin"], []], '日玖阳气冲三关'],
		menglisi: {
			audio: 3,
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.name == 'gain' && event.player == player) return false;
				var evt = event.getl(player);
				return evt && evt.cards2 && evt.cards2.length > 0;
			},
			async content(event, trigger, player) {
				var evt = trigger.getl(player);
				if (evt && evt.cards2 && evt.cards2.length > 0) {
					var num = evt.cards2.length;
					player.addTempSkill('menglisi_buff');
				}
				while (num > 0) {
					num--;
					player.storage.menglisi_buff++;
					if (player.storage.menglisi_buff % 2 == 0) {
						var skills = player.getStockSkills(false, true);
						var skill = skills[skills.length - 1];
						await player.removeSkills(skill);
					}
				}
			},
		}, menglisi_buff: {
			silent: true,
			charlotte: true,
			init(player) {
				player.storage.menglisi_buff = 0;
			},
			onremove(player) {
				delete player.storage.menglisi_buff;
				player.logSkill('menglisi');
				var skills = player.getStockSkills(true, true);
				var num = 0;
				for (var i of skills) {
					if (!player.hasSkill(i)) {
						player.addSkills(i);
						num++;
					}
				}
				player.draw(num);
			},
		},
		mengshanzhi: {
			audio: 2,
			enable: "phaseUse",
			selectCard: 2,
			position: "he",
			filterCard: true,
			filterTarget: true,
			filter(event, player) {
				return lib.card.hyyz_zisu
			},
			check(card) {
				return 6 - get.value(card)
			},
			async content(event, trigger, player) {
				event.targets[0].useCard({ name: 'hyyz_zisu', isCard: true }, event.targets);
			},
			ai: {
				order: 8,
				result: {
					target: 1,
				},
				threaten: 1.5,
			},
		},
		mengchuxin: {
			audio: 2,
			trigger: {
				player: "useCardAfter",
			},
			filter(event, player) {
				let evt = event, type = get.type2(evt.card, false);
				return !player.hasHistory('useCard', evtx => {
					return evtx != evt && get.type2(evtx.card, false) == type;
				}, evt);
			},
			frequent: true,
			async content(event, trigger, player) {
				const result = await player.draw().forResult();
				const targets = await player
					.chooseTarget('是否将' + get.translation(result[0]) + '交给其他角色？', lib.filter.notMe)
					.forResultTargets();
				if (targets) {
					targets[0].gain(result, player, 'give');
				}
			},
		},
		meng_lita: ['丽塔', ["female", "hyyz_b3", 4, ["mengsishou", "mengyanjue", "mengsizhi"], []], '沧海依酥'],
		mengsishou: {
			audio: 3,
			logAudio: () => ['ext:忽悠宇宙/asset/meng/audio/mengsishou1.mp3'],
			trigger: {
				global: "phaseZhunbeiBegin",
			},
			check: function (event, player) {
				return get.attitude(player, event.player) < 0;
			},
			logTarget: "player",
			filter: function (event, player) {
				return player.canCompare(event.player);
			},
			prompt2: '赢：你嘲讽之<br>没赢：你摸一张牌且不能响应其的牌',
			content: function () {
				"step 0"
				player.chooseToCompare(trigger.player, function (card) {
					var player = get.owner(card);
					var target = _status.event.getParent().target;
					if (
						target != player && get.attitude(player, target) < 0 &&
						game.hasPlayer((current) => current != target && get.attitude(target, current) > 4 && current.hp < target.hp)
					) return -get.number(card);
				});
				"step 1"
				if (result.bool) {
					game.hyyzSkillAudio('meng', 'mengsishou', 2)
					trigger.player.addTempSkill('mengsishou_me');
					trigger.player.storage.mengsishou_me = player;
				}
				else {
					game.hyyzSkillAudio('meng', 'mengsishou', 3)
					player.draw();
					trigger.player.addTempSkill('mengsishou_ohhh');
					trigger.player.storage.mengsishou_ohhh = player;
				}
			},
			subSkill: {
				me: {
					onremove: true,
					mod: {
						playerEnabled: function (card, player, target) {
							if (player.storage.mengsishou_me != target && (!get.info(card) || !get.info(card).singleCard || !ui.selected.targets.length)) return false;
						},
					},
					mark: true,
					intro: {
						content: function (player, storage) {
							return '只能对' + get.translation(storage) + '使用牌';
						},
					},
					sub: true,
					"_priority": 0,
				},
				ohhh: {
					onremove: true,
					forced: true,
					trigger: {
						player: "useCard",
					},
					filter: function (event, player) {
						return event.card && (get.type(event.card) == 'trick' || get.type(event.card) == 'basic' && !['shan', 'tao', 'jiu', 'du'].includes(event.card.name)) && game.hasPlayer(function (current) {
							return current == player.storage.mengsishou_ohhh;
						});
					},
					content: function () {
						trigger.directHit.addArray(game.filterPlayer(function (current) {
							return current == player.storage.mengsishou_ohhh;
						}));
					},
					ai: {
						"directHit_ai": true,
						skillTagFilter: function (player, tag, arg) {
							return arg.target == player.storage.mengsishou_ohhh;
						},
					},
					sub: true,
					"_priority": 0,
				},
			},
			"_priority": 0,
		},
		mengyanjue: {
			audio: 1,
			trigger: {
				player: ["chooseToCompareAfter", "compareMultipleAfter"],
				target: ["chooseToCompareAfter", "compareMultipleAfter"],
			},
			filter: function (event, player) {
				if (event.preserve) return false;
				if (event.name == 'compareMultiple') return true;
				return !event.compareMultiple;
			},
			frequent: true,
			content: function () {
				'step 0'
				player.chooseTarget('延决：令一名角色摸一张牌', '不为你则你摸一张牌', true).set('ai', function (target) {
					var player = _status.event.player;
					var att = get.attitude(player, target);
					if (target.hasSkillTag('nogain')) return 0;
					if (target != player) att *= 10;
					return att;
				});
				'step 1'
				var target = result.targets[0];
				target.draw();
				if (target != player) player.draw();
			},
			"_priority": 0,
		},
		mengsizhi: {
			audio: 1,
			logAudio: () => false,
			trigger: {
				player: "damageEnd",
			},
			filter(event, player) {
				return event.source && event.source.countDiscardableCards(player, 'he') > 0;
			},
			check(event, player) {
				return -get.attitude(player, event.source);
			},
			async cost(event, trigger, player) {
				const links = await player
					.discardPlayerCard(trigger.source, get.prompt2('mengsizhi', trigger.source))
					.set('ai', function (button) {
						if (!_status.event.att) return 0;
						if (get.color(button.link) == 'red') {
							return 2 * get.value(button.link);
						}
						return 1;
					})
					.set('att', get.attitude(player, trigger.source) <= 0)
					.forResultLinks();
				if (links) {
					event.result = {
						bool: true,
						cost_data: {
							links: links
						}
					}
				}
			},
			logTarget: "source",
			async content(event, trigger, player) {
				const card = event.cost_data.links[0];
				if (get.color(card) == 'red') {
					game.hyyzSkillAudio('meng', 'mengsizhi', 1)
					await player.recover();
				} else {
					game.hyyzSkillAudio('meng', 'mengsizhi', 2)
					await player.chooseToDiscard(true, 'he');
					trigger.source.draw();
				}
			},
			ai: {
				maixie: true,
				maixie_hp: true,
				effect: {
					target: function (card, player, target) {
						if (get.tag(card, 'damage')) {
							if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
							if (!target.hasFriend()) return;
							if (player.countCards('e', { color: 'red' }) > 0 ||
								player.countCards('h', { color: 'red' }) >= player.countCards('h', { color: 'black' }) * 1.2) return 0;
						}
					}
				}
			},
			"_priority": 0,
		},
		meng_maisha: ['麦莎', ["female", "hyyz_other", 5, ["mengyanhu", "mengguanghuan"], []], '沧海依酥'],
		mengyanhu: {
			audio: 2,
			trigger: {
				global: "damageBegin4",
			},
			filter: function (event, player) {
				return event.player != player && event.source && event.source != player && event.player.isIn();
			},
			usable: 1,
			check: function (event, player) {
				return get.attitude(player, event.player) > player.getDamagedHp();
			},
			logTarget: "player",
			content: function () {
				'step 0'
				trigger.player = player;
				trigger.player.addTempSkill('mengyanhu2');
				trigger.player.storage.mengyanhu2 = [player, trigger.source];
			},
			"_priority": 0,
		}, "mengyanhu2": {
			onremove: function (player) {
				delete player.storage.mengyanhu2;
			},
			trigger: {
				player: ["damageAfter", "damageCancelled", "damageZero"],
			},
			forced: true,
			popup: false,
			vanish: true,
			charlotte: true,
			content: function () {
				if (player.storage.mengyanhu2[1] && player.storage.mengyanhu2[0].canUse({ name: 'sha' }, player.storage.mengyanhu2[1], false)) {
					player.storage.mengyanhu2[0].useCard({ name: 'sha' }, player.storage.mengyanhu2[1], false)
				}
				player.removeSkill('mengyanhu2');
				player.popup('mengyanhu');
			},
			"_priority": 0,
		},
		mengguanghuan: {
			audio: 1,
			trigger: {
				player: "phaseJieshuBegin",
			},
			direct: true,
			content: function () {
				'step 0'
				player.chooseTarget(lib.translate.mengguanghuan_info, function (card, player, target) {
					return target.isMinHp();
				}).ai = function (target) {
					return get.attitude(_status.event.player, target);
				};
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					player.logSkill('mengguanghuan', target);
					player.line(target, 'green');
					target.recover();
					target.draw();
				}
			},
			"_priority": 0,
		},
		meng_hutao: ['胡桃', ["female", "hyyz_ys", 3, ["mengxifeng", "mengliaoshi", "mengwansheng"], []], '日玖阳气冲三关'],//
		mengxifeng: {
			trigger: {
				player: "loseAfter",
				global: ["equipAfter", "addJudgeAfter", "gainAfter", "loseAsyncAfter", "addToExpansionAfter"],
			},
			filter: function (event, player) {
				var evt = event.getl(player);
				if (!evt || !evt.hs || !evt.hs.length) return false;
				if (event.name == 'lose') {
					for (var i in event.gaintag_map) {
						if (event.gaintag_map[i].includes('mengxifeng_bg')) return true;
					}
					return false;
				}
				return player.hasHistory('lose', function (evt) {
					if (event != evt.getParent()) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('mengxifeng_bg')) return true;
					}
					return false;
				});
			},
			forced: true,
			locked: false,
			content: function () {
				'step 0'
				var num = 0;
				if (trigger.name == 'lose') {
					for (var i in trigger.gaintag_map) {
						if (trigger.gaintag_map[i].includes('mengxifeng_bg')) num++;
					}
				}
				else player.getHistory('lose', function (evt) {
					if (trigger != evt.getParent()) return false;
					for (var i in evt.gaintag_map) {
						if (evt.gaintag_map[i].includes('mengxifeng_bg')) num++;
					}
					return false;
				});
				player.draw(num);
			},
			group: ["mengxifeng_init"],
			subSkill: {
				init: {
					trigger: {
						global: "phaseBefore",
						player: "enterGame",
					},
					forced: true,
					locked: false,
					filter: function (event, player) {
						return (event.name != 'phase' || game.phaseNumber == 0) && player.countCards('h') > 0;
					},
					content: function () {
						var hs = player.getCards('h');
						if (hs.length) player.addGaintag(hs, 'mengxifeng_bg');
					},
					sub: true,
					"_priority": 0,
				},
			},
		}, mengxifeng_bg: {},
		mengliaoshi: {
			skillAnimation: true,
			animationColor: "fire",
			juexingji: true,
			derivation: ["mengwansheng_rewrite"],
			unique: true,
			trigger: {
				global: "phaseJieshuBegin",
			},
			filter: function (event, player) {
				return !player.hasCard(function (card) {
					return card.hasGaintag('mengxifeng_bg');
				}, 'h');
			},
			forced: true,
			content: function () {
				'step 0'
				player.awakenSkill(event.name);
				player.storage[event.name] = true;
				'step 1'
				player.gainMaxHp();
				var cards = player.getCards('hej');
				player.recast(cards);
				player.addSkill('mengwansheng_rewrite');
				player.removeSkill('mengwansheng');
				game.log(player, '修改了技能', '#g【万生】');
			},
		},
		mengjiu: {
			init: function (player) {
				player.markSkill('mengjiu');
			},
			charlotte: true,
			locked: true,
			mark: true,
			marktext: "柩",
			intro: {
				markcount: "expansion",
				mark: function (dialog, content, player) {
					var content = player.getExpansions('mengjiu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							dialog.addAuto(content);
						}
						else {
							return '共有' + get.cnNumber(content.length) + '个“柩”';
						}
					} else return '空柩';
				},
				content: function (content, player) {
					var content = player.getExpansions('mengjiu');
					if (content && content.length) {
						if (player == game.me || player.isUnderControl()) {
							return get.translation(content);
						}
						return '共有' + get.cnNumber(content.length) + '个“柩”';
					} else return '空柩';
				},
			},
			onremove: function (player, skill) {
				var cards = player.getExpansions(skill);
				if (cards.length) player.loseToDiscardpile(cards);
			},
			"_priority": 0,
		},
		mengwansheng: {
			trigger: {
				global: ["eventNeutralized", "shaMiss"],
			},
			filter: function (event, player) {
				if (event.type != 'card') return false;
				if (!event.targets || event.targets.length != 1) return false;
				return true;
			},
			forced: true,
			content: function () {
				'step 0'
				player.addToExpansion(trigger.cards, 'gain2').gaintag.add('mengjiu');
				'step 1'
				if (player.getExpansions('mengjiu').length > player.maxHp) player.chooseToDiscard('he', true);
			},
			group: 'mengjiu',
		}, mengwansheng_rewrite: {
			group: ['mengwansheng_rewrite_1', 'mengwansheng_rewrite_2', 'mengjiu'],
			subSkill: {
				1: {
					trigger: {
						global: ["eventNeutralized", "shaMiss"],
					},
					filter: function (event, player) {
						if (event.type != 'card') return false;
						if (!event.targets || event.targets.length != 1) return false;
						if (player.getExpansions('mengjiu').length >= player.maxHp) return false;
						return true;
					},
					forced: true,
					content: function () {
						'step 0'
						player.addToExpansion(trigger.cards, 'gain2').gaintag.add('mengjiu');
						'step 1'
						if (player.getExpansions('mengjiu').length > player.maxHp) player.chooseToDiscard('he', true);
					},
				},
				2: {
					trigger: {
						global: 'useCard',
					},
					filter: function (event, player) {
						if (event.name == 'shan' || event.name == 'wuxie') return false;
						var type = get.type(event.card, false);
						if (type != 'basic' && type != 'trick') return false;
						return player.getExpansions('mengjiu').some(card => get.type2(card) == get.type2(event.card));
					},
					content: function () {
						'step 0'
						player.chooseCardButton('万生：重铸同类型的“柩”令此牌额外结算', player.getExpansions('mengjiu')).set('ai', () => get.attitude(player, trigger.player) > 0).set('filterButton', function (button) {
							var card = button.link;
							var trigger = _status.event.getTrigger();
							return get.type2(card) == get.type2(trigger.card);
						});
						'step 1'
						if (result.bool) {
							player.logSkill('mengwansheng');
							player.loseToDiscardpile(result.links);
							player.draw();
							trigger.effectCount++;
						} else event.finish();
					}
				},
			}
		},
		meng_jiutiao: ['九条裟罗', ["female", "hyyz_ys", 4, ["mengyayu", "mengwuyan", "mengchezheng"], []], '沧海依酥', ''],
		mengyayu: {
			audio: 4,
			getyu() {
				return game.findPlayer(current => current.hasSkill('mengyu'));
			},
			trigger: {
				global: "phaseBefore",
				player: "enterGame",
			},
			filter(event, player) {
				return (event.name != 'phase' || game.phaseNumber == 0);
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget('鸦羽：请选择〖羽〗的目标（队友）', lib.translate.mengyu_info, true, lib.filter.notMe)
					.set('ai', (target) => {
						return get.attitude2(target) * target.hp;
					})
					.forResult();
			},
			async content(event, trigger, player) {
				event.targets[0].addSkills('mengyu');
				player.when({ player: 'die' }).assign({ forceDie: true }).then(() => {
					game.hasPlayer((current) => {
						current.removeSkill('mengyu');
					});
				})
			},
			onremove: (player) => game.countPlayer2(current => current.removeSkill('mengyu')),
			group: 'mengyayu_damage',
			subSkill: {
				damage: {
					audio: 'mengyayu',
					trigger: {
						source: 'damageSource'
					},
					forced: true,
					filter(event, player) {
						var target = lib.skill.mengyayu.getyu();
						if (!target) return false;
						return target.isIn() && target.storage.mengyu[get.translation(event.player)] != undefined;
					},
					async content(event, trigger, player) {
						var target = lib.skill.mengyayu.getyu();
						game.asyncDraw([target, player]);
						target.storage.mengyu[get.translation(trigger.player)]++;
						target.syncStorage('mengyu');
					}
				}
			},
			derivation: ['mengyu'],
		},
		mengyu: {
			audio: 4,
			init: (player) => player.storage.mengyu = {},
			mark: true,
			intro: {
				content: (storage, player) => {
					var str = '选择的角色：';
					if (!Object.keys(storage).length) return '未选择角色';
					for (var i in storage) {
						str += `<li>${i}：${storage[i]}`;
					}
					return str;
				}
			},
			trigger: {
				global: 'phaseBegin'
			},
			onremove: true,
			filter: () => game.countPlayer() > 2 && game.hasPlayer(current => {
				return current.hasSkill('mengyayu');
			}),
			forced: true,
			content: () => {
				'step 0'
				if (trigger.player == player) {
					if (Object.keys(player.storage.mengyu).length && !Object.values(player.storage.mengyu).some(a => a > 0) &&
						game.hasPlayer((current) => current.hasSkill('mengyayu'))) {
						game.filterPlayer((current) => current.hasSkill('mengyayu'))[0].loseHp();
					}
					player.storage.mengyu = {};
					player.syncStorage('mengyu');
					event.finish();
				} else player.chooseTarget('选择一名九条需要攻击的角色', true, function (card, player, target) {
					return target != player && !target.hasSkill('mengyayu');
				}).set('ai', (target) => {
					var value = -get.attitude(player, target);
					if (_status.event.player.storage[target] == undefined) value *= 2;
					return value;
				});
				'step 1'
				if (result.bool) {
					var target = result.targets[0];
					player.storage.mengyu[get.translation(target)] = 0;
					player.markSkill('mengyu');
				}
			}
		},
		mengwuyan: {
			audio: 2,
			trigger: {
				global: "damageBegin3"
			},
			forced: true,
			filter: (event, player) => {
				var target = lib.skill.mengyayu.getyu();
				return target && target == event.player && target.hp + target.hujia <= event.num;
			},
			content: () => {
				trigger.player = player;
			},
			mod: {
				inRange: function (from, to) {
					var target = lib.skill.mengyayu.getyu();
					if (!target || !from.hasSkill('mengyayu')) return;
					if (target != from && target != to && target.inRange(to)) return true;
				},
			},
		},
		mengchezheng: {
			audio: 'mengwuyan',
			unique: true,
			mark: true,
			limited: true,
			enable: "phaseUse",
			filterTarget: (card, player, target) => target != player && !target.hasSkill('mengyu'),
			animationColor: "thunder",
			skillAnimation: "legend",
			content: function () {
				'step 0'
				player.awakenSkill('mengchezheng');
				player.storage.mengchezheng = true;
				player.loseMaxHp();
				'step 1'
				game.hasPlayer((current) => {
					current.removeSkills('mengyu');
				});
				target.addSkills('mengyu',);
			},
			ai: {
				expose: 0.3,
				order: 1,
				result: {
					target: function (player, target) {
						if (!game.hasPlayer((current) => current.hasSkill('mengyu') && current.hp > 2)) return 2 + target.hp;
					},
				},
			},
			intro: {
				content: "limited",
			},
			init: (player, skill) => player.storage[skill] = false,
		},

		mengzongou_info: "纵偶|出牌阶段限一次，你可以弃置一张普通锦囊牌，并亮出牌顶X张牌（X为此牌名字数+你的已损失体力值），然后将其中包含的花色分配给任意其他角色，称为“梦游”。其他角色使用即时牌指定唯一目标时，你可以移去同花色的“梦游”，并修改此牌目标。",
		mengkuixi_info: "傀戏|每回合限一次。当一名角色使用即时牌时，若此牌的描述中含有“伤害”、“回复”、“弃置”，则你可以选择一项：<br>1.为此牌增加/减少1个目标。<br>2.令此牌无法被响应。<br>3.此牌结算完毕后，你将此牌花色称为“梦游”并分配给一名其他角色。",

		"mengdianci_info": "电刺|出牌阶段限一次，你可以将所有手牌当【杀】对距离为1的角色使用。若此【杀】造成伤害，你根据其实体牌包含的牌型，每有一张：<br>1.基本牌，你视为对其使用一张【杀】。<br>2.锦囊牌，摸一张牌。<br>3.武器牌，获得1点护甲。",
		"mengwuwei_info": "无畏|锁定技，游戏开始时，你选择一个「决斗」目标且你计算与其的距离为1。当你造成或受到伤害后，若对方为「决斗」目标，你摸一张牌，否则，将「决斗」目标转移给对方。",

		"menggufeng_info": "古枫|①转换技，<br>阳：将一半（向下取整）的手牌当等量数值的【酒】使用。<br>阴：将X张手牌当等量数值的风【杀】使用，X为上次发动〖古枫①阳〗时使用的手牌数。<br>②每回合限一次，当你第二次发动〖古枫①〗后，你的手牌只能当一张上次使用过的单目标普通锦囊牌或〖古枫①〗的牌使用。",
		"mengqinghua_info": "清化|锁定技，当一名角色连续使用两张转化牌后，若其中有一张牌造成过伤害，你与因此受到伤害的角色各摸一张牌且这两张转化牌均不计入使用次数。",

		mengzhaiquan_info: "债权|其他角色获得你的牌后获得等量的“债”。当你需要使用或打出一张牌时，你可以令一名有“债”的角色选择一项:1.交给你一张可以响应的牌并移去一枚“债”。2.移去所有“债”并受到等量的火焰伤害。",
		mengshougou_info: "收购|锁定技，有“债”的角色摸牌阶段结束时，你观看其的手牌并获得其中至多与该角色的“债”等量的牌，然后其移去等量的“债”。",
		mengshicha_info: "市察|出牌阶段限一次，你可以选择一名角色。你摸X张牌并交给其等量的牌。X为其的体力上限与手牌数的差。",

		menglisi_info: "璃思|你每失去两张牌，失去武将牌上的最后一个技能。回合结束时，你恢复武将牌上的技能并摸等量的牌。",
		mengshanzhi_info: "缮治|出牌阶段，你可以弃置两张牌，令一名角色视为使用【自塑尘脂】。",
		mengchuxin_info: "雏心|你每回合首次使用一种类别的牌后，摸一张牌，然后可以将此牌交给一名其他角色。",

		"mengsishou_info": "死守|其他角色的准备阶段，你可以与该角色拼点。若你赢，其本回合只能对你使用牌；若你没赢，你摸一张牌且本回合不能响应该角色使用的牌。",
		"mengyanjue_info": "延决|你拼点后可以令一名角色摸一张牌。若该角色不为你，你摸一张牌。",
		"mengsizhi_info": "死志|你受到伤害后，可以弃置伤害来源的一张牌。若此牌为红色，你回复一点体力；否则，你弃置一张牌，该角色摸一张牌。",

		"mengyanhu_info": "掩护|每回合限一次。一名角色受到其他角色造成的伤害时，你可以将此伤害转移给你，然后视为对伤害来源使用【杀】。",
		"mengguanghuan_info": "光环|结束阶段，你可以令一名体力值最低的角色回复1点体力并摸一张牌。",

		mengxifeng_info: "希逢|锁定技，你将初始手牌标记为“逢”。你失去一张“逢”后，摸一张牌。",
		mengxifeng_bg: "逢",
		mengliaoshi_info: "了逝|觉醒技，每回合结束阶段，若你没有“逢”，你加一点体力上限并重铸区域内所有牌，然后修改“万生”。",
		mengwansheng_info: "万生|锁定技，一张单体牌被抵消后，你将此牌置于武将牌上，称为“枢”。若“枢”数大于你的体力上限，你弃一张牌。",
		mengjiu: "柩",
		mengwansheng_rewrite_info: "万生|①一张单体牌被抵消后，且“枢”数小于你的体力上限，你将此牌置于武将牌上，称为“枢”。②一张基本牌或普通锦囊牌被使用时，你可将一张同类型的“枢”置入弃牌堆并摸一张牌，令此牌额外结算一次。",

		mengyayu_info: "鸦羽|锁定技，游戏开始时，你令一名其他角色获得〖羽〗直到你死亡。你对〖羽〗记录的角色造成伤害后，拥有〖羽〗的角色与你各摸一张牌。",
		mengyu_info: `羽|锁定技，若场上有九条裟罗，<br>
		<li>①其他角色的回合开始时，你记录一名其他角色，并于你的回合开始时清除记录。
		<li>②你的回合开始时：若九条裟罗未对你选择的角色造成过伤害，其失去1点体力。
		`,
		mengwuyan_info: "乌眼|锁定技，拥有〖羽〗的角色受到致命伤害时，此伤害转移给你。拥有〖羽〗的角色攻击范围内的角色视为在你的攻击范围内。",
		mengchezheng_info: "彻证|限定技。出牌阶段，你可以减1点体力上限并移动〖羽〗。",
	},
}, dynamicTranslates = {
	//罗刹
	hyyzzanghua(player) {
		if (player.storage.hyyzzanghua) return `转换技：<br>
			阳：一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。<br>
			<span class="bluetext">阴：一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。</span>`;
		return `转换技：<br>
			<span class="bluetext">阳：一名角色受到伤害后，若其的体力值小于一半，其${get.hyyzIntroduce('净化')}并重复回复体力至大于一半。</span><br>
			阴：一名角色造成伤害后，若其的体力值大于一半，其${get.hyyzIntroduce('驱散')}并重复失去体力至小于一半。`;
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