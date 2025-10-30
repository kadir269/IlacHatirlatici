import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  Platform,
  Share,
  TextInput,
  Modal,
  Switch
} from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';

// Bildirimlerin nasıl gösterileceğini ayarla
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const DEFAULT_MEDICATIONS = [
  { id: 'sabah', name: 'Sabah İlacı', time: '08:00', hour: 8, minute: 0, active: true },
  { id: 'ogle', name: 'Öğle İlacı', time: '13:00', hour: 13, minute: 0, active: true },
  { id: 'aksam', name: 'Akşam İlacı', time: '20:00', hour: 20, minute: 0, active: true },
];

export default function App() {
  const [medicationTimes, setMedicationTimes] = useState(DEFAULT_MEDICATIONS);
  
  const [todayLog, setTodayLog] = useState({});
  const [allLogs, setAllLogs] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [editingMed, setEditingMed] = useState(null);
  
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    initializeApp();

    // Bildirim dinleyicileri
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('📢 Bildirim alındı:', notification);
      const medicationId = notification.request.content.data.medicationId;
      setCurrentNotification(medicationId);
      speakReminder();
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('👆 Bildirime tıklandı:', response);
      const medicationId = response.notification.request.content.data.medicationId;
      setCurrentNotification(medicationId);
      speakReminder();
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const initializeApp = async () => {
    await registerForPushNotificationsAsync();
    await loadSettings();
    await loadLogs();
    await scheduleDailyNotifications();
  };

  const loadSettings = async () => {
    try {
      const savedMeds = await AsyncStorage.getItem('medicationTimes');
      const savedEmail = await AsyncStorage.getItem('emailAddress');
      if (savedMeds) setMedicationTimes(JSON.parse(savedMeds));
      if (savedEmail) setEmailAddress(savedEmail);
    } catch (error) {
      console.error('❌ Ayar yükleme hatası:', error);
    }
  };

  const saveSettings = async (meds, email) => {
    try {
      await AsyncStorage.setItem('medicationTimes', JSON.stringify(meds));
      if (email) await AsyncStorage.setItem('emailAddress', email);
    } catch (error) {
      console.error('❌ Ayar kaydetme hatası:', error);
    }
  };

  // Bildirim izni
  const registerForPushNotificationsAsync = async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ilac-hatirlatici', {
        name: 'İlaç Hatırlatıcı',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Uyarı', 'Bildirim izni verilmedi. Uygulama düzgün çalışmayabilir.');
        return;
      }
    }
  };

  // Günlük bildirimleri planla
  const scheduleDailyNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const activeMeds = medicationTimes.filter(med => med.active);
    
    for (const med of activeMeds) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 İlaç Zamanı!',
          body: `Emine Hanım, ${med.name} zamanınız geldi!`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: { medicationId: med.id },
        },
        trigger: {
          hour: med.hour,
          minute: med.minute,
          repeats: true,
        },
      });
      console.log(`✅ ${med.name} için bildirim planlandı: ${med.time}`);
    }

    const medList = activeMeds.map(m => `${m.name}: ${m.time}`).join('\n');
    Alert.alert('✅ Hatırlatıcılar Ayarlandı', `Aktif ilaçlar:\n\n${medList}\n\nBildirimler her gün bu saatlerde gelecek.`);
  };

  // Sesli hatırlatma
  const speakReminder = () => {
    setIsSpeaking(true);
    const message = "Emine Hanım, ilaç zamanınız geldi. İlaçlarınızı aldınız mı? Lütfen cevap verin.";
    
    Speech.speak(message, {
      language: 'tr-TR',
      pitch: 1.0,
      rate: 0.85, // Biraz yavaş konuş
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Cevap kaydet
  const recordResponse = async (medicationId, taken) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('tr-TR');
    
    const logEntry = {
      date: today,
      time: time,
      medicationId: medicationId,
      medicationName: medicationTimes.find(m => m.id === medicationId)?.name || 'İlaç',
      taken: taken,
    };

    // Bugünün logunu güncelle
    const updatedTodayLog = { ...todayLog, [medicationId]: taken };
    setTodayLog(updatedTodayLog);

    // Tüm loglara ekle
    const updatedLogs = [...allLogs, logEntry];
    setAllLogs(updatedLogs);

    // AsyncStorage'a kaydet
    try {
      await AsyncStorage.setItem('todayLog', JSON.stringify(updatedTodayLog));
      await AsyncStorage.setItem('allLogs', JSON.stringify(updatedLogs));
      console.log('✅ Log kaydedildi:', logEntry);
    } catch (error) {
      console.error('❌ Log kaydetme hatası:', error);
    }

    // Sesli geri bildirim
    const responseMessage = taken 
      ? "Teşekkür ederim Emine Hanım. İlacınızı aldığınız kaydedildi."
      : "Tamam Emine Hanım. İlacınızı almadığınız kaydedildi. Lütfen en kısa sürede alınız.";
    
    Speech.speak(responseMessage, {
      language: 'tr-TR',
      pitch: 1.0,
      rate: 0.85,
    });

    setCurrentNotification(null);
  };

  // Logları yükle
  const loadLogs = async () => {
    try {
      const savedTodayLog = await AsyncStorage.getItem('todayLog');
      const savedAllLogs = await AsyncStorage.getItem('allLogs');
      
      if (savedTodayLog) setTodayLog(JSON.parse(savedTodayLog));
      if (savedAllLogs) setAllLogs(JSON.parse(savedAllLogs));
    } catch (error) {
      console.error('❌ Log yükleme hatası:', error);
    }
  };

  // Günlük logu sıfırla
  const resetDailyLog = async () => {
    Alert.alert('Emin misiniz?', 'Bugünün tüm kayıtları silinecek.', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: async () => {
        setTodayLog({});
        await AsyncStorage.setItem('todayLog', JSON.stringify({}));
        Alert.alert('✅', 'Bugünün kayıtları silindi');
      }}
    ]);
  };

  // Email gönder (WhatsApp/SMS kullanın)
  const sendEmail = async () => {
    Alert.alert(
      'Rapor Paylaş',
      'WhatsApp veya SMS ile rapor paylaşın.',
      [
        { text: 'Tamam', onPress: shareLogs }
      ]
    );
  };

  // İlaç saatini güncelle
  const updateMedicationTime = (id, hour, minute) => {
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    const updatedMeds = medicationTimes.map(med => 
      med.id === id ? { ...med, time: timeStr, hour, minute } : med
    );
    setMedicationTimes(updatedMeds);
    saveSettings(updatedMeds, emailAddress);
  };

  // İlaç aktif/pasif
  const toggleMedication = async (id) => {
    const updatedMeds = medicationTimes.map(med => 
      med.id === id ? { ...med, active: !med.active } : med
    );
    setMedicationTimes(updatedMeds);
    await saveSettings(updatedMeds, emailAddress);
    Alert.alert('✅', 'Değişiklik kaydedildi. Hatırlatıcıları yeniden kurun.');
  };

  // Rapor oluştur
  const generateReport = () => {
    const last7Days = allLogs.slice(-21);
    let message = '📊 İLAÇ TAKİP RAPORU - EMİNE HANIM\n\n';
    const groupedByDate = {};
    last7Days.forEach(log => {
      if (!groupedByDate[log.date]) groupedByDate[log.date] = [];
      groupedByDate[log.date].push(log);
    });
    Object.keys(groupedByDate).sort().reverse().forEach(date => {
      message += `📅 ${new Date(date).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n`;
      groupedByDate[date].forEach(log => {
        const status = log.taken ? '✅ Alındı' : '❌ Alınmadı';
        message += `  ${log.time} - ${log.medicationName}: ${status}\n`;
      });
      message += '\n';
    });
    const totalMeds = last7Days.length;
    const takenMeds = last7Days.filter(l => l.taken).length;
    const percentage = ((takenMeds / totalMeds) * 100).toFixed(1);
    message += `📈 İSTATİSTİKLER (Son 7 Gün)\nToplam İlaç: ${totalMeds}\nAlınan: ${takenMeds}\nAlınmayan: ${totalMeds - takenMeds}\nBaşarı Oranı: %${percentage}\n`;
    return message;
  };

  // Log paylaş
  const shareLogs = async () => {
    if (allLogs.length === 0) {
      Alert.alert('Bilgi', 'Henüz paylaşılacak log yok.');
      return;
    }
    const message = generateReport();
    try {
      await Share.share({ message, title: 'İlaç Takip Raporu' });
    } catch (error) {
      console.error('❌ Paylaşma hatası:', error);
    }
  };

  // Manuel test
  const testNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '💊 Test - İlaç Zamanı!',
        body: 'Emine Hanım, sabah ilacı zamanınız geldi!',
        sound: 'default',
        data: { medicationId: 'sabah' },
      },
      trigger: { seconds: 2 },
    });
    Alert.alert('✅', 'Test bildirimi 2 saniye içinde gelecek!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💊 İlaç Hatırlatıcı</Text>
        <Text style={styles.headerSubtitle}>Emine Hanım için</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        
        {/* Bildirim Cevap Ekranı */}
        {currentNotification && (
          <View style={styles.notificationCard}>
            <Text style={styles.notificationTitle}>
              🔔 İlaç Zamanı Geldi!
            </Text>
            <Text style={styles.notificationQuestion}>
              {medicationTimes.find(m => m.id === currentNotification)?.name}
            </Text>
            <Text style={styles.notificationSubtext}>
              İlaçlarınızı aldınız mı?
            </Text>
            
            <View style={styles.answerButtons}>
              <TouchableOpacity 
                style={[styles.answerBtn, styles.yesBtn]}
                onPress={() => recordResponse(currentNotification, true)}
              >
                <Text style={styles.answerBtnText}>✅ EVET</Text>
                <Text style={styles.answerBtnSubtext}>Aldım</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.answerBtn, styles.noBtn]}
                onPress={() => recordResponse(currentNotification, false)}
              >
                <Text style={styles.answerBtnText}>❌ HAYIR</Text>
                <Text style={styles.answerBtnSubtext}>Almadım</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.speakAgainBtn}
              onPress={speakReminder}
              disabled={isSpeaking}
            >
              <Text style={styles.speakAgainText}>
                🔊 {isSpeaking ? 'Konuşuyor...' : 'Tekrar Dinle'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bugünün İlaçları */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📅 Bugünün İlaçları</Text>
          {medicationTimes.filter(med => med.active).map((med) => {
            const status = todayLog[med.id];
            return (
              <View key={med.id} style={styles.medRow}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medTime}>⏰ {med.time}</Text>
                </View>
                <View style={styles.medStatus}>
                  {status === true && (
                    <Text style={styles.statusTaken}>✅ Alındı</Text>
                  )}
                  {status === false && (
                    <Text style={styles.statusNotTaken}>❌ Alınmadı</Text>
                  )}
                  {status === undefined && (
                    <Text style={styles.statusPending}>⏳ Bekliyor</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* İstatistikler */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 İstatistikler (Bugün)</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Object.values(todayLog).filter(v => v === true).length}
              </Text>
              <Text style={styles.statLabel}>Alınan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {Object.values(todayLog).filter(v => v === false).length}
              </Text>
              <Text style={styles.statLabel}>Alınmayan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {medicationTimes.filter(m => m.active).length - Object.keys(todayLog).length}
              </Text>
              <Text style={styles.statLabel}>Bekleyen</Text>
            </View>
          </View>
        </View>

        {/* Kontrol Butonları */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ İşlemler</Text>
          
          <TouchableOpacity style={styles.controlBtn} onPress={scheduleDailyNotifications}>
            <Text style={styles.controlBtnText}>🔔 Hatırlatıcıları Yeniden Kur</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlBtn} onPress={testNotification}>
            <Text style={styles.controlBtnText}>🧪 Test Bildirimi Gönder</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlBtn} onPress={shareLogs}>
            <Text style={styles.controlBtnText}>📤 Rapor Paylaş (WhatsApp/SMS)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.controlBtn, styles.settingsBtn]} onPress={() => setShowSettings(true)}>
            <Text style={styles.controlBtnText}>⚙️ İlaç Saatleri Ayarla</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.controlBtn} onPress={resetDailyLog}>
            <Text style={styles.controlBtnText}>🔄 Bugünü Sıfırla</Text>
          </TouchableOpacity>
        </View>

        {/* Son Kayıtlar */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Son Kayıtlar</Text>
          {allLogs.slice(-10).reverse().map((log, index) => (
            <View key={index} style={styles.logRow}>
              <Text style={styles.logDate}>
                {new Date(log.date).toLocaleDateString('tr-TR')}
              </Text>
              <Text style={styles.logMed}>{log.medicationName}</Text>
              <Text style={log.taken ? styles.logTaken : styles.logNotTaken}>
                {log.taken ? '✅' : '❌'}
              </Text>
            </View>
          ))}
          {allLogs.length === 0 && (
            <Text style={styles.noLogs}>Henüz kayıt yok</Text>
          )}
        </View>

      </ScrollView>

      {/* Ayarlar Modal */}
      <Modal visible={showSettings} animationType="slide" transparent={true} onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ İlaç Ayarları</Text>
            

            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>💊 İlaçlar:</Text>
              {medicationTimes.map((med) => (
                <View key={med.id} style={styles.medSettingRow}>
                  <View style={styles.medSettingInfo}>
                    <View style={styles.medSettingTop}>
                      <Text style={styles.medSettingName}>{med.name}</Text>
                      <Switch
                        value={med.active}
                        onValueChange={() => toggleMedication(med.id)}
                        trackColor={{ false: '#d1d5db', true: '#60a5fa' }}
                        thumbColor={med.active ? '#3b82f6' : '#f3f4f6'}
                      />
                    </View>
                    <Text style={styles.medSettingTime}>⏰ {med.time}</Text>
                    {!med.active && (
                      <Text style={styles.inactiveText}>❌ Pasif - Bildirim gelmeyecek</Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.editBtn}
                    onPress={() => setEditingMed(med)}
                  >
                    <Text style={styles.editBtnText}>✏️</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={styles.closeModalBtn}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeModalText}>✅ Tamam</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Saat Düzenleme Modal */}
      {editingMed && (
        <Modal visible={true} animationType="fade" transparent={true} onRequestClose={() => setEditingMed(null)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⏰ Saat Ayarla</Text>
              <Text style={styles.editingMedName}>{editingMed.name}</Text>
              
              <View style={styles.timeInputRow}>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>Saat</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={editingMed.hour.toString()}
                    onChangeText={(text) => {
                      const hour = parseInt(text) || 0;
                      if (hour >= 0 && hour <= 23) {
                        setEditingMed({ ...editingMed, hour });
                      }
                    }}
                  />
                </View>
                <Text style={styles.timeSeparator}>:</Text>
                <View style={styles.timeInputGroup}>
                  <Text style={styles.timeInputLabel}>Dakika</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    maxLength={2}
                    value={editingMed.minute.toString()}
                    onChangeText={(text) => {
                      const minute = parseInt(text) || 0;
                      if (minute >= 0 && minute <= 59) {
                        setEditingMed({ ...editingMed, minute });
                      }
                    }}
                  />
                </View>
              </View>

              <View style={styles.editModalButtons}>
                <TouchableOpacity 
                  style={[styles.editModalBtn, styles.cancelBtn]}
                  onPress={() => setEditingMed(null)}
                >
                  <Text style={styles.editModalBtnText}>❌ İptal</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.editModalBtn, styles.saveBtn]}
                  onPress={() => {
                    updateMedicationTime(editingMed.id, editingMed.hour, editingMed.minute);
                    setEditingMed(null);
                    Alert.alert('✅', 'Saat kaydedildi! Hatırlatıcıları yeniden kurun.');
                  }}
                >
                  <Text style={styles.editModalBtnText}>✅ Kaydet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  header: {
    backgroundColor: '#3b82f6',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e0f2fe',
    marginTop: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
  notificationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#f59e0b',
  },
  notificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 10,
  },
  notificationQuestion: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#78350f',
    textAlign: 'center',
    marginBottom: 10,
  },
  notificationSubtext: {
    fontSize: 20,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 20,
  },
  answerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  answerBtn: {
    flex: 1,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5,
  },
  yesBtn: {
    backgroundColor: '#22c55e',
  },
  noBtn: {
    backgroundColor: '#ef4444',
  },
  answerBtnText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  answerBtnSubtext: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  speakAgainBtn: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    alignItems: 'center',
  },
  speakAgainText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 15,
  },
  medRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  medTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  medStatus: {
    marginLeft: 10,
  },
  statusTaken: {
    fontSize: 16,
    color: '#22c55e',
    fontWeight: 'bold',
  },
  statusNotTaken: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
  },
  statusPending: {
    fontSize: 16,
    color: '#f59e0b',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    padding: 15,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  controlBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  controlBtnText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  logDate: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  logMed: {
    fontSize: 14,
    color: '#1f2937',
    flex: 2,
  },
  logTaken: {
    fontSize: 18,
  },
  logNotTaken: {
    fontSize: 18,
  },
  noLogs: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emailBtn: {
    backgroundColor: '#10b981',
  },
  settingsBtn: {
    backgroundColor: '#8b5cf6',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingSection: {
    marginBottom: 25,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  saveEmailBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  saveEmailText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  medSettingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    marginBottom: 10,
  },
  medSettingInfo: {
    flex: 1,
  },
  medSettingTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  medSettingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  medSettingTime: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  inactiveText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 5,
    fontStyle: 'italic',
  },
  editBtn: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editBtnText: {
    fontSize: 20,
  },
  closeModalBtn: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  closeModalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  editingMedName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 20,
  },
  timeInputRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timeInputGroup: {
    alignItems: 'center',
  },
  timeInputLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 15,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    width: 80,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginHorizontal: 10,
  },
  editModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  editModalBtn: {
    flex: 1,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ef4444',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
  },
  editModalBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
