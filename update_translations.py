import json
import os

BASE_DIR = "/Users/mac/Documents/first saas /recallflow/messages"

en_additions = {
  "LandingPage": {
    "nav": {
      "login": "Log in",
      "startFreeTrial": "Start Free Trial"
    },
    "hero": {
      "badge": "Built for salons, restaurants & service businesses",
      "titlePart1": "Stop Losing Bookings",
      "titlePart2": "& Clients",
      "subtitle": "Track appointments, reduce no-shows, and never forget a follow-up. The simplest way to manage your client relationships.",
      "startFreeTrial": "Start Free Trial",
      "login": "Log in →",
      "footer": "Free for up to 20 clients · No credit card required"
    },
    "features": {
      "title": "Everything you need to manage clients",
      "subtitle": "Simple, focused tools that solve real problems for service businesses.",
      "f1": { "title": "Client Database", "desc": "Keep all your clients organized with contact info, service history, and status tracking." },
      "f2": { "title": "Appointment Tracking", "desc": "Track who confirmed, who showed up, and who paid — all in one place." },
      "f3": { "title": "No-Show Detection", "desc": "Instantly see who ghosted. Know which clients need extra attention." },
      "f4": { "title": "Follow-up Reminders", "desc": "Set reminders so you never forget to call a client back. Simple and effective." },
      "f5": { "title": "Dashboard Analytics", "desc": "See today's appointments, pending follow-ups, and no-shows at a glance." },
      "f6": { "title": "Multi-Business Ready", "desc": "Built as SaaS from day one. Each business gets its own isolated workspace." }
    },
    "pricing": {
      "title": "Simple, transparent pricing",
      "subtitle": "Start free and upgrade when your business grows. No hidden fees.",
      "free": { "title": "Free", "price": "$0", "period": "/month", "f1": "Up to 20 clients", "f2": "10 appointments/month", "f3": "Basic reminders", "cta": "Get Started Free" },
      "pro": { "badge": "Most Popular", "title": "Pro", "price": "$19", "period": "/month", "f1": "Unlimited clients", "f2": "Unlimited appointments", "f3": "Priority reminders", "cta": "Start Free Trial" }
    },
    "cta": {
      "title": "Ready to stop losing clients?",
      "subtitle": "Join service businesses that track every appointment and never miss a follow-up.",
      "button": "Start Free Trial"
    },
    "footer": {
      "copyright": "© {year} RecallFlow. All rights reserved."
    }
  },
  "Auth": {
    "login": {
      "title": "Welcome back",
      "subtitle": "Sign in to your account",
      "email": "Email",
      "password": "Password",
      "forgotPassword": "Forgot password?",
      "signIn": "Sign in",
      "signingIn": "Signing in...",
      "noAccount": "Don't have an account?",
      "signUp": "Sign up",
      "confirmationExpired": "Confirmation link expired or invalid."
    },
    "signup": {
      "title": "Create your account",
      "subtitle": "Start tracking your bookings for free",
      "businessName": "Business Name",
      "email": "Email",
      "password": "Password",
      "createAccount": "Create account",
      "creatingAccount": "Creating account...",
      "checkEmail": "Check your email for the confirmation link.",
      "haveAccount": "Already have an account?",
      "signIn": "Sign in",
      "backToLogin": "Back to login"
    },
    "forgotPassword": {
      "title": "Reset password",
      "subtitle": "Enter your email to receive a reset link.",
      "email": "Email",
      "sendLink": "Send reset link",
      "sending": "Sending…",
      "checkEmail": "Check your email for the reset link.",
      "backToLogin": "Back to sign in"
    },
    "updatePassword": {
      "title": "Set a new password",
      "subtitle": "Choose a strong password for your account.",
      "newPassword": "New password",
      "confirmPassword": "Confirm password",
      "update": "Update password",
      "updating": "Updating…",
      "verifying": "Verifying reset link…",
      "requestNew": "Request a new reset link",
      "expired": "Your reset link expired or is invalid.",
      "backToLogin": "Back to sign in"
    },
    "errors": {
      "invalidCredentials": "Invalid email or password",
      "emailExists": "Email already exists",
      "generic": "Something went wrong. Try again.",
      "businessProfile": "Could not create your business profile. Check Supabase logs and RLS policies.",
      "signedInRequired": "You must be signed in.",
      "dbMissing": "Database tables are missing. Run supabase/schema.sql in the Supabase SQL Editor first."
    }
  },
  "Components": {
    "SetupNotice": {
      "settingUp": "Setting up...",
      "createProfile": "Create my business profile",
      "firstTime": "First time? Run the database schema",
      "step1": "Open Supabase Dashboard",
      "step2": "SQL Editor → New query",
      "step3": "Paste the contents of",
      "step4": "Run, then click the button above"
    },
    "ConfirmDialog": {
      "confirm": "Confirm",
      "cancel": "Cancel",
      "working": "Working…",
      "close": "Close dialog"
    },
    "LoadingSpinner": {
      "loading": "Loading…"
    },
    "ActionError": {
      "dismiss": "Dismiss error"
    }
  },
  "DashboardWidgets": {
    "AppointmentAnalytics": {
      "title": "Appointment analytics",
      "subtitle": "{total} total in the last 30 days"
    },
    "LostRevenueWidget": {
      "title": "Estimated lost revenue (no-shows)",
      "subtitle": "{count} no-show(s) this month",
      "link": "Review appointments →"
    },
    "RemindersUrgencyList": {
      "title": "Reminders",
      "viewAll": "View all",
      "empty": "No pending reminders.",
      "addOne": "Add one",
      "unknownClient": "Unknown client"
    },
    "UpcomingAppointments": {
      "title": "Upcoming appointments",
      "viewAll": "View all",
      "empty": "No upcoming appointments.",
      "scheduleOne": "Schedule one"
    },
    "WeeklyTrendChart": {
      "title": "Appointments this week"
    }
  },
  "Status": {
    "appointments": {
      "pending": "Pending",
      "confirmed": "Confirmed",
      "completed": "Completed",
      "cancelled": "Cancelled",
      "no-show": "No-show"
    },
    "clients": {
      "new": "New",
      "confirmed": "Confirmed",
      "follow-up": "Follow-up",
      "closed": "Closed",
      "ghosted": "Ghosted"
    },
    "reminders": {
      "overdue": "Overdue",
      "today": "Due today",
      "soon": "Due soon",
      "later": "Upcoming"
    }
  },
  "ClientsPage": {
    "title": "Clients",
    "loading": "Loading clients…",
    "count": "{count} clients",
    "addClient": "Add Client",
    "empty": {
      "title": "No clients yet",
      "desc": "Add your first client to schedule appointments and send follow-up reminders.",
      "action": "Add your first client"
    },
    "table": {
      "name": "Name",
      "phone": "Phone",
      "service": "Service",
      "status": "Status",
      "lastContact": "Last Contact",
      "actions": "Actions"
    },
    "actions": {
      "view": "View",
      "edit": "Edit",
      "delete": "Delete"
    },
    "deleteModal": {
      "title": "Delete client?",
      "message": "Delete {name}? This cannot be undone.",
      "confirm": "Delete"
    },
    "form": {
      "editTitle": "Edit Client",
      "addTitle": "Add Client",
      "name": "Name",
      "namePlaceholder": "Jane Smith",
      "nameRequired": "Name is required.",
      "phone": "Phone",
      "phonePlaceholder": "+1 555 0100",
      "service": "Service",
      "servicePlaceholder": "Haircut, dinner reservation…",
      "status": "Status",
      "notes": "Notes",
      "notesPlaceholder": "Preferences, allergies, special requests…",
      "cancel": "Cancel",
      "saving": "Saving…",
      "saveChanges": "Save changes",
      "addClientBtn": "Add client"
    },
    "toolbar": {
      "searchPlaceholder": "Search by name, phone, or service…",
      "searchLabel": "Search clients",
      "allStatuses": "All statuses",
      "sortNameAsc": "Name A–Z",
      "sortNameDesc": "Name Z–A",
      "sortNewest": "Newest first",
      "sortOldest": "Oldest first"
    }
  },
  "ClientDetailsPage": {
    "notFound": "Client not found.",
    "loading": "Loading client profile…",
    "back": "← Back to clients",
    "phone": "Phone:",
    "service": "Service:",
    "status": "Status:",
    "revenue": "Revenue:",
    "appointmentHistory": "Appointment history",
    "newAppointment": "New appointment",
    "noAppointments": "No appointments yet for this client.",
    "table": {
      "date": "Date",
      "status": "Status",
      "amount": "Amount"
    }
  },
  "AppointmentsPage": {
    "title": "Appointments",
    "loading": "Loading appointments…",
    "count": "{count} appointments",
    "unknownClient": "Unknown client",
    "addAppointment": "Add Appointment",
    "noClients": {
      "title": "Add at least one client before scheduling appointments.",
      "action": "Go to Clients"
    },
    "empty": {
      "title": "No appointments yet",
      "desc": "Schedule your first appointment to track confirmations, attendance, and payments.",
      "action": "Add your first appointment"
    },
    "table": {
      "clientName": "Client Name",
      "date": "Date",
      "status": "Status",
      "revenue": "Revenue",
      "actions": "Actions"
    },
    "actions": {
      "edit": "Edit",
      "delete": "Delete"
    },
    "deleteModal": {
      "title": "Delete appointment?",
      "message": "Delete {name} on {date}? This cannot be undone.",
      "confirm": "Delete"
    },
    "form": {
      "editTitle": "Edit Appointment",
      "addTitle": "Add Appointment",
      "client": "Client",
      "selectClient": "Select a client",
      "clientRequired": "Please select a client.",
      "date": "Date",
      "dateRequired": "Date and time are required.",
      "status": "Status",
      "revenue": "Revenue amount",
      "notes": "Notes",
      "notesPlaceholder": "Special requests, room preference…",
      "cancel": "Cancel",
      "saving": "Saving…",
      "saveChanges": "Save changes",
      "addAppointmentBtn": "Add appointment"
    }
  },
  "RemindersPage": {
    "title": "Reminders",
    "loading": "Loading reminders…",
    "count": "{count} reminders",
    "unknownClient": "Unknown client",
    "addReminder": "Add Reminder",
    "noClients": {
      "title": "Add at least one client before creating reminders.",
      "action": "Go to Clients"
    },
    "empty": {
      "title": "No reminders yet",
      "desc": "Create follow-up reminders so you never miss a check-in with your clients.",
      "action": "Add your first reminder"
    },
    "table": {
      "clientName": "Client Name",
      "message": "Message",
      "dueDate": "Due Date",
      "status": "Status",
      "actions": "Actions"
    },
    "actions": {
      "markDone": "Mark as Done",
      "saving": "Saving…",
      "edit": "Edit",
      "delete": "Delete",
      "done": "Done"
    },
    "deleteModal": {
      "title": "Delete reminder?",
      "message": "Delete reminder for {name}? This cannot be undone.",
      "confirm": "Delete"
    },
    "form": {
      "editTitle": "Edit Reminder",
      "addTitle": "Add Reminder",
      "presetsTitle": "Quick presets",
      "presets": {
        "follow-up-24h": "Follow up in 24h",
        "appointment-24h": "Appointment reminder (24h)",
        "payment": "Payment follow-up",
        "rebook": "Rebook nudge",
        "msg-follow-up-24h": "Check in — how was your visit? Book your next appointment if you'd like.",
        "msg-appointment-24h": "Reminder: you have an appointment tomorrow. Reply to confirm or reschedule.",
        "msg-payment": "Friendly reminder about your outstanding balance. Let us know if you have questions.",
        "msg-rebook": "It's been a while — would you like to schedule your next visit?"
      },
      "client": "Client",
      "selectClient": "Select a client",
      "clientRequired": "Please select a client.",
      "message": "Message",
      "messageRequired": "Message is required.",
      "messagePlaceholder": "Follow up about their last visit…",
      "dueDate": "Due Date",
      "dateRequired": "Due date is required.",
      "cancel": "Cancel",
      "saving": "Saving…",
      "saveChanges": "Save changes",
      "addReminderBtn": "Add reminder"
    }
  }
}

