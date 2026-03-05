import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cartoosh-900 relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cartoosh-400 opacity-[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent-coral opacity-[0.04] rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] w-[400px] h-[400px] bg-accent-violet opacity-[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cartoosh-400 to-accent-violet flex items-center justify-center">
            <span className="text-white font-bold text-lg">AC</span>
          </div>
          <span className="font-display font-bold text-xl text-white">AI Cartoosh</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-cartoosh-300 hover:text-white transition-colors font-medium">
            Log In
          </Link>
          <Link href="/register" className="btn-primary text-sm">
            Get Started Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 md:pt-32 pb-20">
        <div className="text-center">
          <div className="inline-block mb-6">
            <span className="badge badge-pro text-sm px-4 py-2">The Future of Content is Here</span>
          </div>

          <h1 className="font-display font-bold text-5xl md:text-7xl lg:text-8xl text-white leading-[1.05] mb-6">
            Your AI Avatar<br />
            <span className="bg-gradient-to-r from-cartoosh-400 via-accent-violet to-accent-coral bg-clip-text text-transparent">
              Performs For You
            </span>
          </h1>

          <p className="text-lg md:text-xl text-cartoosh-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            Create AI-powered digital personas that speak, perform, react, and broadcast your content 24/7.
            TikTok shows your videos. AI Cartoosh performs your persona.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto text-center">
              Create Your Avatar Free
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-4 w-full sm:w-auto text-center">
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { num: '24/7', label: 'Always-On Content' },
              { num: '100x', label: 'More Output' },
              { num: '$0', label: 'To Start' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-2xl md:text-3xl text-cartoosh-400">{stat.num}</div>
                <div className="text-sm text-cartoosh-300 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <section id="how-it-works" className="mt-32">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white text-center mb-16">
            How AI Cartoosh Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create Your Avatar',
                desc: 'Build your AI persona in the Avatar Studio. Upload a photo or generate one with AI. Define personality, voice, and character.',
                color: 'from-cartoosh-400 to-cartoosh-500',
              },
              {
                step: '02',
                title: 'Feed It Content',
                desc: 'Write scripts, upload source material, or let your avatar interpret your ideas. Choose Verbatim for precision or Interpretive for creative riffs.',
                color: 'from-accent-violet to-accent-pink',
              },
              {
                step: '03',
                title: 'Watch It Perform',
                desc: 'Your avatar speaks, performs, and broadcasts on your Post Show. Set it on loop mode for 24/7 content generation. Share, monetize, grow.',
                color: 'from-accent-coral to-accent-gold',
              },
            ].map((item) => (
              <div key={item.step} className="card p-8 relative group">
                <div className={`inline-block px-3 py-1 rounded-lg bg-gradient-to-r ${item.color} text-white text-sm font-bold mb-4`}>
                  Step {item.step}
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3">{item.title}</h3>
                <p className="text-cartoosh-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-32">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-white text-center mb-4">
            Built for Creators
          </h2>
          <p className="text-cartoosh-300 text-center text-lg mb-16 max-w-2xl mx-auto">
            Everything you need to build, broadcast, and monetize your AI-powered identity.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'PostScript Engine', desc: 'Two powerful modes: Verbatim for precision delivery, Interpretive for AI-powered creative riffs on your source material.', icon: '🎬' },
              { title: 'Timed Loop Mode', desc: 'Set your avatar on autopilot. It generates fresh content variations every loop, running 24/7 without you lifting a finger.', icon: '🔁' },
              { title: 'Avatar Personality Economy', desc: 'Buy, sell, and trade personality packs in the AAF Marketplace. Turn your avatar designs into revenue.', icon: '🧠' },
              { title: 'Post Show Broadcasting', desc: 'Your own personal channel. News shows, comedy, commentary, stories — your avatar runs the show.', icon: '📺' },
              { title: 'AI Voice & Video', desc: 'Professional voice synthesis and talking avatar video generation. Your avatar looks and sounds like a real performer.', icon: '🎤' },
              { title: 'Creator Monetization', desc: 'Earn from AAF sales, Idea marketplace, loop ad revenue, and tips. Multiple revenue streams from day one.', icon: '💰' },
            ].map((feature) => (
              <div key={feature.title} className="card p-6 flex gap-4">
                <div className="text-3xl shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white mb-2">{feature.title}</h3>
                  <p className="text-cartoosh-300 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-32 text-center">
          <div className="card p-12 md:p-16 gradient-border">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4">
              Ready to Bring Your Avatar to Life?
            </h2>
            <p className="text-cartoosh-300 text-lg mb-8 max-w-xl mx-auto">
              Join AI Cartoosh free. Create your avatar in under 2 minutes.
              Start performing content today.
            </p>
            <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
              Create Your Avatar Free
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-cartoosh-700 mt-20 py-8 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-cartoosh-300 text-sm">
            &copy; {new Date().getFullYear()} AI Cartoosh. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-cartoosh-300">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
