# 3 Kisilik Sunum ve Commit Plani

## Kisi 1: Proje kurulumu, veritabani ve kullanici girisi

Anlatacagi dosyalar:

- `server.js`
- `db.js`
- `sql/init.sql`
- `routes/authRoutes.js`
- `services/mail.js`
- `middleware/auth.js`

Anlatacagi konular:

- Express uygulamasinin baslatilmasi ve middleware sirasi
- MySQL baglantisi ve tablolarin iliskileri
- Market/consumer kaydi
- Email dogrulama kodu
- Login, logout ve session mantigi
- `requireMarket` ve `requireConsumer` ile rol kontrolu

Commit onerisi:

```bash
git add server.js db.js sql/init.sql routes/authRoutes.js services/mail.js middleware/auth.js package.json package-lock.json .gitignore
git commit -m "Add app setup, database schema, and auth flow"
```

## Kisi 2: Market paneli ve urun yonetimi

Anlatacagi dosyalar:

- `routes/marketRoutes.js`
- `config/upload.js`
- `views/market-dashboard.ejs`
- `views/market-profile-edit.ejs`
- `views/market-product-add.ejs`
- `views/market-product-edit.ejs`

Anlatacagi konular:

- Market dashboard ekraninda kendi urunlerini listeleme
- Market profil guncelleme
- Urun ekleme, urun duzenleme, urun silme
- Multer ile urun fotografi yukleme
- Son kullanma tarihi gecen urunleri isaretleme

Commit onerisi:

```bash
git add routes/marketRoutes.js config/upload.js views/market-dashboard.ejs views/market-profile-edit.ejs views/market-product-add.ejs views/market-product-edit.ejs
git commit -m "Add market profile and product management"
```

## Kisi 3: Consumer tarafi, arama ve sepet

Anlatacagi dosyalar:

- `routes/consumerRoutes.js`
- `services/cart.js`
- `public/js/cart.js`
- `views/consumer-home.ejs`
- `views/consumer-profile-edit.ejs`
- `views/cart.ejs`

Anlatacagi konular:

- Consumer ana sayfasinda urun arama
- Sadece ayni sehirdeki ve tarihi gecmemis urunleri gosterme
- Ilceye gore onceliklendirme
- Sepete ekleme
- Sepet miktar guncelleme ve toplam fiyat hesabi
- Satin alma sonrasi stok azaltma veya urunu silme

Commit onerisi:

```bash
git add routes/consumerRoutes.js services/cart.js public/js/cart.js views/consumer-home.ejs views/consumer-profile-edit.ejs views/cart.ejs
git commit -m "Add consumer search, cart, and purchase flow"
```

## Sunum Sirasi

1. Kisi 1 once genel sistem mimarisini ve kullanici girisini anlatsin.
2. Kisi 2 market tarafina gecip urunlerin nasil sisteme girdigini anlatsin.
3. Kisi 3 consumer tarafinda bu urunlerin nasil arandigini, sepete eklendigini ve satin alindigini anlatsin.

Bu sira mantikli cunku sistem once kullanici ve veritabaniyla basliyor, sonra market urun ekliyor, en son consumer bu urunleri satin aliyor.
