'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, Bot, User, Sparkles, Calendar } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI event assistant. I can help you with:\n\n• Creating and managing events\n• Finding the best time slots for your events\n• Generating event descriptions and agendas\n• Answering questions about your events\n• Suggesting speakers and venues\n• Providing event statistics and insights\n\nHow can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    const lowerMessage = userMessage.toLowerCase();

    const storedEvents = localStorage.getItem('events');
    const events = storedEvents ? JSON.parse(storedEvents) : [];

    if (lowerMessage.includes('create event') || lowerMessage.includes('new event')) {
      return `I can help you create a new event! Here's what you should consider:

**Event Planning Checklist:**
1. Choose a compelling event name
2. Select a date and time (I can suggest optimal time slots)
3. Pick a suitable venue
4. Define your target audience
5. Outline the event agenda
6. Invite relevant speakers

Would you like me to suggest some available time slots? Or would you like help with generating an event description?`;
    }

    if (lowerMessage.includes('time slot') || lowerMessage.includes('when should') || lowerMessage.includes('best time')) {
      const busySlots = events.map((e: any) => `${e.date} at ${e.time}`);
      return `Based on your current schedule, here are some recommended time slots:

**Available Time Slots:**
• Monday-Friday: 9:00 AM - 11:00 AM (Morning sessions work well for professional events)
• Monday-Friday: 2:00 PM - 4:00 PM (Afternoon slots for workshops)
• Weekends: 10:00 AM - 3:00 PM (Great for community events)

Currently busy slots: ${busySlots.length > 0 ? busySlots.join(', ') : 'None'}

Would you like me to check for conflicts on a specific date?`;
    }

    if (lowerMessage.includes('description') || lowerMessage.includes('write') || lowerMessage.includes('generate')) {
      return `I can generate compelling event descriptions! Here's a template:

**Sample Event Description:**
"Join us for an engaging [EVENT TYPE] that brings together industry leaders and innovators. This event will feature:

✨ Keynote presentations from renowned experts
🤝 Networking opportunities with peers
📚 Hands-on workshops and learning sessions
🎯 Actionable insights and takeaways

Whether you're a seasoned professional or just starting out, this event offers valuable content for everyone. Don't miss this opportunity to learn, connect, and grow!"

Would you like me to customize this for your specific event?`;
    }

    if (lowerMessage.includes('how many') || lowerMessage.includes('statistics') || lowerMessage.includes('stats')) {
      const totalEvents = events.length;
      const totalAttendees = events.reduce((sum: number, e: any) => sum + e.attendees.length, 0);
      const upcomingEvents = events.filter((e: any) => new Date(e.date) >= new Date()).length;

      return `Here are your event statistics:

📊 **Event Statistics**
• Total Events: ${totalEvents}
• Upcoming Events: ${upcomingEvents}
• Total Registered Attendees: ${totalAttendees}
• Average Attendees per Event: ${totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0}

${totalEvents > 0 ? `Your most recent event: "${events[events.length - 1].name}"` : 'No events yet. Create your first event!'}`;
    }

    if (lowerMessage.includes('speaker') || lowerMessage.includes('who should')) {
      return `Here are some suggestions for finding great speakers:

🎤 **Speaker Sourcing Tips:**
1. Industry experts and thought leaders
2. Previous successful event speakers
3. Authors and researchers in your field
4. Company executives and innovators
5. Community leaders and activists

**Popular Speaker Topics:**
• Technology and Innovation
• Leadership and Management
• Marketing and Sales
• Personal Development
• Industry Trends and Future Outlook

Would you like suggestions for speakers in a specific field?`;
    }

    if (lowerMessage.includes('venue') || lowerMessage.includes('location') || lowerMessage.includes('where')) {
      return `Let me help you choose the perfect venue!

🏢 **Venue Considerations:**
• **Capacity**: Ensure it fits your expected attendance
• **Location**: Accessible by public transport and parking
• **Amenities**: WiFi, AV equipment, catering facilities
• **Ambiance**: Matches your event's tone and style
• **Budget**: Fits within your allocated budget

**Popular Venue Types:**
• Conference Centers (professional events)
• Hotels (multi-day conferences)
• Co-working Spaces (workshops and meetups)
• Universities (academic events)
• Outdoor Venues (casual gatherings)

What type of event are you planning?`;
    }

    if (lowerMessage.includes('agenda') || lowerMessage.includes('schedule') || lowerMessage.includes('timeline')) {
      return `Here's a sample event agenda structure:

📋 **Recommended Event Timeline:**

**Morning Session**
• 09:00 - 09:30: Registration & Welcome Coffee
• 09:30 - 10:00: Opening Remarks
• 10:00 - 11:00: Keynote Presentation
• 11:00 - 11:15: Break

**Mid-Day**
• 11:15 - 12:30: Panel Discussion
• 12:30 - 13:30: Lunch & Networking

**Afternoon Session**
• 13:30 - 14:30: Workshop Session A
• 14:30 - 15:30: Workshop Session B
• 15:30 - 16:00: Closing Remarks & Q&A

Would you like me to customize this for your event duration?`;
    }

    if (lowerMessage.includes('notification') || lowerMessage.includes('remind') || lowerMessage.includes('alert')) {
      return `I can help you set up event notifications!

📧 **Notification Types:**
• Registration confirmation emails
• Event reminder (24 hours before)
• Day-of event SMS alerts
• Post-event follow-up messages
• Schedule change updates

**Best Practices:**
• Send reminders 1 week, 1 day, and 1 hour before
• Include event details and venue information
• Add calendar invite attachments
• Provide contact information for questions

Would you like help crafting a notification message?`;
    }

    if (lowerMessage.includes('list') || lowerMessage.includes('show') || lowerMessage.includes('what events')) {
      if (events.length === 0) {
        return `You don't have any events yet. Would you like to create your first event? I can help guide you through the process!`;
      }

      const eventList = events.map((e: any, idx: number) =>
        `${idx + 1}. **${e.name}** - ${e.date} at ${e.time} (${e.attendees.length} attendees)`
      ).join('\n');

      return `Here are your current events:\n\n${eventList}\n\nWould you like more details about any specific event?`;
    }

    return `That's a great question! While I'm an AI assistant, I can help you with various aspects of event management:

• **Event Creation**: Help plan and organize events
• **Scheduling**: Find optimal time slots
• **Content Generation**: Create descriptions, agendas, and materials
• **Analytics**: Provide insights on your events
• **Recommendations**: Suggest speakers, venues, and improvements

Try asking me things like:
- "Help me create a new event"
- "What time slots are available?"
- "Generate an event description"
- "Show me event statistics"
- "Suggest speakers for my tech conference"

What would you like help with?`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    setTimeout(async () => {
      const response = await generateAIResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
              </Link>
              <Sparkles className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">AI Event Assistant</h1>
            </div>
            <Link href="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
              Admin Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden" style={{ height: 'calc(100vh - 12rem)' }}>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 text-white">
            <div className="flex items-center gap-3">
              <Bot className="w-8 h-8" />
              <div>
                <h2 className="text-xl font-bold">AI Assistant</h2>
                <p className="text-purple-100 text-sm">Powered by advanced AI</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 22rem)' }}>
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">{message.content}</div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your events..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 text-center">
                AI-powered assistant for event management and planning
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
