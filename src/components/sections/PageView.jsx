import { getApiUrl } from '../../api/config';
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ShieldCheck, Truck, Clock } from 'lucide-react';

export default function PageView({ slug, onGoHome, showToast }) {
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

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (showToast) showToast('success', 'Message Sent!', 'Thank you! Our support team will get back to you within 2 hours.');
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
                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <Mail size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Email Us</div>
                        <div className="text-slate-900 font-extrabold">support@valuelifeessentials.com</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <Phone size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Toll-Free Phone</div>
                        <div className="text-slate-900 font-extrabold">1800-123-4567 (9 AM - 7 PM IST)</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                      <MapPin size={18} className="text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase">Headquarters</div>
                        <div className="text-slate-900 font-extrabold">Sector 62, Noida, NCR, India</div>
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

                      <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm transition-all">
                        <Send size={16} /> Send Inquiry Message
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
