//导入库
import { lib, game, ui, get, ai, _status } from "../../noname.js";
//导入扩展基本参数
import { ARENAREADY, PREPARE, PRECONTENT, CONTENT, CONFIG, HELP } from './main.js'
//设定为扩展包
export const type = "extension";
//导出基本函数
export default async function () {
    //测试工具
    //game.saveExtensionConfig("忽悠宇宙", "changelog", undefined);
    //把文件里的忽悠宇宙信息导入
    const ext_info = await lib.init.promises.json(`${lib.assetURL}extension/忽悠宇宙/info.json`);
    const minNonameVersion = ext_info.minNonameVersion;
    //检测版本，如果不合适提示玩家关闭扩展
    if (lib.version && lib.config.HYYZ_setCompareVersion != minNonameVersion) {
        game.saveConfig('HYYZ_setCompareVersion', minNonameVersion);//检测过了
        const compareVersion = (target, normal) => {
            const targets = target.split('.').map(Number),//1.9.25['1', '9', '25']
                normals = normal.split('.').map(Number); //1.10.14.1['1', '10', '14', '1']
            const count = Math.max(targets.length, normals.length);//遍历尽可能多的版本号数字
            for (let i = 0; i < count; i++) {
                const target = targets[i] || 0, normal = normals[i] || 0;//数量不够默认为0
                if (target < normal) return false;
                if (normal > target) return true;
            }
            return true;//完全相同
        }
        if (!compareVersion(lib.version, minNonameVersion)) {
            const ret = confirm(`当前无名杀版本为${lib.version}，低于《忽悠宇宙》建议版本（${minNonameVersion}），请尽快更新无名杀！
                    点击确认，关闭扩展（再次开启本扩展，将不会弹窗）
                    点击取消，继续游玩（可能会导致游戏出现严重问题）`);
            if (ret) game.saveConfig('extension_忽悠宇宙_enable', false);//关闭扩展
        }
    }
    //返回本体属性
    return {
        name: "忽悠宇宙",
        editable: true,
        connect: false,
        arenaReady: ARENAREADY,
        prepare: PREPARE,
        precontent: PRECONTENT,
        content: CONTENT,
        help: HELP,
        config: CONFIG,
        package: {
            intro: `　　　<img src="${lib.assetURL}extension/忽悠宇宙/other/hyyzSort_hyyz.png" width="105.5" height="30"><br>` + ext_info.intro,//介绍
            diskURL: ext_info.diskURL,//联系方式
            author: ext_info.author,//作者
            version: `扩展版本：<span class='thundertext'>${ext_info.version}</span>`,//版本号
            //2026年为版本4
            forumURL: "",
        }, files: { "character": [], "card": [], "skill": [], "audio": [] },
        onremove() {
            game.saveConfig('HYYZ_setCompareVersion', undefined);//检测版本是否落后-赋值为最低支持无名杀版本
        },
    }
};