// Beginner vocabulary (JLPT N5 level), grouped by theme.
// jp: usual spelling · kana: reading · fr: meaning
// ro (optional): rōmaji to display when the automatic one is not ideal · alt (optional): other accepted answers
export const VOCAB_LISTS = [
  {
    id: "greetings",
    label: "Salutations et politesse",
    words: [
      { jp: "おはようございます", kana: "おはようございます", fr: "bonjour (le matin)", ro: "ohayou gozaimasu" },
      { jp: "こんにちは", kana: "こんにちは", fr: "bonjour", ro: "konnichiwa" },
      { jp: "こんばんは", kana: "こんばんは", fr: "bonsoir", ro: "konbanwa" },
      { jp: "おやすみなさい", kana: "おやすみなさい", fr: "bonne nuit" },
      { jp: "さようなら", kana: "さようなら", fr: "au revoir" },
      { jp: "はじめまして", kana: "はじめまして", fr: "enchanté(e)" },
      { jp: "よろしくお願いします", kana: "よろしくおねがいします", fr: "ravi(e) de vous connaître", ro: "yoroshiku onegaishimasu" },
      { jp: "ありがとうございます", kana: "ありがとうございます", fr: "merci beaucoup", ro: "arigatou gozaimasu" },
      { jp: "どういたしまして", kana: "どういたしまして", fr: "de rien" },
      { jp: "すみません", kana: "すみません", fr: "excusez-moi, pardon" },
      { jp: "ごめんなさい", kana: "ごめんなさい", fr: "désolé(e)" },
      { jp: "いただきます", kana: "いただきます", fr: "bon appétit (avant de manger)" },
      { jp: "ごちそうさまでした", kana: "ごちそうさまでした", fr: "merci pour le repas", ro: "gochisousama deshita" },
      { jp: "はい", kana: "はい", fr: "oui" },
      { jp: "いいえ", kana: "いいえ", fr: "non" }
    ]
  },
  {
    id: "numbers",
    label: "Nombres",
    words: [
      { jp: "一", kana: "いち", fr: "un (1)" },
      { jp: "二", kana: "に", fr: "deux (2)" },
      { jp: "三", kana: "さん", fr: "trois (3)" },
      { jp: "四", kana: "よん", fr: "quatre (4)", alt: ["shi"] },
      { jp: "五", kana: "ご", fr: "cinq (5)" },
      { jp: "六", kana: "ろく", fr: "six (6)" },
      { jp: "七", kana: "なな", fr: "sept (7)", alt: ["shichi"] },
      { jp: "八", kana: "はち", fr: "huit (8)" },
      { jp: "九", kana: "きゅう", fr: "neuf (9)", alt: ["ku"] },
      { jp: "十", kana: "じゅう", fr: "dix (10)" },
      { jp: "百", kana: "ひゃく", fr: "cent (100)" },
      { jp: "千", kana: "せん", fr: "mille (1 000)" },
      { jp: "万", kana: "まん", fr: "dix mille (10 000)" }
    ]
  },
  {
    id: "people",
    label: "Personnes et famille",
    words: [
      { jp: "私", kana: "わたし", fr: "je, moi" },
      { jp: "あなた", kana: "あなた", fr: "tu, vous" },
      { jp: "人", kana: "ひと", fr: "personne" },
      { jp: "友達", kana: "ともだち", fr: "ami(e)" },
      { jp: "先生", kana: "せんせい", fr: "professeur" },
      { jp: "学生", kana: "がくせい", fr: "étudiant(e)" },
      { jp: "男の人", kana: "おとこのひと", fr: "homme", ro: "otoko no hito" },
      { jp: "女の人", kana: "おんなのひと", fr: "femme", ro: "onna no hito" },
      { jp: "子供", kana: "こども", fr: "enfant" },
      { jp: "家族", kana: "かぞく", fr: "famille" },
      { jp: "母", kana: "はは", fr: "(ma) mère" },
      { jp: "父", kana: "ちち", fr: "(mon) père" },
      { jp: "お母さん", kana: "おかあさん", fr: "mère (de quelqu'un d'autre)" },
      { jp: "お父さん", kana: "おとうさん", fr: "père (de quelqu'un d'autre)" },
      { jp: "兄", kana: "あに", fr: "(mon) grand frère" },
      { jp: "姉", kana: "あね", fr: "(ma) grande sœur" },
      { jp: "弟", kana: "おとうと", fr: "(mon) petit frère" },
      { jp: "妹", kana: "いもうと", fr: "(ma) petite sœur" }
    ]
  },
  {
    id: "time",
    label: "Le temps",
    words: [
      { jp: "今", kana: "いま", fr: "maintenant" },
      { jp: "今日", kana: "きょう", fr: "aujourd'hui" },
      { jp: "明日", kana: "あした", fr: "demain" },
      { jp: "昨日", kana: "きのう", fr: "hier" },
      { jp: "朝", kana: "あさ", fr: "matin" },
      { jp: "昼", kana: "ひる", fr: "midi, journée" },
      { jp: "夜", kana: "よる", fr: "soir, nuit" },
      { jp: "毎日", kana: "まいにち", fr: "tous les jours" },
      { jp: "時間", kana: "じかん", fr: "temps, durée" },
      { jp: "週末", kana: "しゅうまつ", fr: "week-end" },
      { jp: "今年", kana: "ことし", fr: "cette année" },
      { jp: "月曜日", kana: "げつようび", fr: "lundi" },
      { jp: "火曜日", kana: "かようび", fr: "mardi" },
      { jp: "水曜日", kana: "すいようび", fr: "mercredi" },
      { jp: "木曜日", kana: "もくようび", fr: "jeudi" },
      { jp: "金曜日", kana: "きんようび", fr: "vendredi" },
      { jp: "土曜日", kana: "どようび", fr: "samedi" },
      { jp: "日曜日", kana: "にちようび", fr: "dimanche" }
    ]
  },
  {
    id: "food",
    label: "Nourriture et boissons",
    words: [
      { jp: "ご飯", kana: "ごはん", fr: "riz cuit, repas" },
      { jp: "パン", kana: "パン", fr: "pain" },
      { jp: "水", kana: "みず", fr: "eau" },
      { jp: "お茶", kana: "おちゃ", fr: "thé" },
      { jp: "コーヒー", kana: "コーヒー", fr: "café" },
      { jp: "牛乳", kana: "ぎゅうにゅう", fr: "lait" },
      { jp: "肉", kana: "にく", fr: "viande" },
      { jp: "魚", kana: "さかな", fr: "poisson" },
      { jp: "野菜", kana: "やさい", fr: "légumes" },
      { jp: "果物", kana: "くだもの", fr: "fruits" },
      { jp: "卵", kana: "たまご", fr: "œuf" },
      { jp: "寿司", kana: "すし", fr: "sushi" },
      { jp: "朝ご飯", kana: "あさごはん", fr: "petit-déjeuner" },
      { jp: "晩ご飯", kana: "ばんごはん", fr: "dîner" }
    ]
  },
  {
    id: "places",
    label: "Lieux",
    words: [
      { jp: "家", kana: "いえ", fr: "maison" },
      { jp: "学校", kana: "がっこう", fr: "école" },
      { jp: "駅", kana: "えき", fr: "gare" },
      { jp: "店", kana: "みせ", fr: "magasin" },
      { jp: "会社", kana: "かいしゃ", fr: "entreprise" },
      { jp: "病院", kana: "びょういん", fr: "hôpital" },
      { jp: "図書館", kana: "としょかん", fr: "bibliothèque" },
      { jp: "銀行", kana: "ぎんこう", fr: "banque" },
      { jp: "レストラン", kana: "レストラン", fr: "restaurant" },
      { jp: "トイレ", kana: "トイレ", fr: "toilettes" },
      { jp: "国", kana: "くに", fr: "pays" },
      { jp: "日本", kana: "にほん", fr: "Japon" },
      { jp: "フランス", kana: "フランス", fr: "France" },
      { jp: "ここ", kana: "ここ", fr: "ici" },
      { jp: "そこ", kana: "そこ", fr: "là (près de toi)" },
      { jp: "あそこ", kana: "あそこ", fr: "là-bas" }
    ]
  },
  {
    id: "objects",
    label: "Objets du quotidien",
    words: [
      { jp: "本", kana: "ほん", fr: "livre" },
      { jp: "ペン", kana: "ペン", fr: "stylo" },
      { jp: "かばん", kana: "かばん", fr: "sac" },
      { jp: "傘", kana: "かさ", fr: "parapluie" },
      { jp: "時計", kana: "とけい", fr: "montre, horloge" },
      { jp: "車", kana: "くるま", fr: "voiture" },
      { jp: "自転車", kana: "じてんしゃ", fr: "vélo" },
      { jp: "電話", kana: "でんわ", fr: "téléphone" },
      { jp: "テレビ", kana: "テレビ", fr: "télévision" },
      { jp: "机", kana: "つくえ", fr: "bureau (meuble)" },
      { jp: "椅子", kana: "いす", fr: "chaise" },
      { jp: "新聞", kana: "しんぶん", fr: "journal" },
      { jp: "お金", kana: "おかね", fr: "argent" },
      { jp: "これ", kana: "これ", fr: "ceci (près de moi)" },
      { jp: "それ", kana: "それ", fr: "cela (près de toi)" },
      { jp: "あれ", kana: "あれ", fr: "cela, là-bas" }
    ]
  },
  {
    id: "adjectives",
    label: "Adjectifs",
    words: [
      { jp: "大きい", kana: "おおきい", fr: "grand" },
      { jp: "小さい", kana: "ちいさい", fr: "petit" },
      { jp: "高い", kana: "たかい", fr: "haut, cher" },
      { jp: "安い", kana: "やすい", fr: "bon marché" },
      { jp: "新しい", kana: "あたらしい", fr: "nouveau, neuf" },
      { jp: "古い", kana: "ふるい", fr: "vieux, ancien" },
      { jp: "いい", kana: "いい", fr: "bon, bien" },
      { jp: "悪い", kana: "わるい", fr: "mauvais" },
      { jp: "暑い", kana: "あつい", fr: "chaud (temps)" },
      { jp: "寒い", kana: "さむい", fr: "froid (temps)" },
      { jp: "美味しい", kana: "おいしい", fr: "délicieux" },
      { jp: "楽しい", kana: "たのしい", fr: "amusant, agréable" },
      { jp: "元気", kana: "げんき", fr: "en forme" },
      { jp: "好き", kana: "すき", fr: "aimé, qu'on aime" }
    ]
  },
  {
    id: "verbs",
    label: "Verbes (forme polie ます)",
    words: [
      { jp: "行きます", kana: "いきます", fr: "aller", note: "行く" },
      { jp: "来ます", kana: "きます", fr: "venir", note: "来る" },
      { jp: "帰ります", kana: "かえります", fr: "rentrer", note: "帰る" },
      { jp: "食べます", kana: "たべます", fr: "manger", note: "食べる" },
      { jp: "飲みます", kana: "のみます", fr: "boire", note: "飲む" },
      { jp: "見ます", kana: "みます", fr: "voir, regarder", note: "見る" },
      { jp: "聞きます", kana: "ききます", fr: "écouter, demander", note: "聞く" },
      { jp: "読みます", kana: "よみます", fr: "lire", note: "読む" },
      { jp: "書きます", kana: "かきます", fr: "écrire", note: "書く" },
      { jp: "話します", kana: "はなします", fr: "parler", note: "話す" },
      { jp: "買います", kana: "かいます", fr: "acheter", note: "買う" },
      { jp: "起きます", kana: "おきます", fr: "se lever", note: "起きる" },
      { jp: "寝ます", kana: "ねます", fr: "dormir, se coucher", note: "寝る" },
      { jp: "します", kana: "します", fr: "faire", note: "する" },
      { jp: "勉強します", kana: "べんきょうします", fr: "étudier", note: "勉強する", ro: "benkyou shimasu" },
      { jp: "分かります", kana: "わかります", fr: "comprendre", note: "分かる" }
    ]
  },
  {
    id: "questions",
    label: "Mots interrogatifs",
    words: [
      { jp: "何", kana: "なに", fr: "quoi", alt: ["nan"] },
      { jp: "誰", kana: "だれ", fr: "qui" },
      { jp: "どこ", kana: "どこ", fr: "où" },
      { jp: "いつ", kana: "いつ", fr: "quand" },
      { jp: "いくら", kana: "いくら", fr: "combien (prix)" },
      { jp: "どれ", kana: "どれ", fr: "lequel" },
      { jp: "どうして", kana: "どうして", fr: "pourquoi" }
    ]
  }
];
