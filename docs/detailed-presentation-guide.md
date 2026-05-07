# Detayli 3 Kisilik Sunum Kilavuzu

Bu dosya, projeyi hocaya anlatirken herkesin kendi bolumunu net sekilde sunabilmesi icin hazirlandi. Sira su sekilde ilerlesin:

1. Kisi 1: Proje kurulumu, veritabani, kayit/giris/dogrulama
2. Kisi 2: Market paneli ve urun yonetimi
3. Kisi 3: Consumer tarafi, arama, sepet ve satin alma

Projenin genel konusu: Marketlerin son kullanma tarihi yaklasan urunleri indirimli sekilde sisteme ekledigi, consumer kullanicilarin ise kendi sehirlerindeki uygun urunleri arayip sepete ekleyerek satin alabildigi bir web uygulamasi.

## Genel Proje Mimarisi

Projede Node.js, Express.js, EJS, MySQL, express-session, bcrypt, express-validator, multer ve nodemailer kullaniliyor.

- `server.js`: Express uygulamasini baslatir, middleware'leri ayarlar ve route dosyalarini baglar.
- `db.js`: MySQL connection pool olusturur.
- `sql/init.sql`: Veritabani tablolarini olusturur.
- `routes/authRoutes.js`: Kayit, giris, cikis ve email dogrulama islemleri.
- `routes/marketRoutes.js`: Market profili ve urun yonetimi.
- `routes/consumerRoutes.js`: Consumer ana sayfa, arama, profil, sepet ve satin alma.
- `middleware/auth.js`: Rol bazli sayfa koruma fonksiyonlari.
- `services/mail.js`: Dogrulama kodu ve email gonderme.
- `services/cart.js`: Sepet toplam tutar hesabi.
- `config/upload.js`: Urun fotografi yukleme ayari.
- `public/js/cart.js`: Sepet sayfasindaki dinamik islemler.

## Kisi 1: Proje Kurulumu, Veritabani ve Kullanici Girisi

### Sunuma Baslangic Cumlesi

"Ben projenin temel kurulumunu, veritabani baglantisini ve kullanici kayit/giris sistemini anlatacagim. Uygulama Express uzerinden calisiyor, veriler MySQL'de tutuluyor ve kullanici rolleri market ve consumer olarak ayriliyor."

### Anlatilacak Dosyalar

- `server.js`
- `db.js`
- `sql/init.sql`
- `routes/authRoutes.js`
- `services/mail.js`
- `middleware/auth.js`

### `server.js` Ne Yapar?

Bu dosya uygulamanin giris noktasidir.

Anlatilacak noktalar:

- `express` import edilir ve `app` olusturulur.
- `dotenv.config()` ile `.env` icindeki email bilgileri okunur.
- `app.set("view engine", "ejs")` ile EJS template motoru ayarlanir.
- `express.static("public")` ile CSS, JS ve upload edilen gorseller public hale gelir.
- `express.urlencoded` form verilerini okumak icin kullanilir.
- `express.json` JSON body okumak icin kullanilir.
- `express-session` kullanici giris bilgisini session'da saklar.
- `authRoutes`, `marketRoutes`, `consumerRoutes` uygulamaya baglanir.
- `app.listen` server'i `localhost:3000` uzerinden baslatir.

Hocaya anlatim:

"Server dosyasinda artik butun kodlar tek yerde degil. Route dosyalarini ayirdik. Bu sayede auth, market ve consumer kisimlari daha okunabilir oldu."

### `db.js` Ne Yapar?

`mysql2/promise` ile MySQL connection pool olusturur.

Onemli alanlar:

- `host: "localhost"`: MySQL localde calisiyor.
- `user: "std"` ve `password: "std"`: Docker compose icindeki MySQL kullanicisi.
- `database: "test"`: Kullanilan veritabani.
- `connectionLimit: 10`: Ayni anda 10 baglantiya kadar izin verir.

Hocaya anlatim:

"Pool kullanmamizin sebebi her sorguda yeni baglanti acmak yerine mevcut baglantilari verimli kullanmaktir."

