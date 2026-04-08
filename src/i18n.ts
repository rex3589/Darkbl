import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "profile": "Profile",
      "messages": "Messages",
      "admin_panel": "Admin Panel",
      "payment_plan": "Payment Plan",
      "vip_membership": "VIP MEMBERSHIP",
      "choose_plan": "Choose your plan for full access",
      "subscribe": "Subscribe",
      "secure_access": "Secure Access",
      "create_identity": "Create Identity",
      "email_address": "Email Address",
      "password": "Password",
      "display_name": "Display Name",
      "google_login": "Google",
      "or_continue_with": "Or continue with",
      "back_to_plans": "Back to Plans",
      "select_crypto": "Select Cryptocurrency",
      "wallet_address": "Wallet Address",
      "i_have_paid": "I Have Paid",
      "home_title": "DarkBlaiseX Login",
      "settings": "Settings",
      "dont_have_account": "Don't have an account? Register",
      "already_have_account": "Already have an account? Login",
      "profile_updated": "Profile updated successfully",
      "error_updating_profile": "Error updating profile",
      "new_password": "New Password",
      "leave_blank_password": "Leave blank to keep current",
      "save_changes": "Save Changes",
      "vip_member": "VIP MEMBER",
      "rookie_member": "ROOKIE MEMBER"
    }
  },
  it: {
    translation: {
      "welcome": "Benvenuto",
      "login": "Accedi",
      "register": "Registrati",
      "logout": "Esci",
      "profile": "Profilo",
      "messages": "Messaggi",
      "admin_panel": "Pannello Admin",
      "payment_plan": "Piano di Pagamento",
      "vip_membership": "ABBONAMENTO VIP",
      "choose_plan": "Scegli il tuo piano per l'accesso completo",
      "subscribe": "Abbonati",
      "secure_access": "Accesso Sicuro",
      "create_identity": "Crea Identità",
      "email_address": "Indirizzo Email",
      "password": "Password",
      "display_name": "Nome Visualizzato",
      "google_login": "Google",
      "or_continue_with": "O continua con",
      "back_to_plans": "Torna ai Piani",
      "select_crypto": "Seleziona Criptovaluta",
      "wallet_address": "Indirizzo Portafoglio",
      "i_have_paid": "Ho Pagato",
      "home_title": "DarkBlaiseX Login",
      "settings": "Impostazioni"
    }
  },
  de: {
    translation: {
      "welcome": "Willkommen",
      "login": "Anmelden",
      "register": "Registrieren",
      "logout": "Abmelden",
      "profile": "Profil",
      "messages": "Nachrichten",
      "admin_panel": "Admin-Bereich",
      "payment_plan": "Zahlungsplan",
      "vip_membership": "VIP-MITGLIEDSCHAFT",
      "choose_plan": "Wählen Sie Ihren Plan für vollen Zugriff",
      "subscribe": "Abonnieren",
      "secure_access": "Sicherer Zugang",
      "create_identity": "Identität erstellen",
      "email_address": "E-Mail-Adresse",
      "password": "Passwort",
      "display_name": "Anzeigename",
      "google_login": "Google",
      "or_continue_with": "Oder weiter mit",
      "back_to_plans": "Zurück zu den Plänen",
      "select_crypto": "Kryptowährung auswählen",
      "wallet_address": "Wallet-Adresse",
      "i_have_paid": "Ich habe bezahlt",
      "home_title": "DarkBlaiseX Login",
      "settings": "Einstellungen"
    }
  },
  fr: {
    translation: {
      "welcome": "Bienvenue",
      "login": "Connexion",
      "register": "S'inscrire",
      "logout": "Déconnexion",
      "profile": "Profil",
      "messages": "Messages",
      "admin_panel": "Panneau Admin",
      "payment_plan": "Plan de Paiement",
      "vip_membership": "ABONNEMENT VIP",
      "choose_plan": "Choisissez votre plan pour un accès complet",
      "subscribe": "S'abonner",
      "secure_access": "Accès Sécurisé",
      "create_identity": "Créer une Identité",
      "email_address": "Adresse E-mail",
      "password": "Mot de passe",
      "display_name": "Nom d'affichage",
      "google_login": "Google",
      "or_continue_with": "Ou continuer avec",
      "back_to_plans": "Retour aux Plans",
      "select_crypto": "Sélectionner une Crypto-monnaie",
      "wallet_address": "Adresse du Portefeuille",
      "i_have_paid": "J'ai Payé",
      "home_title": "DarkBlaiseX Login",
      "settings": "Paramètres"
    }
  },
  hi: {
    translation: {
      "welcome": "स्वागत है",
      "login": "लॉगिन",
      "register": "पंजीकरण",
      "logout": "लॉगआउट",
      "profile": "प्रोफ़ाइल",
      "messages": "संदेश",
      "admin_panel": "एडमिन पैनल",
      "payment_plan": "भुगतान योजना",
      "vip_membership": "वीआईपी सदस्यता",
      "choose_plan": "पूर्ण पहुंच के लिए अपनी योजना चुनें",
      "subscribe": "सदस्यता लें",
      "secure_access": "सुरक्षित पहुंच",
      "create_identity": "पहचान बनाएं",
      "email_address": "ईमेल पता",
      "password": "पासवर्ड",
      "display_name": "प्रदर्शित नाम",
      "google_login": "गूगल",
      "or_continue_with": "या इसके साथ जारी रखें",
      "back_to_plans": "योजनाओं पर वापस जाएं",
      "select_crypto": "क्रिप्टोकरेंसी चुनें",
      "wallet_address": "वॉलेट पता",
      "i_have_paid": "मैंने भुगतान कर दिया है",
      "home_title": "DarkBlaiseX लॉगिन",
      "settings": "सेटिंग्स"
    }
  },
  tr: {
    translation: {
      "welcome": "Hoş Geldiniz",
      "login": "Giriş Yap",
      "register": "Kayıt Ol",
      "logout": "Çıkış Yap",
      "profile": "Profil",
      "messages": "Mesajlar",
      "admin_panel": "Admin Paneli",
      "payment_plan": "Ödeme Planı",
      "vip_membership": "VIP ÜYELİK",
      "choose_plan": "Tam erişim için planınızı seçin",
      "subscribe": "Abone Ol",
      "secure_access": "Güvenli Erişim",
      "create_identity": "Kimlik Oluştur",
      "email_address": "E-posta Adresi",
      "password": "Şifre",
      "display_name": "Görünen Ad",
      "google_login": "Google",
      "or_continue_with": "Veya şununla devam et",
      "back_to_plans": "Planlara Geri Dön",
      "select_crypto": "Kripto Para Seçin",
      "wallet_address": "Cüzdan Adresi",
      "i_have_paid": "Ödeme Yaptım",
      "home_title": "DarkBlaiseX Giriş",
      "settings": "Ayarlar",
      "dont_have_account": "Hesabınız yok mu? Kayıt Ol",
      "already_have_account": "Zaten hesabınız var mı? Giriş Yap",
      "profile_updated": "Profil başarıyla güncellendi",
      "error_updating_profile": "Profil güncellenirken hata oluştu",
      "new_password": "Yeni Şifre",
      "leave_blank_password": "Mevcut şifreyi korumak için boş bırakın",
      "save_changes": "Değişiklikleri Kaydet",
      "vip_member": "VİP ÜYE",
      "rookie_member": "ÇAYLAK ÜYE"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
