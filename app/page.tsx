'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Users, TrendingUp, Plus, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';

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

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      setEvents(JSON.parse(storedEvents));
    }
  }, []);

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const now = new Date();
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterType === 'upcoming') {
      return matchesSearch && eventDate >= now;
    } else if (filterType === 'past') {
      return matchesSearch && eventDate < now;
    }
    return matchesSearch;
  });

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date()).length;
  const totalAttendees = events.reduce((sum, e) => sum + e.attendees.length, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Event Management System</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/admin" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
                Admin Dashboard
              </Link>
              <Link href="/ai-assistant" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{events.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-indigo-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Upcoming Events</p>
                <p className="text-3xl font-bold text-gray-900">{upcomingEvents}</p>
              </div>
              <Clock className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Attendees</p>
                <p className="text-3xl font-bold text-gray-900">{totalAttendees}</p>
              </div>
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('upcoming')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'upcoming'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilterType('past')}
                className={`px-4 py-2 rounded-lg transition ${
                  filterType === 'past'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Past
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No events found</p>
                <Link
                  href="/admin"
                  className="inline-block mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Create Your First Event
                </Link>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="block bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{event.name}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          new Date(event.date) >= new Date()
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {new Date(event.date) >= new Date() ? 'Upcoming' : 'Past'}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-600 text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        {event.venue}
                      </div>
                      <div className="flex items-center text-gray-600 text-sm">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {event.attendees.length} attendees
                        {event.maxAttendees && ` / ${event.maxAttendees}`}
                      </div>
                    </div>

                    <p className="text-gray-700 text-sm line-clamp-3 mb-4">{event.description}</p>

                    {event.speakers.length > 0 && (
                      <div className="border-t pt-4">
                        <p className="text-xs text-gray-500 mb-2">Speakers:</p>
                        <div className="flex flex-wrap gap-2">
                          {event.speakers.slice(0, 3).map((speaker, idx) => (
                            <span
                              key={idx}
                              className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                            >
                              {speaker}
                            </span>
                          ))}
                          {event.speakers.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{event.speakers.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
