'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';

import { characters as characters2023, dynamicTranslates as dynamicTranslates2023 } from './character2023.js'
import { characters as characters2024, dynamicTranslates as dynamicTranslates2024 } from './character2024.js'
import { characters as characters2025, dynamicTranslates as dynamicTranslates2025 } from './character2025.js'
import { characters as characters2026, dynamicTranslates as dynamicTranslates2026 } from './character2026.js'
import { hyyzcards } from './card.js';
import hyyzvoices from './voices.js';
//——————————————链接台词对应的语音——————————————//
for (let characterName in hyyzvoices) {
	lib.translate[`#${characterName}:die`] = hyyzvoices[characterName];//筛选角色名
	lib.translate[`#ext:忽悠宇宙/asset/character/audio/${characterName}`] = hyyzvoices[characterName];//筛选技能
}

//——————————————整合武将信息——————————————//
const allCharacter = { ...characters2023, ...characters2024, ...characters2025, ...characters2026 }
//初始化一些常用属性
const characters = {}, characterTitles = {}, characterIntros = {}, skills = {}, translates = {}, characterSorts = {};
//依次过滤、筛选、解码导入的信息
/**武将包名 */
let sortName;
if (lib.config['extension_忽悠宇宙_type'] == '1') {//按角色来源分类
	Object.assign(translates, {
		//
		hyyzSort_ym: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_ym.png" width="117" height="33">`,//9
		hyyzSort_ym_info: '粉丝堂',
		//
		hyyzSort_b3: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_b3.png" width="117" height="33">`,//9
		hyyzSort_b3_info: '崩坏三',
		//
		hyyzSort_ys: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_ys.png" width="132" height="37.5">`,//1055*76/8
		hyyzSort_ys_info: '原神·空月之歌',
		//
		hyyzSort_xt: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_xt.png" width="132" height="37.5">`,
		hyyzSort_xt_info: '崩坏：星穹铁道',
		//
		hyyzSort_zzz: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_zzz.png" width="117" height="33">`,
		hyyzSort_zzz_info: '绝区零',
		//
		hyyzSort_other: `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_other.png" width="117" height="33">`,
		hyyzSort_other_info: '其他武将',
	})
	Object.assign(characterSorts, {
		hyyzSort_ym: [],
		hyyzSort_b3: [],
		hyyzSort_ys: [],
		hyyzSort_xt: [],
		hyyzSort_zzz: [],
		hyyzSort_other: [],
	})
	sortName = function (name) {
		if (name.startsWith('ym_')) return 'hyyzSort_ym'
		return 'hyyzSort_' + (['b3', 'ys', 'zzz', 'xt'].includes(name.split('_')[1]) ? name.split('_')[1] : 'other');
	}
} else if (lib.config['extension_忽悠宇宙_type'] == '2') {//按设计师分类
	Object.assign(translates, lib.hyyz.authors)
	sortName = function (author) {
		for (let sort in lib.hyyz.authors) {
			const 作者名 = lib.hyyz.authors[sort]
			if (作者名 == author) {
				characterSorts[sort] ??= []
				return sort
			}
		}
		console.warn('作者名检测出错：', author);
		return author
	}
}
for (let data in allCharacter) {//键：日期
	if (lib.config['extension_忽悠宇宙_type'] == '0') {//按圆梦时间分类
		if (/^\d+$/.test(data)) {//日期 202408
			sortName = 'hyyz_' + data
			translates[sortName] = `20${data.slice(0, 2)}.${data.slice(2)}圆梦`;//hyyz_202408: 2024.08圆梦
			translates[sortName + '_info'] = `20${data.slice(0, 2)}.${data.slice(2, 4)}圆梦，由群赛投票、语音交流评选得到`;//hyyz_202408_info: xxxxxxx
		}
		else if (data == 'ym') {
			sortName = 'hyyz_ym'
			translates[sortName] = `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_ym.png" width="76" height="22">`;
			translates[sortName + '_info'] = `广大群友的自我形象`;
		} else continue//没有找到对应的扩展包名，低概率事件
		characterSorts[sortName] ??= [];//生成一个空扩展包
	}
	for (let name in allCharacter[data]) {//键：角色 or 技能名 or 技能名_info
		/**值：角色前置数组['',[],'',''] or 技能内容{} or 技能翻译'xx|xxxx' 
		 * @type { Character | Skill | String } values
		*/
		let values = allCharacter[data][name];
		if (typeof values == 'object' && Array.isArray(values)) {//角色前置数组
			//武将标准数组
			characters[name] = values.find(i => Array.isArray(i));
			//加入扩展包
			if (lib.config['extension_忽悠宇宙_type'] == '0') characterSorts[sortName].add(name)
			else if (lib.config['extension_忽悠宇宙_type'] == '1') characterSorts[sortName(name)].add(name)
			/**剩余包含三元素的数组 */
			let temps = values.filter(i => typeof i == 'string');
			if (!characters[name][4].some(str => str.startsWith('ext:忽悠宇宙'))) characters[name][4].add(`ext:忽悠宇宙/asset/character/image/${name}.jpg`);//导入原画
			if (!characters[name][4].some(str => str.startsWith('die:'))) characters[name][4].add(`die:ext:忽悠宇宙/asset/character/audio:true`);//导入阵亡语音
			if (temps[0]) {//名字
				//批量导入
				const prefixs = Object.keys(lib.hyyz.prefix);
				let prefix = prefixs.find(prefix => name.startsWith(prefix));
				if (prefix) {
					translates[name] = lib.hyyz.prefix[prefix] + temps[0];
					translates[name + '_prefix'] = lib.hyyz.prefix[prefix];//添加前缀
				} else {
					translates[name] = temps[0];
				}
			}
			if (temps[1]) {//称号
				/**'xxx' \ 'xxxx-xxxx' */
				const tilte = temps[1]
				if (tilte.includes('-')) {
					characterTitles[name] = `<span class="firetext">${tilte.split('-')[0]}</span><br><span class="greentext">${tilte.split('-')[1]}</span>`
					//加入扩展包
					if (lib.config['extension_忽悠宇宙_type'] == '2') characterSorts[sortName(tilte.split('-')[1])].add(name)
				} else {
					characterTitles[name] = `<span class="greentext">${tilte}</span>`;
					//加入扩展包
					if (lib.config['extension_忽悠宇宙_type'] == '2') characterSorts[sortName(tilte.split('-')[0])].add(name)
				}
			}
			if (temps[2]) {//介绍
				characterIntros[name] = temps[2];
			}
		} else if (typeof values == 'object') {
			skills[name] = values;
			//批量将技能和子技能的“audio：5”换成标准格式
			if (typeof skills[name].audio == 'number') {
				skills[name].audio = 'ext:忽悠宇宙/asset/character/audio:' + skills[name].audio
			}
			if ('subSkill' in skills[name]) {
				for (let subName in skills[name].subSkill) {
					if (typeof skills[name].subSkill[subName].audio == 'number') {
						skills[name].subSkill[subName].audio = 'ext:忽悠宇宙/asset/character/audio:' + skills[name].subSkill[subName].audio
					}
				}
			}
		} else if (typeof values == 'string') {
			if (name.endsWith('_append')) {
				translates[name] = `<span class="text" style="font-family: yuanli">${values}</span>`
			}
			else if (name.endsWith('_info') && values.includes('|')) {//'xxx_info':'xx|xxxx'
				translates[name.slice(0, name.length - 5)] = values.split('|')[0]//从|处拆分两部分
				translates[name] = values.split('|')[1]
			}
			else translates[name] = values;
		}
	}
}
//——————————————存入库——————————————//
Object.assign(lib.hyyz.characters, characters)
//——————————————导入武将——————————————//
game.import("character", () => {
	/** @type { importCharacterConfig } */
	return {
		name: "hyyzCharacter",
		connect: false,
		character: characters,
		characterTitle: characterTitles,
		characterIntro: characterIntros,
		characterFilter: {},
		characterSort: { hyyzCharacter: characterSorts },
		skill: skills,
		translate: translates,// 
		dynamicTranslate: { ...dynamicTranslates2023, ...dynamicTranslates2024, ...dynamicTranslates2025, ...dynamicTranslates2026 },
		characterSubstitute: {
			hyyz_ys_furina: [
				["mengjvxing_achieve", ["ext:忽悠宇宙/other/skin/image/hyyz_ys_furina/mengjvxing_achieve.jpg"]],
				["mengjvxing_fail", ["ext:忽悠宇宙/other/skin/image/hyyz_ys_furina/mengjvxing_fail.jpg"]],
			],
			hyyz_ys_leidianying: [
				['mengwumeng', ['ext:忽悠宇宙/other/skin/image/hyyz_ys_leidianying/mengwumeng.jpg']],
				['hyyz_ys_leidianying', ['die:hyyz_ys_leidianying', 'img:hyyz_ys_leidianying']],
			],
			hyyz_zzz_sb_bonisi: [
				["mengrongyan", ["ext:忽悠宇宙/other/skin/image/hyyz_zzz_sb_bonisi/mengrongyan.jpg",]],
				["hyyz_zzz_sb_bonisi", ["img:hyyz_zzz_sb_bonisi",]],
			],
		},
	}
})
lib.config.all.characters.splice(3, 0, 'hyyzCharacter');
lib.translate['hyyzCharacter_character_config'] = `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_hyyz.png" width="105.5" height="30">`;