### `sql/init.sql` Tablolari

#### `users`

Market ve consumer kullanicilarini tutar.

Alanlar:

- `id`: Primary key.
- `role`: `market` veya `consumer`.
- `email`: Unique kullanici emaili.
- `password_hash`: Bcrypt ile hashlenmis sifre.
- `name`: Market adi veya consumer adi.
- `city`, `district`: Konum bilgisi.
- `is_verified`: Email dogrulandi mi?
- `created_at`: Kayit tarihi.

#### `products`

Marketlerin ekledigi urunleri tutar.

Alanlar:

- `market_id`: Urunu ekleyen market.
- `title`: Urun adi.
- `stock`: Stok miktari.
- `normal_price`: Normal fiyat.
- `discounted_price`: Indirimli fiyat.
- `expiration_date`: Son kullanma tarihi.
- `image`: Urun gorseli.

#### `cart_items`

Consumer sepetindeki urunleri tutar.

Alanlar:

- `consumer_id`: Sepetin sahibi consumer.
- `product_id`: Sepetteki urun.
- `quantity`: Miktar.
- `UNIQUE (consumer_id, product_id)`: Ayni urun sepette tekrar tekrar satir olarak eklenmesin diye.

#### `verification_codes`

Email dogrulama kodlarini tutar.

Alanlar:

- `user_id`: Dogrulanacak kullanici.
- `code`: 6 haneli dogrulama kodu.
- `created_at`: Kodun olusturulma zamani.

Hocaya anlatim:

"Tablolarda foreign key kullandik. Ornegin bir market silinirse o marketin urunleri de cascade ile silinir."

### `middleware/auth.js` Fonksiyonlari

#### `requireMarket(req, res, next)`

Market sayfalarini korur.

Calisma mantigi:

- Session'da kullanici yoksa login sayfasina yollar.
- Kullanici varsa ama role `market` degilse yine login sayfasina yollar.
- Kullanici market ise `next()` ile route devam eder.

Nerede kullanilir?

- `/market`
- `/market/profile/edit`
- `/market/products/add`
- `/market/products/:id/edit`
- `/market/products/:id/delete`

#### `requireConsumer(req, res, next)`

Consumer sayfalarini korur.

Calisma mantigi:

- Session'da kullanici yoksa login sayfasina yollar.
- Role `consumer` degilse login sayfasina yollar.
- Consumer ise `next()` ile route devam eder.

Nerede kullanilir?

- `/consumer`
- `/consumer/profile/edit`
- `/cart`
- `/cart/add/:productId`
- `/cart/update/:cartItemId`
- `/cart/remove/:cartItemId`
- `/cart/purchase`

Hocaya gelebilecek soru:

"Neden middleware kullandiniz?"

Cevap:

"Ayni rol kontrolunu her route icinde tekrar yazmamak icin middleware kullandik. Boylece kod tekrari azaldi ve sayfa guvenligi merkezi hale geldi."

### `services/mail.js` Fonksiyonlari

#### `transporter`

Nodemailer ile Gmail uzerinden email gondermek icin olusturulur.

- `EMAIL_USER`: Gonderici mail.
- `EMAIL_PASS`: Gmail app password.

#### `generateVerificationCode()`

6 haneli rastgele dogrulama kodu uretir.

Mantik:

- `Math.random()` ile rastgele sayi uretilir.
- 100000 ile 999999 arasina cekilir.
- String'e cevrilir.

#### `sendVerificationEmail(email, code)`

Kullanicinin email adresine dogrulama kodu yollar.

Parametreler:

- `email`: Alici email.
- `code`: Gonderilecek dogrulama kodu.

Hocaya anlatim:

"Kayit olduktan sonra kullanici direkt aktif olmuyor. Once dogrulama kodu uretiliyor, veritabanina kaydediliyor ve email olarak gonderiliyor."

### `routes/authRoutes.js` Route'lari

#### `GET /`

Ana sayfayi acar.

- Kullanici login ise bilgileri gonderilir.
- Login degilse `user: null` gonderilir.

#### `GET /db-test`

