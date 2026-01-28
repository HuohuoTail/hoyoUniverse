declare type hyyzBuff = 'hyyzBuff_zhongshang' | 'hyyzBuff_xuruo' | 'hyyzBuff_jiansu' | 'hyyzBuff_jingu' | 'hyyzBuff_jiuchan' | 'hyyzBuff_dongjie' | 'hyyzBuff_zhuoshao' | 'hyyzBuff_chudian' | 'hyyzBuff_lieshang' | 'hyyzBuff_fenghua' | 'hyyzBuff_jiasu'
declare type hyyzType = 'buff' | 'debuff' | 'dotdebuff';
declare type weakness = 'fire' | 'thunder' | 'hyyz_physical' | 'hyyz_wind' | 'ice' | 'hyyz_quantum' | 'hyyz_imaginary'
declare type paths = 'hyyz_kaituo' | 'hyyz_huimie' | 'hyyz_xunlie' | 'hyyz_zhishi' | 'hyyz_tongxie' | 'hyyz_xvwu' | 'hyyz_cunhu' | 'hyyz_fengrao' | 'hyyz_jiyi'
declare module 'lib' {
	interface Get {
		/**获取若干有花色有点数的影
		 * @param count 数量
		 */
		hyyzYing(count: Number): Card[]
		/**创造一个窗口用于显示
		 * - 只是{@link hyyzIntroduce}的狗而已
		 * @param str 被显示的字符串
		 * @param id 被显示窗口的标号
		 */
		hyyztips(str: String, id: Number): undefined
		/**弹窗显示注释
		 * 返回的字符串有超链接效果
		 * @param key 被解释的关键词
		 * @param str 解释的内容
		 */
		hyyzIntroduce(key: String, str: String): String
		/**中央区的牌
		 */
		centralCards(): Card[]
		/**牌的延时/即时类型
		 * @param obj 牌
		 * @param method 延时锦囊也算trick
		 * @param player 来源
		 */
		timetype(obj: Card | String, method?: 'trick', player?: Player | false): 'time' | 'notime'
		//——————————————hyyzBuff——————————————//
		/**获取一组严格类型的buff
		 * @param arg 严格的buff类型
		 * @example
		 * get.hyyzBuff()//所有buff
		 * get.hyyzBuff('dotdebuff')//只有灼烧、触电等dotdebuff
		 * get.hyyzBuff('dotdebuff','debuff')//所有dotdebuff+debuff
		 */
		hyyzBuff(arg?: hyyzType): hyyzBuff[]
		/**获取一个buff的buff类型
		 * @param buff buff名
		 * @param dot 分离dotdebuff？默认false（即二者均返回debuff）
		 * @example
		 * get.hyyztype('hyyzBuff_jiasu')//'buff'
		 * get.hyyztype('hyyzBuff_chudian')//'debuff'
		 * get.hyyztype('hyyzBuff_chudian',true)//'dotdebuff'
		 */
		hyyztype(buff: hyyzBuff, dot?: Boolean): 'debuff' | 'buff' | 'dotdebuff' | undefined
		/**获取一个buff名或一组buff名对应的属性 字符串
		 * @param buff buff名
		 * @example
		 * get.hyyznature('abc')//''
		 * get.hyyznature('hyyzBuff_chudian')//'thunder'
		 * get.hyyznature(['hyyzBuff_chudian'])//'thunder'
		 * get.hyyznature('hyyzBuff_chudian','hyyzBuff_fenghua')//'thunder|hyyz_wind'
		 */
		hyyznature(buff: hyyzBuff | hyyzBuff[]): String | ''
		/**获取一个buff名或一组buff名对应的属性 组
		 * @param buff buff名或buff组
		 * @example
		 * get.hyyznatureList('abc')//[]
		 * get.hyyznatureList('hyyzBuff_chudian')//['thunder']
		 * get.hyyznatureList(['hyyzBuff_chudian'])//['thunder']
		 * get.hyyznatureList('hyyzBuff_chudian','hyyzBuff_fenghua')//['thunder','hyyz_wind']
		 */
		hyyznatureList(buff: hyyzBuff | hyyzBuff[]): String[]
		//——————————————weakness——————————————//
		/**获取弱点数组
		 * @param out 排除的弱点或数组，可以写多个参数
		 * @example
		 * get.weakness()//所有弱点
		 * get.weakness('hyyz_wind')//除hyyz_wind外的所有弱点
		 * get.weakness('hyyz_wind','ice')//除hyyz_wind、ice外的所有弱点
		 * get.weakness(['hyyz_wind'])//除hyyz_wind、ice外的所有弱点
		 */
		weakness(out?: String | String[]): String[]
		/**获取特定角色的弱点（固定参数）
		 * @param filter 想要查找的角色，可以是函数也可以是角色组或角色，默认是全部
		 * @param toArray 是否输出弱点数组，默认输出Map对象
		 * @example
		 * get.currentWeakenss(player)//Map([player,['ice']])
		 * get.currentWeakenss(player,true)//['ice']
		 * get.currentWeakenss(current=>current!=player)//除你外的其他角色的弱点
		 */
		currentWeakenss(filter?: Function | Player | Player[], toArray?: Boolean): Map<Player, weakness> | String[]
	}
	interface Player {
		/**创造一个输入框
		 * @param prompt 输入内容
		 */
		inputText(prompt: String): GameEventPromise
		/**隐匿
		 * @param noChange 不改变体力和上限？，默认于隐匿结束后复原
		 */
		hyyzUnseen(noChange: Boolean): GameEventPromise
		/**调整手牌至x
		 * 用弃牌和摸牌调整
		 * 会return bool、cards、num（可以负）、type（draw、chooseToDiscard）
		 * 详情见国战镜流
		 * @param num 目标
		 * @param position 区域，目前不可用，默认手牌
		 */
		changeCardTo(num: Number, position: 'h' | 'e' | 'j' | 's' | 'x'): GameEventPromise
		/**可以发起单挑
		 */
		canDantiao(): Boolean
		/**对一名角色发起单挑
		 * @param target 目标角色
		 */
		chooseDantiao(target: Player): GameEventPromise
		/**进行一次座次排布
		 * 我榻馍莱依拉！
		 */
		chooseToSwapSeat(): GameEventPromise
		/**点燃一些牌
		 * @param cards 一个区域/一堆牌/一张牌
		 */
		hyyzDianran(cards: Card | Card[] | 'h' | 'e' | 'j' | 's' | 'x'): GameEventPromise

