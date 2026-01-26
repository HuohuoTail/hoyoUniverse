import { lib, game, ui, get, ai, _status } from '../../../noname.js';

const mysCharacters = {
	/**@type { SMap<Skill> } */
	meng_mys: {
		/**@type { [String, Character, String, String ] } */
		meng_mys_qingque: ['青雀', ['female', 'hyyz_xt', 3, ['mengmystouxian', 'mengmysmianzuo'], []], '', ''],
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
				const { links } = await player
					.chooseButton(['勉作：是否依次使用其中的牌', cards])
					.set('selectButton', [1, suits.length])
					.set('filterButton', (button) => {
						const player = _status.event.player, card = button.link;
						if (!player.hasUseTarget(card) || player.getStorage('mengmysmianzuo').includes(get.suit(card))) return false;
						return !ui.selected.buttons.some(i => get.suit(i) == get.suit(card));
					})
					.set('ai', (button) => _status.event.player.getUseValue(button.link) || get.value(button.link))
					.forResult();
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

		meng_mys_bailu: ['白露', ['female', 'hyyz_xt', 3, ['mengmysleiyin', 'mengmysxuanhu'], []]],
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

		meng_mys_danhengyinyue: ['丹恒·饮月', ['male', 'hyyz_xt', 4, ['mengmysnilin'], []]],
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

		meng_mys_ren: ['刃', ['male', 'hyyz_xt', 2, ['hyyzzhuchou', 'mengmyshuiduo'], []]],
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

		hyyz_b3_re_hua: ['华', ['female', 'hyyz_xt', 3, ['mengmyscunjin', 'mengmysfusheng'], []]],
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
						const { bool } = await player
							.chooseBool('寸劲：摸一张牌？')
							.set('frequentSkill', 'mengmyscunjin')
							.forResult();
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

				const { index } = await player
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
		mengmyscunjin_info: '寸劲|当你<span class=yellowtext>使用</span>/<span class=firetext>弃置</span>/<span class=thundertext>获得</span>牌后，你可以<span class=yellowtext>弃置</span>/<span class=firetext>摸</span>/<span class=thundertext>使用</span>一张牌。',
		mengmysfusheng_info: `浮生|持恒技，你失去所有牌后，可以<br>①失去1点体力；<br>②减1点体力上限；<br>${get.hyyzIntroduce('断拒')}：失去此技；<br>然后将手牌摸至上限。`,

		hyyz_xt_sp_jingliu: ['镜流', ['female', 'hyyz_xt', 4, ['mengmysfeiguang'], []]],
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

		meng_mys_huahuo: ['花火', ['female', 'hyyz_xt', 3, ['mengmysjiaoshi', 'mengmysxichao'], []]],
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
				skillTagFilter(player) {
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
					player(player) {
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
		//meng_mys_wandi: ['万敌']
	}
}


const mysdynamicTranslates = {}


export { mysCharacters, mysdynamicTranslates }