MySQL baglantisini test eder.

- `SELECT NOW()` calistirir.
- DB'nin cevap verip vermedigini gosterir.

#### `GET /tables-test`

Tablolarin olusup olusmadigini test eder.

- `SHOW TABLES` sorgusu calisir.

#### `GET /register`

Kayit secim sayfasini acar.

#### `GET /register/market`

Market kayit formunu acar.

#### `GET /register/consumer`

Consumer kayit formunu acar.

#### `POST /register/market`

Market kaydini yapar.

Adimlar:

- Email, name, password, city, district validasyonu yapilir.
- Ayni email var mi diye `users` tablosuna bakilir.
- Sifre bcrypt ile hashlenir.
- Kullanici `role = market` olarak eklenir.
- Dogrulama kodu olusturulur.
- Kod `verification_codes` tablosuna eklenir.
- Email gonderilir.
- Kullanici `/verify/:userId` sayfasina yonlendirilir.

#### `POST /register/consumer`

Consumer kaydini yapar.

Market kaydi ile ayni mantikta calisir, tek fark:

- `role = consumer`
- Name mesaji "Full name" olarak gecer.

#### `GET /verify/:userId`

Dogrulama sayfasini acar.

Adimlar:

- `userId` URL'den alinir.
- En son dogrulama kodu veritabanindan cekilir.
- Kod yoksa hata mesaji verilir.
- Kod varsa verify sayfasi render edilir.

#### `POST /verify/:userId`

Kullanicinin girdigi kodu kontrol eder.

Adimlar:

- Girilen kod alinir.
- Veritabanindaki en son kodla karsilastirilir.
- Kod yanlissa hata ile sayfa tekrar acilir.
- Kod dogruysa `users.is_verified = 1` yapilir.
- Kullanilan kod silinir.
- Login sayfasina yonlendirilir.

#### `GET /login`

Login formunu acar.

#### `POST /login`

Kullanici girisini yapar.

Adimlar:

- Email ile kullanici aranir.
- Kullanici yoksa hata verir.
- Bcrypt ile sifre kontrol edilir.
- Email dogrulanmadiysa girise izin verilmez.
- Kullanici bilgileri session'a yazilir.
- Role market ise `/market`, consumer ise `/consumer` sayfasina yonlendirilir.

Session'a yazilan bilgiler:

- `id`
- `role`
- `email`
- `name`
- `city`
- `district`

#### `GET /logout`

Session'i siler ve login sayfasina yollar.

### Kisi 1 Kapanis Cumlesi

"Benim anlattigim kisim sistemin temelini olusturuyor. Kullanici kayit oluyor, emailini dogruluyor, giris yapiyor ve role gore market ya da consumer tarafina yonlendiriliyor."

## Kisi 2: Market Paneli ve Urun Yonetimi

### Sunuma Baslangic Cumlesi

"Ben market kullanicisinin sisteme urun ekleme, urunlerini listeleme, profilini guncelleme ve urunlerini yonetme kismini anlatacagim."

### Anlatilacak Dosyalar

- `routes/marketRoutes.js`
- `config/upload.js`
- `views/market-dashboard.ejs`
- `views/market-profile-edit.ejs`
- `views/market-product-add.ejs`
- `views/market-product-edit.ejs`

### `config/upload.js` Ne Yapar?

Multer ile urun fotografi yuklemeyi ayarlar.

#### `storage`

Yuklenen dosyanin nereye ve hangi isimle kaydedilecegini belirler.

- `destination`: Dosyalar `public/uploads` klasorune gider.
- `filename`: Dosya adi `Date.now() + "-" + originalname` olur.

Bu sayede ayni isimli dosyalarin cakisma ihtimali azalir.

#### `upload`

Multer instance'idir.

Nerede kullanilir?

- `upload.single("image")`

Bu ifade formdan gelen tek bir `image` dosyasini alir.

### `routes/marketRoutes.js` Route'lari

#### `GET /market`

Market dashboard sayfasini acar.

Adimlar:

