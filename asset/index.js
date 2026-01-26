'use strict';
import { lib, game, ui, get, ai, _status } from '../../../noname.js';

import { characters as characters2023, dynamicTranslates as dynamicTranslates2023 } from './character2023.js'
import { characters as characters2024, dynamicTranslates as dynamicTranslates2024 } from './character2024.js'
import { characters as characters2025, dynamicTranslates as dynamicTranslates2025 } from './character2025.js'
import { characters as characters2026, dynamicTranslates as dynamicTranslates2026 } from './character2026.js'
import { characters as characters202403, dynamicTranslates as dynamicTranslates202403 } from './character202403.js'
//import { hyyzcards } from './card.js';
import hyyzvoices from './voices.js';
//——————————————链接台词对应的语音——————————————//
for (let characterName in hyyzvoices) {
	lib.translate[`#${characterName}:die`] = hyyzvoices[characterName];//筛选角色名
	lib.translate[`#ext:忽悠宇宙/asset/character/audio/${characterName}`] = hyyzvoices[characterName];//筛选技能
}

//——————————————整合武将信息——————————————//
const allCharacter = { ...characters2023, ...characters2024, ...characters2025, ...characters2026, ...characters202403 }
//初始化一些常用属性
const characters = {}, characterTitles = {}, characterIntros = {}, skills = {}, translates = {}, characterSorts = {};
//依次过滤、筛选、解码导入的信息

/**武将包名 */
let sortName;
if (lib.config['extension_忽悠宇宙_type'] == '1') {//按角色来源分类
	Object.assign(translates, {
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
		hyyzSort_b3: [],
		hyyzSort_ys: [],
		hyyzSort_xt: [],
		hyyzSort_zzz: [],
		hyyzSort_other: [],
	})
	sortName = function (name) {
		if (name.startsWith('meng_')) return 'hyyzSort_b3'
		return 'hyyzSort_' + (['b3', 'ys', 'zzz', 'xt'].includes(name.split('_')[1]) ? name.split('_')[1] : 'other');
	}
}
for (let data in allCharacter) {//键：日期
	if (lib.config['extension_忽悠宇宙_type'] == '0') {//按圆梦时间分类
		if (/^\d+$/.test(data)) {//日期 202408
			sortName = 'hyyz_' + data
			translates[sortName] = `20${data.slice(0, 2)}.${data.slice(2)}圆梦`;//hyyz_202408: 2024.08圆梦
			translates[sortName + '_info'] = `20${data.slice(0, 2)}.${data.slice(2, 4)}圆梦，由群赛投票、语音交流评选得到`;//hyyz_202408_info: xxxxxxx
		}
		else if (data == '永世乐土') sortName = 'hyyz_2403'//没有info，因为本身是加入到hyyz_2403的
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
			if (typeof sortName == 'string') characterSorts[sortName].add(name)
			else characterSorts[sortName(name)].add(name)
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
				if (temps[1].includes('-')) {
					characterTitles[name] = `<span class="firetext">${temps[1].split('-')[0]}</span><br><span class="greentext">${temps[1].split('-')[1]}</span>`
				} else {
					characterTitles[name] = `<span class="greentext">${temps[1]}</span>`;
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
//存入库
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
		dynamicTranslate: { ...dynamicTranslates2023, ...dynamicTranslates2024, ...dynamicTranslates202403, ...dynamicTranslates2025, ...dynamicTranslates2026 },
		characterSubstitute: {
			hyyz_ys_furina: [
				["mengjvxing_achieve", ["ext:忽悠宇宙/other/skin/image/hyyz_ys_furina/mengjvxing_achieve.jpg"]],
				["mengjvxing_fail", ["ext:忽悠宇宙/other/skin/image/hyyz_ys_furina/mengjvxing_fail.jpg"]],
			],
			hyyz_ys_leidianying: [
				['mengwumeng', ['ext:忽悠宇宙/other/skin/image/hyyz_ys_leidianying/mengwumeng.jpg']],
				['hyyz_ys_leidianying', ['die:hyyz_ys_leidianying', 'img:hyyz_ys_leidianying']],
			],
			meng_caomao: [
				["meng_caomao_shadow", ["ext:忽悠宇宙/other/skin/image/meng_caomao/meng_caomao_shadow.jpg",]],
				["meng_caomao_dead", ["ext:忽悠宇宙/other/skin/image/meng_caomao/meng_caomao_dead.jpg",]],
			],
			meng_bonisi: [
				["mengrongyan", ["ext:忽悠宇宙/other/skin/image/meng_bonisi/mengrongyan.jpg",]],
				["meng_bonisi", ["img:meng_bonisi",]],
			],
		},
	}
})
lib.config.all.characters.splice(3, 0, 'hyyzCharacter');
lib.translate['hyyzCharacter_character_config'] = `<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_hyyz.png" width="105.5" height="30">`;