		//——————————————hyyzBuff——————————————//
		/**获取一个人的所有buff存有情况
		 * @param type 输入类型
		 * @param dot 是否严格模式，默认false。若为true，debuff和dotdebuff视为不同类型
		 * @param isNum 是否输出具体层数，默认为true（非dot默认1层）
		 * @example
		 * 返回值类型
		 * player.gethyyzBuff()//所有类型且为{a:2}的形式
		 * player.gethyyzBuff(null,null,false)//所有类型且为{a:true}的形式
		 * 输入类型
		 * player.gethyyzBuff('buff')//buff
		 * player.gethyyzBuff('debuff')//debuff和dotdebuff
		 * player.gethyyzBuff('debuff',true)//debuff
		 * player.gethyyzBuff('dotdebuff')//dotdebuff
		 */
		gethyyzBuff(type: hyyzType, dot: Boolean, isNum: Boolean): Map<String, Number | Boolean>
		/**拥有buff的数量
		 * @param buff buff名 buff类型 输入类型时用法和{@link gethyyzBuff()}相同
		 * @param dot 严格模式，默认false，debuff包含dotdebuff
		 * @example 
		 * 输入buff名
		 * player.counthyyzBuff('hyyzBuff_chudian')//1
		 */
		counthyyzBuff(buff: hyyzBuff | hyyzType, dot: Boolean): Number
		/**是否拥有buff
		 * @param buff buff名 buff类型 输入类型时用法和{@link gethyyzBuff()}、{@link counthyyzBuff()}相同
		 * @param dot 严格模式，默认false，debuff包含dotdebuff
		 */
		hashyyzBuff(buff: hyyzBuff | hyyzType, dot: Boolean): Boolean
		/**获得buff
		 * 所有参数都不是必须的，可以输入任意个buff名|类型，也可以输入对象具体安排层数，但不接受数组
		 * @param buff buff名 buff类型
		 * @param addBuff 对象
		 * @example
		 * player.addhyyzBuff()//获得所有三种类型的buff各1层
		 * player.addhyyzBuff('debuff')//获得所有debuff各1层
		 * player.addhyyzBuff('hyyzBuff_jiasu')//获得加速1层
		 * player.addhyyzBuff('hyyzBuff_chudian')//获得1层触电
		 * player.addhyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang')//获得1层触电和1层裂伤
		 * player.addhyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang',{hyyzBuff_chudian:2})//获得2层触电和1层裂伤
		 */
		addhyyzBuff(buff?: hyyzBuff | hyyzBuff[] | hyyzType | hyyzType[], addBuff?: Object): GameEventPromise
		/**移除buff
		 * 所有参数都不是必须的，可以输入任意个buff名|类型，也可以输入对象具体安排层数，但不接受数组
		 * @param buff buff名 buff类型组
		 * @param removeBuff 对象
		 * @example
		 * player.removehyyzBuff()//无事发生
		 * player.removehyyzBuff('hyyzBuff_jiasu')//移除加速
		 * player.removehyyzBuff('debuff')//移除所有debuff各一层
		 * player.removehyyzBuff('hyyzBuff_chudian')//移除1层触电
		 * player.removehyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang')//移除1层触电和1层裂伤
		 * player.removehyyzBuff('hyyzBuff_chudian','hyyzBuff_lieshang',{hyyzBuff_chudian:2})//移除2层触电和1层裂伤
		 */
		removehyyzBuff(buff?: hyyzBuff | hyyzBuff[] | hyyzType | hyyzType[], removeBuff?: Object): GameEventPromise
		/**更改buff
		 * 只接受两个对象，是增加和移除的必经函数
		 * @param addBuff 增加的buff
		 * @param removeBuff 移除的buff
		 */
		changehyyzBuff(addBuff: Object, removeBuff: Object): GameEventPromise
		/**是否可以净化武将牌
		 * 始终会净化普通debuff
		 * @param arg no+不检查的项目 | 额外考虑的项目
		 * - `nolink`: 无视横置
		 * - `noturnover`: 无视翻面
		 * - `nojudge`: 无视判定
		 * - `nodot`: 无视dotbuff
		 * - `nofire`: 无视点燃牌
		 */
		canhyyzJinghua(arg: 'nolink' | 'noturnover' | 'nojudge' | 'buff' | 'nodot' | 'nofire'): Boolean
		/**净化武将牌
		 * @param arg no+不考虑的项目 | 额外考虑的项目
		 * - `nolink`: 不解除横置
		 * - `noturnover`: 不考虑翻面
		 * - `nojudge`: 不清除判定
		 * - `nodot`: 不清除dotbuff
		 * - `nofire`: 不会清除点燃
		 * @example
		 * player.hyyzJinghua('nolink');//不解除横置
		 * @returns {GameEventPromise}
		 */
		hyyzJinghua(arg: 'nolink' | 'noturnover' | 'nojudge' | 'buff' | 'nodot' | 'nofire'): GameEventPromise
		/**是否可以驱散正面buff
		 */
		canhyyzQvsan(): Boolean
		/**驱散正面buff
		 */
		hyyzQvsan(): GameEventPromise
		hyyzBang(arg: 'all' | 'clear'): GameEventPromise
		//——————————————weakness——————————————//
		/**获取角色的所有弱点组
		 */
		getWeakness(): weakness[]
		/**角色的弱点数目
		 * - {@link getWeakness}的长度
		 */
		countWeakness(): Number
		/**是否有弱点
		 * 可以输入任意个弱点或弱点组
		 * @param arg 
		 * @example
		 * player.hasWeakness()
		 * player.hasWeakness('ice')
		 * player.hasWeakness('ice','fire')
		 * player.hasWeakness(['ice'])
		 */
		hasWeakness(arg: weakness | weakness[]): Boolean
		/**是否是弱点最多
		 * @param only 是否检测唯一性
		 */
		isMaxWeakness(only: Boolean): Boolean
		/**是否是弱点最少
		 * @param only 是否检测唯一性
		 */
		isMinWeakness(only: Boolean): Boolean
		/**暴露弱点（无序参数）
		 * @param num 至少暴露的数量，仅数组较少时会随机补充至num
		 * @param addWeakness 优先保证暴露的弱点，可以输入任意个弱点或弱点组
		 * @param log 是否log，其实只对移除有用
		 * @example
		 * player.addWeakness()//随机暴露一个弱点并log
		 * player.addWeakness('ice',true)//暴露冰弱点并log
		 * player.addWeakness('ice',false)//暴露冰弱点但不log
		 * player.addWeakness(['ice'])//暴露冰弱点并log
		 * player.addWeakness(2,'ice')//暴露冰弱点，然后随机暴露一个其他弱点，并log
		 */
		addWeakness(num: Number, addWeakness: weakness | weakness[], log: Boolean): GameEventPromise
		/**隐藏弱点（无序）
		 * 比add少一个num参数
		 * @param removeWeakness 必须隐藏的弱点，可以任意个弱点或弱点数组
		 * @param log 是否log，true的话移除会触发击破debuff
		 * @example
		 * player.removeWeakness()//随机移除一个弱点并log
		 * player.removeWeakness('ice')//隐藏冰弱
		 */
		removeWeakness(removeWeakness: weakness | weakness[], log: Boolean): GameEventPromise
		/**改变弱点（无序）
		 * @param addWeakness 增加的弱点
		 * @param removeWeakness 移除的弱点
		 * @param log log，true的话移除会触发击破debuff
		 * @example
		 * player.changeWeakness(list)//增加list的弱点
		 * player.changeWeakness(list,array)//增加list的弱点，移除array的弱点
		 */
		changeWeakness(addWeakness: weakness[], removeWeakness?: weakness[], log?: Boolean): GameEventPromise
	}
	interface Game {
		/**检测一个扩展是否开启
		 * @param str 扩展名
		 */
		hyyz_hasExtension(str: String): Boolean
		/**查找拥有这个技能的武将名
		 * @param skill 目标技能
		 */
		getSkillOwner(skill: String): Player[]
	}
}