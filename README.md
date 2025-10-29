# 💊 İlaç Hatırlatıcı - Emine Hanım

Anneniz için özel geliştirilmiş sesli ilaç hatırlatma uygulaması.

## 🎯 Özellikler

### ✅ Sesli Hatırlatma
- **Otomatik sesli uyarı**: "Emine Hanım, ilaç zamanınız geldi. İlaçlarınızı aldınız mı?"
- Bildirimlere tıklandığında tekrar konuşur
- "Tekrar Dinle" butonu ile istediğiniz zaman dinleyebilirsiniz

### ⏰ İlaç Zamanları
- **Sabah İlacı**: 08:00
- **Öğle İlacı**: 13:00  
- **Akşam İlacı**: 20:00

Her gün bu saatlerde otomatik bildirim gelir.

### 📱 Büyük Butonlar
- **✅ EVET** (Yeşil) - İlacı aldım
- **❌ HAYIR** (Kırmızı) - İlacı almadım
- Yaşlılar için büyük ve kolay tıklanabilir

### 📊 Otomatik Log Sistemi
- Her cevap otomatik kaydedilir
- Hangi ilaç ne zaman alındı/alınmadı takip edilir
- 7 günlük rapor hazırlanır

### 📤 Rapor Gönderme
- WhatsApp, SMS veya E-posta ile paylaşabilirsiniz
- Son 7 günün detaylı raporu
- İstatistikler ve başarı oranı

### 🔊 Sesli Geri Bildirim
- "Evet" dediğinde: "Teşekkür ederim Emine Hanım. İlacınızı aldığınız kaydedildi."
- "Hayır" dediğinde: "Tamam Emine Hanım. İlacınızı almadığınız kaydedildi. Lütfen en kısa sürede alınız."

## 📱 Kurulum

