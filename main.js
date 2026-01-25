'use strict';
import { lib, game, ui, get, ai, _status } from "../../noname.js";
import { hyyzBuffx } from "./hyyzBuff.js";

async function ARENAREADY() { }
async function PREPARE() { }
/** @type { importCharacterConfig['skill'] } */
async function PRECONTENT() {
	//——————————————军八座位次上限——————————————//
	_status.maximumNumberOfPlayers ??= 30


	//——————————————忽悠宇宙特有存储空间——————————————//
	lib.hyyz ??= {}
	Object.assign(lib.hyyz, {
		ym: {}, prefix: {},
		//所有武将
		characters: {},
		//注释
		get introduce() {
			const introduce = {
				//属性
				风蚀: `特有概念：一名角色受到风蚀伤害时，弃置至少一张牌；每额外弃置两张牌，此伤害减少1点。`,
				量子: `特有概念：一名角色使用量子【杀】指定目标后，可以重铸一张牌，然后目标角色随机重铸一张同类型的牌。`,
				虚数: `特有概念：一名角色受到虚数伤害时/使用虚数【杀】指定目标后，受伤角色/目标角色本回合护甲和防具失效。`,
				//buff
				效果: "特有概念：分为增益[效果]-buff和负面[效果]-debuff，其中debuff包含持续[效果]-dotdebuff。<li>净化：移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。<li>驱散：移除所有buff。<li>引爆：立即结算dotdebuff中的高亮效果。",
				净化: "特有概念：移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。",
				驱散: "特有概念：移除对象所有buff。",
				引爆: "特有概念：立即结算对象拥有的dotdebuff中的高亮效果。",
				//buff
				加速: "特有概念：buff，下个弃牌阶段开始前，插入一个出牌阶段。",
				//debuff
				重伤: "特有概念：debuff，下次受到的伤害+1。",
				虚弱: "特有概念：debuff，下次造成的伤害-1。",
				减速: "特有概念：debuff，下个出牌阶段开始前，插入一个弃牌阶段。",
				冻结: "特有概念：debuff，当前回合内不能使用、打出或弃置手牌。",
				禁锢: "特有概念：debuff，使用的下一张牌无效。",
				纠缠: "特有概念：debuff，下次成为即时牌的目标后，重铸一张相同类型的牌，否则此牌结算两次。",
				//dotdebuff
				裂伤: "特有概念：dotdebuff，每层令此角色使用牌指定其他角色后失去1点体力。",
				灼烧: "特有概念：dotdebuff，每层令此角色[点燃]区域内随机两张牌（优先手牌）",
				风化: "特有概念：dotdebuff，准备阶段，每层使此角色受到1点风蚀伤害。",
				触电: "特有概念：dotdebuff，始终横置；每层使此角色使用或打出无目标的牌后受到1点雷电伤害",
				//弱点
				弱点: "特有概念：弱点击破后会触发对应的击破debuff，受到非dotdeubff伤害将被击破弱点。",

				//宝集
				中央区: "封装概念：本回合进入弃牌堆的牌。",
				即时牌: "封装概念：基本牌和普通锦囊牌；装备牌和延时锦囊牌称为非即时牌。",
				周始: "封装概念：转换技或多选项技能完成一轮循环后触发的效果。",
				附魔: "封装概念：为一项事物增加额外效果。<li>属性：新增该附魔词条。<li>牌：牌生效后，执行该附魔词条中的效果。<li>技能或效果：令附魔对象的拥有者/使用者在结算中视为拥有附魔词条中包含的技能或效果。",
				滞留牌: '封装概念：此刻没有合法目标的手牌（即不能点击的手牌）。',
				点燃: "封装概念：被点燃的牌使用时无距离和次数限制且不计入次数上限；每回合结束后弃置之。",
				断拒: "特有概念：背水的反面，不执行任何选项，直接享受效果！<li>这是一个没有任何效果的选项；如果后续因此无法执行，则终止流程。",
				背水: "官方概念：断拒的反面，依次执行前面所有选项！<li>技能中存在多个选项或分支时，执行背水的效果后，再依次执行所有选项的内容。若不能支付代价，无法选择背水选项。",
				单挑: '特有概念：与一名角色进入其他存活角色离场的单挑模式，默认持续至当前回合结束。',

			}
			for (let i in introduce) introduce[i] = '<li>' + introduce[i];
			return introduce;
		}
	})


	//——————————————导入CSS文件——————————————//
	lib.init.css(`${lib.assetURL}extension/忽悠宇宙/other`, `extension`);
	if ('势力与新属性') {
		//——————————————势力添加——————————————//
		game.addGroup('hyyz_ys', '<span class="hyyzGroup">原</span>', '原神', {
			color: 'water',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_ys.png'
		});
		game.addGroup('hyyz_xt', `<span class="hyyzGroup">铁</span>`, '星铁', {
			color: 'white',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_xt.png'
		});
		game.addGroup('hyyz_b3', '<span class="hyyzGroup">崩</span>', '崩三', {
			color: 'thunder',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_b3.png'
		});
		game.addGroup('hyyz_zzz', '<span class="hyyzGroup">绝</span>', '绝区零', {
			color: 'black',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_zzz.png'
		});
		game.addGroup('hyyz_other', '<span class="hyyzGroup">梦</span>', '圆梦', {
			color: '#ee9ac7',
			image: 'ext:忽悠宇宙/other/qhly/hyyz_other.png'
		});


		//——————————————新属性——————————————//
		game.addNature('hyyz_water', '水熵', {
			audio: undefined,
			linked: true,
			order: 10,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/hyyz_water.png',
			lineColor: [0, 100, 200],
			color: [0, 100, 200],
		});
		game.addNature('fire', '火焰', {
			audio: undefined,
			linked: true,
			order: 20,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/fire.png',
			lineColor: [255, 0, 0],
			color: [255, 0, 0],
		});
		game.addNature('thunder', '雷电', {
			audio: undefined,
			linked: true,
			order: 30,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/thunder.png',
			lineColor: [180, 0, 180],
			color: [180, 0, 180],
		});
		game.addNature('ice', '冰冻', {
			audio: undefined,
			linked: true,
			order: 40,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/ice.png',
			lineColor: [70, 170, 170],
			color: [70, 170, 170],
		});
		game.addNature('hyyz_wind', '风蚀', {
			audio: undefined,
			linked: true,
			order: 70,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/hyyz_wind.png',
			lineColor: [80, 220, 220],
			color: [80, 220, 220],
		});
		lib.skill._hyyz_wind = {
			trigger: {
				player: "damageBegin4"
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter: function (event, player) {
				return player.countCards('he') > 0 && event.hasNature('hyyz_wind');
			},
			async content(event, trigger, player) {
				const cards = await player
					.chooseToDiscard(`风蚀`, `弃置至少一张牌；每多弃置两张，防止1点伤害`, 'he', [1, trigger.num * 2 + 1], true)
					.set('ai', function (card) {
						const trigger = _status.event.getTrigger(), player = _status.event.player;
						if (
							player.countCards('he') - 3 >= trigger.num * 2 + 1 ||
							player.countCards('he') >= trigger.num * 2 + 1 && trigger.num > player.hp
						) {
							return true;//致命，牌多
						};
						let cards = player.getCards('he').sort((a, b) => get.value(a) - get.value(b));
						let discards = [cards.shift()];
						while (discards.reduce((a, b) => a + get.value(b), 0) / discards.length <= 8 && cards.length >= 2) {
							//game.log(discards, '的平均收益：', discards.reduce((a, b) => a + get.value(b), 0) / discards.length, '<li>其他牌为', cards)
							discards.add(cards.shift());
							discards.add(cards.shift());
						};
						return discards.includes(card);
					})
					.forResultCards();
				if (cards) {
					var count = Math.floor((cards.length - 1) / 2);
					if (count > 0) {
						game.log('#g「风蚀」', player, '减少了', count, '点风蚀伤害');
						if (trigger.num > 0) trigger.num -= count;
					}
				}
			}
		}
		game.addNature('hyyz_quantum', '量子', {
			audio: undefined,
			linked: true,
			order: 80,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/hyyz_quantum.png',
			lineColor: [80, 0, 180],
			color: [80, 0, 180],
		});
		lib.skill._hyyz_quantum = {
			trigger: {
				player: "useCardToPlayered"
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter(event, player) {
				return player.countCards('he', (card) => player.canRecast(card)) && get.name(event.card) == 'sha' && game.hasNature(event.card, 'hyyz_quantum');
			},
			async content(event, trigger, player) {
				const cards = await player.chooseCard(`纠缠`, `你可以重铸一张牌，${get.translation(trigger.target)}将随机重铸一张同类型的牌`, 'he', function (card) {
					return _status.event.player.canRecast(card);
				}).set('ai', (card) => 8 - get.value(card)).forResultCards();
				if (cards) {
					await player.recast(cards);
					const loses = trigger.target.getCards('he', card => get.type2(card) == get.type2(cards[0]));
					if (loses.length) {
						trigger.target.recast(loses.randomGet());
						game.log('#g「量子」', trigger.target, '被', player, '纠缠了');
					} else {
						game.log('#g「量子」', player, '自我纠缠ing');
					}

				};
			},
		}
		game.addNature('hyyz_imaginary', '虚数', {
			audio: undefined,
			linked: true,
			order: 90,
			background: 'extension/忽悠宇宙/asset/hyyzCard/image/hyyz_imaginary.png',
			lineColor: [255, 255, 0],
			color: [255, 255, 0],
		});
		lib.skill._hyyz_imaginary = {
			trigger: {
				player: ["damageBegin4", "useCardToPlayered"],
			},
			forced: true,
			priority: -Infinity,
			popup: false,
			filter(event, player) {
				if (event.name == 'damage') {
					return !player.hasSkill('hyyz_imaginary_buff') && event.hasNature('hyyz_imaginary')
				} else {
					return event.targets.some(current => !current.hasSkill('hyyz_imaginary_buff')) && game.hasNature(event.card, "hyyz_imaginary");
				}
			},
			async content(event, trigger, player) {
				if (trigger.name == 'damage') {
					player.addTempSkill('hyyz_imaginary_buff');
					player.markSkill('hyyz_imaginary_buff');
					game.log('#g「虚数」', player, '本回合护甲和防具失效');
				} else {
					game.log('#g「虚数」', trigger.targets, '本回合护甲和防具失效');
					trigger.targets.forEach(current => {
						if (!current.hasSkill('hyyz_imaginary_buff')) {
							current.addTempSkill('hyyz_imaginary_buff');
							current.markSkill('hyyz_imaginary_buff');
						}
					})
				}
			},
		}
		lib.skill.hyyz_imaginary_buff = {
			charlotte: true,
			superCharlotte: true,
			unique: true,
			mark: true,
			marktext: '※',
			intro: {
				name: '虚数',
				content: '本回合防具和护甲失效'
			},
			ai: {
				nohujia: true,
				"unequip2": true,
			},
		}
	}


	//——————————————异构——————————————//
	Object.assign(lib.characterReplace, {
		hyyz_bailu: ['hyyz_bailu', 'meng_danhengbailu'],//白露
	})



	//——————————————详情介绍——————————————//
	/**感谢钫酸酱、沐如风晨-创造一个窗口用于显示
	 * - 只是{@link hyyzIntroduce}的狗而已
	 * @param {string} str 被显示的字符串
	 * @param {number}id 被显示窗口的标号
	 */
	get.hyyztips = function (str, id) {
		const hyyztip = ui.create.div('.hyyz-tip', document.body);
		let isPhone = /mobile|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|OperaMini/i.test(navigator.userAgent);
		hyyztip.style.zIndex = 998;
		const hyyztip2 = ui.create.div('.hyyz-tip2', hyyztip);
		hyyztip2.innerHTML = str;
		let element = document.getElementById(id);
		if (element) {
			let left = element.getBoundingClientRect().left;
			if (isPhone) left += element.offsetParent.offsetLeft;
			left += document.body.offsetWidth * 0.14;
			hyyztip2.style.left = left + 'px';

			let top = element.getBoundingClientRect().top;
			top += document.body.offsetHeight * 0.08;
			hyyztip2.style.top = top + 'px';
		}
		hyyztip.listen(function (e) {
			e.stopPropagation();
			this.remove();
		})
	}
	/**弹窗显示注释
	 * 返回的字符串有超链接效果
	 * @param {string} key 被解释的关键词
	 * @param {string} str 解释的内容
	 * @returns {string}
	 */
	get.hyyzIntroduce = function (key, str) {
		let link = `<u><b>[`
		const id = (Math.random() * 9 + 1) * 100000;//随机id，并不稳定，但是基本没有bug//建议改为固定规则的编码
		if (str && str != '') {
			link += `<a id='${id}' style = 'color: unset' href = "javascript: get.hyyztips('${str}', '${id}'); ">${key}</a>`;
		} else if (lib.hyyz.introduce[key]) {
			link += `<a id='${id}' style = 'color: unset' href = "javascript: get.hyyztips('${lib.hyyz.introduce[key]}', '${id}'); ">${key}</a>`;
		} else link += '锟斤拷';
		link += `]</b></u>`;
		return link;
	}

	//——————————————导入特殊机制——————————————//
	hyyzBuffx();
	import('./asset/index.js')
}
async function CONTENT(config, pack) {
	if ('强度评级') {
		//sss传说，极致的强度
		lib.rank.rarity['legend'].addArray([

		])
		//ss史诗，均衡强，或偶尔极致
		lib.rank.rarity['epic'].addArray([

		])
		//a+s精品，普通武将
		lib.rank.rarity['rare'].addArray([

		])
		//a平凡，天牢，强度拉稀
		lib.rank.rarity['junk'].addArray([

		])
	}
	if ('武将包') {
		//——————————————自动开启武将包——————————————//
		if (!lib.config['extension_忽悠宇宙_init']) {
			//game.saveConfig('extension_忽悠宇宙_init', true);
			//game.saveConfig('characters', lib.config.characters.concat(['hyyzCharacter', 'hyyzmysCharacter', 'hyyzmengCharacter', 'hyyzymCharacter', 'hyyzysltCharacter']))
			//game.saveConfig('cards', lib.config.cards.concat(['hyyzCard', 'hyyzmengCard']));
		};
		//——————————————清理重复包——————————————//
		lib.config.characters = [...new Set(lib.config.characters)];
		lib.config.all.characters = [...new Set(lib.config.all.characters)];
		lib.config.cards = [...new Set(lib.config.cards)];
		lib.config.all.cards = [...new Set(lib.config.all.cards)];
	}
}
const CONFIG = {
	group: {//投稿武将入口
		name: '<span style="color: #ea059e">投稿武将入口(点击打开图片)▶</span>',
		clear: true,
		onclick() {
			if (this.group == undefined) {
				var more = ui.create.div('.group',
					`<b style=" color: #ea059e" >紫灵谷の小宇宙：</b>519463281<br>
					<img src ="${lib.assetURL}extension/忽悠宇宙/hyyzGroup.png" style ="width: 220px">`);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.group = more;
				this.innerHTML = '<span style = "color: #ea059e">投稿武将入口(点击收起图片)▼</span>';
			} else {
				this.parentNode.removeChild(this.group);
				delete this.group;
				this.innerHTML = '<span style = "color: #ea059e">投稿武将入口(点击打开图片)▶</span>';
			};
		},
	},
	type: {//分类方式
		name: '更换扩展包分类',
		init: '0',
		intro: '按圆梦时间分类：依据圆梦入扩时间分类；按角色来源分类：大类为游戏名，小类为角色所属区域',
		item: {
			'0': '按圆梦时间分类',
			//'1': '按角色来源分类',
		}
	},
	huyou: {//忽悠模式
		name: '弱点+buff系统(即时)',
		intro: "若开启，角色开局获得两个弱点，部分武将的技能描述会被替换；若关闭，立即清除场上所有的弱点，新buff不能再被赋予",
		init: true,
		clear: false,
		update() {
			if (lib.config["extension_忽悠宇宙_huyou"] != true && game.filterPlayer2 && current && current.$syncWeakness) game.filterPlayer2((current => {
				current.$syncWeakness()
			}))
		},
	},
	weaknessPosition: {//弱点显示位置
		name: '弱点显示位置',
		init: 'top',
		intro: '弱点图标在武将牌附近的显示位置',
		item: {
			'top': '上',
			'bottom': '下',
			'left': '左',
			'right': '右',
		},
		onclick(item) {
			game.saveConfig('extension_忽悠宇宙_weaknessPosition', item);
			if (game.countPlayer2() > 0) game.filterPlayer2(i => i.$syncWeakness())
		}
	},
	weaknessPosition2: {//弱点内外侧显示位置
		name: '弱点内外侧显示位置',
		init: 'out',
		intro: '弱点图标在武将牌内外的情况',
		item: {
			'in': '内侧',
			'on': '边缘',
			'out': '外侧',
		},
		onclick(item) {
			game.saveConfig('extension_忽悠宇宙_weaknessPosition2', item);
			if (game.countPlayer2() > 0) game.filterPlayer2(i => i.$syncWeakness())
		}
	},
	loadUpdateContent: {//历史记录
		name: '<span style="color: #ea059e">历史更新记录(点击查看)▶</span>',
		intro: '查看历史更新',
		onclick() {
			if (this.loadUpdateContent == undefined) {
				let strs = [
					'<b style="color: #008cff">2023-6-23</b>',
					'《星铁杀》开始更新',
					'<b style="color: #008cff">2023-7-8</b>',
					'加入首个圆梦武将，开始筹备圆梦计划',
					'<b style="color: #008cff">2023-9-4</b>',
					'扩展正式改名《忽悠宇宙》，开启装备更新',
					'<b style="color: #008cff">2024-3-8</b>',
					'骊歌最后一期视频更新，群友开始代码助力（泪目）',
					'忽悠宇宙开启“大共创时代”，圆梦计划由投稿挑选转变为群赛',
					'<b style="color: #008cff">2024-8-9</b>',
					'忽悠宇宙的后续更新计划转由尾巴酱进行',
					'<b style="color: #008cff">2024-11-1 『v2.6』</b>',
					'改了扩展底层架构，删改了大量武将，版本号遵循“v周年.额外月份”的形式。',
					'<b style="color: #008cff">2024-11-9 『v2.6a』</b>',
					'函数适配异步和1.10.15，将部分武将的衍生技或特殊技能效果替换为[效果]',
					'dotdebuff默认上限5层，[净化]增加效果“熄灭[点燃]的牌”，增加[驱散]',
					'新增介绍弹窗，其他详情参见“帮助”菜单',
					'删除持明族复活',
					'<b style="color: #008cff">2024-12-8 『v2.7』</b>',
					'添加、补充阮梅（柚衣）的专有卡牌',
					'点燃牌改为事件（可以触发时机）',
					'<b style="color: #008cff">2024-12-8 『v2.7a』</b>',
					'增加chooseToMove_new函数（来自无名杀1.10.16），增加背水、断拒和弹窗提示',
					'<b style="color: #008cff">2024-12-20 『v2.7b』</b>',
					'重写了忽悠动态包和忽悠宇宙的动态立绘代码，相关体验请下载“忽悠动态包”',
					'补充了含紫灵谷的骊歌在内的三十余名武将台词和语音',
					'重写忽悠动态包的那维莱特的代码和天气系统',
					'<b style="color: #008cff">2025-1-1 『v3.1』</b>',
					'分离《忽悠宇宙》与《圆梦计划》，忽悠宇宙进行机制探索，武将在圆梦计划更新',
					'新增弱点击破系统',
					'版本号遵循“v年序.当前月份”的形式续写',
					'<b style="color: #008cff">2025-1-18 『v3.1b』</b>',
					'删除涂鸦debuff，改为植入弱点',
					'<b style="color: #008cff">2025-7-17 『v3.7』</b>',
					'合并《忽悠宇宙》与《圆梦计划》，新增奇物系统（看情况取舍）',
					'<b style="color: #008cff">2025-7-17 『v3.7a』</b>',
					'修复了冰冻被调离后无法脱离效果的bug',
					'为火漆类奇物添加不能打出、弃置、响应的机制',
					'<b style="color: #008cff">2025-7-17 『v3.7b』</b>',
					'修复了奇物会进入弃牌堆的bug',
					'增加了忽悠模式的开关。',
					'未来100-200天内无限期延期更新',
					'<b style="color: #008cff">2026-?-? 『v4.1』</b>',
					'',
					'',
				]
				var more = ui.create.div('.loadUpdateContent', `　<div style="border: 1px solid blue"><font size=2px>` + strs.join('<br>') + `</font></div>`);
				this.parentNode.insertBefore(more, this.nextSibling);
				this.loadUpdateContent = more;
				this.innerHTML = '<span style="color: #ea059e">历史更新记录(点击收起)▼</span>';
			} else {
				this.parentNode.removeChild(this.loadUpdateContent);
				delete this.loadUpdateContent;
				this.innerHTML = '<span style="color: #ea059e">历史更新记录(点击查看)▶</span>';
			};
		},
		clear: true,
	},

};
const HELP = {
	//效果介绍
	'<span style="font-size:23px">忽悠<span style="color: #07a6f0">[效果]</span></span>':
		`<div style="margin:10px">关于<b style="color:#07a6f0">[效果]</b></div>

        <ul>
            <li>本扩展包特有的<span style="color:#07a6f0">[效果]</span>机制，分为<b style="color:#0aba0a">增益[效果]-buff</b>和<b style="color:#ff6666">负面[效果]-debuff</b>，其中debuff包含<b style="color:#ff6666">持续[效果]-dotdebuff</b>。</li>
            <li><b style="color:#0aba0a">buff</b>多数情况下拥有正面效果，一般不会被移除。</li>
            <li><b style="color:#ff6666">debuff</b>多数情况下拥有负面效果，一般可以被群扩中能移除debuff的操作移除。</li>
            <li><b style="color:#ff6666">dotdebuff</b>多数情况下拥有负面效果且属于debuff。除“引爆”不消耗层数外，每结算一次，移除一层。</li>
        </ul>

		<b style="margin:10px;color:#07a6f0">名词介绍</b>

        <ul>
            <li><b style="color:#07a6f0">[效果]</b>仅能被本扩的武将赋予，[净化]能解除debuff。</li>
            <li><b style="color:#0aba0a">净化</b>移除对象判定区的牌、复原武将牌、移除所有debuff、熄灭[点燃]的牌。</li>
            <li><b style="color:#ff6666">驱散</b>移除对象所有buff。</li>
            <li><b style="color:#ff6666">引爆</b>立即结算对象拥有的dotdebuff中的高亮效果。</li>
        </ul>

		<b style="margin:10px;color:#07a6f0">详细介绍</b>

        <ul>
            <li><b style="color:#0aba0a">[加速]buff</b>下个弃牌阶段开始前，插入一个出牌阶段。</li>
            <li><b style="color:#ff6666">[重伤]debuff</b>下次受到的伤害+1。</li>
            <li><b style="color:#ff6666">[虚弱]debuff</b>下次造成的伤害-1。</li>
            <li><b style="color:#ff6666">[减速]debuff</b>下个出牌阶段开始前，插入一个弃牌阶段。</li>
            <li><b style="color:#ff6666">[冻结]debuff</b>当前回合内不能使用、打出或弃置手牌。</li>
            <li><b style="color:#ff6666">[禁锢]debuff</b>使用的下一张牌无效。</li>
            <li><b style="color:#ff6666">[纠缠]debuff</b>下次成为即时牌的目标后，重铸一张相同类型的牌，否则此牌结算两次。</li>
            <li><b style="color:#ff6666">[裂伤]dotdebuff</b>每层令此角色使用牌指定其他角色后<span style="color:#f40cf0">失去1点体力</span>。</li>
            <li><b style="color:#ff6666">[灼烧]dotdebuff</b>每层令此角色<span style="color:#f40cf0">[点燃]区域内随机两张牌（优先手牌）</span>。</li>
            <li><b style="color:#ff6666">[风化]dotdebuff</b>准备阶段，每层使此角色<span style="color:#f40cf0">受到1点风蚀伤害</span>。</li>
            <li><b style="color:#ff6666">[触电]dotdebuff</b>始终横置；每层使此角色使用或打出无目标的牌后<span style="color:#f40cf0">受到1点雷电伤害</span>。</li>
        </ul>`,

	'忽悠<span style="color:#07a6f0">属性</span>':
		`<div style="margin:10px">关于<b style="color: #008cff">新属性</b></div>
		<ul>
            <li><span style="text-shadow: 1px 1px 2px #0aba0a,0 0 8px #018801;color: white">“风蚀”hyyz_wind</span>。</li>
            <li>一名角色受到<span style="text-shadow: 1px 1px 2px #0aba0a,0 0 8px #018801;color: white">风蚀</span>伤害时，弃置至少一张牌；每额外弃置两张牌，此伤害减少1点。</li>
            <li><span style="text-shadow: 1px 1px 2px #07a6f0,0 0 8px #0a1bb9;color: white">“量子”hyyz_quantum</span>。</li>
            <li>一名角色使用<span style="text-shadow: 1px 1px 2px #07a6f0,0 0 8px #0a1bb9;color: white">量子</span>【杀】指定目标后，可以重铸一张牌，然后目标角色随机重铸一张同类型的牌。</li>
            <li><span style="text-shadow: 1px 1px 2px #ffee00,0 0 8px #ccaa11;color: white">“虚数”hyyz_imaginary</span>。</li>
            <li>一名角色受到<span style="text-shadow: 1px 1px 2px #ffee00,0 0 8px #ccaa11;color: white">虚数</span>伤害时/使用虚数【杀】指定目标后，受伤角色/目标角色本回合护甲和防具失效。</li>
        </ul>`,
}
export { ARENAREADY, PREPARE, PRECONTENT, CONTENT, CONFIG, HELP };

`
清理重复包
新势力添加
异构模板
自动开启武将包和清理重复包
强度评级
`