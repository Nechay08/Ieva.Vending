export const products = [
  ['atomizer', 'travel', 'Refillable Perfume Atomizer', 'Uzpildāms smaržu izsmidzinātājs', 'Мини-атомайзер для духов'],
  ['roller', 'daily', 'Reusable Portable Lint Roller', 'Atkārtoti lietojams apģērba rullītis', 'Многоразовый мини-ролик для одежды'],
  ['mat', 'beauty', 'Silicone Makeup Brush Cleaning Mat', 'Silikona paklājiņš grima otu tīrīšanai', 'Силиконовый коврик для очистки кистей'],
  ['jewelry', 'travel', 'Mini Travel Jewelry Organizer', 'Ceļojumu rotaslietu kārbiņa', 'Мини-органайзер для украшений'],
  ['wax', 'beauty', 'Hair Flyaway Wax Stick', 'Matu vasks nepaklausīgām šķipsnām', 'Стик для приглаживания волос'],
  ['capsule', 'daily', 'Mini Keychain Pill Holder', 'Mini kapsula atslēgu piekariņam', 'Мини-капсула для таблеток и мелочей'],
  ['curler', 'beauty', 'Mini Portable Eyelash Curler', 'Mini skropstu atliecējs', 'Мини-щипцы для завивки ресниц'],
  ['patches', 'beauty', 'Reusable Silicone Under Eye Patches', 'Atkārtoti lietojami silikona plāksteri zem acīm', 'Многоразовые силиконовые патчи под глаза'],
  ['sponge', 'travel', 'Ventilated Makeup Sponge Travel Case', 'Ventilējams grima sūkļa futrālis', 'Вентилируемый футляр для спонжа'],
  ['mirror', 'beauty', 'Portable LED Makeup Mirror', 'Pārnēsājams grima spogulis ar LED apgaismojumu', 'Карманное зеркало с подсветкой'],
  ['sealer', 'daily', 'Mini Portable Bag Sealer', 'Pārnēsājama mini ierīce iepakojumu aizkausēšanai', 'Мини-устройство для запаивания упаковок'],
  ['fan', 'travel', 'Foldable Mini Handheld Fan', 'Salokāms rokas mini ventilators', 'Складной ручной мини-вентилятор'],
  ['tote', 'daily', 'Foldable Shopping Bag Keychain', 'Salokāma iepirkumu soma ar atslēgu piekariņu', 'Складная сумка-брелок для покупок'],
  ['bottles', 'travel', 'Travel Silicone Toiletry Bottles', 'Silikona ceļojumu pudelītes kosmētikai', 'Мягкие дорожные флаконы для косметики'],
  ['brush', 'beauty', 'Foldable Pocket Hairbrush with Mirror', 'Salokāma kabatas matu suka ar spoguli', 'Складная расчёска со встроенным зеркалом']
].map(([id, category, en, lv, ru]) => ({ id, category, name: { en, lv, ru } }))

export const vending = [
  ['Sanitary Pads', 'Higiēniskās paketes', 'Прокладки'],
  ['Tampons', 'Tamponi', 'Тампоны'],
  ['Disposable Mini Toothbrushes', 'Vienreizlietojamas mini zobu birstes', 'Одноразовые мини-зубные щётки'],
  ['Dental Floss Picks', 'Zobu diega kociņi', 'Зубная нить с зубочисткой'],
  ['Chewing Gum', 'Košļājamā gumija', 'Жевательная резинка'],
  ['Hair Ties', 'Matu gumijas', 'Резинки для волос']
]