- Market id session'dan alinir.
- Sadece o markete ait urunler cekilir.
- `expiration_date < CURDATE()` ile urun gecmis mi hesaplanir.
- Urunler son kullanma tarihine gore siralanir.
- `market-dashboard.ejs` render edilir.

Hocaya anlatim:

"Market sadece kendi urunlerini gorebilir. Bunu sorguda `WHERE market_id = ?` ile sagliyoruz."

#### `GET /market/profile/edit`

Market profil duzenleme sayfasini acar.

Adimlar:

- Session'daki market id ile kullanici bilgileri cekilir.
- Role kontrolu sorguda da `role = 'market'` ile desteklenir.
- Kullanici bulunamazsa login'e yonlendirilir.

#### `POST /market/profile/edit`

Market profilini gunceller.

Adimlar:

- Email, name, city, district validasyonu yapilir.
- Ayni email baska kullanicida var mi kontrol edilir.
- Password alani bos degilse yeni sifre hashlenir.
- Password bos ise sadece email, name, city, district guncellenir.
- Session bilgileri de guncellenir.
- Market dashboard'a yonlendirilir.

Hocaya gelebilecek soru:

"Neden session bilgilerini tekrar guncelliyorsunuz?"

Cevap:

"Kullanici adini veya lokasyonunu degistirirse session'daki eski bilgiler kalmasin diye guncelliyoruz. Boylece sayfalarda yeni bilgiler gorunur."

#### `GET /market/products/add`

Urun ekleme formunu acar.

#### `POST /market/products/add`

Yeni urun ekler.

Adimlar:

- Market kontrolu `requireMarket` ile yapilir.
- `upload.single("image")` ile fotograf alinir.
- Title bos mu kontrol edilir.
- Stock en az 1 mi kontrol edilir.
- Normal ve indirimli fiyat 0'dan buyuk mu kontrol edilir.
- Expiration date girilmis mi kontrol edilir.
- Fotograf yoksa hata verilir.
- Hata yoksa urun `products` tablosuna eklenir.
- Image path `/uploads/dosyaadi` olarak kaydedilir.

Anlatilacak onemli nokta:

"Gorsel dosyasi veritabanina direkt binary olarak yazilmiyor. Dosya klasore kaydediliyor, veritabanina sadece path yaziliyor."

#### `GET /market/products/:id/edit`

Urun duzenleme formunu acar.

Adimlar:

- URL'den `productId` alinir.
- Session'dan `marketId` alinir.
- Urun hem id hem market_id ile aranir.
- Baska marketin urunu ise bulunamaz ve dashboard'a doner.
- Urun bulunursa form acilir.

#### `POST /market/products/:id/edit`

Urunu gunceller.

Adimlar:

- Once urun gercekten bu markete ait mi kontrol edilir.
- Form validasyonu yapilir.
- Yeni gorsel yuklendiyse image path degisir.
- Yeni gorsel yoksa eski image korunur.
- Title, stock, fiyatlar, tarih ve image guncellenir.
- Dashboard'a donulur.

Hocaya gelebilecek soru:

"Baska market URL'den id degistirerek urun duzenleyebilir mi?"

Cevap:

"Hayir. Sorguda `WHERE id = ? AND market_id = ?` kullandigimiz icin sadece kendi urununu duzenleyebilir."

#### `POST /market/products/:id/delete`

Urunu siler.

Adimlar:

- `productId` URL'den alinir.
- `marketId` session'dan alinir.
- Sadece o markete ait urun silinir.
- Dashboard'a donulur.

### Market View Dosyalari

#### `market-dashboard.ejs`

Marketin urunlerini listeler.

Gosterilen bilgiler:

- Urun resmi
- Urun adi
- Stok
- Normal fiyat
- Indirimli fiyat
- Son kullanma tarihi
- Expired etiketi
- Edit ve Delete butonlari

#### `market-profile-edit.ejs`

Marketin profilini guncelledigi formdur.

Alanlar:

- Email
- Market name
- City
- District
- Password

Password bos birakilirsa sifre degismez.

#### `market-product-add.ejs`

Yeni urun ekleme formudur.

Alanlar:

