import React, { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, Check, Loader2 } from 'lucide-react';
import 'react-day-picker/dist/style.css';

const services = [
    "Massothérapie Manuelle",
    "Massage Sportif",
    "Analyse du Dos",
    "Analyse du Dos + Massothérapie",
    "Analyse + Thérapie par Andullation",
    "Analyse du Dos + Tecarthérapie",
    "Thérapie par Andullation",
    "Massothérapie + Tecarthérapie + Thérapie par Andullation",
    "I-Motion, Thérapie avec Électrostimulation Musculaire",
    "Analyse du Dos + Électrostimulation Musculaire",
    "Séance Complète",
    "Suivi Spécial"
  ];

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>("");
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) setStep(2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !selectedService) return;

    setLoading(true);
    setError(null);

    try {
      // Use direct Netlify function URL for now
      // TODO: Change back to /api/book once redirections are working
      const apiUrl = '/.netlify/functions/book';
      console.log('Calling API URL:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          service: selectedService,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
        }),
      });

      console.log('Booking response status:', response.status);
      const data = await response.json().catch(() => ({})); // Handle non-JSON responses

      if (response.ok) {
        setSuccess(true);
      } else {
        console.error('Booking failed:', data);
        setError(data.error || `Erreur serveur (${response.status})`);
      }
    } catch (err) {
      console.error('Booking fetch error:', err);
      setError('Erreur de connexion au serveur. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section id="booking" className="py-24 bg-teal-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-12 shadow-xl"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Réservation Confirmée !</h2>
            <p className="text-gray-600 mb-8">
              Merci {formData.name}. Votre rendez-vous pour {selectedService} le {selectedDate && format(selectedDate, 'd MMMM yyyy', { locale: fr })} à {selectedTime} a été enregistré.
            </p>
            <button
              onClick={() => { setSuccess(false); setStep(1); setSelectedDate(undefined); setSelectedTime(null); }}
              className="bg-teal-600 text-white px-8 py-3 rounded-full font-bold hover:bg-teal-700 transition-colors"
            >
              Nouvelle Réservation
            </button>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="py-24 bg-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-teal-600 font-semibold tracking-wider uppercase text-sm">Rendez-vous</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Réservez votre séance</h2>
          <p className="text-gray-600 mt-4">Choisissez le créneau qui vous convient le mieux.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
          {/* Sidebar / Steps */}
          <div className="bg-teal-900 text-white p-8 lg:w-1/3 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-8">Votre Réservation</h3>
              <div className="space-y-6">
                <div className={`flex items-center gap-4 ${step >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center font-bold text-teal-900">1</div>
                  <div>
                    <p className="font-semibold">Date & Service</p>
                    {selectedDate && <p className="text-sm text-lime-300">{format(selectedDate, 'd MMMM yyyy', { locale: fr })}</p>}
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${step >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center font-bold text-teal-900">2</div>
                  <div>
                    <p className="font-semibold">Heure</p>
                    {selectedTime && <p className="text-sm text-lime-300">{selectedTime}</p>}
                  </div>
                </div>
                <div className={`flex items-center gap-4 ${step >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                  <div className="w-8 h-8 rounded-full bg-lime-500 flex items-center justify-center font-bold text-teal-900">3</div>
                  <div>
                    <p className="font-semibold">Coordonnées</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-teal-800">
              <p className="text-sm text-teal-200">
                Besoin d'aide ? Appelez-nous au <br />
                <span className="text-white font-bold text-lg">+237 674 51 81 13</span>
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 lg:w-2/3 bg-white">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CalendarIcon className="text-teal-600" /> Choisir une date
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <DayPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={handleDateSelect}
                      locale={fr}
                      disabled={{ before: new Date() }}
                      modifiersClassNames={{
                        selected: 'bg-teal-600 text-white hover:bg-teal-700 rounded-full',
                        today: 'text-teal-600 font-bold'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Type de soin</label>
                    <div className="grid grid-cols-1 gap-2">
                      {services.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedService(s)}
                          className={`text-left px-4 py-3 rounded-lg border transition-all ${
                            selectedService === s
                              ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium'
                              : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 mb-4 hover:text-teal-600">← Retour</button>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="text-teal-600" /> Choisir une heure
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="py-3 px-4 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 transition-all font-medium"
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <p className="mt-6 text-sm text-gray-500">
                  * Les créneaux grisés sont indisponibles. (Note: Intégration réelle Google Calendar requise pour le filtrage dynamique)
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button onClick={() => setStep(2)} className="text-sm text-gray-500 mb-4 hover:text-teal-600">← Retour</button>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Vos Coordonnées</h3>
                <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:border-teal-500 outline-none"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirmer le Rendez-vous'}
                  </button>
                </form>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