fr_additions = {
  "LandingPage": {
    "nav": {
      "login": "Connexion",
      "startFreeTrial": "Essai gratuit"
    },
    "hero": {
      "badge": "Conçu pour les salons, restaurants et services",
      "titlePart1": "Cessez de perdre des réservations",
      "titlePart2": "et des clients",
      "subtitle": "Suivez vos rendez-vous, réduisez les absences et n'oubliez jamais une relance. Le moyen le plus simple de gérer vos clients.",
      "startFreeTrial": "Essai gratuit",
      "login": "Connexion →",
      "footer": "Gratuit jusqu'à 20 clients · Aucune carte de crédit requise"
    },
    "features": {
      "title": "Tout ce dont vous avez besoin pour gérer vos clients",
      "subtitle": "Des outils simples et ciblés qui résolvent de vrais problèmes pour les entreprises de services.",
      "f1": { "title": "Base de données clients", "desc": "Gardez tous vos clients organisés avec leurs coordonnées, leur historique et leur statut." },
      "f2": { "title": "Suivi des rendez-vous", "desc": "Suivez qui a confirmé, qui s'est présenté et qui a payé — le tout au même endroit." },
      "f3": { "title": "Détection des absences", "desc": "Voyez instantanément qui ne s'est pas présenté. Sachez quels clients nécessitent plus d'attention." },
      "f4": { "title": "Rappels de relance", "desc": "Définissez des rappels pour ne jamais oublier de rappeler un client. Simple et efficace." },
      "f5": { "title": "Tableau de bord", "desc": "Consultez d'un coup d'œil les rendez-vous du jour, les relances en attente et les absences." },
      "f6": { "title": "Prêt pour le multi-entreprises", "desc": "Conçu comme un SaaS dès le premier jour. Chaque entreprise dispose de son propre espace de travail." }
    },
    "pricing": {
      "title": "Une tarification simple et transparente",
      "subtitle": "Commencez gratuitement et mettez à niveau lorsque votre entreprise se développe.",
      "free": { "title": "Gratuit", "price": "0 €", "period": "/mois", "f1": "Jusqu'à 20 clients", "f2": "10 rendez-vous/mois", "f3": "Rappels basiques", "cta": "Commencer gratuitement" },
      "pro": { "badge": "Plus populaire", "title": "Pro", "price": "19 €", "period": "/mois", "f1": "Clients illimités", "f2": "Rendez-vous illimités", "f3": "Rappels prioritaires", "cta": "Essai gratuit" }
    },
    "cta": {
      "title": "Prêt à ne plus perdre de clients ?",
      "subtitle": "Rejoignez les entreprises qui suivent chaque rendez-vous et ne manquent jamais une relance.",
      "button": "Essai gratuit"
    },
    "footer": {
      "copyright": "© {year} RecallFlow. Tous droits réservés."
    }
  },
  "Auth": {
    "login": {
      "title": "Bon retour",
      "subtitle": "Connectez-vous à votre compte",
      "email": "E-mail",
      "password": "Mot de passe",
      "forgotPassword": "Mot de passe oublié ?",
      "signIn": "Se connecter",
      "signingIn": "Connexion en cours...",
      "noAccount": "Vous n'avez pas de compte ?",
      "signUp": "S'inscrire",
      "confirmationExpired": "Le lien de confirmation a expiré ou est invalide."
    },
    "signup": {
      "title": "Créez votre compte",
      "subtitle": "Commencez à suivre vos réservations gratuitement",
      "businessName": "Nom de l'entreprise",
      "email": "E-mail",
      "password": "Mot de passe",
      "createAccount": "Créer un compte",
      "creatingAccount": "Création du compte...",
      "checkEmail": "Vérifiez vos e-mails pour le lien de confirmation.",
      "haveAccount": "Vous avez déjà un compte ?",
      "signIn": "Se connecter",
      "backToLogin": "Retour à la connexion"
    },
    "forgotPassword": {
      "title": "Réinitialiser le mot de passe",
      "subtitle": "Entrez votre e-mail pour recevoir un lien de réinitialisation.",
      "email": "E-mail",
      "sendLink": "Envoyer le lien",
      "sending": "Envoi en cours…",
      "checkEmail": "Vérifiez vos e-mails pour le lien de réinitialisation.",
      "backToLogin": "Retour à la connexion"
    },
    "updatePassword": {
      "title": "Définir un nouveau mot de passe",
      "subtitle": "Choisissez un mot de passe sécurisé pour votre compte.",
      "newPassword": "Nouveau mot de passe",
      "confirmPassword": "Confirmer le mot de passe",
      "update": "Mettre à jour le mot de passe",
      "updating": "Mise à jour…",
      "verifying": "Vérification du lien…",
      "requestNew": "Demander un nouveau lien de réinitialisation",
      "expired": "Votre lien de réinitialisation a expiré ou est invalide.",
      "backToLogin": "Retour à la connexion"
    },
    "errors": {
      "invalidCredentials": "E-mail ou mot de passe invalide",
      "emailExists": "Cet e-mail existe déjà",
      "generic": "Un problème est survenu. Veuillez réessayer.",
      "businessProfile": "Impossible de créer votre profil d'entreprise. Vérifiez les logs Supabase.",
      "signedInRequired": "Vous devez être connecté.",
      "dbMissing": "Les tables de la base de données sont manquantes. Exécutez schema.sql dans Supabase."
    }
  },
  "Components": {
    "SetupNotice": {
      "settingUp": "Configuration...",
      "createProfile": "Créer mon profil d'entreprise",
      "firstTime": "Première fois ? Exécutez le schéma de la base de données",
      "step1": "Ouvrez le tableau de bord Supabase",
      "step2": "Éditeur SQL → Nouvelle requête",
      "step3": "Collez le contenu de",
      "step4": "Exécutez, puis cliquez sur le bouton ci-dessus"
    },
    "ConfirmDialog": {
      "confirm": "Confirmer",
      "cancel": "Annuler",
      "working": "En cours…",
      "close": "Fermer la boîte de dialogue"
    },
    "LoadingSpinner": {
      "loading": "Chargement…"
    },
    "ActionError": {
      "dismiss": "Fermer l'erreur"
    }
  },
  "DashboardWidgets": {
    "AppointmentAnalytics": {
      "title": "Analyses des rendez-vous",
      "subtitle": "{total} au total dans les 30 derniers jours"
    },
    "LostRevenueWidget": {
      "title": "Perte de revenus estimée (absences)",
      "subtitle": "{count} absence(s) ce mois-ci",
      "link": "Voir les rendez-vous →"
    },
    "RemindersUrgencyList": {
      "title": "Rappels",
      "viewAll": "Voir tout",
      "empty": "Aucun rappel en attente.",
      "addOne": "En ajouter un",
      "unknownClient": "Client inconnu"
    },
    "UpcomingAppointments": {
      "title": "Prochains rendez-vous",
      "viewAll": "Voir tout",
      "empty": "Aucun rendez-vous à venir.",
      "scheduleOne": "En programmer un"
    },
    "WeeklyTrendChart": {
      "title": "Rendez-vous de cette semaine"
    }
  },
  "Status": {
    "appointments": {
      "pending": "En attente",
      "confirmed": "Confirmé",
      "completed": "Terminé",
      "cancelled": "Annulé",
      "no-show": "Absence"
    },
    "clients": {
      "new": "Nouveau",
      "confirmed": "Confirmé",
      "follow-up": "À relancer",
      "closed": "Fermé",
      "ghosted": "Fantôme"
    },
    "reminders": {
      "overdue": "En retard",
      "today": "Aujourd'hui",
      "soon": "Bientôt",
      "later": "À venir"
    }
  },
  "ClientsPage": {
    "title": "Clients",
    "loading": "Chargement des clients…",
    "count": "{count} clients",
    "addClient": "Ajouter un client",
    "empty": {
      "title": "Aucun client pour le moment",
      "desc": "Ajoutez votre premier client pour planifier des rendez-vous et envoyer des rappels.",
      "action": "Ajouter votre premier client"
    },
    "table": {
      "name": "Nom",
      "phone": "Téléphone",
      "service": "Service",
      "status": "Statut",
      "lastContact": "Dernier contact",
      "actions": "Actions"
    },
    "actions": {
      "view": "Voir",
      "edit": "Modifier",
      "delete": "Supprimer"
    },
    "deleteModal": {
      "title": "Supprimer le client ?",
      "message": "Supprimer {name} ? Cette action est irréversible.",
      "confirm": "Supprimer"
    },
    "form": {
      "editTitle": "Modifier le client",
      "addTitle": "Ajouter un client",
      "name": "Nom",
      "namePlaceholder": "Jeanne Dupont",
      "nameRequired": "Le nom est requis.",
      "phone": "Téléphone",
      "phonePlaceholder": "+33 6 12 34 56 78",
      "service": "Service",
      "servicePlaceholder": "Coupe de cheveux, réservation…",
      "status": "Statut",
      "notes": "Notes",
      "notesPlaceholder": "Préférences, allergies, demandes spéciales…",
      "cancel": "Annuler",
      "saving": "Enregistrement…",
      "saveChanges": "Enregistrer",
      "addClientBtn": "Ajouter le client"
    },
    "toolbar": {
      "searchPlaceholder": "Rechercher par nom, téléphone, ou service…",
      "searchLabel": "Rechercher des clients",
      "allStatuses": "Tous les statuts",
      "sortNameAsc": "Nom A–Z",
      "sortNameDesc": "Nom Z–A",
      "sortNewest": "Plus récents d'abord",
      "sortOldest": "Plus anciens d'abord"
    }
  },
  "ClientDetailsPage": {
    "notFound": "Client introuvable.",
    "loading": "Chargement du profil du client…",
    "back": "← Retour aux clients",
    "phone": "Téléphone :",
    "service": "Service :",
    "status": "Statut :",
    "revenue": "Revenus :",
    "appointmentHistory": "Historique des rendez-vous",
    "newAppointment": "Nouveau rendez-vous",
    "noAppointments": "Aucun rendez-vous pour le moment.",
    "table": {
      "date": "Date",
      "status": "Statut",
      "amount": "Montant"
    }
  },
  "AppointmentsPage": {
    "title": "Rendez-vous",
    "loading": "Chargement des rendez-vous…",
    "count": "{count} rendez-vous",
    "unknownClient": "Client inconnu",
    "addAppointment": "Ajouter un rendez-vous",
    "noClients": {
      "title": "Ajoutez au moins un client avant de planifier des rendez-vous.",
      "action": "Aller aux clients"
    },
    "empty": {
      "title": "Aucun rendez-vous pour le moment",
      "desc": "Planifiez votre premier rendez-vous pour suivre les confirmations, les présences et les paiements.",
      "action": "Ajouter votre premier rendez-vous"
    },
    "table": {
      "clientName": "Nom du client",
      "date": "Date",
      "status": "Statut",
      "revenue": "Revenus",
      "actions": "Actions"
    },
    "actions": {
      "edit": "Modifier",
      "delete": "Supprimer"
    },
    "deleteModal": {
      "title": "Supprimer le rendez-vous ?",
      "message": "Supprimer le rendez-vous de {name} le {date} ? Cette action est irréversible.",
      "confirm": "Supprimer"
    },
    "form": {
      "editTitle": "Modifier le rendez-vous",
      "addTitle": "Ajouter un rendez-vous",
      "client": "Client",
      "selectClient": "Sélectionner un client",
      "clientRequired": "Veuillez sélectionner un client.",
      "date": "Date",
      "dateRequired": "La date et l'heure sont requises.",
      "status": "Statut",
      "revenue": "Montant (Revenus)",
      "notes": "Notes",
      "notesPlaceholder": "Demandes spéciales, préférence de salle…",
      "cancel": "Annuler",
      "saving": "Enregistrement…",
      "saveChanges": "Enregistrer",
      "addAppointmentBtn": "Ajouter le rendez-vous"
    }
  },
  "RemindersPage": {
    "title": "Rappels",
    "loading": "Chargement des rappels…",
    "count": "{count} rappels",
    "unknownClient": "Client inconnu",
    "addReminder": "Ajouter un rappel",
    "noClients": {
      "title": "Ajoutez au moins un client avant de créer des rappels.",
      "action": "Aller aux clients"
    },
    "empty": {
      "title": "Aucun rappel pour le moment",
      "desc": "Créez des rappels de relance pour ne jamais manquer un suivi avec vos clients.",
      "action": "Ajouter votre premier rappel"
    },
    "table": {
      "clientName": "Nom du client",
      "message": "Message",
      "dueDate": "Date d'échéance",
      "status": "Statut",
      "actions": "Actions"
    },
    "actions": {
      "markDone": "Marquer comme terminé",
      "saving": "Enregistrement…",
      "edit": "Modifier",
      "delete": "Supprimer",
      "done": "Terminé"
    },
    "deleteModal": {
      "title": "Supprimer le rappel ?",
      "message": "Supprimer le rappel pour {name} ? Cette action est irréversible.",
      "confirm": "Supprimer"
    },
    "form": {
      "editTitle": "Modifier le rappel",
      "addTitle": "Ajouter un rappel",
      "presetsTitle": "Modèles rapides",
      "presets": {
        "follow-up-24h": "Relance dans 24h",
        "appointment-24h": "Rappel de rendez-vous (24h)",
        "payment": "Relance de paiement",
        "rebook": "Suggestion de nouvelle réservation",
        "msg-follow-up-24h": "Bonjour — comment s'est passée votre visite ? Réservez votre prochain rendez-vous si vous le souhaitez.",
        "msg-appointment-24h": "Rappel : vous avez un rendez-vous demain. Répondez pour confirmer ou replanifier.",
        "msg-payment": "Petit rappel concernant votre solde impayé. N'hésitez pas si vous avez des questions.",
        "msg-rebook": "Cela fait un moment — souhaitez-vous planifier votre prochaine visite ?"
      },
      "client": "Client",
      "selectClient": "Sélectionner un client",
      "clientRequired": "Veuillez sélectionner un client.",
      "message": "Message",
      "messageRequired": "Le message est requis.",
      "messagePlaceholder": "Relance concernant leur dernière visite…",
      "dueDate": "Date d'échéance",
      "dateRequired": "La date d'échéance est requise.",
      "cancel": "Annuler",
      "saving": "Enregistrement…",
      "saveChanges": "Enregistrer",
      "addReminderBtn": "Ajouter le rappel"
    }
  }
}

