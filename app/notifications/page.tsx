'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, Bell, Send, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  attendees: string[];
}

interface Notification {
  id: string;
  eventId: string;
  eventName: string;
  type: 'email' | 'sms' | 'whatsapp';
  status: 'sent' | 'pending' | 'scheduled';
  recipients: number;
  message: string;
  sentAt?: string;
  scheduledFor?: string;
}

export default function Notifications() {
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [notificationType, setNotificationType] = useState<'email' | 'sms' | 'whatsapp'>('email');
  const [message, setMessage] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }

    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      setNotifications(JSON.parse(storedNotifications));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  const getMessageTemplate = (event: Event, type: string) => {
    const templates = {
      reminder: `Hi there! 👋\n\nThis is a friendly reminder about "${event.name}" scheduled for ${format(new Date(event.date), 'MMMM dd, yyyy')} at ${event.time}.\n\nWe're looking forward to seeing you there!\n\nVenue: Check your registration email for details.\n\nBest regards,\nEvent Management Team`,

      confirmation: `Thank you for registering! ✅\n\nYour registration for "${event.name}" has been confirmed.\n\n📅 Date: ${format(new Date(event.date), 'MMMM dd, yyyy')}\n🕐 Time: ${event.time}\n\nYou'll receive a reminder 24 hours before the event.\n\nSee you there!`,

      update: `Important Update 🔔\n\nThere has been an update to "${event.name}".\n\nPlease check the event page for the latest information.\n\nIf you have any questions, feel free to reach out.\n\nThank you!`,

      followup: `Thank you for attending! 🎉\n\nWe hope you enjoyed "${event.name}".\n\nWe'd love to hear your feedback! Please take a moment to share your thoughts.\n\nStay tuned for more upcoming events.\n\nBest regards,\nEvent Management Team`
    };
    return templates[type as keyof typeof templates] || '';
  };

  const handleSendNotification = () => {
    if (!selectedEvent || !message) {
      alert('Please select an event and enter a message');
      return;
    }

    const event = events.find(e => e.id === selectedEvent);
    if (!event) return;

    const newNotification: Notification = {
      id: Date.now().toString(),
      eventId: event.id,
      eventName: event.name,
      type: notificationType,
      status: scheduleTime ? 'scheduled' : 'sent',
      recipients: event.attendees.length,
      message,
      sentAt: scheduleTime ? undefined : new Date().toISOString(),
      scheduledFor: scheduleTime || undefined,
    };

    setNotifications(prev => [newNotification, ...prev]);

    setMessage('');
    setScheduleTime('');

    alert(`Notification ${scheduleTime ? 'scheduled' : 'sent'} successfully!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/admin" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Bell className="w-8 h-8 text-orange-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Notifications & Reminders</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Notification</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Event</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Choose an event...</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} - {event.attendees.length} attendees
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNotificationType('email')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      notificationType === 'email'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationType('sms')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      notificationType === 'sms'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    SMS
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationType('whatsapp')}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition ${
                      notificationType === 'whatsapp'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message Templates</label>
                <div className="grid grid-cols-2 gap-2">
                  {['reminder', 'confirmation', 'update', 'followup'].map(template => (
                    <button
                      key={template}
                      type="button"
                      onClick={() => {
                        const event = events.find(e => e.id === selectedEvent);
                        if (event) {
                          setMessage(getMessageTemplate(event, template));
                        } else {
                          alert('Please select an event first');
                        }
                      }}
                      className="bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 transition text-sm capitalize"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter your message here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule For (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to send immediately
                </p>
              </div>

              <button
                onClick={handleSendNotification}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 font-semibold"
              >
                <Send className="w-5 h-5" />
                {scheduleTime ? 'Schedule Notification' : 'Send Now'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification History</h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p>No notifications sent yet</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div key={notification.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(notification.type)}
                        <h3 className="font-semibold text-gray-900">{notification.eventName}</h3>
                      </div>
                      {getStatusIcon(notification.status)}
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-3">{notification.message}</p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {notification.recipients} {notification.recipients === 1 ? 'recipient' : 'recipients'}
                      </span>
                      <span>
                        {notification.status === 'sent' && notification.sentAt &&
                          `Sent ${format(new Date(notification.sentAt), 'MMM dd, yyyy HH:mm')}`
                        }
                        {notification.status === 'scheduled' && notification.scheduledFor &&
                          `Scheduled for ${format(new Date(notification.scheduledFor), 'MMM dd, yyyy HH:mm')}`
                        }
                      </span>
                    </div>

                    <div className="mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                        notification.type === 'email' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'sms' ? 'bg-green-100 text-green-800' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {notification.type.toUpperCase()}
                      </span>
                      <span className={`inline-block ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                        notification.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {notification.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Notification Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <Mail className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Email Alerts</h4>
              <p className="text-sm text-gray-600">Send detailed email notifications to all attendees with event information and updates</p>
            </div>
            <div className="text-center p-4">
              <MessageSquare className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">SMS Notifications</h4>
              <p className="text-sm text-gray-600">Quick text message reminders for urgent updates and last-minute changes</p>
            </div>
            <div className="text-center p-4">
              <MessageSquare className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">WhatsApp Messages</h4>
              <p className="text-sm text-gray-600">Engage attendees through WhatsApp for interactive communication</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
