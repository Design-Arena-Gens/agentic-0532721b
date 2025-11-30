'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Clock, ArrowLeft, CheckCircle, User, List } from 'lucide-react';
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

export default function EventPage() {
  const params = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);

  useEffect(() => {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const events = JSON.parse(storedEvents);
      const foundEvent = events.find((e: Event) => e.id === params.id);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
  }, [params.id]);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    const attendeeInfo = `${userName} (${userEmail})`;

    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      alert('Sorry, this event is full!');
      return;
    }

    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const events = JSON.parse(storedEvents);
      const updatedEvents = events.map((e: Event) => {
        if (e.id === event.id) {
          return {
            ...e,
            attendees: [...e.attendees, attendeeInfo]
          };
        }
        return e;
      });
      localStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvent({ ...event, attendees: [...event.attendees, attendeeInfo] });
      setIsRegistered(true);
      setShowRegistration(false);
      setUserName('');
      setUserEmail('');
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">Event not found</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const isFull = event.maxAttendees ? event.attendees.length >= event.maxAttendees : false;
  const isPast = new Date(event.date) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Calendar className="w-8 h-8 text-indigo-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Event Details</h1>
            </div>
            <Link href="/ai-assistant" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              AI Assistant
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-white">
            <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
            <div className="flex flex-wrap gap-6 text-indigo-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{event.time}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          <div className="px-8 py-6">
            {isRegistered && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-semibold">Registration Successful!</p>
                  <p className="text-green-700 text-sm">You're all set for this event. Check your email for confirmation.</p>
                </div>
              </div>
            )}

            {!isPast && !isFull && !showRegistration && !isRegistered && (
              <div className="mb-6">
                <button
                  onClick={() => setShowRegistration(true)}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition text-lg font-semibold"
                >
                  Register for this Event
                </button>
              </div>
            )}

            {isFull && !isPast && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">Event Full</p>
                <p className="text-red-700 text-sm">This event has reached maximum capacity.</p>
              </div>
            )}

            {isPast && (
              <div className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-800 font-semibold">Past Event</p>
                <p className="text-gray-700 text-sm">This event has already taken place.</p>
              </div>
            )}

            {showRegistration && (
              <div className="mb-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Registration</h3>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      Confirm Registration
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRegistration(false)}
                      className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {event.speakers.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-6 h-6 text-indigo-600" />
                    Speakers
                  </h3>
                  <ul className="space-y-2">
                    {event.speakers.map((speaker, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        {speaker}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" />
                  Attendees
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-indigo-600">{event.attendees.length}</p>
                  {event.maxAttendees && (
                    <p className="text-gray-600 text-sm">out of {event.maxAttendees} spots</p>
                  )}
                  {!event.maxAttendees && (
                    <p className="text-gray-600 text-sm">registered</p>
                  )}
                </div>
              </div>
            </div>

            {event.agenda.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <List className="w-6 h-6 text-indigo-600" />
                  Event Agenda
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-3">
                    {event.agenda.map((item, idx) => (
                      <li key={idx} className="flex gap-3 text-gray-700">
                        <span className="text-indigo-600 font-semibold">{idx + 1}.</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {event.attendees.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Registered Attendees</h3>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <ul className="space-y-2">
                    {event.attendees.map((attendee, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm">
                          {attendee.charAt(0).toUpperCase()}
                        </div>
                        {attendee}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
