'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, Edit, Trash2, Plus, BarChart3, ArrowLeft, Clock, MapPin, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Event {
  id: string;
  name: string;
  date: string;
  time: string;
  description: string;
  venue: string;
  speakers: string[];
  agenda: string[];
  attendees: string[];
  maxAttendees?: number;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    time: '',
    description: '',
    venue: '',
    speakers: '',
    agenda: '',
    maxAttendees: '',
  });
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  const checkTimeConflicts = (date: string, time: string, currentEventId?: string) => {
    const conflictingEvents = events.filter(event => {
      if (currentEventId && event.id === currentEventId) return false;
      return event.date === date && event.time === time;
    });
    return conflictingEvents;
  };

  const generateTimeSlots = (date: string) => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      const conflicts = checkTimeConflicts(date, time);
      if (conflicts.length === 0) {
        slots.push(time);
      }
    }
    return slots.slice(0, 5);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'date' && value) {
      const suggested = generateTimeSlots(value);
      setSuggestedSlots(suggested);
    }

    if ((name === 'date' || name === 'time') && formData.date && formData.time) {
      const conflictingEvents = checkTimeConflicts(
        name === 'date' ? value : formData.date,
        name === 'time' ? value : formData.time,
        editingEvent?.id
      );
      setConflicts(conflictingEvents.map(e => e.name));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const eventData: Event = {
      id: editingEvent?.id || Date.now().toString(),
      name: formData.name,
      date: formData.date,
      time: formData.time,
      description: formData.description,
      venue: formData.venue,
      speakers: formData.speakers.split(',').map(s => s.trim()).filter(s => s),
      agenda: formData.agenda.split('\n').filter(a => a.trim()),
      attendees: editingEvent?.attendees || [],
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
    };

    if (editingEvent) {
      setEvents(events.map(e => e.id === editingEvent.id ? eventData : e));
    } else {
      setEvents([...events, eventData]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      time: '',
      description: '',
      venue: '',
      speakers: '',
      agenda: '',
      maxAttendees: '',
    });
    setShowForm(false);
    setEditingEvent(null);
    setConflicts([]);
    setSuggestedSlots([]);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      date: event.date,
      time: event.time,
      description: event.description,
      venue: event.venue,
      speakers: event.speakers.join(', '),
      agenda: event.agenda.join('\n'),
      maxAttendees: event.maxAttendees?.toString() || '',
    });
    setShowForm(true);

    const suggested = generateTimeSlots(event.date);
    setSuggestedSlots(suggested);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== id));
    }
  };

  const chartData = events.map(event => ({
    name: event.name.substring(0, 15) + (event.name.length > 15 ? '...' : ''),
    attendees: event.attendees.length,
  }));

  const monthlyData = events.reduce((acc: any[], event) => {
    const month = format(new Date(event.date), 'MMM yyyy');
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.events += 1;
      existing.attendees += event.attendees.length;
    } else {
      acc.push({ month, events: 1, attendees: event.attendees.length });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Calendar className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/notifications" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                Notifications
              </Link>
              <Link href="/ai-assistant" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => {
              setShowForm(!showForm);
              if (showForm) resetForm();
            }}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {showForm ? 'Cancel' : 'Create New Event'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Tech Conference 2024"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {conflicts.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">⚠️ Time Conflict Detected!</p>
                  <p className="text-red-700 text-sm">
                    The following events are already scheduled at this time: {conflicts.join(', ')}
                  </p>
                </div>
              )}

              {suggestedSlots.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">💡 Suggested Available Time Slots:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedSlots.map(slot => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, time: slot }))}
                        className="bg-green-100 text-green-800 px-3 py-1 rounded hover:bg-green-200 transition text-sm"
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Convention Center, Hall A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Speakers (comma-separated)
                </label>
                <input
                  type="text"
                  name="speakers"
                  value={formData.speakers}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="John Doe, Jane Smith, Bob Johnson"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agenda (one item per line)
                </label>
                <textarea
                  name="agenda"
                  value={formData.agenda}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="09:00 - Registration&#10;10:00 - Opening Keynote&#10;11:00 - Panel Discussion"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Attendees (optional)
                </label>
                <input
                  type="number"
                  name="maxAttendees"
                  value={formData.maxAttendees}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Event Attendance
            </h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="attendees" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Monthly Overview
            </h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="events" stroke="#9333ea" strokeWidth={2} />
                  <Line type="monotone" dataKey="attendees" stroke="#ec4899" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-12">No data available</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">All Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Event Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date & Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Venue</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Attendees</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No events yet. Create your first event!
                    </td>
                  </tr>
                ) : (
                  events.map(event => (
                    <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <Link href={`/event/${event.id}`} className="text-purple-600 hover:text-purple-800 font-medium">
                          {event.name}
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(event.date), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.venue}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {event.attendees.length}
                          {event.maxAttendees && ` / ${event.maxAttendees}`}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