- Title
- Stock
- Normal price
- Discounted price
- Expiration date
- Image

#### `market-product-edit.ejs`

Urun duzenleme formudur.

Ekstra olarak mevcut urun fotografini preview olarak gosterir.

### Kisi 2 Kapanis Cumlesi

"Market tarafinda temel amac marketin kendi urunlerini guvenli sekilde yonetmesi. Urunler market id ile baglandigi icin her market sadece kendi urunleri uzerinde islem yapabiliyor."

## Kisi 3: Consumer, Arama, Sepet ve Satin Alma

### Sunuma Baslangic Cumlesi

"Ben consumer kullanicisinin urun arama, sepete ekleme, sepeti guncelleme ve satin alma akisini anlatacagim."

### Anlatilacak Dosyalar

- `routes/consumerRoutes.js`
- `services/cart.js`
- `public/js/cart.js`
- `views/consumer-home.ejs`
- `views/consumer-profile-edit.ejs`
- `views/cart.ejs`

### `services/cart.js` Fonksiyonu

#### `calculateGrandTotal(consumerId)`

Sepetteki toplam tutari hesaplar.

Adimlar:

- Consumer id ile `cart_items` tablosundan urunler cekilir.
- `products` tablosu ile join yapilir.
- Her urun icin `discounted_price * quantity` hesaplanir.
- Tum urunlerin toplami `grandTotal` olarak dondurulur.

Nerede kullanilir?

- Sepet miktari guncellenince.
- Urun sepetten silinince.

Hocaya anlatim:

"Toplam tutar client tarafindan degil server tarafindan hesaplanir. Boylece fiyat manipule edilmez."

### `routes/consumerRoutes.js` Route'lari

#### `GET /consumer`

Consumer ana sayfasini acar ve urun arama yapar.

Adimlar:

- Consumer bilgisi session'dan alinir.
- Query string'den `keyword` ve `page` alinir.
- Page size 4 olarak belirlenir.
- Keyword bos degilse arama yapilir.
- Sadece consumer ile ayni sehirdeki marketlerin urunleri listelenir.
- Son kullanma tarihi gecmis urunler listelenmez.
- Stogu 0 olan urunler listelenmez.
- Consumer ile ayni ilcedeki marketler once gosterilir.
- Urunler son kullanma tarihine gore siralanir.
- Sayfalama icin toplam urun sayisi hesaplanir.

Onemli SQL mantigi:

- `p.title LIKE ?`: Urun adina gore arama.
- `m.city = ?`: Ayni sehir filtresi.
- `p.expiration_date >= CURDATE()`: Tarihi gecmemis urun.
- `p.stock > 0`: Stokta olan urun.
- `CASE WHEN m.district = ? THEN 0 ELSE 1 END`: Ayni ilceyi one alma.

Hocaya anlatim:

"Consumer sadece kendi sehrindeki uygun urunleri gorur. Ayni ilcedeki marketler once gelir, boylece lokasyon avantaji saglanir."

#### `GET /consumer/profile/edit`

Consumer profil duzenleme sayfasini acar.

#### `POST /consumer/profile/edit`

Consumer profilini gunceller.

Market profil guncelleme ile ayni mantiktadir:

- Validasyon yapilir.
- Email baska hesapta var mi kontrol edilir.
- Password doluysa hashlenip guncellenir.
- Password bos ise sifre ayni kalir.
- Session bilgileri yenilenir.

#### `POST /cart/add/:productId`

Urunu sepete ekler.

Adimlar:

- Consumer id session'dan alinir.
- Product id URL'den alinir.
- Urun consumer ile ayni sehirde mi kontrol edilir.
- Urun tarihi gecmemis mi kontrol edilir.
- Urun stokta var mi kontrol edilir.
- Urun sepette yoksa yeni satir eklenir.
- Urun sepette varsa ve miktar stoktan azsa quantity 1 artirilir.
- Sepet sayfasina yonlendirilir.

Hocaya gelebilecek soru:

"Ayni urun sepete iki kere eklenirse ne olur?"

Cevap:

