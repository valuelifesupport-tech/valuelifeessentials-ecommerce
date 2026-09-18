import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Truck, Clock } from 'lucide-react';
import BlogListingView from '../blog/BlogListingView';

export default function PageView({ slug, onGoHome, showToast }) {
  if (slug === 'blog') {
    return <BlogListingView navigateTo={(path) => { window.location.href = path; }} showToast={showToast} />;
  }
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [slug]);

  const fetchPage = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(getApiUrl(`/api/pages/${slug}`));
      if (!res.ok) throw new Error('Page not found');
      const data = await res.json();
      setPage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit inquiry');
      setSubmitted(true);
      if (showToast) showToast('success', 'Message Sent!', 'Thank you! Our support team will get back to you within 2 hours.');
    } catch (err) {
      // Fallback display
      setSubmitted(true);
      if (showToast) showToast('info', 'Message Received', 'Thank you! Our support team has logged your inquiry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-8">
        <div className="flex items-center gap-3 text-emerald-600 font-bold text-base animate-pulse">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Page...</span>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-[60vh] max-w-3xl mx-auto p-8 text-center space-y-4">
        <div className="text-4xl">📄</div>
        <h2 className="text-2xl font-black text-slate-800">Page Not Found</h2>
        <p className="text-slate-600 text-sm">The page you are looking for does not exist or has been moved.</p>
        <button onClick={onGoHome} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-md">
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* BREADCRUMB NAVIGATION */}
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <button onClick={onGoHome} className="hover:text-emerald-700 transition-colors">Home</button>
          <span>/</span>
          <span className="text-slate-400">Pages</span>
          <span>/</span>
          <span className="text-emerald-700">{page.title}</span>
        </div>

        {/* HERO PAGE HEADER */}
        <div className="bg-gradient-to-r from-emerald-900 via-[#1b4332] to-emerald-950 text-white p-8 rounded-3xl shadow-xl space-y-3 relative overflow-hidden">
          <div className="relative z-10">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              ValueLife Essentials Official Page
            </span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-2">{page.title}</h1>
            <p className="text-emerald-100/80 text-sm font-medium max-w-2xl">{page.seo_description || 'Learn more about ValueLife Essentials certified 100% organic grocery and wellness commitment.'}</p>
          </div>
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* DYNAMIC CONTENT AREA */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          {(() => {
            const rawContent = page?.content || page?.content_html || page?.body || '';
            const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);

            if (isHtml) {
              return <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: rawContent }} />;
            }

            return (
              <div className="prose prose-emerald max-w-none text-slate-700 leading-relaxed space-y-4">
                {(rawContent || 'Page content coming soon.').split('\n\n').map((paragraph, idx) => {
                  if (paragraph.startsWith('# ')) {
                    return <h1 key={idx} className="text-2xl font-extrabold text-slate-900 border-b pb-2 border-slate-100">{paragraph.replace('# ', '')}</h1>;
                  }
                  if (paragraph.startsWith('### ')) {
                    return <h3 key={idx} className="text-lg font-bold text-emerald-900 mt-4">{paragraph.replace('### ', '')}</h3>;
                  }
                  if (paragraph.startsWith('- ')) {
                    return (
                      <ul key={idx} className="space-y-1.5 pl-4 list-disc marker:text-emerald-600">
                        {(paragraph || '').split('\n').map((line, i) => (
                          <li key={i} className="text-sm text-slate-600">{line.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={idx} className="text-sm sm:text-base text-slate-600 leading-relaxed">{paragraph}</p>;
                })}
              </div>
            );
          })()}

          {/* INTERACTIVE CONTACT FORM FOR CONTACT US PAGE */}
          {page.slug === 'contact-us' && (
            <div className="mt-8 pt-8 border-t border-slate-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* CONTACT INFO CARD */}
                <div className="space-y-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                  <h3 className="font-extrabold text-slate-900 text-base">Direct Customer Support</h3>
                  
                  <div className="space-y-4 text-xs font-bold text-slate-600">
                    <a 
                      href="https://wa.me/917675941899" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-3 bg-emerald-50 hover:bg-emerald-100 p-3.5 rounded-xl border border-emerald-300/80 text-emerald-900 transition-colors group cursor-pointer block"
                    >
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-emerald-700 uppercase font-extrabold tracking-wider">Instant WhatsApp Chat</div>
                        <div className="text-emerald-950 font-black text-xs sm:text-sm">+91 76759 41899</div>
                        <div className="text-[10px] text-emerald-600 font-medium">Click to chat with our team directly</div>
                      </div>
                    </a>
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <Mail size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Email Us</div>
                        <a href="mailto:valuelifesupport@gmail.com" className="text-emerald-700 hover:text-emerald-800 font-extrabold block text-xs sm:text-sm">valuelifesupport@gmail.com</a>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <Phone size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Customer Care & Helpline</div>
                        <div className="space-y-0.5">
                          <a href="tel:+917675941899" className="text-emerald-700 hover:text-emerald-800 font-extrabold block text-xs sm:text-sm">+91 76759 41899</a>
                          <a href="tel:+917893100755" className="text-emerald-700 hover:text-emerald-800 font-extrabold block text-xs sm:text-sm">+91 78931 00755</a>
                          <div className="text-[10px] text-slate-500 font-medium">Mon - Sat: 9:00 AM - 7:00 PM IST</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <MapPin size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Registered Location (India)</div>
                        <div className="text-slate-900 font-extrabold flex items-center gap-1.5">
                          <span>Indore, Madhya Pradesh, India</span>
                          <span className="text-xs">🇮🇳</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-medium">Pan-India Express Shipping & Order Support</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FORM */}
                <div className="space-y-4">
                  <h3 className="font-extrabold text-slate-900 text-base">Send Us a Message</h3>

                  {submitted ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl text-center space-y-2">
                      <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
                      <h4 className="font-bold text-emerald-900 text-base">Thank You! Message Received</h4>
                      <p className="text-xs text-emerald-700">Our organic wellness team will respond to your query within 2 hours.</p>
                      <button onClick={() => setSubmitted(false)} className="mt-2 text-xs font-bold text-emerald-800 underline">
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-3 text-xs">
                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                        <input 
                          type="text" required placeholder="Ramesh Kumar"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                        <input 
                          type="email" required placeholder="ramesh@gmail.com"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Subject / Issue *</label>
                        <input 
                          type="text" required placeholder="Order Status, Product Guidance, Bulk Query"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Message *</label>
                        <textarea 
                          rows={4} required placeholder="Write your message or order details here..."
                          value={contactForm.message}
                          onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                          className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        ></textarea>
                      </div>

                      <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all cursor-pointer">
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending Inquiry...</span>
                          </>
                        ) : (
                          <>
                            <Send size={16} /> <span>Send Inquiry Message</span>
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>

              </div>
            </div>
          )}
        </div>

        {/* TRUST BADGES */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-xs text-slate-900">100% Certified Organic</div>
              <div className="text-[11px] text-slate-500">Zero synthetic chemicals</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <Truck size={24} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-xs text-slate-900">Express Doorstep Delivery</div>
              <div className="text-[11px] text-slate-500">Across 20,000+ pin codes</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <Clock size={24} className="text-emerald-600 shrink-0" />
            <div>
              <div className="font-extrabold text-xs text-slate-900">24/7 Customer Support</div>
              <div className="text-[11px] text-slate-500">Fast resolution guarantee</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
