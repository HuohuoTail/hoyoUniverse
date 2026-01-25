import { lib, game, ui, get, ai, _status } from '../../../noname.js';

const mysCharacters = {
	/**@type { SMap<Skill> } */
	meng_mys: {
		/**@type { [String, Character, String, String ] } */
		meng_mys_qingque: ['青雀', ['female', 'hyyz_xt', 3, ['mengmystouxian', 'mengmysmianzuo'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_qingque.jpg`, 'die:hyyz_qingque']], '', ''],
		mengmystouxian: {
			audio: 'hyyzlaoyue',
			trigger: {
				player: 'phaseChange',
			},
			filter(event, player) {
				return event.phaseList[event.num].startsWith('phaseUse');
			},
			preHidden: true,
			async content(event, trigger, player) {
				trigger.phaseList[trigger.num] = 'phaseDraw|mengmystouxian';
			},
		},
		mengmysmianzuo: {
			audio: 'hyyzmenqing',
			init(player) {
				if (!player.storage.mengmysmianzuo) player.storage.mengmysmianzuo = [];
			},
			trigger: {
				player: 'loseAfter',
				global: 'loseAsyncAfter'
			},
			filter(event, player) {
				if (event.type != 'discard' || event.getlx === false) return false;
				return event.getl(player)?.cards2?.some(i => get.position(i) == 'd' && !player.getStorage('mengmysmianzuo').includes(get.suit(i)))
			},
			async cost(event, trigger, player) {
				const cards = trigger.getl(player).cards2.filter(i => get.position(i) == 'd' && !player.getStorage('mengmysmianzuo').includes(get.suit(i)))
				const suits = [];
				cards.forEach(i => {
					if (player.hasUseTarget(i) && !player.getStorage('mengmysmianzuo').includes(get.suit(i))) suits.add(get.suit(i))
				});
				const links = await player
					.chooseButton(['勉作：是否依次使用其中的牌', cards])
					.set('selectButton', [1, suits.length])
					.set('filterButton', (button) => {
						const player = _status.event.player, card = button.link;
						if (!player.hasUseTarget(card) || player.getStorage('mengmysmianzuo').includes(get.suit(card))) return false;
						return !ui.selected.buttons.some(i => get.suit(i) == get.suit(card));
					})
					.set('ai', (button) => _status.event.player.getUseValue(button.link) || get.value(button.link))
					.forResultLinks();
				event.result = {
					bool: true,
					cards: links
				}
			},
			async content(event, trigger, player) {
				for (const card of event.cards) {
					const suit = get.suit(card);
					player.markAuto('mengmysmianzuo', [suit]);
					await player.chooseUseTarget(card, true, false);
				}
				player.when({ global: 'phaseAfter' }).then(() => (player.storage.mengmysmianzuo = []))
			},
		},
		mengmystouxian_info: '偷闲|你可以将出牌阶段改为摸牌阶段。',
		mengmysmianzuo_info: '勉作|每回合每种花色限一次，你弃置牌后可以使用之。',

		meng_mys_bailu: ['白露', ['female', 'hyyz_xt', 3, ['mengmysleiyin', 'mengmysxuanhu'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_bailu.jpg`, 'die:hyyz_bailu']]],
		mengmysleiyin: {
			audio: 'hyyzleiyin',
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
			selectTarget: () => ui.selected.cards.length,
			async content(event, trigger, player) {
				const target = event.target;
				const num = 5 - target.maxHp;
				if (num > 0) {
					await target.gainMaxHp(num);
					target.when({ global: 'roundStart' })
						.vars({ num: num })
						.then(() => {
							player.loseMaxHp(num)
						})
				}
				const cards = await target.draw().forResult();
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
		mengmysxuanhu: {
			audio: 'hyyzxuanhu',
			limited: true,
			mark: true,
			skillAnimation: true,
			animationColor: 'wood',
			init(player) {
				player.storage.mengmysxuanhu = false;
			},
			enable: 'chooseToUse',
			filter(event, player) {
				return event.type == 'dying' && player.storage.mengmysxuanhu == false && _status.event.dying != player;
			},
			filterTarget(card, player, target) {
				return target == _status.event.dying;
			},
			selectTarget: -1,
			async content(event, trigger, player) {
				player.awakenSkill('mengmysxuanhu');
				let count = event.targets[0].maxHp;
				while (count > 0) {
					count--;
					await player.useSkill('mengmysleiyin', event.targets);
				}
			},
			ai: {
				order: 6,
				threaten: 1.4,
				skillTagFilter(player) {
					if (!_status.event.dying || _status.event.dying == player) return false;
				},
				save: true,
				result: {
					target: 6,
				},
			},
			intro: {
				content: 'limited',
			},
		},
		mengmysleiyin_info: '雷音|出牌阶段限一次，你可以弃置至多三张牌，令等量角色各摸一张牌，获得红色牌的角色可以将之当【桃】使用。',
		mengmysxuanhu_info: '悬壶|限定技，其他角色濒死时，你可以对该角色执行X次〖雷音〗效果，X为其体力上限。',

		meng_mys_danhengyinyue: ['丹恒·饮月', ['male', 'hyyz_xt', 4, ['mengmysnilin'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_danhengyinyue.jpg`, 'die:hyyz_danhengyinyue']]],
		mengmysnilin: {
			audio: 'hyyznilin',
			enable: ['chooseToUse', 'chooseToRespond'],
			filter(event, player) {
				return event.filterCard({ name: 'sha' }, player, event);
			},
			chooseButton: {
				dialog(event, player) {
					const dialog = ui.create.dialog('逆鳞', 'hidden')
					const names = [];
					if (event.filterCard({ name: 'sha' }, player, event)) {
						names.push(['基本', '', 'sha'])
						for (let nature of lib.inpile_nature) {
							if (event.filterCard({ name: 'sha', nature: nature }, player, event)) names.push(['基本', '', 'sha', nature]);
						}
					}
					dialog.add([names, 'vcard'])
					if (player.countCards('h') > 0) {
						dialog.addText('你的手牌')
						dialog.add(player.getCards('h'))
					} else {
						dialog.addText('你没有手牌')
					}
					if (ui.cardPile.childNodes.length > 0) {
						dialog.addText('牌堆顶的牌')
						dialog.add([ui.cardPile.childNodes[0], ui.cardPile.childNodes[1], ui.cardPile.childNodes[2]])
					}
					return dialog
				},
				check(button) {
					const player = _status.event.player;
					const card = button.link;
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
				filter(button, player) {
					if (ui.selected.buttons.length) {
						if (ui.selected.buttons.some(i => get.position(i.link) == undefined)) return get.position(button.link);
						if (ui.selected.buttons.length == 3) return !get.position(button.link);
					}
					return true
				},
				backup(links, player) {
					return {
						filterCard: () => false,
						selectCard: -1,
						cards: links.filter(card => get.position(card)),
						viewAs: {
							name: links.filter(card => !get.position(card))[0][2],
							nature: links.filter(card => !get.position(card))[0][3],
						},
						async precontent(event, trigger, player) {
							player.logSkill('mengmysnilin');
							event.result.cards = lib.skill[event.result.skill].cards;
						},
					}
				},
				prompt(links, player) {
					const num = _status.event._result?.links.filter(link => get.itemtype(link) == 'card' && player.getCards('h').includes(link)).length, link = links.filter(card => !get.position(card))[0];
					return '选择' + (num && num > 1 ? '至多' + num + '个' : '') + get.translation(link[3] || '') +
						'【' + get.translation(link[2]) + '】的目标';
				},
			},
			hiddenCard(player, name) {
				return name == 'sha';
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'mengmysnilin_backup') return true;
				},
				selectTarget(card, player, range) {
					if (range[1] == -1) return;
					let evt = _status.event;
					if (evt.skill == 'mengmysnilin_backup') {
						if (evt._result?.links?.length) {
							const num = evt._result.links.filter(link => get.itemtype(link) == 'card' && player.getCards('h').includes(link)).length;
							if (num > range[1]) range[1] = num;
						}
					}
				}
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				order: 11,
				result: {
					player: 1,
				},
			},
		},
		mengmysnilin_info: `逆鳞|你可以观看并选择牌堆顶和手牌共三张牌，将这些牌当无距离限制的任意【杀】使用或打出（目标上限为其中的手牌数）。`,

		meng_mys_ren: ['刃', ['male', 'hyyz_xt', 2, ['hyyzzhuchou', 'mengmyshuiduo'], [`ext:忽悠宇宙/asset/meng/image/meng_wu_ren.jpg`, 'die:meng_ren']]],
		mengmyshuiduo: {
			audio: 'hyyzhuiduo',
			trigger: {
				player: 'dying'
			},
			forced: true,
			async content(event, trigger, player) {
				await player.recover()
			},
		},
		mengmyshuiduo_info: '隳堕|锁定技，你濒死时回复1点体力。',

		meng_mys_hua: ['华', ['female', 'hyyz_xt', 3, ['mengmyscunjin', 'mengmysfusheng'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_hua.jpg`, 'die:hyyz_hua']]],
		mengmyscunjin: {
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
						player.chooseToDiscard('寸劲：弃置一张牌', 'he').set('ai', (card) => 8 - get.value(card)).set('logSkill', 'mengmyscunjin');
						break;
					}
					case 'lose': {
						const bool = await player.chooseBool('寸劲：摸一张牌？').set('frequentSkill', 'mengmyscunjin').forResultBool();
						if (bool) {
							player.logSkill('mengmyscunjin')
							await player.draw();
						}
						break;
					}
					case 'gain': {
						player.chooseToUse('寸劲：使用一张牌').set('logSkill', 'mengmyscunjin');
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
		mengmysfusheng: {
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

				const index = await player
					.chooseControlList(list, get.prompt('mengmysfusheng'))
					.set('ai', () => {
						const player = _status.event.player, list = _status.event.list;
						let k = [];
						if (player.hp > 1 && list.includes('失去1点体力')) k.add(list.indexOf('失去1点体力'));
						if (cards.some(i => player.hasUseTarget(i) && player.getUseValue(i) >= 20) && player.isDamaged() && list.includes('减1点体力上限')) k.add(list.indexOf('减1点体力上限'));
						if (k.length >= 2) k.add(3)
						return k.randomGet();
					})
					.set('cards', cards).set('list', list)
					.forResult('index');
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
		mengmyscunjin_info: '寸劲|当你<span class=yellowtext>使用</span>/<span class=firetext>弃置</span>/<span class=thundertext>获得</span>牌后，你可以<span class=yellowtext>弃置</span>/<span class=firetext>摸</span>/<span class=thundertext>使用</span>一张牌。',
		mengmysfusheng_info: `浮生|持恒技，你失去所有牌后，可以</br>①失去1点体力；</br>②减1点体力上限；</br>${get.hyyzIntroduce('断拒')}：失去此技；</br>然后将手牌摸至上限。`,

		/*meng_mys_bronya: ['布洛妮娅', ['female', 'hyyz_xt', 3, ['mengmysceli', 'mengmyschuxin'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_bronya.jpg`, 'die:hyyz_bronya']]],
		mengmysceli: {
			audio: 'hyyzceli',
			mainSkill: true,
			init(player) {
				if (player.checkMainSkill('mengmysceli')) {
					player.gainMaxHp();
				}
			},
			trigger: {
				player: 'phaseAfter'
			},
			filter(event, player) {
				return !player.hasHistory('useCard') && !event.skill;
			},
			async cost(event, trigger, player) {
				event.result = await player.chooseTarget(get.prompt2('mengmysceli'))
					.set('ai', (target) => {
						return get.attitude2(target);
					})
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				event.targets[0].insertPhase('mengmysceli');
			},
			ai: {
				effect: {
					player(card, player, target) {
						if (player.needsToDiscard() > 2 || _status.event.getParent('phase').skill) return;
						return 'zeroplayertarget'
					}
				}
			}
		},
		mengmyschuxin: {
			audio: 'hyyzchuxin',
			logAudio: () => false,
			trigger: {
				player: "damageBegin4",
			},
			forced: true,
			async content(event, trigger, player) {
				if (player.getRoundHistory('lose', (evt) => evt.cards2?.length).length > 0) {
					game.log('#g【初心】', player, '尝试找回初心');
					game.hyyzSkillAudio('hyyz', 'hyyzchuxin', 3, 4)
					let num = 0;
					player.getRoundHistory('lose', function (evt) {
						if (evt.cards2 && evt.cards2.length) {
							num += evt.cards2.length
						}
					})
					if (num > 0) player.draw(num);
				} else {
					game.log('#g【初心】', player, '初心未失，防止此伤害');
					game.hyyzSkillAudio('hyyz', 'hyyzchuxin', 1, 2, 5)
					trigger.cancel()
				}
			},
			ai: {
				effect: {
					target(card, player, target) {
						if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
						if (get.tag(card, 'damage')) {

							let lose = 0;
							target.getRoundHistory('lose', function (evt) {
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
		},
		mengmysceli_info: '策励|你未使用牌的额定回合结束后，令一名角色获得一个额外回合。',
		mengmyschuxin_info: '初心|锁定技，当你受到伤害时，若本轮你失去过牌，摸等量张牌，否则防止此伤害。',

		meng_mys_xier: ['希儿', ['female', 'hyyz_xt', 3, ['mengmysfuguang'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_xier.jpg`, 'die:hyyz_xier']]],
		mengmysfuguang: {
			audio: 'hyyzlixing',
			unique: true,
			trigger: {
				player: 'showCharacterAfter'
			},
			filter(event, player) {
				let num = game.getAllGlobalHistory('everything', evt => evt.player == game.me && evt.name == 'phase').length;
				if (_status.currentPhase == player) num--;
				return num > 0 && event.toShow.some(name => {
					return get.character(name, 3).includes('mengmysfuguang');//副将有这个技能
				});
			},
			async cost(event, trigger, player) {
				let num = game.getAllGlobalHistory('everything', evt => evt.player == game.me && evt.name == 'phase').length;
				if (_status.currentPhase == player) num--;
				event.result = await player.chooseTarget('负光：造成' + num + '点量子伤害').set('ai', (target) => {
					const player = _status.event.player;
					return get.effect(target, { name: 'hyyz_quantumdamage' }, player, player) || -get.attitude2(target);
				}).forResult()
			},
			async content(event, trigger, player) {
				const target = event.targets[0]
				let num = game.getAllGlobalHistory('everything', evt => evt.player == game.me && evt.name == 'phase').length;
				if (_status.currentPhase == player) num--;
				if (num > target.hp) {
					await target.damage('hyyz_quantum', target.hp);
					await player.draw(num - target.hp)
				} else {
					await target.damage('hyyz_quantum', num);
				}
			},
		},
		mengmysfuguang_info: '负光|副将技，锁定技，你明置此武将牌时，造成X点伤害，X为你执行过的回合数。若致命，多余的伤害改为你摸等量牌。',*/

		meng_mys_sushang: ['素裳', ['female', 'hyyz_xt', 4, ['mengmysmengdong', 'mengmyshuangwu'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_sushang.jpg`, 'die:hyyz_sushang']]],
		mengmysmengdong: {
			audio: 'hyyzmengdong',
			trigger: {
				player: 'useCard'
			},
			forced: true,
			filter(event, player) {
				return event.card.name == 'sha' && event.card.cards?.some(i => lib.card[i.name].type == 'trick');
			},
			content() { },
			mod: {
				cardname(card, player, target) {
					if (lib.card[card.name].type == 'trick') return 'sha';
				},
				targetInRange(card) {
					if (card.name == 'sha' && card.cards?.some(i => lib.card[i.name].type == 'trick')) return true;
				},
				cardUsable(card, player, num) {
					//if (card.name == 'sha' && card.cards?.some(i => lib.card[i.name].type == 'trick')) return Infinity;
				}
			},
		},
		mengmyshuangwu: {
			audio: 'hyyzhuangwu',
			trigger: {
				player: 'useCardAfter'
			},
			filter(event, player) {
				return event.card.name == 'sha' && event.card.cards.some(i => get.timetype(i) == 'notime') > 0;
			},
			async cost(event, trigger, player) {
				const alls = trigger.cards;
				const next = player.chooseButton();
				next.set('createDialog', ['恍悟：可以视为使用其中的实体牌', alls, 'hidden'])
				next.set('cards', alls)
				next.set('filterButton', (button) => {
					if (get.timetype(button.link.name) == 'time') return false;
					return _status.event.player.hasUseTarget(get.autoViewAs({ name: button.link.name, isCard: true }));
				})
				next.set('ai', (button) => {
					return _status.event.player.getUseValue(get.autoViewAs({ name: button.link.name, isCard: true }), true, false)
				})
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
				const alls = trigger.cards.filter(i => get.timetype(i) == 'notime');
				let links = event.cost_data.links;
				while (alls.length > 0) {
					if (!links) {
						const next = player.chooseButton();
						next.set('createDialog', ['恍悟：可视为使用实体牌中的即时牌', alls, 'hidden'])
						next.set('cards', alls)
						next.set('filterButton', (button) => {
							return _status.event.player.hasUseTarget(get.autoViewAs({ name: button.link.name, isCard: true }));
						})
						next.set('ai', (button) => {
							return _status.event.player.getUseValue(get.autoViewAs({ name: button.link.name, isCard: true }), true, false)
						})
						links = await next.forResultLinks();
						if (!links) return;
					}
					alls.remove(links[0]);
					const bool = await player.chooseUseTarget({ name: links[0].name, isCard: true }, false).forResultBool();
					if (!bool) return;
					links = undefined;
				}
			},
		},
		mengmysmengdong_info: '懵懂|锁定技，你的普通锦囊牌视为无距离限制的【杀】。',
		mengmyshuangwu_info: '恍悟|你使用【杀】后，可视为使用实体牌中的即时牌。',

		meng_mys_jingyuan: ['景元', ['male', 'hyyz_xt', 5, ['mengmyslaoshen', 'mengmyschoumou'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_jingyuan.jpg`, 'die:hyyz_jingyuan']]],
		mengmyslaoshen: {
			trigger: {
				player: ['useCardAfter', 'discardAfter']
			},
			charlotte: true,
			forced: true,
			filter(event, player) {
				if (_status.currentPhase != player) return false;
				return true
			},
			async content(event, trigger, player) {
				player[trigger.name == 'useCard' ? 'loseHp' : 'recover'](1)
			},
		},
		mengmyschoumou: {
			audio: "hyyzshence",
			enable: ["chooseToUse", "chooseToRespond"],
			filter(event, player) {
				const hes = player.getDiscardableCards(player, 'he'), es = hes.filter(i => get.type(i) == 'equip');
				if (es.length >= 2 && es.some((card) => event.filterCard(card, player, event))) return true;

				for (let name of lib.inpile) {
					const type = get.type(name);
					if (type == 'trick' || type == 'basic') {
						if (!event.filterCard({ name: name }, player, event)) return false;
						if (player.countDiscardableCards(player, 'he', (i) => get.type2(i) == type) >= 2) return true;
					}
				}
			},
			chooseButton: {
				dialog(event, player) {
					const dialog = ui.create.dialog('筹谋', 'hidden');
					const use = [], equip = [];
					for (let name of lib.inpile) {
						if (!event.filterCard({ name: name }, player, event)) continue
						if (get.type(name) == 'basic' && player.countDiscardableCards(player, 'he', { type: 'basic' }) >= 2) {
							use.push(['基本', '', name]);
							if (name == 'sha') {
								for (let j of lib.inpile_nature) use.push(['基本', '', 'sha', j]);
							}
						}
						else if (get.type(name) == 'trick' && player.countDiscardableCards(player, 'he', (card) => get.type2(card) == 'trick') >= 2) {
							use.push(['锦囊', '', name]);
						}
					}
					if (use.length > 0) {
						dialog.addText('视为使用');
						dialog.add([use, 'vcard']);
					}
					for (var j of player.getCards('he')) {
						if (get.type(j) == 'equip' && player.countDiscardableCards(player, 'he', { type: 'equip' }) >= 2 && event.filterCard(j, player, event)) equip.push(j);
					}
					if (equip.length > 0) {
						dialog.addText('置入装备区');
						dialog.add([equip, 'vcard']);
					}
					if (!use.length && !equip.length) dialog.addText('无成对的同类型牌');
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
					const guiqv = player.getDiscardableCards(player, 'he').includes(links[0]) ? links[0] : {
						name: links[0][2],
						nature: links[0][3],
						suit: 'none',
						number: null,
						isCard: true,
					};
					return {
						audio: "hyyzshence",
						selectCard: 2,
						filterCard(card, player) {
							if (ui.selected.cards.length) return get.type2(card) == get.type2(ui.selected.cards[0]);

							if (get.type(guiqv) == 'equip') return card == guiqv;
							else return get.type2(card) == get.type(guiqv) && lib.filter.cardDiscardable.apply(this, arguments);
						},
						complexCard: true,
						viewAs: guiqv,
						position: 'he',
						async precontent(event, trigger, player) {
							player.logSkill('mengmyschoumou');
							console.log(event);

							const cards = event.result.cards;
							await player.discard(cards);
							await player.draw();

							if (get.type2(cards[0]) == 'equip') {
								player.equip(event.result.cards[0])
								event.getParent().goto(0);
								return;
							} else {
								event.result.card = {
									name: event.result.card.name,
									nature: event.result.card.nature,
									suit: 'none',
									number: null,
									isCard: true,
								};
								event.result.cards = [];
							}
						},
					};
				},
				prompt(links, player) {
					return player.getCards('he').includes(links[0]) ? `将${get.translation(links[0])}置入装备区`
						:
						`弃置两张牌视为使用【${(get.translation(links[0][3]) || '') + get.translation(links[0][2])}】`;
				},
			},
			hiddenCard(player, name) {
				if (!lib.inpile.includes(name)) return false;
				var type = get.type(name);
				return (type == 'basic' || type == 'trick') && player.countDiscardableCards(player, 'he', (card) => {
					return get.type2(card) == get.type(name);
				})
			},
			mod: {
				targetInRange(card) {
					if (_status.event.skill == 'mengmyschoumou_backup') return true;
				},
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
		mengmyslaoshen_info: '劳神|锁定技，你于回合内[使用/弃置]牌后[失去/回复]1点体力。',
		mengmyschoumou_info: '筹谋|你可以弃置两张类型相同的牌并摸一张牌，以执行一项：①将其中一张装备牌置入装备区；②视为使用或打出一张同类型即时牌。',

		meng_mys_jingliu: ['镜流', ['female', 'hyyz_xt', 4, ['mengmysfeiguang'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_jingliu.jpg`, 'die:hyyz_jingliu']]],
		mengmysfeiguang: {
			enable: 'phaseUse',
			usable: 2,
			filter(event, player) {
				return player.countCards('h') != 4
			},
			async content(event, trigger, player) {
				const result = await player.changeCardTo(4).forResult();
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
		mengmysfeiguang_info: '飞光|出牌阶段限两次，你可以调整手牌至4张，若因此得到含“杀”牌或弃置含“剑”牌，将之当无距离次数限制的冰【杀】使用。',

		meng_mys_huohuo: ['藿藿', ['female', 'hyyz_xt', 3, ['hyyzweiqie', 'mengmysxvxin'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_huohuo.jpg`, 'die:hyyz_huohuo']]],
		mengmysxvxin: {
			logAudio: () => [
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzxvxing1.mp3',
				'ext:忽悠宇宙/asset/hyyz/audio/hyyzxvxing2.mp3',
			],
			audio: 'hyyzxvxing',
			trigger: {
				player: "phaseZhunbeiBegin",
			},
			filter(event, player) {
				return game.hasPlayer(current => current.countCards("hej"))
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget((card, player, target) => target.countCards("hej"))
					.set('prompt', `煦心：令一名角色将一个区域内的所有牌当任一张普通锦囊牌使用`)
					.set('prompt2', `目标[包含/不含]你，其[回复/失去]1点体力`)
					.set('ai', (target) => get.attitude2(target))
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				const target = event.targets[0];
				game.hyyzSkillAudio('hyyz', 'hyyzxvxing', 3)
				const cards = target.getCards('hej'), names = [];
				for (let name of lib.inpile) {
					const card = get.autoViewAs({ name: name }, cards);
					if (!target.hasUseTarget(card)) continue;
					if (get.type(name) == 'trick' && !get.tag(card, 'damage')) names.push(['锦囊', '', name]);
				};
				const links = await target
					.chooseButton(true, [`###选择一张牌###目标包含藿藿，回复1点体力；否则对藿藿造成1点伤害`, [names, 'vcard']])
					.set('ai', (button) => {
						return get.value({ name: button.link[2] })
					})
					.forResult('links')
				if (links) {
					player.when({
						global: 'useCardAfter'
					}).filter((event, player) => {
						return event.getParent(2).name == "mengmysxvxin";
					}).then(() => {
						if (trigger.targets.includes(player)) {
							game.hyyzSkillAudio('hyyz', 'hyyzxvxing', 4, 5)
							player.line("green", trigger.player);
							trigger.player.recover();
						} else {
							trigger.player.line("fire", player);
							player.damage(trigger.player);
						}
					})
					target.chooseUseTarget(get.autoViewAs({ name: links[0][2] }, cards), cards, true);
				}
			},
		},
		mengmysxvxin_info: '煦心|准备阶段，你可令一名角色将区域内的所有牌当非伤害普通锦囊牌使用。结算后，若目标包含你，其回复1点体力，否则对你造成1点伤害。',

		meng_mys_huahuo: ['花火', ['female', 'hyyz_xt', 3, ['mengmysjiaoshi', 'mengmysxichao'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_huahuo.jpg`, 'die:hyyz_huahuo']]],
		mengmysjiaoshi: {
			audio: 'hyyzjiaoshi',
			enable: ["chooseToUse", "chooseToRespond"],
			getName(current) {
				let names = [];
				current.getAllHistory('useCard', (evt) => names.add(evt.card.name));
				return names;
			},
			usable: 1,
			filter(event, player) {
				if (!player.countCards('hes')) return false;
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
					return _status.event.player.getUseValue({ name: button.link[2], isCard: true });
				},
				prompt(links, player) {
					return `矫饰：将一张牌当【${get.translation(links[0][2])}】使用`;
				},
				select: 1,
				backup(links, player) {
					return {
						audio: 'mengmysjiaoshi',
						filterCard: true,
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
							player.draw()
						}
					}
				},
			},
			hiddenCard(player, name) {
				if (!player.countCards('hes')) return false;
				let canViews = [];
				game.hasPlayer(current => {
					if (current != player) {
						current.getAllHistory('useCard', (evt) => canViews.add(evt.card.name));
					}
				});
				if (player.getHistory('useSkill', (evt) => evt.sourceSkill == 'mengmysjiaoshi')) return false;
				return canViews.includes(name);
			},
			ai: {
				fireAttack: true,
				respondSha: true,
				respondShan: true,
				skillTagFilter: function (player) {
					if (!player.countCards('hes')) return false;
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
		mengmysxichao: {
			audio: 'hyyzkehun',
			unique: true,
			trigger: {
				player: 'showCharacterAfter'
			},
			forced: true,
			filter(event, player) {
				return event.toShow.some(name => {
					return get.character(name, 3).includes('mengmysxichao');//副将有这个技能
				});
			},
			async content(event, trigger, player) {
				const targets = game.filterPlayer();
				for (const target of targets) {
					let cards = target.getCards('h'), card = get.autoViewAs({ name: 'wuzhong' }, cards)
					await target.chooseUseTarget(true, card, cards)
				}
			},
		},
		mengmysjiaoshi_info: "矫饰|每回合限一次，你可以将一张牌当其他角色使用过的即时牌使用或打出，然后摸一张牌。",
		mengmysxichao_info: '戏潮|副将技，锁定技，你明置此武将牌时，所有角色将手牌当【无中生有】使用。',

		meng_mys_zhenliyisheng: ['真理医生', ["male", "hyyz_xt", 4, ['mengmysbianbo', 'mengmysguina'], [`ext:忽悠宇宙/asset/hyyz/image/hyyz_zhenliyisheng.jpg`, 'die:hyyz_zhenliyisheng']]],
		mengmysbianbo: {
			audio: 'hyyzbianbo',
			trigger: {
				player: ['phaseZhunbeiBefore', 'phaseJudgeBefore', 'phaseUseBefore', 'phaseDiscardBefore', 'phaseDiscardBefore', 'phaseJieshuBefore']
			},
			filter(event, player) {
				return game.hasPlayer(current => player.canCompare(current));
			},
			async cost(event, trigger, player) {
				event.result = await player
					.chooseTarget(get.prompt('mengmysbianbo'), '跳过' + get.translation(trigger.name) + '并与一名角色拼点，若你赢，对本回合拼点赢过的角色各造成1点伤害', (card, player, target) => {
						return player.canCompare(target)
					})
					.forResult()
			},
			logTarget: 'targets',
			async content(event, trigger, player) {
				trigger.cancel();
				const bool = await player.chooseToCompare(event.targets[0]).forResultBool();
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
		mengmysguina: {
			audio: 'hyyzguina',
			trigger: {
				player: ["chooseToCompareAfter", "compareMultipleAfter"],
				target: ["chooseToCompareAfter", "compareMultipleAfter"],
			},
			forced: true,
			filter(event, player) {
				if (event.preserve) return false;
				if (player == event.player && event.num1 <= event.num2 || player != event.player && event.num1 >= event.num2) return true
				return player.storage.mengmysguina2
			},
			async content(event, trigger, player) {
				if (player == trigger.player && trigger.num1 <= trigger.num2 || player != trigger.player && trigger.num1 >= trigger.num2) {
					player.addSkill('mengmysguina2');
					player.storage.mengmysguina2++;
					player.markSkill('mengmysguina2')
				} else {
					player.removeSkill('mengmysguina2');
				}
			},
		}, mengmysguina2: {
			init(player) {
				player.storage.mengmysguina2 = 0;
				player.markSkill('mengmysguina2')
			},
			onremove(player) {
				delete player.storage.mengmysguina2
				player.unmarkSkill('mengmysguina2')
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
					return "拼点牌点数+" + player.storage.mengmysguina2;
				},
			},
			async content(event, trigger, player) {
				game.log(player, "的拼点牌点数+", player.storage.mengmysguina2);
				if (player == trigger.player) trigger.num1 = Math.min(13, trigger.num1 + player.storage.mengmysguina2);
				else trigger.num2 = Math.min(13, trigger.num2 + player.storage.mengmysguina2);
			}
		},
		mengmysbianbo_info: '辩驳|你可以跳过一个阶段并拼点。若你赢，对本回合拼点赢过的角色各造成1点伤害。',
		mengmysguina_info: '归纳|锁定技，若你拼点没赢，直到拼点赢，你拼点的点数+1。',

		//meng_mys_wandi: ['万敌']
	}
}


const mysdynamicTranslates = {}


export { mysCharacters, mysdynamicTranslates }