"Yeni satir olusturmak yerine mevcut cart item'in quantity degeri artar."

#### `GET /cart`

Sepet sayfasini acar.

Adimlar:

- Consumer id ile sepetteki urunler cekilir.
- Urun ve market bilgileri join ile getirilir.
- Her urun icin `item_total` hesaplanir.
- Tum sepet icin `grandTotal` hesaplanir.
- `cart.ejs` render edilir.

#### `POST /cart/update/:cartItemId`

Sepetteki urun miktarini gunceller.

Adimlar:

- Cart item id URL'den alinir.
- Yeni quantity request body'den alinir.
- Cart item consumer'a ait mi kontrol edilir.
- Quantity integer mi ve en az 1 mi kontrol edilir.
- Quantity stoktan fazla mi kontrol edilir.
- Gecerliyse veritabaninda quantity guncellenir.
- Yeni item total ve grand total JSON olarak dondurulur.

Basarisiz durumlarda JSON:

- `success: false`
- `message`
- Gerekirse `oldQuantity`

Basarili durumda JSON:

- `success: true`
- `quantity`
- `itemTotal`
- `grandTotal`

#### `POST /cart/remove/:cartItemId`

Sepetten urun siler.

Adimlar:

- Cart item consumer'a aitse silinir.
- Yeni grand total hesaplanir.
- Sepet bos mu kontrol edilir.
- JSON cevap doner.

#### `POST /cart/purchase`

Sepetteki urunleri satin alir.

Adimlar:

- Consumer sepetindeki urunler cekilir.
- Sepet bos ise hata doner.
- Her urun icin quantity stoktan fazla mi kontrol edilir.
- Stok yeterliyse satin alma islemi baslar.
- Her urunde yeni stok hesaplanir.
- Yeni stok 0'dan buyukse product stock guncellenir.
- Yeni stok 0 ise urun products tablosundan silinir.
- Consumer'in cart_items kayitlari silinir.
- `success: true` doner.

Hocaya anlatim:

"Satin alma sonrasi stok azaltiliyor. Eger stok tamamen biterse urun sistemden siliniyor."

### `public/js/cart.js` Fonksiyon ve Eventleri

#### Degiskenler

- `quantityInputs`: Sepetteki miktar inputlari.
- `removeButtons`: Sepetten silme butonlari.
- `purchaseButton`: Satin alma butonu.
- `messageBox`: Sepet mesaj kutusu.

#### `showMessage(message, isError = false)`

Sepet ekraninda kullaniciya mesaj gosterir.

- `messageBox.textContent = message`
- Hata ise class `error`
- Basarili ise class `success`

#### Quantity Change Event

Kullanici miktari degistirdiginde calisir.

Adimlar:

- Cart item id input'un dataset'inden alinir.
- Yeni quantity okunur.
- `/cart/update/:cartItemId` adresine POST istegi atilir.
- Server basarisiz donerse hata mesaji gosterilir.
- Server eski miktari donerse input eski haline alinir.
- Basariliysa item total ve grand total ekranda guncellenir.

#### Remove Button Click Event

Kullanici remove butonuna bastiginda calisir.

Adimlar:

- Cart item id buton dataset'inden alinir.
- `/cart/remove/:cartItemId` adresine POST istegi atilir.
- Basariliysa ilgili cart item HTML'den silinir.
- Grand total guncellenir.
- Sepet bos kaldiysa cart list bos mesaji ile degistirilir ve total box kaldirilir.

#### Purchase Button Click Event

Satin alma butonuna basildiginda calisir.

Adimlar:

- `confirm` ile kullanicidan onay alinir.
- Onay yoksa islem iptal edilir.
- `/cart/purchase` adresine POST istegi atilir.
- Hata varsa mesaj gosterilir.
- Basariliysa sepet bosaltilir, total box kaldirilir ve basari mesaji gosterilir.

### Consumer View Dosyalari

#### `consumer-home.ejs`

Consumer ana sayfasidir.

Icerik:

- Arama formu
- Arama sonucu urun kartlari
- Urun gorseli
- Market adi ve lokasyonu
- Normal fiyat ve indirimli fiyat
- Son kullanma tarihine kalan gun
- Sepete ekleme butonu
- Pagination