### 1. Gerekli Araçlar
- Expo Go uygulamasını telefonuna indirin:
  - [Android - Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

### 2. Uygulamayı Başlatın
```bash
cd C:\Users\kadir\CascadeProjects\IlacHatirlatici
npm start
```

### 3. QR Kod Okutun
- Ekrana çıkan QR kodu telefonla okutun
- Expo Go otomatik açılır
- Uygulama yüklenir

### 4. İlk Kurulum
- Uygulama açıldığında bildirim izni isteğini **KABUL EDİN**
- "Hatırlatıcıları Yeniden Kur" butonuna basın
- Zamanları onaylayın

## 🎮 Nasıl Kullanılır?

### İlk Açılış
1. Uygulama açılır açılmaz hatırlatıcılar otomatik kurulur
2. Bildirimlere izin verin
3. Test bildirimi göndererek deneyin

### İlaç Zamanı Geldiğinde
1. 📱 Bildirim gelir: "💊 İlaç Zamanı!"
2. 🔊 Telefon konuşur: "Emine Hanım, ilaç zamanınız geldi..."
3. Bildirime tıklayın veya uygulamayı açın
4. Büyük sarı ekranda soru göreceksiniz
5. **✅ EVET** veya **❌ HAYIR** butonuna basın
6. Telefon cevabınızı sesli onaylar
7. Kayıt otomatik yapılır ✅

### Rapor Göndermek
1. Ana ekranda "📤 Rapor Paylaş (7 Gün)" butonuna basın
2. WhatsApp, SMS veya E-posta seçin
3. Sizin numaranıza gönderin
4. Raporta annenizin ilaç durumunu görebilirsiniz

## 📊 Ekranlar

### Ana Ekran Göstergeler:
- **Bugünün İlaçları**: Hangi ilaçlar alındı, hangisi bekliyor
- **İstatistikler**: Bugün kaç ilaç alındı
- **Son Kayıtlar**: Son 10 kayıt
- **Ayarlar**: Test, rapor paylaş, sıfırlama

### Bildirim Ekranı (İlaç Zamanı):
```
🔔 İlaç Zamanı Geldi!
Sabah İlacı
İlaçlarınızı aldınız mı?

[✅ EVET]  [❌ HAYIR]
     Aldım      Almadım

[🔊 Tekrar Dinle]
```

## 🧪 Test Etme

1. **"🧪 Test Bildirimi Gönder"** butonuna basın
2. 2 saniye içinde test bildirimi gelir
3. Sesli uyarıyı duyarsınız
4. EVET/HAYIR butonlarını test edin

## ⚙️ Ayarlar

### Zamanları Değiştirmek
`App.js` dosyasında 28-32. satırlar:
```javascript
const [medicationTimes] = useState([
  { id: 'sabah', name: 'Sabah İlacı', time: '08:00', hour: 8, minute: 0 },
  { id: 'ogle', name: 'Öğle İlacı', time: '13:00', hour: 13, minute: 0 },
  { id: 'aksam', name: 'Akşam İlacı', time: '20:00', hour: 20, minute: 0 },
]);
```

### İsmi Değiştirmek
134. satır:
```javascript
const message = "Emine Hanım, ilaç zamanınız geldi...";
```
"Emine Hanım" yerine istediğiniz ismi yazın.

### Sesli Mesajları Özelleştirme
- **İlk uyarı**: Satır 134
- **Evet cevabı**: Satır 177
- **Hayır cevabı**: Satır 178

## 🐛 Sorun Giderme

### Bildirim Gelmiyor?
1. Telefon ayarlarından bildirim izinlerini kontrol edin
2. "Hatırlatıcıları Yeniden Kur" butonuna basın
3. Pil tasarrufu modunu kapatın (uygulama için)

### Ses Çıkmıyor?
1. Telefon sesini açın
2. Sessiz mod kapalı olmalı
3. Test bildirimi gönderin

### Rapor Gönderilmiyor?
1. WhatsApp veya SMS uygulaması yüklü olmalı
2. İnternet bağlantısı kontrol edin

### Hatırlatıcılar Sıfırlandı?
- Telefon yeniden başlatıldığında tekrar kurun
- "Hatırlatıcıları Yeniden Kur" butonuna basın

## 📝 Rapor Örneği

```
📊 İLAÇ TAKİP RAPORU - EMİNE HANIM

📅 29 Ekim 2025 Salı
  08:15 - Sabah İlacı: ✅ Alındı
  13:10 - Öğle İlacı: ✅ Alındı
  20:05 - Akşam İlacı: ❌ Alınmadı

📅 28 Ekim 2025 Pazartesi
  08:05 - Sabah İlacı: ✅ Alındı
  13:20 - Öğle İlacı: ✅ Alındı
  20:00 - Akşam İlacı: ✅ Alındı

📈 İSTATİSTİKLER (Son 7 Gün)
Toplam İlaç: 21
Alınan: 19
Alınmayan: 2
Başarı Oranı: %90.5
```

## 💡 İpuçları

### Anneniz İçin:
1. **Telefonun sesini açık tutun**
2. **Uygulama her zaman açık kalabilir**
3. **Bildirim geldiğinde tıklayın**
4. **Büyük butonlara basın**

### Sizin İçin:
1. **Haftada bir rapor isteyin**
2. **Başarı oranını takip edin**
3. **İlaç almadığında hemen arayın**
4. **Telefonu her hafta kontrol edin**

## 🚀 APK Oluşturma (Telefonuna Yükleme)

Expo Go olmadan direkt kullanmak için:

```bash
# EAS CLI kur
npm install -g eas-cli

# Giriş yap
eas login

# APK oluştur
eas build -p android --profile preview
```

Build tamamlanınca linki telefondan aç ve yükle.

## 📞 Önemli Notlar

⚠️ **DİKKAT:**
- İlaç hatırlatıcı **destek aracıdır**
- Tıbbi tavsiye yerine geçmez
- Doktor önerilerine uyun
- Uygulamayı düzenli kontrol edin

✅ **Başarı İçin:**
- Her gün aynı saatte bildirimlerin geldiğinden emin olun
- Telefon pili dolsun
- İnternet bağlantısı olsun (ilk kurulum için)
- Sesli uyarıları test edin

## 🎉 Başarılı Kurulum!

Artık anneniz her gün ilaçlarını zamanında alacak ve siz raporu takip edebileceksiniz!

**Sağlıklı günler dileriz! ❤️**