ar_additions = {
  "LandingPage": {
    "nav": {
      "login": "تسجيل الدخول",
      "startFreeTrial": "ابدأ التجربة المجانية"
    },
    "hero": {
      "badge": "مصمم للصالونات والمطاعم والخدمات",
      "titlePart1": "توقف عن خسارة الحجوزات",
      "titlePart2": "والعملاء",
      "subtitle": "تتبع المواعيد، قلل من حالات عدم الحضور، ولا تنسى أي متابعة. أسهل طريقة لإدارة علاقات العملاء.",
      "startFreeTrial": "ابدأ التجربة المجانية",
      "login": "تسجيل الدخول ←",
      "footer": "مجاني حتى 20 عميلاً · لا يلزم وجود بطاقة ائتمان"
    },
    "features": {
      "title": "كل ما تحتاجه لإدارة العملاء",
      "subtitle": "أدوات بسيطة ومركزة تحل مشاكل حقيقية لشركات الخدمات.",
      "f1": { "title": "قاعدة بيانات العملاء", "desc": "حافظ على تنظيم جميع عملائك مع معلومات الاتصال وسجل الخدمة وتتبع الحالة." },
      "f2": { "title": "تتبع المواعيد", "desc": "تتبع من أكد حضوره ومن حضر ومن دفع - كل ذلك في مكان واحد." },
      "f3": { "title": "اكتشاف حالات عدم الحضور", "desc": "شاهد فوراً من لم يحضر. اعرف أي العملاء يحتاجون لاهتمام إضافي." },
      "f4": { "title": "تذكيرات المتابعة", "desc": "اضبط التذكيرات حتى لا تنسى الاتصال بعميل. بسيط وفعال." },
      "f5": { "title": "تحليلات لوحة التحكم", "desc": "شاهد مواعيد اليوم والمتابعات المعلقة وحالات عدم الحضور في لمحة." },
      "f6": { "title": "جاهز للشركات المتعددة", "desc": "مبني كخدمة سحابية من اليوم الأول. كل شركة تحصل على مساحة عمل مستقلة." }
    },
    "pricing": {
      "title": "تسعير بسيط وشفاف",
      "subtitle": "ابدأ مجاناً وقم بالترقية عندما ينمو عملك. لا توجد رسوم خفية.",
      "free": { "title": "مجاني", "price": "0$", "period": "/شهر", "f1": "حتى 20 عميلاً", "f2": "10 مواعيد/شهر", "f3": "تذكيرات أساسية", "cta": "ابدأ مجاناً" },
      "pro": { "badge": "الأكثر شعبية", "title": "برو", "price": "19$", "period": "/شهر", "f1": "عملاء غير محدودين", "f2": "مواعيد غير محدودة", "f3": "تذكيرات ذات أولوية", "cta": "ابدأ التجربة المجانية" }
    },
    "cta": {
      "title": "هل أنت مستعد للتوقف عن خسارة العملاء؟",
      "subtitle": "انضم للشركات التي تتتبع كل موعد ولا تفوت أي متابعة.",
      "button": "ابدأ التجربة المجانية"
    },
    "footer": {
      "copyright": "© {year} RecallFlow. جميع الحقوق محفوظة."
    }
  },
  "Auth": {
    "login": {
      "title": "مرحباً بعودتك",
      "subtitle": "سجل الدخول إلى حسابك",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "forgotPassword": "هل نسيت كلمة المرور؟",
      "signIn": "تسجيل الدخول",
      "signingIn": "جارٍ تسجيل الدخول...",
      "noAccount": "ليس لديك حساب؟",
      "signUp": "إنشاء حساب",
      "confirmationExpired": "رابط التأكيد منتهي الصلاحية أو غير صالح."
    },
    "signup": {
      "title": "قم بإنشاء حسابك",
      "subtitle": "ابدأ في تتبع حجوزاتك مجاناً",
      "businessName": "اسم النشاط التجاري",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "createAccount": "إنشاء الحساب",
      "creatingAccount": "جارٍ إنشاء الحساب...",
      "checkEmail": "تحقق من بريدك الإلكتروني للحصول على رابط التأكيد.",
      "haveAccount": "لديك حساب بالفعل؟",
      "signIn": "تسجيل الدخول",
      "backToLogin": "العودة لتسجيل الدخول"
    },
    "forgotPassword": {
      "title": "إعادة تعيين كلمة المرور",
      "subtitle": "أدخل بريدك الإلكتروني لتلقي رابط إعادة التعيين.",
      "email": "البريد الإلكتروني",
      "sendLink": "إرسال الرابط",
      "sending": "جارٍ الإرسال…",
      "checkEmail": "تحقق من بريدك الإلكتروني للحصول على رابط إعادة التعيين.",
      "backToLogin": "العودة لتسجيل الدخول"
    },
    "updatePassword": {
      "title": "تعيين كلمة مرور جديدة",
      "subtitle": "اختر كلمة مرور قوية لحسابك.",
      "newPassword": "كلمة المرور الجديدة",
      "confirmPassword": "تأكيد كلمة المرور",
      "update": "تحديث كلمة المرور",
      "updating": "جارٍ التحديث…",
      "verifying": "جارٍ التحقق من الرابط…",
      "requestNew": "طلب رابط إعادة تعيين جديد",
      "expired": "رابط إعادة التعيين منتهي الصلاحية أو غير صالح.",
      "backToLogin": "العودة لتسجيل الدخول"
    },
    "errors": {
      "invalidCredentials": "البريد الإلكتروني أو كلمة المرور غير صحيحة",
      "emailExists": "البريد الإلكتروني موجود بالفعل",
      "generic": "حدث خطأ ما. حاول مرة أخرى.",
      "businessProfile": "تعذر إنشاء ملف تعريف نشاطك التجاري. تحقق من سجلات Supabase.",
      "signedInRequired": "يجب تسجيل الدخول.",
      "dbMissing": "جداول قاعدة البيانات مفقودة. قم بتشغيل schema.sql في Supabase أولاً."
    }
  },
  "Components": {
    "SetupNotice": {
      "settingUp": "جارٍ الإعداد...",
      "createProfile": "إنشاء ملف النشاط التجاري",
      "firstTime": "أول مرة؟ قم بتشغيل مخطط قاعدة البيانات",
      "step1": "افتح لوحة تحكم Supabase",
      "step2": "محرر SQL ← استعلام جديد",
      "step3": "انسخ والصق محتويات",
      "step4": "قم بالتشغيل، ثم انقر فوق الزر أعلاه"
    },
    "ConfirmDialog": {
      "confirm": "تأكيد",
      "cancel": "إلغاء",
      "working": "جارٍ العمل…",
      "close": "إغلاق النافذة"
    },
    "LoadingSpinner": {
      "loading": "جارٍ التحميل…"
    },
    "ActionError": {
      "dismiss": "تجاهل الخطأ"
    }
  },
  "DashboardWidgets": {
    "AppointmentAnalytics": {
      "title": "تحليلات المواعيد",
      "subtitle": "{total} إجمالي في آخر 30 يوماً"
    },
    "LostRevenueWidget": {
      "title": "الإيرادات المفقودة المقدرة (عدم الحضور)",
      "subtitle": "{count} حالة عدم حضور هذا الشهر",
      "link": "مراجعة المواعيد ←"
    },
    "RemindersUrgencyList": {
      "title": "التذكيرات",
      "viewAll": "عرض الكل",
      "empty": "لا توجد تذكيرات معلقة.",
      "addOne": "إضافة تذكير",
      "unknownClient": "عميل غير معروف"
    },
    "UpcomingAppointments": {
      "title": "المواعيد القادمة",
      "viewAll": "عرض الكل",
      "empty": "لا توجد مواعيد قادمة.",
      "scheduleOne": "جدولة موعد"
    },
    "WeeklyTrendChart": {
      "title": "مواعيد هذا الأسبوع"
    }
  },
  "Status": {
    "appointments": {
      "pending": "قيد الانتظار",
      "confirmed": "مؤكد",
      "completed": "مكتمل",
      "cancelled": "ملغى",
      "no-show": "لم يحضر"
    },
    "clients": {
      "new": "جديد",
      "confirmed": "مؤكد",
      "follow-up": "متابعة",
      "closed": "مغلق",
      "ghosted": "اختفى"
    },
    "reminders": {
      "overdue": "متأخر",
      "today": "اليوم",
      "soon": "قريباً",
      "later": "قادم"
    }
  },
  "ClientsPage": {
    "title": "العملاء",
    "loading": "جارٍ تحميل العملاء…",
    "count": "{count} عملاء",
    "addClient": "إضافة عميل",
    "empty": {
      "title": "لا يوجد عملاء بعد",
      "desc": "أضف أول عميل لك لجدولة المواعيد وإرسال تذكيرات المتابعة.",
      "action": "إضافة أول عميل"
    },
    "table": {
      "name": "الاسم",
      "phone": "الهاتف",
      "service": "الخدمة",
      "status": "الحالة",
      "lastContact": "آخر اتصال",
      "actions": "الإجراءات"
    },
    "actions": {
      "view": "عرض",
      "edit": "تعديل",
      "delete": "حذف"
    },
    "deleteModal": {
      "title": "حذف العميل؟",
      "message": "هل تريد حذف {name}؟ لا يمكن التراجع عن هذا الإجراء.",
      "confirm": "حذف"
    },
    "form": {
      "editTitle": "تعديل العميل",
      "addTitle": "إضافة عميل",
      "name": "الاسم",
      "namePlaceholder": "محمد أحمد",
      "nameRequired": "الاسم مطلوب.",
      "phone": "الهاتف",
      "phonePlaceholder": "+971 50 123 4567",
      "service": "الخدمة",
      "servicePlaceholder": "قص شعر، حجز عشاء…",
      "status": "الحالة",
      "notes": "ملاحظات",
      "notesPlaceholder": "التفضيلات، الحساسية، طلبات خاصة…",
      "cancel": "إلغاء",
      "saving": "جارٍ الحفظ…",
      "saveChanges": "حفظ التغييرات",
      "addClientBtn": "إضافة العميل"
    },
    "toolbar": {
      "searchPlaceholder": "البحث بالاسم أو الهاتف أو الخدمة…",
      "searchLabel": "البحث عن العملاء",
      "allStatuses": "جميع الحالات",
      "sortNameAsc": "الاسم (أ-ي)",
      "sortNameDesc": "الاسم (ي-أ)",
      "sortNewest": "الأحدث أولاً",
      "sortOldest": "الأقدم أولاً"
    }
  },
  "ClientDetailsPage": {
    "notFound": "لم يتم العثور على العميل.",
    "loading": "جارٍ تحميل ملف العميل…",
    "back": "← العودة إلى العملاء",
    "phone": "الهاتف:",
    "service": "الخدمة:",
    "status": "الحالة:",
    "revenue": "الإيرادات:",
    "appointmentHistory": "سجل المواعيد",
    "newAppointment": "موعد جديد",
    "noAppointments": "لا توجد مواعيد بعد لهذا العميل.",
    "table": {
      "date": "التاريخ",
      "status": "الحالة",
      "amount": "المبلغ"
    }
  },
  "AppointmentsPage": {
    "title": "المواعيد",
    "loading": "جارٍ تحميل المواعيد…",
    "count": "{count} مواعيد",
    "unknownClient": "عميل غير معروف",
    "addAppointment": "إضافة موعد",
    "noClients": {
      "title": "أضف عميلاً واحداً على الأقل قبل جدولة المواعيد.",
      "action": "الانتقال إلى العملاء"
    },
    "empty": {
      "title": "لا توجد مواعيد بعد",
      "desc": "قم بجدولة أول موعد لتتبع التأكيدات والحضور والمدفوعات.",
      "action": "إضافة أول موعد"
    },
    "table": {
      "clientName": "اسم العميل",
      "date": "التاريخ",
      "status": "الحالة",
      "revenue": "الإيرادات",
      "actions": "الإجراءات"
    },
    "actions": {
      "edit": "تعديل",
      "delete": "حذف"
    },
    "deleteModal": {
      "title": "حذف الموعد؟",
      "message": "هل تريد حذف موعد {name} في {date}؟ لا يمكن التراجع عن هذا الإجراء.",
      "confirm": "حذف"
    },
    "form": {
      "editTitle": "تعديل الموعد",
      "addTitle": "إضافة موعد",
      "client": "العميل",
      "selectClient": "اختر عميلاً",
      "clientRequired": "يرجى اختيار عميل.",
      "date": "التاريخ",
      "dateRequired": "التاريخ والوقت مطلوبان.",
      "status": "الحالة",
      "revenue": "مبلغ الإيرادات",
      "notes": "ملاحظات",
      "notesPlaceholder": "طلبات خاصة، تفضيل الغرفة…",
      "cancel": "إلغاء",
      "saving": "جارٍ الحفظ…",
      "saveChanges": "حفظ التغييرات",
      "addAppointmentBtn": "إضافة الموعد"
    }
  },
  "RemindersPage": {
    "title": "التذكيرات",
    "loading": "جارٍ تحميل التذكيرات…",
    "count": "{count} تذكيرات",
    "unknownClient": "عميل غير معروف",
    "addReminder": "إضافة تذكير",
    "noClients": {
      "title": "أضف عميلاً واحداً على الأقل قبل إنشاء التذكيرات.",
      "action": "الانتقال إلى العملاء"
    },
    "empty": {
      "title": "لا توجد تذكيرات بعد",
      "desc": "قم بإنشاء تذكيرات متابعة حتى لا تفوت أي تواصل مع عملائك.",
      "action": "إضافة أول تذكير"
    },
    "table": {
      "clientName": "اسم العميل",
      "message": "الرسالة",
      "dueDate": "تاريخ الاستحقاق",
      "status": "الحالة",
      "actions": "الإجراءات"
    },
    "actions": {
      "markDone": "تحديد كمكتمل",
      "saving": "جارٍ الحفظ…",
      "edit": "تعديل",
      "delete": "حذف",
      "done": "مكتمل"
    },
    "deleteModal": {
      "title": "حذف التذكير؟",
      "message": "هل تريد حذف التذكير لـ {name}؟ لا يمكن التراجع عن هذا الإجراء.",
      "confirm": "حذف"
    },
    "form": {
      "editTitle": "تعديل التذكير",
      "addTitle": "إضافة تذكير",
      "presetsTitle": "قوالب سريعة",
      "presets": {
        "follow-up-24h": "متابعة خلال 24 ساعة",
        "appointment-24h": "تذكير بالموعد (24 ساعة)",
        "payment": "متابعة الدفع",
        "rebook": "اقتراح إعادة الحجز",
        "msg-follow-up-24h": "مرحباً - كيف كانت زيارتك؟ احجز موعدك القادم إذا كنت ترغب.",
        "msg-appointment-24h": "تذكير: لديك موعد غداً. يرجى الرد للتأكيد أو إعادة الجدولة.",
        "msg-payment": "تذكير ودي بخصوص رصيدك المستحق. أخبرنا إذا كان لديك أي أسئلة.",
        "msg-rebook": "لقد مر بعض الوقت - هل ترغب في جدولة زيارتك القادمة؟"
      },
      "client": "العميل",
      "selectClient": "اختر عميلاً",
      "clientRequired": "يرجى اختيار عميل.",
      "message": "الرسالة",
      "messageRequired": "الرسالة مطلوبة.",
      "messagePlaceholder": "متابعة بشأن زيارتهم الأخيرة…",
      "dueDate": "تاريخ الاستحقاق",
      "dateRequired": "تاريخ الاستحقاق مطلوب.",
      "cancel": "إلغاء",
      "saving": "جارٍ الحفظ…",
      "saveChanges": "حفظ التغييرات",
      "addReminderBtn": "إضافة التذكير"
    }
  }
}

for filename, additions in [("en.json", en_additions), ("fr.json", fr_additions), ("ar.json", ar_additions)]:
    filepath = os.path.join(BASE_DIR, filename)
    with open(filepath, 'r') as f:
        data = json.load(f)
    
    data.update(additions)
    
    with open(filepath, 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Updated {filename}")

