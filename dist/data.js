export const VERSION = 1;
export const SIZE = 56;
export const CHAINS = {
  paper: { name:'信笺', color:'#6b9293', names:['信纸碎片','折好的信纸','素色信封','远方来信','旅行手记','岛屿档案','云海回忆录'] },
  wax: { name:'封蜡', color:'#bf725e', names:['蜡粒','小蜡块','封口蜡','铜柄印章','花纹封印','邮局纹章','航路之印'] },
  wood: { name:'木作', color:'#a98252', names:['小树枝','松木条','打磨木板','木制小匣','旅行木箱','折叠船舱','云杉飞舟'] },
  metal: { name:'机械', color:'#658583', names:['小螺帽','铜齿轮','传动零件','小型机芯','发条引擎','风力推进器','云海动力核'] },
  herb: { name:'草本', color:'#799368', names:['嫩芽','薄荷叶','香草束','草本香囊','森林药剂','苔风精华','长青之息'] },
  bloom: { name:'花园', color:'#c18b98', names:['小花苞','铃兰花','一束鲜花','编织花环','瓶中花园','四季花篮','不凋之花'] },
  grain: { name:'烘焙', color:'#c49550', names:['麦粒','一小袋面粉','松软面团','牛角面包','野餐面包篮','庆典蛋糕','丰收宴席'] },
  tea: { name:'茶饮', color:'#9d855d', names:['茶叶','小茶包','温热清茶','柑橘红茶','午后茶壶','茶会礼盒','云端下午茶'] },
  glass: { name:'观测', color:'#759fb0', names:['玻璃碎片','透亮镜片','铜框放大镜','观星单筒','折叠望远镜','星象仪','天穹观测台'] },
  star: { name:'星光', color:'#b89c59', names:['微光','星星碎片','星砂小瓶','星光提灯','旋转星图','银河灯盏','不落的星辰'] },
  thread: { name:'织物', color:'#a080a1', names:['棉絮','一卷细线','柔软布片','手织围巾','拼布披肩','风帆','彩虹云帆'] },
  music: { name:'旋律', color:'#7699a0', names:['小铜片','风铃片','清脆风铃','手摇音乐盒','鲸歌唱片','云海留声机','远方交响曲'] }
};
export const GENERATORS = [
  {id:'post', name:'老式邮袋', short:'邮袋', chains:['paper','wax'], chapter:0, slot:0, color:'#789b97', desc:'落款、封蜡，以及还没说出口的话。'},
  {id:'bench', name:'木作工具箱', short:'工坊', chains:['wood','metal'], chapter:0, slot:6, color:'#bd9663', desc:'把旧零件修成通往远方的船。'},
  {id:'garden', name:'苔风花圃', short:'花圃', chains:['herb','bloom'], chapter:1, slot:49, color:'#859e72', desc:'每一朵花，都记得风来过的方向。'},
  {id:'kitchen', name:'云朵烤箱', short:'厨房', chains:['grain','tea'], chapter:2, slot:55, color:'#c9956e', desc:'热面包的香味，就是返航的信号。'},
  {id:'scope', name:'观星行李箱', short:'观星', chains:['glass','star'], chapter:3, slot:21, color:'#7f92af', desc:'收集星星，为夜航的人留一盏灯。'},
  {id:'loom', name:'风铃织机', short:'织坊', chains:['thread','music'], chapter:4, slot:34, color:'#a98d9b', desc:'将雨声织进帆里，让鲸歌陪伴远行。'}
];
export const CHAPTERS = [
  { name:'旧邮局', subtitle:'第一封信，从这里出发', color:'#729b94', resident:'阿芦', role:'实习信使', avatar:'bird', letter:'致新来的邮局长：\n云海已经安静很久了。但今天，信箱里长出了一朵花。也许，还有人在等我们的信。\n——阿芦', projects:[
    {name:'修好门前的信箱', text:'锈住的投信口重新打开了。第一封信，来自风里的老朋友。', coins:65, req:[['paper',3],['wood',3]]},
    {name:'点亮窗边的邮灯', text:'黄昏里，邮灯亮起。远处有一只纸鸟，终于找到了回家的方向。', coins:110, req:[['wax',3],['metal',3]]},
    {name:'升起第一面航旗', text:'阿芦从屋顶挥手：“苔风岛回应了！他们说，薄荷还在长。”', coins:160, req:[['paper',4],['wood',4]]}
  ]},
  { name:'苔风岛', subtitle:'把春天装进信封', color:'#8eaa79', resident:'苔婆婆', role:'森林园丁', avatar:'bunny', letter:'邮局长：\n这些年，我一直替没有回来的信使浇花。花开了又谢，地址却从没改。\n你愿意把这一束，送到海的另一边吗？\n——苔婆婆', projects:[
    {name:'搭起藤蔓小桥', text:'桥的另一头是一座花圃。苔婆婆把备用钥匙，轻轻放进你的手心。', coins:210, req:[['wood',4],['herb',3]]},
    {name:'整理种子图书馆', text:'每袋种子都有名字，每个名字背后，都有一个想念春天的人。', coins:270, req:[['paper',4],['bloom',4]]},
    {name:'建成花园驿站', text:'第一船鲜花出发了。麦穗港的面包师说，他要用整个清晨来迎接。', coins:330, req:[['herb',5],['wax',4]]}
  ]},
  { name:'麦穗港', subtitle:'信里有面包的香气', color:'#c4a16d', resident:'麦叔', role:'港口面包师', avatar:'bear', letter:'嘿，新朋友：\n我的炉子每天都多烤一个面包。以前是给老信使的，后来成了习惯。\n这一次，你来的时候，一定是热的。\n——麦叔', projects:[
    {name:'修复港口烤炉', text:'木柴噼啪作响。麦叔终于不用对着冷掉的炉子，回忆面包的香气。', coins:380, req:[['metal',4],['grain',4]]},
    {name:'摆好长桌茶会', text:'有人带花，有人带信。长桌的空位，一个接一个坐满了。', coins:450, req:[['tea',4],['bloom',4]]},
    {name:'开通晨光补给线', text:'补给船驶入云雾。一封来自星灯屿的信说：“我们的夜晚，太长了。”', coins:520, req:[['grain',5],['wood',5]]}
  ]},
  { name:'星灯屿', subtitle:'为夜航的人留一盏灯', color:'#8c95b2', resident:'小北', role:'年轻观星员', avatar:'fox', letter:'你好：\n爷爷留下的星图少了一角。我每晚对照天空，却一直找不到最后一颗星。\n也许它没有消失，只是需要有人重新点亮。\n——小北', projects:[
    {name:'擦亮旧望远镜', text:'镜片后的星空，比记忆里还亮。小北笑着说：“原来不是星星不见了。”', coins:590, req:[['glass',4],['metal',4]]},
    {name:'拼回遗失的星图', text:'星图的最后一角，画的不是星星，而是每一座亮着灯的邮局。', coins:660, req:[['star',4],['paper',5]]},
    {name:'开启夜航信标', text:'星光落在船头。织雨镇终于听见了久违的汽笛声。', coins:740, req:[['star',5],['glass',5]]}
  ]},
  { name:'织雨镇', subtitle:'雨声，也可以寄给你', color:'#ac91aa', resident:'织织', role:'风帆织匠', avatar:'cat', letter:'远方的邮局长：\n镇上总下雨，我们就把雨声织进布里。晴天的时候，展开它，还能听见故乡。\n我想做一面足够大的帆，去看看鲸鱼。\n——织织', projects:[
    {name:'唤醒风铃织机', text:'第一匹布从织机上落下来，像一段柔软的雨。', coins:820, req:[['thread',4],['metal',5]]},
    {name:'装好雨声音乐盒', text:'音乐盒响起时，麦叔说，他想起了小时候屋檐下的下午。', coins:900, req:[['music',4],['wood',5]]},
    {name:'缝制远航云帆', text:'来自五座岛的布片，缝成了一面帆。现在，向鲸鸣灯塔出发。', coins:1000, req:[['thread',5],['bloom',5]]}
  ]},
  { name:'鲸鸣灯塔', subtitle:'所有远方，终于有了回音', color:'#729baf', resident:'灯塔爷爷', role:'最后一位守灯人', avatar:'owl', letter:'孩子：\n我守着这座灯塔，不是因为船会来。\n是因为只要灯还亮着，迷路的人就知道，世界上还有一个地方在等他。\n——守灯人', projects:[
    {name:'修好潮汐留声机', text:'鲸歌穿过云海。那是一首老信使们，在长途航行中哼过的歌。', coins:1100, req:[['music',5],['glass',5]]},
    {name:'点亮归航主灯', text:'六座岛的灯，一盏接一盏亮起。曾经断开的航线，重新连成了星座。', coins:1250, req:[['star',6],['metal',5]]},
    {name:'寄出云海的回信', text:'你把最后一封信放进邮袋。上面没有遥远的地址，只写着：\n“致每一个等待的人——我们一直都在。”\n云海的故事还会继续，而你，已经成为了他们的归途。', coins:1500, req:[['paper',6],['thread',6],['music',5]]}
  ]}
];
export const CUSTOMERS = [
  ['阿芦','bird','这次，也带上我的问候吧。'],['苔婆婆','bunny','慢慢来，花会等你的。'],['麦叔','bear','做完这单，一起喝杯热茶。'],['小北','fox','今天的风，适合出发。'],['织织','cat','想把好天气寄给远方。'],['灯塔爷爷','owl','谢谢你，又送来一份牵挂。']
];
export const ACHIEVEMENTS = [
  {id:'first', name:'第一声回响', desc:'完成第一份委托', type:'orders', goal:1, reward:30},
  {id:'merge50', name:'熟练的小手', desc:'累计合成 50 次', type:'merges', goal:50, reward:70},
  {id:'order20', name:'街坊的老朋友', desc:'完成 20 份委托', type:'orders', goal:20, reward:120},
  {id:'discover30', name:'万物收藏家', desc:'发现 30 种物品', type:'discovered', goal:30, reward:150},
  {id:'build6', name:'春日航线', desc:'完成 6 项建设', type:'built', goal:6, reward:180},
  {id:'merge500', name:'合成的魔法', desc:'累计合成 500 次', type:'merges', goal:500, reward:200},
  {id:'top', name:'小小奇迹', desc:'合成任意 7 级物品', type:'maxLevel', goal:7, reward:300},
  {id:'orders100', name:'云海老邮差', desc:'完成 100 份委托', type:'orders', goal:100, reward:350},
  {id:'discover70', name:'云海博物学家', desc:'发现 70 种物品', type:'discovered', goal:70, reward:400},
  {id:'ending', name:'远方有回音', desc:'完成全部 18 项建设', type:'built', goal:18, reward:600}
];
export const itemName = i => CHAINS[i.c]?.names[i.l - 1] || '';
export const itemKey = i => `${i.c}:${i.l}`;