//——————————————自动化异构分包——————————————//
const characterReplace = {};
Object.keys(lib.hyyz.characters).forEach(name => {
	const endName = name.split('_').pop();
	characterReplace[endName] ??= [];
	characterReplace[endName].add(name);
})
for (let name in characterReplace) if (characterReplace[name].length == 1) delete characterReplace[name]
/**查找扩展里的同名武将 */
const sameCharacter = ((names) => [...new Set(names.filter((item, index) => names.indexOf(item) !== index))])(Object.keys(lib.hyyz.characters).map(name => name.split('_').pop()))
Object.assign(lib.characterReplace, characterReplace)


//——————————————整合卡牌信息——————————————//
const { card, skill, translate, list } = hyyzcards;
console.log(card, translate);
//skill、list不需要处理
for (let cardName in card) {//translate需要添加card里折叠的文字
	let values = card[cardName];
	if (Array.isArray(values)) {//hyyz_xxx_info: ['卡牌名', '卡牌描述', '卡牌引文']
		if (values[0]) translate[cardName.slice(0, cardName.length - 5)] = values[0]//hyyz_xxx
		if (values[1]) translate[cardName] = values[1]//hyyz_xxx_info
		if (values[2]) translate[cardName.slice(0, cardName.length - 5) + '_append'] = values[2]//hyyz_xxx_append
		delete card[cardName]
	} else if (typeof values == 'object') {//hyyz_xxx: {}
		values.audio = `ext:忽悠宇宙/asset/card/audio/${cardName}`
		values.fullskin && (values.image = `ext:忽悠宇宙/asset/card/image/${cardName}.png`);
		values.fullimage && (values.image = `ext:忽悠宇宙/asset/card/image/${cardName}.jpg`);
		if (values.type == 'equip' && values.enable) Object.assign(values, {
			enable: true,
			selectTarget: -1,
			filterTarget(card, player, target) {
				player == target && target.canEquip(card, true)
			},
			modTarget: true,
			allowMultiple: false,
			content() {
				//不存在处理区外的牌=全部都在处理区
				if (!card?.cards.some(card => get.position(card, true) !== "o")) target.equip(card);
			},
			toself: true,
		});
	}
}
//——————————————导入卡牌——————————————//
game.import('card', () => {
	/** @type { importCardConfig } */
	return {
		name: 'hyyzCard',
		connect: false,
		card: card,
		skill: skill,
		translate: translate,
		list: list
	}
});
lib.config.all.cards.splice(2, 0, 'hyyzCard');
lib.translate['hyyzCard_card_config'] = `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_hyyz.png" width="105.5" height="30">`;

