# 📦 APK Oluşturma Kılavuzu

## 🎯 APK Nedir?

APK dosyası, Android telefonlara direkt yüklenebilen uygulama dosyasıdır.
**Expo Go'ya gerek yok**, telefonunuza direkt yüklersiniz.

---

## 🚀 Hızlı APK Oluşturma

### Adım 1: EAS CLI Kurulumu

```bash
npm install -g eas-cli
```

### Adım 2: Expo Hesabı Oluştur/Giriş Yap

```bash
eas login
```

- Email ve şifre girin
- Hesabınız yoksa oluşturun (ücretsiz)

### Adım 3: Projeyi Yapılandır

```bash
cd C:\Users\kadir\CascadeProjects\IlacHatirlatici
eas build:configure
```

- "Android" seçin
- "Yes" diyin

### Adım 4: APK Oluştur

```bash
eas build -p android --profile preview
```

⏱️ **Süre: 10-20 dakika**

Build tamamlanınca **link** verilecek.

---

## 📱 APK'yı Telefona Yükleme

### Yöntem 1: Direkt İndirme (Önerilen)

1. Build tamamlandığında verilen **linki** telefonda aç
2. APK'yı indir
3. "Bilinmeyen kaynaklardan yükleme izni ver"
4. Yükle

### Yöntem 2: QR Kod

1. Build tamamlandığında **QR kod** gösterilir
2. Telefon ile okut
3. APK'yı indir ve yükle

---

## ⚙️ Ayarlar ve Özelleştirme

### Email Adresi Ayarlama

1. Uygulamayı aç
2. "⚙️ İlaç Ayarları & Email" butonuna bas
3. Email adresini gir
4. "💾 Email Kaydet" bas

Artık raporlar otomatik bu adrese gönderilecek!

### İlaç Saatlerini Değiştirme

1. "⚙️ İlaç Ayarları & Email" aç
2. İlacın yanındaki ✏️ butona bas
3. Yeni saat/dakika gir
4. "✅ Kaydet" bas
5. "🔔 Hatırlatıcıları Yeniden Kur" bas

### İlacı Pasif Yapma (Örn: Sabah İlacı İptal)

1. "⚙️ İlaç Ayarları & Email" aç
2. İlacın yanındaki **switch**'i kapat (gri yap)
3. "✅ Tamam" bas
4. "🔔 Hatırlatıcıları Yeniden Kur" bas

Artık o ilaç için bildirim gelmeyecek!

---

## 📧 Email ile Rapor Gönderme

### Otomatik Rapor:

1. Email adresinizi ayarlayın (yukarıda anlattık)
2. "📧 Email ile Rapor Gönder" butonuna basın
3. Email uygulaması açılacak
4. Gönder'e basın

**Email İçeriği:**
- Son 7 günün detaylı raporu
- Hangi ilaçlar alındı/alınmadı
- İstatistikler
- Başarı yüzdesi

### Alternatif: WhatsApp/SMS ile Paylaş

- "📤 WhatsApp/SMS ile Paylaş" butonuna basın
- WhatsApp veya SMS seçin
- Kendi numaranıza gönderin

---

## 🔧 Uygulama Özellikleri

### ✅ Yeni Özellikler:

1. **Email Gönderme**
   - Rapor direkt mailinize gelir
   - Haftalık takip yapabilirsiniz

2. **İlaç Saati Ayarlama**
   - Her ilacın saatini değiştirebilirsiniz
   - Öğle ilacı 13:00 yerine 14:00 olabilir

3. **İlaç Aktif/Pasif**
   - İstemediğiniz ilacı kapatabilirsiniz
   - Sabah ilacı yok? Kapat!
   - Bildirim gelmez

4. **Ayarlar Kayıt**
   - Tüm ayarlar telefonda saklanır
   - Telefon kapanırsa bile kaybolmaz

---

## 🐛 Sorun Giderme

### Build Hatası Alıyorum

```bash
# Önce temizle
rm -rf node_modules
npm install

# Tekrar dene
eas build -p android --profile preview
```

### APK Yüklenmiyor

1. Telefon Ayarlar → Güvenlik
2. "Bilinmeyen kaynaklardan yükleme" → Açık
3. Tekrar dene

### Email Gönderilmiyor

1. Email adresini kontrol edin
2. İnternet bağlantısı var mı?
3. Telefonunda email uygulaması var mı?
4. Alternatif: WhatsApp kullan

### İlaç Bildirimi Gelmiyor

1. "⚙️ İlaç Ayarları" → İlaç aktif mi kontrol et
2. "🔔 Hatırlatıcıları Yeniden Kur" bas
3. Telefon Ayarlar → Bildirimler → İzin ver

---

## 📝 Kontrol Listesi

### İlk Kurulum:
- [ ] APK oluşturuldu
- [ ] Telefona yüklendi
- [ ] Bildirim izni verildi
- [ ] Email adresi ayarlandı
- [ ] İlaç saatleri kontrol edildi
- [ ] Gereksiz ilaçlar pasif yapıldı
- [ ] Test bildirimi gönderildi
- [ ] Email testi yapıldı

### Her Hafta:
- [ ] Email ile rapor al
- [ ] Başarı oranını kontrol et
- [ ] Anneyi tebrik et!

---

## 🎉 Başarılı Kurulum!

Artık:
- ✅ APK direkt telefonda
- ✅ İlaç saatleri ayarlanabilir
- ✅ İlaçlar aktif/pasif yapılabilir
- ✅ Email ile otomatik rapor
- ✅ Expo Go'ya gerek yok

**Kullanıma hazır! 💊✨**

---

## 📞 Hızlı Komutlar

```bash
# APK oluştur
eas build -p android --profile preview

# Build durumunu kontrol et
eas build:list

# Projeyi güncelle
npm install
eas build -p android --profile preview
```

---

## 💡 İpuçları

1. **İlk APK'yı oluşturun** - 10-20 dakika sürer
2. **Linki telefondan açın** - APK'yı direkt indirin
3. **Email ayarını unutmayın** - Raporlar otomatik gelsin
4. **İlaç saatlerini hemen ayarlayın** - Doğru saatler önemli
5. **Gereksiz ilaçları kapatın** - Gereksiz bildirim gelmesin

**Başarılar! 🚀**