#### `consumer-profile-edit.ejs`

Consumer profil duzenleme formudur.

Alanlar:

- Email
- Full name
- City
- District
- Password

#### `cart.ejs`

Sepet sayfasidir.

Icerik:

- Sepetteki urun listesi
- Quantity input
- Item total
- Grand total
- Remove butonu
- Purchase butonu
- `public/js/cart.js` script baglantisi

### Kisi 3 Kapanis Cumlesi

"Consumer tarafinda amac kullanicinin kendi lokasyonuna uygun, tarihi gecmemis ve stokta bulunan indirimli urunleri bulup sepet uzerinden satin almasini saglamak."

## Hocaya Gosterilecek Demo Sirasi

1. Ana sayfa acilir: `http://localhost:3000`
2. Market register yapilir.
3. Email verification kodu girilir.
4. Market login olur.
5. Market urun ekler.
6. Market dashboard'da urun gorulur.
7. Consumer register yapilir.
8. Consumer login olur.
9. Consumer urun arar.
10. Urun sepete eklenir.
11. Sepette quantity degistirilir.
12. Urun sepetten silinir veya satin alinir.
13. Satin alma sonrasi stok azalmasi market panelinden gosterilir.

## Commit Sirasi

### Commit 1: Kisi 1

```bash
git add server.js db.js sql/init.sql routes/authRoutes.js services/mail.js middleware/auth.js package.json package-lock.json .gitignore
git commit -m "Add app setup, database schema, and auth flow"
```

### Commit 2: Kisi 2

```bash
git add routes/marketRoutes.js config/upload.js views/market-dashboard.ejs views/market-profile-edit.ejs views/market-product-add.ejs views/market-product-edit.ejs
git commit -m "Add market profile and product management"
```

### Commit 3: Kisi 3

```bash
git add routes/consumerRoutes.js services/cart.js public/js/cart.js views/consumer-home.ejs views/consumer-profile-edit.ejs views/cart.ejs
git commit -m "Add consumer search, cart, and purchase flow"
```

### Commit 4: Dokumantasyon ve Stil

```bash
git add docs/presentation-plan.md docs/detailed-presentation-guide.md public/css/style.css
git commit -m "Add presentation guide and clean styles"
```

## Kisa Soru-Cevap Hazirligi

Soru: "Neden sifreyi direkt veritabanina yazmadiniz?"

Cevap: "Guvenlik icin bcrypt ile hashleyip yazdik. Boylece veritabani gorulse bile kullanicinin gercek sifresi gorulmez."

Soru: "Market ve consumer ayrimini nasil yaptiniz?"

Cevap: "`users` tablosunda `role` alani var. Session'da da role tutuluyor. Middleware ile role kontrolu yapiyoruz."

Soru: "Consumer neden sadece ayni sehirdeki urunleri goruyor?"

Cevap: "Projenin mantigi yerel marketlerdeki yaklasan tarihli urunleri degerlendirmek. Bu yuzden consumer'in sehrine gore filtreleme yaptik."

Soru: "Fotograflar veritabaninda mi tutuluyor?"

Cevap: "Hayir. Fotograflar `public/uploads` klasorune kaydediliyor. Veritabaninda sadece dosya yolu tutuluyor."

Soru: "Sepette fiyat hesaplamasini nerede yapiyorsunuz?"

Cevap: "Toplam fiyat server tarafinda hesaplanir. `calculateGrandTotal` fonksiyonu sepetteki urunlerin indirimli fiyatlarini miktarlarla carpar."

Soru: "Satin alma sonrasi stok ne oluyor?"

Cevap: "Urun miktari kadar stok dusuyor. Stok 0 olursa urun products tablosundan siliniyor."

Soru: "Kod neden parcalara ayrildi?"

Cevap: "Tek bir `server.js` dosyasi cok buyuktu. Auth, market ve consumer route'larini ayirarak kodu daha okunabilir ve sunumda paylasilabilir hale getirdik."
