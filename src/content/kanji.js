// JLPT N5 kanji, grouped by theme.
// on: Sino-Japanese readings (katakana) · kun: native readings (hiragana, okurigana in brackets)
// ex: example words [spelling, reading, meaning]
export const KANJI_LISTS = [
  {
    id: "numbers",
    label: "Nombres et argent",
    kanji: [
      { k: "一", fr: "un", on: ["イチ", "イツ"], kun: ["ひと(つ)"], ex: [["一つ", "ひとつ", "un (objet)"], ["一月", "いちがつ", "janvier"]] },
      { k: "二", fr: "deux", on: ["ニ"], kun: ["ふた(つ)"], ex: [["二つ", "ふたつ", "deux (objets)"], ["二月", "にがつ", "février"]] },
      { k: "三", fr: "trois", on: ["サン"], kun: ["みっ(つ)"], ex: [["三つ", "みっつ", "trois (objets)"], ["三月", "さんがつ", "mars"]] },
      { k: "四", fr: "quatre", on: ["シ"], kun: ["よん", "よっ(つ)"], ex: [["四つ", "よっつ", "quatre (objets)"], ["四月", "しがつ", "avril"]] },
      { k: "五", fr: "cinq", on: ["ゴ"], kun: ["いつ(つ)"], ex: [["五つ", "いつつ", "cinq (objets)"], ["五月", "ごがつ", "mai"]] },
      { k: "六", fr: "six", on: ["ロク"], kun: ["むっ(つ)"], ex: [["六つ", "むっつ", "six (objets)"], ["六月", "ろくがつ", "juin"]] },
      { k: "七", fr: "sept", on: ["シチ"], kun: ["なな", "なな(つ)"], ex: [["七つ", "ななつ", "sept (objets)"], ["七月", "しちがつ", "juillet"]] },
      { k: "八", fr: "huit", on: ["ハチ"], kun: ["やっ(つ)"], ex: [["八つ", "やっつ", "huit (objets)"], ["八月", "はちがつ", "août"]] },
      { k: "九", fr: "neuf", on: ["キュウ", "ク"], kun: ["ここの(つ)"], ex: [["九つ", "ここのつ", "neuf (objets)"], ["九月", "くがつ", "septembre"]] },
      { k: "十", fr: "dix", on: ["ジュウ"], kun: ["とお"], ex: [["十", "とお", "dix (objets)"], ["十月", "じゅうがつ", "octobre"]] },
      { k: "百", fr: "cent", on: ["ヒャク"], kun: [], ex: [["百円", "ひゃくえん", "cent yens"]] },
      { k: "千", fr: "mille", on: ["セン"], kun: ["ち"], ex: [["千円", "せんえん", "mille yens"]] },
      { k: "万", fr: "dix mille", on: ["マン", "バン"], kun: [], ex: [["一万円", "いちまんえん", "dix mille yens"]] },
      { k: "円", fr: "yen, cercle", on: ["エン"], kun: ["まる(い)"], ex: [["百円", "ひゃくえん", "cent yens"]] },
      { k: "半", fr: "moitié", on: ["ハン"], kun: ["なか(ば)"], ex: [["半分", "はんぶん", "la moitié"]] }
    ]
  },
  {
    id: "time",
    label: "Le temps",
    kanji: [
      { k: "日", fr: "jour, soleil", on: ["ニチ", "ジツ"], kun: ["ひ", "か"], ex: [["日曜日", "にちようび", "dimanche"], ["毎日", "まいにち", "tous les jours"]] },
      { k: "月", fr: "lune, mois", on: ["ゲツ", "ガツ"], kun: ["つき"], ex: [["月曜日", "げつようび", "lundi"], ["一月", "いちがつ", "janvier"]] },
      { k: "火", fr: "feu", on: ["カ"], kun: ["ひ"], ex: [["火曜日", "かようび", "mardi"]] },
      { k: "水", fr: "eau", on: ["スイ"], kun: ["みず"], ex: [["水", "みず", "eau"], ["水曜日", "すいようび", "mercredi"]] },
      { k: "木", fr: "arbre", on: ["モク", "ボク"], kun: ["き"], ex: [["木", "き", "arbre"], ["木曜日", "もくようび", "jeudi"]] },
      { k: "金", fr: "or, argent", on: ["キン"], kun: ["かね"], ex: [["お金", "おかね", "argent"], ["金曜日", "きんようび", "vendredi"]] },
      { k: "土", fr: "terre", on: ["ド", "ト"], kun: ["つち"], ex: [["土曜日", "どようび", "samedi"]] },
      { k: "年", fr: "année", on: ["ネン"], kun: ["とし"], ex: [["今年", "ことし", "cette année"], ["毎年", "まいとし", "chaque année"]] },
      { k: "時", fr: "heure, moment", on: ["ジ"], kun: ["とき"], ex: [["時間", "じかん", "temps, durée"], ["時計", "とけい", "montre"]] },
      { k: "分", fr: "minute, partager", on: ["フン", "ブン"], kun: ["わ(かる)"], ex: [["五分", "ごふん", "cinq minutes"], ["分かる", "わかる", "comprendre"]] },
      { k: "週", fr: "semaine", on: ["シュウ"], kun: [], ex: [["週末", "しゅうまつ", "week-end"], ["毎週", "まいしゅう", "chaque semaine"]] },
      { k: "今", fr: "maintenant", on: ["コン", "キン"], kun: ["いま"], ex: [["今", "いま", "maintenant"], ["今日", "きょう", "aujourd'hui"]] },
      { k: "午", fr: "midi", on: ["ゴ"], kun: [], ex: [["午前", "ごぜん", "matin (a.m.)"], ["午後", "ごご", "après-midi"]] },
      { k: "毎", fr: "chaque", on: ["マイ"], kun: [], ex: [["毎日", "まいにち", "tous les jours"]] },
      { k: "間", fr: "intervalle, entre", on: ["カン", "ケン"], kun: ["あいだ", "ま"], ex: [["時間", "じかん", "temps, durée"]] }
    ]
  },
  {
    id: "people",
    label: "Personnes et corps",
    kanji: [
      { k: "人", fr: "personne", on: ["ジン", "ニン"], kun: ["ひと"], ex: [["人", "ひと", "personne"], ["日本人", "にほんじん", "Japonais"]] },
      { k: "男", fr: "homme", on: ["ダン", "ナン"], kun: ["おとこ"], ex: [["男の人", "おとこのひと", "homme"]] },
      { k: "女", fr: "femme", on: ["ジョ", "ニョ"], kun: ["おんな"], ex: [["女の人", "おんなのひと", "femme"]] },
      { k: "子", fr: "enfant", on: ["シ", "ス"], kun: ["こ"], ex: [["子供", "こども", "enfant"]] },
      { k: "父", fr: "père", on: ["フ"], kun: ["ちち"], ex: [["父", "ちち", "mon père"], ["お父さん", "おとうさん", "père"]] },
      { k: "母", fr: "mère", on: ["ボ"], kun: ["はは"], ex: [["母", "はは", "ma mère"], ["お母さん", "おかあさん", "mère"]] },
      { k: "友", fr: "ami", on: ["ユウ"], kun: ["とも"], ex: [["友達", "ともだち", "ami"]] },
      { k: "先", fr: "avant, précédent", on: ["セン"], kun: ["さき"], ex: [["先生", "せんせい", "professeur"]] },
      { k: "生", fr: "vie, naître", on: ["セイ", "ショウ"], kun: ["い(きる)", "う(まれる)"], ex: [["先生", "せんせい", "professeur"], ["学生", "がくせい", "étudiant"]] },
      { k: "名", fr: "nom", on: ["メイ", "ミョウ"], kun: ["な"], ex: [["名前", "なまえ", "nom, prénom"]] },
      { k: "目", fr: "œil", on: ["モク"], kun: ["め"], ex: [["目", "め", "œil"]] },
      { k: "耳", fr: "oreille", on: ["ジ"], kun: ["みみ"], ex: [["耳", "みみ", "oreille"]] },
      { k: "口", fr: "bouche", on: ["コウ", "ク"], kun: ["くち"], ex: [["口", "くち", "bouche"], ["入口", "いりぐち", "entrée"]] },
      { k: "手", fr: "main", on: ["シュ"], kun: ["て"], ex: [["手", "て", "main"]] },
      { k: "足", fr: "pied, jambe", on: ["ソク"], kun: ["あし"], ex: [["足", "あし", "pied, jambe"]] }
    ]
  },
  {
    id: "nature",
    label: "Nature",
    kanji: [
      { k: "山", fr: "montagne", on: ["サン"], kun: ["やま"], ex: [["山", "やま", "montagne"], ["富士山", "ふじさん", "mont Fuji"]] },
      { k: "川", fr: "rivière", on: ["セン"], kun: ["かわ"], ex: [["川", "かわ", "rivière"]] },
      { k: "天", fr: "ciel", on: ["テン"], kun: ["あま"], ex: [["天気", "てんき", "météo"]] },
      { k: "気", fr: "esprit, énergie", on: ["キ", "ケ"], kun: [], ex: [["天気", "てんき", "météo"], ["元気", "げんき", "en forme"]] },
      { k: "雨", fr: "pluie", on: ["ウ"], kun: ["あめ"], ex: [["雨", "あめ", "pluie"]] },
      { k: "花", fr: "fleur", on: ["カ"], kun: ["はな"], ex: [["花", "はな", "fleur"]] },
      { k: "魚", fr: "poisson", on: ["ギョ"], kun: ["さかな", "うお"], ex: [["魚", "さかな", "poisson"]] }
    ]
  },
  {
    id: "positions",
    label: "Positions et directions",
    kanji: [
      { k: "上", fr: "dessus, haut", on: ["ジョウ"], kun: ["うえ", "あ(がる)"], ex: [["上", "うえ", "dessus"]] },
      { k: "下", fr: "dessous, bas", on: ["カ", "ゲ"], kun: ["した", "さ(がる)"], ex: [["下", "した", "dessous"], ["地下鉄", "ちかてつ", "métro"]] },
      { k: "左", fr: "gauche", on: ["サ"], kun: ["ひだり"], ex: [["左", "ひだり", "gauche"]] },
      { k: "右", fr: "droite", on: ["ウ", "ユウ"], kun: ["みぎ"], ex: [["右", "みぎ", "droite"]] },
      { k: "中", fr: "milieu, dedans", on: ["チュウ"], kun: ["なか"], ex: [["中", "なか", "intérieur"], ["中国", "ちゅうごく", "Chine"]] },
      { k: "外", fr: "dehors", on: ["ガイ", "ゲ"], kun: ["そと"], ex: [["外", "そと", "dehors"], ["外国", "がいこく", "pays étranger"]] },
      { k: "前", fr: "devant, avant", on: ["ゼン"], kun: ["まえ"], ex: [["前", "まえ", "devant"], ["午前", "ごぜん", "matin (a.m.)"]] },
      { k: "後", fr: "derrière, après", on: ["ゴ", "コウ"], kun: ["うし(ろ)", "あと"], ex: [["後ろ", "うしろ", "derrière"], ["午後", "ごご", "après-midi"]] },
      { k: "東", fr: "est", on: ["トウ"], kun: ["ひがし"], ex: [["東京", "とうきょう", "Tokyo"], ["東", "ひがし", "est"]] },
      { k: "西", fr: "ouest", on: ["セイ", "サイ"], kun: ["にし"], ex: [["西", "にし", "ouest"]] },
      { k: "南", fr: "sud", on: ["ナン"], kun: ["みなみ"], ex: [["南", "みなみ", "sud"]] },
      { k: "北", fr: "nord", on: ["ホク"], kun: ["きた"], ex: [["北", "きた", "nord"]] }
    ]
  },
  {
    id: "qualities",
    label: "Qualités",
    kanji: [
      { k: "大", fr: "grand", on: ["ダイ", "タイ"], kun: ["おお(きい)"], ex: [["大きい", "おおきい", "grand"], ["大学", "だいがく", "université"]] },
      { k: "小", fr: "petit", on: ["ショウ"], kun: ["ちい(さい)", "こ"], ex: [["小さい", "ちいさい", "petit"]] },
      { k: "高", fr: "haut, cher", on: ["コウ"], kun: ["たか(い)"], ex: [["高い", "たかい", "haut, cher"], ["高校", "こうこう", "lycée"]] },
      { k: "安", fr: "bon marché, calme", on: ["アン"], kun: ["やす(い)"], ex: [["安い", "やすい", "bon marché"]] },
      { k: "長", fr: "long, chef", on: ["チョウ"], kun: ["なが(い)"], ex: [["長い", "ながい", "long"]] },
      { k: "新", fr: "nouveau", on: ["シン"], kun: ["あたら(しい)"], ex: [["新しい", "あたらしい", "nouveau"], ["新聞", "しんぶん", "journal"]] },
      { k: "古", fr: "vieux", on: ["コ"], kun: ["ふる(い)"], ex: [["古い", "ふるい", "vieux"]] },
      { k: "白", fr: "blanc", on: ["ハク"], kun: ["しろ", "しろ(い)"], ex: [["白い", "しろい", "blanc"]] }
    ]
  },
  {
    id: "actions",
    label: "Actions (verbes)",
    kanji: [
      { k: "見", fr: "voir", on: ["ケン"], kun: ["み(る)"], ex: [["見る", "みる", "voir"]] },
      { k: "聞", fr: "entendre, écouter", on: ["ブン", "モン"], kun: ["き(く)"], ex: [["聞く", "きく", "écouter"], ["新聞", "しんぶん", "journal"]] },
      { k: "読", fr: "lire", on: ["ドク"], kun: ["よ(む)"], ex: [["読む", "よむ", "lire"]] },
      { k: "書", fr: "écrire", on: ["ショ"], kun: ["か(く)"], ex: [["書く", "かく", "écrire"], ["辞書", "じしょ", "dictionnaire"]] },
      { k: "話", fr: "parler, histoire", on: ["ワ"], kun: ["はな(す)", "はなし"], ex: [["話す", "はなす", "parler"], ["電話", "でんわ", "téléphone"]] },
      { k: "言", fr: "dire", on: ["ゲン", "ゴン"], kun: ["い(う)"], ex: [["言う", "いう", "dire"]] },
      { k: "語", fr: "langue, mot", on: ["ゴ"], kun: ["かた(る)"], ex: [["日本語", "にほんご", "japonais"], ["英語", "えいご", "anglais"]] },
      { k: "食", fr: "manger", on: ["ショク"], kun: ["た(べる)"], ex: [["食べる", "たべる", "manger"]] },
      { k: "飲", fr: "boire", on: ["イン"], kun: ["の(む)"], ex: [["飲む", "のむ", "boire"]] },
      { k: "行", fr: "aller", on: ["コウ", "ギョウ"], kun: ["い(く)"], ex: [["行く", "いく", "aller"], ["銀行", "ぎんこう", "banque"]] },
      { k: "来", fr: "venir", on: ["ライ"], kun: ["く(る)"], ex: [["来る", "くる", "venir"], ["来年", "らいねん", "l'an prochain"]] },
      { k: "出", fr: "sortir", on: ["シュツ"], kun: ["で(る)", "だ(す)"], ex: [["出る", "でる", "sortir"], ["出口", "でぐち", "sortie"]] },
      { k: "入", fr: "entrer", on: ["ニュウ"], kun: ["はい(る)", "い(れる)"], ex: [["入る", "はいる", "entrer"], ["入口", "いりぐち", "entrée"]] },
      { k: "休", fr: "se reposer", on: ["キュウ"], kun: ["やす(む)"], ex: [["休む", "やすむ", "se reposer"], ["休み", "やすみ", "vacances, congé"]] },
      { k: "買", fr: "acheter", on: ["バイ"], kun: ["か(う)"], ex: [["買う", "かう", "acheter"]] },
      { k: "会", fr: "rencontrer, réunion", on: ["カイ"], kun: ["あ(う)"], ex: [["会う", "あう", "rencontrer"], ["会社", "かいしゃ", "entreprise"]] }
    ]
  },
  {
    id: "places",
    label: "Lieux et choses",
    kanji: [
      { k: "学", fr: "étudier", on: ["ガク"], kun: ["まな(ぶ)"], ex: [["学生", "がくせい", "étudiant"], ["学校", "がっこう", "école"]] },
      { k: "校", fr: "école", on: ["コウ"], kun: [], ex: [["学校", "がっこう", "école"]] },
      { k: "社", fr: "société, sanctuaire", on: ["シャ"], kun: ["やしろ"], ex: [["会社", "かいしゃ", "entreprise"]] },
      { k: "国", fr: "pays", on: ["コク"], kun: ["くに"], ex: [["国", "くに", "pays"], ["外国", "がいこく", "pays étranger"]] },
      { k: "本", fr: "livre, origine", on: ["ホン"], kun: ["もと"], ex: [["本", "ほん", "livre"], ["日本", "にほん", "Japon"]] },
      { k: "電", fr: "électricité", on: ["デン"], kun: [], ex: [["電車", "でんしゃ", "train"], ["電話", "でんわ", "téléphone"]] },
      { k: "車", fr: "voiture, véhicule", on: ["シャ"], kun: ["くるま"], ex: [["車", "くるま", "voiture"], ["電車", "でんしゃ", "train"]] },
      { k: "駅", fr: "gare", on: ["エキ"], kun: [], ex: [["駅", "えき", "gare"]] },
      { k: "道", fr: "chemin, route", on: ["ドウ"], kun: ["みち"], ex: [["道", "みち", "chemin"]] },
      { k: "店", fr: "magasin", on: ["テン"], kun: ["みせ"], ex: [["店", "みせ", "magasin"]] },
      { k: "何", fr: "quoi", on: ["カ"], kun: ["なに", "なん"], ex: [["何", "なに", "quoi"]] }
    ]
  }
];
